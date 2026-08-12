"use client";

import { useMemo, useState } from "react";
import { getBusinessTypes, getSchoolEntryPoints, kb } from "../../lib/kb";

type CustomItem = {
  id: string;
  name: string;
  custom: boolean;
};

export default function AssessmentPage() {
  /* =========================================================
     STEP 1–4: BUSINESS CONTEXT
     ========================================================= */

  const [industryId, setIndustryId] = useState("");
  const [businessTypeId, setBusinessTypeId] = useState("");
  const [processId, setProcessId] = useState("");

  const [selectedEntryPoints, setSelectedEntryPoints] =
    useState<string[]>([]);

  const [customEntryPoint, setCustomEntryPoint] = useState("");

  const [customEntryPoints, setCustomEntryPoints] = useState<
    {
      id: string;
      name: string;
      collection_method: string;
      custom: boolean;
    }[]
  >([]);

  /* =========================================================
     STEP 5: PERSONAL DATA FIELDS
     ========================================================= */

  const [selectedFields, setSelectedFields] =
    useState<string[]>([]);

  const [customField, setCustomField] = useState("");

  const [customFields, setCustomFields] = useState<CustomItem[]>(
    []
  );

  /* =========================================================
     STEP 6: DATA HANDLING / DATA FLOW ATTRIBUTES

     IMPORTANT:
     These are arrays because real-world processes can have
     multiple collection and storage scenarios.
     ========================================================= */

  const [collectorRoles, setCollectorRoles] =
    useState<string[]>([]);

  const [dataSubjectTypes, setDataSubjectTypes] =
    useState<string[]>([]);

  const [collectionMethods, setCollectionMethods] =
    useState<string[]>([]);

  const [storageLocations, setStorageLocations] =
    useState<string[]>([]);

  const [storageEnvironments, setStorageEnvironments] =
    useState<string[]>([]);

  const [encryptionStatuses, setEncryptionStatuses] =
    useState<string[]>([]);

  const [accessRoles, setAccessRoles] = useState("");

  const [sharingStatuses, setSharingStatuses] =
    useState<string[]>([]);

  const [retentionPeriod, setRetentionPeriod] = useState("");

  const [deletionMethod, setDeletionMethod] = useState("");

  const [privacyNotice, setPrivacyNotice] = useState("");

  const [consentStatus, setConsentStatus] = useState("");

  const [parentalConsent, setParentalConsent] = useState("");

  const [crossBorderTransfer, setCrossBorderTransfer] =
    useState("");

  /* =========================================================
     GENERIC MULTI-SELECT HELPER
     ========================================================= */

  function toggleMultiSelect(
    value: string,
    setter: React.Dispatch<React.SetStateAction<string[]>>
  ) {
    setter((current) =>
      current.includes(value)
        ? current.filter((item) => item !== value)
        : [...current, value]
    );
  }

  /* =========================================================
     STEP 4 FUNCTIONS
     ========================================================= */

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

  /* =========================================================
     STEP 5 FUNCTIONS
     ========================================================= */

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

  /* =========================================================
     BUSINESS TYPES / PROCESSES / ENTRY POINTS
     ========================================================= */

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

    return getSchoolEntryPoints(processId || undefined);
  }, [businessTypeId, processId]);

  /* =========================================================
     RESET FUNCTIONS
     ========================================================= */

  function resetStep6() {
    setCollectorRoles([]);
    setDataSubjectTypes([]);
    setCollectionMethods([]);
    setStorageLocations([]);
    setStorageEnvironments([]);
    setEncryptionStatuses([]);
    setAccessRoles("");
    setSharingStatuses([]);
    setRetentionPeriod("");
    setDeletionMethod("");
    setPrivacyNotice("");
    setConsentStatus("");
    setParentalConsent("");
    setCrossBorderTransfer("");
  }

  function resetFromIndustry() {
    setBusinessTypeId("");
    setProcessId("");

    setSelectedEntryPoints([]);
    setCustomEntryPoints([]);
    setCustomEntryPoint("");

    setSelectedFields([]);
    setCustomFields([]);
    setCustomField("");

    resetStep6();
  }

  function resetFromBusinessType() {
    setProcessId("");

    setSelectedEntryPoints([]);
    setCustomEntryPoints([]);
    setCustomEntryPoint("");

    setSelectedFields([]);
    setCustomFields([]);
    setCustomField("");

    resetStep6();
  }

  function resetFromProcess() {
    setSelectedEntryPoints([]);
    setCustomEntryPoints([]);
    setCustomEntryPoint("");

    setSelectedFields([]);
    setCustomFields([]);
    setCustomField("");

    resetStep6();
  }

  /* =========================================================
     RENDER
     ========================================================= */

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "60px 24px",
        fontFamily: "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        {/* HEADER */}

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
          Start by identifying your industry, business type and
          the processes where personal data enters your
          organisation.
        </p>

        {/* =====================================================
            STEP 1
            ===================================================== */}

        <section style={cardStyle}>
          <StepNumber number="1" />

          <h2 style={headingStyle}>
            Select your industry
          </h2>

          <select
            value={industryId}
            onChange={(event) => {
              setIndustryId(event.target.value);
              resetFromIndustry();
            }}
            style={selectStyle}
          >
            <option value="">
              Select industry...
            </option>

            {kb.industries
              .filter((item) => item.status === "active")
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

        {/* =====================================================
            STEP 2
            ===================================================== */}

        {industryId && (
          <section style={cardStyle}>
            <StepNumber number="2" />

            <h2 style={headingStyle}>
              Select your business type
            </h2>

            <select
              value={businessTypeId}
              onChange={(event) => {
                setBusinessTypeId(event.target.value);
                resetFromBusinessType();
              }}
              style={selectStyle}
            >
              <option value="">
                Select business type...
              </option>

              {businessTypes.map((businessType) => (
                <option
                  key={businessType.id}
                  value={businessType.id}
                >
                  {businessType.name}
                </option>
              ))}
            </select>

            {businessTypes.length === 0 && (
              <p style={noticeStyle}>
                A detailed assessment pack for this business
                type is not available yet. More sector packs
                will be added progressively.
              </p>
            )}
          </section>
        )}

        {/* =====================================================
            STEP 3
            ===================================================== */}

        {businessTypeId === "EDU-SCH" && (
          <section style={cardStyle}>
            <StepNumber number="3" />

            <h2 style={headingStyle}>
              Select a business process
            </h2>

            <select
              value={processId}
              onChange={(event) => {
                setProcessId(event.target.value);
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

        {/* =====================================================
            STEP 4
            ===================================================== */}

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
              Select all the channels through which your
              organisation may collect personal data for this
              process.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "12px",
              }}
            >
              {entryPoints.map((entryPoint) => {
                const isSelected =
                  selectedEntryPoints.includes(
                    entryPoint.id
                  );

                return (
                  <label
                    key={entryPoint.id}
                    style={{
                      display: "flex",
                      alignItems: "flex-start",
                      gap: "12px",
                      padding: "16px",
                      border: isSelected
                        ? "2px solid #1d4ed8"
                        : "1px solid #e2e8f0",
                      borderRadius: "10px",
                      background: isSelected
                        ? "#eff6ff"
                        : "#f8fafc",
                      cursor: "pointer",
                    }}
                  >
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() =>
                        toggleEntryPoint(
                          entryPoint.id
                        )
                      }
                      style={{
                        marginTop: "3px",
                        width: "18px",
                        height: "18px",
                      }}
                    />

                    <span>
                      <strong>
                        {entryPoint.name}
                      </strong>

                      <span
                        style={{
                          display: "block",
                          fontSize: "13px",
                          color: "#64748b",
                          marginTop: "5px",
                        }}
                      >
                        {
                          entryPoint.collection_method
                        }
                      </span>
                    </span>
                  </label>
                );
              })}
            </div>

            {/* CUSTOM ENTRY POINT */}

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
                  marginBottom: "8px",
                }}
              >
                Don't see your data entry point?
              </h3>

              <p style={noticeStyle}>
                Add a custom channel used by your
                organisation.
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
                  value={customEntryPoint}
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
                    borderRadius: "8px",
                    border:
                      "1px solid #cbd5e1",
                    fontSize: "15px",
                  }}
                />

                <button
                  type="button"
                  onClick={
                    addCustomEntryPoint
                  }
                  style={buttonStyle}
                >
                  Add
                </button>
              </div>

              {customEntryPoints.length >
                0 && (
                <div
                  style={{
                    marginTop: "16px",
                  }}
                >
                  {customEntryPoints.map(
                    (entryPoint) => (
                      <div
                        key={entryPoint.id}
                        style={{
                          display: "flex",
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
                                "12px",
                              color:
                                "#64748b",
                              marginTop:
                                "3px",
                            }}
                          >
                            Custom entry
                            point
                          </span>
                        </span>

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

        {/* =====================================================
            STEP 5
            ===================================================== */}

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
                Select all personal-data fields that your
                organisation collects through the selected
                entry points.
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
                            {field.name}
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

              {/* CUSTOM FIELD */}

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
                    marginBottom: "8px",
                  }}
                >
                  Don't see your data field?
                </h3>

                <p style={noticeStyle}>
                  Add a custom personal-data field
                  used by your organisation.
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
                      fontSize: "15px",
                    }}
                  />

                  <button
                    type="button"
                    onClick={
                      addCustomField
                    }
                    style={buttonStyle}
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
                                  "3px",
                              }}
                            >
                              Custom field
                            </span>
                          </span>

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

        {/* =====================================================
            STEP 6
            MULTI-VALUE DATA FLOW ATTRIBUTES
            ===================================================== */}

        {businessTypeId === "EDU-SCH" &&
          (selectedFields.length > 0 ||
            customFields.length > 0) && (
            <section style={cardStyle}>
              <StepNumber number="6" />

              <h2 style={headingStyle}>
                How is this personal data collected
                and handled?
              </h2>

              <p
                style={{
                  ...noticeStyle,
                  marginBottom: "24px",
                }}
              >
                A business process may have multiple
                collection, handling and storage
                scenarios. Select all options that apply.
                For example, admission data may be
                collected by both the receptionist and
                admissions team, through both paper and
                online forms, and stored in both physical
                files and digital systems.
              </p>

              {/* =================================================
                  COLLECTOR
                  ================================================= */}

              <MultiSelectField
                label="Who collects this data?"
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
                selected={collectorRoles}
                onToggle={(value) =>
                  toggleMultiSelect(
                    value,
                    setCollectorRoles
                  )
                }
              />

              {/* =================================================
                  DATA SUBJECT
                  ================================================= */}

              <MultiSelectField
                label="Who is the data subject?"
                options={[
                  "Student",
                  "Parent / Guardian",
                  "Employee",
                  "Teacher",
                  "Visitor",
                  "Vendor / Service Provider",
                  "Other",
                ]}
                selected={dataSubjectTypes}
                onToggle={(value) =>
                  toggleMultiSelect(
                    value,
                    setDataSubjectTypes
                  )
                }
              />

              {/* =================================================
                  COLLECTION METHOD
                  ================================================= */}

              <MultiSelectField
                label="How is the data collected?"
                options={[
                  "Physical Form",
                  "Website Form",
                  "Google Form",
                  "Mobile / School App",
                  "WhatsApp",
                  "Email",
                  "Telephone",
                  "In Person / Verbal",
                  "Excel / Spreadsheet",
                  "Paper Register",
                  "Admission Kiosk",
                  "Other",
                ]}
                selected={collectionMethods}
                onToggle={(value) =>
                  toggleMultiSelect(
                    value,
                    setCollectionMethods
                  )
                }
              />

              {/* =================================================
                  STORAGE LOCATION
                  ================================================= */}

              <MultiSelectField
                label="Where is the data stored?"
                options={[
                  "Physical / Paper File",
                  "School Management System",
                  "Student Information System",
                  "CRM",
                  "Google Drive",
                  "Microsoft 365 / SharePoint",
                  "Excel / Spreadsheet",
                  "Email Mailbox",
                  "WhatsApp Account",
                  "Local Computer",
                  "Local Server",
                  "Paper Register",
                  "Third-party Vendor System",
                  "Unknown",
                  "Other",
                ]}
                selected={storageLocations}
                onToggle={(value) =>
                  toggleMultiSelect(
                    value,
                    setStorageLocations
                  )
                }
              />

              {/* =================================================
                  STORAGE ENVIRONMENT
                  ================================================= */}

              <MultiSelectField
                label="What type of storage environment is involved?"
                options={[
                  "Physical",
                  "Cloud",
                  "On-Premises",
                  "Employee Device",
                  "Mobile Device",
                  "Third-party Hosted",
                  "Hybrid",
                  "Unknown",
                ]}
                selected={storageEnvironments}
                onToggle={(value) =>
                  toggleMultiSelect(
                    value,
                    setStorageEnvironments
                  )
                }
              />

              {/* =================================================
                  ENCRYPTION
                  ================================================= */}

              <MultiSelectField
                label="How is the stored data protected?"
                options={[
                  "Encrypted at rest",
                  "Encrypted in transit",
                  "Encrypted at rest and in transit",
                  "Clear text / Not encrypted",
                  "Physical security controls",
                  "Access-controlled",
                  "Unknown",
                ]}
                selected={encryptionStatuses}
                onToggle={(value) =>
                  toggleMultiSelect(
                    value,
                    setEncryptionStatuses
                  )
                }
              />

              {/* =================================================
                  ACCESS
                  ================================================= */}

              <FormField label="Who can access the data?">
                <input
                  type="text"
                  value={accessRoles}
                  onChange={(event) =>
                    setAccessRoles(
                      event.target.value
                    )
                  }
                  placeholder="e.g. Admissions team, Principal, IT administrator"
                  style={inputStyle}
                />
              </FormField>

              {/* =================================================
                  SHARING
                  ================================================= */}

              <MultiSelectField
                label="Is the data shared with anyone else?"
                options={[
                  "No external sharing",
                  "Shared internally only",
                  "Shared with service provider",
                  "Shared with school group / management",
                  "Shared with government / regulatory authority",
                  "Shared with multiple third parties",
                  "Unknown",
                ]}
                selected={sharingStatuses}
                onToggle={(value) =>
                  toggleMultiSelect(
                    value,
                    setSharingStatuses
                  )
                }
              />

              {/* =================================================
                  RETENTION
                  ================================================= */}

              <FormField label="How long is the data retained?">
                <select
                  value={retentionPeriod}
                  onChange={(event) =>
                    setRetentionPeriod(
                      event.target.value
                    )
                  }
                  style={selectStyle}
                >
                  <option value="">
                    Select retention period...
                  </option>

                  <option>
                    Less than 30 days
                  </option>

                  <option>
                    30 days – 1 year
                  </option>

                  <option>
                    1 – 3 years
                  </option>

                  <option>
                    3 – 5 years
                  </option>

                  <option>
                    More than 5 years
                  </option>

                  <option>
                    Indefinitely
                  </option>

                  <option>
                    No defined retention period
                  </option>

                  <option>
                    Unknown
                  </option>
                </select>
              </FormField>

              {/* =================================================
                  DELETION
                  ================================================= */}

              <FormField label="How is the data deleted?">
                <select
                  value={deletionMethod}
                  onChange={(event) =>
                    setDeletionMethod(
                      event.target.value
                    )
                  }
                  style={selectStyle}
                >
                  <option value="">
                    Select deletion method...
                  </option>

                  <option>
                    Automatic deletion
                  </option>

                  <option>
                    Manual deletion
                  </option>

                  <option>
                    Periodic review and deletion
                  </option>

                  <option>
                    On request
                  </option>

                  <option>
                    No defined deletion process
                  </option>

                  <option>
                    Unknown
                  </option>
                </select>
              </FormField>

              {/* =================================================
                  PRIVACY NOTICE
                  ================================================= */}

              <FormField label="Is a privacy notice provided to the data subject?">
                <select
                  value={privacyNotice}
                  onChange={(event) =>
                    setPrivacyNotice(
                      event.target.value
                    )
                  }
                  style={selectStyle}
                >
                  <option value="">
                    Select...
                  </option>

                  <option>
                    Yes
                  </option>

                  <option>
                    No
                  </option>

                  <option>
                    Partially
                  </option>

                  <option>
                    Unknown
                  </option>
                </select>
              </FormField>

              {/* =================================================
                  CONSENT
                  ================================================= */}

              <FormField label="Is consent obtained where required?">
                <select
                  value={consentStatus}
                  onChange={(event) =>
                    setConsentStatus(
                      event.target.value
                    )
                  }
                  style={selectStyle}
                >
                  <option value="">
                    Select...
                  </option>

                  <option>
                    Yes
                  </option>

                  <option>
                    No
                  </option>

                  <option>
                    Partially
                  </option>

                  <option>
                    Not applicable / Other lawful basis
                  </option>

                  <option>
                    Unknown
                  </option>
                </select>
              </FormField>

              {/* =================================================
                  PARENT / GUARDIAN
                  ================================================= */}

              <FormField label="For minors, is parent / guardian involvement addressed?">
                <select
                  value={parentalConsent}
                  onChange={(event) =>
                    setParentalConsent(
                      event.target.value
                    )
                  }
                  style={selectStyle}
                >
                  <option value="">
                    Select...
                  </option>

                  <option>
                    Yes
                  </option>

                  <option>
                    No
                  </option>

                  <option>
                    Partially
                  </option>

                  <option>
                    Not applicable
                  </option>

                  <option>
                    Unknown
                  </option>
                </select>
              </FormField>

              {/* =================================================
                  CROSS BORDER
                  ================================================= */}

              <FormField label="Is the data transferred outside India?">
                <select
                  value={crossBorderTransfer}
                  onChange={(event) =>
                    setCrossBorderTransfer(
                      event.target.value
                    )
                  }
                  style={selectStyle}
                >
                  <option value="">
                    Select...
                  </option>

                  <option>
                    No
                  </option>

                  <option>
                    Yes
                  </option>

                  <option>
                    Unknown
                  </option>
                </select>
              </FormField>

              {/* =================================================
                  SUMMARY
                  ================================================= */}

              <div
                style={{
                  marginTop: "28px",
                  padding: "18px",
                  background: "#f0fdf4",
                  border:
                    "1px solid #bbf7d0",
                  borderRadius: "10px",
                  color: "#166534",
                  lineHeight: 1.7,
                }}
              >
                <strong>
                  Multiple data-flow scenarios supported
                </strong>

                <div
                  style={{
                    marginTop: "8px",
                    fontSize: "14px",
                  }}
                >
                  Your assessment can now represent
                  situations where the same personal
                  data is collected by multiple people,
                  through multiple channels, and stored
                  in multiple physical or digital
                  environments.
                </div>
              </div>

              <div
                style={{
                  marginTop: "20px",
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
                If you don't know the answer, select
                <strong> Unknown</strong>. Unknown or
                missing information can later be
                highlighted as a privacy governance gap.
              </div>
            </section>
          )}

        {/* =====================================================
            PRIVACY-BY-DESIGN NOTICE
            ===================================================== */}

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
          PrivacyMap does not require your customers'
          personal data. Assessment responses will remain
          in your browser and will be used locally to
          generate your reports.
        </div>
      </div>
    </main>
  );
}

/* ===========================================================
   MULTI-SELECT COMPONENT
   =========================================================== */

function MultiSelectField({
  label,
  options,
  selected,
  onToggle,
}: {
  label: string;
  options: string[];
  selected: string[];
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
          gap: "10px",
        }}
      >
        {options.map((option) => {
          const checked =
            selected.includes(option);

          return (
            <label
              key={option}
              style={{
                display: "flex",
                alignItems:
                  "center",
                gap: "10px",
                padding:
                  "12px 14px",
                border: checked
                  ? "2px solid #1d4ed8"
                  : "1px solid #e2e8f0",
                borderRadius:
                  "8px",
                background:
                  checked
                    ? "#eff6ff"
                    : "white",
                cursor:
                  "pointer",
                color: "#334155",
                fontSize: "14px",
              }}
            >
              <input
                type="checkbox"
                checked={checked}
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

              <span>
                {option}
              </span>
            </label>
          );
        })}
      </div>

      {selected.length > 0 && (
        <div
          style={{
            marginTop: "8px",
            fontSize: "13px",
            color: "#1d4ed8",
            fontWeight: 600,
          }}
        >
          {selected.length} selected
        </div>
      )}
    </div>
  );
}

/* ===========================================================
   FORM FIELD
   =========================================================== */

function FormField({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        marginBottom: "22px",
      }}
    >
      <label
        style={{
          display: "block",
          fontWeight: 700,
          color: "#0f172a",
          marginBottom: "8px",
        }}
      >
        {label}
      </label>

      {children}
    </div>
  );
}

/* ===========================================================
   STEP NUMBER
   =========================================================== */

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

/* ===========================================================
   SELECTION SUMMARY
   =========================================================== */

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

/* ===========================================================
   STYLES
   =========================================================== */

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

const selectStyle = {
  width: "100%",
  padding: "13px 14px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  background: "white",
  fontSize: "16px",
  color: "#0f172a",
};

const inputStyle = {
  width: "100%",
  padding: "13px 14px",
  borderRadius: "8px",
  border: "1px solid #cbd5e1",
  background: "white",
  fontSize: "16px",
  color: "#0f172a",
  boxSizing: "border-box" as const,
};

const noticeStyle = {
  color: "#64748b",
  lineHeight: 1.6,
};

const buttonStyle = {
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
