## Brief overview
Reglas específicas para el desarrollo web del proyecto Lucky 100 Raffle, enfocadas en el manejo de layouts, headers, gestión de tareas y buenas prácticas de desarrollo con criterios de aceptación claros.

## Communication style
- Todas las respuestas deben estar en español
- Ser claro y conciso en las explicaciones técnicas
- Realizar preguntas necesarias para entender completamente los requerimientos antes de implementar

## Development workflow
- No es necesario desplegar el servidor local después de cada implementación, ya que hay uno corriendo activamente
- Analizar la estructura existente antes de hacer modificaciones
- Preferir modificar componentes existentes antes de crear duplicados para evitar replicación de código
- Usar props para controlar el comportamiento de los componentes en diferentes contextos

## Coding best practices
- Evitar duplicación de código modificando componentes existentes con props configurables
- Mantener la estructura de layouts de Next.js (root layout, group layouts)
- Importar correctamente los componentes cuando se utilizan en nuevos archivos
- Usar TypeScript estrictamente y resolver errores de importación inmediatamente

## Project context
- Proyecto: Lucky 100 Raffle (Next.js 14+ con App Router)
- Stack: TypeScript, Firebase, Tailwind CSS, shadcn/ui
- Estructura de layouts:
  - Root layout: layout base sin header específico
  - (auth) layout: para páginas de login/signup con header sin botones
  - (app) layout: para páginas autenticadas con header completo
- Header component: tiene prop `showAuthButtons` para controlar visibilidad de botones

## Layout management
- Cada grupo de rutas ((auth), (app)) tiene su propio layout
- El header se maneja a nivel de layout, no de página individual
- Usar la prop `showAuthButtons={false}` para páginas de autenticación
- Usar `showAuthButtons={true}` (default) para páginas públicas y autenticadas

## Task management and acceptance criteria
- ANTES de iniciar cualquier tarea: analizar y documentar criterios de aceptación específicos
- DURANTE la implementación: actualizar estado en tiempo real en `docs/progreso_tarea.md`
- DESPUÉS de completar: verificar criterios de aceptación y documentar resumen
- Cada tarea debe tener: descripción clara, criterios de aceptación medibles, estado, responsable, fecha límite
- Documentar implementaciones técnicas con código antes/después
- Registrar métricas de performance y KPIs para cada funcionalidad

## Acceptance criteria requirements
Para cada tarea solicitada, se debe definir:
1. **Criterios de aceptación específicos** (qué significa "completado")
2. **Métricas de éxito** (cómo se mide el éxito)
3. **Pruebas de verificación** (cómo se valida que funciona)
4. **Riesgos y mitigaciones** (qué podría fallar y cómo solucionarlo)
5. **Dependencias** (qué se necesita antes/después)

## Documentation standards
- Todo progreso debe ser consignado en `docs/progreso_tarea.md`
- Incluir tablas de seguimiento con estado: ❌ Pendiente, 🟡 En Progreso, ✅ Completado
- Documentar implementaciones técnicas con código antes/después
- Registrar métricas de performance y KPIs
- Actualizar timestamps en cada modificación
- Incluir resumen general con porcentajes de completado

## Testing and validation
- Cada implementación debe incluir pruebas manuales
- Verificar que no se rompan funcionalidades existentes
- Testear en diferentes escenarios (casos límite, errores, etc.)
- Documentar resultados de las pruebas
- Incluir logs para debugging y monitoreo

## Error handling and logging
- Implementar manejo robusto de errores específicos
- Agregar logging estructurado con diferentes niveles (info, warn, error)
- Incluir timestamps y contexto relevante en los logs
- Proporcionar mensajes de error claros y útiles para el usuario
- Registrar métricas de performance para análisis

## Firebase integration specifics
- Configurar ActionCodeSettings para control de redirección
- Manejar códigos de error específicos de Firebase Authentication
- Configurar idioma español (`auth.languageCode = 'es'`)
- Considerar diferencias entre entorno de desarrollo y producción
- Documentar configuración manual requerida en Firebase Console

## Other guidelines
- Mantener consistencia visual en todos los headers
- Asegurar que no haya duplicación de headers en ninguna página
- Verificar imports al agregar componentes a nuevos archivos
- Testear visualmente los cambios en las diferentes páginas afectadas
- Ser analítico y detallado en el diagnóstico de problemas
- Proporcionar planes secuenciales con prioridades claras
