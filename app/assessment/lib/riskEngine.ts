import {
  calculatePrivacyRisk as calculatePrivacyRiskUnsafe,
  type PrivacyRiskInput,
} from "../../../lib/privacyRisk";
import type { RiskLevel, RiskResult } from "../../../lib/privacyRisk";
import { validateAssessmentInputStateSecurity } from "./security";

export type { RiskLevel, RiskResult, PrivacyRiskInput };

/** Phase E1 security boundary before untrusted assessment input reaches risk processing. */
export function calculatePrivacyRisk(input: PrivacyRiskInput): RiskResult {
  validateAssessmentInputStateSecurity({
    industryId: "",
    businessTypeId: "",
    processId: "",
    selectedEntryPoints: input.selectedEntryPoints,
    customEntryPoints: input.customEntryPoints,
    selectedFields: input.selectedFields,
    customFields: input.customFields,
    collectorRoles: input.collectorRoles ?? [],
    dataSubjectTypes: input.dataSubjectTypes ?? [],
    collectionFormats: input.collectionFormats ?? [],
    storageLocations: input.storageLocations ?? [],
    storageEnvironments: input.storageEnvironments ?? [],
    encryptionStatuses: input.encryptionStatuses ?? [],
    accessRoles: input.accessRoles ?? [],
    sharingStatuses: input.sharingStatuses ?? [],
    retentionPeriods: input.retentionPeriods ?? [],
    deletionMethods: input.deletionMethods ?? [],
    privacyNotices: input.privacyNotices ?? [],
    consentStatuses: input.consentStatuses ?? [],
    parentalConsentStatuses: input.parentalConsentStatuses ?? [],
    crossBorderTransfers: input.crossBorderTransfers ?? [],
  });

  return calculatePrivacyRiskUnsafe(input);
}
