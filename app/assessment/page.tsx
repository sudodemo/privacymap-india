"use client";

import {
  defaultResidualRiskDecision,
  defaultDecisionRationale,
  decisionRequiresApproval,
  type ResidualRiskDecision,
  type ResidualRiskDecisionRecord,
  type DecisionApprovalStatus,
  type ReviewFrequency,
} from "../../lib/residualDecision";

import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import {
  getBusinessTypes,
  getSchoolEntryPoints,
  kb,
} from "../../lib/kb";

import {
  calculatePrivacyRisk,
  type RiskLevel,
  type RiskResult,
} from "../../lib/privacyRisk";

import {
  generateRiskTreatmentPlan,
  type RiskTreatmentAction,
  type TreatmentStatus,
} from "../../lib/riskTreatment";

import {
  generateResidualRiskAssessment,
  generateResidualRiskSummary,
  type ResidualRiskAssessment,
  type ResidualRiskSummary,
} from "../../lib/residualRisk";

export default function AssessmentPage() {
  /*
   * =========================================================
   * RESIDUAL RISK DECISION BUILDER
   * =========================================================
   */

function buildResidualRiskDecisions(
  residualRisks: ResidualRiskAssessment[]
): ResidualRiskDecisionRecord[] {
  return residualRisks.map((risk) => {
    const residualRisk = risk.residualRisk;
    const decision = defaultResidualRiskDecision(residualRisk);
    const requiresApproval = decisionRequiresApproval(
      decision,
      residualRisk
    );
    const escalationRequired =
      residualRisk === "Critical" || residualRisk === "High";

    return {
      id: `DEC-${risk.findingId ?? risk.id}`,
      findingId: risk.findingId ?? risk.id,
      riskTitle: risk.riskTitle,
      category: risk.category,
      inherentRisk: risk.inherentRisk,
      residualRisk,
      decision,
      rationale: defaultDecisionRationale(
        decision,
        residualRisk
      ),
      accountableOwner: "",
      decisionAuthority: "",
      reviewDate: "",
      approvalDate: "",
      nextReviewDate: "",
      targetResolutionDate: "",
      approvalStatus: requiresApproval ? "Pending" : "Approved",
      reviewFrequency:
        residualRisk === "Critical"
          ? "Monthly"
          : residualRisk === "High"
          ? "Quarterly"
          : "Annual",
      escalationRequired,
      escalationReason: escalationRequired
        ? "Residual risk requires management-level review and explicit approval."
        : "",
      treatmentStatus:
        decision === "Accept" ? "Accepted" : "Open",
    };
  });
}

  /*
   * =========================================================
   * STEP 1-2 STATE
   * =========================================================
   */

  const [industryId, setIndustryId] =
    useState("");

  const [businessTypeId, setBusinessTypeId] =
    useState("");

  const [processId, setProcessId] =
    useState("");

  /*
   * =========================================================
   * STEP 4 STATE - ENTRY POINTS
   * =========================================================
   */

  const [
    selectedEntryPoints,
    setSelectedEntryPoints,
  ] = useState<string[]>([]);

  const [
    customEntryPoint,
    setCustomEntryPoint,
  ] = useState("");

  const [
    customEntryPoints,
    setCustomEntryPoints,
  ] = useState<
    {
      id: string;
      name: string;
      collection_method: string;
      custom: boolean;
    }[]
  >([]);

  /*
   * =========================================================
   * STEP 5 STATE - DATA FIELDS
   * =========================================================
   */

  const [
    selectedFields,
    setSelectedFields,
  ] = useState<string[]>([]);

  const [
    customField,
    setCustomField,
  ] = useState("");

  const [
    customFields,
    setCustomFields,
  ] = useState<
    {
      id: string;
      name: string;
      custom: boolean;
    }[]
  >([]);

  /*
   * =========================================================
   * STEP 6 STATE
   * =========================================================
   */

  const [
    collectorRoles,
    setCollectorRoles,
  ] = useState<string[]>([]);

  const [
    dataSubjectTypes,
    setDataSubjectTypes,
  ] = useState<string[]>([]);

  const [
    collectionFormats,
    setCollectionFormats,
  ] = useState<string[]>([]);

  const [
    storageLocations,
    setStorageLocations,
  ] = useState<string[]>([]);

  const [
    storageEnvironments,
    setStorageEnvironments,
  ] = useState<string[]>([]);

  const [
    encryptionStatuses,
    setEncryptionStatuses,
  ] = useState<string[]>([]);

  const [
    accessRoles,
    setAccessRoles,
  ] = useState<string[]>([]);

  const [
    sharingStatuses,
    setSharingStatuses,
  ] = useState<string[]>([]);

  const [
    retentionPeriods,
    setRetentionPeriods,
  ] = useState<string[]>([]);

  const [
    deletionMethods,
    setDeletionMethods,
  ] = useState<string[]>([]);

  const [
    privacyNotices,
    setPrivacyNotices,
  ] = useState<string[]>([]);

  const [
    consentStatuses,
    setConsentStatuses,
  ] = useState<string[]>([]);

  const [
    parentalConsentStatuses,
    setParentalConsentStatuses,
  ] = useState<string[]>([]);

  const [
    crossBorderTransfers,
    setCrossBorderTransfers,
  ] = useState<string[]>([]);

  /*
   * =========================================================
   * STEP 7 STATE
   * =========================================================
   */

  const [
    riskResult,
    setRiskResult,
  ] = useState<RiskResult | null>(null);

  /*
   * =========================================================
   * STEP 9 STATE - RESIDUAL RISK DECISIONS
   * =========================================================
   */

  const [
    residualRiskDecisions,
    setResidualRiskDecisions,
  ] = useState<
    ResidualRiskDecisionRecord[]
  >([]);

  /*
   * =========================================================
   * STEP 8 - RISK TREATMENT
   * =========================================================
   */

  const treatmentPlan =
    useMemo<RiskTreatmentAction[]>(() => {
      if (!riskResult) {
        return [];
      }

      return generateRiskTreatmentPlan(
        riskResult
      );
    }, [riskResult]);

  /*
   * =========================================================
   * STEP 9 - RESIDUAL RISK
   * =========================================================
   */

  const residualRiskAssessments =
    useMemo<ResidualRiskAssessment[]>(() => {
      if (
        !riskResult ||
        treatmentPlan.length === 0
      ) {
        return [];
      }

      return generateResidualRiskAssessment(
        riskResult,
        treatmentPlan
      );
    }, [
      riskResult,
      treatmentPlan,
    ]);

  const residualRiskSummary =
    useMemo<ResidualRiskSummary | null>(() => {
      if (
        residualRiskAssessments.length ===
        0
      ) {
        return null;
      }

      return generateResidualRiskSummary(
        residualRiskAssessments
      );
    }, [
      residualRiskAssessments,
    ]);

  /*
   * =========================================================
   * BUILD / SYNCHRONISE RESIDUAL DECISIONS
   * =========================================================
   *
   * Important:
   * Residual risk assessments are generated from Step 7 +
   * Step 8. Once those assessments exist, we create the
   * explicit decision records.
   *
   * This is intentionally browser-local.
   */

  useEffect(() => {
    if (
      residualRiskAssessments.length ===
      0
    ) {
      setResidualRiskDecisions([]);
      return;
    }

    setResidualRiskDecisions(
      buildResidualRiskDecisions(
        residualRiskAssessments
      )
    );
  }, [residualRiskAssessments]);

  /*
   * =========================================================
   * GENERIC MULTISELECT
   * =========================================================
   */

  function toggleArrayValue(
    value: string,
    setter: Dispatch<
      SetStateAction<string[]>
    >
  ) {
    setter((current) =>
      current.includes(value)
        ? current.filter(
            (item) => item !== value
          )
        : [...current, value]
    );
  }

  /*
   * =========================================================
   * ENTRY POINTS
   * =========================================================
   */

  function toggleEntryPoint(
    id: string
  ) {
    setSelectedEntryPoints(
      (current) =>
        current.includes(id)
          ? current.filter(
              (item) => item !== id
            )
          : [...current, id]
    );
  }

  function addCustomEntryPoint() {
    const name =
      customEntryPoint.trim();

    if (!name) return;

    const newEntryPoint = {
      id: `CUSTOM-${Date.now()}`,
      name,
      collection_method: "Custom",
      custom: true,
    };

    setCustomEntryPoints(
      (current) => [
        ...current,
        newEntryPoint,
      ]
    );

    setCustomEntryPoint("");
  }

  function removeCustomEntryPoint(
    id: string
  ) {
    setCustomEntryPoints(
      (current) =>
        current.filter(
          (item) => item.id !== id
        )
    );
  }

  /*
   * =========================================================
   * DATA FIELDS
   * =========================================================
   */

  function toggleField(id: string) {
    setSelectedFields(
      (current) =>
        current.includes(id)
          ? current.filter(
              (item) => item !== id
            )
          : [...current, id]
    );
  }

  function addCustomField() {
    const name =
      customField.trim();

    if (!name) return;

    const newField = {
      id: `CUSTOM-FIELD-${Date.now()}`,
      name,
      custom: true,
    };

    setCustomFields(
      (current) => [
        ...current,
        newField,
      ]
    );

    setCustomField("");
  }

  function removeCustomField(
    id: string
  ) {
    setCustomFields(
      (current) =>
        current.filter(
          (item) => item.id !== id
        )
    );
  }

  /*
   * =========================================================
   * KNOWLEDGE BASE
   * =========================================================
   */

  const businessTypes =
    useMemo(() => {
      if (!industryId) return [];

      return getBusinessTypes(
        industryId
      ).filter(
        (item) =>
          item.status === "active"
      );
    }, [industryId]);

  const processes =
    useMemo(() => {
      if (
        businessTypeId !==
        "EDU-SCH"
      ) {
        return [];
      }

      return kb.processes;
    }, [businessTypeId]);

  const entryPoints =
    useMemo(() => {
      if (
        businessTypeId !==
        "EDU-SCH"
      ) {
        return [];
      }

      return getSchoolEntryPoints(
        processId || undefined
      );
    }, [
      businessTypeId,
      processId,
    ]);

  /*
   * =========================================================
   * RESET FUNCTIONS
   * =========================================================
   */

  function resetAssessment() {
    setBusinessTypeId("");
    setProcessId("");

    setSelectedEntryPoints([]);
    setCustomEntryPoints([]);
    setCustomEntryPoint("");

    setSelectedFields([]);
    setCustomFields([]);
    setCustomField("");

    setCollectorRoles([]);
    setDataSubjectTypes([]);
    setCollectionFormats([]);
    setStorageLocations([]);
    setStorageEnvironments([]);
    setEncryptionStatuses([]);
    setAccessRoles([]);
    setSharingStatuses([]);
    setRetentionPeriods([]);
    setDeletionMethods([]);
    setPrivacyNotices([]);
    setConsentStatuses([]);
    setParentalConsentStatuses([]);
    setCrossBorderTransfers([]);

    setRiskResult(null);
    setResidualRiskDecisions([]);
  }

  function resetFromBusinessType() {
    setProcessId("");

    setSelectedEntryPoints([]);
    setCustomEntryPoints([]);
    setCustomEntryPoint("");

    setSelectedFields([]);
    setCustomFields([]);
    setCustomField("");

    setCollectorRoles([]);
    setDataSubjectTypes([]);
    setCollectionFormats([]);
    setStorageLocations([]);
    setStorageEnvironments([]);
    setEncryptionStatuses([]);
    setAccessRoles([]);
    setSharingStatuses([]);
    setRetentionPeriods([]);
    setDeletionMethods([]);
    setPrivacyNotices([]);
    setConsentStatuses([]);
    setParentalConsentStatuses([]);
    setCrossBorderTransfers([]);

    setRiskResult(null);
    setResidualRiskDecisions([]);
  }

  function resetFromProcess() {
    setSelectedEntryPoints([]);
    setCustomEntryPoints([]);
    setCustomEntryPoint("");

    setSelectedFields([]);
    setCustomFields([]);
    setCustomField("");

    setCollectorRoles([]);
    setDataSubjectTypes([]);
    setCollectionFormats([]);
    setStorageLocations([]);
    setStorageEnvironments([]);
    setEncryptionStatuses([]);
    setAccessRoles([]);
    setSharingStatuses([]);
    setRetentionPeriods([]);
    setDeletionMethods([]);
    setPrivacyNotices([]);
    setConsentStatuses([]);
    setParentalConsentStatuses([]);
    setCrossBorderTransfers([]);

    setRiskResult(null);
    setResidualRiskDecisions([]);
  }

  /*
   * =========================================================
   * RUN PRIVACY RISK ASSESSMENT
   * =========================================================
   */

  function runPrivacyRiskAssessment() {
    const result =
      calculatePrivacyRisk({
        selectedEntryPoints,
        customEntryPoints,

        selectedFields,
        customFields,

        collectorRoles,
        dataSubjectTypes,

        collectionFormats,

        storageLocations,
        storageEnvironments,

        encryptionStatuses,

        accessRoles,

        sharingStatuses,

        retentionPeriods,

        deletionMethods,

        privacyNotices,

        consentStatuses,

        parentalConsentStatuses,

        crossBorderTransfers,
      });

    setRiskResult(result);
    setResidualRiskDecisions([]);

    setTimeout(() => {
      document
        .getElementById(
          "privacy-risk-result"
        )
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  }

  /*
   * =========================================================
   * PAGE
   * =========================================================
   */

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "60px 24px",
        fontFamily:
          "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <p
          style={{
            fontSize: "13px",
            fontWeight: 700,
            letterSpacing: "3px",
            color: "#1d4ed8",
          }}
        >
          PRIVACYMAP INDIA
        </p>

        <h1
          style={{
            fontSize: "42px",
            color: "#0f172a",
            marginBottom: "12px",
          }}
        >
          Privacy Assessment
        </h1>

        <p
          style={{
            color: "#475569",
            fontSize: "18px",
            lineHeight: 1.6,
            marginBottom: "40px",
          }}
        >
          Identify where personal data
          enters your organisation, what
          information is collected, how it
          is handled and where privacy
          risks may exist.
        </p>

        {/* =================================================
            STEP 1
            ================================================= */}

        <section style={cardStyle}>
          <StepNumber number="1" />

          <h2 style={headingStyle}>
            Select your industry
          </h2>

          <select
            value={industryId}
            onChange={(event) => {
              setIndustryId(
                event.target.value
              );
              resetAssessment();
            }}
            style={selectStyle}
          >
            <option value="">
              Select industry...
            </option>

            {kb.industries
              .filter(
                (item) =>
                  item.status ===
                  "active"
              )
              .map((industry) => (
                <option
                  key={industry.id}
                  value={industry.id}
                >
                  {industry.name}
                </option>
              ))}
          </select>
        </section>

        {/* =================================================
            STEP 2
            ================================================= */}

        {industryId && (
          <section
            style={cardStyle}
          >
            <StepNumber number="2" />

            <h2
              style={headingStyle}
            >
              Select your business type
            </h2>

            <select
              value={businessTypeId}
              onChange={(event) => {
                setBusinessTypeId(
                  event.target.value
                );
                resetFromBusinessType();
              }}
              style={selectStyle}
            >
              <option value="">
                Select business type...
              </option>

              {businessTypes.map(
                (businessType) => (
                  <option
                    key={
                      businessType.id
                    }
                    value={
                      businessType.id
                    }
                  >
                    {
                      businessType.name
                    }
                  </option>
                )
              )}
            </select>

            {businessTypes.length ===
              0 && (
              <p
                style={
                  noticeStyle
                }
              >
                A detailed assessment
                pack for this business
                type is not available
                yet. More sector packs
                will be added
                progressively.
              </p>
            )}
          </section>
        )}

        {/* =================================================
            STEP 3
            ================================================= */}

        {businessTypeId ===
          "EDU-SCH" && (
          <section
            style={cardStyle}
          >
            <StepNumber number="3" />

            <h2
              style={headingStyle}
            >
              Select a business process
            </h2>

            <select
              value={processId}
              onChange={(event) => {
                setProcessId(
                  event.target.value
                );
                resetFromProcess();
              }}
              style={selectStyle}
            >
              <option value="">
                All school processes...
              </option>

              {processes.map(
                (process) => (
                  <option
                    key={process.id}
                    value={process.id}
                  >
                    {process.name}
                  </option>
                )
              )}
            </select>
          </section>
        )}

        {/* =================================================
            STEP 4
            ================================================= */}

        {businessTypeId ===
          "EDU-SCH" && (
          <section
            style={cardStyle}
          >
            <StepNumber number="4" />

            <h2
              style={headingStyle}
            >
              Potential data entry points
            </h2>

            <p
              style={{
                ...noticeStyle,
                marginBottom: "20px",
              }}
            >
              Select all channels
              through which your
              organisation may collect
              personal data.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "12px",
              }}
            >
              {entryPoints.map(
                (entryPoint) => {
                  const isSelected =
                    selectedEntryPoints.includes(
                      entryPoint.id
                    );

                  return (
                    <label
                      key={
                        entryPoint.id
                      }
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "flex-start",
                        gap: "12px",
                        padding:
                          "16px",
                        border:
                          isSelected
                            ? "2px solid #1d4ed8"
                            : "1px solid #e2e8f0",
                        borderRadius:
                          "10px",
                        background:
                          isSelected
                            ? "#eff6ff"
                            : "#f8fafc",
                        cursor:
                          "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={
                          isSelected
                        }
                        onChange={() =>
                          toggleEntryPoint(
                            entryPoint.id
                          )
                        }
                        style={{
                          marginTop:
                            "3px",
                          width:
                            "18px",
                          height:
                            "18px",
                        }}
                      />

                      <span>
                        <strong>
                          {
                            entryPoint.name
                          }
                        </strong>

                        <span
                          style={{
                            display:
                              "block",
                            fontSize:
                              "13px",
                            color:
                              "#64748b",
                            marginTop:
                              "5px",
                          }}
                        >
                          {
                            entryPoint.collection_method
                          }
                        </span>
                      </span>
                    </label>
                  );
                }
              )}
            </div>

            <div
              style={{
                marginTop: "24px",
                paddingTop: "20px",
                borderTop:
                  "1px solid #e2e8f0",
              }}
            >
              <h3
                style={{
                  color: "#0f172a",
                  fontSize: "17px",
                }}
              >
                Don't see your data
                entry point?
              </h3>

              <p
                style={
                  noticeStyle
                }
              >
                Add a custom channel
                used by your
                organisation.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "12px",
                  flexWrap:
                    "wrap",
                }}
              >
                <input
                  type="text"
                  value={
                    customEntryPoint
                  }
                  onChange={(event) =>
                    setCustomEntryPoint(
                      event.target.value
                    )
                  }
                  placeholder="e.g. Admission kiosk"
                  style={{
                    flex:
                      "1 1 300px",
                    padding:
                      "12px 14px",
                    borderRadius:
                      "8px",
                    border:
                      "1px solid #cbd5e1",
                    fontSize:
                      "15px",
                  }}
                />

                <button
                  type="button"
                  onClick={
                    addCustomEntryPoint
                  }
                  style={
                    secondaryButtonStyle
                  }
                >
                  Add
                </button>
              </div>

              {customEntryPoints.length >
                0 && (
                <div
                  style={{
                    marginTop:
                      "16px",
                  }}
                >
                  {customEntryPoints.map(
                    (
                      entryPoint
                    ) => (
                      <div
                        key={
                          entryPoint.id
                        }
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "space-between",
                          padding:
                            "12px 14px",
                          marginBottom:
                            "8px",
                          background:
                            "#f8fafc",
                          border:
                            "1px solid #e2e8f0",
                          borderRadius:
                            "8px",
                        }}
                      >
                        <strong>
                          {
                            entryPoint.name
                          }
                        </strong>

                        <button
                          type="button"
                          onClick={() =>
                            removeCustomEntryPoint(
                              entryPoint.id
                            )
                          }
                          style={
                            removeButtonStyle
                          }
                        >
                          Remove
                        </button>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {(selectedEntryPoints.length >
              0 ||
              customEntryPoints.length >
                0) && (
              <SelectionSummary
                count={
                  selectedEntryPoints.length +
                  customEntryPoints.length
                }
                label="data entry point"
              />
            )}
          </section>
        )}

        {/* =================================================
            STEP 5
            ================================================= */}

        {businessTypeId ===
          "EDU-SCH" &&
          (selectedEntryPoints.length >
            0 ||
            customEntryPoints.length >
              0) && (
            <section
              style={cardStyle}
            >
              <StepNumber number="5" />

              <h2
                style={headingStyle}
              >
                What personal data is
                collected?
              </h2>

              <p
                style={{
                  ...noticeStyle,
                  marginBottom:
                    "20px",
                }}
              >
                Select all personal-data
                fields that your
                organisation collects.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "12px",
                }}
              >
                {kb.school.fields.map(
                  (field) => {
                    const isSelected =
                      selectedFields.includes(
                        field.id
                      );

                    return (
                      <label
                        key={
                          field.id
                        }
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "flex-start",
                          gap: "12px",
                          padding:
                            "16px",
                          border:
                            isSelected
                              ? "2px solid #1d4ed8"
                              : "1px solid #e2e8f0",
                          borderRadius:
                            "10px",
                          background:
                            isSelected
                              ? "#eff6ff"
                              : "#f8fafc",
                          cursor:
                            "pointer",
                        }}
                      >
                        <input
                          type="checkbox"
                          checked={
                            isSelected
                          }
                          onChange={() =>
                            toggleField(
                              field.id
                            )
                          }
                          style={{
                            marginTop:
                              "3px",
                            width:
                              "18px",
                            height:
                              "18px",
                          }}
                        />

                        <span>
                          <strong>
                            {
                              field.name
                            }
                          </strong>

                          <span
                            style={{
                              display:
                                "block",
                              fontSize:
                                "12px",
                              color:
                                "#64748b",
                              marginTop:
                                "5px",
                            }}
                          >
                            {field.data_categories.join(
                              ", "
                            )}
                          </span>

                          <span
                            style={{
                              display:
                                "block",
                              fontSize:
                                "12px",
                              color:
                                field.child_relevant
                                  ? "#b45309"
                                  : "#64748b",
                              marginTop:
                                "4px",
                            }}
                          >
                            Data subject:{" "}
                            {field.typical_data_subjects.join(
                              ", "
                            )}
                            {field.child_relevant
                              ? " • Child-relevant"
                              : ""}
                          </span>
                        </span>
                      </label>
                    );
                  }
                )}
              </div>

              <div
                style={{
                  marginTop: "24px",
                  paddingTop: "20px",
                  borderTop:
                    "1px solid #e2e8f0",
                }}
              >
                <h3
                  style={{
                    color: "#0f172a",
                    fontSize: "17px",
                  }}
                >
                  Don't see your data
                  field?
                </h3>

                <p
                  style={
                    noticeStyle
                  }
                >
                  Add a custom
                  personal-data field.
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "12px",
                    flexWrap:
                      "wrap",
                  }}
                >
                  <input
                    type="text"
                    value={
                      customField
                    }
                    onChange={(event) =>
                      setCustomField(
                        event.target.value
                      )
                    }
                    placeholder="e.g. Previous School Name"
                    style={{
                      flex:
                        "1 1 300px",
                      padding:
                        "12px 14px",
                      borderRadius:
                        "8px",
                      border:
                        "1px solid #cbd5e1",
                      fontSize:
                        "15px",
                    }}
                  />

                  <button
                    type="button"
                    onClick={
                      addCustomField
                    }
                    style={
                      secondaryButtonStyle
                    }
                  >
                    Add
                  </button>
                </div>

                {customFields.length >
                  0 && (
                  <div
                    style={{
                      marginTop:
                        "16px",
                    }}
                  >
                    {customFields.map(
                      (field) => (
                        <div
                          key={
                            field.id
                          }
                          style={{
                            display:
                              "flex",
                            justifyContent:
                              "space-between",
                            alignItems:
                              "center",
                            padding:
                              "12px 14px",
                            marginBottom:
                              "8px",
                            background:
                              "#f8fafc",
                            border:
                              "1px solid #e2e8f0",
                            borderRadius:
                              "8px",
                          }}
                        >
                          <strong>
                            {
                              field.name
                            }
                          </strong>

                          <button
                            type="button"
                            onClick={() =>
                              removeCustomField(
                                field.id
                              )
                            }
                            style={
                              removeButtonStyle
                            }
                          >
                            Remove
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {(selectedFields.length >
                0 ||
                customFields.length >
                  0) && (
                <SelectionSummary
                  count={
                    selectedFields.length +
                    customFields.length
                  }
                  label="data field"
                />
              )}
            </section>
          )}

        {/* =================================================
            STEP 6
            ================================================= */}

        {businessTypeId ===
          "EDU-SCH" &&
          selectedFields.length >
            0 && (
            <section
              style={cardStyle}
            >
              <StepNumber number="6" />

              <h2
                style={headingStyle}
              >
                How is this personal data
                collected and handled?
              </h2>

              <p
                style={{
                  ...noticeStyle,
                  marginBottom:
                    "24px",
                }}
              >
                Select all options that
                apply. Real-world
                processes often use
                multiple people, channels
                and storage locations.
              </p>

              <MultiSelectField
                label="Who collects this data?"
                values={
                  collectorRoles
                }
                options={[
                  "Admissions Executive",
                  "Teacher",
                  "Class Teacher",
                  "Administrative Staff",
                  "Accounts Staff",
                  "HR / HR Administrator",
                  "IT / System Administrator",
                  "Principal / Management",
                  "Reception / Front Desk",
                  "Third-party Service Provider",
                  "Other",
                ]}
                onToggle={(value) =>
                  toggleArrayValue(
                    value,
                    setCollectorRoles
                  )
                }
              />

              <MultiSelectField
                label="Who is the data subject?"
                values={
                  dataSubjectTypes
                }
                options={[
                  "Student",
                  "Parent / Guardian",
                  "Employee",
                  "Teacher",
                  "Visitor",
                  "Vendor / Service Provider",
                  "Other",
                ]}
                onToggle={(value) =>
                  toggleArrayValue(
                    value,
                    setDataSubjectTypes
                  )
                }
              />

              <MultiSelectField
                label="How is the data collected?"
                values={
                  collectionFormats
                }
                options={[
                  "Website Form",
                  "Google Form",
                  "Mobile / School App",
                  "WhatsApp",
                  "Email",
                  "Telephone",
                  "Paper / Physical Form",
                  "In Person / Verbal",
                  "Excel / Spreadsheet",
                  "Other",
                ]}
                onToggle={(value) =>
                  toggleArrayValue(
                    value,
                    setCollectionFormats
                  )
                }
              />

              <MultiSelectField
                label="Where is the data stored?"
                values={
                  storageLocations
                }
                options={[
                  "School Management System",
                  "Student Information System",
                  "CRM",
                  "Google Drive",
                  "Microsoft 365 / SharePoint",
                  "Excel / Spreadsheet",
                  "Email Mailbox",
                  "WhatsApp Account",
                  "Local Computer",
                  "Paper File / Physical Record",
                  "Third-party Vendor System",
                  "Other",
                  "Unknown",
                ]}
                onToggle={(value) =>
                  toggleArrayValue(
                    value,
                    setStorageLocations
                  )
                }
              />

              <MultiSelectField
                label="Where is the storage environment?"
                values={
                  storageEnvironments
                }
                options={[
                  "Cloud",
                  "On-Premises",
                  "Employee Device",
                  "Mobile Device",
                  "Physical Storage",
                  "Third-party Hosted",
                  "Unknown",
                ]}
                onToggle={(value) =>
                  toggleArrayValue(
                    value,
                    setStorageEnvironments
                  )
                }
              />

              <MultiSelectField
                label="How is the stored data protected?"
                values={
                  encryptionStatuses
                }
                options={[
                  "Encrypted at rest and in transit",
                  "Encrypted at rest only",
                  "Encrypted in transit only",
                  "Clear text / Not encrypted",
                  "Unknown",
                ]}
                onToggle={(value) =>
                  toggleArrayValue(
                    value,
                    setEncryptionStatuses
                  )
                }
              />

              <MultiSelectField
                label="Who can access the data?"
                values={
                  accessRoles
                }
                options={[
                  "Admissions Executive",
                  "Teacher",
                  "Class Teacher",
                  "Administrative Staff",
                  "Accounts Staff",
                  "HR / HR Administrator",
                  "IT / System Administrator",
                  "Principal / Management",
                  "Reception / Front Desk",
                  "Third-party Service Provider",
                  "Other",
                ]}
                onToggle={(value) =>
                  toggleArrayValue(
                    value,
                    setAccessRoles
                  )
                }
              />

              <MultiSelectField
                label="Is the data shared with anyone else?"
                values={
                  sharingStatuses
                }
                options={[
                  "No external sharing",
                  "Shared internally only",
                  "Shared with service provider",
                  "Shared with multiple third parties",
                  "Unknown",
                ]}
                onToggle={(value) =>
                  toggleArrayValue(
                    value,
                    setSharingStatuses
                  )
                }
              />

              <MultiSelectField
                label="How long is the data retained?"
                values={
                  retentionPeriods
                }
                options={[
                  "Less than 30 days",
                  "30 days – 1 year",
                  "1 – 3 years",
                  "3 – 5 years",
                  "More than 5 years",
                  "Indefinitely",
                  "No defined retention period",
                  "Unknown",
                ]}
                onToggle={(value) =>
                  toggleArrayValue(
                    value,
                    setRetentionPeriods
                  )
                }
              />

              <MultiSelectField
                label="How is the data deleted?"
                values={
                  deletionMethods
                }
                options={[
                  "Automatic deletion",
                  "Manual deletion",
                  "Periodic review and deletion",
                  "On request",
                  "No defined deletion process",
                  "Unknown",
                ]}
                onToggle={(value) =>
                  toggleArrayValue(
                    value,
                    setDeletionMethods
                  )
                }
              />

              <MultiSelectField
                label="Is a privacy notice provided?"
                values={
                  privacyNotices
                }
                options={[
                  "Yes",
                  "No",
                  "Partially",
                  "Unknown",
                ]}
                onToggle={(value) =>
                  toggleArrayValue(
                    value,
                    setPrivacyNotices
                  )
                }
              />

              <MultiSelectField
                label="Is consent obtained where required?"
                values={
                  consentStatuses
                }
                options={[
                  "Yes",
                  "No",
                  "Partially",
                  "Not applicable / Other lawful basis",
                  "Unknown",
                ]}
                onToggle={(value) =>
                  toggleArrayValue(
                    value,
                    setConsentStatuses
                  )
                }
              />

              <MultiSelectField
                label="For minors, is parent / guardian involvement addressed?"
                values={
                  parentalConsentStatuses
                }
                options={[
                  "Yes",
                  "No",
                  "Partially",
                  "Not applicable",
                  "Unknown",
                ]}
                onToggle={(value) =>
                  toggleArrayValue(
                    value,
                    setParentalConsentStatuses
                  )
                }
              />

              <MultiSelectField
                label="Is the data transferred outside India?"
                values={
                  crossBorderTransfers
                }
                options={[
                  "No",
                  "Yes",
                  "Unknown",
                ]}
                onToggle={(value) =>
                  toggleArrayValue(
                    value,
                    setCrossBorderTransfers
                  )
                }
              />

              <div
                style={{
                  marginTop: "28px",
                  padding: "16px",
                  background:
                    "#f8fafc",
                  border:
                    "1px solid #e2e8f0",
                  borderRadius: "10px",
                  color: "#475569",
                  lineHeight: 1.6,
                }}
              >
                <strong>
                  Assessment guidance:
                </strong>{" "}
                Select all options that
                apply. If you don't know
                the answer, select{" "}
                <strong>
                  Unknown
                </strong>
                .
              </div>
            </section>
          )}

        {/* =================================================
            STEP 7
            ================================================= */}

        {businessTypeId ===
          "EDU-SCH" &&
          selectedFields.length >
            0 && (
            <section
              style={cardStyle}
            >
              <StepNumber number="7" />

              <h2
                style={headingStyle}
              >
                Privacy Risk Assessment
              </h2>

              <p
                style={{
                  ...noticeStyle,
                  marginBottom:
                    "24px",
                }}
              >
                PrivacyMap will analyse
                the information entered
                above and identify
                potential privacy,
                security and governance
                risks.
              </p>

              <div
                style={{
                  padding: "20px",
                  background:
                    "#eff6ff",
                  border:
                    "1px solid #bfdbfe",
                  borderRadius:
                    "12px",
                  marginBottom:
                    "20px",
                  color:
                    "#1e3a8a",
                  lineHeight: 1.6,
                }}
              >
                <strong>
                  Important:
                </strong>{" "}
                This is a preliminary
                privacy-risk assessment
                based on the information
                provided. It is not a
                legal opinion or a
                determination of DPDPA
                compliance.
              </div>

              <button
                type="button"
                onClick={
                  runPrivacyRiskAssessment
                }
                style={{
                  width: "100%",
                  padding: "16px",
                  border: "none",
                  borderRadius:
                    "10px",
                  background:
                    "#1d4ed8",
                  color: "white",
                  fontSize:
                    "17px",
                  fontWeight: 700,
                  cursor:
                    "pointer",
                }}
              >
                Analyse Privacy Risks
              </button>
            </section>
          )}

        {/* =================================================
            STEP 7 OUTPUT
            ================================================= */}

        {riskResult && (
          <div
            id="privacy-risk-result"
          >
            <RiskDashboard
              result={riskResult}
            />
          </div>
        )}

        {/* =================================================
            STEP 8
            ================================================= */}

        {riskResult &&
          treatmentPlan.length > 0 && (
            <RiskTreatmentPlan
              plan={treatmentPlan}
            />
          )}

        {/* =================================================
            STEP 9 - RESIDUAL RISK + DECISION
            ================================================= */}

        {riskResult &&
          treatmentPlan.length > 0 &&
          residualRiskAssessments.length >
            0 && (
            <ResidualRiskDashboard
              assessments={
                residualRiskAssessments
              }
              summary={
                residualRiskSummary
              }
              decisions={
                residualRiskDecisions
              }
              setDecisions={
                setResidualRiskDecisions
              }
            />
          )}

        {/* =================================================
            PRIVACY BY DESIGN
            ================================================= */}

        <div
          style={{
            marginTop: "32px",
            padding:
              "18px 20px",
            background:
              "#eff6ff",
            border:
              "1px solid #bfdbfe",
            borderRadius:
              "10px",
            color:
              "#1e3a8a",
            lineHeight: 1.6,
          }}
        >
          <strong>
            Privacy-by-design:
          </strong>{" "}
          PrivacyMap does not require
          your customers' personal
          data. Assessment responses
          remain in your browser and
          are used locally to generate
          assessment results and
          reports.
        </div>
      </div>
    </main>
  );
}

/*
 * =========================================================
 * RISK DASHBOARD
 * =========================================================
 */

function RiskDashboard({
  result,
}: {
  result: RiskResult;
}) {
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
          border:
            "1px solid #e2e8f0",
          borderRadius: "14px",
          padding: "28px",
        }}
      >
        <h2
          style={{
            color: "#0f172a",
            marginTop: 0,
          }}
        >
          Privacy Risk Dashboard
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginTop: "20px",
          }}
        >
          <div
            style={{
              padding: "22px",
              borderRadius:
                "12px",
              background:
                riskBackground(
                  result.overallLevel
                ),
            }}
          >
            <div
              style={{
                fontSize:
                  "13px",
                fontWeight: 700,
                color:
                  "#475569",
              }}
            >
              OVERALL RISK
            </div>

            <div
              style={{
                fontSize:
                  "32px",
                fontWeight: 800,
                marginTop:
                  "8px",
                color:
                  riskColor(
                    result.overallLevel
                  ),
              }}
            >
              {
                result.overallLevel
              }
            </div>

            <div
              style={{
                marginTop:
                  "5px",
                color:
                  "#475569",
              }}
            >
              Risk score:{" "}
              {result.score}
              /100
            </div>
          </div>

          <div
            style={{
              padding: "22px",
              borderRadius:
                "12px",
              background:
                "#f8fafc",
            }}
          >
            <div
              style={{
                fontSize:
                  "13px",
                fontWeight: 700,
                color:
                  "#475569",
              }}
            >
              FINDINGS
            </div>

            <div
              style={{
                fontSize:
                  "32px",
                fontWeight: 800,
                marginTop:
                  "8px",
                color:
                  "#0f172a",
              }}
            >
              {
                result.findings
                  .length
              }
            </div>

            <div
              style={{
                marginTop:
                  "5px",
                color:
                  "#475569",
              }}
            >
              Potential issues
              identified
            </div>
          </div>
        </div>

        <h3
          style={{
            marginTop:
              "32px",
            color:
              "#0f172a",
          }}
        >
          Risk by category
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "12px",
          }}
        >
          {result.categoryScores.map(
            (category) => (
              <div
                key={
                  category.category
                }
                style={{
                  padding:
                    "16px",
                  border:
                    "1px solid #e2e8f0",
                  borderRadius:
                    "10px",
                }}
              >
                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                    gap:
                      "10px",
                  }}
                >
                  <strong>
                    {
                      category.category
                    }
                  </strong>

                  <strong
                    style={{
                      color:
                        riskColor(
                          category.level
                        ),
                    }}
                  >
                    {
                      category.level
                    }
                  </strong>
                </div>

                <div
                  style={{
                    marginTop:
                      "10px",
                    height:
                      "8px",
                    background:
                      "#e2e8f0",
                    borderRadius:
                      "20px",
                    overflow:
                      "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${category.score}%`,
                      height:
                        "100%",
                      background:
                        riskColor(
                          category.level
                        ),
                    }}
                  />
                </div>

                <div
                  style={{
                    marginTop:
                      "6px",
                    fontSize:
                      "12px",
                    color:
                      "#64748b",
                  }}
                >
                  {
                    category.score
                  }
                  /100
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* FINDINGS */}

      <div
        style={{
          background:
            "white",
          border:
            "1px solid #e2e8f0",
          borderRadius:
            "14px",
          padding:
            "28px",
          marginTop:
            "20px",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            color:
              "#0f172a",
          }}
        >
          Key Privacy Findings
        </h2>

        {result.findings
          .length === 0 ? (
          <div
            style={{
              padding:
                "18px",
              background:
                "#f0fdf4",
              border:
                "1px solid #bbf7d0",
              borderRadius:
                "10px",
              color:
                "#166534",
            }}
          >
            No significant
            privacy risk
            signals were
            identified from
            the information
            provided.
          </div>
        ) : (
          result.findings.map(
            (finding) => (
              <div
                key={
                  finding.id
                }
                style={{
                  padding:
                    "20px",
                  marginBottom:
                    "14px",
                  border:
                    "1px solid #e2e8f0",
                  borderRadius:
                    "10px",
                }}
              >
                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "flex-start",
                    gap:
                      "15px",
                    flexWrap:
                      "wrap",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize:
                          "12px",
                        fontWeight:
                          700,
                        color:
                          "#64748b",
                        textTransform:
                          "uppercase",
                        letterSpacing:
                          "1px",
                      }}
                    >
                      {
                        finding.category
                      }
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
                        finding.title
                      }
                    </h3>
                  </div>

                  <span
                    style={{
                      padding:
                        "6px 10px",
                      borderRadius:
                        "20px",
                      background:
                        riskBackground(
                          finding.level
                        ),
                      color:
                        riskColor(
                          finding.level
                        ),
                      fontWeight:
                        700,
                      fontSize:
                        "12px",
                    }}
                  >
                    {
                      finding.level
                    }
                  </span>
                </div>

                <p
                  style={{
                    color:
                      "#475569",
                    lineHeight:
                      1.6,
                  }}
                >
                  {
                    finding.explanation
                  }
                </p>

                <div
                  style={{
                    padding:
                      "14px",
                    background:
                      "#f8fafc",
                    borderRadius:
                      "8px",
                    color:
                      "#334155",
                    lineHeight:
                      1.6,
                  }}
                >
                  <strong>
                    Recommended
                    action:
                  </strong>{" "}
                  {
                    finding.recommendation
                  }
                </div>
              </div>
            )
          )
        )}
      </div>
    </section>
  );
}

/*
 * =========================================================
 * STEP 8 - RISK TREATMENT PLAN
 * =========================================================
 */

function RiskTreatmentPlan({
  plan,
}: {
  plan: RiskTreatmentAction[];
}) {
  const [actions, setActions] =
    useState<RiskTreatmentAction[]>(
      plan
    );

  useEffect(() => {
    setActions(plan);
  }, [plan]);

  function TreatmentSummaryCard({
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
          border:
            "1px solid #e2e8f0",
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

  function TreatmentMeta({
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
            textTransform:
              "uppercase",
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

  function RiskBadge({
    label,
    level,
  }: {
    label: string;
    level: RiskLevel;
  }) {
    return (
      <span
        style={{
          padding: "6px 10px",
          borderRadius: "20px",
          background:
            riskBackground(level),
          color:
            riskColor(level),
          fontWeight: 700,
          fontSize: "12px",
        }}
      >
        {label}
      </span>
    );
  }

  function PriorityBadge({
    priority,
  }: {
    priority:
      | "Immediate"
      | "High"
      | "Medium"
      | "Low";
  }) {
    const level: RiskLevel =
      priority === "Immediate"
        ? "Critical"
        : priority === "High"
        ? "High"
        : priority === "Medium"
        ? "Medium"
        : "Low";

    return (
      <span
        style={{
          padding: "6px 10px",
          borderRadius: "20px",
          background:
            riskBackground(level),
          color:
            riskColor(level),
          fontWeight: 700,
          fontSize: "12px",
        }}
      >
        {priority} Priority
      </span>
    );
  }

  function updateStatus(
    id: string,
    status: TreatmentStatus
  ) {
    setActions((current) =>
      current.map((action) =>
        action.id === id
          ? {
              ...action,
              status,
            }
          : action
      )
    );
  }

  const immediateCount =
    actions.filter(
      (action) =>
        action.priority === "Immediate"
    ).length;

  const highCount =
    actions.filter(
      (action) =>
        action.priority === "High"
    ).length;

  const completedCount =
    actions.filter(
      (action) =>
        action.status === "Completed"
    ).length;

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
          STEP 8
        </div>

        <h2
          style={{
            marginTop: 0,
            color: "#0f172a",
          }}
        >
          Risk Treatment & Action Plan
        </h2>

        <p
          style={{
            color: "#64748b",
            lineHeight: 1.6,
            maxWidth: "720px",
          }}
        >
          Convert the privacy risks identified
          in Step 7 into practical remediation
          actions, ownership, target timeframes
          and treatment status.
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
          <TreatmentSummaryCard
            label="TOTAL ACTIONS"
            value={actions.length}
          />

          <TreatmentSummaryCard
            label="IMMEDIATE"
            value={immediateCount}
            level="Critical"
          />

          <TreatmentSummaryCard
            label="HIGH PRIORITY"
            value={highCount}
            level="High"
          />

          <TreatmentSummaryCard
            label="COMPLETED"
            value={completedCount}
            level="Low"
          />
        </div>
      </div>

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
          Recommended Risk Treatments
        </h2>

        {actions.map((action) => (
          <div
            key={action.id}
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
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                  flexWrap: "wrap",
                }}
              >
                <RiskBadge
                  label={action.riskLevel}
                  level={
                    action.riskLevel
                  }
                />

                <PriorityBadge
                  priority={
                    action.priority
                  }
                />
              </div>
            </div>

            <div
              style={{
                marginTop: "18px",
                padding: "16px",
                background: "#eff6ff",
                border:
                  "1px solid #bfdbfe",
                borderRadius: "10px",
                lineHeight: 1.6,
                color: "#1e3a8a",
              }}
            >
              <strong>
                Recommended treatment
              </strong>

              <div
                style={{
                  marginTop: "6px",
                }}
              >
                {action.action}
              </div>
            </div>

            <div
              style={{
                marginTop: "14px",
                color: "#475569",
                lineHeight: 1.6,
              }}
            >
              <strong>
                Why this matters:
              </strong>{" "}
              {action.rationale}
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
              <TreatmentMeta
                label="Suggested owner"
                value={
                  action.suggestedOwner
                }
              />

              <TreatmentMeta
                label="Suggested timeframe"
                value={
                  action.suggestedTimeframe
                }
              />

              <TreatmentMeta
                label="Estimated effort"
                value={
                  action.effort
                }
              />

              <TreatmentMeta
                label="Evidence expected"
                value={
                  action.evidence
                }
              />
            </div>

            <div
              style={{
                marginTop: "18px",
                paddingTop: "18px",
                borderTop:
                  "1px solid #e2e8f0",
                display: "flex",
                alignItems: "center",
                gap: "12px",
                flexWrap: "wrap",
              }}
            >
              <strong
                style={{
                  color: "#0f172a",
                }}
              >
                Treatment status
              </strong>

              <select
                value={action.status}
                onChange={(event) =>
                  updateStatus(
                    action.id,
                    event.target
                      .value as TreatmentStatus
                  )
                }
                style={{
                  padding:
                    "9px 12px",
                  border:
                    "1px solid #cbd5e1",
                  borderRadius: "8px",
                  background: "white",
                  color: "#0f172a",
                  fontSize: "14px",
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
        ))}
      </div>

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
          Treatment guidance:
        </strong>{" "}
        The actions, owners and timeframes
        are preliminary risk-management
        recommendations and should be
        reviewed and approved by the
        organisation's appropriate privacy,
        legal, security and business owners.
      </div>
    </section>
  );
}

/*
 * =========================================================
 * STEP 9 - RESIDUAL RISK DASHBOARD
 * =========================================================
 */

function ResidualRiskDashboard({
  assessments,
  summary,
  decisions,
  setDecisions,
}: {
  assessments: ResidualRiskAssessment[];
  summary: ResidualRiskSummary | null;
  decisions: ResidualRiskDecisionRecord[];
  setDecisions: Dispatch<
    SetStateAction<
      ResidualRiskDecisionRecord[]
    >
  >;
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

function ResidualSummaryCard({
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
        border:
          "1px solid #e2e8f0",
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

/*
 * =========================================================
 * DECISION SUMMARY CARD
 * =========================================================
 */

function DecisionSummaryCard({
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
        border:
          "1px solid #e2e8f0",
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

/*
 * =========================================================
 * RESIDUAL META
 * =========================================================
 */

function ResidualMeta({
  label,
  value,
  level,
}: {
  label: string;
  value: string;
  level?: RiskLevel;
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
          textTransform:
            "uppercase",
          marginBottom: "5px",
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: "14px",
          fontWeight:
            level ? 700 : 500,
          color:
            level
              ? riskColor(level)
              : "#334155",
          lineHeight: 1.5,
        }}
      >
        {value}
      </div>
    </div>
  );
}

/*
 * =========================================================
 * MULTI SELECT FIELD
 * =========================================================
 */

function MultiSelectField({
  label,
  values,
  options,
  onToggle,
}: {
  label: string;
  values: string[];
  options: string[];
  onToggle: (
    value: string
  ) => void;
}) {
  return (
    <div
      style={{
        marginBottom:
          "24px",
      }}
    >
      <label
        style={{
          display: "block",
          fontWeight: 700,
          color:
            "#0f172a",
          marginBottom:
            "10px",
        }}
      >
        {label}
      </label>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(240px, 1fr))",
          gap: "8px",
        }}
      >
        {options.map(
          (option) => {
            const selected =
              values.includes(
                option
              );

            return (
              <label
                key={option}
                style={{
                  display:
                    "flex",
                  alignItems:
                    "center",
                  gap: "10px",
                  padding:
                    "11px 12px",
                  border:
                    selected
                      ? "2px solid #1d4ed8"
                      : "1px solid #cbd5e1",
                  borderRadius:
                    "8px",
                  background:
                    selected
                      ? "#eff6ff"
                      : "white",
                  cursor:
                    "pointer",
                }}
              >
                <input
                  type="checkbox"
                  checked={
                    selected
                  }
                  onChange={() =>
                    onToggle(
                      option
                    )
                  }
                  style={{
                    width:
                      "17px",
                    height:
                      "17px",
                  }}
                />

                <span
                  style={{
                    fontSize:
                      "14px",
                    color:
                      "#334155",
                  }}
                >
                  {option}
                </span>
              </label>
            );
          }
        )}
      </div>

      {values.length > 0 && (
        <div
          style={{
            marginTop:
              "8px",
            fontSize:
              "12px",
            color:
              "#64748b",
          }}
        >
          {values.length}{" "}
          selected
        </div>
      )}
    </div>
  );
}

/*
 * =========================================================
 * SUPPORTING COMPONENTS
 * =========================================================
 */

function SelectionSummary({
  count,
  label,
}: {
  count: number;
  label: string;
}) {
  return (
    <div
      style={{
        marginTop:
          "24px",
        padding:
          "16px",
        background:
          "#f0fdf4",
        border:
          "1px solid #bbf7d0",
        borderRadius:
          "10px",
        color:
          "#166534",
      }}
    >
      <strong>
        {count} {label}
        {count !== 1
          ? "s"
          : ""}{" "}
        selected
      </strong>
    </div>
  );
}

function StepNumber({
  number,
}: {
  number: string;
}) {
  return (
    <div
      style={{
        width: "34px",
        height: "34px",
        borderRadius:
          "50%",
        background:
          "#1d4ed8",
        color: "white",
        display:
          "flex",
        alignItems:
          "center",
        justifyContent:
          "center",
        fontWeight: 700,
        marginBottom:
          "16px",
      }}
    >
      {number}
    </div>
  );
}

/*
 * =========================================================
 * RISK HELPERS
 * =========================================================
 */

function riskColor(
  level: RiskLevel
): string {
  switch (level) {
    case "Critical":
      return "#991b1b";

    case "High":
      return "#dc2626";

    case "Medium":
      return "#d97706";

    case "Low":
      return "#15803d";

    default:
      return "#334155";
  }
}

function riskBackground(
  level: RiskLevel
): string {
  switch (level) {
    case "Critical":
      return "#fee2e2";

    case "High":
      return "#fef2f2";

    case "Medium":
      return "#fffbeb";

    case "Low":
      return "#f0fdf4";

    default:
      return "#f8fafc";
  }
}

/*
 * =========================================================
 * APPROVAL HELPERS
 * =========================================================
 */

function approvalColor(
  status: DecisionApprovalStatus
): string {
  switch (status) {
    case "Pending":
      return "#b45309";

    case "Approved":
      return "#15803d";

    case "Rejected":
      return "#b91c1c";

    default:
      return "#334155";
  }
}

function approvalBackground(
  status: DecisionApprovalStatus
): string {
  switch (status) {
    case "Pending":
      return "#fffbeb";

    case "Approved":
      return "#f0fdf4";

    case "Rejected":
      return "#fee2e2";

    default:
      return "#f8fafc";
  }
}

/*
 * =========================================================
 * SHARED STYLES
 * =========================================================
 */

const cardStyle = {
  background:
    "white",
  border:
    "1px solid #e2e8f0",
  borderRadius:
    "14px",
  padding:
    "28px",
  marginBottom:
    "20px",
};

const headingStyle = {
  color:
    "#0f172a",
  marginTop: 0,
  marginBottom:
    "18px",
};

const selectStyle = {
  width: "100%",
  padding:
    "13px 14px",
  borderRadius:
    "8px",
  border:
    "1px solid #cbd5e1",
  background:
    "white",
  fontSize:
    "16px",
  color:
    "#0f172a",
};

const noticeStyle = {
  color:
    "#64748b",
  lineHeight:
    1.6,
};

const secondaryButtonStyle = {
  padding:
    "12px 18px",
  borderRadius:
    "8px",
  border:
    "none",
  background:
    "#0f172a",
  color:
    "white",
  fontWeight: 600,
  cursor:
    "pointer",
};

const removeButtonStyle = {
  border:
    "none",
  background:
    "transparent",
  color:
    "#64748b",
  cursor:
    "pointer",
  fontSize:
    "13px",
};
