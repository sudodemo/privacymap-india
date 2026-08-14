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

export type EvidenceRecords = Record<
  string,
  EvidenceRecord
>;

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
  if (
    value === null ||
    value === undefined
  ) {
    return "";
  }

  return String(value);
}

function recordValue(
  value: unknown,
  key: string
): unknown {
  if (
    value === null ||
    value === undefined ||
    typeof value !== "object"
  ) {
    return "";
  }

  return (
    value as Record<string, unknown>
  )[key];
}

function field(
  value: unknown,
  key: string
): string {
  return text(
    recordValue(value, key)
  );
}

function resultValue(
  result: RiskResult | null,
  key: string
): unknown {
  if (!result) {
    return "";
  }

  return (
    result as unknown as Record<
      string,
      unknown
    >
  )[key];
}

function arrayValue(
  result: RiskResult | null,
  key: string
): unknown[] {
  const value = resultValue(
    result,
    key
  );

  return Array.isArray(value)
    ? value
    : [];
}

/* ============================================================
   ESCAPERS
   ============================================================ */

function escapeCsv(
  value: unknown
): string {
  const s = text(value);

  if (
    s.includes(",") ||
    s.includes('"') ||
    s.includes("\n") ||
    s.includes("\r")
  ) {
    return `"${s.replace(
      /"/g,
      '""'
    )}"`;
  }

  return s;
}

function escapeXml(
  value: unknown
): string {
  return text(value)
    .replace(
      /&/g,
      "&amp;"
    )
    .replace(
      /</g,
      "&lt;"
    )
    .replace(
      />/g,
      "&gt;"
    )
    .replace(
      /"/g,
      "&quot;"
    )
    .replace(
      /'/g,
      "&apos;"
    );
}

function escapeMarkdown(
  value: unknown
): string {
  return text(value)
    .replace(
      /\|/g,
      "\\|"
    )
    .replace(
      /\r?\n/g,
      "<br>"
    );
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

  for (
    const action of
      report.treatmentActions
  ) {
    const decision =
      report.residualRiskDecisions.find(
        (item) =>
          item.riskTitle ===
            field(
              action,
              "riskTitle"
            ) &&
          item.category ===
            field(
              action,
              "category"
            )
      );

    const evidence =
      report.evidenceRecords[
        text(
          recordValue(
            action,
            "id"
          )
        )
      ];

    rows.push([
      "Risk Treatment",

      field(
        action,
        "id"
      ),

      field(
        action,
        "category"
      ),

      field(
        action,
        "riskTitle"
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

      field(
        action,
        "status"
      ),

      field(
        action,
        "owner"
      ),

      field(
        action,
        "priority"
      ),

      field(
        action,
        "timeframe"
      ),

      field(
        action,
        "effort"
      ),

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

  const findings =
    arrayValue(
      result,
      "findings"
    );

  const overallRisk =
    resultValue(
      result,
      "overallRisk"
    );

  const riskScore =
    resultValue(
      result,
      "riskScore"
    );

  const findingXml =
    findings
      .map(
        (finding) => {
          const item =
            finding as Record<
              string,
              unknown
            >;

          return `
      <finding>
        <id>${escapeXml(
          item.id
        )}</id>
        <category>${escapeXml(
          item.category
        )}</category>
        <title>${escapeXml(
          item.title ??
            item.riskTitle ??
            item.name
        )}</title>
        <severity>${escapeXml(
          item.severity ??
            item.risk ??
            item.riskLevel
        )}</severity>
        <description>${escapeXml(
          item.description
        )}</description>
        <recommendedAction>${escapeXml(
          item.recommendedAction ??
            item.recommendation
        )}</recommendedAction>
      </finding>`;
        }
      )
      .join("");

  const treatmentXml =
    report.treatmentActions
      .map(
        (action) => {
          const decision =
            report.residualRiskDecisions.find(
              (item) =>
                item.riskTitle ===
                  field(
                    action,
                    "riskTitle"
                  ) &&
                item.category ===
                  field(
                    action,
                    "category"
                  )
            );

          const evidence =
            report.evidenceRecords[
              field(
                action,
                "id"
              )
            ];

          return `
      <treatment>
        <id>${escapeXml(
          field(
            action,
            "id"
          )
        )}</id>

        <category>${escapeXml(
          field(
            action,
            "category"
          )
        )}</category>

        <riskTitle>${escapeXml(
          field(
            action,
            "riskTitle"
          )
        )}</riskTitle>

        <recommendedTreatment>${escapeXml(
          field(
            action,
            "recommendedTreatment"
          )
        )}</recommendedTreatment>

        <status>${escapeXml(
          field(
            action,
            "status"
          )
        )}</status>

        <priority>${escapeXml(
          field(
            action,
            "priority"
          )
        )}</priority>

        <owner>${escapeXml(
          field(
            action,
            "owner"
          )
        )}</owner>

        <timeframe>${escapeXml(
          field(
            action,
            "timeframe"
          )
        )}</timeframe>

        <effort>${escapeXml(
          field(
            action,
            "effort"
          )
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
        }
      )
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

    <riskScore>${escapeXml(
      riskScore
    )}</riskScore>

    <findingCount>${
      findings.length
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

  const findings =
    arrayValue(
      result,
      "findings"
    );

  const overallRisk =
    text(
      resultValue(
        result,
        "overallRisk"
      )
    );

  const riskScore =
    text(
      resultValue(
        result,
        "riskScore"
      )
    );

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
    `- Overall Risk: **${overallRisk}**`
  );

  lines.push(
    `- Risk Score: **${riskScore}**`
  );

  lines.push(
    `- Findings: **${findings.length}**`
  );

  lines.push(
    `- Treatment Actions: **${report.treatmentActions.length}**`
  );

  lines.push(
    `- Residual Risk Decisions: **${report.residualRiskDecisions.length}**`
  );

  lines.push("");

  lines.push(
    "## Privacy Risk Findings"
  );

  lines.push("");

  for (
    const finding of findings
  ) {
    const item =
      finding as Record<
        string,
        unknown
      >;

    lines.push(
      `### ${escapeMarkdown(
        item.title ??
          item.riskTitle ??
          item.name
      )}`
    );

    lines.push(
      `- Category: ${escapeMarkdown(
        item.category
      )}`
    );

    lines.push(
      `- Risk: ${escapeMarkdown(
        item.severity ??
          item.risk ??
          item.riskLevel
      )}`
    );

    lines.push(
      `- Description: ${escapeMarkdown(
        item.description
      )}`
    );

    lines.push(
      `- Recommended action: ${escapeMarkdown(
        item.recommendedAction ??
          item.recommendation
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
    const action of
      report.treatmentActions
  ) {
    lines.push(
      `| ${escapeMarkdown(
        field(action, "category")
      )} | ${escapeMarkdown(
        field(action, "riskTitle")
      )} | ${escapeMarkdown(
        field(action, "priority")
      )} | ${escapeMarkdown(
        field(action, "owner")
      )} | ${escapeMarkdown(
        field(action, "timeframe")
      )} | ${escapeMarkdown(
        field(action, "effort")
      )} | ${escapeMarkdown(
        field(action, "status")
      )} |`
    );
  }

  lines.push("");

  lines.push(
    "## Residual Risk Assessment"
  );

  lines.push("");

  lines.push(
    "| Risk | Inherent | Residual | Decision | Approval | Owner | Review Date |"
  );

  lines.push(
    "|---|---|---|---|---|---|---|"
  );

  for (
    const decision of
      report.residualRiskDecisions
  ) {
    lines.push(
      `| ${escapeMarkdown(
        decision.riskTitle
      )} | ${escapeMarkdown(
        decision.inherentRisk
      )} | ${escapeMarkdown(
        decision.residualRisk
      )} | ${escapeMarkdown(
        decision.decision
      )} | ${escapeMarkdown(
        decision.approvalStatus
      )} | ${escapeMarkdown(
        decision.accountableOwner
      )} | ${escapeMarkdown(
        decision.reviewDate
      )} |`
    );
  }

  lines.push("");

  lines.push(
    "## Risk Governance & Approval"
  );

  lines.push("");

  for (
    const decision of
      report.residualRiskDecisions
  ) {
    lines.push(
      `### ${escapeMarkdown(
        decision.riskTitle
      )}`
    );

    lines.push(
      `- Decision: ${escapeMarkdown(
        decision.decision
      )}`
    );

    lines.push(
      `- Approval status: ${escapeMarkdown(
        decision.approvalStatus
      )}`
    );

    lines.push(
      `- Accountable owner: ${escapeMarkdown(
        decision.accountableOwner
      )}`
    );

    lines.push(
      `- Decision authority: ${escapeMarkdown(
        decision.decisionAuthority
      )}`
    );

    lines.push(
      `- Review date: ${escapeMarkdown(
        decision.reviewDate
      )}`
    );

    lines.push(
      `- Next review date: ${escapeMarkdown(
        decision.nextReviewDate
      )}`
    );

    lines.push("");

  }

  lines.push(
    "## Remediation Tracker"
  );

  lines.push("");

  for (
    const action of
      report.treatmentActions
  ) {
    lines.push(
      `### ${escapeMarkdown(
        field(
          action,
          "riskTitle"
        )
      )}`
    );

    lines.push(
      `- Status: ${escapeMarkdown(
        field(
          action,
          "status"
        )
      )}`
    );

    lines.push(
      `- Priority: ${escapeMarkdown(
        field(
          action,
          "priority"
        )
      )}`
    );

    lines.push(
      `- Owner: ${escapeMarkdown(
        field(
          action,
          "owner"
        )
      )}`
    );

    lines.push("");
  }

  lines.push(
    "## Evidence & Closure"
  );

  lines.push("");

  for (
    const action of
      report.treatmentActions
  ) {
    const evidence =
      report.evidenceRecords[
        field(
          action,
          "id"
        )
      ];

    lines.push(
      `### ${escapeMarkdown(
        field(
          action,
          "riskTitle"
        )
      )}`
    );

    lines.push(
      `- Treatment status: ${escapeMarkdown(
        field(
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
   BROWSER DOWNLOAD
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

  window.setTimeout(
    () =>
      URL.revokeObjectURL(
        url
      ),
    1000
  );
}

/* ============================================================
   DEPENDENCY-FREE PDF ENGINE
   ============================================================

   This PDF engine deliberately uses only the browser and
   native PDF syntax.

   No npm package is required.

   The PDF is built from:
   - text
   - rectangles
   - lines
   - simple tables
   - page headers
   - page footers
   ============================================================ */

/* ------------------------------------------------------------
   PDF constants
   ------------------------------------------------------------ */

const PDF_PAGE_WIDTH = 595;
const PDF_PAGE_HEIGHT = 842;

const PDF_MARGIN_LEFT = 42;
const PDF_MARGIN_RIGHT = 42;

const PDF_CONTENT_WIDTH =
  PDF_PAGE_WIDTH -
  PDF_MARGIN_LEFT -
  PDF_MARGIN_RIGHT;

const PDF_TOP = 785;
const PDF_BOTTOM = 55;

/* ------------------------------------------------------------
   PDF-safe text
   ------------------------------------------------------------ */

function pdfSafeText(
  value: unknown
): string {
  return text(value)
    .replace(
      /[^\x20-\x7E]/g,
      " "
    )
    .replace(
      /\s+/g,
      " "
    )
    .trim();
}

function pdfEscape(
  value: string
): string {
  return pdfSafeText(value)
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
    );
}

/* ------------------------------------------------------------
   Approximate text width
   ------------------------------------------------------------ */

function pdfTextWidth(
  value: string,
  fontSize: number
): number {
  return (
    pdfSafeText(value).length *
    fontSize *
    0.48
  );
}

function pdfWrap(
  value: unknown,
  maxWidth: number,
  fontSize = 9
): string[] {
  const safe =
    pdfSafeText(value);

  if (!safe) {
    return [""];
  }

  const words =
    safe.split(/\s+/);

  const lines: string[] = [];

  let current = "";

  for (
    const word of words
  ) {
    const candidate =
      current
        ? `${current} ${word}`
        : word;

    if (
      pdfTextWidth(
        candidate,
        fontSize
      ) <= maxWidth
    ) {
      current =
        candidate;
      continue;
    }

    if (current) {
      lines.push(current);
    }

    current = word;
  }

  if (current) {
    lines.push(current);
  }

  return lines.length
    ? lines
    : [""];
}

/* ------------------------------------------------------------
   PDF color
   ------------------------------------------------------------ */

function pdfRgb(
  hex: string
): string {
  const clean =
    hex.replace(
      "#",
      ""
    );

  const r =
    parseInt(
      clean.slice(0, 2),
      16
    ) / 255;

  const g =
    parseInt(
      clean.slice(2, 4),
      16
    ) / 255;

  const b =
    parseInt(
      clean.slice(4, 6),
      16
    ) / 255;

  return `${r.toFixed(
    3
  )} ${g.toFixed(
    3
  )} ${b.toFixed(
    3
  )}`;
}

/* ------------------------------------------------------------
   PDF drawing helpers
   ------------------------------------------------------------ */

type PdfCommand = {
  type:
    | "text"
    | "rect"
    | "line";
  x: number;
  y: number;
  width?: number;
  height?: number;
  text?: string;
  fontSize?: number;
  font?: "F1" | "F2";
  color?: string;
  fill?: string;
};

function drawText(
  commands: PdfCommand[],
  value: unknown,
  x: number,
  y: number,
  options?: {
    fontSize?: number;
    font?: "F1" | "F2";
    color?: string;
  }
): void {
  commands.push({
    type: "text",
    x,
    y,
    text:
      pdfSafeText(value),
    fontSize:
      options?.fontSize ??
      9,
    font:
      options?.font ??
      "F1",
    color:
      options?.color ??
      "#334155",
  });
}

function drawRect(
  commands: PdfCommand[],
  x: number,
  y: number,
  width: number,
  height: number,
  fill: string,
  stroke = "#e2e8f0"
): void {
  commands.push({
    type: "rect",
    x,
    y,
    width,
    height,
    fill,
    color: stroke,
  });
}

function drawLine(
  commands: PdfCommand[],
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  color = "#cbd5e1"
): void {
  commands.push({
    type: "line",
    x: x1,
    y: y1,
    width: x2,
    height: y2,
    color,
  });
}

/* ------------------------------------------------------------
   PDF page builder
   ------------------------------------------------------------ */

class PdfPageBuilder {
  commands: PdfCommand[] = [];

  cursor = PDF_TOP;

  pageNumber = 1;

  constructor(
    pageNumber: number
  ) {
    this.pageNumber =
      pageNumber;
  }

  remaining(): number {
    return (
      this.cursor -
      PDF_BOTTOM
    );
  }

  move(
    amount: number
  ): void {
    this.cursor -= amount;
  }

  ensure(
    height: number
  ): boolean {
    return (
      this.remaining() >=
      height
    );
  }

  text(
    value: unknown,
    options?: {
      fontSize?: number;
      font?: "F1" | "F2";
      color?: string;
      x?: number;
    }
  ): void {
    const fontSize =
      options?.fontSize ??
      9;

    const x =
      options?.x ??
      PDF_MARGIN_LEFT;

    drawText(
      this.commands,
      value,
      x,
      this.cursor,
      {
        fontSize,
        font:
          options?.font ??
          "F1",
        color:
          options?.color ??
          "#334155",
      }
    );

    this.move(
      fontSize + 5
    );
  }

  paragraph(
    value: unknown,
    width = PDF_CONTENT_WIDTH,
    fontSize = 9,
    lineHeight = 13
  ): void {
    const lines =
      pdfWrap(
        value,
        width,
        fontSize
      );

    for (
      const line of lines
    ) {
      if (
        !this.ensure(
          lineHeight
        )
      ) {
        break;
      }

      drawText(
        this.commands,
        line,
        PDF_MARGIN_LEFT,
        this.cursor,
        {
          fontSize,
          color:
            "#475569",
        }
      );

      this.move(
        lineHeight
      );
    }

    this.move(4);
  }

  heading(
    title: string
  ): void {
    if (
      !this.ensure(35)
    ) {
      return;
    }

    drawText(
      this.commands,
      title,
      PDF_MARGIN_LEFT,
      this.cursor,
      {
        fontSize: 18,
        font: "F2",
        color:
          "#0f172a",
      }
    );

    this.move(25);

    drawLine(
      this.commands,
      PDF_MARGIN_LEFT,
      this.cursor,
      PDF_PAGE_WIDTH -
        PDF_MARGIN_RIGHT,
      this.cursor,
      "#dbeafe"
    );

    this.move(14);
  }

  subheading(
    title: string
  ): void {
    if (
      !this.ensure(28)
    ) {
      return;
    }

    drawText(
      this.commands,
      title,
      PDF_MARGIN_LEFT,
      this.cursor,
      {
        fontSize: 12,
        font: "F2",
        color:
          "#1e3a8a",
      }
    );

    this.move(18);
  }

  keyValue(
    label: string,
    value: unknown,
    width = PDF_CONTENT_WIDTH
  ): void {
    const valueText =
      pdfSafeText(value);

    const labelWidth = 105;

    if (
      !this.ensure(22)
    ) {
      return;
    }

    drawText(
      this.commands,
      label,
      PDF_MARGIN_LEFT,
      this.cursor,
      {
        fontSize: 8,
        font: "F2",
        color:
          "#64748b",
      }
    );

    const valueLines =
      pdfWrap(
        valueText,
        width -
          labelWidth,
        9
      );

    let first = true;

    for (
      const line of valueLines
    ) {
      drawText(
        this.commands,
        line,
        PDF_MARGIN_LEFT +
          labelWidth,
        this.cursor,
        {
          fontSize: 9,
          color:
            "#0f172a",
        }
      );

      this.move(12);

      first = false;

      if (
        !first
      ) {
        break;
      }
    }

    this.move(5);
  }

  card(
    title: string,
    value: unknown,
    width = PDF_CONTENT_WIDTH
  ): void {
    const lines =
      pdfWrap(
        value,
        width - 24,
        9
      );

    const height =
      28 +
      lines.length *
        13 +
      14;

    if (
      !this.ensure(height)
    ) {
      return;
    }

    const bottom =
      this.cursor -
      height;

    drawRect(
      this.commands,
      PDF_MARGIN_LEFT,
      bottom,
      width,
      height,
      "#f8fafc",
      "#e2e8f0"
    );

    drawText(
      this.commands,
      title,
      PDF_MARGIN_LEFT +
        12,
      this.cursor -
        18,
      {
        fontSize: 8,
        font: "F2",
        color:
          "#64748b",
      }
    );

    let y =
      this.cursor -
      33;

    for (
      const line of lines
    ) {
      drawText(
        this.commands,
        line,
        PDF_MARGIN_LEFT +
          12,
        y,
        {
          fontSize: 9,
          color:
            "#0f172a",
        }
      );

      y -= 13;
    }

    this.cursor =
      bottom - 12;
  }
}

/* ------------------------------------------------------------
   PDF page data
   ------------------------------------------------------------ */

type PdfPageData = {
  commands: PdfCommand[];
};

/* ------------------------------------------------------------
   Add footer
   ------------------------------------------------------------ */

function addPdfFooter(
  page: PdfPageBuilder,
  report: AssessmentReportData,
  pageNumber: number,
  totalPages: number
): void {
  drawLine(
    page.commands,
    PDF_MARGIN_LEFT,
    34,
    PDF_PAGE_WIDTH -
      PDF_MARGIN_RIGHT,
    34,
    "#e2e8f0"
  );

  drawText(
    page.commands,
    "PrivacyMap India",
    PDF_MARGIN_LEFT,
    20,
    {
      fontSize: 7,
      font: "F2",
      color:
        "#64748b",
    }
  );

  drawText(
    page.commands,
    `Assessment ID: ${pdfSafeText(
      report.assessmentProfile
        .assessmentId
    )}`,
    PDF_MARGIN_LEFT +
      95,
    20,
    {
      fontSize: 7,
      color:
        "#64748b",
    }
  );

  const pageText =
    `Page ${pageNumber} of ${totalPages}`;

  const width =
    pdfTextWidth(
      pageText,
      7
    );

  drawText(
    page.commands,
    pageText,
    PDF_PAGE_WIDTH -
      PDF_MARGIN_RIGHT -
      width,
    20,
    {
      fontSize: 7,
      color:
        "#64748b",
    }
  );
}

/* ============================================================
   BUILD PDF CONTENT
   ============================================================ */

function buildPdfPages(
  report: AssessmentReportData
): PdfPageData[] {
  const pages: PdfPageData[] = [];

  let current =
    new PdfPageBuilder(
      1
    );

  function newPage(): void {
    pages.push({
      commands:
        current.commands,
    });

    current =
      new PdfPageBuilder(
        pages.length + 1
      );
  }

  function ensure(
    height: number
  ): void {
    if (
      !current.ensure(
        height
      )
    ) {
      newPage();
    }
  }

  function section(
    title: string
  ): void {
    ensure(45);

    current.heading(
      title
    );
  }

  const profile =
    report.assessmentProfile;

  const result =
    report.riskResult;

  const findings =
    arrayValue(
      result,
      "findings"
    );

  const overallRisk =
    text(
      resultValue(
        result,
        "overallRisk"
      )
    );

  const riskScore =
    text(
      resultValue(
        result,
        "riskScore"
      )
    );

  /* ==========================================================
     COVER PAGE
     ========================================================== */

  drawRect(
    current.commands,
    0,
    0,
    PDF_PAGE_WIDTH,
    PDF_PAGE_HEIGHT,
    "#f8fafc",
    "#f8fafc"
  );

  drawRect(
    current.commands,
    0,
    760,
    PDF_PAGE_WIDTH,
    82,
    "#1d4ed8",
    "#1d4ed8"
  );

  drawText(
    current.commands,
    "PRIVACYMAP INDIA",
    48,
    802,
    {
      fontSize: 11,
      font: "F2",
      color:
        "#ffffff",
    }
  );

  drawText(
    current.commands,
    "DPDP PRIVACY ASSESSMENT",
    48,
    715,
    {
      fontSize: 25,
      font: "F2",
      color:
        "#0f172a",
    }
  );

  drawText(
    current.commands,
    "Assessment Report",
    48,
    682,
    {
      fontSize: 17,
      color:
        "#475569",
    }
  );

  drawLine(
    current.commands,
    48,
    655,
    PDF_PAGE_WIDTH -
      48,
    655,
    "#cbd5e1"
  );

  drawText(
    current.commands,
    "Organisation",
    48,
    610,
    {
      fontSize: 8,
      font: "F2",
      color:
        "#64748b",
    }
  );

  drawText(
    current.commands,
    profile.organisationName,
    48,
    586,
    {
      fontSize: 19,
      font: "F2",
      color:
        "#0f172a",
    }
  );

  drawText(
    current.commands,
    "Assessment",
    48,
    545,
    {
      fontSize: 8,
      font: "F2",
      color:
        "#64748b",
    }
  );

  drawText(
    current.commands,
    profile.assessmentName,
    48,
    522,
    {
      fontSize: 13,
      font: "F2",
      color:
        "#334155",
    }
  );

  drawText(
    current.commands,
    "Assessment ID",
    48,
    480,
    {
      fontSize: 8,
      font: "F2",
      color:
        "#64748b",
    }
  );

  drawText(
    current.commands,
    profile.assessmentId,
    48,
    457,
    {
      fontSize: 12,
      font: "F2",
      color:
        "#334155",
    }
  );

  drawText(
    current.commands,
    "Generated",
    48,
    415,
    {
      fontSize: 8,
      font: "F2",
      color:
        "#64748b",
    }
  );

  drawText(
    current.commands,
    report.generatedAt,
    48,
    392,
    {
      fontSize: 10,
      color:
        "#334155",
    }
  );

  drawRect(
    current.commands,
    48,
    220,
    PDF_CONTENT_WIDTH,
    105,
    "#eff6ff",
    "#bfdbfe"
  );

  drawText(
    current.commands,
    "REPORT PURPOSE",
    64,
    297,
    {
      fontSize: 8,
      font: "F2",
      color:
        "#1d4ed8",
    }
  );

  const purpose =
    "This report consolidates the privacy risk assessment, treatment actions, residual-risk governance, remediation progress and evidence closure recorded during the PrivacyMap India assessment.";

  const purposeLines =
    pdfWrap(
      purpose,
      PDF_CONTENT_WIDTH -
        32,
      9
    );

  let purposeY =
    275;

  for (
    const line of purposeLines
  ) {
    drawText(
      current.commands,
      line,
      64,
      purposeY,
      {
        fontSize: 9,
        color:
          "#334155",
      }
    );

    purposeY -= 14;
  }

  drawText(
    current.commands,
    "PrivacyMap India assessment output is a risk-assessment and governance aid. It is not a legal opinion, certification or automatic determination of DPDP compliance.",
    48,
    150,
    {
      fontSize: 7,
      color:
        "#64748b",
    }
  );

  newPage();

  /* ==========================================================
     EXECUTIVE SUMMARY
     ========================================================== */

  section(
    "Executive Summary"
  );

  current.paragraph(
    "This section provides a concise view of the assessment outcome and the current state of risk treatment and governance."
  );

  ensure(125);

  const summaryTop =
    current.cursor;

  const cardWidth =
    (PDF_CONTENT_WIDTH -
      18) /
    2;

  const summaryCards = [
    {
      label: "OVERALL RISK",
      value:
        overallRisk ||
        "Not available",
    },
    {
      label: "RISK SCORE",
      value:
        riskScore ||
        "Not available",
    },
    {
      label: "RISK FINDINGS",
      value:
        findings.length,
    },
    {
      label: "TREATMENT ACTIONS",
      value:
        report.treatmentActions
          .length,
    },
  ];

  for (
    let i = 0;
    i <
    summaryCards.length;
    i++
  ) {
    const row =
      Math.floor(i / 2);

    const col =
      i % 2;

    const x =
      PDF_MARGIN_LEFT +
      col *
        (cardWidth +
          18);

    const y =
      summaryTop -
      row * 64 -
      55;

    drawRect(
      current.commands,
      x,
      y,
      cardWidth,
      52,
      "#f8fafc",
      "#e2e8f0"
    );

    drawText(
      current.commands,
      summaryCards[i]
        .label,
      x + 12,
      y + 36,
      {
        fontSize: 7,
        font: "F2",
        color:
          "#64748b",
      }
    );

    drawText(
      current.commands,
      summaryCards[i]
        .value,
      x + 12,
      y + 17,
      {
        fontSize: 13,
        font: "F2",
        color:
          "#0f172a",
      }
    );
  }

  current.cursor =
    summaryTop -
    140;

  current.keyValue(
    "Assessment ID",
    profile.assessmentId
  );

  current.keyValue(
    "Organisation",
    profile.organisationName
  );

  current.keyValue(
    "Assessment",
    profile.assessmentName
  );

  current.keyValue(
    "Residual decisions",
    report
      .residualRiskDecisions
      .length
  );

  const approved =
    report.residualRiskDecisions.filter(
      (d) =>
        d.approvalStatus ===
        "Approved"
    ).length;

  const pending =
    report.residualRiskDecisions.filter(
      (d) =>
        d.approvalStatus ===
        "Pending"
    ).length;

  const completed =
    report.treatmentActions.filter(
      (a) =>
        field(
          a,
          "status"
        ) ===
          "Completed" ||
        field(
          a,
          "status"
        ) ===
          "Accepted"
    ).length;

  current.keyValue(
    "Approved decisions",
    approved
  );

  current.keyValue(
    "Pending decisions",
    pending
  );

  current.keyValue(
    "Closed treatments",
    `${completed} / ${report.treatmentActions.length}`
  );

  /* ==========================================================
     FINDINGS
     ========================================================== */

  section(
    "Privacy Risk Findings"
  );

  if (
    findings.length ===
    0
  ) {
    current.card(
      "Finding status",
      "No risk findings are available in the current assessment result."
    );
  }

  for (
    let i = 0;
    i < findings.length;
    i++
  ) {
    const item =
      findings[i] as Record<
        string,
        unknown
      >;

    const title =
      item.title ??
      item.riskTitle ??
      item.name ??
      `Finding ${i + 1}`;

    const severity =
      item.severity ??
      item.risk ??
      item.riskLevel ??
      "";

    const category =
      item.category ??
      "";

    const description =
      item.description ??
      "";

    const recommendation =
      item.recommendedAction ??
      item.recommendation ??
      "";

    ensure(115);

    current.subheading(
      `${i + 1}. ${text(title)}`
    );

    current.keyValue(
      "Category",
      category
    );

    current.keyValue(
      "Risk",
      severity
    );

    if (
      description
    ) {
      current.keyValue(
        "Description",
        description
      );
    }

    if (
      recommendation
    ) {
      current.keyValue(
        "Recommended action",
        recommendation
      );
    }

    current.move(5);
  }

  /* ==========================================================
     TREATMENT
     ========================================================== */

  section(
    "Risk Treatment & Action Plan"
  );

  if (
    report.treatmentActions
      .length === 0
  ) {
    current.card(
      "Treatment status",
      "No treatment actions are available."
    );
  }

  for (
    let i = 0;
    i <
    report.treatmentActions.length;
    i++
  ) {
    const action =
      report.treatmentActions[i];

    ensure(125);

    current.subheading(
      `${i + 1}. ${field(
        action,
        "riskTitle"
      )}`
    );

    current.keyValue(
      "Category",
      field(
        action,
        "category"
      )
    );

    current.keyValue(
      "Status",
      field(
        action,
        "status"
      )
    );

    current.keyValue(
      "Priority",
      field(
        action,
        "priority"
      )
    );

    current.keyValue(
      "Owner",
      field(
        action,
        "owner"
      )
    );

    current.keyValue(
      "Timeframe",
      field(
        action,
        "timeframe"
      )
    );

    current.keyValue(
      "Effort",
      field(
        action,
        "effort"
      )
    );

    current.keyValue(
      "Treatment",
      field(
        action,
        "recommendedTreatment"
      )
    );

    current.move(5);
  }

  /* ==========================================================
     RESIDUAL RISK
     ========================================================== */

  section(
    "Residual Risk Assessment"
  );

  for (
    let i = 0;
    i <
    report
      .residualRiskDecisions
      .length;
    i++
  ) {
    const decision =
      report
        .residualRiskDecisions[i];

    ensure(140);

    current.subheading(
      `${i + 1}. ${decision.riskTitle}`
    );

    current.keyValue(
      "Finding ID",
      decision.findingId
    );

    current.keyValue(
      "Category",
      decision.category
    );

    current.keyValue(
      "Inherent risk",
      decision.inherentRisk
    );

    current.keyValue(
      "Residual risk",
      decision.residualRisk
    );

    current.keyValue(
      "Decision",
      decision.decision
    );

    current.keyValue(
      "Rationale",
      decision.rationale
    );

    current.keyValue(
      "Accountable owner",
      decision.accountableOwner
    );

    current.keyValue(
      "Decision authority",
      decision.decisionAuthority
    );

    current.keyValue(
      "Approval status",
      decision.approvalStatus
    );

    current.keyValue(
      "Review date",
      decision.reviewDate
    );

    current.keyValue(
      "Next review",
      decision.nextReviewDate
    );

    current.move(5);
  }

  /* ==========================================================
     DPDP MAPPING
     ========================================================== */

  section(
    "DPDP Requirement Mapping"
  );

  current.paragraph(
    "The current report architecture exposes DPDP mapping information primarily through the assessment risk result and the generated findings. These mappings are reference controls and do not constitute a legal opinion, certification or automatic determination of compliance."
  );

  const mapping =
    arrayValue(
      result,
      "dpdpMappings"
    );

  if (
    mapping.length >
    0
  ) {
    for (
      let i = 0;
      i < mapping.length;
      i++
    ) {
      const item =
        mapping[i] as Record<
          string,
          unknown
        >;

      ensure(85);

      current.subheading(
        `${i + 1}. ${text(
          item.controlId ??
            item.id ??
            item.code ??
            "DPDP Control"
        )}`
      );

      current.keyValue(
        "Control",
        item.title ??
          item.name ??
          item.requirement
      );

      current.keyValue(
        "Status",
        item.status ??
          item.controlStatus
      );

      current.keyValue(
        "Reference",
        item.actReference ??
          item.reference
      );

      current.move(5);
    }
  } else {
    current.card(
      "Mapping state",
      "The current report data does not expose a separate DPDP mapping collection. DPDP control information remains represented through the assessment findings and risk result."
    );
  }

  /* ==========================================================
     GOVERNANCE
     ========================================================== */

  section(
    "Risk Governance & Approval"
  );

  for (
    let i = 0;
    i <
    report
      .residualRiskDecisions
      .length;
    i++
  ) {
    const decision =
      report
        .residualRiskDecisions[i];

    ensure(115);

    current.subheading(
      `${i + 1}. ${decision.riskTitle}`
    );

    current.keyValue(
      "Approval",
      decision.approvalStatus
    );

    current.keyValue(
      "Accountable owner",
      decision.accountableOwner
    );

    current.keyValue(
      "Decision authority",
      decision.decisionAuthority
    );

    current.keyValue(
      "Review frequency",
      decision.reviewFrequency
    );

    current.keyValue(
      "Review date",
      decision.reviewDate
    );

    current.keyValue(
      "Approval date",
      decision.approvalDate
    );

    current.keyValue(
      "Escalation",
      decision.escalationRequired
        ? decision.escalationReason ||
          "Required"
        : "Not required"
    );

    current.move(5);
  }

  /* ==========================================================
     REMEDIATION
     ========================================================== */

  section(
    "Remediation Tracker"
  );

  const open =
    report.treatmentActions.filter(
      (a) =>
        field(
          a,
          "status"
        ) === "Open"
    ).length;

  const inProgress =
    report.treatmentActions.filter(
      (a) =>
        field(
          a,
          "status"
        ) ===
        "In Progress"
    ).length;

  const closed =
    report.treatmentActions.filter(
      (a) =>
        field(
          a,
          "status"
        ) ===
          "Completed" ||
        field(
          a,
          "status"
        ) ===
          "Accepted"
    ).length;

  current.keyValue(
    "Open actions",
    open
  );

  current.keyValue(
    "In progress",
    inProgress
  );

  current.keyValue(
    "Completed / accepted",
    closed
  );

  current.move(8);

  for (
    let i = 0;
    i <
    report.treatmentActions.length;
    i++
  ) {
    const action =
      report.treatmentActions[i];

    ensure(85);

    current.subheading(
      `${i + 1}. ${field(
        action,
        "riskTitle"
      )}`
    );

    current.keyValue(
      "Status",
      field(
        action,
        "status"
      )
    );

    current.keyValue(
      "Priority",
      field(
        action,
        "priority"
      )
    );

    current.keyValue(
      "Owner",
      field(
        action,
        "owner"
      )
    );

    current.move(4);
  }

  /* ==========================================================
     EVIDENCE & CLOSURE
     ========================================================== */

  section(
    "Evidence & Closure"
  );

  for (
    let i = 0;
    i <
    report.treatmentActions.length;
    i++
  ) {
    const action =
      report.treatmentActions[i];

    const evidence =
      report.evidenceRecords[
        field(
          action,
          "id"
        )
      ];

    ensure(125);

    current.subheading(
      `${i + 1}. ${field(
        action,
        "riskTitle"
      )}`
    );

    current.keyValue(
      "Treatment status",
      field(
        action,
        "status"
      )
    );

    current.keyValue(
      "Evidence reference",
      evidence?.reference
    );

    current.keyValue(
      "Evidence owner",
      evidence?.owner
    );

    current.keyValue(
      "Verified",
      evidence?.verified
        ? "Yes"
        : "No"
    );

    current.keyValue(
      "Closure notes",
      evidence?.notes
    );

    current.move(5);
  }

  /* ==========================================================
     FINAL DISCLAIMER
     ========================================================== */

  ensure(105);

  drawRect(
    current.commands,
    PDF_MARGIN_LEFT,
    current.cursor -
      75,
    PDF_CONTENT_WIDTH,
    75,
    "#f8fafc",
    "#e2e8f0"
  );

  drawText(
    current.commands,
    "IMPORTANT",
    PDF_MARGIN_LEFT +
      12,
    current.cursor -
      20,
    {
      fontSize: 8,
      font: "F2",
      color:
        "#1d4ed8",
    }
  );

  const disclaimer =
    "PrivacyMap India assessment output is a risk-assessment and governance aid. It is not a legal opinion, certification or automatic determination of DPDP compliance. DPDP control mappings are reference mappings and should be validated against the official notified Act, Rules and subsequent amendments or corrigenda.";

  const disclaimerLines =
    pdfWrap(
      disclaimer,
      PDF_CONTENT_WIDTH -
        24,
      8
    );

  let disclaimerY =
    current.cursor -
    37;

  for (
    const line of disclaimerLines
  ) {
    drawText(
      current.commands,
      line,
      PDF_MARGIN_LEFT +
        12,
      disclaimerY,
      {
        fontSize: 8,
        color:
          "#475569",
      }
    );

    disclaimerY -=
      12;
  }

  current.cursor -=
    92;

  pages.push({
    commands:
      current.commands,
  });

  return pages;
}

/* ============================================================
   PDF OBJECT SERIALISATION
   ============================================================ */

function commandsToPdfStream(
  commands: PdfCommand[]
): string {
  const output: string[] = [];

  for (
    const command of commands
  ) {
    if (
      command.type ===
      "text"
    ) {
      const fontSize =
        command.fontSize ??
        9;

      const font =
        command.font ??
        "F1";

      const color =
        pdfRgb(
          command.color ??
            "#334155"
        );

      output.push(
        `${color} rg`
      );

      output.push(
        "BT"
      );

      output.push(
        `/${font} ${fontSize} Tf`
      );

      output.push(
        `1 0 0 1 ${command.x.toFixed(
          2
        )} ${command.y.toFixed(
          2
        )} Tm`
      );

      output.push(
        `(${pdfEscape(
          command.text ??
            ""
        )}) Tj`
      );

      output.push(
        "ET"
      );

      continue;
    }

    if (
      command.type ===
      "rect"
    ) {
      const x =
        command.x;

      const y =
        command.y;

      const width =
        command.width ??
        0;

      const height =
        command.height ??
        0;

      const fill =
        pdfRgb(
          command.fill ??
            "#ffffff"
        );

      const stroke =
        pdfRgb(
          command.color ??
            "#e2e8f0"
        );

      output.push(
        `${fill} rg`
      );

      output.push(
        `${stroke} RG`
      );

      output.push(
        `${x.toFixed(
          2
        )} ${y.toFixed(
          2
        )} ${width.toFixed(
          2
        )} ${height.toFixed(
          2
        )} re`
      );

      output.push(
        "B"
      );

      continue;
    }

    if (
      command.type ===
      "line"
    ) {
      const x1 =
        command.x;

      const y1 =
        command.y;

      const x2 =
        command.width ??
        0;

      const y2 =
        command.height ??
        0;

      const color =
        pdfRgb(
          command.color ??
            "#cbd5e1"
        );

      output.push(
        `${color} RG`
      );

      output.push(
        "0.6 w"
      );

      output.push(
        `${x1.toFixed(
          2
        )} ${y1.toFixed(
          2
        )} m`
      );

      output.push(
        `${x2.toFixed(
          2
        )} ${y2.toFixed(
          2
        )} l`
      );

      output.push(
        "S"
      );
    }
  }

  return output.join(
    "\n"
  );
}

/* ============================================================
   CREATE PDF BLOB
   ============================================================ */

export function createPdfBlob(
  report: AssessmentReportData
): Blob {
  const rawPages =
    buildPdfPages(
      report
    );

  const totalPages =
    rawPages.length;

  for (
    let i = 0;
    i < rawPages.length;
    i++
  ) {
    const builder =
      new PdfPageBuilder(
        i + 1
      );

    builder.commands =
      rawPages[i].commands;

    addPdfFooter(
      builder,
      report,
      i + 1,
      totalPages
    );

    rawPages[i].commands =
      builder.commands;
  }

  const objects: string[] =
    [];

  const pageObjectIds: number[] =
    [];

  const contentObjectIds: number[] =
    [];

  /* Object 1 = Catalog */
  objects.push("");

  /* Object 2 = Pages */
  objects.push("");

  for (
    let i = 0;
    i < totalPages;
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

  const regularFontObjectId =
    objects.length + 1;

  objects.push(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>"
  );

  const boldFontObjectId =
    objects.length + 1;

  objects.push(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>"
  );

  const kids =
    pageObjectIds
      .map(
        (id) =>
          `${id} 0 R`
      )
      .join(" ");

  objects[1] =
    `<< /Type /Pages /Kids [${kids}] /Count ${totalPages} >>`;

  objects[0] =
    "<< /Type /Catalog /Pages 2 0 R >>";

  for (
    let i = 0;
    i < totalPages;
    i++
  ) {
    const stream =
      commandsToPdfStream(
        rawPages[i].commands
      );

    objects[
      pageObjectIds[i] - 1
    ] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PDF_PAGE_WIDTH} ${PDF_PAGE_HEIGHT}] /Resources << /Font << /F1 ${regularFontObjectId} 0 R /F2 ${boldFontObjectId} 0 R >> >> /Contents ${contentObjectIds[i]} 0 R >>`;

    objects[
      contentObjectIds[i] - 1
    ] =
      `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  }

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
      pdf.length;

    pdf +=
      `${i + 1} 0 obj\n`;

    pdf +=
      `${objects[i]}\n`;

    pdf +=
      "endobj\n";
  }

  const xrefOffset =
    pdf.length;

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
    createPdfBlob(
      report
    );

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

  window.setTimeout(
    () =>
      URL.revokeObjectURL(
        url
      ),
    1500
  );
}
