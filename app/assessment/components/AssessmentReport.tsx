"use client";

import { useMemo, useState } from "react";
import type { AssessmentReportData } from "../lib/reportExport";
import {
  reportToCsv,
  reportToJson,
  reportToMarkdown,
  reportToXml,
  downloadTextFile,
  downloadPdf,
  getReportFindings,
  reportAnchorId,
} from "../lib/reportExport";

type ReportFormat = "pdf" | "csv" | "xml" | "json" | "markdown";

interface AssessmentReportProps {
  report: AssessmentReportData;
}

function safeActionValue(action: unknown, keys: string[]): string {
  if (!action || typeof action !== "object") return "Not Available";
  const record = action as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null && String(value).trim()) {
      return String(value);
    }
  }
  return "Not Available";
}

function riskBadgeStyle(risk: string) {
  const value = risk.toLowerCase();
  if (value.includes("critical") || value.includes("high")) {
    return {
      background: "#fef2f2",
      color: "#b91c1c",
      border: "1px solid #fecaca",
    };
  }
  if (value.includes("medium") || value.includes("moderate")) {
    return {
      background: "#fffbeb",
      color: "#b45309",
      border: "1px solid #fde68a",
    };
  }
  if (value.includes("low")) {
    return {
      background: "#f0fdf4",
      color: "#15803d",
      border: "1px solid #bbf7d0",
    };
  }
  return {
    background: "#f8fafc",
    color: "#475569",
    border: "1px solid #e2e8f0",
  };
}

function statusStyle(status: string) {
  const value = status.toLowerCase();
  if (value === "completed") {
    return { background: "#f0fdf4", color: "#15803d" };
  }
  if (value === "accepted" || value === "approved") {
    return { background: "#eff6ff", color: "#1d4ed8" };
  }
  if (value === "in progress" || value === "pending") {
    return { background: "#fffbeb", color: "#b45309" };
  }
  if (value === "rejected") {
    return { background: "#fef2f2", color: "#b91c1c" };
  }
  return { background: "#f8fafc", color: "#475569" };
}

function OpenLink({ step, title }: { step: number; title: string }) {
  return (
    <a
      href={`#${reportAnchorId(step, title)}`}
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: 5,
        marginTop: 12,
        color: "#1d4ed8",
        fontSize: 13,
        fontWeight: 700,
        textDecoration: "none",
      }}
    >
      Open in Step {step} →
    </a>
  );
}

function Section({
  step,
  kicker,
  title,
  description,
  children,
}: {
  step?: number;
  kicker: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        marginTop: 26,
        paddingTop: 24,
        borderTop: "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 800,
          letterSpacing: 1.8,
          color: "#1d4ed8",
          marginBottom: 7,
        }}
      >
        {kicker}
      </div>
      <h3
        style={{
          margin: "0 0 7px",
          color: "#0f172a",
          fontSize: 21,
        }}
      >
        {title}
      </h3>
      {description && (
        <p
          style={{
            margin: "0 0 16px",
            color: "#64748b",
            lineHeight: 1.6,
            fontSize: 14,
          }}
        >
          {description}
        </p>
      )}
      {children}
    </section>
  );
}

export default function AssessmentReport({ report }: AssessmentReportProps) {
  const [format, setFormat] = useState<ReportFormat>("pdf");
  const [downloading, setDownloading] = useState(false);

  const filenameBase = useMemo(
    () =>
      buildFilename(
        report.assessmentProfile.organisationName,
        report.assessmentProfile.assessmentId
      ),
    [report.assessmentProfile]
  );

  const findings = report.findings?.length
    ? report.findings
    : getReportFindings(report.riskResult);

  const treatmentActions = report.treatmentActions || [];
  const decisions = report.residualRiskDecisions || [];
  const evidenceRecords = report.evidenceRecords || {};

  function downloadReport() {
    setDownloading(true);
    try {
      if (format === "pdf") {
        downloadPdf(report, `${filenameBase}.pdf`);
        return;
      }
      if (format === "csv") {
        downloadTextFile(
          reportToCsv(report),
          `${filenameBase}.csv`,
          "text/csv;charset=utf-8"
        );
        return;
      }
      if (format === "xml") {
        downloadTextFile(
          reportToXml(report),
          `${filenameBase}.xml`,
          "application/xml;charset=utf-8"
        );
        return;
      }
      if (format === "json") {
        downloadTextFile(
          reportToJson(report),
          `${filenameBase}.json`,
          "application/json;charset=utf-8"
        );
        return;
      }
      downloadTextFile(
        reportToMarkdown(report),
        `${filenameBase}.md`,
        "text/markdown;charset=utf-8"
      );
    } finally {
      window.setTimeout(() => setDownloading(false), 500);
    }
  }

  return (
    <section
      id="assessment-report"
      style={{
        marginTop: 34,
        marginBottom: 34,
      }}
    >
      <div
        style={{
          background: "white",
          border: "1px solid #cbd5e1",
          borderRadius: 16,
          padding: 28,
          boxShadow: "0 4px 18px rgba(15,23,42,0.04)",
        }}
      >
        <div
          style={{
            fontSize: 11,
            fontWeight: 800,
            letterSpacing: 2,
            color: "#1d4ed8",
            marginBottom: 8,
          }}
        >
          FINAL REPORT
        </div>

        <h2 style={{ margin: "0 0 7px", color: "#0f172a" }}>
          आत्मनिर्भर DPDP Assessment Report
        </h2>

        <p
          style={{
            margin: "0 0 18px",
            color: "#64748b",
            lineHeight: 1.6,
          }}
        >
          Your data. Your browser. Your assessment.
        </p>

        <div
          style={{
            padding: "14px 16px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 10,
            color: "#475569",
            fontSize: 13,
          }}
        >
          <strong style={{ color: "#0f172a" }}>
            {report.assessmentProfile.organisationName}
          </strong>
          {" | "}
          {report.assessmentProfile.assessmentName}
          {" | Assessment ID: "}
          {report.assessmentProfile.assessmentId}
          <div style={{ marginTop: 5 }}>
            Report generated: {report.generatedAt}
          </div>
        </div>

        <Section
          kicker="EXECUTIVE SUMMARY"
          title="Assessment Overview"
          description="A consolidated view of the assessment outcome and current privacy-risk management state."
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(160px,1fr))",
              gap: 10,
            }}
          >
            {[
              ["OVERALL RISK", report.riskSummary.overallRisk],
              ["RISK SCORE", report.riskSummary.riskScore],
              ["PRIVACY RISK FINDINGS", String(findings.length)],
              ["TREATMENT ACTIONS", String(treatmentActions.length)],
              ["RESIDUAL RISK DECISIONS", String(decisions.length)],
              [
                "EVIDENCE ITEMS",
                String(Object.keys(evidenceRecords).length),
              ],
            ].map(([label, value]) => (
              <div
                key={label}
                style={{
                  padding: 16,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  borderRadius: 10,
                }}
              >
                <div
                  style={{
                    fontSize: 10,
                    fontWeight: 800,
                    letterSpacing: 1,
                    color: "#64748b",
                  }}
                >
                  {label}
                </div>
                <div
                  style={{
                    marginTop: 7,
                    fontSize: 22,
                    fontWeight: 800,
                    color: "#0f172a",
                  }}
                >
                  {value}
                </div>
              </div>
            ))}
          </div>
        </Section>

        <Section
          step={7}
          kicker="RISK ASSESSMENT"
          title="Privacy Risk Findings"
          description="Privacy risks identified from the assessment responses."
        >
          {findings.length === 0 ? (
            <Empty text="No privacy risk findings are available." />
          ) : (
            findings.map((finding) => {
              const badge = riskBadgeStyle(finding.risk);
              return (
                <div
                  key={finding.id}
                  style={{
                    border: "1px solid #e2e8f0",
                    borderRadius: 12,
                    padding: 18,
                    marginBottom: 12,
                    scrollMarginTop: 24,
                  }}
                >
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      gap: 12,
                      flexWrap: "wrap",
                    }}
                  >
                    <div>
                      <div
                        style={{
                          fontSize: 11,
                          fontWeight: 800,
                          letterSpacing: 1,
                          color: "#64748b",
                        }}
                      >
                        {finding.category}
                      </div>
                      <h4
                        style={{
                          margin: "5px 0",
                          color: "#0f172a",
                          fontSize: 16,
                        }}
                      >
                        {finding.title}
                      </h4>
                    </div>
                    <span
                      style={{
                        ...badge,
                        padding: "5px 9px",
                        borderRadius: 20,
                        fontSize: 11,
                        fontWeight: 800,
                      }}
                    >
                      {finding.risk}
                    </span>
                  </div>

                  <div
                    style={{
                      marginTop: 10,
                      color: "#475569",
                      lineHeight: 1.6,
                      fontSize: 13,
                    }}
                  >
                    {finding.description}
                  </div>

                  <div
                    style={{
                      marginTop: 12,
                      padding: "11px 13px",
                      background: "#f8fafc",
                      borderRadius: 8,
                      color: "#334155",
                      fontSize: 13,
                      lineHeight: 1.55,
                    }}
                  >
                    <strong>Recommended action:</strong>{" "}
                    {finding.recommendedAction}
                  </div>

                  <OpenLink step={7} title={finding.title} />
                </div>
              );
            })
          )}
        </Section>

        <Section
          step={8}
          kicker="RISK TREATMENT"
          title="Risk Treatment & Action Plan"
          description="Actions established to address identified privacy risks."
        >
          {treatmentActions.map((action) => {
            const title = String(action.riskTitle || "Risk treatment");
            const status = String(action.status || "Not Available");
            const badge = statusStyle(status);
            return (
              <div
                key={action.id}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  padding: 18,
                  marginBottom: 12,
                }}
              >
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    gap: 12,
                  }}
                >
                  <div>
                    <div style={{ fontSize: 11, fontWeight: 800, color: "#64748b" }}>
                      {action.category}
                    </div>
                    <h4 style={{ margin: "5px 0", color: "#0f172a" }}>
                      {title}
                    </h4>
                  </div>
                  <span
                    style={{
                      ...badge,
                      padding: "5px 9px",
                      borderRadius: 20,
                      fontSize: 11,
                      fontWeight: 800,
                    }}
                  >
                    {status}
                  </span>
                </div>

                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit,minmax(150px,1fr))",
                    gap: 8,
                    marginTop: 12,
                  }}
                >
                  <Mini label="Priority" value={String(action.priority)} />
                  <Mini
                    label="Owner"
                    value={safeActionValue(action, [
                      "owner",
                      "suggestedOwner",
                      "recommendedOwner",
                      "accountableOwner",
                    ])}
                  />
                  <Mini
                    label="Timeframe"
                    value={safeActionValue(action, [
                      "timeframe",
                      "suggestedTimeframe",
                      "recommendedTimeframe",
                      "targetTimeframe",
                    ])}
                  />
                  <Mini label="Effort" value={String(action.effort)} />
                </div>

                <div
                  style={{
                    marginTop: 12,
                    color: "#475569",
                    fontSize: 13,
                    lineHeight: 1.6,
                  }}
                >
                  <strong>Recommended treatment:</strong>{" "}
                  {safeActionValue(action, [
                    "recommendedTreatment",
                    "treatment",
                    "recommendedAction",
                    "action",
                  ])}
                </div>

                <OpenLink step={8} title={title} />
              </div>
            );
          })}
        </Section>

        <Section
          step={9}
          kicker="RESIDUAL RISK"
          title="Residual Risk Decision Register"
          description="Residual-risk decisions, rationale and current approval state."
        >
          {decisions.map((decision) => (
            <div
              key={decision.id}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: 18,
                marginBottom: 12,
              }}
            >
              <h4 style={{ margin: "0 0 8px", color: "#0f172a" }}>
                {decision.riskTitle}
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit,minmax(150px,1fr))",
                  gap: 8,
                }}
              >
                <Mini label="Inherent Risk" value={decision.inherentRisk} />
                <Mini label="Residual Risk" value={decision.residualRisk} />
                <Mini label="Decision" value={decision.decision} />
                <Mini label="Approval" value={decision.approvalStatus} />
              </div>
              <p
                style={{
                  color: "#475569",
                  fontSize: 13,
                  lineHeight: 1.6,
                  margin: "12px 0 0",
                }}
              >
                <strong>Rationale:</strong> {decision.rationale}
              </p>
              <OpenLink step={9} title={decision.riskTitle} />
            </div>
          ))}
        </Section>

        <Section
          kicker="DPDP MAPPING"
          title="DPDP Requirement Mapping"
          description="Control mappings are maintained by the Step 10 assessment component and are not invented by the reporting layer."
        >
          <div
            style={{
              padding: 14,
              background: "#f8fafc",
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              color: "#475569",
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            Step 10 mapping state is preserved in the assessment workflow.
            The export layer reports only values available in the assessment
            state.
          </div>
        </Section>

        <Section
          step={11}
          kicker="RISK GOVERNANCE"
          title="Risk Governance & Approval"
          description="Ownership, authority, approval and review requirements."
        >
          {decisions.map((decision) => (
            <div
              key={decision.id}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: 18,
                marginBottom: 12,
              }}
            >
              <h4 style={{ margin: "0 0 10px", color: "#0f172a" }}>
                {decision.riskTitle}
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit,minmax(170px,1fr))",
                  gap: 8,
                }}
              >
                <Mini label="Accountable Owner" value={decision.accountableOwner} />
                <Mini label="Decision Authority" value={decision.decisionAuthority} />
                <Mini label="Approval Status" value={decision.approvalStatus} />
                <Mini label="Review Date" value={decision.reviewDate} />
                <Mini label="Next Review" value={decision.nextReviewDate} />
                <Mini label="Treatment" value={decision.treatmentStatus} />
              </div>
              <OpenLink step={11} title={decision.riskTitle} />
            </div>
          ))}
        </Section>

        <Section
          step={12}
          kicker="REMEDIATION"
          title="Remediation Tracker"
          description="Current treatment progress from the parent-owned remediation state."
        >
          {treatmentActions.map((action) => (
            <div
              key={action.id}
              style={{
                border: "1px solid #e2e8f0",
                borderRadius: 12,
                padding: 18,
                marginBottom: 12,
              }}
            >
              <h4 style={{ margin: "0 0 8px", color: "#0f172a" }}>
                {action.riskTitle}
              </h4>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit,minmax(150px,1fr))",
                  gap: 8,
                }}
              >
                <Mini label="Status" value={String(action.status)} />
                <Mini label="Priority" value={String(action.priority)} />
                <Mini
                  label="Owner"
                  value={safeActionValue(action, [
                    "owner",
                    "suggestedOwner",
                    "recommendedOwner",
                    "accountableOwner",
                  ])}
                />
                <Mini label="Effort" value={String(action.effort)} />
              </div>
              <OpenLink step={12} title={String(action.riskTitle)} />
            </div>
          ))}
        </Section>

        <Section
          step={13}
          kicker="EVIDENCE & CLOSURE"
          title="Evidence & Assessment Closure"
          description="Evidence state captured as part of the final assessment."
        >
          {treatmentActions.map((action) => {
            const evidence = evidenceRecords[action.id];
            return (
              <div
                key={action.id}
                style={{
                  border: "1px solid #e2e8f0",
                  borderRadius: 12,
                  padding: 18,
                  marginBottom: 12,
                }}
              >
                <h4 style={{ margin: "0 0 10px", color: "#0f172a" }}>
                  {action.riskTitle}
                </h4>
                <div
                  style={{
                    display: "grid",
                    gridTemplateColumns:
                      "repeat(auto-fit,minmax(160px,1fr))",
                    gap: 8,
                  }}
                >
                  <Mini label="Treatment Status" value={String(action.status)} />
                  <Mini
                    label="Evidence Reference"
                    value={evidence?.reference || "Not recorded"}
                  />
                  <Mini
                    label="Evidence Owner"
                    value={evidence?.owner || "Not recorded"}
                  />
                  <Mini
                    label="Verified"
                    value={evidence?.verified ? "Yes" : "No"}
                  />
                </div>
                <p
                  style={{
                    margin: "10px 0 0",
                    color: "#475569",
                    fontSize: 13,
                    lineHeight: 1.6,
                  }}
                >
                  <strong>Closure notes:</strong>{" "}
                  {evidence?.notes || "Not recorded"}
                </p>
                <OpenLink step={13} title={String(action.riskTitle)} />
              </div>
            );
          })}
        </Section>

        <div
          style={{
            marginTop: 28,
            padding: "15px 16px",
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
            borderRadius: 10,
            color: "#475569",
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          <strong style={{ color: "#0f172a" }}>
            Confidential Information
          </strong>
          {" | "}
          PrivacyMap India | Atmanirbhar DPDP Assessment
          <br />
          This assessment report is intended for the organisation and its
          authorised recipients.
        </div>

        <div
          style={{
            marginTop: 22,
            paddingTop: 22,
            borderTop: "1px solid #e2e8f0",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "minmax(220px,1fr) auto",
              gap: 12,
              alignItems: "end",
            }}
          >
            <div>
              <label
                style={{
                  display: "block",
                  fontWeight: 700,
                  color: "#0f172a",
                  marginBottom: 7,
                  fontSize: 13,
                }}
              >
                Download format
              </label>
              <select
                value={format}
                onChange={(event) =>
                  setFormat(event.target.value as ReportFormat)
                }
                style={{
                  width: "100%",
                  boxSizing: "border-box",
                  padding: "12px 14px",
                  border: "1px solid #cbd5e1",
                  borderRadius: 8,
                  background: "white",
                  color: "#0f172a",
                  fontSize: 15,
                }}
              >
                <option value="pdf">PDF — Human-readable report</option>
                <option value="csv">CSV — Spreadsheet / analysis</option>
                <option value="xml">XML — Structured interchange</option>
                <option value="json">JSON — Structured data</option>
                <option value="markdown">Markdown — Documentation</option>
              </select>
            </div>

            <button
              type="button"
              onClick={downloadReport}
              disabled={downloading}
              style={{
                padding: "12px 22px",
                border: "none",
                borderRadius: 8,
                background: downloading ? "#94a3b8" : "#1d4ed8",
                color: "white",
                fontWeight: 700,
                fontSize: 15,
                cursor: downloading ? "wait" : "pointer",
                whiteSpace: "nowrap",
              }}
            >
              {downloading
                ? "Preparing..."
                : `Download ${format.toUpperCase()}`}
            </button>
          </div>

          <div
            style={{
              marginTop: 16,
              padding: "12px 14px",
              background: "#eff6ff",
              border: "1px solid #bfdbfe",
              borderRadius: 8,
              color: "#1e3a8a",
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            <strong>Privacy-by-design:</strong> Reports are generated locally
            in the browser. No assessment data is uploaded to a reporting
            server.
          </div>
        </div>
      </div>
    </section>
  );
}

function Mini({ label, value }: { label: string; value: string }) {
  return (
    <div
      style={{
        padding: "10px 12px",
        background: "#f8fafc",
        borderRadius: 8,
        border: "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          fontSize: 10,
          fontWeight: 800,
          letterSpacing: 0.8,
          color: "#64748b",
          textTransform: "uppercase",
        }}
      >
        {label}
      </div>
      <div
        style={{
          marginTop: 5,
          fontSize: 13,
          fontWeight: 600,
          color: "#334155",
        }}
      >
        {value || "Not Available"}
      </div>
    </div>
  );
}

function Empty({ text }: { text: string }) {
  return (
    <div
      style={{
        padding: 16,
        background: "#f8fafc",
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        color: "#64748b",
        fontSize: 13,
      }}
    >
      {text}
    </div>
  );
}

function buildFilename(organisationName: string, assessmentId: string): string {
  const organisation = organisationName
    .trim()
    .replace(/[^a-zA-Z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  const id = assessmentId
    .trim()
    .replace(/[^a-zA-Z0-9_-]+/g, "-");

  return `PrivacyMap-${organisation || "Assessment"}-${id || "Report"}`;
}
