-- ==============================================================================
-- MIGRACIÓN: Consolidación Definitiva del Esquema (Paso Final)
-- ==============================================================================

-- 1. Modificar profiles para albergar household_id directamente
-- Esto simplifica las consultas y alinea el esquema al diseño final:
-- "profiles: id, household_id, nombre, avatar, color, timestamps"
ALTER TABLE public.profiles RENAME COLUMN current_household_id TO household_id;

-- (Los campos nombre, avatar, color ya existen mapeados como display_name, avatar_url, color)

-- 2. Actualizar y simplificar las políticas RLS para shopping_items
-- El usuario solamente puede modificar/ver información de su hogar.
DROP POLICY IF EXISTS "Usuarios ven items de su hogar" ON public.shopping_items;
DROP POLICY IF EXISTS "Usuarios modifican items de su hogar" ON public.shopping_items;

CREATE POLICY "Miembros ven items de su mismo hogar"
    ON public.shopping_items FOR SELECT
    TO authenticated
    USING (
        household_id = (SELECT household_id FROM public.profiles WHERE id = auth.uid())
    );

CREATE POLICY "Miembros editan items de su mismo hogar"
    ON public.shopping_items FOR ALL
    TO authenticated
    USING (
        household_id = (SELECT household_id FROM public.profiles WHERE id = auth.uid())
    )
    WITH CHECK (
        household_id = (SELECT household_id FROM public.profiles WHERE id = auth.uid())
    );

-- 3. Actualizar políticas RLS para shopping_history
DROP POLICY IF EXISTS "Usuarios ven historial de su hogar" ON public.shopping_history;
DROP POLICY IF EXISTS "Usuarios insertan historial de su hogar" ON public.shopping_history;

CREATE POLICY "Miembros ven historial de su mismo hogar"
    ON public.shopping_history FOR SELECT
    TO authenticated
    USING (
        household_id = (SELECT household_id FROM public.profiles WHERE id = auth.uid())
    );

CREATE POLICY "Miembros insertan historial en su mismo hogar"
    ON public.shopping_history FOR INSERT
    TO authenticated
    WITH CHECK (
        household_id = (SELECT household_id FROM public.profiles WHERE id = auth.uid())
    );
