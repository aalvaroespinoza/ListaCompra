# Components

Contiene todos los componentes de React que son genéricos y reutilizables en toda la aplicación.
NO deben contener lógica de negocio específica ni llamadas directas a servicios o base de datos.

- `/ui`: Componentes base (Botones, Inputs, Modales, etc.), usualmente los componentes de tu sistema de diseño (shadcn/ui u otros).
- `/layout`: Componentes estructurales de la página (Header, Footer, Sidebar, Navigation).
- `/shared`: Componentes compuestos más complejos que se reutilizan en distintas partes de la app, pero que siguen siendo agnósticos al dominio de negocio específico.
