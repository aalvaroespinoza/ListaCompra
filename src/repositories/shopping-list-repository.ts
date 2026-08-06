import { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Database } from "@/types/supabase";
import { OfflineQueue } from "@/lib/offline-queue";

export type ShoppingItem = {
  id: string;
  household_id: string;
  name: string;
  quantity: number;
  unit: string | null;
  notes: string | null;
  status: 'pending' | 'completed';
  category: string | null;
  created_by: string;
  updated_by: string | null;
  created_at: string;
  updated_at: string;
  purchased_at: string | null;
  deleted_at: string | null;
  client_id?: string | null;
  creator?: {
    id: string;
    display_name: string;
    avatar_url: string | null;
    color: string;
  };
};

export class ShoppingListRepository {
  private supabase: SupabaseClient<Database>;

  constructor() {
    this.supabase = getSupabaseBrowserClient();
  }

  async fetchActiveItems(householdId: string): Promise<ShoppingItem[]> {
    if (!householdId) return [];
    
    // Archiving: Solo traer pendientes, o completados en las últimas 48hs
    const fortyEightHoursAgo = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString();
    
    const { data, error } = await this.supabase
      .from("shopping_items")
      .select(`
        *,
        creator:profiles!created_by(
          id,
          display_name,
          avatar_url,
          color
        )
      `)
      .eq("household_id", householdId)
      .is("deleted_at", null)
      .or(`status.eq.pending,purchased_at.gte.${fortyEightHoursAgo}`)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as ShoppingItem[];
  }

  async fetchItemById(id: string): Promise<ShoppingItem | null> {
    const { data, error } = await this.supabase
      .from("shopping_items")
      .select(`
        *,
        creator:profiles!created_by(
          id,
          display_name,
          avatar_url,
          color
        )
      `)
      .eq("id", id)
      .single();
    if (error) return null;
    return data as ShoppingItem;
  }

  async fetchPurchaseHistory(householdId: string, options?: { limit?: number }): Promise<ShoppingItem[]> {
    if (!householdId) return [];
    
    let query = this.supabase
      .from("shopping_items")
      .select(`
        *,
        creator:profiles!created_by(
          id,
          display_name,
          avatar_url,
          color
        )
      `)
      .eq("household_id", householdId)
      .eq("status", "completed")
      .is("deleted_at", null)
      .order("purchased_at", { ascending: false });
      
    if (options?.limit) {
      query = query.limit(options.limit);
    }

    const { data, error } = await query;
    if (error) throw error;
    return data as ShoppingItem[];
  }

  async insertItem(newItem: Database['public']['Tables']['shopping_items']['Insert']): Promise<ShoppingItem> {
    const fallbackResult = { ...newItem, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as ShoppingItem;
    
    return OfflineQueue.executeSafe(
      'insert',
      'shopping_items',
      newItem,
      async () => {
        const { data, error } = await this.supabase
          .from("shopping_items")
          .insert([newItem])
          .select()
          .single();
        if (error) throw error;
        return data as ShoppingItem;
      },
      fallbackResult
    );
  }

  async updateItem(id: string, updates: Database['public']['Tables']['shopping_items']['Update'], last_known_updated_at?: string): Promise<ShoppingItem> {
    const updatedItem = { ...updates, updated_at: new Date().toISOString() };
    const payload = { id, ...updatedItem, last_known_updated_at };
    const fallbackResult = { id, ...updatedItem } as ShoppingItem;
    
    return OfflineQueue.executeSafe(
      'update',
      'shopping_items',
      payload,
      async () => {
        const { data, error } = await this.supabase
          .from("shopping_items")
          .update(updatedItem)
          .eq("id", id)
          .select()
          .single();
        if (error) throw error;
        return data as ShoppingItem;
      },
      fallbackResult
    );
  }

  async deleteItem(id: string): Promise<void> {
    const deletedPayload = { id, deleted_at: new Date().toISOString() };
    
    return OfflineQueue.executeSafe(
      'update',
      'shopping_items',
      deletedPayload,
      async () => {
        const { error } = await this.supabase
          .from("shopping_items")
          .update(deletedPayload)
          .eq("id", id);
        if (error) throw error;
      },
      undefined
    );
  }

  async deleteHistoryByName(householdId: string, name: string): Promise<void> {
    const { data, error } = await this.supabase
      .from("shopping_items")
      .select("id")
      .eq("household_id", householdId)
      .eq("name", name)
      .eq("status", "completed");

    if (error) throw error;

    if (data && data.length > 0) {
      await Promise.all(data.map(item => this.deleteItem(item.id)));
    }
  }

  // Métodos expuestos para la sincronización en background (SyncProvider)
  async syncInsert(payload: Database['public']['Tables']['shopping_items']['Insert']): Promise<void> {
    const { error } = await this.supabase.from("shopping_items").insert(payload);
    if (error) throw error;
  }

  async syncUpdateSafe(payload: Database['public']['Tables']['shopping_items']['Update'] & { id: string, last_known_updated_at?: string }, timestamp: string) {
    const { id, quantity, status, last_known_updated_at, ...rest } = payload;
    let rpcResult = null;

    if (quantity !== undefined || status !== undefined) {
      const { data, error } = await this.supabase.rpc('update_shopping_item_safe', {
        p_id: id,
        p_quantity: quantity,
        p_status: status,
        p_last_known_updated_at: last_known_updated_at || timestamp
      });
      if (error) throw error;
      rpcResult = data;
    }

    if (Object.keys(rest).length > 0) {
      console.log("Sincronizando campos adicionales del item offline:", rest);
      const { error } = await this.supabase.from("shopping_items").update(rest).eq("id", id);
      if (error) throw error;
    }

    return rpcResult;
  }
}

export const shoppingListRepository = new ShoppingListRepository();
