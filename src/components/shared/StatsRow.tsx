import React from "react";
import { ShoppingBag, CheckCircle2, ShoppingCart } from "lucide-react";
import { Card } from "@/components/ui/Card";

export interface StatsRowProps {
  pendingCount: number;
  completedCount: number;
  totalCount: number;
  className?: string;
}

export function StatsRow({ pendingCount, completedCount, totalCount, className }: StatsRowProps) {
  return (
    <div className={`grid grid-cols-3 gap-2 px-4 py-2 mb-2 mt-4 ${className || ''}`}>
      {/* Por Comprar */}
      <Card padding="sm" className="flex flex-col border-border/50 shadow-sm relative overflow-hidden">
        <div className="flex flex-col items-center justify-center gap-1 mb-2 min-h-[2.5rem]">
          <div className="bg-primary/10 p-1 rounded-xl shrink-0">
            <ShoppingBag size={14} className="text-primary" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-text-tertiary leading-none text-center break-words w-full">Por comprar</span>
        </div>
        <div className="mt-auto text-center">
          <p className="text-2xl sm:text-3xl font-bold text-text-primary leading-none tracking-tight">{pendingCount}</p>
          <p className="text-[10px] sm:text-[11px] font-medium text-text-tertiary mt-1">productos</p>
        </div>
      </Card>

      {/* Comprados */}
      <Card padding="sm" className="flex flex-col border-border/50 shadow-sm relative overflow-hidden">
        <div className="flex flex-col items-center justify-center gap-1 mb-2 min-h-[2.5rem]">
          <div className="bg-success/10 p-1 rounded-xl shrink-0">
            <CheckCircle2 size={14} className="text-success" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-text-tertiary leading-none text-center break-words w-full">Comprados</span>
        </div>
        <div className="mt-auto text-center">
          <p className="text-2xl sm:text-3xl font-bold text-text-primary leading-none tracking-tight">{completedCount}</p>
          <p className="text-[10px] sm:text-[11px] font-medium text-text-tertiary mt-1">productos</p>
        </div>
      </Card>

      {/* Total */}
      <Card padding="sm" className="flex flex-col border-border/50 shadow-sm relative overflow-hidden">
        <div className="flex flex-col items-center justify-center gap-1 mb-2 min-h-[2.5rem]">
          <div className="bg-secondary/10 p-1 rounded-xl shrink-0">
            <ShoppingCart size={14} className="text-secondary" />
          </div>
          <span className="text-[10px] sm:text-[11px] font-bold text-text-tertiary leading-none text-center break-words w-full">Total</span>
        </div>
        <div className="mt-auto text-center">
          <p className="text-2xl sm:text-3xl font-bold text-text-primary leading-none tracking-tight">{totalCount}</p>
          <p className="text-[10px] sm:text-[11px] font-medium text-text-tertiary mt-1">productos</p>
        </div>
      </Card>
    </div>
  );
}
