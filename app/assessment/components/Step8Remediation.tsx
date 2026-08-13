import React from "react";
import type { RiskTreatmentAction, TreatmentStatus } from "../../../lib/riskTreatment";
import type { RiskLevel } from "../../../lib/privacyRisk";
import { riskBackground, riskColor, treatmentStatusBackground, treatmentStatusColor } from "./shared";

export default function Step8Remediation({
  actions,
  onStatusChange,
}: {
  actions: RiskTreatmentAction[];
  onStatusChange: (
    sourceId: string,
    status: TreatmentStatus
  ) => void;
}) {

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
    onStatusChange(
      id,
      status
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

