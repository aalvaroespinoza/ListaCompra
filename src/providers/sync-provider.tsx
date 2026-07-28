"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { db } from '@/lib/db';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { CloudOff, RefreshCw } from 'lucide-react';
import { useCurrentProfile } from '@/hooks/use-current-profile';
import type { Database } from '@/types/supabase';

interface SyncContextType {
  isOnline: boolean;
  pendingCount: number;
}

const SyncContext = createContext<SyncContextType>({ isOnline: true, pendingCount: 0 });

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();
  const { currentProfile } = useCurrentProfile();

  // Monitorear conexión
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Actualizar conteo de pendientes
  useEffect(() => {
    const updateCount = async () => {
      const count = await db.syncQueue.count();
      setPendingCount(count);
    };
    
    // Suscribirse a cambios en Dexie
    db.syncQueue.hook('creating', () => {
      setTimeout(updateCount, 50);
    });
    db.syncQueue.hook('deleting', () => {
      setTimeout(updateCount, 50);
    });

    updateCount();
    return () => {};
  }, []);

  // Proceso de sincronización
  useEffect(() => {
    if (!isOnline || pendingCount === 0 || isSyncing) return;

    const syncQueue = async () => {
      setIsSyncing(true);
      try {
        const operations = await db.syncQueue.orderBy('id').toArray();
        
        for (const op of operations) {
          try {
            if (op.action === 'insert') {
              const payload = op.payload as Database['public']['Tables']['shopping_items']['Insert'];
              const { error } = await supabase.from(op.table as "shopping_items").insert(payload);
              if (error) throw error;
            } else if (op.action === 'update' && op.table === 'shopping_items') {
              // Usar RPC seguro
              const payload = op.payload as { id: string; quantity?: number; status?: string; last_known_updated_at?: string };
              const { data, error } = await supabase.rpc('update_shopping_item_safe', {
                p_id: payload.id,
                p_quantity: payload.quantity,
                p_status: payload.status,
                p_last_known_updated_at: payload.last_known_updated_at || op.timestamp
              });
              
              if (error) throw error;
              
              // Chequear conflicto
              if (data?.conflict) {
                toast.error('Conflicto detectado en la nube', {
                  description: `Tus cambios offline para un producto entraron en conflicto con los del servidor y fueron rechazados.`,
                  duration: 6000,
                });
                
                // Mover a DLQ por si el usuario quiere inspeccionar luego
                if (op.id) {
                  await db.deadLetterQueue.add({
                    ...op,
                    errorReason: 'Conflicto: la versión del servidor es más reciente',
                    failedAt: new Date().toISOString()
                  });
                }
              }
            }
            // Removemos de la cola principal si fue exitoso o manejado
            if (op.id) await db.syncQueue.delete(op.id);
          } catch (itemError: unknown) {
            const err = itemError as Error;
            console.error('Error sincronizando ítem:', err);
            
            const isNetworkError = err.message?.includes('fetch') || err.message?.includes('network') || err.message?.includes('timeout') || err.message?.includes('Failed to fetch');
            
            if (isNetworkError) {
              // Retry inteligente
              const retries = (op.retryCount || 0) + 1;
              if (retries <= 3) {
                if (op.id) await db.syncQueue.update(op.id, { retryCount: retries });
                throw err; // Lanza error para pausar el bucle de sincronización (la red sigue mal)
              }
              // Si superó los reintentos, se trata como error permanente abajo
            }
            
            // Error permanente o máximo de reintentos -> Mover a DLQ (Dead Letter Queue)
            if (op.id) {
              await db.deadLetterQueue.add({
                ...op,
                errorReason: err.message || 'Error desconocido (permanente)',
                failedAt: new Date().toISOString()
              });
              await db.syncQueue.delete(op.id);
              
              toast.error('Error permanente de sincronización', {
                description: 'Un cambio offline falló repetidamente. Se movió a la cuarentena (DLQ) para no bloquear la cola.'
              });
            }
          }
        }
        
        toast.success(`Sincronización completada exitosamente`);
        queryClient.invalidateQueries({ queryKey: ['shopping_list'] });
      } catch (error) {
        console.error('La sincronización se pausó por error de red:', error);
      } finally {
        setIsSyncing(false);
      }
    };

    syncQueue();
  }, [isOnline, pendingCount, isSyncing, supabase, queryClient]);

  // Suscripción centralizada a Realtime por Hogar (Evita canales múltiples y fugas de memoria)
  useEffect(() => {
    if (!currentProfile?.household_id) return;
    
    // Canal estable único por household
    const channel = supabase.channel(`household_${currentProfile.household_id}`)
      // 1. Escuchar notificaciones
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `household_id=eq.${currentProfile.household_id}`
        },
        (payload) => {
          const notif = payload.new as Database['public']['Tables']['notifications']['Row'];
          // Ignorar eventos generados por el propio usuario actual
          if (notif.actor_id !== currentProfile.id) {
            toast.info('Actualización de la lista', {
              description: `Alguien ${notif.summary}`,
              position: 'top-center'
            });
          }
        }
      )
      // 2. Escuchar cambios en los items para mantener React Query sincronizado
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shopping_items",
          filter: `household_id=eq.${currentProfile.household_id}`,
        },
        (payload) => {
          const queryKey = ["shopping_items", currentProfile.household_id];
          type ShoppingItem = Database['public']['Tables']['shopping_items']['Row'];
          
          queryClient.setQueryData<ShoppingItem[]>(queryKey, (oldItems = []) => {
            if (payload.eventType === 'INSERT') {
              const newItem = payload.new as ShoppingItem;
              // Evitar renderizados innecesarios e ignorar si fuimos nosotros y ya está en caché optimista
              const exists = oldItems.findIndex(item => item.id === newItem.id);
              if (exists !== -1) {
                const currentLocalItem = oldItems[exists];
                if (new Date(currentLocalItem.updated_at).getTime() >= new Date(newItem.updated_at).getTime()) {
                  return oldItems; // No hay cambios reales o nuestra versión optimista es más reciente
                }
                const newItems = [...oldItems];
                newItems[exists] = newItem;
                return newItems;
              }
              return [newItem, ...oldItems];
            }
            if (payload.eventType === 'UPDATE') {
              const updatedItem = payload.new as ShoppingItem;
              if (updatedItem.deleted_at) {
                return oldItems.filter(item => item.id !== updatedItem.id);
              }
              const exists = oldItems.findIndex(item => item.id === updatedItem.id);
              if (exists !== -1) {
                const currentLocalItem = oldItems[exists];
                if (new Date(currentLocalItem.updated_at).getTime() > new Date(updatedItem.updated_at).getTime()) {
                  return oldItems;
                }
                // Prevenir renderizados si es idéntico a lo que tenemos
                if (currentLocalItem.updated_at === updatedItem.updated_at && currentLocalItem.status === updatedItem.status) {
                  return oldItems;
                }
                const newItems = [...oldItems];
                newItems[exists] = updatedItem;
                return newItems;
              } else {
                const newArr = [updatedItem, ...oldItems];
                return newArr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
              }
            }
            if (payload.eventType === 'DELETE') {
              return oldItems.filter(item => item.id !== payload.old.id);
            }
            return oldItems;
          });
          
          queryClient.invalidateQueries({ queryKey: ["frequent_products", currentProfile.household_id] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, currentProfile, queryClient]);

  return (
    <SyncContext.Provider value={{ isOnline, pendingCount }}>
      {children}
      
      {/* Indicador Visual Flotante */}
      {(!isOnline || pendingCount > 0) && (
        <div className="fixed bottom-24 left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-surface shadow-lg border border-border/50 rounded-full px-4 py-2 text-sm font-medium animate-in fade-in slide-in-from-bottom-4">
          {!isOnline ? (
            <><CloudOff size={16} className="text-orange-500" /> Sin conexión ({pendingCount} pendientes)</>
          ) : (
            <><RefreshCw size={16} className="animate-spin text-primary" /> Sincronizando {pendingCount}...</>
          )}
        </div>
      )}
    </SyncContext.Provider>
  );
}

export const useSync = () => useContext(SyncContext);
