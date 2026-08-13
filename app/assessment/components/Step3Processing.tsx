import React from "react";
export interface Step3ProcessingProps { businessTypeId:string; processId:string; setProcessId:(value:string)=>void; processes:any[]; resetFromProcess:()=>void; }
const cardStyle={background:"white",border:"1px solid #e2e8f0",borderRadius:"14px",padding:"28px",marginBottom:"20px"}; const headingStyle={color:"#0f172a",marginTop:0,marginBottom:"18px"}; const selectStyle={width:"100%",padding:"13px 14px",borderRadius:"8px",border:"1px solid #cbd5e1",background:"white",fontSize:"16px",color:"#0f172a"}; const StepNumber=({number}:{number:string})=><div style={{width:"34px",height:"34px",borderRadius:"50%",background:"#1d4ed8",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,marginBottom:"16px"}}>{number}</div>;
export default function Step3Processing({businessTypeId,processId,setProcessId,processes,resetFromProcess}:Step3ProcessingProps){ return (
<>


        {businessTypeId ===
          "EDU-SCH" && (
          <section
            style={cardStyle}
          >
            <StepNumber number="3" />

            <h2
              style={headingStyle}
            >
              Select a business process
            </h2>

            <select
              value={processId}
              onChange={(event) => {
                setProcessId(
                  event.target.value
                );
                resetFromProcess();
              }}
              style={selectStyle}
            >
              <option value="">
                All school processes...
              </option>

              {processes.map(
                (process) => (
                  <option
                    key={process.id}
                    value={process.id}
                  >
                    {process.name}
                  </option>
                )
              )}
            </select>
          </section>
        )}

</>
);
}
