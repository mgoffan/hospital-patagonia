import { describe, expect, it } from "vitest";

import {
  DEFAULT_CONFIGURATION,
  createRoundConfiguration,
} from "./configuration";
import { calculateRoundResult } from "./results";

describe("round results", () => {
  it("separates patient outcomes from P&L", () => {
    const configuration = createRoundConfiguration(DEFAULT_CONFIGURATION, {
      id: "round-1",
      createdAt: "2026-09-14T00:00:00.000Z",
    });

    const result = calculateRoundResult(configuration, [
      { patientId: "1", kind: "standard", status: "onTime" },
      { patientId: "2", kind: "vip", status: "onTime" },
      { patientId: "3", kind: "vip", status: "late" },
      { patientId: "4", kind: "standard", status: "pending" },
    ]);

    expect(result.operations).toEqual({
      arrivals: 4,
      servedOnTime: 2,
      vipServedOnTime: 1,
      late: 1,
      workInProgress: 1,
    });
    expect(result.pnl).toEqual({
      revenue: 250,
      staffCost: 250,
      maintenanceCost: 0,
      penalties: 0,
      investments: 0,
      operatingResult: 0,
      netResult: 0,
    });
  });

  it("applies configured penalties without recognizing late revenue", () => {
    const configuration = createRoundConfiguration(DEFAULT_CONFIGURATION, {
      id: "round-1",
      createdAt: "2026-09-14T00:00:00.000Z",
    });

    const result = calculateRoundResult(
      configuration,
      [{ patientId: "vip-late", kind: "vip", status: "late" }],
      { vip: 75 },
    );

    expect(result.pnl.revenue).toBe(0);
    expect(result.pnl.penalties).toBe(75);
    expect(result.pnl.netResult).toBe(-325);
  });
});
