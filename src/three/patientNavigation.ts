import type { SimulationResult, StationId } from "../simulation/engine";

export type FloorPoint = readonly [number, number];

export type RouteSegment = {
  from: FloorPoint;
  to: FloorPoint;
  color: string;
};

export const RECEPTION: FloorPoint = [-6.1, 6.9];
export const WAITING_SEATS: readonly FloorPoint[] = [
  [2.5, 4.1],
  [5, 4.1],
  [7.5, 4.1],
  [2.5, 6.6],
  [5, 6.6],
  [7.5, 6.6],
];
export const SEAT_APPROACHES: readonly FloorPoint[] = [
  [2.5, 3.42],
  [5, 3.42],
  [7.5, 3.42],
  [2.5, 5.92],
  [5, 5.92],
  [7.5, 5.92],
];

const CORRIDOR_Z = 2.05;
const RETURN_LANE_Z = 2.85;
const CORRIDOR_X = [
  -11.25, -10.62, -5.75, -5.12, -3.8, -3.05, -2.55, -1.7, -0.85, -0.75, -0.12,
  0, 1.3, 2.5, 3.8, 5, 6.3, 7.5, 9.8, 10.25, 10.65, 10.88, 11.5,
];
const clinicalDoors: readonly [number, number, string][] = [
  [-10.62, -3.35, "#35b96f"],
  [-5.12, -3.15, "#f0c83f"],
  [-0.12, -3.15, "#f09b38"],
  [10.88, -2.8, "#349bc4"],
];

const segments: RouteSegment[] = [];
function add(from: FloorPoint, to: FloorPoint, color: string) {
  segments.push({ from, to, color });
}

add([0, 8.15], [-3.8, 8.15], "#e86f51");
add([-3.8, 8.15], [-3.8, 6.9], "#e86f51");
add([-3.8, 6.9], RECEPTION, "#e86f51");
// The exit side of reception has its own lane. Incoming patients use x=-3.8.
add(RECEPTION, [-6.1, 7.25], "#35b96f");
add([-6.1, 7.25], [-3.05, 7.25], "#35b96f");
add([-3.05, 7.25], [-3.05, CORRIDOR_Z], "#35b96f");
add([-3.8, 6.9], [-3.8, CORRIDOR_Z], "#e86f51");
for (let index = 1; index < CORRIDOR_X.length; index += 1) {
  const previousX = CORRIDOR_X[index - 1];
  const currentX = CORRIDOR_X[index];
  if (previousX === undefined || currentX === undefined) continue;
  add([previousX, CORRIDOR_Z], [currentX, CORRIDOR_Z], "#6ba8a7");
  add([previousX, RETURN_LANE_Z], [currentX, RETURN_LANE_Z], "#6ba8a7");
}
for (const x of CORRIDOR_X) {
  add([x, CORRIDOR_Z], [x, RETURN_LANE_Z], "#6ba8a7");
}
for (const [x, serviceZ, color] of clinicalDoors) {
  add([x, CORRIDOR_Z], [x, serviceZ], color);
}
add([-10.62, -3.35], [-11.7, -3.35], "#35b96f");
add([-10.62, -3.35], [-9.5, -3.35], "#35b96f");
for (const [entranceX, exitX, serviceZ, color] of [
  [-10.62, -11.25, -3.35, "#35b96f"],
  [-5.12, -5.75, -3.15, "#f0c83f"],
  [-0.12, -0.75, -3.15, "#f09b38"],
  [10.88, 10.25, -2.8, "#349bc4"],
] as const) {
  const turnZ = serviceZ - 0.8;
  add([exitX, CORRIDOR_Z], [exitX, turnZ], color);
  add([entranceX, serviceZ], [entranceX, turnZ], color);
  add([entranceX, turnZ], [exitX, turnZ], color);
}
for (const nursingX of [-11.7, -9.5]) {
  add([nursingX, -3.35], [nursingX, -4.15], "#35b96f");
  add([nursingX, -4.15], [-11.25, -4.15], "#35b96f");
}

for (const x of [2.5, 5, 7.5]) {
  add([x, CORRIDOR_Z], [x, 3.42], "#e0bf69");
}
for (const [laneX, seatX] of [
  [1.3, 2.5],
  [3.8, 5],
  [6.3, 7.5],
] as const) {
  add([laneX, CORRIDOR_Z], [laneX, 5.92], "#e0bf69");
  add([laneX, 5.92], [seatX, 5.92], "#e0bf69");
}

export const STANDING_POSITIONS: readonly FloorPoint[] = [
  ...[-2.55, -0.85, 9.8, 11.5].flatMap((x) =>
    [7.15, 6.3, 5.45, 4.6, 3.75].map((z): FloorPoint => [x, z]),
  ),
];

export function reserveWaitingSlot(
  reservations: Map<string, number>,
  patientId: string,
) {
  const existing = reservations.get(patientId);
  if (existing !== undefined) return existing;
  const occupied = new Set(reservations.values());
  let slot = 0;
  while (occupied.has(slot)) slot += 1;
  reservations.set(patientId, slot);
  return slot;
}
const standingRows = [3.75, 4.6, 5.45, 6.3, 7.15];
for (const x of [-1.7, 0, 10.65]) {
  let previousZ = CORRIDOR_Z;
  for (const z of standingRows) {
    add([x, previousZ], [x, z], "#b9aaa0");
    previousZ = z;
  }
}
for (const [parkingX, aisleX] of [
  [-2.55, -1.7],
  [-0.85, 0],
  [9.8, 10.65],
  [11.5, 10.65],
] as const) {
  for (const z of standingRows) {
    add([aisleX, z], [parkingX, z], "#b9aaa0");
  }
}
// Queue spots stay north of the desk and outside the reception exit lane.
export const RECEPTION_QUEUE: readonly FloorPoint[] = [
  [0.9, 7.15],
  [1.8, 7.15],
  [3.6, 7.15],
  [4.5, 7.15],
  [5.9, 7.15],
  [6.8, 7.15],
  [8.6, 7.15],
];
const queueX = [0, 0.9, 1.8, 3.6, 4.5, 5.9, 6.8, 8.6];
for (let index = 1; index < queueX.length; index += 1) {
  const left = queueX[index - 1];
  const right = queueX[index];
  if (left === undefined || right === undefined) continue;
  add([left, 8.15], [right, 8.15], "#e86f51");
}
add([0, 7.15], [0, 8.15], "#e86f51");
for (const point of RECEPTION_QUEUE) {
  add(point, [point[0], 8.15], "#e86f51");
}
add([0, 8.15], [0, 8.8], "#e86f51");

export const FLOOR_ROUTES: readonly RouteSegment[] = segments;

export type ServiceVisit = {
  eventId: number;
  stationId: StationId;
  resourceSlot: number;
  startAtMs: number;
  endAtMs: number;
};

export function patientServiceVisits(simulation: SimulationResult) {
  const visits = new Map<string, ServiceVisit[]>();
  for (const event of simulation.events) {
    if (!event.patientId || !event.stationId) continue;
    const patientVisits = visits.get(event.patientId) ?? [];
    if (event.type === "serviceStarted") {
      patientVisits.push({
        eventId: event.id,
        stationId: event.stationId,
        resourceSlot: event.resourceSlot ?? 0,
        startAtMs: event.atMs,
        endAtMs: simulation.durationMs,
      });
      visits.set(event.patientId, patientVisits);
    }
    if (event.type === "serviceCompleted") {
      for (let index = patientVisits.length - 1; index >= 0; index -= 1) {
        const active = patientVisits[index];
        if (
          active?.stationId !== event.stationId ||
          active.endAtMs !== simulation.durationMs
        )
          continue;
        active.endAtMs = event.atMs;
        break;
      }
    }
  }
  return visits;
}

export function waitingAssignments(
  simulation: SimulationResult,
  elapsedMs: number,
) {
  const assigned = new Map<string, number>();
  for (const event of simulation.events) {
    if (event.atMs > elapsedMs) break;
    if (!event.patientId) continue;
    if (
      event.type === "patientQueued" &&
      event.stationId !== "administration"
    ) {
      const occupied = new Set(assigned.values());
      let slot = 0;
      while (occupied.has(slot)) slot += 1;
      assigned.set(event.patientId, slot);
    }
    if (event.type === "serviceStarted" || event.type === "patientDischarged") {
      assigned.delete(event.patientId);
    }
  }
  return assigned;
}

function key(point: FloorPoint) {
  return `${point[0].toFixed(3)},${point[1].toFixed(3)}`;
}

function distance(a: FloorPoint, b: FloorPoint) {
  return Math.hypot(a[0] - b[0], a[1] - b[1]);
}

function projection(
  point: FloorPoint,
  from: FloorPoint,
  to: FloorPoint,
): FloorPoint {
  if (from[0] === to[0])
    return [
      from[0],
      Math.max(
        Math.min(point[1], Math.max(from[1], to[1])),
        Math.min(from[1], to[1]),
      ),
    ];
  return [
    Math.max(
      Math.min(point[0], Math.max(from[0], to[0])),
      Math.min(from[0], to[0]),
    ),
    from[1],
  ];
}

export function routeOnFloor(
  start: FloorPoint,
  destination: FloorPoint,
  leavingReception = false,
  leavingClinical = false,
): FloorPoint[] {
  const roomForX = (x: number) =>
    x < -8 ? 0 : x < -3 ? 1 : x < 2 ? 2 : x < 7 ? 3 : 4;
  if (
    leavingClinical &&
    start[1] < -0.8 &&
    (destination[1] > -0.8 || roomForX(start[0]) !== roomForX(destination[0]))
  ) {
    const [exitX, turnZ] =
      start[0] < -8
        ? [-11.25, -4.15]
        : start[0] < -3
          ? [-5.75, -3.95]
          : start[0] < 2
            ? [-0.75, -3.95]
            : [10.25, -3.6];
    return [
      start,
      [start[0], turnZ],
      [exitX, turnZ],
      [exitX, CORRIDOR_Z],
      ...routeOnFloor([exitX, CORRIDOR_Z], destination).slice(1),
    ];
  }
  if (distance(destination, RECEPTION) < 0.08 && start[1] < 3) {
    return [
      ...routeOnFloor(start, [-3.8, CORRIDOR_Z]).slice(0, -1),
      [-3.8, CORRIDOR_Z],
      [-3.8, 6.9],
      RECEPTION,
    ];
  }
  if (
    leavingReception &&
    distance(start, RECEPTION) < 0.2 &&
    distance(destination, RECEPTION) > 0.08
  ) {
    const fromCounter: FloorPoint[] = [
      start,
      [RECEPTION[0], start[1]],
      RECEPTION,
    ];
    if (distance(destination, [0, 8.8]) < 0.08) {
      return [
        ...fromCounter,
        [-6.1, 7.25],
        [-3.05, 7.25],
        [-3.05, RETURN_LANE_Z],
        [0, RETURN_LANE_Z],
        [0, 8.15],
        destination,
      ];
    }
    return [
      ...fromCounter,
      [-6.1, 7.25],
      [-3.05, 7.25],
      [-3.05, CORRIDOR_Z],
      ...routeOnFloor([-3.05, CORRIDOR_Z], destination).slice(1),
    ];
  }
  // Corridor travel is directional: eastbound on the lower lane, westbound on
  // the upper lane. This prevents opposing clinical transfers from meeting.
  const incomingDoor =
    start[1] >= -0.8 && destination[1] < -0.8
      ? clinicalDoors.find(([x]) => Math.abs(x - destination[0]) < 1.5)
      : undefined;
  if (incomingDoor) {
    const [doorX, serviceZ] = incomingDoor;
    const travelLaneZ = start[0] < doorX ? CORRIDOR_Z : RETURN_LANE_Z;
    const entryX = CORRIDOR_X.reduce((closest, candidate) =>
      Math.abs(candidate - start[0]) < Math.abs(closest - start[0])
        ? candidate
        : closest,
    );
    return [
      ...routeOnFloor(start, [entryX, travelLaneZ]).slice(0, -1),
      [entryX, travelLaneZ],
      [doorX, travelLaneZ],
      [doorX, serviceZ],
      ...routeOnFloor([doorX, serviceZ], destination).slice(1),
    ];
  }
  const adjacency = new Map<string, { point: FloorPoint; cost: number }[]>();
  const points = new Map<string, FloorPoint>();
  const connect = (a: FloorPoint, b: FloorPoint) => {
    points.set(key(a), a);
    points.set(key(b), b);
    const length = distance(a, b);
    const lane =
      a[1] === b[1] && (a[1] === CORRIDOR_Z || a[1] === RETURN_LANE_Z);
    const eastbound = b[0] > a[0];
    const aCost =
      lane && (a[1] === CORRIDOR_Z ? !eastbound : eastbound)
        ? length * 4
        : length;
    const bCost =
      lane && (a[1] === CORRIDOR_Z ? eastbound : !eastbound)
        ? length * 4
        : length;
    adjacency.set(key(a), [
      ...(adjacency.get(key(a)) ?? []),
      { point: b, cost: aCost },
    ]);
    adjacency.set(key(b), [
      ...(adjacency.get(key(b)) ?? []),
      { point: a, cost: bCost },
    ]);
  };
  for (const segment of FLOOR_ROUTES) connect(segment.from, segment.to);

  const attach = (point: FloorPoint) => {
    if (points.has(key(point))) return;
    let best:
      | { segment: RouteSegment; projected: FloorPoint; distance: number }
      | undefined;
    for (const segment of FLOOR_ROUTES) {
      const projected = projection(point, segment.from, segment.to);
      const separation = distance(point, projected);
      if (!best || separation < best.distance)
        best = { segment, projected, distance: separation };
    }
    if (!best || best.distance > 0.2)
      throw new Error(`Punto fuera del recorrido: ${key(point)}`);
    connect(point, best.segment.from);
    connect(point, best.segment.to);
  };
  attach(start);
  attach(destination);

  const costs = new Map<string, number>([[key(start), 0]]);
  const previous = new Map<string, string>();
  const pending = new Set<string>(points.keys());
  while (pending.size > 0) {
    let current: string | undefined;
    for (const candidate of pending) {
      if (
        current === undefined ||
        (costs.get(candidate) ?? Infinity) < (costs.get(current) ?? Infinity)
      )
        current = candidate;
    }
    if (!current || (costs.get(current) ?? Infinity) === Infinity) break;
    if (current === key(destination)) break;
    pending.delete(current);
    for (const edge of adjacency.get(current) ?? []) {
      const candidate = (costs.get(current) ?? Infinity) + edge.cost;
      if (candidate < (costs.get(key(edge.point)) ?? Infinity)) {
        costs.set(key(edge.point), candidate);
        previous.set(key(edge.point), current);
      }
    }
  }

  const route: FloorPoint[] = [];
  let cursor: string | undefined = key(destination);
  while (cursor) {
    const point = points.get(cursor);
    if (!point) throw new Error(`Ruta incompleta: ${cursor}`);
    route.unshift(point);
    if (cursor === key(start)) return route;
    cursor = previous.get(cursor);
  }
  throw new Error(`Sin ruta desde ${key(start)} hasta ${key(destination)}`);
}
