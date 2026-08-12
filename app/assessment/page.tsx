"use client";

import {
  defaultResidualRiskDecision,
  defaultDecisionRationale,
  decisionRequiresApproval,
  type ResidualRiskDecision,
  type ResidualRiskDecisionRecord,
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
   * BASIC ASSESSMENT STATE
   * =========================================================
   */

  const [industryId, setIndustryId] = useState("");
  const [businessTypeId, setBusinessTypeId] = useState("");
  const [processId, setProcessId] = useState("");

  const [selectedEntryPoints, setSelectedEntryPoints] =
    useState<string[]>([]);

  const [customEntryPoint, setCustomEntryPoint] =
    useState("");

  const [customEntryPoints, setCustomEntryPoints] =
    useState<
      {
        id: string;
        name: string;
        collection_method: string;
        custom: boolean;
      }[]
    >([]);

  const [selectedFields, setSelectedFields] =
    useState<string[]>([]);

  const [customField, setCustomField] = useState("");

  const [customFields, setCustomFields] =
    useState<
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

  const [collectorRoles, setCollectorRoles] =
    useState<string[]>([]);

  const [dataSubjectTypes, setDataSubjectTypes] =
    useState<string[]>([]);

  const [collectionFormats, setCollectionFormats] =
    useState<string[]>([]);

  const [storageLocations, setStorageLocations] =
    useState<string[]>([]);

  const [storageEnvironments, setStorageEnvironments] =
    useState<string[]>([]);

  const [encryptionStatuses, setEncryptionStatuses] =
    useState<string[]>([]);

  const [accessRoles, setAccessRoles] =
    useState<string[]>([]);

  const [sharingStatuses, setSharingStatuses] =
    useState<string[]>([]);

  const [retentionPeriods, setRetentionPeriods] =
    useState<string[]>([]);

  const [deletionMethods, setDeletionMethods] =
    useState<string[]>([]);

  const [privacyNotices, setPrivacyNotices] =
    useState<string[]>([]);

  const [consentStatuses, setConsentStatuses] =
    useState<string[]>([]);

  const [parentalConsentStatuses, setParentalConsentStatuses] =
    useState<string[]>([]);

  const [crossBorderTransfers, setCrossBorderTransfers] =
    useState<string[]>([]);

  /*
   * =========================================================
   * STEP 7
   * =========================================================
   */

  const [riskResult, setRiskResult] =
    useState<RiskResult | null>(null);

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

      return generateRiskTreatmentPlan(riskResult);
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
    }, [riskResult, treatmentPlan]);

  const residualRiskSummary =
    useMemo<ResidualRiskSummary | null>(() => {
      if (
        residualRiskAssessments.length === 0
      ) {
        return null;
      }

      return generateResidualRiskSummary(
        residualRiskAssessments
      );
    }, [residualRiskAssessments]);

  /*
   * =========================================================
   * STEP 10 - RESIDUAL RISK DECISIONS
   *
   * This was the major missing wiring in the supplied file.
   * =========================================================
   */

  const [residualRiskDecisions, setResidualRiskDecisions] =
    useState<ResidualRiskDecisionRecord[]>([]);

  /*
   * Generate decision records whenever the residual-risk
   * assessment changes.
   *
   * We intentionally preserve an existing user's decision
   * where possible.
   */

  useEffect(() => {
    if (residualRiskAssessments.length === 0) {
      setResidualRiskDecisions([]);
      return;
    }

    setResidualRiskDecisions((current) => {
      return residualRiskAssessments.map((assessment) => {
        const existing = current.find(
          (item) =>
            item.findingId === assessment.findingId
        );

        if (existing) {
          return {
            ...existing,

            residualRisk:
              assessment.residualRisk,

            inherentRisk:
              assessment.inherentRisk,

            treatmentStatus:
              assessment.status === "Completed"
                ? "Completed"
                : existing.treatmentStatus,
          };
        }

        const residualRisk =
          assessment.residualRisk;

        const decision =
          defaultResidualRiskDecision(
            residualRisk
          );

        return {
          id: `DEC-${assessment.findingId}`,

          findingId:
            assessment.findingId,

          riskTitle:
            assessment.findingId,

          category:
            "Privacy Risk",

          inherentRisk:
            assessment.inherentRisk,

          residualRisk,

          decision,

          rationale:
            defaultDecisionRationale(
              decision,
              residualRisk
            ),

          accountableOwner:
            "Risk Owner",

          reviewDate:
            "",

          approvalStatus:
            decisionRequiresApproval(
              decision,
              residualRisk
            )
              ? "Pending"
              : "Approved",

          treatmentStatus:
            assessment.status === "Completed"
              ? "Completed"
              : "Open",
        };
      });
    });
  }, [residualRiskAssessments]);

  /*
   * =========================================================
   * UPDATE RESIDUAL DECISION
   * =========================================================
   */

  function updateResidualDecision(
    id: string,
    decision: ResidualRiskDecision
  ) {
    setResidualRiskDecisions((current) =>
      current.map((record) => {
        if (record.id !== id) {
          return record;
        }

        const requiresApproval =
          decisionRequiresApproval(
            decision,
            record.residualRisk
          );

        return {
          ...record,

          decision,

          rationale:
            defaultDecisionRationale(
              decision,
              record.residualRisk
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
   * =========================================================
   * UPDATE DECISION RATIONALE
   * =========================================================
   */

  function updateDecisionRationale(
    id: string,
    rationale: string
  ) {
    setResidualRiskDecisions((current) =>
      current.map((record) =>
        record.id === id
          ? {
              ...record,
              rationale,
            }
          : record
      )
    );
  }

  /*
   * =========================================================
   * UPDATE ACCOUNTABLE OWNER
   * =========================================================
   */

  function updateDecisionOwner(
    id: string,
    accountableOwner: string
  ) {
    setResidualRiskDecisions((current) =>
      current.map((record) =>
        record.id === id
          ? {
              ...record,
              accountableOwner,
            }
          : record
      )
    );
  }

  /*
   * =========================================================
   * UPDATE REVIEW DATE
   * =========================================================
   */

  function updateDecisionReviewDate(
    id: string,
    reviewDate: string
  ) {
    setResidualRiskDecisions((current) =>
      current.map((record) =>
        record.id === id
          ? {
              ...record,
              reviewDate,
            }
          : record
      )
    );
  }

  /*
   * =========================================================
   * UPDATE TREATMENT STATUS
   * =========================================================
   */

  function updateDecisionTreatmentStatus(
    id: string,
    treatmentStatus: string
  ) {
    setResidualRiskDecisions((current) =>
      current.map((record) =>
        record.id === id
          ? {
              ...record,
              treatmentStatus,
            }
          : record
      )
    );
  }

  /*
   * =========================================================
   * GENERIC MULTISELECT
   * =========================================================
   */

  function toggleArrayValue(
    value: string,
    setter: Dispatch<SetStateAction<string[]>>
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

  function toggleEntryPoint(id: string) {
    setSelectedEntryPoints((current) =>
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

    setCustomEntryPoints((current) => [
      ...current,
      newEntryPoint,
    ]);

    setCustomEntryPoint("");
  }

  function removeCustomEntryPoint(id: string) {
    setCustomEntryPoints((current) =>
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
    setSelectedFields((current) =>
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

    setCustomFields((current) => [
      ...current,
      newField,
    ]);

    setCustomField("");
  }

  function removeCustomField(id: string) {
    setCustomFields((current) =>
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
   * RESET
   * =========================================================
   */

  function resetDecisionState() {
    setResidualRiskDecisions([]);
  }

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

    resetDecisionState();
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

    resetDecisionState();
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

    resetDecisionState();
  }

  /*
   * =========================================================
   * RUN ASSESSMENT
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

        {/* STEP 1 */}

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

        {/* STEP 2 */}

        {industryId && (
          <section style={cardStyle}>
            <StepNumber number="2" />

            <h2 style={headingStyle}>
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
              <p style={noticeStyle}>
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

        {/* STEP 3 */}

        {businessTypeId ===
          "EDU-SCH" && (
          <section style={cardStyle}>
            <StepNumber number="3" />

            <h2 style={headingStyle}>
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

        {/* STEP 4 */}

        {businessTypeId ===
          "EDU-SCH" && (
          <section style={cardStyle}>
            <StepNumber number="4" />

            <h2 style={headingStyle}>
              Potential data entry points
            </h2>

            <p style={noticeStyle}>
              Select all channels through
              which your organisation may
              collect personal data.
            </p>

            <CheckboxGrid
              items={entryPoints.map(
                (item) => ({
                  id: item.id,
                  title: item.name,
                  description:
                    item.collection_method,
                })
              )}
              selected={selectedEntryPoints}
              onToggle={toggleEntryPoint}
            />

            <div style={subsectionStyle}>
              <h3>Don't see your data entry point?</h3>

              <p style={noticeStyle}>
                Add a custom channel used by
                your organisation.
              </p>

              <div style={inputRowStyle}>
                <input
                  value={customEntryPoint}
                  onChange={(event) =>
                    setCustomEntryPoint(
                      event.target.value
                    )
                  }
                  placeholder="e.g. Admission kiosk"
                  style={inputStyle}
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

              {customEntryPoints.map(
                (item) => (
                  <RemovableItem
                    key={item.id}
                    name={item.name}
                    onRemove={() =>
                      removeCustomEntryPoint(
                        item.id
                      )
                    }
                  />
                )
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

        {/* STEP 5 */}

        {businessTypeId ===
          "EDU-SCH" &&
          (selectedEntryPoints.length >
            0 ||
            customEntryPoints.length >
              0) && (
          <section style={cardStyle}>
            <StepNumber number="5" />

            <h2 style={headingStyle}>
              What personal data is collected?
            </h2>

            <p style={noticeStyle}>
              Select all personal-data fields
              that your organisation collects.
            </p>

            <div style={gridStyle}>
              {kb.school.fields.map(
                (field) => {
                  const selected =
                    selectedFields.includes(
                      field.id
                    );

                  return (
                    <label
                      key={field.id}
                      style={{
                        ...checkboxStyle,
                        border:
                          selected
                            ? "2px solid #1d4ed8"
                            : "1px solid #e2e8f0",
                        background:
                          selected
                            ? "#eff6ff"
                            : "#f8fafc",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={selected}
                        onChange={() =>
                          toggleField(
                            field.id
                          )
                        }
                      />

                      <span>
                        <strong>
                          {field.name}
                        </strong>

                        <span
                          style={smallTextStyle}
                        >
                          {field.data_categories.join(
                            ", "
                          )}
                        </span>

                        <span
                          style={{
                            ...smallTextStyle,
                            color:
                              field.child_relevant
                                ? "#b45309"
                                : "#64748b",
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

            <div style={subsectionStyle}>
              <h3>Don't see your data field?</h3>

              <p style={noticeStyle}>
                Add a custom personal-data field.
              </p>

              <div style={inputRowStyle}>
                <input
                  value={customField}
                  onChange={(event) =>
                    setCustomField(
                      event.target.value
                    )
                  }
                  placeholder="e.g. Previous School Name"
                  style={inputStyle}
                />

                <button
                  type="button"
                  onClick={addCustomField}
                  style={
                    secondaryButtonStyle
                  }
                >
                  Add
                </button>
              </div>

              {customFields.map(
                (field) => (
                  <RemovableItem
                    key={field.id}
                    name={field.name}
                    onRemove={() =>
                      removeCustomField(
                        field.id
                      )
                    }
                  />
                )
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

        {/* STEP 6 */}

        {businessTypeId ===
          "EDU-SCH" &&
          selectedFields.length >
            0 && (
          <section style={cardStyle}>
            <StepNumber number="6" />

            <h2 style={headingStyle}>
              How is this personal data
              collected and handled?
            </h2>

            <p style={noticeStyle}>
              Select all options that apply.
              If you don't know the answer,
              select Unknown.
            </p>

            <MultiSelectField
              label="Who collects this data?"
              values={collectorRoles}
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
              values={dataSubjectTypes}
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
              values={collectionFormats}
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
              values={storageLocations}
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
              values={storageEnvironments}
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
              values={encryptionStatuses}
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
              values={accessRoles}
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
              values={sharingStatuses}
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
              values={retentionPeriods}
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
              values={deletionMethods}
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
              values={privacyNotices}
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
              values={consentStatuses}
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
              values={parentalConsentStatuses}
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
              values={crossBorderTransfers}
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
          </section>
        )}

        {/* STEP 7 */}

        {businessTypeId ===
          "EDU-SCH" &&
          selectedFields.length >
            0 && (
          <section style={cardStyle}>
            <StepNumber number="7" />

            <h2 style={headingStyle}>
              Privacy Risk Assessment
            </h2>

            <p style={noticeStyle}>
              PrivacyMap will analyse the
              information entered above and
              identify potential privacy,
              security and governance risks.
            </p>

            <div style={warningStyle}>
              <strong>Important:</strong>{" "}
              This is a preliminary
              privacy-risk assessment based on
              the information provided. It is
              not a legal opinion or a
              determination of DPDPA compliance.
            </div>

            <button
              type="button"
              onClick={
                runPrivacyRiskAssessment
              }
              style={primaryButtonStyle}
            >
              Analyse Privacy Risks
            </button>
          </section>
        )}

        {riskResult && (
          <div id="privacy-risk-result">
            <RiskDashboard result={riskResult} />
          </div>
        )}

        {/* STEP 8 */}

        {riskResult &&
          treatmentPlan.length > 0 && (
          <RiskTreatmentPlan
            plan={treatmentPlan}
          />
        )}

        {/* STEP 9 */}

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
          />
        )}

        {/* STEP 10 */}

        {riskResult &&
          residualRiskDecisions.length >
            0 && (
          <ResidualRiskDecisionDashboard
            decisions={
              residualRiskDecisions
            }
            onDecisionChange={
              updateResidualDecision
            }
            onRationaleChange={
              updateDecisionRationale
            }
            onOwnerChange={
              updateDecisionOwner
            }
            onReviewDateChange={
              updateDecisionReviewDate
            }
            onTreatmentStatusChange={
              updateDecisionTreatmentStatus
            }
          />
        )}

        <div
          style={{
            marginTop: "32px",
            padding: "18px 20px",
            background: "#eff6ff",
            border:
              "1px solid #bfdbfe",
            borderRadius: "10px",
            color: "#1e3a8a",
            lineHeight: 1.6,
          }}
        >
          <strong>
            Privacy-by-design:
          </strong>{" "}
          PrivacyMap does not require your
          customers' personal data. Assessment
          responses remain in your browser and
          are used locally to generate
          assessment results and reports.
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
    <section style={sectionStyle}>
      <div style={panelStyle}>
        <h2 style={panelHeadingStyle}>
          Privacy Risk Dashboard
        </h2>

        <div style={summaryGridStyle}>
          <RiskSummaryCard
            label="OVERALL RISK"
            value={result.overallLevel}
            level={result.overallLevel}
            description={`Risk score: ${result.score}/100`}
          />

          <RiskSummaryCard
            label="FINDINGS"
            value={result.findings.length}
            description="Potential issues identified"
          />
        </div>

        <h3 style={subheadingStyle}>
          Risk by category
        </h3>

        <div style={gridStyle}>
          {result.categoryScores.map(
            (category) => (
              <div
                key={category.category}
                style={metaCardStyle}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                  }}
                >
                  <strong>
                    {category.category}
                  </strong>

                  <strong
                    style={{
                      color:
                        riskColor(
                          category.level
                        ),
                    }}
                  >
                    {category.level}
                  </strong>
                </div>

                <div style={progressBackgroundStyle}>
                  <div
                    style={{
                      width: `${category.score}%`,
                      height: "100%",
                      background:
                        riskColor(
                          category.level
                        ),
                    }}
                  />
                </div>

                <div style={smallMutedStyle}>
                  {category.score}/100
                </div>
              </div>
            )
          )}
        </div>
      </div>

      <div style={panelStyle}>
        <h2 style={panelHeadingStyle}>
          Key Privacy Findings
        </h2>

        {result.findings.length === 0 ? (
          <div style={successStyle}>
            No significant privacy risk
            signals were identified from the
            information provided.
          </div>
        ) : (
          result.findings.map(
            (finding) => (
              <div
                key={finding.id}
                style={findingCardStyle}
              >
                <div style={findingHeaderStyle}>
                  <div>
                    <div
                      style={
                        smallLabelStyle
                      }
                    >
                      {finding.category}
                    </div>

                    <h3
                      style={{
                        margin:
                          "6px 0",
                        color:
                          "#0f172a",
                      }}
                    >
                      {finding.title}
                    </h3>
                  </div>

                  <RiskBadge
                    level={
                      finding.level
                    }
                    label={
                      finding.level
                    }
                  />
                </div>

                <p style={paragraphStyle}>
                  {finding.explanation}
                </p>

                <div style={recommendationStyle}>
                  <strong>
                    Recommended action:
                  </strong>{" "}
                  {finding.recommendation}
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
 * STEP 8 - TREATMENT
 * =========================================================
 */

function RiskTreatmentPlan({
  plan,
}: {
  plan: RiskTreatmentAction[];
}) {
  const [actions, setActions] =
    useState<RiskTreatmentAction[]>(plan);

  useEffect(() => {
    setActions(plan);
  }, [plan]);

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
    <section style={sectionStyle}>
      <div style={panelStyle}>
        <div style={stepLabelStyle}>
          STEP 8
        </div>

        <h2 style={panelHeadingStyle}>
          Risk Treatment & Action Plan
        </h2>

        <p style={paragraphStyle}>
          Convert the privacy risks identified
          in Step 7 into practical remediation
          actions, ownership, target timeframes
          and treatment status.
        </p>

        <div style={summaryGridStyle}>
          <RiskSummaryCard
            label="TOTAL ACTIONS"
            value={actions.length}
          />

          <RiskSummaryCard
            label="IMMEDIATE"
            value={immediateCount}
            level="Critical"
          />

          <RiskSummaryCard
            label="HIGH PRIORITY"
            value={highCount}
            level="High"
          />

          <RiskSummaryCard
            label="COMPLETED"
            value={completedCount}
            level="Low"
          />
        </div>
      </div>

      <div style={panelStyle}>
        <h2 style={panelHeadingStyle}>
          Recommended Risk Treatments
        </h2>

        {actions.map((action) => (
          <div
            key={action.id}
            style={findingCardStyle}
          >
            <div style={findingHeaderStyle}>
              <div>
                <div
                  style={smallLabelStyle}
                >
                  {action.category}
                </div>

                <h3
                  style={{
                    margin:
                      "6px 0",
                  }}
                >
                  {action.riskTitle}
                </h3>
              </div>

              <div
                style={{
                  display: "flex",
                  gap: "8px",
                }}
              >
                <RiskBadge
                  label={
                    action.riskLevel
                  }
                  level={
                    action.riskLevel
                  }
                />

                <RiskBadge
                  label={`${action.priority} Priority`}
                  level={
                    action.priority ===
                    "Immediate"
                      ? "Critical"
                      : action.priority ===
                        "High"
                      ? "High"
                      : action.priority ===
                        "Medium"
                      ? "Medium"
                      : "Low"
                  }
                />
              </div>
            </div>

            <div style={recommendationStyle}>
              <strong>
                Recommended treatment
              </strong>

              <div
                style={{
                  marginTop:
                    "6px",
                }}
              >
                {action.action}
              </div>
            </div>

            <p style={paragraphStyle}>
              <strong>
                Why this matters:
              </strong>{" "}
              {action.rationale}
            </p>

            <div style={metaGridStyle}>
              <Meta
                label="Suggested owner"
                value={
                  action.suggestedOwner
                }
              />

              <Meta
                label="Suggested timeframe"
                value={
                  action.suggestedTimeframe
                }
              />

              <Meta
                label="Estimated effort"
                value={action.effort}
              />

              <Meta
                label="Evidence expected"
                value={
                  action.evidence
                }
              />
            </div>

            <div style={statusRowStyle}>
              <strong>
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
                style={smallSelectStyle}
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
    </section>
  );
}

/*
 * =========================================================
 * STEP 9 - RESIDUAL RISK
 * =========================================================
 */

function ResidualRiskDashboard({
  assessments,
  summary,
}: {
  assessments: ResidualRiskAssessment[];
  summary: ResidualRiskSummary | null;
}) {
  return (
    <section style={sectionStyle}>
      <div style={panelStyle}>
        <div style={stepLabelStyle}>
          STEP 9
        </div>

        <h2 style={panelHeadingStyle}>
          Residual Risk Assessment
        </h2>

        <p style={paragraphStyle}>
          Residual risk represents the level of
          privacy risk that remains after
          considering treatment actions and
          existing control effectiveness.
        </p>

        {summary && (
          <div style={summaryGridStyle}>
            <RiskSummaryCard
              label="TOTAL RISKS"
              value={summary.total}
            />

            <RiskSummaryCard
              label="CRITICAL"
              value={summary.critical}
              level="Critical"
            />

            <RiskSummaryCard
              label="HIGH"
              value={summary.high}
              level="High"
            />

            <RiskSummaryCard
              label="MEDIUM"
              value={summary.medium}
              level="Medium"
            />

            <RiskSummaryCard
              label="LOW"
              value={summary.low}
              level="Low"
            />
          </div>
        )}
      </div>

      <div style={panelStyle}>
        <h2 style={panelHeadingStyle}>
          Residual Risk by Finding
        </h2>

        {assessments.map(
          (assessment) => (
            <div
              key={
                assessment.findingId
              }
              style={findingCardStyle}
            >
              <div style={findingHeaderStyle}>
                <div>
                  <div
                    style={
                      smallLabelStyle
                    }
                  >
                    FINDING
                  </div>

                  <h3>
                    {
                      assessment.findingId
                    }
                  </h3>
                </div>

                <RiskBadge
                  label={`Residual Risk: ${assessment.residualRisk}`}
                  level={
                    assessment.residualRisk
                  }
                />
              </div>

              <div style={metaGridStyle}>
                <Meta
                  label="Inherent Risk"
                  value={
                    assessment.inherentRisk
                  }
                  level={
                    assessment.inherentRisk
                  }
                />

                <Meta
                  label="Control Effectiveness"
                  value={
                    assessment.controlEffectiveness
                  }
                />

                <Meta
                  label="Residual Risk"
                  value={
                    assessment.residualRisk
                  }
                  level={
                    assessment.residualRisk
                  }
                />

                <Meta
                  label="Residual Score"
                  value={`${assessment.residualRiskScore}/100`}
                />

                <Meta
                  label="Status"
                  value={
                    assessment.status
                  }
                />
              </div>

              <div style={neutralBoxStyle}>
                <strong>
                  Residual risk rationale:
                </strong>

                <div>
                  {
                    assessment.residualRiskRationale
                  }
                </div>
              </div>

              <div style={recommendationStyle}>
                <strong>
                  Recommended next action:
                </strong>

                <div>
                  {
                    assessment.recommendedNextAction
                  }
                </div>
              </div>
            </div>
          )
        )}
      </div>
    </section>
  );
}

/*
 * =========================================================
 * STEP 10 - RESIDUAL RISK DECISION & APPROVAL
 * =========================================================
 *
 * This is the key section missing from the supplied file.
 * =========================================================
 */

function ResidualRiskDecisionDashboard({
  decisions,
  onDecisionChange,
  onRationaleChange,
  onOwnerChange,
  onReviewDateChange,
  onTreatmentStatusChange,
}: {
  decisions: ResidualRiskDecisionRecord[];

  onDecisionChange: (
    id: string,
    decision: ResidualRiskDecision
  ) => void;

  onRationaleChange: (
    id: string,
    rationale: string
  ) => void;

  onOwnerChange: (
    id: string,
    owner: string
  ) => void;

  onReviewDateChange: (
    id: string,
    date: string
  ) => void;

  onTreatmentStatusChange: (
    id: string,
    status: string
  ) => void;
}) {
  const pendingApprovalCount =
    decisions.filter(
      (decision) =>
        decision.approvalStatus ===
        "Pending"
    ).length;

  const acceptedCount =
    decisions.filter(
      (decision) =>
        decision.decision ===
        "Accept"
    ).length;

  const treatmentCount =
    decisions.filter(
      (decision) =>
        decision.decision ===
        "Treat"
    ).length;

  return (
    <section style={sectionStyle}>
      <div style={panelStyle}>
        <div style={stepLabelStyle}>
          STEP 10
        </div>

        <h2 style={panelHeadingStyle}>
          Residual Risk Decision & Approval
        </h2>

        <p style={paragraphStyle}>
          Residual risk is not automatically
          considered acceptable merely because
          the calculated risk level is Low or
          Medium. The accountable risk owner
          should explicitly decide how each
          residual risk will be managed.
        </p>

        <div style={warningStyle}>
          <strong>
            Governance principle:
          </strong>{" "}
          Risk calculation and risk acceptance
          are separate decisions. PrivacyMap
          calculates the residual risk; the
          organisation's accountable owner
          decides whether that risk is treated,
          accepted, transferred or avoided.
        </div>

        <div style={summaryGridStyle}>
          <RiskSummaryCard
            label="TOTAL DECISIONS"
            value={decisions.length}
          />

          <RiskSummaryCard
            label="PENDING APPROVAL"
            value={pendingApprovalCount}
            level={
              pendingApprovalCount > 0
                ? "High"
                : "Low"
            }
          />

          <RiskSummaryCard
            label="TREAT"
            value={treatmentCount}
          />

          <RiskSummaryCard
            label="ACCEPT"
            value={acceptedCount}
          />
        </div>
      </div>

      <div style={panelStyle}>
        <h2 style={panelHeadingStyle}>
          Risk Decision Register
        </h2>

        {decisions.map(
          (record) => (
            <div
              key={record.id}
              style={decisionCardStyle}
            >
              <div style={findingHeaderStyle}>
                <div>
                  <div
                    style={
                      smallLabelStyle
                    }
                  >
                    {record.category}
                  </div>

                  <h3
                    style={{
                      margin:
                        "6px 0",
                    }}
                  >
                    {record.riskTitle}
                  </h3>

                  <div
                    style={
                      smallMutedStyle
                    }
                  >
                    Finding ID:{" "}
                    {record.findingId}
                  </div>
                </div>

                <RiskBadge
                  label={`Residual: ${record.residualRisk}`}
                  level={
                    record.residualRisk
                  }
                />
              </div>

              <div style={metaGridStyle}>
                <Meta
                  label="Inherent Risk"
                  value={
                    record.inherentRisk
                  }
                  level={
                    record.inherentRisk
                  }
                />

                <Meta
                  label="Residual Risk"
                  value={
                    record.residualRisk
                  }
                  level={
                    record.residualRisk
                  }
                />

                <Meta
                  label="Approval"
                  value={
                    record.approvalStatus
                  }
                />
              </div>

              <div
                style={{
                  marginTop:
                    "20px",
                }}
              >
                <label
                  style={
                    formLabelStyle
                  }
                >
                  Risk Treatment Decision
                </label>

                <select
                  value={
                    record.decision
                  }
                  onChange={(event) =>
                    onDecisionChange(
                      record.id,
                      event.target
                        .value as ResidualRiskDecision
                    )
                  }
                  style={selectStyle}
                >
                  <option value="Treat">
                    Treat
                  </option>

                  <option value="Accept">
                    Accept
                  </option>

                  <option value="Transfer">
                    Transfer
                  </option>

                  <option value="Avoid">
                    Avoid
                  </option>
                </select>

                <p
                  style={{
                    ...smallMutedStyle,
                    marginTop:
                      "8px",
                  }}
                >
                  {record.decision ===
                    "Accept" &&
                    "Risk will be consciously retained by the accountable owner."}

                  {record.decision ===
                    "Treat" &&
                    "Additional controls or remediation will be implemented."}

                  {record.decision ===
                    "Transfer" &&
                    "Risk responsibility or financial impact will be transferred where appropriate."}

                  {record.decision ===
                    "Avoid" &&
                    "The activity creating the risk should be stopped, removed or redesigned."}
                </p>
              </div>

              <div style={metaGridStyle}>
                <div>
                  <label
                    style={
                      formLabelStyle
                    }
                  >
                    Accountable Owner
                  </label>

                  <input
                    value={
                      record.accountableOwner
                    }
                    onChange={(event) =>
                      onOwnerChange(
                        record.id,
                        event.target.value
                      )
                    }
                    style={inputStyle}
                    placeholder="Risk Owner"
                  />
                </div>

                <div>
                  <label
                    style={
                      formLabelStyle
                    }
                  >
                    Review Date
                  </label>

                  <input
                    type="date"
                    value={
                      record.reviewDate
                    }
                    onChange={(event) =>
                      onReviewDateChange(
                        record.id,
                        event.target.value
                      )
                    }
                    style={inputStyle}
                  />
                </div>
              </div>

              <div
                style={{
                  marginTop:
                    "16px",
                }}
              >
                <label
                  style={
                    formLabelStyle
                  }
                >
                  Decision Rationale
                </label>

                <textarea
                  value={
                    record.rationale
                  }
                  onChange={(event) =>
                    onRationaleChange(
                      record.id,
                      event.target.value
                    )
                  }
                  rows={4}
                  style={{
                    ...inputStyle,
                    resize:
                      "vertical",
                  }}
                />
              </div>

              <div
                style={{
                  marginTop:
                    "16px",
                }}
              >
                <label
                  style={
                    formLabelStyle
                  }
                >
                  Treatment Status
                </label>

                <select
                  value={
                    record.treatmentStatus
                  }
                  onChange={(event) =>
                    onTreatmentStatusChange(
                      record.id,
                      event.target.value
                    )
                  }
                  style={smallSelectStyle}
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

              <div
                style={{
                  marginTop:
                    "18px",
                  padding:
                    "14px 16px",
                  borderRadius:
                    "10px",
                  background:
                    record.approvalStatus ===
                    "Pending"
                      ? "#fffbeb"
                      : "#f0fdf4",
                  border:
                    record.approvalStatus ===
                    "Pending"
                      ? "1px solid #fde68a"
                      : "1px solid #bbf7d0",
                  color:
                    record.approvalStatus ===
                    "Pending"
                      ? "#92400e"
                      : "#166534",
                  lineHeight:
                    1.6,
                }}
              >
                <strong>
                  Approval status:
                </strong>{" "}
                {record.approvalStatus}

                {record.approvalStatus ===
                  "Pending" && (
                  <div
                    style={{
                      marginTop:
                        "4px",
                    }}
                  >
                    This decision requires
                    appropriate management /
                    risk-owner approval before
                    it should be treated as
                    formally accepted.
                  </div>
                )}
              </div>
            </div>
          )
        )}
      </div>

      <div style={neutralBoxStyle}>
        <strong>
          Residual-risk governance guidance:
        </strong>{" "}
        The calculated residual risk is an
        assessment output, not an automatic
        risk acceptance. Acceptance,
        treatment, transfer or avoidance
        should be explicitly documented and
        approved according to the
        organisation's risk-management
        authority matrix.
      </div>
    </section>
  );
}

/*
 * =========================================================
 * MULTI SELECT
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
        style={
          formLabelStyle
        }
      >
        {label}
      </label>

      <div style={gridStyle}>
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
                  ...checkboxStyle,
                  border:
                    selected
                      ? "2px solid #1d4ed8"
                      : "1px solid #cbd5e1",
                  background:
                    selected
                      ? "#eff6ff"
                      : "white",
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
                />

                <span
                  style={{
                    fontSize:
                      "14px",
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
          style={
            smallMutedStyle
          }
        >
          {values.length} selected
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

function CheckboxGrid({
  items,
  selected,
  onToggle,
}: {
  items: {
    id: string;
    title: string;
    description: string;
  }[];
  selected: string[];
  onToggle: (
    id: string
  ) => void;
}) {
  return (
    <div style={gridStyle}>
      {items.map((item) => {
        const checked =
          selected.includes(
            item.id
          );

        return (
          <label
            key={item.id}
            style={{
              ...checkboxStyle,
              border:
                checked
                  ? "2px solid #1d4ed8"
                  : "1px solid #e2e8f0",
              background:
                checked
                  ? "#eff6ff"
                  : "#f8fafc",
            }}
          >
            <input
              type="checkbox"
              checked={checked}
              onChange={() =>
                onToggle(item.id)
              }
            />

            <span>
              <strong>
                {item.title}
              </strong>

              <span
                style={
                  smallTextStyle
                }
              >
                {item.description}
              </span>
            </span>
          </label>
        );
      })}
    </div>
  );
}

function RemovableItem({
  name,
  onRemove,
}: {
  name: string;
  onRemove: () => void;
}) {
  return (
    <div
      style={{
        display: "flex",
        justifyContent:
          "space-between",
        alignItems:
          "center",
        padding:
          "12px 14px",
        marginTop:
          "8px",
        background:
          "#f8fafc",
        border:
          "1px solid #e2e8f0",
        borderRadius:
          "8px",
      }}
    >
      <strong>{name}</strong>

      <button
        type="button"
        onClick={onRemove}
        style={
          removeButtonStyle
        }
      >
        Remove
      </button>
    </div>
  );
}

function SelectionSummary({
  count,
  label,
}: {
  count: number;
  label: string;
}) {
  return (
    <div style={successStyle}>
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
        display: "flex",
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
 * GENERIC DISPLAY COMPONENTS
 * =========================================================
 */

function RiskSummaryCard({
  label,
  value,
  level,
  description,
}: {
  label: string;
  value: string | number;
  level?: RiskLevel;
  description?: string;
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
      <div style={smallLabelStyle}>
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

      {description && (
        <div style={smallMutedStyle}>
          {description}
        </div>
      )}
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
        padding:
          "6px 10px",
        borderRadius:
          "20px",
        background:
          riskBackground(level),
        color:
          riskColor(level),
        fontWeight: 700,
        fontSize:
          "12px",
      }}
    >
      {label}
    </span>
  );
}

function Meta({
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
        style={
          smallLabelStyle
        }
      >
        {label}
      </div>

      <div
        style={{
          fontSize:
            "14px",
          fontWeight:
            level ? 700 : 500,
          color:
            level
              ? riskColor(level)
              : "#334155",
          lineHeight:
            1.5,
        }}
      >
        {value}
      </div>
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
  }
}

/*
 * =========================================================
 * SHARED STYLES
 * =========================================================
 */

const sectionStyle = {
  marginTop: "24px",
  marginBottom: "24px",
};

const panelStyle = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: "14px",
  padding: "28px",
  marginBottom: "20px",
};

const cardStyle = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: "14px",
  padding: "28px",
  marginBottom: "20px",
};

const headingStyle = {
  color: "#0f172a",
  marginTop: 0,
  marginBottom: "18px",
};

const panelHeadingStyle = {
  color: "#0f172a",
  marginTop: 0,
};

const subheadingStyle = {
  color: "#0f172a",
  marginTop: "32px",
};

const noticeStyle = {
  color: "#64748b",
  lineHeight: 1.6,
  marginBottom: "20px",
};

const paragraphStyle = {
  color: "#475569",
  lineHeight: 1.6,
};

const gridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(240px, 1fr))",
  gap: "12px",
};

const summaryGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(170px, 1fr))",
  gap: "12px",
  marginTop: "20px",
};

const metaGridStyle = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit, minmax(180px, 1fr))",
  gap: "12px",
  marginTop: "18px",
};

const checkboxStyle = {
  display: "flex",
  alignItems: "flex-start",
  gap: "10px",
  padding: "14px",
  borderRadius: "10px",
  cursor: "pointer",
};

const smallTextStyle = {
  display: "block",
  fontSize: "12px",
  color: "#64748b",
  marginTop: "5px",
};

const smallMutedStyle = {
  marginTop: "5px",
  fontSize: "12px",
  color: "#64748b",
};

const smallLabelStyle = {
  fontSize: "11px",
  fontWeight: 700,
  color: "#64748b",
  letterSpacing: "1px",
  textTransform: "uppercase" as const,
};

const stepLabelStyle = {
  fontSize: "13px",
  fontWeight: 700,
  letterSpacing: "2px",
  color: "#1d4ed8",
  marginBottom: "8px",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "12px 14px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  fontSize: "15px",
  background: "white",
  color: "#0f172a",
};

const selectStyle = {
  width: "100%",
  padding: "13px 14px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  background: "white",
  fontSize: "16px",
  color: "#0f172a",
};

const smallSelectStyle = {
  padding: "9px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  background: "white",
  color: "#0f172a",
  fontSize: "14px",
};

const inputRowStyle = {
  display: "flex",
  gap: "10px",
  marginTop: "12px",
  flexWrap: "wrap" as const,
};

const subsectionStyle = {
  marginTop: "24px",
  paddingTop: "20px",
  borderTop: "1px solid #e2e8f0",
};

const primaryButtonStyle = {
  width: "100%",
  padding: "16px",
  border: "none",
  borderRadius: "10px",
  background: "#1d4ed8",
  color: "white",
  fontSize: "17px",
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryButtonStyle = {
  padding: "12px 18px",
  borderRadius: "8px",
  border: "none",
  background: "#0f172a",
  color: "white",
  fontWeight: 600,
  cursor: "pointer",
};

const removeButtonStyle = {
  border: "none",
  background: "transparent",
  color: "#64748b",
  cursor: "pointer",
  fontSize: "13px",
};

const warningStyle = {
  padding: "16px",
  background: "#eff6ff",
  border: "1px solid #bfdbfe",
  borderRadius: "10px",
  color: "#1e3a8a",
  lineHeight: 1.6,
  marginBottom: "20px",
};

const successStyle = {
  marginTop: "20px",
  padding: "16px",
  background: "#f0fdf4",
  border: "1px solid #bbf7d0",
  borderRadius: "10px",
  color: "#166534",
};

const neutralBoxStyle = {
  marginTop: "18px",
  padding: "16px",
  background: "#f8fafc",
  borderRadius: "10px",
  color: "#475569",
  lineHeight: 1.6,
};

const recommendationStyle = {
  marginTop: "14px",
  padding: "16px",
  background: "#eff6ff",
  border: "1px solid #bfdbfe",
  borderRadius: "10px",
  color: "#1e3a8a",
  lineHeight: 1.6,
};

const metaCardStyle = {
  padding: "16px",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
};

const findingCardStyle = {
  padding: "20px",
  marginBottom: "14px",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
};

const decisionCardStyle = {
  padding: "22px",
  marginBottom: "16px",
  border: "1px solid #e2e8f0",
  borderRadius: "12px",
};

const findingHeaderStyle = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "flex-start",
  gap: "15px",
  flexWrap: "wrap" as const,
};

const progressBackgroundStyle = {
  marginTop: "10px",
  height: "8px",
  background: "#e2e8f0",
  borderRadius: "20px",
  overflow: "hidden" as const,
};

const formLabelStyle = {
  display: "block",
  fontWeight: 700,
  color: "#0f172a",
  marginBottom: "8px",
};

const statusRowStyle = {
  marginTop: "18px",
  paddingTop: "18px",
  borderTop: "1px solid #e2e8f0",
  display: "flex",
  alignItems: "center",
  gap: "12px",
  flexWrap: "wrap" as const,
};
