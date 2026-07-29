import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { Database } from "@/types/supabase";
import { NotificationService } from "@/services/notification-service";
import { shoppingListRepository, ShoppingItem } from "@/repositories/shopping-list-repository";
import { shoppingQueryKeys } from "@/features/shopping-list/queries/shopping";

export function useAddShoppingItem(householdId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = shoppingQueryKeys.items(householdId);

  return useMutation({
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
      queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.frequent(householdId) });
    },
  });
}

export function useUpdateShoppingItem(householdId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = shoppingQueryKeys.items(householdId);

  return useMutation({
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
      queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.frequent(householdId) });
    },
  });
}

export function useDeleteShoppingItem(householdId: string | undefined) {
  const queryClient = useQueryClient();
  const queryKey = shoppingQueryKeys.items(householdId);

  return useMutation({
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
      queryClient.invalidateQueries({ queryKey: shoppingQueryKeys.frequent(householdId) });
    },
  });
}
