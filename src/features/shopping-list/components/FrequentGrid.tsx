"use client";

import React from "react";
import { useFrequentProducts } from "../hooks/use-frequent-products";
import { useShoppingList } from "../hooks/use-shopping-list";
import { getCategoryIcon } from "../utils/category-icons";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { toast } from "sonner";
import type { FrequentProduct } from "@/repositories/statistics-repository";

interface FrequentGridProps {
  householdId: string;
  userId: string;
}

export function FrequentGrid({ householdId, userId }: FrequentGridProps) {
  const { data: frequentProducts, isLoading } = useFrequentProducts(householdId);
  const { addItem } = useShoppingList(householdId);

  const handleAdd = async (product: FrequentProduct) => {
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
    <div className="p-4 grid grid-cols-2 gap-4 pb-24">
      {frequentProducts.map(product => (
        <button
          key={product.name}
          onClick={() => handleAdd(product)}
          className="flex flex-col items-center justify-center p-4 bg-surface border border-border rounded-2xl shadow-sm hover:shadow-md transition-all active:scale-95"
        >
          <div className="w-12 h-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm bg-primary/10 mb-3">
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
