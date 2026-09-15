import { Html } from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";

import { FirstPersonController } from "./FirstPersonController";

type HospitalSceneProps = {
  turnSignal: number;
  stepSignal: number;
};

type BoxProps = {
  position: [number, number, number];
  dimensions: [number, number, number];
  color: string;
};

const WALL_COLOR = "#f4e9d8";
const WALL_HEIGHT = 3.2;
const WALL_THICKNESS = 0.24;
const DOOR_WIDTH = 1.55;

function StaticBox({ position, dimensions, color }: BoxProps) {
  return (
    <RigidBody type="fixed" colliders="cuboid">
      <mesh position={position} castShadow receiveShadow>
        <boxGeometry args={dimensions} />
        <meshToonMaterial color={color} />
      </mesh>
    </RigidBody>
  );
}

function FloorZone({ position, dimensions, color }: BoxProps) {
  return (
    <mesh position={position} receiveShadow>
      <boxGeometry args={dimensions} />
      <meshToonMaterial color={color} />
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
      </mesh>
    </group>
  );
}

function LowPolyPerson({
  position,
  color,
}: {
  position: [number, number, number];
  color: string;
}) {
  return (
    <group position={position}>
      <mesh position={[0, 1.25, 0]} castShadow>
        <icosahedronGeometry args={[0.25, 1]} />
        <meshToonMaterial color="#d9a779" />
      </mesh>
      <mesh position={[0, 0.72, 0]} castShadow>
        <coneGeometry args={[0.38, 0.9, 6]} />
        <meshToonMaterial color={color} />
      </mesh>
      <mesh position={[-0.16, 0.18, 0]} castShadow>
        <boxGeometry args={[0.13, 0.55, 0.16]} />
        <meshToonMaterial color="#17252e" />
      </mesh>
      <mesh position={[0.16, 0.18, 0]} castShadow>
        <boxGeometry args={[0.13, 0.55, 0.16]} />
        <meshToonMaterial color="#17252e" />
      </mesh>
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
      </mesh>
      <StaticBox
        position={[0, 0.95, 0.75]}
        dimensions={[0.3, 1.6, 0.3]}
        color="#17252e"
      />
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
      <RoomLabel position={[room.doorX, 2.32, 0.16]}>{room.name}</RoomLabel>
    </group>
  );
}

function HospitalGreybox() {
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
        color="#e2a669"
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

      <Desk position={[-5.5, 0, 5.1]} color="#d96c4b" />
      <Desk position={[-11, 0, -4.3]} color="#4e9f6d" />
      <Desk position={[-5.5, 0, -4.3]} color="#d8b44b" />
      <Desk position={[-0.5, 0, -4.3]} color="#d8a44b" />
      <Desk position={[4.5, 0, -4.3]} color="#6faaa0" />
      <XrayMachine />

      <LowPolyPerson position={[-7.4, 0, 6.1]} color="#e94f8a" />
      <LowPolyPerson position={[-11.8, 0, -3]} color="#4e9f6d" />
      <LowPolyPerson position={[-6.2, 0, -3]} color="#236a8d" />

      <RoomLabel position={[-5.5, 2.25, 5.3]}>ADMINISTRACIÓN</RoomLabel>
      <RoomLabel position={[0, 2.45, 1.6]}>PASILLO CLÍNICO</RoomLabel>
      <RoomLabel position={[0, 2.25, 8.65]}>ENTRADA</RoomLabel>
    </group>
  );
}

export function HospitalScene({ turnSignal, stepSignal }: HospitalSceneProps) {
  return (
    <>
      <color attach="background" args={["#73cfe6"]} />
      <fog attach="fog" args={["#73cfe6", 18, 42]} />
      <hemisphereLight args={["#fff3cf", "#356f58", 1.8]} />
      <directionalLight
        position={[-8, 14, 8]}
        intensity={2.4}
        color="#ffd99a"
        castShadow
        shadow-mapSize={[1024, 1024]}
        shadow-camera-left={-18}
        shadow-camera-right={18}
        shadow-camera-top={14}
        shadow-camera-bottom={-14}
      />
      <Physics gravity={[0, 0, 0]}>
        <HospitalGreybox />
        <FirstPersonController
          turnSignal={turnSignal}
          stepSignal={stepSignal}
        />
      </Physics>
    </>
  );
}
