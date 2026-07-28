-- ==============================================================================
-- SCRIPT PARA VACIAR LA BASE DE DATOS (RESETEO A CERO)
-- ==============================================================================
-- Advertencia: Esto eliminará todos los ítems, notificaciones, hogares y usuarios.
-- Ejecuta esto en el SQL Editor de tu Dashboard de Supabase.

-- Deshabilitar Triggers temporalmente para poder hacer TRUNCATE en cascada sin problemas
SET session_replication_role = 'replica';

-- Vaciar todas las tablas principales
TRUNCATE TABLE public.notifications CASCADE;
TRUNCATE TABLE public.shopping_items CASCADE;
TRUNCATE TABLE public.household_members CASCADE;
TRUNCATE TABLE public.households CASCADE;
TRUNCATE TABLE public.profiles CASCADE;

-- Reactivar Triggers
SET session_replication_role = 'origin';

-- NOTA: Si solo quieres borrar los productos y dejar los usuarios/hogares, usa esto en su lugar:
-- TRUNCATE TABLE public.notifications CASCADE;
-- TRUNCATE TABLE public.shopping_items CASCADE;
