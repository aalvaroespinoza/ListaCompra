import { useEffect, useState } from 'react';
import { db } from '@/lib/db';
import { shoppingListRepository } from '@/repositories/shopping-list-repository';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import type { Database } from '@/types/supabase';

export function useOfflineSyncManager(isOnline: boolean) {
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    const updateCount = async () => {
      const count = await db.syncQueue.count();
      setPendingCount(count);
    };
    
    db.syncQueue.hook('creating', () => { setTimeout(updateCount, 50); });
    db.syncQueue.hook('deleting', () => { setTimeout(updateCount, 50); });

    updateCount();
    return () => {};
  }, []);

  useEffect(() => {
    if (!isOnline || pendingCount === 0 || isSyncing) return;

    const syncQueue = async () => {
      setIsSyncing(true);
      try {
        const operations = await db.syncQueue.orderBy('id').toArray();
        
        for (const op of operations) {
          try {
            let data: { conflict?: boolean } | null = null;
            if (op.action === 'insert' && op.table === 'shopping_items') {
              const payload = op.payload as Database['public']['Tables']['shopping_items']['Insert'];
              await shoppingListRepository.syncInsert(payload);
            } else if (op.action === 'update' && op.table === 'shopping_items') {
              const payload = op.payload as { id: string; quantity?: number; status?: string; last_known_updated_at?: string };
              data = await shoppingListRepository.syncUpdateSafe(payload, op.timestamp);
              
              if (data?.conflict) {
                toast.error('Conflicto detectado en la nube', {
                  description: `Tus cambios offline para un producto entraron en conflicto con los del servidor y fueron rechazados.`,
                  duration: 6000,
                });
                
                if (op.id) {
                  await db.deadLetterQueue.add({
                    ...op,
                    errorReason: 'Conflicto: la versión del servidor es más reciente',
                    failedAt: new Date().toISOString()
                  });
                }
              }
            }
            if (op.id) await db.syncQueue.delete(op.id);
          } catch (itemError: unknown) {
            const err = itemError as Error;
            console.error('Error sincronizando ítem:', err);
            
            const isNetworkError = err.message?.includes('fetch') || err.message?.includes('network') || err.message?.includes('timeout') || err.message?.includes('Failed to fetch');
            
            if (isNetworkError) {
              const retries = (op.retryCount || 0) + 1;
              if (retries <= 3) {
                if (op.id) await db.syncQueue.update(op.id, { retryCount: retries });
                throw err;
              }
            }
            
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
  }, [isOnline, pendingCount, isSyncing, queryClient]);

  return { pendingCount, isSyncing };
}
