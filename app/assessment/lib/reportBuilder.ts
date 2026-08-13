import type { AssessmentProfile } from "../types";

export interface ReportFinding {
  id: string;
  title: string;
  category: string;
  level: string;
  description: string;
  recommendation: string;
}

export interface ReportTreatment {
  id: string;
  riskTitle: string;
  category: string;
  priority: string;
  owner: string;
  timeframe: string;
  effort: string;
  status: string;
  recommendedTreatment: string;
}

export interface ReportDecision {
  id: string;
  findingId: string;
  riskTitle: string;
  category: string;
  inherentRisk: string;
  residualRisk: string;
  decision: string;
  rationale: string;
  accountableOwner: string;
  decisionAuthority: string;
  reviewDate: string;
  approvalDate: string;
  nextReviewDate: string;
  targetResolutionDate: string;
  approvalStatus: string;
  reviewFrequency: string;
  escalationRequired: boolean;
  escalationReason: string;
  treatmentStatus: string;
}

export interface AssessmentReportData {
  profile: AssessmentProfile;

  businessContext: {
    industryId: string;
    businessTypeId: string;
    processId: string;
  };

  dataContext: {
    entryPoints: string[];
    customEntryPoints: string[];
    fields: string[];
    customFields: string[];
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
  };

  risk: {
    overallRisk: string;
    riskScore: number;
    findings: ReportFinding[];
  };

  treatmentActions: ReportTreatment[];

  residualRiskDecisions: ReportDecision[];
}

function safeString(value: unknown): string {
  if (value === null || value === undefined) {
    return "";
  }

  return String(value);
}

function normaliseFinding(finding: any): ReportFinding {
  return {
    id: safeString(finding?.id),
    title: safeString(finding?.title),
    category: safeString(finding?.category),
    level: safeString(
      finding?.level ??
        finding?.severity ??
        finding?.riskLevel
    ),
    description: safeString(
      finding?.description ??
        finding?.summary ??
        finding?.details
    ),
    recommendation: safeString(
      finding?.recommendation ??
        finding?.recommendedAction ??
        finding?.remediation
    ),
  };
}

function normaliseTreatment(action: any): ReportTreatment {
  return {
    id: safeString(action?.id),
    riskTitle: safeString(action?.riskTitle),
    category: safeString(action?.category),
    priority: safeString(action?.priority),
    owner: safeString(action?.owner),
    timeframe: safeString(action?.timeframe),
    effort: safeString(action?.effort),
    status: safeString(action?.status),
    recommendedTreatment: safeString(
      action?.recommendedTreatment ??
        action?.recommendation ??
        action?.treatment
    ),
  };
}

function normaliseDecision(
  decision: any
): ReportDecision {
  return {
    id: safeString(decision?.id),
    findingId: safeString(decision?.findingId),
    riskTitle: safeString(decision?.riskTitle),
    category: safeString(decision?.category),
    inherentRisk: safeString(decision?.inherentRisk),
    residualRisk: safeString(decision?.residualRisk),
    decision: safeString(decision?.decision),
    rationale: safeString(decision?.rationale),
    accountableOwner: safeString(
      decision?.accountableOwner
    ),
    decisionAuthority: safeString(
      decision?.decisionAuthority
    ),
    reviewDate: safeString(
      decision?.reviewDate
    ),
    approvalDate: safeString(
      decision?.approvalDate
    ),
    nextReviewDate: safeString(
      decision?.nextReviewDate
    ),
    targetResolutionDate: safeString(
      decision?.targetResolutionDate
    ),
    approvalStatus: safeString(
      decision?.approvalStatus
    ),
    reviewFrequency: safeString(
      decision?.reviewFrequency
    ),
    escalationRequired:
      Boolean(decision?.escalationRequired),
    escalationReason: safeString(
      decision?.escalationReason
    ),
    treatmentStatus: safeString(
      decision?.treatmentStatus
    ),
  };
}

export function buildAssessmentReportData({
  profile,
  industryId,
  businessTypeId,
  processId,
  selectedEntryPoints,
  customEntryPoints,
  selectedFields,
  customFields,
  collectorRoles,
  dataSubjectTypes,
  collectionFormats,
  storageLocations,
  storageEnvironments,
  encryptionStatuses,
  accessRoles,
  sharingStatuses,
  retentionPeriods,
  deletionMethods,
  privacyNotices,
  consentStatuses,
  parentalConsentStatuses,
  crossBorderTransfers,
  riskResult,
  treatmentActions,
  residualRiskDecisions,
}: {
  profile: AssessmentProfile;
  industryId: string;
  businessTypeId: string;
  processId: string;

  selectedEntryPoints: string[];
  customEntryPoints: {
    id: string;
    name: string;
  }[];

  selectedFields: string[];
  customFields: {
    id: string;
    name: string;
  }[];

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

  riskResult: any;

  treatmentActions: any[];

  residualRiskDecisions: any[];
}): AssessmentReportData {
  const findings = Array.isArray(
    riskResult?.findings
  )
    ? riskResult.findings.map(normaliseFinding)
    : [];

  const riskScore =
    typeof riskResult?.riskScore === "number"
      ? riskResult.riskScore
      : typeof riskResult?.score === "number"
      ? riskResult.score
      : 0;

  const overallRisk = safeString(
    riskResult?.overallRisk ??
      riskResult?.overallLevel ??
      riskResult?.riskLevel ??
      riskResult?.overall ??
      (findings.length
        ? findings.reduce(
            (highest: string, finding: ReportFinding) =>
              highest === "Critical" ||
              finding.level === "Critical"
                ? "Critical"
                : highest === "High" ||
                  finding.level === "High"
                ? "High"
                : highest === "Medium" ||
                  finding.level === "Medium"
                ? "Medium"
                : finding.level || highest,
            "Low"
          )
        : "Not assessed")
  );

  return {
    profile,

    businessContext: {
      industryId,
      businessTypeId,
      processId,
    },

    dataContext: {
      entryPoints: selectedEntryPoints,
      customEntryPoints:
        customEntryPoints.map(
          (item) => item.name
        ),

      fields: selectedFields,

      customFields:
        customFields.map(
          (item) => item.name
        ),

      collectorRoles,
      dataSubjectTypes,
      collectionFormats,
      storageLocations,
      storageEnvironments,
      encryptionStatuses,
      accessRoles,
      sharingStatuses,
      retentionPeriods,
      deletionMethods,
      privacyNotices,
      consentStatuses,
      parentalConsentStatuses,
      crossBorderTransfers,
    },

    risk: {
      overallRisk,
      riskScore,
      findings,
    },

    treatmentActions:
      treatmentActions.map(
        normaliseTreatment
      ),

    residualRiskDecisions:
      residualRiskDecisions.map(
        normaliseDecision
      ),
  };
}

function markdownList(
  values: string[]
): string {
  if (!values.length) {
    return "None recorded";
  }

  return values
    .map((value) => `- ${value}`)
    .join("\n");
}

function escapeMarkdown(
  value: string
): string {
  return value
    .replace(/\|/g, "\\|")
    .replace(/\r?\n/g, " ");
}

export function buildMarkdownReport(
  report: AssessmentReportData
): string {
  const critical = report.risk.findings.filter(
    (finding) => finding.level === "Critical"
  ).length;

  const high = report.risk.findings.filter(
    (finding) => finding.level === "High"
  ).length;

  const medium = report.risk.findings.filter(
    (finding) => finding.level === "Medium"
  ).length;

  const low = report.risk.findings.filter(
    (finding) => finding.level === "Low"
  ).length;

  const open = report.treatmentActions.filter(
    (action) => action.status === "Open"
  ).length;

  const inProgress =
    report.treatmentActions.filter(
      (action) =>
        action.status === "In Progress"
    ).length;

  const completed =
    report.treatmentActions.filter(
      (action) =>
        action.status === "Completed" ||
        action.status === "Accepted"
    ).length;

  const pendingApproval =
    report.residualRiskDecisions.filter(
      (decision) =>
        decision.approvalStatus === "Pending"
    ).length;

  const escalated =
    report.residualRiskDecisions.filter(
      (decision) =>
        decision.escalationRequired
    ).length;

  const findingsMarkdown =
    report.risk.findings.length === 0
      ? "No findings were generated."
      : report.risk.findings
          .map(
            (finding, index) =>
              `### ${index + 1}. ${escapeMarkdown(
                finding.title
              )}

**Finding ID:** ${escapeMarkdown(
                finding.id
              )}

**Category:** ${escapeMarkdown(
                finding.category
              )}

**Risk level:** ${escapeMarkdown(
                finding.level
              )}

${finding.description}

**Recommended action:** ${
                finding.recommendation ||
                "See remediation plan."
              }`
          )
          .join("\n\n");

  const treatmentMarkdown =
    report.treatmentActions.length === 0
      ? "No remediation actions generated."
      : report.treatmentActions
          .map(
            (action) =>
              `### ${escapeMarkdown(
                action.riskTitle
              )}

| Field | Value |
|---|---|
| Category | ${escapeMarkdown(
                action.category
              )} |
| Priority | ${escapeMarkdown(
                action.priority
              )} |
| Owner | ${escapeMarkdown(
                action.owner
              )} |
| Timeframe | ${escapeMarkdown(
                action.timeframe
              )} |
| Effort | ${escapeMarkdown(
                action.effort
              )} |
| Status | ${escapeMarkdown(
                action.status
              )} |

${action.recommendedTreatment}`
          )
          .join("\n\n");

  const governanceMarkdown =
    report.residualRiskDecisions.length === 0
      ? "No residual-risk decisions are currently available."
      : report.residualRiskDecisions
          .map(
            (decision) =>
              `### ${escapeMarkdown(
                decision.riskTitle
              )}

| Field | Value |
|---|---|
| Decision ID | ${escapeMarkdown(
                decision.id
              )} |
| Inherent risk | ${escapeMarkdown(
                decision.inherentRisk
              )} |
| Residual risk | ${escapeMarkdown(
                decision.residualRisk
              )} |
| Decision | ${escapeMarkdown(
                decision.decision
              )} |
| Approval | ${escapeMarkdown(
                decision.approvalStatus
              )} |
| Accountable owner | ${escapeMarkdown(
                decision.accountableOwner
              )} |
| Decision authority | ${escapeMarkdown(
                decision.decisionAuthority
              )} |
| Review date | ${escapeMarkdown(
                decision.reviewDate
              )} |
| Treatment status | ${escapeMarkdown(
                decision.treatmentStatus
              )} |

**Rationale:** ${
                decision.rationale ||
                "Not recorded."
              }`
          )
          .join("\n\n");

  return `# PrivacyMap India
# DPDP Privacy Assessment Report

## Assessment Profile

| Field | Value |
|---|---|
| Organisation / School | ${escapeMarkdown(
    report.profile.organisationName
  )} |
| Assessment Name | ${escapeMarkdown(
    report.profile.assessmentName
  )} |
| Assessment Owner | ${escapeMarkdown(
    report.profile.assessmentOwner
  )} |
| Assessment ID | ${escapeMarkdown(
    report.profile.assessmentId
  )} |
| Assessment Date | ${escapeMarkdown(
    report.profile.assessmentDate
  )} |
| Assessment Version | ${escapeMarkdown(
    report.profile.assessmentVersion
  )} |


## Executive Summary

**Overall Risk:** ${report.risk.overallRisk}

**Risk Score:** ${report.risk.riskScore}/100

**Total Findings:** ${report.risk.findings.length}

### Finding Distribution

| Risk level | Count |
|---|---:|
| Critical | ${critical} |
| High | ${high} |
| Medium | ${medium} |
| Low | ${low} |

### Remediation Status

| Status | Count |
|---|---:|
| Open | ${open} |
| In Progress | ${inProgress} |
| Completed / Accepted | ${completed} |

### Governance

| Indicator | Count |
|---|---:|
| Pending approval | ${pendingApproval} |
| Escalation required | ${escalated} |


## Business Context

| Field | Value |
|---|---|
| Industry ID | ${escapeMarkdown(
    report.businessContext.industryId
  )} |
| Business Type | ${escapeMarkdown(
    report.businessContext.businessTypeId
  )} |
| Processing Type | ${escapeMarkdown(
    report.businessContext.processId
  )} |


## Data Processing Context

### Data Entry Points

${markdownList(
  [
    ...report.dataContext.entryPoints,
    ...report.dataContext.customEntryPoints,
  ]
)}

### Personal Data Fields

${markdownList(
  [
    ...report.dataContext.fields,
    ...report.dataContext.customFields,
  ]
)}

### Data Subjects

${markdownList(
  report.dataContext.dataSubjectTypes
)}

### Collection Formats

${markdownList(
  report.dataContext.collectionFormats
)}

### Storage Locations

${markdownList(
  report.dataContext.storageLocations
)}

### Storage Environments

${markdownList(
  report.dataContext.storageEnvironments
)}

### Encryption Status

${markdownList(
  report.dataContext.encryptionStatuses
)}

### Access Roles

${markdownList(
  report.dataContext.accessRoles
)}

### Sharing Status

${markdownList(
  report.dataContext.sharingStatuses
)}

### Retention

${markdownList(
  report.dataContext.retentionPeriods
)}

### Deletion

${markdownList(
  report.dataContext.deletionMethods
)}

### Privacy Notices

${markdownList(
  report.dataContext.privacyNotices
)}

### Consent / Lawful Basis

${markdownList(
  report.dataContext.consentStatuses
)}

### Children's Data / Parental Consent

${markdownList(
  report.dataContext.parentalConsentStatuses
)}

### Cross-Border Transfers

${markdownList(
  report.dataContext.crossBorderTransfers
)}


## Detailed Privacy Risk Findings

${findingsMarkdown}


## Remediation Plan

${treatmentMarkdown}


## Residual Risk Governance

${governanceMarkdown}


## DPDP Assessment Notice

This report is a risk-assessment and governance aid generated from the information entered into PrivacyMap India.

It is not a legal opinion, certification, audit opinion or automatic determination of compliance.

The DPDP control mappings and related references should be reviewed against the applicable official legislation, rules, notifications, amendments and other authoritative sources.


## Privacy-by-Design Notice

PrivacyMap India is designed so that assessment responses remain in the user's browser and are used locally to generate assessment results and reports.

**Assessment ID:** ${escapeMarkdown(
    report.profile.assessmentId
  )}

**Generated by:** PrivacyMap India
`;
}

export function buildJsonExport(
  report: AssessmentReportData
): string {
  return JSON.stringify(
    {
      schema: "PrivacyMap India Assessment Report",
      schemaVersion: "1.0",
      generatedAt:
        new Date().toISOString(),
      assessment: report,
    },
    null,
    2
  );
}

export function reportFileName(
  profile: AssessmentProfile,
  extension: string
): string {
  const organisation =
    profile.organisationName
      .trim()
      .replace(/[^a-zA-Z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase() ||
    "privacy-assessment";

  const id =
    profile.assessmentId
      .trim()
      .replace(/[^a-zA-Z0-9-]+/g, "");

  return `${organisation}-${id}.${extension}`;
}
