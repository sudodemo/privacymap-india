export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export type PrivacyRiskInput = {
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
  childRelevant?: boolean;
};

export type PrivacyRiskResult = {
  score: number;
  level: RiskLevel;
  factors: string[];
  recommendations: string[];
};

function containsValue(values: string[], search: string): boolean {
  return values.some((value) =>
    value.toLowerCase().includes(search.toLowerCase())
  );
}

export function calculatePrivacyRisk(
  input: PrivacyRiskInput
): PrivacyRiskResult {
  let score = 0;
  const factors: string[] = [];
  const recommendations: string[] = [];

  /*
   * CHILD / MINOR DATA
   */
  if (
    input.childRelevant ||
    containsValue(input.dataSubjects, "student") ||
    containsValue(input.dataSubjects, "child")
  ) {
    score += 15;

    factors.push("Personal data may relate to children or students.");

    recommendations.push(
      "Verify that child-data processing follows applicable DPDPA requirements and that parental/guardian requirements are appropriately addressed."
    );
  }

  /*
   * UNKNOWN DATA PRACTICES
   */
  if (containsValue(input.encryptionStatus, "unknown")) {
    score += 10;
    factors.push("Encryption status is unknown.");
    recommendations.push(
      "Confirm whether personal data is encrypted at rest and in transit."
    );
  }

  if (containsValue(input.storageLocations, "unknown")) {
    score += 10;
    factors.push("Storage location is unknown.");
    recommendations.push(
      "Identify all systems, applications, devices and physical locations where personal data is stored."
    );
  }

  /*
   * CLEAR TEXT / NO ENCRYPTION
   */
  if (
    containsValue(input.encryptionStatus, "clear text") ||
    containsValue(input.encryptionStatus, "not encrypted")
  ) {
    score += 25;

    factors.push("Personal data may be stored without encryption.");

    recommendations.push(
      "Evaluate encryption controls for personal data at rest and in transit."
    );
  }

  /*
   * PHYSICAL RECORDS
   */
  if (
    containsValue(input.storageEnvironments, "physical") ||
    containsValue(input.collectionMethods, "paper") ||
    containsValue(input.storageLocations, "physical")
  ) {
    score += 5;

    factors.push("Physical personal-data records are involved.");

    recommendations.push(
      "Review physical access controls, secure storage, retention and secure disposal of paper records."
    );
  }

  /*
   * HYBRID ENVIRONMENT
   */
  if (containsValue(input.storageEnvironments, "hybrid")) {
    score += 8;

    factors.push(
      "Personal data is handled across physical and digital environments."
    );

    recommendations.push(
      "Map the transition between physical and digital records, including scanning, uploading, emailing and archival processes."
    );
  }

  /*
   * THIRD-PARTY SHARING
   */
  if (
    containsValue(input.sharingStatus, "service provider") ||
    containsValue(input.sharingStatus, "third parties") ||
    containsValue(input.sharingStatus, "external")
  ) {
    score += 15;

    factors.push("Personal data may be shared with external parties.");

    recommendations.push(
      "Maintain a record of processors/service providers and review contractual privacy and security obligations."
    );
  }

  /*
   * UNKNOWN SHARING
   */
  if (containsValue(input.sharingStatus, "unknown")) {
    score += 8;

    factors.push("Data-sharing arrangements are unknown.");

    recommendations.push(
      "Identify all internal and external recipients of personal data."
    );
  }

  /*
   * RETENTION
   */
  if (
    containsValue(input.retentionPeriod, "indefinitely") ||
    containsValue(input.retentionPeriod, "no defined")
  ) {
    score += 15;

    factors.push("There may be no defined or limited retention period.");

    recommendations.push(
      "Define retention periods based on business, legal and regulatory requirements and establish disposal procedures."
    );
  }

  if (containsValue(input.retentionPeriod, "unknown")) {
    score += 8;

    factors.push("Data-retention period is unknown.");

    recommendations.push(
      "Document how long each category of personal data is retained."
    );
  }

  /*
   * DELETION
   */
  if (
    containsValue(input.deletionMethod, "no defined") ||
    containsValue(input.deletionMethod, "unknown")
  ) {
    score += 10;

    factors.push("There may be no defined data-deletion process.");

    recommendations.push(
      "Define and document secure deletion or disposal procedures."
    );
  }

  /*
   * PRIVACY NOTICE
   */
  if (
    containsValue(input.privacyNotice, "no") ||
    containsValue(input.privacyNotice, "partially")
  ) {
    score += 12;

    factors.push("Privacy notice coverage may be incomplete.");

    recommendations.push(
      "Review privacy notices provided at or before collection of personal data."
    );
  }

  if (containsValue(input.privacyNotice, "unknown")) {
    score += 7;

    factors.push("Privacy-notice status is unknown.");

    recommendations.push(
      "Confirm whether appropriate privacy notices are provided to data subjects."
    );
  }

  /*
   * CONSENT
   */
  if (containsValue(input.consentStatus, "no")) {
    score += 15;

    factors.push("Consent may not be obtained where the organisation expects it to be required.");

    recommendations.push(
      "Validate the applicable legal basis and document the organisation's basis for processing."
    );
  }

  if (containsValue(input.consentStatus, "unknown")) {
    score += 8;

    factors.push("Lawful basis / consent status is unknown.");

    recommendations.push(
      "Document the purpose and legal basis for each personal-data processing activity."
    );
  }

  /*
   * PARENTAL / GUARDIAN INVOLVEMENT
   */
  if (
    containsValue(input.dataSubjects, "student") ||
    input.childRelevant
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
        "Review parental/guardian consent and child-data processing controls."
      );
    }

    if (containsValue(input.parentalConsent, "unknown")) {
      score += 10;

      factors.push(
        "Parent/guardian requirements for child-related processing are unknown."
      );

      recommendations.push(
        "Confirm how parent/guardian requirements are handled for child-related personal data."
      );
    }
  }

  /*
   * CROSS-BORDER TRANSFER
   */
  if (containsValue(input.crossBorderTransfer, "yes")) {
    score += 10;

    factors.push("Personal data may be transferred outside India.");

    recommendations.push(
      "Identify the countries and service providers involved and assess applicable transfer requirements."
    );
  }

  if (containsValue(input.crossBorderTransfer, "unknown")) {
    score += 5;

    factors.push("Cross-border data-transfer status is unknown.");

    recommendations.push(
      "Identify whether cloud services, SaaS platforms or other processors transfer data outside India."
    );
  }

  /*
   * ACCESS CONTROL
   */
  if (
    input.accessRoles.length === 0 ||
    containsValue(input.accessRoles, "unknown")
  ) {
    score += 8;

    factors.push("Data-access roles are not clearly defined.");

    recommendations.push(
      "Define role-based access to personal data and review access periodically."
    );
  }

  /*
   * CAP SCORE
   */
  score = Math.min(score, 100);

  /*
   * RISK LEVEL
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
   * REMOVE DUPLICATE RECOMMENDATIONS
   */
  const uniqueFactors = Array.from(new Set(factors));
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
