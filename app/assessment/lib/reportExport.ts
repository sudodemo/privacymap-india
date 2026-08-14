import type { AssessmentProfile } from "../types";
import type { RiskResult } from "../lib/riskEngine";
import type { RiskTreatmentAction } from "../lib/remediationEngine";
import type { ResidualRiskDecisionRecord } from "../lib/governanceEngine";

/* ============================================================
   STEP 13 EVIDENCE MODEL
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
   SAFE VALUE HELPERS
   ============================================================ */

function text(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

function objectValue(
  source: unknown,
  key: string
): unknown {
  if (
    source === null ||
    source === undefined ||
    typeof source !== "object"
  ) {
    return undefined;
  }

  return (
    source as Record<string, unknown>
  )[key];
}

function resultValue(
  result: RiskResult | null,
  key: string
): unknown {
  return objectValue(result, key);
}

function actionValue(
  action: RiskTreatmentAction,
  key: string
): unknown {
  return objectValue(action, key);
}

function decisionValue(
  decision: ResidualRiskDecisionRecord,
  key: string
): unknown {
  return objectValue(decision, key);
}

function findingValue(
  finding: unknown,
  key: string
): unknown {
  return objectValue(finding, key);
}

function firstValue(
  source: unknown,
  keys: string[]
): unknown {
  for (const key of keys) {
    const value = objectValue(source, key);

    if (
      value !== undefined &&
      value !== null &&
      text(value).trim() !== ""
    ) {
      return value;
    }
  }

  return "";
}

function escapeCsv(value: unknown): string {
  const s = text(value);

  if (
    s.includes(",") ||
    s.includes('"') ||
    s.includes("\n") ||
    s.includes("\r")
  ) {
    return `"${s.replace(/"/g, '""')}"`;
  }

  return s;
}

function escapeXml(value: unknown): string {
  return text(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

function escapeMarkdown(value: unknown): string {
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
    generatedAt: new Date().toISOString(),
    assessmentProfile,
    riskResult,
    treatmentActions,
    residualRiskDecisions,
    evidenceRecords,
  };
}

/* ============================================================
   JSON
   ============================================================ */

export function reportToJson(
  report: AssessmentReportData
): string {
  return JSON.stringify(
    report,
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

  for (const action of report.treatmentActions) {
    const decision =
      report.residualRiskDecisions.find(
        (d) =>
          text(
            decisionValue(d, "riskTitle")
          ) ===
            text(
              actionValue(
                action,
                "riskTitle"
              )
            ) &&
          text(
            decisionValue(d, "category")
          ) ===
            text(
              actionValue(
                action,
                "category"
              )
            )
      );

    const evidence =
      report.evidenceRecords[
        text(
          actionValue(action, "id")
        )
      ];

    rows.push([
      "Risk Treatment",
      text(actionValue(action, "id")),
      text(actionValue(action, "category")),
      text(actionValue(action, "riskTitle")),
      text(
        decision
          ? decisionValue(
              decision,
              "inherentRisk"
            )
          : ""
      ),
      text(
        decision
          ? decisionValue(
              decision,
              "residualRisk"
            )
          : ""
      ),
      text(
        decision
          ? decisionValue(
              decision,
              "decision"
            )
          : ""
      ),
      text(
        decision
          ? decisionValue(
              decision,
              "approvalStatus"
            )
          : ""
      ),
      text(
        actionValue(
          action,
          "status"
        )
      ),
      text(
        actionValue(
          action,
          "owner"
        )
      ),
      text(
        actionValue(
          action,
          "priority"
        )
      ),
      text(
        actionValue(
          action,
          "timeframe"
        )
      ),
      text(
        actionValue(
          action,
          "effort"
        )
      ),
      text(
        decision
          ? decisionValue(
              decision,
              "reviewDate"
            )
          : ""
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
      text(
        evidence?.notes
      ),
    ]);
  }

  return rows
    .map((row) =>
      row
        .map(escapeCsv)
        .join(",")
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

  const result =
    report.riskResult;

  const overallRisk =
    resultValue(
      result,
      "overallRisk"
    );

  const residualRisk =
    firstValue(result, [
      "overallResidualRisk",
      "residualRisk",
    ]);

  const riskScore =
    resultValue(
      result,
      "riskScore"
    );

  const findings =
    resultValue(
      result,
      "findings"
    );

  const findingsArray =
    Array.isArray(findings)
      ? findings
      : [];

  const treatmentXml =
    report.treatmentActions
      .map((action) => {
        const decision =
          report.residualRiskDecisions.find(
            (d) =>
              text(
                decisionValue(
                  d,
                  "riskTitle"
                )
              ) ===
                text(
                  actionValue(
                    action,
                    "riskTitle"
                  )
                ) &&
              text(
                decisionValue(
                  d,
                  "category"
                )
              ) ===
                text(
                  actionValue(
                    action,
                    "category"
                  )
                )
          );

        const evidence =
          report.evidenceRecords[
            text(
              actionValue(
                action,
                "id"
              )
            )
          ];

        return `
      <treatment>
        <id>${escapeXml(
          actionValue(action, "id")
        )}</id>
        <category>${escapeXml(
          actionValue(action, "category")
        )}</category>
        <riskTitle>${escapeXml(
          actionValue(action, "riskTitle")
        )}</riskTitle>
        <recommendedTreatment>${escapeXml(
          actionValue(
            action,
            "recommendedTreatment"
          )
        )}</recommendedTreatment>
        <status>${escapeXml(
          actionValue(action, "status")
        )}</status>
        <priority>${escapeXml(
          actionValue(action, "priority")
        )}</priority>
        <owner>${escapeXml(
          actionValue(action, "owner")
        )}</owner>
        <timeframe>${escapeXml(
          actionValue(action, "timeframe")
        )}</timeframe>
        <effort>${escapeXml(
          actionValue(action, "effort")
        )}</effort>
        <inherentRisk>${escapeXml(
          decision
            ? decisionValue(
                decision,
                "inherentRisk"
              )
            : ""
        )}</inherentRisk>
        <residualRisk>${escapeXml(
          decision
            ? decisionValue(
                decision,
                "residualRisk"
              )
            : ""
        )}</residualRisk>
        <decision>${escapeXml(
          decision
            ? decisionValue(
                decision,
                "decision"
              )
            : ""
        )}</decision>
        <approvalStatus>${escapeXml(
          decision
            ? decisionValue(
                decision,
                "approvalStatus"
              )
            : ""
        )}</approvalStatus>
        <reviewDate>${escapeXml(
          decision
            ? decisionValue(
                decision,
                "reviewDate"
              )
            : ""
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
          decisionValue(
            decision,
            "id"
          )
        )}</id>
        <findingId>${escapeXml(
          decisionValue(
            decision,
            "findingId"
          )
        )}</findingId>
        <riskTitle>${escapeXml(
          decisionValue(
            decision,
            "riskTitle"
          )
        )}</riskTitle>
        <category>${escapeXml(
          decisionValue(
            decision,
            "category"
          )
        )}</category>
        <inherentRisk>${escapeXml(
          decisionValue(
            decision,
            "inherentRisk"
          )
        )}</inherentRisk>
        <residualRisk>${escapeXml(
          decisionValue(
            decision,
            "residualRisk"
          )
        )}</residualRisk>
        <decisionValue>${escapeXml(
          decisionValue(
            decision,
            "decision"
          )
        )}</decisionValue>
        <rationale>${escapeXml(
          decisionValue(
            decision,
            "rationale"
          )
        )}</rationale>
        <accountableOwner>${escapeXml(
          decisionValue(
            decision,
            "accountableOwner"
          )
        )}</accountableOwner>
        <decisionAuthority>${escapeXml(
          decisionValue(
            decision,
            "decisionAuthority"
          )
        )}</decisionAuthority>
        <reviewDate>${escapeXml(
          decisionValue(
            decision,
            "reviewDate"
          )
        )}</reviewDate>
        <approvalDate>${escapeXml(
          decisionValue(
            decision,
            "approvalDate"
          )
        )}</approvalDate>
        <nextReviewDate>${escapeXml(
          decisionValue(
            decision,
            "nextReviewDate"
          )
        )}</nextReviewDate>
        <approvalStatus>${escapeXml(
          decisionValue(
            decision,
            "approvalStatus"
          )
        )}</approvalStatus>
        <treatmentStatus>${escapeXml(
          decisionValue(
            decision,
            "treatmentStatus"
          )
        )}</treatmentStatus>
        <reviewFrequency>${escapeXml(
          decisionValue(
            decision,
            "reviewFrequency"
          )
        )}</reviewFrequency>
        <escalationRequired>${
          Boolean(
            decisionValue(
              decision,
              "escalationRequired"
            )
          )
            ? "true"
            : "false"
        }</escalationRequired>
        <escalationReason>${escapeXml(
          decisionValue(
            decision,
            "escalationReason"
          )
        )}</escalationReason>
      </decision>`
      )
      .join("");

  const findingXml =
    findingsArray
      .map((finding) => {
        return `
      <finding>
        <id>${escapeXml(
          firstValue(finding, [
            "id",
          ])
        )}</id>
        <category>${escapeXml(
          firstValue(finding, [
            "category",
          ])
        )}</category>
        <title>${escapeXml(
          firstValue(finding, [
            "title",
            "riskTitle",
            "name",
          ])
        )}</title>
        <severity>${escapeXml(
          firstValue(finding, [
            "severity",
            "risk",
            "riskLevel",
          ])
        )}</severity>
        <description>${escapeXml(
          firstValue(finding, [
            "description",
          ])
        )}</description>
        <recommendedAction>${escapeXml(
          firstValue(finding, [
            "recommendedAction",
            "recommendation",
          ])
        )}</recommendedAction>
      </finding>`;
      })
      .join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<privacyMapAssessment>
  <metadata>
    <generatedAt>${escapeXml(
      report.generatedAt
    )}</generatedAt>
    <organisationName>${escapeXml(
      profile.organisationName
    )}</organisationName>
    <assessmentName>${escapeXml(
      profile.assessmentName
    )}</assessmentName>
    <assessmentId>${escapeXml(
      profile.assessmentId
    )}</assessmentId>
  </metadata>

  <riskSummary>
    <overallRisk>${escapeXml(
      overallRisk
    )}</overallRisk>
    <overallResidualRisk>${escapeXml(
      residualRisk
    )}</overallResidualRisk>
    <riskScore>${escapeXml(
      riskScore
    )}</riskScore>
    <findingCount>${
      findingsArray.length
    }</findingCount>
  </riskSummary>

  <findings>
    ${findingXml}
  </findings>

  <residualRiskDecisions>
    ${decisionXml}
  </residualRiskDecisions>

  <treatmentActions>
    ${treatmentXml}
  </treatmentActions>
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

  const result =
    report.riskResult;

  const overallRisk =
    text(
      resultValue(
        result,
        "overallRisk"
      )
    );

  const residualRisk =
    text(
      firstValue(result, [
        "overallResidualRisk",
        "residualRisk",
      ])
    );

  const riskScore =
    text(
      resultValue(
        result,
        "riskScore"
      )
    );

  const findings =
    resultValue(
      result,
      "findings"
    );

  const findingsArray =
    Array.isArray(findings)
      ? findings
      : [];

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
    `**Assessment ID:** ${escapeMarkdown(
      profile.assessmentId
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
    `- Overall Inherent Risk: **${overallRisk || "Not Available"}**`
  );

  lines.push(
    `- Overall Residual Risk: **${residualRisk || "Not Available"}**`
  );

  lines.push(
    `- Risk Score: **${riskScore || "Not Available"}**`
  );

  lines.push(
    `- Findings: **${findingsArray.length}**`
  );

  lines.push(
    `- Treatment Actions: **${report.treatmentActions.length}**`
  );

  lines.push(
    `- Residual Risk Decisions: **${report.residualRiskDecisions.length}**`
  );

  lines.push("");

  lines.push(
    "## Assessment Profile"
  );

  lines.push("");

  lines.push(
    `- Organisation: ${escapeMarkdown(
      profile.organisationName
    )}`
  );

  lines.push(
    `- Assessment: ${escapeMarkdown(
      profile.assessmentName
    )}`
  );

  lines.push(
    `- Assessment ID: ${escapeMarkdown(
      profile.assessmentId
    )}`
  );

  lines.push("");

  lines.push(
    "## Privacy Risk Findings"
  );

  lines.push("");

  if (findingsArray.length === 0) {
    lines.push(
      "No privacy risk findings were recorded."
    );
    lines.push("");
  }

  for (const finding of findingsArray) {
    lines.push(
      `### ${escapeMarkdown(
        firstValue(finding, [
          "title",
          "riskTitle",
          "name",
        ])
      )}`
    );

    lines.push(
      `- Category: ${escapeMarkdown(
        firstValue(finding, [
          "category",
        ])
      )}`
    );

    lines.push(
      `- Risk: ${escapeMarkdown(
        firstValue(finding, [
          "severity",
          "risk",
          "riskLevel",
        ])
      )}`
    );

    lines.push(
      `- Description: ${escapeMarkdown(
        firstValue(finding, [
          "description",
        ])
      )}`
    );

    lines.push(
      `- Recommended action: ${escapeMarkdown(
        firstValue(finding, [
          "recommendedAction",
          "recommendation",
        ])
      )}`
    );

    lines.push("");
  }

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

  for (
    const action of report.treatmentActions
  ) {
    lines.push(
      `| ${escapeMarkdown(
        actionValue(action, "category")
      )} | ${escapeMarkdown(
        actionValue(action, "riskTitle")
      )} | ${escapeMarkdown(
        actionValue(action, "priority")
      )} | ${escapeMarkdown(
        actionValue(action, "owner")
      )} | ${escapeMarkdown(
        actionValue(action, "timeframe")
      )} | ${escapeMarkdown(
        actionValue(action, "effort")
      )} | ${escapeMarkdown(
        actionValue(action, "status")
      )} |`
    );
  }

  lines.push("");

  lines.push(
    "## Residual Risk Governance"
  );

  lines.push("");

  lines.push(
    "| Risk | Inherent | Residual | Decision | Approval | Owner | Review Date |"
  );

  lines.push(
    "|---|---|---|---|---|---|---|"
  );

  for (
    const decision of report.residualRiskDecisions
  ) {
    lines.push(
      `| ${escapeMarkdown(
        decisionValue(
          decision,
          "riskTitle"
        )
      )} | ${escapeMarkdown(
        decisionValue(
          decision,
          "inherentRisk"
        )
      )} | ${escapeMarkdown(
        decisionValue(
          decision,
          "residualRisk"
        )
      )} | ${escapeMarkdown(
        decisionValue(
          decision,
          "decision"
        )
      )} | ${escapeMarkdown(
        decisionValue(
          decision,
          "approvalStatus"
        )
      )} | ${escapeMarkdown(
        decisionValue(
          decision,
          "accountableOwner"
        )
      )} | ${escapeMarkdown(
        decisionValue(
          decision,
          "reviewDate"
        )
      )} |`
    );
  }

  lines.push("");

  lines.push(
    "## Evidence & Closure"
  );

  lines.push("");

  for (
    const action of report.treatmentActions
  ) {
    const evidence =
      report.evidenceRecords[
        text(
          actionValue(
            action,
            "id"
          )
        )
      ];

    lines.push(
      `### ${escapeMarkdown(
        actionValue(
          action,
          "riskTitle"
        )
      )}`
    );

    lines.push(
      `- Treatment status: ${escapeMarkdown(
        actionValue(
          action,
          "status"
        )
      )}`
    );

    lines.push(
      `- Evidence reference: ${escapeMarkdown(
        evidence?.reference
      )}`
    );

    lines.push(
      `- Evidence owner: ${escapeMarkdown(
        evidence?.owner
      )}`
    );

    lines.push(
      `- Evidence verified: ${
        evidence?.verified
          ? "Yes"
          : "No"
      }`
    );

    lines.push(
      `- Closure notes: ${escapeMarkdown(
        evidence?.notes
      )}`
    );

    lines.push("");
  }

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
   DEPENDENCY-FREE PDF RENDERER V3

   A4 PDF
   Structured layout
   Bold headings
   Section banners
   Metric cards
   Risk cards
   Automatic wrapping
   Automatic page breaks
   Header/footer
   Page numbers

   No jsPDF or external dependency required.
   ============================================================ */

const PDF_PAGE_WIDTH = 595;
const PDF_PAGE_HEIGHT = 842;

const PDF_MARGIN_LEFT = 42;
const PDF_MARGIN_RIGHT = 42;
const PDF_MARGIN_TOP = 56;
const PDF_MARGIN_BOTTOM = 52;

const PDF_CONTENT_WIDTH =
  PDF_PAGE_WIDTH -
  PDF_MARGIN_LEFT -
  PDF_MARGIN_RIGHT;

const PDF_BLUE = [
  0.11,
  0.30,
  0.72,
];

const PDF_DARK = [
  0.06,
  0.09,
  0.16,
];

const PDF_MUTED = [
  0.35,
  0.40,
  0.47,
];

const PDF_LIGHT_BLUE = [
  0.93,
  0.96,
  1.0,
];

const PDF_LIGHT_GRAY = [
  0.96,
  0.97,
  0.98,
];

const PDF_BORDER = [
  0.84,
  0.87,
  0.91,
];

const PDF_GREEN = [
  0.08,
  0.50,
  0.25,
];

const PDF_AMBER = [
  0.75,
  0.45,
  0.04,
];

const PDF_RED = [
  0.75,
  0.12,
  0.12,
];

function pdfEscape(
  value: string
): string {
  return value
    .replace(
      /\\/g,
      "\\\\"
    )
    .replace(
      /\(/g,
      "\\("
    )
    .replace(
      /\)/g,
      "\\)"
    )
    .replace(
      /\r/g,
      ""
    )
    .replace(
      /\n/g,
      " "
    );
}

function pdfSafeText(
  value: unknown
): string {
  return text(value)
    .replace(
      /[•●]/g,
      "-"
    )
    .replace(
      /[–—]/g,
      "-"
    )
    .replace(
      /[“”]/g,
      '"'
    )
    .replace(
      /[‘’]/g,
      "'"
    )
    .replace(
      /₹/g,
      "INR "
    )
    .replace(
      /[^\x20-\x7E]/g,
      "?"
    );
}

function pdfColor(
  color: number[]
): string {
  return `${color[0]} ${color[1]} ${color[2]}`;
}

function pdfTextWidth(
  value: string,
  fontSize: number
): number {
  return (
    value.length *
    fontSize *
    0.49
  );
}

function wrapPdfText(
  value: unknown,
  maxWidth: number,
  fontSize: number
): string[] {
  const safe =
    pdfSafeText(value)
      .replace(
        /\s+/g,
        " "
      )
      .trim();

  if (!safe) {
    return [""];
  }

  const maxChars = Math.max(
    10,
    Math.floor(
      maxWidth /
        (fontSize * 0.49)
    )
  );

  const words =
    safe.split(" ");

  const result: string[] = [];

  let current = "";

  for (const word of words) {
    if (!current) {
      current = word;
      continue;
    }

    const candidate =
      `${current} ${word}`;

    if (
      candidate.length <=
      maxChars
    ) {
      current =
        candidate;
    } else {
      result.push(
        current
      );
      current = word;
    }
  }

  if (current) {
    result.push(
      current
    );
  }

  return result;
}

/* ============================================================
   PDF PAGE COMPOSER
   ============================================================ */

class PdfComposer {
  private pages: string[][] = [];

  private commands: string[] = [];

  private y =
    PDF_PAGE_HEIGHT -
    PDF_MARGIN_TOP;

  constructor() {
    this.startPage();
  }

  private startPage(): void {
    this.commands = [];
    this.y =
      PDF_PAGE_HEIGHT -
      PDF_MARGIN_TOP -
      8;

    this.header();
  }

  private header(): void {
    this.commands.push(
      "q"
    );

    this.commands.push(
      `${pdfColor(
        PDF_BLUE
      )} rg`
    );

    this.commands.push(
      `0 ${PDF_PAGE_HEIGHT - 34} ${PDF_PAGE_WIDTH} 34 re f`
    );

    this.commands.push(
      "Q"
    );

    this.text(
      "PrivacyMap India",
      PDF_MARGIN_LEFT,
      PDF_PAGE_HEIGHT - 23,
      10,
      true,
      [1, 1, 1]
    );

    this.text(
      "DPDP Privacy Assessment Report",
      PDF_PAGE_WIDTH -
        PDF_MARGIN_RIGHT -
        180,
      PDF_PAGE_HEIGHT - 23,
      8,
      false,
      [1, 1, 1]
    );
  }

  private footer(
    pageNumber: number,
    totalPages: number
  ): void {
    this.commands.push(
      "q"
    );

    this.commands.push(
      `${pdfColor(
        PDF_BORDER
      )} RG`
    );

    this.commands.push(
      "0.6 w"
    );

    this.commands.push(
      `${PDF_MARGIN_LEFT} 34 m ${PDF_PAGE_WIDTH - PDF_MARGIN_RIGHT} 34 l S`
    );

    this.commands.push(
      "Q"
    );

    this.text(
      "Confidential assessment output",
      PDF_MARGIN_LEFT,
      20,
      7,
      false,
      PDF_MUTED
    );

    const pageText =
      `Page ${pageNumber} of ${totalPages}`;

    this.text(
      pageText,
      PDF_PAGE_WIDTH -
        PDF_MARGIN_RIGHT -
        pdfTextWidth(
          pageText,
          7
        ),
      20,
      7,
      false,
      PDF_MUTED
    );
  }

  private finishPage(): void {
    this.pages.push(
      this.commands
    );
  }

  private newPage(): void {
    this.finishPage();
    this.startPage();
  }

  private ensure(
    height: number
  ): void {
    if (
      this.y -
        height <
      PDF_MARGIN_BOTTOM
    ) {
      this.newPage();
    }
  }

  private text(
    value: unknown,
    x: number,
    y: number,
    size: number,
    bold = false,
    color = PDF_DARK
  ): void {
    const safe =
      pdfSafeText(value);

    if (!safe) {
      return;
    }

    this.commands.push(
      `${pdfColor(color)} rg`
    );

    this.commands.push(
      "BT"
    );

    this.commands.push(
      `/${bold ? "F2" : "F1"} ${size} Tf`
    );

    this.commands.push(
      `1 0 0 1 ${x.toFixed(
        2
      )} ${y.toFixed(
        2
      )} Tm`
    );

    this.commands.push(
      `(${pdfEscape(
        safe
      )}) Tj`
    );

    this.commands.push(
      "ET"
    );
  }

  addText(
    value: unknown,
    options: {
      size?: number;
      bold?: boolean;
      color?: number[];
      gapAfter?: number;
      indent?: number;
      maxWidth?: number;
      lineHeight?: number;
    } = {}
  ): void {
    const size =
      options.size ??
      9;

    const bold =
      options.bold ??
      false;

    const color =
      options.color ??
      PDF_DARK;

    const gapAfter =
      options.gapAfter ??
      4;

    const indent =
      options.indent ??
      0;

    const maxWidth =
      options.maxWidth ??
      PDF_CONTENT_WIDTH -
        indent;

    const lineHeight =
      options.lineHeight ??
      size * 1.35;

    const lines =
      wrapPdfText(
        value,
        maxWidth,
        size
      );

    this.ensure(
      lines.length *
        lineHeight +
        gapAfter
    );

    for (const line of lines) {
      this.text(
        line,
        PDF_MARGIN_LEFT +
          indent,
        this.y,
        size,
        bold,
        color
      );

      this.y -=
        lineHeight;
    }

    this.y -=
      gapAfter;
  }

  addSpacer(
    height = 8
  ): void {
    this.ensure(
      height
    );

    this.y -=
      height;
  }

  addSection(
    title: string
  ): void {
    this.ensure(
      34
    );

    const h = 25;

    this.commands.push(
      "q"
    );

    this.commands.push(
      `${pdfColor(
        PDF_LIGHT_BLUE
      )} rg`
    );

    this.commands.push(
      `${PDF_MARGIN_LEFT} ${
        this.y - h + 5
      } ${PDF_CONTENT_WIDTH} ${h} re f`
    );

    this.commands.push(
      "Q"
    );

    this.text(
      title.toUpperCase(),
      PDF_MARGIN_LEFT + 10,
      this.y - 11,
      9,
      true,
      PDF_BLUE
    );

    this.y -=
      h + 10;
  }

  addKeyValue(
    label: string,
    value: unknown,
    width = PDF_CONTENT_WIDTH
  ): void {
    const labelWidth =
      Math.min(
        115,
        width * 0.32
      );

    const valueWidth =
      width -
      labelWidth -
      12;

    const valueLines =
      wrapPdfText(
        value,
        valueWidth,
        8.5
      );

    const rowHeight =
      Math.max(
        22,
        valueLines.length *
          11 +
          12
      );

    this.ensure(
      rowHeight + 3
    );

    this.commands.push(
      "q"
    );

    this.commands.push(
      `${pdfColor(
        PDF_LIGHT_GRAY
      )} rg`
    );

    this.commands.push(
      `${PDF_MARGIN_LEFT} ${
        this.y - rowHeight + 5
      } ${width} ${
        rowHeight
      } re f`
    );

    this.commands.push(
      `${pdfColor(
        PDF_BORDER
      )} RG`
    );

    this.commands.push(
      "0.5 w"
    );

    this.commands.push(
      `${PDF_MARGIN_LEFT} ${
        this.y - rowHeight + 5
      } ${width} ${
        rowHeight
      } re S`
    );

    this.commands.push(
      "Q"
    );

    this.text(
      label,
      PDF_MARGIN_LEFT + 8,
      this.y - 10,
      7.5,
      true,
      PDF_MUTED
    );

    for (
      let i = 0;
      i < valueLines.length;
      i++
    ) {
      this.text(
        valueLines[i],
        PDF_MARGIN_LEFT +
          labelWidth,
        this.y -
          10 -
          i * 11,
        8.5,
        false,
        PDF_DARK
      );
    }

    this.y -=
      rowHeight + 4;
  }

  addMetricCards(
    metrics: Array<{
      label: string;
      value: string;
      color?: number[];
    }>
  ): void {
    const gap = 8;

    const cardWidth =
      (PDF_CONTENT_WIDTH -
        gap * 2) /
      3;

    const cardHeight =
      58;

    this.ensure(
      cardHeight + 10
    );

    for (
      let i = 0;
      i < metrics.length;
      i++
    ) {
      const metric =
        metrics[i];

      const x =
        PDF_MARGIN_LEFT +
        i *
          (cardWidth + gap);

      this.commands.push(
        "q"
      );

      this.commands.push(
        `${pdfColor(
          PDF_LIGHT_GRAY
        )} rg`
      );

      this.commands.push(
        `${x.toFixed(
          2
        )} ${
          this.y -
          cardHeight +
          5
        } ${cardWidth.toFixed(
          2
        )} ${cardHeight} re f`
      );

      this.commands.push(
        `${pdfColor(
          PDF_BORDER
        )} RG`
      );

      this.commands.push(
        "0.6 w"
      );

      this.commands.push(
        `${x.toFixed(
          2
        )} ${
          this.y -
          cardHeight +
          5
        } ${cardWidth.toFixed(
          2
        )} ${cardHeight} re S`
      );

      this.commands.push(
        "Q"
      );

      this.text(
        metric.label,
        x + 9,
        this.y - 13,
        6.5,
        true,
        PDF_MUTED
      );

      this.text(
        metric.value ||
          "Not Available",
        x + 9,
        this.y - 34,
        14,
        true,
        metric.color ??
          PDF_DARK
      );
    }

    this.y -=
      cardHeight + 12;
  }

  addCard(
    title: string,
    fields: Array<{
      label: string;
      value: unknown;
    }>
  ): void {
    const titleLines =
      wrapPdfText(
        title,
        PDF_CONTENT_WIDTH -
          20,
        9
      );

    const fieldLines =
      fields.map(
        (field) => ({
          label:
            field.label,
          lines:
            wrapPdfText(
              field.value,
              PDF_CONTENT_WIDTH -
                130,
              8
            ),
        })
      );

    let height =
      18 +
      titleLines.length *
        12 +
      8;

    for (const field of fieldLines) {
      height +=
        Math.max(
          16,
          field.lines.length *
            10 +
            6
        );
    }

    height += 10;

    if (
      height >
      PDF_PAGE_HEIGHT -
        PDF_MARGIN_TOP -
        PDF_MARGIN_BOTTOM -
        30
    ) {
      this.addText(
        title,
        {
          size: 9,
          bold: true,
          color: PDF_BLUE,
          gapAfter: 6,
        }
      );

      for (const field of fields) {
        this.addKeyValue(
          field.label,
          field.value
        );
      }

      this.addSpacer(
        6
      );

      return;
    }

    this.ensure(
      height + 6
    );

    const top =
      this.y;

    this.commands.push(
      "q"
    );

    this.commands.push(
      `${pdfColor(
        PDF_LIGHT_GRAY
      )} rg`
    );

    this.commands.push(
      `${PDF_MARGIN_LEFT} ${
        top - height + 5
      } ${PDF_CONTENT_WIDTH} ${height} re f`
    );

    this.commands.push(
      `${pdfColor(
        PDF_BORDER
      )} RG`
    );

    this.commands.push(
      "0.6 w"
    );

    this.commands.push(
      `${PDF_MARGIN_LEFT} ${
        top - height + 5
      } ${PDF_CONTENT_WIDTH} ${height} re S`
    );

    this.commands.push(
      "Q"
    );

    let cy =
      top - 15;

    for (const line of titleLines) {
      this.text(
        line,
        PDF_MARGIN_LEFT + 10,
        cy,
        9,
        true,
        PDF_BLUE
      );

      cy -= 12;
    }

    cy -= 3;

    for (const field of fieldLines) {
      this.text(
        field.label,
        PDF_MARGIN_LEFT + 10,
        cy,
        7.5,
        true,
        PDF_MUTED
      );

      for (
        let i = 0;
        i < field.lines.length;
        i++
      ) {
        this.text(
          field.lines[i],
          PDF_MARGIN_LEFT +
            125,
          cy -
            i * 10,
          8,
          false,
          PDF_DARK
        );
      }

      cy -= Math.max(
        16,
        field.lines.length *
          10 +
          6
      );
    }

    this.y =
      top -
      height -
      8;
  }

  finish(): string[][] {
    this.finishPage();

    return this.pages;
  }

  get pageCommands(): string[][] {
    return this.pages;
  }
}

/* ============================================================
   PDF CONTENT
   ============================================================ */

function buildFormattedPdfPages(
  report: AssessmentReportData
): string[][] {
  const composer =
    new PdfComposer();

  const profile =
    report.assessmentProfile;

  const result =
    report.riskResult;

  const overallRisk =
    text(
      resultValue(
        result,
        "overallRisk"
      )
    );

  const residualRisk =
    text(
      firstValue(result, [
        "overallResidualRisk",
        "residualRisk",
      ])
    );

  const riskScore =
    text(
      resultValue(
        result,
        "riskScore"
      )
    );

  const findings =
    resultValue(
      result,
      "findings"
    );

  const findingsArray =
    Array.isArray(findings)
      ? findings
      : [];

  /* ----------------------------------------------------------
     COVER / REPORT HEADER
     ---------------------------------------------------------- */

  composer.addSpacer(
    12
  );

  composer.addText(
    "DPDP Privacy Assessment Report",
    {
      size: 20,
      bold: true,
      color: PDF_BLUE,
      gapAfter: 5,
    }
  );

  composer.addText(
    pdfSafeText(
      profile.organisationName
    ),
    {
      size: 14,
      bold: true,
      color: PDF_DARK,
      gapAfter: 3,
    }
  );

  composer.addText(
    profile.assessmentName,
    {
      size: 10,
      color: PDF_MUTED,
      gapAfter: 14,
    }
  );

  composer.addKeyValue(
    "Assessment ID",
    profile.assessmentId
  );

  composer.addKeyValue(
    "Generated",
    report.generatedAt
  );

  composer.addSpacer(
    8
  );

  /* ----------------------------------------------------------
     EXECUTIVE SUMMARY
     ---------------------------------------------------------- */

  composer.addSection(
    "Executive Summary"
  );

  composer.addMetricCards([
    {
      label:
        "OVERALL INHERENT RISK",
      value:
        overallRisk ||
        "Not Available",
      color:
        overallRisk ===
        "High"
          ? PDF_RED
          : PDF_DARK,
    },
    {
      label:
        "OVERALL RESIDUAL RISK",
      value:
        residualRisk ||
        "Not Available",
      color:
        residualRisk ===
        "Low"
          ? PDF_GREEN
          : residualRisk ===
            "High"
            ? PDF_RED
            : PDF_DARK,
    },
    {
      label:
        "RISK SCORE",
      value:
        riskScore ||
        "Not Available",
    },
  ]);

  composer.addMetricCards([
    {
      label:
        "PRIVACY RISK FINDINGS",
      value:
        String(
          findingsArray.length
        ),
    },
    {
      label:
        "TREATMENT ACTIONS",
      value:
        String(
          report
            .treatmentActions
            .length
        ),
    },
    {
      label:
        "RESIDUAL RISK DECISIONS",
      value:
        String(
          report
            .residualRiskDecisions
            .length
        ),
    },
  ]);

  composer.addSpacer(
    4
  );

  /* ----------------------------------------------------------
     ASSESSMENT PROFILE
     ---------------------------------------------------------- */

  composer.addSection(
    "Assessment Profile"
  );

  composer.addKeyValue(
    "Organisation",
    profile.organisationName
  );

  composer.addKeyValue(
    "Assessment",
    profile.assessmentName
  );

  composer.addKeyValue(
    "Assessment ID",
    profile.assessmentId
  );

  /* ----------------------------------------------------------
     PRIVACY RISK FINDINGS
     ---------------------------------------------------------- */

  composer.addSection(
    "Privacy Risk Findings"
  );

  if (
    findingsArray.length ===
    0
  ) {
    composer.addText(
      "No privacy risk findings were recorded.",
      {
        size: 9,
        color: PDF_MUTED,
        gapAfter: 8,
      }
    );
  }

  for (
    const finding of findingsArray
  ) {
    const title =
      firstValue(
        finding,
        [
          "title",
          "riskTitle",
          "name",
        ]
      );

    const category =
      firstValue(
        finding,
        [
          "category",
        ]
      );

    const severity =
      firstValue(
        finding,
        [
          "severity",
          "risk",
          "riskLevel",
        ]
      );

    const description =
      firstValue(
        finding,
        [
          "description",
        ]
      );

    const recommendation =
      firstValue(
        finding,
        [
          "recommendedAction",
          "recommendation",
        ]
      );

    composer.addCard(
      text(
        title
      ) ||
        "Privacy Risk Finding",
      [
        {
          label:
            "Category",
          value:
            category,
        },
        {
          label:
            "Risk / Severity",
          value:
            severity,
        },
        {
          label:
            "Description",
          value:
            description,
        },
        {
          label:
            "Recommended Action",
          value:
            recommendation,
        },
      ]
    );
  }

  /* ----------------------------------------------------------
     RISK TREATMENT
     ---------------------------------------------------------- */

  composer.addSection(
    "Risk Treatment & Action Plan"
  );

  if (
    report.treatmentActions
      .length === 0
  ) {
    composer.addText(
      "No treatment actions were recorded.",
      {
        size: 9,
        color: PDF_MUTED,
      }
    );
  }

  for (
    const action of report.treatmentActions
  ) {
    const actionId =
      actionValue(
        action,
        "id"
      );

    const riskTitle =
      actionValue(
        action,
        "riskTitle"
      );

    const category =
      actionValue(
        action,
        "category"
      );

    const status =
      actionValue(
        action,
        "status"
      );

    const priority =
      actionValue(
        action,
        "priority"
      );

    const owner =
      actionValue(
        action,
        "owner"
      );

    const timeframe =
      actionValue(
        action,
        "timeframe"
      );

    const effort =
      actionValue(
        action,
        "effort"
      );

    const treatment =
      actionValue(
        action,
        "recommendedTreatment"
      );

    composer.addCard(
      `${text(
        riskTitle
      ) || "Treatment Action"}${
        text(actionId)
          ? ` (${text(
              actionId
            )})`
          : ""
      }`,
      [
        {
          label:
            "Category",
          value:
            category,
        },
        {
          label:
            "Treatment Status",
          value:
            status,
        },
        {
          label:
            "Priority",
          value:
            priority,
        },
        {
          label:
            "Owner",
          value:
            owner,
        },
        {
          label:
            "Timeframe",
          value:
            timeframe,
        },
        {
          label:
            "Effort",
          value:
            effort,
        },
        {
          label:
            "Recommended Treatment",
          value:
            treatment,
        },
      ]
    );
  }

  /* ----------------------------------------------------------
     RESIDUAL RISK GOVERNANCE
     ---------------------------------------------------------- */

  composer.addSection(
    "Residual Risk Governance"
  );

  if (
    report
      .residualRiskDecisions
      .length === 0
  ) {
    composer.addText(
      "No residual-risk decisions were recorded.",
      {
        size: 9,
        color: PDF_MUTED,
      }
    );
  }

  for (
    const decision of
      report.residualRiskDecisions
  ) {
    composer.addCard(
      text(
        decisionValue(
          decision,
          "riskTitle"
        )
      ) ||
        "Residual Risk Decision",
      [
        {
          label:
            "Finding ID",
          value:
            decisionValue(
              decision,
              "findingId"
            ),
        },
        {
          label:
            "Category",
          value:
            decisionValue(
              decision,
              "category"
            ),
        },
        {
          label:
            "Inherent Risk",
          value:
            decisionValue(
              decision,
              "inherentRisk"
            ),
        },
        {
          label:
            "Residual Risk",
          value:
            decisionValue(
              decision,
              "residualRisk"
            ),
        },
        {
          label:
            "Decision",
          value:
            decisionValue(
              decision,
              "decision"
            ),
        },
        {
          label:
            "Approval Status",
          value:
            decisionValue(
              decision,
              "approvalStatus"
            ),
        },
        {
          label:
            "Accountable Owner",
          value:
            decisionValue(
              decision,
              "accountableOwner"
            ),
        },
        {
          label:
            "Decision Authority",
          value:
            decisionValue(
              decision,
              "decisionAuthority"
            ),
        },
        {
          label:
            "Review Date",
          value:
            decisionValue(
              decision,
              "reviewDate"
            ),
        },
        {
          label:
            "Approval Date",
          value:
            decisionValue(
              decision,
              "approvalDate"
            ),
        },
        {
          label:
            "Next Review Date",
          value:
            decisionValue(
              decision,
              "nextReviewDate"
            ),
        },
        {
          label:
            "Review Frequency",
          value:
            decisionValue(
              decision,
              "reviewFrequency"
            ),
        },
        {
          label:
            "Decision Rationale",
          value:
            decisionValue(
              decision,
              "rationale"
            ),
        },
        {
          label:
            "Escalation Required",
          value:
            Boolean(
              decisionValue(
                decision,
                "escalationRequired"
              )
            )
              ? "Yes"
              : "No",
        },
        {
          label:
            "Escalation Reason",
          value:
            decisionValue(
              decision,
              "escalationReason"
            ),
        },
      ]
    );
  }

  /* ----------------------------------------------------------
     EVIDENCE & CLOSURE
     ---------------------------------------------------------- */

  composer.addSection(
    "Evidence & Closure"
  );

  if (
    report.treatmentActions
      .length === 0
  ) {
    composer.addText(
      "No treatment actions are available for evidence closure.",
      {
        size: 9,
        color: PDF_MUTED,
      }
    );
  }

  for (
    const action of report.treatmentActions
  ) {
    const id =
      text(
        actionValue(
          action,
          "id"
        )
      );

    const evidence =
      report.evidenceRecords[
        id
      ];

    composer.addCard(
      text(
        actionValue(
          action,
          "riskTitle"
        )
      ) ||
        "Evidence Record",
      [
        {
          label:
            "Treatment Status",
          value:
            actionValue(
              action,
              "status"
            ),
        },
        {
          label:
            "Evidence Reference",
          value:
            evidence?.reference,
        },
        {
          label:
            "Evidence Owner",
          value:
            evidence?.owner,
        },
        {
          label:
            "Evidence Verified",
          value:
            evidence?.verified
              ? "Yes"
              : "No",
        },
        {
          label:
            "Closure Notes",
          value:
            evidence?.notes,
        },
      ]
    );
  }

  /* ----------------------------------------------------------
     CLOSING NOTE
     ---------------------------------------------------------- */

  composer.addSpacer(
    8
  );

  composer.addText(
    "Assessment Interpretation",
    {
      size: 10,
      bold: true,
      color: PDF_BLUE,
      gapAfter: 5,
    }
  );

  composer.addText(
    "PrivacyMap India assessment output is a risk-assessment and governance aid. It is not a legal opinion, certification or automatic determination of DPDP compliance.",
    {
      size: 8,
      color: PDF_MUTED,
      maxWidth:
        PDF_CONTENT_WIDTH,
      lineHeight: 11,
      gapAfter: 4,
    }
  );

  return composer.finish();
}

/* ============================================================
   PDF OBJECT GENERATION
   ============================================================ */

function buildPdfContentObject(
  commands: string[]
): string {
  const stream =
    commands.join(
      "\n"
    );

  return `<< /Length ${new TextEncoder().encode(
    stream
  ).length} >>
stream
${stream}
endstream`;
}

function buildPdfDocument(
  pages: string[][]
): Blob {
  const objects: string[] =
    [];

  const pageObjectIds: number[] =
    [];

  const contentObjectIds: number[] =
    [];

  /*
   * Object 1 = Catalog
   * Object 2 = Pages
   *
   * Then each page has:
   * - Page object
   * - Content object
   *
   * Final two objects:
   * - Helvetica regular
   * - Helvetica bold
   */

  objects.push("");
  objects.push("");

  for (
    let i = 0;
    i < pages.length;
    i++
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

  const regularFontId =
    objects.length + 1;

  objects.push(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>"
  );

  const boldFontId =
    objects.length + 1;

  objects.push(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>"
  );

  const pageKids =
    pageObjectIds
      .map(
        (id) =>
          `${id} 0 R`
      )
      .join(" ");

  objects[0] =
    `<< /Type /Catalog /Pages 2 0 R >>`;

  objects[1] =
    `<< /Type /Pages /Kids [${pageKids}] /Count ${pages.length} >>`;

  /*
   * Add footer after total page count is known.
   */

  const finalPageCommands =
    pages.map(
      (
        commands,
        index
      ) => {
        const pageCommands =
          [
            ...commands,
          ];

        const footerComposer =
          new PdfComposer();

        /*
         * We only use PdfComposer's
         * footer helper indirectly here
         * by constructing equivalent
         * footer commands.
         */

        pageCommands.push(
          "q"
        );

        pageCommands.push(
          `${pdfColor(
            PDF_BORDER
          )} RG`
        );

        pageCommands.push(
          "0.6 w"
        );

        pageCommands.push(
          `${PDF_MARGIN_LEFT} 34 m ${
            PDF_PAGE_WIDTH -
            PDF_MARGIN_RIGHT
          } 34 l S`
        );

        pageCommands.push(
          "Q"
        );

        pageCommands.push(
          `${pdfColor(
            PDF_MUTED
          )} rg`
        );

        pageCommands.push(
          "BT"
        );

        pageCommands.push(
          "/F1 7 Tf"
        );

        pageCommands.push(
          `1 0 0 1 ${PDF_MARGIN_LEFT} 20 Tm`
        );

        pageCommands.push(
          "(Confidential assessment output) Tj"
        );

        pageCommands.push(
          "ET"
        );

        const pageText =
          `Page ${
            index + 1
          } of ${
            pages.length
          }`;

        const pageTextWidth =
          pdfTextWidth(
            pageText,
            7
          );

        pageCommands.push(
          "BT"
        );

        pageCommands.push(
          "/F1 7 Tf"
        );

        pageCommands.push(
          `1 0 0 1 ${
            PDF_PAGE_WIDTH -
            PDF_MARGIN_RIGHT -
            pageTextWidth
          } 20 Tm`
        );

        pageCommands.push(
          `(${pdfEscape(
            pageText
          )}) Tj`
        );

        pageCommands.push(
          "ET"
        );

        void footerComposer;

        return pageCommands;
      }
    );

  for (
    let i = 0;
    i < finalPageCommands.length;
    i++
  ) {
    const resources =
      `<< /Font << /F1 ${regularFontId} 0 R /F2 ${boldFontId} 0 R >> >>`;

    objects[
      pageObjectIds[i] - 1
    ] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PDF_PAGE_WIDTH} ${PDF_PAGE_HEIGHT}] /Resources ${resources} /Contents ${contentObjectIds[i]} 0 R >>`;

    objects[
      contentObjectIds[i] - 1
    ] =
      buildPdfContentObject(
        finalPageCommands[i]
      );
  }

  /*
   * PDF offsets must be byte offsets,
   * not JavaScript character offsets.
   *
   * All generated PDF content is ASCII,
   * so the encoder is deterministic.
   */

  const encoder =
    new TextEncoder();

  let pdf =
    "%PDF-1.4\n";

  const offsets: number[] =
    [0];

  for (
    let i = 0;
    i < objects.length;
    i++
  ) {
    offsets[i + 1] =
      encoder.encode(
        pdf
      ).length;

    pdf +=
      `${i + 1} 0 obj\n`;

    pdf +=
      `${objects[i]}\n`;

    pdf +=
      "endobj\n";
  }

  const xrefOffset =
    encoder.encode(
      pdf
    ).length;

  pdf +=
    `xref\n0 ${
      objects.length + 1
    }\n`;

  pdf +=
    "0000000000 65535 f \n";

  for (
    let i = 1;
    i <= objects.length;
    i++
  ) {
    pdf +=
      `${String(
        offsets[i]
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
      type:
        "application/pdf",
    }
  );
}

/* ============================================================
   CREATE PDF BLOB
   ============================================================ */

export function createPdfBlob(
  report: AssessmentReportData
): Blob {
  const pages =
    buildFormattedPdfPages(
      report
    );

  return buildPdfDocument(
    pages
  );
}

/* ============================================================
   DOWNLOAD PDF
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
    URL.createObjectURL(
      blob
    );

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
    1500
  );
}
