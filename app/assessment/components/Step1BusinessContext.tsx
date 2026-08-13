import React from "react";
export interface Step1BusinessContextProps { industryId:string; setIndustryId:(value:string)=>void; resetAssessment:()=>void; }
const cardStyle={background:"white",border:"1px solid #e2e8f0",borderRadius:"14px",padding:"28px",marginBottom:"20px"}; const headingStyle={color:"#0f172a",marginTop:0,marginBottom:"18px"}; const selectStyle={width:"100%",padding:"13px 14px",borderRadius:"8px",border:"1px solid #cbd5e1",background:"white",fontSize:"16px",color:"#0f172a"}; const StepNumber=({number}:{number:string})=><div style={{width:"34px",height:"34px",borderRadius:"50%",background:"#1d4ed8",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,marginBottom:"16px"}}>{number}</div>;
export default function Step1BusinessContext({industryId,setIndustryId,resetAssessment}:Step1BusinessContextProps){ return (
<>


        <section style={cardStyle}>
          <StepNumber number="1" />

          <h2 style={headingStyle}>
            Select your industry
          </h2>

          <select
            value={industryId}
            onChange={(event) => {
              setIndustryId(
                event.target.value
              );
              resetAssessment();
            }}
            style={selectStyle}
          >
            <option value="">
              Select industry...
            </option>

            {kb.industries
              .filter(
                (item) =>
                  item.status ===
                  "active"
              )
              .map((industry) => (
                <option
                  key={industry.id}
                  value={industry.id}
                >
                  {industry.name}
                </option>
              ))}
          </select>
        </section>

</>
);
}
