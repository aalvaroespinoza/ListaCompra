"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ShoppingItem as ShoppingItemComponent } from "./ShoppingItem";
import type { ShoppingItem } from "../hooks/use-shopping-list";
import type { Profile } from "@/types/supabase";

interface PendingListProps {
  items: ShoppingItem[];
  availableProfiles: Profile[];
  onUpdate: (id: string, updates: Partial<ShoppingItem>) => void;
  onDelete: (id: string) => void;
  onEdit: (item: ShoppingItem) => void;
  'data-testid'?: string;
}

export function PendingList({ items, availableProfiles, onUpdate, onDelete, onEdit, 'data-testid': testId }: PendingListProps) {
  return (
    <div data-testid={testId}>
      <h2 className="text-[15px] font-bold text-text-tertiary uppercase tracking-wider mb-4 px-2">Para comprar hoy ({items.length})</h2>
      {items.length === 0 ? (
        <div className="bg-surface/50 border border-dashed border-border rounded-2xl p-6 text-center mx-2">
          <p className="text-text-tertiary text-sm font-medium">La lista está vacía. ¡Toca un rápido abajo para añadirlo!</p>
        </div>
      ) : (
        <AnimatePresence initial={false}>
          {items.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.2 }}
              layout
            >
              <ShoppingItemComponent 
                item={item} 
                onUpdate={onUpdate} 
                onDelete={onDelete}
                onEdit={onEdit}
                availableProfiles={availableProfiles} 
              />
            </motion.div>
          ))}
        </AnimatePresence>
      )}
    </div>
  );
}
