import { lazy, Suspense, useEffect, useMemo, useState } from "react";

import {
  ROLE_OPTIONS,
  type RoundConfiguration,
} from "../../domain/configuration";
import type { SimulationResult } from "../../simulation/engine";
import { deriveVisualPatientStates } from "../../simulation/visualTimeline";

const HospitalViewport = lazy(() => import("./HospitalViewport"));

type GameOperationProps = {
  configuration: RoundConfiguration;
  simulation: SimulationResult;
  onComplete: () => void;
  onBack: () => void;
};

export default function GameOperation({
  configuration,
  simulation,
  onComplete,
  onBack,
}: GameOperationProps) {
  const [turnSignal, setTurnSignal] = useState(0);
  const [stepSignal, setStepSignal] = useState(0);
  const [elapsedMs, setElapsedMs] = useState(0);
  const [running, setRunning] = useState(false);
  const canRender3d = typeof WebGLRenderingContext !== "undefined";
  const role = ROLE_OPTIONS.find(
    (option) => option.id === configuration.playerRole,
  );
  const remainingSeconds = Math.ceil(
    (simulation.durationMs - elapsedMs) / 1000,
  );
  const clock = `${String(Math.floor(remainingSeconds / 60)).padStart(2, "0")}:${String(remainingSeconds % 60).padStart(2, "0")}`;
  const visiblePatients = useMemo(
    () => deriveVisualPatientStates(simulation, elapsedMs),
    [elapsedMs, simulation],
  );
  const activePatients = visiblePatients.filter(
    (patient) => patient.activity !== "departing",
  );
  const dischargedCount = simulation.events.filter(
    (event) => event.type === "patientDischarged" && event.atMs <= elapsedMs,
  ).length;
  const queuedCount = visiblePatients.filter(
    (patient) => patient.activity === "queued",
  ).length;

  useEffect(() => {
    if (!running || elapsedMs >= simulation.durationMs) return;
    const interval = window.setInterval(() => {
      setElapsedMs((current) =>
        Math.min(simulation.durationMs, current + 1_000),
      );
    }, 1_000);
    return () => {
      window.clearInterval(interval);
    };
  }, [elapsedMs, running, simulation.durationMs]);

  const requestPointerLock = () => {
    setRunning(true);
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
                simulation={simulation}
                elapsedMs={elapsedMs}
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
            <span>
              {running ? "RONDA EN CURSO · TIEMPO REAL" : "RONDA EN PAUSA"}
            </span>
            <strong>{clock}</strong>
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
            Las llegadas, colas y servicios ahora siguen el motor determinista.
            Iniciá el reloj y entrá al mundo para seguir cada recorrido.
          </p>
          <dl className="live-flow-stats" aria-label="Estado de la ronda">
            <div>
              <dt>Activos</dt>
              <dd>{activePatients.length}</dd>
            </div>
            <div>
              <dt>En cola</dt>
              <dd>{queuedCount}</dd>
            </div>
            <div>
              <dt>Altas</dt>
              <dd>{dischargedCount}</dd>
            </div>
          </dl>
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
            {running ? "Volver a first-person" : "Entrar e iniciar ronda"}
          </button>
          <span>WASD para moverte · mouse para mirar · Esc para liberar</span>
          <button
            className="round-toggle-button"
            type="button"
            onClick={() => {
              setRunning((current) => !current);
            }}
            disabled={elapsedMs >= simulation.durationMs}
          >
            {running
              ? "Pausar reloj"
              : elapsedMs > 0
                ? "Reanudar reloj"
                : "Iniciar reloj"}
          </button>
          <button
            className="finish-round-button"
            type="button"
            onClick={onComplete}
          >
            {elapsedMs >= simulation.durationMs
              ? "Ver resultados"
              : "Saltar al resultado"}
          </button>
        </div>
      </section>
      <button className="back-link" type="button" onClick={onBack}>
        ← Volver a la configuración confirmada
      </button>
    </main>
  );
}
