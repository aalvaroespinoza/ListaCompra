# Services

Contiene la capa de llamadas a servicios externos, bases de datos o APIs.
En este proyecto, aquí irán las consultas directas a Supabase (ej. `getItems`, `createItem`), aislando estas llamadas de los componentes de UI.

Se recomienda usar React Query en la capa superior (hooks/features) que consuma estas funciones de servicio puro.
