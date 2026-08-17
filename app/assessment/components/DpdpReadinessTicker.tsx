"use client";

import { useEffect, useMemo, useState } from "react";

/**
 * Reference readiness date for the current PrivacyMap UX.
 * This is intentionally a configurable product constant, not presented as
 * legal advice or a universal compliance deadline.
 */
export const DPDP_READINESS_DATE = "2027-05-18T00:00:00+05:30";

function getRemainingDays(targetIso: string): number {
  const target = new Date(targetIso).getTime();
  const now = Date.now();
  const diff = target - now;
  return Math.max(0, Math.ceil(diff / 86400000));
}

export default function DpdpReadinessTicker() {
  const [days, setDays] = useState(() => getRemainingDays(DPDP_READINESS_DATE));

  useEffect(() => {
    const refresh = () => setDays(getRemainingDays(DPDP_READINESS_DATE));
    refresh();

    const timer = window.setInterval(refresh, 60 * 60 * 1000);
    return () => window.clearInterval(timer);
  }, []);

  const targetDate = useMemo(
    () =>
      new Intl.DateTimeFormat("en-IN", {
        day: "2-digit",
        month: "short",
        year: "numeric",
        timeZone: "Asia/Kolkata",
      }).format(new Date(DPDP_READINESS_DATE)),
    []
  );

  return (
    <aside
      aria-label="DPDP readiness countdown"
      style={{
        marginBottom: 18,
        marginLeft: "auto",
        maxWidth: 310,
        padding: "10px 14px",
        borderRadius: 10,
        background: "#eff6ff",
        border: "1px solid #bfdbfe",
        textAlign: "right",
      }}
    >
      <div style={{ fontSize: 10, fontWeight: 800, letterSpacing: 1.2, color: "#1e3a8a" }}>
        DPDP READINESS COUNTDOWN
      </div>
      <div style={{ marginTop: 3, fontSize: 21, fontWeight: 800, color: "#1d4ed8" }}>
        {days} days remaining
      </div>
      <div style={{ marginTop: 2, fontSize: 11, color: "#475569" }}>
        Reference date: {targetDate} IST
      </div>
    </aside>
  );
}
