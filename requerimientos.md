# Requerimientos y Actualizaciones para el MVP de "Lucky 100 Raffle"

Este documento describe las características y actualizaciones pendientes para desarrollar la versión Mínima Viable (MVP) completa de la aplicación de rifas.

## 1. Autenticación y Gestión de Usuarios

- **Implementación de Lógica de Autenticación:** Conectar los formularios de inicio de sesión (`login`) y registro (`signup`) a un proveedor de autenticación (ej. Firebase Authentication).
- **Gestión de Sesiones:** Implementar la creación, mantenimiento y cierre de sesiones de usuario.
- **Rutas Protegidas:** Asegurar que solo los usuarios autenticados puedan acceder a las rutas de la aplicación como `/dashboard` y `/raffle/create`.
- **Asociación de Datos al Usuario:** Reemplazar los IDs de usuario hardcodeados (ej. `ownerId = '1'`) con el ID del usuario autenticado en sesión.

## 2. Persistencia de Datos (Base de Datos Real)

- **Sustitución del Almacén en Memoria:** Reemplazar el backend simulado en `src/lib/data.ts` por una base de datos real (ej. Firebase Firestore).
- **CRUD de Rifas:** Reescribir las funciones (`getRafflesForUser`, `getRaffleById`, `createRaffle`, `updateSlot`, `finalizeRaffle`) para que interactúen con la base de datos.
- **Persistencia de Usuarios:** Crear y gestionar una colección de usuarios en la base de datos.

## 3. Pagos y Actualización de Slots

- **Integración con Pasarela de Pagos:** Implementar la integración con una pasarela de pagos (ej. Stripe, Mercado Pago) para que los participantes puedan pagar por sus slots.
- **Automatización del Estado "Pagado":** Actualizar automáticamente el estado de un slot a "pagado" después de una transacción exitosa.

## 4. Mejoras de Experiencia de Usuario (UX)

- **Actualizaciones en Tiempo Real:** Implementar actualizaciones en tiempo real en el tablero de la rifa (`RaffleBoard`) para que los cambios (ej. un nuevo slot reservado) se reflejen instantáneamente para todos los espectadores. Se puede usar Firebase Realtime Database o Firestore listeners.
- **Notificaciones:** Añadir un sistema de notificaciones para informar a los usuarios sobre acciones importantes (ej. "Tu slot ha sido pagado con éxito", "El ganador de la rifa ha sido seleccionado").
- **Validación y Manejo de Errores:** Mejorar la validación en los formularios y la gestión de errores del lado del servidor para proporcionar feedback más claro al usuario.
- **Costo por Slot:** Añadir un campo para definir el precio por cada slot de la rifa al momento de crearla y mostrarlo en la interfaz.

## 5. Funcionalidad Adicional del MVP

- **Compartir Rifas:** Añadir un botón para que los creadores de las rifas puedan compartir un enlace público de la misma.
- **Página de Perfil de Usuario:** Crear una vista donde los usuarios puedan ver su historial de rifas creadas y en las que participan.
