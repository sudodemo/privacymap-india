import React from "react";
import type { ResidualRiskDecisionRecord, DecisionApprovalStatus, ReviewFrequency } from "../../../lib/residualDecision";
import { riskBackground, riskColor, approvalBackground, approvalColor, treatmentStatusBackground, treatmentStatusColor, GovernanceSummaryCard, GovernanceField } from "./shared";

export default function Step11Governance({ decisions, onUpdate }: { decisions: ResidualRiskDecisionRecord[]; onUpdate: (id:string, updates:Partial<ResidualRiskDecisionRecord>)=>void }) {
  const pending=decisions.filter(d=>d.approvalStatus==="Pending").length;
  const escalated=decisions.filter(d=>d.escalationRequired).length;
  const approved=decisions.filter(d=>d.approvalStatus==="Approved").length;
  const treatment=decisions.filter(d=>d.decision==="Treat Further").length;
  return <section style={{marginTop:"24px",marginBottom:"24px"}}>
    <div style={{background:"white",border:"1px solid #e2e8f0",borderRadius:"14px",padding:"28px"}}>
      <div style={{fontSize:"13px",fontWeight:700,letterSpacing:"2px",color:"#1d4ed8"}}>STEP 11</div>
      <h2 style={{marginTop:8,color:"#0f172a"}}>Risk Governance & Approval</h2>
      <p style={{color:"#64748b",lineHeight:1.6,maxWidth:"760px"}}>Centralise residual-risk ownership, approval, escalation and review requirements without duplicating the Step 9 decision record.</p>
      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(180px,1fr))",gap:"12px",marginTop:"24px"}}>
        <GovernanceSummaryCard label="PENDING APPROVAL" value={pending} level={pending?"High":"Low"}/>
        <GovernanceSummaryCard label="ESCALATED" value={escalated} level={escalated?"High":"Low"}/>
        <GovernanceSummaryCard label="APPROVED" value={approved} level="Low"/>
        <GovernanceSummaryCard label="TREAT FURTHER" value={treatment} level={treatment?"Medium":"Low"}/>
      </div>
    </div>
    <div style={{marginTop:"16px",background:"white",border:"1px solid #e2e8f0",borderRadius:"14px",padding:"28px"}}>
      {decisions.length===0 ? <p style={{color:"#64748b"}}>Governance records will appear after a risk assessment is completed.</p> : decisions.map(d=><div key={d.id} style={{border:"1px solid #e2e8f0",borderRadius:"12px",padding:"20px",marginBottom:"16px"}}>
        <div style={{display:"flex",justifyContent:"space-between",gap:"12px",flexWrap:"wrap"}}>
          <div><div style={{fontSize:"11px",fontWeight:700,color:"#64748b"}}>{d.findingId}</div><h3 style={{margin:"6px 0",color:"#0f172a"}}>{d.riskTitle}</h3></div>
          <div style={{display:"flex",gap:"8px",flexWrap:"wrap"}}><span style={{padding:"6px 10px",borderRadius:"20px",background:riskBackground(d.residualRisk),color:riskColor(d.residualRisk),fontWeight:700,fontSize:"12px"}}>Residual: {d.residualRisk}</span><span style={{padding:"6px 10px",borderRadius:"20px",background:approvalBackground(d.approvalStatus),color:approvalColor(d.approvalStatus),fontWeight:700,fontSize:"12px"}}>{d.approvalStatus}</span><span style={{padding:"6px 10px",borderRadius:"20px",background:treatmentStatusBackground(d.treatmentStatus),color:treatmentStatusColor(d.treatmentStatus),fontWeight:700,fontSize:"12px"}}>{d.treatmentStatus}</span></div>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:"12px",marginTop:"18px"}}>
          <GovernanceField label="Accountable Owner" value={d.accountableOwner} onChange={v=>onUpdate(d.id,{accountableOwner:v})}/>
          <GovernanceField label="Decision Authority" value={d.decisionAuthority} onChange={v=>onUpdate(d.id,{decisionAuthority:v})}/>
          <GovernanceField label="Review Date" value={d.reviewDate} type="date" onChange={v=>onUpdate(d.id,{reviewDate:v})}/>
          <GovernanceField label="Approval Date" value={d.approvalDate} type="date" onChange={v=>onUpdate(d.id,{approvalDate:v})}/>
          <GovernanceField label="Next Review Date" value={d.nextReviewDate} type="date" onChange={v=>onUpdate(d.id,{nextReviewDate:v})}/>
          <GovernanceField label="Target Resolution Date" value={d.targetResolutionDate} type="date" onChange={v=>onUpdate(d.id,{targetResolutionDate:v})}/>
        </div>
        <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(220px,1fr))",gap:"12px",marginTop:"12px"}}>
          <div><label style={{display:"block",fontWeight:700,color:"#0f172a",marginBottom:8}}>Approval Status</label><select value={d.approvalStatus} onChange={e=>onUpdate(d.id,{approvalStatus:e.target.value as DecisionApprovalStatus})} style={{width:"100%",padding:"11px 12px",border:"1px solid #cbd5e1",borderRadius:8}}><option>Pending</option><option>Approved</option><option>Rejected</option></select></div>
          <div><label style={{display:"block",fontWeight:700,color:"#0f172a",marginBottom:8}}>Review Frequency</label><select value={d.reviewFrequency} onChange={e=>onUpdate(d.id,{reviewFrequency:e.target.value as ReviewFrequency})} style={{width:"100%",padding:"11px 12px",border:"1px solid #cbd5e1",borderRadius:8}}><option>Monthly</option><option>Quarterly</option><option>Half-yearly</option><option>Annual</option><option>Event-driven</option></select></div>
        </div>
        <div style={{marginTop:14}}><label style={{display:"block",fontWeight:700,color:"#0f172a",marginBottom:8}}>Decision Rationale</label><textarea rows={3} value={d.rationale} onChange={e=>onUpdate(d.id,{rationale:e.target.value})} style={{width:"100%",boxSizing:"border-box",padding:"12px 14px",border:"1px solid #cbd5e1",borderRadius:8,resize:"vertical"}}/></div>
        <label style={{display:"flex",alignItems:"center",gap:8,marginTop:14,fontWeight:600,color:"#334155"}}><input type="checkbox" checked={d.escalationRequired} onChange={e=>onUpdate(d.id,{escalationRequired:e.target.checked})}/> Escalation required</label>
        {d.escalationRequired&&<div style={{marginTop:12}}><label style={{display:"block",fontWeight:700,color:"#0f172a",marginBottom:8}}>Escalation Reason</label><textarea rows={2} value={d.escalationReason} onChange={e=>onUpdate(d.id,{escalationReason:e.target.value})} style={{width:"100%",boxSizing:"border-box",padding:"12px 14px",border:"1px solid #cbd5e1",borderRadius:8,resize:"vertical"}}/></div>}
      </div>)}
    </div>
  </section>;
}
