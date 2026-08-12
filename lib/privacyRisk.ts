export type RiskLevel =
  | "Low"
  | "Medium"
  | "High"
  | "Critical";

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
  categoryScores: RiskCategoryScore[];
  findings: RiskFinding[];
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

function createFinding(
  id: string,
  category: string,
  title: string,
  score: number,
  explanation: string,
  recommendation: string
): RiskFinding {
  return {
    id,
    category,
    title,
    level: levelFromScore(score),
    explanation,
    recommendation,
  };
}

export function calculatePrivacyRisk(
  input: PrivacyRiskInput
): RiskResult {
  const findings: RiskFinding[] = [];

  /*
   * =========================================================
   * 1. DATA ENTRY POINT COMPLEXITY
   * =========================================================
   */

  const totalEntryPoints =
    input.selectedEntryPoints.length +
    input.customEntryPoints.length;

  if (totalEntryPoints >= 4) {
    findings.push(
      createFinding(
        "ENTRY-POINTS-MULTIPLE",
        "Data Collection",
        "Multiple personal-data entry points",
        70,
        "Personal data enters the organisation through multiple collection channels. Multiple entry points increase the possibility of inconsistent controls, undocumented processing and data-flow gaps.",
        "Maintain a consolidated inventory of all personal-data entry points and document the controls applicable to each channel."
      )
    );
  } else if (totalEntryPoints >= 2) {
    findings.push(
      createFinding(
        "ENTRY-POINTS-MULTIPLE",
        "Data Collection",
        "More than one personal-data entry point",
        45,
        "Personal data is collected through more than one channel. Different collection channels may have different security, privacy notice and retention controls.",
        "Ensure all collection channels are included in the privacy and data-flow inventory."
      )
    );
  }

  /*
   * =========================================================
   * 2. PERSONAL DATA VOLUME
   * =========================================================
   */

  const totalFields =
    input.selectedFields.length +
    input.customFields.length;

  if (totalFields >= 10) {
    findings.push(
      createFinding(
        "DATA-VOLUME-HIGH",
        "Data Minimisation",
        "Large number of personal-data fields",
        65,
        "The assessed process collects a relatively large number of personal-data fields.",
        "Review each field for necessity, proportionality and alignment with the stated business purpose."
      )
    );
  } else if (totalFields >= 5) {
    findings.push(
      createFinding(
        "DATA-VOLUME-MULTIPLE",
        "Data Minimisation",
        "Multiple personal-data fields collected",
        40,
        "The assessed process collects multiple categories of personal data.",
        "Review whether each field is necessary for the stated purpose and remove unnecessary data collection."
      )
    );
  }

  /*
   * =========================================================
   * 3. DATA SUBJECTS
   * =========================================================
   */

  if (
    containsValue(input.dataSubjectTypes, "student") ||
    containsValue(input.dataSubjectTypes, "child") ||
    containsValue(input.dataSubjectTypes, "minor")
  ) {
    findings.push(
      createFinding(
        "DATA-SUBJECT-CHILD",
        "Children / Student Data",
        "Student or child-related personal data",
        75,
        "The processing involves student, child or minor-related personal data, which may require enhanced privacy, governance and parental or guardian controls.",
        "Review child-data processing requirements and ensure appropriate parent or guardian controls are implemented."
      )
    );
  }

  /*
   * =========================================================
   * 4. PARENT / GUARDIAN DATA
   * =========================================================
   */

  if (
    containsValue(
      input.dataSubjectTypes,
      "parent"
    ) ||
    containsValue(
      input.dataSubjectTypes,
      "guardian"
    )
  ) {
    findings.push(
      createFinding(
        "DATA-SUBJECT-PARENT",
        "Data Subjects",
        "Parent or guardian personal data",
        40,
        "The process involves personal data relating to parents or guardians in addition to student information.",
        "Clearly document the purpose for collecting parent or guardian information and apply appropriate access and retention controls."
      )
    );
  }

  /*
   * =========================================================
   * 5. MULTIPLE COLLECTOR ROLES
   * =========================================================
   */

  if (input.collectorRoles.length >= 3) {
    findings.push(
      createFinding(
        "COLLECTOR-ROLES-MULTIPLE",
        "Access Governance",
        "Multiple roles collect personal data",
        50,
        "Multiple employee or organisational roles may collect personal data.",
        "Define role-based responsibilities and ensure each collection role receives appropriate privacy and security guidance."
      )
    );
  }

  /*
   * =========================================================
   * 6. COLLECTION METHODS
   * =========================================================
   */

  if (
    containsValue(
      input.collectionFormats,
      "paper"
    ) ||
    containsValue(
      input.collectionFormats,
      "physical"
    ) ||
    containsValue(
      input.collectionFormats,
      "in person"
    )
  ) {
    findings.push(
      createFinding(
        "COLLECTION-PHYSICAL",
        "Data Collection",
        "Physical or paper-based data collection",
        55,
        "Personal data may be collected through physical or paper-based processes.",
        "Review physical security, access, transportation, scanning, storage and secure disposal of paper records."
      )
    );
  }

  if (
    containsValue(
      input.collectionFormats,
      "google form"
    )
  ) {
    findings.push(
      createFinding(
        "COLLECTION-GOOGLE-FORM",
        "Data Collection",
        "Personal data collected through Google Forms",
        50,
        "Google Forms may introduce additional considerations around account ownership, access permissions, data location, retention and third-party processing.",
        "Review Google Workspace configuration, form ownership, access permissions, retention and downstream storage."
      )
    );
  }

  if (
    containsValue(
      input.collectionFormats,
      "whatsapp"
    )
  ) {
    findings.push(
      createFinding(
        "COLLECTION-WHATSAPP",
        "Data Collection",
        "Personal data collected through WhatsApp",
        60,
        "WhatsApp-based collection can introduce risks involving uncontrolled devices, personal accounts, message retention and subsequent transfer into organisational systems.",
        "Define an approved WhatsApp collection process and control device, account, access, retention and transfer practices."
      )
    );
  }

  if (
    containsValue(
      input.collectionFormats,
      "excel"
    ) ||
    containsValue(
      input.collectionFormats,
      "spreadsheet"
    )
  ) {
    findings.push(
      createFinding(
        "COLLECTION-SPREADSHEET",
        "Data Collection",
        "Personal data collected through spreadsheets",
        55,
        "Spreadsheet-based collection can create uncontrolled copies, duplicate records and inconsistent access controls.",
        "Use approved storage locations, access controls, version management and defined retention periods for spreadsheets containing personal data."
      )
    );
  }

  if (
    input.collectionFormats.length === 0
  ) {
    findings.push(
      createFinding(
        "COLLECTION-UNKNOWN",
        "Data Collection",
        "Collection method not documented",
        45,
        "The method used to collect personal data has not been documented.",
        "Document the collection method for each personal-data entry point."
      )
    );
  }

  /*
   * =========================================================
   * 7. MULTIPLE STORAGE LOCATIONS
   * =========================================================
   */

  if (input.storageLocations.length >= 3) {
    findings.push(
      createFinding(
        "STORAGE-MULTIPLE",
        "Data Storage",
        "Personal data stored in multiple locations",
        65,
        "Personal data may be distributed across multiple applications, files, systems or physical records.",
        "Create a data inventory showing where personal data is stored and how information moves between locations."
      )
    );
  }

  /*
   * =========================================================
   * 8. MULTIPLE STORAGE ENVIRONMENTS
   * =========================================================
   */

  if (input.storageEnvironments.length >= 2) {
    findings.push(
      createFinding(
        "STORAGE-ENVIRONMENTS-MULTIPLE",
        "Data Storage",
        "Multiple storage environments",
        65,
        "Personal data may be stored across multiple environments such as cloud, on-premises, employee devices or physical storage.",
        "Map movement of personal data between physical, employee-device, cloud and on-premises environments."
      )
    );
  }

  /*
   * =========================================================
   * 9. PHYSICAL STORAGE
   * =========================================================
   */

  if (
    containsValue(
      input.storageEnvironments,
      "physical"
    ) ||
    containsValue(
      input.storageLocations,
      "paper"
    ) ||
    containsValue(
      input.storageLocations,
      "physical"
    )
  ) {
    findings.push(
      createFinding(
        "STORAGE-PHYSICAL",
        "Physical Security",
        "Physical records contain personal data",
        60,
        "Physical records may contain personal data and therefore remain within the scope of privacy and security controls.",
        "Review physical access controls, secure storage, retention, transportation and secure disposal of paper records."
      )
    );
  }

  /*
   * =========================================================
   * 10. HYBRID / PHYSICAL + DIGITAL
   * =========================================================
   */

  const hasPhysical =
    containsValue(
      input.storageEnvironments,
      "physical"
    ) ||
    containsValue(
      input.storageLocations,
      "paper"
    ) ||
    containsValue(
      input.storageLocations,
      "physical"
    );

  const hasDigital =
    containsValue(
      input.storageEnvironments,
      "cloud"
    ) ||
    containsValue(
      input.storageEnvironments,
      "on-premises"
    ) ||
    containsValue(
      input.storageEnvironments,
      "employee device"
    ) ||
    containsValue(
      input.storageEnvironments,
      "mobile device"
    ) ||
    containsValue(
      input.storageLocations,
      "school management"
    ) ||
    containsValue(
      input.storageLocations,
      "student information"
    ) ||
    containsValue(
      input.storageLocations,
      "google drive"
    ) ||
    containsValue(
      input.storageLocations,
      "microsoft 365"
    ) ||
    containsValue(
      input.storageLocations,
      "excel"
    ) ||
    containsValue(
      input.storageLocations,
      "email"
    );

  if (hasPhysical && hasDigital) {
    findings.push(
      createFinding(
        "STORAGE-HYBRID",
        "Data Lifecycle",
        "Hybrid physical and digital data lifecycle",
        70,
        "The process appears to involve both physical and digital personal-data records. Data may move between paper forms, scanned copies, spreadsheets, email and business systems.",
        "Map the complete physical-to-digital lifecycle, including scanning, uploading, copying, reconciliation, retention and secure destruction."
      )
    );
  }

  /*
   * =========================================================
   * 11. UNKNOWN STORAGE
   * =========================================================
   */

  if (
    containsValue(
      input.storageLocations,
      "unknown"
    ) ||
    containsValue(
      input.storageEnvironments,
      "unknown"
    )
  ) {
    findings.push(
      createFinding(
        "STORAGE-UNKNOWN",
        "Data Governance",
        "Storage location is unknown",
        75,
        "The organisation does not have sufficient visibility into where personal data is stored.",
        "Identify all systems, applications, devices and physical locations where personal data is stored."
      )
    );
  }

  /*
   * =========================================================
   * 12. ENCRYPTION
   * =========================================================
   */

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
    findings.push(
      createFinding(
        "ENCRYPTION-WEAK",
        "Security",
        "Personal data may not be adequately encrypted",
        90,
        "Personal data may be stored or transmitted without adequate encryption.",
        "Evaluate encryption controls for personal data at rest and in transit."
      )
    );
  }

  if (
    containsValue(
      input.encryptionStatuses,
      "unknown"
    )
  ) {
    findings.push(
      createFinding(
        "ENCRYPTION-UNKNOWN",
        "Security",
        "Encryption status is unknown",
        65,
        "The organisation has not established whether personal data is adequately encrypted.",
        "Confirm whether personal data is encrypted at rest and in transit."
      )
    );
  }

  /*
   * =========================================================
   * 13. ACCESS CONTROL
   * =========================================================
   */

  if (
    input.accessRoles.length === 0 ||
    containsValue(
      input.accessRoles,
      "unknown"
    )
  ) {
    findings.push(
      createFinding(
        "ACCESS-UNKNOWN",
        "Access Governance",
        "Access roles are not clearly defined",
        70,
        "The roles permitted to access personal data are not clearly established.",
        "Define role-based access to personal data and periodically review access."
      )
    );
  }

  if (input.accessRoles.length >= 5) {
    findings.push(
      createFinding(
        "ACCESS-MANY-ROLES",
        "Access Governance",
        "Large number of roles have access",
        60,
        "A relatively large number of roles may have access to personal data.",
        "Apply least privilege and review whether every role requires access to the data."
      )
    );
  }

  /*
   * =========================================================
   * 14. THIRD-PARTY SHARING
   * =========================================================
   */

  if (
    containsValue(
      input.sharingStatuses,
      "service provider"
    ) ||
    containsValue(
      input.sharingStatuses,
      "third parties"
    ) ||
    containsValue(
      input.sharingStatuses,
      "external"
    )
  ) {
    findings.push(
      createFinding(
        "SHARING-THIRD-PARTY",
        "Third-Party Risk",
        "Personal data shared with third parties",
        75,
        "Personal data may be shared with external service providers or third parties.",
        "Maintain a processor or service-provider inventory and review contractual privacy and security obligations."
      )
    );
  }

  if (
    containsValue(
      input.sharingStatuses,
      "unknown"
    )
  ) {
    findings.push(
      createFinding(
        "SHARING-UNKNOWN",
        "Third-Party Risk",
        "Data-sharing arrangements are unknown",
        65,
        "The organisation does not have sufficient visibility into who receives personal data.",
        "Identify all internal and external recipients of personal data."
      )
    );
  }

  /*
   * =========================================================
   * 15. RETENTION
   * =========================================================
   */

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
    findings.push(
      createFinding(
        "RETENTION-UNDEFINED",
        "Data Retention",
        "Undefined or indefinite retention",
        80,
        "The organisation may retain personal data indefinitely or without a defined retention period.",
        "Define retention periods based on business, legal and regulatory requirements."
      )
    );
  }

  if (
    containsValue(
      input.retentionPeriods,
      "unknown"
    )
  ) {
    findings.push(
      createFinding(
        "RETENTION-UNKNOWN",
        "Data Retention",
        "Data-retention period is unknown",
        65,
        "The organisation has not established how long the personal data is retained.",
        "Document how long each category of personal data is retained."
      )
    );
  }

  /*
   * =========================================================
   * 16. DELETION
   * =========================================================
   */

  if (
    containsValue(
      input.deletionMethods,
      "no defined"
    ) ||
    containsValue(
      input.deletionMethods,
      "unknown"
    )
  ) {
    findings.push(
      createFinding(
        "DELETION-UNDEFINED",
        "Data Disposal",
        "Personal-data deletion process is not defined",
        70,
        "There may be no defined process for securely deleting or disposing of personal data.",
        "Define and document secure deletion and physical disposal procedures."
      )
    );
  }

  /*
   * =========================================================
   * 17. PRIVACY NOTICE
   * =========================================================
   */

  if (
    containsValue(
      input.privacyNotices,
      "no"
    ) ||
    containsValue(
      input.privacyNotices,
      "partially"
    )
  ) {
    findings.push(
      createFinding(
        "NOTICE-INCOMPLETE",
        "Transparency",
        "Privacy-notice coverage may be incomplete",
        70,
        "Privacy notices may not be consistently provided at the point of collection.",
        "Review privacy notices provided to data subjects at or before collection."
      )
    );
  }

  if (
    containsValue(
      input.privacyNotices,
      "unknown"
    )
  ) {
    findings.push(
      createFinding(
        "NOTICE-UNKNOWN",
        "Transparency",
        "Privacy-notice status is unknown",
        60,
        "The organisation has not established whether appropriate privacy notices are provided.",
        "Confirm whether appropriate privacy notices are provided to data subjects."
      )
    );
  }

  /*
   * =========================================================
   * 18. CONSENT / LAWFUL BASIS
   * =========================================================
   */

  if (
    containsValue(
      input.consentStatuses,
      "no"
    )
  ) {
    findings.push(
      createFinding(
        "CONSENT-NO",
        "Lawful Basis",
        "Consent may not be appropriately addressed",
        75,
        "Consent may not be obtained where the organisation expects it to be required.",
        "Validate the applicable legal basis and document the organisation's basis for processing."
      )
    );
  }

  if (
    containsValue(
      input.consentStatuses,
      "unknown"
    )
  ) {
    findings.push(
      createFinding(
        "CONSENT-UNKNOWN",
        "Lawful Basis",
        "Lawful basis status is unknown",
        65,
        "The organisation has not established the lawful basis or consent position for the processing.",
        "Document the purpose and applicable legal basis for each personal-data processing activity."
      )
    );
  }

  /*
   * =========================================================
   * 19. PARENT / GUARDIAN CONTROLS
   * =========================================================
   */

  const involvesChildren =
    containsValue(
      input.dataSubjectTypes,
      "student"
    ) ||
    containsValue(
      input.dataSubjectTypes,
      "child"
    ) ||
    containsValue(
      input.dataSubjectTypes,
      "minor"
    );

  if (involvesChildren) {
    if (
      containsValue(
        input.parentalConsentStatuses,
        "no"
      ) ||
      containsValue(
        input.parentalConsentStatuses,
        "partially"
      )
    ) {
      findings.push(
        createFinding(
          "PARENTAL-CONTROL-WEAK",
          "Children / Student Data",
          "Parent or guardian controls may be incomplete",
          85,
          "Child-related processing may not have adequate parent or guardian controls.",
          "Review parental or guardian requirements for child-related personal data."
        )
      );
    }

    if (
      containsValue(
        input.parentalConsentStatuses,
        "unknown"
      )
    ) {
      findings.push(
        createFinding(
          "PARENTAL-CONTROL-UNKNOWN",
          "Children / Student Data",
          "Parent or guardian requirements are unknown",
          75,
          "The organisation has not established how parent or guardian requirements are handled.",
          "Confirm how parent or guardian requirements are handled for child-related personal data."
        )
      );
    }
  }

  /*
   * =========================================================
   * 20. CROSS-BORDER TRANSFER
   * =========================================================
   */

  if (
    containsValue(
      input.crossBorderTransfers,
      "yes"
    )
  ) {
    findings.push(
      createFinding(
        "CROSS-BORDER-YES",
        "International Data Transfer",
        "Personal data may leave India",
        70,
        "Personal data may be transferred outside India through cloud services, SaaS platforms or third-party processors.",
        "Identify countries, cloud services and processors involved in cross-border processing and assess applicable requirements."
      )
    );
  }

  if (
    containsValue(
      input.crossBorderTransfers,
      "unknown"
    )
  ) {
    findings.push(
      createFinding(
        "CROSS-BORDER-UNKNOWN",
        "International Data Transfer",
        "Cross-border transfer status is unknown",
        60,
        "The organisation has not established whether personal data is transferred outside India.",
        "Determine whether cloud services, SaaS platforms or processors transfer personal data outside India."
      )
    );
  }

  /*
   * =========================================================
   * 21. OVERALL SCORE
   *
   * We use the highest-risk signals plus the breadth of
   * findings rather than simply adding every finding score.
   * This prevents 20 minor findings from automatically
   * becoming Critical.
   * =========================================================
   */

  if (findings.length === 0) {
    return {
      score: 0,
      overallLevel: "Low",
      categoryScores: [],
      findings: [],
    };
  }

  const averageFindingScore =
    findings.reduce(
      (sum, finding) =>
        sum + scoreForLevel(finding.level),
      0
    ) / findings.length;

  const highestFindingScore = Math.max(
    ...findings.map((finding) =>
      scoreForLevel(finding.level)
    )
  );

  let overallScore =
    averageFindingScore * 0.55 +
    highestFindingScore * 0.45;

  /*
   * Increase score modestly when many independent
   * risk findings exist.
   */

  if (findings.length >= 6) {
    overallScore += 5;
  }

  if (findings.length >= 10) {
    overallScore += 5;
  }

  overallScore = Math.min(
    Math.round(overallScore),
    100
  );

  /*
   * =========================================================
   * 22. CATEGORY SCORES
   * =========================================================
   */

  const categoryMap = new Map<
    string,
    RiskFinding[]
  >();

  for (const finding of findings) {
    const existing =
      categoryMap.get(finding.category) || [];

    existing.push(finding);

    categoryMap.set(
      finding.category,
      existing
    );
  }

  const categoryScores: RiskCategoryScore[] =
    Array.from(categoryMap.entries()).map(
      ([category, categoryFindings]) => {
        const categoryScore = Math.round(
          categoryFindings.reduce(
            (sum, finding) =>
              sum +
              scoreForLevel(finding.level),
            0
          ) / categoryFindings.length
        );

        return {
          category,
          score: categoryScore,
          level: levelFromScore(
            categoryScore
          ),
        };
      }
    );

  /*
   * Sort findings so the most serious findings
   * appear first.
   */

  findings.sort(
    (a, b) =>
      scoreForLevel(b.level) -
      scoreForLevel(a.level)
  );

  return {
    score: overallScore,
    overallLevel:
      levelFromScore(overallScore),
    categoryScores,
    findings,
  };
}

function scoreForLevel(
  level: RiskLevel
): number {
  switch (level) {
    case "Critical":
      return 90;

    case "High":
      return 70;

    case "Medium":
      return 45;

    case "Low":
      return 20;

    default:
      return 0;
  }
}
