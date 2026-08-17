"use client";

/**
 * Phase D report-protection framework.
 *
 * Monetisation is intentionally disabled at this stage. The component is a
 * transparent UX notice rather than a claim that browser screenshots can be
 * technically prevented. Future payment/report-locking behavior can be
 * enabled here without changing the assessment state model.
 */
export const REPORT_MONETIZATION_ENABLED = false as const;

export default function ReportProtectionNotice() {
  if (REPORT_MONETIZATION_ENABLED) return null;

  return (
    <div
      style={{
        marginTop: 16,
        padding: "12px 14px",
        borderRadius: 10,
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        color: "#64748b",
        fontSize: 12,
        lineHeight: 1.55,
      }}
    >
      <strong style={{ color: "#334155" }}>Report protection framework:</strong>{" "}
      full report access and monetisation controls are currently disabled while
      PrivacyMap is in the free public assessment phase.
    </div>
  );
}
