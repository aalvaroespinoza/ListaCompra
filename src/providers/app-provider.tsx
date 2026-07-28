"use client";

import { Toaster } from "sonner";
import { QueryProvider } from "./query-provider";
import { AnonSessionProvider } from "./anon-session-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AnonSessionProvider>
        <Toaster position="top-center" richColors />
        {children}
      </AnonSessionProvider>
    </QueryProvider>
  );
}
