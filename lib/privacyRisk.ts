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
  findings: RiskFinding[];
  categoryScores: RiskCategoryScore[];

  /*
   * Kept for compatibility with earlier versions.
   */
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

/*
 * IMPORTANT
 *
 * These property names intentionally match the current
 * app/assessment/page.tsx file.
 *
 * Some fields are optional so this file remains compatible
 * with earlier versions of the assessment engine.
 */
export type PrivacyRiskInput = {
  selectedEntryPoints: string[];
  customEntryPoints: EntryPoint[];

  selectedFields: string[];
  customFields: Field[];

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
 * HELPERS
 * ---------------------------------------------------------
 */

function values(
  value: string[] | undefined
): string[] {
  return Array.isArray(value) ? value : [];
}

function containsValue(
  list: string[] | undefined,
  search: string
): boolean {
  const source = values(list);

  return source.some((item) =>
    item.toLowerCase().includes(search.toLowerCase())
  );
}

function uniqueStrings(
  items: string[]
): string[] {
  return Array.from(new Set(items));
}

function riskLevelFromScore(
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
 * ---------------------------------------------------------
 * ADD FINDING
 * ---------------------------------------------------------
 */

function addFinding(
  findings: RiskFinding[],
  category: string,
  title: string,
  level: RiskLevel,
  explanation: string,
  recommendation: string
) {
  findings.push({
    id: `${category}-${title}`
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-"),
    category,
    title,
    level,
    explanation,
    recommendation,
  });
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
   * NORMALISE INPUT
   * -------------------------------------------------------
   */

  const collectorRoles =
    values(input.collectorRoles);

  const dataSubjectTypes =
    values(input.dataSubjectTypes);

  const collectionFormats =
    values(input.collectionFormats);

  const storageLocations =
    values(input.storageLocations);

  const storageEnvironments =
    values(input.storageEnvironments);

  const encryptionStatuses =
    values(input.encryptionStatuses);

  const accessRoles =
    values(input.accessRoles);

  const sharingStatuses =
    values(input.sharingStatuses);

  const retentionPeriods =
    values(input.retentionPeriods);

  const deletionMethods =
    values(input.deletionMethods);

  const privacyNotices =
    values(input.privacyNotices);

  const consentStatuses =
    values(input.consentStatuses);

  const parentalConsentStatuses =
    values(input.parentalConsentStatuses);

  const crossBorderTransfers =
    values(input.crossBorderTransfers);


  /*
   * -------------------------------------------------------
   * 1. MULTIPLE DATA ENTRY POINTS
   * -------------------------------------------------------
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

    addFinding(
      findings,
      "Data Collection",
      "Multiple personal-data entry points",
      "Medium",
      "Personal data is entering the organisation through several channels. Multiple entry points can make data-flow visibility and control more difficult.",
      "Maintain a complete inventory of all collection channels and document how information moves from each channel into downstream systems."
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
   * -------------------------------------------------------
   * 2. PERSONAL DATA VOLUME
   * -------------------------------------------------------
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

    addFinding(
      findings,
      "Data Minimisation",
      "Large number of personal-data fields",
      "Medium",
      "The process appears to collect a significant number of personal-data fields.",
      "Review each field against the purpose of processing and remove information that is not necessary."
    );

  } else if (totalFields >= 5) {

    score += 5;

    factors.push(
      "The assessed process collects multiple categories of personal data."
    );
  }


  /*
   * -------------------------------------------------------
   * 3. DATA SUBJECTS
   * -------------------------------------------------------
   */

  const involvesStudent =
    containsValue(
      dataSubjectTypes,
      "student"
    );

  const involvesChild =
    containsValue(
      dataSubjectTypes,
      "child"
    );

  const involvesMinor =
    containsValue(
      dataSubjectTypes,
      "minor"
    );

  if (
    involvesStudent ||
    involvesChild ||
    involvesMinor
  ) {

    score += 15;

    factors.push(
      "The processing involves student, child or minor-related personal data."
    );

    recommendations.push(
      "Review child-data processing requirements and parent/guardian controls."
    );

    addFinding(
      findings,
      "Children's Data",
      "Student or child personal data is processed",
      "High",
      "The assessment indicates that student, child or minor-related personal data is processed.",
      "Apply appropriate safeguards for children's data and verify parent/guardian requirements where applicable."
    );
  }


  /*
   * -------------------------------------------------------
   * 4. MULTIPLE COLLECTOR ROLES
   * -------------------------------------------------------
   */

  if (collectorRoles.length >= 3) {

    score += 5;

    factors.push(
      "Multiple employee or organisational roles may collect the personal data."
    );

    recommendations.push(
      "Define role-based access and responsibilities for each data-collection role."
    );

    addFinding(
      findings,
      "Access Governance",
      "Multiple personnel collect personal data",
      "Medium",
      "Several organisational roles may be involved in collecting personal data.",
      "Clearly define responsibilities and ensure each role has access only to the information required for its duties."
    );
  }


  /*
   * -------------------------------------------------------
   * 5. PHYSICAL / PAPER COLLECTION
   * -------------------------------------------------------
   */

  if (
    containsValue(
      collectionFormats,
      "paper"
    ) ||
    containsValue(
      collectionFormats,
      "physical"
    ) ||
    containsValue(
      collectionFormats,
      "in person"
    )
  ) {

    score += 5;

    factors.push(
      "Personal data may be collected through physical or paper-based processes."
    );

    recommendations.push(
      "Review physical security, access, transportation, scanning and secure disposal of paper records."
    );

    addFinding(
      findings,
      "Physical Records",
      "Physical or paper-based collection",
      "Medium",
      "Personal data may enter the organisation through paper forms or physical collection.",
      "Define controls for physical handling, transportation, storage, scanning, access and secure disposal."
    );
  }


  /*
   * -------------------------------------------------------
   * 6. DIGITAL COLLECTION CHANNELS
   * -------------------------------------------------------
   */

  const digitalCollectionCount =
    collectionFormats.filter(
      (item) =>
        !/paper|physical|verbal|in person/i.test(
          item
        )
    ).length;

  if (digitalCollectionCount >= 3) {

    score += 5;

    factors.push(
      "Personal data may be collected through multiple digital channels."
    );

    recommendations.push(
      "Ensure digital collection channels are consistently governed and included in the data-flow inventory."
    );
  }


  /*
   * -------------------------------------------------------
   * 7. MULTIPLE STORAGE ENVIRONMENTS
   * -------------------------------------------------------
   */

  if (
    storageEnvironments.length >= 2
  ) {

    score += 8;

    factors.push(
      "Personal data may be stored across multiple environments."
    );

    recommendations.push(
      "Map movement of personal data between physical, employee-device, cloud and on-premises environments."
    );

    addFinding(
      findings,
      "Data Storage",
      "Multiple storage environments",
      "High",
      "The selected options indicate that personal data may exist across multiple storage environments.",
      "Create a data-flow map covering physical records, cloud systems, employee devices and on-premises systems."
    );
  }


  /*
   * -------------------------------------------------------
   * 8. PHYSICAL STORAGE
   * -------------------------------------------------------
   */

  if (
    containsValue(
      storageEnvironments,
      "physical"
    ) ||
    containsValue(
      storageLocations,
      "physical"
    ) ||
    containsValue(
      storageLocations,
      "paper"
    )
  ) {

    score += 5;

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
      "The process may involve physical records containing personal information.",
      "Use controlled physical storage, access restrictions, record tracking and secure disposal."
    );
  }


  /*
   * -------------------------------------------------------
   * 9. HYBRID STORAGE
   * -------------------------------------------------------
   *
   * Hybrid may be represented by:
   * - explicit Hybrid selection
   * - Physical + Cloud
   * - Physical + On-Premises
   * - Physical + Employee Device
   */

  const explicitHybrid =
    containsValue(
      storageEnvironments,
      "hybrid"
    );

  const physicalStorage =
    containsValue(
      storageEnvironments,
      "physical"
    );

  const digitalStorage =
    containsValue(
      storageEnvironments,
      "cloud"
    ) ||
    containsValue(
      storageEnvironments,
      "on-premises"
    ) ||
    containsValue(
      storageEnvironments,
      "employee device"
    ) ||
    containsValue(
      storageEnvironments,
      "mobile device"
    ) ||
    containsValue(
      storageEnvironments,
      "third-party"
    );

  if (
    explicitHybrid ||
    (physicalStorage && digitalStorage)
  ) {

    score += 8;

    factors.push(
      "The process may involve both physical and digital storage."
    );

    recommendations.push(
      "Map the transition between paper records and digital systems, including scanning and uploading."
    );

    addFinding(
      findings,
      "Data Lifecycle",
      "Hybrid physical and digital storage",
      "High",
      "The process may maintain both physical and digital copies of personal data.",
      "Document the complete lifecycle from physical collection through scanning, upload, digital processing, retention and final disposal."
    );
  }


  /*
   * -------------------------------------------------------
   * 10. UNKNOWN STORAGE
   * -------------------------------------------------------
   */

  if (
    containsValue(
      storageLocations,
      "unknown"
    ) ||
    containsValue(
      storageEnvironments,
      "unknown"
    )
  ) {

    score += 10;

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
      "The organisation does not have complete visibility of where personal data is stored.",
      "Identify all systems, applications, devices, cloud services and physical locations containing personal data."
    );
  }


  /*
   * -------------------------------------------------------
   * 11. ENCRYPTION
   * -------------------------------------------------------
   */

  if (
    containsValue(
      encryptionStatuses,
      "clear text"
    ) ||
    containsValue(
      encryptionStatuses,
      "not encrypted"
    )
  ) {

    score += 25;

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
      "The assessment indicates that personal data may be stored or transmitted without adequate encryption.",
      "Review encryption requirements for data at rest and in transit and implement appropriate technical controls."
    );
  }


  if (
    containsValue(
      encryptionStatuses,
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

    addFinding(
      findings,
      "Security",
      "Encryption status is unknown",
      "High",
      "The organisation has not established whether stored or transmitted personal data is adequately encrypted.",
      "Confirm encryption controls for each system and storage location processing personal data."
    );
  }


  /*
   * -------------------------------------------------------
   * 12. ACCESS CONTROL
   * -------------------------------------------------------
   */

  if (
    accessRoles.length === 0 ||
    containsValue(
      accessRoles,
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

    addFinding(
      findings,
      "Access Control",
      "Access roles are not clearly defined",
      "High",
      "The assessment does not establish who is authorised to access the personal data.",
      "Define role-based access and conduct periodic access reviews."
    );
  }


  /*
   * -------------------------------------------------------
   * 13. THIRD-PARTY SHARING
   * -------------------------------------------------------
   */

  if (
    containsValue(
      sharingStatuses,
      "service provider"
    ) ||
    containsValue(
      sharingStatuses,
      "third parties"
    ) ||
    containsValue(
      sharingStatuses,
      "external"
    )
  ) {

    score += 15;

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
      "The process may involve external service providers or other third parties receiving personal data.",
      "Maintain a third-party inventory and assess contractual, privacy and security obligations."
    );
  }


  if (
    containsValue(
      sharingStatuses,
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

    addFinding(
      findings,
      "Third Parties",
      "Data-sharing arrangements are unknown",
      "High",
      "The organisation does not have complete visibility into who receives the personal data.",
      "Identify all recipients and document the purpose and basis for each sharing arrangement."
    );
  }


  /*
   * -------------------------------------------------------
   * 14. RETENTION
   * -------------------------------------------------------
   */

  if (
    containsValue(
      retentionPeriods,
      "indefinitely"
    ) ||
    containsValue(
      retentionPeriods,
      "no defined"
    )
  ) {

    score += 15;

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
      "The assessment indicates that personal data may be retained indefinitely or without a defined retention period.",
      "Define retention periods for each personal-data category and establish review and disposal triggers."
    );
  }


  if (
    containsValue(
      retentionPeriods,
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

    addFinding(
      findings,
      "Retention",
      "Retention period is unknown",
      "Medium",
      "The organisation has not established how long the assessed personal data is retained.",
      "Document retention requirements for each data category and processing purpose."
    );
  }


  /*
   * -------------------------------------------------------
   * 15. DELETION
   * -------------------------------------------------------
   */

  if (
    containsValue(
      deletionMethods,
      "no defined"
    ) ||
    containsValue(
      deletionMethods,
      "unknown"
    )
  ) {

    score += 10;

    factors.push(
      "There may be no defined personal-data deletion process."
    );

    recommendations.push(
      "Define and document secure deletion and disposal procedures."
    );

    addFinding(
      findings,
      "Deletion",
      "Data deletion process is not defined",
      "High",
      "The assessment does not establish a reliable process for deleting or disposing of personal data.",
      "Define secure deletion procedures for both digital and physical records."
    );
  }


  /*
   * -------------------------------------------------------
   * 16. PRIVACY NOTICE
   * -------------------------------------------------------
   */

  if (
    containsValue(
      privacyNotices,
      "no"
    ) ||
    containsValue(
      privacyNotices,
      "partially"
    )
  ) {

    score += 12;

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
      "The assessment indicates that privacy information may not be consistently provided to data subjects.",
      "Review privacy notices across every collection channel and ensure they are presented appropriately."
    );
  }


  if (
    containsValue(
      privacyNotices,
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

    addFinding(
      findings,
      "Transparency",
      "Privacy notice status is unknown",
      "Medium",
      "It is unclear whether appropriate privacy notices are provided.",
      "Confirm notice coverage for every collection channel."
    );
  }


  /*
   * -------------------------------------------------------
   * 17. CONSENT / LAWFUL BASIS
   * -------------------------------------------------------
   */

  if (
    containsValue(
      consentStatuses,
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

    addFinding(
      findings,
      "Lawful Basis",
      "Consent or lawful-basis controls may be inadequate",
      "High",
      "The assessment indicates that consent may not be obtained where expected.",
      "Validate the applicable lawful basis for each processing activity and document the rationale."
    );
  }


  if (
    containsValue(
      consentStatuses,
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

    addFinding(
      findings,
      "Lawful Basis",
      "Lawful basis is unknown",
      "Medium",
      "The assessment does not establish the lawful basis for processing.",
      "Document the purpose and applicable lawful basis for each processing activity."
    );
  }


  /*
   * -------------------------------------------------------
   * 18. PARENT / GUARDIAN CONTROLS
   * -------------------------------------------------------
   */

  if (
    involvesStudent ||
    involvesChild ||
    involvesMinor
  ) {

    if (
      containsValue(
        parentalConsentStatuses,
        "no"
      ) ||
      containsValue(
        parentalConsentStatuses,
        "partially"
      )
    ) {

      score += 20;

      factors.push(
        "Child-related processing may not have adequate parent/guardian controls."
      );

      recommendations.push(
        "Review parental/guardian requirements for child-related personal data."
      );

      addFinding(
        findings,
        "Children's Data",
        "Parent or guardian controls may be incomplete",
        "Critical",
        "Student or child-related personal data is being processed while parent/guardian controls may be absent or incomplete.",
        "Review applicable requirements for parental/guardian involvement and document the process."
      );
    }


    if (
      containsValue(
        parentalConsentStatuses,
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

      addFinding(
        findings,
        "Children's Data",
        "Parent or guardian controls are unknown",
        "High",
        "The organisation has not established how parent/guardian requirements are handled.",
        "Document the process used to determine and verify parent/guardian involvement."
      );
    }
  }


  /*
   * -------------------------------------------------------
   * 19. CROSS-BORDER TRANSFER
   * -------------------------------------------------------
   */

  if (
    containsValue(
      crossBorderTransfers,
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

    addFinding(
      findings,
      "Cross-Border Processing",
      "Potential international data transfer",
      "High",
      "The assessment indicates that personal data may be transferred outside India.",
      "Identify the destination countries, cloud providers and processors involved and assess applicable requirements."
    );
  }


  if (
    containsValue(
      crossBorderTransfers,
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

    addFinding(
      findings,
      "Cross-Border Processing",
      "Cross-border transfer status is unknown",
      "Medium",
      "It is not clear whether personal data leaves India through cloud services, SaaS applications or third-party processors.",
      "Review hosting locations, subprocessors and data-transfer arrangements."
    );
  }


  /*
   * -------------------------------------------------------
   * 20. UNKNOWN COLLECTION PRACTICES
   * -------------------------------------------------------
   */

  if (
    collectionFormats.length === 0
  ) {

    score += 5;

    factors.push(
      "The method used to collect personal data has not been documented."
    );

    recommendations.push(
      "Document the collection method for each personal-data entry point."
    );

    addFinding(
      findings,
      "Data Collection",
      "Collection method is not documented",
      "Medium",
      "The assessment does not identify how personal data is collected.",
      "Document the collection method for every personal-data entry point."
    );
  }


  /*
   * -------------------------------------------------------
   * 21. UNKNOWN DATA SUBJECT
   * -------------------------------------------------------
   */

  if (
    dataSubjectTypes.length === 0
  ) {

    score += 5;

    factors.push(
      "The data subjects associated with the processing have not been identified."
    );

    recommendations.push(
      "Identify all categories of data subjects whose personal data is processed."
    );

    addFinding(
      findings,
      "Data Governance",
      "Data subjects are not identified",
      "Medium",
      "The assessment does not identify who the personal data relates to.",
      "Document all relevant data-subject categories such as students, parents, employees and visitors."
    );
  }


  /*
   * -------------------------------------------------------
   * CAP SCORE
   * -------------------------------------------------------
   */

  score = Math.min(
    Math.max(score, 0),
    100
  );


  /*
   * -------------------------------------------------------
   * OVERALL LEVEL
   * -------------------------------------------------------
   */

  const overallLevel =
    riskLevelFromScore(score);


  /*
   * -------------------------------------------------------
   * CATEGORY SCORES
   *
   * These are derived from the findings rather than
   * being arbitrary duplicates of the overall score.
   * -------------------------------------------------------
   */

  const categoryNames = uniqueStrings(
    findings.map(
      (finding) => finding.category
    )
  );


  const categoryScores: RiskCategoryScore[] =
    categoryNames.map(
      (category) => {

        const categoryFindings =
          findings.filter(
            (finding) =>
              finding.category === category
          );


        let categoryScore = 0;


        categoryFindings.forEach(
          (finding) => {

            switch (finding.level) {

              case "Critical":
                categoryScore += 85;
                break;

              case "High":
                categoryScore += 65;
                break;

              case "Medium":
                categoryScore += 40;
                break;

              case "Low":
                categoryScore += 20;
                break;
            }
          }
        );


        categoryScore =
          Math.min(
            categoryScore,
            100
          );


        return {
          category,
          score: categoryScore,
          level:
            riskLevelFromScore(
              categoryScore
            ),
        };
      }
    );


  /*
   * -------------------------------------------------------
   * SORT FINDINGS
   *
   * Critical → High → Medium → Low
   * -------------------------------------------------------
   */

  const priority: Record<
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
      priority[b.level] -
      priority[a.level]
  );


  /*
   * -------------------------------------------------------
   * REMOVE DUPLICATES
   * -------------------------------------------------------
   */

  const uniqueFactors =
    uniqueStrings(factors);

  const uniqueRecommendations =
    uniqueStrings(recommendations);


  /*
   * -------------------------------------------------------
   * RETURN
   * -------------------------------------------------------
   */

  return {
    score,

    overallLevel,

    findings,

    categoryScores,

    /*
     * Backward compatibility
     */
    level: overallLevel,

    factors: uniqueFactors,

    recommendations:
      uniqueRecommendations,
  };
}
