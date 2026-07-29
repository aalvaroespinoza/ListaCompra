"use client";

import React, { useState, useMemo } from 'react';
import { Plus } from "lucide-react";
import { CATEGORIES, CategoryType } from "../constants";
import type { ShoppingItem } from "../hooks/use-shopping-list";

interface SmartInputBarProps {
  frequentProducts: Array<{ name: string; category: string; count?: number }>;
  pendingItems: ShoppingItem[];
  onAttemptAdd: (name: string, category?: string) => void;
  onOpenGrid: () => void;
}

export function SmartInputBar({ frequentProducts, pendingItems, onAttemptAdd, onOpenGrid }: SmartInputBarProps) {
  const [search, setSearch] = useState("");

  const filteredFrequent = useMemo(() => {
    if (!search.trim()) return frequentProducts.slice(0, 8);
    const lowerSearch = search.toLowerCase();
    return frequentProducts
      .filter(p => p.name.toLowerCase().includes(lowerSearch))
      .slice(0, 8);
  }, [search, frequentProducts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (search.trim()) {
      onAttemptAdd(search);
      setSearch("");
    }
  };

  const handleChipClick = (name: string, category: string) => {
    onAttemptAdd(name, category);
    setSearch("");
  };

  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+64px)] w-full max-w-md mx-auto left-0 right-0 z-20 bg-background/95 backdrop-blur-xl border-t border-border px-4 py-3 shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)]">
      
      {filteredFrequent.length > 0 && (
        <div className="flex overflow-x-auto gap-2 mb-3 pb-1 scrollbar-hide -mx-2 px-2">
          {filteredFrequent.map(prod => {
            const isPending = pendingItems.some(i => i.name.toLowerCase() === prod.name.toLowerCase());
            const catInfo = CATEGORIES[prod.category as CategoryType] || CATEGORIES['otros'];
            const Icon = catInfo.icon;
            return (
              <button 
                key={prod.name}
                onClick={() => handleChipClick(prod.name, prod.category)} 
                className={`shrink-0 px-4 py-2 rounded-full border border-border/50 flex items-center gap-2 transition-transform active:scale-95 ${isPending ? 'bg-surface/50 opacity-50' : 'bg-surface shadow-sm'}`}
                disabled={isPending}
              >
                <span className="text-lg flex items-center justify-center w-4 h-4"><Icon size={16} /></span>
                <span className="text-sm font-semibold leading-none pt-[1px]">{prod.name}</span>
              </button>
            );
          })}
        </div>
      )}

      <div className="flex gap-2 items-center">
        <button 
          onClick={onOpenGrid} 
          className="w-12 h-12 shrink-0 bg-primary/10 hover:bg-primary/20 text-primary rounded-2xl flex items-center justify-center transition-colors active:scale-95"
        >
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7" rx="1"></rect>
            <rect x="14" y="3" width="7" height="7" rx="1"></rect>
            <rect x="14" y="14" width="7" height="7" rx="1"></rect>
            <rect x="3" y="14" width="7" height="7" rx="1"></rect>
          </svg>
        </button>
        
        <form onSubmit={handleSubmit} className="flex-1 relative">
          <input 
            data-testid="smart-input"
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
  );
}
