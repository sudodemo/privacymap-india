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

   RiskTreatmentAction has changed during the architecture refactor.
   The exporter therefore reads optional treatment fields through a
   safe record accessor instead of directly referencing fields that
   may not exist on the current TypeScript interface.
   ============================================================ */

function text(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

function display(value: unknown): string {
  const valueText = text(value).trim();
  return valueText || "Not Available";
}

function resultValue(result: RiskResult | null, key: string): unknown {
  if (!result) return undefined;
  return (result as unknown as Record<string, unknown>)[key];
}

function objectValue(value: unknown, key: string): unknown {
  if (!value || typeof value !== "object") return undefined;
  return (value as Record<string, unknown>)[key];
}

function firstValue(value: unknown, keys: string[]): unknown {
  for (const key of keys) {
    const candidate = objectValue(value, key);
    if (candidate !== undefined && candidate !== null && String(candidate).trim() !== "") {
      return candidate;
    }
  }
  return undefined;
}

function actionValue(action: RiskTreatmentAction, keys: string[]): unknown {
  return firstValue(action, keys);
}

function actionOwner(action: RiskTreatmentAction): unknown {
  return actionValue(action, [
    "owner",
    "suggestedOwner",
    "recommendedOwner",
    "accountableOwner",
  ]);
}

function actionTimeframe(action: RiskTreatmentAction): unknown {
  return actionValue(action, [
    "timeframe",
    "suggestedTimeframe",
    "recommendedTimeframe",
    "targetTimeframe",
  ]);
}

function actionTreatment(action: RiskTreatmentAction): unknown {
  return actionValue(action, [
    "recommendedTreatment",
    "treatment",
    "recommendedAction",
    "action",
  ]);
}

function actionEvidence(action: RiskTreatmentAction): unknown {
  return actionValue(action, [
    "evidenceExpected",
    "expectedEvidence",
    "evidence",
  ]);
}

function profileIndustry(profile: AssessmentProfile): string {
  return display(
    objectValue(profile, "industry") ??
      objectValue(profile, "industryName")
  );
}

function profileBusinessType(profile: AssessmentProfile): string {
  return display(
    objectValue(profile, "businessType") ??
      objectValue(profile, "businessTypeName")
  );
}

/* ============================================================
   IST REPORT TIMESTAMP

   Always display the report-generation timestamp in India Standard
   Time (UTC+05:30), independent of the browser's local timezone.
   ============================================================ */

export function formatIndiaDateTime(date: Date = new Date()): string {
  const formatted = new Intl.DateTimeFormat("en-IN", {
    timeZone: "Asia/Kolkata",
    day: "2-digit",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: true,
  }).format(date);

  return `${formatted} IST (UTC+05:30)`;
}

/* ============================================================
   ENCODING HELPERS
   ============================================================ */

function escapeCsv(value: unknown): string {
  const s = text(value);
  if (s.includes(",") || s.includes('"') || s.includes("\n") || s.includes("\r")) {
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

function pdfSafe(value: unknown): string {
  return text(value)
    .replace(/[\u2018\u2019]/g, "'")
    .replace(/[\u201C\u201D]/g, '"')
    .replace(/[\u2013\u2014]/g, "-")
    .replace(/\u2026/g, "...")
    .replace(/\u00A0/g, " ")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "?");
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
    generatedAt: formatIndiaDateTime(new Date()),
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

export function reportToJson(report: AssessmentReportData): string {
  return JSON.stringify(report, null, 2);
}

/* ============================================================
   CSV
   ============================================================ */

export function reportToCsv(report: AssessmentReportData): string {
  const profile = report.assessmentProfile;
  const rows: string[][] = [];

  rows.push([
    "Record Type",
    "Assessment ID",
    "Organisation",
    "Industry",
    "Business Type",
    "Assessment",
    "Generated IST",
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
    "Recommended Treatment",
    "Review Date",
    "Evidence Reference",
    "Evidence Owner",
    "Evidence Verified",
    "Notes",
  ]);

  for (const action of report.treatmentActions) {
    const decision = report.residualRiskDecisions.find(
      (d) => d.riskTitle === action.riskTitle && d.category === action.category
    );
    const evidence = report.evidenceRecords[action.id];

    rows.push([
      "Risk Treatment",
      text(profile.assessmentId),
      text(profile.organisationName),
      profileIndustry(profile),
      profileBusinessType(profile),
      text(profile.assessmentName),
      report.generatedAt,
      text(action.id),
      text(action.category),
      text(action.riskTitle),
      text(decision?.inherentRisk),
      text(decision?.residualRisk),
      text(decision?.decision),
      text(decision?.approvalStatus),
      text(action.status),
      text(actionOwner(action)),
      text(action.priority),
      text(actionTimeframe(action)),
      text(action.effort),
      text(actionTreatment(action)),
      text(decision?.reviewDate),
      text(evidence?.reference),
      text(evidence?.owner),
      evidence?.verified ? "Yes" : "No",
      text(evidence?.notes),
    ]);
  }

  return rows.map((row) => row.map(escapeCsv).join(",")).join("\r\n");
}

/* ============================================================
   XML
   ============================================================ */

export function reportToXml(report: AssessmentReportData): string {
  const profile = report.assessmentProfile;
  const result = report.riskResult;
  const findingsValue = resultValue(result, "findings");
  const findings = Array.isArray(findingsValue) ? findingsValue : [];

  const findingXml = findings.map((finding) => {
    const item = finding as Record<string, unknown>;
    return `
      <finding>
        <id>${escapeXml(item.id)}</id>
        <category>${escapeXml(item.category)}</category>
        <title>${escapeXml(item.title ?? item.riskTitle ?? item.name)}</title>
        <severity>${escapeXml(item.severity ?? item.risk ?? item.riskLevel)}</severity>
        <description>${escapeXml(item.description)}</description>
        <recommendedAction>${escapeXml(item.recommendedAction ?? item.recommendation)}</recommendedAction>
      </finding>`;
  }).join("");

  const treatmentXml = report.treatmentActions.map((action) => {
    const decision = report.residualRiskDecisions.find(
      (d) => d.riskTitle === action.riskTitle && d.category === action.category
    );
    const evidence = report.evidenceRecords[action.id];

    return `
      <treatment>
        <id>${escapeXml(action.id)}</id>
        <category>${escapeXml(action.category)}</category>
        <riskTitle>${escapeXml(action.riskTitle)}</riskTitle>
        <recommendedTreatment>${escapeXml(actionTreatment(action))}</recommendedTreatment>
        <status>${escapeXml(action.status)}</status>
        <priority>${escapeXml(action.priority)}</priority>
        <owner>${escapeXml(actionOwner(action))}</owner>
        <timeframe>${escapeXml(actionTimeframe(action))}</timeframe>
        <effort>${escapeXml(action.effort)}</effort>
        <evidenceExpected>${escapeXml(actionEvidence(action))}</evidenceExpected>
        <inherentRisk>${escapeXml(decision?.inherentRisk)}</inherentRisk>
        <residualRisk>${escapeXml(decision?.residualRisk)}</residualRisk>
        <decision>${escapeXml(decision?.decision)}</decision>
        <approvalStatus>${escapeXml(decision?.approvalStatus)}</approvalStatus>
        <reviewDate>${escapeXml(decision?.reviewDate)}</reviewDate>
        <evidence>
          <reference>${escapeXml(evidence?.reference)}</reference>
          <owner>${escapeXml(evidence?.owner)}</owner>
          <verified>${evidence?.verified ? "true" : "false"}</verified>
          <notes>${escapeXml(evidence?.notes)}</notes>
        </evidence>
      </treatment>`;
  }).join("");

  const decisionXml = report.residualRiskDecisions.map((decision) => `
      <decision>
        <id>${escapeXml(decision.id)}</id>
        <findingId>${escapeXml(decision.findingId)}</findingId>
        <riskTitle>${escapeXml(decision.riskTitle)}</riskTitle>
        <category>${escapeXml(decision.category)}</category>
        <inherentRisk>${escapeXml(decision.inherentRisk)}</inherentRisk>
        <residualRisk>${escapeXml(decision.residualRisk)}</residualRisk>
        <decisionValue>${escapeXml(decision.decision)}</decisionValue>
        <rationale>${escapeXml(decision.rationale)}</rationale>
        <accountableOwner>${escapeXml(decision.accountableOwner)}</accountableOwner>
        <decisionAuthority>${escapeXml(decision.decisionAuthority)}</decisionAuthority>
        <reviewDate>${escapeXml(decision.reviewDate)}</reviewDate>
        <approvalDate>${escapeXml(decision.approvalDate)}</approvalDate>
        <nextReviewDate>${escapeXml(decision.nextReviewDate)}</nextReviewDate>
        <targetResolutionDate>${escapeXml(decision.targetResolutionDate)}</targetResolutionDate>
        <approvalStatus>${escapeXml(decision.approvalStatus)}</approvalStatus>
        <treatmentStatus>${escapeXml(decision.treatmentStatus)}</treatmentStatus>
        <reviewFrequency>${escapeXml(decision.reviewFrequency)}</reviewFrequency>
        <escalationRequired>${decision.escalationRequired ? "true" : "false"}</escalationRequired>
        <escalationReason>${escapeXml(decision.escalationReason)}</escalationReason>
      </decision>`).join("");

  return `<?xml version="1.0" encoding="UTF-8"?>
<privacyMapAssessment>
  <metadata>
    <generatedAt>${escapeXml(report.generatedAt)}</generatedAt>
    <organisationName>${escapeXml(profile.organisationName)}</organisationName>
    <industry>${escapeXml(profileIndustry(profile))}</industry>
    <businessType>${escapeXml(profileBusinessType(profile))}</businessType>
    <assessmentName>${escapeXml(profile.assessmentName)}</assessmentName>
    <assessmentOwner>${escapeXml(profile.assessmentOwner)}</assessmentOwner>
    <assessmentId>${escapeXml(profile.assessmentId)}</assessmentId>
    <assessmentDate>${escapeXml(profile.assessmentDate)}</assessmentDate>
    <assessmentVersion>${escapeXml(profile.assessmentVersion)}</assessmentVersion>
  </metadata>
  <riskSummary>
    <overallRisk>${escapeXml(resultValue(result, "overallRisk"))}</overallRisk>
    <riskScore>${escapeXml(resultValue(result, "riskScore"))}</riskScore>
    <findingCount>${findings.length}</findingCount>
  </riskSummary>
  <findings>${findingXml}
  </findings>
  <residualRiskDecisions>${decisionXml}
  </residualRiskDecisions>
  <treatmentActions>${treatmentXml}
  </treatmentActions>
</privacyMapAssessment>`;
}

/* ============================================================
   MARKDOWN
   ============================================================ */

export function reportToMarkdown(report: AssessmentReportData): string {
  const profile = report.assessmentProfile;
  const result = report.riskResult;
  const findingsValue = resultValue(result, "findings");
  const findings = Array.isArray(findingsValue) ? findingsValue : [];
  const lines: string[] = [];

  lines.push("# PrivacyMap India Assessment Report", "");
  lines.push(`**Organisation:** ${escapeMarkdown(profile.organisationName)}`);
  lines.push(`**Industry:** ${escapeMarkdown(profileIndustry(profile))}`);
  lines.push(`**Business Type:** ${escapeMarkdown(profileBusinessType(profile))}`);
  lines.push(`**Assessment:** ${escapeMarkdown(profile.assessmentName)}`);
  lines.push(`**Assessment Owner:** ${escapeMarkdown(profile.assessmentOwner)}`);
  lines.push(`**Assessment ID:** ${escapeMarkdown(profile.assessmentId)}`);
  lines.push(`**Assessment Date:** ${escapeMarkdown(profile.assessmentDate)}`);
  lines.push(`**Assessment Version:** ${escapeMarkdown(profile.assessmentVersion)}`);
  lines.push(`**Generated:** ${escapeMarkdown(report.generatedAt)}`, "");

  lines.push("## Executive Summary", "");
  lines.push(`- Overall Risk: **${display(resultValue(result, "overallRisk"))}**`);
  lines.push(`- Risk Score: **${display(resultValue(result, "riskScore"))}**`);
  lines.push(`- Findings: **${findings.length}**`);
  lines.push(`- Treatment Actions: **${report.treatmentActions.length}**`);
  lines.push(`- Residual Risk Decisions: **${report.residualRiskDecisions.length}**`, "");

  lines.push("## Step 7 — Privacy Risk Findings", "");
  for (const finding of findings) {
    const item = finding as Record<string, unknown>;
    lines.push(`### ${escapeMarkdown(item.title ?? item.riskTitle ?? item.name)}`);
    lines.push(`- ID: ${escapeMarkdown(item.id)}`);
    lines.push(`- Category: ${escapeMarkdown(item.category)}`);
    lines.push(`- Risk: ${escapeMarkdown(item.severity ?? item.risk ?? item.riskLevel)}`);
    lines.push(`- Description: ${escapeMarkdown(item.description)}`);
    lines.push(`- Recommended action: ${escapeMarkdown(item.recommendedAction ?? item.recommendation)}`, "");
  }

  lines.push("## Step 8 — Risk Treatment & Action Plan", "");
  lines.push("| Category | Risk | Priority | Owner | Timeframe | Effort | Status |", "|---|---|---|---|---|---|---|");
  for (const action of report.treatmentActions) {
    lines.push(
      `| ${escapeMarkdown(action.category)} | ${escapeMarkdown(action.riskTitle)} | ${escapeMarkdown(action.priority)} | ${escapeMarkdown(actionOwner(action))} | ${escapeMarkdown(actionTimeframe(action))} | ${escapeMarkdown(action.effort)} | ${escapeMarkdown(action.status)} |`
    );
  }
  lines.push("");

  lines.push("## Step 9 — Residual Risk Assessment", "");
  for (const decision of report.residualRiskDecisions) {
    lines.push(`### ${escapeMarkdown(decision.riskTitle)}`);
    lines.push(`- Category: ${escapeMarkdown(decision.category)}`);
    lines.push(`- Inherent Risk: ${escapeMarkdown(decision.inherentRisk)}`);
    lines.push(`- Residual Risk: ${escapeMarkdown(decision.residualRisk)}`);
    lines.push(`- Decision: ${escapeMarkdown(decision.decision)}`);
    lines.push(`- Rationale: ${escapeMarkdown(decision.rationale)}`, "");
  }

  lines.push("## Step 10 — DPDP Requirement Mapping", "");
  lines.push("DPDP control mappings are maintained by the Step 10 assessment component. The report exporter does not invent mapping values that are not present in the report state.", "");

  lines.push("## Step 11 — Risk Governance & Approval", "");
  for (const decision of report.residualRiskDecisions) {
    lines.push(`### ${escapeMarkdown(decision.riskTitle)}`);
    lines.push(`- Approval Status: ${escapeMarkdown(decision.approvalStatus)}`);
    lines.push(`- Accountable Owner: ${escapeMarkdown(decision.accountableOwner)}`);
    lines.push(`- Decision Authority: ${escapeMarkdown(decision.decisionAuthority)}`);
    lines.push(`- Review Date: ${escapeMarkdown(decision.reviewDate)}`);
    lines.push(`- Approval Date: ${escapeMarkdown(decision.approvalDate)}`);
    lines.push(`- Next Review Date: ${escapeMarkdown(decision.nextReviewDate)}`);
    lines.push(`- Review Frequency: ${escapeMarkdown(decision.reviewFrequency)}`);
    lines.push(`- Treatment Status: ${escapeMarkdown(decision.treatmentStatus)}`, "");
  }

  lines.push("## Step 12 — Remediation Tracker", "");
  for (const action of report.treatmentActions) {
    lines.push(`- **${escapeMarkdown(action.riskTitle)}** — ${escapeMarkdown(action.status)}; Priority: ${escapeMarkdown(action.priority)}; Owner: ${escapeMarkdown(actionOwner(action))}`);
  }
  lines.push("");

  lines.push("## Step 13 — Evidence & Closure", "");
  for (const action of report.treatmentActions) {
    const evidence = report.evidenceRecords[action.id];
    lines.push(`### ${escapeMarkdown(action.riskTitle)}`);
    lines.push(`- Treatment Status: ${escapeMarkdown(action.status)}`);
    lines.push(`- Evidence Reference: ${escapeMarkdown(evidence?.reference)}`);
    lines.push(`- Evidence Owner: ${escapeMarkdown(evidence?.owner)}`);
    lines.push(`- Evidence Verified: ${evidence?.verified ? "Yes" : "No"}`);
    lines.push(`- Closure Notes: ${escapeMarkdown(evidence?.notes)}`, "");
  }

  lines.push("---", "");
  lines.push("PrivacyMap India assessment output is a risk-assessment and governance aid. It is not a legal opinion, certification or automatic determination of DPDP compliance.");

  return lines.join("\n");
}

/* ============================================================
   BROWSER DOWNLOAD
   ============================================================ */

export function downloadTextFile(content: string, filename: string, mimeType: string): void {
  if (typeof window === "undefined") return;

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}

/* ============================================================
   DEPENDENCY-FREE PDF — REPORTING LAYER v4

   This PDF renderer deliberately uses only native browser APIs and
   the PDF specification. No npm package or jsPDF dependency is required.

   Unlike the previous text-stream renderer, this version creates a
   structured document with:
   - branded title/header area
   - assessment profile card
   - executive-summary metric cards
   - coloured section headings
   - labelled key/value rows
   - wrapped paragraphs
   - page numbers and footer
   - consistent margins and spacing
   ============================================================ */

type PdfStyle = "body" | "small" | "label" | "value" | "title" | "section" | "subtitle";

type PdfOp = {
  page: number;
  x: number;
  y: number;
  text?: string;
  font?: "F1" | "F2";
  size?: number;
  color?: [number, number, number];
  width?: number;
  height?: number;
  fill?: [number, number, number];
  stroke?: [number, number, number];
  radius?: number;
};

const PDF_PAGE_WIDTH = 595.28;
const PDF_PAGE_HEIGHT = 841.89;
const PDF_MARGIN_LEFT = 42;
const PDF_MARGIN_RIGHT = 42;
const PDF_TOP = 52;
const PDF_BOTTOM = 48;
const PDF_CONTENT_WIDTH = PDF_PAGE_WIDTH - PDF_MARGIN_LEFT - PDF_MARGIN_RIGHT;

const PDF_COLORS = {
  navy: [15, 23, 42] as [number, number, number],
  blue: [29, 78, 216] as [number, number, number],
  blueLight: [239, 246, 255] as [number, number, number],
  slate: [71, 85, 105] as [number, number, number],
  muted: [100, 116, 139] as [number, number, number],
  border: [226, 232, 240] as [number, number, number],
  surface: [248, 250, 252] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  green: [21, 128, 61] as [number, number, number],
  greenLight: [240, 253, 244] as [number, number, number],
  amber: [180, 83, 9] as [number, number, number],
  amberLight: [255, 251, 235] as [number, number, number],
  red: [185, 28, 28] as [number, number, number],
  redLight: [254, 242, 242] as [number, number, number],
};

function pdfEscape(value: string): string {
  return pdfSafe(value)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function pdfColor(color: [number, number, number]): string {
  return `${(color[0] / 255).toFixed(4)} ${(color[1] / 255).toFixed(4)} ${(color[2] / 255).toFixed(4)}`;
}

function pdfTextWidth(value: string, size: number, bold = false): number {
  // Helvetica is approximately 0.52em per character for ordinary report text.
  // This conservative estimate keeps wrapping inside the printable area.
  const factor = bold ? 0.55 : 0.52;
  return pdfSafe(value).length * size * factor;
}

function wrapPdfText(value: string, widthPt: number, size = 9.5, bold = false): string[] {
  const safe = pdfSafe(value).replace(/\r/g, "");
  if (!safe.trim()) return [""];

  const result: string[] = [];
  const paragraphs = safe.split("\n");

  for (const paragraph of paragraphs) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (!words.length) {
      result.push("");
      continue;
    }

    let current = "";
    for (const word of words) {
      const candidate = current ? `${current} ${word}` : word;
      if (current && pdfTextWidth(candidate, size, bold) > widthPt) {
        result.push(current);
        current = word;
      } else {
        current = candidate;
      }
    }
    if (current) result.push(current);
  }

  return result;
}

function styleFor(style: PdfStyle): { font: "F1" | "F2"; size: number; color: [number, number, number] } {
  switch (style) {
    case "title":
      return { font: "F2", size: 22, color: PDF_COLORS.navy };
    case "subtitle":
      return { font: "F1", size: 10, color: PDF_COLORS.slate };
    case "section":
      return { font: "F2", size: 11, color: PDF_COLORS.blue };
    case "label":
      return { font: "F2", size: 7.5, color: PDF_COLORS.muted };
    case "value":
      return { font: "F1", size: 9.5, color: PDF_COLORS.navy };
    case "small":
      return { font: "F1", size: 8, color: PDF_COLORS.muted };
    default:
      return { font: "F1", size: 9.5, color: PDF_COLORS.slate };
  }
}

function addText(
  commands: string[],
  x: number,
  y: number,
  value: string,
  style: PdfStyle = "body"
): void {
  const s = styleFor(style);
  commands.push(
    "BT",
    `/${s.font} ${s.size} Tf`,
    `${pdfColor(s.color)} rg`,
    `1 0 0 1 ${x.toFixed(2)} ${y.toFixed(2)} Tm`,
    `(${pdfEscape(value)}) Tj`,
    "ET"
  );
}

function addRect(
  commands: string[],
  x: number,
  y: number,
  width: number,
  height: number,
  fill: [number, number, number],
  stroke?: [number, number, number]
): void {
  commands.push(
    `${pdfColor(fill)} rg`,
    `${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re`,
    "f"
  );
  if (stroke) {
    commands.push(
      `${pdfColor(stroke)} RG`,
      "0.6 w",
      `${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re`,
      "S"
    );
  }
}

function addLine(commands: string[], x1: number, y1: number, x2: number, y2: number, color = PDF_COLORS.border): void {
  commands.push(
    `${pdfColor(color)} RG`,
    "0.6 w",
    `${x1.toFixed(2)} ${y1.toFixed(2)} m`,
    `${x2.toFixed(2)} ${y2.toFixed(2)} l`,
    "S"
  );
}

function addWrappedText(
  commands: string[],
  x: number,
  y: number,
  value: string,
  width: number,
  style: PdfStyle = "body",
  lineHeight = 13
): number {
  const s = styleFor(style);
  const lines = wrapPdfText(value, width, s.size, s.font === "F2");
  let cursor = y;
  for (const line of lines) {
    addText(commands, x, cursor, line, style);
    cursor -= lineHeight;
  }
  return cursor;
}

function pdfRiskColor(value: unknown): { fill: [number, number, number]; text: [number, number, number] } {
  const v = text(value).toLowerCase();
  if (v.includes("high") || v.includes("critical")) return { fill: PDF_COLORS.redLight, text: PDF_COLORS.red };
  if (v.includes("medium") || v.includes("moderate")) return { fill: PDF_COLORS.amberLight, text: PDF_COLORS.amber };
  if (v.includes("low")) return { fill: PDF_COLORS.greenLight, text: PDF_COLORS.green };
  return { fill: PDF_COLORS.surface, text: PDF_COLORS.slate };
}

function addLabelValue(
  commands: string[],
  x: number,
  y: number,
  label: string,
  value: unknown,
  width: number
): number {
  addText(commands, x, y, label.toUpperCase(), "label");
  const next = addWrappedText(commands, x, y - 13, display(value), width, "value", 12);
  return Math.min(next, y - 25);
}

function addSectionHeader(commands: string[], y: number, title: string): number {
  addRect(commands, PDF_MARGIN_LEFT, y - 21, PDF_CONTENT_WIDTH, 26, PDF_COLORS.blueLight);
  addText(commands, PDF_MARGIN_LEFT + 12, y - 11, title, "section");
  return y - 36;
}

function addFooter(commands: string[], pageNumber: number): void {
  addLine(commands, PDF_MARGIN_LEFT, 32, PDF_PAGE_WIDTH - PDF_MARGIN_RIGHT, 32);
  addText(commands, PDF_MARGIN_LEFT, 20, "PrivacyMap India • DPDP Privacy Assessment", "small");
  const pageText = `Page ${pageNumber}`;
  addText(commands, PDF_PAGE_WIDTH - PDF_MARGIN_RIGHT - pdfTextWidth(pageText, 8), 20, pageText, "small");
}

function createPdfCommandPages(report: AssessmentReportData): string[][] {
  const profile = report.assessmentProfile;
  const result = report.riskResult;
  const findingsValue = resultValue(result, "findings");
  const findings = Array.isArray(findingsValue) ? findingsValue : [];

  const pages: string[][] = [];
  let commands: string[] = [];
  let cursor = PDF_PAGE_HEIGHT - PDF_TOP;

  const finishPage = () => {
    addFooter(commands, pages.length + 1);
    pages.push(commands);
    commands = [];
    cursor = PDF_PAGE_HEIGHT - PDF_TOP;
  };

  const ensure = (height: number) => {
    if (cursor - height < PDF_BOTTOM) finishPage();
  };

  const addSection = (title: string) => {
    ensure(42);
    cursor = addSectionHeader(commands, cursor, title);
  };

  const addParagraph = (value: unknown, style: PdfStyle = "body", spacing = 8) => {
    const safe = display(value);
    const s = styleFor(style);
    const wrapped = wrapPdfText(safe, PDF_CONTENT_WIDTH, s.size, s.font === "F2");
    const required = wrapped.length * 13 + spacing;
    ensure(required);
    cursor = addWrappedText(commands, PDF_MARGIN_LEFT, cursor, safe, PDF_CONTENT_WIDTH, style, 13) - spacing;
  };

  // Cover / profile header.
  addRect(commands, 0, PDF_PAGE_HEIGHT - 118, PDF_PAGE_WIDTH, 118, PDF_COLORS.navy);
  addText(commands, PDF_MARGIN_LEFT, PDF_PAGE_HEIGHT - 55, "PRIVACYMAP INDIA", "small");
  commands.push(`${pdfColor(PDF_COLORS.white)} rg`);
  addText(commands, PDF_MARGIN_LEFT, PDF_PAGE_HEIGHT - 82, "DPDP Privacy Assessment Report", "title");
  addText(commands, PDF_MARGIN_LEFT, PDF_PAGE_HEIGHT - 101, "Assessment and governance report", "subtitle");
  cursor = PDF_PAGE_HEIGHT - 145;

  ensure(170);
  addText(commands, PDF_MARGIN_LEFT, cursor, "Assessment Profile", "section");
  cursor -= 18;
  addRect(commands, PDF_MARGIN_LEFT, cursor - 132, PDF_CONTENT_WIDTH, 142, PDF_COLORS.surface, PDF_COLORS.border);

  const colGap = 18;
  const colWidth = (PDF_CONTENT_WIDTH - colGap) / 2;
  let leftY = cursor - 18;
  let rightY = cursor - 18;

  const profileRow = (side: "left" | "right", label: string, value: unknown) => {
    const x = side === "left" ? PDF_MARGIN_LEFT + 14 : PDF_MARGIN_LEFT + 14 + colWidth + colGap;
    const y = side === "left" ? leftY : rightY;
    const next = addLabelValue(commands, x, y, label, value, colWidth - 28);
    if (side === "left") leftY = next - 7;
    else rightY = next - 7;
  };

  profileRow("left", "Organisation / School", profile.organisationName);
  profileRow("left", "Industry", profileIndustry(profile));
  profileRow("left", "Business Type", profileBusinessType(profile));
  profileRow("left", "Assessment", profile.assessmentName);
  profileRow("right", "Assessment Owner", profile.assessmentOwner);
  profileRow("right", "Assessment ID", profile.assessmentId);
  profileRow("right", "Assessment Date", profile.assessmentDate);
  profileRow("right", "Assessment Version", profile.assessmentVersion);

  cursor -= 155;
  addText(commands, PDF_MARGIN_LEFT, cursor, "Report Generated", "label");
  addText(commands, PDF_MARGIN_LEFT, cursor - 13, report.generatedAt, "value");
  cursor -= 36;

  addSection("Executive Summary");

  const overallRisk = display(resultValue(result, "overallRisk"));
  const riskScore = display(resultValue(result, "riskScore"));
  const metricGap = 10;
  const metricWidth = (PDF_CONTENT_WIDTH - metricGap * 2) / 3;
  const metricY = cursor - 4;
  const metrics = [
    ["Overall Risk", overallRisk],
    ["Risk Score", riskScore],
    ["Risk Findings", String(findings.length)],
  ];

  metrics.forEach(([label, value], index) => {
    const x = PDF_MARGIN_LEFT + index * (metricWidth + metricGap);
    addRect(commands, x, metricY - 58, metricWidth, 62, PDF_COLORS.surface, PDF_COLORS.border);
    addText(commands, x + 10, metricY - 15, label.toUpperCase(), "label");
    addText(commands, x + 10, metricY - 38, value, "value");
  });
  cursor = metricY - 78;
  addParagraph(`Treatment Actions: ${report.treatmentActions.length} • Residual Risk Decisions: ${report.residualRiskDecisions.length}`, "small", 4);

  addSection("Step 7 — Privacy Risk Findings");
  if (!findings.length) {
    addParagraph("No privacy risk findings are available in the assessment result.", "body", 10);
  }
  findings.forEach((finding, index) => {
    const item = finding as Record<string, unknown>;
    const title = display(item.title ?? item.riskTitle ?? item.name);
    const category = display(item.category);
    const risk = display(item.severity ?? item.risk ?? item.riskLevel);
    const description = display(item.description);
    const recommendation = display(item.recommendedAction ?? item.recommendation);

    const descLines = wrapPdfText(description, PDF_CONTENT_WIDTH - 24, 9.5, false).length;
    const recLines = wrapPdfText(recommendation, PDF_CONTENT_WIDTH - 24, 9.5, false).length;
    const cardHeight = 116 + (descLines + recLines) * 13;
    ensure(cardHeight + 10);

    addRect(commands, PDF_MARGIN_LEFT, cursor - cardHeight + 8, PDF_CONTENT_WIDTH, cardHeight, PDF_COLORS.white, PDF_COLORS.border);
    addText(commands, PDF_MARGIN_LEFT + 12, cursor - 10, `${index + 1}. ${title}`, "value");
    addText(commands, PDF_MARGIN_LEFT + 12, cursor - 27, `Finding ID: ${display(item.id)}   •   Category: ${category}`, "small");

    const riskStyle = pdfRiskColor(risk);
    const riskWidth = Math.min(110, Math.max(50, pdfTextWidth(risk, 8) + 20));
    addRect(commands, PDF_MARGIN_LEFT + PDF_CONTENT_WIDTH - riskWidth - 12, cursor - 42, riskWidth, 18, riskStyle.fill);
    commands.push("BT", "/F2 8 Tf", `${pdfColor(riskStyle.text)} rg`, `1 0 0 1 ${(PDF_MARGIN_LEFT + PDF_CONTENT_WIDTH - riskWidth - 12 + 10).toFixed(2)} ${(cursor - 36).toFixed(2)} Tm`, `(${pdfEscape(risk)}) Tj`, "ET");

    let fy = cursor - 55;
    addText(commands, PDF_MARGIN_LEFT + 12, fy, "DESCRIPTION", "label");
    fy = addWrappedText(commands, PDF_MARGIN_LEFT + 12, fy - 13, description, PDF_CONTENT_WIDTH - 24, "body", 13) - 8;
    addText(commands, PDF_MARGIN_LEFT + 12, fy, "RECOMMENDED ACTION", "label");
    fy = addWrappedText(commands, PDF_MARGIN_LEFT + 12, fy - 13, recommendation, PDF_CONTENT_WIDTH - 24, "body", 13);
    cursor = cursor - cardHeight - 12;
  });

  addSection("Step 8 — Risk Treatment & Action Plan");
  if (!report.treatmentActions.length) addParagraph("No treatment actions are available.", "body", 10);
  for (const action of report.treatmentActions) {
    const cardHeight = 104;
    ensure(cardHeight + 10);
    addRect(commands, PDF_MARGIN_LEFT, cursor - cardHeight + 8, PDF_CONTENT_WIDTH, cardHeight, PDF_COLORS.white, PDF_COLORS.border);
    addText(commands, PDF_MARGIN_LEFT + 12, cursor - 10, display(action.riskTitle), "value");
    addText(commands, PDF_MARGIN_LEFT + 12, cursor - 27, `Category: ${display(action.category)}`, "small");
    let y1 = cursor - 47;
    addLabelValue(commands, PDF_MARGIN_LEFT + 12, y1, "Status", action.status, 105);
    addLabelValue(commands, PDF_MARGIN_LEFT + 128, y1, "Priority", action.priority, 105);
    addLabelValue(commands, PDF_MARGIN_LEFT + 244, y1, "Owner", actionOwner(action), 130);
    addLabelValue(commands, PDF_MARGIN_LEFT + 386, y1, "Effort", action.effort, PDF_CONTENT_WIDTH - 398);
    const treatment = display(actionTreatment(action));
    addText(commands, PDF_MARGIN_LEFT + 12, cursor - 83, "RECOMMENDED TREATMENT", "label");
    addWrappedText(commands, PDF_MARGIN_LEFT + 12, cursor - 96, treatment, PDF_CONTENT_WIDTH - 24, "body", 12);
    cursor -= cardHeight + 12;
  }

  addSection("Step 9 — Residual Risk Decision Register");
  if (!report.residualRiskDecisions.length) addParagraph("No residual-risk decisions are available.", "body", 10);
  for (const decision of report.residualRiskDecisions) {
    ensure(126);
    addRect(commands, PDF_MARGIN_LEFT, cursor - 112, PDF_CONTENT_WIDTH, 118, PDF_COLORS.white, PDF_COLORS.border);
    addText(commands, PDF_MARGIN_LEFT + 12, cursor - 12, display(decision.riskTitle), "value");
    addText(commands, PDF_MARGIN_LEFT + 12, cursor - 29, `Finding ID: ${display(decision.findingId)}   •   Category: ${display(decision.category)}`, "small");
    addLabelValue(commands, PDF_MARGIN_LEFT + 12, cursor - 49, "Inherent Risk", decision.inherentRisk, 115);
    addLabelValue(commands, PDF_MARGIN_LEFT + 140, cursor - 49, "Residual Risk", decision.residualRisk, 115);
    addLabelValue(commands, PDF_MARGIN_LEFT + 268, cursor - 49, "Decision", decision.decision, 140);
    addLabelValue(commands, PDF_MARGIN_LEFT + 12, cursor - 82, "Approval Status", decision.approvalStatus, 115);
    addLabelValue(commands, PDF_MARGIN_LEFT + 140, cursor - 82, "Treatment Status", decision.treatmentStatus, 115);
    addLabelValue(commands, PDF_MARGIN_LEFT + 268, cursor - 82, "Review Date", decision.reviewDate, 140);
    cursor -= 132;
  }

  addSection("Step 10 — DPDP Requirement Mapping");
  addParagraph("DPDP control mappings are maintained by the Step 10 assessment component. The report exporter does not invent mapping values that are not present in the report state.", "body", 10);

  addSection("Step 11 — Risk Governance & Approval");
  for (const decision of report.residualRiskDecisions) {
    ensure(146);
    addRect(commands, PDF_MARGIN_LEFT, cursor - 132, PDF_CONTENT_WIDTH, 138, PDF_COLORS.white, PDF_COLORS.border);
    addText(commands, PDF_MARGIN_LEFT + 12, cursor - 12, display(decision.riskTitle), "value");
    addLabelValue(commands, PDF_MARGIN_LEFT + 12, cursor - 34, "Accountable Owner", decision.accountableOwner, 160);
    addLabelValue(commands, PDF_MARGIN_LEFT + 188, cursor - 34, "Decision Authority", decision.decisionAuthority, 160);
    addLabelValue(commands, PDF_MARGIN_LEFT + 364, cursor - 34, "Approval Status", decision.approvalStatus, 145);
    addLabelValue(commands, PDF_MARGIN_LEFT + 12, cursor - 70, "Review Date", decision.reviewDate, 115);
    addLabelValue(commands, PDF_MARGIN_LEFT + 140, cursor - 70, "Approval Date", decision.approvalDate, 115);
    addLabelValue(commands, PDF_MARGIN_LEFT + 268, cursor - 70, "Next Review", decision.nextReviewDate, 115);
    addLabelValue(commands, PDF_MARGIN_LEFT + 396, cursor - 70, "Treatment", decision.treatmentStatus, 112);
    addLabelValue(commands, PDF_MARGIN_LEFT + 12, cursor - 106, "Escalation Required", decision.escalationRequired ? "Yes" : "No", 150);
    addLabelValue(commands, PDF_MARGIN_LEFT + 176, cursor - 106, "Review Frequency", decision.reviewFrequency, 150);
    addLabelValue(commands, PDF_MARGIN_LEFT + 340, cursor - 106, "Target Resolution", decision.targetResolutionDate, 168);
    cursor -= 152;
  }

  addSection("Step 12 — Remediation Tracker");
  for (const action of report.treatmentActions) {
    ensure(92);
    addRect(commands, PDF_MARGIN_LEFT, cursor - 78, PDF_CONTENT_WIDTH, 84, PDF_COLORS.surface, PDF_COLORS.border);
    addText(commands, PDF_MARGIN_LEFT + 12, cursor - 12, display(action.riskTitle), "value");
    addLabelValue(commands, PDF_MARGIN_LEFT + 12, cursor - 32, "Status", action.status, 105);
    addLabelValue(commands, PDF_MARGIN_LEFT + 128, cursor - 32, "Priority", action.priority, 105);
    addLabelValue(commands, PDF_MARGIN_LEFT + 244, cursor - 32, "Owner", actionOwner(action), 130);
    addLabelValue(commands, PDF_MARGIN_LEFT + 386, cursor - 32, "Effort", action.effort, PDF_CONTENT_WIDTH - 398);
    addLabelValue(commands, PDF_MARGIN_LEFT + 12, cursor - 62, "Timeframe", actionTimeframe(action), 200);
    cursor -= 96;
  }

  addSection("Step 13 — Evidence & Closure");
  for (const action of report.treatmentActions) {
    const evidence = report.evidenceRecords[action.id];
    ensure(112);
    addRect(commands, PDF_MARGIN_LEFT, cursor - 98, PDF_CONTENT_WIDTH, 104, PDF_COLORS.white, PDF_COLORS.border);
    addText(commands, PDF_MARGIN_LEFT + 12, cursor - 12, display(action.riskTitle), "value");
    addLabelValue(commands, PDF_MARGIN_LEFT + 12, cursor - 34, "Treatment Status", action.status, 130);
    addLabelValue(commands, PDF_MARGIN_LEFT + 154, cursor - 34, "Evidence Verified", evidence?.verified ? "Yes" : "No", 120);
    addLabelValue(commands, PDF_MARGIN_LEFT + 286, cursor - 34, "Evidence Owner", evidence?.owner, 130);
    addLabelValue(commands, PDF_MARGIN_LEFT + 430, cursor - 34, "Reference", evidence?.reference, 92);
    addLabelValue(commands, PDF_MARGIN_LEFT + 12, cursor - 70, "Closure Notes", evidence?.notes, PDF_CONTENT_WIDTH - 24);
    cursor -= 116;
  }

  addSection("Important Disclaimer");
  addParagraph("PrivacyMap India assessment output is a risk-assessment and governance aid. It is not a legal opinion, certification or automatic determination of DPDP compliance.", "body", 8);
  addParagraph("DPDP control mappings are reference mappings and should be validated against the official notified Act, Rules and subsequent amendments or corrigenda.", "body", 8);

  if (commands.length) finishPage();
  return pages;
}

function buildPdfObjectStream(commands: string[]): string {
  return commands.join("\n");
}

export function createPdfBlob(report: AssessmentReportData): Blob {
  const pages = createPdfCommandPages(report);

  const objects: string[] = ["", ""];
  const pageObjectIds: number[] = [];
  const contentObjectIds: number[] = [];

  for (let i = 0; i < pages.length; i += 1) {
    pageObjectIds.push(objects.length + 1);
    objects.push("");
    contentObjectIds.push(objects.length + 1);
    objects.push("");
  }

  const regularFontObjectId = objects.length + 1;
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>");
  const boldFontObjectId = objects.length + 1;
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>");

  objects[0] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[1] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`;

  for (let i = 0; i < pages.length; i += 1) {
    const stream = buildPdfObjectStream(pages[i]);
    objects[pageObjectIds[i] - 1] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${PDF_PAGE_WIDTH.toFixed(2)} ${PDF_PAGE_HEIGHT.toFixed(2)}] /Resources << /Font << /F1 ${regularFontObjectId} 0 R /F2 ${boldFontObjectId} 0 R >> >> /Contents ${contentObjectIds[i]} 0 R >>`;
    objects[contentObjectIds[i] - 1] =
      `<< /Length ${new TextEncoder().encode(stream).length} >>\nstream\n${stream}\nendstream`;
  }

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];
  const encoder = new TextEncoder();

  // All content is ASCII-safe after pdfSafe(), but offsets are calculated from
  // encoded bytes to keep the xref table correct even if the implementation changes.
  for (let i = 0; i < objects.length; i += 1) {
    offsets[i + 1] = encoder.encode(pdf).length;
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefOffset = encoder.encode(pdf).length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  for (let i = 1; i <= objects.length; i += 1) {
    pdf += `${String(offsets[i]).padStart(10, "0")} 00000 n \n`;
  }
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\n`;
  pdf += `startxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], { type: "application/pdf" });
}

export function downloadPdf(report: AssessmentReportData, filename: string): void {
  if (typeof window === "undefined") return;

  const blob = createPdfBlob(report);
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
