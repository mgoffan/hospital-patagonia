import { useState } from "react";

import type { RoundConfiguration } from "./domain/configuration";
import { GameSetup } from "./features/setup/GameSetup";
import { ReadyRoom } from "./features/setup/ReadyRoom";

export function App() {
  const [configuration, setConfiguration] = useState<RoundConfiguration | null>(
    null,
  );

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
        <span className="build-tag">PRE-ALPHA · SETUP</span>
      </header>

      {configuration ? (
        <ReadyRoom
          configuration={configuration}
          onEdit={() => {
            setConfiguration(null);
          }}
        />
      ) : (
        <GameSetup onConfirm={setConfiguration} />
      )}
    </div>
  );
}
