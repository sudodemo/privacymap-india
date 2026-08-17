import {
  buildAssessmentPackage,
  parseAssessmentPackage,
  serializeAssessmentPackage,
  type AssessmentContinuityState,
  type AssessmentPackage,
} from "./assessmentContinuity";

export const ASSESSMENT_PACKAGE_EXTENSION = ".privacymap" as const;
export const ASSESSMENT_PACKAGE_MIME = "application/json;charset=utf-8" as const;

function safeFilenamePart(value: string): string {
  return String(value || "Assessment")
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
  return buildAssessmentPackage(state, {
    applicationVersion: "Phase-D",
    exportedAt,
    lastSavedAt: exportedAt,
  });
}

export function exportAssessmentPackage(
  state: AssessmentContinuityState
): void {
  if (typeof window === "undefined") return;

  const pkg = createExportPackage(state);
  const content = serializeAssessmentPackage(pkg);
  const blob = new Blob([content], { type: ASSESSMENT_PACKAGE_MIME });
  const url = window.URL.createObjectURL(blob);
  const anchor = document.createElement("a");

  anchor.href = url;
  anchor.download = buildAssessmentPackageFilename(state);
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => window.URL.revokeObjectURL(url), 1000);
}

export async function readAssessmentPackageFile(
  file: File
): Promise<AssessmentPackage> {
  const raw = await file.text();
  return parseAssessmentPackage(raw);
}

export function isAssessmentPackageFilename(filename: string): boolean {
  return filename.toLowerCase().endsWith(ASSESSMENT_PACKAGE_EXTENSION);
}
