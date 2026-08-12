/*
 * ============================================================
 * PrivacyMap India
 * Privacy Risk Engine
 * ============================================================
 *
 * Step 7.1
 *
 * Purpose:
 * - Calculate an explainable privacy-risk score
 * - Detect individual risk signals
 * - Detect combinations of risk conditions
 * - Provide category-level risk
 * - Provide findings and recommendations
 *
 * This file is intentionally self-contained.
 *
 * IMPORTANT:
 * The interface below is compatible with the current
 * app/assessment/page.tsx.
 * ============================================================
 */


/* ============================================================
 * RISK TYPES
 * ============================================================
 */

export type RiskLevel =
  | "Low"
  | "Medium"
  | "High"
  | "Critical";


export type RiskCategory =
  | "Data Sensitivity"
  | "Data Subject"
  | "Collection"
  | "Physical Security"
  | "Technology"
  | "Storage"
  | "Access Control"
  | "Third Party"
  | "Retention"
  | "Transparency"
  | "Consent / Lawful Basis"
  | "Child Privacy"
  | "Cross-Border Transfer"
  | "Governance";


export type RiskFinding = {
  id: string;
  category: RiskCategory;
  title: string;
  level: RiskLevel;
  explanation: string;
  recommendation: string;

  /*
   * Additional information for future dashboard
   * enhancements.
   */
  scoreImpact?: number;
  evidence?: string[];
  priority?: "P1" | "P2" | "P3";
};


export type CategoryScore = {
  category: RiskCategory;
  score: number;
  level: RiskLevel;
};


export type RiskResult = {
  score: number;

  /*
   * Kept for compatibility with the earlier engine.
   */
  level: RiskLevel;

  /*
   * Used by the current dashboard.
   */
  overallLevel: RiskLevel;

  factors: string[];

  recommendations: string[];

  findings: RiskFinding[];

  categoryScores: CategoryScore[];
};


/* ============================================================
 * INPUT TYPES
 * ============================================================
 */

type EntryPoint = {
  id: string;
  name: string;
  collection_method?: string;
  custom?: boolean;
};


type Field = {
  id: string;
  name: string;
  custom?: boolean;
};


/*
 * IMPORTANT:
 *
 * These names match the current app/assessment/page.tsx.
 *
 * Do NOT rename these properties without also updating
 * page.tsx.
 */

export type PrivacyRiskInput = {
  selectedEntryPoints: string[];

  customEntryPoints: EntryPoint[];

  selectedFields: string[];

  customFields: Field[];

  collectorRoles: string[];

  dataSubjects: string[];

  collectionMethods: string[];

  storageLocations: string[];

  storageEnvironments: string[];

  encryptionStatus: string[];

  accessRoles: string[];

  sharingStatus: string[];

  retentionPeriod: string[];

  deletionMethod: string[];

  privacyNotice: string[];

  consentStatus: string[];

  parentalConsent: string[];

  crossBorderTransfer: string[];
};


/* ============================================================
 * INTERNAL TYPES
 * ============================================================
 */

type InternalFinding = {
  id: string;
  category: RiskCategory;
  title: string;
  level: RiskLevel;
  explanation: string;
  recommendation: string;
  scoreImpact: number;
  evidence: string[];
  priority: "P1" | "P2" | "P3";
};


/* ============================================================
 * HELPER FUNCTIONS
 * ============================================================
 */


/*
 * Case-insensitive search inside a string array.
 */
function containsValue(
  values: string[] | undefined,
  search: string
): boolean {
  if (!values || values.length === 0) {
    return false;
  }

  return values.some((value) =>
    value
      .toLowerCase()
      .includes(search.toLowerCase())
  );
}


/*
 * Detect whether ANY supplied keyword exists.
 */
function containsAny(
  values: string[] | undefined,
  searches: string[]
): boolean {
  if (!values || values.length === 0) {
    return false;
  }

  return searches.some((search) =>
    containsValue(values, search)
  );
}


/*
 * Convert numeric score into risk level.
 */
function getRiskLevel(
  score: number
): RiskLevel {
  if (score >= 75) {
    return "Critical";
  }

  if (score >= 50) {
    return "High";
  }

  if (score >= 25) {
    return "Medium";
  }

  return "Low";
}


/*
 * Convert finding impact into severity.
 *
 * This is intentionally slightly different from
 * the overall score thresholds.
 */
function getFindingLevel(
  impact: number
): RiskLevel {
  if (impact >= 25) {
    return "Critical";
  }

  if (impact >= 15) {
    return "High";
  }

  if (impact >= 8) {
    return "Medium";
  }

  return "Low";
}


/*
 * Add a finding.
 */
function addFinding(
  findings: InternalFinding[],
  finding: InternalFinding
): void {
  findings.push(finding);
}


/*
 * Remove duplicate findings.
 */
function uniqueFindings(
  findings: InternalFinding[]
): InternalFinding[] {
  const seen = new Set<string>();

  return findings.filter((finding) => {
    if (seen.has(finding.id)) {
      return false;
    }

    seen.add(finding.id);

    return true;
  });
}


/*
 * Remove duplicate strings.
 */
function uniqueStrings(
  values: string[]
): string[] {
  return Array.from(
    new Set(values)
  );
}


/* ============================================================
 * MAIN RISK ENGINE
 * ============================================================
 */

export function calculatePrivacyRisk(
  input: PrivacyRiskInput
): RiskResult {

  let score = 0;

  const factors: string[] = [];

  const recommendations: string[] = [];

  let findings: InternalFinding[] = [];


  /*
   * ----------------------------------------------------------
   * BASIC COUNTS
   * ----------------------------------------------------------
   */

  const totalEntryPoints =
    input.selectedEntryPoints.length +
    input.customEntryPoints.length;

  const totalFields =
    input.selectedFields.length +
    input.customFields.length;


  /*
   * ==========================================================
   * 1. DATA SENSITIVITY
   * ==========================================================
   */

  if (totalFields >= 10) {

    score += 10;

    factors.push(
      "The assessed process collects a relatively large number of personal-data fields."
    );

    recommendations.push(
      "Review every personal-data field for necessity, proportionality and purpose."
    );

    addFinding(findings, {
      id: "DATA-001",
      category: "Data Sensitivity",
      title: "Large number of personal-data fields",
      level: "Medium",
      explanation:
        "The assessed process collects a relatively large number of personal-data fields, increasing the potential impact of unauthorised access, disclosure or misuse.",
      recommendation:
        "Review each field and confirm that it is necessary for a documented business purpose.",
      scoreImpact: 10,
      evidence: [
        `${totalFields} personal-data fields selected.`,
      ],
      priority: "P2",
    });

  } else if (totalFields >= 5) {

    score += 5;

    factors.push(
      "The assessed process collects multiple categories of personal data."
    );

  }


  /*
   * ==========================================================
   * 2. CHILD / STUDENT DATA
   * ==========================================================
   */

  const involvesStudents =
    containsAny(
      input.dataSubjects,
      [
        "student",
        "child",
        "minor",
      ]
    );


  if (involvesStudents) {

    score += 15;

    factors.push(
      "The processing involves student, child or minor-related personal data."
    );

    recommendations.push(
      "Review child-data processing requirements and parent/guardian controls."
    );

    addFinding(findings, {
      id: "CHILD-001",
      category: "Child Privacy",
      title: "Student or child personal data is processed",
      level: "High",
      explanation:
        "The assessed process involves student, child or minor-related personal data. Such processing requires stronger privacy governance and careful consideration of transparency, access, retention and parental or guardian controls.",
      recommendation:
        "Document the purposes for processing student data and verify appropriate child-data and parent/guardian controls.",
      scoreImpact: 15,
      evidence: [
        `Selected data subjects: ${input.dataSubjects.join(", ") || "Student/child-related data indicated"}.`,
      ],
      priority: "P1",
    });

  }


  /*
   * ==========================================================
   * 3. PARENT / GUARDIAN DATA
   * ==========================================================
   */

  const involvesParents =
    containsAny(
      input.dataSubjects,
      [
        "parent",
        "guardian",
      ]
    );


  if (involvesParents) {

    score += 5;

    factors.push(
      "Parent or guardian personal data is included in the processing."
    );

    recommendations.push(
      "Ensure parent/guardian information is collected only for defined purposes and is appropriately protected."
    );

    addFinding(findings, {
      id: "DATA-SUBJECT-001",
      category: "Data Subject",
      title: "Parent or guardian data is processed",
      level: "Medium",
      explanation:
        "The assessed process includes parent or guardian personal data in addition to other data subjects.",
      recommendation:
        "Define the purpose and minimum data required from parents or guardians and ensure appropriate access controls.",
      scoreImpact: 5,
      evidence: [
        "Parent / Guardian selected as a data subject.",
      ],
      priority: "P2",
    });

  }


  /*
   * ==========================================================
   * 4. MULTIPLE DATA SUBJECT TYPES
   * ==========================================================
   */

  if (input.dataSubjects.length >= 3) {

    score += 5;

    factors.push(
      "The process involves multiple categories of data subjects."
    );

    recommendations.push(
      "Document separate data flows and purposes where different data-subject categories are involved."
    );

    addFinding(findings, {
      id: "DATA-SUBJECT-002",
      category: "Data Subject",
      title: "Multiple data-subject categories",
      level: "Medium",
      explanation:
        "Different categories of people are included in the same processing activity, increasing governance and data-flow complexity.",
      recommendation:
        "Document which fields are collected from each data-subject category and why they are required.",
      scoreImpact: 5,
      evidence: [
        `${input.dataSubjects.length} data-subject categories selected.`,
      ],
      priority: "P2",
    });

  }


  /*
   * ==========================================================
   * 5. MULTIPLE ENTRY POINTS
   * ==========================================================
   */

  if (totalEntryPoints >= 4) {

    score += 10;

    factors.push(
      "Personal data enters the organisation through multiple collection channels."
    );

    recommendations.push(
      "Maintain a consolidated inventory of all personal-data entry points."
    );

    addFinding(findings, {
      id: "COLLECTION-001",
      category: "Collection",
      title: "Multiple personal-data entry points",
      level: "Medium",
      explanation:
        "Personal data may enter the organisation through several channels. Multiple entry points can make it difficult to maintain consistent privacy notices, access controls, retention rules and data-flow documentation.",
      recommendation:
        "Maintain an approved inventory of collection channels and document the data flow from each channel.",
      scoreImpact: 10,
      evidence: [
        `${totalEntryPoints} collection entry points selected.`,
      ],
      priority: "P2",
    });

  } else if (totalEntryPoints >= 2) {

    score += 5;

    factors.push(
      "Personal data is collected through more than one entry point."
    );

    recommendations.push(
      "Ensure all collection channels are included in the privacy and data-flow inventory."
    );

  }


  /*
   * ==========================================================
   * 6. MULTIPLE COLLECTOR ROLES
   * ==========================================================
   */

  if (input.collectorRoles.length >= 3) {

    score += 5;

    factors.push(
      "Multiple employee or organisational roles may collect personal data."
    );

    recommendations.push(
      "Define role-based access and responsibilities for each data-collection role."
    );

    addFinding(findings, {
      id: "ACCESS-001",
      category: "Access Control",
      title: "Multiple roles collect personal data",
      level: "Medium",
      explanation:
        "Several organisational roles may collect personal data. Without clearly defined responsibilities, unnecessary access or inconsistent handling practices may occur.",
      recommendation:
        "Define role-based responsibilities and ensure each role has access only to the information required for its function.",
      scoreImpact: 5,
      evidence: [
        `${input.collectorRoles.length} collector roles selected.`,
      ],
      priority: "P2",
    });

  }


  /*
   * ==========================================================
   * 7. PHYSICAL COLLECTION
   * ==========================================================
   */

  const physicalCollection =
    containsAny(
      input.collectionMethods,
      [
        "paper",
        "physical",
        "in person",
        "verbal",
      ]
    );


  if (physicalCollection) {

    score += 5;

    factors.push(
      "Personal data may be collected through physical or paper-based processes."
    );

    recommendations.push(
      "Review physical security, access, transportation, scanning and secure disposal of paper records."
    );

    addFinding(findings, {
      id: "PHYSICAL-001",
      category: "Physical Security",
      title: "Physical personal-data collection",
      level: "Medium",
      explanation:
        "Personal data may be collected using paper, physical forms or in-person processes. Physical records can be lost, copied, viewed or transported without the same controls available in digital systems.",
      recommendation:
        "Establish secure collection, storage, transportation, access and disposal procedures for physical records.",
      scoreImpact: 5,
      evidence: [
        `Collection methods: ${input.collectionMethods.join(", ") || "Physical collection indicated"}.`,
      ],
      priority: "P2",
    });

  }


  /*
   * ==========================================================
   * 8. DIGITAL COLLECTION CHANNELS
   * ==========================================================
   */

  const digitalCollection =
    containsAny(
      input.collectionMethods,
      [
        "website",
        "google form",
        "mobile",
        "app",
        "whatsapp",
        "email",
        "excel",
        "spreadsheet",
      ]
    );


  if (digitalCollection) {

    score += 3;

    factors.push(
      "Personal data is collected through digital channels."
    );

    recommendations.push(
      "Ensure digital collection channels are approved, secured and included in the data-flow inventory."
    );

  }


  /*
   * ==========================================================
   * 9. UNAUTHORISED / INFORMAL CHANNEL RISK
   * ==========================================================
   */

  const informalChannel =
    containsAny(
      input.collectionMethods,
      [
        "whatsapp",
        "personal",
        "telephone",
        "verbal",
      ]
    );


  if (informalChannel) {

    score += 8;

    factors.push(
      "Personal data may be collected through informal communication channels."
    );

    recommendations.push(
      "Define approved channels for collecting personal data and restrict use of uncontrolled communication channels."
    );

    addFinding(findings, {
      id: "COLLECTION-002",
      category: "Collection",
      title: "Informal personal-data collection channel",
      level: "Medium",
      explanation:
        "The assessment indicates that personal data may be collected through informal communication channels such as WhatsApp, telephone or verbal interactions. These channels may make security, retention and auditability more difficult.",
      recommendation:
        "Define approved collection channels and establish procedures for transferring information from informal channels into controlled systems.",
      scoreImpact: 8,
      evidence: [
        `Collection methods include: ${input.collectionMethods.join(", ")}.`,
      ],
      priority: "P2",
    });

  }


  /*
   * ==========================================================
   * 10. MULTIPLE STORAGE LOCATIONS
   * ==========================================================
   */

  if (input.storageLocations.length >= 4) {

    score += 10;

    factors.push(
      "Personal data may be stored across multiple systems and locations."
    );

    recommendations.push(
      "Maintain an authoritative inventory of all systems and locations containing personal data."
    );

    addFinding(findings, {
      id: "STORAGE-001",
      category: "Storage",
      title: "Multiple storage locations",
      level: "High",
      explanation:
        "Personal data may exist across multiple applications, files, email accounts, cloud services or physical records. This increases the risk of inconsistent access, retention and deletion.",
      recommendation:
        "Identify all storage locations and define an authoritative system of record wherever practical.",
      scoreImpact: 10,
      evidence: [
        `${input.storageLocations.length} storage locations selected.`,
      ],
      priority: "P1",
    });

  } else if (input.storageLocations.length >= 2) {

    score += 5;

    factors.push(
      "Personal data may be stored in more than one location."
    );

  }


  /*
   * ==========================================================
   * 11. MULTIPLE STORAGE ENVIRONMENTS
   * ==========================================================
   */

  if (input.storageEnvironments.length >= 2) {

    score += 8;

    factors.push(
      "Personal data may be stored across multiple environments."
    );

    recommendations.push(
      "Map movement of personal data between physical, employee-device, cloud and on-premises environments."
    );

    addFinding(findings, {
      id: "STORAGE-002",
      category: "Storage",
      title: "Multiple storage environments",
      level: "High",
      explanation:
        "Personal data may move between different storage environments. Each transition introduces additional security, access and retention considerations.",
      recommendation:
        "Create a data-flow map showing how information moves between physical, cloud, on-premises and endpoint environments.",
      scoreImpact: 8,
      evidence: [
        `Storage environments: ${input.storageEnvironments.join(", ")}.`,
      ],
      priority: "P1",
    });

  }


  /*
   * ==========================================================
   * 12. PHYSICAL STORAGE
   * ==========================================================
   */

  const physicalStorage =
    containsAny(
      input.storageEnvironments,
      [
        "physical",
      ]
    ) ||
    containsAny(
      input.storageLocations,
      [
        "paper",
        "physical",
      ]
    );


  if (physicalStorage) {

    score += 5;

    factors.push(
      "Physical records may contain personal data."
    );

    recommendations.push(
      "Review physical access controls, secure storage, retention and secure disposal."
    );

    addFinding(findings, {
      id: "PHYSICAL-002",
      category: "Physical Security",
      title: "Physical records are used",
      level: "Medium",
      explanation:
        "Personal data may be retained in physical records. Physical records require appropriate controls for access, storage, transportation and disposal.",
      recommendation:
        "Implement controlled physical storage and secure destruction procedures.",
      scoreImpact: 5,
      evidence: [
        "Physical storage or paper records selected.",
      ],
      priority: "P2",
    });

  }


  /*
   * ==========================================================
   * 13. HYBRID PHYSICAL + DIGITAL STORAGE
   * ==========================================================
   */

  const hasPhysical =
    physicalStorage;

  const hasDigital =
    containsAny(
      input.storageEnvironments,
      [
        "cloud",
        "on-premises",
        "employee device",
        "mobile device",
        "third-party hosted",
      ]
    );


  if (hasPhysical && hasDigital) {

    score += 10;

    factors.push(
      "The process uses both physical and digital storage."
    );

    recommendations.push(
      "Map the transition between paper records and digital systems, including scanning, uploading and disposal."
    );

    addFinding(findings, {
      id: "HYBRID-001",
      category: "Storage",
      title: "Hybrid physical and digital data lifecycle",
      level: "High",
      explanation:
        "Personal data exists in both physical and digital environments. This creates additional lifecycle complexity because copies may be created during scanning, uploading, emailing or spreadsheet processing.",
      recommendation:
        "Document the complete physical-to-digital lifecycle and define controls for scanning, reconciliation, duplicate copies, retention and secure disposal.",
      scoreImpact: 10,
      evidence: [
        "Physical storage identified.",
        "Digital storage environment identified.",
      ],
      priority: "P1",
    });

  }


  /*
   * ==========================================================
   * 14. UNKNOWN STORAGE
   * ==========================================================
   */

  if (
    containsValue(
      input.storageLocations,
      "unknown"
    )
  ) {

    score += 10;

    factors.push(
      "The storage location of personal data is unknown."
    );

    recommendations.push(
      "Identify all systems, applications, devices and physical locations where personal data is stored."
    );

    addFinding(findings, {
      id: "GOV-001",
      category: "Governance",
      title: "Storage location is unknown",
      level: "High",
      explanation:
        "The organisation does not currently have sufficient visibility into where the assessed personal data is stored.",
      recommendation:
        "Perform a data-discovery exercise and document all physical and logical storage locations.",
      scoreImpact: 10,
      evidence: [
        "Unknown storage location selected.",
      ],
      priority: "P1",
    });

  }


  /*
   * ==========================================================
   * 15. ENCRYPTION
   * ==========================================================
   */

  if (
    containsAny(
      input.encryptionStatus,
      [
        "clear text",
        "not encrypted",
      ]
    )
  ) {

    score += 25;

    factors.push(
      "Personal data may be stored or transmitted without adequate encryption."
    );

    recommendations.push(
      "Evaluate encryption controls for personal data at rest and in transit."
    );

    addFinding(findings, {
      id: "TECH-001",
      category: "Technology",
      title: "Personal data may not be encrypted",
      level: "Critical",
      explanation:
        "The assessment indicates that personal data may be stored or transmitted without adequate encryption.",
      recommendation:
        "Evaluate encryption at rest and in transit and remediate systems where appropriate.",
      scoreImpact: 25,
      evidence: [
        `Encryption status: ${input.encryptionStatus.join(", ")}.`,
      ],
      priority: "P1",
    });

  }


  if (
    containsValue(
      input.encryptionStatus,
      "unknown"
    )
  ) {

    score += 10;

    factors.push(
      "Encryption status is unknown."
    );

    recommendations.push(
      "Confirm whether personal data is encrypted at rest and in transit."
    );

    addFinding(findings, {
      id: "TECH-002",
      category: "Technology",
      title: "Encryption status is unknown",
      level: "High",
      explanation:
        "The organisation has not established whether the assessed personal data is adequately encrypted.",
      recommendation:
        "Verify encryption controls for each relevant application, storage location and transmission channel.",
      scoreImpact: 10,
      evidence: [
        "Unknown encryption status selected.",
      ],
      priority: "P1",
    });

  }


  /*
   * ==========================================================
   * 16. ACCESS CONTROL
   * ==========================================================
   */

  if (
    input.accessRoles.length === 0 ||
    containsValue(
      input.accessRoles,
      "unknown"
    )
  ) {

    score += 8;

    factors.push(
      "Access roles for personal data are not clearly defined."
    );

    recommendations.push(
      "Define role-based access to personal data and periodically review access."
    );

    addFinding(findings, {
      id: "ACCESS-002",
      category: "Access Control",
      title: "Access roles are not clearly defined",
      level: "High",
      explanation:
        "The assessment does not establish who can access the personal data. Without defined access roles, least-privilege controls cannot be effectively assessed.",
      recommendation:
        "Document authorised access roles and implement periodic access reviews.",
      scoreImpact: 8,
      evidence: [
        input.accessRoles.length === 0
          ? "No access roles selected."
          : "Unknown access role status selected.",
      ],
      priority: "P1",
    });

  }


  /*
   * ==========================================================
   * 17. LARGE ACCESS POPULATION
   * ==========================================================
   */

  if (input.accessRoles.length >= 5) {

    score += 8;

    factors.push(
      "A relatively large number of organisational roles may access personal data."
    );

    recommendations.push(
      "Apply least-privilege access and periodically review access rights."
    );

    addFinding(findings, {
      id: "ACCESS-003",
      category: "Access Control",
      title: "Broad access population",
      level: "Medium",
      explanation:
        "Several organisational roles may have access to the assessed personal data. Broad access increases the potential exposure of personal information.",
      recommendation:
        "Review each access role against business necessity and implement least privilege.",
      scoreImpact: 8,
      evidence: [
        `${input.accessRoles.length} access roles selected.`,
      ],
      priority: "P2",
    });

  }


  /*
   * ==========================================================
   * 18. THIRD-PARTY SHARING
   * ==========================================================
   */

  const thirdPartySharing =
    containsAny(
      input.sharingStatus,
      [
        "service provider",
        "third parties",
        "external",
      ]
    );


  if (thirdPartySharing) {

    score += 15;

    factors.push(
      "Personal data may be shared with external service providers or third parties."
    );

    recommendations.push(
      "Maintain a processor/service-provider inventory and review contractual privacy and security obligations."
    );

    addFinding(findings, {
      id: "THIRD-PARTY-001",
      category: "Third Party",
      title: "Third-party processing or sharing",
      level: "High",
      explanation:
        "Personal data may be shared with service providers or other third parties. This creates additional privacy, contractual, security and oversight requirements.",
      recommendation:
        "Identify all third parties, document the data shared, assess vendor controls and establish appropriate contractual obligations.",
      scoreImpact: 15,
      evidence: [
        `Sharing status: ${input.sharingStatus.join(", ")}.`,
      ],
      priority: "P1",
    });

  }


  /*
   * ==========================================================
   * 19. UNKNOWN DATA SHARING
   * ==========================================================
   */

  if (
    containsValue(
      input.sharingStatus,
      "unknown"
    )
  ) {

    score += 8;

    factors.push(
      "Data-sharing arrangements are unknown."
    );

    recommendations.push(
      "Identify all internal and external recipients of personal data."
    );

    addFinding(findings, {
      id: "THIRD-PARTY-002",
      category: "Third Party",
      title: "Data-sharing arrangements are unknown",
      level: "High",
      explanation:
        "The organisation has not established whether or with whom the assessed personal data is shared.",
      recommendation:
        "Perform a recipient and processor discovery exercise and document all data-sharing relationships.",
      scoreImpact: 8,
      evidence: [
        "Unknown sharing status selected.",
      ],
      priority: "P1",
    });

  }


  /*
   * ==========================================================
   * 20. RETENTION
   * ==========================================================
   */

  const weakRetention =
    containsAny(
      input.retentionPeriod,
      [
        "indefinitely",
        "no defined",
      ]
    );


  if (weakRetention) {

    score += 15;

    factors.push(
      "The organisation may not have a defined retention period."
    );

    recommendations.push(
      "Define retention periods based on business, legal and regulatory requirements."
    );

    addFinding(findings, {
      id: "RETENTION-001",
      category: "Retention",
      title: "Retention period is not adequately defined",
      level: "High",
      explanation:
        "Personal data may be retained indefinitely or without a defined retention period, increasing the risk of unnecessary data accumulation.",
      recommendation:
        "Define retention periods for each personal-data category and document the business or legal rationale.",
      scoreImpact: 15,
      evidence: [
        `Retention selection: ${input.retentionPeriod.join(", ")}.`,
      ],
      priority: "P1",
    });

  }


  if (
    containsValue(
      input.retentionPeriod,
      "unknown"
    )
  ) {

    score += 8;

    factors.push(
      "Data-retention period is unknown."
    );

    recommendations.push(
      "Document how long each category of personal data is retained."
    );

    addFinding(findings, {
      id: "RETENTION-002",
      category: "Retention",
      title: "Retention period is unknown",
      level: "High",
      explanation:
        "The organisation has not established how long the assessed personal data is retained.",
      recommendation:
        "Identify retention periods for each data category and processing purpose.",
      scoreImpact: 8,
      evidence: [
        "Unknown retention period selected.",
      ],
      priority: "P1",
    });

  }


  /*
   * ==========================================================
   * 21. DELETION
   * ==========================================================
   */

  if (
    containsAny(
      input.deletionMethod,
      [
        "no defined",
        "unknown",
      ]
    )
  ) {

    score += 10;

    factors.push(
      "There may be no defined personal-data deletion process."
    );

    recommendations.push(
      "Define and document secure deletion and disposal procedures."
    );

    addFinding(findings, {
      id: "RETENTION-003",
      category: "Retention",
      title: "Deletion process is not adequately defined",
      level: "High",
      explanation:
        "The assessment indicates that deletion or disposal may not be governed by a clearly defined process.",
      recommendation:
        "Define secure deletion procedures for digital and physical records and link them to the applicable retention periods.",
      scoreImpact: 10,
      evidence: [
        `Deletion method: ${input.deletionMethod.join(", ")}.`,
      ],
      priority: "P1",
    });

  }


  /*
   * ==========================================================
   * 22. PRIVACY NOTICE
   * ==========================================================
   */

  if (
    containsAny(
      input.privacyNotice,
      [
        "no",
        "partially",
      ]
    )
  ) {

    score += 12;

    factors.push(
      "Privacy-notice coverage may be incomplete."
    );

    recommendations.push(
      "Review privacy notices provided at or before collection of personal data."
    );

    addFinding(findings, {
      id: "TRANSPARENCY-001",
      category: "Transparency",
      title: "Privacy notice coverage may be incomplete",
      level: "High",
      explanation:
        "The assessment indicates that privacy notice coverage may be absent or incomplete.",
      recommendation:
        "Review privacy notices for each collection channel and ensure that data subjects receive appropriate information.",
      scoreImpact: 12,
      evidence: [
        `Privacy notice status: ${input.privacyNotice.join(", ")}.`,
      ],
      priority: "P1",
    });

  }


  if (
    containsValue(
      input.privacyNotice,
      "unknown"
    )
  ) {

    score += 7;

    factors.push(
      "Privacy-notice status is unknown."
    );

    recommendations.push(
      "Confirm whether appropriate privacy notices are provided to data subjects."
    );

  }


  /*
   * ==========================================================
   * 23. CONSENT / LAWFUL BASIS
   * ==========================================================
   */

  if (
    containsValue(
      input.consentStatus,
      "no"
    )
  ) {

    score += 15;

    factors.push(
      "Consent may not be obtained where the organisation expects it to be required."
    );

    recommendations.push(
      "Validate the applicable legal basis and document the organisation's basis for processing."
    );

    addFinding(findings, {
      id: "CONSENT-001",
      category: "Consent / Lawful Basis",
      title: "Consent or lawful-basis control requires review",
      level: "High",
      explanation:
        "The assessment indicates that consent may not be obtained where the organisation expects it to be required.",
      recommendation:
        "Determine and document the applicable legal basis for each processing activity rather than relying on consent assumptions.",
      scoreImpact: 15,
      evidence: [
        `Consent status: ${input.consentStatus.join(", ")}.`,
      ],
      priority: "P1",
    });

  }


  if (
    containsValue(
      input.consentStatus,
      "unknown"
    )
  ) {

    score += 8;

    factors.push(
      "Consent or other lawful-basis status is unknown."
    );

    recommendations.push(
      "Document the purpose and legal basis for each personal-data processing activity."
    );

  }


  /*
   * ==========================================================
   * 24. CHILD + PARENTAL CONTROL COMBINATION
   * ==========================================================
   */

  if (involvesStudents) {

    if (
      containsAny(
        input.parentalConsent,
        [
          "no",
          "partially",
        ]
      )
    ) {

      score += 20;

      factors.push(
        "Child-related processing may not have adequate parent/guardian controls."
      );

      recommendations.push(
        "Review parental/guardian requirements for child-related personal data."
      );

      addFinding(findings, {
        id: "CHILD-002",
        category: "Child Privacy",
        title: "Parent / guardian controls require improvement",
        level: "High",
        explanation:
          "Student or child-related data is being processed while parent/guardian involvement is indicated as absent or partial.",
        recommendation:
          "Review the applicable parent/guardian controls and document how these requirements are addressed.",
        scoreImpact: 20,
        evidence: [
          `Parental control status: ${input.parentalConsent.join(", ")}.`,
        ],
        priority: "P1",
      });

    }


    if (
      containsValue(
        input.parentalConsent,
        "unknown"
      )
    ) {

      score += 10;

      factors.push(
        "Parent/guardian requirements are unknown for child-related processing."
      );

      recommendations.push(
        "Confirm how parent/guardian requirements are handled for child-related personal data."
      );

      addFinding(findings, {
        id: "CHILD-003",
        category: "Child Privacy",
        title: "Parent / guardian control status is unknown",
        level: "High",
        explanation:
          "Student or child-related processing is identified, but the organisation has not established how parent/guardian requirements are addressed.",
        recommendation:
          "Document the applicable parent/guardian process and evidence supporting the control.",
        scoreImpact: 10,
        evidence: [
          "Unknown parental/guardian control status selected.",
        ],
        priority: "P1",
      });

    }

  }


  /*
   * ==========================================================
   * 25. CROSS-BORDER TRANSFER
   * ==========================================================
   */

  if (
    containsValue(
      input.crossBorderTransfer,
      "yes"
    )
  ) {

    score += 10;

    factors.push(
      "Personal data may be transferred outside India."
    );

    recommendations.push(
      "Identify countries, cloud services and processors involved in cross-border processing."
    );

    addFinding(findings, {
      id: "TRANSFER-001",
      category: "Cross-Border Transfer",
      title: "Potential cross-border processing",
      level: "High",
      explanation:
        "The assessment indicates that personal data may be transferred or processed outside India.",
      recommendation:
        "Identify the countries, vendors and cloud services involved and assess the applicable transfer and contractual requirements.",
      scoreImpact: 10,
      evidence: [
        "Cross-border transfer marked Yes.",
      ],
      priority: "P1",
    });

  }


  if (
    containsValue(
      input.crossBorderTransfer,
      "unknown"
    )
  ) {

    score += 5;

    factors.push(
      "Cross-border data-transfer status is unknown."
    );

    recommendations.push(
      "Determine whether cloud services, SaaS platforms or processors transfer data outside India."
    );

    addFinding(findings, {
      id: "TRANSFER-002",
      category: "Cross-Border Transfer",
      title: "Cross-border processing status is unknown",
      level: "Medium",
      explanation:
        "The organisation has not established whether personal data is processed or transferred outside India.",
      recommendation:
        "Review cloud services, SaaS providers and third-party processors to determine processing locations.",
      scoreImpact: 5,
      evidence: [
        "Unknown cross-border transfer status selected.",
      ],
      priority: "P2",
    });

  }


  /*
   * ==========================================================
   * 26. UNKNOWN COLLECTION PRACTICES
   * ==========================================================
   */

  if (
    input.collectionMethods.length === 0
  ) {

    score += 5;

    factors.push(
      "The method used to collect personal data has not been documented."
    );

    recommendations.push(
      "Document the collection method for each personal-data entry point."
    );

    addFinding(findings, {
      id: "COLLECTION-003",
      category: "Collection",
      title: "Collection method is not documented",
      level: "Medium",
      explanation:
        "The assessment does not identify how the personal data is collected.",
      recommendation:
        "Document each collection method and map it to the corresponding entry point.",
      scoreImpact: 5,
      evidence: [
        "No collection method selected.",
      ],
      priority: "P2",
    });

  }


  /*
   * ==========================================================
   * 27. MAJOR COMBINATION:
   * STUDENT + MULTIPLE CHANNELS + HYBRID STORAGE
   * ==========================================================
   */

  if (
    involvesStudents &&
    totalEntryPoints >= 2 &&
    hasPhysical &&
    hasDigital
  ) {

    score += 12;

    factors.push(
      "Student data is collected through multiple channels and maintained across physical and digital environments."
    );

    recommendations.push(
      "Create an end-to-end student-data flow covering collection, scanning, digital storage, access, sharing, retention and deletion."
    );

    addFinding(findings, {
      id: "COMBO-001",
      category: "Governance",
      title: "Complex student-data lifecycle",
      level: "High",
      explanation:
        "Student data is collected through multiple channels and exists across both physical and digital environments. This combination increases the likelihood of duplicate records, inconsistent access controls and incomplete deletion.",
      recommendation:
        "Create an end-to-end data-flow map and establish a controlled system of record, lifecycle and deletion process.",
      scoreImpact: 12,
      evidence: [
        "Student/child data identified.",
        `${totalEntryPoints} collection entry points selected.`,
        "Physical storage identified.",
        "Digital storage identified.",
      ],
      priority: "P1",
    });

  }


  /*
   * ==========================================================
   * 28. GOOGLE FORM + GOOGLE DRIVE COMBINATION
   * ==========================================================
   */

  const googleForm =
    containsValue(
      input.collectionMethods,
      "google form"
    );

  const googleDrive =
    containsValue(
      input.storageLocations,
      "google drive"
    );


  if (
    googleForm &&
    googleDrive
  ) {

    score += 8;

    factors.push(
      "Google Form collection is combined with Google Drive storage."
    );

    recommendations.push(
      "Review Google Workspace configuration, access controls, sharing settings, retention and administrator governance."
    );

    addFinding(findings, {
      id: "COMBO-002",
      category: "Technology",
      title: "Google Form to Google Drive data flow",
      level: "Medium",
      explanation:
        "The assessment indicates that personal data may be collected using Google Forms and subsequently stored in Google Drive. This creates a connected cloud data flow requiring appropriate access, sharing and retention controls.",
      recommendation:
        "Review Google Workspace security settings, form ownership, Drive permissions, external sharing and retention controls.",
      scoreImpact: 8,
      evidence: [
        "Google Form selected as collection method.",
        "Google Drive selected as storage location.",
      ],
      priority: "P2",
    });

  }


  /*
   * ==========================================================
   * 29. EXCEL + MULTIPLE STORAGE
   * ==========================================================
   */

  const excelCollection =
    containsAny(
      input.collectionMethods,
      [
        "excel",
        "spreadsheet",
      ]
    );

  const excelStorage =
    containsAny(
      input.storageLocations,
      [
        "excel",
        "spreadsheet",
      ]
    );


  if (
    excelCollection ||
    excelStorage
  ) {

    score += 5;

    factors.push(
      "Excel or spreadsheet-based processing is part of the personal-data lifecycle."
    );

    recommendations.push(
      "Control spreadsheet access, copying, versioning, retention and secure deletion."
    );

    addFinding(findings, {
      id: "TECH-003",
      category: "Technology",
      title: "Spreadsheet-based personal-data processing",
      level: "Medium",
      explanation:
        "Spreadsheet files can create additional copies of personal data and may be stored or shared outside the organisation's primary system.",
      recommendation:
        "Define approved storage locations and access controls for spreadsheets containing personal data.",
      scoreImpact: 5,
      evidence: [
        "Excel / Spreadsheet selected in the assessment.",
      ],
      priority: "P2",
    });

  }


  /*
   * ==========================================================
   * 30. WHATSAPP + STUDENT DATA
   * ==========================================================
   */

  const whatsapp =
    containsValue(
      input.collectionMethods,
      "whatsapp"
    );


  if (
    whatsapp &&
    involvesStudents
  ) {

    score += 10;

    factors.push(
      "Student-related personal data may be collected through WhatsApp."
    );

    recommendations.push(
      "Review whether WhatsApp is an approved channel for student-data collection and define controls for retention, access and transfer into official systems."
    );

    addFinding(findings, {
      id: "COMBO-003",
      category: "Technology",
      title: "Student data through WhatsApp",
      level: "High",
      explanation:
        "Student or child-related information may be collected through WhatsApp. Informal messaging channels can create challenges around retention, access, device security, backups and data ownership.",
      recommendation:
        "Use approved controlled channels for student-data collection wherever possible and define procedures for handling information received through messaging platforms.",
      scoreImpact: 10,
      evidence: [
        "Student/child data identified.",
        "WhatsApp selected as a collection method.",
      ],
      priority: "P1",
    });

  }


  /*
   * ==========================================================
   * 31. THIRD PARTY + CROSS BORDER
   * ==========================================================
   */

  if (
    thirdPartySharing &&
    containsValue(
      input.crossBorderTransfer,
      "yes"
    )
  ) {

    score += 12;

    factors.push(
      "Third-party sharing is combined with potential cross-border processing."
    );

    recommendations.push(
      "Perform enhanced third-party due diligence and document processing locations and contractual safeguards."
    );

    addFinding(findings, {
      id: "COMBO-004",
      category: "Third Party",
      title: "Third-party processing with cross-border transfer",
      level: "High",
      explanation:
        "Personal data may be shared with third parties while also being transferred or processed outside India. This creates additional vendor-governance and transfer considerations.",
      recommendation:
        "Identify the relevant vendors and countries, review contractual controls and document the applicable transfer arrangements.",
      scoreImpact: 12,
      evidence: [
        "Third-party sharing identified.",
        "Cross-border transfer marked Yes.",
      ],
      priority: "P1",
    });

  }


  /*
   * ==========================================================
   * 32. UNKNOWN EVERYTHING / LOW VISIBILITY
   * ==========================================================
   */

  const unknownCount = [
    input.storageLocations,
    input.encryptionStatus,
    input.accessRoles,
    input.sharingStatus,
    input.retentionPeriod,
    input.deletionMethod,
    input.privacyNotice,
    input.consentStatus,
    input.parentalConsent,
    input.crossBorderTransfer,
  ].filter((values) =>
    containsValue(values, "unknown")
  ).length;


  if (unknownCount >= 4) {

    score += 12;

    factors.push(
      "Multiple important privacy-control areas are currently unknown."
    );

    recommendations.push(
      "Perform a structured discovery exercise before relying on the current risk score."
    );

    addFinding(findings, {
      id: "GOV-002",
      category: "Governance",
      title: "Limited visibility into privacy controls",
      level: "High",
      explanation:
        "Several important privacy and security control areas are unknown. Unknown conditions create uncertainty and may conceal additional risks.",
      recommendation:
        "Perform structured discovery and evidence collection for storage, access, encryption, sharing, retention, notice, consent and transfer controls.",
      scoreImpact: 12,
      evidence: [
        `${unknownCount} major assessment areas contain an Unknown response.`,
      ],
      priority: "P1",
    });

  }


  /*
   * ==========================================================
   * 33. NO ACCESS + NO RETENTION + NO DELETION
   * ==========================================================
   */

  if (
    input.accessRoles.length === 0 &&
    input.retentionPeriod.length === 0 &&
    input.deletionMethod.length === 0
  ) {

    score += 8;

    factors.push(
      "Core access and lifecycle controls have not been documented."
    );

    recommendations.push(
      "Document who can access the data, how long it is retained and how it is securely deleted."
    );

    addFinding(findings, {
      id: "GOV-003",
      category: "Governance",
      title: "Core privacy lifecycle controls are undocumented",
      level: "High",
      explanation:
        "The assessment does not establish who can access the data or how the data is retained and deleted.",
      recommendation:
        "Document access, retention and deletion controls as minimum lifecycle requirements.",
      scoreImpact: 8,
      evidence: [
        "Access roles not selected.",
        "Retention period not selected.",
        "Deletion method not selected.",
      ],
      priority: "P1",
    });

  }


  /*
   * ==========================================================
   * FINAL SCORE
   * ==========================================================
   */

  score = Math.min(
    Math.round(score),
    100
  );


  /*
   * ==========================================================
   * FINDINGS
   * ==========================================================
   */

  findings =
    uniqueFindings(findings);


  /*
   * ==========================================================
   * SORT FINDINGS
   *
   * Critical → High → Medium → Low
   * ==========================================================
   */

  const severityWeight: Record<
    RiskLevel,
    number
  > = {
    Critical: 4,
    High: 3,
    Medium: 2,
    Low: 1,
  };


  findings.sort(
    (a, b) =>
      severityWeight[b.level] -
        severityWeight[a.level] ||
      b.scoreImpact -
        a.scoreImpact
  );


  /*
   * ==========================================================
   * CATEGORY SCORE CALCULATION
   * ==========================================================
   *
   * We derive category scores from the findings rather than
   * simply dividing the overall score.
   *
   * This means one category can be High while another remains
   * Low.
   * ==========================================================
   */

  const categoryMap =
    new Map<
      RiskCategory,
      number
    >();


  findings.forEach(
    (finding) => {

      const existing =
        categoryMap.get(
          finding.category
        ) || 0;

      categoryMap.set(
        finding.category,
        Math.min(
          existing +
            finding.scoreImpact,
          100
        )
      );

    }
  );


  const allCategories: RiskCategory[] = [
    "Data Sensitivity",
    "Data Subject",
    "Collection",
    "Physical Security",
    "Technology",
    "Storage",
    "Access Control",
    "Third Party",
    "Retention",
    "Transparency",
    "Consent / Lawful Basis",
    "Child Privacy",
    "Cross-Border Transfer",
    "Governance",
  ];


  const categoryScores: CategoryScore[] =
    allCategories.map(
      (category) => {

        const categoryScore =
          Math.min(
            categoryMap.get(
              category
            ) || 0,
            100
          );

        return {
          category,
          score: categoryScore,
          level:
            getRiskLevel(
              categoryScore
            ),
        };

      }
    );


  /*
   * ==========================================================
   * OVERALL LEVEL
   * ==========================================================
   */

  const overallLevel =
    getRiskLevel(score);


  /*
   * ==========================================================
   * FACTORS
   * ==========================================================
   */

  const finalFactors =
    uniqueStrings(
      factors
    );


  /*
   * ==========================================================
   * RECOMMENDATIONS
   * ==========================================================
   */

  const finalRecommendations =
    uniqueStrings(
      recommendations
    );


  /*
   * ==========================================================
   * RETURN
   * ==========================================================
   */

  return {

    score,

    /*
     * Compatibility with older implementation.
     */
    level: overallLevel,

    overallLevel,

    factors:
      finalFactors,

    recommendations:
      finalRecommendations,

    findings:
      findings.map(
        (finding) => ({
          id: finding.id,
          category: finding.category,
          title: finding.title,
          level: finding.level,
          explanation: finding.explanation,
          recommendation:
            finding.recommendation,
          scoreImpact:
            finding.scoreImpact,
          evidence:
            finding.evidence,
          priority:
            finding.priority,
        })
      ),

    categoryScores,

  };
}
