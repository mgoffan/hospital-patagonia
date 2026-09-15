import type { SimulationEvent, SimulationResult, StationId } from "./engine";

export type VisualPatientState = {
  id: string;
  code: number;
  kind: "standard" | "vip";
  requiresXray: boolean;
  checkedIn: boolean;
  stationId: StationId;
  activity: "queued" | "inService" | "departing";
  queueIndex: number;
  resourceSlot?: number;
};

type MutableVisualState = VisualPatientState & {
  enteredStateAtMs: number;
};

function applyEvent(
  states: Map<string, MutableVisualState>,
  event: SimulationEvent,
) {
  if (!event.patientId) return;
  const current = states.get(event.patientId);

  if (event.type === "patientDischarged" && current) {
    states.set(event.patientId, {
      id: current.id,
      code: current.code,
      kind: current.kind,
      requiresXray: current.requiresXray,
      checkedIn: current.checkedIn,
      stationId: current.stationId,
      activity: "departing",
      queueIndex: 0,
      enteredStateAtMs: event.atMs,
    });
    return;
  }

  if (
    event.type === "serviceCompleted" &&
    event.stationId === "administration" &&
    current
  ) {
    states.set(event.patientId, {
      ...current,
      checkedIn: true,
      enteredStateAtMs: event.atMs,
    });
    return;
  }

  if (event.type === "patientQueued" && event.stationId && current) {
    states.set(event.patientId, {
      id: current.id,
      code: current.code,
      kind: current.kind,
      requiresXray: current.requiresXray,
      checkedIn: current.checkedIn,
      stationId: event.stationId,
      activity: "queued",
      queueIndex: 0,
      enteredStateAtMs: event.atMs,
    });
    return;
  }

  if (event.type === "serviceStarted" && event.stationId && current) {
    states.set(event.patientId, {
      id: current.id,
      code: current.code,
      kind: current.kind,
      requiresXray: current.requiresXray,
      checkedIn: current.checkedIn,
      stationId: event.stationId,
      activity: "inService",
      queueIndex: 0,
      ...(event.resourceSlot === undefined
        ? {}
        : { resourceSlot: event.resourceSlot }),
      enteredStateAtMs: event.atMs,
    });
  }
}

export function deriveVisualPatientStates(
  simulation: SimulationResult,
  elapsedMs: number,
): VisualPatientState[] {
  const patients = new Map(
    simulation.patients.map((patient) => [patient.id, patient]),
  );
  const states = new Map<string, MutableVisualState>();

  for (const event of simulation.events) {
    if (event.atMs > elapsedMs) break;

    if (event.type === "patientArrived" && event.patientId) {
      const patient = patients.get(event.patientId);
      if (!patient) continue;
      states.set(patient.id, {
        id: patient.id,
        code: patient.code,
        kind: patient.kind,
        requiresXray: patient.requiresXray,
        checkedIn: false,
        stationId: "administration",
        activity: "queued",
        queueIndex: 0,
        enteredStateAtMs: event.atMs,
      });
      continue;
    }

    applyEvent(states, event);
  }

  const queueGroups = new Map<StationId, MutableVisualState[]>();
  for (const state of states.values()) {
    if (state.activity !== "queued") continue;
    const queue = queueGroups.get(state.stationId) ?? [];
    queue.push(state);
    queueGroups.set(state.stationId, queue);
  }

  for (const [patientId, state] of states) {
    if (
      state.activity === "departing" &&
      elapsedMs - state.enteredStateAtMs > 20_000
    ) {
      states.delete(patientId);
    }
  }

  for (const queue of queueGroups.values()) {
    queue
      .sort(
        (left, right) =>
          left.enteredStateAtMs - right.enteredStateAtMs ||
          left.code - right.code,
      )
      .forEach((state, queueIndex) => {
        state.queueIndex = queueIndex;
      });
  }

  return [...states.values()]
    .sort((left, right) => left.code - right.code)
    .map((state) => ({
      id: state.id,
      code: state.code,
      kind: state.kind,
      requiresXray: state.requiresXray,
      checkedIn: state.checkedIn,
      stationId: state.stationId,
      activity: state.activity,
      queueIndex: state.queueIndex,
      ...(state.resourceSlot === undefined
        ? {}
        : { resourceSlot: state.resourceSlot }),
    }));
}
