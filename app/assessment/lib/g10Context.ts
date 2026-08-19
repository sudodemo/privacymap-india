import type { AssessmentInputState } from "./assessmentContinuity";
import { getG10CollectionChannels, type ProcessingActivity } from "./g10Taxonomy";

/**
 * Builds a processing-activity view from the existing assessment state.
 * This deliberately avoids introducing a second state model: the existing
 * process, data-subject, data-category, collection, storage, sharing,
 * retention and cross-border answers remain authoritative.
 */
export function deriveProcessingActivity(input: AssessmentInputState): ProcessingActivity {
  const selectedChannelNames = new Map(getG10CollectionChannels().map((channel) => [channel.id, channel.name]));
  const collectionChannels = input.selectedEntryPoints.map((id) => selectedChannelNames.get(id) ?? id);
  const systems = input.customEntryPoints.map((item) => item.name).filter(Boolean);

  return {
    id: input.processId || "ASSESSMENT-PROCESS",
    purpose: input.processId || "",
    dataSubjects: [...input.dataSubjectTypes],
    dataCategories: [...input.selectedFields],
    collectionChannels,
    systems,
    recipients: [...input.sharingStatuses],
    retentionContext: [...input.retentionPeriods].join(", "),
    crossBorderContext: [...input.crossBorderTransfers].join(", "),
    involvesChildren: input.dataSubjectTypes.some((value) => /child|minor|student/i.test(value)),
    involvesAi: input.selectedEntryPoints.includes("AI"),
    automatedDecisionMaking: input.selectedEntryPoints.includes("AI") && input.collectionFormats.some((value) => /decision|automated/i.test(value)),
    notes: "Derived from the existing PrivacyMap assessment answers; no duplicate processing-activity state is created.",
  };
}
