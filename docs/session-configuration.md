# Configuración de partida

## Objetivo

La primera decisión del jugador ocurre antes de entrar al hospital. Debe armar el turno viendo el costo marginal de cada recurso, confirmar la capacidad comprada y conservar una foto exacta de esa configuración para explicar el resultado posterior.

## Flujo

1. Elegir nombre de partida y semilla.
2. Elegir demanda: baja, media, intermedia o alta.
3. Seleccionar el rol first-person.
4. Definir cantidad de administrativos, enfermeros, médicos y operadores de rayos.
5. Activar, cuando corresponda, mantenimiento de sistemas.
6. Revisar costo operativo estimado e ingresos unitarios.
7. Confirmar la configuración; desde ese momento se guarda como snapshot inmutable de la ronda.

Las inversiones de sistemas, flexibilidad, máquina adicional y rediseño pertenecen al paso entre rondas. En un escenario avanzado podrán habilitarse también antes de la primera ronda.

## Valores iniciales

```ts
const economy = {
  staffCost: {
    doctor: 100,
    nurse: 50,
    xrayOperator: 50,
    administrator: 50,
    systemsMaintenance: 50,
  },
  revenue: {
    standardOnTime: 50,
    vipOnTime: 200,
    late: 0,
  },
  investments: {
    systems: 250,
    xrayMachine: 400,
    flexibility: 200,
    processRedesign: 200,
    triage: 0,
  },
};
```

## Reglas de interfaz

- Mostrar siempre costo unitario, cantidad y subtotal.
- El total se actualiza inmediatamente al modificar recursos.
- Separar “costo operativo del turno” de “inversiones”.
- No presentar los `$50/$200` como ganancia: son ingresos por paciente atendido en término.
- Mostrar que un paciente tarde aporta `$0` antes de penalidades.
- No revelar la secuencia exacta de llegadas al jugador.
- Permitir una semilla visible y copiable para comparar configuraciones.
- Conservar el setup usado aunque el catálogo de costos cambie más adelante.

## Validaciones iniciales

- Al menos un administrativo, un enfermero y un médico.
- Si hay radiología activa, debe existir al menos un operador y una máquina.
- Mantenimiento de sistemas sólo puede cobrarse si el sistema está activo.
- Cantidad visible inicial: `1..3` por rol, coherente con los programas de la actividad.
- La ausencia de presupuesto máximo no bloquea el inicio: el costo sigue siendo parte del P&L.

## Snapshot de configuración

```ts
type RoundConfiguration = {
  id: string;
  name: string;
  seed: string;
  demandId: "low" | "medium" | "intermediate" | "high";
  playerRole: "administrator" | "nurse" | "doctor" | "xrayOperator";
  resources: Record<string, number>;
  activeInvestments: string[];
  economyVersion: number;
  operatingCost: number;
  createdAt: string;
};
```

