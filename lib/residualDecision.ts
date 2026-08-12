import type { RiskLevel } from "./privacyRisk";

export type ResidualRiskDecision =
  | "Accept"
  | "Treat Further"
  | "Avoid"
  | "Transfer"
  | "Monitor";

export type DecisionApprovalStatus =
  | "Pending"
  | "Approved"
  | "Rejected";

export type ResidualRiskDecisionRecord = {
  id: string;
  findingId: string;
  riskTitle: string;
  category: string;

  inherentRisk: RiskLevel;
  residualRisk: RiskLevel;

  decision: ResidualRiskDecision;

  rationale: string;

  accountableOwner: string;

  reviewDate: string;

  approvalStatus: DecisionApprovalStatus;

  treatmentStatus:
    | "Open"
    | "In Progress"
    | "Completed"
    | "Accepted";
};

export function defaultResidualRiskDecision(
  riskLevel: RiskLevel
): ResidualRiskDecision {
  switch (riskLevel) {
    case "Critical":
      return "Treat Further";

    case "High":
      return "Treat Further";

    case "Medium":
      return "Monitor";

    case "Low":
      return "Accept";
  }
}

export function defaultDecisionRationale(
  decision: ResidualRiskDecision,
  residualRisk: RiskLevel
): string {
  switch (decision) {
    case "Accept":
      return `Residual risk is currently assessed as ${residualRisk}. The organisation considers this risk within its defined risk tolerance.`;

    case "Treat Further":
      return "Additional controls or remediation actions are required to reduce the residual risk further.";

    case "Avoid":
      return "The organisation intends to stop, remove or redesign the processing activity creating the residual risk.";

    case "Transfer":
      return "The organisation intends to manage part of the residual exposure through contractual, insurance, vendor or other risk-transfer mechanisms.";

    case "Monitor":
      return "The residual risk is currently considered manageable but should be periodically reviewed for changes in likelihood, impact, processing or control effectiveness.";
  }
}

export function decisionRequiresApproval(
  decision: ResidualRiskDecision,
  riskLevel: RiskLevel
): boolean {
  if (
    riskLevel === "Critical" ||
    riskLevel === "High"
  ) {
    return true;
  }

  if (
    decision === "Accept" ||
    decision === "Avoid"
  ) {
    return true;
  }

  return false;
}
