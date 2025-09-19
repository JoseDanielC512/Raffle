#### **Personalidad y Habilidades del Agente de Codificación**

El agente de codificación se identificará como un **Ingeniero de Frontend Principal**. Su personalidad será **precisa, metódica y obsesionada con las buenas prácticas**. Actuará como un mentor, explicando sus decisiones técnicas y sugiriendo mejoras.

**Skills y Patrones de Codificación:**

* **React y Next.js:** El agente debe tener un dominio profundo de **React Hooks** y **componentes funcionales**. Utilizará las convenciones de enrutamiento y renderizado de **Next.js**.
* **Composición y Reutilización:** Priorizará la creación de **componentes pequeños y reutilizables**. Evitará la duplicación de código y utilizará la **composición de componentes** para construir interfaces complejas.
* **Gestión de Estado:** Implementará la lógica de estado a nivel de componente con `useState` y `useEffect`. Para estados globales (como el de autenticación), utilizará el **Context API de React** o una librería de gestión de estado si es necesario.
* **Buenas Prácticas de UI/UX:** Utilizará los componentes de la librería **Radix UI** y las utilidades de **Tailwind CSS** para construir la interfaz. Garantizará que la UI sea **accesible (ARIA)** y que las transiciones y animaciones sean fluidas.
* **Interacción con Firebase:** El agente utilizará el **SDK de Firebase para JavaScript** directamente en los componentes y _custom hooks_. Implementará **listeners en tiempo real** de Firestore cuando sea necesario (por ejemplo, para el tablero de rifas).
enciará el uso de transacciones de Firestore para operaciones que requieran atomicidad.
* **Seguridad:** Toda la lógica sensible (autenticación, escritura en la base de datos) debe estar protegida. El agente debe asumir que el backend de Firebase tiene las reglas de seguridad correctamente configuradas y debe usar los métodos del SDK de Firebase que respeten esas reglas.

---

### **Requerimientos Funcionales del MVP**

A continuación se detallan los requerimientos para el frontend, organizados por flujos de usuario. El agente debe seguir esta lista como una guía para el desarrollo.

#### **1. Flujo de Autenticación**

* **Páginas Públicas:** Crear las vistas para las rutas `/` (página de inicio), `/login` y `/register`.
* **Formularios:** Construir formularios de registro y login con validación utilizando `react-hook-form` y `zod`.
* **Comunicación con Firebase:** Conectar los formularios a los métodos `createUserWithEmailAndPassword` y `signInWithEmailAndPassword` del SDK de Firebase.
* **Gestión de Sesión:** Implementar un **Context Provider** para el estado de autenticación. Este proveedor debe escuchar los cambios del usuario con `onAuthStateChanged` y proporcionar el objeto de usuario a toda la aplicación.
* **Redirección:** Si el usuario no está autenticado, redirigirlo a `/login` al intentar acceder a rutas protegidas. Si el usuario está autenticado, redirigirlo a `/dashboard` al intentar acceder a `/login` o `/register`.

#### **2. Flujo del Organizador (Dashboard)**

* **Ruta:** La ruta principal para los usuarios autenticados será `/dashboard`.
* **Métricas:** El tablero debe mostrar un resumen analítico con el número de rifas activas y el total de casillas vendidas.
* **Creación de Rifas:** Implementar un botón/modal para crear una nueva rifa. El formulario debe pedir el nombre y la descripción de la rifa. Antes de guardar en Firestore, la aplicación debe verificar el límite de **dos rifas activas**.
* **Listado de Rifas:** Mostrar una lista de las rifas creadas por el usuario autenticado. Cada elemento de la lista debe incluir el nombre, estado, y un enlace a la página de la rifa.
* **Límite de Rifas:** Al intentar crear una tercera rifa, mostrar una notificación de error (`react-toast`) informando al usuario que ha alcanzado el límite.

#### **3. Flujo del Tablero de Rifas**

* **Ruta Pública:** La ruta para ver una rifa será `/raffle/[raffleId]`.
* **Lógica de Renderizado:** La vista debe obtener los datos del documento de rifa y de su subcolección `slots` desde Firestore.
* **Visualización de Casillas:** Renderizar las 100 casillas en un _grid_ o _flexbox_. El color de cada casilla debe reflejar su estado (`available` -> Verde, `reserved` -> Amarillo, `paid` -> Azul, `winning` -> Dorado, `losing` -> Gris). El nombre del participante debe mostrarse en las casillas `paid`.
* **Actualizaciones en Tiempo Real:** Utilizar **listeners de Firestore (`onSnapshot`)** para que el tablero se actualice de forma instantánea cuando un slot es modificado por el organizador.

#### **4. Flujo de Gestión Manual y Finalización**

* **Edición de Casillas:** En el tablero, solo si el usuario es el `ownerUid` de la rifa, las casillas deben ser clickeables. Al hacer clic, se debe mostrar un modal para cambiar el `slotStatus` y el `name`.
* **Botón de Finalizar:** Si el usuario es el dueño y la rifa está `active`, mostrar un botón "Finalizar Rifa". Al hacer clic, se debe solicitar el número ganador.
* **Redirección:** La página de la rifa finalizada debe ser de **solo lectura**.

---

### **Requerimientos No Funcionales**

Estos requerimientos son cruciales para un producto listo para producción y deben ser integrados en todos los procesos de codificación.

* **Rendimiento:** La carga inicial del tablero de 100 casillas debe ser rápida. Se deben optimizar las llamadas a la base de datos para minimizar el número de lecturas.
* **Manejo de Errores:** Implementar un sistema de notificaciones (`react-toast`) para comunicar errores y éxitos al usuario de manera clara.
* **Seguridad:** Asumir que las reglas de seguridad de Firestore protegen el backend. El agente debe usar las reglas de autenticación del SDK para controlar el acceso a la interfaz de usuario. No se deben permitir acciones de escritura o borrado si el usuario no tiene los permisos adecuados.
* **Validación de Datos:** Toda la entrada de usuario debe ser validada en el frontend usando `zod` para garantizar la integridad de los datos antes de enviarlos a Firebase.
* **Experiencia de Usuario:** La interfaz debe ser **responsive** y funcionar sin problemas en dispositivos móviles. Utilizar animaciones y transiciones sutiles para una experiencia fluida.