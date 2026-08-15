import type { AssessmentProfile } from "../types";
import type { RiskResult } from "./riskEngine";
import type { RiskTreatmentAction } from "./remediationEngine";
import type { ResidualRiskDecisionRecord } from "./governanceEngine";
import type { DpdpAssessmentState } from "../components/Step10DPDPMapping";
import type { EvidenceRecords } from "./reportExport";

/* ============================================================
   PHASE B — ASSESSMENT CONTINUITY DATA MODEL

   This module intentionally does NOT perform localStorage writes,
   file downloads, or UI rendering yet. It defines the stable,
   versioned state contract that Phase C will use for autosave/resume
   and Phase D will use for package export/import.
   ============================================================ */

export const ASSESSMENT_PACKAGE_FORMAT = "PrivacyMap Assessment Package" as const;
export const ASSESSMENT_PACKAGE_VERSION = 1 as const;
export const ASSESSMENT_SCHEMA_VERSION = 1 as const;
export const ASSESSMENT_STORAGE_KEY = "privacymap.assessments.v1" as const;

export type ContinuityStep = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13;

export type CustomEntryPoint = {
  id: string;
  name: string;
  collection_method: string;
  custom: boolean;
};

export type CustomField = {
  id: string;
  name: string;
  custom: boolean;
};

/* ============================================================
   ASSESSMENT INPUT STATE
   ============================================================ */

export interface AssessmentInputState {
  industryId: string;
  businessTypeId: string;
  processId: string;

  selectedEntryPoints: string[];
  customEntryPoints: CustomEntryPoint[];

  selectedFields: string[];
  customFields: CustomField[];

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
}

/* ============================================================
   COMPLETE RESTORABLE ASSESSMENT STATE
   ============================================================ */

export interface AssessmentContinuityState {
  assessmentProfile: AssessmentProfile;
  inputs: AssessmentInputState;

  riskResult: RiskResult | null;
  treatmentActions: RiskTreatmentAction[];
  residualRiskDecisions: ResidualRiskDecisionRecord[];

  /** Step 10 — lifted page-owned state. */
  dpdpMappingStates: Record<string, DpdpAssessmentState>;

  /** Step 13 — lifted page-owned state. */
  evidenceRecords: EvidenceRecords;

  /** UI/progress metadata, not assessment content. */
  currentStep: ContinuityStep;
  lastCompletedStep: ContinuityStep;
}

/* ============================================================
   PACKAGE ENVELOPE
   ============================================================ */

export interface AssessmentPackageMetadata {
  format: typeof ASSESSMENT_PACKAGE_FORMAT;
  packageVersion: typeof ASSESSMENT_PACKAGE_VERSION;
  schemaVersion: typeof ASSESSMENT_SCHEMA_VERSION;
  applicationVersion: string;
  assessmentId: string;
  exportedAt: string;
  lastSavedAt: string;
}

export interface AssessmentPackage {
  metadata: AssessmentPackageMetadata;
  assessment: AssessmentContinuityState;
}

/* ============================================================
   LOCAL INDEX MODEL

   Phase C can use this as the localStorage envelope. Keeping the
   index separate from the assessment package makes it possible to
   show a lightweight "Resume" list without duplicating assessment
   payloads in the UI.
   ============================================================ */

export interface SavedAssessmentIndexItem {
  assessmentId: string;
  organisationName: string;
  assessmentName: string;
  lastSavedAt: string;
  currentStep: ContinuityStep;
  lastCompletedStep: ContinuityStep;
}

export interface AssessmentStore {
  schemaVersion: typeof ASSESSMENT_SCHEMA_VERSION;
  assessments: Record<string, AssessmentPackage>;
}

/* ============================================================
   DEFAULTS
   ============================================================ */

export function createEmptyAssessmentInputState(): AssessmentInputState {
  return {
    industryId: "",
    businessTypeId: "",
    processId: "",
    selectedEntryPoints: [],
    customEntryPoints: [],
    selectedFields: [],
    customFields: [],
    collectorRoles: [],
    dataSubjectTypes: [],
    collectionFormats: [],
    storageLocations: [],
    storageEnvironments: [],
    encryptionStatuses: [],
    accessRoles: [],
    sharingStatuses: [],
    retentionPeriods: [],
    deletionMethods: [],
    privacyNotices: [],
    consentStatuses: [],
    parentalConsentStatuses: [],
    crossBorderTransfers: [],
  };
}

export function createEmptyAssessmentStore(): AssessmentStore {
  return {
    schemaVersion: ASSESSMENT_SCHEMA_VERSION,
    assessments: {},
  };
}

/* ============================================================
   SNAPSHOT BUILDER
   ============================================================ */

export interface BuildAssessmentContinuityStateArgs {
  assessmentProfile: AssessmentProfile;
  inputs: AssessmentInputState;
  riskResult: RiskResult | null;
  treatmentActions: RiskTreatmentAction[];
  residualRiskDecisions: ResidualRiskDecisionRecord[];
  dpdpMappingStates: Record<string, DpdpAssessmentState>;
  evidenceRecords: EvidenceRecords;
  currentStep: ContinuityStep;
  lastCompletedStep: ContinuityStep;
}

export function buildAssessmentContinuityState(
  args: BuildAssessmentContinuityStateArgs
): AssessmentContinuityState {
  return {
    assessmentProfile: clone(args.assessmentProfile),
    inputs: clone(args.inputs),
    riskResult: clone(args.riskResult),
    treatmentActions: clone(args.treatmentActions),
    residualRiskDecisions: clone(args.residualRiskDecisions),
    dpdpMappingStates: clone(args.dpdpMappingStates),
    evidenceRecords: clone(args.evidenceRecords),
    currentStep: args.currentStep,
    lastCompletedStep: args.lastCompletedStep,
  };
}

export function buildAssessmentPackage(
  state: AssessmentContinuityState,
  options?: {
    applicationVersion?: string;
    exportedAt?: string;
    lastSavedAt?: string;
  }
): AssessmentPackage {
  const exportedAt = options?.exportedAt ?? nowIso();
  const lastSavedAt = options?.lastSavedAt ?? exportedAt;

  return {
    metadata: {
      format: ASSESSMENT_PACKAGE_FORMAT,
      packageVersion: ASSESSMENT_PACKAGE_VERSION,
      schemaVersion: ASSESSMENT_SCHEMA_VERSION,
      applicationVersion: options?.applicationVersion ?? "unknown",
      assessmentId: state.assessmentProfile.assessmentId,
      exportedAt,
      lastSavedAt,
    },
    assessment: clone(state),
  };
}

/* ============================================================
   SERIALIZATION / VALIDATION
   ============================================================ */

export function serializeAssessmentPackage(pkg: AssessmentPackage): string {
  return JSON.stringify(pkg, null, 2);
}

export function parseAssessmentPackage(raw: string): AssessmentPackage {
  let value: unknown;

  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error("The selected file is not valid JSON and cannot be restored as a PrivacyMap assessment package.");
  }

  return validateAssessmentPackage(value);
}

export function validateAssessmentPackage(value: unknown): AssessmentPackage {
  if (!isRecord(value)) {
    throw new Error("Invalid PrivacyMap assessment package: the package root must be an object.");
  }

  const metadata = value.metadata;
  const assessment = value.assessment;

  if (!isRecord(metadata)) {
    throw new Error("Invalid PrivacyMap assessment package: metadata is missing.");
  }

  if (metadata.format !== ASSESSMENT_PACKAGE_FORMAT) {
    throw new Error("This file is not a PrivacyMap Assessment Package.");
  }

  if (metadata.packageVersion !== ASSESSMENT_PACKAGE_VERSION) {
    throw new Error(
      `Unsupported PrivacyMap package version: ${String(metadata.packageVersion)}. Expected version ${ASSESSMENT_PACKAGE_VERSION}.`
    );
  }

  if (metadata.schemaVersion !== ASSESSMENT_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported PrivacyMap assessment schema version: ${String(metadata.schemaVersion)}. Expected version ${ASSESSMENT_SCHEMA_VERSION}.`
    );
  }

  if (!isRecord(assessment)) {
    throw new Error("Invalid PrivacyMap assessment package: assessment state is missing.");
  }

  validateAssessmentState(assessment);

  return value as unknown as AssessmentPackage;
}

export function validateAssessmentState(value: Record<string, unknown>): void {
  if (!isRecord(value.assessmentProfile)) {
    throw new Error("Invalid assessment package: assessment profile is missing.");
  }

  if (!isRecord(value.inputs)) {
    throw new Error("Invalid assessment package: assessment input state is missing.");
  }

  const profile = value.assessmentProfile;
  if (typeof profile.assessmentId !== "string" || !profile.assessmentId.trim()) {
    throw new Error("Invalid assessment package: assessment ID is missing.");
  }

  const inputs = value.inputs;
  const requiredArrays = [
    "selectedEntryPoints",
    "customEntryPoints",
    "selectedFields",
    "customFields",
    "collectorRoles",
    "dataSubjectTypes",
    "collectionFormats",
    "storageLocations",
    "storageEnvironments",
    "encryptionStatuses",
    "accessRoles",
    "sharingStatuses",
    "retentionPeriods",
    "deletionMethods",
    "privacyNotices",
    "consentStatuses",
    "parentalConsentStatuses",
    "crossBorderTransfers",
  ];

  for (const key of requiredArrays) {
    if (!Array.isArray(inputs[key])) {
      throw new Error(`Invalid assessment package: inputs.${key} must be an array.`);
    }
  }

  if (!Array.isArray(value.treatmentActions)) {
    throw new Error("Invalid assessment package: treatmentActions must be an array.");
  }

  if (!Array.isArray(value.residualRiskDecisions)) {
    throw new Error("Invalid assessment package: residualRiskDecisions must be an array.");
  }

  if (!isRecord(value.dpdpMappingStates)) {
    throw new Error("Invalid assessment package: dpdpMappingStates is missing or invalid.");
  }

  if (!isRecord(value.evidenceRecords)) {
    throw new Error("Invalid assessment package: evidenceRecords is missing or invalid.");
  }

  if (!isContinuityStep(value.currentStep) || !isContinuityStep(value.lastCompletedStep)) {
    throw new Error("Invalid assessment package: progress state is invalid.");
  }
}

/* ============================================================
   CLONE / NORMALIZATION HELPERS
   ============================================================ */

export function clone<T>(value: T): T {
  if (value === undefined) return value;

  if (typeof structuredClone === "function") {
    return structuredClone(value);
  }

  return JSON.parse(JSON.stringify(value)) as T;
}

/* ============================================================
   CREATE NEW ASSESSMENT FROM PREVIOUS

   Important governance rule:
   - Copy assessment context and Step 1–6 inputs.
   - Generate a new assessment identity.
   - Clear generated risk/treatment/governance/mapping/evidence state.
   - Re-run the risk assessment for the new assessment.
   ============================================================ */

export interface CreateNewAssessmentOptions {
  assessmentId: string;
  assessmentDate?: string;
  assessmentVersion?: string;
  assessmentName?: string;
}

export function createNewAssessmentFromPrevious(
  previous: AssessmentContinuityState,
  options: CreateNewAssessmentOptions
): AssessmentContinuityState {
  const nextProfile: AssessmentProfile = {
    ...clone(previous.assessmentProfile),
    assessmentId: options.assessmentId,
    assessmentDate: options.assessmentDate ?? todayIsoDate(),
    assessmentVersion:
      options.assessmentVersion ?? incrementAssessmentVersion(previous.assessmentProfile.assessmentVersion),
    assessmentName:
      options.assessmentName ?? `${previous.assessmentProfile.assessmentName} - New Assessment`,
  };

  return {
    assessmentProfile: nextProfile,
    inputs: clone(previous.inputs),
    riskResult: null,
    treatmentActions: [],
    residualRiskDecisions: [],
    dpdpMappingStates: {},
    evidenceRecords: {},
    currentStep: 6,
    lastCompletedStep: 6,
  };
}

function incrementAssessmentVersion(value: string): string {
  const text = String(value ?? "").trim();
  if (!text) return "1.0";

  const match = text.match(/^(.*?)(\\d+)$/);
  if (!match) return `${text}.1`;

  const prefix = match[1];
  const number = Number(match[2]);
  return `${prefix}${Number.isFinite(number) ? number + 1 : 1}`;
}

/* ============================================================
   PROGRESS HELPERS
   ============================================================ */

export function getLastCompletedStep(state: AssessmentContinuityState): ContinuityStep {
  if (!state.riskResult) return getInputCompletionStep(state.inputs);

  if (!state.treatmentActions.length || state.treatmentActions.some((a) => a.status === "Open")) {
    return 7;
  }

  if (!state.residualRiskDecisions.length) return 8;

  const step9Complete = state.residualRiskDecisions.every(
    (d) =>
      Boolean(String(d.decision ?? "").trim()) &&
      Boolean(String(d.rationale ?? "").trim()) &&
      Boolean(String(d.accountableOwner ?? "").trim()) &&
      Boolean(String(d.reviewDate ?? "").trim()) &&
      d.approvalStatus !== "Pending"
  );

  if (!step9Complete) return 9;

  const step10Complete = Object.keys(state.dpdpMappingStates).length > 0;
  if (!step10Complete) return 9;

  const step11Complete = state.residualRiskDecisions.every(
    (d) =>
      (d.approvalStatus === "Approved" || d.approvalStatus === "Rejected") &&
      Boolean(String(d.accountableOwner ?? "").trim()) &&
      Boolean(String(d.reviewDate ?? "").trim())
  );

  if (!step11Complete) return 10;

  const step12Complete = state.treatmentActions.every(
    (a) => a.status === "Completed" || a.status === "Accepted"
  );

  if (!step12Complete) return 11;

  const step13Complete = state.treatmentActions.every((action) => {
    const evidence = state.evidenceRecords[action.id];
    const decision = state.residualRiskDecisions.find(
      (item) => item.riskTitle === action.riskTitle && item.category === action.category
    );

    return Boolean(evidence?.reference?.trim()) && evidence?.verified === true && decision?.approvalStatus === "Approved";
  });

  return step13Complete ? 13 : 12;
}

function getInputCompletionStep(inputs: AssessmentInputState): ContinuityStep {
  if (!inputs.industryId) return 0;
  if (!inputs.businessTypeId) return 1;
  if (!inputs.processId && inputs.businessTypeId === "EDU-SCH") return 2;
  if (!inputs.selectedEntryPoints.length && !inputs.customEntryPoints.length) return 3;
  if (!inputs.selectedFields.length && !inputs.customFields.length) return 4;
  if (!inputs.dataSubjectTypes.length && !inputs.collectorRoles.length) return 5;
  return 6;
}

export function isContinuityStep(value: unknown): value is ContinuityStep {
  return typeof value === "number" && Number.isInteger(value) && value >= 0 && value <= 13;
}

/* ============================================================
   SAVED-ASSESSMENT INDEX HELPERS
   ============================================================ */

export function toSavedAssessmentIndexItem(
  pkg: AssessmentPackage
): SavedAssessmentIndexItem {
  const profile = pkg.assessment.assessmentProfile;

  return {
    assessmentId: profile.assessmentId,
    organisationName: profile.organisationName,
    assessmentName: profile.assessmentName,
    lastSavedAt: pkg.metadata.lastSavedAt,
    currentStep: pkg.assessment.currentStep,
    lastCompletedStep: pkg.assessment.lastCompletedStep,
  };
}

export function buildAssessmentIndex(
  store: AssessmentStore
): SavedAssessmentIndexItem[] {
  return Object.values(store.assessments)
    .map(toSavedAssessmentIndexItem)
    .sort((a, b) => b.lastSavedAt.localeCompare(a.lastSavedAt));
}

/* ============================================================
   STORAGE-SAFE JSON HELPERS
   ============================================================ */

export function serializeAssessmentStore(store: AssessmentStore): string {
  return JSON.stringify(store, null, 2);
}

export function parseAssessmentStore(raw: string): AssessmentStore {
  let value: unknown;

  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error("PrivacyMap local assessment storage is corrupted or invalid.");
  }

  if (!isRecord(value) || value.schemaVersion !== ASSESSMENT_SCHEMA_VERSION || !isRecord(value.assessments)) {
    throw new Error("Unsupported PrivacyMap local assessment storage schema.");
  }

  return value as unknown as AssessmentStore;
}

/* ============================================================
   DATE HELPERS
   ============================================================ */

export function nowIso(): string {
  return new Date().toISOString();
}

export function todayIsoDate(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

/* ============================================================
   INTERNAL TYPE GUARDS
   ============================================================ */

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
