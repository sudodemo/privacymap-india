import {
  ASSESSMENT_PACKAGE_FORMAT,
  ASSESSMENT_PACKAGE_VERSION,
  ASSESSMENT_SCHEMA_VERSION,
  type AssessmentPackage,
  type AssessmentContinuityState,
  validateAssessmentContinuityState,
  validateAssessmentPackage,
} from "./assessmentContinuity";
import {
  validateImportedValue,
  validateIdentifier,
  validateIsoTimestamp,
  validateText,
} from "./security";

const MAX_JSON_BYTES = 5_000_000;

export function parseAssessmentJson(raw: string): AssessmentPackage {
  if (raw.length > MAX_JSON_BYTES) {
    throw new Error("The selected JSON file is too large to import safely.");
  }

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error("The selected file is not valid JSON.");
  }

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("The selected JSON file must contain an assessment object.");
  }

  if ("metadata" in value && "assessment" in value) {
    const packageValue = value as Record<string, unknown>;
    const metadata = packageValue.metadata;
    if (!metadata || typeof metadata !== "object" || Array.isArray(metadata)) {
      throw new Error("The JSON assessment package has invalid metadata.");
    }

    const meta = metadata as Record<string, unknown>;
    if (meta.format === ASSESSMENT_PACKAGE_FORMAT) {
      return validateAssessmentPackage(value);
    }
  }

  validateImportedValue(value, "jsonAssessment");
  validateAssessmentContinuityState(value, "jsonAssessment");

  const assessment = value as AssessmentContinuityState;
  const now = new Date().toISOString();
  validateIsoTimestamp(now, "JSON import timestamp");
  validateIdentifier(assessment.assessmentProfile.assessmentId, "JSON assessment ID");

  const metadata = {
    format: ASSESSMENT_PACKAGE_FORMAT,
    packageVersion: ASSESSMENT_PACKAGE_VERSION,
    schemaVersion: ASSESSMENT_SCHEMA_VERSION,
    applicationVersion: "JSON import",
    assessmentId: assessment.assessmentProfile.assessmentId,
    exportedAt: now,
    lastSavedAt: now,
  } as const;

  validateText(metadata.applicationVersion, {
    fieldName: "JSON import application version",
    maxLength: 100,
    rejectMarkup: true,
  });

  return { metadata, assessment };
}
