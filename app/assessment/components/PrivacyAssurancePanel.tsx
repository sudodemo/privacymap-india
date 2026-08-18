"use client";

import { useEffect, useState } from "react";
import {
  clearLocalAssessmentData,
  formatStorageUsage,
  getLocalAssessmentStorageUsage,
  PRIVACY_ASSURANCE_STATEMENT,
  PRIVACY_ASSURANCE_VERSION,
  runPrivacyAssuranceCheck,
  type PrivacyAssuranceResult,
} from "../lib/privacyAssurance";

function statusStyle(status: "PASS" | "WARN" | "FAIL") {
  if (status === "PASS") {
    return { background: "#f0fdf4", border: "1px solid #bbf7d0", color: "#166534" };
  }
  if (status === "FAIL") {
    return { background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c" };
  }
  return { background: "#fffbeb", border: "1px solid #fde68a", color: "#92400e" };
}

export default function PrivacyAssurancePanel() {
  const [result, setResult] = useState<PrivacyAssuranceResult | null>(null);
  const [storageUsage, setStorageUsage] = useState(0);
  const [message, setMessage] = useState<string | null>(null);

  function runCheck() {
    setResult(runPrivacyAssuranceCheck());
    setStorageUsage(getLocalAssessmentStorageUsage());
    setMessage(null);
  }

  useEffect(() => {
    runCheck();
  }, []);

  function handleClearLocalData() {
    const confirmed = window.confirm(
      "This will permanently remove all PrivacyMap assessments saved in this browser. Export any assessment package you want to keep before continuing. Continue?"
    );

    if (!confirmed) return;

    try {
      clearLocalAssessmentData();
      setStorageUsage(0);
      setResult(runPrivacyAssuranceCheck());
      setMessage("All locally saved PrivacyMap assessment data has been removed from this browser.");
      window.setTimeout(() => window.location.reload(), 250);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to clear local assessment data.");
    }
  }

  return (
    <section
      style={{
        marginTop: 18,
        padding: 16,
        background: "#ffffff",
        border: "1px solid #dbeafe",
        borderRadius: 12,
      }}
    >
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, alignItems: "flex-start", flexWrap: "wrap" }}>
        <div>
          <div style={{ color: "#0f172a", fontWeight: 800, fontSize: 14 }}>
            Privacy Assurance
          </div>
          <div style={{ color: "#475569", fontSize: 12, lineHeight: 1.55, marginTop: 4 }}>
            {PRIVACY_ASSURANCE_STATEMENT}
          </div>
        </div>
        <div style={{ color: "#64748b", fontSize: 11, fontWeight: 700 }}>
          {PRIVACY_ASSURANCE_VERSION}
        </div>
      </div>

      <div style={{ marginTop: 12, padding: "9px 11px", borderRadius: 8, background: "#f8fafc", color: "#475569", fontSize: 12 }}>
        Local assessment storage currently uses approximately <strong>{formatStorageUsage(storageUsage)}</strong> in this browser.
      </div>

      {result && (
        <div style={{ display: "grid", gap: 7, marginTop: 12 }}>
          {result.checks.map((check) => (
            <div
              key={check.id}
              style={{
                ...statusStyle(check.status),
                borderRadius: 8,
                padding: "8px 10px",
                fontSize: 12,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                <strong>{check.label}</strong>
                <strong>{check.status}</strong>
              </div>
              <div style={{ marginTop: 3, lineHeight: 1.45 }}>{check.detail}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
        <button
          type="button"
          onClick={runCheck}
          style={{ border: "1px solid #93c5fd", borderRadius: 8, background: "white", color: "#1d4ed8", padding: "8px 12px", fontWeight: 700, cursor: "pointer" }}
        >
          Run Privacy Check
        </button>
        <button
          type="button"
          onClick={handleClearLocalData}
          style={{ border: "1px solid #fecaca", borderRadius: 8, background: "white", color: "#b91c1c", padding: "8px 12px", fontWeight: 700, cursor: "pointer" }}
        >
          Delete All Local Assessment Data
        </button>
      </div>

      {message && (
        <div style={{ marginTop: 10, padding: "8px 10px", borderRadius: 8, background: "#f8fafc", border: "1px solid #e2e8f0", color: "#334155", fontSize: 12 }}>
          {message}
        </div>
      )}

      <div style={{ marginTop: 10, color: "#64748b", fontSize: 11, lineHeight: 1.5 }}>
        Privacy assurance is a browser-side self-check. It does not claim that the browser is immune to extensions, malware, screenshots, or other software running on the user&apos;s device.
      </div>
    </section>
  );
}
