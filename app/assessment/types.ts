export type { RiskLevel, RiskResult } from "../../lib/privacyRisk";
export type { RiskTreatmentAction, TreatmentStatus } from "../../lib/riskTreatment";
export type { ResidualRiskAssessment, ResidualRiskSummary } from "../../lib/residualRisk";
export type { ResidualRiskDecision, ResidualRiskDecisionRecord, DecisionApprovalStatus, ReviewFrequency } from "../../lib/residualDecision";

export type CustomEntryPoint = { id: string; name: string; collection_method: string; custom: boolean };
export type CustomField = { id: string; name: string; custom: boolean };
export interface AssessmentProfile {
  organisationName: string;
  assessmentName: string;
  assessmentOwner: string;
  assessmentId: string;
  assessmentDate: string;
  assessmentVersion: string;
}
