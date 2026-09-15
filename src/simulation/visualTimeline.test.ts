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
      checkedIn: false,
    });
  });

  it("keeps discharged patients visible while they walk out", () => {
    const discharge = simulation.events.find(
      (event) => event.type === "patientDischarged",
    );
    expect(discharge?.patientId).toBeDefined();
    const visible = deriveVisualPatientStates(simulation, discharge?.atMs ?? 0);
    expect(
      visible.find((patient) => patient.id === discharge?.patientId),
    ).toMatchObject({ activity: "departing", checkedIn: true });
  });

  it("adds the clinical wristband after reception", () => {
    const receptionComplete = simulation.events.find(
      (event) =>
        event.type === "serviceCompleted" &&
        event.stationId === "administration",
    );
    expect(receptionComplete?.patientId).toBeDefined();
    const visible = deriveVisualPatientStates(
      simulation,
      receptionComplete?.atMs ?? 0,
    );
    expect(
      visible.find((patient) => patient.id === receptionComplete?.patientId),
    ).toMatchObject({ checkedIn: true });
  });

  it("marks an unresolved patient late after the webapp threshold", () => {
    const highConfiguration = createRoundConfiguration(
      { ...DEFAULT_CONFIGURATION, demandId: "high" },
      {
        id: "late-visual-test",
        createdAt: "2026-09-15T00:00:00.000Z",
      },
    );
    const highSimulation = runSimulation(highConfiguration);
    const latePatient = highSimulation.patients.find(
      (patient) => patient.status === "late",
    );
    expect(latePatient).toBeDefined();
    const visible = deriveVisualPatientStates(
      highSimulation,
      (latePatient?.arrivedAtMs ?? 0) + 60_001,
    );
    expect(
      visible.find((patient) => patient.id === latePatient?.id),
    ).toMatchObject({ isLate: true });
  });

  it("removes a discharged patient after the visible exit window", () => {
    const discharge = simulation.events.find(
      (event) => event.type === "patientDischarged",
    );
    expect(discharge?.patientId).toBeDefined();
    const visible = deriveVisualPatientStates(
      simulation,
      (discharge?.atMs ?? 0) + 20_001,
    );
    expect(visible.some((patient) => patient.id === discharge?.patientId)).toBe(
      false,
    );
  });
});
