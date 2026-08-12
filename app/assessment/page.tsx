"use client";

import { useMemo, useState } from "react";
import { getBusinessTypes, getSchoolEntryPoints, kb } from "../../lib/kb";

type CustomEntryPoint = {
  id: string;
  name: string;
  collection_method: string;
  custom: boolean;
};

type CustomField = {
  id: string;
  name: string;
  custom: boolean;
};

type CollectionPath = {
  id: string;
  name: string;
  entryPoint: string;
  collectorRole: string;
  dataSubjectType: string;
  collectionFormat: string;
  storageLocation: string;
  storageEnvironment: string;
  encryptionStatus: string;
  accessRoles: string;
  sharingStatus: string;
  retentionPeriod: string;
  deletionMethod: string;
  privacyNotice: string;
  consentStatus: string;
  parentalConsent: string;
  crossBorderTransfer: string;
};

export default function AssessmentPage() {
  const [industryId, setIndustryId] = useState("");
  const [businessTypeId, setBusinessTypeId] = useState("");
  const [processId, setProcessId] = useState("");

  const [selectedEntryPoints, setSelectedEntryPoints] =
    useState<string[]>([]);

  const [selectedFields, setSelectedFields] =
    useState<string[]>([]);

  const [customEntryPoint, setCustomEntryPoint] =
    useState("");

  const [customEntryPoints, setCustomEntryPoints] =
    useState<CustomEntryPoint[]>([]);

  const [customField, setCustomField] =
    useState("");

  const [customFields, setCustomFields] =
    useState<CustomField[]>([]);

  const [collectionPaths, setCollectionPaths] =
    useState<CollectionPath[]>([]);

  const [pathName, setPathName] = useState("");
  const [pathEntryPoint, setPathEntryPoint] = useState("");

  const [collectorRole, setCollectorRole] = useState("");
  const [dataSubjectType, setDataSubjectType] = useState("");
  const [collectionFormat, setCollectionFormat] = useState("");
  const [storageLocation, setStorageLocation] = useState("");
  const [storageEnvironment, setStorageEnvironment] = useState("");
  const [encryptionStatus, setEncryptionStatus] = useState("");
  const [accessRoles, setAccessRoles] = useState("");
  const [sharingStatus, setSharingStatus] = useState("");
  const [retentionPeriod, setRetentionPeriod] = useState("");
  const [deletionMethod, setDeletionMethod] = useState("");
  const [privacyNotice, setPrivacyNotice] = useState("");
  const [consentStatus, setConsentStatus] = useState("");
  const [parentalConsent, setParentalConsent] = useState("");
  const [crossBorderTransfer, setCrossBorderTransfer] = useState("");

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

  function resetCollectionPathForm() {
    setPathName("");
    setPathEntryPoint("");
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
    setCollectionPaths([]);

    resetCollectionPathForm();
  }

  function resetFromBusinessType() {
    setProcessId("");
    setSelectedEntryPoints([]);
    setCustomEntryPoints([]);
    setCustomEntryPoint("");
    setSelectedFields([]);
    setCustomFields([]);
    setCustomField("");
    setCollectionPaths([]);

    resetCollectionPathForm();
  }

  function resetFromProcess() {
    setSelectedEntryPoints([]);
    setCustomEntryPoints([]);
    setCustomEntryPoint("");
    setSelectedFields([]);
    setCustomFields([]);
    setCustomField("");
    setCollectionPaths([]);

    resetCollectionPathForm();
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

    const newEntryPoint: CustomEntryPoint = {
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

    setSelectedEntryPoints((current) =>
      current.filter((item) => item !== id)
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

    const newField: CustomField = {
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

    setSelectedFields((current) =>
      current.filter((item) => item !== id)
    );
  }

  function addCollectionPath() {
    if (!pathName.trim()) return;

    const newPath: CollectionPath = {
      id: `PATH-${Date.now()}`,
      name: pathName.trim(),
      entryPoint: pathEntryPoint,
      collectorRole,
      dataSubjectType,
      collectionFormat,
      storageLocation,
      storageEnvironment,
      encryptionStatus,
      accessRoles,
      sharingStatus,
      retentionPeriod,
      deletionMethod,
      privacyNotice,
      consentStatus,
      parentalConsent,
      crossBorderTransfer,
    };

    setCollectionPaths((current) => [
      ...current,
      newPath,
    ]);

    resetCollectionPathForm();
  }

  function removeCollectionPath(id: string) {
    setCollectionPaths((current) =>
      current.filter((item) => item.id !== id)
    );
  }

  const availableEntryPoints = [
    ...entryPoints.map((item) => ({
      id: item.id,
      name: item.name,
    })),
    ...customEntryPoints.map((item) => ({
      id: item.id,
      name: item.name,
    })),
  ];

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
          Map your personal-data entry points, understand how
          information moves through your business, identify
          privacy risks, and create a practical data inventory.
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
                A detailed assessment pack for this
                business type is not available yet.
                More sector packs will be added
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
              Select all channels through which your
              organisation may collect personal data.
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
                Don't see your data entry
                point?
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
                            Custom
                            entry
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
              <SummaryBox>
                {selectedEntryPoints.length +
                  customEntryPoints.length}{" "}
                data entry point
                {selectedEntryPoints.length +
                  customEntryPoints.length !==
                1
                  ? "s"
                  : ""}{" "}
                selected
              </SummaryBox>
            )}
          </section>
        )}

        {/* STEP 5 */}
        {businessTypeId === "EDU-SCH" &&
          (selectedEntryPoints.length >
            0 ||
            customEntryPoints.length >
              0) && (
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
                your organisation collects
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
                    color:
                      "#0f172a",
                    fontSize:
                      "17px",
                    marginBottom:
                      "8px",
                  }}
                >
                  Don't see your
                  data field?
                </h3>

                <p style={noticeStyle}>
                  Add a custom
                  personal-data
                  field.
                </p>

                <div
                  style={{
                    display:
                      "flex",
                    gap: "10px",
                    marginTop:
                      "12px",
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
                        event
                          .target
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
                    style={
                      buttonStyle
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
                <SummaryBox>
                  {selectedFields.length +
                    customFields.length}{" "}
                  data field
                  {selectedFields.length +
                    customFields.length !==
                  1
                    ? "s"
                    : ""}{" "}
                  selected
                </SummaryBox>
              )}
            </section>
          )}

        {/* STEP 6 */}
        {businessTypeId === "EDU-SCH" &&
          selectedFields.length > 0 && (
            <section style={cardStyle}>
              <StepNumber number="6" />

              <h2 style={headingStyle}>
                Map your collection
                paths
              </h2>

              <p
                style={{
                  ...noticeStyle,
                  marginBottom:
                    "24px",
                }}
              >
                The same personal data may
                enter your organisation
                through multiple channels.
                Create one collection path
                for each real-world way
                the data is collected,
                stored or handled.
              </p>

              <div
                style={{
                  padding:
                    "16px",
                  background:
                    "#eff6ff",
                  border:
                    "1px solid #bfdbfe",
                  borderRadius:
                    "10px",
                  marginBottom:
                    "24px",
                  color:
                    "#1e3a8a",
                  lineHeight:
                    1.6,
                }}
              >
                <strong>
                  Example:
                </strong>{" "}
                Admission data could
                arrive through a physical
                form, Google Form, website,
                WhatsApp or email. Each
                should be recorded as a
                separate collection path.
              </div>

              <FormField
                label="Collection path name"
              >
                <input
                  type="text"
                  value={pathName}
                  onChange={(event) =>
                    setPathName(
                      event.target.value
                    )
                  }
                  placeholder="e.g. Physical Admission Form"
                  style={inputStyle}
                />
              </FormField>

              <FormField
                label="Which data entry point does this path use?"
              >
                <select
                  value={pathEntryPoint}
                  onChange={(event) =>
                    setPathEntryPoint(
                      event.target.value
                    )
                  }
                  style={selectStyle}
                >
                  <option value="">
                    Select entry point...
                  </option>

                  {availableEntryPoints.map(
                    (item) => (
                      <option
                        key={item.id}
                        value={
                          item.id
                        }
                      >
                        {item.name}
                      </option>
                    )
                  )}
                </select>
              </FormField>

              <FormField
                label="Who collects this data?"
              >
                <select
                  value={
                    collectorRole
                  }
                  onChange={(
                    event
                  ) =>
                    setCollectorRole(
                      event
                        .target
                        .value
                    )
                  }
                  style={
                    selectStyle
                  }
                >
                  <option value="">
                    Select role...
                  </option>
                  <option>
                    Admissions Executive
                  </option>
                  <option>
                    Teacher
                  </option>
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
                  <option>
                    Other
                  </option>
                </select>
              </FormField>

              <FormField
                label="Who is the data subject?"
              >
                <select
                  value={
                    dataSubjectType
                  }
                  onChange={(
                    event
                  ) =>
                    setDataSubjectType(
                      event
                        .target
                        .value
                    )
                  }
                  style={
                    selectStyle
                  }
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
                  <option>
                    Other
                  </option>
                </select>
              </FormField>

              <FormField
                label="How is the data collected?"
              >
                <select
                  value={
                    collectionFormat
                  }
                  onChange={(
                    event
                  ) =>
                    setCollectionFormat(
                      event
                        .target
                        .value
                    )
                  }
                  style={
                    selectStyle
                  }
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
                  <option>
                    Email
                  </option>
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
                  <option>
                    Other
                  </option>
                </select>
              </FormField>

              <FormField
                label="Where is the data stored?"
              >
                <select
                  value={
                    storageLocation
                  }
                  onChange={(
                    event
                  ) =>
                    setStorageLocation(
                      event
                        .target
                        .value
                    )
                  }
                  style={
                    selectStyle
                  }
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
                  <option>
                    CRM
                  </option>
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
                  <option>
                    Other
                  </option>
                </select>
              </FormField>

              <FormField
                label="Where is the storage environment?"
              >
                <select
                  value={
                    storageEnvironment
                  }
                  onChange={(
                    event
                  ) =>
                    setStorageEnvironment(
                      event
                        .target
                        .value
                    )
                  }
                  style={
                    selectStyle
                  }
                >
                  <option value="">
                    Select environment...
                  </option>
                  <option>
                    Physical
                  </option>
                  <option>
                    Cloud
                  </option>
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
                    Hybrid / Physical + Logical
                  </option>
                  <option>
                    Third-party Hosted
                  </option>
                  <option>
                    Unknown
                  </option>
                </select>
              </FormField>

              <FormField
                label="How is the stored data protected?"
              >
                <select
                  value={
                    encryptionStatus
                  }
                  onChange={(
                    event
                  ) =>
                    setEncryptionStatus(
                      event
                        .target
                        .value
                    )
                  }
                  style={
                    selectStyle
                  }
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
                    Not applicable - physical only
                  </option>
                  <option>
                    Unknown
                  </option>
                </select>
              </FormField>

              <FormField
                label="Who can access the data?"
              >
                <input
                  type="text"
                  value={
                    accessRoles
                  }
                  onChange={(
                    event
                  ) =>
                    setAccessRoles(
                      event
                        .target
                        .value
                    )
                  }
                  placeholder="e.g. Admissions team, Principal, IT administrator"
                  style={inputStyle}
                />
              </FormField>

              <FormField
                label="Is the data shared with anyone else?"
              >
                <select
                  value={
                    sharingStatus
                  }
                  onChange={(
                    event
                  ) =>
                    setSharingStatus(
                      event
                        .target
                        .value
                    )
                  }
                  style={
                    selectStyle
                  }
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

              <FormField
                label="How long is the data retained?"
              >
                <select
                  value={
                    retentionPeriod
                  }
                  onChange={(
                    event
                  ) =>
                    setRetentionPeriod(
                      event
                        .target
                        .value
                    )
                  }
                  style={
                    selectStyle
                  }
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

              <FormField
                label="How is the data deleted?"
              >
                <select
                  value={
                    deletionMethod
                  }
                  onChange={(
                    event
                  ) =>
                    setDeletionMethod(
                      event
                        .target
                        .value
                    )
                  }
                  style={
                    selectStyle
                  }
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

              <FormField
                label="Is a privacy notice provided?"
              >
                <select
                  value={
                    privacyNotice
                  }
                  onChange={(
                    event
                  ) =>
                    setPrivacyNotice(
                      event
                        .target
                        .value
                    )
                  }
                  style={
                    selectStyle
                  }
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

              <FormField
                label="Is consent obtained where required?"
              >
                <select
                  value={
                    consentStatus
                  }
                  onChange={(
                    event
                  ) =>
                    setConsentStatus(
                      event
                        .target
                        .value
                    )
                  }
                  style={
                    selectStyle
                  }
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

              <FormField
                label="For minors, is parent / guardian involvement addressed?"
              >
                <select
                  value={
                    parentalConsent
                  }
                  onChange={(
                    event
                  ) =>
                    setParentalConsent(
                      event
                        .target
                        .value
                    )
                  }
                  style={
                    selectStyle
                  }
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

              <FormField
                label="Is the data transferred outside India?"
              >
                <select
                  value={
                    crossBorderTransfer
                  }
                  onChange={(
                    event
                  ) =>
                    setCrossBorderTransfer(
                      event
                        .target
                        .value
                    )
                  }
                  style={
                    selectStyle
                  }
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

              <button
                type="button"
                onClick={
                  addCollectionPath
                }
                style={{
                  ...buttonStyle,
                  marginTop: "8px",
                  width: "100%",
                }}
              >
                + Add Collection Path
              </button>

              <div
                style={{
                  marginTop: "28px",
                  padding: "16px",
                  background:
                    "#f8fafc",
                  border:
                    "1px solid #e2e8f0",
                  borderRadius:
                    "10px",
                  color:
                    "#475569",
                  lineHeight:
                    1.6,
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
                . Unknown information
                can later be highlighted
                as a privacy governance
                gap.
              </div>

              {/* PATH LIST */}
              {collectionPaths.length >
                0 && (
                <div
                  style={{
                    marginTop:
                      "30px",
                  }}
                >
                  <h3
                    style={{
                      color:
                        "#0f172a",
                      marginBottom:
                        "14px",
                    }}
                  >
                    Collection paths
                    added
                  </h3>

                  {collectionPaths.map(
                    (path) => (
                      <div
                        key={
                          path.id
                        }
                        style={{
                          padding:
                            "18px",
                          marginBottom:
                            "12px",
                          border:
                            "1px solid #cbd5e1",
                          borderRadius:
                            "10px",
                          background:
                            "white",
                        }}
                      >
                        <div
                          style={{
                            display:
                              "flex",
                            justifyContent:
                              "space-between",
                            gap:
                              "12px",
                          }}
                        >
                          <div>
                            <strong
                              style={{
                                fontSize:
                                  "17px",
                                color:
                                  "#0f172a",
                              }}
                            >
                              {
                                path.name
                              }
                            </strong>

                            <p
                              style={{
                                margin:
                                  "8px 0 0",
                                color:
                                  "#64748b",
                                lineHeight:
                                  1.6,
                              }}
                            >
                              Entry point:{" "}
                              {
                                availableEntryPoints.find(
                                  (
                                    item
                                  ) =>
                                    item.id ===
                                    path.entryPoint
                                )
                                  ?.name ||
                                "Not specified"
                              }
                              <br />
                              Collection:{" "}
                              {
                                path.collectionFormat ||
                                "Not specified"
                              }
                              <br />
                              Storage:{" "}
                              {
                                path.storageLocation ||
                                "Not specified"
                              }
                              <br />
                              Environment:{" "}
                              {
                                path.storageEnvironment ||
                                "Not specified"
                              }
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() =>
                              removeCollectionPath(
                                path.id
                              )
                            }
                            style={
                              removeButtonStyle
                            }
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )
                  )}

                  <SummaryBox>
                    {collectionPaths.length}{" "}
                    collection path
                    {collectionPaths.length !==
                    1
                      ? "s"
                      : ""}{" "}
                    mapped
                  </SummaryBox>
                </div>
              )}
            </section>
          )}

        {/* PRIVACY NOTICE */}
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
            lineHeight:
              1.6,
          }}
        >
          <strong>
            Privacy-by-design:
          </strong>{" "}
          PrivacyMap does not require
          your customers' personal data.
          Assessment responses remain in
          your browser and will be used
          locally to generate reports.
        </div>
      </div>
    </main>
  );
}

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

function SummaryBox({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        marginTop: "24px",
        padding: "16px",
        background: "#f0fdf4",
        border: "1px solid #bbf7d0",
        borderRadius: "10px",
        color: "#166534",
      }}
    >
      <strong>{children}</strong>
    </div>
  );
}

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
