import React from "react";
export interface Step2DataInventoryProps { industryId:string; businessTypeId:string; setBusinessTypeId:(value:string)=>void; businessTypes:any[]; resetFromBusinessType:()=>void; }
const cardStyle={background:"white",border:"1px solid #e2e8f0",borderRadius:"14px",padding:"28px",marginBottom:"20px"}; const headingStyle={color:"#0f172a",marginTop:0,marginBottom:"18px"}; const selectStyle={width:"100%",padding:"13px 14px",borderRadius:"8px",border:"1px solid #cbd5e1",background:"white",fontSize:"16px",color:"#0f172a"}; const noticeStyle={color:"#64748b",lineHeight:1.6}; const StepNumber=({number}:{number:string})=><div style={{width:"34px",height:"34px",borderRadius:"50%",background:"#1d4ed8",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,marginBottom:"16px"}}>{number}</div>;
export default function Step2DataInventory({industryId,businessTypeId,setBusinessTypeId,businessTypes,resetFromBusinessType}:Step2DataInventoryProps){ return (
<>


        {industryId && (
          <section
            style={cardStyle}
          >
            <StepNumber number="2" />

            <h2
              style={headingStyle}
            >
              Select your business type
            </h2>

            <select
              value={businessTypeId}
              onChange={(event) => {
                setBusinessTypeId(
                  event.target.value
                );
                resetFromBusinessType();
              }}
              style={selectStyle}
            >
              <option value="">
                Select business type...
              </option>

              {businessTypes.map(
                (businessType) => (
                  <option
                    key={
                      businessType.id
                    }
                    value={
                      businessType.id
                    }
                  >
                    {
                      businessType.name
                    }
                  </option>
                )
              )}
            </select>

            {businessTypes.length ===
              0 && (
              <p
                style={
                  noticeStyle
                }
              >
                A detailed assessment
                pack for this business
                type is not available
                yet. More sector packs
                will be added
                progressively.
              </p>
            )}
          </section>
        )}

</>
);
}
