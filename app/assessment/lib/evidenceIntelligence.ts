import type { CanonicalFinding } from "./canonicalFindingEngine";
import { getIntelligenceKnowledgeBase } from "./intelligenceFoundation";

export type EvidenceStatus = "NOT_RECORDED" | "RECORDED";

export interface IntelligentEvidenceGuidance {
  findingId: string;
  title: string;
  evidenceExpectation: string;
  evidenceStatus: EvidenceStatus;
  verificationGuidance: string;
  closureGuidance: string;
  reason: string;
  knowledgeBaseVersion: string;
  evidenceMethodologyVersion: "1.0.0";
}

function findControl(finding: CanonicalFinding) {
  const kb = getIntelligenceKnowledgeBase();
  return kb.legal.controls.find((control) =>
    finding.ruleId && (control.id === finding.ruleId || control.rule_reference === finding.ruleId),
  );
}

function defaultEvidence(finding: CanonicalFinding): string {
  return `Record evidence that supports completion of the recommended treatment for “${finding.title}”.`;
}

export function generateEvidenceIntelligence(
  findings: CanonicalFinding[],
): IntelligentEvidenceGuidance[] {
  return findings.map((finding) => {
    const control = findControl(finding);
    const evidenceExpectation = control?.evidence_expectation?.trim() || defaultEvidence(finding);

    return {
      findingId: finding.id,
      title: finding.title,
      evidenceExpectation,
      evidenceStatus: "NOT_RECORDED",
      verificationGuidance: "Verify that the recorded evidence is current, relevant to this finding, and linked to the treatment being closed.",
      closureGuidance: "Close the treatment only after the organisation has reviewed the evidence and recorded an appropriate verification decision.",
      reason: control
        ? "This evidence guidance comes from the applicable PrivacyMap knowledge-base control."
        : "The knowledge base has no finding-specific evidence requirement, so relevant treatment evidence should be recorded and reviewed.",
      knowledgeBaseVersion: finding.knowledgeBaseVersion,
      evidenceMethodologyVersion: "1.0.0",
    };
  });
}
