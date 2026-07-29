"use client";

import React, { useState } from "react";
import { BottomSheet } from "@/components/ui/BottomSheet";
import { ShoppingItem as ShoppingItemType } from "../hooks/use-shopping-list";
import { CATEGORIES, CATEGORY_ORDER, CategoryType } from "../constants";

interface EditBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  item: ShoppingItemType | null;
  onUpdate: (id: string, updates: Partial<ShoppingItemType>) => void;
}

export function EditBottomSheet({ isOpen, onClose, item, onUpdate }: EditBottomSheetProps) {
  const [name, setName] = useState(() => item?.name || "");
  const [category, setCategory] = useState<CategoryType>(() => (item?.category as CategoryType) || "otros");
  const [quantity, setQuantity] = useState(() => item?.quantity.toString() || "1");
  const [unit, setUnit] = useState(() => item?.unit || "");

  const [prevItemId, setPrevItemId] = useState<string | null>(item?.id || null);

  if (item && item.id !== prevItemId) {
    setPrevItemId(item.id);
    setName(item.name);
    setCategory((item.category as CategoryType) || "otros");
    setQuantity(item.quantity.toString());
    setUnit(item.unit || "");
  }

  const handleSave = () => {
    if (!item || !name.trim()) return;
    
    onUpdate(item.id, {
      name: name.trim(),
      category,
      quantity: Math.max(1, parseInt(quantity) || 1),
      unit: unit.trim() || null
    });
    onClose();
  };

  return (
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Editar Ítem">
      <div className="p-6 space-y-6 pb-12">
        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">Nombre del producto</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full bg-surface-active p-4 rounded-xl border border-border focus:outline-none focus:border-primary text-text-primary font-medium"
            placeholder="Ej. Manzanas"
          />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Cantidad</label>
            <input
              type="number"
              min="1"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              className="w-full bg-surface-active p-4 rounded-xl border border-border focus:outline-none focus:border-primary text-text-primary font-medium"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium text-text-secondary">Unidad (Opcional)</label>
            <input
              type="text"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              className="w-full bg-surface-active p-4 rounded-xl border border-border focus:outline-none focus:border-primary text-text-primary font-medium"
              placeholder="kg, lts, un"
            />
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-text-secondary">Categoría</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {CATEGORY_ORDER.map((catKey) => {
              const catInfo = CATEGORIES[catKey];
              const Icon = catInfo.icon;
              const isSelected = category === catKey;
              return (
                <button
                  key={catKey}
                  onClick={() => setCategory(catKey)}
                  className={`flex items-center gap-2 p-3 rounded-xl border transition-colors ${
                    isSelected 
                      ? 'border-primary bg-primary/10' 
                      : 'border-border bg-surface-active hover:bg-surface-hover'
                  }`}
                >
                  <div className={`p-1.5 rounded-lg shrink-0 ${catInfo.bgColor} ${catInfo.color}`}>
                    <Icon size={16} />
                  </div>
                  <span className={`text-sm font-medium truncate ${isSelected ? 'text-primary' : 'text-text-primary'}`}>
                    {catInfo.label}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={!name.trim()}
          className="w-full py-4 mt-6 bg-primary text-white rounded-xl font-bold active:scale-95 transition-transform disabled:opacity-50"
        >
          Guardar Cambios
        </button>
      </div>
    </BottomSheet>
  );
}
