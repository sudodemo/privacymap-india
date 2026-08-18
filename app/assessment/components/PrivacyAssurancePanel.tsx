"use client";

import { useEffect, useMemo, useState } from "react";
import {
  clearLocalAssessmentData,
  formatStorageUsage,
  getLocalAssessmentStorageUsage,
  PRIVACY_ASSURANCE_STATEMENT,
  runPrivacyAssuranceCheck,
  type PrivacyAssuranceResult,
} from "../lib/privacyAssurance";

function statusStyle(status: "WARN" | "FAIL") {
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

  const attentionChecks = useMemo(
    () => result?.checks.filter((check): check is typeof check & { status: "WARN" | "FAIL" } => check.status !== "PASS") ?? [],
    [result]
  );
  const passedCount = result?.checks.filter((check) => check.status === "PASS").length ?? 0;
  const totalChecks = result?.checks.length ?? 0;
  const allPassed = Boolean(result && attentionChecks.length === 0);

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
      <div>
        <div style={{ color: "#0f172a", fontWeight: 800, fontSize: 14 }}>
          Privacy Assurance
        </div>
        <div style={{ color: "#475569", fontSize: 12, lineHeight: 1.55, marginTop: 4 }}>
          {PRIVACY_ASSURANCE_STATEMENT}
        </div>
      </div>

      <div
        style={{
          marginTop: 12,
          padding: "12px 14px",
          borderRadius: 9,
          background: allPassed ? "#f0fdf4" : "#f8fafc",
          border: allPassed ? "1px solid #bbf7d0" : "1px solid #e2e8f0",
          color: allPassed ? "#166534" : "#334155",
        }}
      >
        <div style={{ fontSize: 13, fontWeight: 800 }}>
          {result
            ? allPassed
              ? "✓ Privacy checks completed successfully"
              : `${attentionChecks.length} privacy check${attentionChecks.length === 1 ? "" : "s"} need${attentionChecks.length === 1 ? "s" : ""} attention`
            : "Checking your browser…"}
        </div>
        {result && (
          <div style={{ marginTop: 4, fontSize: 11, lineHeight: 1.45 }}>
            {passedCount} of {totalChecks} essential browser checks passed.
            {allPassed
              ? " PrivacyMap is ready for the assessment."
              : " See the issue below and follow the recommended action before continuing if required."}
          </div>
        )}
      </div>

      {attentionChecks.length > 0 && (
        <div style={{ display: "grid", gap: 8, marginTop: 12 }}>
          {attentionChecks.map((check) => (
            <div
              key={check.id}
              style={{
                ...statusStyle(check.status),
                borderRadius: 8,
                padding: "10px 11px",
                fontSize: 12,
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", gap: 10, alignItems: "flex-start" }}>
                <strong>{check.label}</strong>
                <strong>{check.status === "FAIL" ? "ACTION REQUIRED" : "REVIEW"}</strong>
              </div>
              <div style={{ marginTop: 5, lineHeight: 1.5 }}>{check.detail}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ marginTop: 12, padding: "9px 11px", borderRadius: 8, background: "#f8fafc", color: "#475569", fontSize: 12 }}>
        Assessment storage currently uses approximately <strong>{formatStorageUsage(storageUsage)}</strong> in this browser.
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 12 }}>
        <button
          type="button"
          onClick={runCheck}
          style={{ border: "1px solid #93c5fd", borderRadius: 8, background: "white", color: "#1d4ed8", padding: "8px 12px", fontWeight: 700, cursor: "pointer" }}
        >
          Recheck Browser
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
