import type { AssessmentProfile, EvidenceRecord } from "../types";
import type { RiskResult } from "../lib/riskEngine";
import type { RiskTreatmentAction } from "../lib/remediationEngine";
import type { ResidualRiskDecisionRecord } from "../lib/governanceEngine";

export interface AssessmentReportData {
  profile: AssessmentProfile;
  industryId: string;
  businessTypeId: string;
  processId: string;
  selectedEntryPoints: string[];
  customEntryPoints: Array<Record<string, unknown>>;
  selectedFields: string[];
  customFields: Array<Record<string, unknown>>;
  collectorRoles: string[];
  dataSubjectTypes: string[];
  collectionFormats: string[];
  storageLocations: string[];
  storageEnvironments: string[];
  encryptionStatuses: string[];
  accessRoles: string[];
  sharingStatuses: string[];
  retentionPeriods: string[];
  deletionMethods: string[];
  privacyNotices: string[];
  consentStatuses: string[];
  parentalConsentStatuses: string[];
  crossBorderTransfers: string[];
  riskResult: RiskResult | null;
  treatmentActions: RiskTreatmentAction[];
  residualRiskAssessments: unknown[];
  residualRiskSummary: unknown;
  residualRiskDecisions: ResidualRiskDecisionRecord[];
  evidence: Record<string, EvidenceRecord>;
}

export function buildReportData(input: AssessmentReportData): AssessmentReportData {
  return JSON.parse(JSON.stringify(input)) as AssessmentReportData;
}

export function safeFileStem(profile: AssessmentProfile): string {
  const clean = (value: string) =>
    value
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 80);

  return `${clean(profile.organisationName) || "PrivacyMap"}-DPDP-Privacy-Assessment-${clean(profile.assessmentId) || "Assessment"}`;
}

function display(value: unknown): string {
  if (value === null || value === undefined || value === "") return "—";
  if (typeof value === "string") return value;
  if (typeof value === "number" || typeof value === "boolean") return String(value);
  return JSON.stringify(value);
}

function list(values: unknown[]): string {
  return values.length ? values.map(display).join(", ") : "—";
}

export function buildMarkdownReport(data: AssessmentReportData): string {
  const p = data.profile;
  const lines: string[] = [];
  const section = (n: number, title: string) => lines.push(`## ${n}. ${title}`, "");
  const bulletList = (title: string, values: unknown[]) => {
    lines.push(`**${title}:** ${list(values)}`, "");
  };

  lines.push(
    `# DPDP Privacy Assessment Report`,
    "",
    `**Organisation:** ${p.organisationName || "—"}`,
    `**Assessment:** ${p.assessmentName || "—"}`,
    `**Assessment Owner:** ${p.assessmentOwner || "—"}`,
    `**Assessment ID:** ${p.assessmentId || "—"}`,
    `**Assessment Date:** ${p.assessmentDate || "—"}`,
    `**Assessment Version:** ${p.assessmentVersion || "—"}`,
    "",
    "---",
    "",
    "## Executive Summary",
    "",
    `This report records the DPDP privacy assessment performed for **${p.organisationName || "the organisation"}**. It consolidates the assessment profile, data-processing inputs, privacy-risk findings, treatment actions, residual-risk governance, DPDP mapping inputs, remediation status and evidence-closure records captured in PrivacyMap India.`,
    "",
  );

  section(1, "Business Context");
  lines.push(`- Industry ID: ${display(data.industryId)}`, `- Business Type ID: ${display(data.businessTypeId)}`, `- Processing Activity ID: ${display(data.processId)}`, "");

  section(2, "Business / Data Inventory");
  bulletList("Selected data entry points", data.selectedEntryPoints);
  bulletList("Custom data entry points", data.customEntryPoints);

  section(3, "Processing Activity");
  lines.push(`- Processing Activity ID: ${display(data.processId)}`, "");

  section(4, "Data Entry Points");
  bulletList("Selected entry points", data.selectedEntryPoints);
  bulletList("Custom entry points", data.customEntryPoints);

  section(5, "Personal Data Fields");
  bulletList("Selected fields", data.selectedFields);
  bulletList("Custom fields", data.customFields);

  section(6, "Data Subjects, Processing & Controls");
  bulletList("Collector roles", data.collectorRoles);
  bulletList("Data subject types", data.dataSubjectTypes);
  bulletList("Collection formats", data.collectionFormats);
  bulletList("Storage locations", data.storageLocations);
  bulletList("Storage environments", data.storageEnvironments);
  bulletList("Encryption status", data.encryptionStatuses);
  bulletList("Access roles", data.accessRoles);
  bulletList("Sharing status", data.sharingStatuses);
  bulletList("Retention periods", data.retentionPeriods);
  bulletList("Deletion methods", data.deletionMethods);
  bulletList("Privacy notices", data.privacyNotices);
  bulletList("Consent status", data.consentStatuses);
  bulletList("Parental consent status", data.parentalConsentStatuses);
  bulletList("Cross-border transfers", data.crossBorderTransfers);

  section(7, "Privacy Risk Assessment");
  if (data.riskResult) {
    lines.push("```json", JSON.stringify(data.riskResult, null, 2), "```", "");
  } else {
    lines.push("Risk assessment output was not available.", "");
  }

  section(8, "Risk Treatment & Action Plan");
  if (data.treatmentActions.length) {
    lines.push("| ID | Risk | Category | Status | Priority | Owner | Timeframe | Effort |", "|---|---|---|---|---|---|---|---|");
    for (const a of data.treatmentActions) {
      const x = a as unknown as Record<string, unknown>;
      lines.push(`| ${display(x.id)} | ${display(x.riskTitle)} | ${display(x.category)} | ${display(x.status)} | ${display(x.priority)} | ${display(x.owner)} | ${display(x.timeframe)} | ${display(x.effort)} |`);
    }
    lines.push("");
  } else lines.push("No treatment actions were recorded.", "");

  section(9, "Residual Risk Decision Register");
  if (data.residualRiskDecisions.length) {
    lines.push("| ID | Risk | Inherent | Residual | Decision | Approval | Owner | Review Date |", "|---|---|---|---|---|---|---|---|");
    for (const d of data.residualRiskDecisions) {
      lines.push(`| ${d.id} | ${d.riskTitle} | ${d.inherentRisk} | ${d.residualRisk} | ${d.decision} | ${d.approvalStatus} | ${d.accountableOwner || "—"} | ${d.reviewDate || "—"} |`);
    }
    lines.push("");
  } else lines.push("No residual-risk decisions were recorded.", "");

  section(10, "DPDP Mapping");
  lines.push("The DPDP mapping values captured during the assessment are included in the structured JSON/XML exports and are represented here through the assessment inputs and risk records.", "");
  bulletList("Data subject types", data.dataSubjectTypes);
  bulletList("Encryption statuses", data.encryptionStatuses);
  bulletList("Retention periods", data.retentionPeriods);
  bulletList("Deletion methods", data.deletionMethods);
  bulletList("Privacy notices", data.privacyNotices);
  bulletList("Consent statuses", data.consentStatuses);
  bulletList("Parental consent statuses", data.parentalConsentStatuses);
  bulletList("Cross-border transfers", data.crossBorderTransfers);

  section(11, "Risk Governance & Approval");
  if (data.residualRiskDecisions.length) {
    for (const d of data.residualRiskDecisions) {
      lines.push(
        `### ${d.id} — ${d.riskTitle}`,
        `- Decision: ${display(d.decision)}`,
        `- Approval status: ${display(d.approvalStatus)}`,
        `- Accountable owner: ${display(d.accountableOwner)}`,
        `- Decision authority: ${display(d.decisionAuthority)}`,
        `- Review frequency: ${display(d.reviewFrequency)}`,
        `- Review date: ${display(d.reviewDate)}`,
        `- Approval date: ${display(d.approvalDate)}`,
        `- Next review date: ${display(d.nextReviewDate)}`,
        `- Escalation required: ${display(d.escalationRequired)}`,
        `- Rationale: ${display(d.rationale)}`,
        "",
      );
    }
  }

  section(12, "Remediation Tracker");
  if (data.treatmentActions.length) {
    for (const a of data.treatmentActions) {
      const x = a as unknown as Record<string, unknown>;
      lines.push(`- ${display(x.riskTitle)} — ${display(x.status)} — Owner: ${display(x.owner)} — Priority: ${display(x.priority)}`);
    }
    lines.push("");
  }

  section(13, "Evidence & Closure");
  const evidenceEntries = Object.entries(data.evidence);
  if (evidenceEntries.length) {
    for (const [id, e] of evidenceEntries) {
      lines.push(`### ${id}`, `- Evidence reference: ${display(e.reference)}`, `- Evidence owner: ${display(e.owner)}`, `- Verified: ${display(e.verified)}`, `- Closure notes: ${display(e.notes)}`, "");
    }
  } else lines.push("No evidence records were captured.", "");

  lines.push(
    "## Report Status",
    "",
    "Assessment Profile is presented separately from the numbered assessment steps. The report therefore begins with the assessment identity and then uses Steps 1–13 for the assessment workflow; Step 0 is intentionally not shown as a report section.",
    "",
    "## Disclaimer",
    "",
    "This report is an assessment aid and does not constitute legal advice, a legal opinion, an audit opinion, certification, or a determination of statutory compliance. The assessment should be reviewed by the organisation's appropriate privacy, legal, security and risk stakeholders.",
    "",
  );

  return lines.join("\n");
}

export function buildCsvReport(data: AssessmentReportData): string {
  const rows: string[][] = [["Record Type", "ID", "Risk / Item", "Category", "Status", "Priority", "Owner", "Residual Risk", "Approval Status", "Review Date", "Evidence Reference", "Evidence Verified"]];
  for (const a of data.treatmentActions) {
    const x = a as unknown as Record<string, unknown>;
    const e = data.evidence[String(x.id)] || {};
    rows.push(["Treatment Action", display(x.id), display(x.riskTitle), display(x.category), display(x.status), display(x.priority), display(x.owner), "", "", "", display(e.reference), display(e.verified)]);
  }
  for (const d of data.residualRiskDecisions) {
    const e = data.evidence[d.id] || {};
    rows.push(["Residual Risk Decision", d.id, d.riskTitle, d.category, display(d.decision), "", d.accountableOwner || "", d.residualRisk, d.approvalStatus, d.reviewDate || "", display(e.reference), display(e.verified)]);
  }
  return rows.map(row => row.map(v => `"${v.replace(/"/g, '""')}"`).join(",")).join("\r\n");
}

function xmlEscape(value: unknown): string {
  return display(value).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;").replace(/'/g, "&apos;");
}

export function buildXmlReport(data: AssessmentReportData): string {
  const json = JSON.parse(JSON.stringify(data)) as Record<string, unknown>;
  const render = (key: string, value: unknown, indent = ""): string => {
    const tag = key.replace(/[^A-Za-z0-9_-]/g, "_") || "item";
    if (Array.isArray(value)) {
      return `${indent}<${tag}>\n${value.map(v => render("item", v, indent + "  ")).join("\n")}\n${indent}</${tag}>`;
    }
    if (value && typeof value === "object") {
      const entries = Object.entries(value as Record<string, unknown>);
      return `${indent}<${tag}>${entries.length ? `\n${entries.map(([k,v]) => render(k,v,indent+"  ")).join("\n")}\n${indent}` : ""}</${tag}>`;
    }
    return `${indent}<${tag}>${xmlEscape(value)}</${tag}>`;
  };
  return `<?xml version="1.0" encoding="UTF-8"?>\n<PrivacyMapAssessment version="1.0">\n${Object.entries(json).map(([k,v]) => render(k,v,"  ")).join("\n")}\n</PrivacyMapAssessment>`;
}

export function buildJsonReport(data: AssessmentReportData): string {
  return JSON.stringify(data, null, 2);
}

export function downloadTextFile(content: string, filename: string, mime: string): void {
  const blob = new Blob([content], { type: `${mime};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}

/* ============================================================
   DEPENDENCY-FREE PDF GENERATION

   This creates a small, standards-compliant PDF directly in the
   browser. It deliberately uses the built-in PDF Type1 Helvetica
   font so PrivacyMap does not require jsPDF, pdf-lib, or any other
   npm package.
   ============================================================ */

function pdfSafeText(value: string): string {
  // Built-in Helvetica is WinAnsi/Latin-1 oriented. Replace characters
  // outside the safe range rather than producing a corrupt PDF.
  return value
    .replace(/\r?\n/g, " ")
    .replace(/[^\x20-\x7E\xA0-\xFF]/g, "?")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function pdfWrap(text: string, maxChars = 96): string[] {
  const clean = text.replace(/\t/g, "    ").trim();
  if (!clean) return [""];
  const words = clean.split(/\s+/);
  const result: string[] = [];
  let current = "";

  for (const word of words) {
    if (!current) {
      current = word;
    } else if ((current.length + 1 + word.length) <= maxChars) {
      current += ` ${word}`;
    } else {
      result.push(current);
      current = word;
    }
  }
  if (current) result.push(current);
  return result;
}

function buildPdfLines(data: AssessmentReportData): string[] {
  // Markdown is already the canonical report representation, so keep the
  // PDF content aligned with Markdown/JSON/XML/CSV without duplicating the
  // assessment logic.
  const markdown = buildMarkdownReport(data);
  return markdown.split(/\r?\n/).flatMap((line) => {
    let text = line;
    if (/^```/.test(text)) text = "";
    text = text
      .replace(/^#{1,6}\s+/, "")
      .replace(/^\*\*(.+)\*\*$/, "$1")
      .replace(/^\*\*(.+?):\*\*\s*/, "$1: ")
      .replace(/^[-*]\s+/, "• ")
      .replace(/^\|[-:| ]+$/, "")
      .replace(/^\|\s*/, "")
      .replace(/\s*\|\s*/g, "   |   ")
      .replace(/\*\*/g, "")
      .trim();

    if (!text) return [""];
    return pdfWrap(text);
  });
}

function buildPdfDocument(lines: string[]): Uint8Array {
  const pageWidth = 595;
  const pageHeight = 842;
  const marginLeft = 40;
  const marginTop = 48;
  const marginBottom = 42;
  const fontSize = 9.5;
  const lineHeight = 13;
  const linesPerPage = Math.floor(
    (pageHeight - marginTop - marginBottom) / lineHeight
  );

  const pages: string[][] = [];
  for (let i = 0; i < lines.length; i += linesPerPage) {
    pages.push(lines.slice(i, i + linesPerPage));
  }
  if (!pages.length) pages.push(["PrivacyMap Assessment Report"]);

  const objects: string[] = [];
  const addObject = (body: string) => {
    objects.push(body);
    return objects.length;
  };

  const catalogId = addObject("");
  const pagesId = addObject("");
  const fontId = addObject(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
  );

  const pageIds: number[] = [];
  const contentIds: number[] = [];

  pages.forEach((pageLines, pageIndex) => {
    const content: string[] = [
      "q",
      "0 0 0 rg",
      `BT /F1 ${fontSize} Tf ${marginLeft} ${pageHeight - marginTop} Td`,
    ];

    pageLines.forEach((line, lineIndex) => {
      const safe = pdfSafeText(line);
      if (lineIndex > 0) content.push(`0 -${lineHeight} Td`);
      content.push(`(${safe}) Tj`);
    });

    content.push("ET", "Q");
    const stream = content.join("\n");
    const contentId = addObject(
      `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`
    );
    contentIds.push(contentId);

    const pageId = addObject("");
    pageIds.push(pageId);
  });

  objects[pagesId - 1] =
    `<< /Type /Pages /Kids [${pageIds.map((id) => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;

  pageIds.forEach((pageId, index) => {
    objects[pageId - 1] =
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${pageWidth} ${pageHeight}] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentIds[index]} 0 R >>`;
  });

  objects[catalogId - 1] =
    `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;

  let pdf = "%PDF-1.4\n%\xE2\xE3\xCF\xD3\n";
  const offsets: number[] = [0];

  objects.forEach((body, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${body}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  // Encode as Latin-1 because the document intentionally uses only the
  // built-in Helvetica character set after pdfSafeText().
  const bytes = new Uint8Array(pdf.length);
  for (let i = 0; i < pdf.length; i += 1) bytes[i] = pdf.charCodeAt(i) & 0xff;
  return bytes;
}

export async function downloadPdfReport(
  data: AssessmentReportData,
  filename: string
): Promise<void> {
  const lines = buildPdfLines(data);
  const bytes = buildPdfDocument(lines);
  const blob = new Blob([bytes], { type: "application/pdf" });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.style.display = "none";
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();

  // Delay revocation very slightly so browsers that process the download
  // asynchronously still have access to the object URL.
  window.setTimeout(() => URL.revokeObjectURL(url), 1000);
}
