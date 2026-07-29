"use client";

import React, { useState } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { Check, Plus, Edit2, Trash2, Minus } from 'lucide-react';
import { ShoppingItem as ItemType } from '../hooks/use-shopping-list';
import { getCategoryIcon } from '../utils/category-icons';
import { Avatar } from '@/components/ui/Avatar';
import { formatDateRelative } from '@/utils/dates';
import { Profile } from '@/types/supabase';

interface ShoppingItemProps {
  item: ItemType;
  onUpdate: (id: string, updates: Partial<ItemType>) => void;
  onDelete: (id: string) => void;
  availableProfiles: Profile[];
}

export const ShoppingItem = React.memo(function ShoppingItem({ item, onUpdate, onDelete, availableProfiles }: ShoppingItemProps) {
  const controls = useAnimation();
  const [isEditingQuantity, setIsEditingQuantity] = useState(false);
  const [quantityStr, setQuantityStr] = useState(item.quantity.toString());

  // Efecto háptico simulado (vibra en móviles compatibles al hacer snap)
  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleDragEnd = (e: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
    const threshold = 60; // Píxeles para activar menú
    
    if (info.offset.x > threshold) {
      // Swipe hacia la derecha: Marcar / +1
      controls.start({ x: 130 });
      triggerHaptic();
    } else if (info.offset.x < -threshold) {
      // Swipe hacia la izquierda: Editar / Eliminar
      controls.start({ x: -130 });
      triggerHaptic();
    } else {
      // Regresa al centro
      controls.start({ x: 0 });
    }
  };

  const closeMenu = () => {
    controls.start({ x: 0 });
  };

  const handleComplete = () => {
    onUpdate(item.id, { 
      status: item.status === 'completed' ? 'pending' : 'completed',
      purchased_at: item.status === 'pending' ? new Date().toISOString() : null
    });
    closeMenu();
  };

  const handleAddOne = () => {
    onUpdate(item.id, { quantity: Number(item.quantity) + 1 });
    closeMenu();
  };

  const handleMinusOne = () => {
    if (Number(item.quantity) > 1) {
      onUpdate(item.id, { quantity: Number(item.quantity) - 1 });
    }
    closeMenu();
  };

  const handleDelete = () => {
    onDelete(item.id);
    closeMenu();
  };

  // Manejo de cantidad manual
  const submitQuantity = () => {
    const num = Number(quantityStr);
    if (!isNaN(num) && num > 0) {
      onUpdate(item.id, { quantity: num });
    } else {
      setQuantityStr(item.quantity.toString()); // Revertir si es inválido
    }
    setIsEditingQuantity(false);
  };

  return (
    <div className="relative w-full mb-3 rounded-2xl bg-surface-active overflow-hidden">
      {/* CAPA TRASERA: Botones de Acción */}
      <div className="absolute inset-0 flex justify-between items-center px-4">
        {/* Lado Izquierdo (Aparecen al hacer swipe a la derecha) */}
        <div className="flex gap-2">
          <button 
            onClick={handleComplete} 
            className={`p-3 rounded-full text-white transition-colors ${item.status === 'completed' ? 'bg-text-secondary' : 'bg-success'}`}
          >
            <Check size={20} />
          </button>
          <button onClick={handleAddOne} className="p-3 rounded-full bg-primary text-white">
            <Plus size={20} />
          </button>
        </div>

        {/* Lado Derecho (Aparecen al hacer swipe a la izquierda) */}
        <div className="flex gap-2">
          <button onClick={() => setIsEditingQuantity(true)} className="p-3 rounded-full bg-warning text-white">
            <Edit2 size={20} />
          </button>
          <button onClick={handleDelete} className="p-3 rounded-full bg-danger text-white">
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      {/* CAPA FRONTAL: Tarjeta del producto */}
      <motion.div
        drag="x"
        dragConstraints={{ left: 0, right: 0 }}
        dragElastic={0.2}
        onDragEnd={handleDragEnd}
        animate={controls}
        initial={{ x: 0 }}
        className={`relative z-10 w-full h-full p-4 bg-surface rounded-2xl border border-border flex items-center justify-between shadow-sm
          ${item.status === 'completed' ? 'opacity-80 bg-surface-hover' : ''}
        `}
      >
        <div className="flex items-center gap-4 overflow-hidden">
          {/* Indicador Visual: Círculo de Check + Emoji Badge */}
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
          
          <div className="flex flex-col truncate justify-center min-w-0">
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
              <div className="shrink-0 flex items-center gap-2">
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
          <div className="shrink-0 flex items-center gap-1 bg-background rounded-xl p-1 ml-2 border border-border">
            {isEditingQuantity ? (
              <input 
                autoFocus
                type="text"
                pattern="[0-9]*"
                inputMode="numeric"
                value={quantityStr}
                onChange={(e) => setQuantityStr(e.target.value)}
                onBlur={submitQuantity}
                onKeyDown={(e) => e.key === 'Enter' && submitQuantity()}
                className="w-12 bg-transparent text-[16px] text-center font-bold focus:outline-none text-primary"
              />
            ) : (
              <>
                <button 
                  onClick={handleMinusOne}
                  disabled={item.quantity <= 1}
                  className="w-9 h-9 flex items-center justify-center text-text-secondary disabled:opacity-30 rounded-lg hover:bg-surface-active active:bg-surface-hover transition-colors active:scale-95"
                >
                  <Minus size={18} />
                </button>
                <span 
                  onClick={() => setIsEditingQuantity(true)} 
                  className="min-w-[1.5rem] text-center font-bold text-text-primary px-1 cursor-pointer active:scale-95 transition-transform"
                >
                  {item.quantity}
                </span>
                <button 
                  onClick={handleAddOne}
                  className="w-9 h-9 flex items-center justify-center text-primary rounded-lg hover:bg-primary/10 active:bg-primary/20 transition-colors active:scale-95"
                >
                  <Plus size={18} />
                </button>
              </>
            )}
          </div>
        )}
      </motion.div>
    </div>
  );
});
