import { describe, expect, it } from "vitest";

import {
  DEFAULT_CONFIGURATION,
  createRoundConfiguration,
} from "../domain/configuration";
import { runSimulation } from "./engine";
import { deriveVisualPatientStates } from "./visualTimeline";

const configuration = createRoundConfiguration(DEFAULT_CONFIGURATION, {
  id: "visual-timeline-test",
  createdAt: "2026-09-15T00:00:00.000Z",
});

describe("visual simulation timeline", () => {
  const simulation = runSimulation(configuration);

  it("hides patients before their actual arrival", () => {
    expect(deriveVisualPatientStates(simulation, 0)).toEqual([]);
  });

  it("reflects the latest queue or service event", () => {
    const firstArrival = simulation.events.find(
      (event) => event.type === "patientArrived",
    );
    expect(firstArrival).toBeDefined();
    const visible = deriveVisualPatientStates(
      simulation,
      firstArrival?.atMs ?? 0,
    );
    expect(visible[0]).toMatchObject({
      id: "patient-01",
      stationId: "administration",
    });
  });

  it("removes discharged patients from the active floor", () => {
    const discharge = simulation.events.find(
      (event) => event.type === "patientDischarged",
    );
    expect(discharge?.patientId).toBeDefined();
    const visible = deriveVisualPatientStates(simulation, discharge?.atMs ?? 0);
    expect(visible.some((patient) => patient.id === discharge?.patientId)).toBe(
      false,
    );
  });
});
