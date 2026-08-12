export type RiskLevel = "Low" | "Medium" | "High" | "Critical";

export type RiskCategory =
  | "Data Collection"
  | "Data Subject"
  | "Consent & Notice"
  | "Storage & Security"
  | "Access & Sharing"
  | "Retention & Deletion"
  | "Third-Party"
  | "Cross-Border"
  | "Governance";

export interface RiskFinding {
  id: string;
  category: RiskCategory;
  level: RiskLevel;
  title: string;
  explanation: string;
  recommendation: string;
}

export interface PrivacyAssessmentAnswers {
  selectedEntryPoints: string[];
  customEntryPoints: {
    id: string;
    name: string;
    collection_method: string;
    custom: boolean;
  }[];

  selectedFields: string[];

  customFields: {
    id: string;
    name: string;
    custom: boolean;
  }[];

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
}

export interface RiskResult {
  overallLevel: RiskLevel;
  score: number;

  categoryScores: {
    category: RiskCategory;
    score: number;
    level: RiskLevel;
  }[];

  findings: RiskFinding[];
}

function getRiskLevel(score: number): RiskLevel {
  if (score >= 80) return "Critical";
  if (score >= 55) return "High";
  if (score >= 30) return "Medium";
  return "Low";
}

function addFinding(
  findings: RiskFinding[],
  finding: RiskFinding
) {
  findings.push(finding);
}

export function calculatePrivacyRisk(
  answers: PrivacyAssessmentAnswers
): RiskResult {
  const findings: RiskFinding[] = [];

  const categoryScore: Record<RiskCategory, number> = {
    "Data Collection": 0,
    "Data Subject": 0,
    "Consent & Notice": 0,
    "Storage & Security": 0,
    "Access & Sharing": 0,
    "Retention & Deletion": 0,
    "Third-Party": 0,
    "Cross-Border": 0,
    Governance: 0,
  };

  /*
   * ---------------------------------------------------------
   * DATA COLLECTION
   * ---------------------------------------------------------
   */

  const totalEntryPoints =
    answers.selectedEntryPoints.length +
    answers.customEntryPoints.length;

  if (totalEntryPoints >= 4) {
    categoryScore["Data Collection"] += 25;

    addFinding(findings, {
      id: "COLLECTION-MULTIPLE-CHANNELS",
      category: "Data Collection",
      level: "High",
      title: "Multiple personal-data collection channels",
      explanation:
        "Personal data is being collected through multiple entry points. Multiple channels can make it difficult to maintain consistent privacy notices, consent practices, security controls and retention rules.",
      recommendation:
        "Create an approved list of personal-data collection channels and ensure the same privacy and security controls are applied across each channel.",
    });
  } else if (totalEntryPoints >= 2) {
    categoryScore["Data Collection"] += 12;

    addFinding(findings, {
      id: "COLLECTION-MULTIPLE-CHANNELS-MEDIUM",
      category: "Data Collection",
      level: "Medium",
      title: "Personal data enters through multiple channels",
      explanation:
        "The organisation uses more than one personal-data collection channel.",
      recommendation:
        "Document each collection channel and confirm that privacy notices, consent mechanisms and security controls are consistent.",
    });
  }

  const informalChannels = answers.collectionFormats.filter((item) =>
    [
      "WhatsApp",
      "Email",
      "Telephone",
      "In Person / Verbal",
    ].includes(item)
  );

  if (informalChannels.length > 0) {
    categoryScore["Data Collection"] += 15;

    addFinding(findings, {
      id: "COLLECTION-INFORMAL",
      category: "Data Collection",
      level: "Medium",
      title: "Informal communication channels used for personal data",
      explanation:
        "Personal data may be collected through communication channels such as WhatsApp, email, telephone or verbal communication.",
      recommendation:
        "Define approved communication channels for personal data and provide staff with clear instructions on what information may be collected through informal channels.",
    });
  }

  /*
   * ---------------------------------------------------------
   * DATA SUBJECT
   * ---------------------------------------------------------
   */

  const childData =
    answers.dataSubjectTypes.some((item) =>
      [
        "Student",
        "Child",
        "Minor",
        "Student / Child",
      ].includes(item)
    ) ||
    answers.selectedFields.some((item) =>
      item.toLowerCase().includes("student")
    );

  if (childData) {
    categoryScore["Data Subject"] += 30;

    addFinding(findings, {
      id: "SUBJECT-CHILD-DATA",
      category: "Data Subject",
      level: "High",
      title: "Child or student personal data is involved",
      explanation:
        "The assessment indicates that personal data relating to children or students may be processed.",
      recommendation:
        "Apply enhanced controls for child data, including appropriate notice, consent/parental mechanisms, access controls, retention and security safeguards.",
    });

    const parentalGap =
      answers.parentalConsentStatuses.length === 0 ||
      answers.parentalConsentStatuses.some(
        (item) =>
          item === "No" ||
          item === "Unknown" ||
          item === "Partially"
      );

    if (parentalGap) {
      categoryScore["Data Subject"] += 25;

      addFinding(findings, {
        id: "SUBJECT-PARENTAL-GAP",
        category: "Data Subject",
        level: "High",
        title: "Parental/guardian involvement requires review",
        explanation:
          "Child-related processing has been identified, but parental or guardian involvement is missing, incomplete or unknown.",
        recommendation:
          "Review the process for obtaining and documenting the appropriate parental/guardian involvement and ensure that the process is consistently applied.",
      });
    }
  }

  /*
   * ---------------------------------------------------------
   * CONSENT & NOTICE
   * ---------------------------------------------------------
   */

  if (
    answers.privacyNotices.some(
      (item) => item === "No" || item === "Unknown"
    ) ||
    answers.privacyNotices.length === 0
  ) {
    categoryScore["Consent & Notice"] += 25;

    addFinding(findings, {
      id: "NOTICE-MISSING",
      category: "Consent & Notice",
      level: "High",
      title: "Privacy notice is missing or unknown",
      explanation:
        "The organisation has not confirmed that an appropriate privacy notice is provided to the data subject.",
      recommendation:
        "Review each personal-data collection point and provide an appropriate privacy notice explaining the relevant processing.",
    });
  }

  if (
    answers.consentStatuses.some(
      (item) => item === "No" || item === "Unknown"
    ) ||
    answers.consentStatuses.length === 0
  ) {
    categoryScore["Consent & Notice"] += 20;

    addFinding(findings, {
      id: "CONSENT-UNCERTAIN",
      category: "Consent & Notice",
      level: "High",
      title: "Consent or lawful processing basis requires review",
      explanation:
        "The assessment does not establish that the organisation has an appropriate consent mechanism or other applicable lawful basis for the processing.",
      recommendation:
        "Document the processing purpose and determine the appropriate legal basis and notice/consent mechanism for each processing activity.",
    });
  }

  /*
   * ---------------------------------------------------------
   * STORAGE & SECURITY
   * ---------------------------------------------------------
   */

  const physicalStorage =
    answers.storageEnvironments.includes("Physical Storage") ||
    answers.storageLocations.some((item) =>
      [
        "Paper File / Physical Record",
        "Physical File",
        "Paper",
      ].includes(item)
    );

  const digitalStorage =
    answers.storageEnvironments.some((item) =>
      [
        "Cloud",
        "On-Premises",
        "Employee Device",
        "Mobile Device",
        "Third-party Hosted",
      ].includes(item)
    );

  if (physicalStorage && digitalStorage) {
    categoryScore["Storage & Security"] += 25;

    addFinding(findings, {
      id: "STORAGE-HYBRID",
      category: "Storage & Security",
      level: "High",
      title: "Personal data exists in both physical and digital environments",
      explanation:
        "The assessment indicates that personal data may exist in both physical records and digital systems.",
      recommendation:
        "Maintain an inventory of both physical and digital repositories and define security, access, retention and disposal controls for each.",
    });
  }

  if (physicalStorage) {
    categoryScore["Storage & Security"] += 10;

    addFinding(findings, {
      id: "STORAGE-PHYSICAL",
      category: "Storage & Security",
      level: "Medium",
      title: "Physical personal-data records identified",
      explanation:
        "Paper or other physical records containing personal data are part of the process.",
      recommendation:
        "Control physical access, maintain secure storage and define secure disposal procedures for physical records.",
    });
  }

  if (
    answers.encryptionStatuses.some(
      (item) =>
        item === "Clear text / Not encrypted" ||
        item === "Unknown"
    ) ||
    answers.encryptionStatuses.length === 0
  ) {
    categoryScore["Storage & Security"] += 30;

    addFinding(findings, {
      id: "SECURITY-ENCRYPTION",
      category: "Storage & Security",
      level: "High",
      title: "Encryption status requires attention",
      explanation:
        "The organisation has identified unencrypted or unknown protection status for stored personal data.",
      recommendation:
        "Determine encryption requirements for each repository and verify encryption in transit and at rest where appropriate.",
    });
  }

  /*
   * ---------------------------------------------------------
   * ACCESS & SHARING
   * ---------------------------------------------------------
   */

  if (answers.accessRoles.length >= 4) {
    categoryScore["Access & Sharing"] += 25;

    addFinding(findings, {
      id: "ACCESS-MANY-ROLES",
      category: "Access & Sharing",
      level: "High",
      title: "Multiple roles may access personal data",
      explanation:
        "A relatively large number of roles have been identified as having access to the information.",
      recommendation:
        "Review access using least privilege and role-based access principles. Remove unnecessary access.",
    });
  } else if (answers.accessRoles.length >= 2) {
    categoryScore["Access & Sharing"] += 10;
  }

  if (
    answers.sharingStatuses.some(
      (item) =>
        item === "Shared with service provider" ||
        item === "Shared with multiple third parties"
    )
  ) {
    categoryScore["Third-Party"] += 30;
    categoryScore["Access & Sharing"] += 15;

    addFinding(findings, {
      id: "THIRD-PARTY-SHARING",
      category: "Third-Party",
      level: "High",
      title: "Personal data is shared with third parties",
      explanation:
        "The process involves sharing personal data with external service providers or other third parties.",
      recommendation:
        "Maintain a third-party data-processing inventory and review contractual, security, privacy and data-handling requirements.",
    });
  }

  if (
    answers.sharingStatuses.includes("Unknown") ||
    answers.sharingStatuses.length === 0
  ) {
    categoryScore["Third-Party"] += 15;

    addFinding(findings, {
      id: "THIRD-PARTY-UNKNOWN",
      category: "Third-Party",
      level: "Medium",
      title: "Data-sharing arrangements are not fully known",
      explanation:
        "The organisation has not established whether personal data is shared with external parties.",
      recommendation:
        "Identify all internal and external recipients of personal data and document the purpose of each disclosure.",
    });
  }

  /*
   * ---------------------------------------------------------
   * RETENTION & DELETION
   * ---------------------------------------------------------
   */

  if (
    answers.retentionPeriods.some(
      (item) =>
        item === "Indefinitely" ||
        item === "No defined retention period" ||
        item === "Unknown"
    ) ||
    answers.retentionPeriods.length === 0
  ) {
    categoryScore["Retention & Deletion"] += 30;

    addFinding(findings, {
      id: "RETENTION-UNDEFINED",
      category: "Retention & Deletion",
      level: "High",
      title: "Retention period is undefined or excessive",
      explanation:
        "The assessment indicates that personal data may be retained indefinitely, without a defined retention period, or the retention period is unknown.",
      recommendation:
        "Define retention periods based on business, contractual, legal and regulatory requirements and document the justification.",
    });
  }

  if (
    answers.deletionMethods.some(
      (item) =>
        item === "No defined deletion process" ||
        item === "Unknown"
    ) ||
    answers.deletionMethods.length === 0
  ) {
    categoryScore["Retention & Deletion"] += 25;

    addFinding(findings, {
      id: "DELETION-UNDEFINED",
      category: "Retention & Deletion",
      level: "High",
      title: "Data deletion process is undefined",
      explanation:
        "The organisation has not established a reliable process for deleting personal data.",
      recommendation:
        "Define deletion procedures for digital and physical records and periodically verify that obsolete data is removed.",
    });
  }

  /*
   * ---------------------------------------------------------
   * CROSS BORDER
   * ---------------------------------------------------------
   */

  if (answers.crossBorderTransfers.includes("Yes")) {
    categoryScore["Cross-Border"] += 30;

    addFinding(findings, {
      id: "CROSS-BORDER-TRANSFER",
      category: "Cross-Border",
      level: "High",
      title: "Potential cross-border personal-data transfer",
      explanation:
        "The assessment indicates that personal data may be transferred outside India.",
      recommendation:
        "Identify the countries, recipients, systems and purposes involved and assess applicable Indian legal and contractual requirements.",
    });
  }

  if (answers.crossBorderTransfers.includes("Unknown")) {
    categoryScore["Cross-Border"] += 15;

    addFinding(findings, {
      id: "CROSS-BORDER-UNKNOWN",
      category: "Cross-Border",
      level: "Medium",
      title: "Cross-border transfer status is unknown",
      explanation:
        "The organisation has not established whether personal data leaves India.",
      recommendation:
        "Review cloud services, SaaS applications, email platforms, messaging services and third-party systems to determine where data is processed.",
    });
  }

  /*
   * ---------------------------------------------------------
   * GOVERNANCE / UNKNOWN ANSWERS
   * ---------------------------------------------------------
   */

  const unknownCount =
    [
      ...answers.storageLocations,
      ...answers.storageEnvironments,
      ...answers.encryptionStatuses,
      ...answers.sharingStatuses,
      ...answers.retentionPeriods,
      ...answers.deletionMethods,
      ...answers.privacyNotices,
      ...answers.consentStatuses,
      ...answers.parentalConsentStatuses,
      ...answers.crossBorderTransfers,
    ].filter((item) => item === "Unknown").length;

  if (unknownCount >= 4) {
    categoryScore.Governance += 30;

    addFinding(findings, {
      id: "GOVERNANCE-UNKNOWN",
      category: "Governance",
      level: "High",
      title: "Significant privacy-governance visibility gaps",
      explanation:
        "Several important aspects of the personal-data lifecycle are currently unknown.",
      recommendation:
        "Create a data inventory and validate each processing activity with the relevant business, IT, HR and management stakeholders.",
    });
  } else if (unknownCount >= 1) {
    categoryScore.Governance += 10;

    addFinding(findings, {
      id: "GOVERNANCE-PARTIAL",
      category: "Governance",
      level: "Medium",
      title: "Some privacy information is unknown",
      explanation:
        "One or more important data-handling characteristics have not yet been established.",
      recommendation:
        "Validate unknown items with the relevant process owner and update the assessment.",
    });
  }

  /*
   * ---------------------------------------------------------
   * CALCULATE CATEGORY RESULTS
   * ---------------------------------------------------------
   */

  const categoryScores = Object.entries(categoryScore).map(
    ([category, score]) => ({
      category: category as RiskCategory,
      score: Math.min(score, 100),
      level: getRiskLevel(Math.min(score, 100)),
    })
  );

  const highestScore = Math.max(
    ...categoryScores.map((item) => item.score),
    0
  );

  /*
   * Child data + multiple channels + security weakness
   * should elevate the overall result.
   */

  let overallScore = highestScore;

  if (
    childData &&
    totalEntryPoints >= 2 &&
    answers.encryptionStatuses.some(
      (item) =>
        item === "Clear text / Not encrypted" ||
        item === "Unknown"
    )
  ) {
    overallScore += 15;
  }

  overallScore = Math.min(overallScore, 100);

  /*
   * Remove duplicate findings.
   */

  const uniqueFindings = findings.filter(
    (finding, index, array) =>
      array.findIndex(
        (item) => item.id === finding.id
      ) === index
  );

  return {
    overallLevel: getRiskLevel(overallScore),
    score: overallScore,
    categoryScores,
    findings: uniqueFindings,
  };
}
