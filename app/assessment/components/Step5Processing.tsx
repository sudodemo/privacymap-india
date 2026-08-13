import React from "react";
import { kb } from "../../../lib/kb";
export interface Step5ProcessingProps { businessTypeId:string; selectedEntryPoints:string[]; customEntryPoints:any[]; selectedFields:string[]; customField:string; customFields:any[]; setCustomField:(v:string)=>void; toggleField:(id:string)=>void; addCustomField:()=>void; removeCustomField:(id:string)=>void; }
const cardStyle={background:"white",border:"1px solid #e2e8f0",borderRadius:"14px",padding:"28px",marginBottom:"20px"}; const headingStyle={color:"#0f172a",marginTop:0,marginBottom:"18px"}; const noticeStyle={color:"#64748b",lineHeight:1.6}; const removeButtonStyle={border:"none",background:"transparent",color:"#64748b",cursor:"pointer",fontSize:"13px"}; const StepNumber=({number}:{number:string})=><div style={{width:"34px",height:"34px",borderRadius:"50%",background:"#1d4ed8",color:"white",display:"flex",alignItems:"center",justifyContent:"center",fontWeight:700,marginBottom:"16px"}}>{number}</div>; const SelectionSummary=({count,label}:{count:number;label:string})=><div style={{marginTop:"24px",padding:"16px",background:"#f0fdf4",border:"1px solid #bbf7d0",borderRadius:"10px",color:"#166534"}}><strong>{count} {label}{count!==1?"s":""} selected</strong></div>;
export default function Step5Processing({businessTypeId,selectedEntryPoints,customEntryPoints,selectedFields,customField,customFields,setCustomField,toggleField,addCustomField,removeCustomField}:Step5ProcessingProps){ return (
<>


        {businessTypeId ===
          "EDU-SCH" &&
          (selectedEntryPoints.length >
            0 ||
            customEntryPoints.length >
              0) && (
            <section
              style={cardStyle}
            >
              <StepNumber number="5" />

              <h2
                style={headingStyle}
              >
                What personal data is
                collected?
              </h2>

              <p
                style={{
                  ...noticeStyle,
                  marginBottom:
                    "20px",
                }}
              >
                Select all personal-data
                fields that your
                organisation collects.
              </p>

              <div
                style={{
                  display: "grid",
                  gridTemplateColumns:
                    "repeat(auto-fit, minmax(280px, 1fr))",
                  gap: "12px",
                }}
              >
                {kb.school.fields.map(
                  (field) => {
                    const isSelected =
                      selectedFields.includes(
                        field.id
                      );

                    return (
                      <label
                        key={
                          field.id
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
                            toggleField(
                              field.id
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
                              field.name
                            }
                          </strong>

                          <span
                            style={{
                              display:
                                "block",
                              fontSize:
                                "12px",
                              color:
                                "#64748b",
                              marginTop:
                                "5px",
                            }}
                          >
                            {field.data_categories.join(
                              ", "
                            )}
                          </span>

                          <span
                            style={{
                              display:
                                "block",
                              fontSize:
                                "12px",
                              color:
                                field.child_relevant
                                  ? "#b45309"
                                  : "#64748b",
                              marginTop:
                                "4px",
                            }}
                          >
                            Data subject:{" "}
                            {field.typical_data_subjects.join(
                              ", "
                            )}
                            {field.child_relevant
                              ? " • Child-relevant"
                              : ""}
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
                  field?
                </h3>

                <p
                  style={
                    noticeStyle
                  }
                >
                  Add a custom
                  personal-data field.
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
                      customField
                    }
                    onChange={(event) =>
                      setCustomField(
                        event.target.value
                      )
                    }
                    placeholder="e.g. Previous School Name"
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
                      addCustomField
                    }
                    style={
                      secondaryButtonStyle
                    }
                  >
                    Add
                  </button>
                </div>

                {customFields.length >
                  0 && (
                  <div
                    style={{
                      marginTop:
                        "16px",
                    }}
                  >
                    {customFields.map(
                      (field) => (
                        <div
                          key={
                            field.id
                          }
                          style={{
                            display:
                              "flex",
                            justifyContent:
                              "space-between",
                            alignItems:
                              "center",
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
                              field.name
                            }
                          </strong>

                          <button
                            type="button"
                            onClick={() =>
                              removeCustomField(
                                field.id
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

              {(selectedFields.length >
                0 ||
                customFields.length >
                  0) && (
                <SelectionSummary
                  count={
                    selectedFields.length +
                    customFields.length
                  }
                  label="data field"
                />
              )}
            </section>
          )}

</>
);
}
