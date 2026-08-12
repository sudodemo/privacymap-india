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
  | "Rejected"
  | "Not Required";

export type ReviewFrequency =
  | "Monthly"
  | "Quarterly"
  | "Half-yearly"
  | "Annual"
  | "Event-driven";

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
  decisionAuthority: string;

  reviewDate: string;
  approvalDate: string;

  reviewFrequency: ReviewFrequency;
  nextReviewDate: string;

  targetResolutionDate: string;

  approvalStatus: DecisionApprovalStatus;

  escalationRequired: boolean;
  escalationReason: string;

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
  /*
   * Critical and High residual risks always require approval.
   *
   * Accept and Avoid decisions also require explicit approval,
   * regardless of the residual risk rating.
   */
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

export function defaultDecisionAuthority(
  riskLevel: RiskLevel
): string {
  switch (riskLevel) {
    case "Critical":
      return "Executive / Risk Committee";

    case "High":
      return "Senior Management / Risk Owner";

    case "Medium":
      return "Business / Privacy Owner";

    case "Low":
      return "Process Owner";
  }
}

export function defaultEscalation(
  riskLevel: RiskLevel
): boolean {
  return (
    riskLevel === "Critical" ||
    riskLevel === "High"
  );
}

export function defaultEscalationReason(
  riskLevel: RiskLevel
): string {
  switch (riskLevel) {
    case "Critical":
      return "Critical residual risk requires senior governance review.";

    case "High":
      return "High residual risk requires management review and documented ownership.";

    default:
      return "";
  }
}

/**
 * Determines the default approval status for a residual risk decision.
 *
 * Pending       = explicit approval is required
 * Not Required  = approval is not required
 */
export function defaultApprovalStatus(
  decision: ResidualRiskDecision,
  riskLevel: RiskLevel
): DecisionApprovalStatus {
  return decisionRequiresApproval(
    decision,
    riskLevel
  )
    ? "Pending"
    : "Not Required";
}
