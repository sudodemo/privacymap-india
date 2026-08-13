import React from "react";
import type { Dispatch, SetStateAction } from "react";
import type { RiskLevel } from "../../../lib/privacyRisk";
import type { RiskTreatmentAction, TreatmentStatus } from "../../../lib/riskTreatment";
import type { ResidualRiskAssessment, ResidualRiskSummary } from "../../../lib/residualRisk";
import type { ResidualRiskDecision, ResidualRiskDecisionRecord, DecisionApprovalStatus, ReviewFrequency } from "../../../lib/residualDecision";
import { defaultDecisionRationale, decisionRequiresApproval, defaultResidualRiskDecision } from "../../../lib/residualDecision";
import { riskBackground, riskColor, approvalBackground, approvalColor, ResidualSummaryCard, DecisionSummaryCard, ResidualMeta } from "./shared";

export default function Step9ResidualRisk({
  assessments,
  summary,
  decisions,
  setDecisions,
  onTreatmentStatusChange,
}: {
  assessments: ResidualRiskAssessment[];
  summary: ResidualRiskSummary | null;
  decisions: ResidualRiskDecisionRecord[];
  setDecisions: Dispatch<
    SetStateAction<
      ResidualRiskDecisionRecord[]
    >
  >;
  onTreatmentStatusChange: (
    sourceId: string,
    status: TreatmentStatus
  ) => void;
}) {
  /*
   * ---------------------------------------------------------
   * DECISION UPDATE
   * ---------------------------------------------------------
   */

  function updateDecision(
    id: string,
    decision: ResidualRiskDecision
  ) {
    setDecisions((current) =>
      current.map((item) => {
        if (item.id !== id) {
          return item;
        }

        const requiresApproval =
          decisionRequiresApproval(
            decision,
            item.residualRisk
          );

        return {
          ...item,
          decision,
          rationale:
            defaultDecisionRationale(
              decision,
              item.residualRisk
            ),
          approvalStatus:
            requiresApproval
              ? "Pending"
              : "Approved",
        };
      })
    );
  }

  /*
   * ---------------------------------------------------------
   * RATIONALE UPDATE
   * ---------------------------------------------------------
   */

  function updateRationale(
    id: string,
    rationale: string
  ) {
    setDecisions((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              rationale,
            }
          : item
      )
    );
  }

  /*
   * ---------------------------------------------------------
   * OWNER UPDATE
   * ---------------------------------------------------------
   */

  function updateOwner(
    id: string,
    accountableOwner: string
  ) {
    setDecisions((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              accountableOwner,
            }
          : item
      )
    );
  }

  /*
   * ---------------------------------------------------------
   * REVIEW DATE UPDATE
   * ---------------------------------------------------------
   */

  function updateReviewDate(
    id: string,
    reviewDate: string
  ) {
    setDecisions((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              reviewDate,
            }
          : item
      )
    );
  }

  /*
   * ---------------------------------------------------------
   * APPROVAL STATUS UPDATE
   * ---------------------------------------------------------
   */

  function updateApprovalStatus(
    id: string,
    approvalStatus: DecisionApprovalStatus
  ) {
    setDecisions((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              approvalStatus,
            }
          : item
      )
    );
  }

  /*
   * ---------------------------------------------------------
   * TREATMENT STATUS UPDATE
   * ---------------------------------------------------------
   */

  function updateTreatmentStatus(
    id: string,
    treatmentStatus: TreatmentStatus
  ) {
    const decision =
      decisions.find(
        (item) => item.id === id
      );

    if (!decision) {
      return;
    }

    setDecisions((current) =>
      current.map((item) =>
        item.id === id
          ? {
              ...item,
              treatmentStatus,
            }
          : item
      )
    );

    onTreatmentStatusChange(
      decision.findingId,
      treatmentStatus
    );
  }

  /*
   * ---------------------------------------------------------
   * SUMMARY COUNTS
   * ---------------------------------------------------------
   */

  const pendingApprovals =
    decisions.filter(
      (decision) =>
        decision.approvalStatus ===
        "Pending"
    ).length;

  const approvedDecisions =
    decisions.filter(
      (decision) =>
        decision.approvalStatus ===
        "Approved"
    ).length;

  const rejectedDecisions =
    decisions.filter(
      (decision) =>
        decision.approvalStatus ===
        "Rejected"
    ).length;

  const treatFurtherCount =
    decisions.filter(
      (decision) =>
        decision.decision ===
        "Treat Further"
    ).length;

  return (
    <section
      style={{
        marginTop: "24px",
        marginBottom: "24px",
      }}
    >
      {/* =====================================================
          RESIDUAL RISK SUMMARY
          ===================================================== */}

      <div
        style={{
          background: "white",
          border:
            "1px solid #e2e8f0",
          borderRadius: "14px",
          padding: "28px",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "2px",
            color: "#1d4ed8",
            marginBottom: "8px",
          }}
        >
          STEP 9
        </div>

        <h2
          style={{
            marginTop: 0,
            color: "#0f172a",
          }}
        >
          Residual Risk Assessment
        </h2>

        <p
          style={{
            color: "#64748b",
            lineHeight: 1.6,
            maxWidth: "720px",
          }}
        >
          Residual risk represents the level
          of privacy risk that remains after
          considering the treatment actions
          and existing control effectiveness
          identified during the assessment.
        </p>

        {summary && (
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit, minmax(170px, 1fr))",
              gap: "12px",
              marginTop: "24px",
            }}
          >
            <ResidualSummaryCard
              label="TOTAL RISKS"
              value={summary.total}
            />

            <ResidualSummaryCard
              label="CRITICAL"
              value={summary.critical}
              level="Critical"
            />

            <ResidualSummaryCard
              label="HIGH"
              value={summary.high}
              level="High"
            />

            <ResidualSummaryCard
              label="MEDIUM"
              value={summary.medium}
              level="Medium"
            />

            <ResidualSummaryCard
              label="LOW"
              value={summary.low}
              level="Low"
            />
          </div>
        )}
      </div>

      {/* =====================================================
          RESIDUAL RISK BY FINDING
          ===================================================== */}

      <div
        style={{
          marginTop: "20px",
          background: "white",
          border:
            "1px solid #e2e8f0",
          borderRadius: "14px",
          padding: "28px",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            color: "#0f172a",
          }}
        >
          Residual Risk by Finding
        </h2>

        {assessments.map(
          (assessment) => (
            <div
              key={
                assessment.findingId
              }
              style={{
                border:
                  "1px solid #e2e8f0",
                borderRadius: "12px",
                padding: "22px",
                marginBottom: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent:
                    "space-between",
                  alignItems:
                    "flex-start",
                  gap: "15px",
                  flexWrap: "wrap",
                }}
              >
                <div>
                  <div
                    style={{
                      fontSize: "12px",
                      fontWeight: 700,
                      color: "#64748b",
                      textTransform:
                        "uppercase",
                      letterSpacing: "1px",
                    }}
                  >
                    FINDING
                  </div>

                  <h3
                    style={{
                      margin: "6px 0",
                      color: "#0f172a",
                    }}
                  >
                    {
                      assessment.riskTitle ??
                      assessment.findingId
                    }
                  </h3>

                  <div
                    style={{
                      fontSize: "12px",
                      color: "#64748b",
                    }}
                  >
                    ID:{" "}
                    {
                      assessment.findingId
                    }
                  </div>
                </div>

                <span
                  style={{
                    padding:
                      "6px 10px",
                    borderRadius:
                      "20px",
                    background:
                      riskBackground(
                        assessment.residualRisk
                      ),
                    color:
                      riskColor(
                        assessment.residualRisk
                      ),
                    fontWeight: 700,
                    fontSize:
                      "12px",
                  }}
                >
                  Residual Risk:{" "}
                  {
                    assessment.residualRisk
                  }
                </span>
              </div>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(180px, 1fr))",
                  gap: "12px",
                  marginTop: "18px",
                }}
              >
                <ResidualMeta
                  label="Inherent Risk"
                  value={
                    assessment.inherentRisk
                  }
                  level={
                    assessment.inherentRisk
                  }
                />

                <ResidualMeta
                  label="Control Effectiveness"
                  value={
                    assessment.controlEffectiveness
                  }
                />

                <ResidualMeta
                  label="Residual Risk"
                  value={
                    assessment.residualRisk
                  }
                  level={
                    assessment.residualRisk
                  }
                />

                <ResidualMeta
                  label="Residual Score"
                  value={`${assessment.residualRiskScore}/100`}
                />

                <ResidualMeta
                  label="Status"
                  value={
                    assessment.status
                  }
                />
              </div>

              <div
                style={{
                  marginTop: "18px",
                  padding: "16px",
                  background:
                    "#f8fafc",
                  borderRadius:
                    "10px",
                  color:
                    "#475569",
                  lineHeight:
                    1.6,
                }}
              >
                <strong>
                  Residual risk rationale:
                </strong>

                <div
                  style={{
                    marginTop: "6px",
                  }}
                >
                  {
                    assessment.residualRiskRationale
                  }
                </div>
              </div>

              <div
                style={{
                  marginTop: "14px",
                  padding: "16px",
                  background:
                    "#eff6ff",
                  border:
                    "1px solid #bfdbfe",
                  borderRadius:
                    "10px",
                  color:
                    "#1e3a8a",
                  lineHeight:
                    1.6,
                }}
              >
                <strong>
                  Recommended next action:
                </strong>

                <div
                  style={{
                    marginTop: "6px",
                  }}
                >
                  {
                    assessment.recommendedNextAction
                  }
                </div>
              </div>
            </div>
          )
        )}
      </div>

      {/* =====================================================
          RESIDUAL RISK DECISION SUMMARY
          ===================================================== */}

      <div
        style={{
          marginTop: "20px",
          background: "white",
          border:
            "1px solid #e2e8f0",
          borderRadius: "14px",
          padding: "28px",
        }}
      >
        <div
          style={{
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "2px",
            color: "#1d4ed8",
            marginBottom: "8px",
          }}
        >
          DECISION LAYER
        </div>

        <h2
          style={{
            marginTop: 0,
            color: "#0f172a",
          }}
        >
          Residual Risk Decision & Approval
        </h2>

        <p
          style={{
            color: "#64748b",
            lineHeight: 1.6,
            maxWidth: "760px",
          }}
        >
          Decide how each residual risk should
          be managed. Decisions requiring
          approval remain in{" "}
          <strong>
            Pending
          </strong>{" "}
          status until reviewed by the
          appropriate accountable authority.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(170px, 1fr))",
            gap: "12px",
            marginTop: "24px",
          }}
        >
          <DecisionSummaryCard
            label="TOTAL DECISIONS"
            value={decisions.length}
          />

          <DecisionSummaryCard
            label="PENDING APPROVAL"
            value={pendingApprovals}
            level={
              pendingApprovals > 0
                ? "High"
                : undefined
            }
          />

          <DecisionSummaryCard
            label="APPROVED"
            value={approvedDecisions}
            level="Low"
          />

          <DecisionSummaryCard
            label="REJECTED"
            value={rejectedDecisions}
            level={
              rejectedDecisions > 0
                ? "High"
                : undefined
            }
          />

          <DecisionSummaryCard
            label="TREAT FURTHER"
            value={treatFurtherCount}
            level={
              treatFurtherCount > 0
                ? "High"
                : undefined
            }
          />
        </div>
      </div>

      {/* =====================================================
          DECISION RECORDS
          ===================================================== */}

      <div
        style={{
          marginTop: "20px",
          background: "white",
          border:
            "1px solid #e2e8f0",
          borderRadius: "14px",
          padding: "28px",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            color: "#0f172a",
          }}
        >
          Residual Risk Decision Register
        </h2>

        {decisions.map(
          (decisionRecord) => {
            const requiresApproval =
              decisionRequiresApproval(
                decisionRecord.decision,
                decisionRecord.residualRisk
              );

            return (
              <div
                key={
                  decisionRecord.id
                }
                style={{
                  border:
                    "1px solid #e2e8f0",
                  borderRadius:
                    "12px",
                  padding: "22px",
                  marginBottom:
                    "18px",
                }}
              >
                {/* HEADER */}

                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "flex-start",
                    gap: "15px",
                    flexWrap:
                      "wrap",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize:
                          "11px",
                        fontWeight:
                          700,
                        color:
                          "#64748b",
                        letterSpacing:
                          "1px",
                      }}
                    >
                      DECISION RECORD
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
                        decisionRecord.riskTitle
                      }
                    </h3>

                    <div
                      style={{
                        fontSize:
                          "12px",
                        color:
                          "#64748b",
                      }}
                    >
                      {
                        decisionRecord.findingId
                      }{" "}
                      •{" "}
                      {
                        decisionRecord.category
                      }
                    </div>
                  </div>

                  <div
                    style={{
                      display:
                        "flex",
                      gap: "8px",
                      flexWrap:
                        "wrap",
                    }}
                  >
                    <span
                      style={{
                        padding:
                          "6px 10px",
                        borderRadius:
                          "20px",
                        background:
                          riskBackground(
                            decisionRecord.residualRisk
                          ),
                        color:
                          riskColor(
                            decisionRecord.residualRisk
                          ),
                        fontWeight:
                          700,
                        fontSize:
                          "12px",
                      }}
                    >
                      Residual:{" "}
                      {
                        decisionRecord.residualRisk
                      }
                    </span>

                    <span
                      style={{
                        padding:
                          "6px 10px",
                        borderRadius:
                          "20px",
                        background:
                          approvalBackground(
                            decisionRecord.approvalStatus
                          ),
                        color:
                          approvalColor(
                            decisionRecord.approvalStatus
                          ),
                        fontWeight:
                          700,
                        fontSize:
                          "12px",
                      }}
                    >
                      {
                        decisionRecord.approvalStatus
                      }
                    </span>
                  </div>
                </div>

                {/* RISK METADATA */}

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(180px, 1fr))",
                    gap: "12px",
                    marginTop:
                      "18px",
                  }}
                >
                  <ResidualMeta
                    label="Inherent Risk"
                    value={
                      decisionRecord.inherentRisk
                    }
                    level={
                      decisionRecord.inherentRisk
                    }
                  />

                  <ResidualMeta
                    label="Residual Risk"
                    value={
                      decisionRecord.residualRisk
                    }
                    level={
                      decisionRecord.residualRisk
                    }
                  />

                  <ResidualMeta
                    label="Approval Required"
                    value={
                      requiresApproval
                        ? "Yes"
                        : "No"
                    }
                    level={
                      requiresApproval
                        ? "High"
                        : undefined
                    }
                  />

                  <ResidualMeta
                    label="Decision ID"
                    value={
                      decisionRecord.id
                    }
                  />

                  <ResidualMeta
                    label="Treatment Status"
                    value={
                      decisionRecord.treatmentStatus
                    }
                  />
                </div>

                {/* DECISION */}

                <div
                  style={{
                    marginTop:
                      "20px",
                    padding:
                      "18px",
                    background:
                      "#f8fafc",
                    border:
                      "1px solid #e2e8f0",
                    borderRadius:
                      "10px",
                  }}
                >
                  <label
                    style={{
                      display:
                        "block",
                      fontWeight:
                        700,
                      color:
                        "#0f172a",
                      marginBottom:
                        "8px",
                    }}
                  >
                    Residual risk decision
                  </label>

                  <select
                    value={
                      decisionRecord.decision
                    }
                    onChange={(
                      event
                    ) =>
                      updateDecision(
                        decisionRecord.id,
                        event.target
                          .value as ResidualRiskDecision
                      )
                    }
                    style={{
                      width:
                        "100%",
                      padding:
                        "12px 14px",
                      border:
                        "1px solid #cbd5e1",
                      borderRadius:
                        "8px",
                      background:
                        "white",
                      color:
                        "#0f172a",
                      fontSize:
                        "15px",
                      fontWeight:
                        600,
                    }}
                  >
                    <option value="Accept">
                      Accept
                    </option>

                    <option value="Treat Further">
                      Treat Further
                    </option>

                    <option value="Avoid">
                      Avoid
                    </option>

                    <option value="Transfer">
                      Transfer
                    </option>

                    <option value="Monitor">
                      Monitor
                    </option>
                  </select>

                  <div
                    style={{
                      marginTop:
                        "10px",
                      fontSize:
                        "12px",
                      color:
                        "#64748b",
                      lineHeight:
                        1.5,
                    }}
                  >
                    {decisionRecord.decision ===
                      "Accept" &&
                      "The organisation accepts the residual exposure within its defined risk tolerance."}

                    {decisionRecord.decision ===
                      "Treat Further" &&
                      "Additional controls or remediation are required to reduce the residual risk."}

                    {decisionRecord.decision ===
                      "Avoid" &&
                      "The processing activity creating the risk will be stopped, removed or redesigned."}

                    {decisionRecord.decision ===
                      "Transfer" &&
                      "Part of the residual exposure will be managed through contractual, insurance, vendor or other transfer mechanisms."}

                    {decisionRecord.decision ===
                      "Monitor" &&
                      "The risk is currently manageable but requires periodic review."}
                  </div>
                </div>

                {/* RATIONALE */}

                <div
                  style={{
                    marginTop:
                      "14px",
                  }}
                >
                  <label
                    style={{
                      display:
                        "block",
                      fontWeight:
                        700,
                      color:
                        "#0f172a",
                      marginBottom:
                        "8px",
                    }}
                  >
                    Decision rationale
                  </label>

                  <textarea
                    value={
                      decisionRecord.rationale
                    }
                    onChange={(
                      event
                    ) =>
                      updateRationale(
                        decisionRecord.id,
                        event.target
                          .value
                      )
                    }
                    rows={4}
                    style={{
                      width:
                        "100%",
                      boxSizing:
                        "border-box",
                      padding:
                        "12px 14px",
                      border:
                        "1px solid #cbd5e1",
                      borderRadius:
                        "8px",
                      background:
                        "white",
                      color:
                        "#334155",
                      fontSize:
                        "14px",
                      lineHeight:
                        1.5,
                      resize:
                        "vertical",
                    }}
                  />
                </div>

                {/* ACCOUNTABILITY */}

                <div
                  style={{
                    display:
                      "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(220px, 1fr))",
                    gap:
                      "12px",
                    marginTop:
                      "14px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display:
                          "block",
                        fontWeight:
                          700,
                        color:
                          "#0f172a",
                        marginBottom:
                          "8px",
                      }}
                    >
                      Accountable owner
                    </label>

                    <input
                      type="text"
                      value={
                        decisionRecord.accountableOwner
                      }
                      onChange={(
                        event
                      ) =>
                        updateOwner(
                          decisionRecord.id,
                          event.target
                            .value
                        )
                      }
                      placeholder="e.g. Principal / DPO / Risk Owner"
                      style={{
                        width:
                          "100%",
                        boxSizing:
                          "border-box",
                        padding:
                          "12px 14px",
                        border:
                          "1px solid #cbd5e1",
                        borderRadius:
                          "8px",
                        background:
                          "white",
                        color:
                          "#0f172a",
                        fontSize:
                          "14px",
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style={{
                        display:
                          "block",
                        fontWeight:
                          700,
                        color:
                          "#0f172a",
                        marginBottom:
                          "8px",
                      }}
                    >
                      Review date
                    </label>

                    <input
                      type="date"
                      value={
                        decisionRecord.reviewDate
                      }
                      onChange={(
                        event
                      ) =>
                        updateReviewDate(
                          decisionRecord.id,
                          event.target
                            .value
                        )
                      }
                      style={{
                        width:
                          "100%",
                        boxSizing:
                          "border-box",
                        padding:
                          "12px 14px",
                        border:
                          "1px solid #cbd5e1",
                        borderRadius:
                          "8px",
                        background:
                          "white",
                        color:
                          "#0f172a",
                        fontSize:
                          "14px",
                      }}
                    />
                  </div>
                </div>

                {/* APPROVAL + TREATMENT STATUS */}

                <div
                  style={{
                    marginTop:
                      "18px",
                    paddingTop:
                      "18px",
                    borderTop:
                      "1px solid #e2e8f0",
                    display:
                      "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(220px, 1fr))",
                    gap:
                      "12px",
                  }}
                >
                  <div>
                    <label
                      style={{
                        display:
                          "block",
                        fontWeight:
                          700,
                        color:
                          "#0f172a",
                        marginBottom:
                          "8px",
                      }}
                    >
                      Approval status
                    </label>

                    <select
                      value={
                        decisionRecord.approvalStatus
                      }
                      onChange={(
                        event
                      ) =>
                        updateApprovalStatus(
                          decisionRecord.id,
                          event.target
                            .value as DecisionApprovalStatus
                        )
                      }
                      style={{
                        width:
                          "100%",
                        padding:
                          "11px 12px",
                        border:
                          "1px solid #cbd5e1",
                        borderRadius:
                          "8px",
                        background:
                          "white",
                        color:
                          "#0f172a",
                        fontSize:
                          "14px",
                      }}
                    >
                      <option value="Pending">
                        Pending
                      </option>

                      <option value="Approved">
                        Approved
                      </option>

                      <option value="Rejected">
                        Rejected
                      </option>
                    </select>
                  </div>

                  <div>
                    <label
                      style={{
                        display:
                          "block",
                        fontWeight:
                          700,
                        color:
                          "#0f172a",
                        marginBottom:
                          "8px",
                      }}
                    >
                      Treatment status
                    </label>

                    <select
                      value={
                        decisionRecord.treatmentStatus
                      }
                      onChange={(
                        event
                      ) =>
                        updateTreatmentStatus(
                          decisionRecord.id,
                          event.target
                            .value as TreatmentStatus
                        )
                      }
                      style={{
                        width:
                          "100%",
                        padding:
                          "11px 12px",
                        border:
                          "1px solid #cbd5e1",
                        borderRadius:
                          "8px",
                        background:
                          "white",
                        color:
                          "#0f172a",
                        fontSize:
                          "14px",
                      }}
                    >
                      <option value="Open">
                        Open
                      </option>

                      <option value="In Progress">
                        In Progress
                      </option>

                      <option value="Completed">
                        Completed
                      </option>

                      <option value="Accepted">
                        Accepted
                      </option>
                    </select>
                  </div>
                </div>

                {/* APPROVAL WARNING */}

                {requiresApproval && (
                  <div
                    style={{
                      marginTop:
                        "16px",
                      padding:
                        "14px 16px",
                      background:
                        "#fff7ed",
                      border:
                        "1px solid #fed7aa",
                      borderRadius:
                        "10px",
                      color:
                        "#9a3412",
                      lineHeight:
                        1.6,
                      fontSize:
                        "13px",
                    }}
                  >
                    <strong>
                      Approval required:
                    </strong>{" "}
                    This decision requires
                    review and approval because
                    the residual risk is{" "}
                    <strong>
                      {
                        decisionRecord.residualRisk
                      }
                    </strong>{" "}
                    or because the selected
                    decision requires explicit
                    approval.
                  </div>
                )}
              </div>
            );
          })}
      </div>

      {/* =====================================================
          GOVERNANCE GUIDANCE
          ===================================================== */}

      <div
        style={{
          marginTop: "16px",
          padding: "16px 18px",
          background: "#f8fafc",
          border:
            "1px solid #e2e8f0",
          borderRadius: "10px",
          color: "#64748b",
          fontSize: "13px",
          lineHeight: 1.6,
        }}
      >
        <strong>
          Residual-risk governance:
        </strong>{" "}
        Residual-risk decisions are
        management decisions, not automatic
        legal conclusions. Critical and High
        residual risks require explicit
        approval. Acceptance, Avoidance and
        other decisions should be supported
        by an appropriate accountable owner,
        rationale and review date.
      </div>
    </section>
  );
}

/*
 * =========================================================
 * RESIDUAL SUMMARY CARD
 * =========================================================
 */

