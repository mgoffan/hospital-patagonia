# Motor de simulación implementado

## Estado

El primer motor headless implementa una ronda completa de 300 segundos. No depende de React ni del renderer 3D y produce pacientes, event log, métricas por estación, resultado operativo y P&L.

## Entradas

- snapshot inmutable de configuración;
- fixture de demanda baja, media, intermedia o alta;
- semilla textual;
- cantidades de recursos por rol;
- versión económica.

Los fixtures reproducen exactamente las 8, 17, 28 y 49 llegadas observadas en la webapp de referencia.

## Pacientes provisionales

Hasta incorporar el mazo completo de fichas, cada llegada recibe un código secuencial comenzando en `1` y usa las reglas legacy:

- divisible por `3`: requiere rayos;
- divisible por `5`: VIP;
- ambas condiciones pueden coexistir.

Esta generación es un fixture provisional, no una afirmación sobre el mazo físico completo.

## Rutas

```text
Sin rayos:
Administración -> Enfermería -> Médico -> Administración

Con rayos:
Administración -> Enfermería -> Médico -> Rayos -> Médico -> Administración
```

Administración comparte recursos entre ingreso y egreso. Médicos comparte recursos entre consulta inicial y revisión posterior a rayos.

## Tiempos

| Estación | Regla |
|---|---:|
| Administración | `2,0 s` fijo, supuesto provisional |
| Enfermería | entero `56..98 × 0,1 s` |
| Médico | entero `49..150 × 0,1 s` |
| Rayos | entero `56..98 × 0,1 s` |

La muestra de duración se deriva de `semilla + paciente + visita + estación`. Por eso un mismo paciente conserva sus tiempos potenciales aunque cambie la dotación. Esta técnica de números aleatorios comunes vuelve más justa la comparación entre alternativas.

## Scheduler

- simulación discreta por eventos;
- colas FIFO por estación;
- asignación al primer recurso libre;
- capacidad nunca excedida;
- eventos simultáneos resueltos por orden estable;
- cierre exacto a `300.000 ms`;
- trabajos sin completar permanecen como WIP.

## Event log

Se registran:

- llegada;
- entrada en cola;
- inicio de servicio;
- fin de servicio;
- egreso;
- cierre de ronda.

Cada evento contiene tiempo lógico, paciente, estación, slot del recurso y longitud de cola cuando corresponde.

## Proyección al mundo 3D

`visualTimeline.ts` reduce el event log hasta un instante lógico y genera únicamente estado de presentación:

- pacientes activos;
- estación actual;
- espera o servicio;
- posición dentro de la cola;
- slot de recurso asignado.

El adaptador no modifica las reglas del motor. Esto permite reproducir visualmente una misma semilla y verificar por tests que un paciente no aparece antes de llegar ni permanece después del alta.

## Resultados

### Operación

- llegadas;
- egresados en término;
- VIP en término;
- egresados tarde;
- WIP;
- ciclo promedio;
- espera promedio, cola máxima, servicios y utilización por estación.

### Economía

- ingresos por atención;
- costos de personal;
- mantenimiento;
- penalidades;
- inversiones;
- resultado operativo;
- resultado neto.

## Pendiente para completar M1

- schema runtime y migraciones;
- importador del mazo QR completo;
- persistencia del event log;
- exportación JSON/CSV;
- property tests adicionales;
- comandos interactivos de jugador e IA.
