"use client";

import React, { useState, useMemo } from 'react';
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { Plus } from "lucide-react";
import { ShoppingItem } from "./ShoppingItem";
import { useShoppingList, ShoppingItem as ShoppingItemType } from "../hooks/use-shopping-list";
import { useFrequentProducts } from "../hooks/use-frequent-products";
import { CATEGORIES, CategoryType, guessCategoryFromName } from "../constants";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { SearchInput } from "@/components/ui/SearchInput";
import { Modal } from "@/components/ui/Modal";
import { Button } from "@/components/ui/Button";

interface ShoppingListProps {
  householdId: string;
  userId: string;
}

export function ShoppingList({ householdId, userId }: ShoppingListProps) {
  const { items, isLoading, addItem, updateItem, deleteItem } = useShoppingList(householdId);
  const { data: frequentProducts = [] } = useFrequentProducts(householdId);

  const [search, setSearch] = useState("");
  const [conflictProduct, setConflictProduct] = useState<{name: string, category: string, existingItem: ShoppingItemType} | null>(null);

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

  const handleUpdate = async (id: string, updates: Partial<ShoppingItemType>) => {
    try {
      await updateItem({ id, updates });
      if (updates.status === 'completed') {
         if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([30, 50, 30]);
      }
    } catch {
      toast.error("Error al actualizar");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteItem(id);
      toast.info("Producto eliminado");
    } catch {
      toast.error("Error al eliminar");
    }
  };

  const pendingItems = items.filter(i => i.status === 'pending');
  const completedItems = items.filter(i => i.status === 'completed');

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
    <div className="pb-32 overflow-x-hidden flex flex-col min-h-full">
      <div className="px-6 mb-6 sticky top-0 z-10 bg-background/80 backdrop-blur-md pt-2 pb-2">
        <SearchInput 
          value={search} 
          onChange={setSearch} 
          onClear={() => setSearch("")} 
          placeholder="Buscar producto (si no está abajo)"
          className="shadow-sm border border-border/50 bg-surface"
        />
      </div>

      {search.trim() ? (
        <div className="px-6 animate-in fade-in duration-200">
          <h2 className="text-[15px] font-bold text-text-tertiary uppercase tracking-wider mb-4">Resultados</h2>
          
          {filteredProducts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-5">
              <div className="w-16 h-16 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-2">
                 <Plus size={32} />
              </div>
              <p className="text-text-secondary font-medium">No se encontró &quot;{search}&quot;</p>
              <Button
                onClick={() => handleAttemptAdd(search.trim())}
                className="rounded-2xl shadow-md"
              >
                Agregar como nuevo
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-4 sm:grid-cols-5 gap-y-7 gap-x-3">
              <button
                onClick={() => handleAttemptAdd(search.trim())}
                className="col-span-full mb-2 bg-primary/10 text-primary px-5 py-4 rounded-2xl font-semibold flex items-center gap-2 active:scale-95 transition-transform justify-center shadow-sm"
              >
                <Plus size={20} />
                Agregar &quot;{search.trim()}&quot;
              </button>
              
              {filteredProducts.map((prod) => {
                const catInfo = CATEGORIES[prod.category as CategoryType] || CATEGORIES['otros'];
                const Icon = catInfo.icon;
                const isPending = items.some(i => i.status === 'pending' && i.name.toLowerCase() === prod.name.toLowerCase());

                return (
                  <button
                    key={prod.name}
                    onClick={() => handleAttemptAdd(prod.name, prod.category)}
                    className="flex flex-col items-center gap-2.5 active:scale-90 transition-transform group relative"
                  >
                    <div className={`w-16 h-16 rounded-[20px] flex items-center justify-center ${catInfo.bgColor} ${catInfo.color} group-hover:scale-105 transition-transform shadow-sm relative overflow-hidden`}>
                      <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                      <Icon size={28} strokeWidth={2} />
                    </div>
                    <span className="text-[12px] font-medium text-center text-text-primary leading-tight line-clamp-2">
                      {prod.name}
                    </span>
                    {isPending && (
                       <div className="absolute top-0 right-1 w-4 h-4 bg-primary rounded-full border-2 border-surface flex items-center justify-center shadow-sm">
                          <div className="w-1.5 h-1.5 bg-white rounded-full" />
                       </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>
      ) : (
        <div className="px-6 flex flex-col gap-8">
          <div>
            <h2 className="text-[15px] font-bold text-text-tertiary uppercase tracking-wider mb-4">Para comprar hoy ({pendingItems.length})</h2>
            {pendingItems.length === 0 ? (
               <div className="bg-surface/50 border border-dashed border-border rounded-2xl p-6 text-center">
                 <p className="text-text-tertiary text-sm font-medium">La lista está vacía. ¡Toca un favorito abajo para añadirlo!</p>
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
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            )}
          </div>

          {frequentProducts.length > 0 && (
            <div>
              <h2 className="text-[15px] font-bold text-text-tertiary uppercase tracking-wider mb-4">Tus Favoritos (Tocar para pedir)</h2>
              <div className="grid grid-cols-4 sm:grid-cols-5 gap-y-7 gap-x-3">
                {frequentProducts.map((prod) => {
                  const catInfo = CATEGORIES[prod.category as CategoryType] || CATEGORIES['otros'];
                  const Icon = catInfo.icon;
                  const isPending = pendingItems.some(i => i.name.toLowerCase() === prod.name.toLowerCase());

                  return (
                    <button
                      key={prod.name}
                      onClick={() => handleAttemptAdd(prod.name, prod.category)}
                      className="flex flex-col items-center gap-2.5 active:scale-90 transition-transform group relative"
                    >
                      <div className={`w-16 h-16 rounded-[20px] flex items-center justify-center ${catInfo.bgColor} ${catInfo.color} group-hover:scale-105 transition-transform shadow-sm relative overflow-hidden ${isPending ? 'opacity-50 grayscale-[50%]' : ''}`}>
                        <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                        <Icon size={28} strokeWidth={2} />
                      </div>
                      <span className={`text-[12px] font-medium text-center leading-tight line-clamp-2 ${isPending ? 'text-text-tertiary' : 'text-text-primary'}`}>
                        {prod.name}
                      </span>
                      {isPending && (
                         <div className="absolute top-0 right-1 w-5 h-5 bg-green-500 rounded-full border-2 border-surface flex items-center justify-center shadow-sm">
                            <svg width="10" height="10" viewBox="0 0 10 10" fill="none" xmlns="http://www.w3.org/2000/svg">
                               <path d="M8.33333 2.5L3.75 7.08333L1.66667 5" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                            </svg>
                         </div>
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {completedItems.length > 0 && (
             <div>
               <h2 className="text-[15px] font-bold text-text-tertiary uppercase tracking-wider mb-4">Comprados ({completedItems.length})</h2>
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
                     />
                   </motion.div>
                 ))}
               </AnimatePresence>
             </div>
          )}
        </div>
      )}

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
