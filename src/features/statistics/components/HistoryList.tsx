"use client";

import React from "react";
import { usePurchaseHistory } from "../hooks/use-purchase-history";
import { getCategoryIcon } from "@/features/shopping-list/utils/category-icons";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { toast } from "sonner";
import { Trash2 } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { shoppingListRepository } from "@/repositories/shopping-list-repository";

interface HistoryListProps {
  householdId: string;
}

export function HistoryList({ householdId }: HistoryListProps) {
  const { data: items, isLoading } = usePurchaseHistory(householdId);
  const queryClient = useQueryClient();
  const [isEditMode, setIsEditMode] = React.useState(false);
  const pressTimer = React.useRef<NodeJS.Timeout | null>(null);

  const handleTouchStart = () => {
    if (isEditMode) return;
    pressTimer.current = setTimeout(() => {
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
      setIsEditMode(true);
      toast.info("Modo edición. Usa el icono de papelera para eliminar.");
    }, 500);
  };

  const handleTouchEnd = () => {
    if (pressTimer.current) clearTimeout(pressTimer.current);
  };

  const handleDelete = async (e: React.MouseEvent | React.TouchEvent, itemId: string, name: string) => {
    e.stopPropagation();
    e.preventDefault();
    try {
      await shoppingListRepository.deleteItem(itemId);
      toast.success(`${name} eliminado del historial`);
      queryClient.invalidateQueries({ queryKey: ['purchase_history'] });
      queryClient.invalidateQueries({ queryKey: ['frequent_products'] });
    } catch (err) {
      toast.error("Error al eliminar. Revisa tu conexión.");
    }
  };

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
        {[1, 2, 3].map((i) => (
          <LoadingSkeleton key={i} shape="rect" className="h-16 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (!items || items.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-center text-text-tertiary h-64">
        <p className="text-lg font-medium text-text-secondary">No hay historial de compras</p>
      </div>
    );
  }

  // Agrupar por fecha de compra
  const groups = items.reduce((acc, item) => {
    const date = new Date(item.purchased_at || item.updated_at);
    
    const today = new Date();
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    
    let dateStr = "";
    if (date.toDateString() === today.toDateString()) {
      dateStr = "Hoy";
    } else if (date.toDateString() === yesterday.toDateString()) {
      dateStr = "Ayer";
    } else {
      dateStr = date.toLocaleDateString("es-ES", { day: "numeric", month: "long" });
    }

    if (!acc[dateStr]) acc[dateStr] = [];
    acc[dateStr].push(item);
    return acc;
  }, {} as Record<string, typeof items>);

  return (
    <div 
      className="p-4 space-y-6 pb-24"
      onClick={() => isEditMode && setIsEditMode(false)}
    >
      {Object.entries(groups).map(([dateStr, dateItems]) => (
        <div key={dateStr} className="space-y-3">
          <h3 className="text-sm font-bold text-text-tertiary uppercase tracking-wider pl-2">{dateStr}</h3>
          <div className="space-y-2">
            {dateItems.map(item => (
              <div 
                key={item.id} 
                onTouchStart={handleTouchStart}
                onTouchEnd={handleTouchEnd}
                onTouchMove={handleTouchEnd}
                onMouseDown={handleTouchStart}
                onMouseUp={handleTouchEnd}
                onMouseLeave={handleTouchEnd}
                className={`relative w-full p-4 bg-surface rounded-2xl border flex items-center justify-between transition-all ${
                  isEditMode ? 'border-red-200 shadow-md animate-pulse' : 'border-border shadow-sm'
                }`}
              >
                <div className="flex items-center gap-4 overflow-hidden">
                  <div className="shrink-0 flex items-center gap-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-sm ${isEditMode ? 'bg-red-50' : 'bg-primary/10'}`}>
                      {getCategoryIcon(item.name, item.category)}
                    </div>
                  </div>
                  
                  <div className="flex flex-col truncate justify-center min-w-0">
                    <span className="text-[16px] truncate leading-tight text-text-primary font-bold">
                      {item.name}
                    </span>
                    <span className="text-[13px] text-text-tertiary leading-tight mt-0.5 truncate">
                      {item.category || "Otros"} {item.unit ? `• ${item.quantity} ${item.unit}` : `• ${item.quantity}`}
                    </span>
                  </div>
                </div>
                
                {isEditMode && (
                  <button 
                    onClick={(e) => handleDelete(e, item.id, item.name)}
                    onTouchEnd={(e) => handleDelete(e, item.id, item.name)}
                    className="shrink-0 ml-3 bg-red-100 text-red-600 p-2.5 rounded-xl hover:bg-red-200 active:scale-90 transition-transform"
                  >
                    <Trash2 size={20} strokeWidth={2.5} />
                  </button>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
