"use client";

import type { AssessmentProfile } from "../types";
import type { RiskTreatmentAction } from "../lib/remediationEngine";
import type { ResidualRiskDecisionRecord } from "../lib/governanceEngine";
import type { EvidenceRecords } from "../lib/reportExport";

interface Step13EvidenceClosureProps {
  assessmentProfile: AssessmentProfile;
  actions: RiskTreatmentAction[];
  decisions: ResidualRiskDecisionRecord[];
  evidenceRecords: EvidenceRecords;
  onEvidenceChange: (
    id: string,
    updates: Partial<EvidenceRecords[string]>
  ) => void;
}

export default function Step13EvidenceClosure({
  assessmentProfile,
  actions,
  decisions,
  evidenceRecords,
  onEvidenceChange,
}: Step13EvidenceClosureProps) {
  const decisionMap =
    new Map(
      decisions.map(
        (decision) => [
          `${decision.riskTitle}::${decision.category}`,
          decision,
        ]
      )
    );

  const eligible =
    actions.filter(
      (action) =>
        action.status ===
          "Completed" ||
        action.status ===
          "Accepted"
    );

  const verified =
    eligible.filter(
      (action) =>
        evidenceRecords[
          action.id
        ]?.verified
    ).length;

  return (
    <section
      style={{
        marginTop: 24,
        marginBottom: 24,
      }}
    >
      <div style={card}>
        <div style={kicker}>
          STEP 13
        </div>

        <h2 style={h2}>
          Evidence & Closure
        </h2>

        <p style={p}>
          Confirm that completed or
          accepted remediation has
          supporting evidence and that
          governance approvals are
          recorded.
        </p>

        <div style={profile}>
          {assessmentProfile.organisationName}
          {" • "}
          {assessmentProfile.assessmentName}
          {" • Assessment ID: "}
          {assessmentProfile.assessmentId}
        </div>

        <div style={grid}>
          <Summary
            label="ELIGIBLE FOR CLOSURE"
            value={eligible.length}
          />

          <Summary
            label="EVIDENCE VERIFIED"
            value={verified}
          />

          <Summary
            label="PENDING EVIDENCE"
            value={
              eligible.length -
              verified
            }
          />
        </div>
      </div>

      <div style={card}>
        {eligible.length === 0 ? (
          <Empty />
        ) : (
          eligible.map(
            (action) => {
              const evidence =
                evidenceRecords[
                  action.id
                ] ?? {
                  reference: "",
                  owner: "",
                  notes: "",
                  verified: false,
                };

              const decision =
                decisionMap.get(
                  `${action.riskTitle}::${action.category}`
                );

              const approved =
                decision?.approvalStatus ===
                "Approved";

              const ready =
                evidence.verified &&
                Boolean(
                  evidence.reference.trim()
                ) &&
                approved;

              return (
                <div
                  key={action.id}
                  style={{
                    border:
                      "1px solid #e2e8f0",
                    borderRadius: 12,
                    padding: 20,
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent:
                        "space-between",
                      gap: 15,
                      flexWrap:
                        "wrap",
                    }}
                  >
                    <div>
                      <div
                        style={small}
                      >
                        {action.category}
                      </div>

                      <h3
                        style={{
                          margin:
                            "6px 0",
                          color:
                            "#0f172a",
                        }}
                      >
                        {
                          action.riskTitle
                        }
                      </h3>

                      <div
                        style={{
                          fontSize: 13,
                          color:
                            "#475569",
                        }}
                      >
                        Treatment status:{" "}
                        <strong>
                          {
                            action.status
                          }
                        </strong>
                      </div>
                    </div>

                    <span
                      style={badge(
                        ready
                      )}
                    >
                      {ready
                        ? "Closure ready"
                        : "Closure pending"}
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: 16,
                      padding:
                        "12px 14px",
                      background:
                        approved
                          ? "#f0fdf4"
                          : "#fff7ed",
                      border:
                        approved
                          ? "1px solid #bbf7d0"
                          : "1px solid #fed7aa",
                      borderRadius: 8,
                      color:
                        approved
                          ? "#166534"
                          : "#9a3412",
                      fontSize: 13,
                    }}
                  >
                    <strong>
                      Governance approval:
                    </strong>{" "}
                    {approved
                      ? "Recorded as Approved."
                      : "Approval is not recorded as Approved yet."}
                  </div>

                  <div style={two}>
                    <Field label="Evidence reference *">
                      <input
                        value={
                          evidence.reference
                        }
                        onChange={(event) =>
                          onEvidenceChange(
                            action.id,
                            {
                              reference:
                                event
                                  .target
                                  .value,
                            }
                          )
                        }
                        placeholder="Policy, ticket, screenshot, configuration, record, etc."
                        style={input}
                      />
                    </Field>

                    <Field label="Evidence owner">
                      <input
                        value={
                          evidence.owner
                        }
                        onChange={(event) =>
                          onEvidenceChange(
                            action.id,
                            {
                              owner:
                                event
                                  .target
                                  .value,
                            }
                          )
                        }
                        placeholder="Person / team responsible"
                        style={input}
                      />
                    </Field>
                  </div>

                  <Field label="Closure notes">
                    <textarea
                      value={
                        evidence.notes
                      }
                      onChange={(event) =>
                        onEvidenceChange(
                          action.id,
                          {
                            notes:
                              event
                                .target
                                .value,
                          }
                        )
                      }
                      rows={3}
                      style={{
                        ...input,
                        resize:
                          "vertical",
                      }}
                    />
                  </Field>

                  <label
                    style={{
                      display: "flex",
                      alignItems:
                        "center",
                      gap: 9,
                      marginTop: 14,
                      fontSize: 13,
                      color:
                        "#334155",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={
                        evidence.verified
                      }
                      onChange={(event) =>
                        onEvidenceChange(
                          action.id,
                          {
                            verified:
                              event
                                .target
                                .checked,
                          }
                        )
                      }
                    />

                    I have reviewed the
                    evidence and verified
                    that it supports the
                    stated remediation.
                  </label>

                  {ready && (
                    <div
                      style={{
                        marginTop: 14,
                        padding:
                          "12px 14px",
                        background:
                          "#f0fdf4",
                        border:
                          "1px solid #bbf7d0",
                        borderRadius: 8,
                        color:
                          "#166534",
                        fontSize: 13,
                      }}
                    >
                      <strong>
                        Closure criteria
                        satisfied.
                      </strong>{" "}
                      Treatment, evidence
                      and approved
                      governance are all
                      present.
                    </div>
                  )}
                </div>
              );
            }
          )
        )}
      </div>

      <div
        style={{
          marginTop: 16,
          padding:
            "16px 18px",
          background:
            "#f8fafc",
          border:
            "1px solid #e2e8f0",
          borderRadius: 10,
          color:
            "#64748b",
          fontSize: 13,
          lineHeight: 1.6,
        }}
      >
        <strong>
          Closure principle:
        </strong>{" "}
        Completed or Accepted does not
        by itself prove control
        effectiveness. Evidence and
        applicable governance approval
        should be reviewed before
        closure.
      </div>
    </section>
  );
}

/* ============================================================
   STYLES
   ============================================================ */

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

const profile = {
  marginTop: 18,
  padding: "14px 16px",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 10,
  color: "#475569",
  fontSize: 13,
};

const grid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(180px,1fr))",
  gap: 12,
  marginTop: 20,
};

const two = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(240px,1fr))",
  gap: 12,
  marginTop: 16,
};

const input = {
  width: "100%",
  boxSizing:
    "border-box" as const,
  padding: "11px 12px",
  border:
    "1px solid #cbd5e1",
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

const kicker = {
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: 2,
  color: "#1d4ed8",
  marginBottom: 8,
};

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
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

function Summary({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div
      style={{
        padding: 18,
        borderRadius: 10,
        background: "#f8fafc",
        border:
          "1px solid #e2e8f0",
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
          fontSize: 28,
          fontWeight: 800,
          color: "#0f172a",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function badge(
  ready: boolean
) {
  return {
    padding: "6px 10px",
    borderRadius: 20,
    background: ready
      ? "#f0fdf4"
      : "#fffbeb",
    color: ready
      ? "#15803d"
      : "#b45309",
    fontWeight: 700,
    fontSize: 12,
    height:
      "fit-content",
  };
}

function Empty() {
  return (
    <div
      style={{
        padding: 18,
        background: "#f8fafc",
        borderRadius: 10,
        color: "#64748b",
        lineHeight: 1.6,
      }}
    >
      No remediation action is
      currently marked Completed or
      Accepted. Evidence closure becomes
      available when treatment reaches
      one of those statuses.
    </div>
  );
}
