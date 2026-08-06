"use client";

import { useEffect } from "react";
import { toast } from "sonner";
import { Serwist } from "@serwist/window";

export function SWUpdater() {
  useEffect(() => {
    if (
      typeof window !== "undefined" &&
      "serviceWorker" in navigator &&
      window.workbox === undefined
    ) {
      const serwist = new Serwist("/sw.js", { scope: "/", type: "classic" });
      
      // Prevent multiple registrations in dev/HMR by attaching it to window
      window.workbox = serwist;

      serwist.addEventListener("waiting", () => {
        toast("¡Hay una nueva versión disponible!", {
          description: "Toca para recargar y ver los últimos cambios.",
          action: {
            label: "Actualizar",
            onClick: () => {
              serwist.messageSW({ type: "SKIP_WAITING" });
            },
          },
          duration: Infinity, // No desaparece hasta que tocas
        });
      });

      serwist.addEventListener("controlling", () => {
        window.location.reload();
      });

      serwist.register().catch((err) => {
        console.error("SW Registration Failed:", err);
      });
    }
  }, []);

  return null;
}

// Para evitar errores TS si window.workbox no está tipado
declare global {
  interface Window {
    workbox?: Serwist;
  }
}
