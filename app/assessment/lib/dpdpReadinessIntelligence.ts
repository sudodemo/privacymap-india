import { kb } from "../../../lib/kb";
import type { CanonicalFinding } from "./canonicalFindingEngine";
import { getKnowledgeBaseVersion } from "./intelligenceFoundation";

export type DpdpReadinessStatus =
  | "NOT_ASSESSED"
  | "REVIEW_REQUIRED"
  | "EVIDENCE_RECORDED"
  | "TREATMENT_REQUIRED";

export interface DpdpControlReadiness {
  controlId: string;
  title: string;
  actReference: string;
  ruleReference: string;
  effectiveDate: string;
  effectiveDateStatus: "CURRENT" | "FUTURE" | "UNKNOWN";
  status: DpdpReadinessStatus;
  requirement: string;
  assessmentQuestion: string;
  evidenceExpectation: string;
  remediation: string;
  sourceUrl: string;
  reason: string;
  knowledgeBaseVersion: string;
}

export interface DpdpReadinessResult {
  controls: DpdpControlReadiness[];
  knowledgeBaseVersion: string;
  generatedLocally: true;
  methodologyVersion: "1.0.0";
}

function normalise(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, "_");
}

function effectiveDateStatus(date: string): DpdpControlReadiness["effectiveDateStatus"] {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) return "UNKNOWN";
  const today = new Date().toISOString().slice(0, 10);
  return date <= today ? "CURRENT" : "FUTURE";
}

function statusForControl(
  control: (typeof kb.legal.controls)[number],
  findings: CanonicalFinding[],
): { status: DpdpReadinessStatus; reason: string } {
  const assessmentKey = normalise(control.assessment_keys[0] ?? "");
  const related = findings.filter((finding) => {
    const text = `${finding.title} ${finding.category} ${finding.explanation}`.toLowerCase();
    return assessmentKey && text.includes(assessmentKey.replace(/_/g, " "));
  });

  if (related.length > 0) {
    return {
      status: "TREATMENT_REQUIRED",
      reason: "The assessment contains a related privacy finding, so this control should be reviewed and treated where applicable.",
    };
  }

  return {
    status: "NOT_ASSESSED",
    reason: "The current assessment does not provide enough evidence to conclude that this control is satisfied.",
  };
}

export function assessDpdpReadiness(
  findings: CanonicalFinding[] = [],
): DpdpReadinessResult {
  const controls = kb.legal.controls.map((control) => {
    const result = statusForControl(control, findings);
    return {
      controlId: control.id,
      title: control.title,
      actReference: control.act_reference,
      ruleReference: control.rule_reference,
      effectiveDate: control.effective_date,
      effectiveDateStatus: effectiveDateStatus(control.effective_date),
      status: result.status,
      requirement: control.requirement,
      assessmentQuestion: control.assessment_question,
      evidenceExpectation: control.evidence_expectation,
      remediation: control.remediation,
      sourceUrl: control.source_url,
      reason: result.reason,
      knowledgeBaseVersion: getKnowledgeBaseVersion(),
    };
  });

  return {
    controls,
    knowledgeBaseVersion: getKnowledgeBaseVersion(),
    generatedLocally: true,
    methodologyVersion: "1.0.0",
  };
}
