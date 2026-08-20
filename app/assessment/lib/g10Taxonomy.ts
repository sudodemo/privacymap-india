import industries from "../../../knowledge_base/core/industries.json";
import businessTypes from "../../../knowledge_base/core/business_types.json";
import genericProcesses from "../../../knowledge_base/core/g10_processes.json";
import contextualProcesses from "../../../knowledge_base/core/g10_contextual_processes.json";
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

export const G10_INDUSTRY_TAXONOMY_VERSION = "1.1.0" as const;
export const G10_PROCESS_TAXONOMY_VERSION = "1.1.0" as const;
export const G10_COLLECTION_CHANNEL_VERSION = "1.0.0" as const;

export const g10Industries = industries.items;
export const g10BusinessTypes = businessTypes.items;
export const g10CollectionChannels = collectionChannels.items;

const sharedProcessLabels: Record<string, Record<string, string>> = {
  "HLT-HOS": {
    "GEN-CUST-01": "Patient Registration",
    "GEN-CUST-02": "Patient Account / Portal Management",
    "GEN-SUP-01": "Patient Support / Complaints",
    "GEN-SAL-01": "Patient Communication & Outreach",
  },
  "HLT-LAB": {
    "GEN-CUST-01": "Patient Registration",
    "GEN-CUST-02": "Patient Account Management",
    "GEN-SUP-01": "Patient Support / Complaints",
  },
  "HLT-PHM": {
    "GEN-CUST-01": "Patient / Customer Registration",
    "GEN-CUST-02": "Customer Account Management",
    "GEN-SUP-01": "Customer Support / Complaints",
  },
  "EDU-SCH": {
    "GEN-CUST-01": "Student Registration",
    "GEN-CUST-02": "Student Account Management",
    "GEN-SUP-01": "Student / Parent Support & Complaints",
  },
  "EDU-COL": {
    "GEN-CUST-01": "Student Registration",
    "GEN-CUST-02": "Student Account Management",
    "GEN-SUP-01": "Student Support / Complaints",
  },
  "EDU-EDT": {
    "GEN-CUST-01": "Learner Registration",
    "GEN-CUST-02": "Learner Account Management",
    "GEN-SUP-01": "Learner Support / Complaints",
  },
  "TRV-HOT": {
    "GEN-CUST-01": "Guest Registration",
    "GEN-CUST-02": "Guest Account Management",
    "GEN-SUP-01": "Guest Support / Complaints",
  },
  "TRV-TRV": {
    "GEN-CUST-01": "Traveller Registration",
    "GEN-CUST-02": "Traveller Account Management",
    "GEN-SUP-01": "Traveller Support / Complaints",
  },
  "REA-CHS": {
    "GEN-CUST-01": "Member / Flat Owner Registration",
    "GEN-CUST-02": "Member / Flat Owner Account Management",
    "GEN-SUP-01": "Member Grievances / Complaints",
  },
};

export function getG10Processes(businessTypeId: string) {
  const generic = genericProcesses.items;
  const contextual = contextualProcesses.items
    .filter((process) => process.business_type_id === businessTypeId)
    .map(({ business_type_id: _businessTypeId, ...process }) => process);
  const labelledGeneric = generic.map((process) => ({
    ...process,
    name: sharedProcessLabels[businessTypeId]?.[process.id] ?? process.name,
  }));

  const combined = businessTypeId === "EDU-SCH"
    ? [...contextual, ...schoolProcesses.items, ...labelledGeneric]
    : [...contextual, ...labelledGeneric];

  // Contextual processes take precedence over generic processes. This prevents
  // the same user-facing process from appearing twice when a business-specific
  // process intentionally replaces a generic label (for example, a co-operative
  // housing society's "Member / Flat Owner Registration").
  const seen = new Set<string>();
  return combined.filter((process) => {
    const key = process.name.trim().toLocaleLowerCase();
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
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
