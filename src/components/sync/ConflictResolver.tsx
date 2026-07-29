"use client";

import React from 'react';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/lib/db';
import { shoppingListRepository, ShoppingItem } from '@/repositories/shopping-list-repository';
import { AlertTriangle, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { useQueryClient } from '@tanstack/react-query';

export function ConflictResolver() {
  const conflicts = useLiveQuery(() => db.conflictQueue.toArray());
  const queryClient = useQueryClient();

  if (!conflicts || conflicts.length === 0) return null;

  const currentConflict = conflicts[0];
  const local = currentConflict.local_payload as Partial<ShoppingItem>;
  const server = currentConflict.server_data as ShoppingItem;

  const handleUseMine = async () => {
    try {
      await shoppingListRepository.syncUpdateSafe({
        id: local.id as string,
        quantity: local.quantity !== undefined ? local.quantity : server.quantity,
        status: local.status !== undefined ? local.status : server.status,
        last_known_updated_at: server.updated_at
      }, new Date().toISOString());
      
      if (currentConflict.id) {
        await db.conflictQueue.delete(currentConflict.id);
      }
      toast.success("Conflicto resuelto (tu versión)");
      queryClient.invalidateQueries({ queryKey: ['shopping_list'] });
    } catch (e) {
      toast.error("Error al resolver el conflicto");
    }
  };

  const handleUseServer = async () => {
    try {
      if (currentConflict.id) {
        await db.conflictQueue.delete(currentConflict.id);
      }
      toast.info("Conflicto resuelto (versión del servidor)");
      queryClient.invalidateQueries({ queryKey: ['shopping_list'] });
    } catch (e) {
      toast.error("Error al resolver el conflicto");
    }
  };

  return (
    <div className="fixed bottom-[calc(env(safe-area-inset-bottom)+12rem)] left-4 right-4 bg-surface rounded-2xl shadow-ios border border-warning/50 p-4 z-50 overflow-hidden">
      <div className="flex items-center gap-3 mb-4">
        <div className="bg-warning/20 p-2 rounded-full text-warning">
          <AlertTriangle size={20} />
        </div>
        <div>
          <h4 className="font-bold text-text-primary text-sm">Conflicto de sincronización</h4>
          <p className="text-xs text-text-secondary">Se editó &quot;{server.name}&quot; en otro dispositivo al mismo tiempo.</p>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
        <div className="bg-surface-active p-3 rounded-xl border border-border">
          <p className="font-semibold text-text-primary mb-1">Tu versión</p>
          <p className="text-xs text-text-secondary">
            Estado: {local.status === 'completed' ? 'Completado' : local.status === 'pending' ? 'Pendiente' : (server.status === 'completed' ? 'Completado' : 'Pendiente')}
            <br />
            Cant: {local.quantity ?? server.quantity}
          </p>
          <button onClick={handleUseMine} className="mt-3 w-full py-2 bg-primary text-white rounded-lg text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-transform">
            <Check size={14} /> Usar la mía
          </button>
        </div>
        <div className="bg-background p-3 rounded-xl border border-border">
          <p className="font-semibold text-text-primary mb-1">Servidor</p>
          <p className="text-xs text-text-secondary">
            Estado: {server.status === 'completed' ? 'Completado' : 'Pendiente'}
            <br />
            Cant: {server.quantity}
          </p>
          <button onClick={handleUseServer} className="mt-3 w-full py-2 bg-surface-hover text-text-primary border border-border rounded-lg text-xs font-bold flex items-center justify-center gap-1 active:scale-95 transition-transform">
            <X size={14} /> Descartar
          </button>
        </div>
      </div>
    </div>
  );
}
