## Plan de Refactorización del Frontend

### Mockup 1: Página de Inicio Pública y Flujo de Autenticación

- [x] **Página de Inicio (Landing Page):**
    - [x] Simplificar la sección de "Hero" para que sea más minimalista y directa.
    - [x] Asegurar que el diseño se alinee con la paleta de colores sobria y la tipografía moderna descrita en el mockup.
    - [x] El CTA principal debe ser claro: "Crear Rifa" (si está logueado) o "Explorar Rifas" (si no lo está).
    - [x] Ajustar lo necesario para asegurar que la web SIEMPRE sea responsive
- [x] **Flujo de Autenticación (Login/Signup):**
    - [x] Refactorizar los formularios de login y signup para que sean más limpios y centrados y colores únicamente de la paleta.
    - [x] Utilizar `AuthForm` como un componente reutilizable para ambos formularios.
    - [x] Asegurar que los mensajes de error sean informativos pero discretos.
    - [x] Mantener la consistencia visual con la página de inicio.

### Mockup 2: Dashboard del Organizador

- [x] **Visión General:**
    - [x] Utilizar tarjetas para mostrar las métricas clave: "Rifas Activas", "Casillas Vendidas" e "Ingresos Potenciales".
- [x] **Listado de Rifas:**
    - [x] Implementar una tabla bien estructurada para las rifas con columnas para "Nombre de la Rifa", "Estado", "Casillas Vendidas/Totales" y "Acciones".
- [x] **Acciones:**
    - [x] Asegurar que los botones de acción ("Crear Nueva Rifa", "Ver Detalles", "Editar", "Finalizar") sean accesibles y distinguibles.
- [x] **Navegación:**
    - [x] Implementar un menú lateral o superior persistente para la navegación principal (Dashboard, Mis Rifas, Perfil, Ajustes).
- [x] **Consistencia Visual:**
    - [x] Mantener la misma paleta de colores y estilo tipográfico de la página de inicio.

### Mockup 3: Tablero de Rifas (100 Casillas)

- [ ] **Codificación de Color:**
    - [ ] Refinar la codificación de colores para los estados de las casillas (Disponible, Reservada, Pagada, Ganadora) para que sea más clara y consistente con el mockup.
- [ ] **Microinteracciones:**
    - [ ] Mejorar las interacciones de hover y click en las casillas para proporcionar una mejor retroalimentación visual.
- [ ] **Feedback Inmediato:**
    - [ ] Asegurar que los cambios de estado de las casillas se reflejen inmediatamente en la interfaz.
- [ ] **Barra de Progreso/Resumen:**
    - [ ] Hacer más prominente el área de resumen que muestra el progreso de la rifa.
- [ ] **Página de Detalles de la Rifa:**
    - [ ] Mejorar el diseño de la página de detalles de la rifa, añadiendo más información sobre la rifa y un botón para "Finalizar Rifa" para el propietario.