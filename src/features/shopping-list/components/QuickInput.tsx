"use client";

import React, { useState } from 'react';
import { Plus, Search } from "lucide-react";
import { QuickAddSheet } from './QuickAddSheet';
import { CategoryType } from '../constants';

interface QuickInputProps {
  householdId: string;
  onAdd: (name: string, category: string) => void;
}

export function QuickInput({ householdId, onAdd }: QuickInputProps) {
  const [isSheetOpen, setIsSheetOpen] = useState(false);

  return (
    <>
      <div 
        className="fixed bottom-[5.5rem] w-full max-w-md px-4 z-20"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 5.5rem)" }}
      >
        <button
          onClick={() => setIsSheetOpen(true)}
          className="w-full flex items-center gap-3 bg-surface/80 backdrop-blur-xl p-3 pl-4 rounded-[24px] shadow-[0_8px_30px_rgba(0,0,0,0.12)] border border-white/20 active:scale-[0.98] transition-transform group"
        >
          <div className="bg-primary text-white p-2 rounded-xl group-hover:scale-105 transition-transform">
            <Plus size={24} />
          </div>
          <span className="text-gray-500 font-medium text-[16px]">
            Agregar a la lista...
          </span>
          <Search size={20} className="ml-auto text-gray-400 mr-2" />
        </button>
      </div>

      <QuickAddSheet 
        householdId={householdId}
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        onAdd={onAdd}
      />
    </>
  );
}
