"use client";

import React, { useState, useEffect } from 'react';
import { Plus } from "lucide-react";
import { IconButton } from "@/components/ui/IconButton";
import { Input } from "@/components/ui/Input";
import { useFrequentProducts } from '../hooks/use-frequent-products';

interface QuickInputProps {
  householdId: string;
  onAdd: (name: string, category?: string) => void;
}

export function QuickInput({ householdId, onAdd }: QuickInputProps) {
  const [value, setValue] = useState("");
  const { data: frequentProducts = [] } = useFrequentProducts(householdId);
  const [suggestions, setSuggestions] = useState<typeof frequentProducts>([]);

  // Autocompletado: filtra los productos frecuentes según lo escrito
  useEffect(() => {
    if (value.trim().length > 0) {
      const filtered = frequentProducts.filter(p => 
        p.name.toLowerCase().includes(value.trim().toLowerCase())
      );
      setSuggestions(filtered);
    } else {
      setSuggestions([]); // Si está vacío, se muestran las habituales
    }
  }, [value, frequentProducts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (value.trim()) {
      onAdd(value.trim());
      setValue("");
    }
  };

  const handleQuickAdd = (name: string) => {
    onAdd(name);
    setValue(""); // Limpia por si estaba escribiendo
  };

  // Mostrar autocompletado si hay texto, si no, mostrar los más habituales (max 5)
  const displayPills = value.trim().length > 0 ? suggestions : frequentProducts.slice(0, 5);

  return (
    <div 
      className="fixed bottom-[5.5rem] w-full max-w-md px-4 pointer-events-none z-20"
      style={{ bottom: "calc(env(safe-area-inset-bottom) + 5.5rem)" }}
    >
      {/* Compras habituales / Sugerencias */}
      {displayPills.length > 0 && (
        <div className="flex gap-2 overflow-x-auto pb-2 px-1 scrollbar-hide pointer-events-auto">
          {displayPills.map((prod) => (
            <button
              key={prod.name}
              onClick={() => handleQuickAdd(prod.name)}
              className="shrink-0 bg-surface/90 backdrop-blur-md border border-border px-4 py-1.5 rounded-full text-sm font-medium text-text-primary shadow-sm active:scale-95 transition-transform"
            >
              {prod.name} <Plus size={14} className="inline ml-1 text-primary" />
            </button>
          ))}
        </div>
      )}

      {/* Input de Agregar */}
      <form 
        onSubmit={handleSubmit} 
        className="flex gap-2 pointer-events-auto bg-surface/90 backdrop-blur-md p-2 rounded-2xl shadow-ios border border-border"
      >
        <Input 
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Agregar producto..." 
          className="border-none bg-surface-hover h-12 shadow-none focus:ring-0 focus:bg-surface text-[16px]"
        />
        <IconButton 
          type="submit" 
          variant="primary" 
          size="lg" 
          className="h-12 w-12 rounded-xl shrink-0" 
          disabled={!value.trim()}
        >
          <Plus size={24} />
        </IconButton>
      </form>
    </div>
  );
}
