-- ==============================================================================
-- MIGRACIÓN: Nuevos features para la lista de compras
-- ==============================================================================

-- 1. Añadir categoría opcional a los ítems
ALTER TABLE public.shopping_items 
ADD COLUMN category text CHECK (char_length(category) <= 50);

CREATE INDEX idx_items_category ON public.shopping_items(category);

-- 2. Vista de productos frecuentes (compras habituales)
-- Esto nos permite autocompletar y sugerir productos de manera rápida basándonos
-- en la frecuencia de compra real de la familia.
CREATE VIEW public.frequent_products AS
SELECT 
    household_id, 
    name, 
    COUNT(*) as frequency,
    MAX(purchased_at) as last_purchased_at
FROM public.shopping_items
WHERE status = 'completed'
GROUP BY household_id, name;

-- Seguridad para la vista: no es necesaria RLS porque las vistas por defecto 
-- ejecutan con los privilegios del creador, pero podemos forzar que se resuelva en tiempo de consulta.
-- Sin embargo, es más seguro simplemente permitir consultas normales. Como 'shopping_items' 
-- tiene RLS, crear la vista con security invoker es lo ideal.
-- (En Postgres 15+ se puede usar security invoker)
ALTER VIEW public.frequent_products SET (security_invoker = true);
