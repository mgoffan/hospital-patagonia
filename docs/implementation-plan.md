# Plan de implementación

## 1. Objetivo

Entregar una webapp first-person single-player en la que el jugador pueda operar una ronda completa de Hospital Patagonia, con coworkers IA, reglas configurables, replay, métricas e inversiones, publicada en GitHub Pages.

Este plan prioriza un vertical slice end-to-end antes de ampliar roles o producir arte final.

## 2. Supuestos

- MVP sin backend.
- Desktop primero.
- React 19, TypeScript, Vite y React Three Fiber.
- WebGL 2 baseline; WebGPU progresivo.
- Administración como primer rol jugable.
- Coworkers IA para las demás estaciones.
- Reglas académicas no confirmadas expresadas como configuración versionada.
- No se publican fotos, PDF, logos ni derivados hasta confirmar permisos.

## 3. Dependencias entre hitos

```text
M0 Foundation
  -> M1 Simulation Core
      -> M2 Greybox & Interaction
          -> M3 Administration Vertical Slice
              -> M4 Full Round & Roles
                  -> M5 Debrief & Replay
                      -> M6 Investments
                          -> M7 Art & Accessibility
                              -> M8 Release
```

Investigación de reglas y prototipos de arte pueden avanzar durante varios hitos, pero no deben bloquear M1-M3.

## 4. Hitos

## M0 - Foundation

### Objetivo

Crear una base reproducible, testeable y publicable.

### Trabajo

- Inicializar proyecto Vite + React + TypeScript estricto.
- Configurar package manager y lockfile.
- Configurar lint, format, typecheck y Vitest.
- Agregar Playwright y un smoke test.
- Configurar Tailwind/CSS variables.
- Configurar aliases y estructura de carpetas.
- Configurar GitHub Actions para checks y Pages.
- Agregar shell de rutas: inicio, simulación y debrief.
- Registrar versiones exactas en un ADR/lockfile.

### Entregable

Aplicación vacía con navegación, CI verde y deployment automático.

### Salida

Cumplir criterios de Hito 0 en [acceptance-criteria.md](./acceptance-criteria.md).

### Commits sugeridos

1. `chore: scaffold React TypeScript application`
2. `chore: configure lint typecheck and unit tests`
3. `test: add browser smoke test`
4. `ci: deploy application to GitHub Pages`
5. `feat: add application shell and routes`

## M1 - Simulation Core

### Objetivo

Demostrar el flujo completo sin gráficos.

### Trabajo

- Definir branded IDs y schemas de escenario.
- Implementar PRNG con semilla.
- Implementar reloj lógico y scheduler.
- Modelar pacientes, colas, estaciones, recursos y servicios.
- Implementar comandos, validación y eventos.
- Incorporar fixtures de 49, 28, 17 y 8 llegadas.
- Implementar adaptador QR legacy.
- Implementar ledger y métricas mínimas.
- Agregar serialización/versionado.
- Cubrir invariantes con unit tests y property tests.

### Fixture vertical

Un escenario reducido de 90 segundos con:

- 2 pacientes;
- 1 ruta directa;
- 1 ruta con análisis;
- Administración, Enfermería, Guardia, Análisis y Egreso;
- coworkers instantáneos primero, temporizados después.

### Entregable

Una simulación ejecutable en tests que produce event log, estado final y métricas deterministas.

### Commits sugeridos

1. `feat: define versioned scenario schema`
2. `feat: add seeded simulation clock and scheduler`
3. `feat: model patients queues and stations`
4. `feat: handle services through domain commands`
5. `feat: add legacy QR patient importer`
6. `feat: record simulation event log`
7. `feat: calculate baseline operational metrics`
8. `test: enforce simulation invariants`

## M2 - Greybox e interacción

### Objetivo

Validar movimiento, escala, salas y acciones contextuales.

### Trabajo

- Configurar Canvas R3F y renderer capability detection.
- Integrar Rapier y controlador first-person.
- Construir greybox modular con las salas conectadas.
- Crear navmesh.
- Agregar puntos de espera, servicio y handoff.
- Implementar raycast e interacción contextual.
- Implementar alternativa sin Pointer Lock.
- Medir FPS, draw calls y carga.

### Entregable

Hospital navegable con estaciones reconocibles y un objeto interactivo por sala.

### Decisión pendiente

Validar escala de retícula y conexión entre salas. Mientras tanto, usar una escala jugable documentada.

### Commits sugeridos

1. `feat: initialize 3d scene and renderer fallback`
2. `feat: add first person movement and collisions`
3. `feat: build connected hospital greybox`
4. `feat: add contextual interaction system`
5. `feat: add navigation mesh and station anchors`
6. `perf: establish initial rendering budgets`

## M3 - Vertical slice de Administración

### Objetivo

Conectar dominio, mundo e IA en un flujo end-to-end.

### Trabajo

- Representar pacientes como NPC simples.
- Implementar llegada y ocupación de sala de espera.
- Crear ficha y terminal de Administración.
- Conectar interacción a comandos del dominio.
- Implementar coworker IA por prioridades.
- Visualizar traslados y reservas.
- Completar las rutas directa y con análisis.
- Mostrar resumen mínimo al cerrar.
- Persistir event log y snapshot.

### Entregable

El jugador admite y egresa dos pacientes mientras la IA ejecuta estaciones intermedias.

### Checkpoint de producto

Antes de continuar se realiza una prueba con usuarios. Debe responder:

- ¿Se entiende el rol sin explicar el sistema completo?
- ¿Los handoffs son visibles?
- ¿Caminar agrega significado o fricción vacía?
- ¿El jugador puede explicar dónde esperó cada paciente?

### Commits sugeridos

1. `feat: represent patients in the 3d world`
2. `feat: add administration workstation flow`
3. `feat: implement coworker task planner`
4. `feat: animate patient and coworker routes`
5. `feat: complete direct patient journey`
6. `feat: complete analysis patient journey`
7. `feat: persist vertical slice session`

## M4 - Ronda completa y roles

### Objetivo

Escalar el slice a la experiencia de cinco minutos y habilitar perspectivas distintas.

### Trabajo

- Incorporar fixtures completos.
- Implementar cierre y WIP.
- Separar tardanza de abandono.
- Agregar HUD de rol y reloj.
- Habilitar Enfermería como rol jugable.
- Habilitar Guardia como rol jugable.
- Habilitar Análisis como rol jugable.
- Generalizar IA para ocupar cualquier rol no elegido.
- Agregar tutorial por rol.
- Balancear tiempos provisionales mediante configuración.

### Entregable

Ronda completa jugable desde cada rol, con coworkers IA y resultado reproducible.

### Commits sugeridos

1. `feat: run full five minute demand scenarios`
2. `feat: preserve work in process at round end`
3. `feat: add role aware hud and tutorial`
4. `feat: make nursing role playable`
5. `feat: make doctor role playable`
6. `feat: make analysis role playable`
7. `refactor: assign AI to unselected roles`

## M5 - Debrief, métricas y replay

### Objetivo

Convertir la experiencia en aprendizaje explicable.

### Trabajo

- Completar proyecciones de métricas.
- Agregar timeline de colas y utilización.
- Implementar cámara cenital.
- Reconstruir estado por tiempo lógico.
- Agregar play/pause, velocidades y scrubber.
- Seleccionar paciente/estación.
- Detectar hitos operativos sugeridos.
- Exportar JSON y CSV.
- Comparar rondas con la misma semilla.

### Entregable

Replay navegable que permite explicar el cuello de botella y los tiempos de un paciente.

### Commits sugeridos

1. `feat: project service metrics from event log`
2. `feat: add queue and utilization timelines`
3. `feat: reconstruct replay snapshots`
4. `feat: add overhead replay controls`
5. `feat: inspect patient journey in replay`
6. `feat: export session data`
7. `feat: compare repeated simulation rounds`

## M6 - Inversiones

### Objetivo

Permitir experimentación controlada entre rondas.

### Trabajo

- Implementar presupuesto y ledger completo.
- Agregar personal.
- Agregar máquina/capacidad de radiología.
- Implementar flexibilidad/cobertura cruzada.
- Implementar triage/prioridad.
- Implementar nivel de sistemas e información compartida.
- Implementar rediseños de proceso soportados.
- Comparar costo, servicio y ROI.

### Entregable

Una sesión de dos rondas donde una inversión modifica el sistema y su efecto puede analizarse.

### Restricción

Efectos cuantitativos definitivos dependen de validar reglas académicas. Hasta entonces usar presets marcados como provisionales.

### Commits sugeridos

1. `feat: add simulation budget and ledger`
2. `feat: apply staffing investments`
3. `feat: apply equipment capacity investments`
4. `feat: enable cross trained resources`
5. `feat: configure triage queue discipline`
6. `feat: model information system investment`
7. `feat: compare investment outcomes`

## M7 - Arte, audio y accesibilidad

### Objetivo

Reemplazar greybox por una experiencia coherente, legible y performante.

### Trabajo

- Confirmar derechos y política de logos.
- Rectificar planos autorizados.
- Crear kit modular en Blender.
- Modelar props prioritarios.
- Diseñar materiales acuarelados.
- Hornear iluminación y optimizar GLB/texturas.
- Agregar audio espacial y subtítulos.
- Completar opciones de accesibilidad.
- Testear tutorial con usuarios no gamers.

### Entregable

Hospital visualmente final, reconocible respecto de las referencias y usable sin depender de audio/color.

### Commits sugeridos

Agrupar por sala o sistema, evitando commits masivos de assets sin contexto.

## M8 - Hardening y release

### Objetivo

Publicar una versión estable y verificable.

### Trabajo

- Matriz de navegadores y hardware.
- Profiling CPU/GPU/memoria.
- Optimizar carga inicial y assets.
- Validar PWA offline y actualización de cache.
- Ejecutar suite E2E en build de producción.
- Revisar accesibilidad y textos.
- Validar schemas de exportación.
- Documentar reglas vigentes y limitaciones.
- Etiquetar release y verificar Pages.

### Entregable

Release público con build reproducible, documentación y checklist de aceptación completo.

## 5. Backlog posterior al MVP

- Multijugador autoritativo con Colyseus.
- Lobby, asignación de roles y reconexión.
- Modo profesor/director en vivo.
- Editor de escenarios.
- Dashboard de cohortes/equipos.
- Integración opcional con QR/cámara.
- Layout editable avanzado.
- Shocks operativos durante la ronda.
- Más variabilidad de clientes y service recovery.
- Soporte táctil completo y gamepad.

## 6. Estrategia de ramas y commits

- `main` siempre desplegable.
- Features pequeñas integradas mediante PR o commits revisables.
- Un commit por cambio lógico y sus tests.
- Assets y código que los consume en commits cercanos pero distinguibles.
- No versionar exportaciones, caches ni fuentes pesadas sin licencia.
- Mantener `gh-pages` como salida generada, no rama de desarrollo.

## 7. Gates de calidad

Cada merge a `main` debe cumplir:

- format/lint;
- typecheck;
- unit tests;
- tests de invariantes cuando toque dominio;
- build de producción;
- smoke E2E;
- `git diff --check`;
- actualización documental si cambian reglas o decisiones.

## 8. Riesgos y mitigaciones

| Riesgo | Impacto | Mitigación |
|---|---|---|
| reglas incompletas | modelo incorrecto | configuración versionada y fixtures provisionales |
| performance 3D | baja usabilidad | greybox temprano, budgets y profiling por hito |
| IA demasiado compleja | demora del slice | planner por reglas antes de comportamiento sofisticado |
| first-person marea/no es accesible | abandono | opciones de cámara y modo sin Pointer Lock |
| arte consume el proyecto | retraso del aprendizaje | arte después del vertical slice |
| assets sin permiso | imposibilidad de publicar | placeholders propios hasta autorización |
| replay costoso | pérdida del valor educativo | event log desde M1 y replay desde M5 |
| acoplamiento renderer/dominio | tests frágiles | puertos/adaptadores y core TypeScript puro |

## 9. Decisiones necesarias por checkpoint

### Antes de M1 completo

- tiempos exactos por estación;
- fórmula de penalidad;
- costos por ronda o sesión;
- ruta posterior a análisis.

### Antes de M3

- escala y conexión de salas;
- cantidad inicial de recursos;
- comportamiento al llegar a 300 segundos.

### Antes de M6

- efectos cuantitativos de inversiones;
- presupuesto inicial;
- definición de ROI esperada.

### Antes de M7

- derechos de imágenes, logos y materiales;
- dirección visual aprobada.

## 10. Próxima acción concreta

Comenzar M0 con el scaffold técnico y dejar CI/Pages funcionando antes de implementar el motor. El primer PR o conjunto de commits no debe contener todavía modelos 3D definitivos.
