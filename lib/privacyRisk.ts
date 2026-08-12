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
  level: RiskLevel;
  overallLevel: RiskLevel;

  findings: RiskFinding[];
  categoryScores: RiskCategoryScore[];

  factors: string[];
  recommendations: string[];
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
 *
 * This interface intentionally matches the names used by
 * app/assessment/page.tsx.
 *
 * Do not rename these properties unless page.tsx is changed
 * at the same time.
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

function unique(values: string[]): string[] {
  return Array.from(new Set(values));
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

function addFinding(
  findings: RiskFinding[],
  category: string,
  title: string,
  level: RiskLevel,
  explanation: string,
  recommendation: string
) {
  findings.push({
    id: `${category}-${findings.length + 1}`,
    category,
    title,
    level,
    explanation,
    recommendation,
  });
}

export function calculatePrivacyRisk(
  input: PrivacyRiskInput
): RiskResult {
  let totalScore = 0;

  const factors: string[] = [];
  const recommendations: string[] = [];
  const findings: RiskFinding[] = [];

  /*
   * ---------------------------------------------------------
   * 1. DATA ENTRY POINTS
   * ---------------------------------------------------------
   */

  const totalEntryPoints =
    input.selectedEntryPoints.length +
    input.customEntryPoints.length;

  if (totalEntryPoints >= 4) {
    totalScore += 10;

    factors.push(
      "Personal data enters the organisation through multiple collection channels."
    );

    recommendations.push(
      "Maintain a consolidated inventory of all personal-data entry points."
    );

    addFinding(
      findings,
      "Collection",
      "Multiple personal-data entry points",
      "Medium",
      "Personal data appears to enter the organisation through several channels. Multiple channels increase the possibility of inconsistent privacy notices, controls and record keeping.",
      "Document every collection channel and ensure appropriate privacy controls are applied consistently."
    );
  } else if (totalEntryPoints >= 2) {
    totalScore += 5;

    factors.push(
      "Personal data is collected through more than one entry point."
    );

    recommendations.push(
      "Ensure all collection channels are included in the privacy and data-flow inventory."
    );
  }

  /*
   * ---------------------------------------------------------
   * 2. PERSONAL DATA VOLUME
   * ---------------------------------------------------------
   */

  const totalFields =
    input.selectedFields.length +
    input.customFields.length;

  if (totalFields >= 10) {
    totalScore += 10;

    factors.push(
      "The assessed process collects a relatively large number of personal-data fields."
    );

    recommendations.push(
      "Review each field for necessity, proportionality and purpose."
    );

    addFinding(
      findings,
      "Data Minimisation",
      "Large number of personal-data fields",
      "Medium",
      "The process appears to collect a substantial number of personal-data fields.",
      "Review each field against the stated purpose and remove fields that are not necessary."
    );
  } else if (totalFields >= 5) {
    totalScore += 5;

    factors.push(
      "The assessed process collects multiple categories of personal data."
    );
  }

  /*
   * ---------------------------------------------------------
   * 3. DATA SUBJECTS
   * ---------------------------------------------------------
   */

  if (
    containsValue(input.dataSubjectTypes, "student") ||
    containsValue(input.dataSubjectTypes, "child") ||
    containsValue(input.dataSubjectTypes, "minor")
  ) {
    totalScore += 15;

    factors.push(
      "The processing involves student, child or minor-related personal data."
    );

    recommendations.push(
      "Review child-data processing requirements and parent/guardian controls."
    );

    addFinding(
      findings,
      "Children's Data",
      "Student / child personal data involved",
      "High",
      "The assessment indicates that personal data relating to students or children is being processed.",
      "Apply appropriate safeguards for child-related data and verify parent/guardian requirements where applicable."
    );
  }

  /*
   * ---------------------------------------------------------
   * 4. PARENT / GUARDIAN DATA
   * ---------------------------------------------------------
   */

  if (
    containsValue(input.dataSubjectTypes, "parent") ||
    containsValue(input.dataSubjectTypes, "guardian")
  ) {
    totalScore += 3;

    factors.push(
      "Parent or guardian personal data is included in the assessed processing."
    );
  }

  /*
   * ---------------------------------------------------------
   * 5. MULTIPLE COLLECTOR ROLES
   * ---------------------------------------------------------
   */

  if (input.collectorRoles.length >= 3) {
    totalScore += 5;

    factors.push(
      "Multiple employee or organisational roles may collect the personal data."
    );

    recommendations.push(
      "Define role-based access and responsibilities for each data-collection role."
    );

    addFinding(
      findings,
      "Access Control",
      "Multiple personnel collect personal data",
      "Medium",
      "Several organisational roles may participate in personal-data collection.",
      "Define responsibilities for each role and apply least-privilege access."
    );
  }

  /*
   * ---------------------------------------------------------
   * 6. COLLECTION METHODS
   * ---------------------------------------------------------
   */

  if (
    containsValue(input.collectionFormats, "paper") ||
    containsValue(input.collectionFormats, "physical") ||
    containsValue(input.collectionFormats, "in person")
  ) {
    totalScore += 5;

    factors.push(
      "Personal data may be collected through physical or paper-based processes."
    );

    recommendations.push(
      "Review physical security, access, transportation, scanning and secure disposal of paper records."
    );

    addFinding(
      findings,
      "Physical Records",
      "Physical personal-data collection",
      "Medium",
      "The process includes paper, physical or in-person collection of personal data.",
      "Control physical forms from collection through storage, scanning, transfer and secure destruction."
    );
  }

  if (
    containsValue(input.collectionFormats, "google form") ||
    containsValue(input.collectionFormats, "website") ||
    containsValue(input.collectionFormats, "mobile") ||
    containsValue(input.collectionFormats, "app") ||
    containsValue(input.collectionFormats, "whatsapp") ||
    containsValue(input.collectionFormats, "email")
  ) {
    totalScore += 3;

    factors.push(
      "Personal data may be collected through electronic communication or online channels."
    );

    recommendations.push(
      "Review authentication, access control, transmission security and retention for online collection channels."
    );
  }

  /*
   * ---------------------------------------------------------
   * 7. MULTIPLE STORAGE ENVIRONMENTS
   * ---------------------------------------------------------
   */

  if (input.storageEnvironments.length >= 2) {
    totalScore += 8;

    factors.push(
      "Personal data may be stored across multiple environments."
    );

    recommendations.push(
      "Map movement of personal data between physical, employee-device, cloud and on-premises environments."
    );

    addFinding(
      findings,
      "Data Lifecycle",
      "Multiple storage environments",
      "High",
      "Personal data appears to exist across more than one storage environment.",
      "Create a data-flow map covering movement between physical records, devices, cloud systems and on-premises systems."
    );
  }

  /*
   * ---------------------------------------------------------
   * 8. PHYSICAL STORAGE
   * ---------------------------------------------------------
   */

  if (
    containsValue(input.storageEnvironments, "physical") ||
    containsValue(input.storageLocations, "paper") ||
    containsValue(input.storageLocations, "physical")
  ) {
    totalScore += 5;

    factors.push(
      "Physical records may contain personal data."
    );

    recommendations.push(
      "Review physical access controls, secure storage, retention and secure disposal."
    );

    addFinding(
      findings,
      "Physical Security",
      "Physical personal-data records",
      "Medium",
      "Personal data may be stored in physical records.",
      "Use controlled physical storage, restricted access, retention controls and secure disposal."
    );
  }

  /*
   * ---------------------------------------------------------
   * 9. HYBRID STORAGE
   * ---------------------------------------------------------
   */

  if (
    containsValue(input.storageEnvironments, "hybrid") ||
    (
      containsValue(input.storageEnvironments, "physical") &&
      (
        containsValue(input.storageEnvironments, "cloud") ||
        containsValue(input.storageEnvironments, "on-premises") ||
        containsValue(input.storageEnvironments, "employee device")
      )
    )
  ) {
    totalScore += 8;

    factors.push(
      "The process may involve both physical and digital storage."
    );

    recommendations.push(
      "Map the transition between paper records and digital systems, including scanning and uploading."
    );

    addFinding(
      findings,
      "Hybrid Processing",
      "Physical and digital records coexist",
      "High",
      "The assessed process may involve both physical and digital representations of personal data.",
      "Document the complete lifecycle from physical collection through scanning, digital storage, access, retention and disposal."
    );
  }

  /*
   * ---------------------------------------------------------
   * 10. UNKNOWN STORAGE
   * ---------------------------------------------------------
   */

  if (
    containsValue(input.storageLocations, "unknown") ||
    containsValue(input.storageEnvironments, "unknown")
  ) {
    totalScore += 10;

    factors.push(
      "The storage location or environment of personal data is unknown."
    );

    recommendations.push(
      "Identify all systems, applications, devices and physical locations where personal data is stored."
    );

    addFinding(
      findings,
      "Data Inventory",
      "Unknown storage location",
      "High",
      "The organisation may not have complete visibility into where personal data is stored.",
      "Identify all repositories and maintain an up-to-date personal-data inventory."
    );
  }

  /*
   * ---------------------------------------------------------
   * 11. ENCRYPTION
   * ---------------------------------------------------------
   */

  if (
    containsValue(input.encryptionStatuses, "clear text") ||
    containsValue(input.encryptionStatuses, "not encrypted")
  ) {
    totalScore += 25;

    factors.push(
      "Personal data may be stored or transmitted without adequate encryption."
    );

    recommendations.push(
      "Evaluate encryption controls for personal data at rest and in transit."
    );

    addFinding(
      findings,
      "Security",
      "Personal data may not be encrypted",
      "Critical",
      "The assessment indicates that personal data may exist without adequate encryption.",
      "Evaluate encryption at rest and in transit and address identified gaps."
    );
  }

  if (
    containsValue(input.encryptionStatuses, "unknown")
  ) {
    totalScore += 10;

    factors.push(
      "Encryption status is unknown."
    );

    recommendations.push(
      "Confirm whether personal data is encrypted at rest and in transit."
    );

    addFinding(
      findings,
      "Security",
      "Encryption status is unknown",
      "High",
      "The organisation has not established whether personal data is adequately encrypted.",
      "Verify encryption controls for each relevant storage and transmission channel."
    );
  }

  /*
   * ---------------------------------------------------------
   * 12. ACCESS CONTROL
   * ---------------------------------------------------------
   */

  if (
    input.accessRoles.length === 0 ||
    containsValue(input.accessRoles, "unknown")
  ) {
    totalScore += 8;

    factors.push(
      "Access roles for personal data are not clearly defined."
    );

    recommendations.push(
      "Define role-based access to personal data and periodically review access."
    );

    addFinding(
      findings,
      "Access Control",
      "Personal-data access is not clearly defined",
      "High",
      "The assessment does not establish a sufficiently clear list of authorised personnel.",
      "Define role-based access and conduct periodic access reviews."
    );
  }

  /*
   * ---------------------------------------------------------
   * 13. THIRD-PARTY SHARING
   * ---------------------------------------------------------
   */

  if (
    containsValue(input.sharingStatuses, "service provider") ||
    containsValue(input.sharingStatuses, "third parties") ||
    containsValue(input.sharingStatuses, "external")
  ) {
    totalScore += 15;

    factors.push(
      "Personal data may be shared with external service providers or third parties."
    );

    recommendations.push(
      "Maintain a processor/service-provider inventory and review contractual privacy and security obligations."
    );

    addFinding(
      findings,
      "Third Parties",
      "Personal data shared with third parties",
      "High",
      "External organisations may receive or process personal data.",
      "Maintain a third-party processing inventory and review contractual, privacy and security obligations."
    );
  }

  if (
    containsValue(input.sharingStatuses, "unknown")
  ) {
    totalScore += 8;

    factors.push(
      "Data-sharing arrangements are unknown."
    );

    recommendations.push(
      "Identify all internal and external recipients of personal data."
    );

    addFinding(
      findings,
      "Third Parties",
      "Data-sharing arrangements are unknown",
      "High",
      "The organisation does not have complete visibility into who receives personal data.",
      "Identify all recipients and document the purpose and basis for sharing."
    );
  }

  /*
   * ---------------------------------------------------------
   * 14. RETENTION
   * ---------------------------------------------------------
   */

  if (
    containsValue(input.retentionPeriods, "indefinitely") ||
    containsValue(input.retentionPeriods, "no defined")
  ) {
    totalScore += 15;

    factors.push(
      "The organisation may not have a defined retention period."
    );

    recommendations.push(
      "Define retention periods based on business, legal and regulatory requirements."
    );

    addFinding(
      findings,
      "Retention",
      "Undefined or indefinite retention",
      "High",
      "Personal data may be retained indefinitely or without a defined retention period.",
      "Define retention periods for each category of personal data and document the rationale."
    );
  }

  if (
    containsValue(input.retentionPeriods, "unknown")
  ) {
    totalScore += 8;

    factors.push(
      "Data-retention period is unknown."
    );

    recommendations.push(
      "Document how long each category of personal data is retained."
    );
  }

  /*
   * ---------------------------------------------------------
   * 15. DELETION
   * ---------------------------------------------------------
   */

  if (
    containsValue(input.deletionMethods, "no defined") ||
    containsValue(input.deletionMethods, "unknown")
  ) {
    totalScore += 10;

    factors.push(
      "There may be no defined personal-data deletion process."
    );

    recommendations.push(
      "Define and document secure deletion and disposal procedures."
    );

    addFinding(
      findings,
      "Deletion",
      "Personal-data deletion process is unclear",
      "High",
      "The assessment does not establish a reliable process for deleting or disposing of personal data.",
      "Define deletion procedures for electronic and physical records and periodically verify execution."
    );
  }

  /*
   * ---------------------------------------------------------
   * 16. PRIVACY NOTICE
   * ---------------------------------------------------------
   */

  if (
    containsValue(input.privacyNotices, "no") ||
    containsValue(input.privacyNotices, "partially")
  ) {
    totalScore += 12;

    factors.push(
      "Privacy-notice coverage may be incomplete."
    );

    recommendations.push(
      "Review privacy notices provided at or before collection of personal data."
    );

    addFinding(
      findings,
      "Transparency",
      "Privacy notice coverage may be incomplete",
      "High",
      "The assessment indicates that privacy notices may not be consistently provided.",
      "Review collection points and ensure appropriate privacy information is provided to data subjects."
    );
  }

  if (
    containsValue(input.privacyNotices, "unknown")
  ) {
    totalScore += 7;

    factors.push(
      "Privacy-notice status is unknown."
    );

    recommendations.push(
      "Confirm whether appropriate privacy notices are provided to data subjects."
    );
  }

  /*
   * ---------------------------------------------------------
   * 17. CONSENT / LAWFUL BASIS
   * ---------------------------------------------------------
   */

  if (
    containsValue(input.consentStatuses, "no")
  ) {
    totalScore += 15;

    factors.push(
      "Consent may not be obtained where the organisation expects it to be required."
    );

    recommendations.push(
      "Validate the applicable legal basis and document the organisation's basis for processing."
    );

    addFinding(
      findings,
      "Lawful Basis",
      "Consent or lawful-basis control requires review",
      "High",
      "The assessment indicates that consent may not be obtained in circumstances where it may be expected.",
      "Validate the applicable legal basis for each processing activity and document it."
    );
  }

  if (
    containsValue(input.consentStatuses, "unknown")
  ) {
    totalScore += 8;

    factors.push(
      "Consent or other lawful-basis status is unknown."
    );

    recommendations.push(
      "Document the purpose and legal basis for each personal-data processing activity."
    );
  }

  /*
   * ---------------------------------------------------------
   * 18. PARENT / GUARDIAN CONTROLS
   * ---------------------------------------------------------
   */

  const involvesChildren =
    containsValue(input.dataSubjectTypes, "student") ||
    containsValue(input.dataSubjectTypes, "child") ||
    containsValue(input.dataSubjectTypes, "minor");

  if (involvesChildren) {
    if (
      containsValue(input.parentalConsentStatuses, "no") ||
      containsValue(input.parentalConsentStatuses, "partially")
    ) {
      totalScore += 20;

      factors.push(
        "Child-related processing may not have adequate parent/guardian controls."
      );

      recommendations.push(
        "Review parental/guardian requirements for child-related personal data."
      );

      addFinding(
        findings,
        "Children's Data",
        "Parent / guardian controls may be incomplete",
        "Critical",
        "Student or child-related personal data is being processed while parent/guardian controls may be incomplete.",
        "Review applicable requirements for parental/guardian involvement and document the process."
      );
    }

    if (
      containsValue(input.parentalConsentStatuses, "unknown")
    ) {
      totalScore += 10;

      factors.push(
        "Parent/guardian requirements are unknown for child-related processing."
      );

      recommendations.push(
        "Confirm how parent/guardian requirements are handled for child-related personal data."
      );
    }
  }

  /*
   * ---------------------------------------------------------
   * 19. CROSS-BORDER TRANSFER
   * ---------------------------------------------------------
   */

  if (
    containsValue(input.crossBorderTransfers, "yes")
  ) {
    totalScore += 10;

    factors.push(
      "Personal data may be transferred outside India."
    );

    recommendations.push(
      "Identify countries, cloud services and processors involved in cross-border processing."
    );

    addFinding(
      findings,
      "Cross-Border",
      "Potential cross-border processing",
      "High",
      "The assessment indicates that personal data may be transferred outside India.",
      "Identify the countries, systems and service providers involved and assess applicable transfer requirements."
    );
  }

  if (
    containsValue(input.crossBorderTransfers, "unknown")
  ) {
    totalScore += 5;

    factors.push(
      "Cross-border data-transfer status is unknown."
    );

    recommendations.push(
      "Determine whether cloud services, SaaS platforms or processors transfer data outside India."
    );
  }

  /*
   * ---------------------------------------------------------
   * 20. UNKNOWN COLLECTION METHOD
   * ---------------------------------------------------------
   */

  if (
    input.collectionFormats.length === 0
  ) {
    totalScore += 5;

    factors.push(
      "The method used to collect personal data has not been documented."
    );

    recommendations.push(
      "Document the collection method for each personal-data entry point."
    );

    addFinding(
      findings,
      "Collection",
      "Collection method not documented",
      "Medium",
      "No collection method has been selected for the assessed processing activity.",
      "Document how personal data is collected at every entry point."
    );
  }

  /*
   * ---------------------------------------------------------
   * 21. UNKNOWN DATA SUBJECT
   * ---------------------------------------------------------
   */

  if (
    input.dataSubjectTypes.length === 0
  ) {
    totalScore += 5;

    factors.push(
      "The data subject population has not been identified."
    );

    recommendations.push(
      "Identify all categories of individuals whose personal data is processed."
    );

    addFinding(
      findings,
      "Data Inventory",
      "Data subjects not identified",
      "Medium",
      "The assessment does not identify who the personal-data subjects are.",
      "Document all relevant data-subject categories."
    );
  }

  /*
   * ---------------------------------------------------------
   * CAP TOTAL SCORE
   * ---------------------------------------------------------
   */

  totalScore = Math.min(
    Math.max(totalScore, 0),
    100
  );

  /*
   * ---------------------------------------------------------
   * OVERALL RISK LEVEL
   * ---------------------------------------------------------
   */

  const overallLevel =
    levelFromScore(totalScore);

  /*
   * ---------------------------------------------------------
   * CATEGORY SCORES
   *
   * These are intentionally calculated from the same
   * assessment inputs. This keeps the dashboard meaningful
   * without requiring another database or API.
   * ---------------------------------------------------------
   */

  const categoryDefinitions = [
    {
      category: "Data Collection",
      score:
        Math.min(
          100,
          (totalEntryPoints >= 4 ? 60 : totalEntryPoints >= 2 ? 35 : 15) +
            (input.collectionFormats.length >= 3 ? 20 : 0) +
            (containsValue(
              input.collectionFormats,
              "paper"
            )
              ? 15
              : 0)
        ),
    },

    {
      category: "Data Subjects",
      score:
        involvesChildren
          ? 75
          : input.dataSubjectTypes.length > 0
            ? 30
            : 60,
    },

    {
      category: "Storage & Lifecycle",
      score:
        Math.min(
          100,
          (input.storageLocations.length >= 3 ? 45 : 20) +
            (input.storageEnvironments.length >= 2 ? 30 : 0) +
            (containsValue(
              input.storageLocations,
              "unknown"
            )
              ? 25
              : 0)
        ),
    },

    {
      category: "Security",
      score:
        Math.min(
          100,
          (containsValue(
            input.encryptionStatuses,
            "clear text"
          ) ||
          containsValue(
            input.encryptionStatuses,
            "not encrypted"
          )
            ? 80
            : 20) +
            (input.accessRoles.length === 0
              ? 20
              : 0)
        ),
    },

    {
      category: "Third Parties",
      score:
        containsValue(
          input.sharingStatuses,
          "third parties"
        ) ||
        containsValue(
          input.sharingStatuses,
          "service provider"
        )
          ? 75
          : containsValue(
                input.sharingStatuses,
                "unknown"
              )
            ? 60
            : 20,
    },

    {
      category: "Governance",
      score:
        Math.min(
          100,
          (containsValue(
            input.privacyNotices,
            "no"
          ) ||
          containsValue(
            input.privacyNotices,
            "partially"
          )
            ? 35
            : 10) +
            (containsValue(
              input.consentStatuses,
              "no"
            )
              ? 35
              : 0) +
            (containsValue(
              input.retentionPeriods,
              "indefinitely"
            ) ||
            containsValue(
              input.retentionPeriods,
              "no defined"
            )
              ? 30
              : 0)
        ),
    },
  ];

  const categoryScores: RiskCategoryScore[] =
    categoryDefinitions.map(
      (category) => ({
        category: category.category,
        score: category.score,
        level: levelFromScore(
          category.score
        ),
      })
    );

  /*
   * ---------------------------------------------------------
   * REMOVE DUPLICATES
   * ---------------------------------------------------------
   */

  const uniqueFactors =
    unique(factors);

  const uniqueRecommendations =
    unique(recommendations);

  /*
   * ---------------------------------------------------------
   * RETURN
   * ---------------------------------------------------------
   */

  return {
    score: totalScore,

    level: overallLevel,

    overallLevel,

    findings,

    categoryScores,

    factors: uniqueFactors,

    recommendations:
      uniqueRecommendations,
  };
}
