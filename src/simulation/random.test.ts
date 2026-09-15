import { describe, expect, it } from "vitest";

import { createSeededRandom, deterministicInteger } from "./random";

describe("seeded random", () => {
  it("repeats the same sequence", () => {
    const first = createSeededRandom("patagonia");
    const second = createSeededRandom("patagonia");

    expect([first(), first(), first()]).toEqual([second(), second(), second()]);
  });

  it("keeps deterministic integers inside the inclusive range", () => {
    const value = deterministicInteger("patient-1:nurse", 56, 98);

    expect(value).toBeGreaterThanOrEqual(56);
    expect(value).toBeLessThanOrEqual(98);
  });
});
