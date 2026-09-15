import { describe, expect, it } from "vitest";

import {
  DEFAULT_CONFIGURATION,
  createRoundConfiguration,
} from "../domain/configuration";
import { runSimulation } from "./engine";
import { ARRIVAL_SCHEDULES } from "./scenarios";

function configuration(overrides = {}) {
  return createRoundConfiguration(
    {
      ...DEFAULT_CONFIGURATION,
      ...overrides,
      resources: { ...DEFAULT_CONFIGURATION.resources },
    },
    { id: "round-1", createdAt: "2026-09-14T00:00:00.000Z" },
  );
}

describe("simulation engine", () => {
  it("contains the four observed demand fixtures", () => {
    expect(ARRIVAL_SCHEDULES.low).toHaveLength(8);
    expect(ARRIVAL_SCHEDULES.medium).toHaveLength(17);
    expect(ARRIVAL_SCHEDULES.intermediate).toHaveLength(28);
    expect(ARRIVAL_SCHEDULES.high).toHaveLength(49);
  });

  it("is deterministic for a configuration and seed", () => {
    const first = runSimulation(configuration());
    const second = runSimulation(configuration());

    expect(second.events).toEqual(first.events);
    expect(second.patients).toEqual(first.patients);
    expect(second.results).toEqual(first.results);
  });

  it("keeps every station within configured capacity", () => {
    const result = runSimulation(configuration({ demandId: "high" }));
    const active = new Map<string, Set<number>>();

    for (const event of result.events) {
      if (!event.stationId || event.resourceSlot === undefined) continue;
      const slots = active.get(event.stationId) ?? new Set<number>();
      if (event.type === "serviceStarted") slots.add(event.resourceSlot);
      if (event.type === "serviceCompleted") slots.delete(event.resourceSlot);
      active.set(event.stationId, slots);

      const station = result.stations.find(
        (candidate) => candidate.stationId === event.stationId,
      );
      expect(slots.size).toBeLessThanOrEqual(station?.capacity ?? 0);
    }
  });

  it("marks blocked patients as work in progress when ray capacity is zero", () => {
    const result = runSimulation(
      createRoundConfiguration(
        {
          ...DEFAULT_CONFIGURATION,
          demandId: "low",
          resources: {
            ...DEFAULT_CONFIGURATION.resources,
            xrayOperator: 0,
          },
        },
        { id: "round-1", createdAt: "2026-09-14T00:00:00.000Z" },
      ),
    );

    expect(result.results.operations.workInProgress).toBeGreaterThan(0);
    expect(
      result.patients.some(
        (patient) => patient.requiresXray && patient.status === "pending",
      ),
    ).toBe(true);
    for (const patient of result.patients) {
      expect(patient.totalServiceMs).toBeLessThanOrEqual(
        result.durationMs - patient.arrivedAtMs,
      );
    }
  });

  it("uses the legacy divisibility rules for patient attributes", () => {
    const result = runSimulation(configuration({ demandId: "low" }));
    const patientFive = result.patients.find((patient) => patient.code === 5);
    const patientSix = result.patients.find((patient) => patient.code === 6);

    expect(patientFive).toMatchObject({ kind: "vip", requiresXray: false });
    expect(patientSix).toMatchObject({
      kind: "standard",
      requiresXray: true,
    });
  });
});
