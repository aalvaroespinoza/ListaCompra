"use client";

import React from "react";
import { useFrequentProducts } from "../hooks/use-frequent-products";
import { useShoppingList } from "../hooks/use-shopping-list";
import { getCategoryIcon } from "../utils/category-icons";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { toast } from "sonner";
import { X } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { shoppingListRepository } from "@/repositories/shopping-list-repository";
import type { FrequentProduct } from "@/repositories/statistics-repository";

interface FrequentGridProps {
  householdId: string;
  userId: string;
}

export function FrequentGrid({ householdId, userId }: FrequentGridProps) {
  const { data: frequentProducts, isLoading } = useFrequentProducts(householdId);
  const { addItem } = useShoppingList(householdId);
  const queryClient = useQueryClient();
  const [isEditMode, setIsEditMode] = React.useState(false);
  const pressTimer = React.useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = () => {
    if (isEditMode) return;
    pressTimer.current = setTimeout(() => {
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
      setIsEditMode(true);
      toast.info("Modo edición. Toca la X para eliminar.");
    }, 500);
  };

  const handleTouchEnd = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  const handleDelete = async (e: React.MouseEvent | React.TouchEvent, product: FrequentProduct) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await shoppingListRepository.deleteHistoryByName(householdId, product.name);
      toast.success(`${product.name} eliminado de frecuentes`);
      queryClient.invalidateQueries({ queryKey: ['frequent_products'] });
    } catch (err) {
      toast.error("Error al eliminar. Revisa tu conexión.");
    }
  };

  const handleAdd = async (product: FrequentProduct) => {
    if (isEditMode) return;
    try {
      await addItem({
        household_id: householdId,
        created_by: userId,
        name: product.name,
        quantity: 1,
        unit: null,
        category: product.category || null,
        notes: null,
        status: "pending"
      });
      toast.success(`Agregado a la lista`, { description: product.name });
    } catch (e) {
      toast.error("Error al agregar el producto");
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 grid grid-cols-2 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <LoadingSkeleton key={i} shape="rect" className="h-32 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!frequentProducts || frequentProducts.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-text-tertiary h-64">
        <p className="text-lg font-medium text-text-secondary">Aún no hay productos frecuentes</p>
      </div>
    );
  }

  return (
    <div 
      className="p-4 grid grid-cols-2 gap-4 pb-24"
      onClick={() => isEditMode && setIsEditMode(false)}
    >
      {frequentProducts.map(product => (
        <button
          key={product.name}
          onClick={(e) => {
            if (isEditMode) e.stopPropagation();
            handleAdd(product);
          }}
          onTouchStart={handleTouchStart}
          onTouchEnd={handleTouchEnd}
          onTouchMove={handleTouchEnd}
          onMouseDown={handleTouchStart}
          onMouseUp={handleTouchEnd}
          onMouseLeave={handleTouchEnd}
          className={`relative flex flex-col items-center justify-center p-4 bg-surface border rounded-2xl transition-all active:scale-95 ${
            isEditMode ? 'border-red-200 shadow-md animate-pulse' : 'border-border shadow-sm hover:shadow-md'
          }`}
        >
          {isEditMode && (
            <div 
              onClick={(e) => handleDelete(e, product)}
              onTouchEnd={(e) => handleDelete(e, product)}
              className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1.5 shadow-md z-10 hover:bg-red-600 active:scale-90 transition-transform"
            >
              <X size={16} strokeWidth={3} />
            </div>
          )}
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm mb-3 ${isEditMode ? 'bg-red-50' : 'bg-primary/10'}`}>
            {getCategoryIcon(product.name, product.category)}
          </div>
          <span className="text-sm font-bold text-text-primary text-center leading-tight mb-1 line-clamp-2 break-words">
            {product.name}
          </span>
          <span className="text-xs text-text-tertiary">
            Comprado {product.frequency} {product.frequency === 1 ? 'vez' : 'veces'}
          </span>
        </button>
      ))}
    </div>
  );
}
