"use client";

import { useMemo, useState } from "react";
import type { AssessmentReportData } from "../lib/reportExport";
import {
  buildCsvReport,
  buildJsonReport,
  buildMarkdownReport,
  buildXmlReport,
  downloadPdfReport,
  downloadTextFile,
  safeFileStem,
} from "../lib/reportExport";

interface Props {
  report: AssessmentReportData;
}

type Format = "pdf" | "csv" | "xml" | "json" | "md";

export default function AssessmentReport({ report }: Props) {
  const [format, setFormat] = useState<Format>("pdf");
  const [busy, setBusy] = useState(false);
  const stem = useMemo(() => safeFileStem(report.profile), [report.profile]);
  const markdown = useMemo(() => buildMarkdownReport(report), [report]);

  async function download() {
    setBusy(true);
    try {
      if (format === "pdf") {
        await downloadPdfReport(report, `${stem}.pdf`);
      } else if (format === "csv") {
        downloadTextFile(buildCsvReport(report), `${stem}.csv`, "text/csv");
      } else if (format === "xml") {
        downloadTextFile(buildXmlReport(report), `${stem}.xml`, "application/xml");
      } else if (format === "json") {
        downloadTextFile(buildJsonReport(report), `${stem}.json`, "application/json");
      } else {
        downloadTextFile(markdown, `${stem}.md`, "text/markdown");
      }
    } finally {
      setBusy(false);
    }
  }

  return (
    <section style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 14, padding: 28, marginTop: 24, marginBottom: 24 }}>
      <div style={{ fontSize: 13, fontWeight: 700, letterSpacing: 2, color: "#1d4ed8", marginBottom: 8 }}>REPORTING</div>
      <h2 style={{ marginTop: 0, color: "#0f172a" }}>Assessment Complete</h2>
      <p style={{ color: "#64748b", lineHeight: 1.6, maxWidth: 760 }}>
        The assessment has completed Steps 1–13, including governance, remediation and evidence closure. Select the required report format and download the assessment directly.
      </p>

      <div style={{ marginTop: 18, padding: "14px 16px", background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 10, color: "#475569", fontSize: 13 }}>
        <strong style={{ color: "#0f172a" }}>{report.profile.organisationName}</strong> • {report.profile.assessmentName} • Assessment ID: {report.profile.assessmentId}
      </div>

      <div style={{ display: "flex", gap: 10, alignItems: "end", flexWrap: "wrap", marginTop: 20 }}>
        <div style={{ flex: "1 1 320px" }}>
          <label htmlFor="report-format" style={{ display: "block", fontWeight: 700, color: "#0f172a", marginBottom: 7, fontSize: 13 }}>Download Report</label>
          <select id="report-format" value={format} onChange={(e) => setFormat(e.target.value as Format)} style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", border: "1px solid #cbd5e1", borderRadius: 8, background: "white", color: "#0f172a", fontSize: 14 }}>
            <option value="pdf">PDF — Management / Audit Report</option>
            <option value="csv">CSV — Spreadsheet / Analysis</option>
            <option value="xml">XML — Structured Data / Integration</option>
            <option value="json">JSON — Machine-Readable Assessment</option>
            <option value="md">Markdown — Portable Report</option>
          </select>
        </div>
        <button type="button" onClick={download} disabled={busy} style={{ padding: "12px 20px", border: "none", borderRadius: 8, background: busy ? "#94a3b8" : "#1d4ed8", color: "white", fontWeight: 700, cursor: busy ? "wait" : "pointer", minWidth: 160 }}>
          {busy ? "Preparing…" : "Download"}
        </button>
      </div>

      <details style={{ marginTop: 24 }}>
        <summary style={{ cursor: "pointer", fontWeight: 700, color: "#334155" }}>Preview Markdown report</summary>
        <pre style={{ marginTop: 12, padding: 16, background: "#0f172a", color: "#e2e8f0", borderRadius: 10, overflowX: "auto", whiteSpace: "pre-wrap", fontSize: 12, lineHeight: 1.55 }}>{markdown}</pre>
      </details>
    </section>
  );
}
