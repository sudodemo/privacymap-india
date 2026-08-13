"use client";

import React from "react";
import type { AssessmentProfile, RiskTreatmentAction, TreatmentStatus } from "../types";

interface Step12RemediationTrackerProps {
  assessmentProfile: AssessmentProfile;
  actions: RiskTreatmentAction[];
  onStatusChange: (
    id: string,
    status: TreatmentStatus
  ) => void;
}

const card = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: 14,
  padding: 28,
  marginBottom: 20,
};

const kicker = {
  fontSize: 13,
  fontWeight: 700,
  letterSpacing: 2,
  color: "#1d4ed8",
  marginBottom: 8,
};

const h2 = {
  marginTop: 0,
  color: "#0f172a",
};

const p = {
  color: "#64748b",
  lineHeight: 1.6,
  maxWidth: 760,
};

const grid = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(180px,1fr))",
  gap: 12,
  marginTop: 20,
};

const grid4 = {
  display: "grid",
  gridTemplateColumns:
    "repeat(auto-fit,minmax(180px,1fr))",
  gap: 10,
  marginTop: 16,
};

const profile = {
  marginTop: 18,
  padding: "14px 16px",
  background: "#f8fafc",
  border: "1px solid #e2e8f0",
  borderRadius: 10,
  color: "#475569",
  fontSize: 13,
  lineHeight: 1.6,
};

const small = {
  fontSize: 11,
  fontWeight: 700,
  color: "#64748b",
  letterSpacing: 1,
};

const label = {
  display: "block",
  fontWeight: 700,
  color: "#0f172a",
  marginBottom: 7,
  fontSize: 13,
};

const input = {
  width: "100%",
  boxSizing: "border-box" as const,
  padding: "11px 12px",
  border: "1px solid #cbd5e1",
  borderRadius: 8,
  background: "white",
  color: "#0f172a",
  fontSize: 14,
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
      No remediation actions are currently available.
    </div>
  );
}

function badge(status: TreatmentStatus) {
  const x =
    status === "Completed"
      ? {
          background: "#f0fdf4",
          color: "#15803d",
        }
      : status === "Accepted"
      ? {
          background: "#eff6ff",
          color: "#1d4ed8",
        }
      : status === "In Progress"
      ? {
          background: "#fffbeb",
          color: "#b45309",
        }
      : {
          background: "#f8fafc",
          color: "#475569",
        };

  return {
    padding: "6px 10px",
    borderRadius: 20,
    background: x.background,
    color: x.color,
    fontWeight: 700,
    fontSize: 12,
    height: "fit-content",
  };
}

function SummaryCard({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div
      style={{
        padding: 18,
        borderRadius: 10,
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#64748b",
          letterSpacing: 1,
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: 6,
          fontSize: 28,
          fontWeight: 800,
          color: "#0f172a",
        }}
      >
        {value}
      </div>
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
        {value || "—"}
      </div>
    </div>
  );
}

export default function Step12RemediationTracker({
  assessmentProfile,
  actions,
  onStatusChange,
}: Step12RemediationTrackerProps) {
  const open = actions.filter(
    (action) => action.status === "Open"
  ).length;

  const progress = actions.filter(
    (action) => action.status === "In Progress"
  ).length;

  const closed = actions.filter(
    (action) =>
      action.status === "Completed" ||
      action.status === "Accepted"
  ).length;

  return (
    <section
      style={{
        marginTop: 24,
        marginBottom: 24,
      }}
    >
      <div style={card}>
        <div style={kicker}>STEP 12</div>

        <h2 style={h2}>
          Remediation Tracker
        </h2>

        <p style={p}>
          Track treatment progress from the same
          parent-owned remediation state used by
          the assessment workflow.
        </p>

        <div style={profile}>
          <strong>
            {assessmentProfile.organisationName}
          </strong>
          {" • "}
          {assessmentProfile.assessmentName}
          {" • "}
          {assessmentProfile.assessmentId}
        </div>

        <div style={grid}>
          <SummaryCard
            label="OPEN"
            value={open}
          />

          <SummaryCard
            label="IN PROGRESS"
            value={progress}
          />

          <SummaryCard
            label="CLOSED"
            value={closed}
          />
        </div>
      </div>

      <div style={card}>
        <h2
          style={{
            marginTop: 0,
            color: "#0f172a",
          }}
        >
          Remediation Action Register
        </h2>

        {actions.length === 0 ? (
          <Empty />
        ) : (
          actions.map((action) => (
            <div
              key={action.id}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: 20,
                marginBottom: 14,
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
                  <div style={small}>
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

                  <p
                    style={{
                      margin: 0,
                      color: "#475569",
                      lineHeight: 1.6,
                    }}
                  >
                    {action.recommendedTreatment}
                  </p>
                </div>

                <span style={badge(action.status)}>
                  {action.status}
                </span>
              </div>

              <div style={grid4}>
                <Meta
                  label="Priority"
                  value={action.priority}
                />

                <Meta
                  label="Owner"
                  value={action.owner}
                />

                <Meta
                  label="Timeframe"
                  value={action.timeframe}
                />

                <Meta
                  label="Effort"
                  value={action.effort}
                />
              </div>

              <div
                style={{
                  marginTop: 14,
                  maxWidth: 320,
                }}
              >
                <label style={label}>
                  Treatment status
                </label>

                <select
                  value={action.status}
                  onChange={(event) =>
                    onStatusChange(
                      action.id,
                      event.target
                        .value as TreatmentStatus
                    )
                  }
                  style={input}
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
          ))
        )}
      </div>
    </section>
  );
}
