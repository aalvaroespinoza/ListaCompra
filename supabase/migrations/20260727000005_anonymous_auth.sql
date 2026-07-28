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

-- 3. Seedear datos fijos
-- Household
INSERT INTO public.households (id, name) VALUES ('e52fbd1e-58c5-43be-8e05-64c8c7ad4e42', 'Familia');

-- Profiles
INSERT INTO public.profiles (id, display_name, color, household_id) VALUES 
('bd9c085b-e4a8-4e8a-a63e-6bd8cbe4f8e5', 'Alvaro', '#007AFF', 'e52fbd1e-58c5-43be-8e05-64c8c7ad4e42'),
('f0a3594b-2f04-4b55-ab1b-c3d31fc1be8b', 'Mamá', '#FF2D55', 'e52fbd1e-58c5-43be-8e05-64c8c7ad4e42'),
('593b4a2c-9821-4d37-83d2-d61efcf703b4', 'Papá', '#5856D6', 'e52fbd1e-58c5-43be-8e05-64c8c7ad4e42'),
('a86241a8-c2b6-455b-9b48-1518f8eb0cc0', 'Hermano', '#FF9500', 'e52fbd1e-58c5-43be-8e05-64c8c7ad4e42'),
('d79f046b-8cf7-4f16-92b0-8c2014df8b52', 'Hermana', '#34C759', 'e52fbd1e-58c5-43be-8e05-64c8c7ad4e42');

-- Household Members
INSERT INTO public.household_members (household_id, user_id, role) VALUES 
('e52fbd1e-58c5-43be-8e05-64c8c7ad4e42', 'bd9c085b-e4a8-4e8a-a63e-6bd8cbe4f8e5', 'owner'),
('e52fbd1e-58c5-43be-8e05-64c8c7ad4e42', 'f0a3594b-2f04-4b55-ab1b-c3d31fc1be8b', 'member'),
('e52fbd1e-58c5-43be-8e05-64c8c7ad4e42', '593b4a2c-9821-4d37-83d2-d61efcf703b4', 'member'),
('e52fbd1e-58c5-43be-8e05-64c8c7ad4e42', 'a86241a8-c2b6-455b-9b48-1518f8eb0cc0', 'member'),
('e52fbd1e-58c5-43be-8e05-64c8c7ad4e42', 'd79f046b-8cf7-4f16-92b0-8c2014df8b52', 'member');

/*
UUIDS GENERADOS:
Household (Familia): e52fbd1e-58c5-43be-8e05-64c8c7ad4e42
Alvaro: bd9c085b-e4a8-4e8a-a63e-6bd8cbe4f8e5
Mamá: f0a3594b-2f04-4b55-ab1b-c3d31fc1be8b
Papá: 593b4a2c-9821-4d37-83d2-d61efcf703b4
Hermano: a86241a8-c2b6-455b-9b48-1518f8eb0cc0
Hermana: d79f046b-8cf7-4f16-92b0-8c2014df8b52
*/
