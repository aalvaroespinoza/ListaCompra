import { toast } from "sonner";

export class AppError extends Error {
  public readonly code: string;
  public readonly isSupabaseError: boolean;

  constructor(message: string, code = "UNKNOWN_ERROR", isSupabaseError = false) {
    super(message);
    this.name = "AppError";
    this.code = code;
    this.isSupabaseError = isSupabaseError;
  }
}

/**
 * Estrategia centralizada de manejo de errores.
 * Filtra errores técnicos y muestra mensajes amigables al usuario.
 */
export function handleError(error: unknown, fallbackMessage = "Ocurrió un error inesperado") {
  console.error("[Error Centralizado]:", error);

  if (error instanceof AppError) {
    toast.error(error.message);
    return;
  }

  if (error instanceof Error) {
    // Aquí interceptaremos códigos de error específicos de Supabase en el futuro
    // ej: if (error.message.includes('JWT')) return toast.error("Sesión expirada")
    toast.error(fallbackMessage);
    return;
  }

  toast.error(fallbackMessage);
}
