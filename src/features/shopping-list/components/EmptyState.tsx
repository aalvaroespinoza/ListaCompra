import React from 'react';
import { ShoppingBag } from 'lucide-react';

export function EmptyState() {
  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 text-center mt-10">
      <div className="bg-surface-active p-5 rounded-full mb-5">
        <ShoppingBag size={40} className="text-text-secondary" />
      </div>
      <h3 className="text-xl font-medium text-text-primary mb-2">Tu lista está vacía</h3>
      <p className="text-text-secondary text-base">
        Agrega productos para la próxima compra usando el botón de abajo.
      </p>
    </div>
  );
}
