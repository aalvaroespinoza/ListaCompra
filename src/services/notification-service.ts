import { getSupabaseBrowserClient } from '@/lib/supabase/client';

let debounceTimer: NodeJS.Timeout | null = null;
let pendingNotifications: {
  action: 'added' | 'completed' | 'deleted';
  itemCount: number;
}[] = [];

/**
 * Agrupa las notificaciones y las envía a la base de datos después de un intervalo.
 * Esto evita spam cuando un usuario agrega 10 productos seguidos.
 */
export const NotificationService = {
  notify: (
    householdId: string, 
    userId: string, 
    action: 'added' | 'completed' | 'deleted',
    count: number = 1
  ) => {
    // Agregar a la cola local
    const existing = pendingNotifications.find(n => n.action === action);
    if (existing) {
      existing.itemCount += count;
    } else {
      pendingNotifications.push({ action, itemCount: count });
    }

    // Reiniciar timer (Intervalo configurable: 10 segundos para agrupar)
    if (debounceTimer) clearTimeout(debounceTimer);
    
    debounceTimer = setTimeout(async () => {
      const supabase = getSupabaseBrowserClient();
      const toSend = [...pendingNotifications];
      pendingNotifications = []; // Limpiar cola
      
      for (const notif of toSend) {
        let summary = '';
        if (notif.action === 'added') summary = `agregó ${notif.itemCount} producto${notif.itemCount > 1 ? 's' : ''}`;
        else if (notif.action === 'completed') summary = `completó ${notif.itemCount} producto${notif.itemCount > 1 ? 's' : ''}`;
        else summary = `eliminó ${notif.itemCount} producto${notif.itemCount > 1 ? 's' : ''}`;

        await supabase.from('notifications').insert({
          household_id: householdId,
          actor_id: userId,
          action_type: notif.action,
          item_count: notif.itemCount,
          summary: summary
        });
      }
    }, 10000); // 10 segundos
  }
};
