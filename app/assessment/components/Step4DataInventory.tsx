import React from "react";
import { getG10CollectionChannels } from "../lib/g10Taxonomy";

export interface Step4DataInventoryProps {
  businessTypeId: string;
  selectedEntryPoints: string[];
  customEntryPoint: string;
  customEntryPoints: any[];
  entryPoints: any[];
  setCustomEntryPoint: (v: string) => void;
  toggleEntryPoint: (id: string) => void;
  addCustomEntryPoint: () => void;
  removeCustomEntryPoint: (id: string) => void;
}

const cardStyle={background:"white",border:"1px solid #e2e8f0",borderRadius:"14px",padding:"28px",marginBottom:"20px"};
const headingStyle={color:"#0f172a",marginTop:0,marginBottom:"18px"};
const noticeStyle={color:"#64748b",lineHeight:1.6};
const removeButtonStyle={border:"none",background:"transparent",color:"#64748b",cursor:"pointer",fontSize:"13px"};
const secondaryButtonStyle={padding:"12px 18px",borderRadius:"8px",border:"none",background:"#0f172a",color:"white",fontWeight:600,cursor:"pointer"};
const StepNumber=({number}:{number:string})=><div style={{width:"34px",height:"34px",borderRadius:"50%",background:"#1d4ed8",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,marginBottom:"16px"}}>{number}</div>;

export default function Step4DataInventory({businessTypeId,selectedEntryPoints,customEntryPoint,customEntryPoints,entryPoints,setCustomEntryPoint,toggleEntryPoint,addCustomEntryPoint,removeCustomEntryPoint}:Step4DataInventoryProps){
  const availableChannels = entryPoints.length ? entryPoints : getG10CollectionChannels().map((item)=>({id:item.id,name:item.name,collection_method:item.description,custom:false}));
  if (!businessTypeId) return null;
  const aiSelected = selectedEntryPoints.includes("AI");

  return (
    <section style={cardStyle}>
      <StepNumber number="4" />
      <h2 style={headingStyle}>Where does personal data enter your organisation?</h2>
      <p style={{...noticeStyle,marginBottom:"20px"}}>
        Select all collection channels that apply. Messaging apps are grouped together rather than split into separate WhatsApp, Telegram or Signal fields.
      </p>

      <div style={{display:"grid",gridTemplateColumns:"repeat(auto-fit,minmax(260px,1fr))",gap:"12px"}}>
        {availableChannels.map((entryPoint)=>{
          const isSelected=selectedEntryPoints.includes(entryPoint.id);
          return <label key={entryPoint.id} style={{display:"flex",alignItems:"flex-start",gap:"12px",padding:"16px",border:isSelected?"2px solid #1d4ed8":"1px solid #e2e8f0",borderRadius:"10px",background:isSelected?"#eff6ff":"#f8fafc",cursor:"pointer"}}>
            <input type="checkbox" checked={isSelected} onChange={()=>toggleEntryPoint(entryPoint.id)} style={{marginTop:"3px",width:"18px",height:"18px"}} />
            <span><strong>{entryPoint.name}</strong><span style={{display:"block",fontSize:"13px",color:"#64748b",marginTop:"5px"}}>{entryPoint.collection_method}</span></span>
          </label>;
        })}
      </div>

      {aiSelected && <div style={{marginTop:"16px",padding:"14px 16px",background:"#eff6ff",border:"1px solid #bfdbfe",borderRadius:"10px",color:"#1e3a8a",fontSize:"13px",lineHeight:1.6}}>
        <strong>AI prompts / AI assistants</strong><br />
        If you use a specific AI tool, you can add its name below as optional detail. PrivacyMap does not connect to or send assessment data to that AI service.
      </div>}

      <div style={{marginTop:"24px",paddingTop:"20px",borderTop:"1px solid #e2e8f0"}}>
        <h3 style={{color:"#0f172a",fontSize:"17px"}}>Add an optional platform or custom channel</h3>
        <p style={noticeStyle}>For example, add the AI assistant or a specific messaging platform used by your organisation.</p>
        <div style={{display:"flex",gap:"10px",marginTop:"12px",flexWrap:"wrap"}}>
          <input type="text" value={customEntryPoint} onChange={(event)=>setCustomEntryPoint(event.target.value)} placeholder="e.g. ChatGPT, Telegram, admission kiosk" style={{flex:"1 1 300px",padding:"12px 14px",borderRadius:"8px",border:"1px solid #cbd5e1",fontSize:"15px"}} />
          <button type="button" onClick={addCustomEntryPoint} style={secondaryButtonStyle}>Add</button>
        </div>
        {customEntryPoints.length>0 && <div style={{marginTop:"16px"}}>{customEntryPoints.map((entryPoint)=><div key={entryPoint.id} style={{display:"flex",alignItems:"center",justifyContent:"space-between",padding:"12px 14px",marginBottom:"8px",background:"#f8fafc",border:"1px solid #e2e8f0",borderRadius:"8px"}}><strong>{entryPoint.name}</strong><button type="button" onClick={()=>removeCustomEntryPoint(entryPoint.id)} style={removeButtonStyle}>Remove</button></div>)}</div>}
      </div>

      {(selectedEntryPoints.length>0||customEntryPoints.length>0)&&<div style={{marginTop:"24px",padding:"16px",background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:"10px",color:"#166534"}}><strong>{selectedEntryPoints.length+customEntryPoints.length} collection channel{selectedEntryPoints.length+customEntryPoints.length!==1?"s":""} selected</strong></div>}
    </section>
  );
}
