import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/supabase";

export type LocalProfile = Profile & {
  household_id: string;
};

export class ProfileRepository {
  private get supabase() {
    return getSupabaseBrowserClient();
  }

  async fetchAll(): Promise<LocalProfile[]> {
    const { data, error } = await this.supabase
      .from("profiles")
      .select("*");

    if (error) throw error;
    return data as LocalProfile[];
  }
}

export const profileRepository = new ProfileRepository();
