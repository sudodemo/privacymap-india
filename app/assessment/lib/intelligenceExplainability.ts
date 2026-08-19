import type { CanonicalFinding } from "./canonicalFindingEngine";
import type { IntelligentTreatment } from "./treatmentIntelligence";
import type { IntelligentEvidenceGuidance } from "./evidenceIntelligence";
import type { IntelligentGovernanceRecord } from "./governanceIntelligence";
import type { DpdpControlReadiness } from "./dpdpReadinessIntelligence";
import { getIntelligenceContext } from "./intelligenceFoundation";

export interface IntelligenceExplanation {
  findingId: string;
  title: string;
  summary: string;
  whyItMatters: string;
  whatToDoNext: string;
  evidenceNextStep: string;
  governanceNextStep: string;
  source: string;
  knowledgeBaseVersion: string;
  explainabilityVersion: "1.0.0";
}

export interface IntelligencePresentationModel {
  generatedLocally: true;
  knowledgeBaseVersion: string;
  release: string;
  findings: IntelligenceExplanation[];
  presentationGuidance: string;
}

export function buildIntelligenceExplanation(
  finding: CanonicalFinding,
  treatment?: IntelligentTreatment,
  evidence?: IntelligentEvidenceGuidance,
  governance?: IntelligentGovernanceRecord,
  readiness?: DpdpControlReadiness,
): IntelligenceExplanation {
  const context = getIntelligenceContext();
  const nextAction = treatment?.recommendedAction || finding.recommendation || "Review the finding and record an appropriate treatment.";
  const evidenceNextStep = evidence?.evidenceExpectation || "Record evidence supporting the treatment and its verification.";
  const governanceNextStep = governance?.reason || "Review ownership, approval and follow-up requirements for this finding.";
  const readinessText = readiness
    ? ` The related DPDP control is currently marked ${readiness.status.replace(/_/g, " ").toLowerCase()}.`
    : "";

  return {
    findingId: finding.id,
    title: finding.title,
    summary: finding.explanation || "This finding indicates an area that should be reviewed.",
    whyItMatters: `${finding.explanation || "The assessment identified an area requiring attention."}${readinessText}`,
    whatToDoNext: nextAction,
    evidenceNextStep,
    governanceNextStep,
    source: `PrivacyMap India knowledge base ${context.knowledgeBaseVersion}, release ${context.release}`,
    knowledgeBaseVersion: context.knowledgeBaseVersion,
    explainabilityVersion: "1.0.0",
  };
}

export function buildIntelligencePresentationModel(
  findings: CanonicalFinding[],
  treatments: IntelligentTreatment[] = [],
  evidence: IntelligentEvidenceGuidance[] = [],
  governance: IntelligentGovernanceRecord[] = [],
  readiness: DpdpControlReadiness[] = [],
): IntelligencePresentationModel {
  const context = getIntelligenceContext();
  const models = findings.map((finding) => buildIntelligenceExplanation(
    finding,
    treatments.find((item) => item.findingId === finding.id),
    evidence.find((item) => item.findingId === finding.id),
    governance.find((item) => item.findingId === finding.id),
    readiness.find((item) => finding.ruleId && (item.controlId === finding.ruleId || item.ruleReference === finding.ruleId)),
  ));

  return {
    generatedLocally: true,
    knowledgeBaseVersion: context.knowledgeBaseVersion,
    release: context.release,
    findings: models,
    presentationGuidance: "Explain intelligence as assessment guidance: show why a finding matters, what to do next, what evidence to record, and what governance follow-up may be needed. Do not present it as legal advice or a compliance certification.",
  };
}
