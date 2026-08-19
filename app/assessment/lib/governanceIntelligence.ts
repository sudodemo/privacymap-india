import type { CanonicalFinding } from "./canonicalFindingEngine";
import type { ResidualRiskDecisionRecord } from "./governanceEngine";
import { getKnowledgeBaseVersion } from "./intelligenceFoundation";

export type GovernanceAttention = "APPROVAL_REQUIRED" | "ESCALATION_REQUIRED" | "REVIEW_REQUIRED" | "NO_ADDITIONAL_ATTENTION";

export interface IntelligentGovernanceRecord {
  findingId: string;
  title: string;
  residualRisk: CanonicalFinding["level"];
  attention: GovernanceAttention;
  decisionAuthority: string;
  accountableOwnerRequired: boolean;
  approvalStatus: ResidualRiskDecisionRecord["approvalStatus"] | "NOT_RECORDED";
  reviewRequired: boolean;
  escalationRequired: boolean;
  reason: string;
  knowledgeBaseVersion: string;
  governanceMethodologyVersion: "1.0.0";
}

function decisionForFinding(
  findingId: string,
  decisions: ResidualRiskDecisionRecord[],
): ResidualRiskDecisionRecord | undefined {
  return decisions.find((decision) => decision.findingId === findingId);
}

function authorityForRisk(level: CanonicalFinding["level"]): string {
  switch (level) {
    case "Critical": return "Executive / Risk Committee";
    case "High": return "Senior Management / Risk Owner";
    case "Medium": return "Business / Privacy Owner";
    default: return "Process Owner";
  }
}

export function generateGovernanceIntelligence(
  findings: CanonicalFinding[],
  decisions: ResidualRiskDecisionRecord[] = [],
): IntelligentGovernanceRecord[] {
  return findings.map((finding) => {
    const decision = decisionForFinding(finding.id, decisions);
    const escalationRequired = decision?.escalationRequired ?? (finding.level === "Critical" || finding.level === "High");
    const approvalRequired = decision
      ? decision.approvalStatus === "Pending"
      : finding.level === "Critical" || finding.level === "High";
    const reviewRequired = decision
      ? Boolean(decision.nextReviewDate || decision.reviewDate)
      : true;

    let attention: GovernanceAttention = "NO_ADDITIONAL_ATTENTION";
    if (escalationRequired) attention = "ESCALATION_REQUIRED";
    else if (approvalRequired) attention = "APPROVAL_REQUIRED";
    else if (reviewRequired) attention = "REVIEW_REQUIRED";

    return {
      findingId: finding.id,
      title: finding.title,
      residualRisk: decision?.residualRisk ?? finding.level,
      attention,
      decisionAuthority: decision?.decisionAuthority?.trim() || authorityForRisk(decision?.residualRisk ?? finding.level),
      accountableOwnerRequired: true,
      approvalStatus: decision?.approvalStatus ?? "NOT_RECORDED",
      reviewRequired,
      escalationRequired,
      reason: escalationRequired
        ? "This finding requires heightened governance attention because the applicable risk level is high or critical, or the recorded decision requires escalation."
        : approvalRequired
          ? "This finding requires a documented governance approval before the recorded risk decision can be treated as final."
          : reviewRequired
            ? "This finding should remain under periodic governance review until its treatment and residual risk are appropriately managed."
            : "No additional governance action is indicated by the current recorded decision.",
      knowledgeBaseVersion: getKnowledgeBaseVersion(),
      governanceMethodologyVersion: "1.0.0",
    };
  });
}
