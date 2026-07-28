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
    <div className={`grid grid-cols-3 gap-3 px-6 py-2 mb-2 mt-4 ${className || ''}`}>
      {/* Por Comprar */}
      <Card padding="sm" className="flex flex-col border-border/50 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-primary/10 p-1.5 rounded-xl">
            <ShoppingBag size={16} className="text-primary" />
          </div>
          <span className="text-[11px] font-medium text-text-tertiary">Por comprar</span>
        </div>
        <div className="mt-1">
          <p className="text-3xl font-bold text-text-primary leading-none tracking-tight">{pendingCount}</p>
          <p className="text-[11px] font-medium text-text-tertiary mt-1">productos</p>
        </div>
      </Card>

      {/* Comprados */}
      <Card padding="sm" className="flex flex-col border-border/50 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-success/10 p-1.5 rounded-xl">
            <CheckCircle2 size={16} className="text-success" />
          </div>
          <span className="text-[11px] font-medium text-text-tertiary">Comprados</span>
        </div>
        <div className="mt-1">
          <p className="text-3xl font-bold text-text-primary leading-none tracking-tight">{completedCount}</p>
          <p className="text-[11px] font-medium text-text-tertiary mt-1">productos</p>
        </div>
      </Card>

      {/* Total */}
      <Card padding="sm" className="flex flex-col border-border/50 shadow-sm relative overflow-hidden">
        <div className="flex items-center gap-2 mb-2">
          <div className="bg-secondary/10 p-1.5 rounded-xl">
            <ShoppingCart size={16} className="text-secondary" />
          </div>
          <span className="text-[11px] font-medium text-text-tertiary">Total</span>
        </div>
        <div className="mt-1">
          <p className="text-3xl font-bold text-text-primary leading-none tracking-tight">{totalCount}</p>
          <p className="text-[11px] font-medium text-text-tertiary mt-1">productos</p>
        </div>
      </Card>
    </div>
  );
}
