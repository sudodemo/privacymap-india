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
   TYPES
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

  inherentRisk: RiskLevel;

  treatmentAction: string;

  treatmentRationale: string;

  suggestedOwner: string;

  suggestedTimeframe: string;

  treatmentPriority: TreatmentPriority;

  treatmentEffort: TreatmentEffort;

  treatmentStatus: TreatmentStatus;

  controlEffectiveness: ControlEffectiveness;

  residualRisk: ResidualRiskLevel;

  riskReduction: RiskReduction;

  residualRiskScore: number;

  inherentRiskScore: number;

  residualRiskRationale: string;

  recommendedNextAction: string;

  status: ResidualRiskStatus;

  evidence: string;
};

/* =========================================================
   RISK SCORE
   ========================================================= */

function getRiskScore(
  level: RiskLevel
): number {
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
   RESIDUAL RISK FROM SCORE
   ========================================================= */

function getResidualRiskLevel(
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

function getEffectivenessScore(
  controlEffectiveness: ControlEffectiveness
): number {
  switch (controlEffectiveness) {
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
      /*
       * Risk acceptance does not mean that the
       * control is effective. The control may still
       * be incomplete, but management has accepted
       * the remaining risk.
       */
      return "Partially Effective";

    case "Open":
    default:
      return "Not Implemented";
  }
}

/* =========================================================
   CALCULATE RESIDUAL RISK SCORE
   ========================================================= */

function calculateResidualScore(
  inherentRisk: RiskLevel,
  controlEffectiveness: ControlEffectiveness
): number {
  const inherentScore =
    getRiskScore(inherentRisk);

  const effectivenessScore =
    getEffectivenessScore(
      controlEffectiveness
    );

  /*
   * No effective treatment.
   */
  if (effectivenessScore === 0) {
    return inherentScore;
  }

  /*
   * Partially effective treatment.
   */
  if (effectivenessScore === 1) {
    return Math.max(
      1,
      inherentScore - 1
    );
  }

  /*
   * Effective treatment.
   */
  if (effectivenessScore === 2) {
    return Math.max(
      1,
      inherentScore - 2
    );
  }

  /*
   * Highly effective treatment.
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

function getResidualRiskRationale(
  inherentRisk: RiskLevel,
  residualRisk: ResidualRiskLevel,
  controlEffectiveness: ControlEffectiveness
): string {
  if (
    controlEffectiveness ===
    "Not Implemented"
  ) {
    return (
      `The original ${inherentRisk} risk remains ` +
      `substantially unchanged because the recommended ` +
      `treatment has not yet been implemented. ` +
      `The residual risk should remain actively tracked ` +
      `until remediation is completed.`
    );
  }

  if (
    controlEffectiveness ===
    "Partially Effective"
  ) {
    return (
      `The recommended treatment is partially implemented ` +
      `or operating with limited effectiveness. The risk ` +
      `has been reduced from ${inherentRisk} to ` +
      `${residualRisk}, but additional remediation may ` +
      `be required before the control can be considered ` +
      `fully effective.`
    );
  }

  if (
    controlEffectiveness ===
    "Effective"
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
    `The remaining ${residualRisk} risk should continue to ` +
    `be monitored for ongoing control effectiveness.`
  );
}

/* =========================================================
   RECOMMENDED NEXT ACTION
   ========================================================= */

function getRecommendedNextAction(
  residualRisk: ResidualRiskLevel,
  controlEffectiveness: ControlEffectiveness
): string {
  if (
    controlEffectiveness ===
    "Not Implemented"
  ) {
    return (
      "Implement the recommended treatment and reassess " +
      "the residual risk after sufficient control evidence " +
      "is available."
    );
  }

  if (
    controlEffectiveness ===
    "Partially Effective"
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
      "consider additional risk-reduction measures or " +
      "formal risk acceptance."
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

function getResidualRiskStatus(
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
  const treatmentByFinding =
    new Map<
      string,
      RiskTreatmentAction
    >();

  for (
    const treatment of treatmentPlan
  ) {
    treatmentByFinding.set(
      treatment.findingId,
      treatment
    );
  }

  return result.findings
    .map(
      (
        finding: RiskFinding
      ): ResidualRiskAssessment | null => {
        const treatment =
          treatmentByFinding.get(
            finding.id
          );

        if (!treatment) {
          return null;
        }

        const inherentRisk =
          finding.level;

        const inherentScore =
          getRiskScore(
            inherentRisk
          );

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
          getResidualRiskLevel(
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
            getResidualRiskRationale(
              inherentRisk,
              residualRisk,
              controlEffectiveness
            ),

          recommendedNextAction:
            getRecommendedNextAction(
              residualRisk,
              controlEffectiveness
            ),

          status:
            getResidualRiskStatus(
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
   SUMMARY TYPE
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
   GENERATE SUMMARY
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
