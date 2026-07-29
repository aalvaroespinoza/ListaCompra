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
          // It's much safer to invalidate and refetch because our query fetches joined relations (profiles),
          // whereas the payload.new only contains the raw table row.
          queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.items(householdId) });
          queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.frequent(householdId) });
          queryClient.invalidateQueries({ queryKey: ['purchase-history', householdId] });
          
          if (payload.eventType === 'INSERT') {
            console.log('Realtime INSERT received, invalidating queries');
          } else if (payload.eventType === 'UPDATE') {
            console.log('Realtime UPDATE received, invalidating queries');
          } else if (payload.eventType === 'DELETE') {
            console.log('Realtime DELETE received, invalidating queries');
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [supabase, householdId, profileId, queryClient]);
}
