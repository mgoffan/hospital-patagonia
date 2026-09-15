# Economía y resultados de la partida

## Principio

La simulación reporta dos resultados relacionados pero distintos:

1. **Resultado operativo:** qué pasó con los pacientes y el flujo.
2. **P&L de la ronda:** qué valor económico produjo esa configuración.

El “beneficio” de la webapp actual es en realidad ingreso bruto. El nuevo producto debe evitar ese nombre.

## Reconocimiento de ingresos

| Resultado del paciente | Ingreso |
|---|---:|
| Normal, egresado en `<= 60 s` | `$50` |
| VIP, egresado en `<= 60 s` | `$200` |
| Egresado en `> 60 s` | `$0` |
| Pendiente al cierre | `$0` |

Un ingreso se registra una sola vez, al egreso válido. Que un paciente sea VIP y requiera rayos son atributos independientes.

## P&L de ronda

```text
Ingresos por pacientes atendidos
- Costos de personal
- Mantenimiento de sistemas
- Penalidades por nivel de servicio
= Resultado operativo de la ronda

Resultado operativo de la ronda
- Inversiones realizadas para la ronda
= Resultado neto de la ronda
```

Hasta confirmar la unidad temporal, el MVP trata los costos de personal y mantenimiento como costos por ronda. La configuración conserva `economyVersion` para recalcular o migrar sin perder trazabilidad.

## Ledger mínimo

Cada movimiento debe registrar:

- identificador único;
- ronda y tiempo lógico;
- categoría `revenue`, `staff`, `maintenance`, `penalty` o `investment`;
- importe con signo;
- paciente, recurso o inversión originante;
- versión de reglas.

Los totales del debrief se derivan del ledger; no se actualizan con contadores independientes.

## Panel operativo

- llegadas;
- pacientes atendidos en término;
- pacientes VIP atendidos;
- tardíos;
- WIP al cierre;
- throughput;
- tiempo de ciclo promedio y percentil 90;
- espera por estación;
- utilización por recurso;
- cola máxima y cuello de botella observado.

## Panel económico

- ingreso normal;
- ingreso VIP;
- costo de personal por rol;
- mantenimiento;
- penalidades;
- inversiones;
- resultado operativo;
- resultado neto;
- comparación contra la ronda anterior con la misma demanda y semilla.

## Datos pendientes

La consigna indica penalidades según gravedad pero no contiene su fórmula. Hasta confirmarla, el ledger acepta penalidades configurables con valor inicial `$0` y las identifica como supuesto provisional.

