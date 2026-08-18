"use client";

import { useMemo, useState } from "react";
import type { AssessmentReportData } from "../lib/reportExport";
import { reportToCsv, reportToJson, reportToMarkdown, reportToXml, downloadTextFile, downloadPdf, getReportFindings, reportAnchorId } from "../lib/reportExport";

type ReportFormat = "pdf" | "csv" | "xml" | "json" | "markdown";

interface AssessmentReportProps { report: AssessmentReportData; }

function safeActionValue(action: unknown, keys: string[]): string {
  if (!action || typeof action !== "object") return "Not Available";
  const record = action as Record<string, unknown>;
  for (const key of keys) {
    const value = record[key];
    if (value !== undefined && value !== null && String(value).trim()) return String(value);
  }
  return "Not Available";
}

function riskBadgeStyle(risk: string) {
  const value = risk.toLowerCase();
  if (value.includes("critical") || value.includes("high")) return { background: "#fef2f2", color: "#b91c1c", border: "1px solid #fecaca" };
  if (value.includes("medium") || value.includes("moderate")) return { background: "#fffbeb", color: "#b45309", border: "1px solid #fde68a" };
  if (value.includes("low")) return { background: "#f0fdf4", color: "#15803d", border: "1px solid #bbf7d0" };
  return { background: "#f8fafc", color: "#475569", border: "1px solid #e2e8f0" };
}

function statusStyle(status: string) {
  const value = status.toLowerCase();
  if (value === "completed") return { background: "#f0fdf4", color: "#15803d" };
  if (value === "accepted" || value === "approved") return { background: "#eff6ff", color: "#1d4ed8" };
  if (value === "in progress" || value === "pending") return { background: "#fffbeb", color: "#b45309" };
  if (value === "rejected") return { background: "#fef2f2", color: "#b91c1c" };
  return { background: "#f8fafc", color: "#475569" };
}

function FindingLink({ step, title }: { step: number; title: string }) {
  return <a className="pm-report-finding-link" href={`#${reportAnchorId(step, title)}`}>{title}</a>;
}

function Section({ kicker, title, description, children }: { step?: number; kicker: string; title: string; description?: string; children: React.ReactNode }) {
  return <section className="pm-report-section">
    <div className="pm-report-kicker">{kicker}</div>
    <h3 className="pm-report-section-title">{title}</h3>
    {description && <p className="pm-report-description">{description}</p>}
    {children}
  </section>;
}

export default function AssessmentReport({ report }: AssessmentReportProps) {
  const [format, setFormat] = useState<ReportFormat>("pdf");
  const [downloading, setDownloading] = useState(false);
  const filenameBase = useMemo(() => buildFilename(report.assessmentProfile.organisationName, report.assessmentProfile.assessmentId), [report.assessmentProfile]);
  const findings = report.findings?.length ? report.findings : getReportFindings(report.riskResult);
  const treatmentActions = report.treatmentActions || [];
  const decisions = report.residualRiskDecisions || [];
  const evidenceRecords = report.evidenceRecords || {};

  function downloadReport() {
    setDownloading(true);
    try {
      if (format === "pdf") { downloadPdf(report, `${filenameBase}.pdf`); return; }
      if (format === "csv") { downloadTextFile(reportToCsv(report), `${filenameBase}.csv`, "text/csv;charset=utf-8"); return; }
      if (format === "xml") { downloadTextFile(reportToXml(report), `${filenameBase}.xml`, "application/xml;charset=utf-8"); return; }
      if (format === "json") { downloadTextFile(reportToJson(report), `${filenameBase}.json`, "application/json;charset=utf-8"); return; }
      downloadTextFile(reportToMarkdown(report), `${filenameBase}.md`, "text/markdown;charset=utf-8");
    } finally { window.setTimeout(() => setDownloading(false), 500); }
  }

  return <div className="pm-report">
    <header className="pm-report-header">
      <div className="pm-report-kicker">PRIVACYMAP INDIA</div>
      <h2 className="pm-report-title">Final Report</h2>
      <p className="pm-report-description">DPDP readiness assessment summary, findings, actions, governance and evidence.</p>
    </header>

    <section className="pm-report-summary pm-report-section">
      <div className="pm-report-kicker">EXECUTIVE SUMMARY</div>
      <h3 className="pm-report-section-title">Assessment at a glance</h3>
      <div className="pm-report-summary-grid">
        <div className="pm-report-stat"><span>Organisation</span><strong>{report.assessmentProfile.organisationName}</strong></div>
        <div className="pm-report-stat"><span>Assessment</span><strong>{report.assessmentProfile.assessmentName}</strong></div>
        <div className="pm-report-stat"><span>Findings</span><strong>{findings.length}</strong></div>
        <div className="pm-report-stat"><span>Treatment actions</span><strong>{treatmentActions.length}</strong></div>
      </div>
    </section>

    <Section kicker="KEY PRIVACY FINDINGS" title="Key Privacy Findings" description="The main findings identified during the assessment.">
      <div className="pm-report-list">
        {findings.map((finding, index) => {
          const title = typeof finding === "string" ? finding : String((finding as Record<string, unknown>).title ?? (finding as Record<string, unknown>).name ?? `Finding ${index + 1}`);
          return <article className="pm-report-card" id={reportAnchorId(7, title)} key={`${title}-${index}`}>
            <h4 className="pm-report-finding-title"><a className="pm-report-finding-link" href={`#${reportAnchorId(7, title)}`}>{title}</a></h4>
            {typeof finding === "object" && finding !== null && <p className="pm-report-description">{String((finding as Record<string, unknown>).description ?? (finding as Record<string, unknown>).detail ?? "")}</p>}
          </article>;
        })}
      </div>
    </Section>

    <Section kicker="RISK TREATMENT & ACTION" title="Recommended Risk Treatments" description="Practical actions to reduce identified privacy risks.">
      <div className="pm-report-list">{treatmentActions.map((action, index) => {
        const title = safeActionValue(action, ["findingTitle", "title", "name", "finding"]);
        const finding = findings.find((item) => {
          const value = typeof item === "string" ? item : String((item as Record<string, unknown>).title ?? (item as Record<string, unknown>).name ?? "");
          return value === title;
        });
        const targetTitle = finding ? (typeof finding === "string" ? finding : String((finding as Record<string, unknown>).title ?? (finding as Record<string, unknown>).name ?? title)) : title;
        return <article className="pm-report-card" key={`${title}-${index}`}>
          <h4 className="pm-report-finding-title"><a className="pm-report-finding-link" href={`#${reportAnchorId(7, targetTitle)}`}>{title}</a></h4>
          <div className="pm-report-meta-grid"><span><b>Owner:</b> {safeActionValue(action, ["owner", "actionOwner"])}</span><span><b>Status:</b> {safeActionValue(action, ["status", "state"])}</span><span><b>Priority:</b> {safeActionValue(action, ["priority", "risk"])} </span><span><b>Target:</b> {safeActionValue(action, ["targetDate", "dueDate", "timeframe"])}</span></div>
          <p className="pm-report-description">{safeActionValue(action, ["action", "treatment", "description"])}</p>
        </article>;
      })}</div>
    </Section>

    <Section kicker="RESIDUAL RISK" title="Residual Risks" description="Risk decisions after planned or completed treatment.">
      <div className="pm-report-list">{decisions.map((decision, index) => {
        const title = safeActionValue(decision, ["findingTitle", "title", "name", "finding"]);
        return <article className="pm-report-card" key={`${title}-${index}`}>
          <h4 className="pm-report-finding-title"><a className="pm-report-finding-link" href={`#${reportAnchorId(7, title)}`}>{title}</a></h4>
          <div className="pm-report-meta-grid"><span><b>Decision:</b> {safeActionValue(decision, ["decision", "status"])}</span><span><b>Residual risk:</b> {safeActionValue(decision, ["residualRisk", "risk"])}</span><span><b>Owner:</b> {safeActionValue(decision, ["owner", "decisionOwner"])}</span></div>
        </article>;
      })}</div>
    </Section>

    <Section kicker="GOVERNANCE" title="Risk Governance & Approval" description="Governance decisions and accountability for identified risks.">
      <div className="pm-report-list">{treatmentActions.map((action, index) => {
        const title = safeActionValue(action, ["findingTitle", "title", "name", "finding"]);
        return <article className="pm-report-card" key={`governance-${title}-${index}`}><h4 className="pm-report-finding-title"><a className="pm-report-finding-link" href={`#${reportAnchorId(7, title)}`}>{title}</a></h4><div className="pm-report-meta-grid"><span><b>Owner:</b> {safeActionValue(action, ["owner", "actionOwner"])}</span><span><b>Approval:</b> {safeActionValue(action, ["approval", "status", "state"])}</span></div></article>;
      })}</div>
    </Section>

    <Section kicker="REMEDIATION" title="Findings, Residual Risks & Remediation" description="Actions and accountability for closing identified gaps.">
      <div className="pm-report-list">{treatmentActions.map((action, index) => {
        const title = safeActionValue(action, ["findingTitle", "title", "name", "finding"]);
        return <article className="pm-report-card" key={`remediation-${title}-${index}`}><h4 className="pm-report-finding-title"><a className="pm-report-finding-link" href={`#${reportAnchorId(7, title)}`}>{title}</a></h4><p className="pm-report-description">{safeActionValue(action, ["action", "treatment", "description"])}</p><div className="pm-report-meta-grid"><span><b>Owner:</b> {safeActionValue(action, ["owner", "actionOwner"])}</span><span><b>Status:</b> {safeActionValue(action, ["status", "state"])}</span></div></article>;
      })}</div>
    </Section>

    <Section kicker="EVIDENCE & CLOSURE" title="Evidence & Closure" description="Evidence, verification and closure information for remediation.">
      <div className="pm-report-list">{Object.entries(evidenceRecords).map(([findingTitle, evidence], index) => <article className="pm-report-card" key={`${findingTitle}-${index}`}><h4 className="pm-report-finding-title"><a className="pm-report-finding-link" href={`#${reportAnchorId(7, findingTitle)}`}>{findingTitle}</a></h4><p className="pm-report-description">{typeof evidence === "string" ? evidence : JSON.stringify(evidence)}</p></article>)}</div>
    </Section>

    <section className="pm-report-download pm-report-section">
      <div className="pm-report-kicker">EXPORT</div>
      <h3 className="pm-report-section-title">Export Report</h3>
      <div className="pm-report-download-controls">
        <label className="pm-report-format"><span>Format</span><select value={format} onChange={(event) => setFormat(event.target.value as ReportFormat)}><option value="pdf">PDF</option><option value="csv">CSV</option><option value="xml">XML</option><option value="json">JSON</option><option value="markdown">Markdown</option></select></label>
        <button type="button" onClick={downloadReport} disabled={downloading} className="pm-report-download-button">{downloading ? "Preparing…" : "Download Report"}</button>
      </div>
    </section>

    <style jsx>{`
      .pm-report { width:100%; max-width:1100px; margin:0 auto; box-sizing:border-box; color:#0f172a; }
      .pm-report-header { padding:24px 0 8px; }
      .pm-report-kicker { font-size:11px; font-weight:800; letter-spacing:1.8px; color:#1d4ed8; margin-bottom:7px; }
      .pm-report-title { margin:0 0 8px; font-size:clamp(28px,4vw,38px); line-height:1.15; }
      .pm-report-section { margin-top:26px; padding:24px 0 0; border-top:1px solid #e2e8f0; scroll-margin-top:24px; }
      .pm-report-summary { border-top:0; padding-top:8px; }
      .pm-report-section-title { margin:0 0 7px; font-size:clamp(19px,3vw,24px); line-height:1.25; }
      .pm-report-description { margin:0 0 16px; color:#64748b; line-height:1.6; font-size:14px; overflow-wrap:anywhere; }
      .pm-report-summary-grid,.pm-report-meta-grid { display:grid; grid-template-columns:repeat(4,minmax(0,1fr)); gap:12px; }
      .pm-report-stat,.pm-report-card { min-width:0; box-sizing:border-box; border:1px solid #e2e8f0; border-radius:12px; background:#fff; }
      .pm-report-stat { padding:16px; display:flex; flex-direction:column; gap:6px; }
      .pm-report-stat span,.pm-report-meta-grid span { color:#64748b; font-size:12px; line-height:1.5; overflow-wrap:anywhere; }
      .pm-report-stat strong { font-size:16px; overflow-wrap:anywhere; }
      .pm-report-list { display:grid; gap:12px; }
      .pm-report-card { padding:16px; scroll-margin-top:24px; }
      .pm-report-finding-title { margin:0 0 10px; font-size:16px; line-height:1.45; overflow-wrap:anywhere; }
      .pm-report-finding-link { color:#1d4ed8; text-decoration:underline; text-decoration-thickness:1px; text-underline-offset:3px; overflow-wrap:anywhere; }
      .pm-report-finding-link:focus-visible { outline:3px solid #bfdbfe; outline-offset:3px; border-radius:4px; }
      .pm-report-meta-grid { grid-template-columns:repeat(4,minmax(0,1fr)); margin-bottom:10px; }
      .pm-report-download-controls { display:flex; align-items:end; gap:12px; flex-wrap:wrap; }
      .pm-report-format { display:flex; flex-direction:column; gap:6px; font-size:12px; font-weight:700; color:#475569; min-width:150px; }
      .pm-report-format select,.pm-report-download-button { min-height:44px; border:1px solid #cbd5e1; border-radius:8px; padding:10px 12px; font:inherit; box-sizing:border-box; }
      .pm-report-download-button { background:#1d4ed8; color:#fff; border-color:#1d4ed8; font-weight:800; cursor:pointer; }
      .pm-report-download-button:disabled { opacity:.65; cursor:wait; }
      @media (max-width: 760px) {
        .pm-report { padding:0 2px; }
        .pm-report-header { padding-top:16px; }
        .pm-report-section { margin-top:20px; padding-top:18px; }
        .pm-report-summary-grid { grid-template-columns:repeat(2,minmax(0,1fr)); }
        .pm-report-meta-grid { grid-template-columns:1fr 1fr; }
        .pm-report-card,.pm-report-stat { padding:14px; }
        .pm-report-download-controls { display:grid; grid-template-columns:1fr; align-items:stretch; }
        .pm-report-format { min-width:0; }
        .pm-report-format select,.pm-report-download-button { width:100%; }
      }
      @media (max-width: 440px) {
        .pm-report-summary-grid,.pm-report-meta-grid { grid-template-columns:1fr; }
        .pm-report-title { font-size:28px; }
        .pm-report-section-title { font-size:19px; }
        .pm-report-card,.pm-report-stat { padding:13px; border-radius:10px; }
      }
    `}</style>
  </div>;
}

function buildFilename(organisationName: string, assessmentId: string): string {
  const safeOrganisation = organisationName.trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "organisation";
  const safeAssessment = assessmentId.trim().replace(/[^a-z0-9]+/gi, "-").replace(/^-+|-+$/g, "").toLowerCase() || "assessment";
  return `privacymap-${safeOrganisation}-${safeAssessment}-report`;
}
