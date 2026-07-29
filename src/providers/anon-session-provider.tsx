"use client";

import { useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function AnonSessionProvider({ children }: { children: React.ReactNode }) {

  useEffect(() => {
    let mounted = true;
    const supabase = getSupabaseBrowserClient();

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session && mounted) {
          await supabase.auth.signInAnonymously();
        }
      } catch (error) {
        console.error("Error signing in anonymously:", error);
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  return <>{children}</>;
}
