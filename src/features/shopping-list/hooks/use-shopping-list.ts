"use client";

import React, { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/types/supabase";
import { SupabaseClient } from "@supabase/supabase-js";
import { db } from "@/lib/db";
import { NotificationService } from "@/services/notification-service";

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

export function useShoppingList(householdId: string | undefined) {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient() as SupabaseClient<Database>;
  const queryKey = React.useMemo(() => ["shopping_items", householdId], [householdId]);

  // 1. Fetch de items activos
  const { data: items = [], isLoading } = useQuery({
    queryKey,
    queryFn: async () => {
      if (!householdId) return [];
      const { data, error } = await supabase
        .from("shopping_items")
        .select("*")
        .eq("household_id", householdId)
        .is("deleted_at", null)
        .order("created_at", { ascending: false });

      if (error) throw error;
      return data as ShoppingItem[];
    },
    staleTime: Infinity,
    enabled: !!householdId,
  });

  // 2. Realtime Subscriptions movidas a SyncProvider para evitar múltiples canales y fugas de memoria

  const addItemMutation = useMutation({
    mutationFn: async (newItem: Database['public']['Tables']['shopping_items']['Insert']) => {
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
        const { data, error } = await supabase
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
    },
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey });
      
      const id = newItem.id || crypto.randomUUID();
      newItem.id = id; // Asegurar que el mutationFn reciba el mismo ID

      const optimisticItem = { 
        ...newItem, 
        id, 
        status: newItem.status || 'pending', 
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      } as ShoppingItem;
      
      queryClient.setQueryData<ShoppingItem[]>(queryKey, (old) => [
        optimisticItem,
        ...(old || [])
      ]);
      return { id };
    },
    onSuccess: (realItem) => {
      NotificationService.notify(realItem.household_id, realItem.created_by, 'added', 1);
      // No sobrescribimos todo el array para evitar race conditions.
      // Realtime se encargará de actualizar los datos definitivos, 
      // o bien el estado optimista persistirá correctamente.
    },
    onError: (err, newItem, context) => {
      if (context?.id) {
        // Rollback únicamente del elemento afectado
        queryClient.setQueryData<ShoppingItem[]>(queryKey, (old) => 
          (old || []).filter(item => item.id !== context.id)
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["frequent_products", householdId] });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, updates, last_known_updated_at }: { id: string; updates: Database['public']['Tables']['shopping_items']['Update']; last_known_updated_at?: string }) => {
      const isOnline = navigator.onLine;
      const updatedItem = { ...updates, updated_at: new Date().toISOString() };
      
      // Intentamos recuperar last_known_updated_at si no vino en variables (ej. directo desde un componente que no lo pasó)
      const effectiveLastKnown = last_known_updated_at;
      if (!effectiveLastKnown) {
        // En mutaciones React Query el caché local pre-mutación ya se sobrescribió, 
        // por lo que delegamos en que el onMutate lo inyecte en el payload final offline.
      }
      
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
        const { data, error } = await supabase
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
    },
    onMutate: async (variables) => {
      const { id, updates } = variables;
      await queryClient.cancelQueries({ queryKey });
      
      const previousItems = queryClient.getQueryData<ShoppingItem[]>(queryKey);
      const previousItem = previousItems?.find(item => item.id === id);
      
      // Inyectamos el last_known_updated_at real en variables para que mutationFn lo reciba
      if (!variables.last_known_updated_at && previousItem) {
        variables.last_known_updated_at = previousItem.updated_at;
      }

      queryClient.setQueryData<ShoppingItem[]>(queryKey, (old) => 
        (old || []).map(item => item.id === id ? { ...item, ...updates, updated_at: new Date().toISOString() } : item)
      );
      return { previousItem, id };
    },
    onError: (err, variables, context) => {
      if (context?.previousItem) {
        // Rollback únicamente del elemento afectado
        queryClient.setQueryData<ShoppingItem[]>(queryKey, (old) => 
          (old || []).map(item => item.id === context.id ? context.previousItem! : item)
        );
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["frequent_products", householdId] });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const isOnline = navigator.onLine;
      const deletedPayload = { id, deleted_at: new Date().toISOString() };
      
      if (!isOnline) {
        await db.syncQueue.add({
          action: 'update', // Borrado lógico es un update
          table: 'shopping_items',
          payload: deletedPayload,
          timestamp: new Date().toISOString()
        });
        return;
      }

      try {
        const { error } = await supabase
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
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previousItems = queryClient.getQueryData<ShoppingItem[]>(queryKey);
      const previousItem = previousItems?.find(item => item.id === id);

      queryClient.setQueryData<ShoppingItem[]>(queryKey, (old) => 
        (old || []).filter(item => item.id !== id)
      );
      return { previousItem, id };
    },
    onError: (err, id, context) => {
      if (context?.previousItem) {
        // Rollback únicamente del elemento afectado
        queryClient.setQueryData<ShoppingItem[]>(queryKey, (old) => {
          const newArr = [context.previousItem!, ...(old || [])];
          return newArr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
        });
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["frequent_products", householdId] });
    },
  });

  return {
    items,
    isLoading,
    addItem: addItemMutation.mutateAsync,
    updateItem: updateItemMutation.mutateAsync,
    deleteItem: deleteItemMutation.mutateAsync,
  };
}
