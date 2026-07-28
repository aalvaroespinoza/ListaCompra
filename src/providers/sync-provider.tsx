"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { db } from '@/lib/db';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import { CloudOff, RefreshCw } from 'lucide-react';
import { useCurrentProfile } from '@/hooks/use-current-profile';

interface SyncContextType {
  isOnline: boolean;
  pendingCount: number;
}

const SyncContext = createContext<SyncContextType>({ isOnline: true, pendingCount: 0 });

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(true);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();
  const { currentProfile } = useCurrentProfile();

  // Monitorear conexión
  useEffect(() => {
    setIsOnline(navigator.onLine);
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
    const subscription = db.syncQueue.hook('creating', () => {
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
          if (op.action === 'insert') {
            const { error } = await supabase.from(op.table as any).insert(op.payload);
            if (error) throw error;
          } else if (op.action === 'update' && op.table === 'shopping_items') {
            // Usar RPC seguro
            const { data, error } = await (supabase.rpc as any)('update_shopping_item_safe', {
              p_id: op.payload.id,
              p_quantity: op.payload.quantity,
              p_status: op.payload.status,
              p_last_known_updated_at: op.payload.last_known_updated_at || op.timestamp
            });
            
            if (error) throw error;
            
            // Chequear conflicto
            if (data?.conflict) {
              toast.error('Conflicto detectado', {
                description: `Alguien modificó "${op.payload.name || 'este ítem'}" mientras estabas offline. La versión actual se ha descargado.`,
                duration: 6000,
              });
              // Cancelamos esta operación pero actualizamos la cache para ver la nueva versión
              queryClient.invalidateQueries({ queryKey: ['shopping_list'] });
            }
          }
          // Removemos de la cola si fue exitoso o hubo conflicto manejado
          if (op.id) await db.syncQueue.delete(op.id);
        }
        
        if (operations.length > 0) {
          toast.success(`Sincronización completada (${operations.length} cambios)`);
          queryClient.invalidateQueries({ queryKey: ['shopping_list'] });
        }
      } catch (error) {
        console.error('Error sincronizando:', error);
      } finally {
        setIsSyncing(false);
      }
    };

    syncQueue();
  }, [isOnline, pendingCount, isSyncing, supabase, queryClient]);

  // Suscripción a notificaciones inteligentes
  useEffect(() => {
    if (!currentProfile?.household_id) return;
    
    const channel = supabase.channel('smart-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `household_id=eq.${currentProfile.household_id}`
        },
        (payload) => {
          const notif = payload.new;
          // No notificar al propio actor que hizo la acción
          if (notif.actor_id !== currentProfile.id) {
            // Buscar perfil del actor si es posible (simplificado aquí)
            toast.info('Actualización de la lista', {
              description: `Alguien ${notif.summary}`,
              position: 'top-center'
            });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, currentProfile]);

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
