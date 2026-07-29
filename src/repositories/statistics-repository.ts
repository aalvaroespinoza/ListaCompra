import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export type FrequentProduct = {
  household_id: string;
  name: string;
  category: string;
  frequency: number;
  last_purchased_at: string | null;
};

export class StatisticsRepository {
  private get supabase() {
    return getSupabaseBrowserClient();
  }

  async fetchFrequentProducts(householdId: string): Promise<FrequentProduct[]> {
    if (!householdId) return [];

    const { data, error } = await this.supabase
      .from("frequent_products")
      .select("*")
      .eq("household_id", householdId)
      .order("frequency", { ascending: false })
      .limit(50);

    if (error) throw error;
    return (data || []) as FrequentProduct[];
  }
}

export const statisticsRepository = new StatisticsRepository();
