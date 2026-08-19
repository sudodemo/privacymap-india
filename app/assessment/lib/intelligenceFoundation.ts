import {
  getKnowledgeBaseMeta,
  getKnowledgeBaseRelease,
  getKnowledgeBaseVersion,
  kb,
  type KnowledgeBaseMeta,
  type KnowledgeBaseRelease,
} from "../../../lib/kb";

export type IntelligenceStatus = "READY" | "INVALID_KNOWLEDGE_BASE";

export interface IntelligenceContext {
  knowledgeBaseVersion: string;
  release: string;
  legalSourcesVerified: string;
  status: IntelligenceStatus;
}

export interface IntelligenceSourceRef {
  sourceType: "knowledge-base";
  knowledgeBaseVersion: string;
  release: string;
}

export interface IntelligenceResultMetadata {
  intelligenceVersion: "1.0.0";
  knowledgeBaseVersion: string;
  release: string;
  generatedLocally: true;
}

const VERSION_PATTERN = /^\d+\.\d+\.\d+$/;
const ISO_DATE_PATTERN = /^\d{4}-\d{2}-\d{2}$/;

function isNonEmptyString(value: unknown): value is string {
  return typeof value === "string" && value.trim().length > 0;
}

function isVersion(value: unknown): value is string {
  return isNonEmptyString(value) && VERSION_PATTERN.test(value);
}

function isIsoDate(value: unknown): value is string {
  return isNonEmptyString(value) && ISO_DATE_PATTERN.test(value);
}

/**
 * Validates the static KB contract before intelligence processing consumes it.
 * Assessment responses are not passed to this validation layer.
 */
export function validateKnowledgeBaseContract(
  meta: KnowledgeBaseMeta = getKnowledgeBaseMeta(),
  release: KnowledgeBaseRelease = getKnowledgeBaseRelease(),
): boolean {
  if (!isVersion(meta.schema_version)) return false;
  if (!isVersion(meta.knowledge_base_version)) return false;
  if (!isNonEmptyString(meta.product)) return false;
  if (!isNonEmptyString(meta.purpose)) return false;
  if (!isIsoDate(meta.created)) return false;
  if (!Array.isArray(meta.source_priority) || meta.source_priority.length === 0) return false;
  if (!isNonEmptyString(meta.legal_status_note)) return false;

  if (!isNonEmptyString(release.product)) return false;
  if (!isNonEmptyString(release.release)) return false;
  if (!isVersion(release.kb_version)) return false;
  if (!isIsoDate(release.release_date)) return false;
  if (!isIsoDate(release.legal_sources_verified)) return false;
  if (release.status !== "REFERENCE_MAPPING_NOT_LEGAL_CERTIFICATION") return false;
  if (!Array.isArray(release.artifacts) || release.artifacts.length === 0) return false;

  return true;
}

export function getIntelligenceContext(): IntelligenceContext {
  const valid = validateKnowledgeBaseContract();
  const release = getKnowledgeBaseRelease();
  return {
    knowledgeBaseVersion: getKnowledgeBaseVersion(),
    release: release.release,
    legalSourcesVerified: release.legal_sources_verified,
    status: valid ? "READY" : "INVALID_KNOWLEDGE_BASE",
  };
}

export function getIntelligenceSourceRef(): IntelligenceSourceRef {
  const release = getKnowledgeBaseRelease();
  return {
    sourceType: "knowledge-base",
    knowledgeBaseVersion: release.kb_version,
    release: release.release,
  };
}

export function getIntelligenceResultMetadata(): IntelligenceResultMetadata {
  const context = getIntelligenceContext();
  if (context.status !== "READY") {
    throw new Error("PrivacyMap knowledge base failed its static contract validation.");
  }

  return {
    intelligenceVersion: "1.0.0",
    knowledgeBaseVersion: context.knowledgeBaseVersion,
    release: context.release,
    generatedLocally: true,
  };
}

/** Read-only access for future G workstreams; callers must not mutate the KB. */
export function getIntelligenceKnowledgeBase() {
  return kb;
}
