-- ==============================================================================
-- MIGRACIÓN: Sistema de Hogares (Miembros Familiares)
-- ==============================================================================

-- 1. TABLA: households
CREATE TABLE public.households (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    name text NOT NULL CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    
    CONSTRAINT pk_households PRIMARY KEY (id)
);

CREATE TRIGGER trg_households_updated_at
    BEFORE UPDATE ON public.households
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 2. TABLA: household_members
CREATE TABLE public.household_members (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    status text NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'invited')),
    role text NOT NULL DEFAULT 'member' CHECK (role IN ('owner', 'member')),
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    
    CONSTRAINT pk_household_members PRIMARY KEY (id),
    CONSTRAINT uk_household_user UNIQUE (household_id, user_id)
);

CREATE INDEX idx_household_members_household_id ON public.household_members(household_id);
CREATE INDEX idx_household_members_user_id ON public.household_members(user_id);

CREATE TRIGGER trg_household_members_updated_at
    BEFORE UPDATE ON public.household_members
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

-- 3. Modificar shopping_items y shopping_history
ALTER TABLE public.shopping_items ADD COLUMN household_id uuid REFERENCES public.households(id) ON DELETE CASCADE;
CREATE INDEX idx_shopping_items_household_id ON public.shopping_items(household_id);

ALTER TABLE public.shopping_history ADD COLUMN household_id uuid REFERENCES public.households(id) ON DELETE CASCADE;
CREATE INDEX idx_shopping_history_household_id ON public.shopping_history(household_id);

-- ==============================================================================
-- SEGURIDAD: Row Level Security (RLS) Adaptado a Múltiples Hogares
-- ==============================================================================

-- Households: Los miembros pueden ver sus hogares.
ALTER TABLE public.households ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Miembros pueden ver su household"
    ON public.households FOR SELECT
    TO authenticated
    USING (
        id IN (
            SELECT household_id FROM public.household_members WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Household Members: Los miembros pueden ver a otros miembros de su hogar.
ALTER TABLE public.household_members ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Miembros pueden ver integrantes de su household"
    ON public.household_members FOR SELECT
    TO authenticated
    USING (
        household_id IN (
            SELECT household_id FROM public.household_members WHERE user_id = auth.uid() AND status = 'active'
        )
    );

-- Actualizar las políticas de shopping_items para restringir por household_id
DROP POLICY IF EXISTS "Acceso total a items para usuarios autenticados" ON public.shopping_items;

CREATE POLICY "Usuarios ven items de su hogar"
    ON public.shopping_items FOR SELECT
    TO authenticated
    USING (
        household_id IN (
            SELECT household_id FROM public.household_members WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Usuarios modifican items de su hogar"
    ON public.shopping_items FOR ALL
    TO authenticated
    USING (
        household_id IN (
            SELECT household_id FROM public.household_members WHERE user_id = auth.uid() AND status = 'active'
        )
    )
    WITH CHECK (
        household_id IN (
            SELECT household_id FROM public.household_members WHERE user_id = auth.uid() AND status = 'active'
        )
    );
    
-- Actualizar las políticas de shopping_history
DROP POLICY IF EXISTS "Acceso total a historial para usuarios autenticados" ON public.shopping_history;

CREATE POLICY "Usuarios ven historial de su hogar"
    ON public.shopping_history FOR SELECT
    TO authenticated
    USING (
        household_id IN (
            SELECT household_id FROM public.household_members WHERE user_id = auth.uid() AND status = 'active'
        )
    );

CREATE POLICY "Usuarios insertan historial de su hogar"
    ON public.shopping_history FOR ALL
    TO authenticated
    USING (
        household_id IN (
            SELECT household_id FROM public.household_members WHERE user_id = auth.uid() AND status = 'active'
        )
    )
    WITH CHECK (
        household_id IN (
            SELECT household_id FROM public.household_members WHERE user_id = auth.uid() AND status = 'active'
        )
    );
