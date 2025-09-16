# Requerimientos y Actualizaciones del MVP de "Lucky 100 Raffle" (Versión Aterrizada)

Este documento describe las características y actualizaciones esenciales para construir la versión Mínima Viable (MVP) completa, segura y funcional de la aplicación de rifas, tal como lo hemos definido.

## 1. Autenticación y Perfiles de Usuario

### Autenticación sin Backend Tradicional
Conectar los formularios de Inicio de Sesión y Registro directamente a Firebase Authentication. Esto nos permite prescindir de un backend con Python, delegando a Firebase toda la gestión de credenciales, hashing de contraseñas y creación de tokens de sesión.

### Gestión de Sesiones en el Frontend
Utilizar el SDK de Firebase para gestionar el estado de autenticación del usuario. Si un usuario está autenticado, se le debe permitir el acceso a las rutas protegidas como `/dashboard` y a las funciones de creación de rifas.

### Asociación de Datos (UID Único)
Al registrar un nuevo usuario, crear un documento en la colección `users` de Firestore. El ID del documento debe ser el UID único de Firebase Authentication para garantizar la coherencia y una seguridad robusta. Este UID será la clave para asociar todas las rifas creadas por el usuario.

## 2. Persistencia de Datos y Lógica de Negocio

### Migración a Base de Datos NoSQL (Firestore)
Remplazar cualquier backend simulado o persistencia en memoria por Firebase Firestore. Todas las funciones de creación, lectura, actualización y eliminación de datos (CRUD) deben interactuar directamente con esta base de datos.

### Modelo de Datos Definido
- **Colección `raffles`**: Para cada rifa. Contendrá campos como `ownerUid`, `name`, `status`, `totalSlots` y la `raffleUrl`.
- **Subcolección `slots`**: Dentro de cada documento de rifa, existirá una subcolección `slots` con 100 documentos (IDs del 0 al 99). Cada documento de `slot` tendrá campos como `name`, `slotStatus` y `paymentStatus`.

### Validación de Límite de Rifas (Core Business Logic)
Antes de permitir que un organizador cree una nueva rifa, la aplicación debe consultar en Firestore el número de rifas activas que posee. Si ya tiene dos, la creación debe ser rechazada.

### Lógica de Finalización de Rifas
Implementar la función de finalizar una rifa utilizando una transacción de Firestore. Esta transacción asegurará que la actualización de la rifa y de los 100 documentos de `slots` ocurra de forma atómica, previniendo inconsistencias en la base de datos y garantizando la integridad de los resultados.

## 3. Pagos y Actualización de Slots

### Flujo de Pagos Externo
Eliminar el requisito de integrar una pasarela de pagos. La lógica se centrará en la gestión manual del estado por parte del organizador. El proyecto no procesará ni almacenará información de tarjetas o pagos.

### Actualización del Estado de Casillas
La única forma de cambiar el estado de una casilla (`slotStatus`) de `reserved` a `paid` será a través de la acción manual del organizador, quien deberá confirmarlo después de recibir el pago externo (por ejemplo, por transferencia o WhatsApp).

### Añadido: Historial de Actividad por Rifa
Para un mejor seguimiento, agregar un registro simple dentro de cada documento de la rifa que guarde las acciones importantes, como la actualización de los estados de las casillas o la finalización de la rifa.

## 4. Experiencia de Usuario (UX) y Características Adicionales

### Actualizaciones en Tiempo Real (Realtime Listeners)
Implementar listeners de Firestore en la vista pública del tablero de rifa. Esto permitirá que, cuando el organizador actualice una casilla, los cambios se reflejen de forma instantánea y en tiempo real para todos los espectadores, sin necesidad de recargar la página.

### Sistema de Notificaciones
Añadir un sistema de notificaciones visuales (por ejemplo, usando una librería como `Vue Toastification` o similar) para dar feedback claro al usuario en acciones clave como "Rifa creada con éxito", "Casilla actualizada" o "Error al iniciar sesión".

### Optimización del Tablero
Asegurar que el tablero sea responsivo y se adapte bien a dispositivos móviles. Además, el renderer debe ser eficiente para evitar problemas de rendimiento al mostrar y actualizar las 100 casillas.

### Añadido: Dashboard con Métricas Clave
Mejorar el dashboard del organizador para que muestre métricas en tiempo real, como el número total de casillas vendidas, el porcentaje de ocupación del tablero y el estado de sus rifas.

## 5. Internacionalización

### Traducción al Español
La aplicación debe estar completamente en Español. Actualmente, el prototipo está en inglés, por lo que se precisa una traducción cuidadosa y precisa de todos los textos de la interfaz de usuario.
