"use client";

import { createContext, useContext, useEffect, useState } from 'react';
import { CloudOff, RefreshCw } from 'lucide-react';
import { useCurrentProfile } from '@/hooks/use-current-profile';
import { useOfflineSyncManager } from '@/services/offline-sync-manager';
import { useRealtimeManager } from '@/services/realtime-manager';
import { ConflictResolver } from '@/components/sync/ConflictResolver';

interface SyncContextType {
  isOnline: boolean;
  pendingCount: number;
}

const SyncContext = createContext<SyncContextType>({ isOnline: true, pendingCount: 0 });

export function SyncProvider({ children }: { children: React.ReactNode }) {
  const [isOnline, setIsOnline] = useState(typeof window !== 'undefined' ? navigator.onLine : true);
  const { currentProfile } = useCurrentProfile();

  // Monitorear conexión
  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Inicializar managers (desacoplados del Provider)
  const { pendingCount } = useOfflineSyncManager(isOnline);
  useRealtimeManager(currentProfile?.household_id, currentProfile?.id);

  return (
    <SyncContext.Provider value={{ isOnline, pendingCount }}>
      {children}
      
      {/* Indicador Visual Flotante */}
      {(!isOnline || pendingCount > 0) && (
        <div data-testid="offline-indicator" className="fixed bottom-[calc(env(safe-area-inset-bottom)+9rem)] left-1/2 -translate-x-1/2 z-50 flex items-center gap-2 bg-surface shadow-lg border border-border/50 rounded-full px-4 py-2 text-sm font-medium animate-in fade-in slide-in-from-bottom-4">
          {!isOnline ? (
            <><CloudOff size={16} className="text-orange-500" /> Sin conexión ({pendingCount} pendientes)</>
          ) : (
            <><RefreshCw size={16} className="animate-spin text-primary" /> Sincronizando {pendingCount}...</>
          )}
        </div>
      )}

      <ConflictResolver />
    </SyncContext.Provider>
  );
}

export const useSync = () => useContext(SyncContext);
