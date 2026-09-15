import {
  DEMAND_OPTIONS,
  ROLE_OPTIONS,
  type RoundConfiguration,
} from "../../domain/configuration";

type ReadyRoomProps = {
  configuration: RoundConfiguration;
  onEdit: () => void;
  onRun: () => void;
};

export function ReadyRoom({ configuration, onEdit, onRun }: ReadyRoomProps) {
  const demand = DEMAND_OPTIONS.find(
    (option) => option.id === configuration.demandId,
  );
  const role = ROLE_OPTIONS.find(
    (option) => option.id === configuration.playerRole,
  );

  return (
    <main className="ready-layout">
      <section className="ready-card">
        <span className="ready-check" aria-hidden="true">
          ✓
        </span>
        <p className="eyebrow">CONFIGURACIÓN GUARDADA</p>
        <h1>{configuration.name}</h1>
        <p className="ready-copy">
          La ronda quedó congelada con la versión económica{" "}
          {configuration.economyVersion}. Podés ejecutar ahora el motor de
          operaciones y revisar su resultado.
        </p>
        <dl className="ready-stats">
          <div>
            <dt>Demanda</dt>
            <dd>
              {demand?.label} · {demand?.arrivalCount} llegadas
            </dd>
          </div>
          <div>
            <dt>Tu rol</dt>
            <dd>{role?.label}</dd>
          </div>
          <div>
            <dt>Semilla</dt>
            <dd>{configuration.seed}</dd>
          </div>
          <div>
            <dt>Costo del turno</dt>
            <dd>${configuration.operatingCost}</dd>
          </div>
        </dl>
        <div className="ready-actions">
          <button className="secondary-button" type="button" onClick={onEdit}>
            Editar configuración
          </button>
          <button className="primary-button" type="button" onClick={onRun}>
            Simular ronda de 5 minutos
          </button>
        </div>
      </section>
    </main>
  );
}
