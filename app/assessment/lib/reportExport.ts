import type { AssessmentProfile } from "../types";
import type { RiskResult } from "../lib/riskEngine";
import type { RiskTreatmentAction } from "../lib/remediationEngine";
import type { ResidualRiskDecisionRecord } from "../lib/governanceEngine";

/* ============================================================
   STEP 13 EVIDENCE MODEL

   Kept locally so the reporting layer does not require a new
   EvidenceRecord export from types.ts.
   ============================================================ */

export type EvidenceRecord = {
  reference: string;
  owner: string;
  notes: string;
  verified: boolean;
};

export type EvidenceRecords = Record<string, EvidenceRecord>;

/* ============================================================
   REPORT DATA MODEL
   ============================================================ */

export interface AssessmentReportData {
  generatedAt: string;
  assessmentProfile: AssessmentProfile;
  riskResult: RiskResult | null;
  treatmentActions: RiskTreatmentAction[];
  residualRiskDecisions: ResidualRiskDecisionRecord[];
  evidenceRecords: EvidenceRecords;
}

/* ============================================================
   INTERNAL GENERIC HELPERS
   ============================================================ */

type AnyRecord = Record<string, unknown>;

function asRecord(value: unknown): AnyRecord {
  if (value && typeof value === "object") {
    return value as AnyRecord;
  }

  return {};
}

function text(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

function nonEmptyText(value: unknown, fallback = ""): string {
  const result = text(value).trim();

  return result || fallback;
}

function firstText(
  source: unknown,
  keys: string[],
  fallback = ""
): string {
  const record = asRecord(source);

  for (const key of keys) {
    const value = record[key];

    if (
      value !== null &&
      value !== undefined &&
      String(value).trim() !== ""
    ) {
      return String(value);
    }
  }

  return fallback;
}

function resultValue(
  result: RiskResult | null,
  keys: string[]
): unknown {
  if (!result) {
    return undefined;
  }

  const record = asRecord(result);

  for (const key of keys) {
    if (
      record[key] !== undefined &&
      record[key] !== null
    ) {
      return record[key];
    }
  }

  return undefined;
}

function actionValue(
  action: RiskTreatmentAction,
  keys: string[]
): unknown {
  return firstText(action, keys);
}

/* ============================================================
   FINDING HELPERS
   ============================================================ */

function getFindings(
  result: RiskResult | null
): AnyRecord[] {
  const raw = resultValue(result, [
    "findings",
    "riskFindings",
    "results",
  ]);

  if (!Array.isArray(raw)) {
    return [];
  }

  return raw
    .filter(
      (item): item is Record<string, unknown> =>
        !!item &&
        typeof item === "object"
    )
    .map((item) => item as AnyRecord);
}

function findingTitle(
  finding: AnyRecord
): string {
  return firstText(
    finding,
    [
      "title",
      "riskTitle",
      "name",
      "finding",
    ],
    "Untitled finding"
  );
}

function findingCategory(
  finding: AnyRecord
): string {
  return firstText(
    finding,
    [
      "category",
      "controlArea",
      "control_area",
    ],
    "Unclassified"
  );
}

function findingSeverity(
  finding: AnyRecord
): string {
  return firstText(
    finding,
    [
      "severity",
      "risk",
      "riskLevel",
      "risk_level",
      "level",
    ],
    ""
  );
}

function findingScore(
  finding: AnyRecord
): number | null {
  const raw = firstText(
    finding,
    [
      "risk_score",
      "riskScore",
      "score",
      "risk",
    ]
  );

  if (!raw) {
    return null;
  }

  const numeric = Number(raw);

  return Number.isFinite(numeric)
    ? numeric
    : null;
}

function findingDescription(
  finding: AnyRecord
): string {
  return firstText(
    finding,
    [
      "description",
      "finding",
      "analysis",
      "details",
    ],
    ""
  );
}

function findingRecommendation(
  finding: AnyRecord
): string {
  return firstText(
    finding,
    [
      "recommendedAction",
      "recommended_action",
      "recommendation",
      "recommendedTreatment",
      "remediation",
    ],
    ""
  );
}

/* ============================================================
   RISK SUMMARY

   The old exporter expected riskResult.overallRisk and
   riskResult.riskScore to exist directly.

   This implementation first uses those fields when available.
   If they are absent, it derives the summary from the actual
   findings produced by the assessment engine.
   ============================================================ */

export interface ReportRiskSummary {
  overallInherentRisk: string;
  overallResidualRisk: string;
  riskScore: string;
  findingCount: number;
  criticalCount: number;
  highCount: number;
  mediumCount: number;
  lowCount: number;
  informationalCount: number;
}

const RISK_ORDER: Record<string, number> = {
  Critical: 5,
  High: 4,
  Medium: 3,
  Low: 2,
  Informational: 1,
};

function normalizeRisk(value: unknown): string {
  const raw = text(value).trim();

  if (!raw) {
    return "";
  }

  const lower = raw.toLowerCase();

  if (lower === "critical") {
    return "Critical";
  }

  if (lower === "high") {
    return "High";
  }

  if (lower === "medium") {
    return "Medium";
  }

  if (lower === "low") {
    return "Low";
  }

  if (lower === "informational") {
    return "Informational";
  }

  return raw;
}

function highestRisk(
  risks: string[]
): string {
  let highest = "";

  for (const value of risks) {
    const normalized = normalizeRisk(value);

    if (!normalized) {
      continue;
    }

    if (
      !highest ||
      (RISK_ORDER[normalized] ?? 0) >
        (RISK_ORDER[highest] ?? 0)
    ) {
      highest = normalized;
    }
  }

  return highest;
}

function calculateDerivedRiskScore(
  findings: AnyRecord[]
): number | null {
  const scores = findings
    .map(findingScore)
    .filter(
      (value): value is number =>
        typeof value === "number" &&
        Number.isFinite(value)
    );

  if (scores.length === 0) {
    return null;
  }

  const total = scores.reduce(
    (sum, value) => sum + value,
    0
  );

  return Math.round(total / scores.length);
}

function deriveOverallInherentRisk(
  result: RiskResult | null,
  findings: AnyRecord[]
): string {
  const direct = normalizeRisk(
    resultValue(result, [
      "overallInherentRisk",
      "overallRisk",
      "riskLevel",
      "overallRiskLevel",
    ])
  );

  if (direct) {
    return direct;
  }

  const findingRisks = findings
    .map((finding) =>
      findingSeverity(finding)
    )
    .filter(Boolean);

  return highestRisk(findingRisks) || "Not available";
}

function deriveOverallResidualRisk(
  decisions: ResidualRiskDecisionRecord[]
): string {
  const risks = decisions
    .map((decision) =>
      normalizeRisk(decision.residualRisk)
    )
    .filter(Boolean);

  return highestRisk(risks) || "Not available";
}

function getRiskSummary(
  report: AssessmentReportData
): ReportRiskSummary {
  const findings = getFindings(
    report.riskResult
  );

  const directScore = resultValue(
    report.riskResult,
    [
      "riskScore",
      "overallRiskScore",
      "score",
      "overallScore",
    ]
  );

  let scoreText = "";

  if (
    directScore !== undefined &&
    directScore !== null &&
    text(directScore).trim() !== ""
  ) {
    scoreText = text(directScore);
  } else {
    const derived =
      calculateDerivedRiskScore(findings);

    if (derived !== null) {
      scoreText = `${derived}/100`;
    }
  }

  if (!scoreText) {
    scoreText = "Not available";
  }

  const severities = findings.map(
    findingSeverity
  );

  return {
    overallInherentRisk:
      deriveOverallInherentRisk(
        report.riskResult,
        findings
      ),

    overallResidualRisk:
      deriveOverallResidualRisk(
        report.residualRiskDecisions
      ),

    riskScore: scoreText,

    findingCount: findings.length,

    criticalCount: severities.filter(
      (value) =>
        normalizeRisk(value) ===
        "Critical"
    ).length,

    highCount: severities.filter(
      (value) =>
        normalizeRisk(value) ===
        "High"
    ).length,

    mediumCount: severities.filter(
      (value) =>
        normalizeRisk(value) ===
        "Medium"
    ).length,

    lowCount: severities.filter(
      (value) =>
        normalizeRisk(value) ===
        "Low"
    ).length,

    informationalCount: severities.filter(
      (value) =>
        normalizeRisk(value) ===
        "Informational"
    ).length,
  };
}

/* ============================================================
   EXPORT ESCAPING
   ============================================================ */

function escapeCsv(
  value: unknown
): string {
  const valueText = text(value);

  if (
    valueText.includes(",") ||
    valueText.includes('"') ||
    valueText.includes("\n") ||
    valueText.includes("\r")
  ) {
    return `"${valueText.replace(
      /"/g,
      '""'
    )}"`;
  }

  return valueText;
}

function escapeXml(
  value: unknown
): string {
  return text(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function escapeMarkdown(
  value: unknown
): string {
  return text(value)
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, "<br>");
}

/* ============================================================
   REPORT BUILDER
   ============================================================ */

export function buildAssessmentReport(
  assessmentProfile: AssessmentProfile,
  riskResult: RiskResult | null,
  treatmentActions: RiskTreatmentAction[],
  residualRiskDecisions: ResidualRiskDecisionRecord[],
  evidenceRecords: EvidenceRecords
): AssessmentReportData {
  return {
    generatedAt:
      new Date().toISOString(),

    assessmentProfile,

    riskResult,

    treatmentActions:
      treatmentActions ?? [],

    residualRiskDecisions:
      residualRiskDecisions ?? [],

    evidenceRecords:
      evidenceRecords ?? {},
  };
}

/* ============================================================
   JSON
   ============================================================ */

export function reportToJson(
  report: AssessmentReportData
): string {
  const summary =
    getRiskSummary(report);

  return JSON.stringify(
    {
      reportMetadata: {
        reportTitle:
          "PrivacyMap India Assessment Report",

        generatedAt:
          report.generatedAt,

        organisationName:
          report.assessmentProfile
            .organisationName,

        assessmentName:
          report.assessmentProfile
            .assessmentName,

        assessmentOwner:
          report.assessmentProfile
            .assessmentOwner,

        assessmentId:
          report.assessmentProfile
            .assessmentId,

        assessmentDate:
          report.assessmentProfile
            .assessmentDate,

        assessmentVersion:
          report.assessmentProfile
            .assessmentVersion,
      },

      executiveSummary: summary,

      riskResult:
        report.riskResult,

      treatmentActions:
        report.treatmentActions,

      residualRiskDecisions:
        report.residualRiskDecisions,

      evidenceRecords:
        report.evidenceRecords,

      disclaimer:
        "PrivacyMap India assessment output is a risk-assessment and governance aid. It is not a legal opinion, certification or automatic determination of DPDP compliance.",
    },
    null,
    2
  );
}

/* ============================================================
   CSV
   ============================================================ */

export function reportToCsv(
  report: AssessmentReportData
): string {
  const rows: string[][] = [];

  const summary =
    getRiskSummary(report);

  rows.push([
    "Record Type",
    "ID",
    "Category",
    "Risk / Title",
    "Inherent Risk",
    "Residual Risk",
    "Decision",
    "Approval Status",
    "Treatment Status",
    "Owner",
    "Priority",
    "Timeframe",
    "Effort",
    "Review Date",
    "Evidence Reference",
    "Evidence Owner",
    "Evidence Verified",
    "Notes",
  ]);

  /* ----------------------------------------------------------
     REPORT SUMMARY
     ---------------------------------------------------------- */

  rows.push([
    "Report Summary",
    "",
    "",
    "Overall Inherent Risk",
    summary.overallInherentRisk,
    summary.overallResidualRisk,
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    "",
    `Risk Score: ${summary.riskScore}; Findings: ${summary.findingCount}`,
  ]);

  /* ----------------------------------------------------------
     FINDINGS
     ---------------------------------------------------------- */

  const findings =
    getFindings(report.riskResult);

  for (const finding of findings) {
    rows.push([
      "Risk Finding",
      firstText(finding, ["id"]),
      findingCategory(finding),
      findingTitle(finding),
      findingSeverity(finding),
      "",
      "",
      "",
      firstText(finding, ["status"]),
      firstText(
        finding,
        [
          "remediation_owner",
          "remediationOwner",
          "owner",
        ]
      ),
      firstText(finding, ["priority"]),
      firstText(
        finding,
        [
          "remediation_window",
          "remediationWindow",
          "timeframe",
        ]
      ),
      "",
      "",
      "",
      "",
      "",
      findingRecommendation(
        finding
      ),
    ]);
  }

  /* ----------------------------------------------------------
     TREATMENT ACTIONS
     ---------------------------------------------------------- */

  for (const action of report.treatmentActions) {
    const actionRecord =
      asRecord(action);

    const decision =
      report.residualRiskDecisions.find(
        (item) =>
          item.riskTitle ===
            text(
              actionRecord[
                "riskTitle"
              ]
            ) &&
          item.category ===
            text(
              actionRecord[
                "category"
              ]
            )
      );

    const evidence =
      report.evidenceRecords[
        text(
          actionRecord["id"]
        )
      ];

    rows.push([
      "Risk Treatment",

      text(
        actionRecord["id"]
      ),

      text(
        actionRecord["category"]
      ),

      text(
        actionRecord["riskTitle"]
      ),

      text(
        decision?.inherentRisk
      ),

      text(
        decision?.residualRisk
      ),

      text(
        decision?.decision
      ),

      text(
        decision?.approvalStatus
      ),

      text(
        actionRecord["status"]
      ),

      firstText(action, [
        "owner",
        "accountableOwner",
        "remediationOwner",
        "remediation_owner",
      ]),

      firstText(action, [
        "priority",
      ]),

      firstText(action, [
        "timeframe",
        "remediationWindow",
        "remediation_window",
        "targetDate",
      ]),

      firstText(action, [
        "effort",
      ]),

      text(
        decision?.reviewDate
      ),

      text(
        evidence?.reference
      ),

      text(
        evidence?.owner
      ),

      evidence?.verified
        ? "Yes"
        : "No",

      firstText(action, [
        "recommendedTreatment",
        "recommended_action",
        "recommendation",
        "remediation",
      ]) ||
        text(evidence?.notes),
    ]);
  }

  /* ----------------------------------------------------------
     GOVERNANCE DECISIONS
     ---------------------------------------------------------- */

  for (const decision of report.residualRiskDecisions) {
    rows.push([
      "Residual Risk Decision",

      text(decision.id),

      text(decision.category),

      text(decision.riskTitle),

      text(decision.inherentRisk),

      text(decision.residualRisk),

      text(decision.decision),

      text(decision.approvalStatus),

      text(decision.treatmentStatus),

      text(decision.accountableOwner),

      "",
      "",
      "",

      text(decision.reviewDate),

      "",

      "",
      "",

      text(decision.rationale),
    ]);
  }

  return rows
    .map((row) =>
      row.map(escapeCsv).join(",")
    )
    .join("\r\n");
}

/* ============================================================
   XML
   ============================================================ */

export function reportToXml(
  report: AssessmentReportData
): string {
  const profile =
    report.assessmentProfile;

  const summary =
    getRiskSummary(report);

  const findings =
    getFindings(report.riskResult);

  const findingXml =
    findings
      .map(
        (finding) => `
      <finding>
        <id>${escapeXml(
          firstText(finding, ["id"])
        )}</id>

        <category>${escapeXml(
          findingCategory(finding)
        )}</category>

        <title>${escapeXml(
          findingTitle(finding)
        )}</title>

        <severity>${escapeXml(
          findingSeverity(finding)
        )}</severity>

        <riskScore>${escapeXml(
          findingScore(finding)
        )}</riskScore>

        <description>${escapeXml(
          findingDescription(finding)
        )}</description>

        <recommendedAction>${escapeXml(
          findingRecommendation(finding)
        )}</recommendedAction>
      </finding>`
      )
      .join("");

  const treatmentXml =
    report.treatmentActions
      .map((action) => {
        const actionRecord =
          asRecord(action);

        const decision =
          report.residualRiskDecisions.find(
            (item) =>
              item.riskTitle ===
                text(
                  actionRecord[
                    "riskTitle"
                  ]
                ) &&
              item.category ===
                text(
                  actionRecord[
                    "category"
                  ]
                )
          );

        const evidence =
          report.evidenceRecords[
            text(
              actionRecord["id"]
            )
          ];

        return `
      <treatment>
        <id>${escapeXml(
          actionRecord["id"]
        )}</id>

        <category>${escapeXml(
          actionRecord["category"]
        )}</category>

        <riskTitle>${escapeXml(
          actionRecord["riskTitle"]
        )}</riskTitle>

        <recommendedTreatment>${escapeXml(
          firstText(action, [
            "recommendedTreatment",
            "recommended_action",
            "recommendation",
            "remediation",
          ])
        )}</recommendedTreatment>

        <status>${escapeXml(
          actionRecord["status"]
        )}</status>

        <priority>${escapeXml(
          firstText(action, [
            "priority",
          ])
        )}</priority>

        <owner>${escapeXml(
          firstText(action, [
            "owner",
            "accountableOwner",
            "remediationOwner",
            "remediation_owner",
          ])
        )}</owner>

        <timeframe>${escapeXml(
          firstText(action, [
            "timeframe",
            "remediationWindow",
            "remediation_window",
            "targetDate",
          ])
        )}</timeframe>

        <effort>${escapeXml(
          firstText(action, [
            "effort",
          ])
        )}</effort>

        <inherentRisk>${escapeXml(
          decision?.inherentRisk
        )}</inherentRisk>

        <residualRisk>${escapeXml(
          decision?.residualRisk
        )}</residualRisk>

        <decision>${escapeXml(
          decision?.decision
        )}</decision>

        <approvalStatus>${escapeXml(
          decision?.approvalStatus
        )}</approvalStatus>

        <reviewDate>${escapeXml(
          decision?.reviewDate
        )}</reviewDate>

        <evidence>
          <reference>${escapeXml(
            evidence?.reference
          )}</reference>

          <owner>${escapeXml(
            evidence?.owner
          )}</owner>

          <verified>${
            evidence?.verified
              ? "true"
              : "false"
          }</verified>

          <notes>${escapeXml(
            evidence?.notes
          )}</notes>
        </evidence>
      </treatment>`;
      })
      .join("");

  const decisionXml =
    report.residualRiskDecisions
      .map(
        (decision) => `
      <decision>
        <id>${escapeXml(
          decision.id
        )}</id>

        <findingId>${escapeXml(
          decision.findingId
        )}</findingId>

        <riskTitle>${escapeXml(
          decision.riskTitle
        )}</riskTitle>

        <category>${escapeXml(
          decision.category
        )}</category>

        <inherentRisk>${escapeXml(
          decision.inherentRisk
        )}</inherentRisk>

        <residualRisk>${escapeXml(
          decision.residualRisk
        )}</residualRisk>

        <decisionValue>${escapeXml(
          decision.decision
        )}</decisionValue>

        <rationale>${escapeXml(
          decision.rationale
        )}</rationale>

        <accountableOwner>${escapeXml(
          decision.accountableOwner
        )}</accountableOwner>

        <decisionAuthority>${escapeXml(
          decision.decisionAuthority
        )}</decisionAuthority>

        <reviewDate>${escapeXml(
          decision.reviewDate
        )}</reviewDate>

        <approvalDate>${escapeXml(
          decision.approvalDate
        )}</approvalDate>

        <nextReviewDate>${escapeXml(
          decision.nextReviewDate
        )}</nextReviewDate>

        <targetResolutionDate>${escapeXml(
          decision.targetResolutionDate
        )}</targetResolutionDate>

        <approvalStatus>${escapeXml(
          decision.approvalStatus
        )}</approvalStatus>

        <treatmentStatus>${escapeXml(
          decision.treatmentStatus
        )}</treatmentStatus>

        <reviewFrequency>${escapeXml(
          decision.reviewFrequency
        )}</reviewFrequency>

        <escalationRequired>${
          decision.escalationRequired
            ? "true"
            : "false"
        }</escalationRequired>

        <escalationReason>${escapeXml(
          decision.escalationReason
        )}</escalationReason>
      </decision>`
      )
      .join("");

  const evidenceXml =
    Object.entries(
      report.evidenceRecords
    )
      .map(
        ([actionId, evidence]) => `
      <evidenceRecord>
        <actionId>${escapeXml(
          actionId
        )}</actionId>

        <reference>${escapeXml(
          evidence.reference
        )}</reference>

        <owner>${escapeXml(
          evidence.owner
        )}</owner>

        <verified>${
          evidence.verified
            ? "true"
            : "false"
        }</verified>

        <notes>${escapeXml(
          evidence.notes
        )}</notes>
      </evidenceRecord>`
      )
      .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<privacyMapAssessment>

  <metadata>
    <reportTitle>PrivacyMap India Assessment Report</reportTitle>

    <generatedAt>${escapeXml(
      report.generatedAt
    )}</generatedAt>

    <organisationName>${escapeXml(
      profile.organisationName
    )}</organisationName>

    <assessmentName>${escapeXml(
      profile.assessmentName
    )}</assessmentName>

    <assessmentOwner>${escapeXml(
      profile.assessmentOwner
    )}</assessmentOwner>

    <assessmentId>${escapeXml(
      profile.assessmentId
    )}</assessmentId>

    <assessmentDate>${escapeXml(
      profile.assessmentDate
    )}</assessmentDate>

    <assessmentVersion>${escapeXml(
      profile.assessmentVersion
    )}</assessmentVersion>
  </metadata>

  <riskSummary>

    <overallInherentRisk>${escapeXml(
      summary.overallInherentRisk
    )}</overallInherentRisk>

    <overallResidualRisk>${escapeXml(
      summary.overallResidualRisk
    )}</overallResidualRisk>

    <riskScore>${escapeXml(
      summary.riskScore
    )}</riskScore>

    <findingCount>${summary.findingCount}</findingCount>

    <criticalCount>${summary.criticalCount}</criticalCount>

    <highCount>${summary.highCount}</highCount>

    <mediumCount>${summary.mediumCount}</mediumCount>

    <lowCount>${summary.lowCount}</lowCount>

    <informationalCount>${summary.informationalCount}</informationalCount>

  </riskSummary>

  <findings>
    ${findingXml}
  </findings>

  <treatmentActions>
    ${treatmentXml}
  </treatmentActions>

  <residualRiskDecisions>
    ${decisionXml}
  </residualRiskDecisions>

  <evidenceRecords>
    ${evidenceXml}
  </evidenceRecords>

  <disclaimer>
    PrivacyMap India assessment output is a risk-assessment and governance aid. It is not a legal opinion, certification or automatic determination of DPDP compliance.
  </disclaimer>

</privacyMapAssessment>`;
}

/* ============================================================
   MARKDOWN
   ============================================================ */

export function reportToMarkdown(
  report: AssessmentReportData
): string {
  const profile =
    report.assessmentProfile;

  const summary =
    getRiskSummary(report);

  const findings =
    getFindings(report.riskResult);

  const lines: string[] = [];

  lines.push(
    "# PrivacyMap India Assessment Report"
  );

  lines.push("");

  lines.push(
    `**Organisation:** ${escapeMarkdown(
      profile.organisationName
    )}`
  );

  lines.push(
    `**Assessment:** ${escapeMarkdown(
      profile.assessmentName
    )}`
  );

  lines.push(
    `**Assessment Owner:** ${escapeMarkdown(
      profile.assessmentOwner
    )}`
  );

  lines.push(
    `**Assessment ID:** ${escapeMarkdown(
      profile.assessmentId
    )}`
  );

  lines.push(
    `**Assessment Date:** ${escapeMarkdown(
      profile.assessmentDate
    )}`
  );

  lines.push(
    `**Assessment Version:** ${escapeMarkdown(
      profile.assessmentVersion
    )}`
  );

  lines.push(
    `**Generated:** ${escapeMarkdown(
      report.generatedAt
    )}`
  );

  lines.push("");

  lines.push(
    "## Executive Summary"
  );

  lines.push("");

  lines.push(
    `- Overall Inherent Risk: **${escapeMarkdown(
      summary.overallInherentRisk
    )}**`
  );

  lines.push(
    `- Overall Residual Risk: **${escapeMarkdown(
      summary.overallResidualRisk
    )}**`
  );

  lines.push(
    `- Risk Score: **${escapeMarkdown(
      summary.riskScore
    )}**`
  );

  lines.push(
    `- Risk Findings: **${summary.findingCount}**`
  );

  lines.push(
    `- Critical Findings: **${summary.criticalCount}**`
  );

  lines.push(
    `- High Findings: **${summary.highCount}**`
  );

  lines.push(
    `- Medium Findings: **${summary.mediumCount}**`
  );

  lines.push(
    `- Low Findings: **${summary.lowCount}**`
  );

  lines.push(
    `- Treatment Actions: **${report.treatmentActions.length}**`
  );

  lines.push(
    `- Residual Risk Decisions: **${report.residualRiskDecisions.length}**`
  );

  lines.push("");

  /* ----------------------------------------------------------
     STEP 7
     ---------------------------------------------------------- */

  lines.push(
    "## Privacy Risk Findings"
  );

  lines.push("");

  findings.forEach(
    (finding, index) => {
      lines.push(
        `### ${index + 1}. ${escapeMarkdown(
          findingTitle(finding)
        )}`
      );

      lines.push("");

      lines.push(
        `- ID: ${escapeMarkdown(
          firstText(finding, ["id"])
        )}`
      );

      lines.push(
        `- Category: ${escapeMarkdown(
          findingCategory(finding)
        )}`
      );

      lines.push(
        `- Risk: ${escapeMarkdown(
          findingSeverity(finding)
        )}`
      );

      const score =
        findingScore(finding);

      if (score !== null) {
        lines.push(
          `- Risk Score: ${score}/100`
        );
      }

      lines.push(
        `- Description: ${escapeMarkdown(
          findingDescription(finding)
        )}`
      );

      lines.push(
        `- Recommended Action: ${escapeMarkdown(
          findingRecommendation(finding)
        )}`
      );

      lines.push("");
    }
  );

  /* ----------------------------------------------------------
     STEP 8
     ---------------------------------------------------------- */

  lines.push(
    "## Risk Treatment & Action Plan"
  );

  lines.push("");

  lines.push(
    "| Category | Risk | Priority | Owner | Timeframe | Effort | Status |"
  );

  lines.push(
    "|---|---|---|---|---|---|---|"
  );

  for (const action of report.treatmentActions) {
    lines.push(
      `| ${escapeMarkdown(
        firstText(action, [
          "category",
        ])
      )} | ${escapeMarkdown(
        firstText(action, [
          "riskTitle",
        ])
      )} | ${escapeMarkdown(
        firstText(action, [
          "priority",
        ])
      )} | ${escapeMarkdown(
        firstText(action, [
          "owner",
          "accountableOwner",
          "remediationOwner",
          "remediation_owner",
        ])
      )} | ${escapeMarkdown(
        firstText(action, [
          "timeframe",
          "remediationWindow",
          "remediation_window",
          "targetDate",
        ])
      )} | ${escapeMarkdown(
        firstText(action, [
          "effort",
        ])
      )} | ${escapeMarkdown(
        firstText(action, [
          "status",
        ])
      )} |`
    );
  }

  lines.push("");

  /* ----------------------------------------------------------
     TREATMENT DETAILS
     ---------------------------------------------------------- */

  for (const action of report.treatmentActions) {
    const recommendation =
      firstText(action, [
        "recommendedTreatment",
        "recommended_action",
        "recommendation",
        "remediation",
      ]);

    if (!recommendation) {
      continue;
    }

    lines.push(
      `### ${escapeMarkdown(
        firstText(action, [
          "riskTitle",
        ])
      )}`
    );

    lines.push("");

    lines.push(
      `**Recommended Treatment:** ${escapeMarkdown(
        recommendation
      )}`
    );

    lines.push("");
  }

  /* ----------------------------------------------------------
     STEP 9 / GOVERNANCE
     ---------------------------------------------------------- */

  lines.push(
    "## Residual Risk Assessment & Governance"
  );

  lines.push("");

  for (const decision of report.residualRiskDecisions) {
    lines.push(
      `### ${escapeMarkdown(
        decision.riskTitle
      )}`
    );

    lines.push("");

    lines.push(
      `- Category: ${escapeMarkdown(
        decision.category
      )}`
    );

    lines.push(
      `- Inherent Risk: ${escapeMarkdown(
        decision.inherentRisk
      )}`
    );

    lines.push(
      `- Residual Risk: ${escapeMarkdown(
        decision.residualRisk
      )}`
    );

    lines.push(
      `- Decision: ${escapeMarkdown(
        decision.decision
      )}`
    );

    lines.push(
      `- Approval Status: ${escapeMarkdown(
        decision.approvalStatus
      )}`
    );

    lines.push(
      `- Treatment Status: ${escapeMarkdown(
        decision.treatmentStatus
      )}`
    );

    lines.push(
      `- Accountable Owner: ${escapeMarkdown(
        decision.accountableOwner
      )}`
    );

    lines.push(
      `- Decision Authority: ${escapeMarkdown(
        decision.decisionAuthority
      )}`
    );

    lines.push(
      `- Review Date: ${escapeMarkdown(
        decision.reviewDate
      )}`
    );

    lines.push(
      `- Approval Date: ${escapeMarkdown(
        decision.approvalDate
      )}`
    );

    lines.push(
      `- Next Review Date: ${escapeMarkdown(
        decision.nextReviewDate
      )}`
    );

    lines.push(
      `- Rationale: ${escapeMarkdown(
        decision.rationale
      )}`
    );

    lines.push("");
  }

  /* ----------------------------------------------------------
     STEP 13
     ---------------------------------------------------------- */

  lines.push(
    "## Evidence & Closure"
  );

  lines.push("");

  for (const action of report.treatmentActions) {
    const actionId =
      firstText(action, ["id"]);

    const evidence =
      report.evidenceRecords[
        actionId
      ];

    lines.push(
      `### ${escapeMarkdown(
        firstText(action, [
          "riskTitle",
        ])
      )}`
    );

    lines.push("");

    lines.push(
      `- Treatment Status: ${escapeMarkdown(
        firstText(action, [
          "status",
        ])
      )}`
    );

    lines.push(
      `- Evidence Reference: ${escapeMarkdown(
        evidence?.reference
      )}`
    );

    lines.push(
      `- Evidence Owner: ${escapeMarkdown(
        evidence?.owner
      )}`
    );

    lines.push(
      `- Evidence Verified: ${
        evidence?.verified
          ? "Yes"
          : "No"
      }`
    );

    lines.push(
      `- Closure Notes: ${escapeMarkdown(
        evidence?.notes
      )}`
    );

    lines.push("");
  }

  /* ----------------------------------------------------------
     DISCLAIMER
     ---------------------------------------------------------- */

  lines.push("---");

  lines.push("");

  lines.push(
    "PrivacyMap India assessment output is a risk-assessment and governance aid. It is not a legal opinion, certification or automatic determination of DPDP compliance."
  );

  return lines.join("\n");
}

/* ============================================================
   BROWSER DOWNLOAD - TEXT FORMATS
   ============================================================ */

export function downloadTextFile(
  content: string,
  filename: string,
  mimeType: string
): void {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  const blob = new Blob(
    [content],
    {
      type: mimeType,
    }
  );

  const url =
    URL.createObjectURL(blob);

  const anchor =
    document.createElement(
      "a"
    );

  anchor.href = url;
  anchor.download =
    filename;

  document.body.appendChild(
    anchor
  );

  anchor.click();

  anchor.remove();

  setTimeout(
    () =>
      URL.revokeObjectURL(
        url
      ),
    1000
  );
}

/* ============================================================
   DEPENDENCY-FREE PDF

   The PDF is deliberately generated without jsPDF or any
   additional npm package.

   The renderer uses:
   - Helvetica
   - Helvetica-Bold
   - structured sections
   - section spacing
   - page numbers
   - deliberate page breaks
   - wrapped text
   ============================================================ */

type PdfLine = {
  text: string;
  bold?: boolean;
  size?: number;
  gapBefore?: number;
  gapAfter?: number;
};

function pdfEscape(
  value: string
): string {
  return value
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrapPdfText(
  value: string,
  maxChars = 92
): string[] {
  const clean =
    text(value)
      .replace(/\r/g, "")
      .trim();

  if (!clean) {
    return [""];
  }

  const words =
    clean.split(/\s+/);

  const lines: string[] = [];

  let current = "";

  for (const word of words) {
    const candidate =
      current
        ? `${current} ${word}`
        : word;

    if (
      candidate.length >
        maxChars &&
      current
    ) {
      lines.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

function addPdfSection(
  lines: PdfLine[],
  title: string
): void {
  lines.push({
    text: title,
    bold: true,
    size: 14,
    gapBefore: 18,
    gapAfter: 8,
  });
}

function addPdfLabelValue(
  lines: PdfLine[],
  label: string,
  value: unknown
): void {
  const valueText =
    nonEmptyText(
      value,
      "Not available"
    );

  lines.push({
    text: `${label}: ${valueText}`,
    size: 10,
    gapAfter: 3,
  });
}

function addPdfParagraph(
  lines: PdfLine[],
  value: unknown
): void {
  const valueText =
    text(value).trim();

  if (!valueText) {
    return;
  }

  lines.push({
    text: valueText,
    size: 10,
    gapAfter: 6,
  });
}

function buildPdfLines(
  report: AssessmentReportData
): PdfLine[] {
  const lines: PdfLine[] = [];

  const profile =
    report.assessmentProfile;

  const summary =
    getRiskSummary(report);

  const findings =
    getFindings(report.riskResult);

  /* ----------------------------------------------------------
     TITLE
     ---------------------------------------------------------- */

  lines.push({
    text:
      "PrivacyMap India Assessment Report",
    bold: true,
    size: 18,
    gapAfter: 12,
  });

  addPdfLabelValue(
    lines,
    "Organisation",
    profile.organisationName
  );

  addPdfLabelValue(
    lines,
    "Assessment",
    profile.assessmentName
  );

  addPdfLabelValue(
    lines,
    "Assessment Owner",
    profile.assessmentOwner
  );

  addPdfLabelValue(
    lines,
    "Assessment ID",
    profile.assessmentId
  );

  addPdfLabelValue(
    lines,
    "Assessment Date",
    profile.assessmentDate
  );

  addPdfLabelValue(
    lines,
    "Assessment Version",
    profile.assessmentVersion
  );

  addPdfLabelValue(
    lines,
    "Generated",
    report.generatedAt
  );

  /* ----------------------------------------------------------
     EXECUTIVE SUMMARY
     ---------------------------------------------------------- */

  addPdfSection(
    lines,
    "Executive Summary"
  );

  addPdfLabelValue(
    lines,
    "Overall Inherent Risk",
    summary.overallInherentRisk
  );

  addPdfLabelValue(
    lines,
    "Overall Residual Risk",
    summary.overallResidualRisk
  );

  addPdfLabelValue(
    lines,
    "Risk Score",
    summary.riskScore
  );

  addPdfLabelValue(
    lines,
    "Risk Findings",
    summary.findingCount
  );

  addPdfLabelValue(
    lines,
    "Critical Findings",
    summary.criticalCount
  );

  addPdfLabelValue(
    lines,
    "High Findings",
    summary.highCount
  );

  addPdfLabelValue(
    lines,
    "Medium Findings",
    summary.mediumCount
  );

  addPdfLabelValue(
    lines,
    "Low Findings",
    summary.lowCount
  );

  addPdfLabelValue(
    lines,
    "Treatment Actions",
    report.treatmentActions.length
  );

  addPdfLabelValue(
    lines,
    "Residual Risk Decisions",
    report.residualRiskDecisions.length
  );

  /* ----------------------------------------------------------
     PRIVACY RISK FINDINGS
     ---------------------------------------------------------- */

  addPdfSection(
    lines,
    "Privacy Risk Findings"
  );

  if (findings.length === 0) {
    addPdfParagraph(
      lines,
      "No privacy risk findings are available."
    );
  }

  findings.forEach(
    (finding, index) => {
      lines.push({
        text: `${index + 1}. ${findingTitle(
          finding
        )}`,
        bold: true,
        size: 11,
        gapBefore: 8,
        gapAfter: 5,
      });

      addPdfLabelValue(
        lines,
        "Finding ID",
        firstText(finding, [
          "id",
        ])
      );

      addPdfLabelValue(
        lines,
        "Category",
        findingCategory(finding)
      );

      addPdfLabelValue(
        lines,
        "Risk",
        findingSeverity(finding)
      );

      const score =
        findingScore(finding);

      if (score !== null) {
        addPdfLabelValue(
          lines,
          "Risk Score",
          `${score}/100`
        );
      }

      addPdfParagraph(
        lines,
        `Description: ${findingDescription(
          finding
        )}`
      );

      addPdfParagraph(
        lines,
        `Recommended Action: ${findingRecommendation(
          finding
        )}`
      );
    }
  );

  /* ----------------------------------------------------------
     RISK TREATMENT
     ---------------------------------------------------------- */

  addPdfSection(
    lines,
    "Risk Treatment & Action Plan"
  );

  if (
    report.treatmentActions.length ===
    0
  ) {
    addPdfParagraph(
      lines,
      "No treatment actions are available."
    );
  }

  report.treatmentActions.forEach(
    (action, index) => {
      const title =
        firstText(action, [
          "riskTitle",
        ]) ||
        "Untitled treatment action";

      lines.push({
        text: `${index + 1}. ${title}`,
        bold: true,
        size: 11,
        gapBefore: 8,
        gapAfter: 5,
      });

      addPdfLabelValue(
        lines,
        "Category",
        firstText(action, [
          "category",
        ])
      );

      addPdfLabelValue(
        lines,
        "Status",
        firstText(action, [
          "status",
        ])
      );

      addPdfLabelValue(
        lines,
        "Priority",
        firstText(action, [
          "priority",
        ])
      );

      addPdfLabelValue(
        lines,
        "Owner",
        firstText(action, [
          "owner",
          "accountableOwner",
          "remediationOwner",
          "remediation_owner",
        ])
      );

      addPdfLabelValue(
        lines,
        "Timeframe",
        firstText(action, [
          "timeframe",
          "remediationWindow",
          "remediation_window",
          "targetDate",
        ])
      );

      addPdfLabelValue(
        lines,
        "Effort",
        firstText(action, [
          "effort",
        ])
      );

      addPdfParagraph(
        lines,
        `Recommended Treatment: ${firstText(
          action,
          [
            "recommendedTreatment",
            "recommended_action",
            "recommendation",
            "remediation",
          ],
          "Not available"
        )}`
      );
    }
  );

  /* ----------------------------------------------------------
     RESIDUAL RISK
     ---------------------------------------------------------- */

  addPdfSection(
    lines,
    "Residual Risk Assessment"
  );

  if (
    report.residualRiskDecisions
      .length === 0
  ) {
    addPdfParagraph(
      lines,
      "No residual-risk decisions are available."
    );
  }

  report.residualRiskDecisions.forEach(
    (decision, index) => {
      lines.push({
        text: `${index + 1}. ${decision.riskTitle}`,
        bold: true,
        size: 11,
        gapBefore: 8,
        gapAfter: 5,
      });

      addPdfLabelValue(
        lines,
        "Category",
        decision.category
      );

      addPdfLabelValue(
        lines,
        "Inherent Risk",
        decision.inherentRisk
      );

      addPdfLabelValue(
        lines,
        "Residual Risk",
        decision.residualRisk
      );

      addPdfLabelValue(
        lines,
        "Decision",
        decision.decision
      );

      addPdfLabelValue(
        lines,
        "Approval Status",
        decision.approvalStatus
      );

      addPdfLabelValue(
        lines,
        "Treatment Status",
        decision.treatmentStatus
      );

      addPdfLabelValue(
        lines,
        "Accountable Owner",
        decision.accountableOwner
      );

      addPdfLabelValue(
        lines,
        "Decision Authority",
        decision.decisionAuthority
      );

      addPdfLabelValue(
        lines,
        "Review Date",
        decision.reviewDate
      );

      addPdfLabelValue(
        lines,
        "Approval Date",
        decision.approvalDate
      );

      addPdfLabelValue(
        lines,
        "Next Review Date",
        decision.nextReviewDate
      );

      addPdfLabelValue(
        lines,
        "Review Frequency",
        decision.reviewFrequency
      );

      addPdfParagraph(
        lines,
        `Decision Rationale: ${decision.rationale}`
      );

      if (
        decision.escalationRequired
      ) {
        addPdfParagraph(
          lines,
          `Escalation Required: ${decision.escalationReason || "Management review required."}`
        );
      }
    }
  );

  /* ----------------------------------------------------------
     DPDP MAPPING
     ----------------------------------------------------------

     Step 10 currently owns its mapping state locally.
     Therefore the exporter does not fabricate Step 10 records.
     The raw risk result and treatment information remain
     available in JSON/CSV, while the human-readable report
     clearly identifies the section.
     ---------------------------------------------------------- */

  addPdfSection(
    lines,
    "DPDP Requirement Mapping"
  );

  addPdfParagraph(
    lines,
    "DPDP control mappings are maintained by the Step 10 assessment component. The report exporter does not invent mapping values that are not present in the report state."
  );

  /* ----------------------------------------------------------
     GOVERNANCE
     ---------------------------------------------------------- */

  addPdfSection(
    lines,
    "Risk Governance & Approval"
  );

  addPdfLabelValue(
    lines,
    "Total Decisions",
    report.residualRiskDecisions.length
  );

  addPdfLabelValue(
    lines,
    "Pending Approval",
    report.residualRiskDecisions.filter(
      (decision) =>
        decision.approvalStatus ===
        "Pending"
    ).length
  );

  addPdfLabelValue(
    lines,
    "Approved",
    report.residualRiskDecisions.filter(
      (decision) =>
        decision.approvalStatus ===
        "Approved"
    ).length
  );

  addPdfLabelValue(
    lines,
    "Rejected",
    report.residualRiskDecisions.filter(
      (decision) =>
        decision.approvalStatus ===
        "Rejected"
    ).length
  );

  /* ----------------------------------------------------------
     REMEDIATION TRACKER
     ---------------------------------------------------------- */

  addPdfSection(
    lines,
    "Remediation Tracker"
  );

  addPdfLabelValue(
    lines,
    "Open",
    report.treatmentActions.filter(
      (action) =>
        firstText(action, [
          "status",
        ]) === "Open"
    ).length
  );

  addPdfLabelValue(
    lines,
    "In Progress",
    report.treatmentActions.filter(
      (action) =>
        firstText(action, [
          "status",
        ]) === "In Progress"
    ).length
  );

  addPdfLabelValue(
    lines,
    "Completed",
    report.treatmentActions.filter(
      (action) =>
        firstText(action, [
          "status",
        ]) === "Completed"
    ).length
  );

  addPdfLabelValue(
    lines,
    "Accepted",
    report.treatmentActions.filter(
      (action) =>
        firstText(action, [
          "status",
        ]) === "Accepted"
    ).length
  );

  /* ----------------------------------------------------------
     EVIDENCE & CLOSURE
     ---------------------------------------------------------- */

  addPdfSection(
    lines,
    "Evidence & Closure"
  );

  if (
    report.treatmentActions.length ===
    0
  ) {
    addPdfParagraph(
      lines,
      "No treatment actions are available for evidence closure."
    );
  }

  report.treatmentActions.forEach(
    (action, index) => {
      const actionId =
        firstText(action, [
          "id",
        ]);

      const evidence =
        report.evidenceRecords[
          actionId
        ];

      lines.push({
        text: `${index + 1}. ${firstText(
          action,
          ["riskTitle"],
          "Untitled risk"
        )}`,
        bold: true,
        size: 11,
        gapBefore: 8,
        gapAfter: 5,
      });

      addPdfLabelValue(
        lines,
        "Treatment Status",
        firstText(action, [
          "status",
        ])
      );

      addPdfLabelValue(
        lines,
        "Evidence Reference",
        evidence?.reference
      );

      addPdfLabelValue(
        lines,
        "Evidence Owner",
        evidence?.owner
      );

      addPdfLabelValue(
        lines,
        "Evidence Verified",
        evidence?.verified
          ? "Yes"
          : "No"
      );

      addPdfParagraph(
        lines,
        `Closure Notes: ${evidence?.notes || "Not available"}`
      );
    }
  );

  /* ----------------------------------------------------------
     DISCLAIMER
     ---------------------------------------------------------- */

  addPdfSection(
    lines,
    "Important Disclaimer"
  );

  addPdfParagraph(
    lines,
    "PrivacyMap India assessment output is a risk-assessment and governance aid. It is not a legal opinion, certification or automatic determination of DPDP compliance."
  );

  return lines;
}

/* ============================================================
   PDF PAGE BUILDER
   ============================================================ */

function buildPdfPages(
  report: AssessmentReportData
): PdfLine[][] {
  const source =
    buildPdfLines(report);

  const pages: PdfLine[][] = [];

  let page: PdfLine[] = [];

  /*
   * Approximate vertical units.
   * This is intentionally conservative so content does
   * not run into the footer.
   */
  let usedHeight = 0;

  const PAGE_HEIGHT = 650;

  for (const line of source) {
    const size =
      line.size ?? 10;

    const lineHeight =
      size >= 16
        ? 24
        : size >= 13
          ? 20
          : 15;

    const gapBefore =
      line.gapBefore ?? 0;

    const gapAfter =
      line.gapAfter ?? 0;

    const wrapped =
      wrapPdfText(
        line.text,
        size >= 16
          ? 58
          : size >= 13
            ? 70
            : 92
      );

    const requiredHeight =
      gapBefore +
      gapAfter +
      wrapped.length *
        lineHeight;

    if (
      page.length > 0 &&
      usedHeight +
        requiredHeight >
        PAGE_HEIGHT
    ) {
      pages.push(page);
      page = [];
      usedHeight = 0;
    }

    page.push({
      ...line,
      text: line.text,
    });

    usedHeight +=
      requiredHeight;
  }

  if (page.length > 0) {
    pages.push(page);
  }

  return pages;
}

/* ============================================================
   PDF BLOB GENERATOR
   ============================================================ */

export function createPdfBlob(
  report: AssessmentReportData
): Blob {
  const pages =
    buildPdfPages(report);

  const objects: string[] = [];

  /*
   * Object 1 = Catalog
   * Object 2 = Pages
   * Page/content objects follow.
   */

  objects.push("");
  objects.push("");

  const pageObjectIds: number[] =
    [];

  const contentObjectIds: number[] =
    [];

  for (
    let index = 0;
    index < pages.length;
    index++
  ) {
    pageObjectIds.push(
      objects.length + 1
    );

    objects.push("");

    contentObjectIds.push(
      objects.length + 1
    );

    objects.push("");
  }

  const regularFontObjectId =
    objects.length + 1;

  objects.push(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
  );

  const boldFontObjectId =
    objects.length + 1;

  objects.push(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>"
  );

  const pagesKids =
    pageObjectIds
      .map(
        (id) =>
          `${id} 0 R`
      )
      .join(" ");

  objects[1] =
    `<< /Type /Pages /Kids [${pagesKids}] /Count ${pages.length} >>`;

  objects[0] =
    `<< /Type /Catalog /Pages 2 0 R >>`;

  for (
    let index = 0;
    index < pages.length;
    index++
  ) {
    const commands: string[] =
      [];

    commands.push(
      "BT"
    );

    commands.push(
      "50 755 Td"
    );

    for (const line of pages[index]) {
      const size =
        line.size ?? 10;

      const lineHeight =
        size >= 16
          ? 24
          : size >= 13
            ? 20
            : 15;

      const gapBefore =
        line.gapBefore ?? 0;

      const gapAfter =
        line.gapAfter ?? 0;

      const font =
        line.bold
          ? `/F2 ${size} Tf`
          : `/F1 ${size} Tf`;

      commands.push(
        font
      );

      if (gapBefore > 0) {
        commands.push(
          `0 -${gapBefore} Td`
        );
      }

      const wrapped =
        wrapPdfText(
          line.text,
          size >= 16
            ? 58
            : size >= 13
              ? 70
              : 92
        );

      for (
        let lineIndex = 0;
        lineIndex <
        wrapped.length;
        lineIndex++
      ) {
        commands.push(
          `(${pdfEscape(
            wrapped[lineIndex]
          )}) Tj`
        );

        if (
          lineIndex <
          wrapped.length - 1
        ) {
          commands.push(
            `0 -${lineHeight} Td`
          );
        }
      }

      commands.push(
        `0 -${lineHeight + gapAfter} Td`
      );
    }

    /*
     * Footer.
     */

    commands.push(
      "/F1 8 Tf"
    );

    commands.push(
      "0 0 Td"
    );

    commands.push(
      `(PrivacyMap India - Assessment Report - Page ${
        index + 1
      } of ${pages.length}) Tj`
    );

    commands.push(
      "ET"
    );

    const stream =
      commands.join("\n");

    objects[
      pageObjectIds[index] - 1
    ] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${regularFontObjectId} 0 R /F2 ${boldFontObjectId} 0 R >> >> /Contents ${contentObjectIds[index]} 0 R >>`;

    objects[
      contentObjectIds[index] - 1
    ] =
      `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  }

  let pdf =
    "%PDF-1.4\n";

  const offsets: number[] =
    [0];

  for (
    let index = 0;
    index < objects.length;
    index++
  ) {
    offsets[index + 1] =
      pdf.length;

    pdf +=
      `${index + 1} 0 obj\n`;

    pdf +=
      `${objects[index]}\n`;

    pdf +=
      "endobj\n";
  }

  const xrefOffset =
    pdf.length;

  pdf +=
    `xref\n0 ${objects.length + 1}\n`;

  pdf +=
    "0000000000 65535 f \n";

  for (
    let index = 1;
    index <= objects.length;
    index++
  ) {
    pdf +=
      `${String(
        offsets[index]
      ).padStart(
        10,
        "0"
      )} 00000 n \n`;
  }

  pdf +=
    `trailer\n<< /Size ${
      objects.length + 1
    } /Root 1 0 R >>\n`;

  pdf +=
    `startxref\n${xrefOffset}\n%%EOF`;

  return new Blob(
    [pdf],
    {
      type: "application/pdf",
    }
  );
}

/* ============================================================
   PDF DOWNLOAD
   ============================================================ */

export function downloadPdf(
  report: AssessmentReportData,
  filename: string
): void {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  const blob =
    createPdfBlob(report);

  const url =
    URL.createObjectURL(blob);

  const anchor =
    document.createElement(
      "a"
    );

  anchor.href = url;
  anchor.download =
    filename;

  document.body.appendChild(
    anchor
  );

  anchor.click();

  anchor.remove();

  setTimeout(
    () =>
      URL.revokeObjectURL(
        url
      ),
    1000
  );
}
