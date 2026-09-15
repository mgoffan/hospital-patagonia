import { useMemo, useState, type SyntheticEvent } from "react";

import {
  DEFAULT_CONFIGURATION,
  DEMAND_OPTIONS,
  ROLE_OPTIONS,
  calculateOperatingCost,
  createRoundConfiguration,
  validateRoundConfiguration,
  type PlayerRole,
  type RoundConfiguration,
  type RoundConfigurationDraft,
} from "../../domain/configuration";
import {
  INVESTMENT_CATALOG,
  RESOURCE_CATALOG,
  REVENUE_RULES,
  SYSTEMS_MAINTENANCE_COST,
  type ResourceKind,
} from "../../domain/economy";

type GameSetupProps = {
  onConfirm: (configuration: RoundConfiguration) => void;
};

const resourceKinds = Object.keys(RESOURCE_CATALOG) as ResourceKind[];

const roleGlyphs: Record<PlayerRole, string> = {
  administrator: "AD",
  nurse: "EN",
  doctor: "MD",
  xrayOperator: "RX",
};

export function GameSetup({ onConfirm }: GameSetupProps) {
  const [draft, setDraft] = useState<RoundConfigurationDraft>({
    ...DEFAULT_CONFIGURATION,
    resources: { ...DEFAULT_CONFIGURATION.resources },
    activeInvestments: [],
  });
  const [submitted, setSubmitted] = useState(false);

  const errors = useMemo(() => validateRoundConfiguration(draft), [draft]);
  const operatingCost = calculateOperatingCost(
    draft.resources,
    draft.systemsEnabled,
  );

  const updateResource = (kind: ResourceKind, nextCount: number) => {
    const count = Math.min(3, Math.max(0, nextCount));
    setDraft((current) => ({
      ...current,
      resources: { ...current.resources, [kind]: count },
    }));
  };

  const handleSubmit = (
    event: SyntheticEvent<HTMLFormElement, SubmitEvent>,
  ) => {
    event.preventDefault();
    setSubmitted(true);
    if (errors.length > 0) return;

    onConfirm(
      createRoundConfiguration(draft, {
        id: crypto.randomUUID(),
        createdAt: new Date().toISOString(),
      }),
    );
  };

  return (
    <main id="top" className="setup-layout">
      <section className="intro-panel">
        <p className="eyebrow">SIMULACIÓN DE OPERACIONES · RONDA 01</p>
        <h1>
          Armá el turno.
          <span>Después empieza la presión.</span>
        </h1>
        <p className="intro-copy">
          Elegí la capacidad del hospital antes de conocer la secuencia de
          llegadas. Cada decisión queda en el P&amp;L de la partida.
        </p>
        <ol className="progress-steps" aria-label="Etapas de la partida">
          <li className="active">
            <span>01</span> Configuración
          </li>
          <li>
            <span>02</span> Operación
          </li>
          <li>
            <span>03</span> Resultados
          </li>
        </ol>
      </section>

      <form className="setup-card" onSubmit={handleSubmit} noValidate>
        <section
          className="form-section identity-grid"
          aria-labelledby="identity-title"
        >
          <SectionHeading
            number="01"
            title="Identidad de la ronda"
            description="La semilla permite repetir exactamente la misma demanda."
            id="identity-title"
          />
          <label className="field">
            <span>Nombre de partida</span>
            <input
              value={draft.name}
              onChange={(event) => {
                setDraft((current) => ({
                  ...current,
                  name: event.target.value,
                }));
              }}
              placeholder="Ej. Equipo Cóndor"
            />
          </label>
          <label className="field">
            <span>Semilla</span>
            <input
              value={draft.seed}
              onChange={(event) => {
                setDraft((current) => ({
                  ...current,
                  seed: event.target.value,
                }));
              }}
              spellCheck="false"
            />
          </label>
        </section>

        <section className="form-section" aria-labelledby="demand-title">
          <SectionHeading
            number="02"
            title="Nivel de demanda"
            description="Vas a conocer el volumen, no el momento de cada llegada."
            id="demand-title"
          />
          <div className="option-grid demand-grid">
            {DEMAND_OPTIONS.map((option) => (
              <label
                className={`choice-card ${draft.demandId === option.id ? "selected" : ""}`}
                key={option.id}
              >
                <input
                  type="radio"
                  name="demand"
                  value={option.id}
                  checked={draft.demandId === option.id}
                  onChange={() => {
                    setDraft((current) => ({
                      ...current,
                      demandId: option.id,
                    }));
                  }}
                />
                <strong>{option.label}</strong>
                <span>{option.arrivalCount} llegadas</span>
              </label>
            ))}
          </div>
        </section>

        <section className="form-section" aria-labelledby="role-title">
          <SectionHeading
            number="03"
            title="Tu rol first-person"
            description="Los demás puestos serán operados por compañeros IA."
            id="role-title"
          />
          <div className="option-grid role-grid">
            {ROLE_OPTIONS.map((role) => (
              <label
                className={`choice-card role-card ${draft.playerRole === role.id ? "selected" : ""}`}
                key={role.id}
              >
                <input
                  type="radio"
                  name="role"
                  value={role.id}
                  checked={draft.playerRole === role.id}
                  onChange={() => {
                    setDraft((current) => ({
                      ...current,
                      playerRole: role.id,
                    }));
                  }}
                />
                <span className="role-glyph">{roleGlyphs[role.id]}</span>
                <strong>{role.label}</strong>
              </label>
            ))}
          </div>
        </section>

        <section className="form-section" aria-labelledby="resources-title">
          <SectionHeading
            number="04"
            title="Capacidad y costos"
            description="Los costos se contabilizan por ronda en esta versión."
            id="resources-title"
          />
          <div className="resource-list">
            {resourceKinds.map((kind) => (
              <ResourceRow
                key={kind}
                kind={kind}
                count={draft.resources[kind]}
                onChange={updateResource}
              />
            ))}
            <label className="resource-row system-row">
              <span className="resource-icon">SI</span>
              <span className="resource-info">
                <strong>Mantenimiento de sistemas</strong>
                <small>Sistema activo en esta ronda</small>
              </span>
              <span className="unit-cost">${SYSTEMS_MAINTENANCE_COST}</span>
              <input
                className="switch-input"
                type="checkbox"
                checked={draft.systemsEnabled}
                onChange={(event) => {
                  setDraft((current) => ({
                    ...current,
                    systemsEnabled: event.target.checked,
                  }));
                }}
                aria-label="Activar mantenimiento de sistemas"
              />
              <span className="row-subtotal">
                ${draft.systemsEnabled ? SYSTEMS_MAINTENANCE_COST : 0}
              </span>
            </label>
          </div>
        </section>

        <section className="economy-strip" aria-labelledby="economy-title">
          <div>
            <p className="eyebrow" id="economy-title">
              INGRESO POR PACIENTE EN TÉRMINO
            </p>
            <div className="revenue-values">
              <span>
                <i className="standard-dot" /> Normal{" "}
                <strong>${REVENUE_RULES.standardOnTime}</strong>
              </span>
              <span>
                <i className="vip-dot" /> VIP{" "}
                <strong>${REVENUE_RULES.vipOnTime}</strong>
              </span>
              <span>
                <i className="late-dot" /> Tarde{" "}
                <strong>${REVENUE_RULES.late}</strong>
              </span>
            </div>
          </div>
          <p className="service-rule">
            Objetivo: egreso en ≤ {REVENUE_RULES.serviceLevelSeconds} s
          </p>
        </section>

        <details className="investment-preview">
          <summary>Ver inversiones disponibles entre rondas</summary>
          <div className="investment-grid">
            {Object.values(INVESTMENT_CATALOG).map((investment) => (
              <span key={investment.label}>
                {investment.label} <strong>${investment.cost}</strong>
              </span>
            ))}
          </div>
        </details>

        {submitted && errors.length > 0 ? (
          <div className="error-summary" role="alert">
            <strong>Revisá la configuración:</strong>
            <ul>
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <footer className="setup-footer">
          <div>
            <small>COSTO OPERATIVO DEL TURNO</small>
            <strong>${operatingCost}</strong>
            <span>Inversiones no incluidas</span>
          </div>
          <button type="submit">
            Confirmar partida
            <span aria-hidden="true">→</span>
          </button>
        </footer>
      </form>
    </main>
  );
}

type SectionHeadingProps = {
  number: string;
  title: string;
  description: string;
  id: string;
};

function SectionHeading({
  number,
  title,
  description,
  id,
}: SectionHeadingProps) {
  return (
    <div className="section-heading full-width">
      <span className="section-number">{number}</span>
      <div>
        <h2 id={id}>{title}</h2>
        <p>{description}</p>
      </div>
    </div>
  );
}

type ResourceRowProps = {
  kind: ResourceKind;
  count: number;
  onChange: (kind: ResourceKind, count: number) => void;
};

function ResourceRow({ kind, count, onChange }: ResourceRowProps) {
  const resource = RESOURCE_CATALOG[kind];
  const timeLabel = resource.processTime
    ? `${String(resource.processTime.minimumSeconds)}–${String(resource.processTime.maximumSeconds)} s por paciente`
    : "Ingreso y egreso";

  return (
    <div className="resource-row">
      <span className="resource-icon">{roleGlyphs[kind]}</span>
      <span className="resource-info">
        <strong>{resource.label}</strong>
        <small>{timeLabel}</small>
      </span>
      <span className="unit-cost">${resource.unitCost} c/u</span>
      <span className="stepper">
        <button
          type="button"
          onClick={() => {
            onChange(kind, count - 1);
          }}
          aria-label={`Quitar ${resource.label}`}
          disabled={count === 0}
        >
          −
        </button>
        <output aria-label={`Cantidad de ${resource.label}`}>{count}</output>
        <button
          type="button"
          onClick={() => {
            onChange(kind, count + 1);
          }}
          aria-label={`Agregar ${resource.label}`}
          disabled={count === 3}
        >
          +
        </button>
      </span>
      <span className="row-subtotal">${resource.unitCost * count}</span>
    </div>
  );
}
