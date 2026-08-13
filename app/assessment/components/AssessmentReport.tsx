```tsx
"use client";

import type { AssessmentReportData } from "../lib/reportBuilder";
import {
  buildJsonExport,
  buildMarkdownReport,
  reportFileName,
} from "../lib/reportBuilder";

interface AssessmentReportProps {
  report: AssessmentReportData;
}

export default function AssessmentReport({
  report,
}: AssessmentReportProps) {
  const markdown =
    buildMarkdownReport(report);

  const json =
    buildJsonExport(report);

  const findings =
    report.risk.findings;

  const critical =
    findings.filter(
      (finding) =>
        finding.level === "Critical"
    ).length;

  const high =
    findings.filter(
      (finding) =>
        finding.level === "High"
    ).length;

  const medium =
    findings.filter(
      (finding) =>
        finding.level === "Medium"
    ).length;

  const low =
    findings.filter(
      (finding) =>
        finding.level === "Low"
    ).length;

  const open =
    report.treatmentActions.filter(
      (action) =>
        action.status === "Open"
    ).length;

  const inProgress =
    report.treatmentActions.filter(
      (action) =>
        action.status === "In Progress"
    ).length;

  const completed =
    report.treatmentActions.filter(
      (action) =>
        action.status === "Completed" ||
        action.status === "Accepted"
    ).length;

  const pendingApproval =
    report.residualRiskDecisions.filter(
      (decision) =>
        decision.approvalStatus ===
        "Pending"
    ).length;

  function download(
    content: string,
    fileName: string,
    mimeType: string
  ) {
    const blob = new Blob(
      [content],
      { type: mimeType }
    );

    const url =
      URL.createObjectURL(blob);

    const anchor =
      document.createElement("a");

    anchor.href = url;
    anchor.download = fileName;

    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();

    URL.revokeObjectURL(url);
  }

  function downloadMarkdown() {
    download(
      markdown,
      reportFileName(
        report.profile,
        "md"
      ),
      "text/markdown;charset=utf-8"
    );
  }

  function downloadJson() {
    download(
      json,
      reportFileName(
        report.profile,
        "json"
      ),
      "application/json;charset=utf-8"
    );
  }

  function printReport() {
    window.print();
  }

  return (
    <section
      id="assessment-report"
      style={{
        marginTop: 32,
        marginBottom: 32,
      }}
    >
      <div
        className="report-toolbar"
        style={{
          background: "white",
          border:
            "1px solid #e2e8f0",
          borderRadius: 14,
          padding: 22,
          marginBottom: 20,
        }}
      >
        <div
          style={{
            display: "flex",
            justifyContent:
              "space-between",
            alignItems: "center",
            gap: 16,
            flexWrap: "wrap",
          }}
        >
          <div>
            <div
              style={{
                fontSize: 12,
                fontWeight: 700,
                letterSpacing: 2,
                color: "#1d4ed8",
              }}
            >
              REPORT
            </div>

            <h2
              style={{
                margin:
                  "6px 0 4px",
                color: "#0f172a",
              }}
            >
              Assessment Report
            </h2>

            <div
              style={{
                color: "#64748b",
                fontSize: 13,
              }}
            >
              {report.profile.organisationName}
              {" • "}
              {report.profile.assessmentId}
            </div>
          </div>

          <div
            style={{
              display: "flex",
              gap: 10,
              flexWrap: "wrap",
            }}
          >
            <button
              type="button"
              onClick={printReport}
              style={buttonStyle}
            >
              Print / Save PDF
            </button>

            <button
              type="button"
              onClick={downloadMarkdown}
              style={secondaryButtonStyle}
            >
              Download Markdown
            </button>

            <button
              type="button"
              onClick={downloadJson}
              style={secondaryButtonStyle}
            >
              Download JSON
            </button>
          </div>
        </div>
      </div>

      <div
        className="print-report"
        style={{
          background: "white",
          border:
            "1px solid #e2e8f0",
          borderRadius: 14,
          padding: 36,
        }}
      >
        <header
          style={{
            borderBottom:
              "2px solid #e2e8f0",
            paddingBottom: 24,
            marginBottom: 28,
          }}
        >
          <div
            style={{
              fontSize: 13,
              fontWeight: 800,
              letterSpacing: 3,
              color: "#1d4ed8",
            }}
          >
            PRIVACYMAP INDIA
          </div>

          <h1
            style={{
              fontSize: 32,
              margin:
                "10px 0 8px",
              color: "#0f172a",
            }}
          >
            DPDP Privacy Assessment Report
          </h1>

          <div
            style={{
              fontSize: 20,
              fontWeight: 700,
              color: "#334155",
            }}
          >
            {report.profile.organisationName}
          </div>

          <div
            style={{
              marginTop: 8,
              color: "#64748b",
              fontSize: 13,
            }}
          >
            {report.profile.assessmentName}
            {" • "}
            Assessment ID:{" "}
            {report.profile.assessmentId}
          </div>

          <div
            style={{
              marginTop: 4,
              color: "#64748b",
              fontSize: 13,
            }}
          >
            Assessment date:{" "}
            {report.profile.assessmentDate}
            {" • "}
            Version:{" "}
            {report.profile.assessmentVersion}
          </div>
        </header>

        <ReportSection title="Executive Summary">
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(170px,1fr))",
              gap: 12,
            }}
          >
            <Metric
              label="OVERALL RISK"
              value={
                report.risk.overallRisk
              }
            />

            <Metric
              label="RISK SCORE"
              value={`${report.risk.riskScore}/100`}
            />

            <Metric
              label="FINDINGS"
              value={
                findings.length
              }
            />

            <Metric
              label="PENDING APPROVAL"
              value={pendingApproval}
            />
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(140px,1fr))",
              gap: 10,
              marginTop: 16,
            }}
          >
            <MiniMetric
              label="Critical"
              value={critical}
            />

            <MiniMetric
              label="High"
              value={high}
            />

            <MiniMetric
              label="Medium"
              value={medium}
            />

            <MiniMetric
              label="Low"
              value={low}
            />
          </div>
        </ReportSection>

        <ReportSection title="Assessment Profile">
          <InfoGrid
            items={[
              [
                "Organisation / School",
                report.profile
                  .organisationName,
              ],
              [
                "Assessment",
                report.profile
                  .assessmentName,
              ],
              [
                "Assessment Owner",
                report.profile
                  .assessmentOwner ||
                  "Not recorded",
              ],
              [
                "Assessment ID",
                report.profile
                  .assessmentId,
              ],
              [
                "Assessment Date",
                report.profile
                  .assessmentDate,
              ],
              [
                "Version",
                report.profile
                  .assessmentVersion,
              ],
            ]}
          />
        </ReportSection>

        <ReportSection title="Business Context">
          <InfoGrid
            items={[
              [
                "Industry",
                report.businessContext
                  .industryId ||
                  "Not selected",
              ],
              [
                "Business Type",
                report.businessContext
                  .businessTypeId ||
                  "Not selected",
              ],
              [
                "Processing",
                report.businessContext
                  .processId ||
                  "Not selected",
              ],
            ]}
          />
        </ReportSection>

        <ReportSection title="Data Processing Context">
          <ReportList
            title="Data Entry Points"
            values={[
              ...report.dataContext
                .entryPoints,
              ...report.dataContext
                .customEntryPoints,
            ]}
          />

          <ReportList
            title="Personal Data Fields"
            values={[
              ...report.dataContext
                .fields,
              ...report.dataContext
                .customFields,
            ]}
          />

          <ReportList
            title="Data Subjects"
            values={
              report.dataContext
                .dataSubjectTypes
            }
          />

          <ReportList
            title="Storage Environments"
            values={
              report.dataContext
                .storageEnvironments
            }
          />

          <ReportList
            title="Encryption Status"
            values={
              report.dataContext
                .encryptionStatuses
            }
          />

          <ReportList
            title="Retention"
            values={
              report.dataContext
                .retentionPeriods
            }
          />

          <ReportList
            title="Deletion"
            values={
              report.dataContext
                .deletionMethods
            }
          />

          <ReportList
            title="Privacy Notices"
            values={
              report.dataContext
                .privacyNotices
            }
          />

          <ReportList
            title="Consent / Lawful Basis"
            values={
              report.dataContext
                .consentStatuses
            }
          />

          <ReportList
            title="Parental Consent"
            values={
              report.dataContext
                .parentalConsentStatuses
            }
          />

          <ReportList
            title="Cross-Border Transfers"
            values={
              report.dataContext
                .crossBorderTransfers
            }
          />
        </ReportSection>

        <ReportSection title="Detailed Privacy Risk Findings">
          {findings.length === 0 ? (
            <Empty>
              No privacy-risk findings
              were generated.
            </Empty>
          ) : (
            findings.map(
              (finding, index) => (
                <div
                  key={finding.id}
                  style={{
                    border:
                      "1px solid #e2e8f0",
                    borderRadius: 10,
                    padding: 18,
                    marginBottom: 14,
                  }}
                >
                  <div
                    style={{
                      fontSize: 11,
                      fontWeight: 700,
                      color: "#64748b",
                    }}
                  >
                    FINDING {index + 1}
                    {" • "}
                    {finding.id}
                  </div>

                  <h3
                    style={{
                      margin:
                        "6px 0",
                      color: "#0f172a",
                    }}
                  >
                    {finding.title}
                  </h3>

                  <div
                    style={{
                      display: "flex",
                      gap: 8,
                      flexWrap: "wrap",
                      marginBottom: 10,
                    }}
                  >
                    <Badge
                      label={
                        finding.category
                      }
                    />

                    <Badge
                      label={
                        finding.level
                      }
                    />
                  </div>

                  <p
                    style={{
                      color: "#475569",
                      lineHeight: 1.6,
                    }}
                  >
                    {finding.description ||
                      "No detailed description recorded."}
                  </p>

                  <div
                    style={{
                      padding: 14,
                      background:
                        "#f8fafc",
                      borderRadius: 8,
                      color: "#334155",
                      lineHeight: 1.6,
                    }}
                  >
                    <strong>
                      Recommended action:
                    </strong>{" "}
                    {finding.recommendation ||
                      "See remediation plan."}
                  </div>
                </div>
              )
            )
          )}
        </ReportSection>

        <ReportSection title="Remediation Summary">
          <div
            style={{
              display: "grid",
              gridTemplateColumns:
                "repeat(auto-fit,minmax(150px,1fr))",
              gap: 10,
              marginBottom: 18,
            }}
          >
            <MiniMetric
              label="Open"
              value={open}
            />

            <MiniMetric
              label="In Progress"
              value={inProgress}
            />

            <MiniMetric
              label="Completed / Accepted"
              value={completed}
            />
          </div>

          {report.treatmentActions.map(
            (action) => (
              <div
                key={action.id}
                style={{
                  border:
                    "1px solid #e2e8f0",
                  borderRadius: 10,
                  padding: 16,
                  marginBottom: 12,
                }}
              >
                <h3
                  style={{
                    margin:
                      "0 0 6px",
                    color: "#0f172a",
                  }}
                >
                  {action.riskTitle}
                </h3>

                <div
                  style={{
                    fontSize: 13,
                    color: "#64748b",
                    marginBottom: 10,
                  }}
                >
                  {action.category}
                  {" • "}
                  {action.status}
                </div>

                <InfoGrid
                  items={[
                    [
                      "Priority",
                      action.priority,
                    ],
                    [
                      "Owner",
                      action.owner,
                    ],
                    [
                      "Timeframe",
                      action.timeframe,
                    ],
                    [
                      "Effort",
                      action.effort,
                    ],
                  ]}
                />

                <p
                  style={{
                    color: "#475569",
                    lineHeight: 1.6,
                  }}
                >
                  {action.recommendedTreatment}
                </p>
              </div>
            )
          )}
        </ReportSection>

        <ReportSection title="Residual Risk Governance">
          {report.residualRiskDecisions.length ===
          0 ? (
            <Empty>
              No residual-risk decisions
              are currently available.
            </Empty>
          ) : (
            report.residualRiskDecisions.map(
              (decision) => (
                <div
                  key={decision.id}
                  style={{
                    border:
                      "1px solid #e2e8f0",
                    borderRadius: 10,
                    padding: 18,
                    marginBottom: 14,
                  }}
                >
                  <h3
                    style={{
                      margin:
                        "0 0 8px",
                      color: "#0f172a",
                    }}
                  >
                    {decision.riskTitle}
                  </h3>

                  <InfoGrid
                    items={[
                      [
                        "Inherent Risk",
                        decision.inherentRisk,
                      ],
                      [
                        "Residual Risk",
                        decision.residualRisk,
                      ],
                      [
                        "Decision",
                        decision.decision,
                      ],
                      [
                        "Approval",
                        decision.approvalStatus,
                      ],
                      [
                        "Owner",
                        decision.accountableOwner ||
                          "Not recorded",
                      ],
                      [
                        "Review Date",
                        decision.reviewDate ||
                          "Not recorded",
                      ],
                      [
                        "Treatment",
                        decision.treatmentStatus,
                      ],
                    ]}
                  />

                  <p
                    style={{
                      color: "#475569",
                      lineHeight: 1.6,
                    }}
                  >
                    <strong>
                      Rationale:
                    </strong>{" "}
                    {decision.rationale ||
                      "Not recorded."}
                  </p>

                  {decision.escalationRequired && (
                    <div
                      style={{
                        padding:
                          "12px 14px",
                        background:
                          "#fff7ed",
                        border:
                          "1px solid #fed7aa",
                        borderRadius: 8,
                        color:
                          "#9a3412",
                        fontSize: 13,
                      }}
                    >
                      <strong>
                        Escalation required:
                      </strong>{" "}
                      {decision.escalationReason}
                    </div>
                  )}
                </div>
              )
            )
          )}
        </ReportSection>

        <ReportSection title="Report Limitations & DPDP Notice">
          <div
            style={{
              padding: 16,
              background:
                "#eff6ff",
              border:
                "1px solid #bfdbfe",
              borderRadius: 10,
              color: "#1e3a8a",
              lineHeight: 1.7,
              fontSize: 13,
            }}
          >
            <p>
              This report is a
              privacy-risk and
              governance assessment
              generated from the
              information entered into
              PrivacyMap India.
            </p>

            <p>
              It is not a legal opinion,
              certification, audit
              opinion or automatic
              determination of DPDP
              compliance.
            </p>

            <p>
              DPDP control mappings
              should be reviewed against
              the applicable official
              legislation, rules,
              notifications, amendments
              and other authoritative
              sources.
            </p>

            <p
              style={{
                marginBottom: 0,
              }}
            >
              Assessment responses remain
              in the user's browser and
              are used locally for
              assessment and report
              generation.
            </p>
          </div>
        </ReportSection>

        <footer
          style={{
            borderTop:
              "1px solid #e2e8f0",
            paddingTop: 18,
            marginTop: 30,
            color: "#64748b",
            fontSize: 12,
          }}
        >
          PrivacyMap India
          {" • "}
          {report.profile.assessmentId}
        </footer>
      </div>

      <style jsx global>{`
        @media print {
          body {
            background: white !important;
          }

          .report-toolbar {
            display: none !important;
          }

          #assessment-report {
            margin: 0 !important;
          }

          .print-report {
            border: none !important;
            border-radius: 0 !important;
            padding: 0 !important;
          }

          .print-report section {
            break-inside: avoid;
          }
        }
      `}</style>
    </section>
  );
}

function ReportSection({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section
      style={{
        marginBottom: 30,
      }}
    >
      <h2
        style={{
          color: "#0f172a",
          fontSize: 20,
          borderBottom:
            "1px solid #e2e8f0",
          paddingBottom: 10,
          marginBottom: 18,
        }}
      >
        {title}
      </h2>

      {children}
    </section>
  );
}

function Metric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div
      style={{
        padding: 18,
        border:
          "1px solid #e2e8f0",
        borderRadius: 10,
        background: "#f8fafc",
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
          marginTop: 7,
          fontSize: 24,
          fontWeight: 800,
          color: "#0f172a",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: number;
}) {
  return (
    <div
      style={{
        padding: 14,
        borderRadius: 8,
        background: "#f8fafc",
        border:
          "1px solid #e2e8f0",
      }}
    >
      <div
        style={{
          fontSize: 11,
          fontWeight: 700,
          color: "#64748b",
        }}
      >
        {label}
      </div>

      <div
        style={{
          marginTop: 5,
          fontSize: 22,
          fontWeight: 800,
          color: "#0f172a",
        }}
      >
        {value}
      </div>
    </div>
  );
}

function InfoGrid({
  items,
}: {
  items: [
    string,
    string
  ][];
}) {
  return (
    <div
      style={{
        display: "grid",
        gridTemplateColumns:
          "repeat(auto-fit,minmax(220px,1fr))",
        gap: 10,
      }}
    >
      {items.map(
        ([label, value]) => (
          <div
            key={label}
            style={{
              padding: 12,
              background:
                "#f8fafc",
              borderRadius: 8,
            }}
          >
            <div
              style={{
                fontSize: 10,
                fontWeight: 700,
                color: "#64748b",
                textTransform:
                  "uppercase",
                marginBottom: 5,
              }}
            >
              {label}
            </div>

            <div
              style={{
                fontSize: 13,
                color: "#334155",
              }}
            >
              {value || "Not recorded"}
            </div>
          </div>
        )
      )}
    </div>
  );
}

function ReportList({
  title,
  values,
}: {
  title: string;
  values: string[];
}) {
  return (
    <div
      style={{
        marginBottom: 16,
      }}
    >
      <h3
        style={{
          fontSize: 14,
          color: "#334155",
          marginBottom: 7,
        }}
      >
        {title}
      </h3>

      {values.length === 0 ? (
        <div
          style={{
            color: "#94a3b8",
            fontSize: 13,
          }}
        >
          Not recorded
        </div>
      ) : (
        <ul
          style={{
            marginTop: 0,
            color: "#475569",
            lineHeight: 1.7,
          }}
        >
          {values.map(
            (value, index) => (
              <li key={`${value}-${index}`}>
                {value}
              </li>
            )
          )}
        </ul>
      )}
    </div>
  );
}

function Badge({
  label,
}: {
  label: string;
}) {
  return (
    <span
      style={{
        display: "inline-block",
        padding:
          "5px 9px",
        borderRadius: 20,
        background:
          "#f8fafc",
        border:
          "1px solid #e2e8f0",
        color: "#475569",
        fontSize: 11,
        fontWeight: 700,
      }}
    >
      {label}
    </span>
  );
}

function Empty({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div
      style={{
        padding: 16,
        background:
          "#f8fafc",
        borderRadius: 8,
        color: "#64748b",
      }}
    >
      {children}
    </div>
  );
}

const buttonStyle = {
  padding:
    "11px 16px",
  border: "none",
  borderRadius: 8,
  background: "#1d4ed8",
  color: "white",
  fontWeight: 700,
  cursor: "pointer",
};

const secondaryButtonStyle = {
  padding:
    "11px 16px",
  border:
    "1px solid #cbd5e1",
  borderRadius: 8,
  background: "white",
  color: "#334155",
  fontWeight: 700,
  cursor: "pointer",
};
```
