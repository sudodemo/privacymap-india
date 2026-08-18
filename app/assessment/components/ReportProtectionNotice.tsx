"use client";

/**
 * Phase D report-protection framework.
 *
 * Monetisation remains intentionally disabled at this stage. The framework is
 * retained so future payment/report-locking behavior can be enabled without
 * changing the assessment state model. It is not presented as a user-facing
 * notice while inactive.
 */
export const REPORT_MONETIZATION_ENABLED = false as const;

export default function ReportProtectionNotice() {
  // Keep the report-protection framework available internally, but do not
  // expose inactive monetisation state in the public assessment experience.
  return null;
}
