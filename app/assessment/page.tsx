"use client";

import {useEffect, useMemo, useState, type Dispatch, type SetStateAction, } from "react";
import { getBusinessTypes, getSchoolEntryPoints, kb } from "../../lib/kb";
import { calculatePrivacyRisk, type RiskResult } from "./lib/riskEngine";
import {generateRiskTreatmentPlan, type RiskTreatmentAction, type TreatmentStatus, } from "./lib/remediationEngine";
import {generateResidualRiskAssessment, generateResidualRiskSummary, type ResidualRiskAssessment, type ResidualRiskSummary, } from "../../lib/residualRisk";
import {defaultResidualRiskDecision, defaultDecisionRationale, decisionRequiresApproval, type ResidualRiskDecisionRecord, } from "./lib/governanceEngine";
import Step0AssessmentProfile, {createDefaultAssessmentProfile, } from "./components/Step0AssessmentProfile";
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

function buildResidualRiskDecisions(
residualRisks: ResidualRiskAssessment[],
treatmentActions: RiskTreatmentAction[]
): ResidualRiskDecisionRecord[] {
return residualRisks.map((risk) => {
const residualRisk = risk.residualRisk;
const decision = defaultResidualRiskDecision(residualRisk);
const requiresApproval = decisionRequiresApproval(
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
  findingId: risk.findingId ?? risk.id,
  riskTitle: risk.riskTitle,
  category: risk.category,
  inherentRisk: risk.inherentRisk,
  residualRisk,
  decision,
  rationale: defaultDecisionRationale(
    decision,
    residualRisk
  ),
  accountableOwner: "",
  decisionAuthority: "",
  reviewDate: "",
  approvalDate: "",
  nextReviewDate: "",
  targetResolutionDate: "",
  approvalStatus: requiresApproval
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

export default function AssessmentPage() {
const [
assessmentProfile,
setAssessmentProfile,
] = useState<AssessmentProfile>(
createDefaultAssessmentProfile
);

const [industryId, setIndustryId] =
useState("");

const [businessTypeId, setBusinessTypeId] =
useState("");

const [processId, setProcessId] =
useState("");

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

> ([]);

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

> ([]);

const [collectorRoles, setCollectorRoles] =
useState<string[]>([]);

const [dataSubjectTypes, setDataSubjectTypes] =
useState<string[]>([]);

const [collectionFormats, setCollectionFormats] =
useState<string[]>([]);

const [storageLocations, setStorageLocations] =
useState<string[]>([]);

const [storageEnvironments, setStorageEnvironments] =
useState<string[]>([]);

const [encryptionStatuses, setEncryptionStatuses] =
useState<string[]>([]);

const [accessRoles, setAccessRoles] =
useState<string[]>([]);

const [sharingStatuses, setSharingStatuses] =
useState<string[]>([]);

const [retentionPeriods, setRetentionPeriods] =
useState<string[]>([]);

const [deletionMethods, setDeletionMethods] =
useState<string[]>([]);

const [privacyNotices, setPrivacyNotices] =
useState<string[]>([]);

const [consentStatuses, setConsentStatuses] =
useState<string[]>([]);

const [
parentalConsentStatuses,
setParentalConsentStatuses,
] = useState<string[]>([]);

const [
crossBorderTransfers,
setCrossBorderTransfers,
] = useState<string[]>([]);

const [riskResult, setRiskResult] =
useState<RiskResult | null>(null);

const [
treatmentActions,
setTreatmentActions,
] = useState<RiskTreatmentAction[]>([]);

const [
residualRiskDecisions,
setResidualRiskDecisions,
] = useState<ResidualRiskDecisionRecord[]>([]);

/*

* Step 10 is a review-based step rather than
* a data-entry step. This flag is set by the
* explicit acknowledgement displayed below Step 10.
  */
  const [step10Reviewed, setStep10Reviewed] =
  useState(false);

/*

* Step 13 owns its evidence state, so it reports
* completion back to this parent.
  */
  const [step13Complete, setStep13Complete] =
  useState(false);

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
riskResult && treatmentActions.length
? generateResidualRiskAssessment(
riskResult,
treatmentActions
)
: [],
[riskResult, treatmentActions]
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

/*

* ---
* WORKFLOW COMPLETION FLAGS
* ---

*/

const step0Complete =
assessmentProfile.organisationName.trim()
.length > 0;

const step1Complete =
industryId.trim().length > 0;

const step2Complete =
businessTypeId.trim().length > 0;

const step3Complete =
businessTypeId === "EDU-SCH"
? processId.trim().length > 0
: false;

const step4Complete =
selectedEntryPoints.length > 0 ||
customEntryPoints.length > 0;

const step5Complete =
selectedFields.length > 0 ||
customFields.length > 0;

/*

* Step 6 contains the assessment questionnaire.
* The existing UI instructs users to select
* "Unknown" when they do not know an answer.
*
* Therefore every assessment dimension must
* contain at least one selection before Step 7
* becomes available.
  */
  const step6Complete =
  collectorRoles.length > 0 &&
  dataSubjectTypes.length > 0 &&
  collectionFormats.length > 0 &&
  storageLocations.length > 0 &&
  storageEnvironments.length > 0 &&
  encryptionStatuses.length > 0 &&
  accessRoles.length > 0 &&
  sharingStatuses.length > 0 &&
  retentionPeriods.length > 0 &&
  deletionMethods.length > 0 &&
  privacyNotices.length > 0 &&
  consentStatuses.length > 0 &&
  parentalConsentStatuses.length > 0 &&
  crossBorderTransfers.length > 0;

/*

* Step 8 is complete only when every treatment
* action has moved away from Open.
  */
  const step8Complete =
  treatmentActions.length > 0 &&
  treatmentActions.every(
  (action) => action.status !== "Open"
  );

/*

* Step 9 is the Residual Risk Decision Register.
*
* A decision record is considered completed when
* the decision, rationale, accountable owner and
* review date have been supplied.
*
* Approval belongs to Step 11.
  */
  const step9Complete =
  residualRiskDecisions.length > 0 &&
  residualRiskDecisions.every(
  (decision) =>
  !!decision.decision &&
  decision.rationale.trim().length > 0 &&
  decision.accountableOwner.trim().length > 0 &&
  decision.reviewDate.trim().length > 0
  );

/*

* Step 10 is deliberately explicit:
* the user must acknowledge that the DPDP mapping
* has been reviewed.
  */
  const step10Complete = step10Reviewed;

/*

* Step 11 governance completion.
*
* Pending approvals are not considered complete.
* Approved decisions additionally require an
* approval date.
  */
  const step11Complete =
  residualRiskDecisions.length > 0 &&
  residualRiskDecisions.every(
  (decision) =>
  decision.approvalStatus !== "Pending" &&
  decision.accountableOwner.trim().length > 0 &&
  decision.decisionAuthority.trim().length > 0 &&
  decision.reviewDate.trim().length > 0 &&
  (
  decision.approvalStatus !== "Approved" ||
  decision.approvalDate.trim().length > 0
  )
  );

/*

* Step 12 is complete when every remediation
* action is Completed or Accepted.
  */
  const step12Complete =
  treatmentActions.length > 0 &&
  treatmentActions.every(
  (action) =>
  action.status === "Completed" ||
  action.status === "Accepted"
  );

/*

* ---
* STATE SYNCHRONISATION
* ---

*/

useEffect(() => {
setTreatmentActions(treatmentPlan);
}, [treatmentPlan]);

useEffect(() => {
if (!residualRiskAssessments.length) {
setResidualRiskDecisions([]);
return;
}

setResidualRiskDecisions((current) => {
  const byFinding = new Map(
    current.map((x) => [
      x.findingId,
      x,
    ])
  );

  const generated =
    buildResidualRiskDecisions(
      residualRiskAssessments,
      treatmentActions
    );

  return generated.map((next) => {
    const existing =
      byFinding.get(next.findingId);

    return existing
      ? {
          ...next,
          ...existing,
          riskTitle: next.riskTitle,
          category: next.category,
          inherentRisk: next.inherentRisk,
          residualRisk: next.residualRisk,
          treatmentStatus:
            next.treatmentStatus,
        }
      : {
          ...next,
        };
  });
});

}, [
residualRiskAssessments,
treatmentActions,
]);

/*

* If an earlier step is changed, downstream
* workflow acknowledgements must be reset.
  */
  useEffect(() => {
  if (!step9Complete) {
  setStep10Reviewed(false);
  }
  }, [step9Complete]);

useEffect(() => {
if (!step10Complete) {
setStep13Complete(false);
}
}, [step10Complete]);

/*

* ---
* HELPERS
* ---

*/

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
: [...current, value]
);
}

function toggleEntryPoint(id: string) {
setSelectedEntryPoints((current) =>
current.includes(id)
? current.filter(
(x) => x !== id
)
: [...current, id]
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
      collection_method: "Custom",
      custom: true,
    },
  ]
);

setCustomEntryPoint("");

}

function removeCustomEntryPoint(
id: string
) {
setCustomEntryPoints((current) =>
current.filter(
(x) => x.id !== id
)
);
}

function toggleField(id: string) {
setSelectedFields((current) =>
current.includes(id)
? current.filter(
(x) => x !== id
)
: [...current, id]
);
}

function addCustomField() {
const name =
customField.trim();

if (!name) return;

setCustomFields((current) => [
  ...current,
  {
    id: `CUSTOM-FIELD-${Date.now()}`,
    name,
    custom: true,
  },
]);

setCustomField("");

}

function removeCustomField(
id: string
) {
setCustomFields((current) =>
current.filter(
(x) => x.id !== id
)
);
}

function clearRiskOutputs() {
setRiskResult(null);
setTreatmentActions([]);
setResidualRiskDecisions([]);
setStep10Reviewed(false);
setStep13Complete(false);
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
setStep10Reviewed(false);
setStep13Complete(false);

setTimeout(() => {
  document
    .getElementById(
      "privacy-risk-result"
    )
    ?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
}, 100);

}

function updateTreatmentStatusGlobally(
sourceId: string,
status: TreatmentStatus
) {
const action =
treatmentActions.find(
(a) => a.id === sourceId
);

setTreatmentActions((current) =>
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
      current.map((d) =>
        d.riskTitle ===
          action.riskTitle &&
        d.category ===
          action.category
          ? {
              ...d,
              treatmentStatus:
                status,
            }
          : d
      )
  );
} else {
  setResidualRiskDecisions(
    (current) =>
      current.map((d) =>
        d.findingId === sourceId
          ? {
              ...d,
              treatmentStatus:
                status,
            }
          : d
      )
  );
}

}

function updateDecision(
id: string,
updates: Partial<ResidualRiskDecisionRecord>
) {
setResidualRiskDecisions(
(current) =>
current.map((d) =>
d.id === id
? {
...d,
...updates,
}
: d
)
);
}

/*

* ---
* RENDER
* ---

*/

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
PRIVACYMAP INDIA </p>

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

    {/* =================================================
        STEP 1
        ================================================= */}

    {step0Complete && (
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
    )}

    {/* =================================================
        STEP 2
        ================================================= */}

    {step0Complete &&
      step1Complete && (
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

    {/* =================================================
        STEP 3
        ================================================= */}

    {step0Complete &&
      step1Complete &&
      step2Complete &&
      businessTypeId === "EDU-SCH" && (
        <Step3Processing
          businessTypeId={
            businessTypeId
          }
          processId={processId}
          setProcessId={setProcessId}
          processes={processes}
          resetFromProcess={
            resetFromProcess
          }
        />
      )}

    {/* =================================================
        STEP 4
        ================================================= */}

    {step0Complete &&
      step1Complete &&
      step2Complete &&
      step3Complete &&
      businessTypeId === "EDU-SCH" && (
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

    {/* =================================================
        STEP 5
        ================================================= */}

    {step0Complete &&
      step1Complete &&
      step2Complete &&
      step3Complete &&
      step4Complete &&
      businessTypeId === "EDU-SCH" && (
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
          customField={customField}
          customFields={
            customFields
          }
          setCustomField={
            setCustomField
          }
          toggleField={toggleField}
          addCustomField={
            addCustomField
          }
          removeCustomField={
            removeCustomField
          }
        />
      )}

    {/* =================================================
        STEP 6
        ================================================= */}

    {step0Complete &&
      step1Complete &&
      step2Complete &&
      step3Complete &&
      step4Complete &&
      step5Complete &&
      businessTypeId === "EDU-SCH" && (
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

    {/* =================================================
        STEP 7
        ================================================= */}

    {step0Complete &&
      step1Complete &&
      step2Complete &&
      step3Complete &&
      step4Complete &&
      step5Complete &&
      step6Complete &&
      businessTypeId === "EDU-SCH" && (
        <section
          style={cardStyle}
        >
          <div
            style={{
              width: 34,
              height: 34,
              borderRadius: "50%",
              background: "#1d4ed8",
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
              background: "#eff6ff",
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
              !assessmentProfile.organisationName.trim()
            }
            style={{
              width: "100%",
              padding: 16,
              border: "none",
              borderRadius: 10,
              background:
                assessmentProfile.organisationName.trim()
                  ? "#1d4ed8"
                  : "#94a3b8",
              color: "white",
              fontSize: 17,
              fontWeight: 700,
              cursor:
                assessmentProfile.organisationName.trim()
                  ? "pointer"
                  : "not-allowed",
            }}
          >
            Analyse Privacy Risks
          </button>
        </section>
      )}

    {/* =================================================
        STEP 7 RESULTS
        ================================================= */}

    {riskResult && (
      <div id="privacy-risk-result">
        <Step7Findings
          result={riskResult}
        />
      </div>
    )}

    {/* =================================================
        STEP 8
        ================================================= */}

    {riskResult &&
      treatmentPlan.length > 0 && (
        <Step8Remediation
          actions={treatmentActions}
          onStatusChange={
            updateTreatmentStatusGlobally
          }
        />
      )}

    {/* =================================================
        STEP 9
        Only visible after every Step 8 action
        has moved away from Open.
        ================================================= */}

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

    {/* =================================================
        STEP 10
        Only visible after Step 9 is complete.
        ================================================= */}

    {riskResult &&
      step9Complete && (
        <>
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
          />

          <section
            style={{
              ...cardStyle,
              border:
                step10Reviewed
                  ? "1px solid #bbf7d0"
                  : "1px solid #bfdbfe",
              background:
                step10Reviewed
                  ? "#f0fdf4"
                  : "white",
            }}
          >
            <label
              style={{
                display: "flex",
                alignItems:
                  "flex-start",
                gap: 12,
                color: "#334155",
                lineHeight: 1.6,
                cursor: "pointer",
              }}
            >
              <input
                type="checkbox"
                checked={
                  step10Reviewed
                }
                onChange={(event) =>
                  setStep10Reviewed(
                    event.target.checked
                  )
                }
                style={{
                  width: 18,
                  height: 18,
                  marginTop: 3,
                }}
              />

              <span>
                <strong>
                  I have reviewed the DPDP
                  control mapping and
                  assessment results.
                </strong>
                <br />
                I understand that the
                mappings are assessment
                references and do not by
                themselves constitute a
                legal opinion or compliance
                certification.
              </span>
            </label>
          </section>
        </>
      )}

    {/* =================================================
        STEP 11
        ================================================= */}

    {riskResult &&
      step9Complete &&
      step10Complete && (
        <Step11Governance
          assessmentProfile={
            assessmentProfile
          }
          decisions={
            residualRiskDecisions
          }
          onUpdate={updateDecision}
        />
      )}

    {/* =================================================
        STEP 12
        ================================================= */}

    {riskResult &&
      step9Complete &&
      step10Complete &&
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

    {/* =================================================
        STEP 13
        ================================================= */}

    {riskResult &&
      step9Complete &&
      step10Complete &&
      step11Complete &&
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
          onCompletionChange={
            setStep13Complete
          }
        />
      )}

    {/* =================================================
        FINAL REPORT AREA
        Intentionally reserved for the next phase.
        It will be gated by step13Complete.
        ================================================= */}

    {step13Complete && (
      <section
        style={{
          ...cardStyle,
          border:
            "1px solid #bbf7d0",
          background:
            "#f0fdf4",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            color: "#166534",
          }}
        >
          Assessment Complete
        </h2>

        <p
          style={{
            color: "#166534",
            lineHeight: 1.6,
          }}
        >
          Step 13 evidence and closure
          criteria have been completed.
          Report download options will be
          available here.
        </p>
      </section>
    )}

    <div
      style={{
        marginTop: 32,
        padding:
          "18px 20px",
        background: "#eff6ff",
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
