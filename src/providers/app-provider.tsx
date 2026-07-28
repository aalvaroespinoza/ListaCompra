"use client";

import { Toaster } from "sonner";
import { QueryProvider } from "./query-provider";
import { AuthProvider } from "./auth-provider";

export function AppProviders({ children }: { children: React.ReactNode }) {
  return (
    <QueryProvider>
      <AuthProvider>
        <Toaster position="top-center" richColors />
        {children}
      </AuthProvider>
    </QueryProvider>
  );
}
