"use client";

import { CATEGORIES, CategoryType } from "../constants";
import { BottomSheet } from "@/components/ui/BottomSheet";
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
    <BottomSheet isOpen={isOpen} onClose={onClose} title="Frecuentes">
      <div className="p-4 pb-32">
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
    </BottomSheet>
  );
}
