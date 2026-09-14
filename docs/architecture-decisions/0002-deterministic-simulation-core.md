# ADR 0002: Motor determinista separado del renderer

- Estado: aceptada
- Fecha: 2026-09-14

## Contexto

La simulación debe comparar decisiones con la misma demanda, producir replay y explicar métricas. Si las reglas dependen del framerate, posiciones 3D o `Math.random()`, los resultados no serán reproducibles ni fáciles de testear.

## Decisión

Implementar un core TypeScript puro con reloj lógico, PRNG con semilla, scheduler, comandos y event log. React, Three.js, Rapier y APIs del navegador vivirán en adaptadores y presentación.

## Consecuencias

### Positivas

- tests rápidos sin navegador;
- replay y auditoría por eventos;
- comparación válida entre rondas;
- preparación para servidor autoritativo futuro.

### Negativas

- requiere diseñar contratos y proyecciones;
- el estado visual puede estar ligeramente interpolado respecto del lógico;
- event log y snapshots necesitan versionado.

## Alternativas consideradas

- Estado central en componentes React: acopla reglas y UI.
- Física como fuente de verdad: resultados dependientes del hardware/framerate.
- Simulación continua sin log: dificulta replay y explicación causal.
