"use client";

import { AnimatePresence, motion } from "framer-motion";
import { ShoppingItem as ShoppingItemComponent } from "./ShoppingItem";
import type { ShoppingItem } from "../hooks/use-shopping-list";
import type { Profile } from "@/types/supabase";

interface CompletedListProps {
  items: ShoppingItem[];
  availableProfiles: Profile[];
  onUpdate: (id: string, updates: Partial<ShoppingItem>) => void;
  onDelete: (id: string) => void;
}

export function CompletedList({ items, availableProfiles, onUpdate, onDelete }: CompletedListProps) {
  if (items.length === 0) return null;

  return (
    <div>
      <h2 className="text-[15px] font-bold text-text-tertiary uppercase tracking-wider mb-4 px-2">Comprados ({items.length})</h2>
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
              availableProfiles={availableProfiles} 
            />
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}
