# Auditoría del Proyecto: Lista de Compras Familiar (PWA)

## 1. Resumen del proyecto

El proyecto es una **Progressive Web App (PWA)** diseñada para gestionar una lista de compras compartida en tiempo real para un hogar. Está pensada para ser extremadamente rápida, simple y sin barreras de entrada para los usuarios (usualmente miembros de la familia que solo quieren anotar qué comprar). 

Para lograr esta fricción cero, la app **no requiere login con email/contraseña ni OAuth**. En su lugar, utiliza un sistema de **"perfiles fijos" locales** combinados con sesiones anónimas transparentes en Supabase para sincronizar datos en tiempo real. La prioridad de producto es la velocidad de uso a una mano en mobile (UI estilo iOS), la estética premium (micro-interacciones, vibración) y la fiabilidad offline/online de los datos compartidos.

## 2. Stack técnico

Dependencias críticas (versiones exactas fijadas en `package.json`):

- **Next.js:** `^16.2.12` *(Atención: Versión muy reciente, app router)*
- **React & React DOM:** `19.2.4` *(Atención: React 19)*
- **Tailwind CSS:** `^4.0.0` (vía `@tailwindcss/postcss`) *(Atención: Tailwind v4 usa `@theme` en CSS puro en lugar de `tailwind.config.js`)*
- **TypeScript:** `^5.0.0`
- **@supabase/supabase-js:** `^2.110.9`
- **@supabase/ssr:** `^0.12.3`
- **@tanstack/react-query:** `^5.101.4` (Manejo de estado asíncrono y caché)
- **framer-motion:** `^12.42.2` (Animaciones)
- **lucide-react:** `^1.27.0` (Iconos)
- **react-hook-form:** `^7.83.0` & **zod:** `^4.4.3` (Formularios y validación)
- **eslint:** `^9.12.0` *(Se hizo downgrade desde v10 por incompatibilidad con next)*

## 3. Árbol de archivos

`src/`
- `proxy.ts`: Middleware proxy (actualmente sin redirecciones de login).
- `app/favicon.ico`: Ícono del sitio.
- `app/layout.tsx`: Root layout, configura PWA, fuentes y providers globales.
- `app/page.tsx`: Pantalla principal (dashboard, lista de compras, stats, navegación).
- `app/nfc/[tag]/page.tsx`: Funcionalidad (en pruebas) para leer tags NFC y agregar productos.
- `components/layout/`: Componentes estructurales (Header, BottomNavigation, PageContainer, Section).
- `components/shared/StatsRow.tsx`: Fila de estadísticas (Por comprar, Comprados, Total).
- `components/ui/`: UI Kit base genérico (Avatar, Badge, Button, Card, Checkbox, ConfirmDialog, Input, Modal, LoadingSkeleton, etc.).
- `config/env.ts`: Validación Zod de variables de entorno (Supabase URL/Key).
- `features/shopping-list/constants.ts`: Tipos y configuración de categorías.
- `features/shopping-list/components/`: Componentes de dominio (ShoppingList, ShoppingItem, QuickInput, QuickAddSheet, CategoryGroup, EmptyState).
- `features/shopping-list/hooks/use-shopping-list.ts`: Custom hook con React Query y Supabase Realtime para la lista de compras.
- `features/shopping-list/utils/category-icons.ts`: Lógica heurística para adivinar el ícono/emoji de un producto.
- `hooks/use-current-profile.ts`: Hook para manejar la persistencia del perfil de usuario local.
- `lib/supabase/client.ts` & `server.ts`: Instancias singleton configuradas del cliente de Supabase (Browser y SSR).
- `providers/`: Contextos globales (QueryProvider, AppProvider, AnonSessionProvider para auth anónimo).
- `repositories/household-repository.ts`: Lógica de abstracción para DB (aparentemente sin uso).
- `styles/globals.css`: Base CSS, configuración de variables de entorno de Tailwind v4.
- `types/supabase.ts`: Tipos estrictos auto-generados de la DB de Supabase.
- `utils/`: Utilidades genéricas (`cn.ts` para clases, `dates.ts`, `errors.ts`, `validation.ts`).

## 4. Arquitectura y decisiones clave

**Modelo de identidad (Fricción Cero):**
Se separó la identidad visual ("quién sos en la familia") de la identidad de sesión de base de datos. En el cliente, `useCurrentProfile` guarda en `localStorage` qué miembro del hogar es el dispositivo. Paralelamente, `AnonSessionProvider` inicializa silenciosamente un login anónimo (`signInAnonymously`) con Supabase. Esto provee un `auth.uid()` real para que las políticas de Row Level Security (RLS) en Postgres funcionen sin pedirle contraseñas al usuario.

**Schema de datos (Resumen de Migraciones):**
1. `00` y `01`: Tablas iniciales `profiles`, `households`, `household_members`.
2. `02` y `03`: Refinamiento de perfiles, policies y reglas RLS.
3. `04`: Creación de la tabla core `shopping_items` (nombre, categoría, estado, created_by) y `shopping_history`, además de la vista `frequent_products`.
4. `05`: Políticas para Auth Anónimo (permitiendo a usuarios sin registrar crear households e items).
5. `06`: Refinamiento de la columna `category` en `shopping_items`.

**Sistema de diseño:**
Implementado en Tailwind CSS v4 usando su nueva directiva `@theme` directamente en `src/styles/globals.css`. La paleta de colores incluye un Violeta/Índigo vibrante (`#8553F4`) como Primario y Naranja (`#F6A845`) secundario, orientada a un look muy premium, con gradientes sutiles y soporte dark mode mediante `prefers-color-scheme: dark`.

## 5. Estado actual (a hoy)

El código actual está 100% libre de errores de linting y de compilación TypeScript.

Salida de `npx tsc --noEmit`:
```text
(0 errores)
```

Salida de `npm run lint`:
```text
> lista-compra@0.1.0 lint
> eslint

(0 errores, 0 warnings)
```

- **Probado y funcionando:** Configuración de Tailwind 4, Tipado de Supabase local (sin `any`), renderizado de UI, hook de `useCurrentProfile` y la inicialización de estado local (lazy initializers).
- **Falta probar a fondo:** Sincronización real con un backend Supabase activo, suscripciones realtime y la feature NFC.

## 6. Problemas conocidos / pendientes

1. **Dashboard de Supabase (Manual):** Se requiere que el desarrollador verifique explícitamente en su proyecto de Supabase web que la opción "Anonymous Sign-Ins" esté HABILITADA en *Authentication > Providers*.
2. **Feature no validada:** `src/app/nfc/[tag]/page.tsx` fue agregada fuera del scope inicial y su funcionalidad de NFC no está probada.
3. **Código Muerto:** `src/repositories/household-repository.ts` existe pero no es importado ni utilizado en ninguna parte del proyecto actualmente.
4. **TODOs y excepciones TypeScript restantes:**
   - `src/utils/validation.ts:9` -> `// TODO: Agregar validaciones (ej. productSchema)`
   - `src/features/shopping-list/hooks/use-shopping-list.ts:83` -> `@ts-expect-error`
   - `src/features/shopping-list/hooks/use-shopping-list.ts:112` -> `@ts-expect-error`
   - `src/features/shopping-list/hooks/use-shopping-list.ts:140` -> `@ts-expect-error`
   *(Nota: Los expect-errors se dejaron intencionalmente porque el SDK de Supabase JS infiere 'never' en mutaciones debido a diferencias internas del type generator con las constraints de las versiones nuevas).* No hay uso de `any` en el proyecto.

## 7. Cómo correr el proyecto

1. Renombrar `.env.example` a `.env.local` y rellenar:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_url_aqui
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key_aqui
   ```
2. Instalar dependencias e iniciar el server:
   ```bash
   npm install
   npm run dev
   ```
3. *Recuerde*: Aplicar los archivos `.sql` de `supabase/migrations/` en la base de datos de Supabase. Habilitar Logins Anónimos en Supabase.
