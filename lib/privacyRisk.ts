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

/*
 * ---------------------------------------------------------
 * INPUT TYPES
 * ---------------------------------------------------------
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

export type PrivacyRiskInput = {
  selectedEntryPoints: string[];
  customEntryPoints: EntryPoint[];

  selectedFields: string[];
  customFields: Field[];

  /*
   * STEP 6
   */
  collectorRoles?: string[];
  dataSubjectTypes?: string[];

  collectionFormats?: string[];

  storageLocations?: string[];
  storageEnvironments?: string[];

  encryptionStatuses?: string[];

  accessRoles?: string[];

  sharingStatuses?: string[];

  retentionPeriods?: string[];

  deletionMethods?: string[];

  privacyNotices?: string[];

  consentStatuses?: string[];

  parentalConsentStatuses?: string[];

  crossBorderTransfers?: string[];
};

/*
 * ---------------------------------------------------------
 * HELPER FUNCTIONS
 * ---------------------------------------------------------
 */

function valuesOrEmpty(values?: string[]): string[] {
  return Array.isArray(values) ? values : [];
}

function containsValue(
  values: string[] | undefined,
  search: string
): boolean {
  const safeValues = valuesOrEmpty(values);

  return safeValues.some((value) =>
    value.toLowerCase().includes(search.toLowerCase())
  );
}

function addFinding(
  findings: RiskFinding[],
  id: string,
  category: string,
  title: string,
  level: RiskLevel,
  explanation: string,
  recommendation: string
) {
  findings.push({
    id,
    category,
    title,
    level,
    explanation,
    recommendation,
  });
}

function levelFromScore(score: number): RiskLevel {
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

function categoryLevel(score: number): RiskLevel {
  return levelFromScore(score);
}

/*
 * ---------------------------------------------------------
 * PRIVACY RISK ENGINE
 * ---------------------------------------------------------
 */

export function calculatePrivacyRisk(
  input: PrivacyRiskInput
): RiskResult {
  let overallScore = 0;

  const findings: RiskFinding[] = [];

  /*
   * -------------------------------------------------------
   * NORMALISE INPUT
   * -------------------------------------------------------
   */

  const collectorRoles = valuesOrEmpty(input.collectorRoles);
  const dataSubjectTypes = valuesOrEmpty(input.dataSubjectTypes);
  const collectionFormats = valuesOrEmpty(input.collectionFormats);

  const storageLocations = valuesOrEmpty(input.storageLocations);
  const storageEnvironments = valuesOrEmpty(
    input.storageEnvironments
  );

  const encryptionStatuses = valuesOrEmpty(
    input.encryptionStatuses
  );

  const accessRoles = valuesOrEmpty(input.accessRoles);

  const sharingStatuses = valuesOrEmpty(
    input.sharingStatuses
  );

  const retentionPeriods = valuesOrEmpty(
    input.retentionPeriods
  );

  const deletionMethods = valuesOrEmpty(
    input.deletionMethods
  );

  const privacyNotices = valuesOrEmpty(
    input.privacyNotices
  );

  const consentStatuses = valuesOrEmpty(
    input.consentStatuses
  );

  const parentalConsentStatuses = valuesOrEmpty(
    input.parentalConsentStatuses
  );

  const crossBorderTransfers = valuesOrEmpty(
    input.crossBorderTransfers
  );

  const totalEntryPoints =
    input.selectedEntryPoints.length +
    input.customEntryPoints.length;

  const totalFields =
    input.selectedFields.length +
    input.customFields.length;

  /*
   * -------------------------------------------------------
   * CATEGORY 1
   * DATA COLLECTION COMPLEXITY
   * -------------------------------------------------------
   */

  let collectionScore = 0;

  if (totalEntryPoints >= 4) {
    collectionScore += 60;
  } else if (totalEntryPoints >= 2) {
    collectionScore += 35;
  } else if (totalEntryPoints === 1) {
    collectionScore += 15;
  }

  if (collectionFormats.length >= 4) {
    collectionScore += 25;
  } else if (collectionFormats.length >= 2) {
    collectionScore += 15;
  }

  if (collectorRoles.length >= 4) {
    collectionScore += 15;
  } else if (collectorRoles.length >= 2) {
    collectionScore += 8;
  }

  collectionScore = Math.min(collectionScore, 100);

  overallScore += Math.round(collectionScore * 0.12);

  if (totalEntryPoints >= 2) {
    addFinding(
      findings,
      "COLLECTION-MULTIPLE-ENTRY",
      "Data Collection",
      "Multiple personal-data collection channels",
      collectionScore >= 60 ? "High" : "Medium",
      "Personal data enters the organisation through multiple channels. Different collection channels can create inconsistent privacy notices, controls, ownership and retention practices.",
      "Maintain a consolidated inventory of all personal-data entry points and ensure appropriate privacy controls exist for each channel."
    );
  }

  if (collectionFormats.length >= 2) {
    addFinding(
      findings,
      "COLLECTION-MULTIPLE-FORMATS",
      "Data Collection",
      "Multiple collection formats are used",
      collectionFormats.length >= 4 ? "High" : "Medium",
      "The process uses multiple collection formats such as web forms, Google Forms, email, paper, verbal collection or spreadsheets.",
      "Document the data flow for each collection format and ensure consistent privacy, security and retention controls."
    );
  }

  /*
   * -------------------------------------------------------
   * CATEGORY 2
   * DATA VOLUME / DATA MINIMISATION
   * -------------------------------------------------------
   */

  let dataVolumeScore = 0;

  if (totalFields >= 15) {
    dataVolumeScore = 100;
  } else if (totalFields >= 10) {
    dataVolumeScore = 75;
  } else if (totalFields >= 5) {
    dataVolumeScore = 45;
  } else if (totalFields > 0) {
    dataVolumeScore = 20;
  }

  overallScore += Math.round(dataVolumeScore * 0.10);

  if (totalFields >= 10) {
    addFinding(
      findings,
      "DATA-VOLUME",
      "Data Minimisation",
      "Large number of personal-data fields",
      totalFields >= 15 ? "High" : "Medium",
      "The assessed process collects a relatively large number of personal-data fields.",
      "Review each field for necessity, purpose, proportionality and retention requirements."
    );
  }

  /*
   * -------------------------------------------------------
   * CATEGORY 3
   * CHILD / STUDENT DATA
   * -------------------------------------------------------
   */

  let childDataScore = 0;

  const involvesStudentOrChild =
    containsValue(dataSubjectTypes, "student") ||
    containsValue(dataSubjectTypes, "child") ||
    containsValue(dataSubjectTypes, "minor");

  if (involvesStudentOrChild) {
    childDataScore = 60;

    overallScore += 9;

    addFinding(
      findings,
      "CHILD-DATA",
      "Data Subjects",
      "Student or child-related personal data",
      "High",
      "The processing involves students, children or minors. Such processing requires additional attention to transparency, parental or guardian involvement and appropriate safeguards.",
      "Review child-data processing requirements and ensure appropriate parent/guardian controls and age-appropriate privacy information."
    );
  }

  /*
   * -------------------------------------------------------
   * CATEGORY 4
   * MULTIPLE PEOPLE / ROLES
   * -------------------------------------------------------
   */

  let roleScore = 0;

  if (collectorRoles.length >= 4) {
    roleScore = 75;
  } else if (collectorRoles.length >= 2) {
    roleScore = 45;
  } else if (collectorRoles.length === 1) {
    roleScore = 20;
  }

  if (collectorRoles.length >= 3) {
    overallScore += 5;

    addFinding(
      findings,
      "MULTIPLE-COLLECTOR-ROLES",
      "Access & Responsibility",
      "Multiple organisational roles collect personal data",
      "Medium",
      "Several organisational roles may collect personal data. This increases the possibility of inconsistent handling and unclear accountability.",
      "Define responsibilities and role-based access for each data-collection role."
    );
  }

  /*
   * -------------------------------------------------------
   * CATEGORY 5
   * PHYSICAL / DIGITAL / HYBRID COLLECTION
   * -------------------------------------------------------
   */

  let physicalHandlingScore = 0;

  const physicalCollection =
    containsValue(collectionFormats, "paper") ||
    containsValue(collectionFormats, "physical") ||
    containsValue(collectionFormats, "in person");

  const digitalCollection =
    containsValue(collectionFormats, "website") ||
    containsValue(collectionFormats, "google form") ||
    containsValue(collectionFormats, "mobile") ||
    containsValue(collectionFormats, "email") ||
    containsValue(collectionFormats, "excel") ||
    containsValue(collectionFormats, "spreadsheet");

  if (physicalCollection) {
    physicalHandlingScore += 50;

    overallScore += 5;

    addFinding(
      findings,
      "PHYSICAL-COLLECTION",
      "Physical Records",
      "Physical or paper-based collection",
      "Medium",
      "Personal data may be collected through paper, physical forms or in-person processes.",
      "Review physical security, transportation, access, scanning, retention and secure disposal of paper records."
    );
  }

  if (physicalCollection && digitalCollection) {
    physicalHandlingScore += 50;

    overallScore += 5;

    addFinding(
      findings,
      "HYBRID-COLLECTION",
      "Data Flow",
      "Hybrid physical and digital collection",
      "High",
      "The process uses both physical and digital collection methods. Data may move between paper records and digital systems.",
      "Map the complete lifecycle from physical collection through scanning, digitisation, storage and eventual disposal."
    );
  }

  physicalHandlingScore = Math.min(
    physicalHandlingScore,
    100
  );

  /*
   * -------------------------------------------------------
   * CATEGORY 6
   * STORAGE ENVIRONMENT
   * -------------------------------------------------------
   */

  let storageScore = 0;

  if (storageEnvironments.length >= 3) {
    storageScore = 90;
  } else if (storageEnvironments.length >= 2) {
    storageScore = 65;
  } else if (storageEnvironments.length === 1) {
    storageScore = 30;
  }

  if (storageEnvironments.length >= 2) {
    overallScore += 8;

    addFinding(
      findings,
      "MULTIPLE-STORAGE-ENVIRONMENTS",
      "Storage",
      "Personal data is stored across multiple environments",
      "High",
      "Personal data may exist across cloud, on-premises, employee devices, mobile devices or physical storage.",
      "Create a data-flow map covering every storage environment and the movement of data between them."
    );
  }

  /*
   * -------------------------------------------------------
   * CATEGORY 7
   * PHYSICAL STORAGE
   * -------------------------------------------------------
   */

  if (
    containsValue(storageEnvironments, "physical") ||
    containsValue(storageLocations, "paper") ||
    containsValue(storageLocations, "physical")
  ) {
    storageScore = Math.max(storageScore, 60);

    overallScore += 5;

    addFinding(
      findings,
      "PHYSICAL-STORAGE",
      "Physical Records",
      "Physical records contain personal data",
      "Medium",
      "Paper files or other physical records may contain personal information.",
      "Review physical access controls, secure storage, retention, movement and secure disposal of physical records."
    );
  }

  /*
   * -------------------------------------------------------
   * CATEGORY 8
   * HYBRID STORAGE
   * -------------------------------------------------------
   */

  const hybridStorage =
    storageEnvironments.some(
      (value) =>
        value.toLowerCase().includes("physical")
    ) &&
    storageEnvironments.some(
      (value) =>
        value.toLowerCase().includes("cloud") ||
        value.toLowerCase().includes("on-premises") ||
        value.toLowerCase().includes("device")
    );

  if (hybridStorage) {
    storageScore = 90;

    overallScore += 8;

    addFinding(
      findings,
      "HYBRID-STORAGE",
      "Storage",
      "Hybrid physical and digital storage",
      "High",
      "Personal data may be stored in both physical and digital environments.",
      "Map the transition between paper records and digital systems, including scanning, uploading and eventual disposal."
    );
  }

  /*
   * -------------------------------------------------------
   * CATEGORY 9
   * UNKNOWN STORAGE
   * -------------------------------------------------------
   */

  if (
    containsValue(storageLocations, "unknown") ||
    containsValue(storageEnvironments, "unknown")
  ) {
    storageScore = Math.max(storageScore, 80);

    overallScore += 10;

    addFinding(
      findings,
      "UNKNOWN-STORAGE",
      "Storage",
      "Storage location is unknown",
      "High",
      "The organisation does not have sufficient visibility into where personal data is stored.",
      "Identify all systems, applications, devices, cloud platforms and physical locations where personal data is stored."
    );
  }

  /*
   * -------------------------------------------------------
   * CATEGORY 10
   * ENCRYPTION
   * -------------------------------------------------------
   */

  let securityScore = 0;

  if (
    containsValue(encryptionStatuses, "clear text") ||
    containsValue(encryptionStatuses, "not encrypted")
  ) {
    securityScore = 100;

    overallScore += 20;

    addFinding(
      findings,
      "NO-ENCRYPTION",
      "Security",
      "Personal data may not be encrypted",
      "Critical",
      "Personal data may be stored or transmitted without adequate encryption.",
      "Evaluate encryption controls for personal data at rest and in transit and remediate inappropriate clear-text storage or transmission."
    );
  } else if (
    containsValue(encryptionStatuses, "unknown")
  ) {
    securityScore = 70;

    overallScore += 10;

    addFinding(
      findings,
      "UNKNOWN-ENCRYPTION",
      "Security",
      "Encryption status is unknown",
      "High",
      "The organisation has not established whether personal data is adequately encrypted.",
      "Confirm encryption controls for data at rest and in transit."
    );
  } else if (
    containsValue(
      encryptionStatuses,
      "in transit only"
    ) ||
    containsValue(
      encryptionStatuses,
      "at rest only"
    )
  ) {
    securityScore = 55;

    overallScore += 8;

    addFinding(
      findings,
      "PARTIAL-ENCRYPTION",
      "Security",
      "Encryption coverage may be incomplete",
      "Medium",
      "The selected encryption option indicates that protection may exist only for part of the data lifecycle.",
      "Assess encryption requirements for both data at rest and data in transit."
    );
  } else if (
    containsValue(
      encryptionStatuses,
      "at rest and in transit"
    )
  ) {
    securityScore = 15;
  }

  /*
   * -------------------------------------------------------
   * CATEGORY 11
   * ACCESS CONTROL
   * -------------------------------------------------------
   */

  let accessScore = 0;

  if (accessRoles.length === 0) {
    accessScore = 75;

    overallScore += 8;

    addFinding(
      findings,
      "ACCESS-NOT-DEFINED",
      "Access Control",
      "Data access roles are not defined",
      "High",
      "No access roles have been identified for the assessed personal data.",
      "Define role-based access and periodically review who can access personal data."
    );
  } else if (accessRoles.length >= 5) {
    accessScore = 65;

    overallScore += 5;

    addFinding(
      findings,
      "BROAD-ACCESS",
      "Access Control",
      "Personal data may be accessible to many roles",
      "Medium",
      "A relatively broad set of organisational roles may have access to personal data.",
      "Apply least privilege and review whether each role genuinely requires access."
    );
  } else {
    accessScore = 25;
  }

  if (
    containsValue(accessRoles, "third-party") ||
    containsValue(accessRoles, "service provider")
  ) {
    accessScore = Math.max(accessScore, 60);

    overallScore += 5;

    addFinding(
      findings,
      "THIRD-PARTY-ACCESS",
      "Third-Party Risk",
      "Third parties may have access to personal data",
      "Medium",
      "External service providers may have access to personal data.",
      "Maintain a processor/vendor inventory and review contractual privacy and security obligations."
    );
  }

  /*
   * -------------------------------------------------------
   * CATEGORY 12
   * DATA SHARING
   * -------------------------------------------------------
   */

  let sharingScore = 0;

  if (
    containsValue(
      sharingStatuses,
      "multiple third parties"
    )
  ) {
    sharingScore = 100;

    overallScore += 15;

    addFinding(
      findings,
      "MULTIPLE-THIRD-PARTY-SHARING",
      "Third-Party Risk",
      "Personal data may be shared with multiple third parties",
      "High",
      "The assessed process may disclose personal data to multiple external parties.",
      "Maintain a complete recipient and processor inventory and assess contractual and security controls."
    );
  } else if (
    containsValue(
      sharingStatuses,
      "service provider"
    )
  ) {
    sharingScore = 65;

    overallScore += 10;

    addFinding(
      findings,
      "SERVICE-PROVIDER-SHARING",
      "Third-Party Risk",
      "Personal data may be shared with service providers",
      "Medium",
      "Personal data may be processed by external service providers.",
      "Identify service providers and verify appropriate privacy, security and contractual controls."
    );
  } else if (
    containsValue(sharingStatuses, "unknown")
  ) {
    sharingScore = 70;

    overallScore += 8;

    addFinding(
      findings,
      "UNKNOWN-SHARING",
      "Third-Party Risk",
      "Data-sharing arrangements are unknown",
      "High",
      "The organisation has not established who receives or accesses the personal data.",
      "Identify all internal and external recipients of personal data."
    );
  } else {
    sharingScore = 10;
  }

  /*
   * -------------------------------------------------------
   * CATEGORY 13
   * RETENTION
   * -------------------------------------------------------
   */

  let retentionScore = 0;

  if (
    containsValue(retentionPeriods, "indefinitely") ||
    containsValue(
      retentionPeriods,
      "no defined retention"
    )
  ) {
    retentionScore = 100;

    overallScore += 15;

    addFinding(
      findings,
      "INDEFINITE-RETENTION",
      "Retention",
      "Personal data may be retained indefinitely",
      "High",
      "The process may not have a defined retention period.",
      "Define retention periods based on business, legal and regulatory requirements."
    );
  } else if (
    containsValue(retentionPeriods, "more than 5 years")
  ) {
    retentionScore = 70;

    overallScore += 8;

    addFinding(
      findings,
      "LONG-RETENTION",
      "Retention",
      "Long personal-data retention period",
      "Medium",
      "Personal data may be retained for an extended period.",
      "Validate whether the retention period is necessary and document the justification."
    );
  } else if (
    containsValue(retentionPeriods, "unknown")
  ) {
    retentionScore = 75;

    overallScore += 8;

    addFinding(
      findings,
      "UNKNOWN-RETENTION",
      "Retention",
      "Data-retention period is unknown",
      "High",
      "The organisation has not established how long the personal data is retained.",
      "Document retention periods for each category of personal data."
    );
  } else {
    retentionScore = 20;
  }

  /*
   * -------------------------------------------------------
   * CATEGORY 14
   * DELETION
   * -------------------------------------------------------
   */

  let deletionScore = 0;

  if (
    containsValue(
      deletionMethods,
      "no defined deletion"
    ) ||
    containsValue(deletionMethods, "unknown")
  ) {
    deletionScore = 80;

    overallScore += 10;

    addFinding(
      findings,
      "DELETION-NOT-DEFINED",
      "Deletion & Disposal",
      "Personal-data deletion process is not defined",
      "High",
      "The organisation may not have a documented process for deleting personal data.",
      "Define secure deletion and disposal procedures for both digital and physical records."
    );
  } else if (
    containsValue(deletionMethods, "manual deletion")
  ) {
    deletionScore = 45;
  } else {
    deletionScore = 20;
  }

  /*
   * -------------------------------------------------------
   * CATEGORY 15
   * PRIVACY NOTICE
   * -------------------------------------------------------
   */

  let noticeScore = 0;

  if (containsValue(privacyNotices, "no")) {
    noticeScore = 100;

    overallScore += 12;

    addFinding(
      findings,
      "NO-PRIVACY-NOTICE",
      "Transparency",
      "Privacy notice may not be provided",
      "High",
      "The assessment indicates that a privacy notice may not be provided to data subjects.",
      "Review and provide appropriate privacy information at or before collection."
    );
  } else if (
    containsValue(privacyNotices, "partially")
  ) {
    noticeScore = 65;

    overallScore += 8;

    addFinding(
      findings,
      "PARTIAL-PRIVACY-NOTICE",
      "Transparency",
      "Privacy notice coverage may be incomplete",
      "Medium",
      "Privacy notice coverage may differ across collection channels.",
      "Ensure appropriate privacy information is presented consistently across all collection channels."
    );
  } else if (
    containsValue(privacyNotices, "unknown")
  ) {
    noticeScore = 70;

    overallScore += 7;

    addFinding(
      findings,
      "UNKNOWN-PRIVACY-NOTICE",
      "Transparency",
      "Privacy-notice status is unknown",
      "High",
      "The organisation has not established whether appropriate privacy information is provided.",
      "Confirm privacy-notice coverage for every collection channel."
    );
  } else {
    noticeScore = 15;
  }

  /*
   * -------------------------------------------------------
   * CATEGORY 16
   * CONSENT / LAWFUL BASIS
   * -------------------------------------------------------
   */

  let consentScore = 0;

  if (containsValue(consentStatuses, "no")) {
    consentScore = 90;

    overallScore += 12;

    addFinding(
      findings,
      "CONSENT-NOT-OBTAINED",
      "Lawful Basis",
      "Consent may not be obtained",
      "High",
      "The assessment indicates that consent may not be obtained where it may be expected.",
      "Validate the applicable lawful basis and document the organisation's basis for processing."
    );
  } else if (
    containsValue(consentStatuses, "partially")
  ) {
    consentScore = 60;

    overallScore += 7;

    addFinding(
      findings,
      "PARTIAL-CONSENT",
      "Lawful Basis",
      "Consent or lawful-basis coverage may be incomplete",
      "Medium",
      "The organisation may not have consistently documented the basis for processing.",
      "Document the purpose and applicable lawful basis for each processing activity."
    );
  } else if (
    containsValue(consentStatuses, "unknown")
  ) {
    consentScore = 65;

    overallScore += 8;

    addFinding(
      findings,
      "UNKNOWN-LAWFUL-BASIS",
      "Lawful Basis",
      "Lawful basis is unknown",
      "High",
      "The organisation has not established the applicable lawful basis for the processing.",
      "Document the purpose and lawful basis for each processing activity."
    );
  } else {
    consentScore = 15;
  }

  /*
   * -------------------------------------------------------
   * CATEGORY 17
   * PARENT / GUARDIAN CONTROLS
   * -------------------------------------------------------
   */

  let parentalScore = 0;

  if (involvesStudentOrChild) {
    if (
      containsValue(
        parentalConsentStatuses,
        "no"
      )
    ) {
      parentalScore = 100;

      overallScore += 20;

      addFinding(
        findings,
        "PARENTAL-CONTROL-MISSING",
        "Child Data",
        "Parent or guardian controls may be inadequate",
        "Critical",
        "Student or child-related processing is indicated but parent/guardian involvement may not be adequately addressed.",
        "Review applicable requirements for parent/guardian involvement and implement appropriate controls."
      );
    } else if (
      containsValue(
        parentalConsentStatuses,
        "partially"
      )
    ) {
      parentalScore = 65;

      overallScore += 12;

      addFinding(
        findings,
        "PARENTAL-CONTROL-PARTIAL",
        "Child Data",
        "Parent or guardian controls may be incomplete",
        "High",
        "Parent or guardian involvement appears to be only partially addressed.",
        "Review the end-to-end process for obtaining, recording and validating parent/guardian involvement."
      );
    } else if (
      containsValue(
        parentalConsentStatuses,
        "unknown"
      )
    ) {
      parentalScore = 70;

      overallScore += 10;

      addFinding(
        findings,
        "PARENTAL-CONTROL-UNKNOWN",
        "Child Data",
        "Parent or guardian controls are unknown",
        "High",
        "The assessment does not establish how parent/guardian requirements are addressed.",
        "Confirm how parent/guardian requirements are handled for child-related personal data."
      );
    } else {
      parentalScore = 20;
    }
  }

  /*
   * -------------------------------------------------------
   * CATEGORY 18
   * CROSS-BORDER TRANSFER
   * -------------------------------------------------------
   */

  let crossBorderScore = 0;

  if (
    containsValue(crossBorderTransfers, "yes")
  ) {
    crossBorderScore = 70;

    overallScore += 10;

    addFinding(
      findings,
      "CROSS-BORDER",
      "Data Transfer",
      "Personal data may be transferred outside India",
      "High",
      "The assessment indicates that personal data may be transferred outside India.",
      "Identify countries, cloud services, SaaS platforms and processors involved in cross-border processing and assess applicable requirements."
    );
  } else if (
    containsValue(crossBorderTransfers, "unknown")
  ) {
    crossBorderScore = 60;

    overallScore += 5;

    addFinding(
      findings,
      "CROSS-BORDER-UNKNOWN",
      "Data Transfer",
      "Cross-border transfer status is unknown",
      "Medium",
      "The organisation has not established whether personal data is transferred outside India.",
      "Review cloud services, SaaS platforms and third-party processors to determine data locations and transfer paths."
    );
  } else {
    crossBorderScore = 10;
  }

  /*
   * -------------------------------------------------------
   * UNKNOWN / INCOMPLETE RESPONSES
   * -------------------------------------------------------
   */

  if (
    collectionFormats.length === 0
  ) {
    overallScore += 5;

    addFinding(
      findings,
      "COLLECTION-METHOD-UNKNOWN",
      "Data Collection",
      "Collection method has not been documented",
      "Medium",
      "No collection format has been selected for the assessed process.",
      "Document how personal data is collected at every identified entry point."
    );
  }

  /*
   * -------------------------------------------------------
   * FINAL SCORE
   * -------------------------------------------------------
   */

  overallScore = Math.min(
    Math.round(overallScore),
    100
  );

  /*
   * -------------------------------------------------------
   * OVERALL LEVEL
   * -------------------------------------------------------
   */

  const overallLevel =
    levelFromScore(overallScore);

  /*
   * -------------------------------------------------------
   * CATEGORY SCORES
   * -------------------------------------------------------
   */

  const categoryScores: RiskCategoryScore[] = [
    {
      category: "Data Collection",
      score: collectionScore,
      level: categoryLevel(collectionScore),
    },
    {
      category: "Data Minimisation",
      score: dataVolumeScore,
      level: categoryLevel(dataVolumeScore),
    },
    {
      category: "Data Subjects",
      score: childDataScore,
      level: categoryLevel(childDataScore),
    },
    {
      category: "Access & Responsibility",
      score: roleScore,
      level: categoryLevel(roleScore),
    },
    {
      category: "Physical / Hybrid Handling",
      score: physicalHandlingScore,
      level: categoryLevel(physicalHandlingScore),
    },
    {
      category: "Storage",
      score: storageScore,
      level: categoryLevel(storageScore),
    },
    {
      category: "Security",
      score: securityScore,
      level: categoryLevel(securityScore),
    },
    {
      category: "Access Control",
      score: accessScore,
      level: categoryLevel(accessScore),
    },
    {
      category: "Third-Party Sharing",
      score: sharingScore,
      level: categoryLevel(sharingScore),
    },
    {
      category: "Retention",
      score: retentionScore,
      level: categoryLevel(retentionScore),
    },
    {
      category: "Deletion & Disposal",
      score: deletionScore,
      level: categoryLevel(deletionScore),
    },
    {
      category: "Transparency",
      score: noticeScore,
      level: categoryLevel(noticeScore),
    },
    {
      category: "Lawful Basis",
      score: consentScore,
      level: categoryLevel(consentScore),
    },
    {
      category: "Child Data",
      score: parentalScore,
      level: categoryLevel(parentalScore),
    },
    {
      category: "Data Transfer",
      score: crossBorderScore,
      level: categoryLevel(crossBorderScore),
    },
  ];

  /*
   * -------------------------------------------------------
   * REMOVE DUPLICATE FINDINGS
   * -------------------------------------------------------
   */

  const uniqueFindings = Array.from(
    new Map(
      findings.map((finding) => [
        finding.id,
        finding,
      ])
    ).values()
  );

  return {
    score: overallScore,
    overallLevel,
    findings: uniqueFindings,
    categoryScores,
  };
}
