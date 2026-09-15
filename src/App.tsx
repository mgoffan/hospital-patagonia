import { useState } from "react";

import type { RoundConfiguration } from "./domain/configuration";
import { RoundDebrief } from "./features/debrief/RoundDebrief";
import { GameSetup } from "./features/setup/GameSetup";
import { ReadyRoom } from "./features/setup/ReadyRoom";
import { runSimulation, type SimulationResult } from "./simulation/engine";

export function App() {
  const [configuration, setConfiguration] = useState<RoundConfiguration | null>(
    null,
  );
  const [simulation, setSimulation] = useState<SimulationResult | null>(null);

  const reset = () => {
    setSimulation(null);
    setConfiguration(null);
  };

  return (
    <div className="app-shell">
      <div className="low-poly-world" aria-hidden="true">
        <div className="sun" />
        <div className="mountain mountain-back" />
        <div className="mountain mountain-front" />
        <div className="ground" />
      </div>

      <header className="game-header">
        <a
          className="brand"
          href="#top"
          aria-label="Hospital Patagonia, inicio"
        >
          <span className="brand-mark">HP</span>
          <span>
            <strong>Hospital Patagonia</strong>
            <small>Turno Crítico</small>
          </span>
        </a>
        <span className="build-tag">
          PRE-ALPHA · {simulation ? "DEBRIEF" : "SETUP"}
        </span>
      </header>

      {simulation ? (
        <RoundDebrief simulation={simulation} onNewRound={reset} />
      ) : configuration ? (
        <ReadyRoom
          configuration={configuration}
          onEdit={() => {
            setConfiguration(null);
          }}
          onRun={() => {
            setSimulation(runSimulation(configuration));
          }}
        />
      ) : (
        <GameSetup onConfirm={setConfiguration} />
      )}
    </div>
  );
}
