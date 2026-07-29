"use client";

import { useShoppingItems } from "../queries/shopping";
import { 
  useAddShoppingItem, 
  useUpdateShoppingItem, 
  useDeleteShoppingItem 
} from "../mutations/shopping";
import type { ShoppingItem } from "@/repositories/shopping-list-repository";

export type { ShoppingItem };

export function useShoppingList(householdId: string | undefined) {
  const { data: items = [], isLoading } = useShoppingItems(householdId);
  const addItemMutation = useAddShoppingItem(householdId);
  const updateItemMutation = useUpdateShoppingItem(householdId);
  const deleteItemMutation = useDeleteShoppingItem(householdId);

  return {
    items,
    isLoading,
    addItem: addItemMutation.mutateAsync,
    updateItem: updateItemMutation.mutateAsync,
    deleteItem: deleteItemMutation.mutateAsync,
  };
}
