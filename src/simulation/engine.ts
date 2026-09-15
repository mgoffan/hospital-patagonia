import type { RoundConfiguration } from "../domain/configuration";
import { calculateRoundResult, type RoundResult } from "../domain/results";
import type { ResourceKind } from "../domain/economy";
import { deterministicInteger } from "./random";
import { ARRIVAL_SCHEDULES, ROUND_DURATION_MS } from "./scenarios";

export type StationId = "administration" | "nursing" | "doctor" | "xray";

type Job = {
  patientId: string;
  routeIndex: number;
  enqueuedAtMs: number;
};

type Patient = {
  id: string;
  code: number;
  kind: "standard" | "vip";
  requiresXray: boolean;
  route: StationId[];
  routeIndex: number;
  arrivedAtMs: number;
  dischargedAtMs?: number;
  totalWaitMs: number;
  totalServiceMs: number;
};

type ScheduledEvent =
  | {
      type: "arrival";
      atMs: number;
      order: number;
      patientId: string;
    }
  | {
      type: "serviceComplete";
      atMs: number;
      order: number;
      patientId: string;
      stationId: StationId;
      resourceSlot: number;
      durationMs: number;
    };

type ScheduledEventInput = ScheduledEvent extends infer Event
  ? Event extends ScheduledEvent
    ? Omit<Event, "order">
    : never
  : never;

export type SimulationEventType =
  | "patientArrived"
  | "patientQueued"
  | "serviceStarted"
  | "serviceCompleted"
  | "patientDischarged"
  | "roundClosed";

export type SimulationEvent = {
  id: number;
  atMs: number;
  type: SimulationEventType;
  patientId?: string;
  stationId?: StationId;
  resourceSlot?: number;
  queueLength?: number;
};

export type PatientSummary = {
  id: string;
  code: number;
  kind: "standard" | "vip";
  requiresXray: boolean;
  status: "onTime" | "late" | "pending";
  arrivedAtMs: number;
  dischargedAtMs?: number;
  cycleTimeMs?: number;
  totalWaitMs: number;
  totalServiceMs: number;
};

export type StationSummary = {
  stationId: StationId;
  capacity: number;
  completedServices: number;
  maximumQueueLength: number;
  averageWaitMs: number;
  utilization: number;
};

export type SimulationResult = {
  durationMs: number;
  configuration: RoundConfiguration;
  events: SimulationEvent[];
  patients: PatientSummary[];
  stations: StationSummary[];
  results: RoundResult;
  averageCycleTimeMs: number;
};

type StationState = {
  stationId: StationId;
  capacity: number;
  busySlots: Set<number>;
  queue: Job[];
  maximumQueueLength: number;
  completedServices: number;
  totalWaitMs: number;
  busyTimeMs: number;
};

const stationResource: Record<StationId, ResourceKind> = {
  administration: "administrator",
  nursing: "nurse",
  doctor: "doctor",
  xray: "xrayOperator",
};

const durationTicks: Record<StationId, readonly [number, number]> = {
  administration: [20, 20],
  nursing: [56, 98],
  doctor: [49, 150],
  xray: [56, 98],
};

function buildRoute(requiresXray: boolean): StationId[] {
  return requiresXray
    ? [
        "administration",
        "nursing",
        "doctor",
        "xray",
        "doctor",
        "administration",
      ]
    : ["administration", "nursing", "doctor", "administration"];
}

function eventComparator(left: ScheduledEvent, right: ScheduledEvent) {
  return left.atMs - right.atMs || left.order - right.order;
}

function findFreeSlot(station: StationState) {
  for (let slot = 0; slot < station.capacity; slot += 1) {
    if (!station.busySlots.has(slot)) return slot;
  }
  return null;
}

export function runSimulation(
  configuration: RoundConfiguration,
): SimulationResult {
  const patients = new Map<string, Patient>();
  const events: SimulationEvent[] = [];
  const scheduledEvents: ScheduledEvent[] = [];
  let scheduleOrder = 0;
  let eventId = 0;

  const stationIds: StationId[] = [
    "administration",
    "nursing",
    "doctor",
    "xray",
  ];
  const stations = new Map<StationId, StationState>(
    stationIds.map((stationId) => [
      stationId,
      {
        stationId,
        capacity: configuration.resources[stationResource[stationId]],
        busySlots: new Set<number>(),
        queue: [],
        maximumQueueLength: 0,
        completedServices: 0,
        totalWaitMs: 0,
        busyTimeMs: 0,
      },
    ]),
  );

  const recordEvent = (event: Omit<SimulationEvent, "id">): SimulationEvent => {
    const recorded = { id: eventId, ...event };
    eventId += 1;
    events.push(recorded);
    return recorded;
  };

  const schedule = (event: ScheduledEventInput) => {
    scheduledEvents.push({ ...event, order: scheduleOrder });
    scheduleOrder += 1;
    scheduledEvents.sort(eventComparator);
  };

  const enqueue = (patient: Patient, atMs: number) => {
    const stationId = patient.route[patient.routeIndex];
    if (!stationId) return;
    const station = stations.get(stationId);
    if (!station) throw new Error(`Estación desconocida: ${stationId}`);

    station.queue.push({
      patientId: patient.id,
      routeIndex: patient.routeIndex,
      enqueuedAtMs: atMs,
    });
    station.maximumQueueLength = Math.max(
      station.maximumQueueLength,
      station.queue.length,
    );
    recordEvent({
      atMs,
      type: "patientQueued",
      patientId: patient.id,
      stationId,
      queueLength: station.queue.length,
    });
  };

  const tryStartServices = (stationId: StationId, atMs: number) => {
    const station = stations.get(stationId);
    if (!station) throw new Error(`Estación desconocida: ${stationId}`);

    let freeSlot = findFreeSlot(station);
    while (freeSlot !== null && station.queue.length > 0) {
      const job = station.queue.shift();
      if (!job) break;
      const patient = patients.get(job.patientId);
      if (!patient) throw new Error(`Paciente desconocido: ${job.patientId}`);
      if (patient.routeIndex !== job.routeIndex) {
        throw new Error(`Trabajo desactualizado para ${job.patientId}`);
      }

      const [minimumTicks, maximumTicks] = durationTicks[stationId];
      const durationMs =
        deterministicInteger(
          `${configuration.seed}:${patient.id}:${String(patient.routeIndex)}:${stationId}`,
          minimumTicks,
          maximumTicks,
        ) * 100;
      const waitMs = atMs - job.enqueuedAtMs;
      const activeDurationMs = Math.max(
        0,
        Math.min(durationMs, ROUND_DURATION_MS - atMs),
      );
      patient.totalWaitMs += waitMs;
      patient.totalServiceMs += activeDurationMs;
      station.totalWaitMs += waitMs;
      station.busyTimeMs += activeDurationMs;
      station.busySlots.add(freeSlot);

      recordEvent({
        atMs,
        type: "serviceStarted",
        patientId: patient.id,
        stationId,
        resourceSlot: freeSlot,
        queueLength: station.queue.length,
      });
      schedule({
        type: "serviceComplete",
        atMs: atMs + durationMs,
        patientId: patient.id,
        stationId,
        resourceSlot: freeSlot,
        durationMs,
      });

      freeSlot = findFreeSlot(station);
    }
  };

  ARRIVAL_SCHEDULES[configuration.demandId].forEach((arrivalSeconds, index) => {
    const code = index + 1;
    const patient: Patient = {
      id: `patient-${String(code).padStart(2, "0")}`,
      code,
      kind: code % 5 === 0 ? "vip" : "standard",
      requiresXray: code % 3 === 0,
      route: buildRoute(code % 3 === 0),
      routeIndex: 0,
      arrivedAtMs: arrivalSeconds * 1000,
      totalWaitMs: 0,
      totalServiceMs: 0,
    };
    patients.set(patient.id, patient);
    schedule({
      type: "arrival",
      atMs: patient.arrivedAtMs,
      patientId: patient.id,
    });
  });

  while (scheduledEvents.length > 0) {
    const event = scheduledEvents.shift();
    if (!event || event.atMs > ROUND_DURATION_MS) break;
    const patient = patients.get(event.patientId);
    if (!patient) throw new Error(`Paciente desconocido: ${event.patientId}`);

    if (event.type === "arrival") {
      recordEvent({
        atMs: event.atMs,
        type: "patientArrived",
        patientId: patient.id,
      });
      enqueue(patient, event.atMs);
      tryStartServices("administration", event.atMs);
      continue;
    }

    const station = stations.get(event.stationId);
    if (!station) throw new Error(`Estación desconocida: ${event.stationId}`);
    station.busySlots.delete(event.resourceSlot);
    station.completedServices += 1;
    patient.routeIndex += 1;
    recordEvent({
      atMs: event.atMs,
      type: "serviceCompleted",
      patientId: patient.id,
      stationId: event.stationId,
      resourceSlot: event.resourceSlot,
    });

    if (patient.routeIndex >= patient.route.length) {
      patient.dischargedAtMs = event.atMs;
      recordEvent({
        atMs: event.atMs,
        type: "patientDischarged",
        patientId: patient.id,
      });
    } else {
      const nextStationId = patient.route[patient.routeIndex];
      enqueue(patient, event.atMs);
      if (nextStationId) tryStartServices(nextStationId, event.atMs);
    }
    tryStartServices(event.stationId, event.atMs);
  }

  recordEvent({ atMs: ROUND_DURATION_MS, type: "roundClosed" });

  const patientSummaries: PatientSummary[] = [...patients.values()].map(
    (patient) => {
      const cycleTimeMs = patient.dischargedAtMs
        ? patient.dischargedAtMs - patient.arrivedAtMs
        : undefined;
      const status =
        cycleTimeMs === undefined
          ? "pending"
          : cycleTimeMs <= 60_000
            ? "onTime"
            : "late";

      return {
        id: patient.id,
        code: patient.code,
        kind: patient.kind,
        requiresXray: patient.requiresXray,
        status,
        arrivedAtMs: patient.arrivedAtMs,
        ...(patient.dischargedAtMs === undefined
          ? {}
          : { dischargedAtMs: patient.dischargedAtMs }),
        ...(cycleTimeMs === undefined ? {} : { cycleTimeMs }),
        totalWaitMs: patient.totalWaitMs,
        totalServiceMs: patient.totalServiceMs,
      };
    },
  );

  const completedCycleTimes = patientSummaries.flatMap((patient) =>
    patient.cycleTimeMs === undefined ? [] : [patient.cycleTimeMs],
  );
  const averageCycleTimeMs =
    completedCycleTimes.length === 0
      ? 0
      : completedCycleTimes.reduce((total, time) => total + time, 0) /
        completedCycleTimes.length;

  const stationSummaries = stationIds.map((stationId): StationSummary => {
    const station = stations.get(stationId);
    if (!station) throw new Error(`Estación desconocida: ${stationId}`);
    return {
      stationId,
      capacity: station.capacity,
      completedServices: station.completedServices,
      maximumQueueLength: station.maximumQueueLength,
      averageWaitMs:
        station.completedServices === 0
          ? 0
          : station.totalWaitMs / station.completedServices,
      utilization:
        station.capacity === 0
          ? 0
          : station.busyTimeMs / (station.capacity * ROUND_DURATION_MS),
    };
  });

  const roundResult = calculateRoundResult(
    configuration,
    patientSummaries.map((patient) => ({
      patientId: patient.id,
      kind: patient.kind,
      status: patient.status,
    })),
  );

  return {
    durationMs: ROUND_DURATION_MS,
    configuration,
    events,
    patients: patientSummaries,
    stations: stationSummaries,
    results: roundResult,
    averageCycleTimeMs,
  };
}
