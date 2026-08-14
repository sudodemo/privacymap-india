import type { AssessmentProfile } from "../types";
import type { RiskResult } from "../lib/riskEngine";
import type { RiskTreatmentAction } from "../lib/remediationEngine";
import type { ResidualRiskDecisionRecord } from "../lib/governanceEngine";

/* ============================================================
   STEP 13 EVIDENCE MODEL

   Kept local to the reporting layer so reportExport.ts does not
   depend on EvidenceRecord being exported from types.ts.
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

/**
 * Safely reads a property from an object even when the project's
 * TypeScript interface does not currently declare that property.
 *
 * This is important for RiskTreatmentAction because different
 * architecture versions may expose fields such as:
 *
 * - owner
 * - timeframe
 * - effort
 * - recommendedTreatment
 *
 * at runtime without declaring them on the exported interface.
 */
function safeField(
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

function actionValue(
  action: RiskTreatmentAction,
  key: string
): string {
  return text(
    safeField(action, key)
  );
}

function decisionValue(
  decision: ResidualRiskDecisionRecord | undefined,
  key: string
): string {
  return text(
    safeField(decision, key)
  );
}

function resultValue(
  result: RiskResult | null,
  key: string
): unknown {
  if (!result) {
    return "";
  }

  return safeField(result, key);
}

/* ============================================================
   ESCAPING HELPERS
   ============================================================ */

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

/**
 * PDF uses a basic Helvetica font. Convert unsupported Unicode
 * punctuation to safe ASCII equivalents so the dependency-free
 * PDF remains readable.
 */
function normalizePdfText(
  value: unknown
): string {
  return text(value)
    .replace(/[–—]/g, "-")
    .replace(/[“”]/g, '"')
    .replace(/[‘’]/g, "'")
    .replace(/₹/g, "INR ")
    .replace(/•/g, "-")
    .replace(/→/g, "->")
    .replace(/←/g, "<-")
    .replace(/≥/g, ">=")
    .replace(/≤/g, "<=")
    .replace(/≠/g, "!=")
    .replace(/[^\x09\x0A\x0D\x20-\x7E]/g, "");
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

  for (
    const action of report.treatmentActions
  ) {
    const decision =
      report.residualRiskDecisions.find(
        (d) =>
          decisionValue(d, "riskTitle") ===
            actionValue(action, "riskTitle") &&
          decisionValue(d, "category") ===
            actionValue(action, "category")
      );

    const evidence =
      report.evidenceRecords[
        actionValue(action, "id")
      ];

    rows.push([
      "Risk Treatment",

      actionValue(action, "id"),

      actionValue(action, "category"),

      actionValue(action, "riskTitle"),

      decisionValue(
        decision,
        "inherentRisk"
      ),

      decisionValue(
        decision,
        "residualRisk"
      ),

      decisionValue(
        decision,
        "decision"
      ),

      decisionValue(
        decision,
        "approvalStatus"
      ),

      actionValue(action, "status"),

      actionValue(action, "owner"),

      actionValue(action, "priority"),

      actionValue(action, "timeframe"),

      actionValue(action, "effort"),

      decisionValue(
        decision,
        "reviewDate"
      ),

      evidence?.reference ?? "",

      evidence?.owner ?? "",

      evidence?.verified
        ? "Yes"
        : "No",

      evidence?.notes ?? "",
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

  const findingsValue =
    resultValue(
      result,
      "findings"
    );

  const findingsArray =
    Array.isArray(findingsValue)
      ? findingsValue
      : [];

  const treatmentXml =
    report.treatmentActions
      .map((action) => {
        const decision =
          report.residualRiskDecisions.find(
            (d) =>
              decisionValue(
                d,
                "riskTitle"
              ) ===
                actionValue(
                  action,
                  "riskTitle"
                ) &&
              decisionValue(
                d,
                "category"
              ) ===
                actionValue(
                  action,
                  "category"
                )
          );

        const evidence =
          report.evidenceRecords[
            actionValue(action, "id")
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

        <decision>${escapeXml(
          decisionValue(
            decision,
            "decision"
          )
        )}</decision>

        <approvalStatus>${escapeXml(
          decisionValue(
            decision,
            "approvalStatus"
          )
        )}</approvalStatus>

        <reviewDate>${escapeXml(
          decisionValue(
            decision,
            "reviewDate"
          )
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

        <targetResolutionDate>${escapeXml(
          decisionValue(
            decision,
            "targetResolutionDate"
          )
        )}</targetResolutionDate>

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
            safeField(
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
        const item =
          finding as Record<
            string,
            unknown
          >;

        const title =
          item.title ??
          item.riskTitle ??
          item.name;

        const severity =
          item.severity ??
          item.risk ??
          item.riskLevel;

        const recommendation =
          item.recommendedAction ??
          item.recommendation;

        return `
      <finding>
        <id>${escapeXml(
          item.id
        )}</id>

        <category>${escapeXml(
          item.category
        )}</category>

        <title>${escapeXml(
          title
        )}</title>

        <severity>${escapeXml(
          severity
        )}</severity>

        <description>${escapeXml(
          item.description
        )}</description>

        <recommendedAction>${escapeXml(
          recommendation
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

  const findingsValue =
    resultValue(
      result,
      "findings"
    );

  const findingsArray =
    Array.isArray(findingsValue)
      ? findingsValue
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
    `- Overall Risk: **${escapeMarkdown(
      overallRisk
    )}**`
  );

  lines.push(
    `- Risk Score: **${escapeMarkdown(
      riskScore
    )}**`
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

  /* ----------------------------------------------------------
     STEP 7
     ---------------------------------------------------------- */

  lines.push(
    "## Step 7 — Privacy Risk Findings"
  );

  lines.push("");

  for (
    const finding of findingsArray
  ) {
    const item =
      finding as Record<
        string,
        unknown
      >;

    const title =
      item.title ??
      item.riskTitle ??
      item.name;

    const severity =
      item.severity ??
      item.risk ??
      item.riskLevel;

    const recommendation =
      item.recommendedAction ??
      item.recommendation;

    lines.push(
      `### ${escapeMarkdown(
        title
      )}`
    );

    lines.push(
      `- Category: ${escapeMarkdown(
        item.category
      )}`
    );

    lines.push(
      `- Risk: ${escapeMarkdown(
        severity
      )}`
    );

    lines.push(
      `- Description: ${escapeMarkdown(
        item.description
      )}`
    );

    lines.push(
      `- Recommended action: ${escapeMarkdown(
        recommendation
      )}`
    );

    lines.push("");
  }

  /* ----------------------------------------------------------
     STEP 8
     ---------------------------------------------------------- */

  lines.push(
    "## Step 8 — Risk Treatment & Action Plan"
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

    const treatment =
      actionValue(
        action,
        "recommendedTreatment"
      );

    if (treatment) {
      lines.push(
        "",
        `**Recommended treatment:** ${escapeMarkdown(
          treatment
        )}`,
        ""
      );
    }
  }

  lines.push("");

  /* ----------------------------------------------------------
     STEP 9 / STEP 11 GOVERNANCE
     ---------------------------------------------------------- */

  lines.push(
    "## Step 9 / Step 11 — Residual Risk Governance"
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

  /* ----------------------------------------------------------
     STEP 13
     ---------------------------------------------------------- */

  lines.push(
    "## Step 13 — Evidence & Closure"
  );

  lines.push("");

  for (
    const action of report.treatmentActions
  ) {
    const actionId =
      actionValue(
        action,
        "id"
      );

    const evidence =
      report.evidenceRecords[
        actionId
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
   BROWSER DOWNLOAD — TEXT FORMATS
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

  const blob =
    new Blob(
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
    () => {
      URL.revokeObjectURL(
        url
      );
    },
    1000
  );
}

/* ============================================================
   DEPENDENCY-FREE PDF
   ============================================================ */

function pdfEscape(
  value: string
): string {
  return normalizePdfText(
    value
  )
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function wrapPdfText(
  value: string,
  width = 92
): string[] {
  const normalized =
    normalizePdfText(
      value
    );

  if (!normalized) {
    return [""];
  }

  const words =
    normalized.split(
      /\s+/
    );

  const lines: string[] = [];

  let current = "";

  for (
    const word of words
  ) {
    /*
     * Very long individual words should not break the PDF
     * layout indefinitely.
     */
    if (
      word.length > width
    ) {
      if (current) {
        lines.push(
          current
        );
        current = "";
      }

      for (
        let i = 0;
        i < word.length;
        i += width
      ) {
        lines.push(
          word.slice(
            i,
            i + width
          )
        );
      }

      continue;
    }

    const candidate =
      current
        ? `${current} ${word}`
        : word;

    if (
      candidate.length >
      width
    ) {
      if (current) {
        lines.push(
          current
        );
      }

      current = word;
    } else {
      current =
        candidate;
    }
  }

  if (current) {
    lines.push(
      current
    );
  }

  return lines;
}

/* ============================================================
   PDF REPORT CONTENT
   ============================================================ */

function buildPdfPages(
  report: AssessmentReportData
): string[][] {
  const lines: string[] = [];

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

  const riskScore =
    text(
      resultValue(
        result,
        "riskScore"
      )
    );

  const findingsValue =
    resultValue(
      result,
      "findings"
    );

  const findingsArray =
    Array.isArray(
      findingsValue
    )
      ? findingsValue
      : [];

  /* ----------------------------------------------------------
     COVER / PROFILE
     ---------------------------------------------------------- */

  lines.push(
    "PRIVACYMAP INDIA"
  );

  lines.push(
    "DPDP PRIVACY ASSESSMENT REPORT"
  );

  lines.push("");

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
    `Generated: ${text(
      report.generatedAt
    )}`
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
    `Privacy Risk Findings: ${findingsArray.length}`
  );

  lines.push(
    `Treatment Actions: ${report.treatmentActions.length}`
  );

  lines.push(
    `Residual Risk Decisions: ${report.residualRiskDecisions.length}`
  );

  lines.push("");

  /* ----------------------------------------------------------
     STEP 7
     ---------------------------------------------------------- */

  lines.push(
    "STEP 7 - PRIVACY RISK FINDINGS"
  );

  for (
    const finding of findingsArray
  ) {
    const item =
      finding as Record<
        string,
        unknown
      >;

    const title =
      item.title ??
      item.riskTitle ??
      item.name;

    const category =
      item.category;

    const severity =
      item.severity ??
      item.risk ??
      item.riskLevel;

    const description =
      item.description;

    const recommendation =
      item.recommendedAction ??
      item.recommendation;

    lines.push("");

    lines.push(
      `${text(category)} - ${text(
        title
      )}`
    );

    lines.push(
      `Risk: ${text(
        severity
      )}`
    );

    if (
      description
    ) {
      lines.push(
        `Description: ${text(
          description
        )}`
      );
    }

    if (
      recommendation
    ) {
      lines.push(
        `Recommended action: ${text(
          recommendation
        )}`
      );
    }
  }

  lines.push("");

  /* ----------------------------------------------------------
     STEP 8
     ---------------------------------------------------------- */

  lines.push(
    "STEP 8 - RISK TREATMENT & ACTION PLAN"
  );

  for (
    const action of
    report.treatmentActions
  ) {
    lines.push("");

    lines.push(
      `${actionValue(
        action,
        "category"
      )} - ${actionValue(
        action,
        "riskTitle"
      )}`
    );

    lines.push(
      `Status: ${actionValue(
        action,
        "status"
      )}`
    );

    lines.push(
      `Priority: ${actionValue(
        action,
        "priority"
      )}`
    );

    lines.push(
      `Owner: ${actionValue(
        action,
        "owner"
      )}`
    );

    lines.push(
      `Timeframe: ${actionValue(
        action,
        "timeframe"
      )}`
    );

    lines.push(
      `Effort: ${actionValue(
        action,
        "effort"
      )}`
    );

    const treatment =
      actionValue(
        action,
        "recommendedTreatment"
      );

    if (treatment) {
      lines.push(
        `Treatment: ${treatment}`
      );
    }

    const why =
      actionValue(
        action,
        "whyThisMatters"
      );

    if (why) {
      lines.push(
        `Why this matters: ${why}`
      );
    }

    const evidenceExpected =
      actionValue(
        action,
        "evidenceExpected"
      );

    if (
      evidenceExpected
    ) {
      lines.push(
        `Evidence expected: ${evidenceExpected}`
      );
    }
  }

  lines.push("");

  /* ----------------------------------------------------------
     STEP 9 / STEP 11
     ---------------------------------------------------------- */

  lines.push(
    "STEP 9 / STEP 11 - RESIDUAL RISK GOVERNANCE"
  );

  for (
    const decision of
    report.residualRiskDecisions
  ) {
    lines.push("");

    lines.push(
      `${decisionValue(
        decision,
        "category"
      )} - ${decisionValue(
        decision,
        "riskTitle"
      )}`
    );

    lines.push(
      `Inherent Risk: ${decisionValue(
        decision,
        "inherentRisk"
      )}`
    );

    lines.push(
      `Residual Risk: ${decisionValue(
        decision,
        "residualRisk"
      )}`
    );

    lines.push(
      `Decision: ${decisionValue(
        decision,
        "decision"
      )}`
    );

    lines.push(
      `Approval Status: ${decisionValue(
        decision,
        "approvalStatus"
      )}`
    );

    lines.push(
      `Treatment Status: ${decisionValue(
        decision,
        "treatmentStatus"
      )}`
    );

    lines.push(
      `Accountable Owner: ${decisionValue(
        decision,
        "accountableOwner"
      )}`
    );

    lines.push(
      `Decision Authority: ${decisionValue(
        decision,
        "decisionAuthority"
      )}`
    );

    lines.push(
      `Review Date: ${decisionValue(
        decision,
        "reviewDate"
      )}`
    );

    lines.push(
      `Approval Date: ${decisionValue(
        decision,
        "approvalDate"
      )}`
    );

    lines.push(
      `Next Review Date: ${decisionValue(
        decision,
        "nextReviewDate"
      )}`
    );

    const rationale =
      decisionValue(
        decision,
        "rationale"
      );

    if (rationale) {
      lines.push(
        `Rationale: ${rationale}`
      );
    }

    const escalation =
      Boolean(
        safeField(
          decision,
          "escalationRequired"
        )
      );

    if (escalation) {
      lines.push(
        `Escalation Required: Yes`
      );

      lines.push(
        `Escalation Reason: ${decisionValue(
          decision,
          "escalationReason"
        )}`
      );
    }
  }

  lines.push("");

  /* ----------------------------------------------------------
     STEP 13
     ---------------------------------------------------------- */

  lines.push(
    "STEP 13 - EVIDENCE & CLOSURE"
  );

  for (
    const action of
    report.treatmentActions
  ) {
    const actionId =
      actionValue(
        action,
        "id"
      );

    const evidence =
      report.evidenceRecords[
        actionId
      ];

    lines.push("");

    lines.push(
      `${actionValue(
        action,
        "category"
      )} - ${actionValue(
        action,
        "riskTitle"
      )}`
    );

    lines.push(
      `Treatment Status: ${actionValue(
        action,
        "status"
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

  lines.push("");

  lines.push(
    "REPORT DISCLAIMER"
  );

  lines.push(
    "PrivacyMap India assessment output is a risk-assessment and governance aid. It is not a legal opinion, certification or automatic determination of DPDP compliance."
  );

  /* ----------------------------------------------------------
     PAGINATION
     ---------------------------------------------------------- */

  const pages: string[][] =
    [];

  let page: string[] =
    [];

  /*
   * Approximately 48 text lines per page.
   * Long lines are wrapped before this limit is applied.
   */
  const linesPerPage = 48;

  for (
    const line of lines
  ) {
    const wrapped =
      wrapPdfText(
        line || " "
      );

    for (
      const wrappedLine of
      wrapped
    ) {
      if (
        page.length >=
        linesPerPage
      ) {
        pages.push(
          page
        );

        page = [];
      }

      page.push(
        wrappedLine
      );
    }
  }

  if (
    page.length > 0
  ) {
    pages.push(
      page
    );
  }

  return pages;
}

/* ============================================================
   DEPENDENCY-FREE PDF GENERATOR
   ============================================================ */

export function createPdfBlob(
  report: AssessmentReportData
): Blob {
  const pages =
    buildPdfPages(
      report
    );

  const objects: string[] =
    [];

  const pageObjectIds: number[] =
    [];

  const contentObjectIds: number[] =
    [];

  /*
   * Object 1 = Catalog
   * Object 2 = Pages
   * Then one Page object and one Content object per page.
   * Final object = Helvetica font.
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
    const commands: string[] =
      [];

    commands.push(
      "BT"
    );

    commands.push(
      "/F1 10 Tf"
    );

    commands.push(
      "12 TL"
    );

    commands.push(
      "50 760 Td"
    );

    for (
      const line of pages[i]
    ) {
      commands.push(
        `(${pdfEscape(
          line
        )}) Tj`
      );

      commands.push(
        "T*"
      );
    }

    commands.push(
      "ET"
    );

    const stream =
      commands.join(
        "\n"
      );

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
    `xref\n0 ${objects.length + 1}\n`;

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
    () => {
      URL.revokeObjectURL(
        url
      );
    },
    1000
  );
}
