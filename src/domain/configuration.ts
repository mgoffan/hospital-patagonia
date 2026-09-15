import {
  ECONOMY_VERSION,
  RESOURCE_CATALOG,
  SYSTEMS_MAINTENANCE_COST,
  type InvestmentKind,
  type ResourceKind,
} from "./economy";

export const DEMAND_OPTIONS = [
  { id: "low", label: "Baja", arrivalCount: 8 },
  { id: "medium", label: "Media", arrivalCount: 17 },
  { id: "intermediate", label: "Intermedia", arrivalCount: 28 },
  { id: "high", label: "Alta", arrivalCount: 49 },
] as const;

export type DemandId = (typeof DEMAND_OPTIONS)[number]["id"];

export const ROLE_OPTIONS = [
  { id: "administrator", label: "Administración" },
  { id: "nurse", label: "Enfermería" },
  { id: "doctor", label: "Médico" },
  { id: "xrayOperator", label: "Rayos" },
] as const;

export type PlayerRole = (typeof ROLE_OPTIONS)[number]["id"];

export type ResourceCounts = Record<ResourceKind, number>;

export type RoundConfigurationDraft = {
  name: string;
  seed: string;
  demandId: DemandId;
  playerRole: PlayerRole;
  resources: ResourceCounts;
  systemsEnabled: boolean;
  activeInvestments: InvestmentKind[];
};

export type RoundConfiguration = Readonly<
  Omit<RoundConfigurationDraft, "resources" | "activeInvestments"> & {
    resources: Readonly<ResourceCounts>;
    activeInvestments: readonly InvestmentKind[];
    id: string;
    economyVersion: number;
    operatingCost: number;
    createdAt: string;
  }
>;

export const DEFAULT_CONFIGURATION: RoundConfigurationDraft = {
  name: "Turno 1",
  seed: "patagonia-2026",
  demandId: "medium",
  playerRole: "administrator",
  resources: {
    administrator: 1,
    nurse: 1,
    doctor: 1,
    xrayOperator: 1,
  },
  systemsEnabled: false,
  activeInvestments: [],
};

export function calculateOperatingCost(
  resources: ResourceCounts,
  systemsEnabled: boolean,
) {
  const staffCost = (
    Object.entries(resources) as [ResourceKind, number][]
  ).reduce(
    (total, [resourceKind, count]) =>
      total + RESOURCE_CATALOG[resourceKind].unitCost * count,
    0,
  );

  return staffCost + (systemsEnabled ? SYSTEMS_MAINTENANCE_COST : 0);
}

export function validateRoundConfiguration(
  draft: RoundConfigurationDraft,
): string[] {
  const errors: string[] = [];

  if (draft.name.trim().length === 0)
    errors.push("Ingresá un nombre de partida.");
  if (draft.seed.trim().length === 0) errors.push("Ingresá una semilla.");

  for (const [resourceKind, count] of Object.entries(draft.resources) as [
    ResourceKind,
    number,
  ][]) {
    if (!Number.isInteger(count) || count < 0 || count > 3) {
      errors.push(
        `${RESOURCE_CATALOG[resourceKind].label} debe tener entre 0 y 3 recursos.`,
      );
    }
  }

  if (draft.resources.administrator < 1)
    errors.push("Necesitás al menos un administrativo.");
  if (draft.resources.nurse < 1)
    errors.push("Necesitás al menos un enfermero.");
  if (draft.resources.doctor < 1) errors.push("Necesitás al menos un médico.");

  return errors;
}

export function createRoundConfiguration(
  draft: RoundConfigurationDraft,
  metadata: { id: string; createdAt: string },
): RoundConfiguration {
  const errors = validateRoundConfiguration(draft);
  if (errors.length > 0) throw new Error(errors.join(" "));

  const resources = Object.freeze({ ...draft.resources });
  const activeInvestments = Object.freeze([...draft.activeInvestments]);

  return Object.freeze({
    ...draft,
    name: draft.name.trim(),
    seed: draft.seed.trim(),
    resources,
    activeInvestments,
    id: metadata.id,
    createdAt: metadata.createdAt,
    economyVersion: ECONOMY_VERSION,
    operatingCost: calculateOperatingCost(resources, draft.systemsEnabled),
  });
}
