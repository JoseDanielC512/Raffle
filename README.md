### **README.md para la Aplicación de Rifas**

# Lucky 100 Raffle

Una moderna plataforma web construida con Next.js, TypeScript y Firebase. Permite a los usuarios registrarse, iniciar sesión y gestionar rifas de 100 casillas. La aplicación cuenta con un backend "serverless" completamente funcional utilizando Firebase Authentication y Firestore para la persistencia de datos en tiempo real.

----

### **Características Implementadas**

  * **Autenticación de Usuarios:** Sistema completo de registro e inicio de sesión con Firebase Authentication.
  * **Gestión de Sesiones:** La aplicación maneja sesiones de usuario, protegiendo rutas y mostrando contenido dinámico.
  * **Backend con Firestore:** Todas las operaciones de datos (crear, leer, actualizar y finalizar rifas) se realizan contra una base de datos NoSQL en tiempo real (Firestore).
  * **Actualizaciones en Tiempo Real:** El tablero de la rifa se actualiza instantáneamente para todos los espectadores cuando el organizador modifica una casilla.
  * **Generación de Rifas con IA:** Los usuarios pueden describir un premio y la aplicación utiliza un modelo de IA para generar automáticamente un nombre, descripción y términos para la rifa.
  * **Finalización Atómica de Rifas:** La selección del ganador se realiza a través de una transacción segura de Firestore para garantizar la integridad de los datos.

----

### **Tecnologías Usadas**

  * **Framework:** Next.js (con App Router)
  * **Lenguaje:** TypeScript
  * **Backend:** Firebase (Authentication y Firestore)
  * **Estilos:** Tailwind CSS
  * **Componentes de UI:** shadcn/ui
  * **Inteligencia Artificial:** Genkit para la generación de contenido.
  * **Gestión de Estado:** React Hooks (`useState`, `useContext`, `useFormState`)

----

### **Estructura del Proyecto**

  * `src/`: Directorio principal del código.
      * `app/`: Rutas y Server Actions (`actions.ts`).
      * `components/`: Componentes de React reutilizables.
      * `lib/`: Lógica de negocio y configuración.
          * `firebase.ts`: Configuración e inicialización de Firebase.
          * `firestore.ts`: Funciones para interactuar con la base de datos Firestore.
          * `definitions.ts`: Tipos de datos de TypeScript.
      * `context/`: React Context para la gestión de estado global (ej. `auth-context.tsx`).

----

### **Primeros Pasos**

1.  **Clona el Repositorio**

2.  **Instala las Dependencias**
    ```bash
    npm install
    ```

3.  **Configura tus Credenciales de Firebase**
    *   Crea un archivo `.env.local` en la raíz del proyecto.
    *   Añade tus credenciales de Firebase como se especifica en `src/lib/firebase.ts`.

4.  **Ejecuta la Aplicación**
    ```bash
    npm run dev
    ```

----

### **Guía de Despliegue**

La forma más sencilla de desplegar esta aplicación es a través de **Vercel**. Vercel detectará automáticamente que es un proyecto Next.js y lo configurará. No olvides añadir tus variables de entorno de Firebase en la configuración del proyecto de Vercel.
