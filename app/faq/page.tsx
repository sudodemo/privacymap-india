"use client";

import { useMemo, useState } from "react";

const faq = [
  ["What is PrivacyMap India?", "PrivacyMap India is a browser-based privacy assessment tool designed to help organisations understand how they handle personal data and prepare for the Digital Personal Data Protection framework in India."],
  ["Who should use it?", "Business owners, managers, privacy, HR, IT, security and compliance teams, process owners and others who understand how the organisation handles personal data. You do not need to be a privacy lawyer or developer."],
  ["What information should I enter?", "Answer based on how your organisation actually works. Use evidence where available and do not guess simply to improve a score."],
  ["Does PrivacyMap send my assessment answers to PrivacyMap servers?", "The assessment is designed to process assessment responses locally in the browser. Review the application's Privacy Assurance information and your own browser/device environment."],
  ["What score should we try to achieve?", "There is no legally prescribed PrivacyMap score that proves compliance. The goal is to address identified gaps, reduce material privacy risk, establish governance and evidence, and improve readiness. A high score is not proof of compliance."],
  ["What are Key Privacy Findings?", "They are the principal issues identified by the assessment. Other report sections may refer to the same findings. Finding titles link back to their original entry in Key Privacy Findings."],
  ["What is residual risk?", "Residual risk is the risk that remains after existing or planned controls and treatments are considered. It does not mean all risk has been eliminated."],
  ["Why is management approval sometimes required?", "Some residual-risk decisions need an accountable authority to review and approve them. Recording a risk decision and obtaining formal approval are separate governance activities."],
  ["What is Evidence & Closure?", "It records proof that an action or control was addressed and verified, such as policy references, procedures, tickets, training records or configuration evidence."],
  ["What are the assessment steps?", "The workflow moves from organisation and processing context through findings, treatment, residual-risk decisions, DPDP mapping, governance, remediation tracking and evidence/closure. Later steps become available when their prerequisites are complete."],
  ["Why is AI prompts / AI assistants a data-entry channel?", "People can enter personal data into AI tools. PrivacyMap therefore treats AI prompts / AI assistants as a first-class channel. AI use alone does not automatically create a privacy finding."],
  ["Why are WhatsApp and Telegram grouped?", "They are examples of messaging apps. PrivacyMap groups messaging products under one channel and can optionally record the specific platform."],
  ["Can I resume later?", "Yes. Assessment continuity supports local saving and resume, together with export/import and restore capabilities where provided."],
  ["Can an exported JSON file be edited?", "Yes. JSON is data, not a tamper-proof signature. PrivacyMap validates imported structure and values, but validation cannot prove that the contents are truthful or originally produced by an authorised person."],
  ["Does PrivacyMap provide legal advice?", "No. It provides assessment guidance and readiness information. Obtain appropriate professional advice for important legal interpretations or organisation-specific decisions."],
];

const terms = [
  ["Personal data", "Information relating to an identifiable individual."],
  ["Data Principal", "The individual to whom personal data relates."],
  ["Data Fiduciary", "An organisation or person that determines the purpose and means of processing personal data."],
  ["Data Processor", "A party that processes personal data on behalf of another organisation."],
  ["Processing", "Activities performed on personal data, such as collecting, storing, using, sharing or deleting it."],
  ["Consent", "A permission mechanism used where processing relies on consent and the applicable requirements are met."],
  ["Notice", "Information provided to a person about relevant personal-data processing."],
  ["Finding", "A privacy issue or condition identified by the assessment that requires attention, review or treatment."],
  ["Risk", "The potential for a privacy issue to cause harm or create exposure, considered using the application's risk model."],
  ["Inherent risk", "The assessed risk before considering the effect of controls or treatments."],
  ["Residual risk", "The risk that remains after existing or planned controls and treatments are considered."],
  ["Risk treatment", "An action or set of actions intended to reduce, transfer, avoid or otherwise manage a risk."],
  ["Control", "A measure, process or safeguard intended to reduce risk or support an obligation."],
  ["Evidence", "Information that supports the claim that a control or remediation action exists or has been completed."],
  ["Governance", "The roles, decisions, accountability, approvals and oversight used to manage privacy."],
  ["Data minimisation", "The principle of limiting collection and use to what is relevant and necessary for the intended purpose."],
  ["Retention", "How long personal data is kept."],
  ["Deletion", "Removing personal data when it is no longer required, subject to applicable requirements and legitimate retention needs."],
  ["Cross-border transfer", "Transfer or access involving personal data moving to or being accessed from another jurisdiction."],
  ["Encryption", "A security technique that transforms information so it is not readable without the appropriate key or mechanism."],
  ["Authentication", "The process of establishing that a user or system is who or what it claims to be."],
  ["Authorisation", "Determining what an authenticated user or system is permitted to access or do."],
  ["API", "An interface that allows software systems to exchange data or invoke functions."],
  ["AI assistant", "A software system that can generate or transform content in response to prompts. Personal data entered into it may become part of a processing activity."],
  ["Messaging app", "A communication platform such as WhatsApp, Telegram, Signal or similar services."],
  ["DPDP", "The Digital Personal Data Protection framework in India."],
  ["Readiness score", "PrivacyMap's assessment indicator showing how the recorded answers align with its readiness model. It is not a legal certification."],
];

export default function FAQPage() {
  const [tab, setTab] = useState<"faq" | "terms">("faq");
  const [query, setQuery] = useState("");
  const source = tab === "faq" ? faq : terms;
  const filtered = useMemo(() => source.filter(([title, text]) => `${title} ${text}`.toLowerCase().includes(query.toLowerCase())), [source, query]);

  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc", padding: "28px 16px 64px", color: "#0f172a" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <header style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 800, letterSpacing: ".02em" }}>PRIVACYMAP INDIA</div>
          <h1 style={{ margin: "10px 0 8px", fontSize: "clamp(28px, 5vw, 42px)" }}>Help, FAQ & Terminology</h1>
          <p style={{ color: "#475569", lineHeight: 1.6, maxWidth: 760 }}>Plain-language guidance for using the assessment, understanding scores and fields, and interpreting common privacy, security, technical and governance terms.</p>
        </header>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          <button onClick={() => setTab("faq")} aria-pressed={tab === "faq"} style={{ border: "1px solid #cbd5e1", borderRadius: 10, padding: "10px 14px", background: tab === "faq" ? "#0f172a" : "white", color: tab === "faq" ? "white" : "#0f172a", fontWeight: 700 }}>Frequently Asked Questions</button>
          <button onClick={() => setTab("terms")} aria-pressed={tab === "terms"} style={{ border: "1px solid #cbd5e1", borderRadius: 10, padding: "10px 14px", background: tab === "terms" ? "#0f172a" : "white", color: tab === "terms" ? "white" : "#0f172a", fontWeight: 700 }}>Terminology</button>
        </div>

        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={tab === "faq" ? "Search questions..." : "Search terms..."} aria-label="Search help" style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", border: "1px solid #cbd5e1", borderRadius: 10, background: "white", marginBottom: 16, fontSize: 16 }} />

        <section style={{ display: "grid", gap: 12 }}>
          {filtered.map(([title, text]) => (
            <details key={title} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: "15px 16px" }}>
              <summary style={{ cursor: "pointer", fontWeight: 750 }}>{title}</summary>
              <p style={{ margin: "12px 0 2px", color: "#475569", lineHeight: 1.65 }}>{text}</p>
            </details>
          ))}
          {!filtered.length && <p style={{ color: "#64748b" }}>No matching information found.</p>}
        </section>

        <footer style={{ marginTop: 28, color: "#64748b", fontSize: 13, lineHeight: 1.6 }}>
          PrivacyMap is an assessment and readiness tool. It does not provide legal advice, certification or a guarantee of compliance.
        </footer>
      </div>
    </main>
  );
}
