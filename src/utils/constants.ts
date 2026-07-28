/**
 * Constantes globales del proyecto.
 * Evita magic strings/numbers en el código.
 */

export const APP_CONFIG = {
  NAME: "ListaCompra",
  MAX_LIST_ITEMS: 200,
} as const;

export const ROUTES = {
  HOME: "/",
  SETTINGS: "/settings",
} as const;
