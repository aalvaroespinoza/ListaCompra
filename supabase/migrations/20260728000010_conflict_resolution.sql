-- ==============================================================================
-- MIGRACIÓN: Resolución de Conflictos (Offline First)
-- ==============================================================================

CREATE OR REPLACE FUNCTION public.update_shopping_item_safe(
    p_id uuid,
    p_quantity numeric,
    p_status text,
    p_last_known_updated_at timestamptz
)
RETURNS json
LANGUAGE plpgsql
AS $$
DECLARE
    v_current_updated_at timestamptz;
    v_current_item json;
BEGIN
    -- Obtener el updated_at actual del ítem
    SELECT updated_at INTO v_current_updated_at
    FROM public.shopping_items
    WHERE id = p_id;

    IF NOT FOUND THEN
        RAISE EXCEPTION 'Item no encontrado';
    END IF;

    -- Si el registro en la BD es más reciente que la versión que el cliente editó, hay conflicto.
    -- Damos un margen de 1 segundo por diferencias de milisegundos.
    IF v_current_updated_at > (p_last_known_updated_at + interval '1 second') THEN
        -- Devolver el ítem actual para mostrar el conflicto
        SELECT row_to_json(shopping_items) INTO v_current_item
        FROM public.shopping_items
        WHERE id = p_id;
        
        RETURN json_build_object(
            'conflict', true,
            'server_item', v_current_item
        );
    END IF;

    -- Si no hay conflicto, actualizamos normalmente
    UPDATE public.shopping_items
    SET 
        quantity = p_quantity,
        status = p_status
    WHERE id = p_id;

    RETURN json_build_object('conflict', false);
END;
$$;
