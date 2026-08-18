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
  const targetDate = useMemo(() => formatDate(DPDP_READINESS_DATE), []);

  useEffect(() => {
    const refresh = () => setDays(getRemainingDays(DPDP_READINESS_DATE));
    refresh();

    const timer = window.setInterval(refresh, 60 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <aside
      aria-label="DPDP readiness countdown"
      style={{
        width: "100%",
        padding: "20px 22px",
        borderRadius: 16,
        background: "linear-gradient(135deg, #eff6ff 0%, #ffffff 100%)",
        border: "1px solid #bfdbfe",
        boxSizing: "border-box",
        textAlign: "center",
      }}
    >
      <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 1.5, color: "#1e3a8a" }}>
        DPDP READINESS COUNTDOWN
      </div>
      <div style={{ marginTop: 8, fontSize: "clamp(34px, 6vw, 48px)", lineHeight: 1, fontWeight: 900, color: "#1d4ed8" }}>
        {days}
      </div>
      <div style={{ marginTop: 5, fontSize: 13, fontWeight: 800, color: "#334155", letterSpacing: 0.4 }}>
        DAYS REMAINING
      </div>
      <div style={{ marginTop: 10, fontSize: 12, color: "#64748b" }}>
        Primary readiness target
      </div>
      <div style={{ marginTop: 2, fontSize: 15, fontWeight: 800, color: "#0f172a" }}>
        {targetDate} IST
      </div>
    </aside>
  );
}

export function DpdpEnforcementTimeline() {
  return (
    <section
      aria-labelledby="dpdp-enforcement-timeline"
      style={{
        marginTop: 56,
        padding: "28px 24px",
        background: "#ffffff",
        border: "1px solid #e2e8f0",
        borderRadius: 16,
      }}
    >
      <div style={{ textAlign: "center", marginBottom: 24 }}>
        <h2 id="dpdp-enforcement-timeline" style={{ margin: 0, color: "#0f172a", fontSize: 26 }}>
          DPDP Enforcement Timeline
        </h2>
        <p style={{ margin: "8px auto 0", maxWidth: 700, color: "#64748b", lineHeight: 1.6, fontSize: 14 }}>
          Key commencement milestones used by PrivacyMap as readiness reference points.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14 }}>
        {DPDP_ENFORCEMENT_PHASES.map((milestone) => (
          <article
            key={milestone.phase}
            style={{ padding: "18px", borderRadius: 12, background: "#f8fafc", border: "1px solid #e2e8f0" }}
          >
            <div style={{ fontSize: 11, fontWeight: 800, letterSpacing: 0.8, color: "#1e40af" }}>
              {milestone.phase} · {formatDate(milestone.date)}
            </div>
            <h3 style={{ margin: "8px 0 6px", fontSize: 16, color: "#0f172a" }}>
              {milestone.label}
            </h3>
            <p style={{ margin: 0, fontSize: 13, lineHeight: 1.6, color: "#475569" }}>
              {milestone.description}
            </p>
          </article>
        ))}
      </div>
    </section>
  );
}
