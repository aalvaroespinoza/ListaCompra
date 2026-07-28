# ListaCompra

Progressive Web App (PWA) optimizada para iOS, diseñada para gestionar una lista de compras familiar en tiempo real. 
Construida con Next.js 15, React, Tailwind CSS y preparada para integración con Supabase.

## Arquitectura

El proyecto está diseñado con una arquitectura modular para escalar a largo plazo:

- `/src/components`: UI modular. Separación estricta entre elementos base (`/ui`) y estructurales (`/layout`).
- `/src/config`: Validaciones centralizadas de entorno (Zod).
- `/src/lib`: Clientes de terceros (Supabase).
- `/src/providers`: Envoltorios de contexto globales (React Query, Sonner).
- `/src/types`: Definiciones TypeScript y tipos auto-generados.
- `/src/utils`: Helpers, manejo de errores y constantes.
- `/src/services`, `/src/repositories`, `/src/queries`, `/src/mutations`: Estructuras preparadas para la capa de datos.

## Configuración de Entorno y Supabase

1. Crea el archivo `.env.local` basado en `.env.example`:
   ```bash
   cp .env.example .env.local
   ```
2. Añade las credenciales de Supabase en `.env.local`:
   - `NEXT_PUBLIC_SUPABASE_URL`: La URL del proyecto.
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`: La clave anónima pública.

**Nota Importante**: Nunca accedas a `process.env` directamente desde los componentes. Importa siempre el objeto tipado desde `src/config/env.ts`.

## Comandos de Desarrollo

```bash
# Iniciar el servidor local de desarrollo (con Turbopack)
npm run dev

# Generar la build de producción
npm run build

# Validar linting
npm run lint
```

## Convenciones de Código

- **TypeScript Estricto**: No se permite el uso de `any`.
- **Manejo de Errores Centralizado**: Usa `handleError()` de `src/utils/errors.ts` para capturar excepciones en lugar de exponer los detalles al usuario de forma dispersa.
- **Tailwind**: Utilizar la utilidad `cn()` de `src/utils/cn.ts` al combinar clases dinámicas. Los tokens visuales (colores, sombras, radios) están definidos en `src/styles/globals.css`.
