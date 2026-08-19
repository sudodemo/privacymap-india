import { getIntelligenceResultMetadata, getIntelligenceKnowledgeBase } from "./intelligenceFoundation";
import type { RiskFinding, RiskLevel, RiskResult } from "../../../lib/privacyRisk";

/**
 * Phase G2 — canonical finding contract.
 *
 * This adapter deliberately sits on top of the existing risk engine so G2 can
 * establish stable finding identity without changing the A–F risk behaviour.
 * Assessment responses remain local and the knowledge base is read-only.
 */
export interface CanonicalFinding extends RiskFinding {
  /** Stable rule identifier when the finding can be mapped to the KB. */
  ruleId: string | null;
  /** Stable KB template identifier when one exists. */
  templateId: string | null;
  /** Version of the KB used to resolve the finding metadata. */
  knowledgeBaseVersion: string;
  /** The rule/template match is explanatory metadata, not a legal determination. */
  intelligenceStatus: "KB_MAPPED" | "LEGACY_UNMAPPED";
}

export interface CanonicalFindingResult {
  findings: CanonicalFinding[];
  knowledgeBaseVersion: string;
  intelligenceVersion: "1.0.0";
  generatedLocally: true;
}

function normalise(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9]+/g, " ").replace(/\s+/g, " ");
}

function stableLegacyId(finding: RiskFinding): string {
  const existing = finding.id.trim();
  if (existing) return existing;
  return `legacy-${normalise(finding.title).replace(/ /g, "-")}`;
}

function severity(value: string): RiskLevel {
  if (value === "Critical" || value === "High" || value === "Medium" || value === "Low") {
    return value;
  }
  return "Low";
}

function findTemplateForFinding(finding: RiskFinding) {
  const kb = getIntelligenceKnowledgeBase();
  const title = normalise(finding.title);

  return kb.findingTemplates.find((template) => {
    const templateTitle = normalise(template.title);
    return templateTitle === title || templateTitle.includes(title) || title.includes(templateTitle);
  });
}

function findRuleForTemplate(template: { rule_id: string }) {
  const kb = getIntelligenceKnowledgeBase();
  return kb.riskRules.find((rule) => rule.id === template.rule_id);
}

function findRuleByTitle(finding: RiskFinding) {
  const kb = getIntelligenceKnowledgeBase();
  const title = normalise(finding.title);
  return kb.riskRules.find((rule) => {
    const ruleTitle = normalise(rule.title);
    return ruleTitle === title || ruleTitle.includes(title) || title.includes(ruleTitle);
  });
}

/**
 * Converts the current deterministic RiskResult into the Phase G canonical
 * finding contract. Existing IDs are preserved so report/navigation continuity
 * from Phases A–F is not broken.
 */
export function canonicalizeRiskFindings(riskResult: RiskResult): CanonicalFindingResult {
  const metadata = getIntelligenceResultMetadata();
  const seen = new Set<string>();
  const findings: CanonicalFinding[] = [];

  for (const source of riskResult.findings) {
    const template = findTemplateForFinding(source);
    const rule = template ? findRuleForTemplate(template) : findRuleByTitle(source);
    const id = stableLegacyId(source);

    if (seen.has(id)) continue;
    seen.add(id);

    findings.push({
      ...source,
      id,
      level: severity(source.level),
      ruleId: rule?.id ?? template?.rule_id ?? null,
      templateId: template?.id ?? null,
      knowledgeBaseVersion: metadata.knowledgeBaseVersion,
      intelligenceStatus: rule || template ? "KB_MAPPED" : "LEGACY_UNMAPPED",
    });
  }

  return {
    findings,
    knowledgeBaseVersion: metadata.knowledgeBaseVersion,
    intelligenceVersion: metadata.intelligenceVersion,
    generatedLocally: true,
  };
}

/**
 * Returns the canonical finding for a stable finding ID.
 */
export function findCanonicalFinding(
  result: CanonicalFindingResult,
  findingId: string,
): CanonicalFinding | undefined {
  return result.findings.find((finding) => finding.id === findingId);
}
