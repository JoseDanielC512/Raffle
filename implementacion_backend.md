# Resumen de la Implementación del Backend con Firebase

Este documento describe la arquitectura de backend "serverless" implementada para la aplicación "Lucky 100 Raffle" utilizando Next.js y los servicios de Firebase.

## Arquitectura General

La aplicación sigue un modelo de cliente pesado donde el frontend (Next.js/React) interactúa directamente con los servicios de Firebase. La lógica de negocio crítica se encapsula en **Next.js Server Actions** para mantener la seguridad y la integridad de los datos.

### 1. Autenticación (Firebase Authentication)

- **Flujo de Usuario**: El registro e inicio de sesión se manejan en el cliente a través de los componentes de formulario (`login-form.tsx`, `signup-form.tsx`).
- **Server Actions**: Estos formularios invocan `signupAction` y `loginAction` en `src/app/actions.ts`. Estas acciones utilizan el **SDK de cliente de Firebase** para llamar a `createUserWithEmailAndPassword` y `signInWithEmailAndPassword`.
- **Gestión de Sesión**: Un `AuthProvider` (`src/context/auth-context.tsx`) utiliza el listener `onAuthStateChanged` de Firebase para mantener el estado de autenticación del usuario en toda la aplicación. Esto permite proteger rutas y mostrar contenido dinámicamente en el cliente.

### 2. Base de Datos (Firestore)

- **Estructura de Datos**:
    - **`users`**: Colección que almacena un documento por cada usuario registrado. El ID del documento es el `uid` de Firebase Auth.
    - **`raffles`**: Colección que almacena los datos de cada rifa. El `ownerId` de cada rifa se vincula al `uid` del usuario que la creó.
    - **`raffles/{raffleId}/slots`**: Subcolección dentro de cada rifa que contiene 100 documentos, uno por cada casilla.

- **Interacción con la Base de Datos**:
    - **Escrituras (Create, Update)**: Se realizan a través de Server Actions en `actions.ts`. Por ejemplo, `createRaffleAction` crea el documento de la rifa y sus 100 casillas en un lote (`writeBatch`). `updateSlotAction` modifica un único documento de casilla.
    - **Lecturas (Read)**: Se realizan de dos maneras:
        1.  **Desde el Servidor**: El archivo `src/lib/firestore.ts` contiene funciones server-side (marcadas con `'use server'`) como `getRafflesForUser` que pueden ser llamadas desde Server Components o Server Actions.
        2.  **Desde el Cliente (en tiempo real)**: La página de detalle de la rifa (`/raffle/[id]`) utiliza el listener `onSnapshot` del SDK de cliente de Firebase para suscribirse a los cambios en la subcolección `slots`, permitiendo actualizaciones de la UI en tiempo real.

### 3. Lógica de Negocio

- **Server Actions (`src/app/actions.ts`)**: Este archivo es el corazón del backend. Contiene toda la lógica para crear, actualizar y finalizar rifas.
- **Transacciones**: La finalización de una rifa (`finalizeRaffleAction`) se implementa como una transacción de Firestore (`runTransaction`) para garantizar la atomicidad. La acción lee todas las casillas pagadas, selecciona un ganador al azar y actualiza el documento de la rifa, todo en una única operación segura.

Esta arquitectura aprovecha el poder de Next.js y Firebase para crear una aplicación web reactiva, segura y escalable sin necesidad de gestionar un servidor tradicional.