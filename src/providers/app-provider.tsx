"use client";

import { Toaster } from "sonner";
import { QueryProvider } from "./query-provider";
import { AnonSessionProvider } from "./anon-session-provider";
import { SyncProvider } from "./sync-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AnonSessionProvider>
        <SyncProvider>
          <Toaster position="top-center" richColors />
          {children}
        </SyncProvider>
      </AnonSessionProvider>
    </QueryProvider>
  );
}
