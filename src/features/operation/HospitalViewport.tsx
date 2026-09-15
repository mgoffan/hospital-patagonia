import { Canvas } from "@react-three/fiber";
import { Suspense } from "react";

import { HospitalScene } from "../../three/HospitalScene";

type HospitalViewportProps = {
  turnSignal: number;
  stepSignal: number;
};

export default function HospitalViewport({
  turnSignal,
  stepSignal,
}: HospitalViewportProps) {
  return (
    <Canvas
      shadows
      dpr={[1, 1.5]}
      camera={{ fov: 68, near: 0.1, far: 70, position: [0, 1.6, 7.1] }}
      gl={{ antialias: true, powerPreference: "high-performance" }}
    >
      <Suspense fallback={null}>
        <HospitalScene turnSignal={turnSignal} stepSignal={stepSignal} />
      </Suspense>
    </Canvas>
  );
}
