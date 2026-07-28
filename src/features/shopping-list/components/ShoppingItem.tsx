"use client";

import React, { useRef, useState, useEffect } from 'react';
import { motion, useAnimation, PanInfo } from 'framer-motion';
import { Check, Plus, Edit2, Trash2, Minus } from 'lucide-react';
import { ShoppingItem as ItemType } from '../hooks/use-shopping-list';

interface ShoppingItemProps {
  item: ItemType;
  onUpdate: (id: string, updates: Partial<ItemType>) => void;
  onDelete: (id: string) => void;
}

export function ShoppingItem({ item, onUpdate, onDelete }: ShoppingItemProps) {
  const controls = useAnimation();
  const [isEditingQuantity, setIsEditingQuantity] = useState(false);
  const [quantityStr, setQuantityStr] = useState(item.quantity.toString());

  // Efecto háptico simulado (vibra en móviles compatibles al hacer snap)
  const triggerHaptic = () => {
    if (typeof navigator !== 'undefined' && navigator.vibrate) {
      navigator.vibrate(50);
    }
  };

  const handleDragEnd = (e: any, info: PanInfo) => {
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
        dragElastic={0.4}
        onDragEnd={handleDragEnd}
        animate={controls}
        initial={{ x: 0 }}
        className={`relative z-10 w-full h-full p-4 bg-surface rounded-2xl border border-border flex items-center justify-between shadow-sm
          ${item.status === 'completed' ? 'opacity-60' : ''}
        `}
      >
        <div className="flex items-center gap-3 overflow-hidden">
          {/* Indicador visual simple */}
          <div 
            onClick={handleComplete}
            className={`shrink-0 w-6 h-6 rounded-full border-2 flex items-center justify-center transition-colors
              ${item.status === 'completed' ? 'bg-success border-success' : 'border-text-tertiary'}
            `}
          >
            {item.status === 'completed' && <Check size={14} className="text-white" />}
          </div>
          
          <div className="flex flex-col truncate">
            <span className={`text-base font-medium truncate ${item.status === 'completed' ? 'line-through text-text-secondary' : 'text-text-primary'}`}>
              {item.name}
            </span>
            {item.category && (
              <span className="text-xs text-text-tertiary">{item.category}</span>
            )}
          </div>
        </div>

        {/* Manejo Avanzado de Cantidad (Visible siempre del lado derecho) */}
        <div className="shrink-0 flex items-center gap-1 bg-surface-active rounded-lg p-1 ml-2">
          {isEditingQuantity ? (
            <input 
              autoFocus
              type="number"
              inputMode="numeric"
              value={quantityStr}
              onChange={(e) => setQuantityStr(e.target.value)}
              onBlur={submitQuantity}
              onKeyDown={(e) => e.key === 'Enter' && submitQuantity()}
              className="w-12 bg-transparent text-center font-medium focus:outline-none text-primary"
            />
          ) : (
            <>
              <button 
                onClick={handleMinusOne}
                disabled={item.quantity <= 1}
                className="w-6 h-6 flex items-center justify-center text-text-secondary disabled:opacity-30"
              >
                <Minus size={14} />
              </button>
              <span 
                onClick={() => setIsEditingQuantity(true)} 
                className="min-w-[1.5rem] text-center font-medium text-text-primary px-1"
              >
                {item.quantity}{item.unit ? <span className="text-xs ml-0.5 text-text-tertiary">{item.unit}</span> : ''}
              </span>
              <button 
                onClick={handleAddOne}
                className="w-6 h-6 flex items-center justify-center text-primary"
              >
                <Plus size={14} />
              </button>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}
