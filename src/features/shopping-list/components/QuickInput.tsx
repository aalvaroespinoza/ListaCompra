"use client";

import React, { useState } from 'react';
import { Plus, Mic } from "lucide-react";
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
        className="fixed bottom-[5.5rem] w-full max-w-md px-6 z-20"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 5.5rem)" }}
      >
        <button
          onClick={() => setIsSheetOpen(true)}
          className="w-full flex items-center gap-3 bg-surface p-2 rounded-full shadow-lg border border-border/50 active:scale-[0.98] transition-transform group"
        >
          <div className="bg-primary text-white p-2.5 rounded-full group-hover:scale-105 transition-transform flex items-center justify-center shadow-sm">
            <Plus size={20} strokeWidth={3} />
          </div>
          <span className="text-text-tertiary font-medium text-[16px]">
            ¿Qué necesitas?
          </span>
          <div className="ml-auto pr-2">
            <Mic size={22} className="text-primary" />
          </div>
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
