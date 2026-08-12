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
 * ---------------------------------------------------------
 * PRIVACY RISK INPUT
 * ---------------------------------------------------------
 *
 * IMPORTANT:
 * These names intentionally match the variables used
 * in app/assessment/page.tsx.
 *
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

/*
 * ---------------------------------------------------------
 * HELPERS
 * ---------------------------------------------------------
 */

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

function riskLevelFromScore(score: number): RiskLevel {
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

/*
 * ---------------------------------------------------------
 * MAIN RISK ENGINE
 * ---------------------------------------------------------
 */

export function calculatePrivacyRisk(
  input: PrivacyRiskInput
): RiskResult {
  const findings: RiskFinding[] = [];

  /*
   * =======================================================
   * 1. DATA ENTRY POINT COMPLEXITY
   * =======================================================
   */

  const totalEntryPoints =
    input.selectedEntryPoints.length +
    input.customEntryPoints.length;

  if (totalEntryPoints >= 4) {
    addFinding(
      findings,
      "ENTRY-001",
      "Data Collection",
      "Multiple personal-data entry points",
      "High",
      "Personal data enters the organisation through multiple collection channels. Each channel may introduce different privacy, security and governance risks.",
      "Maintain a consolidated inventory of all personal-data entry points and document the controls applicable to each channel."
    );
  } else if (totalEntryPoints >= 2) {
    addFinding(
      findings,
      "ENTRY-002",
      "Data Collection",
      "Multiple collection channels",
      "Medium",
      "Personal data is collected through more than one entry point.",
      "Ensure all collection channels are included in the privacy and data-flow inventory."
    );
  }

  /*
   * =======================================================
   * 2. DATA VOLUME / NUMBER OF FIELDS
   * =======================================================
   */

  const totalFields =
    input.selectedFields.length +
    input.customFields.length;

  if (totalFields >= 10) {
    addFinding(
      findings,
      "DATA-001",
      "Data Minimisation",
      "Large number of personal-data fields",
      "High",
      "The assessed process collects a relatively large number of personal-data fields, increasing the potential impact of inappropriate access, disclosure or misuse.",
      "Review each field for necessity, proportionality, purpose and retention requirements."
    );
  } else if (totalFields >= 5) {
    addFinding(
      findings,
      "DATA-002",
      "Data Minimisation",
      "Multiple personal-data fields",
      "Medium",
      "The process collects multiple categories of personal data.",
      "Review whether each collected field is necessary for the stated business purpose."
    );
  }

  /*
   * =======================================================
   * 3. STUDENT / CHILD DATA
   * =======================================================
   */

  const involvesStudents =
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

  if (involvesStudents) {
    addFinding(
      findings,
      "CHILD-001",
      "Children's Data",
      "Student or child personal data",
      "High",
      "The processing involves student, child or minor-related personal data. Such processing generally requires stronger privacy, governance and access controls.",
      "Review child-data processing requirements, transparency, access controls and parent/guardian controls."
    );
  }

  /*
   * =======================================================
   * 4. PARENT / GUARDIAN DATA
   * =======================================================
   */

  const involvesParents =
    containsValue(
      input.dataSubjectTypes,
      "parent"
    ) ||
    containsValue(
      input.dataSubjectTypes,
      "guardian"
    );

  if (involvesParents) {
    addFinding(
      findings,
      "SUBJECT-001",
      "Data Subjects",
      "Parent or guardian personal data",
      "Medium",
      "The process involves personal data belonging to parents or guardians in addition to student-related information.",
      "Ensure parent/guardian data is separately identified, used only for defined purposes and protected through appropriate access controls."
    );
  }

  /*
   * =======================================================
   * 5. MULTIPLE COLLECTOR ROLES
   * =======================================================
   */

  if (input.collectorRoles.length >= 3) {
    addFinding(
      findings,
      "ACCESS-001",
      "Access Governance",
      "Multiple personnel collect personal data",
      "Medium",
      "Multiple employee or organisational roles may collect the personal data.",
      "Define role-based responsibilities and ensure each collection role has only the access required for its duties."
    );
  }

  /*
   * =======================================================
   * 6. PHYSICAL / PAPER COLLECTION
   * =======================================================
   */

  const physicalCollection =
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
    );

  if (physicalCollection) {
    addFinding(
      findings,
      "COLLECTION-001",
      "Physical Data Handling",
      "Physical or paper-based collection",
      "Medium",
      "Personal data may be collected through physical or paper-based processes.",
      "Review physical security, access, transportation, scanning, copying and secure disposal of paper records."
    );
  }

  /*
   * =======================================================
   * 7. DIGITAL COLLECTION CHANNELS
   * =======================================================
   */

  if (
    containsValue(
      input.collectionFormats,
      "google form"
    ) ||
    containsValue(
      input.collectionFormats,
      "website"
    ) ||
    containsValue(
      input.collectionFormats,
      "mobile"
    ) ||
    containsValue(
      input.collectionFormats,
      "whatsapp"
    ) ||
    containsValue(
      input.collectionFormats,
      "email"
    )
  ) {
    addFinding(
      findings,
      "COLLECTION-002",
      "Digital Collection",
      "Personal data collected through digital channels",
      "Medium",
      "Personal data may be collected through online forms, applications, messaging platforms or email.",
      "Verify authentication, access control, transmission security, ownership, retention and deletion controls for each digital channel."
    );
  }

  /*
   * =======================================================
   * 8. EXCEL / SPREADSHEET PROCESSING
   * =======================================================
   */

  if (
    containsValue(
      input.collectionFormats,
      "excel"
    ) ||
    containsValue(
      input.storageLocations,
      "excel"
    ) ||
    containsValue(
      input.storageLocations,
      "spreadsheet"
    )
  ) {
    addFinding(
      findings,
      "STORAGE-001",
      "Data Management",
      "Personal data processed through spreadsheets",
      "Medium",
      "Excel or spreadsheet-based processing can result in uncontrolled copies, inconsistent access controls and difficulty tracking data lifecycle.",
      "Define ownership, access controls, storage locations, version control, retention and secure deletion for spreadsheets containing personal data."
    );
  }

  /*
   * =======================================================
   * 9. MULTIPLE STORAGE ENVIRONMENTS
   * =======================================================
   */

  if (input.storageEnvironments.length >= 2) {
    addFinding(
      findings,
      "STORAGE-002",
      "Data Architecture",
      "Multiple storage environments",
      "High",
      "Personal data may be stored across multiple environments such as cloud, on-premises, employee devices or physical records.",
      "Map movement of personal data between physical, employee-device, cloud, on-premises and third-party environments."
    );
  }

  /*
   * =======================================================
   * 10. PHYSICAL STORAGE
   * =======================================================
   */

  const physicalStorage =
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

  if (physicalStorage) {
    addFinding(
      findings,
      "STORAGE-003",
      "Physical Security",
      "Physical records contain personal data",
      "Medium",
      "Physical records may contain personal data and may be accessible outside the controls applied to digital systems.",
      "Review physical access controls, secure storage, visitor controls, retention and secure disposal."
    );
  }

  /*
   * =======================================================
   * 11. HYBRID STORAGE
   * =======================================================
   */

  if (
    containsValue(
      input.storageEnvironments,
      "hybrid"
    ) ||
    (
      physicalStorage &&
      input.storageEnvironments.length >= 1
    )
  ) {
    addFinding(
      findings,
      "STORAGE-004",
      "Data Lifecycle",
      "Hybrid physical and digital storage",
      "High",
      "The process may involve both physical and digital storage of the same or related personal data.",
      "Map the transition between paper records and digital systems, including scanning, uploading, copying, reconciliation and disposal of the original records."
    );
  }

  /*
   * =======================================================
   * 12. UNKNOWN STORAGE
   * =======================================================
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
    addFinding(
      findings,
      "STORAGE-005",
      "Data Discovery",
      "Storage location is unknown",
      "High",
      "The storage location or environment of personal data has not been fully identified.",
      "Identify all systems, applications, devices, cloud platforms and physical locations where personal data is stored."
    );
  }

  /*
   * =======================================================
   * 13. ENCRYPTION
   * =======================================================
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
    addFinding(
      findings,
      "SECURITY-001",
      "Security",
      "Personal data may not be encrypted",
      "Critical",
      "Personal data may be stored or transmitted without adequate encryption.",
      "Evaluate encryption controls for personal data at rest and in transit and remediate identified gaps."
    );
  }

  if (
    containsValue(
      input.encryptionStatuses,
      "unknown"
    )
  ) {
    addFinding(
      findings,
      "SECURITY-002",
      "Security",
      "Encryption status is unknown",
      "High",
      "The organisation has not established whether personal data is adequately protected through encryption.",
      "Confirm encryption controls for personal data at rest and in transit."
    );
  }

  /*
   * =======================================================
   * 14. ACCESS CONTROL
   * =======================================================
   */

  if (
    input.accessRoles.length === 0 ||
    containsValue(
      input.accessRoles,
      "unknown"
    )
  ) {
    addFinding(
      findings,
      "ACCESS-002",
      "Access Control",
      "Access roles are not clearly defined",
      "High",
      "The people or roles that can access personal data have not been clearly established.",
      "Define role-based access to personal data and periodically review access rights."
    );
  }

  /*
   * =======================================================
   * 15. THIRD-PARTY SHARING
   * =======================================================
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
    addFinding(
      findings,
      "SHARING-001",
      "Third-Party Processing",
      "Personal data may be shared with third parties",
      "High",
      "Personal data may be shared with external service providers or other third parties.",
      "Maintain a processor/service-provider inventory and review contractual privacy, security, confidentiality and data-processing obligations."
    );
  }

  if (
    containsValue(
      input.sharingStatuses,
      "unknown"
    )
  ) {
    addFinding(
      findings,
      "SHARING-002",
      "Third-Party Processing",
      "Data-sharing arrangements are unknown",
      "High",
      "The organisation has not fully identified who receives or processes the personal data.",
      "Identify all internal and external recipients of personal data and document the purpose of each disclosure."
    );
  }

  /*
   * =======================================================
   * 16. RETENTION
   * =======================================================
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
    addFinding(
      findings,
      "RETENTION-001",
      "Data Retention",
      "Undefined or indefinite retention",
      "High",
      "Personal data may be retained indefinitely or without a defined retention period.",
      "Define retention periods based on business, legal, regulatory and operational requirements."
    );
  }

  if (
    containsValue(
      input.retentionPeriods,
      "unknown"
    )
  ) {
    addFinding(
      findings,
      "RETENTION-002",
      "Data Retention",
      "Retention period is unknown",
      "High",
      "The organisation has not established how long the personal data is retained.",
      "Document retention requirements for each category of personal data and process."
    );
  }

  /*
   * =======================================================
   * 17. DELETION
   * =======================================================
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
    addFinding(
      findings,
      "DELETION-001",
      "Data Deletion",
      "Personal-data deletion process is not defined",
      "High",
      "There may be no consistently defined process for deleting or securely disposing of personal data.",
      "Define secure deletion and disposal procedures for both physical and digital records."
    );
  }

  /*
   * =======================================================
   * 18. PRIVACY NOTICE
   * =======================================================
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
    addFinding(
      findings,
      "NOTICE-001",
      "Transparency",
      "Privacy-notice coverage may be incomplete",
      "High",
      "Privacy notices may not be consistently provided to data subjects at the point of collection.",
      "Review privacy notices provided at or before collection and ensure they accurately describe purposes, categories, rights and relevant processing."
    );
  }

  if (
    containsValue(
      input.privacyNotices,
      "unknown"
    )
  ) {
    addFinding(
      findings,
      "NOTICE-002",
      "Transparency",
      "Privacy-notice status is unknown",
      "Medium",
      "The organisation has not established whether an appropriate privacy notice is provided.",
      "Confirm whether privacy notices are provided for each relevant collection channel."
    );
  }

  /*
   * =======================================================
   * 19. CONSENT / LAWFUL BASIS
   * =======================================================
   */

  if (
    containsValue(
      input.consentStatuses,
      "no"
    )
  ) {
    addFinding(
      findings,
      "LEGAL-001",
      "Lawful Processing",
      "Consent or lawful-basis controls require review",
      "High",
      "The assessment indicates that consent may not be obtained where the organisation expects it to be required.",
      "Validate the applicable legal basis and document the organisation's basis for processing."
    );
  }

  if (
    containsValue(
      input.consentStatuses,
      "unknown"
    )
  ) {
    addFinding(
      findings,
      "LEGAL-002",
      "Lawful Processing",
      "Lawful basis is unknown",
      "High",
      "The organisation has not clearly established the lawful basis or consent status for the processing.",
      "Document the purpose and applicable legal basis for each personal-data processing activity."
    );
  }

  /*
   * =======================================================
   * 20. PARENT / GUARDIAN CONTROLS
   * =======================================================
   */

  if (involvesStudents) {
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
      addFinding(
        findings,
        "CHILD-002",
        "Children's Data",
        "Parent / guardian controls may be incomplete",
        "Critical",
        "Student or child-related processing may not have adequate parent or guardian involvement and controls.",
        "Review parent/guardian requirements applicable to child-related personal-data processing and document the relevant process."
      );
    }

    if (
      containsValue(
        input.parentalConsentStatuses,
        "unknown"
      )
    ) {
      addFinding(
        findings,
        "CHILD-003",
        "Children's Data",
        "Parent / guardian requirements are unknown",
        "High",
        "The organisation has not established how parent or guardian requirements are handled for child-related personal data.",
        "Confirm how parent/guardian requirements are addressed and documented."
      );
    }
  }

  /*
   * =======================================================
   * 21. CROSS-BORDER TRANSFER
   * =======================================================
   */

  if (
    containsValue(
      input.crossBorderTransfers,
      "yes"
    )
  ) {
    addFinding(
      findings,
      "TRANSFER-001",
      "Cross-Border Processing",
      "Personal data may be transferred outside India",
      "High",
      "Personal data may be processed or transferred outside India through cloud platforms, SaaS applications or third-party processors.",
      "Identify countries, cloud services and processors involved and assess applicable transfer, contractual and security requirements."
    );
  }

  if (
    containsValue(
      input.crossBorderTransfers,
      "unknown"
    )
  ) {
    addFinding(
      findings,
      "TRANSFER-002",
      "Cross-Border Processing",
      "Cross-border processing status is unknown",
      "Medium",
      "The organisation has not established whether personal data is processed outside India.",
      "Review cloud services, SaaS platforms, email services and third-party processors to identify cross-border processing."
    );
  }

  /*
   * =======================================================
   * 22. UNKNOWN COLLECTION PRACTICES
   * =======================================================
   */

  if (
    input.collectionFormats.length === 0
  ) {
    addFinding(
      findings,
      "COLLECTION-003",
      "Data Collection",
      "Collection method is not documented",
      "Medium",
      "The method used to collect personal data has not been documented.",
      "Document the collection method for every personal-data entry point."
    );
  }

  /*
   * =======================================================
   * CATEGORY SCORES
   * =======================================================
   */

  const categoryWeights: Record<
    string,
    number
  > = {
    "Data Collection": 15,
    "Data Minimisation": 15,
    "Children's Data": 20,
    "Data Subjects": 10,
    "Access Governance": 10,
    "Physical Data Handling": 10,
    "Digital Collection": 10,
    "Data Management": 10,
    "Data Architecture": 15,
    "Physical Security": 10,
    "Data Lifecycle": 15,
    "Data Discovery": 15,
    Security: 20,
    "Access Control": 15,
    "Third-Party Processing": 15,
    "Data Retention": 15,
    "Data Deletion": 15,
    Transparency: 15,
    "Lawful Processing": 20,
    "Cross-Border Processing": 15,
  };

  const categoryScores: RiskCategoryScore[] =
    Object.keys(categoryWeights).map(
      (category) => {
        const categoryFindings =
          findings.filter(
            (finding) =>
              finding.category === category
          );

        if (categoryFindings.length === 0) {
          return {
            category,
            score: 0,
            level: "Low" as RiskLevel,
          };
        }

        const severityValues: Record<
          RiskLevel,
          number
        > = {
          Low: 25,
          Medium: 50,
          High: 75,
          Critical: 100,
        };

        const averageSeverity =
          categoryFindings.reduce(
            (total, finding) =>
              total +
              severityValues[finding.level],
            0
          ) / categoryFindings.length;

        const score = Math.round(
          Math.min(
            averageSeverity,
            100
          )
        );

        return {
          category,
          score,
          level: riskLevelFromScore(score),
        };
      }
    );

  /*
   * =======================================================
   * OVERALL SCORE
   * =======================================================
   *
   * We intentionally use a weighted combination:
   *
   *  - Number of findings
   *  - Severity of findings
   *
   * This prevents one low-level observation from making
   * the entire assessment Critical.
   *
   */

  let score = 0;

  if (findings.length > 0) {
    const severityValues: Record<
      RiskLevel,
      number
    > = {
      Low: 10,
      Medium: 25,
      High: 50,
      Critical: 75,
    };

    const severityScore =
      findings.reduce(
        (total, finding) =>
          total +
          severityValues[finding.level],
        0
      );

    const averageSeverity =
      severityScore / findings.length;

    const findingCountScore = Math.min(
      findings.length * 4,
      30
    );

    score = Math.round(
      Math.min(
        averageSeverity +
          findingCountScore,
        100
      )
    );
  }

  /*
   * Ensure major critical findings can meaningfully
   * influence the overall result.
   */

  const hasCritical =
    findings.some(
      (finding) =>
        finding.level === "Critical"
    );

  const criticalCount =
    findings.filter(
      (finding) =>
        finding.level === "Critical"
    ).length;

  if (hasCritical) {
    score = Math.max(
      score,
      criticalCount >= 2 ? 75 : 60
    );
  }

  /*
   * High-risk findings should prevent the result from
   * being misleadingly Low.
   */

  const hasHigh =
    findings.some(
      (finding) =>
        finding.level === "High"
    );

  if (
    hasHigh &&
    score < 40
  ) {
    score = 40;
  }

  score = Math.min(
    Math.max(score, 0),
    100
  );

  const overallLevel =
    riskLevelFromScore(score);

  return {
    score,
    overallLevel,
    findings,
    categoryScores,
  };
}
