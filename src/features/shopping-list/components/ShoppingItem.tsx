"use client";

import React from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { Check, Plus, Trash2, Minus } from 'lucide-react';
import { ShoppingItem as ItemType } from '../hooks/use-shopping-list';
import { getCategoryIcon } from '../utils/category-icons';
import { Avatar } from '@/components/ui/Avatar';
import { formatDateRelative } from '@/utils/dates';
import { Profile } from '@/types/supabase';

interface ShoppingItemProps {
  item: ItemType;
  onUpdate: (id: string, updates: Partial<ItemType>) => void;
  onDelete: (id: string) => void;
  onEdit?: (item: ItemType) => void;
  availableProfiles: Profile[];
}

export const ShoppingItem = React.memo(function ShoppingItem({ item, onUpdate, onDelete, onEdit, availableProfiles }: ShoppingItemProps) {
  const controls = useAnimation();

  // Efecto háptico simulado (vibra en móviles compatibles al hacer snap)
  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleDragEnd = (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 40; // Píxeles para activar menú
    
    if (info.offset.x < -threshold) {
      // Swipe hacia la izquierda: Eliminar
      controls.start({ x: -70 });
      triggerHaptic();
    } else {
      // Regresa al centro
      controls.start({ x: 0 });
    }
  };

  const closeMenu = () => {
    controls.start({ x: 0 });
  };

  const handleComplete = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onUpdate(item.id, { 
      status: item.status === 'completed' ? 'pending' : 'completed',
      purchased_at: item.status === 'pending' ? new Date().toISOString() : null
    });
    closeMenu();
  };

  const handleAddOne = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onUpdate(item.id, { quantity: Number(item.quantity) + 1 });
    closeMenu();
  };

  const handleMinusOne = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    if (Number(item.quantity) > 1) {
      onUpdate(item.id, { quantity: Number(item.quantity) - 1 });
    }
    closeMenu();
  };

  const handleDelete = (e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    onDelete(item.id);
    closeMenu();
  };

  const handleEdit = () => {
    if (onEdit) onEdit(item);
  };

  return (
    <div className="relative w-full mb-3 rounded-2xl bg-danger/10 overflow-hidden">
      {/* CAPA TRASERA: Botones de Acción (Solo Eliminar a la derecha) */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-2">
        <button onClick={handleDelete} className="p-3 w-[62px] flex justify-center items-center rounded-xl bg-danger text-white shadow-sm active:scale-95 transition-transform">
          <Trash2 size={20} />
        </button>
      </div>

      {/* CAPA FRONTAL: Tarjeta del producto */}
      <motion.div
        drag="x"
        dragConstraints={{ left: -70, right: 0 }}
        dragElastic={0.1}
        onDragEnd={handleDragEnd}
        animate={controls}
        initial={{ x: 0 }}
        className={`relative z-10 w-full h-full p-4 bg-surface rounded-2xl border border-border flex items-center justify-between shadow-sm
          ${item.status === 'completed' ? 'opacity-80 bg-surface-hover' : ''}
        `}
      >
        <div className="flex items-center gap-4 overflow-hidden flex-1 cursor-pointer" onClick={handleEdit} role="button">
          {/* Indicador Visual: Círculo de Check */}
          <div className="shrink-0 flex items-center gap-3">
            {item.status === 'completed' ? (
              <div 
                data-testid="item-checkbox"
                onClick={handleComplete}
                className="w-6 h-6 rounded-full bg-success flex items-center justify-center cursor-pointer transition-transform active:scale-95 shadow-sm"
              >
                <Check size={14} className="text-white" strokeWidth={3} />
              </div>
            ) : (
              <div 
                data-testid="item-checkbox"
                onClick={handleComplete}
                className="w-6 h-6 rounded-full border-2 border-border cursor-pointer transition-transform active:scale-95 hover:border-primary/50"
              />
            )}
            
            <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-xl shadow-sm ${item.status === 'completed' ? 'bg-primary/5 grayscale opacity-50' : 'bg-primary/10'}`}>
              {getCategoryIcon(item.name, item.category)}
            </div>
          </div>
          
          <div className="flex flex-col truncate justify-center min-w-0 pr-2">
            <span className={`text-[16px] truncate leading-tight ${item.status === 'completed' ? 'line-through text-success font-medium' : 'text-text-primary font-bold'}`}>
              {item.name}
            </span>
            <span className="text-[13px] text-text-tertiary leading-tight mt-0.5 truncate">
              {item.category ? item.category : 'Otros'} {item.unit ? `• ${item.unit}` : ''}
            </span>
          </div>
        </div>

        {/* Lado Derecho: Avatar (completado) o Stepper (pendiente) */}
        {item.status === 'completed' ? (
          (() => {
            const buyerId = item.updated_by || item.created_by;
            const buyer = availableProfiles.find(p => p.id === buyerId) || availableProfiles[0] || { display_name: 'Usuario', color: '#888' };
            const displayDate = item.purchased_at ? formatDateRelative(item.purchased_at) : 'Hoy';
            return (
              <div className="shrink-0 flex items-center gap-2 pl-2">
                <span className="text-xs text-text-tertiary font-medium">{displayDate}</span>
                <Avatar 
                  src={buyer.avatar_url || undefined}
                  fallback={buyer.display_name} 
                  size="sm" 
                  className="w-7 h-7 shadow-sm"
                  style={{ backgroundColor: buyer.color, color: '#fff' }}
                />
              </div>
            );
          })()
        ) : (
          <div className="shrink-0 flex items-center gap-1 bg-surface-active rounded-xl p-1 ml-2 border border-border shadow-sm">
            <button 
              onClick={handleMinusOne}
              disabled={item.quantity <= 1}
              className="w-8 h-8 flex items-center justify-center text-text-secondary disabled:opacity-30 rounded-lg hover:bg-background active:bg-background transition-colors active:scale-95"
            >
              <Minus size={16} />
            </button>
            <span className="min-w-[1.25rem] text-[15px] text-center font-bold text-text-primary px-1">
              {item.quantity}
            </span>
            <button 
              onClick={handleAddOne}
              className="w-8 h-8 flex items-center justify-center text-primary rounded-lg hover:bg-background active:bg-background transition-colors active:scale-95"
            >
              <Plus size={16} />
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
});
