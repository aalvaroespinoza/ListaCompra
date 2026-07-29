"use client";

import { useEffect } from "react";
import { getSupabaseBrowserClient } from "@/lib/supabase/client";

// Este es el ID del Household que compartirán todos los usuarios (debes crearlo en la BD)
export const GLOBAL_HOUSEHOLD_ID = "00000000-0000-0000-0000-000000000000";

export function AnonSessionProvider({ children }: { children: React.ReactNode }) {

  useEffect(() => {
    let mounted = true;
    const supabase = getSupabaseBrowserClient();

    const initAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        let user = session?.user || null;

        if (!session && mounted) {
          const { data } = await supabase.auth.signInAnonymously();
          user = data.user;
        }

        if (user && mounted) {
          // Forzar que el usuario pertenezca al household global
          // (Asume que RLS de Supabase permite al usuario actualizar su propio perfil)
          const { data: updateData, error: updateError } = await supabase
            .from('profiles')
            .update({ household_id: GLOBAL_HOUSEHOLD_ID })
            .eq('id', user.id)
            .select();
            
          if (updateError) {
            console.error("Error updating profile household_id:", updateError);
          } else if (!updateData || updateData.length === 0) {
            console.error("No se pudo actualizar el household_id. Posible bloqueo por RLS.");
          } else {
            console.log("Anon user household_id forced to:", GLOBAL_HOUSEHOLD_ID);
          }
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
