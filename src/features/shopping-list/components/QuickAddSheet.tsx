"use client";

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, X } from 'lucide-react';
import { Input } from "@/components/ui/Input";
import { IconButton } from "@/components/ui/IconButton";
import { useFrequentProducts } from '../hooks/use-frequent-products';
import { CATEGORIES, CategoryType, guessCategoryFromName } from '../constants';

interface QuickAddSheetProps {
  householdId: string;
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, category: CategoryType) => void;
}

export function QuickAddSheet({ householdId, isOpen, onClose, onAdd }: QuickAddSheetProps) {
  const [search, setSearch] = useState("");
  const { data: frequentProducts = [] } = useFrequentProducts(householdId);

  // Filter products
  const filteredProducts = useMemo(() => {
    if (!search.trim()) return frequentProducts;
    return frequentProducts.filter(p => p.name.toLowerCase().includes(search.trim().toLowerCase()));
  }, [search, frequentProducts]);

  const handleAdd = (name: string, categoryStr?: string) => {
    const cat = (categoryStr as CategoryType) || guessCategoryFromName(name);
    onAdd(name, cat);
    if (search.trim()) {
      setSearch("");
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />

          {/* Sheet */}
          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 25, stiffness: 200 }}
            className="fixed bottom-0 left-0 right-0 h-[85vh] bg-surface rounded-t-[32px] z-[101] flex flex-col shadow-[0_-10px_40px_rgba(0,0,0,0.1)]"
          >
            {/* Handle / Header */}
            <div className="flex flex-col items-center pt-3 pb-3 shrink-0 border-b border-border/50">
              <div className="w-12 h-1.5 bg-gray-300 rounded-full mb-4" />
              <div className="w-full px-4 flex gap-3 items-center">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <Input
                    autoFocus
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                    placeholder="Buscar o agregar nuevo..."
                    className="pl-11 h-14 bg-surface-hover border-none focus:ring-0 rounded-2xl w-full text-[16px] shadow-inner"
                  />
                  {search && (
                    <button 
                      onClick={() => setSearch("")}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 p-1.5 bg-gray-200/50 rounded-full hover:bg-gray-200"
                    >
                      <X size={14} />
                    </button>
                  )}
                </div>
                <IconButton onClick={onClose} variant="ghost" className="shrink-0 h-14 w-14 rounded-2xl bg-surface-hover">
                   <X size={24} />
                </IconButton>
              </div>
            </div>

            {/* Content (Grid or Add New) */}
            <div className="flex-1 overflow-y-auto p-5 pb-[calc(env(safe-area-inset-bottom)+2rem)]">
              {search.trim() && filteredProducts.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-center space-y-5 animate-in fade-in zoom-in duration-300">
                  <div className="w-20 h-20 bg-primary/10 text-primary rounded-full flex items-center justify-center mb-2">
                     <Plus size={40} />
                  </div>
                  <p className="text-gray-500 font-medium">No se encontró "{search}"</p>
                  <button
                    onClick={() => handleAdd(search.trim())}
                    className="bg-primary text-white px-8 py-4 rounded-2xl font-semibold shadow-lg shadow-primary/30 flex items-center gap-2 active:scale-95 transition-transform"
                  >
                    Agregar como nuevo
                  </button>
                </div>
              ) : (
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-y-7 gap-x-3">
                  {search.trim() && filteredProducts.length > 0 && (
                     <button
                        onClick={() => handleAdd(search.trim())}
                        className="col-span-full mb-2 bg-primary/10 text-primary px-5 py-4 rounded-2xl font-semibold flex items-center gap-2 active:scale-95 transition-transform justify-center shadow-sm"
                      >
                        <Plus size={20} />
                        Agregar "{search.trim()}"
                      </button>
                  )}
                  {filteredProducts.map((prod) => {
                    const catInfo = CATEGORIES[prod.category as CategoryType] || CATEGORIES['otros'];
                    const Icon = catInfo.icon;
                    return (
                      <button
                        key={prod.name}
                        onClick={() => handleAdd(prod.name, prod.category)}
                        className="flex flex-col items-center gap-2.5 active:scale-90 transition-transform group"
                      >
                        <div className={`w-16 h-16 rounded-[20px] flex items-center justify-center ${catInfo.bgColor} ${catInfo.color} group-hover:scale-105 transition-transform shadow-sm relative overflow-hidden`}>
                          <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                          <Icon size={28} strokeWidth={2} />
                        </div>
                        <span className="text-[12px] font-medium text-center text-text-primary leading-tight line-clamp-2">
                          {prod.name}
                        </span>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
