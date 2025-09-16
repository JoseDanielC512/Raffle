### **README.md para la Aplicación de Rifas**

# Lucky 100 Raffle

Una moderna plataforma web construida con Next.js que permite a los usuarios crear y gestionar rifas de 100 casillas. Este proyecto funciona como una demostración avanzada que integra un flujo de generación de contenido mediante IA y simula un backend con datos en memoria, sin necesidad de una base de datos externa.

----

### **Características Actuales**

  * **Generación de Rifas con IA:** Los usuarios pueden describir un premio y la aplicación utiliza un modelo de IA para generar automáticamente un nombre atractivo, una descripción detallada y los términos y condiciones de la rifa.
  * **Gestión de Rifas:** Un panel de control permite a los usuarios ver todas sus rifas activas y finalizadas.
  * **Tablero Interactivo:** Una cuadrícula visual de 100 casillas que muestra el estado de cada número (disponible, reservado, pagado) mediante un código de colores.
  * **Gestión de Casillas:** Los organizadores pueden hacer clic en cada casilla para actualizar manualmente el estado de pago y asignar el nombre del participante.
  * **Finalización Automática de Rifas:** Los organizadores pueden finalizar una rifa con un solo clic. La aplicación seleccionará automáticamente un número ganador al azar entre todas las casillas.
  * **Visualización del Ganador:** Una vez finalizada, la rifa destaca la casilla ganadora y muestra una felicitación.

----

### **Tecnologías Usadas**

Este proyecto está construido con un stack de tecnologías moderno basado en React y Next.js.

  * **Framework:** Next.js (con App Router)
  * **Lenguaje:** TypeScript
  * **Estilos:** Tailwind CSS
  * **Componentes de UI:** shadcn/ui
  * **Inteligencia Artificial:** Integración de un modelo de lenguaje para la generación de contenido.
  * **Gestión de Estado:** React Hooks (`useState`, `useFormState`)
  * **Herramienta de Desarrollo:** Next.js CLI

----

### **Estructura del Proyecto**

La estructura sigue las convenciones del App Router de Next.js:

  * `src/`: Directorio principal del código.
      * `app/`: Rutas de la aplicación y lógica de las páginas.
      * `components/`: Componentes de React reutilizables (UI y de dominio).
      * `lib/`: Funciones de utilidad y simulación de datos (`data.ts`).
      * `ai/`: Flujos de interacción con el modelo de IA.
      * `hooks/`: Hooks de React personalizados.
  * `public/`: Archivos estáticos accesibles públicamente.

----

### **Primeros Pasos**

Sigue estos pasos para configurar y ejecutar el proyecto en tu entorno local.

1.  **Clona el Repositorio**

    ```bash
    git clone [URL_DEL_REPOSITORIO]
    cd [nombre-del-repositorio]
    ```

2.  **Instala las Dependencias**

    ```bash
    npm install
    ```

3.  **Ejecuta la Aplicación en Modo Desarrollo**

    ```bash
    npm run dev
    ```

    La aplicación estará disponible en `http://localhost:3000`.

----

### **Guía de Despliegue**

La forma más sencilla de desplegar esta aplicación Next.js es a través de **Vercel**, la plataforma de los creadores de Next.js.

1.  **Sube tu repositorio a GitHub, GitLab o Bitbucket.**
2.  **Regístrate en [Vercel](https://vercel.com/) con tu cuenta de Git.**
3.  **Importa el proyecto desde tu proveedor de Git.**
4.  **Vercel detectará automáticamente que es un proyecto Next.js y configurará el proceso de build y despliegue por ti.**

Cada vez que hagas `push` a la rama principal, Vercel desplegará automáticamente los cambios.

----

### **Contribución y Futuras Mejoras**

Este proyecto tiene un gran potencial para crecer. Algunas ideas para el futuro son:

  * **Backend Real:** Reemplazar la simulación en memoria con una base de datos real (ej. PostgreSQL, MongoDB) y una API robusta.
  * **Autenticación de Usuarios:** Implementar un sistema de registro e inicio de sesión con proveedores como NextAuth.js.
  * **Pasarelas de Pago:** Integrar Stripe o Mercado Pago para automatizar la compra de casillas.
  * **Notificaciones:** Enviar correos electrónicos al ganador o notificaciones push.
  * **Soporte para Múltiples Idiomas:** Expandir la internacionalización a otros idiomas.

**¡Gracias por ser parte del proyecto!**
