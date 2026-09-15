# Greybox 3D first-person

## Estado del corte

La aplicación incluye una fase 3D entre la configuración y el debrief. Su objetivo actual es validar escala, lectura de espacios, circulación, cámara y costo de carga antes de incorporar pacientes y tareas interactivas.

El reloj permanece pausado durante este recorrido técnico. Al finalizar, el motor headless procesa la ronda y abre el debrief existente.

## Espacios implementados

- Administración y recepción;
- Enfermería;
- Consultorio 1;
- Consultorio 2;
- Rayos;
- lobby de Administración y espera;
- pasillo clínico transversal;
- Laboratorio;
- perímetro y divisiones con colliders.

La planta es una interpretación jugable de las fotografías, no una reconstrucción métrica. Se utiliza geometría low-poly, pisos codificados por color, cartelería integrada y props provisionales por estación.

## Controles

| Acción | Control |
|---|---|
| Entrar en cámara | botón `Entrar first-person` |
| Moverse | `WASD` o flechas del teclado |
| Mirar | mouse con Pointer Lock |
| Liberar mouse | `Esc` |
| Avanzar/retroceder sin Pointer Lock | controles visibles `↑` / `↓` |
| Girar sin Pointer Lock | controles visibles `↶` / `↷` |
| Terminar recorrido | botón `Finalizar ronda y ver resultados` |

## Stack implementado

| Librería | Versión | Uso |
|---|---:|---|
| React | `19.2.8` | UI y ciclo de pantallas |
| Three.js | `0.186.0` | escena y render WebGL |
| React Three Fiber | `9.7.0` | reconciliación declarativa 3D |
| Drei | `10.7.8` | labels HTML en el mundo |
| React Three Rapier | `2.2.0` | colliders y cuerpo del jugador |

React se fijó en `19.2.8` porque React Three Fiber `9.7.0` declara compatibilidad con React `>=19 <19.3`. No se utilizó `--force` para instalar una combinación fuera de soporte.

## Carga y performance

La ruta de operación y el viewport WebGL usan imports dinámicos separados:

```text
setup / debrief
  -> carga GameOperation
      -> si existe WebGL, carga HospitalViewport + Three + Rapier
```

El bundle inicial no precarga el runtime 3D. Rapier incluye su runtime WASM en el chunk diferido; por eso ese chunk es deliberadamente más pesado y sólo se solicita al entrar en la fase de operación.

## Fallback

Si `WebGLRenderingContext` no existe:

- no se importa el viewport 3D;
- se muestra un mensaje accesible;
- el usuario puede ejecutar igualmente la simulación headless;
- el debrief conserva todas sus funciones.

## Verificación

El smoke test de Playwright usa Google Chrome y verifica:

- carga del setup;
- confirmación de partida;
- creación del canvas WebGL;
- aparición de cartelería dentro de la escena;
- transición al debrief;
- ausencia de errores de consola.

## Pendiente del hito M2/M3

- raycast y foco de objetos;
- prompts contextuales con tecla `E`;
- colisión segura para los pasos accesibles por botón;
- pacientes y coworkers navegando entre anchors;
- navmesh;
- reloj real conectado al mundo;
- medición manual de FPS y compatibilidad en navegadores;
- reemplazo gradual de props provisionales por kit modular derivado de las referencias autorizadas.

## Corrección de planta posterior a validación

La primera revisión confirmó escala general, cámara, colisiones y carga, pero detectó una interpretación incorrecta de las dimensiones de las primitivas. La planta se reconstruyó con medidas totales explícitas y ahora tiene:

- una losa continua de `28 × 18` unidades, sin vacíos entre zonas;
- perímetro cerrado con un único acceso frontal;
- lobby conectado a un pasillo transversal continuo;
- cinco salas independientes al norte del pasillo;
- un vano de puerta visible y transitable por sala;
- muros divisorios completos desde el pasillo hasta el fondo.
