import type { AssessmentProfile } from "../types";
import { canonicalizeRiskFindings } from "./canonicalFindingEngine";

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
  businessContext: { industryId: string; businessTypeId: string; processId: string };
  dataContext: {
    entryPoints: string[]; customEntryPoints: string[]; fields: string[]; customFields: string[];
    collectorRoles: string[]; dataSubjectTypes: string[]; collectionFormats: string[];
    storageLocations: string[]; storageEnvironments: string[]; encryptionStatuses: string[];
    accessRoles: string[]; sharingStatuses: string[]; retentionPeriods: string[];
    deletionMethods: string[]; privacyNotices: string[]; consentStatuses: string[];
    parentalConsentStatuses: string[]; crossBorderTransfers: string[];
  };
  risk: { overallRisk: string; riskScore: number; findings: ReportFinding[] };
  treatmentActions: ReportTreatment[];
  residualRiskDecisions: ReportDecision[];
}

function safeString(value: unknown): string {
  if (value === null || value === undefined) return "";
  return String(value);
}

function normaliseFinding(finding: any): ReportFinding {
  return {
    id: safeString(finding?.id),
    title: safeString(finding?.title),
    category: safeString(finding?.category),
    level: safeString(finding?.level ?? finding?.severity ?? finding?.riskLevel),
    description: safeString(finding?.description ?? finding?.summary ?? finding?.details),
    recommendation: safeString(finding?.recommendation ?? finding?.recommendedAction ?? finding?.remediation),
  };
}

function normaliseTreatment(action: any): ReportTreatment {
  return {
    id: safeString(action?.id), riskTitle: safeString(action?.riskTitle), category: safeString(action?.category),
    priority: safeString(action?.priority), owner: safeString(action?.owner), timeframe: safeString(action?.timeframe),
    effort: safeString(action?.effort), status: safeString(action?.status),
    recommendedTreatment: safeString(action?.recommendedTreatment ?? action?.recommendation ?? action?.treatment),
  };
}

function normaliseDecision(decision: any): ReportDecision {
  return {
    id: safeString(decision?.id), findingId: safeString(decision?.findingId), riskTitle: safeString(decision?.riskTitle),
    category: safeString(decision?.category), inherentRisk: safeString(decision?.inherentRisk), residualRisk: safeString(decision?.residualRisk),
    decision: safeString(decision?.decision), rationale: safeString(decision?.rationale),
    accountableOwner: safeString(decision?.accountableOwner), decisionAuthority: safeString(decision?.decisionAuthority),
    reviewDate: safeString(decision?.reviewDate), approvalDate: safeString(decision?.approvalDate),
    nextReviewDate: safeString(decision?.nextReviewDate), targetResolutionDate: safeString(decision?.targetResolutionDate),
    approvalStatus: safeString(decision?.approvalStatus), reviewFrequency: safeString(decision?.reviewFrequency),
    escalationRequired: Boolean(decision?.escalationRequired), escalationReason: safeString(decision?.escalationReason),
    treatmentStatus: safeString(decision?.treatmentStatus),
  };
}

export function buildAssessmentReportData({
  profile, industryId, businessTypeId, processId, selectedEntryPoints, customEntryPoints, selectedFields, customFields,
  collectorRoles, dataSubjectTypes, collectionFormats, storageLocations, storageEnvironments, encryptionStatuses,
  accessRoles, sharingStatuses, retentionPeriods, deletionMethods, privacyNotices, consentStatuses,
  parentalConsentStatuses, crossBorderTransfers, riskResult, treatmentActions, residualRiskDecisions,
}: {
  profile: AssessmentProfile; industryId: string; businessTypeId: string; processId: string;
  selectedEntryPoints: string[]; customEntryPoints: { id: string; name: string }[];
  selectedFields: string[]; customFields: { id: string; name: string }[];
  collectorRoles: string[]; dataSubjectTypes: string[]; collectionFormats: string[]; storageLocations: string[];
  storageEnvironments: string[]; encryptionStatuses: string[]; accessRoles: string[]; sharingStatuses: string[];
  retentionPeriods: string[]; deletionMethods: string[]; privacyNotices: string[]; consentStatuses: string[];
  parentalConsentStatuses: string[]; crossBorderTransfers: string[]; riskResult: any; treatmentActions: any[]; residualRiskDecisions: any[];
}): AssessmentReportData {
  const canonical = canonicalizeRiskFindings(riskResult);
  const findings = canonical.findings.map(normaliseFinding);
  const riskScore = typeof riskResult?.riskScore === "number" ? riskResult.riskScore : typeof riskResult?.score === "number" ? riskResult.score : 0;
  const overallRisk = safeString(riskResult?.overallRisk ?? riskResult?.overallLevel ?? riskResult?.riskLevel ?? riskResult?.overall ??
    (findings.length ? findings.reduce((highest: string, finding: ReportFinding) =>
      highest === "Critical" || finding.level === "Critical" ? "Critical" :
      highest === "High" || finding.level === "High" ? "High" :
      highest === "Medium" || finding.level === "Medium" ? "Medium" : finding.level || highest, "Low") : "Not assessed"));

  return {
    profile,
    businessContext: { industryId, businessTypeId, processId },
    dataContext: {
      entryPoints: selectedEntryPoints, customEntryPoints: customEntryPoints.map((item) => item.name),
      fields: selectedFields, customFields: customFields.map((item) => item.name), collectorRoles, dataSubjectTypes,
      collectionFormats, storageLocations, storageEnvironments, encryptionStatuses, accessRoles, sharingStatuses,
      retentionPeriods, deletionMethods, privacyNotices, consentStatuses, parentalConsentStatuses, crossBorderTransfers,
    },
    risk: { overallRisk, riskScore, findings },
    treatmentActions: treatmentActions.map(normaliseTreatment),
    residualRiskDecisions: residualRiskDecisions.map(normaliseDecision),
  };
}

function markdownList(values: string[]): string { return values.length ? values.map((value) => `- ${value}`).join("\n") : "None recorded"; }
function escapeMarkdown(value: string): string { return value.replace(/\|/g, "\\|").replace(/\r?\n/g, " "); }

export function buildMarkdownReport(report: AssessmentReportData): string {
  const critical = report.risk.findings.filter((finding) => finding.level === "Critical").length;
  const high = report.risk.findings.filter((finding) => finding.level === "High").length;
  const medium = report.risk.findings.filter((finding) => finding.level === "Medium").length;
  const low = report.risk.findings.filter((finding) => finding.level === "Low").length;
  const open = report.treatmentActions.filter((action) => action.status === "Open").length;
  const inProgress = report.treatmentActions.filter((action) => action.status === "In Progress").length;
  const completed = report.treatmentActions.filter((action) => action.status === "Completed" || action.status === "Accepted").length;
  const pendingApproval = report.residualRiskDecisions.filter((decision) => decision.approvalStatus === "Pending").length;
  const escalated = report.residualRiskDecisions.filter((decision) => decision.escalationRequired).length;
  const findingsMarkdown = report.risk.findings.length === 0 ? "No findings were generated." : report.risk.findings.map((finding, index) =>
    `### ${index + 1}. ${escapeMarkdown(finding.title)}\n\n**Finding ID:** ${escapeMarkdown(finding.id)}\n\n**Category:** ${escapeMarkdown(finding.category)}\n\n**Risk level:** ${escapeMarkdown(finding.level)}\n\n${finding.description}\n\n**Recommended action:** ${finding.recommendation || "See remediation plan."}`
  ).join("\n\n");
  const treatmentMarkdown = report.treatmentActions.length === 0 ? "No remediation actions generated." : report.treatmentActions.map((action) =>
    `### ${escapeMarkdown(action.riskTitle)}\n\n| Field | Value |\n|---|---|\n| Category | ${escapeMarkdown(action.category)} |\n| Priority | ${escapeMarkdown(action.priority)} |\n| Owner | ${escapeMarkdown(action.owner)} |\n| Timeframe | ${escapeMarkdown(action.timeframe)} |\n| Effort | ${escapeMarkdown(action.effort)} |\n| Status | ${escapeMarkdown(action.status)} |\n\n${action.recommendedTreatment}`
  ).join("\n\n");
  const governanceMarkdown = report.residualRiskDecisions.length === 0 ? "No residual-risk decisions are currently available." : report.residualRiskDecisions.map((decision) =>
    `### ${escapeMarkdown(decision.riskTitle)}\n\n| Field | Value |\n|---|---|\n| Decision ID | ${escapeMarkdown(decision.id)} |\n| Inherent risk | ${escapeMarkdown(decision.inherentRisk)} |\n| Residual risk | ${escapeMarkdown(decision.residualRisk)} |\n| Decision | ${escapeMarkdown(decision.decision)} |\n| Approval | ${escapeMarkdown(decision.approvalStatus)} |\n| Accountable owner | ${escapeMarkdown(decision.accountableOwner)} |\n| Decision authority | ${escapeMarkdown(decision.decisionAuthority)} |\n| Review date | ${escapeMarkdown(decision.reviewDate)} |\n| Treatment status | ${escapeMarkdown(decision.treatmentStatus)} |\n\n**Rationale:** ${decision.rationale || "Not recorded."}`
  ).join("\n\n");

  return `# PrivacyMap India\n# DPDP Privacy Assessment Report\n\n## Assessment Profile\n\n| Field | Value |\n|---|---|\n| Organisation / School | ${escapeMarkdown(report.profile.organisationName)} |\n| Assessment Name | ${escapeMarkdown(report.profile.assessmentName)} |\n| Assessment Owner | ${escapeMarkdown(report.profile.assessmentOwner)} |\n| Assessment ID | ${escapeMarkdown(report.profile.assessmentId)} |\n| Assessment Date | ${escapeMarkdown(report.profile.assessmentDate)} |\n| Assessment Version | ${escapeMarkdown(report.profile.assessmentVersion)} |\n\n\n## Executive Summary\n\n**Overall Risk:** ${report.risk.overallRisk}\n\n**Risk Score:** ${report.risk.riskScore}/100\n\n**Total Findings:** ${report.risk.findings.length}\n\n### Finding Distribution\n\n| Risk level | Count |\n|---|---:|\n| Critical | ${critical} |\n| High | ${high} |\n| Medium | ${medium} |\n| Low | ${low} |\n\n### Remediation Status\n\n| Status | Count |\n|---|---:|\n| Open | ${open} |\n| In Progress | ${inProgress} |\n| Completed / Accepted | ${completed} |\n\n### Governance\n\n| Indicator | Count |\n|---|---:|\n| Pending approval | ${pendingApproval} |\n| Escalation required | ${escalated} |\n\n\n## Business Context\n\n| Field | Value |\n|---|---|\n| Industry ID | ${escapeMarkdown(report.businessContext.industryId)} |\n| Business Type | ${escapeMarkdown(report.businessContext.businessTypeId)} |\n| Processing Type | ${escapeMarkdown(report.businessContext.processId)} |\n\n\n## Data Processing Context\n\n### Data Entry Points\n\n${markdownList([...report.dataContext.entryPoints, ...report.dataContext.customEntryPoints])}\n\n### Personal Data Fields\n\n${markdownList([...report.dataContext.fields, ...report.dataContext.customFields])}\n\n### Data Subjects\n\n${markdownList(report.dataContext.dataSubjectTypes)}\n\n### Collection Formats\n\n${markdownList(report.dataContext.collectionFormats)}\n\n### Storage Locations\n\n${markdownList(report.dataContext.storageLocations)}\n\n### Storage Environments\n\n${markdownList(report.dataContext.storageEnvironments)}\n\n### Encryption Status\n\n${markdownList(report.dataContext.encryptionStatuses)}\n\n### Access Roles\n\n${markdownList(report.dataContext.accessRoles)}\n\n### Sharing Status\n\n${markdownList(report.dataContext.sharingStatuses)}\n\n### Retention\n\n${markdownList(report.dataContext.retentionPeriods)}\n\n### Deletion\n\n${markdownList(report.dataContext.deletionMethods)}\n\n### Privacy Notices\n\n${markdownList(report.dataContext.privacyNotices)}\n\n### Consent / Lawful Basis\n\n${markdownList(report.dataContext.consentStatuses)}\n\n### Children's Data / Parental Consent\n\n${markdownList(report.dataContext.parentalConsentStatuses)}\n\n### Cross-Border Transfers\n\n${markdownList(report.dataContext.crossBorderTransfers)}\n\n\n## Detailed Privacy Risk Findings\n\n${findingsMarkdown}\n\n\n## Remediation Plan\n\n${treatmentMarkdown}\n\n\n## Residual Risk Governance\n\n${governanceMarkdown}\n\n\n## DPDP Assessment Notice\n\nThis report is a risk-assessment and governance aid generated from the information entered into PrivacyMap India.\n\nIt is not a legal opinion, certification, audit opinion or automatic determination of compliance.\n\nThe DPDP control mappings and related references should be reviewed against the applicable official legislation, rules, notifications, amendments and other authoritative sources.\n\n\n## Privacy-by-Design Notice\n\nPrivacyMap India is designed so that assessment responses remain in the user's browser and are used locally to generate assessment results and reports.\n\n**Assessment ID:** ${escapeMarkdown(report.profile.assessmentId)}\n\n**Generated by:** PrivacyMap India\n`;
}

export function buildJsonExport(report: AssessmentReportData): string {
  return JSON.stringify({ schema: "PrivacyMap India Assessment Report", schemaVersion: "1.0", generatedAt: new Date().toISOString(), assessment: report }, null, 2);
}

export function reportFileName(profile: AssessmentProfile, extension: string): string {
  const organisation = profile.organisationName.trim().replace(/[^a-zA-Z0-9]+/g, "-").replace(/^-+|-+$/g, "").toLowerCase() || "privacy-assessment";
  const id = profile.assessmentId.trim().replace(/[^a-zA-Z0-9-]+/g, "");
  return `${organisation}-${id}.${extension}`;
}
