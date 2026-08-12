export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export type RiskResult = {
  score: number;
  level: RiskLevel;
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

export function calculatePrivacyRisk(
  input: PrivacyRiskInput
): RiskResult {
  let score = 0;

  const factors: string[] = [];
  const recommendations: string[] = [];

  /*
   * ---------------------------------------------------------
   * 1. DATA VOLUME / ENTRY POINT COMPLEXITY
   * ---------------------------------------------------------
   */

  const totalEntryPoints =
    input.selectedEntryPoints.length +
    input.customEntryPoints.length;

  if (totalEntryPoints >= 4) {
    score += 10;

    factors.push(
      "Personal data enters the organisation through multiple collection channels."
    );

    recommendations.push(
      "Maintain a consolidated inventory of all personal-data entry points."
    );
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
   * ---------------------------------------------------------
   * 2. NUMBER OF PERSONAL-DATA FIELDS
   * ---------------------------------------------------------
   */

  const totalFields =
    input.selectedFields.length +
    input.customFields.length;

  if (totalFields >= 10) {
    score += 10;

    factors.push(
      "The assessed process collects a relatively large number of personal-data fields."
    );

    recommendations.push(
      "Review each field for necessity, proportionality and purpose."
    );
  } else if (totalFields >= 5) {
    score += 5;

    factors.push(
      "The assessed process collects multiple categories of personal data."
    );
  }

  /*
   * ---------------------------------------------------------
   * 3. CHILD / STUDENT DATA
   * ---------------------------------------------------------
   */

  if (
    containsValue(input.dataSubjects, "student") ||
    containsValue(input.dataSubjects, "child") ||
    containsValue(input.dataSubjects, "minor")
  ) {
    score += 15;

    factors.push(
      "The processing involves student, child or minor-related personal data."
    );

    recommendations.push(
      "Review child-data processing requirements and parent/guardian controls."
    );
  }

  /*
   * ---------------------------------------------------------
   * 4. MULTIPLE COLLECTOR ROLES
   * ---------------------------------------------------------
   */

  if (input.collectorRoles.length >= 3) {
    score += 5;

    factors.push(
      "Multiple employee or organisational roles may collect the personal data."
    );

    recommendations.push(
      "Define role-based access and responsibilities for each data-collection role."
    );
  }

  /*
   * ---------------------------------------------------------
   * 5. PHYSICAL DATA COLLECTION
   * ---------------------------------------------------------
   */

  if (
    containsValue(input.collectionMethods, "paper") ||
    containsValue(input.collectionMethods, "physical") ||
    containsValue(input.collectionMethods, "in person")
  ) {
    score += 5;

    factors.push(
      "Personal data may be collected through physical or paper-based processes."
    );

    recommendations.push(
      "Review physical security, access, transportation, scanning and secure disposal of paper records."
    );
  }

  /*
   * ---------------------------------------------------------
   * 6. MULTIPLE STORAGE ENVIRONMENTS
   * ---------------------------------------------------------
   */

  if (input.storageEnvironments.length >= 2) {
    score += 8;

    factors.push(
      "Personal data may be stored across multiple environments."
    );

    recommendations.push(
      "Map movement of personal data between physical, employee-device, cloud and on-premises environments."
    );
  }

  /*
   * ---------------------------------------------------------
   * 7. PHYSICAL STORAGE
   * ---------------------------------------------------------
   */

  if (
    containsValue(input.storageEnvironments, "physical") ||
    containsValue(input.storageLocations, "physical")
  ) {
    score += 5;

    factors.push(
      "Physical records may contain personal data."
    );

    recommendations.push(
      "Review physical access controls, secure storage, retention and secure disposal."
    );
  }

  /*
   * ---------------------------------------------------------
   * 8. HYBRID STORAGE
   * ---------------------------------------------------------
   */

  if (
    containsValue(input.storageEnvironments, "hybrid")
  ) {
    score += 8;

    factors.push(
      "The process may involve both physical and digital storage."
    );

    recommendations.push(
      "Map the transition between paper records and digital systems, including scanning and uploading."
    );
  }

  /*
   * ---------------------------------------------------------
   * 9. UNKNOWN STORAGE
   * ---------------------------------------------------------
   */

  if (
    containsValue(input.storageLocations, "unknown")
  ) {
    score += 10;

    factors.push(
      "The storage location of personal data is unknown."
    );

    recommendations.push(
      "Identify all systems, applications, devices and physical locations where personal data is stored."
    );
  }

  /*
   * ---------------------------------------------------------
   * 10. ENCRYPTION
   * ---------------------------------------------------------
   */

  if (
    containsValue(input.encryptionStatus, "clear text") ||
    containsValue(input.encryptionStatus, "not encrypted")
  ) {
    score += 25;

    factors.push(
      "Personal data may be stored or transmitted without adequate encryption."
    );

    recommendations.push(
      "Evaluate encryption controls for personal data at rest and in transit."
    );
  }

  if (
    containsValue(input.encryptionStatus, "unknown")
  ) {
    score += 10;

    factors.push(
      "Encryption status is unknown."
    );

    recommendations.push(
      "Confirm whether personal data is encrypted at rest and in transit."
    );
  }

  /*
   * ---------------------------------------------------------
   * 11. ACCESS CONTROL
   * ---------------------------------------------------------
   */

  if (
    input.accessRoles.length === 0 ||
    containsValue(input.accessRoles, "unknown")
  ) {
    score += 8;

    factors.push(
      "Access roles for personal data are not clearly defined."
    );

    recommendations.push(
      "Define role-based access to personal data and periodically review access."
    );
  }

  /*
   * ---------------------------------------------------------
   * 12. THIRD-PARTY SHARING
   * ---------------------------------------------------------
   */

  if (
    containsValue(input.sharingStatus, "service provider") ||
    containsValue(input.sharingStatus, "third parties") ||
    containsValue(input.sharingStatus, "external")
  ) {
    score += 15;

    factors.push(
      "Personal data may be shared with external service providers or third parties."
    );

    recommendations.push(
      "Maintain a processor/service-provider inventory and review contractual privacy and security obligations."
    );
  }

  if (
    containsValue(input.sharingStatus, "unknown")
  ) {
    score += 8;

    factors.push(
      "Data-sharing arrangements are unknown."
    );

    recommendations.push(
      "Identify all internal and external recipients of personal data."
    );
  }

  /*
   * ---------------------------------------------------------
   * 13. RETENTION
   * ---------------------------------------------------------
   */

  if (
    containsValue(input.retentionPeriod, "indefinitely") ||
    containsValue(input.retentionPeriod, "no defined")
  ) {
    score += 15;

    factors.push(
      "The organisation may not have a defined retention period."
    );

    recommendations.push(
      "Define retention periods based on business, legal and regulatory requirements."
    );
  }

  if (
    containsValue(input.retentionPeriod, "unknown")
  ) {
    score += 8;

    factors.push(
      "Data-retention period is unknown."
    );

    recommendations.push(
      "Document how long each category of personal data is retained."
    );
  }

  /*
   * ---------------------------------------------------------
   * 14. DELETION
   * ---------------------------------------------------------
   */

  if (
    containsValue(input.deletionMethod, "no defined") ||
    containsValue(input.deletionMethod, "unknown")
  ) {
    score += 10;

    factors.push(
      "There may be no defined personal-data deletion process."
    );

    recommendations.push(
      "Define and document secure deletion and disposal procedures."
    );
  }

  /*
   * ---------------------------------------------------------
   * 15. PRIVACY NOTICE
   * ---------------------------------------------------------
   */

  if (
    containsValue(input.privacyNotice, "no") ||
    containsValue(input.privacyNotice, "partially")
  ) {
    score += 12;

    factors.push(
      "Privacy-notice coverage may be incomplete."
    );

    recommendations.push(
      "Review privacy notices provided at or before collection of personal data."
    );
  }

  if (
    containsValue(input.privacyNotice, "unknown")
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
   * ---------------------------------------------------------
   * 16. CONSENT / LAWFUL BASIS
   * ---------------------------------------------------------
   */

  if (
    containsValue(input.consentStatus, "no")
  ) {
    score += 15;

    factors.push(
      "Consent may not be obtained where the organisation expects it to be required."
    );

    recommendations.push(
      "Validate the applicable legal basis and document the organisation's basis for processing."
    );
  }

  if (
    containsValue(input.consentStatus, "unknown")
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
   * ---------------------------------------------------------
   * 17. PARENT / GUARDIAN
   * ---------------------------------------------------------
   */

  if (
    containsValue(input.dataSubjects, "student") ||
    containsValue(input.dataSubjects, "child") ||
    containsValue(input.dataSubjects, "minor")
  ) {
    if (
      containsValue(input.parentalConsent, "no") ||
      containsValue(input.parentalConsent, "partially")
    ) {
      score += 20;

      factors.push(
        "Child-related processing may not have adequate parent/guardian controls."
      );

      recommendations.push(
        "Review parental/guardian requirements for child-related personal data."
      );
    }

    if (
      containsValue(input.parentalConsent, "unknown")
    ) {
      score += 10;

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
   * 18. CROSS-BORDER TRANSFER
   * ---------------------------------------------------------
   */

  if (
    containsValue(input.crossBorderTransfer, "yes")
  ) {
    score += 10;

    factors.push(
      "Personal data may be transferred outside India."
    );

    recommendations.push(
      "Identify countries, cloud services and processors involved in cross-border processing."
    );
  }

  if (
    containsValue(input.crossBorderTransfer, "unknown")
  ) {
    score += 5;

    factors.push(
      "Cross-border data-transfer status is unknown."
    );

    recommendations.push(
      "Determine whether cloud services, SaaS platforms or processors transfer data outside India."
    );
  }

  /*
   * ---------------------------------------------------------
   * 19. UNKNOWN COLLECTION PRACTICES
   * ---------------------------------------------------------
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
  }

  /*
   * ---------------------------------------------------------
   * CAP SCORE
   * ---------------------------------------------------------
   */

  score = Math.min(score, 100);

  /*
   * ---------------------------------------------------------
   * RISK LEVEL
   * ---------------------------------------------------------
   */

  let level: RiskLevel;

  if (score >= 75) {
    level = "Critical";
  } else if (score >= 50) {
    level = "High";
  } else if (score >= 25) {
    level = "Medium";
  } else {
    level = "Low";
  }

  /*
   * Remove duplicate findings and recommendations.
   */

  const uniqueFactors = Array.from(
    new Set(factors)
  );

  const uniqueRecommendations = Array.from(
    new Set(recommendations)
  );

  return {
    score,
    level,
    factors: uniqueFactors,
    recommendations: uniqueRecommendations,
  };
}
