import type { RiskLevel } from "../../../lib/privacyRisk";
import type { CanonicalFinding } from "./canonicalFindingEngine";

export type RiskPriority = "Critical" | "High" | "Medium" | "Low";

export interface RiskPriorityFactors {
  baseSeverity: number;
  categoryExposure: number;
  sensitivity: number;
  evidenceGap: number;
}

export interface PrioritisedFinding extends CanonicalFinding {
  priority: RiskPriority;
  priorityScore: number;
  priorityFactors: RiskPriorityFactors;
  priorityExplanation: string;
}

export interface RiskPrioritisationResult {
  findings: PrioritisedFinding[];
  generatedLocally: true;
  prioritisationVersion: "1.0.0";
}

function severityScore(level: RiskLevel): number {
  switch (level) {
    case "Critical": return 80;
    case "High": return 60;
    case "Medium": return 40;
    default: return 20;
  }
}

function categoryExposure(category: string): number {
  const value = category.toLowerCase();
  if (value.includes("security") || value.includes("third")) return 10;
  if (value.includes("children") || value.includes("biometric")) return 12;
  if (value.includes("data")) return 5;
  return 0;
}

function sensitivityScore(title: string, explanation: string): number {
  const value = `${title} ${explanation}`.toLowerCase();
  if (/(child|student|biometric|sensitive)/.test(value)) return 8;
  return 0;
}

function evidenceGapScore(finding: CanonicalFinding): number {
  const value = `${finding.explanation} ${finding.recommendation}`.toLowerCase();
  if (/(missing|lack|without|no |not )/.test(value)) return 5;
  return 0;
}

function priorityFromScore(score: number): RiskPriority {
  if (score >= 85) return "Critical";
  if (score >= 65) return "High";
  if (score >= 40) return "Medium";
  return "Low";
}

export function prioritiseCanonicalFindings(
  findings: CanonicalFinding[],
): RiskPrioritisationResult {
  const prioritised = findings.map((finding) => {
    const factors: RiskPriorityFactors = {
      baseSeverity: severityScore(finding.level),
      categoryExposure: categoryExposure(finding.category),
      sensitivity: sensitivityScore(finding.title, finding.explanation),
      evidenceGap: evidenceGapScore(finding),
    };
    const priorityScore = Math.min(
      100,
      factors.baseSeverity + factors.categoryExposure + factors.sensitivity + factors.evidenceGap,
    );
    const priority = priorityFromScore(priorityScore);

    return {
      ...finding,
      priority,
      priorityScore,
      priorityFactors: factors,
      priorityExplanation: `Priority ${priority} is based on the finding severity (${factors.baseSeverity}), contextual exposure (${factors.categoryExposure}), data sensitivity (${factors.sensitivity}), and indicated evidence/control gaps (${factors.evidenceGap}).`,
    };
  });

  prioritised.sort((a, b) => b.priorityScore - a.priorityScore || a.title.localeCompare(b.title));

  return {
    findings: prioritised,
    generatedLocally: true,
    prioritisationVersion: "1.0.0",
  };
}
