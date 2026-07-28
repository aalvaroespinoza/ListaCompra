"use client";

import { useQuery } from "@tanstack/react-query";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function useFrequentProducts(householdId: string | undefined) {
  const supabase = getSupabaseBrowserClient();

  return useQuery({
    queryKey: ["frequent_products", householdId],
    queryFn: async () => {
      if (!householdId) return [];
      const { data, error } = await supabase
        .from("frequent_products")
        .select("*")
        .eq("household_id", householdId)
        .order("frequency", { ascending: false })
        .limit(50); // Aumentado para mostrar una grilla más rica

      if (error) throw error;
      return (data || []) as Array<{
        household_id: string;
        name: string;
        category: string;
        frequency: number;
        last_purchased_at: string | null;
      }>;
    },
    enabled: !!householdId,
  });
}
