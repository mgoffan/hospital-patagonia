import { Edges, Html, RoundedBox, useTexture } from "@react-three/drei";
import { useFrame } from "@react-three/fiber";
import {
  CapsuleCollider,
  CuboidCollider,
  Physics,
  RigidBody,
  type RapierRigidBody,
} from "@react-three/rapier";
import QRCode from "qrcode";
import { useEffect, useMemo, useRef } from "react";
import {
  CanvasTexture,
  Group,
  NearestFilter,
  SRGBColorSpace,
  Vector3,
} from "three";

import type { SimulationResult, StationId } from "../simulation/engine";
import {
  deriveVisualPatientStates,
  type VisualPatientState,
} from "../simulation/visualTimeline";
import { FirstPersonController } from "./FirstPersonController";

type HospitalSceneProps = {
  turnSignal: number;
  stepSignal: number;
  simulation: SimulationResult;
  elapsedMs: number;
};

type BoxProps = {
  position: [number, number, number];
  dimensions: [number, number, number];
  color: string;
};

type DecorativeBoxProps = BoxProps & {
  rotation?: [number, number, number];
  outline?: string;
};

const WALL_COLOR = "#f4e9d8";
const WALL_HEIGHT = 3.2;
const WALL_THICKNESS = 0.24;
const DOOR_WIDTH = 1.55;

function PaintedMaterial({ color }: { color: string }) {
  const texture = useTexture(
    `${import.meta.env.BASE_URL}textures/painted-grain.webp`,
  );

  return <meshToonMaterial color={color} map={texture} />;
}

function StaticBox({ position, dimensions, color }: BoxProps) {
  return (
    <RigidBody type="fixed" colliders="cuboid">
      <mesh position={position} castShadow receiveShadow>
        <boxGeometry args={dimensions} />
        <PaintedMaterial color={color} />
      </mesh>
    </RigidBody>
  );
}

function DecorativeBox({
  position,
  dimensions,
  color,
  rotation = [0, 0, 0],
  outline,
}: DecorativeBoxProps) {
  const radius = Math.min(
    0.045,
    dimensions[0] / 4,
    dimensions[1] / 4,
    dimensions[2] / 4,
  );

  return (
    <RoundedBox
      args={dimensions}
      position={position}
      rotation={rotation}
      radius={radius}
      smoothness={1}
      castShadow
      receiveShadow
    >
      <PaintedMaterial color={color} />
      {outline ? <Edges color={outline} threshold={18} /> : null}
    </RoundedBox>
  );
}

function FloorGrid({
  position,
  width,
  depth,
  divisions = 12,
  color = "#a5b5b4",
}: {
  position: [number, number, number];
  width: number;
  depth: number;
  divisions?: number;
  color?: string;
}) {
  return (
    <gridHelper
      args={[10, divisions, color, color]}
      position={position}
      scale={[width / 10, 1, depth / 10]}
    />
  );
}

function FloorZone({ position, dimensions, color }: BoxProps) {
  return (
    <mesh position={position} receiveShadow>
      <boxGeometry args={dimensions} />
      <PaintedMaterial color={color} />
    </mesh>
  );
}

function RoomLabel({
  position,
  children,
}: {
  position: [number, number, number];
  children: string;
}) {
  return (
    <Html
      position={position}
      center
      distanceFactor={8}
      style={{ pointerEvents: "none" }}
    >
      <span className="world-label">{children}</span>
    </Html>
  );
}

function Desk({
  position,
  color,
}: {
  position: [number, number, number];
  color: string;
}) {
  return (
    <group position={position}>
      <StaticBox
        position={[0, 0.66, 0]}
        dimensions={[2.8, 0.2, 1.05]}
        color={color}
      />
      <StaticBox
        position={[-1.15, 0.32, 0]}
        dimensions={[0.2, 0.65, 0.85]}
        color={color}
      />
      <StaticBox
        position={[1.15, 0.32, 0]}
        dimensions={[0.2, 0.65, 0.85]}
        color={color}
      />
      <mesh position={[0, 1.02, 0]} rotation={[-0.15, 0, 0]} castShadow>
        <boxGeometry args={[0.75, 0.5, 0.08]} />
        <meshToonMaterial color="#17252e" />
        <Edges color="#0b1419" />
      </mesh>
      <DecorativeBox
        position={[0, 0.76, -0.18]}
        dimensions={[0.7, 0.04, 0.28]}
        color="#d9e8e7"
      />
    </group>
  );
}

function Chair({
  position,
  rotation = 0,
  color = "#d9e8e7",
}: {
  position: [number, number, number];
  rotation?: number;
  color?: string;
}) {
  return (
    <RigidBody type="fixed" colliders="cuboid">
      <group position={position} rotation={[0, rotation, 0]}>
        <DecorativeBox
          position={[0, 0.48, 0]}
          dimensions={[0.62, 0.14, 0.62]}
          color={color}
        />
        <DecorativeBox
          position={[0, 0.9, 0.27]}
          dimensions={[0.62, 0.72, 0.12]}
          color={color}
        />
        {[-0.23, 0.23].flatMap((x, xIndex) =>
          [-0.23, 0.23].map((z, zIndex) => (
            <DecorativeBox
              key={`chair-leg-${String(xIndex)}-${String(zIndex)}`}
              position={[x, 0.22, z]}
              dimensions={[0.08, 0.44, 0.08]}
              color="#52656b"
              outline="#52656b"
            />
          )),
        )}
      </group>
    </RigidBody>
  );
}

function ExamBed({
  position,
  rotation = 0,
  color = "#6fa9a0",
}: {
  position: [number, number, number];
  rotation?: number;
  color?: string;
}) {
  return (
    <RigidBody type="fixed" colliders="cuboid">
      <group position={position} rotation={[0, rotation, 0]}>
        <DecorativeBox
          position={[0, 0.63, 0]}
          dimensions={[0.9, 0.22, 2.25]}
          color={color}
        />
        <DecorativeBox
          position={[0, 0.82, -0.82]}
          dimensions={[0.76, 0.16, 0.48]}
          color="#d9e8e7"
        />
        {[-0.34, 0.34].flatMap((x, xIndex) =>
          [-0.82, 0.82].map((z, zIndex) => (
            <DecorativeBox
              key={`bed-leg-${String(xIndex)}-${String(zIndex)}`}
              position={[x, 0.3, z]}
              dimensions={[0.09, 0.58, 0.09]}
              color="#52656b"
              outline="#52656b"
            />
          )),
        )}
      </group>
    </RigidBody>
  );
}

function Counter({
  position,
  dimensions,
  color = "#aa744b",
}: {
  position: [number, number, number];
  dimensions: [number, number, number];
  color?: string;
}) {
  return (
    <RigidBody type="fixed" colliders="cuboid">
      <group>
        <DecorativeBox
          position={position}
          dimensions={dimensions}
          color={color}
        />
        <DecorativeBox
          position={[
            position[0],
            position[1] + dimensions[1] / 2 + 0.06,
            position[2],
          ]}
          dimensions={[dimensions[0] + 0.12, 0.12, dimensions[2] + 0.12]}
          color="#e1c18b"
        />
      </group>
    </RigidBody>
  );
}

function Plant({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh position={[0, 0.3, 0]} castShadow>
        <cylinderGeometry args={[0.25, 0.34, 0.55, 6]} />
        <meshToonMaterial color="#d96c4b" />
        <Edges color="#33434a" />
      </mesh>
      {[-0.3, 0, 0.3].map((offset, index) => (
        <mesh
          key={offset}
          position={[offset * 0.45, 0.78 + Math.abs(offset), 0]}
          rotation={[0, index * 1.7, offset]}
          castShadow
        >
          <coneGeometry args={[0.28, 0.85, 5]} />
          <meshToonMaterial color={index === 1 ? "#31785a" : "#4e9f6d"} />
        </mesh>
      ))}
    </group>
  );
}

function WallPoster({
  position,
  rotation = 0,
  color,
}: {
  position: [number, number, number];
  rotation?: number;
  color: string;
}) {
  return (
    <group position={position} rotation={[0, rotation, 0]}>
      <DecorativeBox
        position={[0, 0, 0]}
        dimensions={[0.92, 1.18, 0.05]}
        color="#f8efd9"
      />
      <DecorativeBox
        position={[0, 0.23, -0.03]}
        dimensions={[0.62, 0.22, 0.03]}
        color={color}
        outline={color}
      />
      <DecorativeBox
        position={[-0.18, -0.16, -0.03]}
        dimensions={[0.18, 0.36, 0.03]}
        color="#73cfe6"
        outline="#73cfe6"
      />
      <DecorativeBox
        position={[0.18, -0.16, -0.03]}
        dimensions={[0.18, 0.36, 0.03]}
        color="#ffd166"
        outline="#ffd166"
      />
    </group>
  );
}

function CeilingLight({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[1.8, 0.62]} />
        <meshStandardMaterial
          color="#fff7d6"
          emissive="#ffe7a0"
          emissiveIntensity={1.8}
        />
      </mesh>
      <pointLight color="#ffe5ad" intensity={0.32} distance={6} decay={2} />
    </group>
  );
}

function WindowPanel({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <DecorativeBox
        position={[0, 0, 0]}
        dimensions={[2.15, 1.18, 0.08]}
        color="#b9e1e7"
      />
      <DecorativeBox
        position={[0, 0, -0.055]}
        dimensions={[0.07, 1.22, 0.04]}
        color="#e9e2cf"
      />
      <DecorativeBox
        position={[0, 0, -0.06]}
        dimensions={[2.2, 0.07, 0.04]}
        color="#e9e2cf"
      />
    </group>
  );
}

function StorageCabinet({
  position,
  color = "#7298a1",
}: {
  position: [number, number, number];
  color?: string;
}) {
  return (
    <RigidBody type="fixed" colliders="cuboid">
      <group position={position}>
        <DecorativeBox
          position={[0, 0.82, 0]}
          dimensions={[1.35, 1.64, 0.48]}
          color={color}
        />
        <DecorativeBox
          position={[-0.34, 0.85, -0.255]}
          dimensions={[0.04, 0.45, 0.03]}
          color="#f1d27a"
        />
        <DecorativeBox
          position={[0.34, 0.85, -0.255]}
          dimensions={[0.04, 0.45, 0.03]}
          color="#f1d27a"
        />
      </group>
    </RigidBody>
  );
}

function ClinicalCart({ position }: { position: [number, number, number] }) {
  return (
    <group position={position}>
      <DecorativeBox
        position={[0, 0.58, 0]}
        dimensions={[0.75, 0.75, 0.5]}
        color="#77aeb3"
      />
      <DecorativeBox
        position={[0, 1, 0]}
        dimensions={[0.86, 0.09, 0.6]}
        color="#d9e8e7"
      />
      {[-0.28, 0.28].map((x, index) => (
        <mesh key={`cart-wheel-${String(index)}`} position={[x, 0.15, 0]}>
          <cylinderGeometry args={[0.12, 0.12, 0.08, 10]} />
          <meshToonMaterial color="#33434a" />
        </mesh>
      ))}
    </group>
  );
}

function OpenDoor({
  position,
  color,
}: {
  position: [number, number, number];
  color: string;
}) {
  return (
    <RigidBody
      type="fixed"
      colliders={false}
      position={position}
      rotation={[0, -Math.PI / 2, 0]}
    >
      <CuboidCollider
        args={[DOOR_WIDTH / 2, 1.06, 0.045]}
        position={[DOOR_WIDTH / 2, 1.06, 0]}
      />
      <DecorativeBox
        position={[DOOR_WIDTH / 2, 1.06, 0]}
        dimensions={[DOOR_WIDTH, 2.12, 0.09]}
        color={color}
      />
      <mesh position={[DOOR_WIDTH - 0.18, 1.02, -0.08]}>
        <sphereGeometry args={[0.07, 8, 6]} />
        <meshToonMaterial color="#ffd166" />
      </mesh>
    </RigidBody>
  );
}

function PatientQr({ code }: { code: number }) {
  const texture = useMemo(() => {
    const matrix = QRCode.create(String(code), {
      errorCorrectionLevel: "H",
    }).modules;
    const quietZone = 4;
    const cellSize = 6;
    const canvas = document.createElement("canvas");
    canvas.width = (matrix.size + quietZone * 2) * cellSize;
    canvas.height = canvas.width;
    const context = canvas.getContext("2d");
    if (!context) throw new Error("No se pudo crear la textura QR.");
    context.fillStyle = "#fffdf5";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.fillStyle = "#101820";
    for (let row = 0; row < matrix.size; row += 1) {
      for (let column = 0; column < matrix.size; column += 1) {
        if (matrix.data[row * matrix.size + column] !== 1) continue;
        context.fillRect(
          (column + quietZone) * cellSize,
          (row + quietZone) * cellSize,
          cellSize,
          cellSize,
        );
      }
    }
    const qrTexture = new CanvasTexture(canvas);
    qrTexture.colorSpace = SRGBColorSpace;
    qrTexture.magFilter = NearestFilter;
    qrTexture.minFilter = NearestFilter;
    return qrTexture;
  }, [code]);

  useEffect(
    () => () => {
      texture.dispose();
    },
    [texture],
  );

  return (
    <>
      <mesh position={[0, 1.18, 0.186]}>
        <planeGeometry args={[0.33, 0.33]} />
        <meshBasicMaterial map={texture} />
      </mesh>
      <mesh position={[0, 1.18, -0.186]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.33, 0.33]} />
        <meshBasicMaterial map={texture} />
      </mesh>
    </>
  );
}

function HumanFigure({
  position,
  topColor,
  bottomColor = "#35536c",
  skinColor = "#c98f6b",
  hairColor = "#3a2c27",
  phase = 0,
  walking = false,
  sitting = false,
  late = false,
  qrCode,
  braceletColor,
}: {
  position: [number, number, number];
  topColor: string;
  bottomColor?: string;
  skinColor?: string;
  hairColor?: string;
  phase?: number;
  walking?: boolean;
  sitting?: boolean;
  late?: boolean;
  qrCode?: number;
  braceletColor?: string;
}) {
  const root = useRef<Group>(null);
  const leftArm = useRef<Group>(null);
  const rightArm = useRef<Group>(null);
  const leftLeg = useRef<Group>(null);
  const rightLeg = useRef<Group>(null);

  useFrame(({ clock }) => {
    const time = clock.elapsedTime * (walking ? 6 : 1.6) + phase;
    const stride = walking ? Math.sin(time) * 0.52 : Math.sin(time) * 0.035;
    if (root.current)
      root.current.position.y =
        position[1] +
        (sitting ? 0 : Math.abs(Math.sin(time)) * (walking ? 0.035 : 0.008));
    if (leftArm.current) leftArm.current.rotation.x = stride;
    if (rightArm.current) rightArm.current.rotation.x = -stride;
    if (leftLeg.current)
      leftLeg.current.rotation.x = sitting ? -Math.PI / 2 : -stride * 0.72;
    if (rightLeg.current)
      rightLeg.current.rotation.x = sitting ? -Math.PI / 2 : stride * 0.72;
  });

  return (
    <group ref={root} position={position}>
      <RoundedBox
        args={[0.62, 0.72, 0.34]}
        position={[0, 1.13, 0]}
        radius={0.16}
        smoothness={2}
        castShadow
      >
        <PaintedMaterial color={topColor} />
      </RoundedBox>
      <RoundedBox
        args={[0.52, 0.24, 0.32]}
        position={[0, 0.72, 0]}
        radius={0.08}
        smoothness={2}
        castShadow
      >
        <PaintedMaterial color={bottomColor} />
      </RoundedBox>
      <mesh position={[0, 1.55, 0]} castShadow>
        <cylinderGeometry args={[0.1, 0.11, 0.2, 8]} />
        <meshToonMaterial color={skinColor} />
      </mesh>
      <group position={[0, 1.83, 0]}>
        <mesh castShadow scale={[0.82, 1, 0.78]}>
          <icosahedronGeometry args={[0.3, 2]} />
          <meshToonMaterial color={skinColor} />
        </mesh>
        <mesh position={[0, 0.19, -0.01]} scale={[0.84, 0.42, 0.8]} castShadow>
          <sphereGeometry args={[0.3, 10, 6, 0, Math.PI * 2, 0, Math.PI / 2]} />
          <meshToonMaterial color={hairColor} />
        </mesh>
        <mesh position={[0, 0, 0.27]} rotation={[Math.PI / 2, 0, 0]}>
          <coneGeometry args={[0.055, 0.13, 6]} />
          <meshToonMaterial color={skinColor} />
        </mesh>
      </group>
      {([-1, 1] as const).map((side) => (
        <group
          key={`arm-${String(side)}`}
          ref={side < 0 ? leftArm : rightArm}
          position={[side * 0.39, 1.34, 0]}
        >
          <mesh position={[0, -0.28, 0]} castShadow>
            <capsuleGeometry args={[0.105, 0.44, 4, 8]} />
            <meshToonMaterial color={topColor} />
          </mesh>
          <mesh position={[0, -0.6, 0]} castShadow>
            <capsuleGeometry args={[0.085, 0.25, 4, 8]} />
            <meshToonMaterial color={skinColor} />
          </mesh>
          {braceletColor ? (
            <mesh position={[0, -0.58, 0]} castShadow>
              <cylinderGeometry args={[0.132, 0.132, 0.14, 12]} />
              <meshStandardMaterial
                color={braceletColor}
                emissive={braceletColor}
                emissiveIntensity={0.22}
              />
            </mesh>
          ) : null}
          <mesh position={[0, -0.81, 0]} castShadow>
            <sphereGeometry args={[0.115, 8, 6]} />
            <meshToonMaterial color={skinColor} />
          </mesh>
        </group>
      ))}
      {([-1, 1] as const).map((side) => (
        <group
          key={`leg-${String(side)}`}
          ref={side < 0 ? leftLeg : rightLeg}
          position={[side * 0.17, sitting ? 0.72 : 0.98, sitting ? 0.1 : 0]}
        >
          <mesh position={[0, -0.32, 0]} castShadow>
            <capsuleGeometry args={[0.13, 0.48, 4, 8]} />
            <meshToonMaterial color={bottomColor} />
          </mesh>
          <mesh position={[0, -0.72, 0]} castShadow>
            <capsuleGeometry args={[0.105, 0.29, 4, 8]} />
            <meshToonMaterial color={skinColor} />
          </mesh>
          <RoundedBox
            args={[0.25, 0.13, 0.43]}
            position={[0, -0.94, 0.08]}
            radius={0.05}
            smoothness={2}
            castShadow
          >
            <meshToonMaterial color="#25343d" />
          </RoundedBox>
        </group>
      ))}
      <RoundedBox
        args={[0.2, 0.27, 0.035]}
        position={[0.17, 1.25, 0.19]}
        radius={0.025}
        smoothness={2}
      >
        <meshToonMaterial color="#f4e9d8" />
      </RoundedBox>
      {qrCode === undefined ? null : <PatientQr code={qrCode} />}
      {late ? (
        <>
          {[0, Math.PI].map((rotation) => (
            <group key={rotation} rotation={[0, rotation, 0]}>
              <mesh position={[0.11, 2.04, 0.22]} scale={[1.3, 0.5, 0.25]}>
                <sphereGeometry args={[0.11, 8, 6]} />
                <meshToonMaterial color="#8f1d2c" />
              </mesh>
              <mesh position={[0.16, 1.82, 0.25]}>
                <sphereGeometry args={[0.045, 8, 6]} />
                <meshToonMaterial color="#c5283d" />
              </mesh>
              <mesh position={[0.16, 1.73, 0.25]}>
                <sphereGeometry args={[0.025, 8, 6]} />
                <meshToonMaterial color="#c5283d" />
              </mesh>
            </group>
          ))}
        </>
      ) : null}
    </group>
  );
}

function StationWorker({
  position,
  topColor,
  phase,
}: {
  position: [number, number, number];
  topColor: string;
  phase: number;
}) {
  return (
    <RigidBody type="fixed" colliders={false} position={position}>
      <CapsuleCollider args={[0.5, 0.27]} position={[0, 0.77, 0]} />
      <HumanFigure position={[0, 0, 0]} topColor={topColor} phase={phase} />
    </RigidBody>
  );
}

const servicePositions: Record<StationId, [number, number, number][]> = {
  // Patients stop on the public side of the reception desk.
  administration: [[-6.1, 0, 6.9]],
  nursing: [
    [-11.7, 0, -3.35],
    [-9.5, 0, -3.35],
  ],
  doctor: [
    [-4.25, 0, -3.15],
    [0.75, 0, -3.15],
  ],
  xray: [[9.4, 0, -3.15]],
};

const queueOrigins: Record<StationId, [number, number, number]> = {
  administration: [-6.8, 0, 7.45],
  nursing: [-12.4, 0, 1.25],
  doctor: [-6.8, 0, 1.35],
  xray: [8.2, 0, 1.25],
};

const waitingPositions: [number, number, number][] = [
  [2.5, 0, 4.1],
  [5, 0, 4.1],
  [7.5, 0, 4.1],
  [2.5, 0, 6.6],
  [5, 0, 6.6],
  [7.5, 0, 6.6],
  [9.3, 0, 4.25],
  [9.3, 0, 5.25],
];

const RECEPTION_CLEAR_X = -3.8;
const RECEPTION_FRONT_Z = 6.9;

function patientTarget(
  state: VisualPatientState,
  waitingIndex: number,
): [number, number, number] {
  if (state.activity === "departing") {
    return [state.code % 2 === 0 ? 0.75 : -0.75, 0, 10.4];
  }

  if (state.activity === "inService") {
    const positions = servicePositions[state.stationId];
    return positions[state.resourceSlot ?? 0] ?? positions[0] ?? [0, 0, 0];
  }

  if (state.stationId !== "administration") {
    return (
      waitingPositions[waitingIndex % waitingPositions.length] ?? [5, 0, 5]
    );
  }

  const origin = queueOrigins[state.stationId];
  const columns = 3;
  const column = state.queueIndex % columns;
  const row = Math.floor(state.queueIndex / columns);
  return [origin[0] + column * 0.82, 0, origin[2] + row * 0.82];
}

function roomPassageX(x: number) {
  if (x < -8) return -10.62;
  if (x < -3) return -5.12;
  if (x < 2) return -0.12;
  if (x < 7) return 4.88;
  return 10.88;
}

function roomIndexForX(x: number) {
  if (x < -8) return 0;
  if (x < -3) return 1;
  if (x < 2) return 2;
  if (x < 7) return 3;
  return 4;
}

function navigationWaypoint(
  current: Vector3,
  destination: Vector3,
  waypoint: Vector3,
) {
  const insideRoom = current.z < -0.72;
  const destinationInsideRoom = destination.z < -0.72;
  const currentAtReception =
    current.x > -8 && current.x < -4.4 && current.z > 5.7;
  const destinationAtReception =
    destination.x > -8 && destination.x < -4.4 && destination.z > 5.7;

  if (
    insideRoom &&
    destinationInsideRoom &&
    roomIndexForX(current.x) === roomIndexForX(destination.x)
  ) {
    return waypoint.copy(destination);
  }

  if (insideRoom) {
    const exitX = roomPassageX(current.x);
    if (Math.abs(current.x - exitX) > 0.08) {
      return waypoint.set(exitX, 0, current.z);
    }
    return waypoint.set(exitX, 0, 0.9);
  }

  // Reception has a desk and a fixed worker: leave it through its right aisle
  // before descending to the clinical corridor.
  if (destinationInsideRoom && currentAtReception) {
    return waypoint.set(RECEPTION_CLEAR_X, 0, current.z);
  }

  // Returning to administration always approaches the public side of the
  // desk from the clear right aisle, never diagonally through the furniture.
  if (destinationAtReception) {
    if (Math.abs(current.x - RECEPTION_CLEAR_X) > 0.08) {
      return waypoint.set(RECEPTION_CLEAR_X, 0, current.z);
    }
    if (current.z < RECEPTION_FRONT_Z - 0.18) {
      return waypoint.set(RECEPTION_CLEAR_X, 0, RECEPTION_FRONT_Z);
    }
    return waypoint.copy(destination);
  }

  if (destinationInsideRoom) {
    const entranceX = roomPassageX(destination.x);
    if (Math.abs(current.x - entranceX) > 0.08 || current.z > 1.05) {
      return waypoint.set(entranceX, 0, 0.9);
    }
    if (current.z > -0.82) return waypoint.set(entranceX, 0, -0.9);
  }

  return waypoint.copy(destination);
}

function PatientActor({
  state,
  waitingIndex,
}: {
  state: VisualPatientState;
  waitingIndex: number;
}) {
  const body = useRef<RapierRigidBody>(null);
  const visual = useRef<Group>(null);
  const target = patientTarget(state, waitingIndex);
  const targetVector = useRef(new Vector3());
  const currentVector = useRef(new Vector3());
  const waypointVector = useRef(new Vector3());
  const vip = state.kind === "vip";
  const patientColors = ["#d98355", "#738caf", "#b98755", "#6d9c82"];
  const topColor =
    patientColors[(state.code - 1) % patientColors.length] ?? "#738caf";
  const sitting =
    state.activity === "queued" && state.stationId !== "administration";
  const braceletColor = state.requiresXray
    ? vip
      ? "#ff4f9a"
      : "#ffd23f"
    : vip
      ? "#9b6de3"
      : "#35d07f";

  useFrame((_state, delta) => {
    const rigidBody = body.current;
    if (!rigidBody) return;
    const translation = rigidBody.translation();
    currentVector.current.set(translation.x, translation.y, translation.z);
    targetVector.current.set(...target);
    const waypoint = navigationWaypoint(
      currentVector.current,
      targetVector.current,
      waypointVector.current,
    );
    if (visual.current && sitting) visual.current.rotation.y = Math.PI;
    const distance = currentVector.current.distanceTo(waypoint);
    if (distance < 0.025) return;

    const step = Math.min(distance, delta * 4.6);
    const direction = waypoint.sub(currentVector.current).normalize();
    const next = currentVector.current.addScaledVector(direction, step);
    rigidBody.setNextKinematicTranslation(next);
    if (visual.current && !sitting)
      visual.current.rotation.y = Math.atan2(direction.x, direction.z);
  });

  return (
    <RigidBody
      ref={body}
      type="kinematicPosition"
      colliders={false}
      position={[state.code % 2 === 0 ? 0.9 : -0.9, 0, 8.15]}
      enabledRotations={[false, false, false]}
    >
      <CapsuleCollider args={[0.5, 0.27]} position={[0, 0.77, 0]} />
      <group ref={visual}>
        <HumanFigure
          position={[0, 0, 0]}
          topColor={topColor}
          bottomColor={vip ? "#713e78" : "#3d5b6d"}
          skinColor={vip ? "#d8a077" : "#b97e60"}
          hairColor={vip ? "#bf6c3f" : "#332924"}
          phase={state.code * 0.73}
          walking={
            (state.activity === "queued" &&
              state.stationId === "administration") ||
            state.activity === "departing"
          }
          sitting={
            state.activity === "queued" && state.stationId !== "administration"
          }
          late={state.isLate}
          qrCode={state.code}
          {...(state.checkedIn ? { braceletColor } : {})}
        />
        <Html
          position={[0, 2.3, 0]}
          center
          distanceFactor={7}
          style={{ pointerEvents: "none" }}
        >
          <span
            className={`patient-world-tag ${vip ? "vip" : ""} ${state.isLate ? "late" : ""}`}
          >
            {vip ? "VIP · " : ""}
            {state.requiresXray ? "ANÁLISIS · " : ""}
            {state.isLate ? "TARDE · " : ""}#
            {String(state.code).padStart(2, "0")}
          </span>
        </Html>
      </group>
    </RigidBody>
  );
}

function SimulationPatientFlow({
  simulation,
  elapsedMs,
}: {
  simulation: SimulationResult;
  elapsedMs: number;
}) {
  const visiblePatients = useMemo(
    () => deriveVisualPatientStates(simulation, elapsedMs),
    [elapsedMs, simulation],
  );

  const waitingOrder = new Map(
    visiblePatients
      .filter(
        (state) =>
          state.activity === "queued" && state.stationId !== "administration",
      )
      .map((state, index) => [state.id, index]),
  );

  return visiblePatients.map((state) => (
    <PatientActor
      key={state.id}
      state={state}
      waitingIndex={waitingOrder.get(state.id) ?? 0}
    />
  ));
}

function FloorTape({
  points,
  color,
}: {
  points: [number, number][];
  color: string;
}) {
  return points.slice(1).map(([x, z], index) => {
    const start = points[index];
    if (!start) return null;
    const [startX, startZ] = start;
    const deltaX = x - startX;
    const deltaZ = z - startZ;
    const length = Math.hypot(deltaX, deltaZ);
    return (
      <mesh
        key={`${String(index)}-${color}`}
        position={[(startX + x) / 2, 0.115, (startZ + z) / 2]}
        rotation={[0, Math.atan2(deltaX, deltaZ), 0]}
        receiveShadow
      >
        <boxGeometry args={[0.16, 0.018, length + 0.08]} />
        <meshStandardMaterial
          color={color}
          emissive={color}
          emissiveIntensity={0.12}
          roughness={0.8}
        />
      </mesh>
    );
  });
}

function PatientRoutes() {
  return (
    <group>
      <FloorTape
        color="#e86f51"
        points={[
          [0, 8.85],
          [-3.8, 8.15],
          [-3.8, 6.9],
          [-6.1, 6.85],
        ]}
      />
      <FloorTape
        color="#35b96f"
        points={[
          [2.2, 4.45],
          [-8.8, 1.05],
          [-10.62, 0.9],
          [-10.62, -3.25],
        ]}
      />
      <FloorTape
        color="#f0c83f"
        points={[
          [4.6, 4.45],
          [4.6, 1.15],
          [-5.12, 0.9],
          [-5.12, -3.05],
        ]}
      />
      <FloorTape
        color="#f09b38"
        points={[
          [5.1, 4.45],
          [5.1, 1.3],
          [-0.12, 0.9],
          [-0.12, -3.05],
        ]}
      />
      <FloorTape
        color="#349bc4"
        points={[
          [7.25, 4.45],
          [7.25, 1.15],
          [10.88, 0.9],
          [10.88, -3.1],
        ]}
      />
    </group>
  );
}

function XrayMachine() {
  return (
    <group position={[10.5, 0, -5.2]}>
      <StaticBox
        position={[0, 0.3, 0]}
        dimensions={[2.8, 0.5, 1.4]}
        color="#d9e8e7"
      />
      <mesh position={[0, 1.6, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <torusGeometry args={[0.9, 0.24, 8, 18]} />
        <meshToonMaterial color="#236a8d" />
        <Edges color="#173e50" />
      </mesh>
      <StaticBox
        position={[0, 0.95, 0.75]}
        dimensions={[0.3, 1.6, 0.3]}
        color="#17252e"
      />
      <DecorativeBox
        position={[1.2, 1.1, 0.9]}
        dimensions={[0.65, 0.48, 0.1]}
        color="#17252e"
        rotation={[0, -0.35, 0]}
      />
    </group>
  );
}

function RetroSkyline() {
  return (
    <group>
      <mesh position={[8, 9.5, -34]}>
        <circleGeometry args={[5, 24]} />
        <meshBasicMaterial color="#ffd166" fog={false} />
      </mesh>
      {(
        [
          [-16, 3.1, -28, 8, "#367d70"],
          [-7, 2.2, -30, 6.5, "#4e9f6d"],
          [1, 2.6, -31, 7, "#2f6d66"],
          [13, 2.5, -29, 7.5, "#438d70"],
        ] satisfies [number, number, number, number, string][]
      ).map(([x, y, z, radius, color], index) => (
        <mesh key={`mountain-${String(index)}`} position={[x, y, z]}>
          <coneGeometry args={[radius, 10, 5]} />
          <meshToonMaterial color={color} />
        </mesh>
      ))}
    </group>
  );
}

type Room = {
  name: string;
  minX: number;
  maxX: number;
  doorX: number;
  floor: string;
};

const rooms: Room[] = [
  {
    name: "ENFERMERÍA",
    minX: -13.88,
    maxX: -8.12,
    doorX: -11,
    floor: "#75b98a",
  },
  {
    name: "CONSULTORIO 1",
    minX: -7.88,
    maxX: -3.12,
    doorX: -5.5,
    floor: "#e9d57b",
  },
  {
    name: "CONSULTORIO 2",
    minX: -2.88,
    maxX: 1.88,
    doorX: -0.5,
    floor: "#efc879",
  },
  { name: "LABORATORIO", minX: 2.12, maxX: 6.88, doorX: 4.5, floor: "#b9d8cd" },
  { name: "RAYOS", minX: 7.12, maxX: 13.88, doorX: 10.5, floor: "#8fc2d6" },
];

function WallWithDoor({ room }: { room: Room }) {
  const leftWidth = room.doorX - DOOR_WIDTH / 2 - room.minX;
  const rightStart = room.doorX + DOOR_WIDTH / 2;
  const rightWidth = room.maxX - rightStart;

  return (
    <group>
      <StaticBox
        position={[room.minX + leftWidth / 2, WALL_HEIGHT / 2, 0]}
        dimensions={[leftWidth, WALL_HEIGHT, WALL_THICKNESS]}
        color={WALL_COLOR}
      />
      <StaticBox
        position={[rightStart + rightWidth / 2, WALL_HEIGHT / 2, 0]}
        dimensions={[rightWidth, WALL_HEIGHT, WALL_THICKNESS]}
        color={WALL_COLOR}
      />
      <StaticBox
        position={[room.doorX, 2.86, 0]}
        dimensions={[DOOR_WIDTH, 0.68, WALL_THICKNESS]}
        color={WALL_COLOR}
      />
      <DecorativeBox
        position={[room.doorX - DOOR_WIDTH / 2, 1.1, 0.13]}
        dimensions={[0.1, 2.2, 0.18]}
        color={room.floor}
      />
      <DecorativeBox
        position={[room.doorX + DOOR_WIDTH / 2, 1.1, 0.13]}
        dimensions={[0.1, 2.2, 0.18]}
        color={room.floor}
      />
      <OpenDoor
        position={[room.doorX - DOOR_WIDTH / 2, 0, -0.04]}
        color={room.floor}
      />
      <RoomLabel position={[room.doorX, 2.32, 0.16]}>{room.name}</RoomLabel>
    </group>
  );
}

function HospitalGreybox({
  simulation,
  elapsedMs,
}: {
  simulation: SimulationResult;
  elapsedMs: number;
}) {
  return (
    <group>
      {/* One continuous structural slab prevents gaps between playable areas. */}
      <StaticBox
        position={[0, -0.14, 0]}
        dimensions={[28, 0.28, 18]}
        color="#d6c6ac"
      />

      {/* Lobby, corridor and rooms meet edge-to-edge over the structural slab. */}
      <FloorZone
        position={[0, 0.02, 4.5]}
        dimensions={[27.5, 0.04, 8.75]}
        color="#cbd9d5"
      />
      <FloorZone
        position={[0, 0.025, 1.5]}
        dimensions={[27.5, 0.05, 2.75]}
        color="#f1e8d8"
      />
      {rooms.map((room) => (
        <FloorZone
          key={room.name}
          position={[(room.minX + room.maxX) / 2, 0.03, -4.5]}
          dimensions={[room.maxX - room.minX, 0.06, 8.75]}
          color={room.floor}
        />
      ))}
      <FloorGrid
        position={[0, 0.065, 4.5]}
        width={27.4}
        depth={8.65}
        divisions={18}
      />
      <FloorGrid
        position={[0, 0.07, -4.5]}
        width={27.4}
        depth={8.65}
        divisions={18}
      />
      <FloorZone
        position={[5.5, 0.085, 5.25]}
        dimensions={[10.5, 0.035, 5.8]}
        color="#477f9d"
      />
      <FloorZone
        position={[-5.5, 0.086, -6.4]}
        dimensions={[4.45, 0.038, 4.5]}
        color="#bd874d"
      />
      <FloorZone
        position={[-0.5, 0.086, -6.4]}
        dimensions={[4.45, 0.038, 4.5]}
        color="#c99250"
      />
      <PatientRoutes />

      {/* A real ceiling removes the empty open-sky feeling of the greybox. */}
      <mesh position={[0, 3.28, 0]} receiveShadow>
        <boxGeometry args={[28, 0.14, 18]} />
        <PaintedMaterial color="#eee6d5" />
      </mesh>
      {(
        [
          [-9.5, 3.18, 5],
          [-3.2, 3.18, 5],
          [3.2, 3.18, 5],
          [9.5, 3.18, 5],
          [-9.5, 3.18, 1.45],
          [0, 3.18, 1.45],
          [9.5, 3.18, 1.45],
          [-10.7, 3.18, -4.7],
          [-5.5, 3.18, -4.7],
          [-0.5, 3.18, -4.7],
          [4.5, 3.18, -4.7],
          [10.5, 3.18, -4.7],
        ] satisfies [number, number, number][]
      ).map((position, index) => (
        <CeilingLight
          key={`ceiling-light-${String(index)}`}
          position={position}
        />
      ))}

      {/* Closed perimeter, with a single entrance in the lobby's south wall. */}
      <StaticBox
        position={[0, WALL_HEIGHT / 2, -9]}
        dimensions={[28, WALL_HEIGHT, WALL_THICKNESS]}
        color={WALL_COLOR}
      />
      <StaticBox
        position={[-7.7, WALL_HEIGHT / 2, 9]}
        dimensions={[12.6, WALL_HEIGHT, WALL_THICKNESS]}
        color={WALL_COLOR}
      />
      <StaticBox
        position={[7.7, WALL_HEIGHT / 2, 9]}
        dimensions={[12.6, WALL_HEIGHT, WALL_THICKNESS]}
        color={WALL_COLOR}
      />
      <StaticBox
        position={[0, 2.9, 9]}
        dimensions={[2.8, 0.6, WALL_THICKNESS]}
        color={WALL_COLOR}
      />
      <StaticBox
        position={[-14, WALL_HEIGHT / 2, 0]}
        dimensions={[WALL_THICKNESS, WALL_HEIGHT, 18]}
        color={WALL_COLOR}
      />
      <StaticBox
        position={[14, WALL_HEIGHT / 2, 0]}
        dimensions={[WALL_THICKNESS, WALL_HEIGHT, 18]}
        color={WALL_COLOR}
      />

      {/* The corridor gives every clinical room its own visible doorway. */}
      {rooms.map((room) => (
        <WallWithDoor key={room.name} room={room} />
      ))}
      {[-8, -3, 2, 7].map((x) => (
        <StaticBox
          key={x}
          position={[x, WALL_HEIGHT / 2, -4.5]}
          dimensions={[WALL_THICKNESS, WALL_HEIGHT, 9]}
          color={WALL_COLOR}
        />
      ))}

      {rooms.map((room) => (
        <WindowPanel
          key={`window-${room.name}`}
          position={[(room.minX + room.maxX) / 2, 1.82, -8.84]}
        />
      ))}

      {/* Warm baseboards preserve the handmade board-game character. */}
      <DecorativeBox
        position={[0, 0.16, -8.82]}
        dimensions={[27.5, 0.22, 0.08]}
        color="#b8784d"
      />
      {[-8, -3, 2, 7].map((x, index) => (
        <DecorativeBox
          key={`trim-${String(index)}`}
          position={[x + 0.13, 0.16, -4.5]}
          dimensions={[0.08, 0.22, 8.6]}
          color="#b8784d"
        />
      ))}

      {/* Administración y sala de espera, tomadas de las vistas IMG_7692–95. */}
      <Desk position={[-6.1, 0, 5.2]} color="#d96c4b" />
      <Counter position={[-9.6, 0.55, 6.7]} dimensions={[3.2, 1.1, 0.65]} />
      <StorageCabinet position={[-12.8, 0, 7.8]} color="#c78b58" />
      {(
        [
          [2.5, 4.1],
          [5, 4.1],
          [7.5, 4.1],
          [2.5, 6.6],
          [5, 6.6],
          [7.5, 6.6],
        ] satisfies [number, number][]
      ).map(([x, z], index) => (
        <Chair
          key={`waiting-${String(index)}`}
          position={[x, 0, z]}
          color="#d7e2df"
        />
      ))}
      <Plant position={[11.8, 0, 6.9]} />
      <Plant position={[10.8, 0, 3.4]} />
      <WallPoster
        position={[-13.82, 1.75, 5.4]}
        rotation={Math.PI / 2}
        color="#e94f8a"
      />

      {/* Enfermería: dos puestos, mesada clínica y guardado perimetral. */}
      <Counter
        position={[-13.35, 0.5, -5.1]}
        dimensions={[0.65, 1, 5.7]}
        color="#7c9c90"
      />
      <ExamBed
        position={[-11.8, 0, -6.2]}
        rotation={Math.PI / 2}
        color="#6c9fb8"
      />
      <ExamBed
        position={[-9.4, 0, -6.2]}
        rotation={Math.PI / 2}
        color="#6c9fb8"
      />
      <Chair position={[-12.2, 0, -2.4]} rotation={Math.PI} color="#ffd166" />
      <StorageCabinet position={[-8.7, 0, -8.45]} />
      <ClinicalCart position={[-9.1, 0, -2.3]} />

      {/* Consultorios: madera, escritorio y camilla según IMG_7689–90. */}
      <Desk position={[-5.5, 0, -6.5]} color="#a96b43" />
      <Chair position={[-5.5, 0, -5.35]} rotation={Math.PI} color="#73a6bc" />
      <ExamBed position={[-3.85, 0, -3.15]} color="#6fa99c" />
      <Plant position={[-7.35, 0, -7.5]} />
      <StorageCabinet position={[-7.25, 0, -2.1]} color="#b77d50" />
      <ClinicalCart position={[-3.8, 0, -7.45]} />
      <Desk position={[-0.5, 0, -6.5]} color="#aa7046" />
      <Chair position={[-0.5, 0, -5.35]} rotation={Math.PI} color="#73a6bc" />
      <ExamBed position={[1.15, 0, -3.15]} color="#78ad9e" />
      <Plant position={[-2.35, 0, -7.5]} />
      <StorageCabinet position={[-2.25, 0, -2.1]} color="#b77d50" />
      <ClinicalCart position={[1.2, 0, -7.45]} />

      {/* Laboratorio: dos islas y una mesada lateral de las IMG_7688/94. */}
      <Counter
        position={[6.25, 0.5, -5.1]}
        dimensions={[0.65, 1, 5.7]}
        color="#8a6548"
      />
      <Counter
        position={[3.45, 0.45, -5.8]}
        dimensions={[1.45, 0.9, 2.5]}
        color="#87aeb6"
      />
      <Counter
        position={[5.2, 0.45, -3.25]}
        dimensions={[1.45, 0.9, 2.2]}
        color="#9abac0"
      />
      <Chair position={[3.45, 0, -4.2]} color="#e2a669" />
      <StorageCabinet position={[2.6, 0, -8.45]} color="#7d9fa6" />
      <ClinicalCart position={[5.8, 0, -7.6]} />

      {/* Radiología conserva el equipo protagonista y suma camilla/mesada. */}
      <XrayMachine />
      <ExamBed
        position={[8.4, 0, -3.8]}
        rotation={Math.PI / 2}
        color="#6fa99c"
      />
      <Counter
        position={[12.8, 0.5, -5.2]}
        dimensions={[0.65, 1, 5.8]}
        color="#8a6548"
      />
      <StorageCabinet position={[7.65, 0, -8.45]} color="#668f9a" />
      <ClinicalCart position={[12.1, 0, -2.2]} />

      <StationWorker position={[-6.1, 0, 6]} topColor="#e94f8a" phase={0.4} />
      <StationWorker position={[-10.4, 0, -3]} topColor="#4e9f6d" phase={1.2} />
      <StationWorker position={[-6.6, 0, -3]} topColor="#236a8d" phase={2.1} />
      <StationWorker position={[-1.5, 0, -3]} topColor="#236a8d" phase={3.2} />
      <StationWorker position={[5.4, 0, -3]} topColor="#6faaa0" phase={4.1} />
      <StationWorker
        position={[11.9, 0, -3.1]}
        topColor="#8fc2d6"
        phase={5.2}
      />

      <SimulationPatientFlow simulation={simulation} elapsedMs={elapsedMs} />

      <RoomLabel position={[-5.5, 2.25, 5.3]}>ADMINISTRACIÓN</RoomLabel>
      <RoomLabel position={[0, 2.45, 1.6]}>PASILLO CLÍNICO</RoomLabel>
      <RoomLabel position={[0, 2.25, 8.65]}>ENTRADA</RoomLabel>
    </group>
  );
}

export function HospitalScene({
  turnSignal,
  stepSignal,
  simulation,
  elapsedMs,
}: HospitalSceneProps) {
  return (
    <>
      <color attach="background" args={["#67c6df"]} />
      <fog attach="fog" args={["#73cfe6", 23, 48]} />
      <hemisphereLight args={["#fff0c2", "#2f6d66", 1.65]} />
      <directionalLight
        position={[-8, 14, 8]}
        intensity={2.65}
        color="#ffd99a"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
      />
      <RetroSkyline />
      <Physics gravity={[0, 0, 0]}>
        <HospitalGreybox simulation={simulation} elapsedMs={elapsedMs} />
        <FirstPersonController
          turnSignal={turnSignal}
          stepSignal={stepSignal}
        />
      </Physics>
    </>
  );
}
