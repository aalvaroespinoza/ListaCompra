"use client";

import { QueryClient } from "@tanstack/react-query";
import { PersistQueryClientProvider } from "@tanstack/react-query-persist-client";
import { createAsyncStoragePersister } from "@tanstack/query-async-storage-persister";
import { useState, useMemo } from "react";
import { db } from "@/lib/db";

export function QueryProvider({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 1000 * 60 * 5, // 5 minutes
            gcTime: 1000 * 60 * 60 * 24 * 7, // 7 days (offline cache)
            refetchOnWindowFocus: true, // Útil para móviles al volver a la app
            retry: 1, // Intentar de nuevo 1 vez en caso de error
          },
        },
      })
  );

  const persister = useMemo(
    () =>
      createAsyncStoragePersister({
        storage: {
          getItem: async (key) => {
            const entry = await db.keyValueStore.get(key);
            return entry ? entry.value : null;
          },
          setItem: async (key, value) => {
            await db.keyValueStore.put({ key, value });
          },
          removeItem: async (key) => {
            await db.keyValueStore.delete(key);
          },
        },
      }),
    []
  );

  return (
    <PersistQueryClientProvider
      client={queryClient}
      persistOptions={{ persister }}
    >
      {children}
    </PersistQueryClientProvider>
  );
}
