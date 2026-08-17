/*
 * PrivacyMap Output Security Layer — E3
 *
 * Security boundary for browser-generated report artifacts.
 * This module is intentionally dependency-free and can be used by the
 * existing report exporter without changing the report presentation layer.
 */

const MAX_REPORT_TEXT = 250_000;
const MAX_FILENAME = 120;

function normalize(value: unknown): string {
  return String(value ?? "")
    .normalize("NFC")
    .replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F]/g, "");
}

/** Remove XML 1.0 characters that are not legal in an XML document. */
export function sanitizeXmlText(value: unknown): string {
  return normalize(value).replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\uFFFE\uFFFF]/g, "");
}

export function escapeXmlSecure(value: unknown): string {
  return sanitizeXmlText(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

/**
 * Spreadsheet/CSV formula-injection defence.
 * Values beginning with =,+,-,@ are prefixed with an apostrophe so Excel and
 * compatible spreadsheet applications treat them as text rather than a formula.
 */
export function escapeCsvSecure(value: unknown): string {
  const normalized = normalize(value).replace(/\r\n?/g, " ");
  const safe = /^[=+\-@]/.test(normalized) ? `'${normalized}` : normalized;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function csvRowSecure(values: unknown[]): string {
  return values.map(escapeCsvSecure).join(",");
}

/** Markdown table-cell escaping without permitting user text to alter the table. */
export function escapeMarkdownSecure(value: unknown): string {
  return normalize(value)
    .replace(/\\/g, "\\\\")
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, "<br>")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

/** PDF text is emitted into literal PDF strings; escape PDF syntax characters. */
export function escapePdfTextSecure(value: unknown): string {
  return normalize(value)
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u00A0/g, " ")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "?")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

/** Report download names must never create a path or special browser target. */
export function safeReportFilename(value: unknown, extension: string): string {
  const ext = extension.replace(/[^a-z0-9]/gi, "").toLowerCase();
  const base = normalize(value)
    .replace(/[\\/:*?"<>|\u0000-\u001F]/g, "-")
    .replace(/\.\.+/g, ".")
    .replace(/\s+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_FILENAME);

  return `${base || "PrivacyMap-Assessment"}.${ext || "txt"}`;
}

export function assertReportTextSize(value: string): string {
  if (value.length > MAX_REPORT_TEXT) {
    throw new Error("Generated report exceeds the permitted output size.");
  }
  return value;
}

/**
 * Prevent accidental javascript/data URLs from being emitted into report links.
 * Only same-document anchors and HTTP(S) links are allowed.
 */
export function safeReportHref(value: unknown): string {
  const href = normalize(value).trim();
  if (!href) return "#";
  if (href.startsWith("#")) return href.replace(/[\s"'<>]/g, "");
  try {
    const url = new URL(href);
    if (url.protocol === "https:" || url.protocol === "http:") return url.href;
  } catch {
    // fall through
  }
  return "#";
}

/**
 * Final output guard used immediately before creating a Blob/download.
 */
export function validateGeneratedArtifact(content: string, mimeType: string): void {
  assertReportTextSize(content);
  if (!mimeType || mimeType.length > 120 || /[\r\n]/.test(mimeType)) {
    throw new Error("Invalid report MIME type.");
  }
}

/** Final guard for binary report artifacts such as PDF. */
export function validateGeneratedBlob(blob: Blob, mimeType: string): void {
  if (!(blob instanceof Blob)) {
    throw new Error("Invalid generated report artifact.");
  }
  if (!mimeType || mimeType.length > 120 || /[\r\n]/.test(mimeType)) {
    throw new Error("Invalid report MIME type.");
  }
  if (blob.size > 5_000_000) {
    throw new Error("Generated report exceeds the permitted output size.");
  }
}
