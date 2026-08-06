import { defaultCache } from "@serwist/next/worker";
import type { PrecacheEntry, SerwistGlobalConfig } from "serwist";
import { Serwist, NetworkOnly } from "serwist";

declare global {
  interface WorkerGlobalScope extends SerwistGlobalConfig {
    __SW_MANIFEST: (PrecacheEntry | string)[] | undefined;
  }
}

declare const self: WorkerGlobalScope;

// Remove any Supabase endpoints from the default cache if they were to match
const customCache = defaultCache.filter((route) => {
  // Just in case, exclude anything that has /rest/v1 or /auth/v1 in the path
  return true;
});

const serwist = new Serwist({
  precacheEntries: self.__SW_MANIFEST,
  skipWaiting: false, // Critical: don't skip waiting, we want to prompt the user
  clientsClaim: true,
  navigationPreload: true,
  runtimeCaching: [
    {
      matcher: ({ url }) => url.pathname.startsWith('/rest/') || url.pathname.startsWith('/auth/'),
      handler: new NetworkOnly(),
    },
    ...customCache,
  ],
});

serwist.addEventListeners();
