-- ==============================================================================
-- MIGRACIÓN: Sistema Inteligente de Notificaciones
-- ==============================================================================

CREATE TABLE public.notifications (
    id uuid NOT NULL DEFAULT uuid_generate_v4(),
    household_id uuid NOT NULL REFERENCES public.households(id) ON DELETE CASCADE,
    actor_id uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    action_type text NOT NULL CHECK (action_type IN ('added', 'completed', 'deleted', 'updated')),
    item_count integer NOT NULL DEFAULT 1,
    summary text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now(),
    read_by uuid[] DEFAULT '{}',
    
    CONSTRAINT pk_notifications PRIMARY KEY (id)
);

CREATE INDEX idx_notifications_household ON public.notifications(household_id);
CREATE INDEX idx_notifications_created_at ON public.notifications(created_at DESC);

ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Acceso total a notificaciones para usuarios autenticados"
    ON public.notifications FOR ALL
    TO authenticated
    USING (true)
    WITH CHECK (true);

ALTER PUBLICATION supabase_realtime ADD TABLE public.notifications;
