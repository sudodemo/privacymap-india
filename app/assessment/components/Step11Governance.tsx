"use client";

import React, { ReactNode } from "react";
import type { ResidualRiskDecisionRecord } from "../types";

export interface Step11GovernanceProps {
  decisions: ResidualRiskDecisionRecord[];
  onUpdate: (
    id: string,
    updates: Partial<ResidualRiskDecisionRecord>
  ) => void;
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

const labelStyle = {
  display: "block",
  fontWeight: 700,
  color: "#0f172a",
  marginBottom: "8px",
  fontSize: "13px",
};

const inputStyle = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "11px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: "8px",
  background: "white",
  color: "#0f172a",
  fontSize: "14px",
};

function Empty() {
  return (
    <div
      style={{
        padding: 18,
        background: "#f8fafc",
        borderRadius: 10,
        color: "#64748b",
        lineHeight: 1.6,
      }}
    >
      No residual-risk decisions are currently available.
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: ReactNode;
}) {
  return (
    <div style={{ marginTop: 12 }}>
      <label style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

function Meta({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        padding: 12,
        background: "#f8fafc",
        borderRadius: 8,
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#64748b",
          textTransform: "uppercase",
          marginBottom: 5,
        }}
      >
        {label}
      </div>

      <div
        style={{
          fontSize: 14,
          fontWeight: 600,
          color: "#334155",
          lineHeight: 1.5,
        }}
      >
        {value}
      </div>
    </div>
  );
}

function Decision({
  d,
  onUpdate,
}: {
  d: ResidualRiskDecisionRecord;
  onUpdate: (
    id: string,
    updates: Partial<ResidualRiskDecisionRecord>
  ) => void;
}) {
  return (
    <div
      style={{
        border: "1px solid #e2e8f0",
        borderRadius: 12,
        padding: 22,
        marginBottom: 18,
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 15,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 11,
              fontWeight: 700,
              color: "#64748b",
              letterSpacing: 1,
            }}
          >
            {d.id}
          </div>

          <h3
            style={{
              margin: "6px 0",
              color: "#0f172a",
            }}
          >
            {d.riskTitle}
          </h3>

          <div
            style={{
              fontSize: 13,
              color: "#475569",
            }}
          >
            {d.findingId} • {d.category}
          </div>
        </div>

        <span
          style={{
            padding: "6px 10px",
            borderRadius: 20,
            background:
              d.approvalStatus === "Approved"
                ? "#f0fdf4"
                : d.approvalStatus === "Rejected"
                ? "#fee2e2"
                : "#fffbeb",
            color:
              d.approvalStatus === "Approved"
                ? "#15803d"
                : d.approvalStatus === "Rejected"
                ? "#dc2626"
                : "#d97706",
            fontWeight: 700,
            fontSize: 12,
          }}
        >
          {d.approvalStatus}
        </span>
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",
          gap: 12,
          marginTop: 18,
        }}
      >
        <Meta
          label="Inherent risk"
          value={d.inherentRisk}
        />

        <Meta
          label="Residual risk"
          value={d.residualRisk}
        />

        <Meta
          label="Review frequency"
          value={d.reviewFrequency}
        />

        <Meta
          label="Treatment status"
          value={d.treatmentStatus}
        />
      </div>

      <div
        style={{
          display: "grid",
          gridTemplateColumns:
            "repeat(auto-fit,minmax(220px,1fr))",
          gap: 12,
          marginTop: 18,
        }}
      >
        <Field label="Accountable owner">
          <input
            value={d.accountableOwner}
            onChange={(e) =>
              onUpdate(d.id, {
                accountableOwner:
                  e.target.value,
              })
            }
            placeholder="DPO / Principal / Risk Owner"
            style={inputStyle}
          />
        </Field>

        <Field label="Decision authority">
          <input
            value={d.decisionAuthority}
            onChange={(e) =>
              onUpdate(d.id, {
                decisionAuthority:
                  e.target.value,
              })
            }
            placeholder="Approving authority"
            style={inputStyle}
          />
        </Field>

        <Field label="Review date">
          <input
            type="date"
            value={d.reviewDate}
            onChange={(e) =>
              onUpdate(d.id, {
                reviewDate:
                  e.target.value,
              })
            }
            style={inputStyle}
          />
        </Field>

        <Field label="Approval date">
          <input
            type="date"
            value={d.approvalDate}
            onChange={(e) =>
              onUpdate(d.id, {
                approvalDate:
                  e.target.value,
              })
            }
            style={inputStyle}
          />
        </Field>
      </div>

      <Field label="Decision rationale">
        <textarea
          value={d.rationale}
          onChange={(e) =>
            onUpdate(d.id, {
              rationale:
                e.target.value,
            })
          }
          rows={4}
          placeholder="Document the management decision, risk rationale, conditions and relevant considerations."
          style={{
            ...inputStyle,
            resize: "vertical",
          }}
        />
      </Field>
    </div>
  );
}

export default function Step11Governance({
  decisions,
  onUpdate,
}: Step11GovernanceProps) {
  return (
    <section
      style={{
        marginTop: 24,
        marginBottom: 24,
      }}
    >
      <div style={cardStyle}>
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 2,
            color: "#1d4ed8",
            marginBottom: 8,
          }}
        >
          STEP 11
        </div>

        <h2 style={headingStyle}>
          Residual-Risk Governance
        </h2>

        <p
          style={{
            color: "#64748b",
            lineHeight: 1.6,
            maxWidth: 800,
          }}
        >
          Review the residual-risk decisions generated from
          the assessment and record accountable ownership,
          decision authority, review dates and management
          decision rationale.
        </p>
      </div>

      <div
        style={{
          marginTop: 16,
          padding: "16px 18px",
          background: "#eff6ff",
          border: "1px solid #bfdbfe",
          borderRadius: 10,
          color: "#1e3a8a",
          fontSize: 13,
          lineHeight: 1.6,
        }}
      >
        <strong>Governance note:</strong>{" "}
        Residual-risk decisions are management decisions.
        Critical and High residual risks should receive
        appropriate accountable approval and documented
        rationale.
      </div>

      <div
        style={{
          marginTop: 20,
          background: "white",
          border: "1px solid #e2e8f0",
          borderRadius: 14,
          padding: 28,
        }}
      >
        <h2
          style={{
            marginTop: 0,
            color: "#0f172a",
          }}
        >
          Residual-Risk Decision Register
        </h2>

        {decisions.length === 0 ? (
          <Empty />
        ) : (
          decisions.map((decision) => (
            <Decision
              key={decision.id}
              d={decision}
              onUpdate={onUpdate}
            />
          ))
        )}
      </div>
    </section>
  );
}
