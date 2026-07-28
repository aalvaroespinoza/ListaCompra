# Providers

Contiene los Contextos de React y Providers globales de la aplicación.
Ejemplos:
- `QueryProvider`: Configuración global de React Query para caché y fetching.
- `ThemeProvider`: Manejo de modo oscuro/claro (si aplica).
- `ToastProvider`: Notificaciones globales (Sonner).

Todos estos providers se consolidan idealmente en el `layout.tsx` principal.
