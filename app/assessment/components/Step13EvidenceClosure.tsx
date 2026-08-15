"use client";

import type { ReactNode } from "react";
import type { AssessmentProfile } from "../types";
import type { RiskTreatmentAction } from "../lib/remediationEngine";
import type { ResidualRiskDecisionRecord } from "../lib/governanceEngine";
import type { EvidenceRecords } from "../lib/reportExport";

export default function Step13EvidenceClosure({
  assessmentProfile,
  actions,
  decisions,
  evidenceRecords,
  onEvidenceChange,
}: {
  assessmentProfile: AssessmentProfile;
  actions: RiskTreatmentAction[];
  decisions: ResidualRiskDecisionRecord[];
  evidenceRecords: EvidenceRecords;
  onEvidenceChange: (
    id: string,
    updates: Partial<EvidenceRecords[string]>
  ) => void;
}) {
  const eligible = actions.filter(
    (action) =>
      action.status === "Completed" ||
      action.status === "Accepted"
  );

  const verified = eligible.filter(
    (action) =>
      evidenceRecords[action.id]?.verified === true
  ).length;

  const ready = eligible.filter((action) => {
    const evidence = evidenceRecords[action.id];
    const decision = decisions.find(
      (item) =>
        item.riskTitle === action.riskTitle &&
        item.category === action.category
    );

    return (
      Boolean(evidence?.reference?.trim()) &&
      evidence?.verified === true &&
      decision?.approvalStatus === "Approved"
    );
  }).length;

  return (
    <section style={{ marginTop: 24, marginBottom: 24 }}>
      <div style={card}>
        <div style={kicker}>STEP 13</div>
        <h2 style={h2}>Evidence & Closure</h2>
        <p style={p}>
          Confirm that completed or accepted remediation has supporting
          evidence and that governance approvals are recorded.
        </p>

        <div style={profile}>
          <strong style={{ color: "#0f172a" }}>
            {assessmentProfile.organisationName}
          </strong>
          {" | "}
          {assessmentProfile.assessmentName}
          {" | "}
          {assessmentProfile.assessmentId}
        </div>

        <div style={grid}>
          <S label="ELIGIBLE FOR CLOSURE" value={eligible.length} />
          <S label="EVIDENCE VERIFIED" value={verified} />
          <S label="CLOSURE READY" value={ready} />
          <S
            label="PENDING EVIDENCE"
            value={Math.max(eligible.length - verified, 0)}
          />
        </div>
      </div>

      <div style={card}>
        {eligible.length === 0 ? (
          <Empty />
        ) : (
          eligible.map((action) => {
            const evidence =
              evidenceRecords[action.id] || {
                reference: "",
                owner: "",
                notes: "",
                verified: false,
              };

            const decision = decisions.find(
              (item) =>
                item.riskTitle === action.riskTitle &&
                item.category === action.category
            );

            const approved =
              decision?.approvalStatus === "Approved";

            const closureReady =
              Boolean(evidence.reference.trim()) &&
              evidence.verified === true &&
              approved;

            return (
              <div
                key={action.id}
                id={`pm-step13-${slug(action.riskTitle)}`}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  padding: 20,
                  marginBottom: 14,
                  scrollMarginTop: 24,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 15,
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div style={small}>
                      {action.category}
                    </div>
                    <h3
                      style={{
                        margin: "6px 0",
                        color: "#0f172a",
                      }}
                    >
                      {action.riskTitle}
                    </h3>
                    <div
                      style={{
                        fontSize: 13,
                        color: "#475569",
                      }}
                    >
                      Treatment status:{" "}
                      <strong>{action.status}</strong>
                    </div>
                  </div>

                  <span style={badge(closureReady)}>
                    {closureReady
                      ? "Closure ready"
                      : "Closure pending"}
                  </span>
                </div>

                <div
                  style={{
                    marginTop: 16,
                    padding: "12px 14px",
                    background: approved
                      ? "#f0fdf4"
                      : "#fff7ed",
                    border: approved
                      ? "1px solid #bbf7d0"
                      : "1px solid #fed7aa",
                    borderRadius: 8,
                    color: approved
                      ? "#166534"
                      : "#9a3412",
                    fontSize: 13,
                  }}
                >
                  <strong>Governance approval:</strong>{" "}
                  {approved
                    ? "Recorded as Approved."
                    : "Approval is not recorded as Approved yet."}
                </div>

                <div style={grid2}>
                  <F label="Evidence / Record Reference">
                    <input
                      value={evidence.reference}
                      onChange={(event) =>
                        onEvidenceChange(action.id, {
                          reference: event.target.value,
                        })
                      }
                      placeholder="Document, ticket, policy, repository or record reference"
                      style={input}
                    />
                  </F>

                  <F label="Evidence Owner">
                    <input
                      value={evidence.owner}
                      onChange={(event) =>
                        onEvidenceChange(action.id, {
                          owner: event.target.value,
                        })
                      }
                      placeholder="DPO / IT / Principal / Procurement"
                      style={input}
                    />
                  </F>
                </div>

                <F label="Closure Notes">
                  <textarea
                    value={evidence.notes}
                    onChange={(event) =>
                      onEvidenceChange(action.id, {
                        notes: event.target.value,
                      })
                    }
                    rows={3}
                    placeholder="Record the verification outcome, date, decision or closure notes."
                    style={{
                      ...input,
                      resize: "vertical",
                    }}
                  />
                </F>

                <label
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: 9,
                    marginTop: 14,
                    color: "#0f172a",
                    fontSize: 13,
                    fontWeight: 700,
                  }}
                >
                  <input
                    type="checkbox"
                    checked={evidence.verified}
                    onChange={(event) =>
                      onEvidenceChange(action.id, {
                        verified: event.target.checked,
                      })
                    }
                  />
                  Evidence has been verified
                </label>
              </div>
            );
          })
        )}
      </div>
    </section>
  );
}

const card = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 14,
  padding: 28,
  marginBottom: 20,
};

const h2 = {
  marginTop: 0,
  color: "#0f172a",
};

const p = {
  color: "#64748b",
  lineHeight: 1.6,
  maxWidth: 760,
};

const kicker = {
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: 2,
  color: "#1d4ed8",
  marginBottom: 8,
};

const profile = {
  marginTop: 18,
  padding: "14px 16px",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 10,
  fontSize: 13,
  color: "#475569",
};

const grid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(160px,1fr))",
  gap: 12,
  marginTop: 20,
};

const grid2 = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(260px,1fr))",
  gap: 12,
};

const input = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "11px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  background: "white",
  color: "#0f172a",
  fontSize: 14,
};

const small = {
  fontSize: 11,
  fontWeight: 700,
  color: "#64748b",
  letterSpacing: 1,
};

const badge = (ready: boolean) => ({
  padding: "6px 10px",
  borderRadius: 20,
  background: ready ? "#f0fdf4" : "#fff7ed",
  color: ready ? "#15803d" : "#c2410c",
  fontWeight: 700,
  fontSize: 12,
  height: "fit-content",
});

function F({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div style={{ marginTop: 12 }}>
      <label
        style={{
          display: "block",
          fontWeight: 700,
          color: "#0f172a",
          marginBottom: 7,
          fontSize: 13,
        }}
      >
        {label}
      </label>
      {children}
    </div>
  );
}

function S({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div
      style={{
        padding: 16,
        borderRadius: 10,
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#64748b",
          letterSpacing: 1,
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 6,
          fontSize: 26,
          fontWeight: 800,
          color: "#0f172a",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Empty() {
  return (
    <div
      style={{
        padding: 18,
        background: "#f8fafc",
        borderRadius: 10,
        color: "#64748b",
      }}
    >
      No completed or accepted remediation actions are currently
      eligible for evidence closure.
    </div>
  );
}

function slug(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}
