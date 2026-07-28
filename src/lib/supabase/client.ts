import { createBrowserClient } from "@supabase/ssr";
import { env } from "@/config/env";
import type { Database } from "@/types/supabase";

let supabaseBrowserClient: ReturnType<typeof createBrowserClient<Database>> | undefined;

export function getSupabaseBrowserClient() {
  if (supabaseBrowserClient) {
    return supabaseBrowserClient;
  }

  // createBrowserClient automáticamente maneja la persistencia de la sesión de 
  // manera segura en el navegador sin exponer cookies crudas, pero permitiendo
  // sincronización SSR.
  supabaseBrowserClient = createBrowserClient<Database>(
    env.NEXT_PUBLIC_SUPABASE_URL,
    env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  );

  return supabaseBrowserClient;
}
