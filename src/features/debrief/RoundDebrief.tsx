import { RESOURCE_CATALOG } from "../../domain/economy";
import type { SimulationResult, StationId } from "../../simulation/engine";

type RoundDebriefProps = {
  simulation: SimulationResult;
  onNewRound: () => void;
};

const stationLabels: Record<StationId, string> = {
  administration: RESOURCE_CATALOG.administrator.label,
  nursing: RESOURCE_CATALOG.nurse.label,
  doctor: RESOURCE_CATALOG.doctor.label,
  xray: RESOURCE_CATALOG.xrayOperator.label,
};

const money = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 0,
});

function seconds(milliseconds: number) {
  return `${(milliseconds / 1000).toLocaleString("es-AR", {
    maximumFractionDigits: 1,
  })} s`;
}

export function RoundDebrief({ simulation, onNewRound }: RoundDebriefProps) {
  const { operations, pnl } = simulation.results;
  const completed = operations.servedOnTime + operations.late;
  const serviceLevel =
    completed === 0 ? 0 : operations.servedOnTime / completed;
  const bottleneck = [...simulation.stations].sort(
    (left, right) =>
      right.maximumQueueLength - left.maximumQueueLength ||
      right.utilization - left.utilization,
  )[0];

  return (
    <main id="top" className="debrief-layout">
      <section className="debrief-hero">
        <div>
          <p className="eyebrow">RONDA COMPLETADA · 05:00</p>
          <h1>Así funcionó tu hospital.</h1>
          <p>
            Configuración <strong>{simulation.configuration.name}</strong> ·
            semilla <code>{simulation.configuration.seed}</code>
          </p>
        </div>
        <button className="secondary-button" type="button" onClick={onNewRound}>
          Nueva configuración
        </button>
      </section>

      <section className="score-grid" aria-label="Resultado principal">
        <article className="score-card score-card-highlight">
          <span>Atendidos en término</span>
          <strong>{operations.servedOnTime}</strong>
          <small>de {operations.arrivals} llegadas</small>
        </article>
        <article className="score-card">
          <span>Nivel de servicio</span>
          <strong>{Math.round(serviceLevel * 100)}%</strong>
          <small>sobre pacientes egresados</small>
        </article>
        <article className="score-card">
          <span>Tiempo de ciclo</span>
          <strong>{seconds(simulation.averageCycleTimeMs)}</strong>
          <small>promedio de egresados</small>
        </article>
        <article
          className={`score-card ${pnl.netResult < 0 ? "score-card-negative" : ""}`}
        >
          <span>Resultado neto</span>
          <strong>{money.format(pnl.netResult)}</strong>
          <small>ingresos menos costos</small>
        </article>
      </section>

      <div className="debrief-columns">
        <section className="debrief-panel" aria-labelledby="operations-title">
          <PanelHeading
            eyebrow="OPERACIÓN"
            title="Flujo de pacientes"
            id="operations-title"
          />
          <dl className="metric-list">
            <Metric label="Llegadas" value={operations.arrivals} />
            <Metric
              label="Egresados en término"
              value={operations.servedOnTime}
            />
            <Metric label="VIP en término" value={operations.vipServedOnTime} />
            <Metric label="Egresados tarde" value={operations.late} />
            <Metric label="WIP al cierre" value={operations.workInProgress} />
          </dl>
          <div className="insight-box">
            <span>CUELLO DE BOTELLA OBSERVADO</span>
            <strong>
              {bottleneck ? stationLabels[bottleneck.stationId] : "Sin datos"}
            </strong>
            <p>
              Cola máxima de {bottleneck?.maximumQueueLength ?? 0} pacientes. Es
              una observación del resultado, no una recomendación automática.
            </p>
          </div>
        </section>

        <section
          className="debrief-panel pnl-panel"
          aria-labelledby="pnl-title"
        >
          <PanelHeading
            eyebrow="P&L"
            title="Resultado de la ronda"
            id="pnl-title"
          />
          <dl className="ledger-list">
            <LedgerLine
              label="Ingresos por atención"
              value={pnl.revenue}
              positive
            />
            <LedgerLine label="Personal" value={-pnl.staffCost} />
            <LedgerLine label="Mantenimiento" value={-pnl.maintenanceCost} />
            <LedgerLine label="Penalidades" value={-pnl.penalties} />
            <LedgerLine label="Inversiones" value={-pnl.investments} />
            <div className="ledger-total">
              <dt>Resultado neto</dt>
              <dd>{money.format(pnl.netResult)}</dd>
            </div>
          </dl>
          <p className="assumption-note">
            Costos tratados por ronda. Penalidades adicionales en $0 hasta
            confirmar la fórmula del profesor.
          </p>
        </section>
      </div>

      <section
        className="debrief-panel station-panel"
        aria-labelledby="stations-title"
      >
        <PanelHeading
          eyebrow="CAPACIDAD"
          title="Desempeño por estación"
          id="stations-title"
        />
        <div
          className="station-table"
          role="table"
          aria-label="Desempeño por estación"
        >
          <div className="station-table-head" role="row">
            <span role="columnheader">Estación</span>
            <span role="columnheader">Capacidad</span>
            <span role="columnheader">Servicios</span>
            <span role="columnheader">Espera prom.</span>
            <span role="columnheader">Cola máx.</span>
            <span role="columnheader">Utilización</span>
          </div>
          {simulation.stations.map((station) => (
            <div
              className="station-table-row"
              role="row"
              key={station.stationId}
            >
              <strong role="cell">{stationLabels[station.stationId]}</strong>
              <span role="cell">{station.capacity}</span>
              <span role="cell">{station.completedServices}</span>
              <span role="cell">{seconds(station.averageWaitMs)}</span>
              <span role="cell">{station.maximumQueueLength}</span>
              <span role="cell" className="utilization-cell">
                <i
                  style={{
                    width: `${String(Math.round(station.utilization * 100))}%`,
                  }}
                />
                {Math.round(station.utilization * 100)}%
              </span>
            </div>
          ))}
        </div>
      </section>

      <section
        className="debrief-panel patient-panel"
        aria-labelledby="patients-title"
      >
        <PanelHeading
          eyebrow="TRAZABILIDAD"
          title="Pacientes"
          id="patients-title"
        />
        <div className="patient-chips">
          {simulation.patients.map((patient) => (
            <span
              className={`patient-chip patient-${patient.status}`}
              key={patient.id}
            >
              <strong>#{patient.code}</strong>
              {patient.kind === "vip" ? "VIP" : "Normal"}
              {patient.requiresXray ? " · RX" : ""}
              <small>
                {patient.cycleTimeMs === undefined
                  ? "WIP"
                  : seconds(patient.cycleTimeMs)}
              </small>
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}

type PanelHeadingProps = { eyebrow: string; title: string; id: string };

function PanelHeading({ eyebrow, title, id }: PanelHeadingProps) {
  return (
    <header className="panel-heading">
      <p className="eyebrow">{eyebrow}</p>
      <h2 id={id}>{title}</h2>
    </header>
  );
}

function Metric({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <dt>{label}</dt>
      <dd>{value}</dd>
    </div>
  );
}

function LedgerLine({
  label,
  value,
  positive = false,
}: {
  label: string;
  value: number;
  positive?: boolean;
}) {
  return (
    <div>
      <dt>{label}</dt>
      <dd className={positive ? "positive" : ""}>{money.format(value)}</dd>
    </div>
  );
}
