"use client";

import { useMemo, useState } from "react";
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

export default function AssessmentPage() {
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

  const [customField, setCustomField] =
    useState("");

  const [customFields, setCustomFields] =
    useState<
      {
        id: string;
        name: string;
        custom: boolean;
      }[]
    >([]);

  /*
   * STEP 6
   * Multiple selections are intentionally supported.
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

  const [riskResult, setRiskResult] =
    useState<RiskResult | null>(null);

  function toggleArrayValue(
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) {
    setter((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  }

  function toggleEntryPoint(id: string) {
    setSelectedEntryPoints((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function addCustomEntryPoint() {
    const name = customEntryPoint.trim();

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
      current.filter((item) => item.id !== id)
    );
  }

  function toggleField(id: string) {
    setSelectedFields((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id]
    );
  }

  function addCustomField() {
    const name = customField.trim();

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
      current.filter((item) => item.id !== id)
    );
  }

  const businessTypes = useMemo(() => {
    if (!industryId) return [];

    return getBusinessTypes(industryId).filter(
      (item) => item.status === "active"
    );
  }, [industryId]);

  const processes = useMemo(() => {
    if (businessTypeId !== "EDU-SCH") return [];

    return kb.processes;
  }, [businessTypeId]);

  const entryPoints = useMemo(() => {
    if (businessTypeId !== "EDU-SCH") return [];

    return getSchoolEntryPoints(
      processId || undefined
    );
  }, [businessTypeId, processId]);

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
  }

  function runPrivacyRiskAssessment() {
    const result = calculatePrivacyRisk({
      selectedEntryPoints,
      customEntryPoints,

      selectedFields,
      customFields,

      collectorRoles,
      dataSubjects: dataSubjectTypes,
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

    setTimeout(() => {
      document
        .getElementById("privacy-risk-result")
        ?.scrollIntoView({
          behavior: "smooth",
          block: "start",
        });
    }, 100);
  }

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
          Identify where personal data enters your
          organisation, what information is collected,
          how it is handled and where privacy risks
          may exist.
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
              setIndustryId(event.target.value);
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
                  item.status === "active"
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
                    key={businessType.id}
                    value={businessType.id}
                  >
                    {businessType.name}
                  </option>
                )
              )}
            </select>

            {businessTypes.length === 0 && (
              <p style={noticeStyle}>
                A detailed assessment pack for
                this business type is not available
                yet. More sector packs will be added
                progressively.
              </p>
            )}
          </section>
        )}

        {/* STEP 3 */}

        {businessTypeId === "EDU-SCH" && (
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

              {processes.map((process) => (
                <option
                  key={process.id}
                  value={process.id}
                >
                  {process.name}
                </option>
              ))}
            </select>
          </section>
        )}

        {/* STEP 4 */}

        {businessTypeId === "EDU-SCH" && (
          <section style={cardStyle}>
            <StepNumber number="4" />

            <h2 style={headingStyle}>
              Potential data entry points
            </h2>

            <p
              style={{
                ...noticeStyle,
                marginBottom: "20px",
              }}
            >
              Select all channels through which
              your organisation may collect
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
                      key={entryPoint.id}
                      style={{
                        display: "flex",
                        alignItems:
                          "flex-start",
                        gap: "12px",
                        padding: "16px",
                        border:
                          isSelected
                            ? "2px solid #1d4ed8"
                            : "1px solid #e2e8f0",
                        borderRadius: "10px",
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
                Don't see your data entry point?
              </h3>

              <p style={noticeStyle}>
                Add a custom channel used by
                your organisation.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "12px",
                  flexWrap: "wrap",
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
                    (entryPoint) => (
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

        {/* STEP 5 */}

        {businessTypeId === "EDU-SCH" &&
          (selectedEntryPoints.length > 0 ||
            customEntryPoints.length > 0) && (
            <section style={cardStyle}>
              <StepNumber number="5" />

              <h2 style={headingStyle}>
                What personal data is collected?
              </h2>

              <p
                style={{
                  ...noticeStyle,
                  marginBottom: "20px",
                }}
              >
                Select all personal-data fields
                that your organisation collects.
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
                        key={field.id}
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
                  Don't see your data field?
                </h3>

                <p style={noticeStyle}>
                  Add a custom personal-data
                  field.
                </p>

                <div
                  style={{
                    display: "flex",
                    gap: "10px",
                    marginTop: "12px",
                    flexWrap: "wrap",
                  }}
                >
                  <input
                    type="text"
                    value={customField}
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
                          key={field.id}
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

        {/* STEP 6 */}

        {businessTypeId === "EDU-SCH" &&
          selectedFields.length > 0 && (
            <section style={cardStyle}>
              <StepNumber number="6" />

              <h2 style={headingStyle}>
                How is this personal data collected and handled?
              </h2>

              <p
                style={{
                  ...noticeStyle,
                  marginBottom: "24px",
                }}
              >
                Select all options that apply.
                Real-world processes often use
                multiple people, channels and
                storage locations.
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
                  background: "#f8fafc",
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
                Select all options that apply.
                If you don't know the answer,
                select <strong>Unknown</strong>.
              </div>
            </section>
          )}

        {/* STEP 7 */}

        {businessTypeId === "EDU-SCH" &&
          selectedFields.length > 0 && (
            <section style={cardStyle}>
              <StepNumber number="7" />

              <h2 style={headingStyle}>
                Privacy Risk Assessment
              </h2>

              <p
                style={{
                  ...noticeStyle,
                  marginBottom: "24px",
                }}
              >
                PrivacyMap will analyse the
                information entered above and
                identify potential privacy,
                security and governance risks.
              </p>

              <div
                style={{
                  padding: "20px",
                  background: "#eff6ff",
                  border:
                    "1px solid #bfdbfe",
                  borderRadius: "12px",
                  marginBottom: "20px",
                  color: "#1e3a8a",
                  lineHeight: 1.6,
                }}
              >
                <strong>
                  Important:
                </strong>{" "}
                This is a preliminary
                privacy-risk assessment based
                on the information provided.
                It is not a legal opinion or a
                determination of DPDPA compliance.
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
                  borderRadius: "10px",
                  background:
                    "#1d4ed8",
                  color: "white",
                  fontSize: "17px",
                  fontWeight: 700,
                  cursor: "pointer",
                }}
              >
                Analyse Privacy Risks
              </button>
            </section>
          )}

        {/* RISK RESULT */}

        {riskResult && (
          <div
            id="privacy-risk-result"
          >
            <RiskDashboard
              result={riskResult}
            />
          </div>
        )}

        {/* PRIVACY BY DESIGN */}

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
          customers' personal data.
          Assessment responses remain in
          your browser and are used locally
          to generate assessment results
          and reports.
        </div>
      </div>
    </main>
  );
}

/*
 * ---------------------------------------------------------
 * RISK DASHBOARD
 * ---------------------------------------------------------
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
              borderRadius: "12px",
              background:
                riskBackground(
                  result.overallLevel
                ),
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#475569",
              }}
            >
              OVERALL RISK
            </div>

            <div
              style={{
                fontSize: "32px",
                fontWeight: 800,
                marginTop: "8px",
                color:
                  riskColor(
                    result.overallLevel
                  ),
              }}
            >
              {result.overallLevel}
            </div>

            <div
              style={{
                marginTop: "5px",
                color: "#475569",
              }}
            >
              Risk score:{" "}
              {result.score}/100
            </div>
          </div>

          <div
            style={{
              padding: "22px",
              borderRadius: "12px",
              background:
                "#f8fafc",
            }}
          >
            <div
              style={{
                fontSize: "13px",
                fontWeight: 700,
                color: "#475569",
              }}
            >
              FINDINGS
            </div>

            <div
              style={{
                fontSize: "32px",
                fontWeight: 800,
                marginTop: "8px",
                color: "#0f172a",
              }}
            >
              {result.findings.length}
            </div>

            <div
              style={{
                marginTop: "5px",
                color: "#475569",
              }}
            >
              Potential issues identified
            </div>
          </div>
        </div>

        <h3
          style={{
            marginTop: "32px",
            color: "#0f172a",
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
                  padding: "16px",
                  border:
                    "1px solid #e2e8f0",
                  borderRadius: "10px",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent:
                      "space-between",
                    gap: "10px",
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

                <div
                  style={{
                    marginTop: "10px",
                    height: "8px",
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
                      height: "100%",
                      background:
                        riskColor(
                          category.level
                        ),
                    }}
                  />
                </div>

                <div
                  style={{
                    marginTop: "6px",
                    fontSize: "12px",
                    color:
                      "#64748b",
                  }}
                >
                  {category.score}/100
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* FINDINGS */}

      <div
        style={{
          background: "white",
          border:
            "1px solid #e2e8f0",
          borderRadius: "14px",
          padding: "28px",
          marginTop: "20px",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            color: "#0f172a",
          }}
        >
          Key Privacy Findings
        </h2>

        {result.findings.length ===
        0 ? (
          <div
            style={{
              padding: "18px",
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
            No significant privacy
            risk signals were identified
            from the information provided.
          </div>
        ) : (
          result.findings.map(
            (finding) => (
              <div
                key={finding.id}
                style={{
                  padding: "20px",
                  marginBottom: "14px",
                  border:
                    "1px solid #e2e8f0",
                  borderRadius:
                    "10px",
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
                    {finding.level}
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
                    Recommended action:
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
 * ---------------------------------------------------------
 * MULTI SELECT FIELD
 * ---------------------------------------------------------
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
  onToggle: (value: string) => void;
}) {
  return (
    <div
      style={{
        marginBottom: "24px",
      }}
    >
      <label
        style={{
          display: "block",
          fontWeight: 700,
          color: "#0f172a",
          marginBottom: "10px",
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
        {options.map((option) => {
          const selected =
            values.includes(option);

          return (
            <label
              key={option}
              style={{
                display: "flex",
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
                checked={selected}
                onChange={() =>
                  onToggle(option)
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
        })}
      </div>

      {values.length > 0 && (
        <div
          style={{
            marginTop: "8px",
            fontSize: "12px",
            color: "#64748b",
          }}
        >
          {values.length} selected
        </div>
      )}
    </div>
  );
}

/*
 * ---------------------------------------------------------
 * SUPPORTING COMPONENTS
 * ---------------------------------------------------------
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
        marginTop: "24px",
        padding: "16px",
        background: "#f0fdf4",
        border:
          "1px solid #bbf7d0",
        borderRadius: "10px",
        color: "#166534",
      }}
    >
      <strong>
        {count} {label}
        {count !== 1 ? "s" : ""} selected
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
        borderRadius: "50%",
        background: "#1d4ed8",
        color: "white",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontWeight: 700,
        marginBottom: "16px",
      }}
    >
      {number}
    </div>
  );
}

function riskColor(
  level: RiskLevel
) {
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
) {
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

const cardStyle = {
  background: "white",
  border:
    "1px solid #e2e8f0",
  borderRadius: "14px",
  padding: "28px",
  marginBottom: "20px",
};

const headingStyle = {
  color: "#0f172a",
  marginTop: 0,
  marginBottom: "18px",
};

const selectStyle = {
  width: "100%",
  padding: "13px 14px",
  borderRadius: "8px",
  border:
    "1px solid #cbd5e1",
  background: "white",
  fontSize: "16px",
  color: "#0f172a",
};

const noticeStyle = {
  color: "#64748b",
  lineHeight: 1.6,
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
