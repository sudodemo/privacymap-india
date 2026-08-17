"use client";

import { useRef, useState } from "react";
import type { SavedAssessmentIndexItem, AssessmentPackage } from "../lib/assessmentContinuity";
import {
  ASSESSMENT_STORAGE_KEY,
  buildAssessmentIndex,
  createEmptyAssessmentStore,
  createNewAssessmentFromPrevious,
  parseAssessmentStore,
  serializeAssessmentStore,
  buildAssessmentPackage,
} from "../lib/assessmentContinuity";
import {
  buildAssessmentPackageFilename,
  exportAssessmentPackage,
  readAssessmentPackageFile,
} from "../lib/assessmentPackageIO";
import DpdpReadinessTicker from "./DpdpReadinessTicker";
import ReportProtectionNotice from "./ReportProtectionNotice";

interface AssessmentContinuityPanelProps {
  savedAssessments: SavedAssessmentIndexItem[];
  saving: boolean;
  lastSavedAt: string | null;
  onResume: (assessmentId: string) => void;
  onDelete: (assessmentId: string) => void;
  onStartNew: () => void;
}

function formatSavedTime(value: string): string {
  try {
    return new Intl.DateTimeFormat("en-IN", {
      dateStyle: "medium",
      timeStyle: "short",
      hour12: false,
      timeZone: "Asia/Kolkata",
      timeZoneName: "short",
    }).format(new Date(value));
  } catch {
    return value;
  }
}

function readStore(): ReturnType<typeof createEmptyAssessmentStore> {
  if (typeof window === "undefined") return createEmptyAssessmentStore();
  const raw = window.localStorage.getItem(ASSESSMENT_STORAGE_KEY);
  if (!raw) return createEmptyAssessmentStore();
  try {
    return parseAssessmentStore(raw);
  } catch {
    return createEmptyAssessmentStore();
  }
}

function makeNewAssessmentId(): string {
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, "");
  const suffix = Math.random().toString(36).slice(2, 6).toUpperCase();
  return `PMI-${stamp}-${suffix}`;
}

export default function AssessmentContinuityPanel({
  savedAssessments,
  saving,
  lastSavedAt,
  onResume,
  onDelete,
  onStartNew,
}: AssessmentContinuityPanelProps) {
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  function handleExport(assessmentId: string) {
    const store = readStore();
    const pkg = store.assessments[assessmentId];
    if (!pkg) return;
    try {
      setBusyId(assessmentId);
      exportAssessmentPackage(pkg.assessment);
      setMessage(`Assessment package exported: ${buildAssessmentPackageFilename(pkg.assessment)}`);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Assessment package export failed.");
    } finally {
      window.setTimeout(() => setBusyId(null), 400);
    }
  }

  function handleCreateNewFromPrevious(assessmentId: string) {
    const store = readStore();
    const previous = store.assessments[assessmentId];
    if (!previous) return;

    try {
      setBusyId(assessmentId);
      const nextState = createNewAssessmentFromPrevious(previous.assessment, {
        assessmentId: makeNewAssessmentId(),
        assessmentName: `${previous.assessment.assessmentProfile.assessmentName} - New Assessment`,
      });
      const nextPackage = buildAssessmentPackage(nextState, {
        applicationVersion: "Phase-D",
      });
      const nextStore = {
        ...store,
        assessments: {
          ...store.assessments,
          [nextPackage.metadata.assessmentId]: nextPackage,
        },
      };
      window.localStorage.setItem(ASSESSMENT_STORAGE_KEY, serializeAssessmentStore(nextStore));
      setMessage(`New assessment created from ${assessmentId}.`);
      window.setTimeout(() => window.location.reload(), 250);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to create the new assessment.");
    } finally {
      setBusyId(null);
    }
  }

  async function handleImport(file: File) {
    try {
      setBusyId("IMPORT");
      const pkg: AssessmentPackage = await readAssessmentPackageFile(file);
      const store = readStore();
      const nextStore = {
        ...store,
        assessments: {
          ...store.assessments,
          [pkg.metadata.assessmentId]: pkg,
        },
      };
      window.localStorage.setItem(ASSESSMENT_STORAGE_KEY, serializeAssessmentStore(nextStore));
      setMessage(`Imported ${pkg.metadata.assessmentId}. Click Resume to continue it.`);
      window.setTimeout(() => window.location.reload(), 350);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Unable to import the assessment package.");
    } finally {
      window.setTimeout(() => setBusyId(null), 500);
    }
  }

  return (
    <section
      style={{
        background: "#eff6ff",
        border: "1px solid #bfdbfe",
        borderRadius: 14,
        padding: 20,
        marginBottom: 24,
      }}
    >
      <DpdpReadinessTicker />

      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-start",
          gap: 16,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div style={{ color: "#1e3a8a", fontWeight: 800, fontSize: 17, marginBottom: 5 }}>
            Assessment Continuity
          </div>
          <div style={{ color: "#475569", fontSize: 13, lineHeight: 1.6 }}>
            Your assessment is saved locally in this browser. No assessment data is uploaded to PrivacyMap.
          </div>
        </div>
        <div style={{ color: saving ? "#b45309" : "#166534", fontWeight: 700, fontSize: 13 }}>
          {saving ? "Saving locally…" : lastSavedAt ? `Saved locally • ${formatSavedTime(lastSavedAt)}` : "Local autosave ready"}
        </div>
      </div>

      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginTop: 16 }}>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={busyId === "IMPORT"}
          style={{ border: "1px solid #93c5fd", borderRadius: 8, background: "white", color: "#1d4ed8", padding: "9px 14px", fontWeight: 700, cursor: "pointer" }}
        >
          {busyId === "IMPORT" ? "Importing…" : "Import Assessment Package"}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept=".privacymap,.json,application/json"
          style={{ display: "none" }}
          onChange={(event) => {
            const file = event.target.files?.[0];
            event.target.value = "";
            if (file) void handleImport(file);
          }}
        />
      </div>

      {message && (
        <div style={{ marginTop: 10, padding: "9px 11px", borderRadius: 8, background: "white", border: "1px solid #dbeafe", color: "#334155", fontSize: 12, lineHeight: 1.5 }}>
          {message}
        </div>
      )}

      {savedAssessments.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div style={{ fontWeight: 800, color: "#0f172a", marginBottom: 10, fontSize: 14 }}>
            Saved assessments in this browser
          </div>
          <div style={{ display: "grid", gap: 10 }}>
            {savedAssessments.map((item) => (
              <div
                key={item.assessmentId}
                style={{ background: "white", border: "1px solid #dbeafe", borderRadius: 10, padding: "13px 14px" }}
              >
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", gap: 14, flexWrap: "wrap" }}>
                  <div style={{ minWidth: 240 }}>
                    <div style={{ fontWeight: 800, color: "#0f172a", marginBottom: 3 }}>
                      {item.organisationName || "Unnamed organisation"}
                    </div>
                    <div style={{ color: "#475569", fontSize: 12, lineHeight: 1.5 }}>
                      {item.assessmentName || "DPDP Privacy Assessment"} • {item.assessmentId}
                      <br />
                      Progress: Step {item.lastCompletedStep} completed • Saved: {formatSavedTime(item.lastSavedAt)}
                    </div>
                  </div>
                  <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
                    <button type="button" onClick={() => onResume(item.assessmentId)} style={{ border: "none", borderRadius: 8, background: "#1d4ed8", color: "white", padding: "9px 14px", fontWeight: 700, cursor: "pointer" }}>
                      Resume
                    </button>
                    <button type="button" onClick={() => handleExport(item.assessmentId)} disabled={busyId === item.assessmentId} style={{ border: "1px solid #93c5fd", borderRadius: 8, background: "white", color: "#1d4ed8", padding: "9px 12px", fontWeight: 700, cursor: "pointer" }}>
                      {busyId === item.assessmentId ? "Exporting…" : "Export Package"}
                    </button>
                    <button type="button" onClick={() => handleCreateNewFromPrevious(item.assessmentId)} disabled={busyId === item.assessmentId} style={{ border: "1px solid #cbd5e1", borderRadius: 8, background: "white", color: "#334155", padding: "9px 12px", fontWeight: 700, cursor: "pointer" }}>
                      New from Previous
                    </button>
                    <button type="button" onClick={() => onDelete(item.assessmentId)} style={{ border: "1px solid #fecaca", borderRadius: 8, background: "#fff", color: "#b91c1c", padding: "9px 12px", fontWeight: 700, cursor: "pointer" }}>
                      Delete
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <button type="button" onClick={onStartNew} style={{ border: "1px solid #93c5fd", borderRadius: 8, background: "white", color: "#1d4ed8", padding: "9px 14px", fontWeight: 700, cursor: "pointer" }}>
          Start New Assessment
        </button>
      </div>

      <ReportProtectionNotice />
    </section>
  );
}
