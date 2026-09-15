import {
  CapsuleCollider,
  RigidBody,
  type RapierRigidBody,
} from "@react-three/rapier";
import { useFrame, useThree } from "@react-three/fiber";
import { useEffect, useMemo, useRef } from "react";
import { MathUtils, Vector3 } from "three";

type FirstPersonControllerProps = {
  turnSignal: number;
  stepSignal: number;
};

const MOVE_SPEED = 4.2;
const PLAYER_HEIGHT = 1.65;

export function FirstPersonController({
  turnSignal,
  stepSignal,
}: FirstPersonControllerProps) {
  const body = useRef<RapierRigidBody>(null);
  const pressedKeys = useRef(new Set<string>());
  const yaw = useRef(0);
  const pitch = useRef(0);
  const previousTurnSignal = useRef(turnSignal);
  const previousStepSignal = useRef(stepSignal);
  const { camera, gl } = useThree();
  const forward = useMemo(() => new Vector3(), []);
  const right = useMemo(() => new Vector3(), []);
  const velocity = useMemo(() => new Vector3(), []);

  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (
        [
          "KeyW",
          "KeyA",
          "KeyS",
          "KeyD",
          "ArrowUp",
          "ArrowDown",
          "ArrowLeft",
          "ArrowRight",
        ].includes(event.code)
      ) {
        event.preventDefault();
        pressedKeys.current.add(event.code);
      }
    };
    const handleKeyUp = (event: KeyboardEvent) => {
      pressedKeys.current.delete(event.code);
    };
    const clearKeys = () => {
      pressedKeys.current.clear();
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    window.addEventListener("blur", clearKeys);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
      window.removeEventListener("blur", clearKeys);
    };
  }, []);

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      if (document.pointerLockElement !== gl.domElement) return;
      yaw.current -= event.movementX * 0.0022;
      pitch.current = MathUtils.clamp(
        pitch.current - event.movementY * 0.0018,
        -1.1,
        1.1,
      );
    };

    document.addEventListener("pointermove", handlePointerMove);
    return () => {
      document.removeEventListener("pointermove", handlePointerMove);
    };
  }, [gl.domElement]);

  useEffect(() => {
    const delta = turnSignal - previousTurnSignal.current;
    previousTurnSignal.current = turnSignal;
    if (delta !== 0) yaw.current -= delta * (Math.PI / 8);
  }, [turnSignal]);

  useEffect(() => {
    const delta = stepSignal - previousStepSignal.current;
    previousStepSignal.current = stepSignal;
    const rigidBody = body.current;
    if (delta === 0 || !rigidBody) return;

    const translation = rigidBody.translation();
    const direction = delta > 0 ? 1 : -1;
    rigidBody.setTranslation(
      {
        x: translation.x - Math.sin(yaw.current) * 0.65 * direction,
        y: translation.y,
        z: translation.z - Math.cos(yaw.current) * 0.65 * direction,
      },
      true,
    );
  }, [stepSignal]);

  useFrame(() => {
    const rigidBody = body.current;
    if (!rigidBody) return;

    const keys = pressedKeys.current;
    const forwardInput =
      (keys.has("KeyW") || keys.has("ArrowUp") ? 1 : 0) -
      (keys.has("KeyS") || keys.has("ArrowDown") ? 1 : 0);
    const sidewaysInput =
      (keys.has("KeyD") || keys.has("ArrowRight") ? 1 : 0) -
      (keys.has("KeyA") || keys.has("ArrowLeft") ? 1 : 0);

    forward.set(-Math.sin(yaw.current), 0, -Math.cos(yaw.current));
    right.set(Math.cos(yaw.current), 0, -Math.sin(yaw.current));
    velocity
      .set(0, 0, 0)
      .addScaledVector(forward, forwardInput)
      .addScaledVector(right, sidewaysInput);
    if (velocity.lengthSq() > 0)
      velocity.normalize().multiplyScalar(MOVE_SPEED);
    rigidBody.setLinvel({ x: velocity.x, y: 0, z: velocity.z }, true);

    const translation = rigidBody.translation();
    camera.position.set(
      translation.x,
      translation.y + PLAYER_HEIGHT * 0.42,
      translation.z,
    );
    camera.rotation.set(pitch.current, yaw.current, 0, "YXZ");
  });

  return (
    <RigidBody
      ref={body}
      colliders={false}
      position={[0, 0.85, 7.1]}
      enabledRotations={[false, false, false]}
      gravityScale={0}
      linearDamping={8}
      canSleep={false}
    >
      <CapsuleCollider args={[0.48, 0.34]} />
    </RigidBody>
  );
}
