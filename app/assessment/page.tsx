"use client";

import { useEffect, useMemo, useState, type Dispatch, type SetStateAction } from "react";
import { getBusinessTypes, getSchoolEntryPoints, kb } from "../../lib/kb";
import { calculatePrivacyRisk, type RiskResult } from "./lib/riskEngine";
import { generateRiskTreatmentPlan, type RiskTreatmentAction, type TreatmentStatus } from "./lib/remediationEngine";
import { generateResidualRiskAssessment, generateResidualRiskSummary, type ResidualRiskAssessment, type ResidualRiskSummary } from "../../lib/residualRisk";
import { defaultResidualRiskDecision, defaultDecisionRationale, decisionRequiresApproval, type ResidualRiskDecision, type ResidualRiskDecisionRecord } from "./lib/governanceEngine";

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

function buildResidualRiskDecisions(residualRisks: ResidualRiskAssessment[], treatmentActions: RiskTreatmentAction[]): ResidualRiskDecisionRecord[] {
  return residualRisks.map(risk => {
    const residualRisk = risk.residualRisk;
    const decision = defaultResidualRiskDecision(residualRisk);
    const requiresApproval = decisionRequiresApproval(decision, residualRisk);
    const action = treatmentActions.find(a => a.riskTitle === risk.riskTitle && a.category === risk.category);
    return {
      id: `DEC-${risk.findingId ?? risk.id}`,
      findingId: risk.findingId ?? risk.id,
      riskTitle: risk.riskTitle,
      category: risk.category,
      inherentRisk: risk.inherentRisk,
      residualRisk,
      decision,
      rationale: defaultDecisionRationale(decision, residualRisk),
      accountableOwner: "",
      decisionAuthority: "",
      reviewDate: "",
      approvalDate: "",
      nextReviewDate: "",
      targetResolutionDate: "",
      approvalStatus: requiresApproval ? "Pending" : "Approved",
      reviewFrequency: residualRisk === "Critical" ? "Monthly" : residualRisk === "High" ? "Quarterly" : "Annual",
      escalationRequired: residualRisk === "Critical" || residualRisk === "High",
      escalationReason: residualRisk === "Critical" || residualRisk === "High" ? "Residual risk requires management-level review and explicit approval." : "",
      treatmentStatus: action?.status ?? (decision === "Accept" ? "Accepted" : "Open"),
    };
  });
}

const cardStyle = { background: "white", border: "1px solid #e2e8f0", borderRadius: "14px", padding: "28px", marginBottom: "20px" };
const headingStyle = { color: "#0f172a", marginTop: 0, marginBottom: "18px" };
const noticeStyle = { color: "#64748b", lineHeight: 1.6 };

export default function AssessmentPage() {
  const [industryId, setIndustryId] = useState("");
  const [businessTypeId, setBusinessTypeId] = useState("");
  const [processId, setProcessId] = useState("");
  const [selectedEntryPoints, setSelectedEntryPoints] = useState<string[]>([]);
  const [customEntryPoint, setCustomEntryPoint] = useState("");
  const [customEntryPoints, setCustomEntryPoints] = useState<{id:string;name:string;collection_method:string;custom:boolean}[]>([]);
  const [selectedFields, setSelectedFields] = useState<string[]>([]);
  const [customField, setCustomField] = useState("");
  const [customFields, setCustomFields] = useState<{id:string;name:string;custom:boolean}[]>([]);
  const [collectorRoles,setCollectorRoles]=useState<string[]>([]); const [dataSubjectTypes,setDataSubjectTypes]=useState<string[]>([]); const [collectionFormats,setCollectionFormats]=useState<string[]>([]); const [storageLocations,setStorageLocations]=useState<string[]>([]); const [storageEnvironments,setStorageEnvironments]=useState<string[]>([]); const [encryptionStatuses,setEncryptionStatuses]=useState<string[]>([]); const [accessRoles,setAccessRoles]=useState<string[]>([]); const [sharingStatuses,setSharingStatuses]=useState<string[]>([]); const [retentionPeriods,setRetentionPeriods]=useState<string[]>([]); const [deletionMethods,setDeletionMethods]=useState<string[]>([]); const [privacyNotices,setPrivacyNotices]=useState<string[]>([]); const [consentStatuses,setConsentStatuses]=useState<string[]>([]); const [parentalConsentStatuses,setParentalConsentStatuses]=useState<string[]>([]); const [crossBorderTransfers,setCrossBorderTransfers]=useState<string[]>([]);
  const [riskResult,setRiskResult]=useState<RiskResult|null>(null);
  const [treatmentActions,setTreatmentActions]=useState<RiskTreatmentAction[]>([]);
  const [residualRiskDecisions,setResidualRiskDecisions]=useState<ResidualRiskDecisionRecord[]>([]);

  const businessTypes=useMemo(()=>industryId?getBusinessTypes(industryId).filter(x=>x.status==="active"):[],[industryId]);
  const processes=useMemo(()=>businessTypeId==="EDU-SCH"?kb.processes:[],[businessTypeId]);
  const entryPoints=useMemo(()=>businessTypeId==="EDU-SCH"?getSchoolEntryPoints(processId||undefined):[],[businessTypeId,processId]);
  const treatmentPlan=useMemo(()=>riskResult?generateRiskTreatmentPlan(riskResult):[],[riskResult]);
  const residualRiskAssessments=useMemo<ResidualRiskAssessment[]>(()=>riskResult&&treatmentActions.length?generateResidualRiskAssessment(riskResult,treatmentActions):[],[riskResult,treatmentActions]);
  const residualRiskSummary=useMemo<ResidualRiskSummary|null>(()=>residualRiskAssessments.length?generateResidualRiskSummary(residualRiskAssessments):null,[residualRiskAssessments]);

  useEffect(()=>{ setTreatmentActions(treatmentPlan); },[treatmentPlan]);
  useEffect(()=>{ if(!residualRiskAssessments.length){setResidualRiskDecisions([]);return;} setResidualRiskDecisions(current=>{const byFinding=new Map(current.map(x=>[x.findingId,x])); const generated=buildResidualRiskDecisions(residualRiskAssessments,treatmentActions); return generated.map(next=>{const existing=byFinding.get(next.findingId); return existing?{...next,...existing,riskTitle:next.riskTitle,category:next.category,inherentRisk:next.inherentRisk,residualRisk:next.residualRisk,treatmentStatus: next.treatmentStatus}:{...next};});}); },[residualRiskAssessments,treatmentActions]);

  function toggleArrayValue(value:string,setter:Dispatch<SetStateAction<string[]>>){setter(current=>current.includes(value)?current.filter(x=>x!==value):[...current,value]);}
  function toggleEntryPoint(id:string){setSelectedEntryPoints(c=>c.includes(id)?c.filter(x=>x!==id):[...c,id]);}
  function addCustomEntryPoint(){const name=customEntryPoint.trim();if(!name)return;setCustomEntryPoints(c=>[...c,{id:`CUSTOM-${Date.now()}`,name,collection_method:"Custom",custom:true}]);setCustomEntryPoint("");}
  function removeCustomEntryPoint(id:string){setCustomEntryPoints(c=>c.filter(x=>x.id!==id));}
  function toggleField(id:string){setSelectedFields(c=>c.includes(id)?c.filter(x=>x!==id):[...c,id]);}
  function addCustomField(){const name=customField.trim();if(!name)return;setCustomFields(c=>[...c,{id:`CUSTOM-FIELD-${Date.now()}`,name,custom:true}]);setCustomField("");}
  function removeCustomField(id:string){setCustomFields(c=>c.filter(x=>x.id!==id));}

  function clearRiskOutputs(){setRiskResult(null);setTreatmentActions([]);setResidualRiskDecisions([]);}
  function resetAssessment(){setBusinessTypeId("");setProcessId("");setSelectedEntryPoints([]);setCustomEntryPoints([]);setCustomEntryPoint("");setSelectedFields([]);setCustomFields([]);setCustomField("");setCollectorRoles([]);setDataSubjectTypes([]);setCollectionFormats([]);setStorageLocations([]);setStorageEnvironments([]);setEncryptionStatuses([]);setAccessRoles([]);setSharingStatuses([]);setRetentionPeriods([]);setDeletionMethods([]);setPrivacyNotices([]);setConsentStatuses([]);setParentalConsentStatuses([]);setCrossBorderTransfers([]);clearRiskOutputs();}
  function resetFromBusinessType(){setProcessId("");setSelectedEntryPoints([]);setCustomEntryPoints([]);setCustomEntryPoint("");setSelectedFields([]);setCustomFields([]);setCustomField("");setCollectorRoles([]);setDataSubjectTypes([]);setCollectionFormats([]);setStorageLocations([]);setStorageEnvironments([]);setEncryptionStatuses([]);setAccessRoles([]);setSharingStatuses([]);setRetentionPeriods([]);setDeletionMethods([]);setPrivacyNotices([]);setConsentStatuses([]);setParentalConsentStatuses([]);setCrossBorderTransfers([]);clearRiskOutputs();}
  function resetFromProcess(){setSelectedEntryPoints([]);setCustomEntryPoints([]);setCustomEntryPoint("");setSelectedFields([]);setCustomFields([]);setCustomField("");setCollectorRoles([]);setDataSubjectTypes([]);setCollectionFormats([]);setStorageLocations([]);setStorageEnvironments([]);setEncryptionStatuses([]);setAccessRoles([]);setSharingStatuses([]);setRetentionPeriods([]);setDeletionMethods([]);setPrivacyNotices([]);setConsentStatuses([]);setParentalConsentStatuses([]);setCrossBorderTransfers([]);clearRiskOutputs();}
  function runPrivacyRiskAssessment(){const result=calculatePrivacyRisk({selectedEntryPoints,customEntryPoints,selectedFields,customFields,collectorRoles,dataSubjectTypes,collectionFormats,storageLocations,storageEnvironments,encryptionStatuses,accessRoles,sharingStatuses,retentionPeriods,deletionMethods,privacyNotices,consentStatuses,parentalConsentStatuses,crossBorderTransfers});setRiskResult(result);setResidualRiskDecisions([]);setTimeout(()=>document.getElementById("privacy-risk-result")?.scrollIntoView({behavior:"smooth",block:"start"}),100);}
  function updateTreatmentStatusGlobally(sourceId:string,status:TreatmentStatus){const action=treatmentActions.find(a=>a.id===sourceId);setTreatmentActions(current=>current.map(a=>a.id===sourceId?{...a,status}:a));if(action){setResidualRiskDecisions(current=>current.map(d=>d.riskTitle===action.riskTitle&&d.category===action.category?{...d,treatmentStatus:status}:d));}else{setResidualRiskDecisions(current=>current.map(d=>d.findingId===sourceId?{...d,treatmentStatus:status}:d));}}
  function updateDecision(id:string,updates:Partial<ResidualRiskDecisionRecord>){setResidualRiskDecisions(current=>current.map(d=>d.id===id?{...d,...updates}:d));}

  return <main style={{minHeight:"100vh",background:"#f8fafc",padding:"60px 24px",fontFamily:"Arial, Helvetica, sans-serif"}}><div style={{maxWidth:"900px",margin:"0 auto"}}>
    <p style={{fontSize:13,fontWeight:700,letterSpacing:3,color:"#1d4ed8"}}>PRIVACYMAP INDIA</p><h1 style={{fontSize:42,color:"#0f172a",marginBottom:12}}>Privacy Assessment</h1><p style={{color:"#475569",fontSize:18,lineHeight:1.6,marginBottom:40}}>Identify where personal data enters your organisation, what information is collected, how it is handled and where privacy risks may exist.</p>
    <Step1BusinessContext industryId={industryId} setIndustryId={v=>{setIndustryId(v);resetAssessment();}} resetAssessment={resetAssessment}/>
    {industryId&&<Step2DataInventory industryId={industryId} businessTypeId={businessTypeId} setBusinessTypeId={setBusinessTypeId} businessTypes={businessTypes} resetFromBusinessType={resetFromBusinessType}/>} 
    {businessTypeId==="EDU-SCH"&&<Step3Processing businessTypeId={businessTypeId} processId={processId} setProcessId={setProcessId} processes={processes} resetFromProcess={resetFromProcess}/>} 
    {businessTypeId==="EDU-SCH"&&<Step4DataInventory businessTypeId={businessTypeId} selectedEntryPoints={selectedEntryPoints} customEntryPoint={customEntryPoint} customEntryPoints={customEntryPoints} entryPoints={entryPoints} setCustomEntryPoint={setCustomEntryPoint} toggleEntryPoint={toggleEntryPoint} addCustomEntryPoint={addCustomEntryPoint} removeCustomEntryPoint={removeCustomEntryPoint}/>} 
    {businessTypeId==="EDU-SCH"&&(selectedEntryPoints.length>0||customEntryPoints.length>0)&&<Step5Processing businessTypeId={businessTypeId} selectedEntryPoints={selectedEntryPoints} customEntryPoints={customEntryPoints} selectedFields={selectedFields} customField={customField} customFields={customFields} setCustomField={setCustomField} toggleField={toggleField} addCustomField={addCustomField} removeCustomField={removeCustomField}/>} 
    {businessTypeId==="EDU-SCH"&&selectedFields.length>0&&<Step6DataSubjects businessTypeId={businessTypeId} selectedFields={selectedFields} {...{collectorRoles,dataSubjectTypes,collectionFormats,storageLocations,storageEnvironments,encryptionStatuses,accessRoles,sharingStatuses,retentionPeriods,deletionMethods,privacyNotices,consentStatuses,parentalConsentStatuses,crossBorderTransfers,setCollectorRoles,setDataSubjectTypes,setCollectionFormats,setStorageLocations,setStorageEnvironments,setEncryptionStatuses,setAccessRoles,setSharingStatuses,setRetentionPeriods,setDeletionMethods,setPrivacyNotices,setConsentStatuses,setParentalConsentStatuses,setCrossBorderTransfers,toggleArrayValue}}/>}
    {businessTypeId==="EDU-SCH"&&selectedFields.length>0&&<section style={cardStyle}><div style={{width:34,height:34,borderRadius:"50%",background:"#1d4ed8",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,marginBottom:16}}>7</div><h2 style={headingStyle}>Privacy Risk Assessment</h2><p style={{...noticeStyle,marginBottom:24}}>PrivacyMap will analyse the information entered above and identify potential privacy, security and governance risks.</p><div style={{padding:20,background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:12,marginBottom:20,color:"#1e3a8a",lineHeight:1.6}}><strong>Important:</strong> This is a preliminary privacy-risk assessment based on the information provided. It is not a legal opinion or a determination of DPDPA compliance.</div><button type="button" onClick={runPrivacyRiskAssessment} style={{width:"100%",padding:16,border:"none",borderRadius:10,background:"#1d4ed8",color:"white",fontSize:17,fontWeight:700,cursor:"pointer"}}>Analyse Privacy Risks</button></section>}
    {riskResult&&<div id="privacy-risk-result"><Step7Findings result={riskResult}/></div>}
    {riskResult&&treatmentPlan.length>0&&<Step8Remediation actions={treatmentActions} onStatusChange={updateTreatmentStatusGlobally}/>} 
    {riskResult&&treatmentPlan.length>0&&residualRiskAssessments.length>0&&<Step9ResidualRisk assessments={residualRiskAssessments} summary={residualRiskSummary} decisions={residualRiskDecisions} setDecisions={setResidualRiskDecisions} onTreatmentStatusChange={updateTreatmentStatusGlobally}/>} 
    {riskResult&&<Step10DPDPMapping result={riskResult} dataSubjectTypes={dataSubjectTypes} encryptionStatuses={encryptionStatuses} retentionPeriods={retentionPeriods} deletionMethods={deletionMethods} privacyNotices={privacyNotices} consentStatuses={consentStatuses} parentalConsentStatuses={parentalConsentStatuses} crossBorderTransfers={crossBorderTransfers} treatmentActions={treatmentActions}/>} 
    {riskResult&&<Step11Governance decisions={residualRiskDecisions} onUpdate={updateDecision}/>} 
    {riskResult&&<Step12RemediationTracker actions={treatmentActions} onStatusChange={updateTreatmentStatusGlobally}/>} 
    {riskResult&&<Step13EvidenceClosure actions={treatmentActions} decisions={residualRiskDecisions}/>} 
    <div style={{marginTop:32,padding:"18px 20px",background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:10,color:"#1e3a8a",lineHeight:1.6}}><strong>Privacy-by-design:</strong> PrivacyMap does not require your customers' personal data. Assessment responses remain in your browser and are used locally to generate assessment results and reports.</div>
  </div></main>;
}
