-- ==============================================================================
-- MIGRACIÓN: Optimización de Índices para Consultas y Realtime
-- ==============================================================================

-- Índice compuesto para la consulta principal de useShoppingList:
-- Filtra por household_id y deleted_at IS NULL, y ordena por status y updated_at.
CREATE INDEX IF NOT EXISTS idx_items_household_active_sort 
ON public.shopping_items (household_id, status DESC, updated_at DESC) 
WHERE deleted_at IS NULL;

-- Índice compuesto para optimizar la vista frequent_products:
-- Filtra por status = 'completed' y agrupa por household_id, name.
CREATE INDEX IF NOT EXISTS idx_items_completed_freq 
ON public.shopping_items (household_id, name) 
WHERE status = 'completed';

-- Índice para optimizar los filtros de Supabase Realtime
-- Realtime usa 'household_id=eq.UUID'
CREATE INDEX IF NOT EXISTS idx_items_household_realtime 
ON public.shopping_items (household_id);
