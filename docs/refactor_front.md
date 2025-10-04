**Agente: UI/UX Master Builder.** Tu rol es actuar como un desarrollador frontend experto y un diseñador UI meticuloso. Debes implementar la nueva paleta de colores adjunta, utilizando **React, Next.js, Radix UI y Tailwind CSS**, para crear una interfaz **cálida, profesional y altamente usable** para la aplicación "Lucky 100 Raffle".

**La Paleta de Colores (Referencia Hexadecimal):**

| Nombre Sugerido | Código HEX | Rol Principal |
| :--- | :--- | :--- |
| **Acento Fuerte (Amaranth Purple)** | `#A4243B` | **Acción/Éxito/Ganador**. Botones primarios, indicadores de estado "pagado" o "winning". |
| **Fondo Base (Ecru)** | `#D8C99B` | **Fondo principal** de todas las páginas (Body). |
| **Barra Principal (Butterscotch)** | `#D8973C` | **Header, Footer y Elementos Estructurales.** |
| **Acento Cálido (Alloy Orange)** | `#BD632F` | Indicadores de estado "Reservado/Advertencia", variantes de botones, ilustraciones. |
| **Primario Oscuro (Charcoal)** | `#273E47` | **Texto de alto contraste**, fondos de modales, bordes, sombras intensas. |

### **Colores Especiales para Estados de Casillas (Relacionados con paleta)**
Para lograr mejor distinción visual y evitar monotonia, se deben usar los siguientes colores específicos para los estados de las casillas, armonizados con la paleta principal:

| Nombre Estado | Código HEX | Uso Específico |
| :--- | :--- | :--- |
| **slot-available** | `#8B9A46` | Verde oliva suave - Combina con Ecru y Butterscotch |
| **slot-paid** | `#5D7CA6` | Azul grisáceo - Combina con Charcoal |
| **slot-reserved** | `#C17D4E` | Terracota - Combina con Alloy Orange y Butterscotch |
| **slot-winning** | `#E6B422` | Dorado cálido - Combina con Butterscotch |
| **slot-losing** | `#7A6B5D` | Gris terroso - Combina con Ecru y Charcoal |

#### **1. Asignación de Roles de Color en la Interfaz (Tailwind Implementation)**

El agente debe mapear esta paleta y seguir las reglas específicas de estructura para la aplicación.

| Elemento de UI | Regla Específica / Color Base (HEX) | Clase de Tailwind Sugerida |
| :--- | :--- | :--- |
| **Fondo Global de Páginas (Body)** | **Regla Fija: `#D8C99B` (Ecru)** | `bg-fondo-base` |
| **Header Bar & Footer** | **Regla Fija: `#D8973C` (Butterscotch)** | `bg-barra-principal` |
| **Contenedores/Tarjetas** | `#D8C99B` (Ecru) o un blanco muy sutil. | `bg-fondo-base` o `bg-white/90` |
| **Texto Principal/Encabezados** | `#273E47` (Charcoal) | `text-primario-oscuro` |
| **Botones de Acción (Primario)** | `#A4243B` (Amaranth Purple) | `bg-acento-fuerte` (con `hover:bg-acento-fuerte/90`) |
| **Texto en Barras (Header/Footer)**| `#273E47` (Charcoal) o Blanco para alto contraste. | `text-primario-oscuro` o `text-white` |
| **Indicador 'Ganador'** | `#E6B422` (Dorado cálido) | `bg-slot-winning` (con efecto de pulso) |
| **Indicador 'Pagado'** | `#5D7CA6` (Azul grisáceo) | `bg-slot-paid` |
| **Indicador 'Disponible'** | `#8B9A46` (Verde oliva) | `bg-slot-available` |
| **Indicador 'Reservado'** | `#C17D4E` (Terracota) | `bg-slot-reserved` |
| **Indicador 'Perdedor'** | `#7A6B5D` (Gris terroso) | `bg-slot-losing` |

#### **2. Tipografía y Jerarquía Visual**

El agente debe usar una tipografía que complemente la calidez de la paleta (serifas modernas o sans-serif con personalidad, como Lora o Montserrat) y aplicar la siguiente jerarquía:

| Elemento | Tamaño (Ej. en rem) | Peso (Font Weight) | Color |
| :--- | :--- | :--- | :--- |
| **Título Principal (H1 - Dashboard)** | 2.5rem - 3rem | Bold (700) | `#273E47` (Charcoal) |
| **Encabezados de Sección (H2)** | 1.8rem - 2rem | Semibold (600) | `#273E47` (Charcoal) |
| **Texto de Cuerpo Principal (Párrafos)**| 1rem - 1.125rem | Regular (400) | `#273E47` (Charcoal) |
| **Texto en Barras (Header/Footer)** | 1rem | Medium (500) | `#273E47` o Blanco |
| **Datos de Casillas (Slots)** | 0.8rem - 0.9rem | Semibold (600) | `#273E47` (Charcoal) o Blanco según contraste |
| **Métricas de Tarjeta (Dashboard)** | 1.5rem - 2rem | Extrabold (800) | `#A4243B` (Amaranth Purple) |

#### **3. Implementación de Efectos Visuales y Librerías Estéticas (React/Next.js)**

La implementación debe usar la calidez de la paleta para crear un ambiente atractivo y confiable.

1.  **Componentes Radix UI & clsx:**
    * Implementar todos los componentes interactivos utilizando **Radix UI** para accesibilidad.
    * Usar **`clsx`** y **`tailwind-merge`** para manejar la fusión de clases.
2.  **Efectos de Profundidad Càlida:**
    * Utilizar sombras suaves y difusas para dar elevación a las tarjetas (Dashboard) y modales. El color de la sombra debe ser un `rgba` del `#273E47` (Charcoal) con baja opacidad para un efecto de "flotación" sutil. (Clase sugerida: `shadow-soft`)
    * Para las tarjetas, aplicar un borde fino con opacidad del color `#273E47` (Charcoal) para resaltar la estructura del contenido contra el fondo `#D8C99B` (Ecru). (Clase sugerida: `border-primario-oscuro/20`)
3.  **Microinteracciones en Botones (Cálido a Fuerte):**
    * Aplicar transiciones rápidas (`duration-200` o `transition-all`) a todos los elementos interactivos.
    * Al pasar el ratón (`hover`) sobre los botones de acción (`bg-acento-fuerte`), agregar sombras ligeras adicionales (`shadow-lg`) para mejorar la profundidad y feedback visual.
4.  **Diseño de las Barras (Header/Footer):**
    * La barra de navegación (`bg-barra-principal: #D8973C`) debe tener un *shadow* que proyecte hacia abajo, separándola claramente del contenido de la página. (Clase sugerida: `shadow-md`)
    * Los enlaces y botones en el header deben usar el color `#273E47` (Charcoal) para garantizar el contraste sobre el fondo Butterscotch.
5.  **Efectos en el Tablero de Casillas (Transparencia y Energía):**
    * Las casillas deben usar colores específicos según estado (ver colores especiales arriba) para mejor distinción visual en lugar del color base `#D8C99B` (Ecru) sugerido originalmente.
        * **`winning` (Ganador):** Aplicar el color `#E6B422` (Dorado cálido) con un efecto de **pulso sutil (glow)** utilizando CSS, para dirigir la atención con energía. (Clase sugerida: `animate-winner-pulse` con anillo `ring-slot-winning`)
        * **`available` (Disponible):** Fondo `#8B9A46` (Verde oliva) con efecto degradado para suavidad visual
        * **`reserved` (Reservado):** Fondo `#C17D4E` (Terracota) con efecto degradado para suavidad visual
        * **`paid` (Pagado):** Fondo `#5D7CA6` (Azul grisáceo) con efecto degradado para suavidad visual
        * **`losing` (Perdedor):** Usar el color `#7A6B5D` (Gris terroso) con efecto degradado para mantener consistencia visual
6.  **Carga de Componentes:**
    * Utilizar el patrón de **Skeleton Loading** con una animación específica donde el color base sea `#D8C99B` y la onda de movimiento utilice el color `#D8973C` (Butterscotch). (Clase sugerida: `animate-skeleton`)
7.  **Casillas Ganadoras:**
    * Asegurar que las casillas ganadoras tengan un anillo (`ring`) de mayor grosor (`ring-4`) y sombra (`shadow-xl`) para destacar visualmente sobre las demás casillas.