import React from "react";
export interface Step4DataInventoryProps { businessTypeId:string; selectedEntryPoints:string[]; customEntryPoint:string; customEntryPoints:any[]; entryPoints:any[]; setCustomEntryPoint:(v:string)=>void; toggleEntryPoint:(id:string)=>void; addCustomEntryPoint:()=>void; removeCustomEntryPoint:(id:string)=>void; }
const cardStyle={background:"white",border:"1px solid #e2e8f0",borderRadius:"14px",padding:"28px",marginBottom:"20px"}; const headingStyle={color:"#0f172a",marginTop:0,marginBottom:"18px"}; const noticeStyle={color:"#64748b",lineHeight:1.6}; const removeButtonStyle={border:"none",background:"transparent",color:"#64748b",cursor:"pointer",fontSize:"13px"}; const StepNumber=({number}:{number:string})=><div style={{width:"34px",height:"34px",borderRadius:"50%",background:"#1d4ed8",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,marginBottom:"16px"}}>{number}</div>; const SelectionSummary=({count,label}:{count:number;label:string})=><div style={{marginTop:"24px",padding:"16px",background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:"10px",color:"#166534"}}><strong>{count} {label}{count!==1?"s":""} selected</strong></div>;
export default function Step4DataInventory({businessTypeId,selectedEntryPoints,customEntryPoint,customEntryPoints,entryPoints,setCustomEntryPoint,toggleEntryPoint,addCustomEntryPoint,removeCustomEntryPoint}:Step4DataInventoryProps){ return (
<>


        {businessTypeId ===
          "EDU-SCH" && (
          <section
            style={cardStyle}
          >
            <StepNumber number="4" />

            <h2
              style={headingStyle}
            >
              Potential data entry points
            </h2>

            <p
              style={{
                ...noticeStyle,
                marginBottom: "20px",
              }}
            >
              Select all channels
              through which your
              organisation may collect
              personal data.
            </p>

            <div
              style={{
                display: "grid",
                gridTemplateColumns:
                  "repeat(auto-fit, minmax(260px, 1fr))",
                gap: "12px",
              }}
            >
              {entryPoints.map(
                (entryPoint) => {
                  const isSelected =
                    selectedEntryPoints.includes(
                      entryPoint.id
                    );

                  return (
                    <label
                      key={
                        entryPoint.id
                      }
                      style={{
                        display:
                          "flex",
                        alignItems:
                          "flex-start",
                        gap: "12px",
                        padding:
                          "16px",
                        border:
                          isSelected
                            ? "2px solid #1d4ed8"
                            : "1px solid #e2e8f0",
                        borderRadius:
                          "10px",
                        background:
                          isSelected
                            ? "#eff6ff"
                            : "#f8fafc",
                        cursor:
                          "pointer",
                      }}
                    >
                      <input
                        type="checkbox"
                        checked={
                          isSelected
                        }
                        onChange={() =>
                          toggleEntryPoint(
                            entryPoint.id
                          )
                        }
                        style={{
                          marginTop:
                            "3px",
                          width:
                            "18px",
                          height:
                            "18px",
                        }}
                      />

                      <span>
                        <strong>
                          {
                            entryPoint.name
                          }
                        </strong>

                        <span
                          style={{
                            display:
                              "block",
                            fontSize:
                              "13px",
                            color:
                              "#64748b",
                            marginTop:
                              "5px",
                          }}
                        >
                          {
                            entryPoint.collection_method
                          }
                        </span>
                      </span>
                    </label>
                  );
                }
              )}
            </div>

            <div
              style={{
                marginTop: "24px",
                paddingTop: "20px",
                borderTop:
                  "1px solid #e2e8f0",
              }}
            >
              <h3
                style={{
                  color: "#0f172a",
                  fontSize: "17px",
                }}
              >
                Don't see your data
                entry point?
              </h3>

              <p
                style={
                  noticeStyle
                }
              >
                Add a custom channel
                used by your
                organisation.
              </p>

              <div
                style={{
                  display: "flex",
                  gap: "10px",
                  marginTop: "12px",
                  flexWrap:
                    "wrap",
                }}
              >
                <input
                  type="text"
                  value={
                    customEntryPoint
                  }
                  onChange={(event) =>
                    setCustomEntryPoint(
                      event.target.value
                    )
                  }
                  placeholder="e.g. Admission kiosk"
                  style={{
                    flex:
                      "1 1 300px",
                    padding:
                      "12px 14px",
                    borderRadius:
                      "8px",
                    border:
                      "1px solid #cbd5e1",
                    fontSize:
                      "15px",
                  }}
                />

                <button
                  type="button"
                  onClick={
                    addCustomEntryPoint
                  }
                  style={
                    secondaryButtonStyle
                  }
                >
                  Add
                </button>
              </div>

              {customEntryPoints.length >
                0 && (
                <div
                  style={{
                    marginTop:
                      "16px",
                  }}
                >
                  {customEntryPoints.map(
                    (
                      entryPoint
                    ) => (
                      <div
                        key={
                          entryPoint.id
                        }
                        style={{
                          display:
                            "flex",
                          alignItems:
                            "center",
                          justifyContent:
                            "space-between",
                          padding:
                            "12px 14px",
                          marginBottom:
                            "8px",
                          background:
                            "#f8fafc",
                          border:
                            "1px solid #e2e8f0",
                          borderRadius:
                            "8px",
                        }}
                      >
                        <strong>
                          {
                            entryPoint.name
                          }
                        </strong>

                        <button
                          type="button"
                          onClick={() =>
                            removeCustomEntryPoint(
                              entryPoint.id
                            )
                          }
                          style={
                            removeButtonStyle
                          }
                        >
                          Remove
                        </button>
                      </div>
                    )
                  )}
                </div>
              )}
            </div>

            {(selectedEntryPoints.length >
              0 ||
              customEntryPoints.length >
                0) && (
              <SelectionSummary
                count={
                  selectedEntryPoints.length +
                  customEntryPoints.length
                }
                label="data entry point"
              />
            )}
          </section>
        )}

</>
);
}
