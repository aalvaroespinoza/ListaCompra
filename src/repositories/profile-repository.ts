import { getSupabaseBrowserClient } from "@/lib/supabase/client";
import type { Profile } from "@/types/supabase";

export type LocalProfile = Profile & {
  household_id: string;
};

import { OfflineQueue } from "@/lib/offline-queue";

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

  async updateAvatar(id: string, avatar_url: string): Promise<void> {
    const payload = { id, avatar_url };
    
    await OfflineQueue.executeSafe(
      'update',
      'profiles',
      payload,
      async () => {
        const { error } = await this.supabase
          .from("profiles")
          .update({ avatar_url })
          .eq("id", id);
        if (error) throw error;
      },
      undefined
    );
  }
}

export const profileRepository = new ProfileRepository();
