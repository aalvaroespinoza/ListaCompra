import { useQuery } from "@tanstack/react-query";
import { shoppingListRepository } from "@/repositories/shopping-list-repository";

export function usePurchaseHistory(householdId: string | undefined, limit?: number) {
  return useQuery({
    queryKey: ["purchase-history", householdId, limit],
    queryFn: async () => {
      if (!householdId) return [];
      return shoppingListRepository.fetchPurchaseHistory(householdId, { limit });
    },
    enabled: !!householdId,
  });
}
