-- ==============================================================================
-- MIGRACIÓN INICIAL: Arquitectura Base de ListaCompra
-- ==============================================================================

-- 1. Extensiones necesarias
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- TABLA: profiles
-- ==============================================================================
CREATE TABLE public.profiles (
    id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name text NOT NULL CHECK (char_length(display_name) >= 2 AND char_length(display_name) <= 50),
    color text NOT NULL CHECK (color ~* '^#[0-9a-f]{6}$'), -- HEX Color validación
    avatar_url text,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    
    CONSTRAINT pk_profiles PRIMARY KEY (id)
);

-- Índices para profiles
CREATE INDEX idx_profiles_created_at ON public.profiles(created_at);

-- ==============================================================================
-- TABLA: shopping_items
-- ==============================================================================
CREATE TABLE public.shopping_items (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    name text NOT NULL CHECK (char_length(name) >= 1 AND char_length(name) <= 100),
    quantity numeric NOT NULL DEFAULT 1 CHECK (quantity > 0),
    unit text CHECK (char_length(unit) <= 20),
    notes text CHECK (char_length(notes) <= 500),
    status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'completed')),
    
    -- Trazabilidad
    created_by uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    updated_by uuid REFERENCES public.profiles(id) ON DELETE RESTRICT,
    
    -- Timestamps y borrado lógico
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    purchased_at timestamptz,
    deleted_at timestamptz, -- Soft delete para permitir "restaurar" en el futuro y mantener historial
    
    CONSTRAINT pk_shopping_items PRIMARY KEY (id)
);

-- Índices para shopping_items (Optimización de consultas comunes)
CREATE INDEX idx_items_status ON public.shopping_items(status) WHERE deleted_at IS NULL;
CREATE INDEX idx_items_deleted_at ON public.shopping_items(deleted_at);
CREATE INDEX idx_items_created_at ON public.shopping_items(created_at DESC);
CREATE INDEX idx_items_purchased_at ON public.shopping_items(purchased_at DESC) WHERE status = 'completed';

-- ==============================================================================
-- TABLA: shopping_history
-- ==============================================================================
CREATE TABLE public.shopping_history (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    item_id uuid NOT NULL REFERENCES public.shopping_items(id) ON DELETE CASCADE,
    user_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE RESTRICT,
    event_type text NOT NULL CHECK (event_type IN ('created', 'updated', 'completed', 'restored', 'deleted')),
    created_at timestamptz NOT NULL DEFAULT now(),
    
    CONSTRAINT pk_shopping_history PRIMARY KEY (id)
);

-- Índices para shopping_history
CREATE INDEX idx_history_item_id ON public.shopping_history(item_id);
CREATE INDEX idx_history_user_id ON public.shopping_history(user_id);
CREATE INDEX idx_history_created_at ON public.shopping_history(created_at DESC);


-- ==============================================================================
-- TRIGGERS: Actualización automática de updated_at
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER trg_items_updated_at
    BEFORE UPDATE ON public.shopping_items
    FOR EACH ROW
    EXECUTE FUNCTION public.handle_updated_at();


-- ==============================================================================
-- SEGURIDAD: Row Level Security (RLS)
-- Como es una app familiar, cualquier usuario autenticado tiene acceso total
-- a los datos compartidos.
-- ==============================================================================

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shopping_history ENABLE ROW LEVEL SECURITY;

-- Políticas para Profiles
CREATE POLICY "Usuarios autenticados pueden ver todos los perfiles"
    ON public.profiles FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Usuarios autenticados pueden actualizar su propio perfil"
    ON public.profiles FOR UPDATE
    TO authenticated
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id);

CREATE POLICY "Inserción manejada por triggers en auth o autenticados"
    ON public.profiles FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = id);

-- Políticas para Shopping Items
CREATE POLICY "Acceso total a items para usuarios autenticados"
    ON public.shopping_items FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- Políticas para Shopping History
CREATE POLICY "Acceso total a historial para usuarios autenticados"
    ON public.shopping_history FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- ==============================================================================
-- PUBLICACIÓN PARA REALTIME
-- ==============================================================================
-- Agregamos las tablas a la publicación de Supabase para soportar sockets
ALTER PUBLICATION supabase_realtime ADD TABLE public.shopping_items;
ALTER PUBLICATION supabase_realtime ADD TABLE public.shopping_history;
