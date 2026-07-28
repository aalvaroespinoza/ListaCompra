import { z } from "zod";

// Definimos el esquema de validación para las variables de entorno
const envSchema = z.object({
  NEXT_PUBLIC_SUPABASE_URL: z.string().url("SUPABASE_URL debe ser una URL válida"),
  NEXT_PUBLIC_SUPABASE_ANON_KEY: z.string().min(1, "SUPABASE_ANON_KEY es requerida"),
  SUPABASE_SERVICE_ROLE_KEY: z.string().optional(),
  NODE_ENV: z.enum(["development", "production", "test"]).default("development"),
});

// Extraemos los valores. 
// En Next.js, solo las variables que empiezan por NEXT_PUBLIC_ están disponibles en el cliente.
// Process.env solo debe leerse aquí.
const processEnv = {
  NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
  NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  NODE_ENV: process.env.NODE_ENV,
};

// Validamos las variables
const parsedEnv = envSchema.safeParse(processEnv);

if (!parsedEnv.success) {
  console.error("❌ Errores en las variables de entorno:", parsedEnv.error.format());
  throw new Error("Configuración de entorno inválida.");
}

// Exportamos un objeto fuertemente tipado con las variables
export const env = parsedEnv.data;
