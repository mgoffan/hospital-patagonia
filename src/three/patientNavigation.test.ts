import { describe, expect, it } from "vitest";

import {
  createRoundConfiguration,
  DEFAULT_CONFIGURATION,
} from "../domain/configuration";
import { runSimulation } from "../simulation/engine";
import {
  FLOOR_ROUTES,
  patientServiceVisits,
  RECEPTION,
  RECEPTION_QUEUE,
  SEAT_APPROACHES,
  STANDING_POSITIONS,
  routeOnFloor,
  reserveWaitingSlot,
  waitingAssignments,
  type FloorPoint,
} from "./patientNavigation";

const radius = 0.27;
const rectangles: readonly [number, number, number, number][] = [
  [-7.5, -4.7, 4.675, 5.725], // administration desk
  [-11.2, -8, 6.375, 7.025], // administration counter
  [-4.3, -3.4, -4.275, -2.025],
  [0.7, 1.6, -4.275, -2.025], // examination beds
  [7.275, 9.525, -4.25, -3.35], // x-ray bed
  [-12.53, -11.87, -2.73, -2.07], // nursing chair
  ...[2.5, 5, 7.5].flatMap((x): [number, number, number, number][] =>
    [4.1, 6.6].map((z) => [x - 0.33, x + 0.33, z - 0.32, z + 0.34]),
  ),
];
const doors = [-11, -5.5, -0.5, 4.5, 10.5];

function checkClear(point: FloorPoint) {
  const [x, z] = point;
  for (const [minX, maxX, minZ, maxZ] of rectangles) {
    const separation = Math.hypot(
      Math.max(minX - x, 0, x - maxX),
      Math.max(minZ - z, 0, z - maxZ),
    );
    expect(separation).toBeGreaterThan(radius);
  }
  if (Math.abs(z) < 0.12 + radius) {
    expect(doors.some((doorX) => Math.abs(x - doorX) < 0.775 - radius)).toBe(
      true,
    );
  }
  if (z < -0.4) {
    expect(
      [-8, -3, 2, 7].every((wallX) => Math.abs(x - wallX) > 0.12 + radius),
    ).toBe(true);
  }
  for (const doorX of doors) {
    const leafX = doorX - 0.775;
    if (z >= -0.08 && z <= 1.55)
      expect(Math.abs(x - leafX)).toBeGreaterThan(0.045 + radius);
  }
}

describe("patient floor navigation", () => {
  it("keeps every painted segment orthogonal and clear of doors, walls and furniture", () => {
    for (const { from, to } of FLOOR_ROUTES) {
      expect(from[0] === to[0] || from[1] === to[1]).toBe(true);
      const distance = Math.hypot(to[0] - from[0], to[1] - from[1]);
      for (let step = 0; step <= Math.ceil(distance / 0.05); step += 1) {
        const fraction = step / Math.ceil(distance / 0.05);
        checkClear([
          from[0] + (to[0] - from[0]) * fraction,
          from[1] + (to[1] - from[1]) * fraction,
        ]);
      }
    }
  });

  it("routes the arrival, stations, seats, overflow and exit on the painted network", () => {
    const journeys: readonly [FloorPoint, FloorPoint, boolean?, boolean?][] = [
      [[0, 8.15], RECEPTION],
      [RECEPTION, [-11.7, -3.35], true],
      [[-11.7, -3.35], SEAT_APPROACHES[0] ?? [2.5, 3.42], false, true],
      [[-9.5, -3.35], SEAT_APPROACHES[1] ?? [5, 3.42], false, true],
      [SEAT_APPROACHES[5] ?? [7.5, 5.92], [-5.12, -3.15]],
      [[-5.12, -3.15], [10.88, -2.8], false, true],
      [[10.88, -2.8], RECEPTION, false, true],
      [RECEPTION, [0, 8.8], true],
      [RECEPTION_QUEUE[0] ?? [0.9, 7.15], RECEPTION],
      [RECEPTION, STANDING_POSITIONS[0] ?? [-2.55, 7.15], true],
    ];
    for (const [
      start,
      destination,
      leavingReception,
      leavingClinical,
    ] of journeys) {
      const route = routeOnFloor(
        start,
        destination,
        leavingReception,
        leavingClinical,
      );
      expect(route[0]).toEqual(start);
      expect(route.at(-1)).toEqual(destination);
      for (let index = 1; index < route.length; index += 1) {
        const from = route[index - 1];
        const to = route[index];
        if (!from || !to) continue;
        expect(from[0] === to[0] || from[1] === to[1]).toBe(true);
        const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
        for (let step = 0; step <= Math.ceil(length / 0.05); step += 1) {
          const fraction = step / Math.max(1, Math.ceil(length / 0.05));
          checkClear([
            from[0] + (to[0] - from[0]) * fraction,
            from[1] + (to[1] - from[1]) * fraction,
          ]);
        }
      }
    }
    for (const destination of [...SEAT_APPROACHES, ...STANDING_POSITIONS]) {
      expect(routeOnFloor(RECEPTION, destination, true).at(-1)).toEqual(
        destination,
      );
      expect(routeOnFloor(destination, [-11.7, -3.35]).at(-1)).toEqual([
        -11.7, -3.35,
      ]);
    }
    for (const queuePosition of RECEPTION_QUEUE) {
      expect(routeOnFloor([0, 8.15], queuePosition).at(-1)).toEqual(
        queuePosition,
      );
      expect(routeOnFloor(queuePosition, RECEPTION).at(-1)).toEqual(RECEPTION);
    }
    const intoDoctor = routeOnFloor([-11.25, 2.05], [-5.12, -3.15]);
    expect(intoDoctor).toContainEqual([-5.12, 2.05]);
    const intoNursing = routeOnFloor([-3.05, 2.05], [-11.7, -3.35]);
    expect(intoNursing).toContainEqual([-10.62, 2.85]);
    const outOfDoctor = routeOnFloor([-5.12, -3.15], RECEPTION, false, true);
    expect(outOfDoctor).toContainEqual([-5.75, 2.05]);
    const finalExit = routeOnFloor(RECEPTION, [0, 8.8], true);
    expect(finalExit).toContainEqual([-3.05, 2.85]);
    expect(finalExit).not.toContainEqual([-3.8, 8.15]);
    const stoppedShort = routeOnFloor([-6.02, 6.9], [0, 8.8], true);
    expect(stoppedShort).toContainEqual([-3.05, 2.85]);
    expect(stoppedShort).not.toContainEqual([-3.8, 8.15]);
    const afterRegistration = routeOnFloor([-6.02, 6.9], [-11.7, -3.35], true);
    expect(afterRegistration).toContainEqual([-3.05, 7.25]);
    expect(afterRegistration).toContainEqual([-3.05, 2.05]);
  });

  it("reserves only six chairs and keeps overflow patients standing in unique places", () => {
    const physicalReservations = new Map<string, number>();
    const assignedSlots = Array.from({ length: 26 }, (_, index) =>
      reserveWaitingSlot(physicalReservations, `waiting-${String(index)}`),
    );
    expect(assignedSlots.slice(0, 6)).toEqual([0, 1, 2, 3, 4, 5]);
    expect(assignedSlots.slice(6)).toEqual(
      Array.from({ length: 20 }, (_, index) => index + 6),
    );
    physicalReservations.delete("waiting-2");
    expect(reserveWaitingSlot(physicalReservations, "replacement")).toBe(2);

    const configuration = createRoundConfiguration(
      { ...DEFAULT_CONFIGURATION, demandId: "high" },
      { id: "navigation-test", createdAt: "2026-09-16T00:00:00.000Z" },
    );
    const simulation = runSimulation(configuration);
    let overflowSeen = false;
    for (let elapsed = 0; elapsed <= simulation.durationMs; elapsed += 1000) {
      const assignments = waitingAssignments(simulation, elapsed);
      const slots = [...assignments.values()];
      expect(new Set(slots).size).toBe(slots.length);
      expect(Math.max(...slots, 0)).toBeLessThan(
        SEAT_APPROACHES.length + STANDING_POSITIONS.length,
      );
      if (slots.some((slot) => slot >= SEAT_APPROACHES.length))
        overflowSeen = true;
    }
    expect(overflowSeen).toBe(true);
  });

  it("closes each visit at its matching service-completed event", () => {
    const configuration = createRoundConfiguration(DEFAULT_CONFIGURATION, {
      id: "service-visit-test",
      createdAt: "2026-09-16T00:00:00.000Z",
    });
    const simulation = runSimulation(configuration);
    const visits = patientServiceVisits(simulation);
    for (const [patientId, patientVisits] of visits) {
      for (const visit of patientVisits) {
        const completion = simulation.events.find(
          (event) =>
            event.type === "serviceCompleted" &&
            event.patientId === patientId &&
            event.stationId === visit.stationId &&
            event.atMs >= visit.startAtMs,
        );
        expect(visit.endAtMs).toBe(completion?.atMs ?? simulation.durationMs);
      }
    }
  });
});
