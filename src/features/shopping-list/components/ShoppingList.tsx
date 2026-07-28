"use client";

import React, { useMemo } from 'react';
import { toast } from "sonner";
import { AnimatePresence, motion } from "framer-motion";
import { Section } from "@/components/layout/Section";
import { ShoppingItem } from "./ShoppingItem";
import { EmptyState } from "./EmptyState";
import { QuickInput } from "./QuickInput";
import { CategoryGroup } from "./CategoryGroup";
import { useShoppingList, ShoppingItem as ShoppingItemType } from "../hooks/use-shopping-list";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { CATEGORY_ORDER, CategoryType } from "../constants";

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
    } catch (error) {
      toast.error("Error al agregar el producto");
    }
  };

  const handleUpdate = async (id: string, updates: any) => {
    try {
      await updateItem({ id, updates });
      if (updates.status === 'completed') {
         if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([30, 50, 30]);
      }
    } catch (error) {
      toast.error("Error al actualizar");
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteItem(id);
      toast.info("Producto eliminado");
    } catch (error) {
      toast.error("Error al eliminar");
    }
  };

  // Group pending items by category
  const groupedPendingItems = useMemo(() => {
    const pendingItems = items.filter(i => i.status === 'pending');
    
    // Create an object with arrays for each category
    const grouped = pendingItems.reduce((acc, item) => {
      const cat = item.category || 'otros';
      if (!acc[cat]) acc[cat] = [];
      acc[cat].push(item);
      return acc;
    }, {} as Record<string, ShoppingItemType[]>);
    
    // Create an array of groups sorted by CATEGORY_ORDER
    const orderedGroups = CATEGORY_ORDER.map(cat => ({
      category: cat,
      items: grouped[cat] || []
    })).filter(group => group.items.length > 0);
    
    // Add any unknown categories at the end (shouldn't happen with the constraint, but just in case)
    Object.keys(grouped).forEach(cat => {
      if (!CATEGORY_ORDER.includes(cat as CategoryType)) {
        orderedGroups.push({
          category: cat as CategoryType,
          items: grouped[cat]
        });
      }
    });

    return orderedGroups;
  }, [items]);

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
        <>
          <div className="pt-2">
            {groupedPendingItems.map((group) => (
              <CategoryGroup
                key={group.category}
                category={group.category}
                items={group.items}
                onUpdate={handleUpdate}
                onDelete={handleDelete}
              />
            ))}
          </div>

          {completedItems.length > 0 && (
            <Section title={`Completados (${completedItems.length})`}>
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
            </Section>
          )}
        </>
      )}
      
      <QuickInput householdId={householdId} onAdd={handleAdd} />
    </div>
  );
}
