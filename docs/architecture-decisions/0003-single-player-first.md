# ADR 0003: Single-player con coworkers IA antes de multijugador

- Estado: aceptada
- Fecha: 2026-09-14

## Contexto

La actividad original es colaborativa y el multijugador es una evolución valiosa. Sin embargo, networking, sincronización, reconexión y facilitación agregan riesgo antes de validar el proceso, los roles y el valor educativo.

## Decisión

El MVP será single-player. El jugador elige un rol y la IA opera los restantes mediante la misma interfaz de comandos. El dominio se diseñará para que actores humanos o remotos puedan reemplazar a la IA más adelante.

## Consecuencias

### Positivas

- vertical slice completo sin backend;
- pruebas y balance más simples;
- todos los roles pueden evaluarse individualmente;
- modo offline viable.

### Negativas

- no reproduce inicialmente la comunicación entre personas;
- la calidad de la IA afecta la percepción del proceso;
- deberá agregarse infraestructura para el modo aula cooperativo.

## Alternativas consideradas

- Multijugador desde el inicio: demasiado alcance para validar el core.
- Control simultáneo de todos los roles: elimina perspectiva parcial.
- Coworkers instantáneos: útil sólo como fixture temprano, no como experiencia final.
