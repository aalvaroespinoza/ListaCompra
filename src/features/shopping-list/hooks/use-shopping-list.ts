"use client";

import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Database } from "@/types/supabase";

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
};

export function useShoppingList(householdId: string | undefined) {
  const queryClient = useQueryClient();
  const supabase = getSupabaseBrowserClient();
  const queryKey = ["shopping_items", householdId];

  // 1. Fetch de items activos (no borrados lógicamente)
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

  // 2. Realtime Subscriptions (Suscripción a WebSockets de Supabase)
  useEffect(() => {
    if (!householdId) return;

    const channel = supabase
      .channel(`public:shopping_items:${householdId}`)
      .on(
        "postgres_changes",
        {
          event: "*", // INSERT, UPDATE, DELETE
          schema: "public",
          table: "shopping_items",
          filter: `household_id=eq.${householdId}`,
        },
        (payload) => {
          // Optimización: invalidar la cache forzará un refetch reactivo.
          // Como React Query maneja el estado global, esto sincroniza toda la app.
          queryClient.invalidateQueries({ queryKey });
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [householdId, queryClient, supabase]);

  // 3. Mutaciones con Invalidación
  const addItemMutation = useMutation({
    mutationFn: async (newItem: Partial<ShoppingItem>) => {

      const { data, error } = await (supabase as any)
        .from("shopping_items")
        .insert([newItem])
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    // Optistic UI & Soporte Offline Básico (Mantiene la UI rápida)
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey });
      const previousItems = queryClient.getQueryData<ShoppingItem[]>(queryKey);
      queryClient.setQueryData<ShoppingItem[]>(queryKey, (old) => [
        { ...newItem, id: 'temp-' + Date.now(), status: 'pending', created_at: new Date().toISOString() } as ShoppingItem,
        ...(old || [])
      ]);
      return { previousItems };
    },
    onError: (err, newItem, context) => {
      // Revertir si hay conflicto offline/online
      if (context?.previousItems) queryClient.setQueryData(queryKey, context.previousItems);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const updateItemMutation = useMutation({
    mutationFn: async ({ id, updates }: { id: string; updates: Partial<ShoppingItem> }) => {

      const { data, error } = await (supabase as any)
        .from("shopping_items")
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq("id", id)
        .select()
        .single();
      if (error) throw error;
      return data;
    },
    onMutate: async ({ id, updates }) => {
      await queryClient.cancelQueries({ queryKey });
      const previousItems = queryClient.getQueryData<ShoppingItem[]>(queryKey);
      queryClient.setQueryData<ShoppingItem[]>(queryKey, (old) => 
        (old || []).map(item => item.id === id ? { ...item, ...updates } : item)
      );
      return { previousItems };
    },
    onError: (err, variables, context) => {
      if (context?.previousItems) queryClient.setQueryData(queryKey, context.previousItems);
    },
    onSettled: () => queryClient.invalidateQueries({ queryKey }),
  });

  const deleteItemMutation = useMutation({
    mutationFn: async (id: string) => {
      // Soft delete para mantener historial

      const { error } = await (supabase as any)
        .from("shopping_items")
        .update({ deleted_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey }),
  });

  return {
    items,
    isLoading,
    addItem: addItemMutation.mutateAsync,
    updateItem: updateItemMutation.mutateAsync,
    deleteItem: deleteItemMutation.mutateAsync,
  };
}
