"use client";

import React from "react";
import {
  reportToCsv,
  reportToJson,
  reportToMarkdown,
  reportToXml,
  downloadTextFile,
  downloadPdf,
} from "../lib/reportExport";

type ReportFormat = "pdf" | "csv" | "xml" | "json" | "markdown";

interface AssessmentReportProps {
  report: any;
}

const cardStyle: React.CSSProperties = {
  background: "#ffffff",
  border: "1px solid #e2e8f0",
  borderRadius: 14,
  padding: 28,
  marginBottom: 20,
};

const sectionStyle: React.CSSProperties = {
  ...cardStyle,
  marginTop: 24,
};

const headingStyle: React.CSSProperties = {
  margin: 0,
  color: "#0f172a",
};

const subHeadingStyle: React.CSSProperties = {
  margin: "0 0 10px",
  color: "#0f172a",
};

const mutedStyle: React.CSSProperties = {
  color: "#64748b",
  lineHeight: 1.65,
};

const labelStyle: React.CSSProperties = {
  fontSize: 11,
  fontWeight: 700,
  letterSpacing: 1,
  textTransform: "uppercase",
  color: "#64748b",
  marginBottom: 5,
};

const valueStyle: React.CSSProperties = {
  color: "#0f172a",
  fontSize: 15,
  fontWeight: 600,
};

const gridStyle: React.CSSProperties = {
  display: "grid",
  gridTemplateColumns: "repeat(auto-fit, minmax(190px, 1fr))",
  gap: 14,
  marginTop: 18,
};

function safeString(value: unknown, fallback = "Not Available"): string {
  if (value === null || value === undefined) return fallback;

  const result = String(value).trim();

  return result || fallback;
}

function safeNumber(
  value: unknown,
  fallback = "Not Available"
): string {
  if (typeof value === "number" && Number.isFinite(value)) {
    return String(value);
  }

  if (typeof value === "string" && value.trim() !== "") {
    return value;
  }

  return fallback;
}

function firstDefined(
  source: any,
  keys: string[],
  fallback = "Not Available"
): string {
  if (!source) return fallback;

  for (const key of keys) {
    const value = source[key];

    if (
      value !== undefined &&
      value !== null &&
      String(value).trim() !== ""
    ) {
      return String(value);
    }
  }

  return fallback;
}

function arrayValue(source: any, keys: string[]): any[] {
  if (!source) return [];

  for (const key of keys) {
    if (Array.isArray(source[key])) {
      return source[key];
    }
  }

  return [];
}

function getReportData(report: any): any {
  return report?.report ?? report ?? {};
}

function getProfile(report: any): any {
  const data = getReportData(report);

  return (
    data.assessmentProfile ??
    data.profile ??
    report?.assessmentProfile ??
    {}
  );
}

function getRiskResult(report: any): any {
  const data = getReportData(report);

  return (
    data.riskResult ??
    data.riskAssessment ??
    report?.riskResult ??
    {}
  );
}

function getFindings(report: any): any[] {
  const data = getReportData(report);
  const risk = getRiskResult(report);

  return arrayValue(data, [
    "privacyRiskFindings",
    "riskFindings",
    "findings",
  ]).length
    ? arrayValue(data, [
        "privacyRiskFindings",
        "riskFindings",
        "findings",
      ])
    : arrayValue(risk, [
        "privacyRiskFindings",
        "riskFindings",
        "findings",
      ]);
}

function getTreatmentActions(report: any): any[] {
  const data = getReportData(report);

  return arrayValue(data, [
    "treatmentActions",
    "actions",
    "riskTreatmentActions",
    "treatmentPlan",
  ]);
}

function getResidualDecisions(report: any): any[] {
  const data = getReportData(report);

  return arrayValue(data, [
    "residualRiskDecisions",
    "decisions",
    "residualRiskDecisionRegister",
  ]);
}

function getEvidence(report: any): any[] {
  const data = getReportData(report);

  return arrayValue(data, [
    "evidence",
    "evidenceRecords",
    "evidenceItems",
  ]);
}

function getRiskSummary(report: any): any {
  const data = getReportData(report);
  const risk = getRiskResult(report);

  return (
    data.riskSummary ??
    data.summary ??
    risk.summary ??
    risk.riskSummary ??
    {}
  );
}

function getOverallRisk(report: any): string {
  const data = getReportData(report);
  const risk = getRiskResult(report);
  const summary = getRiskSummary(report);

  return firstDefined(
    summary,
    [
      "overallRisk",
      "overallRiskLevel",
      "riskLevel",
      "overallRating",
    ],
    firstDefined(
      risk,
      [
        "overallRisk",
        "overallRiskLevel",
        "riskLevel",
        "overallRating",
      ],
      firstDefined(data, [
        "overallRisk",
        "overallRiskLevel",
        "riskLevel",
      ])
    )
  );
}

function getRiskScore(report: any): string {
  const data = getReportData(report);
  const risk = getRiskResult(report);
  const summary = getRiskSummary(report);

  return firstDefined(
    summary,
    [
      "riskScore",
      "overallRiskScore",
      "score",
      "totalScore",
    ],
    firstDefined(
      risk,
      [
        "riskScore",
        "overallRiskScore",
        "score",
        "totalScore",
      ],
      firstDefined(data, [
        "riskScore",
        "overallRiskScore",
        "score",
      ])
    )
  );
}

function getCompletionStatus(report: any): string {
  const data = getReportData(report);

  return firstDefined(
    data,
    ["completionStatus", "status", "assessmentStatus"],
    "Completed"
  );
}

function getReportDate(report: any): string {
  const data = getReportData(report);

  return firstDefined(
    data,
    ["reportDate", "generatedAt", "completedAt", "assessmentDate"],
    new Date().toLocaleDateString()
  );
}

function getRiskDescription(report: any): string {
  const data = getReportData(report);
  const risk = getRiskResult(report);

  return firstDefined(
    data,
    ["riskSummaryText", "executiveSummary", "summaryText"],
    firstDefined(
      risk,
      ["riskSummaryText", "executiveSummary", "summaryText"],
      "The assessment has been completed based on the information provided during the assessment."
    )
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div
      style={{
        padding: 18,
        border: "1px solid #e2e8f0",
        borderRadius: 10,
        background: "#f8fafc",
      }}
    >
      <div style={labelStyle}>{label}</div>
      <div style={valueStyle}>{value}</div>
    </div>
  );
}

function SectionTitle({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div style={{ marginBottom: 18 }}>
      {eyebrow && (
        <div
          style={{
            fontSize: 12,
            fontWeight: 700,
            letterSpacing: 1.5,
            color: "#1d4ed8",
            marginBottom: 7,
          }}
        >
          {eyebrow}
        </div>
      )}

      <h2 style={headingStyle}>{title}</h2>

      {description && (
        <p
          style={{
            ...mutedStyle,
            marginTop: 8,
            marginBottom: 0,
          }}
        >
          {description}
        </p>
      )}
    </div>
  );
}

function formatFindingTitle(finding: any, index: number): string {
  return firstDefined(
    finding,
    ["title", "riskTitle", "name", "findingTitle"],
    `Privacy Risk Finding ${index + 1}`
  );
}

function formatFindingDescription(finding: any): string {
  return firstDefined(
    finding,
    [
      "description",
      "finding",
      "riskDescription",
      "details",
      "observation",
    ],
    "No additional finding description was recorded."
  );
}

function formatFindingRisk(finding: any): string {
  return firstDefined(
    finding,
    [
      "riskLevel",
      "risk",
      "severity",
      "rating",
      "inherentRisk",
    ]
  );
}

function getActionTitle(action: any, index: number): string {
  return firstDefined(
    action,
    [
      "riskTitle",
      "title",
      "name",
      "findingTitle",
      "action",
    ],
    `Risk Treatment Action ${index + 1}`
  );
}

function getActionTreatment(action: any): string {
  return firstDefined(
    action,
    [
      "recommendedTreatment",
      "treatment",
      "treatmentDescription",
      "description",
      "recommendation",
    ],
    "No treatment description recorded."
  );
}

function getActionStatus(action: any): string {
  return firstDefined(action, ["status", "treatmentStatus"], "Open");
}

function getDecisionTitle(decision: any, index: number): string {
  return firstDefined(
    decision,
    ["riskTitle", "title", "name"],
    `Residual Risk Decision ${index + 1}`
  );
}

function getEvidenceTitle(evidence: any, index: number): string {
  return firstDefined(
    evidence,
    ["title", "name", "evidenceTitle"],
    `Evidence Item ${index + 1}`
  );
}

function ReportHeader({ report }: { report: any }) {
  const profile = getProfile(report);

  return (
    <div
      style={{
        ...cardStyle,
        borderTop: "5px solid #1d4ed8",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          gap: 20,
          flexWrap: "wrap",
        }}
      >
        <div>
          <div
            style={{
              fontSize: 12,
              fontWeight: 800,
              letterSpacing: 2,
              color: "#1d4ed8",
              marginBottom: 8,
            }}
          >
            PRIVACYMAP
          </div>

          <h1
            style={{
              margin: 0,
              color: "#0f172a",
              fontSize: 30,
              lineHeight: 1.2,
            }}
          >
            DPDP Privacy Assessment Report
          </h1>

          <p
            style={{
              margin: "10px 0 0",
              color: "#64748b",
              fontSize: 15,
            }}
          >
            Assessment and privacy-risk management report
          </p>
        </div>

        <div
          style={{
            minWidth: 220,
            padding: 16,
            borderRadius: 10,
            background: "#f8fafc",
            border: "1px solid #e2e8f0",
          }}
        >
          <div style={labelStyle}>Assessment ID</div>

          <div style={valueStyle}>
            {safeString(profile.assessmentId)}
          </div>

          <div
            style={{
              ...labelStyle,
              marginTop: 12,
            }}
          >
            Report Date
          </div>

          <div style={valueStyle}>{getReportDate(report)}</div>
        </div>
      </div>

      <div style={gridStyle}>
        <Metric
          label="Organisation"
          value={safeString(profile.organisationName)}
        />

        <Metric
          label="Assessment"
          value={safeString(profile.assessmentName)}
        />

        <Metric
          label="Business Type"
          value={safeString(
            profile.businessTypeName ??
              profile.businessType ??
              profile.businessTypeId
          )}
        />

        <Metric
          label="Assessment Status"
          value={getCompletionStatus(report)}
        />
      </div>
    </div>
  );
}

function ExecutiveSummary({ report }: { report: any }) {
  const overallRisk = getOverallRisk(report);
  const riskScore = getRiskScore(report);
  const findings = getFindings(report);
  const actions = getTreatmentActions(report);
  const decisions = getResidualDecisions(report);
  const evidence = getEvidence(report);

  return (
    <section style={sectionStyle}>
      <SectionTitle
        eyebrow="EXECUTIVE SUMMARY"
        title="Assessment Overview"
        description="A consolidated view of the assessment outcome and the current privacy-risk management state."
      />

      <div style={gridStyle}>
        <Metric
          label="Overall Risk"
          value={overallRisk}
        />

        <Metric
          label="Risk Score"
          value={riskScore}
        />

        <Metric
          label="Privacy Risk Findings"
          value={String(findings.length)}
        />

        <Metric
          label="Treatment Actions"
          value={String(actions.length)}
        />

        <Metric
          label="Residual Risk Decisions"
          value={String(decisions.length)}
        />

        <Metric
          label="Evidence Items"
          value={String(evidence.length)}
        />
      </div>

      <div
        style={{
          marginTop: 20,
          padding: 18,
          background: "#f8fafc",
          borderRadius: 10,
          border: "1px solid #e2e8f0",
        }}
      >
        <div style={labelStyle}>Assessment Summary</div>

        <p
          style={{
            margin: 0,
            color: "#334155",
            lineHeight: 1.7,
          }}
        >
          {getRiskDescription(report)}
        </p>
      </div>

      {overallRisk === "Not Available" &&
        riskScore === "Not Available" && (
          <div
            style={{
              marginTop: 16,
              padding: "12px 14px",
              borderRadius: 8,
              background: "#fffbeb",
              border: "1px solid #fde68a",
              color: "#92400e",
              fontSize: 13,
              lineHeight: 1.6,
            }}
          >
            <strong>Risk summary note:</strong>{" "}
            Overall Risk and Risk Score were not present in
            the supplied assessment result. This does not
            prevent the remainder of the report from being
            generated.
          </div>
        )}
    </section>
  );
}

function PrivacyRiskFindings({
  report,
}: {
  report: any;
}) {
  const findings = getFindings(report);

  return (
    <section style={sectionStyle}>
      <SectionTitle
        eyebrow="RISK ASSESSMENT"
        title="Privacy Risk Findings"
        description="Privacy risks identified from the assessment responses."
      />

      {findings.length === 0 ? (
        <div
          style={{
            padding: 18,
            background: "#f8fafc",
            borderRadius: 10,
            color: "#64748b",
          }}
        >
          No privacy risk findings were recorded.
        </div>
      ) : (
        findings.map((finding, index) => (
          <div
            key={
              safeString(
                finding?.id,
                `finding-${index}`
              )
            }
            style={{
              padding: 18,
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              marginBottom:
                index === findings.length - 1 ? 0 : 12,
              background: "#ffffff",
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
              <h3
                style={{
                  margin: 0,
                  color: "#0f172a",
                  fontSize: 17,
                }}
              >
                {formatFindingTitle(finding, index)}
              </h3>

              <span
                style={{
                  padding: "5px 10px",
                  borderRadius: 20,
                  background: "#f8fafc",
                  border: "1px solid #e2e8f0",
                  color: "#475569",
                  fontSize: 12,
                  fontWeight: 700,
                }}
              >
                {formatFindingRisk(finding)}
              </span>
            </div>

            <p
              style={{
                margin: "10px 0 0",
                color: "#475569",
                lineHeight: 1.65,
              }}
            >
              {formatFindingDescription(finding)}
            </p>
          </div>
        ))
      )}
    </section>
  );
}

function TreatmentSection({
  report,
}: {
  report: any;
}) {
  const actions = getTreatmentActions(report);

  return (
    <section style={sectionStyle}>
      <SectionTitle
        eyebrow="RISK TREATMENT"
        title="Risk Treatment & Action Plan"
        description="Actions established to address identified privacy risks."
      />

      {actions.length === 0 ? (
        <div
          style={{
            padding: 18,
            background: "#f8fafc",
            borderRadius: 10,
            color: "#64748b",
          }}
        >
          No treatment actions were recorded.
        </div>
      ) : (
        actions.map((action, index) => (
          <div
            key={safeString(action?.id, `action-${index}`)}
            style={{
              padding: 18,
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              marginBottom:
                index === actions.length - 1 ? 0 : 12,
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
                <h3
                  style={{
                    margin: 0,
                    color: "#0f172a",
                    fontSize: 16,
                  }}
                >
                  {getActionTitle(action, index)}
                </h3>

                <p
                  style={{
                    margin: "8px 0 0",
                    color: "#475569",
                    lineHeight: 1.6,
                  }}
                >
                  {getActionTreatment(action)}
                </p>
              </div>

              <span
                style={{
                  padding: "6px 10px",
                  borderRadius: 20,
                  background: "#eff6ff",
                  color: "#1d4ed8",
                  fontSize: 12,
                  fontWeight: 700,
                  height: "fit-content",
                }}
              >
                {getActionStatus(action)}
              </span>
            </div>

            <div style={gridStyle}>
              <Metric
                label="Priority"
                value={firstDefined(
                  action,
                  ["priority"]
                )}
              />

              <Metric
                label="Effort"
                value={firstDefined(
                  action,
                  ["effort"]
                )}
              />

              <Metric
                label="Status"
                value={getActionStatus(action)}
              />

              <Metric
                label="Category"
                value={firstDefined(
                  action,
                  ["category"]
                )}
              />
            </div>
          </div>
        ))
      )}
    </section>
  );
}

function GovernanceSection({
  report,
}: {
  report: any;
}) {
  const decisions = getResidualDecisions(report);

  return (
    <section style={sectionStyle}>
      <SectionTitle
        eyebrow="RISK GOVERNANCE"
        title="Residual Risk Decision Register"
        description="Ownership, approval and residual-risk decisions recorded during the assessment."
      />

      {decisions.length === 0 ? (
        <div
          style={{
            padding: 18,
            background: "#f8fafc",
            borderRadius: 10,
            color: "#64748b",
          }}
        >
          No residual-risk decisions were recorded.
        </div>
      ) : (
        decisions.map((decision, index) => (
          <div
            key={safeString(
              decision?.id,
              `decision-${index}`
            )}
            style={{
              padding: 18,
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              marginBottom:
                index === decisions.length - 1 ? 0 : 12,
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
                <h3
                  style={{
                    margin: 0,
                    color: "#0f172a",
                    fontSize: 16,
                  }}
                >
                  {getDecisionTitle(decision, index)}
                </h3>

                <p
                  style={{
                    margin: "7px 0 0",
                    color: "#64748b",
                    fontSize: 13,
                  }}
                >
                  {firstDefined(
                    decision,
                    ["findingId", "category"],
                    ""
                  )}
                </p>
              </div>

              <span
                style={{
                  padding: "6px 10px",
                  borderRadius: 20,
                  background:
                    decision?.approvalStatus ===
                    "Approved"
                      ? "#f0fdf4"
                      : decision?.approvalStatus ===
                        "Rejected"
                      ? "#fee2e2"
                      : "#fffbeb",
                  color:
                    decision?.approvalStatus ===
                    "Approved"
                      ? "#15803d"
                      : decision?.approvalStatus ===
                        "Rejected"
                      ? "#dc2626"
                      : "#b45309",
                  fontSize: 12,
                  fontWeight: 700,
                  height: "fit-content",
                }}
              >
                {firstDefined(
                  decision,
                  ["approvalStatus"],
                  "Pending"
                )}
              </span>
            </div>

            <div style={gridStyle}>
              <Metric
                label="Inherent Risk"
                value={firstDefined(
                  decision,
                  ["inherentRisk"]
                )}
              />

              <Metric
                label="Residual Risk"
                value={firstDefined(
                  decision,
                  ["residualRisk"]
                )}
              />

              <Metric
                label="Accountable Owner"
                value={firstDefined(
                  decision,
                  ["accountableOwner"]
                )}
              />

              <Metric
                label="Decision Authority"
                value={firstDefined(
                  decision,
                  ["decisionAuthority"]
                )}
              />

              <Metric
                label="Review Date"
                value={firstDefined(
                  decision,
                  ["reviewDate"]
                )}
              />

              <Metric
                label="Next Review"
                value={firstDefined(
                  decision,
                  ["nextReviewDate"]
                )}
              />
            </div>

            <div
              style={{
                marginTop: 16,
                padding: 14,
                background: "#f8fafc",
                borderRadius: 8,
              }}
            >
              <div style={labelStyle}>
                Decision Rationale
              </div>

              <div
                style={{
                  color: "#334155",
                  lineHeight: 1.6,
                }}
              >
                {firstDefined(
                  decision,
                  ["rationale", "decisionRationale"],
                  "No rationale recorded."
                )}
              </div>
            </div>
          </div>
        ))
      )}
    </section>
  );
}

function EvidenceSection({
  report,
}: {
  report: any;
}) {
  const evidence = getEvidence(report);

  return (
    <section style={sectionStyle}>
      <SectionTitle
        eyebrow="EVIDENCE & CLOSURE"
        title="Evidence & Assessment Closure"
        description="Evidence and closure state captured as part of the final assessment."
      />

      {evidence.length === 0 ? (
        <div
          style={{
            padding: 18,
            background: "#f8fafc",
            borderRadius: 10,
            color: "#64748b",
          }}
        >
          No evidence records were included in the
          report.
        </div>
      ) : (
        evidence.map((item, index) => (
          <div
            key={safeString(
              item?.id,
              `evidence-${index}`
            )}
            style={{
              padding: 16,
              border: "1px solid #e2e8f0",
              borderRadius: 10,
              marginBottom:
                index === evidence.length - 1 ? 0 : 10,
            }}
          >
            <strong style={{ color: "#0f172a" }}>
              {getEvidenceTitle(item, index)}
            </strong>

            <div
              style={{
                marginTop: 7,
                color: "#64748b",
                lineHeight: 1.6,
              }}
            >
              {firstDefined(
                item,
                ["description", "details", "notes"],
                "No additional evidence description recorded."
              )}
            </div>
          </div>
        ))
      )}

      <div
        style={{
          marginTop: 18,
          padding: 16,
          background: "#f0fdf4",
          border: "1px solid #bbf7d0",
          borderRadius: 10,
          color: "#166534",
          lineHeight: 1.6,
        }}
      >
        <strong>Assessment closure:</strong>{" "}
        The report reflects the information and decisions
        recorded in the assessment at the time of report
        generation.
      </div>
    </section>
  );
}

function DownloadReport({
  report,
}: {
  report: any;
}) {
  const [format, setFormat] =
    React.useState<ReportFormat>("pdf");

  const [downloading, setDownloading] =
    React.useState(false);

  function buildFileName(extension: string): string {
    const profile = getProfile(report);

    const organisation = safeString(
      profile.organisationName,
      "PrivacyMap-Assessment"
    )
      .replace(/[^a-zA-Z0-9-_]+/g, "-")
      .replace(/^-+|-+$/g, "");

    const assessmentId = safeString(
      profile.assessmentId,
      "Report"
    )
      .replace(/[^a-zA-Z0-9-_]+/g, "-")
      .replace(/^-+|-+$/g, "");

    return `${organisation}-${assessmentId}.${extension}`;
  }

  async function handleDownload() {
    setDownloading(true);

    try {
      if (format === "pdf") {
          downloadPdf(
            report,
            buildFileName("pdf")
          );
          return;
        }

      if (format === "csv") {
        downloadTextFile(
          reportToCsv(report),
          buildFileName("csv"),
          "text/csv;charset=utf-8"
        );
        return;
      }

      if (format === "xml") {
        downloadTextFile(
          reportToXml(report),
          buildFileName("xml"),
          "application/xml;charset=utf-8"
        );
        return;
      }

      if (format === "json") {
        downloadTextFile(
          reportToJson(report),
          buildFileName("json"),
          "application/json;charset=utf-8"
        );
        return;
      }

      downloadTextFile(
        reportToMarkdown(report),
        buildFileName("md"),
        "text/markdown;charset=utf-8"
      );
    } catch (error) {
      console.error(
        "Report download failed:",
        error
      );

      window.alert(
        "The report could not be downloaded. Please try again."
      );
    } finally {
      setDownloading(false);
    }
  }

  return (
    <section
      style={{
        ...sectionStyle,
        border: "2px solid #1d4ed8",
      }}
    >
      <SectionTitle
        eyebrow="REPORT"
        title="Download Report"
        description="Choose the format in which you want to export the completed assessment."
      />

      <div
        style={{
          display: "flex",
          gap: 12,
          alignItems: "center",
          flexWrap: "wrap",
        }}
      >
        <select
          value={format}
          onChange={(event) =>
            setFormat(
              event.target.value as ReportFormat
            )
          }
          disabled={downloading}
          style={{
            padding: "12px 14px",
            borderRadius: 8,
            border: "1px solid #cbd5e1",
            background: "#ffffff",
            color: "#0f172a",
            fontSize: 14,
            minWidth: 220,
          }}
        >
          <option value="pdf">PDF</option>
          <option value="csv">CSV</option>
          <option value="xml">XML</option>
          <option value="json">JSON</option>
          <option value="markdown">Markdown</option>
        </select>

        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          style={{
            padding: "12px 20px",
            borderRadius: 8,
            border: "none",
            background: downloading
              ? "#94a3b8"
              : "#1d4ed8",
            color: "#ffffff",
            fontWeight: 700,
            cursor: downloading
              ? "not-allowed"
              : "pointer",
          }}
        >
          {downloading
            ? "Preparing..."
            : "Download Report"}
        </button>
      </div>
    </section>
  );
}

export default function AssessmentReport({
  report,
}: AssessmentReportProps) {
  if (!report) {
    return (
      <section style={sectionStyle}>
        <SectionTitle
          title="Assessment Report"
          description="No assessment report data is currently available."
        />
      </section>
    );
  }

  return (
    <div
      style={{
        width: "100%",
        maxWidth: 1180,
        margin: "32px auto 48px",
      }}
    >
      <ReportHeader report={report} />

      <ExecutiveSummary report={report} />

      <PrivacyRiskFindings report={report} />

      <TreatmentSection report={report} />

      <GovernanceSection report={report} />

      <EvidenceSection report={report} />

      <DownloadReport report={report} />
    </div>
  );
}
