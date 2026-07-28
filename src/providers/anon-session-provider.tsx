"use client";

import { useEffect, useState } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

export function AnonSessionProvider({ children }: { children: React.ReactNode }) {
  const [isReady, setIsReady] = useState(false);

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
      } finally {
        if (mounted) setIsReady(true);
      }
    };

    initAuth();

    return () => {
      mounted = false;
    };
  }, []);

  if (!isReady) return null;

  return <>{children}</>;
}
