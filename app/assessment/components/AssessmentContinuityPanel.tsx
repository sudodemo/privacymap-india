"use client";

import type { SavedAssessmentIndexItem } from "../lib/assessmentContinuity";

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

export default function AssessmentContinuityPanel({
  savedAssessments,
  saving,
  lastSavedAt,
  onResume,
  onDelete,
  onStartNew,
}: AssessmentContinuityPanelProps) {
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
          <div
            style={{
              color: "#1e3a8a",
              fontWeight: 800,
              fontSize: 17,
              marginBottom: 5,
            }}
          >
            Assessment Continuity
          </div>

          <div
            style={{
              color: "#475569",
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            Your assessment is saved locally in this browser. No assessment
            data is uploaded to PrivacyMap.
          </div>
        </div>

        <div
          style={{
            color: saving ? "#b45309" : "#166534",
            fontWeight: 700,
            fontSize: 13,
          }}
        >
          {saving
            ? "Saving locally…"
            : lastSavedAt
              ? `Saved locally • ${formatSavedTime(lastSavedAt)}`
              : "Local autosave ready"}
        </div>
      </div>

      {savedAssessments.length > 0 && (
        <div style={{ marginTop: 18 }}>
          <div
            style={{
              fontWeight: 800,
              color: "#0f172a",
              marginBottom: 10,
              fontSize: 14,
            }}
          >
            Saved assessments in this browser
          </div>

          <div style={{ display: "grid", gap: 10 }}>
            {savedAssessments.map((item) => (
              <div
                key={item.assessmentId}
                style={{
                  background: "white",
                  border: "1px solid #dbeafe",
                  borderRadius: 10,
                  padding: "13px 14px",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 14,
                  flexWrap: "wrap",
                }}
              >
                <div style={{ minWidth: 240 }}>
                  <div
                    style={{
                      fontWeight: 800,
                      color: "#0f172a",
                      marginBottom: 3,
                    }}
                  >
                    {item.organisationName || "Unnamed organisation"}
                  </div>

                  <div
                    style={{
                      color: "#475569",
                      fontSize: 12,
                      lineHeight: 1.5,
                    }}
                  >
                    {item.assessmentName || "DPDP Privacy Assessment"}{" "}
                    • {item.assessmentId}
                    <br />
                    Progress: Step {item.lastCompletedStep} completed
                    {" • "}
                    Saved: {formatSavedTime(item.lastSavedAt)}
                  </div>
                </div>

                <div style={{ display: "flex", gap: 8 }}>
                  <button
                    type="button"
                    onClick={() => onResume(item.assessmentId)}
                    style={{
                      border: "none",
                      borderRadius: 8,
                      background: "#1d4ed8",
                      color: "white",
                      padding: "9px 14px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Resume
                  </button>

                  <button
                    type="button"
                    onClick={() => onDelete(item.assessmentId)}
                    style={{
                      border: "1px solid #fecaca",
                      borderRadius: 8,
                      background: "#fff",
                      color: "#b91c1c",
                      padding: "9px 12px",
                      fontWeight: 700,
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{ marginTop: 16 }}>
        <button
          type="button"
          onClick={onStartNew}
          style={{
            border: "1px solid #93c5fd",
            borderRadius: 8,
            background: "white",
            color: "#1d4ed8",
            padding: "9px 14px",
            fontWeight: 700,
            cursor: "pointer",
          }}
        >
          Start New Assessment
        </button>
      </div>
    </section>
  );
}
