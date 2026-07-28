# Hooks

Contiene custom hooks globales que se usan en múltiples partes de la app.
Ejemplos:
- `useMediaQuery`: Para lógica responsiva compleja.
- `useLocalStorage`: Para guardar estado simple en el navegador.

Nota: Si un hook es específico para una feature (ej. `useShoppingList`), debería ir dentro de `src/features/shopping-list/hooks/`.
