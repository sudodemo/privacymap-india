"use client";

import {
  useMemo,
  useState,
} from "react";

import type {
  AssessmentReportData,
} from "../lib/reportExport";

import {
  reportToCsv,
  reportToJson,
  reportToMarkdown,
  reportToXml,
  downloadTextFile,
  downloadPdf,
} from "../lib/reportExport";

type ReportFormat =
  | "pdf"
  | "csv"
  | "xml"
  | "json"
  | "markdown";

interface AssessmentReportProps {
  report: AssessmentReportData;
}

export default function AssessmentReport({
  report,
}: AssessmentReportProps) {
  const [
    format,
    setFormat,
  ] =
    useState<ReportFormat>(
      "pdf"
    );

  const [
    downloading,
    setDownloading,
  ] =
    useState(false);

  const filenameBase =
    useMemo(
      () =>
        buildFilename(
          report.assessmentProfile
            .organisationName,
          report.assessmentProfile
            .assessmentId
        ),
      [report]
    );

  function downloadReport() {
    setDownloading(true);

    try {
      if (format === "pdf") {
        downloadPdf(
          report,
          `${filenameBase}.pdf`
        );

        return;
      }

      if (format === "csv") {
        downloadTextFile(
          reportToCsv(report),
          `${filenameBase}.csv`,
          "text/csv;charset=utf-8"
        );

        return;
      }

      if (format === "xml") {
        downloadTextFile(
          reportToXml(report),
          `${filenameBase}.xml`,
          "application/xml;charset=utf-8"
        );

        return;
      }

      if (format === "json") {
        downloadTextFile(
          reportToJson(report),
          `${filenameBase}.json`,
          "application/json;charset=utf-8"
        );

        return;
      }

      downloadTextFile(
        reportToMarkdown(report),
        `${filenameBase}.md`,
        "text/markdown;charset=utf-8"
      );
    } finally {
      window.setTimeout(
        () =>
          setDownloading(false),
        400
      );
    }
  }

  return (
    <section
      style={{
        marginTop: 32,
        marginBottom: 32,
      }}
    >
      <div
        style={{
          background: "white",
          border:
            "1px solid #cbd5e1",
          borderRadius: 14,
          padding: 28,
        }}
      >
        <div
          style={{
            fontSize: 13,
            fontWeight: 700,
            letterSpacing: 2,
            color: "#1d4ed8",
            marginBottom: 8,
          }}
        >
          FINAL REPORT
        </div>

        <h2
          style={{
            marginTop: 0,
            color: "#0f172a",
          }}
        >
          Assessment Report & Downloads
        </h2>

        <p
          style={{
            color: "#64748b",
            lineHeight: 1.6,
            maxWidth: 760,
          }}
        >
          The assessment is complete.
          Select the format in which you
          want to download the PrivacyMap
          India assessment report.
        </p>

        <div
          style={{
            marginTop: 18,
            padding:
              "14px 16px",
            background:
              "#f8fafc",
            border:
              "1px solid #e2e8f0",
            borderRadius: 10,
            color:
              "#475569",
            fontSize: 13,
          }}
        >
          <strong>
            {
              report.assessmentProfile
                .organisationName
            }
          </strong>

          {" • "}

          {
            report.assessmentProfile
              .assessmentName
          }

          {" • Assessment ID: "}

          {
            report.assessmentProfile
              .assessmentId
          }
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              "minmax(220px,1fr) auto",
            gap: 12,
            marginTop: 22,
            alignItems: "end",
          }}
        >
          <div>
            <label
              style={{
                display: "block",
                fontWeight: 700,
                color:
                  "#0f172a",
                marginBottom: 7,
                fontSize: 13,
              }}
            >
              Download format
            </label>

            <select
              value={format}
              onChange={(event) =>
                setFormat(
                  event.target
                    .value as ReportFormat
                )
              }
              style={{
                width: "100%",
                boxSizing:
                  "border-box",
                padding:
                  "12px 14px",
                border:
                  "1px solid #cbd5e1",
                borderRadius: 8,
                background:
                  "white",
                color:
                  "#0f172a",
                fontSize: 15,
              }}
            >
              <option value="pdf">
                PDF — Human-readable report
              </option>

              <option value="csv">
                CSV — Spreadsheet / analysis
              </option>

              <option value="xml">
                XML — Structured interchange
              </option>

              <option value="json">
                JSON — Structured data
              </option>

              <option value="markdown">
                Markdown — Documentation
              </option>
            </select>
          </div>

          <button
            type="button"
            onClick={
              downloadReport
            }
            disabled={
              downloading
            }
            style={{
              padding:
                "12px 22px",
              border: "none",
              borderRadius: 8,
              background:
                downloading
                  ? "#94a3b8"
                  : "#1d4ed8",
              color: "white",
              fontWeight: 700,
              fontSize: 15,
              cursor:
                downloading
                  ? "wait"
                  : "pointer",
              whiteSpace:
                "nowrap",
            }}
          >
            {downloading
              ? "Preparing..."
              : `Download ${
                  format.toUpperCase()
                }`}
          </button>
        </div>

        <div
          style={{
            marginTop: 18,
            padding:
              "12px 14px",
            background:
              "#eff6ff",
            border:
              "1px solid #bfdbfe",
            borderRadius: 8,
            color:
              "#1e3a8a",
            fontSize: 13,
            lineHeight: 1.6,
          }}
        >
          <strong>
            Privacy-by-design:
          </strong>{" "}
          Reports are generated locally in
          the browser. No assessment data is
          uploaded to a reporting server.
        </div>
      </div>
    </section>
  );
}

function buildFilename(
  organisationName: string,
  assessmentId: string
): string {
  const organisation =
    organisationName
      .trim()
      .replace(
        /[^a-zA-Z0-9]+/g,
        "-"
      )
      .replace(
        /^-+|-+$/g,
        ""
      );

  const id =
    assessmentId
      .trim()
      .replace(
        /[^a-zA-Z0-9_-]+/g,
        "-"
      );

  return (
    `PrivacyMap-${organisation || "Assessment"}-${id || "Report"}`
  );
}
