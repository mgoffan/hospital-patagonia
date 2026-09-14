# Stack y arquitectura propuestos

## Estado de esta decisión

Este documento define una arquitectura recomendada para poder elaborar el plan. Las dependencias no se instalaron todavía y las versiones exactas deben fijarse al comenzar la implementación.

## Objetivos técnicos

- Ejecutar el MVP como sitio estático en GitHub Pages.
- Mantener 60 FPS en una notebook de gama media.
- Separar completamente la simulación del render 3D.
- Reproducir una partida a partir de una semilla y un event log.
- Permitir pruebas automáticas sin abrir un navegador 3D.
- Preparar el dominio para multijugador sin exigir un backend en el MVP.
- Cargar progresivamente los assets y ofrecer fallback cuando WebGPU no esté disponible.

## Stack principal

| Capa | Tecnología | Motivo |
|---|---|---|
| Lenguaje | TypeScript estricto | modelo de dominio explícito y refactors seguros |
| Build | Vite | cliente estático rápido y despliegue documentado en GitHub Pages |
| UI | React 19 | ecosistema y composición con React Three Fiber |
| Estilos | Tailwind CSS 4 + CSS variables | HUD y pantallas de debrief consistentes |
| 3D | Three.js | renderer web de referencia |
| React/3D | `@react-three/fiber` 9 | integración declarativa con React 19 |
| Utilidades 3D | `@react-three/drei` | controles, loaders, helpers y overlays |
| Física | `@react-three/rapier` 2 | colisiones y movimiento determinista de alta performance |
| Navegación | Recast Navigation | navmesh y rutas de pacientes/IA |
| Máquinas de estado | XState 5 | pacientes, estaciones, rondas e inversiones |
| Estado de presentación | Zustand | cámara, HUD, selección y preferencias locales |
| Persistencia | IndexedDB mediante Dexie | sesiones, event logs y partidas sin servidor |
| PWA | `vite-plugin-pwa` | instalación y operación offline en el aula |
| Unit tests | Vitest | pruebas rápidas de TypeScript |
| Propiedades | `fast-check` | invariantes del motor de simulación |
| E2E | Playwright | flujos, compatibilidad y performance observable |
| Modelado | Blender | reconstrucción modular y exportación glTF |

## Decisión de renderer

Three.js ofrece `WebGPURenderer`, que intenta usar WebGPU y retrocede a un backend WebGL 2 cuando WebGPU no está disponible. La propuesta es:

- WebGL 2 como baseline funcional del MVP;
- WebGPU como mejora progresiva;
- detección de capacidades al iniciar;
- materiales y efectos que tengan una variante económica;
- ninguna regla de la simulación dependiente del renderer.

Documentación: <https://threejs.org/docs/pages/WebGPURenderer.html>

## Separación de capas

```text
Scenario fixtures / seed
          |
          v
Simulation Core (TypeScript puro)
  - reloj lógico
  - event queue
  - pacientes
  - estaciones y capacidad
  - costos e ingresos
          |
          +--> Event log --> métricas / replay / exportación
          |
          v
Game Adapter
  - comandos del jugador
  - compañeros IA
  - movimiento y proximidad
          |
          v
Presentation
  - React Three Fiber
  - HUD React
  - audio y accesibilidad
```

El core no debe importar React, Three.js, Rapier ni APIs del navegador.

## Motor de simulación

### Reloj

Usar un reloj lógico fijo, independiente de FPS. El renderer puede interpolar posiciones, pero los tiempos de llegada, procesamiento y penalidad deben derivarse del reloj de simulación.

### Event log

Cada cambio relevante genera un evento inmutable:

```ts
type SimulationEvent = {
  id: string;
  sessionId: string;
  simulationTimeMs: number;
  type: string;
  actorId?: string;
  patientId?: string;
  stationId?: string;
  payload: unknown;
};
```

El event log habilita:

- replay;
- auditoría;
- cálculo posterior de métricas;
- exportación;
- sincronización multijugador futura;
- comparación de configuraciones con la misma demanda.

### Entidades de dominio mínimas

- `Scenario`
- `Session`
- `Patient`
- `Role`
- `Station`
- `Queue`
- `Resource`
- `ProcessRoute`
- `Investment`
- `SimulationEvent`
- `MetricSnapshot`

### Estados de paciente propuestos

```text
scheduled
  -> arrived
  -> admissionQueue
  -> admitted
  -> nursingQueue
  -> triaged
  -> doctorQueue
  -> inConsultation
  -> analysisQueue? -> inAnalysis? -> doctorReview?
  -> dischargeQueue
  -> discharged

Estados terminales alternativos:
  abandoned | timedOut | invalid
```

El recorrido debe configurarse como datos; no debe quedar codificado como una cadena de `if` dentro del renderer.

## Relación entre XState y Zustand

- XState mantiene procesos con transiciones válidas: paciente, estación y ronda.
- Zustand mantiene estado efímero de presentación: cámara, menú, dispositivo, volumen y objeto enfocado.
- El event log es la fuente histórica; Zustand no debe convertirse en la base de datos de la partida.

Si el prototipo muestra que XState añade complejidad sin aportar trazabilidad, puede reemplazarse por reducers puros. Esa decisión debe tomarse después de modelar un paciente completo.

## Movimiento, física e IA

- Rapier controla el capsule collider del jugador y colisiones relevantes.
- Recast calcula rutas de pacientes y coworkers.
- Los NPC no necesitan rigid bodies dinámicos completos; pueden usar movimiento cinemático sobre navmesh.
- La lógica de estación reserva un recurso antes de que un paciente comience a desplazarse.
- Un NPC bloqueado debe poder recalcular su ruta sin alterar el estado clínico.

## Pipeline de assets

```text
Fotografías autorizadas
  -> corrección de perspectiva
  -> plano vectorial
  -> kit modular en Blender
  -> materiales estilizados
  -> GLB/glTF
  -> Meshopt + KTX2
  -> gltfjsx
  -> carga progresiva en R3F
```

### Reglas de performance

- Geometría estática combinada por habitación.
- Instancing para sillas, pacientes y props repetidos.
- Lightmaps o iluminación horneada cuando sea posible.
- Sombras dinámicas sólo para personajes y objetos importantes.
- Niveles de detalle para NPC.
- Texturas comprimidas KTX2.
- Modelos comprimidos con Meshopt.
- Lazy loading por zona y pantalla.

## Cámara e interacción first-person

- Pointer Lock en desktop.
- Capsule collider con velocidad constante.
- Interacción contextual con raycast corto.
- Retícula discreta y feedback visual/sonoro.
- Acciones importantes confirmadas por cambio de estado, no sólo por animación.
- Alternativa sin Pointer Lock para accesibilidad y dispositivos táctiles.

## Audio

La Web Audio API es suficiente para:

- sonidos espaciales de salas y equipos;
- llamados y señales de nuevas llegadas;
- feedback de acciones;
- indicación de presión sin depender exclusivamente del HUD.

Todos los mensajes relevantes deben tener subtítulos y control independiente de volumen.

## Persistencia y exportación

En el MVP:

- IndexedDB conserva configuración, sesiones y logs.
- JSON es el formato canónico de exportación.
- CSV/XLSX se genera como formato de análisis.
- Una sesión incluye versión de reglas, semilla y versión del escenario.

No se debe depender de `localStorage` para una partida completa por sus límites y falta de transacciones.

## Despliegue

### MVP

- build estático en GitHub Actions;
- publicación en la rama `gh-pages`;
- base path `/hospital-patagonia/`;
- assets con hash;
- PWA y cache versionado.

Guía oficial de Vite: <https://vite.dev/guide/static-deploy.html>

### Multijugador futuro

GitHub Pages seguirá alojando el cliente. Un servidor externo autoritativo con Colyseus administrará:

- salas;
- roles;
- reloj compartido;
- comandos validados;
- estado sincronizado;
- reconexión;
- event log canónico.

Colyseus: <https://docs.colyseus.io/>

No conviene incorporar ese backend antes de validar el loop single-player y el modelo de dominio.

## Pruebas

### Invariantes del core

- Un paciente no puede estar en dos colas simultáneamente.
- Una estación nunca procesa más pacientes que su capacidad.
- Un recurso no puede estar asignado a dos tareas incompatibles.
- Los ingresos y costos se contabilizan una sola vez.
- El replay de una semilla y una secuencia de comandos produce el mismo resultado.
- Ningún evento puede retroceder el reloj lógico.

### Pruebas visuales y E2E

- carga en el base path de GitHub Pages;
- fallback WebGPU/WebGL 2;
- pointer lock y salida segura;
- guardado y restauración;
- ronda completa de cinco minutos acelerada en test;
- exportación y replay;
- presupuesto de FPS, memoria y tamaño inicial.

## Estructura de código sugerida

```text
src/
  app/             # routing, providers y pantallas
  simulation/      # dominio TypeScript puro
  scenarios/       # fixtures y reglas versionadas
  game/            # adaptación de comandos e IA
  world/           # escenas R3F, salas y assets
  ui/              # HUD, menús y debrief
  audio/            # señales y ambientes
  persistence/     # IndexedDB, import/export
  analytics/       # métricas y replay
  test/            # builders y fixtures
```

## Tecnologías descartadas por ahora

- **Next.js o SSR:** el juego es intensivo en cliente y debe desplegarse como sitio estático; no aportan valor al MVP.
- **Motor Unity exportado a WebGL:** bundle más pesado y peor integración con la aplicación web y GitHub Pages.
- **ECS completo:** con decenas de pacientes, un modelo de actores/estados es más claro; se reevaluará si la escala crece.
- **Backend en el MVP:** impediría el modo offline y retrasaría la validación del loop principal.
