"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { ShoppingItem } from "./ShoppingItem";
import { useShoppingList, ShoppingItem as ShoppingItemType } from "../hooks/use-shopping-list";
import { useFrequentProducts } from "../hooks/use-frequent-products";
import { CATEGORIES, CategoryType, guessCategoryFromName } from "../constants";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { StatsRow } from "@/components/shared/StatsRow";
import { SearchInput } from "@/components/ui/SearchInput";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";
import { useCurrentProfile } from "@/hooks/use-current-profile";

interface ShoppingListProps {
  householdId: string;
  userId: string;
}

export function ShoppingList({ householdId, userId }: ShoppingListProps) {
  const { items, isLoading, addItem, updateItem, deleteItem } = useShoppingList(householdId);
  const { data: frequentProducts = [] } = useFrequentProducts(householdId);
  const { availableProfiles } = useCurrentProfile();

  const [search, setSearch] = useState("");
  const [conflictProduct, setConflictProduct] = useState<{name: string, category: string, existingItem: ShoppingItemType} | null>(null);
  const [isGridOpen, setIsGridOpen] = useState(false);

  // Filtrado inteligente de chips frecuentes basado en lo que el usuario escribe
  const filteredFrequent = React.useMemo(() => {
    if (!search.trim()) return frequentProducts.slice(0, 8);
    const lowerSearch = search.toLowerCase();
    return frequentProducts
      .filter(p => p.name.toLowerCase().includes(lowerSearch))
      .slice(0, 8);
  }, [search, frequentProducts]);

  const handleAdd = async (name: string, category: string) => {
    try {
      await addItem({
        household_id: householdId,
        name,
        category,
        created_by: userId,
        quantity: 1,
        status: 'pending'
      });
      toast.success(`Agregado: ${name}`);
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
      setSearch("");
    } catch {
      toast.error("Error al agregar el producto");
    }
  };

  const handleAttemptAdd = (name: string, categoryStr?: string) => {
    const category = (categoryStr as CategoryType) || guessCategoryFromName(name);
    const existingPending = items.find(i => i.status === 'pending' && i.name.toLowerCase() === name.trim().toLowerCase());
    
    if (existingPending) {
      setConflictProduct({ name: name.trim(), category, existingItem: existingPending });
    } else {
      handleAdd(name.trim(), category);
    }
  };

  const handleIncreaseQuantity = async () => {
    if (!conflictProduct) return;
    const { existingItem } = conflictProduct;
    try {
      await updateItem({ id: existingItem.id, updates: { quantity: (existingItem.quantity || 1) + 1 } });
      toast.success(`Cantidad aumentada: ${conflictProduct.name}`);
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
    } catch {
      toast.error("Error al actualizar");
    }
    setConflictProduct(null);
    setSearch("");
  };

  const handleUpdate = useCallback(async (id: string, updates: Partial<ShoppingItemType>) => {
    try {
      await updateItem({ id, updates });
      if (updates.status === 'completed') {
         if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([30, 50, 30]);
      }
    } catch {
      toast.error("Error al actualizar");
    }
  }, [updateItem]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteItem(id);
      toast.info("Producto eliminado");
    } catch {
      toast.error("Error al eliminar");
    }
  }, [deleteItem]);

  const pendingItems = useMemo(() => items.filter(i => i.status === 'pending'), [items]);
  const completedItems = useMemo(() => items.filter(i => i.status === 'completed'), [items]);

  const filteredProducts = useMemo(() => {
    if (!search.trim()) return frequentProducts;
    return frequentProducts.filter(p => p.name.toLowerCase().includes(search.trim().toLowerCase()));
  }, [search, frequentProducts]);

  if (isLoading) {
    return (
      <div className="p-4 space-y-4">
         <LoadingSkeleton shape="rect" className="h-20 w-full rounded-2xl" />
         <LoadingSkeleton shape="rect" className="h-20 w-full rounded-2xl" />
         <LoadingSkeleton shape="rect" className="h-20 w-full rounded-2xl" />
      </div>
    );
  }

  return (
    <div className="pb-32 flex flex-col min-h-full">
      <StatsRow 
        pendingCount={pendingItems.length} 
        completedCount={completedItems.length} 
        totalCount={items.length} 
      />

      <div className="flex flex-col gap-8 mt-4">
        {/* PENDING ITEMS */}
        <div>
          <h2 className="text-[15px] font-bold text-text-tertiary uppercase tracking-wider mb-4 px-2">Para comprar hoy ({pendingItems.length})</h2>
          {pendingItems.length === 0 ? (
            <div className="bg-surface/50 border border-dashed border-border rounded-2xl p-6 text-center mx-2">
              <p className="text-text-tertiary text-sm font-medium">La lista está vacía. ¡Toca un rápido abajo para añadirlo!</p>
            </div>
          ) : (
            <AnimatePresence initial={false}>
              {pendingItems.map(item => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  layout
                >
                  <ShoppingItem 
                    item={item} 
                    onUpdate={handleUpdate} 
                    onDelete={handleDelete}
                    availableProfiles={availableProfiles} 
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          )}
        </div>

        {/* COMPLETED ITEMS */}
        {completedItems.length > 0 && (
          <div>
            <h2 className="text-[15px] font-bold text-text-tertiary uppercase tracking-wider mb-4 px-2">Comprados ({completedItems.length})</h2>
            <AnimatePresence initial={false}>
              {completedItems.map(item => (
                <motion.div
                  key={item.id}
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.2 }}
                  layout
                >
                  <ShoppingItem 
                    item={item} 
                    onUpdate={handleUpdate} 
                    onDelete={handleDelete}
                    availableProfiles={availableProfiles} 
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>

      {/* FIXED BOTTOM BAR */}
      <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+64px)] w-full max-w-md mx-auto left-0 right-0 z-20 bg-background/95 backdrop-blur-xl border-t border-border px-4 py-3 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
        
        {/* Horizontal Chips */}
        {!isGridOpen && filteredFrequent.length > 0 && (
          <div className="flex overflow-x-auto gap-2 mb-3 pb-1 scrollbar-hide -mx-2 px-2">
            {filteredFrequent.map(prod => {
              const isPending = pendingItems.some(i => i.name.toLowerCase() === prod.name.toLowerCase());
              const catInfo = CATEGORIES[prod.category as CategoryType] || CATEGORIES['otros'];
              const Icon = catInfo.icon;
              return (
                <button 
                  key={prod.name}
                  onClick={() => handleAttemptAdd(prod.name, prod.category)} 
                  className={`shrink-0 px-4 py-2 rounded-full border border-border/50 flex items-center gap-2 transition-transform active:scale-95 ${isPending ? 'bg-surface/50 opacity-50' : 'bg-surface shadow-sm'}`}
                  disabled={isPending}
                >
                  <span className="text-lg flex items-center justify-center w-4 h-4"><Icon size={16} /></span>
                  <span className="text-sm font-semibold">{prod.name}</span>
                </button>
              );
            })}
          </div>
        )}

        {/* Input Row */}
        <div className="flex gap-2 items-center">
          <button 
            onClick={() => setIsGridOpen(true)} 
            className="w-12 h-12 shrink-0 bg-primary/10 hover:bg-primary/20 text-primary rounded-2xl flex items-center justify-center transition-colors active:scale-95"
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" rx="1"></rect>
              <rect x="14" y="3" width="7" height="7" rx="1"></rect>
              <rect x="14" y="14" width="7" height="7" rx="1"></rect>
              <rect x="3" y="14" width="7" height="7" rx="1"></rect>
            </svg>
          </button>
          
          <form 
            onSubmit={e => { 
              e.preventDefault(); 
              if(search.trim()) { 
                handleAttemptAdd(search); 
              } 
            }} 
            className="flex-1 relative"
          >
            <input 
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Escribe un producto..."
              className="w-full h-12 bg-surface rounded-2xl pl-4 pr-12 text-[15px] focus:outline-none focus:ring-2 focus:ring-primary/50 border border-border/50 shadow-sm"
            />
            {search.trim() ? (
              <button 
                type="submit" 
                className="absolute right-1 top-1 w-10 h-10 bg-primary rounded-xl text-white flex items-center justify-center transition-transform active:scale-90"
              >
                <Plus size={20} strokeWidth={3} />
              </button>
            ) : (
              <button 
                type="button" 
                className="absolute right-1 top-1 w-10 h-10 text-text-tertiary flex items-center justify-center pointer-events-none"
              >
                <Plus size={20} />
              </button>
            )}
          </form>
        </div>
      </div>

      {/* BOTTOM SHEET: GRID MODE */}
      <AnimatePresence>
        {isGridOpen && (
          <motion.div 
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed inset-0 z-50 bg-background flex flex-col"
          >
            <div className="pt-safe flex-1 flex flex-col">
              <div className="flex items-center justify-between p-4 border-b border-border/50 bg-background/90 backdrop-blur-md sticky top-0 z-10">
                <h2 className="text-xl font-bold text-text-primary">Frecuentes</h2>
                <button 
                  onClick={() => setIsGridOpen(false)}
                  className="w-10 h-10 bg-surface rounded-full flex items-center justify-center text-text-secondary active:scale-90 transition-transform"
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 6 6 18"/><path d="m6 6 12 12"/></svg>
                </button>
              </div>
              
              <div className="flex-1 overflow-y-auto p-4 pb-32">
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-4">
                  {frequentProducts.map((prod) => {
                    const catInfo = CATEGORIES[prod.category as CategoryType] || CATEGORIES['otros'];
                    const Icon = catInfo.icon;
                    const isPending = pendingItems.some(i => i.name.toLowerCase() === prod.name.toLowerCase());

                    return (
                      <button
                        key={prod.name}
                        onClick={() => handleAttemptAdd(prod.name, prod.category)}
                        className="flex flex-col items-center gap-3 active:scale-90 transition-transform group"
                      >
                        <div className={`w-20 h-20 rounded-[24px] flex items-center justify-center ${catInfo.bgColor} ${catInfo.color} group-hover:scale-105 transition-transform shadow-sm relative overflow-hidden ${isPending ? 'opacity-40 grayscale-[80%]' : ''}`}>
                          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <Icon size={34} strokeWidth={2} />
                          {isPending && (
                            <div className="absolute top-1 right-1 w-6 h-6 bg-green-500 rounded-full border-2 border-surface flex items-center justify-center shadow-sm">
                              <svg width="12" height="12" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                                 <path d="M8.33333 2.5L3.75 7.08333L1.66667 5" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
                              </svg>
                            </div>
                          )}
                        </div>
                        <span className={`text-[13px] font-semibold text-center leading-tight line-clamp-2 ${isPending ? 'text-text-tertiary' : 'text-text-primary'}`}>
                          {prod.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <Modal 
        isOpen={!!conflictProduct} 
        onClose={() => setConflictProduct(null)}
        title="⚠️ Producto ya en la lista"
      >
        <div className="flex flex-col space-y-6 pt-2">
          <p className="text-text-secondary text-[16px] leading-relaxed">
             Alguien ya añadió <strong>{conflictProduct?.name}</strong> a la lista para comprar hoy.
          </p>
          <div className="bg-surface-hover rounded-xl p-4 flex justify-between items-center border border-border/50">
             <span className="font-medium text-text-primary">{conflictProduct?.name}</span>
             <span className="text-text-tertiary text-sm">Cant: {conflictProduct?.existingItem?.quantity || 1}</span>
          </div>
          <div className="flex flex-col gap-3 pt-2">
            <Button 
              onClick={handleIncreaseQuantity}
              variant="primary"
              className="w-full rounded-2xl h-12 text-[16px] font-semibold"
            >
              ➕ Añadir otra unidad ({(conflictProduct?.existingItem?.quantity || 1) + 1})
            </Button>
            <Button 
              onClick={() => setConflictProduct(null)}
              variant="secondary"
              className="w-full rounded-2xl h-12 text-[16px] font-semibold"
            >
              ❌ No, ya es suficiente
            </Button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
