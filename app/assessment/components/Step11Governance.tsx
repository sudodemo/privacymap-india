"use client";

import type { ReactNode } from "react";
import type { AssessmentProfile } from "../types";
import type { ResidualRiskDecisionRecord } from "../lib/governanceEngine";
import { SECURITY_LIMITS, sanitizeInteractiveText } from "../lib/security";

interface Step11GovernanceProps {
  assessmentProfile: AssessmentProfile;
  decisions: ResidualRiskDecisionRecord[];
  onUpdate: (id: string, updates: Partial<ResidualRiskDecisionRecord>) => void;
}

const cardStyle = { background: "white", border: "1px solid #e2e8f0", borderRadius: 14, padding: 28, marginBottom: 20 };
const inputStyle = { width: "100%", boxSizing: "border-box" as const, padding: "11px 12px", border: "1px solid #cbd5e1", borderRadius: 8, background: "white", color: "#0f172a", fontSize: 14 };
const fieldLabelStyle = { display: "block", fontWeight: 700, color: "#0f172a", marginBottom: 7, fontSize: 13 };
const kickerStyle = { fontSize: 13, fontWeight: 700, letterSpacing: 2, color: "#1d4ed8", marginBottom: 8 };
const headingStyle = { marginTop: 0, color: "#0f172a" };
const paragraphStyle = { color: "#64748b", lineHeight: 1.6, maxWidth: 760 };
const profileStyle = { marginTop: 18, padding: "14px 16px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, color: "#475569", fontSize: 13 };
const summaryGridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 12, marginTop: 20 };
const metaGridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(180px,1fr))", gap: 12, marginTop: 18 };
const fieldGridStyle = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(240px,1fr))", gap: 12, marginTop: 18 };

export default function Step11Governance({ assessmentProfile, decisions, onUpdate }: Step11GovernanceProps) {
  const pending = decisions.filter(d => d.approvalStatus === "Pending").length;
  const escalated = decisions.filter(d => d.escalationRequired).length;
  const approved = decisions.filter(d => d.approvalStatus === "Approved").length;
  const further = decisions.filter(d => d.decision === "Treat Further").length;

  return (
    <section style={{ marginTop: 24, marginBottom: 24 }}>
      <div style={cardStyle}>
        <Kicker>STEP 11</Kicker>
        <h2 style={headingStyle}>Risk Governance & Approval</h2>
        <p style={paragraphStyle}>Centralise residual-risk ownership, approval, escalation and review requirements without duplicating the Step 9 decision record.</p>
        <Profile profile={assessmentProfile} />
        <div style={summaryGridStyle}>
          <Summary label="PENDING APPROVAL" value={pending} />
          <Summary label="ESCALATED" value={escalated} />
          <Summary label="APPROVED" value={approved} />
          <Summary label="TREAT FURTHER" value={further} />
        </div>
      </div>
      <div style={cardStyle}>
        {decisions.length === 0 ? <Empty /> : decisions.map(decision => <Decision key={decision.id} decision={decision} onUpdate={onUpdate} />)}
      </div>
    </section>
  );
}

function Kicker({ children }: { children: ReactNode }) { return <div style={kickerStyle}>{children}</div>; }
function Profile({ profile }: { profile: AssessmentProfile }) {
  return <div style={profileStyle}><strong style={{ color: "#0f172a" }}>{profile.organisationName}</strong>{" • "}{profile.assessmentName}{" • Assessment ID: "}{profile.assessmentId}</div>;
}
function Summary({ label, value }: { label: string; value: number }) {
  return <div style={{ padding: 18, borderRadius: 10, background: "#f8fafc", border: "1px solid #e2e8f0" }}><div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: 1 }}>{label}</div><div style={{ marginTop: 6, fontSize: 28, fontWeight: 800, color: "#0f172a" }}>{value}</div></div>;
}
function Empty() { return <div style={{ padding: 18, background: "#f8fafc", borderRadius: 10, color: "#64748b" }}>No residual-risk decisions are currently available.</div>; }

function Decision({ decision, onUpdate }: { decision: ResidualRiskDecisionRecord; onUpdate: (id: string, updates: Partial<ResidualRiskDecisionRecord>) => void }) {
  const d = decision;
  const updateText = (field: "accountableOwner" | "decisionAuthority" | "rationale", value: string, maxLength: number) => {
    onUpdate(d.id, { [field]: sanitizeInteractiveText(value, maxLength) } as Partial<ResidualRiskDecisionRecord>);
  };

  return <div style={{ border: "1px solid #e2e8f0", borderRadius: 12, padding: 22, marginBottom: 18 }}>
    <div style={{ display: "flex", justifyContent: "space-between", gap: 15, flexWrap: "wrap" }}>
      <div><div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", letterSpacing: 1 }}>{d.id}</div><h3 style={{ margin: "6px 0", color: "#0f172a" }}>{d.riskTitle}</h3><div style={{ fontSize: 13, color: "#475569" }}>{d.findingId} • {d.category}</div></div>
      <span style={{ padding: "6px 10px", borderRadius: 20, background: d.approvalStatus === "Approved" ? "#f0fdf4" : d.approvalStatus === "Rejected" ? "#fee2e2" : "#fffbeb", color: d.approvalStatus === "Approved" ? "#15803d" : d.approvalStatus === "Rejected" ? "#dc2626" : "#d97706", fontWeight: 700, fontSize: 12, height: "fit-content" }}>{d.approvalStatus}</span>
    </div>
    <div style={metaGridStyle}>
      <Meta label="Inherent risk" value={d.inherentRisk} /><Meta label="Residual risk" value={d.residualRisk} /><Meta label="Review frequency" value={d.reviewFrequency} /><Meta label="Treatment status" value={d.treatmentStatus} />
    </div>
    <div style={fieldGridStyle}>
      <Field label="Accountable owner"><input value={d.accountableOwner} maxLength={SECURITY_LIMITS.assessmentOwner} onChange={e => updateText("accountableOwner", e.target.value, SECURITY_LIMITS.assessmentOwner)} placeholder="DPO / Principal / Risk Owner" style={inputStyle} /></Field>
      <Field label="Decision authority"><input value={d.decisionAuthority} maxLength={SECURITY_LIMITS.assessmentOwner} onChange={e => updateText("decisionAuthority", e.target.value, SECURITY_LIMITS.assessmentOwner)} placeholder="Approving authority" style={inputStyle} /></Field>
      <Field label="Review date"><input type="date" value={d.reviewDate} onChange={e => onUpdate(d.id, { reviewDate: e.target.value })} style={inputStyle} /></Field>
      <Field label="Approval date"><input type="date" value={d.approvalDate} onChange={e => onUpdate(d.id, { approvalDate: e.target.value })} style={inputStyle} /></Field>
      <Field label="Next review date"><input type="date" value={d.nextReviewDate} onChange={e => onUpdate(d.id, { nextReviewDate: e.target.value })} style={inputStyle} /></Field>
      <Field label="Target resolution date"><input type="date" value={d.targetResolutionDate} onChange={e => onUpdate(d.id, { targetResolutionDate: e.target.value })} style={inputStyle} /></Field>
      <Field label="Approval status"><select value={d.approvalStatus} onChange={e => onUpdate(d.id, { approvalStatus: e.target.value as typeof d.approvalStatus })} style={inputStyle}><option value="Pending">Pending</option><option value="Approved">Approved</option><option value="Rejected">Rejected</option></select></Field>
    </div>
    <Field label="Decision rationale"><textarea value={d.rationale} maxLength={SECURITY_LIMITS.notes} onChange={e => updateText("rationale", e.target.value, SECURITY_LIMITS.notes)} rows={3} style={{ ...inputStyle, resize: "vertical" }} /></Field>
    {d.escalationRequired && <div style={{ marginTop: 14, padding: "12px 14px", background: "#fff7ed", border: "1px solid #fed7aa", borderRadius: 8, color: "#9a3412", fontSize: 13 }}><strong>Escalation required:</strong> {d.escalationReason || "Management review required."}</div>}
  </div>;
}
function Field({ label, children }: { label: string; children: ReactNode }) { return <div style={{ marginTop: 12 }}><label style={fieldLabelStyle}>{label}</label>{children}</div>; }
function Meta({ label, value }: { label: string; value: string }) { return <div style={{ padding: 12, background: "#f8fafc", borderRadius: 8 }}><div style={{ fontSize: 11, fontWeight: 700, color: "#64748b", textTransform: "uppercase", marginBottom: 5 }}>{label}</div><div style={{ fontSize: 14, fontWeight: 600, color: "#334155" }}>{String(value ?? "")}</div></div>; }