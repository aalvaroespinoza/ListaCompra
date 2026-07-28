"use client";

import React, { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/types/supabase";
import { SupabaseClient } from "@supabase/supabase-js";

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
    enabled: !!householdId,
  });

  // 2. Realtime Subscriptions con Actualización de Caché (Zero Refetching)
  useEffect(() => {
    if (!householdId) return;

    const channelId = `public:shopping_items:${householdId}-${Math.random().toString(36).substring(7)}`;
    const channel = supabase
      .channel(channelId)
      .on(
        "postgres_changes",
        {
          event: "*",
          schema: "public",
          table: "shopping_items",
          filter: `household_id=eq.${householdId}`,
        },
        (payload) => {
          queryClient.setQueryData<ShoppingItem[]>(queryKey, (oldItems = []) => {
            if (payload.eventType === 'INSERT') {
              const newItem = payload.new as ShoppingItem;
              // Evitar duplicados usando client_id si está presente, o fallback a id
              if (newItem.client_id) {
                if (oldItems.some(item => item.client_id === newItem.client_id)) return oldItems;
              } else {
                if (oldItems.some(item => item.id === newItem.id)) return oldItems;
              }
              return [newItem, ...oldItems];
            }
            if (payload.eventType === 'UPDATE') {
              const updatedItem = payload.new as ShoppingItem;
              // Si es un soft-delete, lo quitamos de la caché local
              if (updatedItem.deleted_at) {
                return oldItems.filter(item => item.id !== updatedItem.id);
              }
              const exists = oldItems.some(item => item.id === updatedItem.id);
              if (exists) {
                return oldItems.map(item => item.id === updatedItem.id ? updatedItem : item);
              } else {
                // Si fue restaurado y no estaba en caché
                const newArr = [updatedItem, ...oldItems];
                return newArr.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
              }
            }
            if (payload.eventType === 'DELETE') {
              return oldItems.filter(item => item.id !== payload.old.id);
            }
            return oldItems;
          });
          
          // El historial depende de cálculos SQL (frecuencia, fechas), así que ese sí lo refetchamos
          queryClient.invalidateQueries({ queryKey: ["frequent_products", householdId] });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [householdId, queryClient, supabase, queryKey]);

  // 3. Mutaciones con Optimistic Updates
  const addItemMutation = useMutation({
    mutationFn: async (newItem: Database['public']['Tables']['shopping_items']['Insert']) => {
      const { data, error } = await supabase
        .from("shopping_items")
        .insert([newItem])
        .select()
        .single();
      if (error) throw error;
      return data as ShoppingItem;
    },
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey });
      const previousItems = queryClient.getQueryData<ShoppingItem[]>(queryKey);
      const tempId = 'temp-' + Date.now();
      const clientId = crypto.randomUUID();
      
      // Asegurar que pasamos el client_id a Supabase para la inserción
      newItem.client_id = clientId;

      const optimisticItem = { 
        ...newItem, 
        id: tempId, 
        status: 'pending', 
        created_at: new Date().toISOString(),
        client_id: clientId
      } as ShoppingItem;
      
      queryClient.setQueryData<ShoppingItem[]>(queryKey, (old) => [
        optimisticItem,
        ...(old || [])
      ]);
      return { previousItems, tempId };
    },
    onSuccess: (realItem, variables, context) => {
      // Reemplazamos el ID temporal por el UUID real devuelto por la DB
      queryClient.setQueryData<ShoppingItem[]>(queryKey, (old) => 
        (old || []).map(item => item.id === context?.tempId ? realItem : item)
      );
    },
    onError: (err, newItem, context) => {
      if (context?.previousItems) queryClient.setQueryData(queryKey, context.previousItems);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["frequent_products", householdId] });
    },
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Database['public']['Tables']['shopping_items']['Update'] }) => {
      const { data, error } = await supabase
        .from("shopping_items")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data as ShoppingItem;
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousItems = queryClient.getQueryData<ShoppingItem[]>(queryKey);
      queryClient.setQueryData<ShoppingItem[]>(queryKey, (old) => 
        (old || []).map(item => item.id === id ? { ...item, ...updates, updated_at: new Date().toISOString() } : item)
      );
      return { previousItems };
    },
    onError: (err, variables, context) => {
      if (context?.previousItems) queryClient.setQueryData(queryKey, context.previousItems);
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["frequent_products", householdId] });
    },
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("shopping_items")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onMutate: async (id) => {
      await queryClient.cancelQueries({ queryKey });
      const previousItems = queryClient.getQueryData<ShoppingItem[]>(queryKey);
      queryClient.setQueryData<ShoppingItem[]>(queryKey, (old) => 
        (old || []).filter(item => item.id !== id)
      );
      return { previousItems };
    },
    onError: (err, id, context) => {
      if (context?.previousItems) queryClient.setQueryData(queryKey, context.previousItems);
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
