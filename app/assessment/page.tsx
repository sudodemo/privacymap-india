"use client";

import { useMemo, useState } from "react";
import { getBusinessTypes, getSchoolEntryPoints, kb } from "../../lib/kb";

export default function AssessmentPage() {
  const [industryId, setIndustryId] = useState("");
  const [businessTypeId, setBusinessTypeId] = useState("");
  const [processId, setProcessId] = useState("");

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
  }

  function resetFromBusinessType() {
    setProcessId("");
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
              onChange={(event) => setProcessId(event.target.value)}
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
              These are knowledge-base suggestions. Your organisation can
              add custom entry points later.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(250px, 1fr))",
                gap: "14px",
              }}
            >
              {entryPoints.map((entryPoint) => (
                <div key={entryPoint.id} style={entryPointStyle}>
                  <strong>{entryPoint.name}</strong>

                  <div
                    style={{
                      fontSize: "13px",
                      color: "#64748b",
                      marginTop: "6px",
                    }}
                  >
                    {entryPoint.collection_method}
                  </div>
                </div>
              ))}
            </div>

            {entryPoints.length === 0 && (
              <p style={noticeStyle}>
                No entry points found for this selection.
              </p>
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
