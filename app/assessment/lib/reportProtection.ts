/**
 * PrivacyMap Phase D5 — Report Protection configuration.
 *
 * Monetisation is deliberately disabled for the public launch.
 * These flags are product controls, not security controls. A normal browser
 * cannot reliably prevent OS-level screenshots, Snipping Tool, PrtSc, or a
 * camera from capturing the screen.
 */
export const REPORT_PROTECTION = {
  monetizationEnabled: false,
  fullReportLocked: false,
  previewMode: false,
  watermarkEnabled: false,
  screenshotDeterrenceEnabled: false,
  paymentMethod: "UPI" as const,
} as const;

export type ReportProtectionConfig = typeof REPORT_PROTECTION;

export function isReportMonetizationEnabled(): boolean {
  return REPORT_PROTECTION.monetizationEnabled;
}

export function isFullReportLocked(): boolean {
  return REPORT_PROTECTION.monetizationEnabled && REPORT_PROTECTION.fullReportLocked;
}

export function shouldShowReportPreview(): boolean {
  return REPORT_PROTECTION.monetizationEnabled && REPORT_PROTECTION.previewMode;
}

export function shouldWatermarkReport(): boolean {
  return REPORT_PROTECTION.monetizationEnabled && REPORT_PROTECTION.watermarkEnabled;
}
