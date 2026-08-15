"use client";

import {
  useEffect,
  useMemo,
  useState,
  type Dispatch,
  type SetStateAction,
} from "react";

import {
  getBusinessTypes,
  getSchoolEntryPoints,
  kb,
} from "../../lib/kb";

import {
  calculatePrivacyRisk,
  type RiskResult,
} from "./lib/riskEngine";

import {
  generateRiskTreatmentPlan,
  type RiskTreatmentAction,
  type TreatmentStatus,
} from "./lib/remediationEngine";

import {
  generateResidualRiskAssessment,
  generateResidualRiskSummary,
  type ResidualRiskAssessment,
  type ResidualRiskSummary,
} from "../../lib/residualRisk";

import {
  defaultResidualRiskDecision,
  defaultDecisionRationale,
  decisionRequiresApproval,
  type ResidualRiskDecisionRecord,
} from "./lib/governanceEngine";

import Step0AssessmentProfile, {
  createDefaultAssessmentProfile,
} from "./components/Step0AssessmentProfile";

import type { AssessmentProfile } from "./types";

import Step1BusinessContext from "./components/Step1BusinessContext";
import Step2DataInventory from "./components/Step2DataInventory";
import Step3Processing from "./components/Step3Processing";
import Step4DataInventory from "./components/Step4DataInventory";
import Step5Processing from "./components/Step5Processing";
import Step6DataSubjects from "./components/Step6DataSubjects";
import Step7Findings from "./components/Step7Findings";
import Step8Remediation from "./components/Step8Remediation";
import Step9ResidualRisk from "./components/Step9ResidualRisk";
import Step10DPDPMapping from "./components/Step10DPDPMapping";
import Step11Governance from "./components/Step11Governance";
import Step12RemediationTracker from "./components/Step12RemediationTracker";
import Step13EvidenceClosure from "./components/Step13EvidenceClosure";
import AssessmentReport from "./components/AssessmentReport";
import {buildAssessmentReport, type EvidenceRecords, } from "./lib/reportExport";
import type { DpdpAssessmentState } from "./components/Step10DPDPMapping";


/* ============================================================
   RESIDUAL RISK DECISION BUILDER
   ============================================================ */

function buildResidualRiskDecisions(
  residualRisks: ResidualRiskAssessment[],
  treatmentActions: RiskTreatmentAction[]
): ResidualRiskDecisionRecord[] {
  return residualRisks.map((risk) => {
    const residualRisk = risk.residualRisk;

    const decision =
      defaultResidualRiskDecision(residualRisk);

    const requiresApproval =
      decisionRequiresApproval(
        decision,
        residualRisk
      );

    const action = treatmentActions.find(
      (a) =>
        a.riskTitle === risk.riskTitle &&
        a.category === risk.category
    );

    return {
      id: `DEC-${risk.findingId ?? risk.id}`,

      findingId:
        risk.findingId ?? risk.id,

      riskTitle:
        risk.riskTitle,

      category:
        risk.category,

      inherentRisk:
        risk.inherentRisk,

      residualRisk,

      decision,

      rationale:
        defaultDecisionRationale(
          decision,
          residualRisk
        ),

      accountableOwner: "",

      decisionAuthority: "",

      reviewDate: "",

      approvalDate: "",

      nextReviewDate: "",

      targetResolutionDate: "",

      approvalStatus:
        requiresApproval
          ? "Pending"
          : "Approved",

      reviewFrequency:
        residualRisk === "Critical"
          ? "Monthly"
          : residualRisk === "High"
            ? "Quarterly"
            : "Annual",

      escalationRequired:
        residualRisk === "Critical" ||
        residualRisk === "High",

      escalationReason:
        residualRisk === "Critical" ||
        residualRisk === "High"
          ? "Residual risk requires management-level review and explicit approval."
          : "",

      treatmentStatus:
        action?.status ??
        (decision === "Accept"
          ? "Accepted"
          : "Open"),
    };
  });
}


/* ============================================================
   COMMON STYLES
   ============================================================ */

const cardStyle = {
  background: "white",
  border: "1px solid #e2e8f0",
  borderRadius: "14px",
  padding: "28px",
  marginBottom: "20px",
};

const headingStyle = {
  color: "#0f172a",
  marginTop: 0,
  marginBottom: "18px",
};

const noticeStyle = {
  color: "#64748b",
  lineHeight: 1.6,
};


/* ============================================================
   MAIN ASSESSMENT PAGE
   ============================================================ */

export default function AssessmentPage() {
  const [
    assessmentProfile,
    setAssessmentProfile,
  ] = useState<AssessmentProfile>(
    createDefaultAssessmentProfile
  );


  /* ==========================================================
     STEP 1–6 STATE
     ========================================================== */

  const [
    industryId,
    setIndustryId,
  ] = useState("");

  const [
    businessTypeId,
    setBusinessTypeId,
  ] = useState("");

  const [
    processId,
    setProcessId,
  ] = useState("");

  const [
    selectedEntryPoints,
    setSelectedEntryPoints,
  ] = useState<string[]>([]);

  const [
    customEntryPoint,
    setCustomEntryPoint,
  ] = useState("");

  const [
    customEntryPoints,
    setCustomEntryPoints,
  ] = useState<
    {
      id: string;
      name: string;
      collection_method: string;
      custom: boolean;
    }[]
  >([]);

  const [
    selectedFields,
    setSelectedFields,
  ] = useState<string[]>([]);

  const [
    customField,
    setCustomField,
  ] = useState("");

  const [
    customFields,
    setCustomFields,
  ] = useState<
    {
      id: string;
      name: string;
      custom: boolean;
    }[]
  >([]);


  const [
    collectorRoles,
    setCollectorRoles,
  ] = useState<string[]>([]);

  const [
    dataSubjectTypes,
    setDataSubjectTypes,
  ] = useState<string[]>([]);

  const [
    collectionFormats,
    setCollectionFormats,
  ] = useState<string[]>([]);

  const [
    storageLocations,
    setStorageLocations,
  ] = useState<string[]>([]);

  const [
    storageEnvironments,
    setStorageEnvironments,
  ] = useState<string[]>([]);

  const [
    encryptionStatuses,
    setEncryptionStatuses,
  ] = useState<string[]>([]);

  const [
    accessRoles,
    setAccessRoles,
  ] = useState<string[]>([]);

  const [
    sharingStatuses,
    setSharingStatuses,
  ] = useState<string[]>([]);

  const [
    retentionPeriods,
    setRetentionPeriods,
  ] = useState<string[]>([]);

  const [
    deletionMethods,
    setDeletionMethods,
  ] = useState<string[]>([]);

  const [
    privacyNotices,
    setPrivacyNotices,
  ] = useState<string[]>([]);

  const [
    consentStatuses,
    setConsentStatuses,
  ] = useState<string[]>([]);

  const [
    parentalConsentStatuses,
    setParentalConsentStatuses,
  ] = useState<string[]>([]);

  const [
    crossBorderTransfers,
    setCrossBorderTransfers,
  ] = useState<string[]>([]);


  /* ==========================================================
     RISK / REMEDIATION STATE
     ========================================================== */

  const [
    riskResult,
    setRiskResult,
  ] = useState<RiskResult | null>(null);

  const [
    treatmentActions,
    setTreatmentActions,
  ] = useState<RiskTreatmentAction[]>([]);

  const [
    residualRiskDecisions,
    setResidualRiskDecisions,
  ] = useState<
    ResidualRiskDecisionRecord[]
  >([]);

  const [
  evidenceRecords,
  setEvidenceRecords,
  ] = useState<EvidenceRecords>({});

  /* STEP 10 — page-owned mapping state for Continuity Layer */
  const [
    dpdpMappingStates,
    setDpdpMappingStates,
  ] = useState<Record<string, DpdpAssessmentState>>({});


  /* ==========================================================
     DERIVED DATA
     ========================================================== */

  const businessTypes = useMemo(
    () =>
      industryId
        ? getBusinessTypes(industryId).filter(
            (x) => x.status === "active"
          )
        : [],
    [industryId]
  );

  const processes = useMemo(
    () =>
      businessTypeId === "EDU-SCH"
        ? kb.processes
        : [],
    [businessTypeId]
  );

  const entryPoints = useMemo(
    () =>
      businessTypeId === "EDU-SCH"
        ? getSchoolEntryPoints(
            processId || undefined
          )
        : [],
    [businessTypeId, processId]
  );

  const treatmentPlan = useMemo(
    () =>
      riskResult
        ? generateRiskTreatmentPlan(
            riskResult
          )
        : [],
    [riskResult]
  );

  const residualRiskAssessments =
    useMemo<ResidualRiskAssessment[]>(
      () =>
        riskResult &&
        treatmentActions.length
          ? generateResidualRiskAssessment(
              riskResult,
              treatmentActions
            )
          : [],
      [
        riskResult,
        treatmentActions,
      ]
    );

  const residualRiskSummary =
    useMemo<ResidualRiskSummary | null>(
      () =>
        residualRiskAssessments.length
          ? generateResidualRiskSummary(
              residualRiskAssessments
            )
          : null,
      [residualRiskAssessments]
    );


  /* ==========================================================
     SYNCHRONISE GENERATED TREATMENT PLAN
     ========================================================== */

  useEffect(() => {
    setTreatmentActions(
      treatmentPlan
    );
  }, [treatmentPlan]);


  /* ==========================================================
     SYNCHRONISE RESIDUAL RISK DECISIONS
     ========================================================== */

  useEffect(() => {
    if (
      !residualRiskAssessments.length
    ) {
      setResidualRiskDecisions([]);
      return;
    }

    setResidualRiskDecisions(
      (current) => {
        const byFinding =
          new Map(
            current.map(
              (x) => [
                x.findingId,
                x,
              ]
            )
          );

        const generated =
          buildResidualRiskDecisions(
            residualRiskAssessments,
            treatmentActions
          );

        return generated.map(
          (next) => {
            const existing =
              byFinding.get(
                next.findingId
              );

            return existing
              ? {
                  ...next,
                  ...existing,

                  riskTitle:
                    next.riskTitle,

                  category:
                    next.category,

                  inherentRisk:
                    next.inherentRisk,

                  residualRisk:
                    next.residualRisk,

                  treatmentStatus:
                    next.treatmentStatus,
                }
              : {
                  ...next,
                };
          }
        );
      }
    );
  }, [
    residualRiskAssessments,
    treatmentActions,
  ]);


  /* ==========================================================
     STEP 8 COMPLETION
     
     Requirement:
     Step 9 must remain hidden while ANY treatment action
     is still Open.
     ========================================================== */

  const step8Complete =
    treatmentActions.length > 0 &&
    treatmentActions.every(
      (action) =>
        action.status !== "Open"
    );


  /* ==========================================================
     STEP 9 COMPLETION
     
     Requirement:
     Every residual-risk decision must have:
     - a decision
     - rationale
     - accountable owner
     - review date
     - non-pending approval status
     ========================================================== */

  const step9Complete =
    residualRiskDecisions.length > 0 &&
    residualRiskDecisions.length ===
      residualRiskAssessments.length &&
    residualRiskDecisions.every(
      (decision) =>
        Boolean(
          String(
            decision.decision ?? ""
          ).trim()
        ) &&
        Boolean(
          String(
            decision.rationale ?? ""
          ).trim()
        ) &&
        Boolean(
          String(
            decision.accountableOwner ??
              ""
          ).trim()
        ) &&
        Boolean(
          String(
            decision.reviewDate ?? ""
          ).trim()
        ) &&
        decision.approvalStatus !==
          "Pending"
    );


  /* ==========================================================
     STEP 10 GATE
     
     IMPORTANT:
     The current Step10 component owns its mapping state locally.
     Therefore page.tsx cannot yet receive an explicit "completed"
     event from Step10.

     For the current architecture, Step10 becomes available after
     Step9 is complete.

     We will add an onComplete callback to Step10 in the next small
     architectural change so Step11 can be gated on actual Step10
     completion rather than merely Step10 availability.
     ========================================================== */

  const step10Unlocked =
    step9Complete;


  /* ==========================================================
     STEP 11 COMPLETION
     
     Step12 becomes visible only when ALL governance decisions
     have been processed.

     Approved / Rejected are treated as completed approval states.
     ========================================================== */

  const step11Complete =
    step10Unlocked &&
    residualRiskDecisions.length > 0 &&
    residualRiskDecisions.every(
      (decision) =>
        (
          decision.approvalStatus ===
            "Approved" ||
          decision.approvalStatus ===
            "Rejected"
        ) &&
        Boolean(
          String(
            decision.accountableOwner ??
              ""
          ).trim()
        ) &&
        Boolean(
          String(
            decision.reviewDate ?? ""
          ).trim()
        )
    );


  /* ==========================================================
     STEP 12 COMPLETION
     
     Step13 becomes visible only when every remediation action
     is either Completed or Accepted.
     ========================================================== */

  const step12Complete =
    step11Complete &&
    treatmentActions.length > 0 &&
    treatmentActions.every(
      (action) =>
        action.status ===
          "Completed" ||
        action.status ===
          "Accepted"
    );

    const step13Complete =
  step12Complete &&
  treatmentActions.length > 0 &&
  treatmentActions.every(
    (action) => {
      const evidence =
        evidenceRecords[
          action.id
        ];

      const decision =
        residualRiskDecisions.find(
          (item) =>
            item.riskTitle ===
              action.riskTitle &&
            item.category ===
              action.category
        );

      return (
        Boolean(
          evidence?.reference
            ?.trim()
        ) &&
        evidence?.verified ===
          true &&
        decision?.approvalStatus ===
          "Approved"
      );
    }
  );

  /* ==========================================================
     ARRAY / ENTRY POINT HELPERS
     ========================================================== */

  function toggleArrayValue(
    value: string,
    setter: Dispatch<
      SetStateAction<string[]>
    >
  ) {
    setter((current) =>
      current.includes(value)
        ? current.filter(
            (x) => x !== value
          )
        : [
            ...current,
            value,
          ]
    );
  }


  function toggleEntryPoint(
    id: string
  ) {
    setSelectedEntryPoints(
      (current) =>
        current.includes(id)
          ? current.filter(
              (x) => x !== id
            )
          : [
              ...current,
              id,
            ]
    );
  }


  function addCustomEntryPoint() {
    const name =
      customEntryPoint.trim();

    if (!name) return;

    setCustomEntryPoints(
      (current) => [
        ...current,
        {
          id: `CUSTOM-${Date.now()}`,
          name,
          collection_method:
            "Custom",
          custom: true,
        },
      ]
    );

    setCustomEntryPoint("");
  }


  function removeCustomEntryPoint(
    id: string
  ) {
    setCustomEntryPoints(
      (current) =>
        current.filter(
          (x) => x.id !== id
        )
    );
  }


  function toggleField(
    id: string
  ) {
    setSelectedFields(
      (current) =>
        current.includes(id)
          ? current.filter(
              (x) => x !== id
            )
          : [
              ...current,
              id,
            ]
    );
  }


  function addCustomField() {
    const name =
      customField.trim();

    if (!name) return;

    setCustomFields(
      (current) => [
        ...current,
        {
          id: `CUSTOM-FIELD-${Date.now()}`,
          name,
          custom: true,
        },
      ]
    );

    setCustomField("");
  }


  function removeCustomField(
    id: string
  ) {
    setCustomFields(
      (current) =>
        current.filter(
          (x) => x.id !== id
        )
    );
  }


  /* ==========================================================
     RESET HELPERS
     ========================================================== */

  function clearRiskOutputs() {
  setRiskResult(null);
  setTreatmentActions([]);
  setResidualRiskDecisions([]);
  setEvidenceRecords({});
  setDpdpMappingStates({});
  }


  function resetAssessment() {
    setBusinessTypeId("");
    setProcessId("");

    setSelectedEntryPoints([]);
    setCustomEntryPoints([]);
    setCustomEntryPoint("");

    setSelectedFields([]);
    setCustomFields([]);
    setCustomField("");

    setCollectorRoles([]);
    setDataSubjectTypes([]);
    setCollectionFormats([]);
    setStorageLocations([]);
    setStorageEnvironments([]);
    setEncryptionStatuses([]);
    setAccessRoles([]);
    setSharingStatuses([]);
    setRetentionPeriods([]);
    setDeletionMethods([]);
    setPrivacyNotices([]);
    setConsentStatuses([]);
    setParentalConsentStatuses([]);
    setCrossBorderTransfers([]);

    clearRiskOutputs();
  }


  function resetFromBusinessType() {
    setProcessId("");

    setSelectedEntryPoints([]);
    setCustomEntryPoints([]);
    setCustomEntryPoint("");

    setSelectedFields([]);
    setCustomFields([]);
    setCustomField("");

    setCollectorRoles([]);
    setDataSubjectTypes([]);
    setCollectionFormats([]);
    setStorageLocations([]);
    setStorageEnvironments([]);
    setEncryptionStatuses([]);
    setAccessRoles([]);
    setSharingStatuses([]);
    setRetentionPeriods([]);
    setDeletionMethods([]);
    setPrivacyNotices([]);
    setConsentStatuses([]);
    setParentalConsentStatuses([]);
    setCrossBorderTransfers([]);

    clearRiskOutputs();
  }


  function resetFromProcess() {
    setSelectedEntryPoints([]);
    setCustomEntryPoints([]);
    setCustomEntryPoint("");

    setSelectedFields([]);
    setCustomFields([]);
    setCustomField("");

    setCollectorRoles([]);
    setDataSubjectTypes([]);
    setCollectionFormats([]);
    setStorageLocations([]);
    setStorageEnvironments([]);
    setEncryptionStatuses([]);
    setAccessRoles([]);
    setSharingStatuses([]);
    setRetentionPeriods([]);
    setDeletionMethods([]);
    setPrivacyNotices([]);
    setConsentStatuses([]);
    setParentalConsentStatuses([]);
    setCrossBorderTransfers([]);

    clearRiskOutputs();
  }


  /* ==========================================================
     RUN RISK ASSESSMENT
     ========================================================== */

  function runPrivacyRiskAssessment() {
    const result =
      calculatePrivacyRisk({
        selectedEntryPoints,
        customEntryPoints,
        selectedFields,
        customFields,
        collectorRoles,
        dataSubjectTypes,
        collectionFormats,
        storageLocations,
        storageEnvironments,
        encryptionStatuses,
        accessRoles,
        sharingStatuses,
        retentionPeriods,
        deletionMethods,
        privacyNotices,
        consentStatuses,
        parentalConsentStatuses,
        crossBorderTransfers,
      });

    setRiskResult(result);

    setResidualRiskDecisions([]);
    setDpdpMappingStates({});

    setTimeout(
      () =>
        document
          .getElementById(
            "privacy-risk-result"
          )
          ?.scrollIntoView({
            behavior: "smooth",
            block: "start",
          }),
      100
    );
  }


  /* ==========================================================
     GLOBAL TREATMENT STATUS UPDATE
     ========================================================== */

  function updateTreatmentStatusGlobally(
    sourceId: string,
    status: TreatmentStatus
  ) {
    const action =
      treatmentActions.find(
        (a) => a.id === sourceId
      );

    setTreatmentActions(
      (current) =>
        current.map((a) =>
          a.id === sourceId
            ? {
                ...a,
                status,
              }
            : a
        )
    );

    if (action) {
      setResidualRiskDecisions(
        (current) =>
          current.map((decision) =>
            decision.riskTitle ===
              action.riskTitle &&
            decision.category ===
              action.category
              ? {
                  ...decision,
                  treatmentStatus:
                    status,
                }
              : decision
          )
      );
    } else {
      setResidualRiskDecisions(
        (current) =>
          current.map((decision) =>
            decision.findingId ===
              sourceId
              ? {
                  ...decision,
                  treatmentStatus:
                    status,
                }
              : decision
          )
      );
    }
  }


  /* ==========================================================
     STEP 10 DPDP MAPPING UPDATE
     ========================================================== */

  function updateDpdpMappingState(
    id: string,
    updates: Partial<DpdpAssessmentState>
  ) {
    setDpdpMappingStates((current) => ({
      ...current,
      [id]: {
        status: current[id]?.status ?? "NOT_ASSESSED",
        owner: current[id]?.owner ?? "",
        evidence: current[id]?.evidence ?? "",
        targetDate: current[id]?.targetDate ?? "",
        notes: current[id]?.notes ?? "",
        ...updates,
      },
    }));
  }


  /* ==========================================================
     GOVERNANCE DECISION UPDATE
     ========================================================== */

  function updateEvidence(
  id: string,
  updates: Partial<
    EvidenceRecords[string]
  >
) {
  setEvidenceRecords(
    (current) => ({
      ...current,
      [id]: {
        reference:
          current[id]
            ?.reference || "",
        owner:
          current[id]
            ?.owner || "",
        notes:
          current[id]
            ?.notes || "",
        verified:
          current[id]
            ?.verified || false,
        ...updates,
      },
    })
  );
}
  
  function updateDecision(
    id: string,
    updates: Partial<ResidualRiskDecisionRecord>
  ) {
    setResidualRiskDecisions(
      (current) =>
        current.map((decision) =>
          decision.id === id
            ? {
                ...decision,
                ...updates,
              }
            : decision
        )
    );
  }


  /* ==========================================================
     RENDER
     ========================================================== */

  return (
    <main
      style={{
        minHeight: "100vh",
        background: "#f8fafc",
        padding: "60px 24px",
        fontFamily:
          "Arial, Helvetica, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "900px",
          margin: "0 auto",
        }}
      >
        <p
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 3,
            color: "#1d4ed8",
          }}
        >
          PRIVACYMAP INDIA
        </p>


        {/* ======================================================
            STEP 0
            ====================================================== */}

        <div id="assessment-profile">
          <Step0AssessmentProfile
            profile={assessmentProfile}
            setProfile={
              setAssessmentProfile
            }
          />
        </div>


        <h1
          style={{
            fontSize: 42,
            color: "#0f172a",
            marginBottom: 12,
          }}
        >
          Privacy Assessment
        </h1>

        <p
          style={{
            color: "#475569",
            fontSize: 18,
            lineHeight: 1.6,
            marginBottom: 40,
          }}
        >
          Identify where personal data enters
          your organisation, what information is
          collected, how it is handled and where
          privacy risks may exist.
        </p>


        {/* ======================================================
            STEP 1
            ====================================================== */}

        <Step1BusinessContext
          industryId={industryId}
          setIndustryId={(value) => {
            setIndustryId(value);
            resetAssessment();
          }}
          resetAssessment={
            resetAssessment
          }
        />


        {/* ======================================================
            STEP 2
            ====================================================== */}

        {industryId && (
          <Step2DataInventory
            industryId={industryId}
            businessTypeId={
              businessTypeId
            }
            setBusinessTypeId={
              setBusinessTypeId
            }
            businessTypes={
              businessTypes
            }
            resetFromBusinessType={
              resetFromBusinessType
            }
          />
        )}


        {/* ======================================================
            STEP 3
            ====================================================== */}

        {businessTypeId ===
          "EDU-SCH" && (
          <Step3Processing
            businessTypeId={
              businessTypeId
            }
            processId={processId}
            setProcessId={
              setProcessId
            }
            processes={processes}
            resetFromProcess={
              resetFromProcess
            }
          />
        )}


        {/* ======================================================
            STEP 4
            ====================================================== */}

        {businessTypeId ===
          "EDU-SCH" && (
          <Step4DataInventory
            businessTypeId={
              businessTypeId
            }
            selectedEntryPoints={
              selectedEntryPoints
            }
            customEntryPoint={
              customEntryPoint
            }
            customEntryPoints={
              customEntryPoints
            }
            entryPoints={
              entryPoints
            }
            setCustomEntryPoint={
              setCustomEntryPoint
            }
            toggleEntryPoint={
              toggleEntryPoint
            }
            addCustomEntryPoint={
              addCustomEntryPoint
            }
            removeCustomEntryPoint={
              removeCustomEntryPoint
            }
          />
        )}


        {/* ======================================================
            STEP 5
            ====================================================== */}

        {businessTypeId ===
          "EDU-SCH" &&
          (
            selectedEntryPoints.length >
              0 ||
            customEntryPoints.length >
              0
          ) && (
            <Step5Processing
              businessTypeId={
                businessTypeId
              }
              selectedEntryPoints={
                selectedEntryPoints
              }
              customEntryPoints={
                customEntryPoints
              }
              selectedFields={
                selectedFields
              }
              customField={
                customField
              }
              customFields={
                customFields
              }
              setCustomField={
                setCustomField
              }
              toggleField={
                toggleField
              }
              addCustomField={
                addCustomField
              }
              removeCustomField={
                removeCustomField
              }
            />
          )}


        {/* ======================================================
            STEP 6
            ====================================================== */}

        {businessTypeId ===
          "EDU-SCH" &&
          selectedFields.length >
            0 && (
            <Step6DataSubjects
              businessTypeId={
                businessTypeId
              }
              selectedFields={
                selectedFields
              }
              {...{
                collectorRoles,
                dataSubjectTypes,
                collectionFormats,
                storageLocations,
                storageEnvironments,
                encryptionStatuses,
                accessRoles,
                sharingStatuses,
                retentionPeriods,
                deletionMethods,
                privacyNotices,
                consentStatuses,
                parentalConsentStatuses,
                crossBorderTransfers,

                setCollectorRoles,
                setDataSubjectTypes,
                setCollectionFormats,
                setStorageLocations,
                setStorageEnvironments,
                setEncryptionStatuses,
                setAccessRoles,
                setSharingStatuses,
                setRetentionPeriods,
                setDeletionMethods,
                setPrivacyNotices,
                setConsentStatuses,
                setParentalConsentStatuses,
                setCrossBorderTransfers,

                toggleArrayValue,
              }}
            />
          )}


        {/* ======================================================
            STEP 7 — RISK ASSESSMENT
            ====================================================== */}

        {businessTypeId ===
          "EDU-SCH" &&
          selectedFields.length >
            0 && (
            <section
              style={cardStyle}
            >
              <div
                style={{
                  width: 34,
                  height: 34,
                  borderRadius: "50%",
                  background:
                    "#1d4ed8",
                  color: "white",
                  display: "flex",
                  alignItems:
                    "center",
                  justifyContent:
                    "center",
                  fontWeight: 700,
                  marginBottom: 16,
                }}
              >
                7
              </div>

              <h2
                style={headingStyle}
              >
                Privacy Risk Assessment
              </h2>

              <p
                style={{
                  ...noticeStyle,
                  marginBottom: 24,
                }}
              >
                PrivacyMap will analyse the
                information entered above and
                identify potential privacy,
                security and governance risks.
              </p>

              <div
                style={{
                  padding: 20,
                  background:
                    "#eff6ff",
                  border:
                    "1px solid #bfdbfe",
                  borderRadius: 12,
                  marginBottom: 20,
                  color: "#1e3a8a",
                  lineHeight: 1.6,
                }}
              >
                <strong>
                  Important:
                </strong>{" "}
                This is a preliminary
                privacy-risk assessment based
                on the information provided. It
                is not a legal opinion or a
                determination of DPDPA
                compliance.
              </div>

              <button
                type="button"
                onClick={
                  runPrivacyRiskAssessment
                }
                disabled={
                  !assessmentProfile
                    .organisationName
                    .trim()
                }
                style={{
                  width: "100%",
                  padding: 16,
                  border: "none",
                  borderRadius: 10,
                  background:
                    assessmentProfile
                      .organisationName
                      .trim()
                      ? "#1d4ed8"
                      : "#94a3b8",
                  color: "white",
                  fontSize: 17,
                  fontWeight: 700,
                  cursor:
                    assessmentProfile
                      .organisationName
                      .trim()
                      ? "pointer"
                      : "not-allowed",
                }}
              >
                Analyse Privacy Risks
              </button>
            </section>
          )}


        {/* ======================================================
            STEP 7 OUTPUT
            ====================================================== */}

        {riskResult && (
          <div
            id="privacy-risk-result"
          >
            <Step7Findings
              result={riskResult}
            />
          </div>
        )}


        {/* ======================================================
            STEP 8 — REMEDIATION
            Always visible after risk assessment.
            ====================================================== */}

        {riskResult &&
          treatmentPlan.length >
            0 && (
            <Step8Remediation
              actions={
                treatmentActions
              }
              onStatusChange={
                updateTreatmentStatusGlobally
              }
            />
          )}


        {/* ======================================================
            STEP 9 — RESIDUAL RISK
            
            IMPORTANT:
            Step 9 is hidden until ALL Step 8 treatment actions
            are no longer Open.
            ====================================================== */}

        {riskResult &&
          step8Complete &&
          residualRiskAssessments.length >
            0 && (
            <Step9ResidualRisk
              assessments={
                residualRiskAssessments
              }
              summary={
                residualRiskSummary
              }
              decisions={
                residualRiskDecisions
              }
              setDecisions={
                setResidualRiskDecisions
              }
              onTreatmentStatusChange={
                updateTreatmentStatusGlobally
              }
            />
          )}


        {/* ======================================================
            STEP 10 — DPDP MAPPING
            
            Step 10 is hidden until Step 9 is complete.
            ====================================================== */}

        {riskResult &&
          step9Complete && (
            <Step10DPDPMapping
              result={riskResult}
              dataSubjectTypes={
                dataSubjectTypes
              }
              encryptionStatuses={
                encryptionStatuses
              }
              retentionPeriods={
                retentionPeriods
              }
              deletionMethods={
                deletionMethods
              }
              privacyNotices={
                privacyNotices
              }
              consentStatuses={
                consentStatuses
              }
              parentalConsentStatuses={
                parentalConsentStatuses
              }
              crossBorderTransfers={
                crossBorderTransfers
              }
              treatmentActions={
                treatmentActions
              }
              mappingStates={
                dpdpMappingStates
              }
              onMappingStateChange={
                updateDpdpMappingState
              }
            />
          )}


        {/* ======================================================
            STEP 11 — GOVERNANCE
            
            Step 11 appears only after Step 10 is unlocked.
            
            The current Step10 component does not yet expose an
            onComplete callback, so step10Unlocked represents
            Step10 availability rather than its internal completion.
            ====================================================== */}

        {riskResult &&
          step10Unlocked && (
            <Step11Governance
              assessmentProfile={
                assessmentProfile
              }
              decisions={
                residualRiskDecisions
              }
              onUpdate={
                updateDecision
              }
            />
          )}


        {/* ======================================================
            STEP 12 — REMEDIATION TRACKER
            
            This is the important fix for the issue you reported.
            
            Step 12 appears only when EVERY Step 11 governance
            decision is Approved or Rejected and the required
            owner/review information has been entered.
            ====================================================== */}

        {riskResult &&
          step11Complete && (
            <Step12RemediationTracker
              assessmentProfile={
                assessmentProfile
              }
              actions={
                treatmentActions
              }
              onStatusChange={
                updateTreatmentStatusGlobally
              }
            />
          )}


        {/* ======================================================
            STEP 13 — EVIDENCE & CLOSURE
            
            Step 13 appears only after ALL remediation actions
            are Completed or Accepted.
            ====================================================== */}

        {riskResult &&
          step12Complete && (
            <Step13EvidenceClosure
              assessmentProfile={
                assessmentProfile
              }
              actions={
                treatmentActions
              }
              decisions={
                residualRiskDecisions
              }
              evidenceRecords={
                evidenceRecords
              }
              onEvidenceChange={
                updateEvidence
              }
            />
          )}


        {riskResult &&
        step13Complete && (
          <AssessmentReport
            report={buildAssessmentReport(
              assessmentProfile,
              riskResult,
              treatmentActions,
              residualRiskDecisions,
              evidenceRecords
            )}
          />
        )}
        
        {/* ======================================================
            PRIVACY BY DESIGN
            ====================================================== */}

        <div
          style={{
            marginTop: 32,
            padding:
              "18px 20px",
            background:
              "#eff6ff",
            border:
              "1px solid #bfdbfe",
            borderRadius: 10,
            color: "#1e3a8a",
            lineHeight: 1.6,
          }}
        >
          <strong>
            Privacy-by-design:
          </strong>{" "}
          PrivacyMap does not require your
          customers' personal data. Assessment
          responses remain in your browser and
          are used locally to generate
          assessment results and reports.
        </div>
      </div>
    </main>
  );
}
