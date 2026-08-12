import type {
  RiskFinding,
  RiskLevel,
  RiskResult,
} from "./privacyRisk";

export type TreatmentStatus =
  | "Open"
  | "In Progress"
  | "Completed"
  | "Accepted";

export type TreatmentPriority =
  | "Immediate"
  | "High"
  | "Medium"
  | "Low";

export type TreatmentEffort =
  | "Low"
  | "Medium"
  | "High";

export type RiskTreatmentAction = {
  id: string;
  findingId: string;
  category: string;
  riskTitle: string;
  riskLevel: RiskLevel;
  priority: TreatmentPriority;
  action: string;
  rationale: string;
  suggestedOwner: string;
  suggestedTimeframe: string;
  effort: TreatmentEffort;
  evidence: string;
  status: TreatmentStatus;
};

/*
 * ---------------------------------------------------------
 * PRIORITY
 * ---------------------------------------------------------
 */

function treatmentPriority(
  level: RiskLevel
): TreatmentPriority {
  switch (level) {
    case "Critical":
      return "Immediate";

    case "High":
      return "High";

    case "Medium":
      return "Medium";

    case "Low":
      return "Low";
  }
}

/*
 * ---------------------------------------------------------
 * TIMEFRAME
 * ---------------------------------------------------------
 */

function treatmentTimeframe(
  level: RiskLevel
): string {
  switch (level) {
    case "Critical":
      return "0–30 days";

    case "High":
      return "30–60 days";

    case "Medium":
      return "60–90 days";

    case "Low":
      return "90–180 days";
  }
}

/*
 * ---------------------------------------------------------
 * EFFORT
 * ---------------------------------------------------------
 */

function treatmentEffort(
  category: string,
  title: string
): TreatmentEffort {
  const text =
    `${category} ${title}`.toLowerCase();

  if (
    text.includes("encryption") ||
    text.includes("access") ||
    text.includes("security")
  ) {
    return "High";
  }

  if (
    text.includes("third") ||
    text.includes("retention") ||
    text.includes("deletion") ||
    text.includes("children") ||
    text.includes("cross-border")
  ) {
    return "Medium";
  }

  return "Low";
}

/*
 * ---------------------------------------------------------
 * SUGGESTED OWNER
 * ---------------------------------------------------------
 */

function suggestedOwner(
  category: string
): string {
  switch (category) {
    case "Security":
    case "Access Control":
      return "IT / Information Security";

    case "Children's Data":
      return "Privacy / Legal + School Management";

    case "Third Parties":
      return "Procurement / Vendor Management";

    case "Retention":
    case "Deletion":
      return "Privacy / Records Management";

    case "Transparency":
    case "Lawful Basis":
      return "Privacy / Legal";

    case "Cross-Border Processing":
      return "Privacy / Legal + IT";

    case "Data Collection":
    case "Data Minimisation":
      return "Business Process Owner";

    case "Data Storage":
    case "Physical Security":
      return "IT / Administration";

    case "Access Governance":
      return "HR + IT / Information Security";

    case "Data Inventory":
    case "Data Governance":
      return "Privacy / Data Governance";

    case "Data Lifecycle":
      return "Privacy / IT / Records Management";

    case "Physical Records":
      return "Administration / Records Management";

    default:
      return "Privacy / Business Owner";
  }
}

/*
 * ---------------------------------------------------------
 * ACTION GENERATOR
 * ---------------------------------------------------------
 */

function treatmentAction(
  finding: RiskFinding
): {
  action: string;
  rationale: string;
  evidence: string;
} {
  const title =
    finding.title.toLowerCase();

  const category =
    finding.category.toLowerCase();

  /*
   * -------------------------------------------------------
   * ENCRYPTION
   * -------------------------------------------------------
   */

  if (
    title.includes("not encrypted") ||
    title.includes("encryption")
  ) {
    return {
      action:
        "Perform an encryption gap assessment for all systems processing personal data. Implement appropriate encryption for data at rest and in transit and document the encryption standard used.",

      rationale:
        "Encryption reduces the likelihood that personal data can be exposed or misused if systems, devices or communications are compromised.",

      evidence:
        "Encryption configuration, security standard, system inventory and remediation evidence.",
    };
  }

  /*
   * -------------------------------------------------------
   * ACCESS
   * -------------------------------------------------------
   */

  if (
    title.includes("access roles") ||
    category.includes("access")
  ) {
    return {
      action:
        "Define role-based access for personal data, remove unnecessary privileges and establish periodic access reviews.",

      rationale:
        "Clearly defined access rights reduce the risk of unauthorised internal or third-party access to personal data.",

      evidence:
        "Access-control matrix, user-role mapping, access review records and removal evidence.",
    };
  }

  /*
   * -------------------------------------------------------
   * CHILDREN
   * -------------------------------------------------------
   */

  if (
    category.includes("children") ||
    title.includes("parent") ||
    title.includes("guardian")
  ) {
    return {
      action:
        "Document the process for identifying child-related processing and establish appropriate parent/guardian verification and approval controls where applicable.",

      rationale:
        "Children's personal data may require additional safeguards and stronger governance controls.",

      evidence:
        "Child-data procedure, parent/guardian workflow, consent/verification records and privacy notices.",
    };
  }

  /*
   * -------------------------------------------------------
   * THIRD PARTIES
   * -------------------------------------------------------
   */

  if (
    category.includes("third") ||
    title.includes("third party")
  ) {
    return {
      action:
        "Create or update the personal-data processor and third-party inventory. Review contracts, data-processing terms, security obligations and permitted data sharing.",

      rationale:
        "Third-party processing creates additional privacy and security dependencies outside the organisation's direct environment.",

      evidence:
        "Third-party inventory, contracts, DPA/privacy clauses, security assessments and processor records.",
    };
  }

  /*
   * -------------------------------------------------------
   * RETENTION
   * -------------------------------------------------------
   */

  if (
    category.includes("retention") ||
    title.includes("retention")
  ) {
    return {
      action:
        "Define a documented retention period for each personal-data category and processing purpose. Establish review and disposal triggers.",

      rationale:
        "Keeping personal data longer than necessary increases exposure and potential breach impact.",

      evidence:
        "Retention schedule, policy, system configuration and periodic retention review records.",
    };
  }

  /*
   * -------------------------------------------------------
   * DELETION
   * -------------------------------------------------------
   */

  if (
    category.includes("deletion") ||
    title.includes("deletion")
  ) {
    return {
      action:
        "Implement a documented secure deletion process covering digital records, physical records, backups and applicable third-party systems.",

      rationale:
        "Personal data should not remain accessible after the legitimate retention period ends.",

      evidence:
        "Deletion procedure, deletion logs, disposal records and system configuration.",
    };
  }

  /*
   * -------------------------------------------------------
   * PRIVACY NOTICE
   * -------------------------------------------------------
   */

  if (
    category.includes("transparency") ||
    title.includes("privacy notice")
  ) {
    return {
      action:
        "Review every personal-data collection channel and ensure an appropriate privacy notice is provided at or before collection.",

      rationale:
        "Data subjects should receive appropriate information about how their personal data is collected and used.",

      evidence:
        "Approved privacy notices, screenshots/forms, website notices and collection-channel inventory.",
    };
  }

  /*
   * -------------------------------------------------------
   * LAWFUL BASIS
   * -------------------------------------------------------
   */

  if (
    category.includes("lawful") ||
    title.includes("lawful basis") ||
    title.includes("consent")
  ) {
    return {
      action:
        "Document the purpose and applicable lawful basis for each processing activity. Where consent is relied upon, verify that the consent process is appropriate and demonstrable.",

      rationale:
        "Every personal-data processing activity should have an identified and documented legal basis appropriate to the applicable requirements.",

      evidence:
        "Processing register, lawful-basis assessment, consent records and privacy documentation.",
    };
  }

  /*
   * -------------------------------------------------------
   * CROSS-BORDER
   * -------------------------------------------------------
   */

  if (
    category.includes("cross-border") ||
    title.includes("international")
  ) {
    return {
      action:
        "Identify destination countries, cloud providers, processors and subprocessors involved in international data transfers and document the applicable transfer safeguards.",

      rationale:
        "International processing can introduce additional legal, contractual and governance requirements.",

      evidence:
        "Data-flow map, vendor/subprocessor list, hosting locations and transfer assessment.",
    };
  }

  /*
   * -------------------------------------------------------
   * STORAGE
   * -------------------------------------------------------
   */

  if (
    category.includes("storage") ||
    title.includes("storage")
  ) {
    return {
      action:
        "Create a data-flow and storage inventory identifying every system, application, device, cloud service and physical location containing personal data.",

      rationale:
        "Complete visibility of where personal data exists is necessary to manage security, retention, access and deletion risks.",

      evidence:
        "Data inventory, architecture/data-flow diagram and storage register.",
    };
  }

  /*
   * -------------------------------------------------------
   * DATA MINIMISATION
   * -------------------------------------------------------
   */

  if (
    category.includes("minimisation") ||
    title.includes("number of personal-data")
  ) {
    return {
      action:
        "Review every personal-data field against the stated processing purpose and remove fields that are unnecessary or disproportionate.",

      rationale:
        "Reducing unnecessary personal data reduces privacy exposure and potential breach impact.",

      evidence:
        "Data-field inventory, purpose mapping and approved data-minimisation review.",
    };
  }

  /*
   * -------------------------------------------------------
   * DATA COLLECTION
   * -------------------------------------------------------
   */

  if (
    category.includes("data collection")
  ) {
    return {
      action:
        "Create a consolidated inventory of all personal-data collection channels and document the information collected, purpose, owner and downstream systems.",

      rationale:
        "Multiple or undocumented collection channels can create gaps in privacy notices, consent, security and data-flow visibility.",

      evidence:
        "Collection-channel inventory, process maps and approved procedures.",
    };
  }

  /*
   * -------------------------------------------------------
   * PHYSICAL RECORDS
   * -------------------------------------------------------
   */

  if (
    category.includes("physical") ||
    title.includes("paper")
  ) {
    return {
      action:
        "Define physical-record controls covering secure storage, access, transportation, scanning, tracking and secure disposal.",

      rationale:
        "Paper and physical records can bypass digital security controls and create additional privacy exposure.",

      evidence:
        "Physical-record procedure, storage controls, access records and disposal evidence.",
    };
  }

  /*
   * -------------------------------------------------------
   * UNKNOWN GOVERNANCE
   * -------------------------------------------------------
   */

  if (
    title.includes("unknown") ||
    category.includes("governance")
  ) {
    return {
      action:
        "Investigate and document the currently unknown aspect of the processing. Assign an accountable owner and update the privacy/data inventory.",

      rationale:
        "Unknown processing characteristics represent a visibility and governance gap that prevents effective risk management.",

      evidence:
        "Updated assessment, inventory record, process documentation and owner confirmation.",
    };
  }

  /*
   * -------------------------------------------------------
   * GENERIC FALLBACK
   * -------------------------------------------------------
   */

  return {
    action:
      finding.recommendation,

    rationale:
      finding.explanation,

    evidence:
      "Documented remediation record and evidence demonstrating that the recommended control has been implemented.",
  };
}

/*
 * ---------------------------------------------------------
 * GENERATE TREATMENT PLAN
 * ---------------------------------------------------------
 */

export function generateRiskTreatmentPlan(
  result: RiskResult
): RiskTreatmentAction[] {
  const treatments: RiskTreatmentAction[] =
    result.findings.map(
      (finding): RiskTreatmentAction => {
        const treatment =
          treatmentAction(finding);

        return {
          id:
            `TREAT-${finding.id}`,

          findingId:
            finding.id,

          category:
            finding.category,

          riskTitle:
            finding.title,

          riskLevel:
            finding.level,

          priority:
            treatmentPriority(
              finding.level
            ),

          action:
            treatment.action,

          rationale:
            treatment.rationale,

          suggestedOwner:
            suggestedOwner(
              finding.category
            ),

          suggestedTimeframe:
            treatmentTimeframe(
              finding.level
            ),

          effort:
            treatmentEffort(
              finding.category,
              finding.title
            ),

          evidence:
            treatment.evidence,

          /*
           * Explicitly typed through the
           * RiskTreatmentAction return type.
           */
          status:
            "Open",
        };
      }
    );

  /*
   * -------------------------------------------------------
   * SORT BY PRIORITY
   * -------------------------------------------------------
   */

  const priority:
    Record<TreatmentPriority, number> = {
      Immediate: 4,
      High: 3,
      Medium: 2,
      Low: 1,
    };

  return treatments.sort(
    (a, b) =>
      priority[b.priority] -
      priority[a.priority]
  );
}
