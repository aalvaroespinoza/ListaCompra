# Features

Esta carpeta contiene la lógica de negocio modularizada (Arquitectura Feature-Sliced Design o modular).
Cada feature encapsula todo lo necesario para su funcionamiento, siendo independiente y exportando sólo lo necesario.

- `/shopping-list`: Manejo de la lista de compras, ítems, categorías, etc.
- `/authentication`: Flujos de login, registro y manejo de sesión.
- `/users`: Perfiles de usuario y gestión familiar.
- `/settings`: Preferencias de la aplicación (modo oscuro, notificaciones).
- `/statistics`: Gráficos o resúmenes de consumo, historial, etc.

Cada feature debe tener idealmente:
- `components/`: Componentes específicos de este feature.
- `hooks/`: Lógica de estado/React Query específica.
- `api/`: Llamadas al servicio/API relevantes al feature.
- `utils/`: Utilidades específicas.
- `types/`: Tipos TypeScript del dominio.
