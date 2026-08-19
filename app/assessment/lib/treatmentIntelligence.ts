import type { CanonicalFinding } from "./canonicalFindingEngine";
import { getIntelligenceKnowledgeBase } from "./intelligenceFoundation";

export type TreatmentPriority = "Critical" | "High" | "Medium" | "Low";

export interface IntelligentTreatment {
  findingId: string;
  title: string;
  recommendedAction: string;
  priority: TreatmentPriority;
  treatmentStatus: "RECOMMENDED" | "REVIEW_REQUIRED";
  evidenceExpectation: string;
  reason: string;
  knowledgeBaseVersion: string;
  treatmentMethodologyVersion: "1.0.0";
}

function findTemplate(finding: CanonicalFinding) {
  const kb = getIntelligenceKnowledgeBase();
  return finding.templateId
    ? kb.findingTemplates.find((item) => item.id === finding.templateId)
    : undefined;
}

function findControl(finding: CanonicalFinding) {
  const kb = getIntelligenceKnowledgeBase();
  return kb.legal.controls.find((control) =>
    finding.ruleId && (control.id === finding.ruleId || control.rule_reference === finding.ruleId),
  );
}

export function generateTreatmentIntelligence(
  findings: CanonicalFinding[],
): IntelligentTreatment[] {
  return findings.map((finding) => {
    const template = findTemplate(finding);
    const control = findControl(finding);
    const action = template?.default_action || finding.recommendation?.trim();
    const evidence = control?.evidence_expectation?.trim() || "Record the evidence that supports completion of the recommended action.";

    return {
      findingId: finding.id,
      title: finding.title,
      recommendedAction: action || "Review the finding, identify an appropriate treatment, and record the decision.",
      priority: finding.level,
      treatmentStatus: action ? "RECOMMENDED" : "REVIEW_REQUIRED",
      evidenceExpectation: evidence,
      reason: action
        ? "This recommendation is based on the assessment finding and the applicable PrivacyMap knowledge-base treatment guidance."
        : "The current knowledge base does not contain a specific treatment for this finding, so an appropriate action should be reviewed and recorded.",
      knowledgeBaseVersion: finding.knowledgeBaseVersion,
      treatmentMethodologyVersion: "1.0.0",
    };
  });
}
