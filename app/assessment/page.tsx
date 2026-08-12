"use client";

import { useMemo, useState } from "react";
import type { ReactNode } from "react";
import {
  getBusinessTypes,
  getSchoolEntryPoints,
  kb,
} from "../../lib/kb";

export default function AssessmentPage() {
  /* =========================================================
     STEP 1–6 STATE
     ========================================================= */

  const [industryId, setIndustryId] = useState("");
  const [businessTypeId, setBusinessTypeId] = useState("");
  const [processId, setProcessId] = useState("");

  /* Step 4 */
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

  /* Step 5 */
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

  /* Step 6 */
  const [collectorRole, setCollectorRole] =
    useState("");

  const [dataSubjectType, setDataSubjectType] =
    useState("");

  const [collectionFormat, setCollectionFormat] =
    useState("");

  const [storageLocation, setStorageLocation] =
    useState("");

  const [storageEnvironment, setStorageEnvironment] =
    useState("");

  const [encryptionStatus, setEncryptionStatus] =
    useState("");

  const [accessRoles, setAccessRoles] =
    useState("");

  const [sharingStatus, setSharingStatus] =
    useState("");

  const [retentionPeriod, setRetentionPeriod] =
    useState("");

  const [deletionMethod, setDeletionMethod] =
    useState("");

  const [privacyNotice, setPrivacyNotice] =
    useState("");

  const [consentStatus, setConsentStatus] =
    useState("");

  const [parentalConsent, setParentalConsent] =
    useState("");

  const [crossBorderTransfer, setCrossBorderTransfer] =
    useState("");

  /* =========================================================
     DATA
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
    setCollectorRole("");
    setDataSubjectType("");
    setCollectionFormat("");
    setStorageLocation("");
    setStorageEnvironment("");
    setEncryptionStatus("");
    setAccessRoles("");
    setSharingStatus("");
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
     ENTRY POINT FUNCTIONS
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
     FIELD FUNCTIONS
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
     DERIVED STATE
     ========================================================= */

  const totalEntryPoints =
    selectedEntryPoints.length +
    customEntryPoints.length;

  const totalFields =
    selectedFields.length +
    customFields.length;

  /* =========================================================
     UI
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
        {/* Header */}

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
              .filter(
                (item) => item.status === "active"
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
                A detailed assessment pack for this
                business type is not available yet.
                More sector packs will be added
                progressively.
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
              Select all the channels through which
              your organisation may collect personal
              data for this process.
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
                      alignItems:
                        "flex-start",
                      gap: "12px",
                      padding: "16px",
                      border: isSelected
                        ? "2px solid #1d4ed8"
                        : "1px solid #e2e8f0",
                      borderRadius: "10px",
                      background:
                        isSelected
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

            {/* Custom entry point */}

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
                  style={{
                    padding:
                      "12px 18px",
                    borderRadius: "8px",
                    border: "none",
                    background:
                      "#0f172a",
                    color: "white",
                    fontWeight: 600,
                    cursor: "pointer",
                  }}
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
                          style={{
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
                          }}
                        >
                          Remove
                        </button>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {/* Selection summary */}

            {totalEntryPoints > 0 && (
              <div
                style={{
                  marginTop: "24px",
                  padding: "16px",
                  background:
                    "#f0fdf4",
                  border:
                    "1px solid #bbf7d0",
                  borderRadius: "10px",
                  color: "#166534",
                }}
              >
                <strong>
                  {totalEntryPoints} data
                  entry point
                  {totalEntryPoints !==
                  1
                    ? "s"
                    : ""}{" "}
                  selected
                </strong>
              </div>
            )}
          </section>
        )}

        {/* =====================================================
            STEP 5
            ===================================================== */}

        {businessTypeId === "EDU-SCH" &&
          totalEntryPoints > 0 && (
            <section style={cardStyle}>
              <StepNumber number="5" />

              <h2 style={headingStyle}>
                What personal data is
                collected?
              </h2>

              <p
                style={{
                  ...noticeStyle,
                  marginBottom: "20px",
                }}
              >
                Select the personal-data fields
                that your organisation collects
                through the selected entry
                points.
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
                            Data
                            subject:{" "}
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

              {/* Custom field */}

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
                    marginBottom:
                      "8px",
                  }}
                >
                  Don't see your data field?
                </h3>

                <p style={noticeStyle}>
                  Add a custom personal-data
                  field used by your
                  organisation.
                </p>

                <div
                  style={{
                    display:
                      "flex",
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
                    onChange={(
                      event
                    ) =>
                      setCustomField(
                        event.target
                          .value
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
                    style={{
                      padding:
                        "12px 18px",
                      borderRadius:
                        "8px",
                      border: "none",
                      background:
                        "#0f172a",
                      color: "white",
                      fontWeight: 600,
                      cursor:
                        "pointer",
                    }}
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
                              Custom
                              field
                            </span>
                          </span>

                          <button
                            type="button"
                            onClick={() =>
                              removeCustomField(
                                field.id
                              )
                            }
                            style={{
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
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      )
                    )}
                  </div>
                )}
              </div>

              {totalFields > 0 && (
                <div
                  style={{
                    marginTop: "24px",
                    padding: "16px",
                    background:
                      "#f0fdf4",
                    border:
                      "1px solid #bbf7d0",
                    borderRadius: "10px",
                    color: "#166534",
                  }}
                >
                  <strong>
                    {totalFields} data
                    field
                    {totalFields !== 1
                      ? "s"
                      : ""}{" "}
                    selected
                  </strong>
                </div>
              )}
            </section>
          )}

        {/* =====================================================
            STEP 6
            ===================================================== */}

        {businessTypeId === "EDU-SCH" &&
          totalFields > 0 && (
            <section style={cardStyle}>
              <StepNumber number="6" />

              <h2 style={headingStyle}>
                How is this personal data
                collected and handled?
              </h2>

              <p
                style={{
                  ...noticeStyle,
                  marginBottom: "24px",
                }}
              >
                Tell us how your organisation
                actually collects, stores,
                protects and retains the
                selected personal data. Select
                "Unknown" where the current
                practice is not known.
              </p>

              {/* Collector */}

              <FormField label="Who collects this data?">
                <select
                  value={collectorRole}
                  onChange={(event) =>
                    setCollectorRole(
                      event.target.value
                    )
                  }
                  style={selectStyle}
                >
                  <option value="">
                    Select role...
                  </option>
                  <option>
                    Admissions Executive
                  </option>
                  <option>Teacher</option>
                  <option>
                    Class Teacher
                  </option>
                  <option>
                    Administrative Staff
                  </option>
                  <option>
                    Accounts Staff
                  </option>
                  <option>
                    HR / HR Administrator
                  </option>
                  <option>
                    IT / System Administrator
                  </option>
                  <option>
                    Principal / Management
                  </option>
                  <option>
                    Reception / Front Desk
                  </option>
                  <option>
                    Third-party Service Provider
                  </option>
                  <option>Other</option>
                </select>
              </FormField>

              {/* Data subject */}

              <FormField label="Who is the data subject?">
                <select
                  value={
                    dataSubjectType
                  }
                  onChange={(event) =>
                    setDataSubjectType(
                      event.target.value
                    )
                  }
                  style={selectStyle}
                >
                  <option value="">
                    Select data subject...
                  </option>
                  <option>
                    Student
                  </option>
                  <option>
                    Parent / Guardian
                  </option>
                  <option>
                    Employee
                  </option>
                  <option>
                    Teacher
                  </option>
                  <option>
                    Visitor
                  </option>
                  <option>
                    Vendor / Service Provider
                  </option>
                  <option>Other</option>
                </select>
              </FormField>

              {/* Collection format */}

              <FormField label="How is the data collected?">
                <select
                  value={
                    collectionFormat
                  }
                  onChange={(event) =>
                    setCollectionFormat(
                      event.target.value
                    )
                  }
                  style={selectStyle}
                >
                  <option value="">
                    Select collection method...
                  </option>
                  <option>
                    Website Form
                  </option>
                  <option>
                    Google Form
                  </option>
                  <option>
                    Mobile / School App
                  </option>
                  <option>
                    WhatsApp
                  </option>
                  <option>Email</option>
                  <option>
                    Telephone
                  </option>
                  <option>
                    Paper Form
                  </option>
                  <option>
                    In Person / Verbal
                  </option>
                  <option>
                    Excel / Spreadsheet
                  </option>
                  <option>Other</option>
                </select>
              </FormField>

              {/* Storage location */}

              <FormField label="Where is the data stored?">
                <select
                  value={
                    storageLocation
                  }
                  onChange={(event) =>
                    setStorageLocation(
                      event.target.value
                    )
                  }
                  style={selectStyle}
                >
                  <option value="">
                    Select storage location...
                  </option>
                  <option>
                    School Management System
                  </option>
                  <option>
                    Student Information System
                  </option>
                  <option>CRM</option>
                  <option>
                    Google Drive
                  </option>
                  <option>
                    Microsoft 365 / SharePoint
                  </option>
                  <option>
                    Excel / Spreadsheet
                  </option>
                  <option>
                    Email Mailbox
                  </option>
                  <option>
                    WhatsApp Account
                  </option>
                  <option>
                    Local Computer
                  </option>
                  <option>
                    Paper File / Physical Record
                  </option>
                  <option>
                    Third-party Vendor System
                  </option>
                  <option>
                    Unknown
                  </option>
                  <option>Other</option>
                </select>
              </FormField>

              {/* Storage environment */}

              <FormField label="Where is the storage environment?">
                <select
                  value={
                    storageEnvironment
                  }
                  onChange={(event) =>
                    setStorageEnvironment(
                      event.target.value
                    )
                  }
                  style={selectStyle}
                >
                  <option value="">
                    Select environment...
                  </option>
                  <option>Cloud</option>
                  <option>
                    On-Premises
                  </option>
                  <option>
                    Employee Device
                  </option>
                  <option>
                    Mobile Device
                  </option>
                  <option>
                    Physical Storage
                  </option>
                  <option>
                    Third-party Hosted
                  </option>
                  <option>
                    Unknown
                  </option>
                </select>
              </FormField>

              {/* Encryption */}

              <FormField label="How is the stored data protected?">
                <select
                  value={
                    encryptionStatus
                  }
                  onChange={(event) =>
                    setEncryptionStatus(
                      event.target.value
                    )
                  }
                  style={selectStyle}
                >
                  <option value="">
                    Select protection status...
                  </option>
                  <option>
                    Encrypted at rest and in transit
                  </option>
                  <option>
                    Encrypted at rest only
                  </option>
                  <option>
                    Encrypted in transit only
                  </option>
                  <option>
                    Clear text / Not encrypted
                  </option>
                  <option>
                    Unknown
                  </option>
                </select>
              </FormField>

              {/* Access */}

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

              {/* Sharing */}

              <FormField label="Is the data shared with anyone else?">
                <select
                  value={
                    sharingStatus
                  }
                  onChange={(event) =>
                    setSharingStatus(
                      event.target.value
                    )
                  }
                  style={selectStyle}
                >
                  <option value="">
                    Select...
                  </option>
                  <option>
                    No external sharing
                  </option>
                  <option>
                    Shared internally only
                  </option>
                  <option>
                    Shared with service provider
                  </option>
                  <option>
                    Shared with multiple third parties
                  </option>
                  <option>
                    Unknown
                  </option>
                </select>
              </FormField>

              {/* Retention */}

              <FormField label="How long is the data retained?">
                <select
                  value={
                    retentionPeriod
                  }
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

              {/* Deletion */}

              <FormField label="How is the data deleted?">
                <select
                  value={
                    deletionMethod
                  }
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

              {/* Privacy notice */}

              <FormField label="Is a privacy notice provided to the data subject?">
                <select
                  value={
                    privacyNotice
                  }
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
                  <option>Yes</option>
                  <option>No</option>
                  <option>
                    Partially
                  </option>
                  <option>
                    Unknown
                  </option>
                </select>
              </FormField>

              {/* Consent */}

              <FormField label="Is consent obtained where required?">
                <select
                  value={
                    consentStatus
                  }
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
                  <option>Yes</option>
                  <option>No</option>
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

              {/* Parent / Guardian */}

              <FormField label="For minors, is parent / guardian involvement addressed?">
                <select
                  value={
                    parentalConsent
                  }
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
                  <option>Yes</option>
                  <option>No</option>
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

              {/* Cross-border */}

              <FormField label="Is the data transferred outside India?">
                <select
                  value={
                    crossBorderTransfer
                  }
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
                  <option>No</option>
                  <option>Yes</option>
                  <option>
                    Unknown
                  </option>
                </select>
              </FormField>

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
                If you don't know the
                answer, select{" "}
                <strong>
                  Unknown
                </strong>
                . Unknown or missing
                information can later be
                highlighted as a privacy
                governance gap.
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
          PrivacyMap does not require your
          customers' personal data. Assessment
          responses will remain in your browser
          and will be used locally to generate
          your reports.
        </div>
      </div>
    </main>
  );
}

/* =============================================================
   FORM FIELD
   ============================================================= */

function FormField({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
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

/* =============================================================
   STEP NUMBER
   ============================================================= */

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

/* =============================================================
   STYLES
   ============================================================= */

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
