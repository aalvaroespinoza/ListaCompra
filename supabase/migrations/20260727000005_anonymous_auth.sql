-- ==============================================================================
-- MIGRACIÓN: Autenticación Anónima y Simplificación RLS
-- ==============================================================================

-- 1. Desacoplar profiles de auth.users
ALTER TABLE public.profiles DROP CONSTRAINT profiles_id_fkey;

-- 2. Simplificar Políticas RLS (Cualquier sesión autenticada tiene acceso total)
-- Profiles
DROP POLICY IF EXISTS "Acceso total a profiles para usuarios autenticados" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios solo ven perfiles de su mismo hogar" ON public.profiles;
DROP POLICY IF EXISTS "Usuarios autenticados pueden actualizar su propio perfil" ON public.profiles;
DROP POLICY IF EXISTS "Inserción manejada por triggers en auth o autenticados" ON public.profiles;

CREATE POLICY "Acceso total a profiles para usuarios autenticados" ON public.profiles FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Households
DROP POLICY IF EXISTS "Acceso total a households para usuarios autenticados" ON public.households;
DROP POLICY IF EXISTS "Miembros pueden ver su household" ON public.households;

CREATE POLICY "Acceso total a households para usuarios autenticados" ON public.households FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Household Members
DROP POLICY IF EXISTS "Acceso total a household_members para usuarios autenticados" ON public.household_members;
DROP POLICY IF EXISTS "Miembros pueden ver integrantes de su household" ON public.household_members;

CREATE POLICY "Acceso total a household_members para usuarios autenticados" ON public.household_members FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Shopping Items
DROP POLICY IF EXISTS "Acceso total a shopping_items para usuarios autenticados" ON public.shopping_items;
DROP POLICY IF EXISTS "Miembros ven items de su mismo hogar" ON public.shopping_items;
DROP POLICY IF EXISTS "Miembros editan items de su mismo hogar" ON public.shopping_items;

CREATE POLICY "Acceso total a shopping_items para usuarios autenticados" ON public.shopping_items FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- Shopping History
DROP POLICY IF EXISTS "Acceso total a shopping_history para usuarios autenticados" ON public.shopping_history;
DROP POLICY IF EXISTS "Miembros ven historial de su mismo hogar" ON public.shopping_history;
DROP POLICY IF EXISTS "Miembros insertan historial en su mismo hogar" ON public.shopping_history;

CREATE POLICY "Acceso total a shopping_history para usuarios autenticados" ON public.shopping_history FOR ALL TO authenticated USING (true) WITH CHECK (true);


