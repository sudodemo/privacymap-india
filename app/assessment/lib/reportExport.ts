import type { AssessmentProfile } from "../types";
import type { RiskResult } from "../lib/riskEngine";
import type { RiskTreatmentAction } from "../lib/remediationEngine";
import type { ResidualRiskDecisionRecord } from "../lib/governanceEngine";

/* ============================================================
   STEP 13 EVIDENCE MODEL

   Kept local to the reporting layer so reportExport.ts does not
   require EvidenceRecord to be exported from types.ts.
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

function resultValue(
  result: RiskResult | null,
  key: string
): unknown {
  if (!result) {
    return "";
  }

  return (
    result as unknown as Record<string, unknown>
  )[key];
}

/*
 * Compatibility accessor for treatment actions.
 *
 * Some presentation fields existed in earlier versions of the
 * remediation model but are not currently declared on
 * RiskTreatmentAction. Access them through an unknown record so
 * the reporting layer does not force changes into the core model.
 */
function treatmentValue(
  action: RiskTreatmentAction,
  key: string
): unknown {
  return (
    action as unknown as Record<string, unknown>
  )[key];
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
   DECISION MATCHING
   ============================================================ */

function findDecisionForAction(
  report: AssessmentReportData,
  action: RiskTreatmentAction
): ResidualRiskDecisionRecord | undefined {
  return report.residualRiskDecisions.find(
    (decision) =>
      decision.riskTitle === action.riskTitle &&
      decision.category === action.category
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
  return JSON.stringify(report, null, 2);
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
    "Target Resolution Date",
    "Effort",
    "Review Date",
    "Evidence Reference",
    "Evidence Owner",
    "Evidence Verified",
    "Notes",
  ]);

  for (const action of report.treatmentActions) {
    const decision = findDecisionForAction(
      report,
      action
    );

    const evidence =
      report.evidenceRecords[action.id];

    const owner = treatmentValue(
      action,
      "owner"
    );

    const effort = treatmentValue(
      action,
      "effort"
    );

    rows.push([
      "Risk Treatment",
      text(action.id),
      text(action.category),
      text(action.riskTitle),
      text(decision?.inherentRisk),
      text(decision?.residualRisk),
      text(decision?.decision),
      text(decision?.approvalStatus),
      text(action.status),
      text(
        owner ||
          decision?.accountableOwner
      ),
      text(action.priority),
      text(
        decision?.targetResolutionDate
      ),
      text(effort),
      text(decision?.reviewDate),
      text(evidence?.reference),
      text(evidence?.owner),
      evidence?.verified ? "Yes" : "No",
      text(evidence?.notes),
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

  const result =
    report.riskResult;

  const overallRisk = resultValue(
    result,
    "overallRisk"
  );

  const riskScore = resultValue(
    result,
    "riskScore"
  );

  const findings = resultValue(
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
          findDecisionForAction(
            report,
            action
          );

        const evidence =
          report.evidenceRecords[
            action.id
          ];

        const owner =
          treatmentValue(
            action,
            "owner"
          );

        const effort =
          treatmentValue(
            action,
            "effort"
          );

        const recommendedTreatment =
          treatmentValue(
            action,
            "recommendedTreatment"
          );

        return `
      <treatment>
        <id>${escapeXml(action.id)}</id>
        <category>${escapeXml(
          action.category
        )}</category>
        <riskTitle>${escapeXml(
          action.riskTitle
        )}</riskTitle>
        <recommendedTreatment>${escapeXml(
          recommendedTreatment
        )}</recommendedTreatment>
        <status>${escapeXml(
          action.status
        )}</status>
        <priority>${escapeXml(
          action.priority
        )}</priority>
        <owner>${escapeXml(
          owner ||
            decision?.accountableOwner
        )}</owner>
        <targetResolutionDate>${escapeXml(
          decision?.targetResolutionDate
        )}</targetResolutionDate>
        <effort>${escapeXml(
          effort
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

  const findingXml =
    findingsArray
      .map((finding) => {
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
    <riskScore>${escapeXml(
      riskScore
    )}</riskScore>
    <findingCount>${findingsArray.length}</findingCount>
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

  const overallRisk = text(
    resultValue(
      result,
      "overallRisk"
    )
  );

  const riskScore = text(
    resultValue(
      result,
      "riskScore"
    )
  );

  const findings = resultValue(
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
    `- Overall Risk: **${overallRisk}**`
  );

  lines.push(
    `- Risk Score: **${riskScore}**`
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
    "## Step 7 — Privacy Risk Findings"
  );

  lines.push("");

  for (const finding of findingsArray) {
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
    "## Step 8 — Risk Treatment & Action Plan"
  );

  lines.push("");

  lines.push(
    "| Category | Risk | Priority | Owner | Target Resolution Date | Effort | Status |"
  );

  lines.push(
    "|---|---|---|---|---|---|---|"
  );

  for (const action of report.treatmentActions) {
    const decision =
      findDecisionForAction(
        report,
        action
      );

    const owner =
      treatmentValue(
        action,
        "owner"
      );

    const effort =
      treatmentValue(
        action,
        "effort"
      );

    lines.push(
      `| ${escapeMarkdown(
        action.category
      )} | ${escapeMarkdown(
        action.riskTitle
      )} | ${escapeMarkdown(
        action.priority
      )} | ${escapeMarkdown(
        owner ||
          decision?.accountableOwner
      )} | ${escapeMarkdown(
        decision?.targetResolutionDate
      )} | ${escapeMarkdown(
        effort
      )} | ${escapeMarkdown(
        action.status
      )} |`
    );
  }

  lines.push("");

  lines.push(
    "## Residual Risk Governance"
  );

  lines.push("");

  lines.push(
    "| Risk | Inherent | Residual | Decision | Approval | Owner | Review Date | Target Resolution Date |"
  );

  lines.push(
    "|---|---|---|---|---|---|---|---|"
  );

  for (const decision of report.residualRiskDecisions) {
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
      )} | ${escapeMarkdown(
        decision.targetResolutionDate
      )} |`
    );
  }

  lines.push("");

  lines.push(
    "## Step 13 — Evidence & Closure"
  );

  lines.push("");

  for (const action of report.treatmentActions) {
    const evidence =
      report.evidenceRecords[
        action.id
      ];

    lines.push(
      `### ${escapeMarkdown(
        action.riskTitle
      )}`
    );

    lines.push(
      `- Treatment status: ${escapeMarkdown(
        action.status
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
    URL.createObjectURL(blob);

  const anchor =
    document.createElement("a");

  anchor.href = url;
  anchor.download = filename;

  document.body.appendChild(anchor);

  anchor.click();

  anchor.remove();

  setTimeout(
    () =>
      URL.revokeObjectURL(url),
    1000
  );
}

/* ============================================================
   DEPENDENCY-FREE PDF
   ============================================================ */

function pdfEscape(
  value: string
): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrapPdfText(
  value: string,
  width = 92
): string[] {
  const words =
    value.split(/\s+/);

  const lines: string[] = [];

  let current = "";

  for (const word of words) {
    if (
      `${current} ${word}`
        .trim()
        .length > width
    ) {
      if (current) {
        lines.push(current);
      }

      current = word;
    } else {
      current =
        `${current} ${word}`.trim();
    }
  }

  if (current) {
    lines.push(current);
  }

  return lines;
}

function buildPdfPages(
  report: AssessmentReportData
): string[][] {
  const lines: string[] = [];

  const profile =
    report.assessmentProfile;

  const result =
    report.riskResult;

  const overallRisk = text(
    resultValue(
      result,
      "overallRisk"
    )
  );

  const riskScore = text(
    resultValue(
      result,
      "riskScore"
    )
  );

  lines.push(
    "PrivacyMap India Assessment Report"
  );

  lines.push(
    `Organisation: ${text(
      profile.organisationName
    )}`
  );

  lines.push(
    `Assessment: ${text(
      profile.assessmentName
    )}`
  );

  lines.push(
    `Assessment ID: ${text(
      profile.assessmentId
    )}`
  );

  lines.push(
    `Generated: ${report.generatedAt}`
  );

  lines.push("");

  lines.push(
    "EXECUTIVE SUMMARY"
  );

  lines.push(
    `Overall Risk: ${overallRisk}`
  );

  lines.push(
    `Risk Score: ${riskScore}`
  );

  lines.push(
    `Treatment Actions: ${report.treatmentActions.length}`
  );

  lines.push(
    `Residual Risk Decisions: ${report.residualRiskDecisions.length}`
  );

  lines.push("");

  lines.push(
    "STEP 8 - RISK TREATMENT & ACTION PLAN"
  );

  for (const action of report.treatmentActions) {
    const decision =
      findDecisionForAction(
        report,
        action
      );

    const owner =
      treatmentValue(
        action,
        "owner"
      );

    const effort =
      treatmentValue(
        action,
        "effort"
      );

    const recommendedTreatment =
      treatmentValue(
        action,
        "recommendedTreatment"
      );

    lines.push("");

    lines.push(
      `${text(
        action.category
      )} - ${text(
        action.riskTitle
      )}`
    );

    lines.push(
      `Status: ${text(
        action.status
      )}`
    );

    lines.push(
      `Priority: ${text(
        action.priority
      )}`
    );

    lines.push(
      `Owner: ${text(
        owner ||
          decision?.accountableOwner
      )}`
    );

    lines.push(
      `Target Resolution Date: ${text(
        decision?.targetResolutionDate
      )}`
    );

    lines.push(
      `Effort: ${text(
        effort
      )}`
    );

    lines.push(
      `Treatment: ${text(
        recommendedTreatment
      )}`
    );
  }

  lines.push("");

  lines.push(
    "STEP 9 - RESIDUAL RISK ASSESSMENT"
  );

  for (const decision of report.residualRiskDecisions) {
    lines.push("");

    lines.push(
      `${text(
        decision.riskTitle
      )}`
    );

    lines.push(
      `Category: ${text(
        decision.category
      )}`
    );

    lines.push(
      `Inherent Risk: ${text(
        decision.inherentRisk
      )}`
    );

    lines.push(
      `Residual Risk: ${text(
        decision.residualRisk
      )}`
    );

    lines.push(
      `Decision: ${text(
        decision.decision
      )}`
    );
  }

  lines.push("");

  lines.push(
    "STEP 11 - RISK GOVERNANCE & APPROVAL"
  );

  for (const decision of report.residualRiskDecisions) {
    lines.push("");

    lines.push(
      `${text(
        decision.riskTitle
      )}`
    );

    lines.push(
      `Approval Status: ${text(
        decision.approvalStatus
      )}`
    );

    lines.push(
      `Accountable Owner: ${text(
        decision.accountableOwner
      )}`
    );

    lines.push(
      `Decision Authority: ${text(
        decision.decisionAuthority
      )}`
    );

    lines.push(
      `Review Date: ${text(
        decision.reviewDate
      )}`
    );

    lines.push(
      `Approval Date: ${text(
        decision.approvalDate
      )}`
    );

    lines.push(
      `Next Review Date: ${text(
        decision.nextReviewDate
      )}`
    );

    lines.push(
      `Target Resolution Date: ${text(
        decision.targetResolutionDate
      )}`
    );

    lines.push(
      `Treatment Status: ${text(
        decision.treatmentStatus
      )}`
    );

    lines.push(
      `Review Frequency: ${text(
        decision.reviewFrequency
      )}`
    );
  }

  lines.push("");

  lines.push(
    "STEP 13 - EVIDENCE & CLOSURE"
  );

  for (const action of report.treatmentActions) {
    const evidence =
      report.evidenceRecords[
        action.id
      ];

    lines.push("");

    lines.push(
      `${text(
        action.riskTitle
      )}`
    );

    lines.push(
      `Treatment Status: ${text(
        action.status
      )}`
    );

    lines.push(
      `Evidence Reference: ${text(
        evidence?.reference
      )}`
    );

    lines.push(
      `Evidence Owner: ${text(
        evidence?.owner
      )}`
    );

    lines.push(
      `Evidence Verified: ${
        evidence?.verified
          ? "Yes"
          : "No"
      }`
    );

    lines.push(
      `Closure Notes: ${text(
        evidence?.notes
      )}`
    );
  }

  const pages: string[][] = [];

  let page: string[] = [];

  for (const line of lines) {
    const wrapped =
      wrapPdfText(
        line || " "
      );

    for (const wrappedLine of wrapped) {
      if (page.length >= 48) {
        pages.push(page);
        page = [];
      }

      page.push(wrappedLine);
    }
  }

  if (page.length) {
    pages.push(page);
  }

  return pages;
}

/* ============================================================
   CREATE PDF BLOB
   ============================================================ */

export function createPdfBlob(
  report: AssessmentReportData
): Blob {
  const pages =
    buildPdfPages(report);

  const objects: string[] = [];

  const pageObjectIds: number[] = [];

  const contentObjectIds: number[] = [];

  /*
   * Object 1 = Catalog
   * Object 2 = Pages
   * Font object follows page/content objects.
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

  const fontObjectId =
    objects.length + 1;

  objects.push(
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>"
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
    "<< /Type /Catalog /Pages 2 0 R >>";

  for (
    let i = 0;
    i < pages.length;
    i++
  ) {
    const commands: string[] = [];

    commands.push("BT");

    commands.push(
      "/F1 10 Tf"
    );

    commands.push(
      "12 TL"
    );

    commands.push(
      "50 760 Td"
    );

    for (const line of pages[i]) {
      commands.push(
        `(${pdfEscape(
          line
        )}) Tj`
      );

      commands.push("T*");
    }

    commands.push("ET");

    const stream =
      commands.join("\n");

    objects[
      pageObjectIds[i] - 1
    ] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontObjectId} 0 R >> >> /Contents ${contentObjectIds[i]} 0 R >>`;

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

    pdf += `${i + 1} 0 obj\n`;
    pdf += `${objects[i]}\n`;
    pdf += "endobj\n";
  }

  const xrefOffset =
    pdf.length;

  pdf +=
    `xref\n0 ${objects.length + 1}\n`;

  pdf +=
    "0000000000 65535 f \n";

  for (
    let i = 1;
    i <= objects.length;
    i++
  ) {
    pdf += `${String(
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
      type: "application/pdf",
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
    createPdfBlob(report);

  const url =
    URL.createObjectURL(blob);

  const anchor =
    document.createElement("a");

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
