import { NextResponse, type NextRequest } from "next/server";

export default async function proxy(request: NextRequest) {
  // NOTA: Como la autenticación tradicional fue removida y ahora usamos
  // selección de perfiles local, ya no redirigimos a /login.
  return NextResponse.next();
}

// Configuración para definir qué rutas pasan por el proxy
export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
