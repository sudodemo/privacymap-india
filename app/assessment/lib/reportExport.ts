import type { AssessmentProfile } from "../types";
import type { RiskResult } from "../lib/riskEngine";
import type { RiskTreatmentAction } from "../lib/remediationEngine";
import type { ResidualRiskDecisionRecord } from "../lib/governanceEngine";

/* ============================================================
   STEP 13 EVIDENCE MODEL

   Kept locally so the reporting layer does not depend on
   EvidenceRecord being exported from types.ts.
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

function recordValue(
  value: unknown,
  key: string
): unknown {
  if (
    value !== null &&
    typeof value === "object"
  ) {
    return (
      value as Record<string, unknown>
    )[key];
  }

  return undefined;
}

function actionValue(
  action: RiskTreatmentAction,
  key: string
): unknown {
  return recordValue(
    action as unknown,
    key
  );
}

function resultValue(
  result: RiskResult | null,
  key: string
): unknown {
  if (!result) {
    return "";
  }

  return recordValue(
    result as unknown,
    key
  );
}

/*
 * The current remediation model may expose ownership using
 * different field names depending on the architecture version.
 *
 * We therefore resolve the value safely without requiring
 * TypeScript to believe that a particular optional property
 * exists on RiskTreatmentAction.
 */
function getActionOwner(
  action: RiskTreatmentAction
): string {
  return text(
    actionValue(action, "owner") ??
      actionValue(action, "suggestedOwner") ??
      actionValue(action, "responsibleOwner") ??
      actionValue(action, "responsibleFunction") ??
      ""
  );
}

function getRecommendedTreatment(
  action: RiskTreatmentAction
): string {
  return text(
    actionValue(
      action,
      "recommendedTreatment"
    ) ??
      actionValue(
        action,
        "treatment"
      ) ??
      actionValue(
        action,
        "recommendation"
      ) ??
      actionValue(
        action,
        "recommendedAction"
      ) ??
      ""
  );
}

function getEvidenceExpected(
  action: RiskTreatmentAction
): string {
  return text(
    actionValue(
      action,
      "evidenceExpected"
    ) ??
      actionValue(
        action,
        "expectedEvidence"
      ) ??
      ""
  );
}

/* ============================================================
   ESCAPING
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
    "Recommended Treatment",
    "Evidence Expected",
    "Review Date",
    "Approval Date",
    "Next Review Date",
    "Target Resolution Date",
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
        (d) =>
          d.riskTitle ===
            action.riskTitle &&
          d.category ===
            action.category
      );

    const evidence =
      report.evidenceRecords[
        action.id
      ];

    rows.push([
      "Risk Treatment",

      text(action.id),

      text(action.category),

      text(action.riskTitle),

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

      text(action.status),

      getActionOwner(action),

      text(action.priority),

      text(action.timeframe),

      text(action.effort),

      getRecommendedTreatment(
        action
      ),

      getEvidenceExpected(
        action
      ),

      text(
        decision?.reviewDate
      ),

      text(
        decision?.approvalDate
      ),

      text(
        decision?.nextReviewDate
      ),

      text(
        decision?.targetResolutionDate
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

  /*
   * Include residual-risk decisions
   * even when no treatment action can
   * be matched.
   */
  for (
    const decision of
      report.residualRiskDecisions
  ) {
    const matchedAction =
      report.treatmentActions.find(
        (action) =>
          action.riskTitle ===
            decision.riskTitle &&
          action.category ===
            decision.category
      );

    if (matchedAction) {
      continue;
    }

    rows.push([
      "Residual Risk Decision",

      text(decision.id),

      text(decision.category),

      text(decision.riskTitle),

      text(
        decision.inherentRisk
      ),

      text(
        decision.residualRisk
      ),

      text(
        decision.decision
      ),

      text(
        decision.approvalStatus
      ),

      text(
        decision.treatmentStatus
      ),

      text(
        decision.accountableOwner
      ),

      "",

      "",

      "",

      "",

      "",

      text(
        decision.reviewDate
      ),

      text(
        decision.approvalDate
      ),

      text(
        decision.nextReviewDate
      ),

      text(
        decision.targetResolutionDate
      ),

      "",

      text(
        decision.accountableOwner
      ),

      "",

      text(
        decision.rationale
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

  const findingXml =
    findingsArray
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

        <decision>${escapeXml(
          decision.decision
        )}</decision>

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

        <reviewFrequency>${escapeXml(
          decision.reviewFrequency
        )}</reviewFrequency>

        <treatmentStatus>${escapeXml(
          decision.treatmentStatus
        )}</treatmentStatus>

        <escalationRequired>${decision.escalationRequired ? "true" : "false"}</escalationRequired>

        <escalationReason>${escapeXml(
          decision.escalationReason
        )}</escalationReason>
      </decision>`
      )
      .join("");

  const treatmentXml =
    report.treatmentActions
      .map(
        (action) => {
          const decision =
            report.residualRiskDecisions.find(
              (d) =>
                d.riskTitle ===
                  action.riskTitle &&
                d.category ===
                  action.category
            );

          const evidence =
            report.evidenceRecords[
              action.id
            ];

          return `
      <treatment>
        <id>${escapeXml(
          action.id
        )}</id>

        <category>${escapeXml(
          action.category
        )}</category>

        <riskTitle>${escapeXml(
          action.riskTitle
        )}</riskTitle>

        <recommendedTreatment>${escapeXml(
          getRecommendedTreatment(
            action
          )
        )}</recommendedTreatment>

        <status>${escapeXml(
          action.status
        )}</status>

        <priority>${escapeXml(
          action.priority
        )}</priority>

        <owner>${escapeXml(
          getActionOwner(action)
        )}</owner>

        <timeframe>${escapeXml(
          action.timeframe
        )}</timeframe>

        <effort>${escapeXml(
          action.effort
        )}</effort>

        <evidenceExpected>${escapeXml(
          getEvidenceExpected(
            action
          )
        )}</evidenceExpected>

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
     STEP 8
     ---------------------------------------------------------- */

  lines.push(
    "## Step 8 — Risk Treatment & Action Plan"
  );

  lines.push("");

  if (
    report.treatmentActions.length ===
    0
  ) {
    lines.push(
      "No treatment actions recorded."
    );
  }

  for (
    const action of
      report.treatmentActions
  ) {
    lines.push(
      `### ${escapeMarkdown(
        action.riskTitle
      )}`
    );

    lines.push("");

    lines.push(
      `- Category: ${escapeMarkdown(
        action.category
      )}`
    );

    lines.push(
      `- Status: ${escapeMarkdown(
        action.status
      )}`
    );

    lines.push(
      `- Priority: ${escapeMarkdown(
        action.priority
      )}`
    );

    lines.push(
      `- Owner: ${escapeMarkdown(
        getActionOwner(action)
      )}`
    );

    lines.push(
      `- Timeframe: ${escapeMarkdown(
        action.timeframe
      )}`
    );

    lines.push(
      `- Effort: ${escapeMarkdown(
        action.effort
      )}`
    );

    lines.push(
      `- Recommended treatment: ${escapeMarkdown(
        getRecommendedTreatment(
          action
        )
      )}`
    );

    lines.push(
      `- Evidence expected: ${escapeMarkdown(
        getEvidenceExpected(
          action
        )
      )}`
    );

    lines.push("");
  }

  /* ----------------------------------------------------------
     STEP 9 / 11
     ---------------------------------------------------------- */

  lines.push(
    "## Step 9 / Step 11 — Residual Risk Governance"
  );

  lines.push("");

  if (
    report.residualRiskDecisions
      .length === 0
  ) {
    lines.push(
      "No residual-risk decisions recorded."
    );
  }

  for (
    const decision of
      report.residualRiskDecisions
  ) {
    lines.push(
      `### ${escapeMarkdown(
        decision.riskTitle
      )}`
    );

    lines.push("");

    lines.push(
      `- Decision ID: ${escapeMarkdown(
        decision.id
      )}`
    );

    lines.push(
      `- Finding ID: ${escapeMarkdown(
        decision.findingId
      )}`
    );

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
      `- Target Resolution Date: ${escapeMarkdown(
        decision.targetResolutionDate
      )}`
    );

    lines.push(
      `- Review Frequency: ${escapeMarkdown(
        decision.reviewFrequency
      )}`
    );

    lines.push(
      `- Escalation Required: ${
        decision.escalationRequired
          ? "Yes"
          : "No"
      }`
    );

    if (
      decision.escalationReason
    ) {
      lines.push(
        `- Escalation Reason: ${escapeMarkdown(
          decision.escalationReason
        )}`
      );
    }

    lines.push("");

    lines.push(
      `**Decision rationale:** ${escapeMarkdown(
        decision.rationale
      )}`
    );

    lines.push("");
  }

  /* ----------------------------------------------------------
     STEP 13
     ---------------------------------------------------------- */

  lines.push(
    "## Step 13 — Evidence & Closure"
  );

  lines.push("");

  const evidenceEntries =
    Object.entries(
      report.evidenceRecords
    );

  if (
    evidenceEntries.length === 0
  ) {
    lines.push(
      "No evidence records recorded."
    );
  }

  for (
    const [
      actionId,
      evidence,
    ] of evidenceEntries
  ) {
    lines.push(
      `### Evidence — ${escapeMarkdown(
        actionId
      )}`
    );

    lines.push("");

    lines.push(
      `- Reference: ${escapeMarkdown(
        evidence.reference
      )}`
    );

    lines.push(
      `- Owner: ${escapeMarkdown(
        evidence.owner
      )}`
    );

    lines.push(
      `- Verified: ${
        evidence.verified
          ? "Yes"
          : "No"
      }`
    );

    lines.push(
      `- Closure notes: ${escapeMarkdown(
        evidence.notes
      )}`
    );

    lines.push("");
  }

  lines.push("---");

  lines.push("");

  lines.push(
    "PrivacyMap India assessment output is a risk-assessment and governance aid. It is not a legal opinion, certification or automatic determination of DPDP compliance."
  );

  return lines.join(
    "\n"
  );
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
   ============================================================ */

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
    );
}

function wrapPdfText(
  value: string,
  width = 92
): string[] {
  const words =
    value.split(
      /\s+/
    );

  const lines: string[] = [];

  let current = "";

  for (
    const word of words
  ) {
    if (
      `${current} ${word}`
        .trim()
        .length > width
    ) {
      if (current) {
        lines.push(
          current
        );
      }

      current =
        word;
    } else {
      current =
        `${current} ${word}`.trim();
    }
  }

  if (current) {
    lines.push(
      current
    );
  }

  return lines;
}

function buildPdfPages(
  report: AssessmentReportData
): string[][] {
  const rawLines: string[] = [];

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

  rawLines.push(
    "PrivacyMap India Assessment Report"
  );

  rawLines.push(
    `Organisation: ${text(
      profile.organisationName
    )}`
  );

  rawLines.push(
    `Assessment: ${text(
      profile.assessmentName
    )}`
  );

  rawLines.push(
    `Assessment ID: ${text(
      profile.assessmentId
    )}`
  );

  rawLines.push(
    `Generated: ${report.generatedAt}`
  );

  rawLines.push("");

  rawLines.push(
    "EXECUTIVE SUMMARY"
  );

  rawLines.push(
    `Overall Risk: ${overallRisk}`
  );

  rawLines.push(
    `Risk Score: ${riskScore}`
  );

  rawLines.push(
    `Findings: ${
      Array.isArray(
        resultValue(
          result,
          "findings"
        )
      )
        ? (
            resultValue(
              result,
              "findings"
            ) as unknown[]
          ).length
        : 0
    }`
  );

  rawLines.push(
    `Treatment Actions: ${report.treatmentActions.length}`
  );

  rawLines.push(
    `Residual Risk Decisions: ${report.residualRiskDecisions.length}`
  );

  rawLines.push("");

  rawLines.push(
    "STEP 8 - RISK TREATMENT & ACTION PLAN"
  );

  for (
    const action of
      report.treatmentActions
  ) {
    rawLines.push("");

    rawLines.push(
      `${text(
        action.category
      )} - ${text(
        action.riskTitle
      )}`
    );

    rawLines.push(
      `Status: ${text(
        action.status
      )}`
    );

    rawLines.push(
      `Priority: ${text(
        action.priority
      )}`
    );

    rawLines.push(
      `Owner: ${getActionOwner(
        action
      )}`
    );

    rawLines.push(
      `Timeframe: ${text(
        action.timeframe
      )}`
    );

    rawLines.push(
      `Effort: ${text(
        action.effort
      )}`
    );

    rawLines.push(
      `Treatment: ${getRecommendedTreatment(
        action
      )}`
    );
  }

  rawLines.push("");

  rawLines.push(
    "STEP 9 / STEP 11 - RESIDUAL RISK GOVERNANCE"
  );

  for (
    const decision of
      report.residualRiskDecisions
  ) {
    rawLines.push("");

    rawLines.push(
      text(
        decision.riskTitle
      )
    );

    rawLines.push(
      `Category: ${text(
        decision.category
      )}`
    );

    rawLines.push(
      `Inherent Risk: ${text(
        decision.inherentRisk
      )}`
    );

    rawLines.push(
      `Residual Risk: ${text(
        decision.residualRisk
      )}`
    );

    rawLines.push(
      `Decision: ${text(
        decision.decision
      )}`
    );

    rawLines.push(
      `Approval: ${text(
        decision.approvalStatus
      )}`
    );

    rawLines.push(
      `Treatment Status: ${text(
        decision.treatmentStatus
      )}`
    );

    rawLines.push(
      `Accountable Owner: ${text(
        decision.accountableOwner
      )}`
    );

    rawLines.push(
      `Decision Authority: ${text(
        decision.decisionAuthority
      )}`
    );

    rawLines.push(
      `Review Date: ${text(
        decision.reviewDate
      )}`
    );

    rawLines.push(
      `Approval Date: ${text(
        decision.approvalDate
      )}`
    );

    rawLines.push(
      `Next Review Date: ${text(
        decision.nextReviewDate
      )}`
    );

    rawLines.push(
      `Target Resolution Date: ${text(
        decision.targetResolutionDate
      )}`
    );

    rawLines.push(
      `Review Frequency: ${text(
        decision.reviewFrequency
      )}`
    );

    rawLines.push(
      `Escalation Required: ${
        decision.escalationRequired
          ? "Yes"
          : "No"
      }`
    );

    rawLines.push(
      `Decision Rationale: ${text(
        decision.rationale
      )}`
    );
  }

  rawLines.push("");

  rawLines.push(
    "STEP 13 - EVIDENCE & CLOSURE"
  );

  for (
    const [
      actionId,
      evidence,
    ] of Object.entries(
      report.evidenceRecords
    )
  ) {
    rawLines.push("");

    rawLines.push(
      `Evidence - ${actionId}`
    );

    rawLines.push(
      `Reference: ${text(
        evidence.reference
      )}`
    );

    rawLines.push(
      `Owner: ${text(
        evidence.owner
      )}`
    );

    rawLines.push(
      `Verified: ${
        evidence.verified
          ? "Yes"
          : "No"
      }`
    );

    rawLines.push(
      `Notes: ${text(
        evidence.notes
      )}`
    );
  }

  rawLines.push("");

  rawLines.push(
    "PrivacyMap India assessment output is a risk-assessment and governance aid. It is not a legal opinion, certification or automatic determination of DPDP compliance."
  );

  const pages: string[][] = [];

  let page: string[] = [];

  let lineCount = 0;

  const maxLines =
    48;

  for (
    const rawLine of rawLines
  ) {
    const wrapped =
      rawLine
        ? wrapPdfText(
            rawLine,
            92
          )
        : [""];

    for (
      const line of wrapped
    ) {
      if (
        lineCount >=
        maxLines
      ) {
        pages.push(
          page
        );

        page = [];

        lineCount = 0;
      }

      page.push(
        line
      );

      lineCount++;
    }
  }

  if (page.length) {
    pages.push(
      page
    );
  }

  return pages;
}

export function reportToPdfBytes(
  report: AssessmentReportData
): Uint8Array {
  const pages =
    buildPdfPages(
      report
    );

  const objects: string[] = [];

  const pageObjectIds: number[] = [];

  const contentObjectIds: number[] = [];

  let nextObjectId = 3;

  for (
    let i = 0;
    i < pages.length;
    i++
  ) {
    pageObjectIds.push(
      nextObjectId++
    );

    contentObjectIds.push(
      nextObjectId++
    );
  }

  const fontObjectId =
    nextObjectId++;

  objects[1] =
    "<< /Type /Catalog /Pages 2 0 R >>";

  objects[2] =
    `<< /Type /Pages /Kids [${pageObjectIds
      .map(
        (id) =>
          `${id} 0 R`
      )
      .join(
        " "
      )}] /Count ${pages.length} >>`;

  objects[
    fontObjectId
  ] =
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>";

  for (
    let i = 0;
    i < pages.length;
    i++
  ) {
    const pageId =
      pageObjectIds[i];

    const contentId =
      contentObjectIds[i];

    const commands: string[] =
      [];

    commands.push(
      "BT"
    );

    commands.push(
      "/F1 9 Tf"
    );

    commands.push(
      "50 760 Td"
    );

    commands.push(
      "12 TL"
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
      contentId
    ] =
      `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`;

    objects[pageId] =
      `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Resources << /Font << /F1 ${fontObjectId} 0 R >> >> /Contents ${contentId} 0 R >>`;
  }

  let pdf =
    "%PDF-1.4\n";

  const offsets: number[] =
    [];

  for (
    let id = 1;
    id < objects.length;
    id++
  ) {
    if (
      !objects[id]
    ) {
      continue;
    }

    offsets[id] =
      pdf.length;

    pdf += `${id} 0 obj\n`;

    pdf += `${objects[id]}\n`;

    pdf +=
      "endobj\n";
  }

  const xrefOffset =
    pdf.length;

  pdf +=
    `xref\n0 ${objects.length}\n`;

  pdf +=
    "0000000000 65535 f \n";

  for (
    let id = 1;
    id < objects.length;
    id++
  ) {
    const offset =
      offsets[id] ??
      0;

    pdf += `${String(
      offset
    ).padStart(
      10,
      "0"
    )} 00000 n \n`;
  }

  pdf +=
    `trailer\n<< /Size ${objects.length} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new TextEncoder().encode(
    pdf
  );
}

export function downloadPdfFile(
  report: AssessmentReportData,
  filename: string
): void {
  if (
    typeof window ===
    "undefined"
  ) {
    return;
  }

  const bytes =
    reportToPdfBytes(
      report
    );

  const blob =
    new Blob(
      [bytes],
      {
        type: "application/pdf",
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

  setTimeout(
    () =>
      URL.revokeObjectURL(
        url
      ),
    1000
  );
}
