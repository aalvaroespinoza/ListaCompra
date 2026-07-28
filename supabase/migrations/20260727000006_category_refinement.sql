-- ==============================================================================
-- MIGRACIÓN: Mejoras en categorías para la grilla rápida
-- ==============================================================================

-- 1. Normalizar categorías existentes a 'otros' si son nulas o no están en la lista
UPDATE public.shopping_items
SET category = 'otros'
WHERE category IS NULL 
   OR category NOT IN ('almacen', 'verduleria', 'carniceria', 'lacteos', 'limpieza', 'otros');

-- 2. Asegurar que por defecto sea 'otros' y not null
ALTER TABLE public.shopping_items 
ALTER COLUMN category SET DEFAULT 'otros',
ALTER COLUMN category SET NOT NULL;

-- 3. Añadir el constraint estricto
ALTER TABLE public.shopping_items
ADD CONSTRAINT category_enum_check 
CHECK (category IN ('almacen', 'verduleria', 'carniceria', 'lacteos', 'limpieza', 'otros'));

-- 4. Recrear la vista frequent_products para incluir la categoría más usada
DROP VIEW IF EXISTS public.frequent_products;

CREATE VIEW public.frequent_products AS
SELECT 
    household_id, 
    name, 
    mode() within group (order by category) as category,
    COUNT(*) as frequency,
    MAX(purchased_at) as last_purchased_at
FROM public.shopping_items
WHERE status = 'completed'
GROUP BY household_id, name;

ALTER VIEW public.frequent_products SET (security_invoker = true);
