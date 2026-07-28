"use client";

import React from 'react';
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { ShoppingItem } from "./ShoppingItem";
import { EmptyState } from "./EmptyState";
import { QuickInput } from "./QuickInput";
import { useShoppingList, ShoppingItem as ShoppingItemType } from "../hooks/use-shopping-list";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";

interface ShoppingListProps {
  householdId: string;
  userId: string;
}

export function ShoppingList({ householdId, userId }: ShoppingListProps) {
  const { items, isLoading, addItem, updateItem, deleteItem } = useShoppingList(householdId);

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
      // Vibración sutil en móviles si está soportado
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
    } catch {
      toast.error("Error al agregar el producto");
    }
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
    <div className="pb-32 overflow-x-hidden">
      {items.length === 0 ? (
        <EmptyState />
      ) : (
        <div className="px-6 mt-4">
          {pendingItems.length > 0 && (
            <div className="mb-8">
              <h2 className="text-[17px] font-bold text-text-primary mb-3">Por comprar ({pendingItems.length})</h2>
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
            </div>
          )}

          {completedItems.length > 0 && (
            <div>
              <h2 className="text-[17px] font-bold text-text-primary mb-3">Comprados ({completedItems.length})</h2>
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
      
      <QuickInput householdId={householdId} onAdd={handleAdd} />
    </div>
  );
}
