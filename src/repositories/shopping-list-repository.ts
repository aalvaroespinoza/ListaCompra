import { SupabaseClient } from "@supabase/supabase-js";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import { Database } from "@/types/supabase";
import { db } from "@/lib/db";

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
};

export class ShoppingListRepository {
  private supabase: SupabaseClient<Database>;

  constructor() {
    this.supabase = getSupabaseBrowserClient();
  }

  async fetchActiveItems(householdId: string): Promise<ShoppingItem[]> {
    if (!householdId) return [];
    const { data, error } = await this.supabase
      .from("shopping_items")
      .select("*")
      .eq("household_id", householdId)
      .is("deleted_at", null)
      .order("created_at", { ascending: false });

    if (error) throw error;
    return data as ShoppingItem[];
  }

  async insertItem(newItem: Database['public']['Tables']['shopping_items']['Insert']): Promise<ShoppingItem> {
    const isOnline = navigator.onLine;
    if (!isOnline) {
      await db.syncQueue.add({
        action: 'insert',
        table: 'shopping_items',
        payload: newItem,
        timestamp: new Date().toISOString()
      });
      return { ...newItem, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as ShoppingItem;
    }
    
    try {
      const { data, error } = await this.supabase
        .from("shopping_items")
        .insert([newItem])
        .select()
        .single();
      if (error) throw error;
      return data as ShoppingItem;
    } catch (error: unknown) {
      const err = error as Error;
      if (err.message?.includes('fetch') || !navigator.onLine) {
        await db.syncQueue.add({
          action: 'insert',
          table: 'shopping_items',
          payload: newItem,
          timestamp: new Date().toISOString()
        });
        return { ...newItem, created_at: new Date().toISOString(), updated_at: new Date().toISOString() } as ShoppingItem;
      }
      throw error;
    }
  }

  async updateItem(id: string, updates: Database['public']['Tables']['shopping_items']['Update'], last_known_updated_at?: string): Promise<ShoppingItem> {
    const isOnline = navigator.onLine;
    const updatedItem = { ...updates, updated_at: new Date().toISOString() };
    const effectiveLastKnown = last_known_updated_at;
    
    if (!isOnline) {
      await db.syncQueue.add({
        action: 'update',
        table: 'shopping_items',
        payload: { id, ...updatedItem, last_known_updated_at: effectiveLastKnown },
        timestamp: new Date().toISOString()
      });
      return { id, ...updatedItem } as ShoppingItem;
    }
    
    try {
      const { data, error } = await this.supabase
        .from("shopping_items")
        .update(updatedItem)
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as ShoppingItem;
    } catch (error: unknown) {
      const err = error as Error;
      if (err.message?.includes('fetch') || !navigator.onLine) {
        await db.syncQueue.add({
          action: 'update',
          table: 'shopping_items',
          payload: { id, ...updatedItem, last_known_updated_at: effectiveLastKnown },
          timestamp: new Date().toISOString()
        });
        return { id, ...updatedItem } as ShoppingItem;
      }
      throw error;
    }
  }

  async deleteItem(id: string): Promise<void> {
    const isOnline = navigator.onLine;
    const deletedPayload = { id, deleted_at: new Date().toISOString() };
    
    if (!isOnline) {
      await db.syncQueue.add({
        action: 'update',
        table: 'shopping_items',
        payload: deletedPayload,
        timestamp: new Date().toISOString()
      });
      return;
    }

    try {
      const { error } = await this.supabase
        .from("shopping_items")
        .update(deletedPayload)
        .eq("id", id);
      if (error) throw error;
    } catch (error: unknown) {
      const err = error as Error;
      if (err.message?.includes('fetch') || !navigator.onLine) {
        await db.syncQueue.add({
          action: 'update',
          table: 'shopping_items',
          payload: deletedPayload,
          timestamp: new Date().toISOString()
        });
        return;
      }
      throw error;
    }
  }

  // Métodos expuestos para la sincronización en background (SyncProvider)
  async syncInsert(payload: Database['public']['Tables']['shopping_items']['Insert']): Promise<void> {
    const { error } = await this.supabase.from("shopping_items").insert(payload);
    if (error) throw error;
  }

  async syncUpdateSafe(payload: { id: string; quantity?: number; status?: string; last_known_updated_at?: string }, timestamp: string) {
    const { data, error } = await this.supabase.rpc('update_shopping_item_safe', {
      p_id: payload.id,
      p_quantity: payload.quantity,
      p_status: payload.status,
      p_last_known_updated_at: payload.last_known_updated_at || timestamp
    });
    if (error) throw error;
    return data;
  }
}

export const shoppingListRepository = new ShoppingListRepository();
