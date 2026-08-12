"use client";

import { useMemo, useState } from "react";
import { getBusinessTypes, getSchoolEntryPoints, kb } from "../../lib/kb";

export default function AssessmentPage() {
  const [industryId, setIndustryId] = useState("");
  const [businessTypeId, setBusinessTypeId] = useState("");
  const [processId, setProcessId] = useState("");
  const [selectedEntryPoints, setSelectedEntryPoints] =
  useState<string[]>([]);
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
  
function removeCustomEntryPoint(id: string) {
  setCustomEntryPoints((current) =>
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
    return getSchoolEntryPoints(processId || undefined);
  }, [businessTypeId, processId]);

  function resetFromIndustry() {
  setBusinessTypeId("");
  setProcessId("");
  setSelectedEntryPoints([]);
  setCustomEntryPoints([]);
  setCustomEntryPoint("");
  setSelectedFields([]);
  setCustomFields([]);
  setCustomField("");
}

  function resetFromBusinessType() {
  setProcessId("");
  setSelectedEntryPoints([]);
  setCustomEntryPoints([]);
  setCustomEntryPoint("");
  setSelectedFields([]);
  setCustomFields([]);
  setCustomField("");
}

function resetFromProcess() {
  setSelectedEntryPoints([]);
  setCustomEntryPoints([]);
  setCustomEntryPoint("");
  setSelectedFields([]);
  setCustomFields([]);
  setCustomField("");
}


  
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
          Start by identifying your industry, business type and the
          processes where personal data enters your organisation.
        </p>

        {/* Step 1 */}
        <section style={cardStyle}>
          <StepNumber number="1" />

          <h2 style={headingStyle}>Select your industry</h2>

          <select
            value={industryId}
            onChange={(event) => {
              setIndustryId(event.target.value);
              resetFromIndustry();
            }}
            style={selectStyle}
          >
            <option value="">Select industry...</option>

            {kb.industries
              .filter((item) => item.status === "active")
              .map((industry) => (
                <option key={industry.id} value={industry.id}>
                  {industry.name}
                </option>
              ))}
          </select>
        </section>

        {/* Step 2 */}
        {industryId && (
          <section style={cardStyle}>
            <StepNumber number="2" />

            <h2 style={headingStyle}>Select your business type</h2>

            <select
              value={businessTypeId}
              onChange={(event) => {
                setBusinessTypeId(event.target.value);
                resetFromBusinessType();
              }}
              style={selectStyle}
            >
              <option value="">Select business type...</option>

              {businessTypes.map((businessType) => (
                <option key={businessType.id} value={businessType.id}>
                  {businessType.name}
                </option>
              ))}
            </select>

            {businessTypes.length === 0 && (
              <p style={noticeStyle}>
                A detailed assessment pack for this business type is not
                available yet. More sector packs will be added progressively.
              </p>
            )}
          </section>
        )}

        {/* Step 3 */}
        {businessTypeId === "EDU-SCH" && (
          <section style={cardStyle}>
            <StepNumber number="3" />

            <h2 style={headingStyle}>Select a business process</h2>

            <select
              value={processId}
              onChange={(event) => {
                setProcessId(event.target.value);
                resetFromProcess();
              }}
              style={selectStyle}
            >
              <option value="">All school processes...</option>

              {processes.map((process) => (
                <option key={process.id} value={process.id}>
                  {process.name}
                </option>
              ))}
            </select>
          </section>
        )}

        {/* Step 4 */}
{businessTypeId === "EDU-SCH" && (
  <section style={cardStyle}>
    <StepNumber number="4" />

    <h2 style={headingStyle}>Potential data entry points</h2>

    <p style={{ ...noticeStyle, marginBottom: "20px" }}>
      Select all the channels through which your organisation may collect
      personal data for this process.
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
        const isSelected = selectedEntryPoints.includes(entryPoint.id);

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
              background: isSelected ? "#eff6ff" : "#f8fafc",
              cursor: "pointer",
            }}
          >
            <input
              type="checkbox"
              checked={isSelected}
              onChange={() => toggleEntryPoint(entryPoint.id)}
              style={{
                marginTop: "3px",
                width: "18px",
                height: "18px",
              }}
            />

            <span>
              <strong>{entryPoint.name}</strong>

              <span
                style={{
                  display: "block",
                  fontSize: "13px",
                  color: "#64748b",
                  marginTop: "5px",
                }}
              >
                {entryPoint.collection_method}
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
        borderTop: "1px solid #e2e8f0",
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
        Add a custom channel used by your organisation.
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
            setCustomEntryPoint(event.target.value)
          }
          placeholder="e.g. Admission kiosk"
          style={{
            flex: "1 1 300px",
            padding: "12px 14px",
            borderRadius: "8px",
            border: "1px solid #cbd5e1",
            fontSize: "15px",
          }}
        />

        <button
          type="button"
          onClick={addCustomEntryPoint}
          style={{
            padding: "12px 18px",
            borderRadius: "8px",
            border: "none",
            background: "#0f172a",
            color: "white",
            fontWeight: 600,
            cursor: "pointer",
          }}
        >
          Add
        </button>
      </div>

      {customEntryPoints.length > 0 && (
        <div style={{ marginTop: "16px" }}>
          {customEntryPoints.map((entryPoint) => (
            <div
              key={entryPoint.id}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: "space-between",
                padding: "12px 14px",
                marginBottom: "8px",
                background: "#f8fafc",
                border: "1px solid #e2e8f0",
                borderRadius: "8px",
              }}
            >
              <span>
                <strong>{entryPoint.name}</strong>

                <span
                  style={{
                    display: "block",
                    fontSize: "12px",
                    color: "#64748b",
                    marginTop: "3px",
                  }}
                >
                  Custom entry point
                </span>
              </span>

              <button
                type="button"
                onClick={() =>
                  removeCustomEntryPoint(entryPoint.id)
                }
                style={{
                  border: "none",
                  background: "transparent",
                  color: "#64748b",
                  cursor: "pointer",
                  fontSize: "13px",
                }}
              >
                Remove
              </button>
            </div>
          ))}
        </div>
      )}
    </div>

    {/* Selection summary */}
    {(selectedEntryPoints.length > 0 ||
      customEntryPoints.length > 0) && (
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
        <strong>
          {selectedEntryPoints.length +
            customEntryPoints.length}{" "}
          data entry point
          {selectedEntryPoints.length +
            customEntryPoints.length !==
          1
            ? "s"
            : ""}{" "}
          selected
        </strong>
      </div>
    )}
  </section>
)}

{/* Step 5 */}
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
        Select the personal-data fields that your organisation
        collects through the selected entry points.
      </p>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit, minmax(280px, 1fr))",
          gap: "12px",
        }}
      >
        {kb.school.fields.map((field) => {
          const isSelected =
            selectedFields.includes(field.id);

          return (
            <label
              key={field.id}
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
                onChange={() => toggleField(field.id)}
                style={{
                  marginTop: "3px",
                  width: "18px",
                  height: "18px",
                }}
              />

              <span>
                <strong>{field.name}</strong>

                <span
                  style={{
                    display: "block",
                    fontSize: "12px",
                    color: "#64748b",
                    marginTop: "5px",
                  }}
                >
                  {field.data_categories.join(", ")}
                </span>

                <span
                  style={{
                    display: "block",
                    fontSize: "12px",
                    color: field.child_relevant
                      ? "#b45309"
                      : "#64748b",
                    marginTop: "4px",
                  }}
                >
                  Data subject:{" "}
                  {field.typical_data_subjects.join(", ")}
                  {field.child_relevant
                    ? " • Child-relevant"
                    : ""}
                </span>
              </span>
            </label>
          );
        })}
      </div>

      {/* Custom field */}
      <div
        style={{
          marginTop: "24px",
          paddingTop: "20px",
          borderTop: "1px solid #e2e8f0",
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
          Add a custom personal-data field used by your
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
            value={customField}
            onChange={(event) =>
              setCustomField(event.target.value)
            }
            placeholder="e.g. Previous School Name"
            style={{
              flex: "1 1 300px",
              padding: "12px 14px",
              borderRadius: "8px",
              border: "1px solid #cbd5e1",
              fontSize: "15px",
            }}
          />

          <button
            type="button"
            onClick={addCustomField}
            style={{
              padding: "12px 18px",
              borderRadius: "8px",
              border: "none",
              background: "#0f172a",
              color: "white",
              fontWeight: 600,
              cursor: "pointer",
            }}
          >
            Add
          </button>
        </div>

        {customFields.length > 0 && (
          <div style={{ marginTop: "16px" }}>
            {customFields.map((field) => (
              <div
                key={field.id}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "12px 14px",
                  marginBottom: "8px",
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: "8px",
                }}
              >
                <span>
                  <strong>{field.name}</strong>

                  <span
                    style={{
                      display: "block",
                      fontSize: "12px",
                      color: "#64748b",
                      marginTop: "3px",
                    }}
                  >
                    Custom field
                  </span>
                </span>

                <button
                  type="button"
                  onClick={() =>
                    removeCustomField(field.id)
                  }
                  style={{
                    border: "none",
                    background: "transparent",
                    color: "#64748b",
                    cursor: "pointer",
                    fontSize: "13px",
                  }}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {(selectedFields.length > 0 ||
        customFields.length > 0) && (
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
          <strong>
            {selectedFields.length +
              customFields.length}{" "}
            data field
            {selectedFields.length +
              customFields.length !==
            1
              ? "s"
              : ""}{" "}
            selected
          </strong>
        </div>
      )}
    </section>
  )}
        
        {/* Privacy-by-design notice */}
        <div
          style={{
            marginTop: "32px",
            padding: "18px 20px",
            background: "#eff6ff",
            border: "1px solid #bfdbfe",
            borderRadius: "10px",
            color: "#1e3a8a",
            lineHeight: 1.6,
          }}
        >
          <strong>Privacy-by-design:</strong> PrivacyMap does not require
          your customers' personal data. Assessment responses will remain
          in your browser and will be used locally to generate your reports.
        </div>
      </div>
    </main>
  );
}

function StepNumber({ number }: { number: string }) {
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

const noticeStyle = {
  color: "#64748b",
  lineHeight: 1.6,
};

const entryPointStyle = {
  padding: "16px",
  border: "1px solid #e2e8f0",
  borderRadius: "10px",
  background: "#f8fafc",
};
