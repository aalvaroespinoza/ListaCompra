-- ==============================================================================
-- MIGRACIÓN: Refinamiento Multi-Hogar (Perfiles)
-- ==============================================================================

-- 1. Actualizar profiles para soportar un hogar activo por defecto
ALTER TABLE public.profiles 
ADD COLUMN current_household_id uuid REFERENCES public.households(id) ON DELETE SET NULL;

CREATE INDEX idx_profiles_current_household_id ON public.profiles(current_household_id);

-- 2. Restricción estricta de aislamiento de datos (RLS)
-- Como detectamos en la auditoría, la política inicial permitía acceso global.
-- Eliminamos el acceso global a perfiles.
DROP POLICY IF EXISTS "Usuarios autenticados pueden ver todos los perfiles" ON public.profiles;

-- Nueva política: Un usuario solo puede ver su propio perfil, o los perfiles de los
-- miembros que pertenecen a sus mismos hogares activos.
CREATE POLICY "Usuarios solo ven perfiles de su mismo hogar"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (
        id = auth.uid() OR 
        id IN (
            SELECT user_id FROM public.household_members 
            WHERE household_id IN (
                SELECT household_id FROM public.household_members 
                WHERE user_id = auth.uid() AND status = 'active'
            )
            AND status = 'active'
        )
    );
