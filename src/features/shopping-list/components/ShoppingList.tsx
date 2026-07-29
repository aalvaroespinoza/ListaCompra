"use client";

import React, { useState, useMemo, useCallback } from 'react';
import { toast } from "sonner";
import { useShoppingList, ShoppingItem as ShoppingItemType } from "../hooks/use-shopping-list";
import { useFrequentProducts } from "../hooks/use-frequent-products";
import { CategoryType, guessCategoryFromName } from "../constants";
import { LoadingSkeleton } from "@/components/ui/LoadingSkeleton";
import { StatsRow } from "@/components/shared/StatsRow";
import { useCurrentProfile } from "@/hooks/use-current-profile";

import { PendingList } from "./PendingList";
import { CompletedList } from "./CompletedList";
import { SmartInputBar } from "./SmartInputBar";
import { GridBottomSheet } from "./GridBottomSheet";

interface ShoppingListProps {
  householdId: string;
  userId: string;
}

export function ShoppingList({ householdId, userId }: ShoppingListProps) {
  const { items, isLoading, addItem, updateItem, deleteItem } = useShoppingList(householdId);
  const { data: frequentProducts = [] } = useFrequentProducts(householdId);
  const { availableProfiles } = useCurrentProfile();

  const [isGridOpen, setIsGridOpen] = useState(false);

  const handleAdd = async (name: string, category: string) => {
    if (!name.trim()) {
      toast.error("El nombre no puede estar vacío");
      return;
    }
    try {
      await addItem({
        household_id: householdId,
        name,
        category,
        created_by: userId,
        quantity: 1,
        status: 'pending'
      });
      toast.success(navigator.onLine ? `Agregado: ${name}` : `(Offline) Guardado: ${name}`);
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al agregar el producto");
    }
  };

  const handleIncreaseQuantity = async (existingItem: ShoppingItemType) => {
    try {
      await updateItem({ id: existingItem.id, updates: { quantity: (existingItem.quantity || 1) + 1 } });
      toast.success(navigator.onLine ? `+1 a ${existingItem.name}` : `(Offline) +1 a ${existingItem.name}`);
      if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(50);
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al aumentar cantidad");
    }
  };

  const handleAttemptAdd = (name: string, categoryStr?: string) => {
    const category = (categoryStr as CategoryType) || guessCategoryFromName(name);
    const existingPending = items.find(i => i.status === 'pending' && i.name.toLowerCase() === name.trim().toLowerCase());
    
    if (existingPending) {
      handleIncreaseQuantity(existingPending);
    } else {
      handleAdd(name.trim(), category);
    }
  };

  const handleUpdate = useCallback(async (id: string, updates: Partial<ShoppingItemType>) => {
    try {
      await updateItem({ id, updates });
      if (updates.status === 'completed') {
         toast.success(navigator.onLine ? "Marcado como comprado" : "(Offline) Comprado");
         if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate([30, 50, 30]);
      }
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al actualizar el producto");
    }
  }, [updateItem]);

  const handleDelete = useCallback(async (id: string) => {
    try {
      await deleteItem(id);
      toast.info(navigator.onLine ? "Producto eliminado" : "(Offline) Producto eliminado");
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Error al eliminar");
    }
  }, [deleteItem]);

  const pendingItems = useMemo(() => items.filter(i => i.status === 'pending'), [items]);
  const completedItems = useMemo(() => items.filter(i => i.status === 'completed'), [items]);

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
    <div data-testid="shopping-list" className="pb-32 flex flex-col min-h-full">
      <StatsRow 
        pendingCount={pendingItems.length} 
        completedCount={completedItems.length} 
        totalCount={items.length} 
      />

      <div className="flex flex-col gap-8 mt-4">
        <PendingList 
          items={pendingItems} 
          availableProfiles={availableProfiles} 
          onUpdate={handleUpdate} 
          onDelete={handleDelete} 
          data-testid="pending-list"
        />
        <CompletedList 
          items={completedItems} 
          availableProfiles={availableProfiles} 
          onUpdate={handleUpdate} 
          onDelete={handleDelete} 
          data-testid="completed-list"
        />
      </div>

      {!isGridOpen && (
        <SmartInputBar 
          frequentProducts={frequentProducts} 
          pendingItems={pendingItems} 
          onAttemptAdd={handleAttemptAdd} 
          onOpenGrid={() => setIsGridOpen(true)} 
        />
      )}

      <GridBottomSheet 
        isOpen={isGridOpen} 
        onClose={() => setIsGridOpen(false)} 
        frequentProducts={frequentProducts} 
        pendingItems={pendingItems} 
        onAttemptAdd={handleAttemptAdd} 
      />
    </div>
  );
}
