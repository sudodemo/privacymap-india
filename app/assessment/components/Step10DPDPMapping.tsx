import React, { useEffect, useMemo, useState } from "react";
import type { RiskResult, RiskLevel } from "../../../lib/privacyRisk";
import type { RiskTreatmentAction } from "../../../lib/riskTreatment";
import { riskBackground, riskColor } from "./shared";
import { kb } from "../../../lib/kb";


type DpdpControlStatus =
  | "NOT_ASSESSED"
  | "REVIEW_REQUIRED"
  | "EVIDENCE_RECORDED";

export type DpdpAssessmentState = {
  status: DpdpControlStatus;
  owner: string;
  evidence: string;
  targetDate: string;
  notes: string;
};

type DpdpMappingRow = {
  id: string;
  findingId: string;
  findingTitle: string;
  findingLevel: RiskLevel;
  controlId: string;
  controlTitle: string;
  actReference: string;
  ruleReference: string;
  requirement: string;
  assessmentQuestion: string;
  evidenceExpectation: string;
  remediation: string;
  effectiveDate: string;
  sourceUrl: string;
  status: DpdpControlStatus;
};

/*
 * =========================================================
 * TREATMENT STATUS HELPERS
 * =========================================================
 * These helpers intentionally accept the RiskTreatmentAction status
 * type and normalize it to a string so this component remains resilient
 * if additional treatment statuses are added to the risk-treatment model.
 */

function treatmentStatusBackground(
  status: RiskTreatmentAction["status"]
): string {
  switch (String(status).toLowerCase()) {
    case "completed":
      return "#f0fdf4";

    case "accepted":
      return "#eff6ff";

    case "in progress":
    case "in-progress":
      return "#fffbeb";

    case "open":
      return "#f8fafc";

    default:
      return "#f8fafc";
  }
}

function treatmentStatusColor(
  status: RiskTreatmentAction["status"]
): string {
  switch (String(status).toLowerCase()) {
    case "completed":
      return "#15803d";

    case "accepted":
      return "#1d4ed8";

    case "in progress":
    case "in-progress":
      return "#b45309";

    case "open":
      return "#475569";

    default:
      return "#475569";
  }
}


export default function Step10DPDPMapping({
  result,
  dataSubjectTypes,
  encryptionStatuses,
  retentionPeriods,
  deletionMethods,
  privacyNotices,
  consentStatuses,
  parentalConsentStatuses,
  crossBorderTransfers,
  treatmentActions,
  mappingStates = {},
  onMappingStateChange,
}: {
  result: RiskResult;
  dataSubjectTypes: string[];
  encryptionStatuses: string[];
  retentionPeriods: string[];
  deletionMethods: string[];
  privacyNotices: string[];
  consentStatuses: string[];
  parentalConsentStatuses: string[];
  crossBorderTransfers: string[];
  treatmentActions: RiskTreatmentAction[];
  mappingStates?: Record<string, DpdpAssessmentState>;
  onMappingStateChange?: (
    id: string,
    updates: Partial<DpdpAssessmentState>
  ) => void;
}) {
  // Child-data applicability must be driven by an explicit
  // child/student data selection. A blank or non-applicable
  // parental-consent answer must not manufacture a child-data
  // condition. This prevents DPDP-C04 from being presented as
  // triggered when the assessment did not identify children's data.
  const isChildData = dataSubjectTypes.includes("Student");

  const context = {
    encryptionStatuses,
    retentionPeriods,
    deletionMethods,
    privacyNotices,
    consentStatuses,
    parentalConsentStatuses,
    isChildData,
  };

  const mappings = useMemo<DpdpMappingRow[]>(() => {
    const rows: DpdpMappingRow[] = [];

    // Finding-driven mappings.
    result.findings.forEach((finding) => {
      const controls = dpdpControlsForFinding(
        finding.id,
        finding.title,
        finding.category,
        context
      );

      controls.forEach((control) => {
        rows.push({
          id: `${finding.id}-${control.id}`,
          findingId: finding.id,
          findingTitle: finding.title,
          findingLevel: finding.level,
          controlId: control.id,
          controlTitle: control.title,
          actReference: control.act_reference,
          ruleReference: control.rule_reference,
          requirement: control.requirement,
          assessmentQuestion: control.assessment_question,
          evidenceExpectation: control.evidence_expectation,
          remediation: control.remediation,
          effectiveDate: control.effective_date,
          sourceUrl: control.source_url,
          status: deriveDpdpStatus(control.id, context),
        });
      });
    });

    // DPDP-C06 is a baseline governance requirement for a
    // personal-data processing activity. It should therefore be
    // assessed even when no finding happens to contain keywords
    // such as "rights" or "grievance".
    const rightsControl = kb.legal.controls.find(
      (control) => control.id === "DPDP-C06"
    );

    if (rightsControl && !rows.some((row) => row.controlId === "DPDP-C06")) {
      const baselineFinding = result.findings[0];

      if (baselineFinding) {
        rows.push({
          id: `BASELINE-DPDP-C06`,
          findingId: baselineFinding.id,
          findingTitle: "Baseline DPDP rights & grievance governance",
          findingLevel: baselineFinding.level,
          controlId: rightsControl.id,
          controlTitle: rightsControl.title,
          actReference: rightsControl.act_reference,
          ruleReference: rightsControl.rule_reference,
          requirement: rightsControl.requirement,
          assessmentQuestion: rightsControl.assessment_question,
          evidenceExpectation: rightsControl.evidence_expectation,
          remediation: rightsControl.remediation,
          effectiveDate: rightsControl.effective_date,
          sourceUrl: rightsControl.source_url,
          status: deriveDpdpStatus(rightsControl.id, context),
        });
      }
    }

    // Children's-data safeguards are baseline-applicable whenever
    // the assessment explicitly identifies Student data, even if
    // no finding title contains a child-related keyword.
    const childControl = kb.legal.controls.find(
      (control) => control.id === "DPDP-C04"
    );

    if (childControl && isChildData && !rows.some((row) => row.controlId === "DPDP-C04")) {
      const baselineFinding = result.findings[0];

      if (baselineFinding) {
        rows.push({
          id: `BASELINE-DPDP-C04`,
          findingId: baselineFinding.id,
          findingTitle: "Baseline children's-data safeguards",
          findingLevel: baselineFinding.level,
          controlId: childControl.id,
          controlTitle: childControl.title,
          actReference: childControl.act_reference,
          ruleReference: childControl.rule_reference,
          requirement: childControl.requirement,
          assessmentQuestion: childControl.assessment_question,
          evidenceExpectation: childControl.evidence_expectation,
          remediation: childControl.remediation,
          effectiveDate: childControl.effective_date,
          sourceUrl: childControl.source_url,
          status: deriveDpdpStatus(childControl.id, context),
        });
      }
    }

    // Deduplicate in case a finding-driven rule and a baseline rule
    // identify the same control.
    const unique = new Map<string, DpdpMappingRow>();
    rows.forEach((row) => {
      if (!unique.has(row.controlId)) {
        unique.set(row.controlId, row);
      }
    });

    return Array.from(unique.values());
  }, [
    result.findings,
    encryptionStatuses,
    retentionPeriods,
    deletionMethods,
    privacyNotices,
    consentStatuses,
    parentalConsentStatuses,
    dataSubjectTypes,
    isChildData,
  ]);

  /*
   * Phase A state normalization:
   * Step 10 no longer owns the authoritative mapping state.
   * The parent page owns mappingStates so the state can later be
   * autosaved/exported/restored by the Continuity Layer.
   */
  const states = mappingStates;

  function updateState(
    id: string,
    updates: Partial<DpdpAssessmentState>
  ) {
    const current = states[id] ?? {
      status: "NOT_ASSESSED",
      owner: "",
      evidence: "",
      targetDate: "",
      notes: "",
    };

    onMappingStateChange?.(id, {
      ...current,
      ...updates,
    });
  }

  const reviewRequiredCount = mappings.filter(
    (mapping) =>
      (states[mapping.id]?.status ??
        mapping.status) ===
      "REVIEW_REQUIRED"
  ).length;

  const evidenceRecordedCount = mappings.filter(
    (mapping) =>
      (states[mapping.id]?.status ??
        mapping.status) ===
      "EVIDENCE_RECORDED"
  ).length;

  const notAssessedCount = mappings.filter(
    (mapping) =>
      (states[mapping.id]?.status ??
        mapping.status) ===
      "NOT_ASSESSED"
  ).length;

  const crossBorderReview =
    crossBorderTransfers.includes("Yes") ||
    crossBorderTransfers.includes("Unknown");

  const dpdpControls = kb.legal.controls;

  const unassessedControls =
    dpdpControls.filter((control) => {
      const isMapped = mappings.some(
        (mapping) => mapping.controlId === control.id
      );

      // C04 is intentionally excluded from the unassessed list
      // when children's data was not selected. It is shown below
      // as contextually not applicable instead.
      if (control.id === "DPDP-C04" && !isChildData) {
        return false;
      }

      return !isMapped;
    });

  const contextuallyNotApplicableControls =
    dpdpControls.filter(
      (control) =>
        control.id === "DPDP-C04" && !isChildData
    );

  return (
    <section
      style={{
        marginTop: "24px",
        marginBottom: "24px",
      }}
    >
      <div
        style={{
          background: "white",
          border: "1px solid #e2e8f0",
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
          STEP 10
        </div>

        <h2
          style={{
            marginTop: 0,
            color: "#0f172a",
          }}
        >
          DPDP Requirement Mapping & Remediation
        </h2>

        <p
          style={{
            color: "#64748b",
            lineHeight: 1.6,
            maxWidth: "780px",
          }}
        >
          Map the privacy findings identified by the assessment
          to the current PrivacyMap India DPDP control knowledge
          base and record the evidence, owner and remediation
          information needed for follow-up.
        </p>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(180px, 1fr))",
            gap: "12px",
            marginTop: "24px",
          }}
        >
          <DpdpSummaryCard
            label="DPDP MAPPINGS"
            value={mappings.length}
          />

          <DpdpSummaryCard
            label="REVIEW REQUIRED"
            value={reviewRequiredCount}
            level={
              reviewRequiredCount > 0
                ? "High"
                : "Low"
            }
          />

          <DpdpSummaryCard
            label="EVIDENCE RECORDED"
            value={evidenceRecordedCount}
            level="Low"
          />

          <DpdpSummaryCard
            label="NOT ASSESSED"
            value={notAssessedCount}
            level={
              notAssessedCount > 0
                ? "Medium"
                : "Low"
            }
          />
        </div>
      </div>

      <div
        style={{
          marginTop: "16px",
          padding: "16px 18px",
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
          borderRadius: "10px",
          color: "#1e3a8a",
          fontSize: "13px",
          lineHeight: 1.6,
        }}
      >
        <strong>DPDP mapping status:</strong>{" "}
        The mappings below are reference mappings to the
        PrivacyMap India legal knowledge base. They are not a
        legal opinion, certification or automatic determination
        of compliance. The current KB records the mapped controls
        with an effective date of 13 May 2027 and uses
        control-level statuses rather than "compliant" / "non-compliant".
      </div>

      {crossBorderReview && (
        <div
          style={{
            marginTop: "16px",
            padding: "16px 18px",
            background: "#fffbeb",
            border: "1px solid #fde68a",
            borderRadius: "10px",
            color: "#92400e",
            fontSize: "13px",
            lineHeight: 1.6,
          }}
        >
          <strong>Additional DPDP reference:</strong>{" "}
          The assessment indicates that personal data may be
          transferred outside India or that the transfer status
          is unknown. Review DPDP Act Section 16 and any applicable
          government-specified restrictions separately. Section 16
          is currently treated as a legal reference in the KB,
          rather than as one of the six mapped control records.
        </div>
      )}

      <div
        style={{
          marginTop: "20px",
          background: "white",
          border: "1px solid #e2e8f0",
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
          Finding-to-DPDP Control Register
        </h2>

        {mappings.length === 0 ? (
          <div
            style={{
              padding: "18px",
              background: "#f8fafc",
              borderRadius: "10px",
              color: "#64748b",
              lineHeight: 1.6,
            }}
          >
            No current finding has a direct mapping to one of the
            DPDP controls in the current knowledge base. This does
            not mean that all DPDP requirements have been assessed.
          </div>
        ) : (
          mappings.map((mapping) => {
            const state =
              states[mapping.id] ?? {
                status: mapping.status,
                owner: "",
                evidence: "",
                targetDate: "",
                notes: "",
              };

            return (
              <div
                key={mapping.id}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: "12px",
                  padding: "22px",
                  marginBottom: "18px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                    gap: "15px",
                    flexWrap: "wrap",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize: "11px",
                        fontWeight: 700,
                        color: "#64748b",
                        letterSpacing: "1px",
                      }}
                    >
                      {mapping.findingId} • {mapping.controlId}
                    </div>

                    <h3
                      style={{
                        margin: "6px 0",
                        color: "#0f172a",
                      }}
                    >
                      {mapping.findingTitle}
                    </h3>

                    <div
                      style={{
                        fontSize: "13px",
                        color: "#475569",
                      }}
                    >
                      DPDP: {mapping.controlTitle}
                    </div>
                  </div>

                  <div
                    style={{
                      display: "flex",
                      gap: "8px",
                      flexWrap: "wrap",
                    }}
                  >
                    <span
                      style={{
                        padding: "6px 10px",
                        borderRadius: "20px",
                        background: riskBackground(
                          mapping.findingLevel
                        ),
                        color: riskColor(
                          mapping.findingLevel
                        ),
                        fontWeight: 700,
                        fontSize: "12px",
                      }}
                    >
                      Finding: {mapping.findingLevel}
                    </span>

                    <DpdpStatusBadge
                      status={state.status}
                    />

                    {(() => {
                      const finding =
                        result.findings.find(
                          (item) =>
                            item.id ===
                            mapping.findingId
                        );

                      const treatmentAction =
                        treatmentActions.find(
                          (action) =>
                            action.riskTitle ===
                              finding?.title &&
                            action.category ===
                              finding?.category
                        );

                      return treatmentAction ? (
                        <span
                          style={{
                            padding: "6px 10px",
                            borderRadius: "20px",
                            background:
                              treatmentStatusBackground(
                                treatmentAction.status
                              ),
                            color:
                              treatmentStatusColor(
                                treatmentAction.status
                              ),
                            fontWeight: 700,
                            fontSize: "12px",
                          }}
                        >
                          Treatment:{" "}
                          {treatmentAction.status}
                        </span>
                      ) : null;
                    })()}
                  </div>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "12px",
                    marginTop: "18px",
                  }}
                >
                  <DpdpMeta
                    label="Act reference"
                    value={mapping.actReference}
                  />

                  <DpdpMeta
                    label="Rule reference"
                    value={mapping.ruleReference}
                  />

                  <DpdpMeta
                    label="Effective date"
                    value={mapping.effectiveDate}
                  />
                </div>

                <div
                  style={{
                    marginTop: "14px",
                    padding: "15px",
                    background: "#f8fafc",
                    borderRadius: "10px",
                    color: "#475569",
                    lineHeight: 1.6,
                  }}
                >
                  <strong>Requirement:</strong>{" "}
                  {mapping.requirement}
                </div>

                <div
                  style={{
                    marginTop: "12px",
                    padding: "15px",
                    background: "#eff6ff",
                    border: "1px solid #bfdbfe",
                    borderRadius: "10px",
                    color: "#1e3a8a",
                    lineHeight: 1.6,
                  }}
                >
                  <strong>Assessment question:</strong>{" "}
                  {mapping.assessmentQuestion}
                </div>

                <div
                  style={{
                    marginTop: "12px",
                    color: "#475569",
                    lineHeight: 1.6,
                  }}
                >
                  <strong>Expected evidence:</strong>{" "}
                  {mapping.evidenceExpectation}
                </div>

                <div
                  style={{
                    marginTop: "12px",
                    color: "#475569",
                    lineHeight: 1.6,
                  }}
                >
                  <strong>Recommended remediation:</strong>{" "}
                  {mapping.remediation}
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit, minmax(220px, 1fr))",
                    gap: "12px",
                    marginTop: "18px",
                  }}
                >
                  <div>
                    <label style={governanceLabelStyle}>
                      Control status
                    </label>
                    <select
                      value={state.status}
                      onChange={(event) =>
                        updateState(mapping.id, {
                          status:
                            event.target
                              .value as DpdpControlStatus,
                        })
                      }
                      style={governanceInputStyle}
                    >
                      <option value="NOT_ASSESSED">
                        Not assessed
                      </option>
                      <option value="REVIEW_REQUIRED">
                        Review required
                      </option>
                      <option value="EVIDENCE_RECORDED">
                        Evidence recorded
                      </option>
                    </select>
                  </div>

                  <div>
                    <label style={governanceLabelStyle}>
                      Accountable owner
                    </label>
                    <input
                      type="text"
                      value={state.owner}
                      onChange={(event) =>
                        updateState(mapping.id, {
                          owner: event.target.value,
                        })
                      }
                      placeholder="e.g. DPO / Principal / IT Owner"
                      style={governanceInputStyle}
                    />
                  </div>

                  <div>
                    <label style={governanceLabelStyle}>
                      Target date
                    </label>
                    <input
                      type="date"
                      value={state.targetDate}
                      onChange={(event) =>
                        updateState(mapping.id, {
                          targetDate:
                            event.target.value,
                        })
                      }
                      style={governanceInputStyle}
                    />
                  </div>
                </div>

                <div style={{ marginTop: "12px" }}>
                  <label style={governanceLabelStyle}>
                    Evidence / reference
                  </label>
                  <textarea
                    value={state.evidence}
                    onChange={(event) =>
                      updateState(mapping.id, {
                        evidence: event.target.value,
                      })
                    }
                    rows={2}
                    placeholder="Record the document, policy, screen, configuration or other evidence reference."
                    style={{
                      ...governanceInputStyle,
                      resize: "vertical",
                    }}
                  />
                </div>

                <div style={{ marginTop: "12px" }}>
                  <label style={governanceLabelStyle}>
                    Remediation / review notes
                  </label>
                  <textarea
                    value={state.notes}
                    onChange={(event) =>
                      updateState(mapping.id, {
                        notes: event.target.value,
                      })
                    }
                    rows={3}
                    placeholder="Document the action, decision, exception or review outcome."
                    style={{
                      ...governanceInputStyle,
                      resize: "vertical",
                    }}
                  />
                </div>
              </div>
            );
          })
        )}
      </div>

      {contextuallyNotApplicableControls.length > 0 && (
        <div
          style={{
            marginTop: "16px",
            background: "white",
            border: "1px solid #e2e8f0",
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
            DPDP Controls Not Applicable From Current Data Selection
          </h2>

          <p
            style={{
              color: "#64748b",
              lineHeight: 1.6,
            }}
          >
            These controls are not treated as triggered because the
            current assessment did not identify the relevant data
            category. This is an assessment-context result, not a
            legal conclusion that the organisation is permanently
            outside the scope of the requirement.
          </p>

          <div
            style={{
              display: "grid",
              gap: "10px",
            }}
          >
            {contextuallyNotApplicableControls.map((control) => (
              <div
                key={control.id}
                style={{
                  padding: "14px",
                  background: "#f8fafc",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <strong style={{ color: "#0f172a" }}>
                  {control.id} — {control.title}
                </strong>
                <div
                  style={{
                    marginTop: "5px",
                    fontSize: "13px",
                    color: "#64748b",
                  }}
                >
                  {control.act_reference}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {unassessedControls.length > 0 && (
        <div
          style={{
            marginTop: "16px",
            background: "white",
            border: "1px solid #e2e8f0",
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
            Additional DPDP Controls Requiring Contextual Review
          </h2>

          <p
            style={{
              color: "#64748b",
              lineHeight: 1.6,
            }}
          >
            These controls are present in the legal knowledge base but
            were not directly triggered by the current finding text.
            They should not be interpreted as automatically satisfied;
            review them based on the processing context.
          </p>

          <div
            style={{
              display: "grid",
              gap: "10px",
            }}
          >
            {unassessedControls.map((control) => (
              <div
                key={control.id}
                style={{
                  padding: "14px",
                  background: "#f8fafc",
                  borderRadius: "8px",
                  border: "1px solid #e2e8f0",
                }}
              >
                <strong style={{ color: "#0f172a" }}>
                  {control.id} — {control.title}
                </strong>
                <div
                  style={{
                    marginTop: "5px",
                    fontSize: "13px",
                    color: "#64748b",
                  }}
                >
                  {control.act_reference}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div
        style={{
          marginTop: "16px",
          padding: "16px 18px",
          background: "#f8fafc",
          border: "1px solid #e2e8f0",
          borderRadius: "10px",
          color: "#64748b",
          fontSize: "13px",
          lineHeight: 1.6,
        }}
      >
        <strong>Important:</strong>{" "}
        DPDP mappings are navigational control references. They do
        not establish compliance, non-compliance or legal liability.
        The official notified Act, Rules and subsequent official
        amendments/corrigenda remain the source of truth.
      </div>
    </section>
  );
}

function dpdpControlsForFinding(
  findingId: string,
  findingTitle: string,
  category: string,
  context: {
    encryptionStatuses: string[];
    retentionPeriods: string[];
    deletionMethods: string[];
    privacyNotices: string[];
    consentStatuses: string[];
    parentalConsentStatuses: string[];
    isChildData: boolean;
  }
) {
  const text = `${findingId} ${findingTitle} ${category}`.toLowerCase();
  const controls = kb.legal.controls;
  const result: typeof controls[number][] = [];

  const add = (id: string) => {
    const control = controls.find(
      (item) => item.id === id
    );
    if (
      control &&
      !result.some((item) => item.id === id)
    ) {
      result.push(control);
    }
  };

  if (
    text.includes("not-") ||
    text.includes("notice") ||
    text.includes("transparency")
  ) {
    add("DPDP-C01");
  }

  if (
    text.includes("consent") ||
    text.includes("lawful") ||
    text.includes("purpose") ||
    text.includes("processing basis")
  ) {
    add("DPDP-C02");
  }

  if (
    text.includes("sec-") ||
    text.includes("security") ||
    text.includes("encrypt") ||
    text.includes("access") ||
    text.includes("device")
  ) {
    add("DPDP-C03");
  }

  if (
    context.isChildData &&
    (text.includes("chd-") ||
      text.includes("child") ||
      text.includes("minor") ||
      text.includes("student"))
  ) {
    add("DPDP-C04");
  }

  if (
    text.includes("ret-") ||
    text.includes("retention") ||
    text.includes("deletion") ||
    text.includes("erasure")
  ) {
    add("DPDP-C05");
  }

  if (
    text.includes("right") ||
    text.includes("grievance") ||
    text.includes("access request") ||
    text.includes("correction") ||
    text.includes("data principal")
  ) {
    add("DPDP-C06");
  }

  return result;
}

function deriveDpdpStatus(
  controlId: string,
  context: {
    encryptionStatuses: string[];
    retentionPeriods: string[];
    deletionMethods: string[];
    privacyNotices: string[];
    consentStatuses: string[];
    parentalConsentStatuses: string[];
    isChildData: boolean;
  }
): DpdpControlStatus {
  switch (controlId) {
    case "DPDP-C01":
      if (context.privacyNotices.includes("Yes")) {
        return "EVIDENCE_RECORDED";
      }
      if (
        context.privacyNotices.some(
          (value) =>
            value === "No" ||
            value === "Partially" ||
            value === "Unknown"
        )
      ) {
        return "REVIEW_REQUIRED";
      }
      return "NOT_ASSESSED";

    case "DPDP-C02":
      if (
        context.consentStatuses.includes("Yes") ||
        context.consentStatuses.includes(
          "Not applicable / Other lawful basis"
        )
      ) {
        return "EVIDENCE_RECORDED";
      }
      if (
        context.consentStatuses.some(
          (value) =>
            value === "No" ||
            value === "Partially" ||
            value === "Unknown"
        )
      ) {
        return "REVIEW_REQUIRED";
      }
      return "NOT_ASSESSED";

    case "DPDP-C03":
      if (
        context.encryptionStatuses.includes(
          "Clear text / Not encrypted"
        ) ||
        context.encryptionStatuses.includes("Unknown")
      ) {
        return "REVIEW_REQUIRED";
      }
      if (
        context.encryptionStatuses.includes(
          "Encrypted at rest and in transit"
        )
      ) {
        return "EVIDENCE_RECORDED";
      }
      return "NOT_ASSESSED";

    case "DPDP-C04":
      if (!context.isChildData) {
        return "NOT_ASSESSED";
      }
      if (
        context.parentalConsentStatuses.includes("Yes")
      ) {
        return "EVIDENCE_RECORDED";
      }
      if (
        context.parentalConsentStatuses.some(
          (value) =>
            value === "No" ||
            value === "Partially" ||
            value === "Unknown"
        )
      ) {
        return "REVIEW_REQUIRED";
      }
      return "NOT_ASSESSED";

    case "DPDP-C05": {
      const retentionGood =
        context.retentionPeriods.length > 0 &&
        !context.retentionPeriods.some(
          (value) =>
            value === "No defined retention period" ||
            value === "Unknown" ||
            value === "Indefinitely"
        );
      const deletionGood =
        context.deletionMethods.length > 0 &&
        !context.deletionMethods.some(
          (value) =>
            value === "No defined deletion process" ||
            value === "Unknown"
        );

      if (retentionGood && deletionGood) {
        return "EVIDENCE_RECORDED";
      }

      if (
        context.retentionPeriods.some(
          (value) =>
            value === "No defined retention period" ||
            value === "Unknown" ||
            value === "Indefinitely"
        ) ||
        context.deletionMethods.some(
          (value) =>
            value === "No defined deletion process" ||
            value === "Unknown"
        )
      ) {
        return "REVIEW_REQUIRED";
      }

      return "NOT_ASSESSED";
    }

    case "DPDP-C06":
      // Step 6 does not currently capture evidence for data-principal
      // rights and grievance handling. Therefore the safest status is
      // Review required rather than Not assessed or Evidence recorded.
      return "REVIEW_REQUIRED";

    default:
      return "NOT_ASSESSED";
  }
}

function DpdpSummaryCard({
  label,
  value,
  level,
}: {
  label: string;
  value: number;
  level?: RiskLevel;
}) {
  return (
    <div
      style={{
        padding: "18px",
        borderRadius: "10px",
        background:
          level
            ? riskBackground(level)
            : "#f8fafc",
        border: "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          fontWeight: 700,
          color: "#64748b",
          letterSpacing: "1px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: "6px",
          fontSize: "28px",
          fontWeight: 800,
          color:
            level
              ? riskColor(level)
              : "#0f172a",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function DpdpStatusBadge({
  status,
}: {
  status: DpdpControlStatus;
}) {
  const config =
    status === "EVIDENCE_RECORDED"
      ? {
          label: "Evidence recorded",
          background: "#f0fdf4",
          color: "#15803d",
        }
      : status === "REVIEW_REQUIRED"
      ? {
          label: "Review required",
          background: "#fff7ed",
          color: "#c2410c",
        }
      : {
          label: "Not assessed",
          background: "#f8fafc",
          color: "#64748b",
        };

  return (
    <span
      style={{
        padding: "6px 10px",
        borderRadius: "20px",
        background: config.background,
        color: config.color,
        fontWeight: 700,
        fontSize: "12px",
      }}
    >
      {config.label}
    </span>
  );
}

function DpdpMeta({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        padding: "12px",
        background: "#f8fafc",
        borderRadius: "8px",
      }}
    >
      <div
        style={{
          fontSize: "11px",
          fontWeight: 700,
          color: "#64748b",
          textTransform: "uppercase",
          marginBottom: "5px",
        }}
      >
        {label}
      </div>
      <div
        style={{
          fontSize: "13px",
          color: "#334155",
          lineHeight: 1.5,
        }}
      >
        {value}
      </div>
    </div>
  );
}

const governanceLabelStyle = {
  display: "block",
  fontWeight: 700,
  color: "#0f172a",
  marginBottom: "8px",
  fontSize: "13px",
};

const governanceInputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "11px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  background: "white",
  color: "#0f172a",
  fontSize: "14px",
};
