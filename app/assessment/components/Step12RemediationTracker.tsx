"use client";

import type { AssessmentProfile } from "../types";
import type {
RiskTreatmentAction,
TreatmentStatus,
} from "../../../lib/riskTreatment";

interface Step12RemediationTrackerProps {
assessmentProfile: AssessmentProfile;
actions: RiskTreatmentAction[];
onStatusChange: (
id: string,
status: TreatmentStatus
) => void;
}

export default function Step12RemediationTracker({
assessmentProfile,
actions,
onStatusChange,
}: Step12RemediationTrackerProps) {
const openCount = actions.filter(
(action) => action.status === "Open"
).length;

const progressCount = actions.filter(
(action) => action.status === "In Progress"
).length;

const closedCount = actions.filter(
(action) =>
action.status === "Completed" ||
action.status === "Accepted"
).length;

return (
<section
style={{
marginTop: 24,
marginBottom: 24,
}}
>
{/* =====================================================
HEADER
===================================================== */}

  <div style={cardStyle}>
    <div style={kickerStyle}>
      STEP 12
    </div>

    <h2 style={headingStyle}>
      Remediation Tracker
    </h2>

    <p style={paragraphStyle}>
      Track treatment progress from the same parent-owned
      remediation state used by Steps 8–11.
    </p>

    <div style={profileStyle}>
      <strong>
        {assessmentProfile.organisationName ||
          "Organisation"}
      </strong>

      {" • "}

      {assessmentProfile.assessmentName ||
        "Privacy Assessment"}

      {" • "}

      {assessmentProfile.assessmentId ||
        "Assessment ID pending"}
    </div>

    <div style={summaryGridStyle}>
      <SummaryCard
        label="OPEN"
        value={openCount}
      />

      <SummaryCard
        label="IN PROGRESS"
        value={progressCount}
      />

      <SummaryCard
        label="CLOSED"
        value={closedCount}
      />
    </div>
  </div>

  {/* =====================================================
      REMEDIATION REGISTER
      ===================================================== */}

  <div style={cardStyle}>
    {actions.length === 0 ? (
      <EmptyState />
    ) : (
      <div>
        {actions.map((action) => {
          return (
            <RemediationCard
              key={action.id}
              action={action}
              onStatusChange={onStatusChange}
            />
          );
        })}
      </div>
    )}
  </div>
</section>

);
}

/* ============================================================
REMEDIATION CARD
============================================================ */

function RemediationCard({
action,
onStatusChange,
}: {
action: RiskTreatmentAction;
onStatusChange: (
id: string,
status: TreatmentStatus
) => void;
}) {
return (
<div
style={{
border: "1px solid #e2e8f0",
borderRadius: 12,
padding: 20,
marginBottom: 14,
}}
>
<div
style={{
display: "flex",
justifyContent: "space-between",
alignItems: "flex-start",
gap: 15,
flexWrap: "wrap",
}}
> <div> <div style={smallTextStyle}>
{action.category} </div>

      <h3
        style={{
          margin: "6px 0",
          color: "#0f172a",
        }}
      >
        {action.riskTitle}
      </h3>

      <div
        style={{
          marginTop: 8,
          fontSize: 13,
          color: "#64748b",
        }}
      >
        Remediation action generated from the
        assessment finding.
      </div>
    </div>

    <span
      style={statusBadgeStyle(action.status)}
    >
      {action.status}
    </span>
  </div>

  {/* =====================================================
      METADATA
      ===================================================== */}

  <div style={metadataGridStyle}>
    <Metadata
      label="Finding / Action ID"
      value={action.id}
    />

    <Metadata
      label="Category"
      value={action.category}
    />

    <Metadata
      label="Priority"
      value={String(action.priority)}
    />

    <Metadata
      label="Current status"
      value={action.status}
    />
  </div>

  {/* =====================================================
      STATUS CONTROL
      ===================================================== */}

  <div
    style={{
      marginTop: 18,
      maxWidth: 320,
    }}
  >
    <label style={labelStyle}>
      Treatment status
    </label>

    <select
      value={action.status}
      onChange={(event) => {
        onStatusChange(
          action.id,
          event.target.value as TreatmentStatus
        );
      }}
      style={inputStyle}
    >
      <option value="Open">
        Open
      </option>

      <option value="In Progress">
        In Progress
      </option>

      <option value="Completed">
        Completed
      </option>

      <option value="Accepted">
        Accepted
      </option>
    </select>
  </div>
</div>

);
}

/* ============================================================
SUMMARY CARD
============================================================ */

function SummaryCard({
label,
value,
}: {
label: string;
value: number;
}) {
return (
<div
style={{
padding: 18,
borderRadius: 10,
background: "#f8fafc",
border: "1px solid #e2e8f0",
}}
>
<div
style={{
fontSize: 11,
fontWeight: 700,
color: "#64748b",
letterSpacing: 1,
}}
>
{label} </div>

```
  <div
    style={{
      marginTop: 6,
      fontSize: 28,
      fontWeight: 800,
      color: "#0f172a",
    }}
  >
    {value}
  </div>
</div>
```

);
}

/* ============================================================
METADATA
============================================================ */

function Metadata({
label,
value,
}: {
label: string;
value: string;
}) {
return (
<div
style={{
padding: 12,
background: "#f8fafc",
borderRadius: 8,
}}
>
<div
style={{
fontSize: 11,
fontWeight: 700,
color: "#64748b",
textTransform: "uppercase",
marginBottom: 5,
}}
>
{label} </div>

  <div
    style={{
      fontSize: 13,
      color: "#334155",
      lineHeight: 1.5,
      wordBreak: "break-word",
    }}
  >
    {value || "Not specified"}
  </div>
</div>

);
}

/* ============================================================
EMPTY STATE
============================================================ */

function EmptyState() {
return (
<div
style={{
padding: 18,
background: "#f8fafc",
borderRadius: 10,
color: "#64748b",
lineHeight: 1.6,
}}
>
No remediation actions are currently available.
Complete the privacy assessment and generate findings
before using the remediation tracker. </div>
);
}

/* ============================================================
STATUS BADGE
============================================================ */

function statusBadgeStyle(
status: TreatmentStatus
) {
if (status === "Completed") {
return {
padding: "6px 10px",
borderRadius: 20,
background: "#f0fdf4",
color: "#15803d",
fontWeight: 700,
fontSize: 12,
height: "fit-content",
};
}

if (status === "Accepted") {
return {
padding: "6px 10px",
borderRadius: 20,
background: "#eff6ff",
color: "#1d4ed8",
fontWeight: 700,
fontSize: 12,
height: "fit-content",
};
}

if (status === "In Progress") {
return {
padding: "6px 10px",
borderRadius: 20,
background: "#fffbeb",
color: "#b45309",
fontWeight: 700,
fontSize: 12,
height: "fit-content",
};
}

return {
padding: "6px 10px",
borderRadius: 20,
background: "#f8fafc",
color: "#475569",
fontWeight: 700,
fontSize: 12,
height: "fit-content",
};
}

/* ============================================================
STYLES
============================================================ */

const cardStyle = {
background: "white",
border: "1px solid #e2e8f0",
borderRadius: 14,
padding: 28,
marginBottom: 20,
};

const kickerStyle = {
fontSize: 13,
fontWeight: 700,
letterSpacing: 2,
color: "#1d4ed8",
marginBottom: 8,
};

const headingStyle = {
marginTop: 0,
color: "#0f172a",
};

const paragraphStyle = {
color: "#64748b",
lineHeight: 1.6,
maxWidth: 760,
};

const profileStyle = {
marginTop: 18,
padding: "14px 16px",
background: "#f8fafc",
border: "1px solid #e2e8f0",
borderRadius: 10,
color: "#475569",
fontSize: 13,
};

const summaryGridStyle = {
display: "grid",
gridTemplateColumns:
"repeat(auto-fit,minmax(180px,1fr))",
gap: 12,
marginTop: 20,
};

const metadataGridStyle = {
display: "grid",
gridTemplateColumns:
"repeat(auto-fit,minmax(180px,1fr))",
gap: 10,
marginTop: 16,
};

const smallTextStyle = {
fontSize: 11,
fontWeight: 700,
color: "#64748b",
letterSpacing: 1,
};

const labelStyle = {
display: "block",
fontWeight: 700,
color: "#0f172a",
marginBottom: 7,
fontSize: 13,
};

const inputStyle = {
width: "100%",
boxSizing: "border-box" as const,
padding: "11px 12px",
border: "1px solid #cbd5e1",
borderRadius: 8,
background: "white",
color: "#0f172a",
fontSize: 14,
};
