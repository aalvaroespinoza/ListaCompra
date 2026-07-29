import { useEffect } from 'react';
import { getSupabaseBrowserClient } from '@/lib/supabase/client';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';
import type { Database } from '@/types/supabase';
import { shoppingQueryKeys } from '@/features/shopping-list/queries/shopping';

export function useRealtimeManager(householdId: string | undefined, profileId: string | undefined) {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();

  useEffect(() => {
    if (!householdId || !profileId) return;
    
    const channel = supabase.channel(`household_${householdId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `household_id=eq.${householdId}`
        },
        (payload) => {
          const notif = payload.new as Database['public']['Tables']['notifications']['Row'];
          if (notif.actor_id !== profileId) {
            toast.info('Actualización de la lista', {
              description: `Alguien ${notif.summary}`,
              position: 'top-center'
            });
          }
        }
      )
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shopping_items",
          filter: `household_id=eq.${householdId}`,
        },
        (payload) => {
          const queryKey = shoppingQueryKeys.items(householdId);
          type ShoppingItem = Database['public']['Tables']['shopping_items']['Row'];
          
          queryClient.setQueryData<ShoppingItem[]>(queryKey, (oldItems = []) => {
            if (payload.eventType === 'INSERT') {
              const newItem = payload.new as ShoppingItem;
              const exists = oldItems.findIndex(item => item.id === newItem.id);
              if (exists !== -1) {
                const currentLocalItem = oldItems[exists];
                if (new Date(currentLocalItem.updated_at).getTime() >= new Date(newItem.updated_at).getTime()) {
                  return oldItems;
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
          
          queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.frequent(householdId) });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, householdId, profileId, queryClient]);
}
