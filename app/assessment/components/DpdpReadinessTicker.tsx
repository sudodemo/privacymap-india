"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * DPDP enforcement milestones notified by the Government of India.
 *
 * The countdown uses the 18-month milestone because this is the primary
 * readiness target for PrivacyMap. The dates are product reference dates,
 * not a legal conclusion or a universal "DPDP compliant" deadline.
 */
export const DPDP_READINESS_DATE = "2027-05-13T00:00:00+05:30";

export const DPDP_ENFORCEMENT_PHASES = [
  {
    phase: "Phase 1",
    date: "2025-11-13T00:00:00+05:30",
    label: "Initial commencement",
    description: "Specified Act provisions commence and the Data Protection Board of India is established.",
  },
  {
    phase: "Phase 2",
    date: "2026-11-13T00:00:00+05:30",
    label: "One-year milestone",
    description: "Specified one-year provisions commence, including the notified Consent Manager-related provision.",
  },
  {
    phase: "Phase 3",
    date: "2027-05-13T00:00:00+05:30",
    label: "Eighteen-month milestone",
    description: "The principal operational provisions of the Act commence, covering notices, consent, safeguards, breach-related duties and other notified obligations.",
  },
] as const;

function getRemainingDays(targetIso: string): number {
  const target = new Date(targetIso).getTime();
  const now = Date.now();
  const diff = target - now;
  return Math.max(0, Math.ceil(diff / 86400000));
}

function formatDate(dateIso: string): string {
  return new Intl.DateTimeFormat("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
    timeZone: "Asia/Kolkata",
  }).format(new Date(dateIso));
}

export default function DpdpReadinessTicker() {
  const [days, setDays] = useState(() => getRemainingDays(DPDP_READINESS_DATE));

  useEffect(() => {
    const refresh = () => setDays(getRemainingDays(DPDP_READINESS_DATE));
    refresh();

    const timer = window.setInterval(refresh, 60 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  const targetDate = useMemo(() => formatDate(DPDP_READINESS_DATE), []);

  return (
    <aside
      aria-label="DPDP readiness timeline"
      style={{
        marginBottom: 18,
        marginLeft: "auto",
        width: "100%",
        maxWidth: 560,
        padding: "14px 16px",
        borderRadius: 12,
        background: "#eff6ff",
        border: "1px solid #bfdbfe",
        boxSizing: "border-box",
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.2, color: "#1e3a8a" }}>
        DPDP READINESS COUNTDOWN
      </div>
      <div style={{ marginTop: 3, fontSize: 22, fontWeight: 800, color: "#1d4ed8" }}>
        {days} days remaining
      </div>
      <div style={{ marginTop: 2, fontSize: 11, color: "#475569" }}>
        Primary readiness target: {targetDate} IST
      </div>

      <div style={{ display: "grid", gap: 8, marginTop: 14 }}>
        {DPDP_ENFORCEMENT_PHASES.map((milestone) => (
          <div
            key={milestone.phase}
            style={{
              padding: "9px 10px",
              borderRadius: 8,
              background: "rgba(255,255,255,0.72)",
              border: "1px solid #dbeafe",
            }}
          >
            <div style={{ fontSize: 11, fontWeight: 800, color: "#1e3a8a" }}>
              {milestone.phase} · {formatDate(milestone.date)}
            </div>
            <div style={{ marginTop: 2, fontSize: 12, fontWeight: 700, color: "#1e293b" }}>
              {milestone.label}
            </div>
            <div style={{ marginTop: 2, fontSize: 11, lineHeight: 1.45, color: "#475569" }}>
              {milestone.description}
            </div>
          </div>
        ))}
      </div>
    </aside>
  );
}
