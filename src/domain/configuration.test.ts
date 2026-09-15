import { describe, expect, it } from "vitest";

import {
  DEFAULT_CONFIGURATION,
  calculateOperatingCost,
  createRoundConfiguration,
  validateRoundConfiguration,
} from "./configuration";

describe("round configuration", () => {
  it("calculates staff and maintenance costs", () => {
    expect(calculateOperatingCost(DEFAULT_CONFIGURATION.resources, false)).toBe(
      250,
    );
    expect(calculateOperatingCost(DEFAULT_CONFIGURATION.resources, true)).toBe(
      300,
    );
  });

  it("requires the three core roles", () => {
    const errors = validateRoundConfiguration({
      ...DEFAULT_CONFIGURATION,
      resources: { ...DEFAULT_CONFIGURATION.resources, doctor: 0 },
    });

    expect(errors).toContain("Necesitás al menos un médico.");
  });

  it("creates an immutable, trimmed snapshot", () => {
    const draft = {
      ...DEFAULT_CONFIGURATION,
      name: "  Equipo Cóndor  ",
      resources: { ...DEFAULT_CONFIGURATION.resources },
    };
    const snapshot = createRoundConfiguration(draft, {
      id: "round-1",
      createdAt: "2026-09-14T00:00:00.000Z",
    });

    draft.resources.doctor = 3;

    expect(snapshot.name).toBe("Equipo Cóndor");
    expect(snapshot.resources.doctor).toBe(1);
    expect(Object.isFrozen(snapshot)).toBe(true);
    expect(Object.isFrozen(snapshot.resources)).toBe(true);
  });
});
