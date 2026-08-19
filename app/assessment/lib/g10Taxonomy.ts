import industries from "../../../knowledge_base/core/industries.json";
import businessTypes from "../../../knowledge_base/core/business_types.json";
import genericProcesses from "../../../knowledge_base/core/g10_processes.json";
import collectionChannels from "../../../knowledge_base/core/collection_channels.json";
import schoolProcesses from "../../../knowledge_base/core/processes.json";

export type ProcessingActivity = {
  id: string;
  purpose: string;
  dataSubjects: string[];
  dataCategories: string[];
  collectionChannels: string[];
  systems: string[];
  recipients: string[];
  retentionContext: string;
  crossBorderContext: string;
  involvesChildren: boolean;
  involvesAi: boolean;
  automatedDecisionMaking: boolean;
  notes: string;
};

export const G10_INDUSTRY_TAXONOMY_VERSION = "1.0.0" as const;
export const G10_PROCESS_TAXONOMY_VERSION = "1.0.0" as const;
export const G10_COLLECTION_CHANNEL_VERSION = "1.0.0" as const;

export const g10Industries = industries.items;
export const g10BusinessTypes = businessTypes.items;
export const g10CollectionChannels = collectionChannels.items;

export function getG10Processes(businessTypeId: string) {
  const generic = genericProcesses.items;
  if (businessTypeId === "EDU-SCH") return [...schoolProcesses.items, ...generic];
  return generic;
}

export function getG10CollectionChannels() {
  return g10CollectionChannels;
}

export function createEmptyProcessingActivity(id = "PA-1"): ProcessingActivity {
  return {
    id,
    purpose: "",
    dataSubjects: [],
    dataCategories: [],
    collectionChannels: [],
    systems: [],
    recipients: [],
    retentionContext: "",
    crossBorderContext: "",
    involvesChildren: false,
    involvesAi: false,
    automatedDecisionMaking: false,
    notes: "",
  };
}

export function normalizeProcessingActivity(value: Partial<ProcessingActivity> & { id: string }): ProcessingActivity {
  return {
    id: value.id,
    purpose: String(value.purpose ?? "").trim(),
    dataSubjects: Array.isArray(value.dataSubjects) ? value.dataSubjects.map(String) : [],
    dataCategories: Array.isArray(value.dataCategories) ? value.dataCategories.map(String) : [],
    collectionChannels: Array.isArray(value.collectionChannels) ? value.collectionChannels.map(String) : [],
    systems: Array.isArray(value.systems) ? value.systems.map(String) : [],
    recipients: Array.isArray(value.recipients) ? value.recipients.map(String) : [],
    retentionContext: String(value.retentionContext ?? "").trim(),
    crossBorderContext: String(value.crossBorderContext ?? "").trim(),
    involvesChildren: Boolean(value.involvesChildren),
    involvesAi: Boolean(value.involvesAi),
    automatedDecisionMaking: Boolean(value.automatedDecisionMaking),
    notes: String(value.notes ?? "").trim(),
  };
}
