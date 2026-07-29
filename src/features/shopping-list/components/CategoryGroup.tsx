"use client";

import React from 'react';
import { CATEGORIES, CategoryType } from '../constants';
import { ShoppingItem as ShoppingItemType } from '../hooks/use-shopping-list';
import { ShoppingItem } from './ShoppingItem';
import { motion, AnimatePresence } from 'framer-motion';

import { Profile } from '@/types/supabase';

interface CategoryGroupProps {
  category: string;
  items: ShoppingItemType[];
  onUpdate: (id: string, updates: Partial<ShoppingItemType>) => void;
  onDelete: (id: string) => void;
  availableProfiles: Profile[];
}

export function CategoryGroup({ category, items, onUpdate, onDelete, availableProfiles }: CategoryGroupProps) {
  const catInfo = CATEGORIES[category as CategoryType] || CATEGORIES['otros'];
  const Icon = catInfo.icon;

  if (items.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center gap-2.5 px-4 mb-4">
        <div className={`p-1.5 rounded-[10px] ${catInfo.bgColor} ${catInfo.color}`}>
          <Icon size={18} strokeWidth={2.5} />
        </div>
        <h3 className="font-semibold text-text-primary text-[15px] tracking-tight min-w-0 truncate">
          {catInfo.label}
        </h3>
        <div className="ml-auto bg-surface-hover px-2 py-0.5 rounded-full text-xs font-medium text-text-secondary">
          {items.length}
        </div>
      </div>
      <div className="space-y-0 relative">
        {/* Línea conectora visual para los items de la misma categoría */}
        <div className="absolute left-6 top-2 bottom-4 w-px bg-border/50 -z-10" />
        
        <AnimatePresence initial={false}>
          {items.map(item => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, height: 0, scale: 0.95 }}
              animate={{ opacity: 1, height: 'auto', scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              layout
            >
              <ShoppingItem 
                item={item} 
                onUpdate={onUpdate} 
                onDelete={onDelete} 
                availableProfiles={availableProfiles}
              />
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
}
