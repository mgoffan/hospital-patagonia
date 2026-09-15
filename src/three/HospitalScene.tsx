import { Html } from "@react-three/drei";
import { Physics, RigidBody } from "@react-three/rapier";

import { FirstPersonController } from "./FirstPersonController";

type HospitalSceneProps = {
  turnSignal: number;
  stepSignal: number;
};

type BoxProps = {
  position: [number, number, number];
  scale: [number, number, number];
  color: string;
};

function StaticBox({ position, scale, color }: BoxProps) {
  return (
    <RigidBody type="fixed" colliders="cuboid">
      <mesh position={position} scale={scale} castShadow receiveShadow>
        <boxGeometry />
        <meshToonMaterial color={color} />
      </mesh>
    </RigidBody>
  );
}

function FloorZone({ position, scale, color }: BoxProps) {
  return (
    <mesh position={position} scale={scale} receiveShadow>
      <boxGeometry />
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
        position={[0, 0.55, 0]}
        scale={[1.4, 0.12, 0.55]}
        color={color}
      />
      <StaticBox
        position={[-1.15, 0.28, 0]}
        scale={[0.12, 0.55, 0.45]}
        color={color}
      />
      <StaticBox
        position={[1.15, 0.28, 0]}
        scale={[0.12, 0.55, 0.45]}
        color={color}
      />
      <mesh position={[0, 0.9, 0]} rotation={[-0.15, 0, 0]} castShadow>
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
    <group position={[8.7, 0, -4.7]}>
      <StaticBox
        position={[0, 0.3, 0]}
        scale={[1.4, 0.25, 0.7]}
        color="#d9e8e7"
      />
      <mesh position={[0, 1.6, 0]} rotation={[0, Math.PI / 2, 0]} castShadow>
        <torusGeometry args={[0.9, 0.24, 8, 18]} />
        <meshToonMaterial color="#236a8d" />
      </mesh>
      <StaticBox
        position={[0, 0.95, 0.75]}
        scale={[0.18, 0.8, 0.18]}
        color="#17252e"
      />
    </group>
  );
}

function HospitalGreybox() {
  return (
    <group>
      <StaticBox
        position={[0, -0.15, 0]}
        scale={[14, 0.15, 9]}
        color="#d6c6ac"
      />

      <FloorZone
        position={[0, 0.015, 5.8]}
        scale={[13.7, 0.03, 2.9]}
        color="#e2a669"
      />
      <FloorZone
        position={[-9.2, 0.02, 0]}
        scale={[4.3, 0.035, 2.6]}
        color="#75b98a"
      />
      <FloorZone
        position={[-2.7, 0.02, 0]}
        scale={[2, 0.035, 2.6]}
        color="#e9d57b"
      />
      <FloorZone
        position={[2.1, 0.02, 0]}
        scale={[2, 0.035, 2.6]}
        color="#efc879"
      />
      <FloorZone
        position={[8.4, 0.02, -3.1]}
        scale={[5.1, 0.035, 5.5]}
        color="#8fc2d6"
      />
      <FloorZone
        position={[-2.7, 0.02, -5.8]}
        scale={[6.4, 0.035, 2.7]}
        color="#f1e8d8"
      />

      <StaticBox
        position={[0, 1.5, -9]}
        scale={[14, 1.5, 0.15]}
        color="#f4e9d8"
      />
      <StaticBox
        position={[0, 1.5, 9]}
        scale={[14, 1.5, 0.15]}
        color="#f4e9d8"
      />
      <StaticBox
        position={[-14, 1.5, 0]}
        scale={[0.15, 1.5, 9]}
        color="#f4e9d8"
      />
      <StaticBox
        position={[14, 1.5, 0]}
        scale={[0.15, 1.5, 9]}
        color="#f4e9d8"
      />

      <StaticBox
        position={[-8.2, 1.35, 3]}
        scale={[5.8, 1.35, 0.1]}
        color="#f4e9d8"
      />
      <StaticBox
        position={[8.2, 1.35, 3]}
        scale={[5.8, 1.35, 0.1]}
        color="#f4e9d8"
      />
      <StaticBox
        position={[-5, 1.35, -0.5]}
        scale={[0.1, 1.35, 3.5]}
        color="#f4e9d8"
      />
      <StaticBox
        position={[-5, 1.35, -7.2]}
        scale={[0.1, 1.35, 1.8]}
        color="#f4e9d8"
      />
      <StaticBox
        position={[4.6, 1.35, 0.6]}
        scale={[0.1, 1.35, 2.4]}
        color="#f4e9d8"
      />
      <StaticBox
        position={[4.6, 1.35, -6.8]}
        scale={[0.1, 1.35, 2.2]}
        color="#f4e9d8"
      />

      <Desk position={[-5.5, 0, 5.3]} color="#d96c4b" />
      <Desk position={[-9.2, 0, -0.3]} color="#4e9f6d" />
      <Desk position={[-2.6, 0, -0.3]} color="#d8b44b" />
      <Desk position={[2.1, 0, -0.3]} color="#d8a44b" />
      <XrayMachine />

      <LowPolyPerson position={[-7.4, 0, 6.2]} color="#e94f8a" />
      <LowPolyPerson position={[-8.2, 0, 0.8]} color="#4e9f6d" />
      <LowPolyPerson position={[-1.8, 0, 0.8]} color="#236a8d" />

      <RoomLabel position={[-5.5, 2.1, 4.9]}>ADMINISTRACIÓN</RoomLabel>
      <RoomLabel position={[-9.2, 2.1, -0.5]}>ENFERMERÍA</RoomLabel>
      <RoomLabel position={[-2.6, 2.1, -0.5]}>CONSULTORIO 1</RoomLabel>
      <RoomLabel position={[2.1, 2.1, -0.5]}>CONSULTORIO 2</RoomLabel>
      <RoomLabel position={[8.5, 2.3, -5]}>RAYOS</RoomLabel>
      <RoomLabel position={[-1, 2.2, -6]}>CIRCULACIÓN</RoomLabel>
    </group>
  );
}

export function HospitalScene({ turnSignal, stepSignal }: HospitalSceneProps) {
  return (
    <>
      <color attach="background" args={["#73cfe6"]} />
      <fog attach="fog" args={["#73cfe6", 16, 39]} />
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
