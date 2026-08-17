import {
  buildAssessmentPackage,
  parseAssessmentPackage,
  serializeAssessmentPackage,
  type AssessmentContinuityState,
  type AssessmentPackage,
} from "./assessmentContinuity";
import {
  SECURITY_LIMITS,
  validateImportedValue,
  validateIdentifier,
  validateText,
} from "./security";

export const ASSESSMENT_PACKAGE_EXTENSION = ".privacymap" as const;
export const ASSESSMENT_PACKAGE_MIME = "application/json;charset=utf-8" as const;
export const MAX_ASSESSMENT_PACKAGE_BYTES = 5_000_000;

function safeFilenamePart(value: string): string {
  return String(value || "Assessment")
    .normalize("NFC")
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80) || "Assessment";
}

export function buildAssessmentPackageFilename(
  state: AssessmentContinuityState
): string {
  return `PrivacyMap-${safeFilenamePart(
    state.assessmentProfile.organisationName
  )}-${safeFilenamePart(
    state.assessmentProfile.assessmentId
  )}-Assessment${ASSESSMENT_PACKAGE_EXTENSION}`;
}

export function createExportPackage(
  state: AssessmentContinuityState,
  exportedAt = new Date().toISOString()
): AssessmentPackage {
  validateIdentifier(
    state.assessmentProfile.assessmentId,
    "Assessment ID"
  );

  validateText(
    state.assessmentProfile.organisationName,
    {
      fieldName: "Organisation / School Name",
      maxLength: SECURITY_LIMITS.organisationName,
      rejectMarkup: true,
    }
  );

  const pkg = buildAssessmentPackage(state, {
    applicationVersion: "Phase-E",
    exportedAt,
    lastSavedAt: exportedAt,
  });

  validateImportedValue(pkg, "package");
  return pkg;
}

export function exportAssessmentPackage(
  state: AssessmentContinuityState
): void {
  if (typeof window === "undefined") return;

  const pkg = createExportPackage(state);
  const content = serializeAssessmentPackage(pkg);

  if (new Blob([content]).size > MAX_ASSESSMENT_PACKAGE_BYTES) {
    throw new Error(
      "The assessment package is too large to export safely. Please remove unnecessary custom text or evidence notes and try again."
    );
  }

  const blob = new Blob([content], { type: ASSESSMENT_PACKAGE_MIME });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = buildAssessmentPackageFilename(state);
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
}

export async function readAssessmentPackageFile(
  file: File
): Promise<AssessmentPackage> {
  if (file.size > MAX_ASSESSMENT_PACKAGE_BYTES) {
    throw new Error(
      "The selected assessment package is too large to import safely."
    );
  }

  if (!file.name.toLowerCase().endsWith(ASSESSMENT_PACKAGE_EXTENSION) &&
      file.type &&
      file.type !== "application/json") {
    throw new Error(
      "Please select a PrivacyMap .privacymap assessment package."
    );
  }

  const raw = await file.text();

  if (new TextEncoder().encode(raw).byteLength > MAX_ASSESSMENT_PACKAGE_BYTES) {
    throw new Error(
      "The selected assessment package is too large to import safely."
    );
  }

  validateText(raw, {
    fieldName: "Assessment package",
    maxLength: MAX_ASSESSMENT_PACKAGE_BYTES,
    allowNewlines: true,
    rejectMarkup: false,
  });

  const pkg = parseAssessmentPackage(raw);
  validateImportedValue(pkg, "package");
  return pkg;
}

export function isAssessmentPackageFilename(filename: string): boolean {
  return filename.toLowerCase().endsWith(ASSESSMENT_PACKAGE_EXTENSION);
}
