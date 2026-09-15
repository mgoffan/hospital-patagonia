import { lazy, Suspense, useState } from "react";

import {
  ROLE_OPTIONS,
  type RoundConfiguration,
} from "../../domain/configuration";

const HospitalViewport = lazy(() => import("./HospitalViewport"));

type GameOperationProps = {
  configuration: RoundConfiguration;
  onComplete: () => void;
  onBack: () => void;
};

export default function GameOperation({
  configuration,
  onComplete,
  onBack,
}: GameOperationProps) {
  const [turnSignal, setTurnSignal] = useState(0);
  const [stepSignal, setStepSignal] = useState(0);
  const canRender3d = typeof WebGLRenderingContext !== "undefined";
  const role = ROLE_OPTIONS.find(
    (option) => option.id === configuration.playerRole,
  );

  const requestPointerLock = () => {
    const canvas = document.querySelector<HTMLCanvasElement>(
      ".operation-canvas canvas",
    );
    if (canvas?.requestPointerLock) void canvas.requestPointerLock();
  };

  return (
    <main id="top" className="operation-layout">
      <section className="operation-stage" aria-labelledby="operation-title">
        <div className="operation-canvas" aria-hidden={!canRender3d}>
          {canRender3d ? (
            <Suspense
              fallback={
                <div className="viewport-loader">Construyendo salas…</div>
              }
            >
              <HospitalViewport
                turnSignal={turnSignal}
                stepSignal={stepSignal}
              />
            </Suspense>
          ) : (
            <div className="webgl-fallback">
              <strong>Vista 3D no disponible en este entorno</strong>
              <span>
                La simulación headless y el debrief siguen funcionando.
              </span>
            </div>
          )}
        </div>

        <div className="operation-topbar">
          <div>
            <span>ROL</span>
            <strong>{role?.label}</strong>
          </div>
          <div className="operation-clock">
            <span>RECORRIDO DE VALIDACIÓN</span>
            <strong>05:00</strong>
          </div>
          <div>
            <span>COSTO DEL TURNO</span>
            <strong>${configuration.operatingCost}</strong>
          </div>
        </div>

        {canRender3d ? (
          <span className="crosshair" aria-hidden="true">
            +
          </span>
        ) : null}

        <div className="operation-brief">
          <p className="eyebrow">PROTOTIPO JUGABLE · M4</p>
          <h1 id="operation-title">Recorré el hospital.</h1>
          <p>
            Observá pacientes y personal circulando por el proceso. El reloj de
            la ronda todavía no corre dentro del mundo.
          </p>
        </div>

        <div
          className="movement-panel"
          aria-label="Controles alternativos de movimiento"
        >
          <button
            type="button"
            onClick={() => {
              setTurnSignal((current) => current - 1);
            }}
            aria-label="Girar a la izquierda"
          >
            ↶
          </button>
          <button
            type="button"
            onClick={() => {
              setStepSignal((current) => current + 1);
            }}
            aria-label="Avanzar un paso"
          >
            ↑
          </button>
          <button
            type="button"
            onClick={() => {
              setTurnSignal((current) => current + 1);
            }}
            aria-label="Girar a la derecha"
          >
            ↷
          </button>
          <button
            type="button"
            onClick={() => {
              setStepSignal((current) => current - 1);
            }}
            aria-label="Retroceder un paso"
          >
            ↓
          </button>
        </div>

        <div className="operation-actions">
          <button
            className="world-button"
            id="enter-world"
            type="button"
            onClick={requestPointerLock}
            disabled={!canRender3d}
          >
            Entrar first-person
          </button>
          <span>WASD para moverte · mouse para mirar · Esc para liberar</span>
          <button
            className="finish-round-button"
            type="button"
            onClick={onComplete}
          >
            Finalizar ronda y ver resultados
          </button>
        </div>
      </section>
      <button className="back-link" type="button" onClick={onBack}>
        ← Volver a la configuración confirmada
      </button>
    </main>
  );
}
