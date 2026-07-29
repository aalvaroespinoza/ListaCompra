import { useQuery } from "@tanstack/react-query";
import { shoppingListRepository } from "@/repositories/shopping-list-repository";

export const shoppingQueryKeys = {
  items: (householdId: string | undefined) => ["shopping_items", householdId] as const,
  frequent: (householdId: string | undefined) => ["frequent_products", householdId] as const,
};

export function useShoppingItems(householdId: string | undefined) {
  return useQuery({
    queryKey: shoppingQueryKeys.items(householdId),
    queryFn: () => shoppingListRepository.fetchActiveItems(householdId!),
    staleTime: Infinity,
    enabled: !!householdId,
  });
}
