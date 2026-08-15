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
   DEPENDENCY-FREE PDF — REPORTING LAYER v5

   PDF presentation deliberately follows the compact 9OVG report style:
   - strong blue top bar
   - large blue report title
   - compact assessment metadata
   - six executive-summary metric cards
   - full-width light-blue section bands
   - clean white content cards
   - conservative two-column metadata grids
   - dynamic wrapping/heights to prevent overlap
   - compact 3-page-style flow with automatic pagination
   ============================================================ */

type PdfStyle = "body" | "small" | "label" | "value" | "title" | "section" | "subtitle";

const PDF_PAGE_WIDTH = 595.28;
const PDF_PAGE_HEIGHT = 841.89;
const PDF_MARGIN_LEFT = 42;
const PDF_MARGIN_RIGHT = 42;
const PDF_TOP = 44;
const PDF_BOTTOM = 48;
const PDF_CONTENT_WIDTH = PDF_PAGE_WIDTH - PDF_MARGIN_LEFT - PDF_MARGIN_RIGHT;

const PDF_COLORS = {
  topBlue: [37, 82, 184] as [number, number, number],
  blue: [29, 78, 216] as [number, number, number],
  blueLight: [239, 246, 255] as [number, number, number],
  navy: [15, 23, 42] as [number, number, number],
  slate: [71, 85, 105] as [number, number, number],
  muted: [100, 116, 139] as [number, number, number],
  border: [218, 226, 236] as [number, number, number],
  surface: [246, 248, 250] as [number, number, number],
  white: [255, 255, 255] as [number, number, number],
  green: [21, 128, 61] as [number, number, number],
  greenLight: [240, 253, 244] as [number, number, number],
  amber: [180, 83, 9] as [number, number, number],
  amberLight: [255, 251, 235] as [number, number, number],
  red: [185, 28, 28] as [number, number, number],
  redLight: [254, 242, 242] as [number, number, number],
};

function pdfEscape(value: string): string {
  return pdfSafe(value).replace(/\\/g, "\\\\").replace(/\(/g, "\\(").replace(/\)/g, "\\)");
}

function pdfColor(color: [number, number, number]): string {
  return `${(color[0] / 255).toFixed(4)} ${(color[1] / 255).toFixed(4)} ${(color[2] / 255).toFixed(4)}`;
}

function pdfTextWidth(value: string, size: number, bold = false): number {
  const factor = bold ? 0.55 : 0.50;
  return pdfSafe(value).length * size * factor;
}

function wrapPdfText(value: string, widthPt: number, size = 9.5, bold = false): string[] {
  const safe = pdfSafe(value).replace(/\r/g, "");
  if (!safe.trim()) return [""];
  const result: string[] = [];
  for (const paragraph of safe.split("\n")) {
    const words = paragraph.split(/\s+/).filter(Boolean);
    if (!words.length) { result.push(""); continue; }
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
    case "title": return { font: "F2", size: 22, color: PDF_COLORS.blue };
    case "subtitle": return { font: "F1", size: 9.5, color: PDF_COLORS.slate };
    case "section": return { font: "F2", size: 10.5, color: PDF_COLORS.blue };
    case "label": return { font: "F2", size: 7.2, color: PDF_COLORS.muted };
    case "value": return { font: "F1", size: 9.5, color: PDF_COLORS.navy };
    case "small": return { font: "F1", size: 7.8, color: PDF_COLORS.muted };
    default: return { font: "F1", size: 9.3, color: PDF_COLORS.slate };
  }
}

function addText(commands: string[], x: number, y: number, value: string, style: PdfStyle = "body"): void {
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

function addRect(commands: string[], x: number, y: number, width: number, height: number, fill: [number, number, number], stroke?: [number, number, number]): void {
  commands.push(`${pdfColor(fill)} rg`, `${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re`, "f");
  if (stroke) commands.push(`${pdfColor(stroke)} RG`, "0.6 w", `${x.toFixed(2)} ${y.toFixed(2)} ${width.toFixed(2)} ${height.toFixed(2)} re`, "S");
}

function addLine(commands: string[], x1: number, y1: number, x2: number, y2: number, color = PDF_COLORS.border): void {
  commands.push(`${pdfColor(color)} RG`, "0.6 w", `${x1.toFixed(2)} ${y1.toFixed(2)} m`, `${x2.toFixed(2)} ${y2.toFixed(2)} l`, "S");
}

function addWrappedText(commands: string[], x: number, y: number, value: string, width: number, style: PdfStyle = "body", lineHeight = 13): number {
  const s = styleFor(style);
  const lines = wrapPdfText(value, width, s.size, s.font === "F2");
  let cursor = y;
  for (const line of lines) { addText(commands, x, cursor, line, style); cursor -= lineHeight; }
  return cursor;
}

function pdfRiskColor(value: unknown): { fill: [number, number, number]; text: [number, number, number] } {
  const v = text(value).toLowerCase();
  if (v.includes("high") || v.includes("critical")) return { fill: PDF_COLORS.redLight, text: PDF_COLORS.red };
  if (v.includes("medium") || v.includes("moderate")) return { fill: PDF_COLORS.amberLight, text: PDF_COLORS.amber };
  if (v.includes("low")) return { fill: PDF_COLORS.greenLight, text: PDF_COLORS.green };
  return { fill: PDF_COLORS.surface, text: PDF_COLORS.slate };
}

function addLabelValue(commands: string[], x: number, y: number, label: string, value: unknown, width: number, lineHeight = 11): number {
  addText(commands, x, y, label.toUpperCase(), "label");
  return addWrappedText(commands, x, y - 12, display(value), width, "value", lineHeight);
}

function addSectionHeader(commands: string[], y: number, title: string): number {
  addRect(commands, PDF_MARGIN_LEFT, y - 20, PDF_CONTENT_WIDTH, 26, PDF_COLORS.blueLight);
  addText(commands, PDF_MARGIN_LEFT + 10, y - 10, title, "section");
  return y - 37;
}

function addFooter(commands: string[], pageNumber: number): void {
  addLine(commands, PDF_MARGIN_LEFT, 32, PDF_PAGE_WIDTH - PDF_MARGIN_RIGHT, 32);
  addText(commands, PDF_MARGIN_LEFT, 20, "Confidential assessment output", "small");
  const pageText = `Page ${pageNumber}`;
  addText(commands, PDF_PAGE_WIDTH - PDF_MARGIN_RIGHT - pdfTextWidth(pageText, 8), 20, pageText, "small");
}

function reportOverallRisk(result: RiskResult | null): string {
  return display(firstValue(result, ["overallLevel", "overallRisk", "overallRiskLevel", "riskLevel", "posture"]));
}

function reportRiskScore(result: RiskResult | null): string {
  return display(firstValue(result, ["score", "riskScore", "overallScore"]));
}

function reportFindings(result: RiskResult | null): Array<Record<string, unknown>> {
  const raw = resultValue(result, "findings");
  if (!Array.isArray(raw)) return [];
  return raw.map((finding) => (finding && typeof finding === "object" ? finding as Record<string, unknown> : {}));
}

function findingTitle(finding: Record<string, unknown>): string {
  return display(firstValue(finding, ["title", "riskTitle", "name"]));
}

function findingId(finding: Record<string, unknown>): string {
  return display(firstValue(finding, ["id", "findingId"]));
}

function findingCategory(finding: Record<string, unknown>): string {
  return display(firstValue(finding, ["category", "riskCategory"]));
}

function findingRisk(finding: Record<string, unknown>): string {
  return display(firstValue(finding, ["severity", "risk", "riskLevel", "level"]));
}

function findingDescription(finding: Record<string, unknown>): string {
  const value = firstValue(finding, ["description", "finding", "analysis", "details", "summary"]);
  return display(value || "The assessment identified this condition as a privacy risk requiring review and treatment.");
}

function findingRecommendation(finding: Record<string, unknown>): string {
  const value = firstValue(finding, ["recommendedAction", "recommendation", "recommendedTreatment", "treatment", "action"]);
  return display(value || "Review the identified condition, assign an accountable owner and implement appropriate treatment controls.");
}

function addMetricCard(commands: string[], x: number, y: number, width: number, label: string, value: string): void {
  addRect(commands, x, y - 58, width, 62, PDF_COLORS.surface, PDF_COLORS.border);
  addText(commands, x + 10, y - 15, label.toUpperCase(), "label");
  const lines = wrapPdfText(value, width - 20, 10, true);
  addText(commands, x + 10, y - 38, lines[0] || "Not Available", "value");
  if (lines[1]) addText(commands, x + 10, y - 50, lines[1], "small");
}

function addMetadataCard(commands: string[], y: number, rows: Array<[string, string]>): number {
  const rowHeight = 27;
  const height = rows.length * rowHeight + 10;
  addRect(commands, PDF_MARGIN_LEFT, y - height + 4, PDF_CONTENT_WIDTH, height, PDF_COLORS.surface, PDF_COLORS.border);
  let cursor = y - 14;
  for (const [label, value] of rows) {
    addText(commands, PDF_MARGIN_LEFT + 10, cursor, label, "label");
    addText(commands, PDF_MARGIN_LEFT + 115, cursor, value, "value");
    cursor -= rowHeight;
  }
  return y - height - 10;
}

function addTwoColumnMetadata(commands: string[], x: number, y: number, width: number, rows: Array<[string, unknown]>): number {
  let cursor = y;
  for (const [label, value] of rows) {
    addText(commands, x, cursor, label.toUpperCase(), "label");
    const lines = wrapPdfText(display(value), width, 9.2, false);
    let valueY = cursor - 12;
    for (const line of lines) { addText(commands, x, valueY, line, "value"); valueY -= 11; }
    cursor = valueY - 7;
  }
  return cursor;
}

function addRiskFindingCard(commands: string[], cursor: number, finding: Record<string, unknown>, index: number): number {
  const title = findingTitle(finding);
  const id = findingId(finding);
  const category = findingCategory(finding);
  const risk = findingRisk(finding);
  const description = findingDescription(finding);
  const recommendation = findingRecommendation(finding);
  const descLines = wrapPdfText(description, PDF_CONTENT_WIDTH - 24, 9.3, false).length;
  const recLines = wrapPdfText(recommendation, PDF_CONTENT_WIDTH - 24, 9.3, false).length;
  const height = 104 + (descLines + recLines) * 12;

  addRect(commands, PDF_MARGIN_LEFT, cursor - height + 8, PDF_CONTENT_WIDTH, height, PDF_COLORS.surface, PDF_COLORS.border);
  addText(commands, PDF_MARGIN_LEFT + 10, cursor - 11, `${index + 1}. ${title}`, "value");
  addText(commands, PDF_MARGIN_LEFT + 10, cursor - 28, `Finding ID: ${id}   |   Category: ${category}`, "small");

  const riskStyle = pdfRiskColor(risk);
  const riskWidth = Math.min(110, Math.max(52, pdfTextWidth(risk, 8) + 18));
  const riskX = PDF_MARGIN_LEFT + PDF_CONTENT_WIDTH - riskWidth - 10;
  addRect(commands, riskX, cursor - 44, riskWidth, 18, riskStyle.fill);
  addText(commands, riskX + 9, cursor - 38, risk, "small");

  let y = cursor - 59;
  addText(commands, PDF_MARGIN_LEFT + 10, y, "DESCRIPTION", "label");
  y = addWrappedText(commands, PDF_MARGIN_LEFT + 10, y - 12, description, PDF_CONTENT_WIDTH - 20, "body", 12) - 6;
  addText(commands, PDF_MARGIN_LEFT + 10, y, "RECOMMENDED ACTION", "label");
  addWrappedText(commands, PDF_MARGIN_LEFT + 10, y - 12, recommendation, PDF_CONTENT_WIDTH - 20, "body", 12);
  return cursor - height - 10;
}

function addTreatmentCard(commands: string[], cursor: number, action: RiskTreatmentAction): number {
  const treatment = display(actionTreatment(action));
  const evidence = display(actionEvidence(action));
  const treatmentLines = wrapPdfText(treatment, PDF_CONTENT_WIDTH - 20, 9.3, false).length;
  const evidenceLines = wrapPdfText(evidence, PDF_CONTENT_WIDTH - 20, 8.8, false).length;
  const height = 145 + (treatmentLines + evidenceLines) * 12;

  addRect(commands, PDF_MARGIN_LEFT, cursor - height + 8, PDF_CONTENT_WIDTH, height, PDF_COLORS.surface, PDF_COLORS.border);
  addText(commands, PDF_MARGIN_LEFT + 10, cursor - 11, display(action.riskTitle), "value");
  addText(commands, PDF_MARGIN_LEFT + 10, cursor - 28, `Category: ${display(action.category)}`, "small");

  const gap = 10;
  const colW = (PDF_CONTENT_WIDTH - 20 - gap * 3) / 4;
  const metaY = cursor - 48;
  const meta = [
    ["Status", action.status],
    ["Priority", action.priority],
    ["Owner", actionOwner(action)],
    ["Effort", action.effort],
  ] as Array<[string, unknown]>;
  meta.forEach(([label, value], i) => addLabelValue(commands, PDF_MARGIN_LEFT + 10 + i * (colW + gap), metaY, label, value, colW, 10));

  let y = cursor - 84;
  addText(commands, PDF_MARGIN_LEFT + 10, y, "RECOMMENDED TREATMENT", "label");
  y = addWrappedText(commands, PDF_MARGIN_LEFT + 10, y - 12, treatment, PDF_CONTENT_WIDTH - 20, "body", 12) - 6;
  addText(commands, PDF_MARGIN_LEFT + 10, y, "EVIDENCE EXPECTED", "label");
  addWrappedText(commands, PDF_MARGIN_LEFT + 10, y - 12, evidence, PDF_CONTENT_WIDTH - 20, "small", 11);
  return cursor - height - 10;
}

function addDecisionCard(commands: string[], cursor: number, decision: ResidualRiskDecisionRecord): number {
  const rationale = display(decision.rationale);
  const rationaleLines = wrapPdfText(rationale, PDF_CONTENT_WIDTH - 20, 8.8, false).length;
  const height = 132 + rationaleLines * 11;
  addRect(commands, PDF_MARGIN_LEFT, cursor - height + 8, PDF_CONTENT_WIDTH, height, PDF_COLORS.surface, PDF_COLORS.border);
  addText(commands, PDF_MARGIN_LEFT + 10, cursor - 11, display(decision.riskTitle), "value");
  addText(commands, PDF_MARGIN_LEFT + 10, cursor - 28, `Finding ID: ${display(decision.findingId)}   |   Category: ${display(decision.category)}`, "small");

  const gap = 10;
  const colW = (PDF_CONTENT_WIDTH - 20 - gap * 2) / 3;
  addLabelValue(commands, PDF_MARGIN_LEFT + 10, cursor - 48, "Inherent Risk", decision.inherentRisk, colW);
  addLabelValue(commands, PDF_MARGIN_LEFT + 10 + colW + gap, cursor - 48, "Residual Risk", decision.residualRisk, colW);
  addLabelValue(commands, PDF_MARGIN_LEFT + 10 + (colW + gap) * 2, cursor - 48, "Decision", decision.decision, colW);
  addLabelValue(commands, PDF_MARGIN_LEFT + 10, cursor - 78, "Approval Status", decision.approvalStatus, colW);
  addLabelValue(commands, PDF_MARGIN_LEFT + 10 + colW + gap, cursor - 78, "Treatment Status", decision.treatmentStatus, colW);
  addLabelValue(commands, PDF_MARGIN_LEFT + 10 + (colW + gap) * 2, cursor - 78, "Review Date", decision.reviewDate, colW);

  let y = cursor - 108;
  addText(commands, PDF_MARGIN_LEFT + 10, y, "DECISION RATIONALE", "label");
  y = addWrappedText(commands, PDF_MARGIN_LEFT + 10, y - 12, rationale, PDF_CONTENT_WIDTH - 20, "small", 11) - 4;
  addText(commands, PDF_MARGIN_LEFT + 10, y, `Escalation Required: ${decision.escalationRequired ? "Yes" : "No"}`, "small");
  return cursor - height - 10;
}

function addGovernanceCard(commands: string[], cursor: number, decision: ResidualRiskDecisionRecord): number {
  const height = 166;
  addRect(commands, PDF_MARGIN_LEFT, cursor - height + 8, PDF_CONTENT_WIDTH, height, PDF_COLORS.surface, PDF_COLORS.border);
  addText(commands, PDF_MARGIN_LEFT + 10, cursor - 11, display(decision.riskTitle), "value");
  const gap = 10;
  const colW = (PDF_CONTENT_WIDTH - 20 - gap * 2) / 3;
  const rows: Array<[string, unknown]> = [
    ["Accountable Owner", decision.accountableOwner],
    ["Decision Authority", decision.decisionAuthority],
    ["Approval Status", decision.approvalStatus],
    ["Review Date", decision.reviewDate],
    ["Approval Date", decision.approvalDate],
    ["Next Review", decision.nextReviewDate],
    ["Treatment", decision.treatmentStatus],
    ["Review Frequency", decision.reviewFrequency],
    ["Target Resolution", decision.targetResolutionDate],
  ];
  rows.forEach(([label, value], i) => {
    const col = i % 3;
    const row = Math.floor(i / 3);
    addLabelValue(commands, PDF_MARGIN_LEFT + 10 + col * (colW + gap), cursor - 34 - row * 32, label, value, colW, 10);
  });
  addLabelValue(commands, PDF_MARGIN_LEFT + 10, cursor - 130, "Escalation Required", decision.escalationRequired ? "Yes" : "No", colW);
  addLabelValue(commands, PDF_MARGIN_LEFT + 10 + colW + gap, cursor - 130, "Escalation Reason", decision.escalationReason, colW * 2 + gap);
  return cursor - height - 10;
}

function addEvidenceCard(commands: string[], cursor: number, action: RiskTreatmentAction, evidence: EvidenceRecord | undefined): number {
  const notes = display(evidence?.notes);
  const ref = display(evidence?.reference);
  const owner = display(evidence?.owner);
  const noteLines = wrapPdfText(notes, PDF_CONTENT_WIDTH - 20, 8.8, false).length;
  const refLines = wrapPdfText(ref, PDF_CONTENT_WIDTH - 20, 8.8, false).length;
  const height = 128 + (noteLines + refLines) * 10;
  addRect(commands, PDF_MARGIN_LEFT, cursor - height + 8, PDF_CONTENT_WIDTH, height, PDF_COLORS.surface, PDF_COLORS.border);
  addText(commands, PDF_MARGIN_LEFT + 10, cursor - 11, display(action.riskTitle), "value");
  const gap = 10;
  const colW = (PDF_CONTENT_WIDTH - 20 - gap * 2) / 3;
  addLabelValue(commands, PDF_MARGIN_LEFT + 10, cursor - 32, "Treatment Status", action.status, colW);
  addLabelValue(commands, PDF_MARGIN_LEFT + 10 + colW + gap, cursor - 32, "Evidence Verified", evidence?.verified ? "Yes" : "No", colW);
  addLabelValue(commands, PDF_MARGIN_LEFT + 10 + (colW + gap) * 2, cursor - 32, "Evidence Owner", owner, colW);
  let y = cursor - 62;
  addText(commands, PDF_MARGIN_LEFT + 10, y, "REFERENCE", "label");
  y = addWrappedText(commands, PDF_MARGIN_LEFT + 10, y - 12, ref, PDF_CONTENT_WIDTH - 20, "small", 10) - 5;
  addText(commands, PDF_MARGIN_LEFT + 10, y, "CLOSURE NOTES", "label");
  addWrappedText(commands, PDF_MARGIN_LEFT + 10, y - 12, notes, PDF_CONTENT_WIDTH - 20, "small", 10);
  return cursor - height - 10;
}

function createPdfCommandPages(report: AssessmentReportData): string[][] {
  const profile = report.assessmentProfile;
  const result = report.riskResult;
  const findings = reportFindings(result);
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
    const lines = wrapPdfText(safe, PDF_CONTENT_WIDTH, s.size, s.font === "F2");
    ensure(lines.length * 13 + spacing + 5);
    cursor = addWrappedText(commands, PDF_MARGIN_LEFT, cursor, safe, PDF_CONTENT_WIDTH, style, 13) - spacing;
  };

  /* Page header — matches the preferred 9OVG visual language. */
  addRect(commands, 0, PDF_PAGE_HEIGHT - 42, PDF_PAGE_WIDTH, 42, PDF_COLORS.topBlue);
  addText(commands, PDF_MARGIN_LEFT, PDF_PAGE_HEIGHT - 27, "PrivacyMap India", "small");
  addText(commands, PDF_PAGE_WIDTH - PDF_MARGIN_RIGHT - 150, PDF_PAGE_HEIGHT - 27, "DPDP Privacy Assessment Report", "small");
  cursor = PDF_PAGE_HEIGHT - 78;

  addText(commands, PDF_MARGIN_LEFT, cursor, "DPDP Privacy Assessment Report", "title");
  cursor -= 29;
  addText(commands, PDF_MARGIN_LEFT, cursor, display(profile.organisationName), "value");
  cursor -= 24;
  addText(commands, PDF_MARGIN_LEFT, cursor, display(profile.assessmentName), "subtitle");
  cursor -= 25;

  cursor = addMetadataCard(commands, cursor, [
    ["Assessment ID", text(profile.assessmentId)],
    ["Generated", report.generatedAt],
  ]);
  cursor -= 3;

  addSection("EXECUTIVE SUMMARY");
  const metricGap = 8;
  const metricWidth = (PDF_CONTENT_WIDTH - metricGap * 2) / 3;
  const metricY = cursor - 2;
  addMetricCard(commands, PDF_MARGIN_LEFT, metricY, metricWidth, "Overall Risk", reportOverallRisk(result));
  addMetricCard(commands, PDF_MARGIN_LEFT + metricWidth + metricGap, metricY, metricWidth, "Risk Score", reportRiskScore(result));
  addMetricCard(commands, PDF_MARGIN_LEFT + (metricWidth + metricGap) * 2, metricY, metricWidth, "Privacy Risk Findings", String(findings.length));
  const metricY2 = metricY - 76;
  addMetricCard(commands, PDF_MARGIN_LEFT, metricY2, metricWidth, "Treatment Actions", String(report.treatmentActions.length));
  addMetricCard(commands, PDF_MARGIN_LEFT + metricWidth + metricGap, metricY2, metricWidth, "Residual Risk Decisions", String(report.residualRiskDecisions.length));
  addMetricCard(commands, PDF_MARGIN_LEFT + (metricWidth + metricGap) * 2, metricY2, metricWidth, "Evidence Items", String(Object.keys(report.evidenceRecords).length));
  cursor = metricY2 - 76;

  addSection("ASSESSMENT PROFILE");
  const profileGap = 18;
  const profileColW = (PDF_CONTENT_WIDTH - profileGap) / 2;
  const profileTop = cursor;
  const leftEnd = addTwoColumnMetadata(commands, PDF_MARGIN_LEFT + 10, profileTop, profileColW - 20, [
    ["Organisation / School", profile.organisationName],
    ["Industry", profileIndustry(profile)],
    ["Business Type", profileBusinessType(profile)],
    ["Assessment", profile.assessmentName],
  ]);
  const rightEnd = addTwoColumnMetadata(commands, PDF_MARGIN_LEFT + profileColW + profileGap + 10, profileTop, profileColW - 20, [
    ["Assessment Owner", profile.assessmentOwner],
    ["Assessment ID", profile.assessmentId],
    ["Assessment Date", profile.assessmentDate],
    ["Assessment Version", profile.assessmentVersion],
  ]);
  const profileHeight = Math.max(profileTop - leftEnd, profileTop - rightEnd) + 8;
  addRect(commands, PDF_MARGIN_LEFT, profileTop + 4 - profileHeight, PDF_CONTENT_WIDTH, profileHeight, PDF_COLORS.surface, PDF_COLORS.border);
  /* Re-draw text over the background card so the card never covers content. */
  addTwoColumnMetadata(commands, PDF_MARGIN_LEFT + 10, profileTop, profileColW - 20, [
    ["Organisation / School", profile.organisationName], ["Industry", profileIndustry(profile)], ["Business Type", profileBusinessType(profile)], ["Assessment", profile.assessmentName],
  ]);
  addTwoColumnMetadata(commands, PDF_MARGIN_LEFT + profileColW + profileGap + 10, profileTop, profileColW - 20, [
    ["Assessment Owner", profile.assessmentOwner], ["Assessment ID", profile.assessmentId], ["Assessment Date", profile.assessmentDate], ["Assessment Version", profile.assessmentVersion],
  ]);
  cursor = profileTop - profileHeight - 10;

  addText(commands, PDF_MARGIN_LEFT, cursor, "Report Generated", "label");
  addText(commands, PDF_MARGIN_LEFT, cursor - 12, report.generatedAt, "value");
  cursor -= 32;

  addSection("PRIVACY RISK FINDINGS");
  if (!findings.length) addParagraph("No privacy risk findings are available in the assessment result.", "body", 10);
  findings.forEach((finding, index) => {
    const estimated = 160;
    ensure(estimated);
    cursor = addRiskFindingCard(commands, cursor, finding, index);
  });

  addSection("RISK TREATMENT & ACTION PLAN");
  if (!report.treatmentActions.length) addParagraph("No treatment actions are available.", "body", 10);
  for (const action of report.treatmentActions) {
    ensure(190);
    cursor = addTreatmentCard(commands, cursor, action);
  }

  addSection("RESIDUAL RISK GOVERNANCE");
  if (!report.residualRiskDecisions.length) addParagraph("No residual-risk decisions are available.", "body", 10);
  for (const decision of report.residualRiskDecisions) {
    ensure(175);
    cursor = addDecisionCard(commands, cursor, decision);
  }

  addSection("RISK GOVERNANCE & APPROVAL");
  for (const decision of report.residualRiskDecisions) {
    ensure(190);
    cursor = addGovernanceCard(commands, cursor, decision);
  }

  addSection("REMEDIATION TRACKER");
  for (const action of report.treatmentActions) {
    ensure(95);
    addRect(commands, PDF_MARGIN_LEFT, cursor - 78, PDF_CONTENT_WIDTH, 84, PDF_COLORS.surface, PDF_COLORS.border);
    addText(commands, PDF_MARGIN_LEFT + 10, cursor - 11, display(action.riskTitle), "value");
    const gap = 10;
    const colW = (PDF_CONTENT_WIDTH - 20 - gap * 3) / 4;
    addLabelValue(commands, PDF_MARGIN_LEFT + 10, cursor - 31, "Status", action.status, colW);
    addLabelValue(commands, PDF_MARGIN_LEFT + 10 + colW + gap, cursor - 31, "Priority", action.priority, colW);
    addLabelValue(commands, PDF_MARGIN_LEFT + 10 + (colW + gap) * 2, cursor - 31, "Owner", actionOwner(action), colW);
    addLabelValue(commands, PDF_MARGIN_LEFT + 10 + (colW + gap) * 3, cursor - 31, "Effort", action.effort, colW);
    addLabelValue(commands, PDF_MARGIN_LEFT + 10, cursor - 61, "Timeframe", actionTimeframe(action), PDF_CONTENT_WIDTH - 20);
    cursor -= 96;
  }

  addSection("EVIDENCE & CLOSURE");
  for (const action of report.treatmentActions) {
    ensure(160);
    cursor = addEvidenceCard(commands, cursor, action, report.evidenceRecords[action.id]);
  }

  addSection("IMPORTANT DISCLAIMER");
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
