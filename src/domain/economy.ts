export const ECONOMY_VERSION = 1;

export const RESOURCE_CATALOG = {
  administrator: {
    label: "Administración",
    unitCost: 50,
    processTime: null,
  },
  nurse: {
    label: "Enfermería",
    unitCost: 50,
    processTime: { minimumSeconds: 5.6, maximumSeconds: 9.8 },
  },
  doctor: {
    label: "Médicos",
    unitCost: 100,
    processTime: { minimumSeconds: 4.9, maximumSeconds: 15 },
  },
  xrayOperator: {
    label: "Operadores de rayos",
    unitCost: 50,
    processTime: { minimumSeconds: 5.6, maximumSeconds: 9.8 },
  },
} as const;

export type ResourceKind = keyof typeof RESOURCE_CATALOG;

export const REVENUE_RULES = {
  standardOnTime: 50,
  vipOnTime: 200,
  late: 0,
  serviceLevelSeconds: 60,
} as const;

export const SYSTEMS_MAINTENANCE_COST = 50;

export const INVESTMENT_CATALOG = {
  systems: { label: "Sistemas", cost: 250 },
  xrayMachine: { label: "Máquina de rayos", cost: 400 },
  flexibility: { label: "Flexibilidad", cost: 200 },
  processRedesign: { label: "Rediseño de procesos", cost: 200 },
  triage: { label: "Triage", cost: 0 },
} as const;

export type InvestmentKind = keyof typeof INVESTMENT_CATALOG;
