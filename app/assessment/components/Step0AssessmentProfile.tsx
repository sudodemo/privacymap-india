"use client";
import type { Dispatch, SetStateAction, ReactNode } from "react";
import type { AssessmentProfile } from "../types";

export interface Step0AssessmentProfileProps {
  profile: AssessmentProfile;
  setProfile: Dispatch<SetStateAction<AssessmentProfile>>;
}

const cardStyle = { background:"white", border:"1px solid #e2e8f0", borderRadius:"14px", padding:"28px", marginBottom:"20px" };
const inputStyle = { width:"100%", boxSizing:"border-box" as const, padding:"12px 14px", borderRadius:"8px", border:"1px solid #cbd5e1", background:"white", color:"#0f172a", fontSize:"14px" };
const labelStyle = { display:"block", fontWeight:700, color:"#0f172a", marginBottom:"7px", fontSize:"13px" };

function today() { const d=new Date(); return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}-${String(d.getDate()).padStart(2,"0")}`; }
function assessmentId() { const d=new Date(); const date=`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`; return `PMI-${date}-${Math.random().toString(36).slice(2,6).toUpperCase()}`; }

export function createDefaultAssessmentProfile(): AssessmentProfile {
  return { organisationName:"", assessmentName:"DPDP Privacy Assessment", assessmentOwner:"", assessmentId:assessmentId(), assessmentDate:today(), assessmentVersion:"1.0" };
}

export default function Step0AssessmentProfile({ profile, setProfile }: Step0AssessmentProfileProps) {
  return <section style={cardStyle}>
    <div style={{width:34,height:34,borderRadius:"50%",background:"#1d4ed8",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,marginBottom:16}}>0</div>
    <h2 style={{color:"#0f172a",marginTop:0,marginBottom:8}}>Assessment Profile</h2>
    <p style={{color:"#64748b",lineHeight:1.6,marginTop:0,marginBottom:22}}>Identify the organisation or school for this assessment. These details become the assessment identity and can later be reused for reports, remediation tracking and evidence closure.</p>
    <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:16}}>
      <Field label="Organisation / School Name *"><input value={profile.organisationName} onChange={e=>setProfile(c=>({...c,organisationName:e.target.value}))} placeholder="e.g. ABC International School" style={inputStyle}/></Field>
      <Field label="Assessment Name"><input value={profile.assessmentName} onChange={e=>setProfile(c=>({...c,assessmentName:e.target.value}))} placeholder="e.g. DPDP Privacy Assessment" style={inputStyle}/></Field>
      <Field label="Assessment Owner"><input value={profile.assessmentOwner} onChange={e=>setProfile(c=>({...c,assessmentOwner:e.target.value}))} placeholder="e.g. DPO / Principal / Privacy Lead" style={inputStyle}/></Field>
      <Field label="Assessment ID"><input value={profile.assessmentId} readOnly style={{...inputStyle,background:"#f8fafc"}}/></Field>
      <Field label="Assessment Date"><input type="date" value={profile.assessmentDate} onChange={e=>setProfile(c=>({...c,assessmentDate:e.target.value}))} style={inputStyle}/></Field>
      <Field label="Assessment Version"><input value={profile.assessmentVersion} readOnly style={{...inputStyle,background:"#f8fafc"}}/></Field>
    </div>
    {!profile.organisationName.trim() && <div style={{marginTop:16,padding:"12px 14px",background:"#fffbeb",border:"1px solid #fde68a",borderRadius:8,color:"#92400e",fontSize:13}}>Please enter the Organisation / School Name before running the privacy assessment.</div>}
  </section>;
}
function Field({label,children}:{label:string;children:ReactNode}) { return <div><label style={labelStyle}>{label}</label>{children}</div>; }
