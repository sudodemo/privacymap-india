/**
 * PrivacyMap India — V1.6 Knowledge Base access layer.
 *
 * This module reads static JSON knowledge at build time.
 * It does not send assessment responses to a server.
 */

import industries from "../../knowledge_base/core/industries.json";
import businessTypes from "../../knowledge_base/core/business_types.json";
import processes from "../../knowledge_base/core/processes.json";
import dataSubjects from "../../knowledge_base/core/data_subjects.json";
import dataCategories from "../../knowledge_base/core/data_categories.json";
import collectionMethods from "../../knowledge_base/core/collection_methods.json";
import storageTypes from "../../knowledge_base/core/storage_types.json";
import accessRoles from "../../knowledge_base/core/access_roles.json";
import retentionTypes from "../../knowledge_base/core/retention_types.json";
import securityControls from "../../knowledge_base/core/security_controls.json";
import findingTemplates from "../../knowledge_base/core/finding_templates.json";
import riskRules from "../../knowledge_base/core/risk_rules.json";
import schoolEntryPoints from "../../knowledge_base/sectors/education/school/data_entry_points.json";
import schoolFields from "../../knowledge_base/sectors/education/school/data_fields.json";
import dpdpControls from "../../knowledge_base/legal/dpdp_controls_v1.json";
import dpdpAct from "../../knowledge_base/legal/dpdp_act.json";
import dpdpRules from "../../knowledge_base/legal/dpdp_rules.json";
import commencement from "../../knowledge_base/legal/commencement.json";
import releaseManifest from "../../knowledge_base/RELEASE_MANIFEST.json";
import knowledgeBaseMeta from "../../knowledge_base/meta.json";

export const kb = {
  industries: industries.items,
  businessTypes: businessTypes.items,
  processes: processes.items,
  dataSubjects: dataSubjects.items,
  dataCategories: dataCategories.items,
  collectionMethods: collectionMethods.items,
  storageTypes: storageTypes.items,
  accessRoles: accessRoles.items,
  retentionTypes: retentionTypes.items,
  securityControls: securityControls.items,
  findingTemplates: findingTemplates.items,
  riskRules: riskRules.rules,
  school: {
    entryPoints: schoolEntryPoints.items,
    fields: schoolFields.items,
  },
  legal: {
    controls: dpdpControls.controls,
    act: dpdpAct.sections,
    rules: dpdpRules.topics,
    commencement,
  },
  meta: knowledgeBaseMeta,
  release: releaseManifest,
} as const;

export type KnowledgeBaseRelease = typeof kb.release;
export type KnowledgeBaseMeta = typeof kb.meta;

/** The release manifest is the authoritative version used by Phase G intelligence. */
export function getKnowledgeBaseVersion(): string {
  return kb.release.kb_version;
}

export function getKnowledgeBaseRelease(): KnowledgeBaseRelease {
  return kb.release;
}

export function getKnowledgeBaseMeta(): KnowledgeBaseMeta {
  return kb.meta;
}

export function getBusinessTypes(industryId: string) {
  return kb.businessTypes.filter((item) => item.industry_id === industryId);
}

export function getSchoolEntryPoints(processId?: string) {
  if (!processId) return kb.school.entryPoints;
  return kb.school.entryPoints.filter((item) => item.process_id === processId);
}

export function getRiskRules() {
  return kb.riskRules;
}
