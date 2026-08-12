export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export type RiskFinding = {
  id: string;
  category: string;
  title: string;
  level: RiskLevel;
  explanation: string;
  recommendation: string;
};

export type RiskCategoryScore = {
  category: string;
  score: number;
  level: RiskLevel;
};

export type RiskResult = {
  score: number;
  overallLevel: RiskLevel;
  findings: RiskFinding[];
  categoryScores: RiskCategoryScore[];
};

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
 * IMPORTANT
 * ----------
 * These property names intentionally match app/assessment/page.tsx.
 *
 * Do not rename:
 * collectionFormats
 * encryptionStatuses
 * sharingStatuses
 * retentionPeriods
 * deletionMethods
 * privacyNotices
 * consentStatuses
 * parentalConsentStatuses
 * crossBorderTransfers
 */

export type PrivacyRiskInput = {
  selectedEntryPoints: string[];
  customEntryPoints: EntryPoint[];

  selectedFields: string[];
  customFields: Field[];

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

/* ---------------------------------------------------------
 * HELPERS
 * --------------------------------------------------------- */

function containsValue(
  values: string[] | undefined,
  search: string
): boolean {
  if (!values || values.length === 0) {
    return false;
  }

  return values.some((value) =>
    value.toLowerCase().includes(search.toLowerCase())
  );
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values));
}

function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)));
}

function getRiskLevel(score: number): RiskLevel {
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

/* ---------------------------------------------------------
 * FINDING FACTORY
 * --------------------------------------------------------- */

function createFinding(
  id: string,
  category: string,
  title: string,
  level: RiskLevel,
  explanation: string,
  recommendation: string
): RiskFinding {
  return {
    id,
    category,
    title,
    level,
    explanation,
    recommendation,
  };
}

/* ---------------------------------------------------------
 * MAIN PRIVACY RISK ENGINE
 * --------------------------------------------------------- */

export function calculatePrivacyRisk(
  input: PrivacyRiskInput
): RiskResult {
  let score = 0;

  const findings: RiskFinding[] = [];
  const categoryScores: RiskCategoryScore[] = [];

  /*
   * -------------------------------------------------------
   * 1. DATA COLLECTION / ENTRY POINTS
   * -------------------------------------------------------
   */

  const totalEntryPoints =
    input.selectedEntryPoints.length +
    input.customEntryPoints.length;

  let collectionScore = 0;

  if (totalEntryPoints >= 4) {
    collectionScore += 80;

    findings.push(
      createFinding(
        "COL-001",
        "Data Collection",
        "Multiple personal-data entry points",
        "High",
        "Personal data enters the organisation through multiple collection channels. Each channel can introduce different privacy, security and governance risks.",
        "Maintain a consolidated inventory of all personal-data entry points and document the controls applicable to each channel."
      )
    );
  } else if (totalEntryPoints >= 2) {
    collectionScore += 45;

    findings.push(
      createFinding(
        "COL-001",
        "Data Collection",
        "Multiple personal-data entry points",
        "Medium",
        "Personal data is collected through more than one entry point.",
        "Ensure that all collection channels are included in the privacy and data-flow inventory."
      )
    );
  }

  /*
   * -------------------------------------------------------
   * 2. PERSONAL DATA VOLUME
   * -------------------------------------------------------
   */

  const totalFields =
    input.selectedFields.length +
    input.customFields.length;

  let dataVolumeScore = 0;

  if (totalFields >= 10) {
    dataVolumeScore = 80;

    findings.push(
      createFinding(
        "DAT-001",
        "Personal Data",
        "Large number of personal-data fields",
        "High",
        "The assessed process collects a relatively large number of personal-data fields.",
        "Review every field for necessity, proportionality, purpose and retention requirements."
      )
    );
  } else if (totalFields >= 5) {
    dataVolumeScore = 45;

    findings.push(
      createFinding(
        "DAT-001",
        "Personal Data",
        "Multiple personal-data fields",
        "Medium",
        "The process collects multiple categories of personal data.",
        "Confirm that each collected field is necessary for the stated business purpose."
      )
    );
  } else if (totalFields > 0) {
    dataVolumeScore = 15;
  }

  /*
   * -------------------------------------------------------
   * 3. DATA SUBJECTS
   * -------------------------------------------------------
   */

  let dataSubjectScore = 0;

  const hasStudentData =
    containsValue(input.dataSubjectTypes, "student") ||
    containsValue(input.dataSubjectTypes, "child") ||
    containsValue(input.dataSubjectTypes, "minor");

  const hasParentData =
    containsValue(input.dataSubjectTypes, "parent") ||
    containsValue(input.dataSubjectTypes, "guardian");

  if (hasStudentData) {
    dataSubjectScore += 65;

    findings.push(
      createFinding(
        "SUB-001",
        "Data Subjects",
        "Student / child personal data",
        "High",
        "The processing involves student, child or minor-related personal data.",
        "Apply enhanced safeguards to child-related processing and verify appropriate parent/guardian controls."
      )
    );
  }

  if (hasParentData) {
    dataSubjectScore += 15;

    findings.push(
      createFinding(
        "SUB-002",
        "Data Subjects",
        "Parent / guardian personal data",
        "Medium",
        "Parent or guardian personal data is included in the assessed processing activity.",
        "Ensure parent/guardian data is collected only for defined purposes and is subject to appropriate access and retention controls."
      )
    );
  }

  dataSubjectScore = Math.min(dataSubjectScore, 100);

  /*
   * -------------------------------------------------------
   * 4. MULTIPLE COLLECTOR ROLES
   * -------------------------------------------------------
   */

  let peopleScore = 0;

  if (input.collectorRoles.length >= 5) {
    peopleScore = 75;

    findings.push(
      createFinding(
        "PEO-001",
        "People & Roles",
        "Large number of personnel involved in collection",
        "High",
        "Multiple organisational roles may collect personal data.",
        "Define clear responsibilities and role-based access requirements for every collection role."
      )
    );
  } else if (input.collectorRoles.length >= 3) {
    peopleScore = 45;

    findings.push(
      createFinding(
        "PEO-001",
        "People & Roles",
        "Multiple personnel involved in collection",
        "Medium",
        "Multiple employee or organisational roles may collect personal data.",
        "Document collection responsibilities and apply least-privilege principles."
      )
    );
  }

  /*
   * -------------------------------------------------------
   * 5. COLLECTION FORMATS
   * -------------------------------------------------------
   */

  let collectionFormatScore = 0;

  const hasPhysicalCollection =
    containsValue(input.collectionFormats, "paper") ||
    containsValue(input.collectionFormats, "physical") ||
    containsValue(input.collectionFormats, "in person") ||
    containsValue(input.collectionFormats, "verbal");

  const hasDigitalCollection =
    containsValue(input.collectionFormats, "website") ||
    containsValue(input.collectionFormats, "google form") ||
    containsValue(input.collectionFormats, "mobile") ||
    containsValue(input.collectionFormats, "app") ||
    containsValue(input.collectionFormats, "whatsapp") ||
    containsValue(input.collectionFormats, "email") ||
    containsValue(input.collectionFormats, "excel") ||
    containsValue(input.collectionFormats, "spreadsheet");

  if (hasPhysicalCollection) {
    collectionFormatScore += 45;

    findings.push(
      createFinding(
        "COL-002",
        "Data Collection",
        "Physical personal-data collection",
        "Medium",
        "Personal data may be collected through paper, physical or in-person processes.",
        "Review physical security, access, transportation, scanning, storage and secure disposal of paper records."
      )
    );
  }

  if (hasDigitalCollection) {
    collectionFormatScore += 25;
  }

  if (
    hasPhysicalCollection &&
    hasDigitalCollection
  ) {
    collectionFormatScore += 30;

    findings.push(
      createFinding(
        "COL-003",
        "Data Collection",
        "Hybrid physical and digital collection",
        "High",
        "Personal data may be collected through both physical and digital channels. This creates additional opportunities for data duplication, uncontrolled copies and inconsistent security controls.",
        "Map the complete journey from physical/digital collection through scanning, uploading, transcription, system entry and disposal."
      )
    );
  }

  if (input.collectionFormats.length === 0) {
    collectionFormatScore = 25;

    findings.push(
      createFinding(
        "COL-004",
        "Data Collection",
        "Collection method not documented",
        "Medium",
        "The method used to collect personal data has not been documented.",
        "Document the collection method for every personal-data entry point."
      )
    );
  }

  collectionFormatScore = Math.min(
    collectionFormatScore,
    100
  );

  /*
   * -------------------------------------------------------
   * 6. STORAGE LOCATIONS
   * -------------------------------------------------------
   */

  let storageScore = 0;

  if (input.storageLocations.length >= 5) {
    storageScore = 80;

    findings.push(
      createFinding(
        "STO-001",
        "Storage",
        "Personal data stored across multiple systems",
        "High",
        "Personal data may be distributed across several applications, repositories or physical records.",
        "Create a data inventory showing every system, repository and physical location containing personal data."
      )
    );
  } else if (input.storageLocations.length >= 3) {
    storageScore = 55;

    findings.push(
      createFinding(
        "STO-001",
        "Storage",
        "Multiple personal-data repositories",
        "Medium",
        "Personal data may be stored across multiple repositories.",
        "Maintain an inventory of all repositories and establish consistent security and retention controls."
      )
    );
  } else if (input.storageLocations.length > 0) {
    storageScore = 20;
  }

  if (
    containsValue(
      input.storageLocations,
      "unknown"
    )
  ) {
    storageScore += 30;

    findings.push(
      createFinding(
        "STO-002",
        "Storage",
        "Unknown storage location",
        "High",
        "The storage location of personal data is not fully known.",
        "Identify all systems, applications, devices and physical locations where personal data is stored."
      )
    );
  }

  /*
   * -------------------------------------------------------
   * 7. STORAGE ENVIRONMENT
   * -------------------------------------------------------
   */

  let environmentScore = 0;

  if (input.storageEnvironments.length >= 3) {
    environmentScore = 75;

    findings.push(
      createFinding(
        "STO-003",
        "Storage",
        "Multiple storage environments",
        "High",
        "Personal data may be stored across multiple environments such as cloud, on-premises, employee devices or physical records.",
        "Map movement of personal data between all storage environments and verify that equivalent security controls exist."
      )
    );
  } else if (input.storageEnvironments.length >= 2) {
    environmentScore = 45;

    findings.push(
      createFinding(
        "STO-003",
        "Storage",
        "Multiple storage environments",
        "Medium",
        "Personal data may be stored across more than one environment.",
        "Document data movement between physical, cloud, on-premises and device environments."
      )
    );
  }

  if (
    containsValue(
      input.storageEnvironments,
      "physical"
    )
  ) {
    environmentScore += 20;

    findings.push(
      createFinding(
        "STO-004",
        "Physical Security",
        "Physical records may contain personal data",
        "Medium",
        "Physical records may contain personal data.",
        "Review physical access controls, secure storage, visitor controls, retention and secure disposal."
      )
    );
  }

  if (
    containsValue(
      input.storageEnvironments,
      "unknown"
    )
  ) {
    environmentScore += 25;

    findings.push(
      createFinding(
        "STO-005",
        "Storage",
        "Storage environment is unknown",
        "High",
        "The environment in which personal data is stored is not fully known.",
        "Identify the underlying infrastructure and physical or cloud environment supporting the processing activity."
      )
    );
  }

  /*
   * -------------------------------------------------------
   * 8. HYBRID STORAGE DETECTION
   * -------------------------------------------------------
   */

  const hasPhysicalStorage =
    containsValue(
      input.storageLocations,
      "paper"
    ) ||
    containsValue(
      input.storageLocations,
      "physical"
    ) ||
    containsValue(
      input.storageEnvironments,
      "physical"
    );

  const hasDigitalStorage =
    input.storageLocations.some(
      (value) =>
        !containsValue(
          [value],
          "paper"
        ) &&
        !containsValue(
          [value],
          "physical"
        )
    );

  if (
    hasPhysicalStorage &&
    hasDigitalStorage
  ) {
    environmentScore += 25;

    findings.push(
      createFinding(
        "STO-006",
        "Storage",
        "Hybrid physical and digital storage",
        "High",
        "Personal data appears to exist in both physical and digital storage locations.",
        "Document the conversion and movement of records between paper and digital formats, including scanning, uploading and disposal of originals."
      )
    );
  }

  environmentScore = Math.min(
    environmentScore,
    100
  );

  /*
   * -------------------------------------------------------
   * 9. ENCRYPTION
   * -------------------------------------------------------
   */

  let encryptionScore = 0;

  if (
    containsValue(
      input.encryptionStatuses,
      "clear text"
    ) ||
    containsValue(
      input.encryptionStatuses,
      "not encrypted"
    )
  ) {
    encryptionScore = 100;

    findings.push(
      createFinding(
        "SEC-001",
        "Security",
        "Personal data may not be encrypted",
        "Critical",
        "Personal data may be stored or transmitted without adequate encryption.",
        "Evaluate encryption controls for personal data at rest and in transit and address identified gaps."
      )
    );
  } else if (
    containsValue(
      input.encryptionStatuses,
      "unknown"
    )
  ) {
    encryptionScore = 60;

    findings.push(
      createFinding(
        "SEC-002",
        "Security",
        "Encryption status is unknown",
        "High",
        "The organisation has not established whether personal data is adequately encrypted.",
        "Confirm encryption controls for personal data at rest and in transit."
      )
    );
  } else if (
    containsValue(
      input.encryptionStatuses,
      "at rest only"
    ) ||
    containsValue(
      input.encryptionStatuses,
      "in transit only"
    )
  ) {
    encryptionScore = 55;

    findings.push(
      createFinding(
        "SEC-003",
        "Security",
        "Incomplete encryption coverage",
        "High",
        "Encryption appears to cover only part of the data lifecycle.",
        "Assess encryption requirements for both data at rest and data in transit."
      )
    );
  } else if (
    containsValue(
      input.encryptionStatuses,
      "encrypted"
    )
  ) {
    encryptionScore = 10;
  }

  /*
   * -------------------------------------------------------
   * 10. ACCESS CONTROL
   * -------------------------------------------------------
   */

  let accessScore = 0;

  if (input.accessRoles.length === 0) {
    accessScore = 70;

    findings.push(
      createFinding(
        "ACC-001",
        "Access Control",
        "Access roles not defined",
        "High",
        "The people or roles that can access personal data have not been documented.",
        "Define role-based access to personal data and periodically review access rights."
      )
    );
  } else if (
    containsValue(
      input.accessRoles,
      "unknown"
    )
  ) {
    accessScore = 65;

    findings.push(
      createFinding(
        "ACC-002",
        "Access Control",
        "Access roles are unknown",
        "High",
        "The organisation does not have sufficient visibility into who can access the personal data.",
        "Identify all roles and systems with access and apply least-privilege principles."
      )
    );
  } else if (input.accessRoles.length >= 5) {
    accessScore = 55;

    findings.push(
      createFinding(
        "ACC-003",
        "Access Control",
        "Broad access to personal data",
        "Medium",
        "A relatively large number of roles may have access to personal data.",
        "Review access rights and restrict access to personnel with a legitimate business need."
      )
    );
  } else {
    accessScore = 15;
  }

  /*
   * -------------------------------------------------------
   * 11. DATA SHARING
   * -------------------------------------------------------
   */

  let sharingScore = 0;

  if (
    containsValue(
      input.sharingStatuses,
      "multiple third parties"
    )
  ) {
    sharingScore = 90;

    findings.push(
      createFinding(
        "SHR-001",
        "Data Sharing",
        "Personal data shared with multiple third parties",
        "Critical",
        "Personal data may be shared with multiple external organisations, increasing third-party privacy and security exposure.",
        "Maintain a processor and third-party inventory and review contractual, privacy and security obligations."
      )
    );
  } else if (
    containsValue(
      input.sharingStatuses,
      "service provider"
    ) ||
    containsValue(
      input.sharingStatuses,
      "third party"
    )
  ) {
    sharingScore = 60;

    findings.push(
      createFinding(
        "SHR-002",
        "Data Sharing",
        "Third-party data sharing",
        "High",
        "Personal data may be shared with external service providers or third parties.",
        "Identify all recipients and verify contractual privacy, security and data-processing obligations."
      )
    );
  }

  if (
    containsValue(
      input.sharingStatuses,
      "unknown"
    )
  ) {
    sharingScore = Math.max(
      sharingScore,
      55
    );

    findings.push(
      createFinding(
        "SHR-003",
        "Data Sharing",
        "Data-sharing arrangements are unknown",
        "High",
        "The organisation does not have complete visibility into who receives the personal data.",
        "Identify all internal and external recipients of personal data."
      )
    );
  }

  /*
   * -------------------------------------------------------
   * 12. RETENTION
   * -------------------------------------------------------
   */

  let retentionScore = 0;

  if (
    containsValue(
      input.retentionPeriods,
      "indefinitely"
    ) ||
    containsValue(
      input.retentionPeriods,
      "no defined"
    )
  ) {
    retentionScore = 85;

    findings.push(
      createFinding(
        "RET-001",
        "Retention",
        "Undefined or indefinite retention",
        "High",
        "Personal data may be retained indefinitely or without a defined retention period.",
        "Define retention periods based on business, legal and regulatory requirements and periodically review retained records."
      )
    );
  } else if (
    containsValue(
      input.retentionPeriods,
      "more than 5"
    )
  ) {
    retentionScore = 55;

    findings.push(
      createFinding(
        "RET-002",
        "Retention",
        "Long personal-data retention",
        "Medium",
        "The assessed process may retain personal data for more than five years.",
        "Validate whether the retention period remains necessary and document the justification."
      )
    );
  } else if (
    containsValue(
      input.retentionPeriods,
      "unknown"
    )
  ) {
    retentionScore = 60;

    findings.push(
      createFinding(
        "RET-003",
        "Retention",
        "Retention period is unknown",
        "High",
        "The organisation does not have sufficient visibility into how long personal data is retained.",
        "Document retention periods for each category of personal data."
      )
    );
  }

  /*
   * -------------------------------------------------------
   * 13. DELETION
   * -------------------------------------------------------
   */

  let deletionScore = 0;

  if (
    containsValue(
      input.deletionMethods,
      "no defined"
    )
  ) {
    deletionScore = 85;

    findings.push(
      createFinding(
        "DEL-001",
        "Deletion",
        "No defined deletion process",
        "High",
        "There may be no documented process for deleting or securely disposing of personal data.",
        "Define secure deletion and disposal procedures covering both physical and digital records."
      )
    );
  } else if (
    containsValue(
      input.deletionMethods,
      "unknown"
    )
  ) {
    deletionScore = 65;

    findings.push(
      createFinding(
        "DEL-002",
        "Deletion",
        "Deletion process is unknown",
        "High",
        "The organisation has not established how personal data is deleted or disposed of.",
        "Document deletion and disposal processes and assign ownership."
      )
    );
  } else if (
    input.deletionMethods.length > 0
  ) {
    deletionScore = 15;
  }

  /*
   * -------------------------------------------------------
   * 14. PRIVACY NOTICE
   * -------------------------------------------------------
   */

  let noticeScore = 0;

  if (
    containsValue(
      input.privacyNotices,
      "no"
    )
  ) {
    noticeScore = 85;

    findings.push(
      createFinding(
        "GOV-001",
        "Privacy Governance",
        "Privacy notice may not be provided",
        "High",
        "A privacy notice does not appear to be provided for the assessed processing activity.",
        "Review privacy notices provided at or before collection and ensure they accurately describe the processing."
      )
    );
  } else if (
    containsValue(
      input.privacyNotices,
      "partially"
    )
  ) {
    noticeScore = 60;

    findings.push(
      createFinding(
        "GOV-002",
        "Privacy Governance",
        "Incomplete privacy notice coverage",
        "High",
        "Privacy-notice coverage may be incomplete.",
        "Review collection points and ensure appropriate notices are provided consistently."
      )
    );
  } else if (
    containsValue(
      input.privacyNotices,
      "unknown"
    )
  ) {
    noticeScore = 55;

    findings.push(
      createFinding(
        "GOV-003",
        "Privacy Governance",
        "Privacy notice status is unknown",
        "Medium",
        "The organisation has not established whether appropriate privacy notices are provided.",
        "Confirm privacy-notice coverage across all collection channels."
      )
    );
  }

  /*
   * -------------------------------------------------------
   * 15. CONSENT / LAWFUL BASIS
   * -------------------------------------------------------
   */

  let consentScore = 0;

  if (
    containsValue(
      input.consentStatuses,
      "no"
    )
  ) {
    consentScore = 80;

    findings.push(
      createFinding(
        "LAW-001",
        "Lawful Basis",
        "Consent status may require review",
        "High",
        "Consent may not be obtained for a processing activity where consent is being relied upon.",
        "Validate the applicable legal basis and document the organisation's basis for processing."
      )
    );
  } else if (
    containsValue(
      input.consentStatuses,
      "unknown"
    )
  ) {
    consentScore = 55;

    findings.push(
      createFinding(
        "LAW-002",
        "Lawful Basis",
        "Lawful basis is unclear",
        "High",
        "The organisation has not established the consent or other lawful basis applicable to the processing.",
        "Document the purpose and applicable legal basis for each processing activity."
      )
    );
  } else if (
    containsValue(
      input.consentStatuses,
      "partially"
    )
  ) {
    consentScore = 50;

    findings.push(
      createFinding(
        "LAW-003",
        "Lawful Basis",
        "Consent coverage is incomplete",
        "Medium",
        "Consent or lawful-basis controls may not cover all applicable processing activities.",
        "Review the processing inventory and map each activity to an appropriate lawful basis."
      )
    );
  }

  /*
   * -------------------------------------------------------
   * 16. PARENT / GUARDIAN CONTROLS
   * -------------------------------------------------------
   */

  let parentalScore = 0;

  if (hasStudentData) {
    if (
      containsValue(
        input.parentalConsentStatuses,
        "no"
      )
    ) {
      parentalScore = 100;

      findings.push(
        createFinding(
          "CHD-001",
          "Child Data",
          "Parent / guardian controls may be inadequate",
          "Critical",
          "Student or child-related processing has been identified, but parent/guardian involvement is indicated as not being adequately addressed.",
          "Review applicable child-data requirements and establish appropriate parent/guardian controls."
        )
      );
    } else if (
      containsValue(
        input.parentalConsentStatuses,
        "partially"
      )
    ) {
      parentalScore = 70;

      findings.push(
        createFinding(
          "CHD-002",
          "Child Data",
          "Parent / guardian controls are incomplete",
          "High",
          "Parent/guardian controls for child-related processing may be only partially implemented.",
          "Identify gaps in parent/guardian verification, communication and consent/authorisation processes."
        )
      );
    } else if (
      containsValue(
        input.parentalConsentStatuses,
        "unknown"
      )
    ) {
      parentalScore = 65;

      findings.push(
        createFinding(
          "CHD-003",
          "Child Data",
          "Parent / guardian controls are unknown",
          "High",
          "The organisation has not established how parent/guardian requirements are handled for child-related personal data.",
          "Document and validate the parent/guardian process for student and child-related data."
        )
      );
    }
  }

  /*
   * -------------------------------------------------------
   * 17. CROSS-BORDER TRANSFERS
   * -------------------------------------------------------
   */

  let transferScore = 0;

  if (
    containsValue(
      input.crossBorderTransfers,
      "yes"
    )
  ) {
    transferScore = 65;

    findings.push(
      createFinding(
        "TRF-001",
        "Data Transfers",
        "Potential cross-border data transfer",
        "High",
        "Personal data may be transferred outside India through cloud services, SaaS platforms, service providers or other processing arrangements.",
        "Identify countries, cloud services and processors involved and assess applicable transfer and contractual requirements."
      )
    );
  } else if (
    containsValue(
      input.crossBorderTransfers,
      "unknown"
    )
  ) {
    transferScore = 45;

    findings.push(
      createFinding(
        "TRF-002",
        "Data Transfers",
        "Cross-border transfer status is unknown",
        "Medium",
        "The organisation does not have sufficient visibility into whether personal data leaves India.",
        "Review cloud, SaaS, email, collaboration and third-party services to determine the geographic flow of personal data."
      )
    );
  }

  /*
   * -------------------------------------------------------
   * CATEGORY SCORES
   * -------------------------------------------------------
   */

  categoryScores.push(
    {
      category: "Data Collection",
      score: clampScore(
        collectionScore
      ),
      level: getRiskLevel(
        collectionScore
      ),
    },
    {
      category: "Personal Data",
      score: clampScore(
        dataVolumeScore
      ),
      level: getRiskLevel(
        dataVolumeScore
      ),
    },
    {
      category: "Data Subjects",
      score: clampScore(
        dataSubjectScore
      ),
      level: getRiskLevel(
        dataSubjectScore
      ),
    },
    {
      category: "People & Roles",
      score: clampScore(
        peopleScore
      ),
      level: getRiskLevel(
        peopleScore
      ),
    },
    {
      category: "Storage",
      score: clampScore(
        Math.max(
          storageScore,
          environmentScore
        )
      ),
      level: getRiskLevel(
        Math.max(
          storageScore,
          environmentScore
        )
      ),
    },
    {
      category: "Security",
      score: clampScore(
        Math.max(
          encryptionScore,
          accessScore
        )
      ),
      level: getRiskLevel(
        Math.max(
          encryptionScore,
          accessScore
        )
      ),
    },
    {
      category: "Data Sharing",
      score: clampScore(
        sharingScore
      ),
      level: getRiskLevel(
        sharingScore
      ),
    },
    {
      category: "Retention & Deletion",
      score: clampScore(
        Math.max(
          retentionScore,
          deletionScore
        )
      ),
      level: getRiskLevel(
        Math.max(
          retentionScore,
          deletionScore
        )
      ),
    },
    {
      category: "Privacy Governance",
      score: clampScore(
        Math.max(
          noticeScore,
          consentScore
        )
      ),
      level: getRiskLevel(
        Math.max(
          noticeScore,
          consentScore
        )
      ),
    },
    {
      category: "Child Data",
      score: clampScore(
        parentalScore
      ),
      level: getRiskLevel(
        parentalScore
      ),
    },
    {
      category: "Data Transfers",
      score: clampScore(
        transferScore
      ),
      level: getRiskLevel(
        transferScore
      ),
    }
  );

  /*
   * -------------------------------------------------------
   * OVERALL SCORE
   * -------------------------------------------------------
   *
   * The assessment deliberately considers the highest-risk
   * areas rather than simply adding every finding together.
   *
   * This prevents a long questionnaire from automatically
   * producing a Critical result merely because many fields
   * were selected.
   */

  const categoryValues =
    categoryScores.map(
      (category) => category.score
    );

  const highestCategory =
    categoryValues.length > 0
      ? Math.max(...categoryValues)
      : 0;

  const averageCategory =
    categoryValues.length > 0
      ? categoryValues.reduce(
          (sum, value) =>
            sum + value,
          0
        ) / categoryValues.length
      : 0;

  const findingAdjustment = Math.min(
    findings.length * 2,
    15
  );

  let overallScore =
    highestCategory * 0.55 +
    averageCategory * 0.30 +
    findingAdjustment;

  /*
   * Important risk escalators.
   */

  if (
    hasStudentData &&
    (
      parentalScore >= 70 ||
      consentScore >= 80
    )
  ) {
    overallScore = Math.max(
      overallScore,
      65
    );
  }

  if (
    encryptionScore >= 100
  ) {
    overallScore = Math.max(
      overallScore,
      75
    );
  }

  if (
    hasPhysicalCollection &&
    hasDigitalCollection &&
    hasPhysicalStorage &&
    hasDigitalStorage
  ) {
    overallScore = Math.max(
      overallScore,
      50
    );
  }

  const finalScore =
    clampScore(overallScore);

  const overallLevel =
    getRiskLevel(finalScore);

  /*
   * -------------------------------------------------------
   * DEDUPLICATE FINDINGS
   * -------------------------------------------------------
   */

  const uniqueFindings =
    findings.filter(
      (finding, index, array) =>
        array.findIndex(
          (item) =>
            item.id === finding.id
        ) === index
    );

  /*
   * -------------------------------------------------------
   * RETURN RESULT
   * -------------------------------------------------------
   */

  return {
    score: finalScore,
    overallLevel,
    findings: uniqueFindings,
    categoryScores,
  };
}
