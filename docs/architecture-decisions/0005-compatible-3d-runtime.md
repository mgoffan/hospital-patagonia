# ADR 0005: Runtime 3D compatible y diferido

- Estado: aceptado
- Fecha: 2026-09-14

## Contexto

La versión más nueva de React disponible al iniciar el greybox era `19.3.0`, pero React Three Fiber `9.7.0` declaraba soporte para React `>=19 <19.3`. Forzar la resolución habría dejado el renderer fuera de la matriz soportada.

Rapier también incorpora un runtime WASM considerable. Cargarlo en la pantalla de configuración perjudicaría el tiempo inicial aunque el usuario todavía no haya entrado al mundo.

## Decisión

- fijar React y React DOM en `19.2.8`;
- fijar React Three Fiber en `9.7.0`;
- fijar Three.js en `0.186.0`;
- fijar Drei en `10.7.8`;
- fijar React Three Rapier en `2.2.0`;
- cargar la fase de operación mediante `React.lazy`;
- cargar el viewport y runtime 3D con un segundo import dinámico condicionado por WebGL;
- no usar flags de npm que ignoren peer dependencies.

## Consecuencias

- el stack queda dentro de los rangos oficialmente declarados;
- la pantalla inicial no precarga Three/Rapier;
- la entrada al mundo tiene un estado de carga explícito;
- el runtime 3D puede actualizarse cuando Fiber amplíe su rango para React 19.3;
- las pruebas DOM no importan WebGL ni generan warnings de Three.

