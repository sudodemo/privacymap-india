import type { AssessmentProfile } from "../types";
import type { RiskResult } from "./riskEngine";
import type { RiskTreatmentAction } from "./remediationEngine";
import type { ResidualRiskDecisionRecord } from "./governanceEngine";
import type { DpdpAssessmentState } from "../components/Step10DPDPMapping";
import type { EvidenceRecords } from "./reportExport";
import {
  validateImportedValue,
  validateAssessmentInputStateSecurity,
  validateAssessmentProfileSecurity,
  validateIdentifier,
  validateIsoTimestamp,
  validateText,
} from "./security";

/* ============================================================
   PHASE B/C/D/E2 — VERSIONED ASSESSMENT CONTINUITY DATA MODEL
   ============================================================ */

export const ASSESSMENT_PACKAGE_FORMAT = "PrivacyMap Assessment Package" as const;
export const ASSESSMENT_PACKAGE_VERSION = 1 as const;
export const ASSESSMENT_SCHEMA_VERSION = 1 as const;
export const ASSESSMENT_STORAGE_KEY = "privacymap.assessments.v1" as const;
export const MAX_LOCAL_STORE_BYTES = 25_000_000;

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

export interface AssessmentContinuityState {
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

/**
 * E2 state boundary. This function is intentionally called before cloning
 * state so malformed/tampered state cannot be normalised into an apparently
 * valid state by structuredClone/JSON serialisation.
 */
export function validateAssessmentContinuityState(
  state: unknown,
  path = "assessment"
): asserts state is AssessmentContinuityState {
  if (!isRecord(state)) {
    throw new Error(`Invalid ${path}: state must be an object.`);
  }

  const requiredKeys = [
    "assessmentProfile",
    "inputs",
    "riskResult",
    "treatmentActions",
    "residualRiskDecisions",
    "dpdpMappingStates",
    "evidenceRecords",
    "currentStep",
    "lastCompletedStep",
  ];

  for (const key of requiredKeys) {
    if (!(key in state)) {
      throw new Error(`Invalid ${path}: missing ${key}.`);
    }
  }

  if (!isRecord(state.assessmentProfile)) {
    throw new Error(`Invalid ${path}: assessment profile is missing.`);
  }
  validateAssessmentProfileSecurity(state.assessmentProfile);

  validateAssessmentInputStateSecurity(state.inputs);

  if (state.riskResult !== null && !isRecord(state.riskResult)) {
    throw new Error(`Invalid ${path}: risk result is malformed.`);
  }

  if (!Array.isArray(state.treatmentActions)) {
    throw new Error(`Invalid ${path}: treatment actions must be an array.`);
  }
  if (state.treatmentActions.length > 1000) {
    throw new Error(`Invalid ${path}: too many treatment actions.`);
  }
  validateTreatmentActions(state.treatmentActions, path);

  if (!Array.isArray(state.residualRiskDecisions)) {
    throw new Error(`Invalid ${path}: residual-risk decisions must be an array.`);
  }
  if (state.residualRiskDecisions.length > 1000) {
    throw new Error(`Invalid ${path}: too many residual-risk decisions.`);
  }
  validateResidualRiskDecisions(state.residualRiskDecisions, path);

  validateRecordMap(state.dpdpMappingStates, `${path}.dpdpMappingStates`, 1000);
  validateRecordMap(state.evidenceRecords, `${path}.evidenceRecords`, 1000);
  validateEvidenceRecords(state.evidenceRecords, path);

  if (!isContinuityStep(state.currentStep) || !isContinuityStep(state.lastCompletedStep)) {
    throw new Error(`Invalid ${path}: progress state is invalid.`);
  }

  if (state.lastCompletedStep > state.currentStep) {
    throw new Error(
      `Invalid ${path}: lastCompletedStep cannot be greater than currentStep.`
    );
  }
}

function validateTreatmentActions(actions: unknown[], path: string): void {
  for (const [index, action] of actions.entries()) {
    if (!isRecord(action)) {
      throw new Error(`Invalid ${path}.treatmentActions[${index}].`);
    }

    validateIdentifier(action.id, `Treatment action ${index} ID`);

    for (const field of ["riskTitle", "category", "status", "priority"]) {
      if (action[field] !== undefined) {
        validateText(action[field], {
          fieldName: `Treatment action ${index}.${field}`,
          maxLength: 300,
          rejectMarkup: true,
        });
      }
    }
  }
}

function validateResidualRiskDecisions(
  decisions: unknown[],
  path: string
): void {
  for (const [index, decision] of decisions.entries()) {
    if (!isRecord(decision)) {
      throw new Error(`Invalid ${path}.residualRiskDecisions[${index}].`);
    }

    validateIdentifier(decision.id, `Residual decision ${index} ID`);
    validateIdentifier(decision.findingId, `Residual decision ${index} finding ID`);

    for (const field of [
      "riskTitle",
      "category",
      "decision",
      "rationale",
      "accountableOwner",
      "decisionAuthority",
      "reviewDate",
      "approvalDate",
      "nextReviewDate",
      "targetResolutionDate",
      "approvalStatus",
      "reviewFrequency",
      "treatmentStatus",
      "escalationReason",
    ]) {
      if (decision[field] !== undefined && typeof decision[field] === "string") {
        validateText(decision[field], {
          fieldName: `Residual decision ${index}.${field}`,
          maxLength:
            field === "rationale" || field === "escalationReason"
              ? 5000
              : 300,
          allowNewlines:
            field === "rationale" || field === "escalationReason",
          rejectMarkup: true,
        });
      }
    }
  }
}

function validateRecordMap(
  value: unknown,
  path: string,
  maxRecords: number
): asserts value is Record<string, unknown> {
  if (!isRecord(value)) {
    throw new Error(`Invalid ${path}: expected an object.`);
  }

  const keys = Object.keys(value);
  if (keys.length > maxRecords) {
    throw new Error(`Invalid ${path}: too many records.`);
  }

  for (const key of keys) {
    validateIdentifier(key, `${path} key`);
    if (!isRecord(value[key])) {
      throw new Error(`Invalid ${path}.${key}: expected an object.`);
    }
  }
}

function validateEvidenceRecords(
  value: Record<string, unknown>,
  path: string
): void {
  for (const [id, raw] of Object.entries(value)) {
    const record = raw as Record<string, unknown>;

    validateText(record.reference, {
      fieldName: `${path}.evidenceRecords.${id}.reference`,
      maxLength: 1000,
      allowNewlines: true,
      rejectMarkup: true,
    });
    validateText(record.owner, {
      fieldName: `${path}.evidenceRecords.${id}.owner`,
      maxLength: 150,
      rejectMarkup: true,
    });
    validateText(record.notes, {
      fieldName: `${path}.evidenceRecords.${id}.notes`,
      maxLength: 5000,
      allowNewlines: true,
      rejectMarkup: true,
    });

    if (typeof record.verified !== "boolean") {
      throw new Error(
        `Invalid ${path}.evidenceRecords.${id}.verified: expected boolean.`
      );
    }
  }
}

export function buildAssessmentContinuityState(
  args: BuildAssessmentContinuityStateArgs
): AssessmentContinuityState {
  const candidate: AssessmentContinuityState = {
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

  validateAssessmentContinuityState(candidate);
  return candidate;
}

export function buildAssessmentPackage(
  state: AssessmentContinuityState,
  options?: {
    applicationVersion?: string;
    exportedAt?: string;
    lastSavedAt?: string;
  }
): AssessmentPackage {
  validateAssessmentContinuityState(state);

  const exportedAt = options?.exportedAt ?? nowIso();
  const lastSavedAt = options?.lastSavedAt ?? exportedAt;

  validateIsoTimestamp(exportedAt, "Package exportedAt");
  validateIsoTimestamp(lastSavedAt, "Package lastSavedAt");

  const pkg: AssessmentPackage = {
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

  validateAssessmentPackage(pkg);
  return pkg;
}

export function serializeAssessmentPackage(pkg: AssessmentPackage): string {
  validateAssessmentPackage(pkg);
  return JSON.stringify(pkg, null, 2);
}

export function parseAssessmentPackage(raw: string): AssessmentPackage {
  if (raw.length > 5_000_000) {
    throw new Error(
      "The selected assessment package is too large to import safely."
    );
  }

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error(
      "The selected file is not valid JSON and cannot be restored as a PrivacyMap assessment package."
    );
  }

  return validateAssessmentPackage(value);
}

export function validateAssessmentPackage(
  value: unknown
): AssessmentPackage {
  if (!isRecord(value)) {
    throw new Error(
      "Invalid PrivacyMap assessment package: the package root must be an object."
    );
  }

  if (!isRecord(value.metadata)) {
    throw new Error(
      "Invalid PrivacyMap assessment package: metadata is missing."
    );
  }
  if (!isRecord(value.assessment)) {
    throw new Error(
      "Invalid PrivacyMap assessment package: assessment state is missing."
    );
  }

  const metadata = value.metadata;

  if (metadata.format !== ASSESSMENT_PACKAGE_FORMAT) {
    throw new Error("This file is not a PrivacyMap Assessment Package.");
  }
  if (metadata.packageVersion !== ASSESSMENT_PACKAGE_VERSION) {
    throw new Error(
      `Unsupported PrivacyMap package version: ${String(
        metadata.packageVersion
      )}. Expected version ${ASSESSMENT_PACKAGE_VERSION}.`
    );
  }
  if (metadata.schemaVersion !== ASSESSMENT_SCHEMA_VERSION) {
    throw new Error(
      `Unsupported PrivacyMap assessment schema version: ${String(
        metadata.schemaVersion
      )}. Expected version ${ASSESSMENT_SCHEMA_VERSION}.`
    );
  }

  validateIdentifier(metadata.assessmentId, "Package assessment ID");
  validateText(metadata.applicationVersion, {
    fieldName: "Package application version",
    maxLength: 100,
    rejectMarkup: true,
  });
  validateIsoTimestamp(metadata.exportedAt, "Package exportedAt");
  validateIsoTimestamp(metadata.lastSavedAt, "Package lastSavedAt");

  /* Security boundary: validate every untrusted package value. */
  validateImportedValue(value, "package");
  validateAssessmentContinuityState(value.assessment, "package.assessment");

  const assessment = value.assessment;
  if (assessment.assessmentProfile.assessmentId !== metadata.assessmentId) {
    throw new Error(
      "Invalid PrivacyMap assessment package: metadata assessment ID does not match the assessment state."
    );
  }

  return value as unknown as AssessmentPackage;
}

export function validateAssessmentState(value: Record<string, unknown>): void {
  validateAssessmentContinuityState(value, "assessment");
}

export function clone<T>(value: T): T {
  if (value === undefined) return value;
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value)) as T;
}

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
  validateAssessmentContinuityState(previous, "previous assessment");
  validateIdentifier(options.assessmentId, "New Assessment ID");

  const nextProfile: AssessmentProfile = {
    ...clone(previous.assessmentProfile),
    assessmentId: options.assessmentId,
    assessmentDate: options.assessmentDate ?? todayIsoDate(),
    assessmentVersion:
      options.assessmentVersion ??
      incrementAssessmentVersion(previous.assessmentProfile.assessmentVersion),
    assessmentName:
      options.assessmentName ??
      `${previous.assessmentProfile.assessmentName} - New Assessment`,
  };

  validateAssessmentProfileSecurity(nextProfile);

  const next: AssessmentContinuityState = {
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

  validateAssessmentContinuityState(next, "new assessment");
  return next;
}

function incrementAssessmentVersion(value: string): string {
  const text = String(value ?? "").trim();
  if (!text) return "1.0";
  const match = text.match(/^(.*?)(\d+)$/);
  if (!match) return `${text}.1`;
  const number = Number(match[2]);
  return `${match[1]}${Number.isFinite(number) ? number + 1 : 1}`;
}

export function getLastCompletedStep(
  state: AssessmentContinuityState
): ContinuityStep {
  validateAssessmentContinuityState(state);

  if (!state.riskResult) return getInputCompletionStep(state.inputs);
  if (
    !state.treatmentActions.length ||
    state.treatmentActions.some((a) => a.status === "Open")
  ) {
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
  if (Object.keys(state.dpdpMappingStates).length === 0) return 9;

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
      (item) =>
        item.riskTitle === action.riskTitle &&
        item.category === action.category
    );
    return (
      Boolean(evidence?.reference?.trim()) &&
      evidence?.verified === true &&
      decision?.approvalStatus === "Approved"
    );
  });

  return step13Complete ? 13 : 12;
}

function getInputCompletionStep(
  inputs: AssessmentInputState
): ContinuityStep {
  if (!inputs.industryId) return 0;
  if (!inputs.businessTypeId) return 1;
  if (!inputs.processId && inputs.businessTypeId === "EDU-SCH") return 2;
  if (!inputs.selectedEntryPoints.length && !inputs.customEntryPoints.length) return 3;
  if (!inputs.selectedFields.length && !inputs.customFields.length) return 4;
  if (!inputs.dataSubjectTypes.length && !inputs.collectorRoles.length) return 5;
  return 6;
}

export function isContinuityStep(
  value: unknown
): value is ContinuityStep {
  return (
    typeof value === "number" &&
    Number.isInteger(value) &&
    value >= 0 &&
    value <= 13
  );
}

export function toSavedAssessmentIndexItem(
  pkg: AssessmentPackage
): SavedAssessmentIndexItem {
  validateAssessmentPackage(pkg);
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
  validateAssessmentStore(store);
  return Object.values(store.assessments)
    .map(toSavedAssessmentIndexItem)
    .sort((a, b) => b.lastSavedAt.localeCompare(a.lastSavedAt));
}

export function validateAssessmentStore(value: unknown): asserts value is AssessmentStore {
  if (!isRecord(value)) {
    throw new Error("PrivacyMap local assessment storage is invalid.");
  }
  if (value.schemaVersion !== ASSESSMENT_SCHEMA_VERSION) {
    throw new Error("Unsupported PrivacyMap local assessment storage schema.");
  }
  if (!isRecord(value.assessments)) {
    throw new Error("PrivacyMap local assessment storage has no valid assessment collection.");
  }

  const ids = Object.keys(value.assessments);
  if (ids.length > 100) {
    throw new Error("PrivacyMap local assessment storage contains too many assessments.");
  }

  for (const id of ids) {
    validateIdentifier(id, "Stored assessment ID");
    const pkg = value.assessments[id];
    validateAssessmentPackage(pkg);
    if (pkg.assessment.assessmentProfile.assessmentId !== id) {
      throw new Error(
        `Stored assessment key ${id} does not match its assessment ID.`
      );
    }
  }
}

export function serializeAssessmentStore(store: AssessmentStore): string {
  validateAssessmentStore(store);
  const raw = JSON.stringify(store, null, 2);
  if (new TextEncoder().encode(raw).byteLength > MAX_LOCAL_STORE_BYTES) {
    throw new Error("PrivacyMap local assessment storage exceeds the safe size limit.");
  }
  return raw;
}

export function parseAssessmentStore(raw: string): AssessmentStore {
  if (raw.length > MAX_LOCAL_STORE_BYTES) {
    throw new Error("PrivacyMap local assessment storage exceeds the safe size limit.");
  }

  let value: unknown;
  try {
    value = JSON.parse(raw);
  } catch {
    throw new Error("PrivacyMap local assessment storage is corrupted or invalid.");
  }

  validateImportedValue(value, "localStore");
  validateAssessmentStore(value);
  return value;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function todayIsoDate(): string {
  const now = new Date();
  return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}

function isRecord(value: unknown): value is Record<string, any> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}
