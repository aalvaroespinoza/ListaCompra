"use client";

import { useQuery } from "@tanstack/react-query";
import { statisticsRepository } from "@/repositories/statistics-repository";
import { shoppingQueryKeys } from "@/features/shopping-list/queries/shopping";

export function useFrequentProducts(householdId: string | undefined) {
  return useQuery({
    queryKey: shoppingQueryKeys.frequent(householdId),
    queryFn: () => statisticsRepository.fetchFrequentProducts(householdId!),
    enabled: !!householdId,
  });
}
