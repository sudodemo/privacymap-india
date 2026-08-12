import type {
  RiskFinding,
  RiskLevel,
  RiskResult,
} from "./privacyRisk";

import type {
  RiskTreatmentAction,
  TreatmentEffort,
  TreatmentPriority,
  TreatmentStatus,
} from "./riskTreatment";

/* =========================================================
   RESIDUAL RISK TYPES
   ========================================================= */

export type ResidualRiskLevel =
  | "Critical"
  | "High"
  | "Medium"
  | "Low";

export type ControlEffectiveness =
  | "Not Implemented"
  | "Partially Effective"
  | "Effective"
  | "Highly Effective";

export type ResidualRiskStatus =
  | "Open"
  | "Under Treatment"
  | "Residual Risk"
  | "Accepted"
  | "Closed";

export type RiskReduction =
  | "None"
  | "Low"
  | "Medium"
  | "High"
  | "Very High";

export type ResidualRiskAssessment = {
  id: string;

  findingId: string;

  treatmentId: string;

  category: string;

  riskTitle: string;

  /*
   * Original risk before treatment.
   */
  inherentRisk: RiskLevel;

  /*
   * Treatment information.
   */
  treatmentAction: string;

  treatmentRationale: string;

  suggestedOwner: string;

  suggestedTimeframe: string;

  treatmentPriority: TreatmentPriority;

  treatmentEffort: TreatmentEffort;

  treatmentStatus: TreatmentStatus;

  /*
   * Control assessment.
   */
  controlEffectiveness: ControlEffectiveness;

  /*
   * Residual risk after considering treatment.
   */
  residualRisk: ResidualRiskLevel;

  riskReduction: RiskReduction;

  residualRiskScore: number;

  inherentRiskScore: number;

  /*
   * Management interpretation.
   */
  residualRiskRationale: string;

  recommendedNextAction: string;

  status: ResidualRiskStatus;

  /*
   * Evidence expected to demonstrate
   * treatment/control effectiveness.
   */
  evidence: string;
};

/* =========================================================
   RISK SCORE
   ========================================================= */

function riskScore(level: RiskLevel): number {
  switch (level) {
    case "Critical":
      return 4;

    case "High":
      return 3;

    case "Medium":
      return 2;

    case "Low":
      return 1;

    default:
      return 1;
  }
}

/* =========================================================
   RESIDUAL RISK LEVEL
   ========================================================= */

function residualRiskFromScore(
  score: number
): ResidualRiskLevel {
  if (score >= 4) {
    return "Critical";
  }

  if (score >= 3) {
    return "High";
  }

  if (score >= 2) {
    return "Medium";
  }

  return "Low";
}

/* =========================================================
   CONTROL EFFECTIVENESS SCORE
   ========================================================= */

function effectivenessScore(
  effectiveness: ControlEffectiveness
): number {
  switch (effectiveness) {
    case "Not Implemented":
      return 0;

    case "Partially Effective":
      return 1;

    case "Effective":
      return 2;

    case "Highly Effective":
      return 3;

    default:
      return 0;
  }
}

/* =========================================================
   ESTIMATE CONTROL EFFECTIVENESS
   =========================================================

   Step 8 treatment status is used as the primary
   indicator for estimating the current effectiveness
   of the recommended treatment.

   Important:
   This is an assessment estimate, not evidence that
   a control has actually been implemented.

   Actual control evidence can later override this
   estimate.
   ========================================================= */

function estimateControlEffectiveness(
  treatment: RiskTreatmentAction
): ControlEffectiveness {
  switch (treatment.status) {
    case "Completed":
      return "Effective";

    case "In Progress":
      return "Partially Effective";

    case "Accepted":
      return "Partially Effective";

    case "Open":
    default:
      return "Not Implemented";
  }
}

/* =========================================================
   CALCULATE RESIDUAL SCORE
   =========================================================

   The model reduces the original risk based on the
   estimated effectiveness of treatment.

   Critical:
     - Highly Effective  -> 1
     - Effective         -> 2
     - Partially Effective -> 3
     - Not Implemented   -> 4

   High:
     - Highly Effective  -> 1
     - Effective         -> 1
     - Partially Effective -> 2
     - Not Implemented   -> 3

   Medium:
     - Highly Effective  -> 1
     - Effective         -> 1
     - Partially Effective -> 2
     - Not Implemented   -> 2

   Low:
     - Always remains Low
   ========================================================= */

function calculateResidualScore(
  inherentRisk: RiskLevel,
  effectiveness: ControlEffectiveness
): number {
  const inherentScore =
    riskScore(inherentRisk);

  const effectiveness =
    effectivenessScore(effectiveness);

  /*
   * No implemented control.
   */
  if (effectiveness === 0) {
    return inherentScore;
  }

  /*
   * Partially effective control.
   */
  if (effectiveness === 1) {
    return Math.max(
      1,
      inherentScore - 1
    );
  }

  /*
   * Effective control.
   */
  if (effectiveness === 2) {
    return Math.max(
      1,
      inherentScore - 2
    );
  }

  /*
   * Highly effective control.
   */
  return Math.max(
    1,
    inherentScore - 3
  );
}

/* =========================================================
   RISK REDUCTION
   ========================================================= */

function calculateRiskReduction(
  inherentScore: number,
  residualScore: number
): RiskReduction {
  const reduction =
    inherentScore - residualScore;

  if (reduction <= 0) {
    return "None";
  }

  if (reduction === 1) {
    return "Low";
  }

  if (reduction === 2) {
    return "Medium";
  }

  if (reduction === 3) {
    return "High";
  }

  return "Very High";
}

/* =========================================================
   RESIDUAL RISK RATIONALE
   ========================================================= */

function residualRiskRationale(
  inherentRisk: RiskLevel,
  residualRisk: ResidualRiskLevel,
  effectiveness: ControlEffectiveness
): string {
  if (
    effectiveness === "Not Implemented"
  ) {
    return (
      `The original ${inherentRisk} risk remains ` +
      `substantially unchanged because the recommended ` +
      `treatment has not yet been implemented. ` +
      `The residual risk should therefore be actively ` +
      `tracked until remediation is completed.`
    );
  }

  if (
    effectiveness === "Partially Effective"
  ) {
    return (
      `The recommended treatment is partially implemented ` +
      `or operating with limited effectiveness. The risk ` +
      `has been reduced from ${inherentRisk} to ` +
      `${residualRisk}, but additional remediation is ` +
      `required before the control can be considered fully effective.`
    );
  }

  if (
    effectiveness === "Effective"
  ) {
    return (
      `The treatment is considered effective and materially ` +
      `reduces the original ${inherentRisk} risk. The remaining ` +
      `${residualRisk} risk should continue to be monitored ` +
      `through normal privacy and security governance.`
    );
  }

  return (
    `The treatment is considered highly effective and has ` +
    `significantly reduced the original ${inherentRisk} risk. ` +
    `The remaining ${residualRisk} risk should be monitored ` +
    `to ensure continued control effectiveness.`
  );
}

/* =========================================================
   RECOMMENDED NEXT ACTION
   ========================================================= */

function recommendedNextAction(
  residualRisk: ResidualRiskLevel,
  effectiveness: ControlEffectiveness
): string {
  if (
    effectiveness === "Not Implemented"
  ) {
    return (
      "Implement the recommended treatment and reassess " +
      "the residual risk after sufficient control evidence " +
      "is available."
    );
  }

  if (
    effectiveness === "Partially Effective"
  ) {
    return (
      "Complete the remaining remediation activities and " +
      "perform a control-effectiveness review."
    );
  }

  if (
    residualRisk === "Critical"
  ) {
    return (
      "Escalate immediately to senior management and " +
      "consider formal risk acceptance or additional " +
      "risk-reduction measures."
    );
  }

  if (
    residualRisk === "High"
  ) {
    return (
      "Continue remediation and obtain management oversight " +
      "until the residual risk is reduced or formally accepted."
    );
  }

  if (
    residualRisk === "Medium"
  ) {
    return (
      "Monitor the residual risk and maintain the treatment " +
      "controls through the normal privacy governance cycle."
    );
  }

  return (
    "Maintain the existing controls and monitor periodically."
  );
}

/* =========================================================
   RESIDUAL RISK STATUS
   ========================================================= */

function residualStatus(
  residualRisk: ResidualRiskLevel,
  treatmentStatus: TreatmentStatus
): ResidualRiskStatus {
  if (
    treatmentStatus === "Completed"
  ) {
    return "Residual Risk";
  }

  if (
    treatmentStatus === "In Progress"
  ) {
    return "Under Treatment";
  }

  if (
    treatmentStatus === "Accepted"
  ) {
    return "Accepted";
  }

  /*
   * Critical / High risks with no treatment
   * remain open.
   */
  if (
    residualRisk === "Critical" ||
    residualRisk === "High"
  ) {
    return "Open";
  }

  return "Under Treatment";
}

/* =========================================================
   GENERATE RESIDUAL RISK ASSESSMENT
   ========================================================= */

export function generateResidualRiskAssessment(
  result: RiskResult,
  treatmentPlan: RiskTreatmentAction[]
): ResidualRiskAssessment[] {
  /*
   * Create a quick lookup table so that each finding
   * can be matched to its Step 8 treatment.
   */
  const treatmentByFinding =
    new Map<string, RiskTreatmentAction>();

  treatmentPlan.forEach(
    (treatment) => {
      treatmentByFinding.set(
        treatment.findingId,
        treatment
      );
    }
  );

  return result.findings
    .map(
      (
        finding: RiskFinding
      ): ResidualRiskAssessment | null => {
        const treatment =
          treatmentByFinding.get(
            finding.id
          );

        /*
         * A residual-risk assessment cannot be
         * generated without the corresponding
         * Step 8 treatment record.
         */
        if (!treatment) {
          return null;
        }

        const inherentRisk =
          finding.level;

        const inherentScore =
          riskScore(inherentRisk);

        const controlEffectiveness =
          estimateControlEffectiveness(
            treatment
          );

        const residualScore =
          calculateResidualScore(
            inherentRisk,
            controlEffectiveness
          );

        const residualRisk =
          residualRiskFromScore(
            residualScore
          );

        const riskReduction =
          calculateRiskReduction(
            inherentScore,
            residualScore
          );

        return {
          id:
            `RES-${finding.id}`,

          findingId:
            finding.id,

          treatmentId:
            treatment.id,

          category:
            finding.category,

          riskTitle:
            finding.title,

          inherentRisk,

          treatmentAction:
            treatment.action,

          treatmentRationale:
            treatment.rationale,

          suggestedOwner:
            treatment.suggestedOwner,

          suggestedTimeframe:
            treatment.suggestedTimeframe,

          treatmentPriority:
            treatment.priority,

          treatmentEffort:
            treatment.effort,

          treatmentStatus:
            treatment.status,

          controlEffectiveness,

          residualRisk,

          riskReduction,

          residualRiskScore:
            residualScore,

          inherentRiskScore:
            inherentScore,

          residualRiskRationale:
            residualRiskRationale(
              inherentRisk,
              residualRisk,
              controlEffectiveness
            ),

          recommendedNextAction:
            recommendedNextAction(
              residualRisk,
              controlEffectiveness
            ),

          status:
            residualStatus(
              residualRisk,
              treatment.status
            ),

          evidence:
            treatment.evidence,
        };
      }
    )
    .filter(
      (
        item
      ): item is ResidualRiskAssessment =>
        item !== null
    )
    .sort(
      (a, b) =>
        b.residualRiskScore -
        a.residualRiskScore
    );
}

/* =========================================================
   SUMMARY
   ========================================================= */

export type ResidualRiskSummary = {
  total: number;

  critical: number;

  high: number;

  medium: number;

  low: number;

  open: number;

  underTreatment: number;

  accepted: number;

  averageRiskReduction: number;
};

/* =========================================================
   GENERATE RESIDUAL RISK SUMMARY
   ========================================================= */

export function generateResidualRiskSummary(
  assessments: ResidualRiskAssessment[]
): ResidualRiskSummary {
  if (
    assessments.length === 0
  ) {
    return {
      total: 0,
      critical: 0,
      high: 0,
      medium: 0,
      low: 0,
      open: 0,
      underTreatment: 0,
      accepted: 0,
      averageRiskReduction: 0,
    };
  }

  const critical =
    assessments.filter(
      (item) =>
        item.residualRisk ===
        "Critical"
    ).length;

  const high =
    assessments.filter(
      (item) =>
        item.residualRisk ===
        "High"
    ).length;

  const medium =
    assessments.filter(
      (item) =>
        item.residualRisk ===
        "Medium"
    ).length;

  const low =
    assessments.filter(
      (item) =>
        item.residualRisk ===
        "Low"
    ).length;

  const open =
    assessments.filter(
      (item) =>
        item.status ===
        "Open"
    ).length;

  const underTreatment =
    assessments.filter(
      (item) =>
        item.status ===
        "Under Treatment"
    ).length;

  const accepted =
    assessments.filter(
      (item) =>
        item.status ===
        "Accepted"
    ).length;

  const totalReduction =
    assessments.reduce(
      (
        total,
        item
      ) =>
        total +
        (
          item.inherentRiskScore -
          item.residualRiskScore
        ),
      0
    );

  const averageRiskReduction =
    Number(
      (
        totalReduction /
        assessments.length
      ).toFixed(2)
    );

  return {
    total:
      assessments.length,

    critical,

    high,

    medium,

    low,

    open,

    underTreatment,

    accepted,

    averageRiskReduction,
  };
}
