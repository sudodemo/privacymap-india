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
   DEPENDENCY-FREE PDF - PROFESSIONAL REPORT VERSION
   ============================================================

   No jsPDF or other npm dependency is required.

   The PDF is generated directly in the browser using the
   standard PDF 1.4 object structure.

   This version provides:
   - Professional report hierarchy
   - Section headers
   - Record cards
   - Automatic page breaks
   - Page numbers
   - Footer
   - Step 0-13 reporting context
   - Dependency-free browser download
   ============================================================ */

type PdfLine = {
  text: string;
  kind:
    | "title"
    | "subtitle"
    | "section"
    | "heading"
    | "body"
    | "label"
    | "footer";
};

type PdfPage = PdfLine[];

function pdfEscape(value: string): string {
  return value
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

/*
 * PDF standard Type1 Helvetica uses WinAnsi encoding.
 * Replace characters that can cause malformed glyphs.
 */
function pdfSafe(value: unknown): string {
  return text(value)
    .replace(/[^\x20-\x7E]/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

function wrapPdfText(
  value: string,
  width: number
): string[] {
  const safe = pdfSafe(value);

  if (!safe) {
    return [""];
  }

  const words = safe.split(/\s+/);
  const result: string[] = [];

  let current = "";

  for (const word of words) {
    if (!current) {
      current = word;
      continue;
    }

    const candidate = `${current} ${word}`;

    if (candidate.length > width) {
      result.push(current);
      current = word;
    } else {
      current = candidate;
    }
  }

  if (current) {
    result.push(current);
  }

  return result;
}

function addBody(
  page: PdfPage,
  textValue: unknown,
  width = 92
): void {
  const wrapped = wrapPdfText(
    textValue === undefined ||
      textValue === null
      ? ""
      : String(textValue),
    width
  );

  for (const line of wrapped) {
    page.push({
      text: line,
      kind: "body",
    });
  }
}

function addLabelValue(
  page: PdfPage,
  labelValue: string,
  value: unknown
): void {
  page.push({
    text: `${labelValue}: ${pdfSafe(value) || "-"}`,
    kind: "body",
  });
}

function addSection(
  page: PdfPage,
  title: string
): void {
  page.push({
    text: title,
    kind: "section",
  });
}

function addHeading(
  page: PdfPage,
  title: string
): void {
  page.push({
    text: title,
    kind: "heading",
  });
}

function buildPdfContent(
  report: AssessmentReportData
): PdfLine[] {
  const output: PdfLine[] = [];

  const profile =
    report.assessmentProfile;

  const result =
    report.riskResult;

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

  const findings =
    resultValue(
      result,
      "findings"
    );

  const findingsArray =
    Array.isArray(findings)
      ? findings
      : [];

  /*
   * ==========================================================
   * COVER / REPORT IDENTITY
   * ==========================================================
   */

  output.push({
    text:
      "PrivacyMap India",
    kind: "title",
  });

  output.push({
    text:
      "DPDP Privacy Assessment Report",
    kind: "subtitle",
  });

  output.push({
    text: "",
    kind: "body",
  });

  output.push({
    text:
      `Organisation: ${pdfSafe(
        profile.organisationName
      ) || "-"}`,
    kind: "body",
  });

  output.push({
    text:
      `Assessment: ${pdfSafe(
        profile.assessmentName
      ) || "-"}`,
    kind: "body",
  });

  output.push({
    text:
      `Assessment ID: ${pdfSafe(
        profile.assessmentId
      ) || "-"}`,
    kind: "body",
  });

  output.push({
    text:
      `Generated: ${pdfSafe(
        report.generatedAt
      ) || "-"}`,
    kind: "body",
  });

  /*
   * ==========================================================
   * EXECUTIVE SUMMARY
   * ==========================================================
   */

  addSection(
    output,
    "EXECUTIVE SUMMARY"
  );

  addLabelValue(
    output,
    "Overall Risk",
    overallRisk
  );

  addLabelValue(
    output,
    "Risk Score",
    riskScore
  );

  addLabelValue(
    output,
    "Risk Treatment Actions",
    report.treatmentActions.length
  );

  addLabelValue(
    output,
    "Residual Risk Decisions",
    report.residualRiskDecisions.length
  );

  addLabelValue(
    output,
    "Evidence Records",
    Object.keys(
      report.evidenceRecords || {}
    ).length
  );

  /*
   * ==========================================================
   * STEP 0
   * ==========================================================
   */

  addSection(
    output,
    "STEP 0 - ASSESSMENT PROFILE"
  );

  addLabelValue(
    output,
    "Organisation",
    profile.organisationName
  );

  addLabelValue(
    output,
    "Assessment Name",
    profile.assessmentName
  );

  addLabelValue(
    output,
    "Assessment ID",
    profile.assessmentId
  );

  /*
   * ==========================================================
   * STEPS 1-7
   *
   * The architecture stores the assessment context primarily
   * inside riskResult. We therefore expose the available
   * assessment result information without inventing fields
   * that may not exist in the current type model.
   * ==========================================================
   */

  addSection(
    output,
    "ASSESSMENT & RISK FINDINGS"
  );

  if (findingsArray.length === 0) {
    addBody(
      output,
      "No detailed risk findings were returned by the assessment engine."
    );
  } else {
    findingsArray.forEach(
      (finding: unknown, index: number) => {
        const item =
          finding &&
          typeof finding === "object"
            ? (finding as Record<
                string,
                unknown
              >)
            : {};

        addHeading(
          output,
          `Finding ${index + 1}: ${
            pdfSafe(
              item.title ??
                item.riskTitle ??
                item.name ??
                item.id
            ) || "Assessment Finding"
          }`
        );

        addLabelValue(
          output,
          "Category",
          item.category
        );

        addLabelValue(
          output,
          "Finding",
          item.finding ??
            item.description ??
            item.summary
        );

        addLabelValue(
          output,
          "Risk",
          item.risk ??
            item.riskLevel ??
            item.overallRisk
        );

        addLabelValue(
          output,
          "Control / Requirement",
          item.requirement ??
            item.control ??
            item.controlName
        );

        addLabelValue(
          output,
          "Recommended Treatment",
          item.recommendedTreatment ??
            item.treatment
        );
      }
    );
  }

  /*
   * ==========================================================
   * STEP 8
   * ==========================================================
   */

  addSection(
    output,
    "STEP 8 - RISK TREATMENT & ACTION PLAN"
  );

  if (
    report.treatmentActions.length ===
    0
  ) {
    addBody(
      output,
      "No risk treatment actions are currently recorded."
    );
  } else {
    for (
      const action of report.treatmentActions
    ) {
      addHeading(
        output,
        pdfSafe(
          action.riskTitle
        ) || "Risk Treatment Action"
      );

      addLabelValue(
        output,
        "Category",
        action.category
      );

      addLabelValue(
        output,
        "Status",
        action.status
      );

      addLabelValue(
        output,
        "Priority",
        action.priority
      );

      addLabelValue(
        output,
        "Owner",
        action.owner
      );

      addLabelValue(
        output,
        "Treatment",
        action.recommendedTreatment
      );

      addLabelValue(
        output,
        "Timeframe",
        (
          action as unknown as Record<
            string,
            unknown
          >
        ).timeframe
      );

      addLabelValue(
        output,
        "Effort",
        action.effort
      );
    }
  }

  /*
   * ==========================================================
   * STEP 9
   * ==========================================================
   */

  addSection(
    output,
    "STEP 9 - RESIDUAL RISK ASSESSMENT"
  );

  if (
    report.residualRiskDecisions.length ===
    0
  ) {
    addBody(
      output,
      "No residual-risk decisions are currently recorded."
    );
  } else {
    for (
      const decision of
        report.residualRiskDecisions
    ) {
      addHeading(
        output,
        pdfSafe(
          decision.riskTitle
        ) || "Residual Risk Decision"
      );

      addLabelValue(
        output,
        "Finding ID",
        decision.findingId
      );

      addLabelValue(
        output,
        "Category",
        decision.category
      );

      addLabelValue(
        output,
        "Inherent Risk",
        decision.inherentRisk
      );

      addLabelValue(
        output,
        "Residual Risk",
        decision.residualRisk
      );

      addLabelValue(
        output,
        "Decision",
        decision.decision
      );

      addLabelValue(
        output,
        "Treatment Status",
        decision.treatmentStatus
      );

      addLabelValue(
        output,
        "Approval Status",
        decision.approvalStatus
      );

      addLabelValue(
        output,
        "Accountable Owner",
        decision.accountableOwner
      );

      addLabelValue(
        output,
        "Decision Authority",
        decision.decisionAuthority
      );

      addLabelValue(
        output,
        "Review Frequency",
        decision.reviewFrequency
      );

      addLabelValue(
        output,
        "Review Date",
        decision.reviewDate
      );

      addLabelValue(
        output,
        "Approval Date",
        decision.approvalDate
      );

      addLabelValue(
        output,
        "Next Review Date",
        decision.nextReviewDate
      );

      addLabelValue(
        output,
        "Target Resolution Date",
        decision.targetResolutionDate
      );

      addBody(
        output,
        `Decision rationale: ${
          pdfSafe(
            decision.rationale
          ) || "-"
        }`
      );

      if (
        decision.escalationRequired
      ) {
        addBody(
          output,
          `Escalation required: ${
            pdfSafe(
              decision.escalationReason
            ) ||
            "Management review required."
          }`
        );
      }
    }
  }

  /*
   * ==========================================================
   * STEP 10
   * ==========================================================
   */

  addSection(
    output,
    "STEP 10 - DPDP MAPPING & CONTROL CONTEXT"
  );

  if (findingsArray.length === 0) {
    addBody(
      output,
      "No DPDP control mappings are available in the assessment result."
    );
  } else {
    for (
      const finding of findingsArray
    ) {
      const item =
        finding &&
        typeof finding === "object"
          ? (finding as Record<
              string,
              unknown
            >)
          : {};

      const title =
        pdfSafe(
          item.title ??
            item.riskTitle ??
            item.name ??
            item.id
        ) ||
        "DPDP Control Mapping";

      addHeading(
        output,
        title
      );

      addLabelValue(
        output,
        "DPDP Reference",
        item.dpdpReference ??
          item.actReference ??
          item.reference
      );

      addLabelValue(
        output,
        "Requirement",
        item.requirement
      );

      addLabelValue(
        output,
        "Control Status",
        item.status ??
          item.controlStatus
      );

      addLabelValue(
        output,
        "Expected Evidence",
        item.expectedEvidence
      );

      addBody(
        output,
        `Assessment context: ${
          pdfSafe(
            item.assessmentQuestion ??
              item.description
          ) || "-"
        }`
      );
    }
  }

  /*
   * ==========================================================
   * STEP 11
   * ==========================================================
   */

  addSection(
    output,
    "STEP 11 - RISK GOVERNANCE & APPROVAL"
  );

  for (
    const decision of
      report.residualRiskDecisions
  ) {
    addHeading(
      output,
      pdfSafe(
        decision.riskTitle
      ) || "Governance Decision"
    );

    addLabelValue(
      output,
      "Approval Status",
      decision.approvalStatus
    );

    addLabelValue(
      output,
      "Accountable Owner",
      decision.accountableOwner
    );

    addLabelValue(
      output,
      "Decision Authority",
      decision.decisionAuthority
    );

    addLabelValue(
      output,
      "Review Frequency",
      decision.reviewFrequency
    );

    addLabelValue(
      output,
      "Review Date",
      decision.reviewDate
    );

    addLabelValue(
      output,
      "Approval Date",
      decision.approvalDate
    );

    addLabelValue(
      output,
      "Escalation Required",
      decision.escalationRequired
        ? "Yes"
        : "No"
    );
  }

  /*
   * ==========================================================
   * STEP 12
   * ==========================================================
   */

  addSection(
    output,
    "STEP 12 - REMEDIATION TRACKER"
  );

  const openActions =
    report.treatmentActions.filter(
      (a) => a.status === "Open"
    ).length;

  const progressActions =
    report.treatmentActions.filter(
      (a) =>
        a.status === "In Progress"
    ).length;

  const closedActions =
    report.treatmentActions.filter(
      (a) =>
        a.status === "Completed" ||
        a.status === "Accepted"
    ).length;

  addLabelValue(
    output,
    "Open",
    openActions
  );

  addLabelValue(
    output,
    "In Progress",
    progressActions
  );

  addLabelValue(
    output,
    "Completed / Accepted",
    closedActions
  );

  for (
    const action of
      report.treatmentActions
  ) {
    addHeading(
      output,
      pdfSafe(
        action.riskTitle
      ) || "Remediation Action"
    );

    addLabelValue(
      output,
      "Category",
      action.category
    );

    addLabelValue(
      output,
      "Status",
      action.status
    );

    addLabelValue(
      output,
      "Priority",
      action.priority
    );

    addLabelValue(
      output,
      "Owner",
      action.owner
    );
  }

  /*
   * ==========================================================
   * STEP 13
   * ==========================================================
   */

  addSection(
    output,
    "STEP 13 - EVIDENCE & CLOSURE"
  );

  let evidenceVerified = 0;

  for (
    const action of
      report.treatmentActions
  ) {
    const evidence =
      report.evidenceRecords[
        action.id
      ];

    if (evidence?.verified) {
      evidenceVerified++;
    }

    addHeading(
      output,
      pdfSafe(
        action.riskTitle
      ) || "Evidence Record"
    );

    addLabelValue(
      output,
      "Treatment Status",
      action.status
    );

    addLabelValue(
      output,
      "Evidence Reference",
      evidence?.reference
    );

    addLabelValue(
      output,
      "Evidence Owner",
      evidence?.owner
    );

    addLabelValue(
      output,
      "Evidence Verified",
      evidence?.verified
        ? "Yes"
        : "No"
    );

    addBody(
      output,
      `Closure Notes: ${
        pdfSafe(
          evidence?.notes
        ) || "-"
      }`
    );
  }

  addLabelValue(
    output,
    "Evidence Records Verified",
    evidenceVerified
  );

  /*
   * ==========================================================
   * DISCLAIMER
   * ==========================================================
   */

  output.push({
    text: "",
    kind: "body",
  });

  addSection(
    output,
    "IMPORTANT NOTICE"
  );

  addBody(
    output,
    "PrivacyMap India assessment output is a risk-assessment and governance aid. It is not a legal opinion, certification, or automatic determination of DPDP compliance."
  );

  addBody(
    output,
    "The official Digital Personal Data Protection Act, notified Rules, amendments, notifications, and other applicable regulatory guidance remain the source of truth."
  );

  return output;
}

/*
 * ============================================================
 * PDF PAGINATION
 * ============================================================
 */

function paginatePdf(
  lines: PdfLine[],
  maxLines = 43
): PdfPage[] {
  const pages: PdfPage[] = [];

  let page: PdfPage = [];

  for (const item of lines) {
    const width =
      item.kind === "title"
        ? 70
        : item.kind === "section"
        ? 82
        : 94;

    const wrapped =
      wrapPdfText(
        item.text,
        width
      );

    /*
     * Section headings should never be stranded
     * at the bottom of a page.
     */
    const required =
      item.kind === "section"
        ? wrapped.length + 1
        : wrapped.length;

    if (
      page.length > 0 &&
      page.length + required >
        maxLines
    ) {
      pages.push(page);
      page = [];
    }

    for (let i = 0; i < wrapped.length; i++) {
      page.push({
        text: wrapped[i],
        kind:
          i === 0
            ? item.kind
            : "body",
      });

      if (
        page.length >=
        maxLines
      ) {
        pages.push(page);
        page = [];
      }
    }
  }

  if (page.length > 0) {
    pages.push(page);
  }

  return pages;
}

/*
 * ============================================================
 * PDF CONTENT STREAM HELPERS
 * ============================================================
 */

function pdfNumber(
  value: number
): string {
  return Number(
    value.toFixed(2)
  ).toString();
}

function pdfRgb(
  r: number,
  g: number,
  b: number
): string {
  return `${pdfNumber(
    r
  )} ${pdfNumber(
    g
  )} ${pdfNumber(
    b
  )}`;
}

function drawPdfText(
  commands: string[],
  textValue: string,
  x: number,
  y: number,
  size: number,
  font = "F1",
  color = [0.12, 0.16, 0.22]
): void {
  commands.push(
    `${pdfRgb(
      color[0],
      color[1],
      color[2]
    )} rg`
  );

  commands.push(
    "BT"
  );

  commands.push(
    `/${font} ${pdfNumber(
      size
    )} Tf`
  );

  commands.push(
    `1 0 0 1 ${pdfNumber(
      x
    )} ${pdfNumber(
      y
    )} Tm`
  );

  commands.push(
    `(${pdfEscape(
      textValue
    )}) Tj`
  );

  commands.push(
    "ET"
  );
}

function drawPdfRect(
  commands: string[],
  x: number,
  y: number,
  width: number,
  height: number,
  fill: number[],
  stroke?: number[]
): void {
  commands.push(
    `${pdfRgb(
      fill[0],
      fill[1],
      fill[2]
    )} rg`
  );

  commands.push(
    `${pdfNumber(
      x
    )} ${pdfNumber(
      y
    )} ${pdfNumber(
      width
    )} ${pdfNumber(
      height
    )} re`
  );

  commands.push(
    "f"
  );

  if (stroke) {
    commands.push(
      `${pdfRgb(
        stroke[0],
        stroke[1],
        stroke[2]
      )} RG`
    );

    commands.push(
      `${pdfNumber(
        x
      )} ${pdfNumber(
        y
      )} ${pdfNumber(
        width
      )} ${pdfNumber(
        height
      )} re`
    );

    commands.push(
      "S"
    );
  }
}

/*
 * ============================================================
 * CREATE PDF BLOB
 * ============================================================
 */

export function createPdfBlob(
  report: AssessmentReportData
): Blob {
  const content =
    buildPdfContent(report);

  const pages =
    paginatePdf(content);

  const objects: string[] =
    [];

  const pageObjectIds: number[] =
    [];

  const contentObjectIds: number[] =
    [];

  /*
   * PDF object 1 = Catalog
   * PDF object 2 = Pages
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

  /*
   * Regular + bold Helvetica.
   */

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

  /*
   * ==========================================================
   * PAGE RENDERING
   * ==========================================================
   */

  for (
    let pageIndex = 0;
    pageIndex < pages.length;
    pageIndex++
  ) {
    const commands: string[] =
      [];

    /*
     * Page background.
     */

    drawPdfRect(
      commands,
      0,
      0,
      612,
      792,
      [1, 1, 1]
    );

    /*
     * Top brand bar.
     */

    drawPdfRect(
      commands,
      0,
      742,
      612,
      50,
      [0.08, 0.25, 0.55]
    );

    drawPdfText(
      commands,
      "PrivacyMap India",
      42,
      764,
      16,
      "F2",
      [1, 1, 1]
    );

    drawPdfText(
      commands,
      "DPDP Privacy Assessment",
      42,
      748,
      8.5,
      "F1",
      [0.88, 0.93, 1]
    );

    /*
     * Main content area.
     */

    let y = 714;

    for (
      const item of pages[
        pageIndex
      ]
    ) {
      if (
        item.kind === "title"
      ) {
        drawPdfText(
          commands,
          item.text,
          42,
          y,
          20,
          "F2",
          [0.06, 0.12, 0.22]
        );

        y -= 28;
        continue;
      }

      if (
        item.kind ===
        "subtitle"
      ) {
        drawPdfText(
          commands,
          item.text,
          42,
          y,
          12,
          "F1",
          [0.29, 0.36, 0.45]
        );

        y -= 22;
        continue;
      }

      if (
        item.kind ===
        "section"
      ) {
        y -= 8;

        drawPdfRect(
          commands,
          38,
          y - 8,
          536,
          24,
          [0.93, 0.96, 1]
        );

        drawPdfText(
          commands,
          item.text,
          48,
          y,
          10,
          "F2",
          [0.08, 0.25, 0.55]
        );

        y -= 32;
        continue;
      }

      if (
        item.kind ===
        "heading"
      ) {
        y -= 5;

        drawPdfText(
          commands,
          item.text,
          48,
          y,
          10,
          "F2",
          [0.08, 0.12, 0.20]
        );

        y -= 17;
        continue;
      }

      if (
        item.kind ===
        "body"
      ) {
        drawPdfText(
          commands,
          item.text,
          48,
          y,
          8.7,
          "F1",
          [0.22, 0.27, 0.34]
        );

        y -= 14;
        continue;
      }

      y -= 14;
    }

    /*
     * Footer separator.
     */

    commands.push(
      "0.85 0.88 0.92 RG"
    );

    commands.push(
      "0.7 w"
    );

    commands.push(
      "42 40 m 570 40 l S"
    );

    drawPdfText(
      commands,
      "PrivacyMap India - DPDP Privacy Assessment",
      42,
      25,
      7.5,
      "F1",
      [0.40, 0.45, 0.52]
    );

    drawPdfText(
      commands,
      `Page ${
        pageIndex + 1
      } of ${pages.length}`,
      505,
      25,
      7.5,
      "F1",
      [0.40, 0.45, 0.52]
    );

    const stream =
      commands.join(
        "\n"
      );

    objects[
      pageObjectIds[
        pageIndex
      ] - 1
    ] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${regularFontObjectId} 0 R /F2 ${boldFontObjectId} 0 R >> >> /Contents ${contentObjectIds[pageIndex]} 0 R >>`;

    objects[
      contentObjectIds[
        pageIndex
      ] - 1
    ] =
      `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;
  }

  /*
   * ==========================================================
   * PDF FILE STRUCTURE
   * ==========================================================
   */

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

  /*
   * IMPORTANT:
   *
   * Text PDFs generated this way must be encoded as bytes.
   * Blob([pdf]) is sufficient for the ASCII/WinAnsi-safe content
   * produced above.
   */

  return new Blob(
    [pdf],
    {
      type:
        "application/pdf",
    }
  );
}

/*
 * ============================================================
 * PDF DOWNLOAD
 * ============================================================
 */

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
    1000
  );
}
