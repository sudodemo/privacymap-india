import type { CanonicalFinding } from "./canonicalFindingEngine";
import { getIntelligenceContext } from "./intelligenceFoundation";
import { prioritiseCanonicalFindings } from "./riskPrioritisation";
import { assessDpdpReadiness } from "./dpdpReadinessIntelligence";
import { generateTreatmentIntelligence } from "./treatmentIntelligence";
import { generateEvidenceIntelligence } from "./evidenceIntelligence";
import { generateGovernanceIntelligence } from "./governanceIntelligence";
import { buildIntelligencePresentationModel } from "./intelligenceExplainability";

export interface IntelligenceValidationCheck {
  id: string;
  status: "PASS" | "FAIL";
  message: string;
}

export interface IntelligenceValidationResult {
  status: "PASS" | "FAIL";
  checks: IntelligenceValidationCheck[];
  generatedLocally: true;
  validationVersion: "1.0.0";
}

function unique(values: string[]): boolean {
  return new Set(values).size === values.length;
}

export function validateIntelligencePipeline(findings: CanonicalFinding[]): IntelligenceValidationResult {
  const checks: IntelligenceValidationCheck[] = [];
  const context = getIntelligenceContext();

  checks.push({
    id: "knowledge-base-contract",
    status: context.status === "READY" ? "PASS" : "FAIL",
    message: context.status === "READY" ? "The intelligence knowledge base contract is valid." : "The intelligence knowledge base contract is invalid.",
  });

  const canonicalIds = findings.map((finding) => finding.id);
  const idsAreUnique = unique(canonicalIds);
  checks.push({
    id: "stable-finding-ids",
    status: idsAreUnique ? "PASS" : "FAIL",
    message: idsAreUnique ? "Canonical finding IDs are unique." : "Duplicate canonical finding IDs were detected.",
  });

  const priorities = prioritiseCanonicalFindings(findings);
  const readiness = assessDpdpReadiness(findings);
  const treatments = generateTreatmentIntelligence(findings);
  const evidence = generateEvidenceIntelligence(findings);
  const governance = generateGovernanceIntelligence(findings);
  const presentation = buildIntelligencePresentationModel(
    findings,
    treatments,
    evidence,
    governance,
    readiness.controls,
  );

  const lengthsMatch = [
    priorities.findings.length,
    treatments.length,
    evidence.length,
    governance.length,
    presentation.findings.length,
  ].every((length) => length === findings.length);
  checks.push({
    id: "finding-coverage",
    status: lengthsMatch ? "PASS" : "FAIL",
    message: lengthsMatch ? "All intelligence layers cover the canonical finding set." : "One or more intelligence layers do not cover the canonical finding set.",
  });

  const metadataMatch = [
    priorities.findings.every((item) => item.knowledgeBaseVersion === context.knowledgeBaseVersion),
    treatments.every((item) => item.knowledgeBaseVersion === context.knowledgeBaseVersion),
    evidence.every((item) => item.knowledgeBaseVersion === context.knowledgeBaseVersion),
    governance.every((item) => item.knowledgeBaseVersion === context.knowledgeBaseVersion),
    presentation.knowledgeBaseVersion === context.knowledgeBaseVersion,
  ].every(Boolean);
  checks.push({
    id: "version-consistency",
    status: metadataMatch ? "PASS" : "FAIL",
    message: metadataMatch ? "Intelligence outputs reference the same knowledge-base version." : "Intelligence outputs contain inconsistent knowledge-base versions.",
  });

  checks.push({
    id: "local-generation",
    status: priorities.generatedLocally && readiness.generatedLocally && presentation.generatedLocally ? "PASS" : "FAIL",
    message: priorities.generatedLocally && readiness.generatedLocally && presentation.generatedLocally ? "Intelligence processing is local." : "A non-local intelligence result was detected.",
  });

  return {
    status: checks.every((check) => check.status === "PASS") ? "PASS" : "FAIL",
    checks,
    generatedLocally: true,
    validationVersion: "1.0.0",
  };
}
