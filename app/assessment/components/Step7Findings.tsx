import React from "react";
import type { RiskResult, RiskLevel } from "../../../lib/privacyRisk";
import { riskBackground, riskColor } from "./shared";

export default function Step7Findings({
  result,
}: {
  result: RiskResult;
}) {
  return (
    <section
      style={{
        marginTop: "24px",
        marginBottom: "24px",
      }}
    >
      <div
        style={{
          background: "white",
          border:
            "1px solid #e2e8f0",
          borderRadius: "14px",
          padding: "28px",
        }}
      >
        <h2
          style={{
            color: "#0f172a",
            marginTop: 0,
          }}
        >
          Privacy Risk Dashboard
        </h2>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(220px, 1fr))",
            gap: "16px",
            marginTop: "20px",
          }}
        >
          <div
            style={{
              padding: "22px",
              borderRadius:
                "12px",
              background:
                riskBackground(
                  result.overallLevel
                ),
            }}
          >
            <div
              style={{
                fontSize:
                  "13px",
                fontWeight: 700,
                color:
                  "#475569",
              }}
            >
              OVERALL RISK
            </div>

            <div
              style={{
                fontSize:
                  "32px",
                fontWeight: 800,
                marginTop:
                  "8px",
                color:
                  riskColor(
                    result.overallLevel
                  ),
              }}
            >
              {
                result.overallLevel
              }
            </div>

            <div
              style={{
                marginTop:
                  "5px",
                color:
                  "#475569",
              }}
            >
              Risk score:{" "}
              {result.score}
              /100
            </div>
          </div>

          <div
            style={{
              padding: "22px",
              borderRadius:
                "12px",
              background:
                "#f8fafc",
            }}
          >
            <div
              style={{
                fontSize:
                  "13px",
                fontWeight: 700,
                color:
                  "#475569",
              }}
            >
              FINDINGS
            </div>

            <div
              style={{
                fontSize:
                  "32px",
                fontWeight: 800,
                marginTop:
                  "8px",
                color:
                  "#0f172a",
              }}
            >
              {
                result.findings
                  .length
              }
            </div>

            <div
              style={{
                marginTop:
                  "5px",
                color:
                  "#475569",
              }}
            >
              Potential issues
              identified
            </div>
          </div>
        </div>

        <h3
          style={{
            marginTop:
              "32px",
            color:
              "#0f172a",
          }}
        >
          Risk by category
        </h3>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "repeat(auto-fit, minmax(250px, 1fr))",
            gap: "12px",
          }}
        >
          {result.categoryScores.map(
            (category) => (
              <div
                key={
                  category.category
                }
                style={{
                  padding:
                    "16px",
                  border:
                    "1px solid #e2e8f0",
                  borderRadius:
                    "10px",
                }}
              >
                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                    gap:
                      "10px",
                  }}
                >
                  <strong>
                    {
                      category.category
                    }
                  </strong>

                  <strong
                    style={{
                      color:
                        riskColor(
                          category.level
                        ),
                    }}
                  >
                    {
                      category.level
                    }
                  </strong>
                </div>

                <div
                  style={{
                    marginTop:
                      "10px",
                    height:
                      "8px",
                    background:
                      "#e2e8f0",
                    borderRadius:
                      "20px",
                    overflow:
                      "hidden",
                  }}
                >
                  <div
                    style={{
                      width: `${category.score}%`,
                      height:
                        "100%",
                      background:
                        riskColor(
                          category.level
                        ),
                    }}
                  />
                </div>

                <div
                  style={{
                    marginTop:
                      "6px",
                    fontSize:
                      "12px",
                    color:
                      "#64748b",
                  }}
                >
                  {
                    category.score
                  }
                  /100
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* FINDINGS */}

      <div
        style={{
          background:
            "white",
          border:
            "1px solid #e2e8f0",
          borderRadius:
            "14px",
          padding:
            "28px",
          marginTop:
            "20px",
        }}
      >
        <h2
          style={{
            marginTop: 0,
            color:
              "#0f172a",
          }}
        >
          Key Privacy Findings
        </h2>

        {result.findings
          .length === 0 ? (
          <div
            style={{
              padding:
                "18px",
              background:
                "#f0fdf4",
              border:
                "1px solid #bbf7d0",
              borderRadius:
                "10px",
              color:
                "#166534",
            }}
          >
            No significant
            privacy risk
            signals were
            identified from
            the information
            provided.
          </div>
        ) : (
          result.findings.map(
            (finding) => (
              <div
                key={
                  finding.id
                }
                style={{
                  padding:
                    "20px",
                  marginBottom:
                    "14px",
                  border:
                    "1px solid #e2e8f0",
                  borderRadius:
                    "10px",
                }}
              >
                <div
                  style={{
                    display:
                      "flex",
                    justifyContent:
                      "space-between",
                    alignItems:
                      "flex-start",
                    gap:
                      "15px",
                    flexWrap:
                      "wrap",
                  }}
                >
                  <div>
                    <div
                      style={{
                        fontSize:
                          "12px",
                        fontWeight:
                          700,
                        color:
                          "#64748b",
                        textTransform:
                          "uppercase",
                        letterSpacing:
                          "1px",
                      }}
                    >
                      {
                        finding.category
                      }
                    </div>

                    <h3
                      style={{
                        margin:
                          "6px 0",
                        color:
                          "#0f172a",
                      }}
                    >
                      {
                        finding.title
                      }
                    </h3>
                  </div>

                  <span
                    style={{
                      padding:
                        "6px 10px",
                      borderRadius:
                        "20px",
                      background:
                        riskBackground(
                          finding.level
                        ),
                      color:
                        riskColor(
                          finding.level
                        ),
                      fontWeight:
                        700,
                      fontSize:
                        "12px",
                    }}
                  >
                    {
                      finding.level
                    }
                  </span>
                </div>

                <p
                  style={{
                    color:
                      "#475569",
                    lineHeight:
                      1.6,
                  }}
                >
                  {
                    finding.explanation
                  }
                </p>

                <div
                  style={{
                    padding:
                      "14px",
                    background:
                      "#f8fafc",
                    borderRadius:
                      "8px",
                    color:
                      "#334155",
                    lineHeight:
                      1.6,
                  }}
                >
                  <strong>
                    Recommended
                    action:
                  </strong>{" "}
                  {
                    finding.recommendation
                  }
                </div>
              </div>
            )
          )
        )}
      </div>
    </section>
  );
}

/*
 * =========================================================
 * STEP 10 - DPDP MAPPING & REMEDIATION
 * =========================================================
 */

type DpdpControlStatus =
  | "NOT_ASSESSED"
  | "REVIEW_REQUIRED"
  | "EVIDENCE_RECORDED";

type DpdpAssessmentState = {
  status: DpdpControlStatus;
  owner: string;
  evidence: string;
  targetDate: string;
  notes: string;
};

type DpdpMappingRow = {
  id: string;
  findingId: string;
  findingTitle: string;
  findingLevel: RiskLevel;
  controlId: string;
  controlTitle: string;
  actReference: string;
  ruleReference: string;
  requirement: string;
  assessmentQuestion: string;
  evidenceExpectation: string;
  remediation: string;
  effectiveDate: string;
  sourceUrl: string;
  status: DpdpControlStatus;
};

