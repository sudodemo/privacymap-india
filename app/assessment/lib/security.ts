/*
 * PrivacyMap Application Security Layer
 *
 * Browser-first security controls for untrusted assessment input,
 * imported assessment packages, and report/export output.
 *
 * This layer deliberately does NOT attempt to "sanitize everything".
 * Validation is field/context aware; React remains responsible for
 * safe HTML rendering through normal text interpolation.
 */

export const SECURITY_LIMITS = {
  organisationName: 150,
  assessmentName: 150,
  assessmentOwner: 150,
  assessmentId: 80,
  assessmentVersion: 40,
  genericText: 5000,
  notes: 5000,
  evidenceReference: 1000,
  arrayItem: 300,
  customName: 300,
} as const;

export type TextValidationOptions = {
  maxLength?: number;
  allowNewlines?: boolean;
  fieldName?: string;
  rejectMarkup?: boolean;
};

const CONTROL_CHARACTERS = /[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g;
const HTML_TAG_PATTERN = /<\s*\/?\s*[a-z][^>]*>/i;
const JAVASCRIPT_SCHEME = /^\s*(?:javascript|vbscript|data):/i;

export function normalizePlainText(value: unknown): string {
  return String(value ?? "")
    .normalize("NFC")
    .replace(CONTROL_CHARACTERS, "")
    .replace(/\r\n?/g, "\n");
}

export function sanitizeText(value: unknown, options: TextValidationOptions = {}): string {
  const normalized = normalizePlainText(value);
  const withoutNewlines = options.allowNewlines
    ? normalized
    : normalized.replace(/[\n\t]+/g, " ");
  const collapsed = options.allowNewlines
    ? withoutNewlines
    : withoutNewlines.replace(/\s+/g, " ");
  return collapsed.trim().slice(0, options.maxLength ?? SECURITY_LIMITS.genericText);
}

export function validateText(value: unknown, options: TextValidationOptions = {}): string {
  if (typeof value !== "string") {
    throw new Error(`${options.fieldName ?? "Input"} must be text.`);
  }

  const normalized = normalizePlainText(value);
  const maxLength = options.maxLength ?? SECURITY_LIMITS.genericText;

  if (normalized.length > maxLength) {
    throw new Error(`${options.fieldName ?? "Input"} exceeds the maximum allowed length of ${maxLength} characters.`);
  }
  if (!options.allowNewlines && /[\n\r\t]/.test(normalized)) {
    throw new Error(`${options.fieldName ?? "Input"} contains unsupported whitespace.`);
  }
  if (options.rejectMarkup !== false && HTML_TAG_PATTERN.test(normalized)) {
    throw new Error(`${options.fieldName ?? "Input"} contains HTML-like markup, which is not permitted.`);
  }

  return normalized;
}

export function validateIdentifier(value: unknown, fieldName = "Identifier"): string {
  const text = validateText(value, {
    fieldName,
    maxLength: SECURITY_LIMITS.assessmentId,
    rejectMarkup: true,
  }).trim();

  if (!/^[A-Za-z0-9._:-]+$/.test(text)) {
    throw new Error(`${fieldName} contains unsupported characters.`);
  }
  return text;
}

export function validateDateString(value: unknown, fieldName = "Date"): string {
  const text = validateText(value, { fieldName, maxLength: 30, rejectMarkup: true }).trim();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(text)) {
    throw new Error(`${fieldName} must use YYYY-MM-DD format.`);
  }
  return text;
}

export function isSafeHttpUrl(value: unknown): value is string {
  if (typeof value !== "string" || !value.trim() || JAVASCRIPT_SCHEME.test(value)) return false;
  try {
    const url = new URL(value);
    return url.protocol === "https:" || url.protocol === "http:";
  } catch {
    return false;
  }
}

export function safeCsvCell(value: unknown): string {
  const text = normalizePlainText(value).replace(/\r\n?/g, " ");
  const protectedText = /^[=+\-@]/.test(text) ? `'${text}` : text;
  return `"${protectedText.replace(/"/g, '""')}"`;
}

export function safeCsvRow(values: unknown[]): string {
  return values.map(safeCsvCell).join(",");
}

export function validateImportedValue(value: unknown, path = "package", depth = 0): void {
  if (depth > 20) throw new Error("Imported assessment package is too deeply nested.");

  if (typeof value === "string") {
    validateText(value, {
      fieldName: path,
      maxLength: SECURITY_LIMITS.genericText,
      allowNewlines: true,
      rejectMarkup: true,
    });
    return;
  }

  if (Array.isArray(value)) {
    if (value.length > 1000) throw new Error(`${path} contains too many items.`);
    value.forEach((item, index) => validateImportedValue(item, `${path}[${index}]`, depth + 1));
    return;
  }

  if (value && typeof value === "object") {
    const record = value as Record<string, unknown>;
    const keys = Object.keys(record);
    if (keys.length > 200) throw new Error(`${path} contains too many properties.`);
    for (const key of keys) {
      if (key.length > 200 || HTML_TAG_PATTERN.test(key)) {
        throw new Error(`${path} contains an unsafe property name.`);
      }
      validateImportedValue(record[key], `${path}.${key}`, depth + 1);
    }
  }
}

export function validateAssessmentProfileSecurity<T extends Record<string, unknown>>(profile: T): T {
  validateText(profile.organisationName, {
    fieldName: "Organisation / School Name",
    maxLength: SECURITY_LIMITS.organisationName,
    rejectMarkup: true,
  });
  validateText(profile.assessmentName, {
    fieldName: "Assessment Name",
    maxLength: SECURITY_LIMITS.assessmentName,
    rejectMarkup: true,
  });
  validateText(profile.assessmentOwner, {
    fieldName: "Assessment Owner",
    maxLength: SECURITY_LIMITS.assessmentOwner,
    rejectMarkup: true,
  });
  validateIdentifier(profile.assessmentId, "Assessment ID");
  validateDateString(profile.assessmentDate, "Assessment Date");
  validateText(profile.assessmentVersion, {
    fieldName: "Assessment Version",
    maxLength: SECURITY_LIMITS.assessmentVersion,
    rejectMarkup: true,
  });
  return profile;
}

/** Validate the complete Step 1–6 input boundary before risk processing/autosave. */
export function validateAssessmentInputStateSecurity(value: unknown): void {
  validateImportedValue(value, "assessment.inputs");

  if (!value || typeof value !== "object" || Array.isArray(value)) {
    throw new Error("Assessment input state is invalid.");
  }

  const input = value as Record<string, unknown>;
  const stringKeys = ["industryId", "businessTypeId", "processId"];
  for (const key of stringKeys) {
    if (typeof input[key] !== "string") {
      throw new Error(`Assessment input ${key} must be text.`);
    }
  }

  const arrayKeys = [
    "selectedEntryPoints", "selectedFields", "collectorRoles", "dataSubjectTypes",
    "collectionFormats", "storageLocations", "storageEnvironments", "encryptionStatuses",
    "accessRoles", "sharingStatuses", "retentionPeriods", "deletionMethods",
    "privacyNotices", "consentStatuses", "parentalConsentStatuses", "crossBorderTransfers",
  ];

  for (const key of arrayKeys) {
    const values = input[key];
    if (!Array.isArray(values)) throw new Error(`Assessment input ${key} must be an array.`);
    values.forEach((item, index) => validateText(item, {
      fieldName: `${key}[${index}]`,
      maxLength: SECURITY_LIMITS.arrayItem,
      rejectMarkup: true,
    }));
  }

  for (const key of ["customEntryPoints", "customFields"]) {
    if (!Array.isArray(input[key])) throw new Error(`Assessment input ${key} must be an array.`);
    input[key].forEach((item, index) => {
      if (!item || typeof item !== "object") throw new Error(`${key}[${index}] is invalid.`);
      const record = item as Record<string, unknown>;
      validateIdentifier(record.id, `${key}[${index}].id`);
      validateText(record.name, { fieldName: `${key}[${index}].name`, maxLength: SECURITY_LIMITS.customName, rejectMarkup: true });
      if ("collection_method" in record) {
        validateText(record.collection_method, { fieldName: `${key}[${index}].collection_method`, maxLength: SECURITY_LIMITS.arrayItem, rejectMarkup: true });
      }
    });
  }
}
