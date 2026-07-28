"use client";

import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/types/supabase";
import { NotificationService } from "@/services/notification-service";
import { shoppingListRepository, ShoppingItem } from "@/repositories/shopping-list-repository";

export type { ShoppingItem };

export function useShoppingList(householdId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = React.useMemo(() => ["shopping_items", householdId], [householdId]);

  // 1. Fetch de items activos
  const { data: items = [], isLoading } = useQuery({
    queryKey,
    queryFn: () => shoppingListRepository.fetchActiveItems(householdId!),
    staleTime: Infinity,
    enabled: !!householdId,
  });

  const addItemMutation = useMutation({
    mutationFn: (newItem: Database['public']['Tables']['shopping_items']['Insert']) => 
      shoppingListRepository.insertItem(newItem),
    onMutate: async (newItem) => {
      await queryClient.cancelQueries({ queryKey });
      
      const id = newItem.id || crypto.randomUUID();
      newItem.id = id;

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
    },
    onError: (err, newItem, context) => {
      if (context?.id) {
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
    mutationFn: ({ id, updates, last_known_updated_at }: { id: string; updates: Database['public']['Tables']['shopping_items']['Update']; last_known_updated_at?: string }) => 
      shoppingListRepository.updateItem(id, updates, last_known_updated_at),
    onMutate: async (variables) => {
      const { id, updates } = variables;
      await queryClient.cancelQueries({ queryKey });
      
      const previousItems = queryClient.getQueryData<ShoppingItem[]>(queryKey);
      const previousItem = previousItems?.find(item => item.id === id);
      
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
    mutationFn: (id: string) => shoppingListRepository.deleteItem(id),
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
