# Modelo de dominio

## 1. Principios

- El motor es TypeScript puro y no conoce React, Three.js ni Rapier.
- La simulación usa tiempo lógico, no timestamps de render.
- Todo cambio relevante produce un evento inmutable.
- Las reglas son configuración versionada.
- Jugador e IA envían los mismos comandos.
- La representación 3D refleja el dominio; nunca es su fuente de verdad.

## 2. Contextos

### Configuración

Define escenarios, reglas, recursos iniciales, costos, rutas y mejoras disponibles.

### Operación

Administra reloj, pacientes, colas, estaciones, recursos y comandos.

### Economía

Calcula ingresos, costos, penalidades e inversiones.

### Analítica

Proyecta métricas y replay desde el event log.

### Presentación

Proyecta estado del dominio hacia objetos, animaciones, HUD y audio.

## 3. Agregados principales

### Session

Raíz de una ejecución.

```ts
type Session = {
  id: SessionId;
  scenarioId: ScenarioId;
  scenarioVersion: number;
  rulesVersion: number;
  seed: string;
  phase: SessionPhase;
  simulationTimeMs: number;
  selectedRole: RoleId;
  round: number;
  investments: InvestmentId[];
};

type SessionPhase =
  | "briefing"
  | "tutorial"
  | "ready"
  | "running"
  | "closing"
  | "debrief"
  | "completed";
```

### Scenario

```ts
type Scenario = {
  id: ScenarioId;
  version: number;
  name: string;
  durationMs: number;
  arrivalSchedule: ArrivalDefinition[];
  stations: StationDefinition[];
  resources: ResourceDefinition[];
  routes: ProcessRoute[];
  economy: EconomyRules;
  timeoutRules: TimeoutRules;
  availableInvestments: InvestmentDefinition[];
};
```

### Patient

```ts
type Patient = {
  id: PatientId;
  externalCode?: string;
  kind: "normal" | "key";
  requiresAnalysis: boolean;
  state: PatientState;
  currentStationId?: StationId;
  currentQueueId?: QueueId;
  assignedResourceId?: ResourceId;
  arrivedAtMs?: number;
  dischargedAtMs?: number;
  timedOutAtMs?: number;
};
```

### Station

```ts
type Station = {
  id: StationId;
  type: StationType;
  capacity: number;
  queueId: QueueId;
  activeServiceIds: ServiceId[];
  enabled: boolean;
};

type StationType =
  | "admission"
  | "nursing"
  | "consultation"
  | "laboratory"
  | "radiology"
  | "doctorReview"
  | "discharge";
```

### Queue

```ts
type Queue = {
  id: QueueId;
  discipline: "fifo" | "priority";
  patientIds: PatientId[];
  maximumLength?: number;
};
```

### Resource

```ts
type Resource = {
  id: ResourceId;
  role: RoleId;
  skills: StationType[];
  state: "idle" | "reserved" | "moving" | "working" | "blocked";
  stationId?: StationId;
  serviceId?: ServiceId;
  efficiency: number;
};
```

### Service

Representa una atención concreta, separada del paciente y de la estación.

```ts
type Service = {
  id: ServiceId;
  patientId: PatientId;
  stationId: StationId;
  resourceId: ResourceId;
  state: "reserved" | "inProgress" | "completed" | "cancelled";
  reservedAtMs: number;
  startedAtMs?: number;
  expectedEndAtMs?: number;
  completedAtMs?: number;
};
```

## 4. Estados del paciente

```text
scheduled
  -> arrived
  -> queuedForAdmission
  -> beingAdmitted
  -> queuedForNursing
  -> beingTriaged
  -> queuedForConsultation
  -> beingExamined
      -> queuedForAnalysis
      -> queuedForDischarge
  -> beingAnalyzed
  -> queuedForDoctorReview
  -> beingReviewed
  -> queuedForDischarge
  -> beingDischarged
  -> discharged

Desde estados no terminales:
  -> timedOut
  -> abandoned
  -> invalid
```

`timedOut` indica incumplimiento del nivel de servicio. La configuración decidirá si el paciente continúa operativamente o abandona; no deben confundirse ambos conceptos.

## 5. Comandos

Los comandos expresan intención y pueden rechazarse.

```ts
type SimulationCommand =
  | { type: "START_SESSION" }
  | { type: "ADMIT_PATIENT"; patientId: PatientId; actorId: ResourceId }
  | { type: "START_TRIAGE"; patientId: PatientId; actorId: ResourceId }
  | { type: "ROUTE_PATIENT"; patientId: PatientId; destination: StationId }
  | { type: "START_SERVICE"; patientId: PatientId; stationId: StationId; actorId: ResourceId }
  | { type: "REQUEST_ANALYSIS"; patientId: PatientId; actorId: ResourceId }
  | { type: "COMPLETE_SERVICE"; serviceId: ServiceId; actorId: ResourceId }
  | { type: "DISCHARGE_PATIENT"; patientId: PatientId; actorId: ResourceId }
  | { type: "APPLY_INVESTMENT"; investmentId: InvestmentId }
  | { type: "ADVANCE_TIME"; deltaMs: number }
  | { type: "END_SESSION" };
```

### Resultado de comando

```ts
type CommandResult =
  | { ok: true; events: SimulationEvent[] }
  | { ok: false; reason: CommandRejection };
```

Ejemplos de rechazo:

- rol sin habilidad;
- paciente en estado incorrecto;
- estación sin capacidad;
- recurso ocupado;
- sesión fuera de fase;
- inversión sin presupuesto.

## 6. Eventos

```ts
type SimulationEvent = {
  id: EventId;
  sessionId: SessionId;
  sequence: number;
  simulationTimeMs: number;
  type: SimulationEventType;
  actorId?: ResourceId;
  patientId?: PatientId;
  stationId?: StationId;
  payload: Record<string, unknown>;
};
```

Eventos iniciales:

- `SESSION_STARTED`
- `PATIENT_SCHEDULED`
- `PATIENT_ARRIVED`
- `PATIENT_ENQUEUED`
- `PATIENT_DEQUEUED`
- `RESOURCE_RESERVED`
- `RESOURCE_RELEASED`
- `SERVICE_STARTED`
- `SERVICE_COMPLETED`
- `ANALYSIS_REQUESTED`
- `PATIENT_ROUTED`
- `PATIENT_TIMED_OUT`
- `PATIENT_ABANDONED`
- `PATIENT_DISCHARGED`
- `REVENUE_RECOGNIZED`
- `COST_RECOGNIZED`
- `INVESTMENT_APPLIED`
- `SESSION_ENDED`

`sequence` ordena eventos con el mismo tiempo lógico y evita depender del reloj del dispositivo.

## 7. Scheduler

El scheduler mantiene una cola priorizada por:

1. `dueTimeMs`;
2. prioridad de evento definida;
3. secuencia de inserción.

Eventos programados típicos:

- llegada de paciente;
- fin esperado de servicio;
- timeout;
- abandono;
- fin de ronda.

El scheduler debe soportar avance por ticks fijos en juego y salto al próximo evento en tests.

## 8. Disciplina de colas

El escenario inicial puede usar:

- FIFO en admisión, análisis y egreso;
- FIFO o prioridad en Enfermería;
- prioridad por triage en Guardia cuando la mejora esté activa.

La disciplina es configuración. Una cola nunca se reordena por posición visual del NPC.

## 9. Duraciones

```ts
type DurationRule =
  | { kind: "fixed"; milliseconds: number }
  | { kind: "choice"; valuesMs: number[]; weights?: number[] }
  | { kind: "range"; minMs: number; maxMs: number }
  | { kind: "distribution"; distribution: "triangular"; minMs: number; modeMs: number; maxMs: number };
```

Toda variabilidad usa el generador pseudoaleatorio de la sesión. Ninguna duración debe usar `Math.random()` directamente.

## 10. Economía

```ts
type EconomyRules = {
  initialBudget: number;
  revenueByPatientKind: Record<Patient["kind"], number>;
  costs: CostRule[];
  penalties: PenaltyRule[];
};
```

El ledger registra movimientos, no sólo un balance acumulado:

```ts
type LedgerEntry = {
  id: string;
  simulationTimeMs: number;
  category: "revenue" | "staff" | "maintenance" | "investment" | "penalty";
  amount: number;
  patientId?: PatientId;
  resourceId?: ResourceId;
  investmentId?: InvestmentId;
};
```

## 11. Inversiones como transformaciones

Una inversión no contiene lógica de UI. Aplica un cambio validado a la configuración de la siguiente ronda.

```ts
type InvestmentEffect =
  | { type: "ADD_RESOURCE"; resource: ResourceDefinition }
  | { type: "CHANGE_CAPACITY"; stationId: StationId; delta: number }
  | { type: "CHANGE_DURATION"; stationType: StationType; factor: number }
  | { type: "ADD_SKILL"; role: RoleId; stationType: StationType; efficiency: number }
  | { type: "CHANGE_QUEUE_DISCIPLINE"; queueId: QueueId; discipline: Queue["discipline"] }
  | { type: "ENABLE_INFORMATION_SYSTEM"; level: number };
```

## 12. IA de coworkers

La IA observa una proyección autorizada del dominio y produce comandos. Prioridad inicial:

1. completar una tarea en curso;
2. tomar el paciente válido con mayor prioridad;
3. entregar un handoff bloqueante;
4. cubrir otra estación si tiene flexibilidad;
5. permanecer disponible.

La IA no puede teletransportar pacientes ni acceder a información que el rol no tendría.

## 13. Proyecciones

### Estado jugable

Estado actual necesario para interacción y render.

### Dashboard

KPIs derivados sin modificar eventos históricos.

### Replay

Snapshots reconstruibles por tiempo lógico. Para performance se pueden guardar checkpoints periódicos más los eventos posteriores.

### Exportación

Incluye configuración, log, ledger y métricas, con versiones de schema.

## 14. Invariantes

- Un paciente pertenece como máximo a una cola.
- Un paciente tiene como máximo un servicio activo.
- Un recurso tiene como máximo una asignación incompatible.
- Servicios activos por estación `<= capacity`.
- Eventos están ordenados por tiempo y secuencia.
- Estados terminales no retornan al proceso.
- Cada ingreso, costo y penalidad se reconoce una sola vez.
- Un paciente no egresa sin completar su ruta requerida.
- El estado reconstruido desde eventos coincide con el estado persistido.

## 15. Compatibilidad QR

El contenido QR es una entrada externa, no el modelo del paciente.

```ts
function patientFromLegacyQr(code: string): PatientSeed {
  const value = Number.parseInt(code, 10);
  return {
    externalCode: code,
    kind: value % 5 === 0 ? "key" : "normal",
    requiresAnalysis: value % 3 === 0,
  };
}
```

El adaptador debe validar códigos vacíos, no numéricos y duplicados. Las reglas de divisibilidad quedan encapsuladas y pueden retirarse sin cambiar `Patient`.
