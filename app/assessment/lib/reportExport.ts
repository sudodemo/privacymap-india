import type { AssessmentProfile } from "../types";
import type { RiskResult } from "../lib/riskEngine";
import type { RiskTreatmentAction } from "../lib/remediationEngine";
import type { ResidualRiskDecisionRecord } from "../lib/governanceEngine";

/* ============================================================
   REPORT PAYMENT FEATURE FLAG

   Monetisation is intentionally disabled during the public-testing
   phase. The flag is reserved for the future payment entitlement
   layer and does not alter the current free-download workflow.
   ============================================================ */
export const REPORT_PAYMENT_ENABLED = false;

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
   DEPENDENCY-FREE PDF
   ============================================================ */

function pdfEscape(value: string): string {
  return pdfSafe(value)
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrapPdfText(value: string, width = 88): string[] {
  const words = pdfSafe(value).split(/\s+/).filter(Boolean);
  if (!words.length) return [" "];

  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    if (`${current} ${word}`.trim().length > width) {
      if (current) lines.push(current);
      current = word;
    } else {
      current = `${current} ${word}`.trim();
    }
  }

  if (current) lines.push(current);
  return lines;
}

function pushPdfSection(lines: string[], title: string): void {
  lines.push("", title.toUpperCase(), "");
}

function buildPdfPages(report: AssessmentReportData): string[][] {
  const profile = report.assessmentProfile;
  const result = report.riskResult;
  const findingsValue = resultValue(result, "findings");
  const findings = Array.isArray(findingsValue) ? findingsValue : [];
  const lines: string[] = [];

  lines.push("PRIVACYMAP INDIA", "ATMANIRBHAR DPDP ASSESSMENT", "Assessment Report", "");
  lines.push(`Organisation: ${display(profile.organisationName)}`);
  lines.push(`Industry: ${profileIndustry(profile)}`);
  lines.push(`Business Type: ${profileBusinessType(profile)}`);
  lines.push(`Assessment: ${display(profile.assessmentName)}`);
  lines.push(`Assessment Owner: ${display(profile.assessmentOwner)}`);
  lines.push(`Assessment ID: ${display(profile.assessmentId)}`);
  lines.push(`Assessment Date: ${display(profile.assessmentDate)}`);
  lines.push(`Assessment Version: ${display(profile.assessmentVersion)}`);
  lines.push(`Report Generated: ${report.generatedAt}`);

  pushPdfSection(lines, "Executive Summary");
  lines.push(`Overall Risk: ${display(resultValue(result, "overallRisk"))}`);
  lines.push(`Risk Score: ${display(resultValue(result, "riskScore"))}`);
  lines.push(`Risk Findings: ${findings.length}`);
  lines.push(`Treatment Actions: ${report.treatmentActions.length}`);
  lines.push(`Residual Risk Decisions: ${report.residualRiskDecisions.length}`);

  pushPdfSection(lines, "Step 7 - Privacy Risk Findings");
  findings.forEach((finding, index) => {
    const item = finding as Record<string, unknown>;
    lines.push(`${index + 1}. ${display(item.title ?? item.riskTitle ?? item.name)}`);
    lines.push(`Finding ID: ${display(item.id)}`);
    lines.push(`Category: ${display(item.category)}`);
    lines.push(`Risk: ${display(item.severity ?? item.risk ?? item.riskLevel)}`);
    lines.push(`Description: ${display(item.description)}`);
    lines.push(`Recommended Action: ${display(item.recommendedAction ?? item.recommendation)}`, "");
  });

  pushPdfSection(lines, "Step 8 - Risk Treatment & Action Plan");
  report.treatmentActions.forEach((action, index) => {
    lines.push(`${index + 1}. ${display(action.riskTitle)}`);
    lines.push(`Category: ${display(action.category)}`);
    lines.push(`Status: ${display(action.status)}`);
    lines.push(`Priority: ${display(action.priority)}`);
    lines.push(`Owner: ${display(actionOwner(action))}`);
    lines.push(`Timeframe: ${display(actionTimeframe(action))}`);
    lines.push(`Effort: ${display(action.effort)}`);
    lines.push(`Recommended Treatment: ${display(actionTreatment(action))}`);
    lines.push(`Evidence Expected: ${display(actionEvidence(action))}`, "");
  });

  pushPdfSection(lines, "Step 9 - Residual Risk Assessment");
  report.residualRiskDecisions.forEach((decision, index) => {
    lines.push(`${index + 1}. ${display(decision.riskTitle)}`);
    lines.push(`Finding ID: ${display(decision.findingId)}`);
    lines.push(`Category: ${display(decision.category)}`);
    lines.push(`Inherent Risk: ${display(decision.inherentRisk)}`);
    lines.push(`Residual Risk: ${display(decision.residualRisk)}`);
    lines.push(`Decision: ${display(decision.decision)}`);
    lines.push(`Rationale: ${display(decision.rationale)}`, "");
  });

  pushPdfSection(lines, "Step 10 - DPDP Requirement Mapping");
  lines.push("DPDP control mappings are maintained by the Step 10 assessment component.");
  lines.push("The report exporter does not invent mapping values that are not present in the report state.");

  pushPdfSection(lines, "Step 11 - Risk Governance & Approval");
  report.residualRiskDecisions.forEach((decision, index) => {
    lines.push(`${index + 1}. ${display(decision.riskTitle)}`);
    lines.push(`Approval Status: ${display(decision.approvalStatus)}`);
    lines.push(`Accountable Owner: ${display(decision.accountableOwner)}`);
    lines.push(`Decision Authority: ${display(decision.decisionAuthority)}`);
    lines.push(`Review Date: ${display(decision.reviewDate)}`);
    lines.push(`Approval Date: ${display(decision.approvalDate)}`);
    lines.push(`Next Review Date: ${display(decision.nextReviewDate)}`);
    lines.push(`Target Resolution Date: ${display(decision.targetResolutionDate)}`);
    lines.push(`Treatment Status: ${display(decision.treatmentStatus)}`);
    lines.push(`Review Frequency: ${display(decision.reviewFrequency)}`);
    lines.push(`Escalation Required: ${decision.escalationRequired ? "Yes" : "No"}`);
    if (decision.escalationReason) lines.push(`Escalation Reason: ${display(decision.escalationReason)}`);
    lines.push("");
  });

  pushPdfSection(lines, "Step 12 - Remediation Tracker");
  report.treatmentActions.forEach((action, index) => {
    lines.push(`${index + 1}. ${display(action.riskTitle)}`);
    lines.push(`Status: ${display(action.status)}`);
    lines.push(`Priority: ${display(action.priority)}`);
    lines.push(`Owner: ${display(actionOwner(action))}`);
    lines.push(`Timeframe: ${display(actionTimeframe(action))}`);
    lines.push(`Effort: ${display(action.effort)}`, "");
  });

  pushPdfSection(lines, "Step 13 - Evidence & Closure");
  report.treatmentActions.forEach((action, index) => {
    const evidence = report.evidenceRecords[action.id];
    lines.push(`${index + 1}. ${display(action.riskTitle)}`);
    lines.push(`Treatment Status: ${display(action.status)}`);
    lines.push(`Evidence Reference: ${display(evidence?.reference)}`);
    lines.push(`Evidence Owner: ${display(evidence?.owner)}`);
    lines.push(`Evidence Verified: ${evidence?.verified ? "Yes" : "No"}`);
    lines.push(`Closure Notes: ${display(evidence?.notes)}`, "");
  });

  pushPdfSection(lines, "Confidential Information");
  lines.push("Confidential Information | PrivacyMap India | Atmanirbhar DPDP Assessment");
  lines.push("This assessment report is intended for the organisation and its authorised recipients.");
  lines.push("");

  pushPdfSection(lines, "Important Disclaimer");
  lines.push("PrivacyMap India assessment output is a risk-assessment and governance aid.");
  lines.push("It is not a legal opinion, certification or automatic determination of DPDP compliance.");
  lines.push("DPDP control mappings are reference mappings and should be validated against the official notified Act, Rules and subsequent amendments or corrigenda.");

  const pages: string[][] = [];
  let page: string[] = [];

  for (const line of lines) {
    for (const wrappedLine of wrapPdfText(line)) {
      if (page.length >= 46) {
        pages.push(page);
        page = [];
      }
      page.push(wrappedLine);
    }
  }

  if (page.length) pages.push(page);
  return pages;
}

export function createPdfBlob(report: AssessmentReportData): Blob {
  const pages = buildPdfPages(report);
  const objects: string[] = ["", ""];
  const pageObjectIds: number[] = [];
  const contentObjectIds: number[] = [];

  for (let i = 0; i < pages.length; i += 1) {
    pageObjectIds.push(objects.length + 1);
    objects.push("");
    contentObjectIds.push(objects.length + 1);
    objects.push("");
  }

  const fontObjectId = objects.length + 1;
  objects.push("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");

  objects[0] = "<< /Type /Catalog /Pages 2 0 R >>";
  objects[1] = `<< /Type /Pages /Kids [${pageObjectIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pages.length} >>`;

  for (let i = 0; i < pages.length; i += 1) {
    const commands: string[] = [
      "BT",
      "/F1 10 Tf",
      "12 TL",
      "50 760 Td",
    ];

    for (const line of pages[i]) {
      commands.push(`(${pdfEscape(line)}) Tj`, "T*");
    }

    commands.push("ET");
    const stream = commands.join("\n");

    objects[pageObjectIds[i] - 1] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontObjectId} 0 R >> >> /Contents ${contentObjectIds[i]} 0 R >>`;

    objects[contentObjectIds[i] - 1] =
      `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  }

  let pdf = "%PDF-1.4\n";
  const offsets: number[] = [0];

  for (let i = 0; i < objects.length; i += 1) {
    offsets[i + 1] = pdf.length;
    pdf += `${i + 1} 0 obj\n${objects[i]}\nendobj\n`;
  }

  const xrefOffset = pdf.length;
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
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
