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

  /*
   * Kept for compatibility with the earlier risk-engine structure.
   */
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
 * ---------------------------------------------------------
 * PRIVACY RISK INPUT
 * ---------------------------------------------------------
 *
 * IMPORTANT:
 * These property names intentionally match the current
 * app/assessment/page.tsx file.
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

function hasAny(
  values: string[] | undefined,
  searches: string[]
): boolean {
  return searches.some((search) =>
    containsValue(values, search)
  );
}

function uniqueStrings(values: string[]): string[] {
  return Array.from(new Set(values));
}

function clampScore(score: number): number {
  return Math.max(0, Math.min(score, 100));
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

function addFinding(
  findings: RiskFinding[],
  factors: string[],
  recommendations: string[],
  finding: RiskFinding
): void {
  findings.push(finding);

  factors.push(finding.explanation);
  recommendations.push(finding.recommendation);
}

/*
 * ---------------------------------------------------------
 * MAIN PRIVACY RISK ENGINE
 * ---------------------------------------------------------
 */

export function calculatePrivacyRisk(
  input: PrivacyRiskInput
): RiskResult {
  let score = 0;

  const findings: RiskFinding[] = [];
  const factors: string[] = [];
  const recommendations: string[] = [];

  /*
   * -------------------------------------------------------
   * 1. DATA ENTRY POINT COMPLEXITY
   * -------------------------------------------------------
   */

  const totalEntryPoints =
    input.selectedEntryPoints.length +
    input.customEntryPoints.length;

  if (totalEntryPoints >= 4) {
    score += 10;

    addFinding(
      findings,
      factors,
      recommendations,
      {
        id: "ENTRY-001",
        category: "Data Collection",
        title: "Multiple personal-data entry points",
        level: "Medium",
        explanation:
          "Personal data enters the organisation through multiple collection channels. This increases the possibility of inconsistent privacy notices, uncontrolled collection and incomplete data-flow mapping.",
        recommendation:
          "Maintain a consolidated inventory of every personal-data entry point and document the purpose, owner and controls for each channel."
      }
    );
  } else if (totalEntryPoints >= 2) {
    score += 5;

    addFinding(
      findings,
      factors,
      recommendations,
      {
        id: "ENTRY-002",
        category: "Data Collection",
        title: "More than one data entry point",
        level: "Low",
        explanation:
          "Personal data is collected through more than one entry point.",
        recommendation:
          "Ensure all collection channels are included in the privacy and data-flow inventory."
      }
    );
  }

  /*
   * -------------------------------------------------------
   * 2. NUMBER OF PERSONAL DATA FIELDS
   * -------------------------------------------------------
   */

  const totalFields =
    input.selectedFields.length +
    input.customFields.length;

  if (totalFields >= 10) {
    score += 10;

    addFinding(
      findings,
      factors,
      recommendations,
      {
        id: "DATA-001",
        category: "Data Minimisation",
        title: "Large number of personal-data fields",
        level: "Medium",
        explanation:
          "The assessed process collects a relatively large number of personal-data fields.",
        recommendation:
          "Review every field for necessity, proportionality, purpose and retention requirements."
      }
    );
  } else if (totalFields >= 5) {
    score += 5;

    addFinding(
      findings,
      factors,
      recommendations,
      {
        id: "DATA-002",
        category: "Data Minimisation",
        title: "Multiple categories of personal data",
        level: "Low",
        explanation:
          "The assessed process collects multiple categories of personal data.",
        recommendation:
          "Confirm that every collected field has a defined business purpose."
      }
    );
  }

  /*
   * -------------------------------------------------------
   * 3. STUDENT / CHILD DATA
   * -------------------------------------------------------
   */

  const involvesStudentOrChild =
    hasAny(input.dataSubjectTypes, [
      "student",
      "child",
      "minor"
    ]);

  if (involvesStudentOrChild) {
    score += 15;

    addFinding(
      findings,
      factors,
      recommendations,
      {
        id: "CHILD-001",
        category: "Children's Data",
        title: "Student or child personal data",
        level: "High",
        explanation:
          "The processing involves student, child or minor-related personal data. Such processing requires stronger privacy governance and appropriate controls.",
        recommendation:
          "Review child-data requirements, parent/guardian involvement, transparency and access controls."
      }
    );
  }

  /*
   * -------------------------------------------------------
   * 4. PARENT / GUARDIAN DATA
   * -------------------------------------------------------
   */

  const involvesParent =
    hasAny(input.dataSubjectTypes, [
      "parent",
      "guardian"
    ]);

  if (involvesParent) {
    score += 5;

    addFinding(
      findings,
      factors,
      recommendations,
      {
        id: "SUBJECT-001",
        category: "Data Subjects",
        title: "Parent or guardian personal data",
        level: "Low",
        explanation:
          "The process also involves personal data relating to parents or guardians.",
        recommendation:
          "Ensure parent/guardian information is included in the data inventory, privacy notice and retention schedule."
      }
    );
  }

  /*
   * -------------------------------------------------------
   * 5. MULTIPLE DATA-COLLECTOR ROLES
   * -------------------------------------------------------
   */

  if (input.collectorRoles.length >= 3) {
    score += 5;

    addFinding(
      findings,
      factors,
      recommendations,
      {
        id: "COLLECTOR-001",
        category: "Access & Accountability",
        title: "Multiple personnel collect personal data",
        level: "Medium",
        explanation:
          "Multiple employee or organisational roles may collect personal data.",
        recommendation:
          "Define responsibilities and role-based permissions for each data-collection role."
      }
    );
  }

  /*
   * -------------------------------------------------------
   * 6. THIRD-PARTY DATA COLLECTION
   * -------------------------------------------------------
   */

  if (
    hasAny(input.collectorRoles, [
      "third-party",
      "service provider"
    ])
  ) {
    score += 10;

    addFinding(
      findings,
      factors,
      recommendations,
      {
        id: "COLLECTOR-002",
        category: "Third Parties",
        title: "Third party may collect personal data",
        level: "Medium",
        explanation:
          "A third-party service provider may participate directly in collecting personal data.",
        recommendation:
          "Identify the third party, define its role and review contractual privacy and security obligations."
      }
    );
  }

  /*
   * -------------------------------------------------------
   * 7. PHYSICAL / PAPER COLLECTION
   * -------------------------------------------------------
   */

  const physicalCollection =
    hasAny(input.collectionFormats, [
      "paper",
      "physical",
      "in person",
      "verbal"
    ]);

  if (physicalCollection) {
    score += 5;

    addFinding(
      findings,
      factors,
      recommendations,
      {
        id: "COLLECTION-001",
        category: "Data Collection",
        title: "Physical or paper-based data collection",
        level: "Medium",
        explanation:
          "Personal data may be collected through physical forms or in-person processes.",
        recommendation:
          "Review physical security, access, transportation, scanning, copying and secure disposal of paper records."
      }
    );
  }

  /*
   * -------------------------------------------------------
   * 8. DIGITAL COLLECTION
   * -------------------------------------------------------
   */

  const digitalCollection =
    hasAny(input.collectionFormats, [
      "website",
      "google form",
      "mobile",
      "school app",
      "whatsapp",
      "email",
      "excel",
      "spreadsheet"
    ]);

  /*
   * -------------------------------------------------------
   * 9. PHYSICAL + DIGITAL HYBRID COLLECTION
   * -------------------------------------------------------
   */

  if (physicalCollection && digitalCollection) {
    score += 10;

    addFinding(
      findings,
      factors,
      recommendations,
      {
        id: "COLLECTION-002",
        category: "Data Flow",
        title: "Hybrid physical and digital collection",
        level: "High",
        explanation:
          "The process uses both physical and digital collection methods. Personal data may move between paper records, spreadsheets, email, forms or other systems.",
        recommendation:
          "Document the complete data flow from initial collection through scanning, transcription, upload, sharing, storage and eventual disposal."
      }
    );
  }

  /*
   * -------------------------------------------------------
   * 10. MULTIPLE STORAGE LOCATIONS
   * -------------------------------------------------------
   */

  if (input.storageLocations.length >= 3) {
    score += 10;

    addFinding(
      findings,
      factors,
      recommendations,
      {
        id: "STORAGE-001",
        category: "Data Storage",
        title: "Personal data stored in multiple locations",
        level: "Medium",
        explanation:
          "Personal data may be stored across several systems, applications, devices or physical locations.",
        recommendation:
          "Create a data-storage inventory identifying each system, owner, purpose, location and retention period."
      }
    );
  } else if (input.storageLocations.length >= 2) {
    score += 5;

    addFinding(
      findings,
      factors,
      recommendations,
      {
        id: "STORAGE-002",
        category: "Data Storage",
        title: "Multiple storage locations",
        level: "Low",
        explanation:
          "Personal data may be stored in more than one location.",
        recommendation:
          "Ensure all storage locations are documented in the data-flow inventory."
      }
    );
  }

  /*
   * -------------------------------------------------------
   * 11. MULTIPLE STORAGE ENVIRONMENTS
   * -------------------------------------------------------
   */

  if (input.storageEnvironments.length >= 2) {
    score += 8;

    addFinding(
      findings,
      factors,
      recommendations,
      {
        id: "STORAGE-003",
        category: "Data Storage",
        title: "Multiple storage environments",
        level: "Medium",
        explanation:
          "Personal data may be stored across multiple environments such as cloud, on-premises, employee devices or physical records.",
        recommendation:
          "Map movement of personal data between physical, employee-device, cloud, third-party and on-premises environments."
      }
    );
  }

  /*
   * -------------------------------------------------------
   * 12. PHYSICAL STORAGE
   * -------------------------------------------------------
   */

  const physicalStorage =
    hasAny(input.storageEnvironments, [
      "physical"
    ]) ||
    hasAny(input.storageLocations, [
      "paper",
      "physical record",
      "physical"
    ]);

  if (physicalStorage) {
    score += 5;

    addFinding(
      findings,
      factors,
      recommendations,
      {
        id: "STORAGE-004",
        category: "Physical Records",
        title: "Physical records contain personal data",
        level: "Medium",
        explanation:
          "Physical records may contain personal data and therefore require controls equivalent to other sensitive information repositories.",
        recommendation:
          "Review physical access controls, secure storage, visitor access, retention and secure destruction."
      }
    );
  }

  /*
   * -------------------------------------------------------
   * 13. HYBRID PHYSICAL + DIGITAL STORAGE
   * -------------------------------------------------------
   */

  const hasCloudOrDigitalStorage =
    hasAny(input.storageEnvironments, [
      "cloud",
      "on-premises",
      "employee device",
      "mobile device",
      "third-party hosted"
    ]) ||
    hasAny(input.storageLocations, [
      "school management",
      "student information",
      "crm",
      "google drive",
      "microsoft",
      "sharepoint",
      "excel",
      "spreadsheet",
      "email",
      "whatsapp",
      "computer",
      "third-party"
    ]);

  if (physicalStorage && hasCloudOrDigitalStorage) {
    score += 10;

    addFinding(
      findings,
      factors,
      recommendations,
      {
        id: "STORAGE-005",
        category: "Data Flow",
        title: "Hybrid physical and digital storage",
        level: "High",
        explanation:
          "Personal data may exist simultaneously in physical records and digital systems. This creates additional risks around scanning, duplication, reconciliation, retention and deletion.",
        recommendation:
          "Map the lifecycle between paper and digital records and ensure retention and deletion requirements apply consistently to both."
      }
    );
  }

  /*
   * -------------------------------------------------------
   * 14. UNKNOWN STORAGE
   * -------------------------------------------------------
   */

  if (
    hasAny(input.storageLocations, [
      "unknown"
    ]) ||
    hasAny(input.storageEnvironments, [
      "unknown"
    ])
  ) {
    score += 10;

    addFinding(
      findings,
      factors,
      recommendations,
      {
        id: "STORAGE-006",
        category: "Data Governance",
        title: "Storage location is unknown",
        level: "High",
        explanation:
          "The location or environment where personal data is stored is not fully known.",
        recommendation:
          "Identify all systems, applications, devices, cloud services and physical locations where personal data is stored."
      }
    );
  }

  /*
   * -------------------------------------------------------
   * 15. ENCRYPTION
   * -------------------------------------------------------
   */

  if (
    hasAny(input.encryptionStatuses, [
      "clear text",
      "not encrypted"
    ])
  ) {
    score += 25;

    addFinding(
      findings,
      factors,
      recommendations,
      {
        id: "SECURITY-001",
        category: "Security",
        title: "Personal data may not be encrypted",
        level: "Critical",
        explanation:
          "Personal data may be stored or transmitted without adequate encryption.",
        recommendation:
          "Evaluate encryption controls for personal data at rest and in transit and remediate unprotected repositories."
      }
    );
  }

  if (
    hasAny(input.encryptionStatuses, [
      "unknown"
    ])
  ) {
    score += 10;

    addFinding(
      findings,
      factors,
      recommendations,
      {
        id: "SECURITY-002",
        category: "Security",
        title: "Encryption status is unknown",
        level: "High",
        explanation:
          "The organisation has not established whether personal data is adequately encrypted.",
        recommendation:
          "Confirm encryption requirements and implementation for each storage and transmission mechanism."
      }
    );
  }

  /*
   * -------------------------------------------------------
   * 16. ACCESS CONTROL
   * -------------------------------------------------------
   */

  if (input.accessRoles.length === 0) {
    score += 8;

    addFinding(
      findings,
      factors,
      recommendations,
      {
        id: "ACCESS-001",
        category: "Access Control",
        title: "Access roles are not defined",
        level: "High",
        explanation:
          "No personnel or organisational roles have been identified as having access to the personal data.",
        recommendation:
          "Define authorised access roles and implement role-based access controls."
      }
    );
  }

  if (
    hasAny(input.accessRoles, [
      "unknown"
    ])
  ) {
    score += 8;

    addFinding(
      findings,
      factors,
      recommendations,
      {
        id: "ACCESS-002",
        category: "Access Control",
        title: "Data access is unknown",
        level: "High",
        explanation:
          "The organisation does not have a clear understanding of who can access the personal data.",
        recommendation:
          "Identify all users, roles and third parties with access and periodically review permissions."
      }
    );
  }

  if (input.accessRoles.length >= 5) {
    score += 5;

    addFinding(
      findings,
      factors,
      recommendations,
      {
        id: "ACCESS-003",
        category: "Access Control",
        title: "Large number of access roles",
        level: "Medium",
        explanation:
          "Multiple organisational roles may have access to the assessed personal data.",
        recommendation:
          "Apply least privilege and periodically review whether each role genuinely requires access."
      }
    );
  }

  /*
   * -------------------------------------------------------
   * 17. THIRD-PARTY SHARING
   * -------------------------------------------------------
   */

  if (
    hasAny(input.sharingStatuses, [
      "service provider",
      "third parties",
      "external"
    ])
  ) {
    score += 15;

    addFinding(
      findings,
      factors,
      recommendations,
      {
        id: "SHARING-001",
        category: "Third Parties",
        title: "Personal data shared externally",
        level: "High",
        explanation:
          "Personal data may be shared with external service providers or third parties.",
        recommendation:
          "Maintain a processor/service-provider inventory and review contractual privacy, security and data-processing obligations."
      }
    );
  }

  if (
    hasAny(input.sharingStatuses, [
      "unknown"
    ])
  ) {
    score += 8;

    addFinding(
      findings,
      factors,
      recommendations,
      {
        id: "SHARING-002",
        category: "Data Sharing",
        title: "Data-sharing arrangements are unknown",
        level: "High",
        explanation:
          "The organisation has not established all recipients of the personal data.",
        recommendation:
          "Identify all internal and external recipients of personal data."
      }
    );
  }

  /*
   * -------------------------------------------------------
   * 18. RETENTION
   * -------------------------------------------------------
   */

  if (
    hasAny(input.retentionPeriods, [
      "indefinitely",
      "no defined"
    ])
  ) {
    score += 15;

    addFinding(
      findings,
      factors,
      recommendations,
      {
        id: "RETENTION-001",
        category: "Retention",
        title: "Undefined or indefinite retention",
        level: "High",
        explanation:
          "The organisation may retain personal data indefinitely or without a defined retention period.",
        recommendation:
          "Define retention periods based on business, legal and regulatory requirements and document them in the retention schedule."
      }
    );
  }

  if (
    hasAny(input.retentionPeriods, [
      "unknown"
    ])
  ) {
    score += 8;

    addFinding(
      findings,
      factors,
      recommendations,
      {
        id: "RETENTION-002",
        category: "Retention",
        title: "Retention period is unknown",
        level: "High",
        explanation:
          "The retention period for the personal data has not been established.",
        recommendation:
          "Document how long each category of personal data is retained and why."
      }
    );
  }

  /*
   * -------------------------------------------------------
   * 19. DELETION
   * -------------------------------------------------------
   */

  if (
    hasAny(input.deletionMethods, [
      "no defined",
      "unknown"
    ])
  ) {
    score += 10;

    addFinding(
      findings,
      factors,
      recommendations,
      {
        id: "DELETION-001",
        category: "Data Lifecycle",
        title: "Personal-data deletion process is not defined",
        level: "High",
        explanation:
          "There may be no clearly defined process for deleting or securely disposing of personal data.",
        recommendation:
          "Define secure deletion and disposal procedures for both digital and physical records."
      }
    );
  }

  /*
   * -------------------------------------------------------
   * 20. PRIVACY NOTICE
   * -------------------------------------------------------
   */

  if (
    hasAny(input.privacyNotices, [
      "no",
      "partially"
    ])
  ) {
    score += 12;

    addFinding(
      findings,
      factors,
      recommendations,
      {
        id: "NOTICE-001",
        category: "Transparency",
        title: "Privacy-notice coverage may be incomplete",
        level: "High",
        explanation:
          "Privacy notices may not be consistently provided at the point of personal-data collection.",
        recommendation:
          "Review privacy notices across every collection channel, including paper forms, websites, Google Forms, email and verbal collection."
      }
    );
  }

  if (
    hasAny(input.privacyNotices, [
      "unknown"
    ])
  ) {
    score += 7;

    addFinding(
      findings,
      factors,
      recommendations,
      {
        id: "NOTICE-002",
        category: "Transparency",
        title: "Privacy-notice status is unknown",
        level: "High",
        explanation:
          "It is not clear whether appropriate privacy notices are provided to data subjects.",
        recommendation:
          "Confirm privacy-notice coverage for every personal-data collection point."
      }
    );
  }

  /*
   * -------------------------------------------------------
   * 21. CONSENT / LAWFUL BASIS
   * -------------------------------------------------------
   */

  if (
    hasAny(input.consentStatuses, [
      "no"
    ])
  ) {
    score += 15;

    addFinding(
      findings,
      factors,
      recommendations,
      {
        id: "LEGAL-001",
        category: "Lawful Processing",
        title: "Consent or lawful-basis controls may be incomplete",
        level: "High",
        explanation:
          "Consent may not be obtained where the organisation expects it to be required, or the processing basis may not be adequately documented.",
        recommendation:
          "Validate the applicable legal basis for each processing activity and document the basis."
      }
    );
  }

  if (
    hasAny(input.consentStatuses, [
      "unknown"
    ])
  ) {
    score += 8;

    addFinding(
      findings,
      factors,
      recommendations,
      {
        id: "LEGAL-002",
        category: "Lawful Processing",
        title: "Lawful-basis status is unknown",
        level: "High",
        explanation:
          "The organisation has not established the consent or other lawful basis applicable to the processing.",
        recommendation:
          "Document the purpose and applicable legal basis for each personal-data processing activity."
      }
    );
  }

  /*
   * -------------------------------------------------------
   * 22. PARENT / GUARDIAN CONTROLS
   * -------------------------------------------------------
   */

  if (involvesStudentOrChild) {
    if (
      hasAny(input.parentalConsentStatuses, [
        "no",
        "partially"
      ])
    ) {
      score += 20;

      addFinding(
        findings,
        factors,
        recommendations,
        {
          id: "CHILD-002",
          category: "Children's Data",
          title: "Parent/guardian controls may be incomplete",
          level: "Critical",
          explanation:
            "Child-related processing may not have adequate parent/guardian involvement or controls.",
          recommendation:
            "Review parent/guardian requirements and implement appropriate controls for child-related personal data."
        }
      );
    }

    if (
      hasAny(input.parentalConsentStatuses, [
        "unknown"
      ])
    ) {
      score += 10;

      addFinding(
        findings,
        factors,
        recommendations,
        {
          id: "CHILD-003",
          category: "Children's Data",
          title: "Parent/guardian requirements are unknown",
          level: "High",
          explanation:
            "The organisation has not established how parent/guardian requirements are handled for child-related personal data.",
          recommendation:
            "Confirm and document how parent/guardian involvement is addressed."
        }
      );
    }
  }

  /*
   * -------------------------------------------------------
   * 23. CROSS-BORDER TRANSFER
   * -------------------------------------------------------
   */

  if (
    hasAny(input.crossBorderTransfers, [
      "yes"
    ])
  ) {
    score += 10;

    addFinding(
      findings,
      factors,
      recommendations,
      {
        id: "TRANSFER-001",
        category: "Data Transfer",
        title: "Potential cross-border personal-data transfer",
        level: "High",
        explanation:
          "Personal data may be transferred outside India through cloud services, SaaS applications, service providers or other processing arrangements.",
        recommendation:
          "Identify countries, cloud services and processors involved and assess applicable transfer, contractual and security requirements."
      }
    );
  }

  if (
    hasAny(input.crossBorderTransfers, [
      "unknown"
    ])
  ) {
    score += 5;

    addFinding(
      findings,
      factors,
      recommendations,
      {
        id: "TRANSFER-002",
        category: "Data Transfer",
        title: "Cross-border transfer status is unknown",
        level: "Medium",
        explanation:
          "The organisation has not established whether personal data is transferred outside India.",
        recommendation:
          "Determine whether cloud services, SaaS platforms or processors transfer or remotely access personal data outside India."
      }
    );
  }

  /*
   * -------------------------------------------------------
   * 24. UNKNOWN COLLECTION METHOD
   * -------------------------------------------------------
   */

  if (input.collectionFormats.length === 0) {
    score += 5;

    addFinding(
      findings,
      factors,
      recommendations,
      {
        id: "COLLECTION-003",
        category: "Data Collection",
        title: "Collection method is not documented",
        level: "Medium",
        explanation:
          "The method used to collect personal data has not been documented.",
        recommendation:
          "Document the collection method for every personal-data entry point."
      }
    );
  }

  /*
   * -------------------------------------------------------
   * 25. UNKNOWN DATA SUBJECT
   * -------------------------------------------------------
   */

  if (input.dataSubjectTypes.length === 0) {
    score += 5;

    addFinding(
      findings,
      factors,
      recommendations,
      {
        id: "SUBJECT-002",
        category: "Data Governance",
        title: "Data subjects are not identified",
        level: "Medium",
        explanation:
          "The organisation has not identified who the personal data relates to.",
        recommendation:
          "Identify all relevant data-subject categories, such as students, parents, employees and visitors."
      }
    );
  }

  /*
   * -------------------------------------------------------
   * 26. UNKNOWN STORAGE / ACCESS / SECURITY
   * -------------------------------------------------------
   */

  if (input.storageLocations.length === 0) {
    score += 5;

    addFinding(
      findings,
      factors,
      recommendations,
      {
        id: "STORAGE-007",
        category: "Data Governance",
        title: "Storage location is not documented",
        level: "Medium",
        explanation:
          "No storage location has been identified for the assessed personal data.",
        recommendation:
          "Identify all physical and digital locations where the personal data is stored."
      }
    );
  }

  /*
   * -------------------------------------------------------
   * FINAL SCORE
   * -------------------------------------------------------
   */

  score = clampScore(score);

  const overallLevel = getRiskLevel(score);

  /*
   * -------------------------------------------------------
   * CATEGORY SCORES
   * -------------------------------------------------------
   *
   * These are intentionally derived from findings rather
   * than creating a second independent risk engine.
   */

  const categoryNames = uniqueStrings(
    findings.map((finding) => finding.category)
  );

  const categoryScores: RiskCategoryScore[] =
    categoryNames.map((category) => {
      const categoryFindings = findings.filter(
        (finding) =>
          finding.category === category
      );

      let categoryScore = 0;

      categoryFindings.forEach((finding) => {
        switch (finding.level) {
          case "Critical":
            categoryScore += 40;
            break;

          case "High":
            categoryScore += 30;
            break;

          case "Medium":
            categoryScore += 20;
            break;

          case "Low":
            categoryScore += 10;
            break;
        }
      });

      categoryScore = clampScore(categoryScore);

      return {
        category,
        score: categoryScore,
        level: getRiskLevel(categoryScore)
      };
    });

  /*
   * -------------------------------------------------------
   * DEDUPLICATE
   * -------------------------------------------------------
   */

  const uniqueFindings = Array.from(
    new Map(
      findings.map((finding) => [
        finding.id,
        finding
      ])
    ).values()
  );

  const uniqueFactors = uniqueStrings(
    factors
  );

  const uniqueRecommendations =
    uniqueStrings(recommendations);

  /*
   * -------------------------------------------------------
   * RESULT
   * -------------------------------------------------------
   */

  return {
    score,
    overallLevel,
    findings: uniqueFindings,
    categoryScores,

    factors: uniqueFactors,
    recommendations: uniqueRecommendations
  };
}
