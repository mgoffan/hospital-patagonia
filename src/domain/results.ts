import type { RoundConfiguration } from "./configuration";
import {
  INVESTMENT_CATALOG,
  RESOURCE_CATALOG,
  REVENUE_RULES,
  SYSTEMS_MAINTENANCE_COST,
  type ResourceKind,
} from "./economy";

export type PatientOutcome = {
  patientId: string;
  kind: "standard" | "vip";
  status: "onTime" | "late" | "pending";
};

export type LedgerCategory =
  "revenue" | "staff" | "maintenance" | "penalty" | "investment";

export type LedgerEntry = {
  id: string;
  category: LedgerCategory;
  amount: number;
  referenceId: string;
};

export type RoundResult = {
  operations: {
    arrivals: number;
    servedOnTime: number;
    vipServedOnTime: number;
    late: number;
    workInProgress: number;
  };
  pnl: {
    revenue: number;
    staffCost: number;
    maintenanceCost: number;
    penalties: number;
    investments: number;
    operatingResult: number;
    netResult: number;
  };
  ledger: LedgerEntry[];
};

export function calculateRoundResult(
  configuration: RoundConfiguration,
  patients: PatientOutcome[],
  penalties: Partial<Record<"standard" | "vip", number>> = {},
): RoundResult {
  const ledger: LedgerEntry[] = [];

  for (const [kind, count] of Object.entries(configuration.resources) as [
    ResourceKind,
    number,
  ][]) {
    if (count > 0) {
      ledger.push({
        id: `staff:${kind}`,
        category: "staff",
        amount: -(RESOURCE_CATALOG[kind].unitCost * count),
        referenceId: kind,
      });
    }
  }

  if (configuration.systemsEnabled) {
    ledger.push({
      id: "maintenance:systems",
      category: "maintenance",
      amount: -SYSTEMS_MAINTENANCE_COST,
      referenceId: "systems",
    });
  }

  for (const investment of configuration.activeInvestments) {
    ledger.push({
      id: `investment:${investment}`,
      category: "investment",
      amount: -INVESTMENT_CATALOG[investment].cost,
      referenceId: investment,
    });
  }

  for (const patient of patients) {
    if (patient.status === "onTime") {
      ledger.push({
        id: `revenue:${patient.patientId}`,
        category: "revenue",
        amount:
          patient.kind === "vip"
            ? REVENUE_RULES.vipOnTime
            : REVENUE_RULES.standardOnTime,
        referenceId: patient.patientId,
      });
    } else if (patient.status === "late") {
      const penalty = penalties[patient.kind] ?? 0;
      if (penalty > 0) {
        ledger.push({
          id: `penalty:${patient.patientId}`,
          category: "penalty",
          amount: -penalty,
          referenceId: patient.patientId,
        });
      }
    }
  }

  const sumCategory = (category: LedgerCategory) =>
    ledger
      .filter((entry) => entry.category === category)
      .reduce((total, entry) => total + entry.amount, 0);

  const revenue = sumCategory("revenue");
  const asCost = (amount: number) => Math.max(0, -amount);
  const staffCost = asCost(sumCategory("staff"));
  const maintenanceCost = asCost(sumCategory("maintenance"));
  const penaltyCost = asCost(sumCategory("penalty"));
  const investmentCost = asCost(sumCategory("investment"));
  const operatingResult = revenue - staffCost - maintenanceCost - penaltyCost;

  return {
    operations: {
      arrivals: patients.length,
      servedOnTime: patients.filter((patient) => patient.status === "onTime")
        .length,
      vipServedOnTime: patients.filter(
        (patient) => patient.kind === "vip" && patient.status === "onTime",
      ).length,
      late: patients.filter((patient) => patient.status === "late").length,
      workInProgress: patients.filter((patient) => patient.status === "pending")
        .length,
    },
    pnl: {
      revenue,
      staffCost,
      maintenanceCost,
      penalties: penaltyCost,
      investments: investmentCost,
      operatingResult,
      netResult: operatingResult - investmentCost,
    },
    ledger,
  };
}
