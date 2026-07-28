-- ==============================================================================
-- MIGRACIÓN: Añadir client_id para optimistic updates deduplication
-- ==============================================================================

ALTER TABLE public.shopping_items 
ADD COLUMN client_id uuid;

CREATE INDEX idx_items_client_id ON public.shopping_items(client_id);
