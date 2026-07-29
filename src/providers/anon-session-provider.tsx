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
          // Obtener el primer hogar existente en la base de datos para compartirlo entre todos
          const { data: allHouseholds } = await supabase.from('households').select('*').limit(1);
          let existingHousehold = allHouseholds && allHouseholds.length > 0 ? allHouseholds[0] : null;

          if (!existingHousehold) {
            const { data: newHousehold, error: createError } = await supabase
              .from('households')
              .insert([{ name: 'Mi Casa', created_by: user.id }])
              .select()
              .single();
              
            if (!createError && newHousehold) {
              existingHousehold = newHousehold;
            }
          }

          if (existingHousehold) {
            // Forzar que el usuario pertenezca al household compartido
            const { error: updateError } = await supabase
              .from('profiles')
              .update({ household_id: existingHousehold.id })
              .eq('id', user.id);
              
            if (updateError) {
              console.error("Error updating profile household_id:", updateError);
            } else {
              console.log("Anon user household_id forced to:", existingHousehold.id);
            }
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
