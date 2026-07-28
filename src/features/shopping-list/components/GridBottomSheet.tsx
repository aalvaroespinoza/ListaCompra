"use client";

import { AnimatePresence, motion } from "framer-motion";
import { CATEGORIES, CategoryType } from "../constants";
import type { ShoppingItem } from "../hooks/use-shopping-list";

interface GridBottomSheetProps {
  isOpen: boolean;
  onClose: () => void;
  frequentProducts: Array<{ name: string; category: string; count?: number }>;
  pendingItems: ShoppingItem[];
  onAttemptAdd: (name: string, category?: string) => void;
}

export function GridBottomSheet({ isOpen, onClose, frequentProducts, pendingItems, onAttemptAdd }: GridBottomSheetProps) {
  return (
    <AnimatePresence>
      {isOpen && (
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
                onClick={onClose}
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
                      onClick={() => onAttemptAdd(prod.name, prod.category)}
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
  );
}
