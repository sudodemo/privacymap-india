"use client";

import { useMemo, useState } from "react";

type Entry = [string, string];

const faq: Entry[] = [
  ["What is PrivacyMap India?", "PrivacyMap India is a browser-based privacy assessment tool designed to help organisations understand their personal-data processing and prepare for the Digital Personal Data Protection framework in India."],
  ["Who should use it?", "Business owners, managers, privacy, HR, IT, security and compliance teams, process owners and others who understand how the organisation handles personal data. You do not need to be a privacy lawyer or developer."],
  ["What information should I enter?", "Answer based on how your organisation actually works. Use the best available evidence rather than guessing. If something is unknown, record it as unknown where the assessment allows it and follow the resulting recommendation."],
  ["What is expected from me?", "Provide honest organisation-specific answers, identify responsible people, provide realistic dates, review findings, decide how risks will be handled, obtain required approvals and provide evidence when actions are completed. The goal is to understand and improve the real situation, not to obtain the highest possible score."],
  ["What should I do if I do not know an answer?", "Do not guess simply to improve the result. Use an available unknown option where provided, or confirm the information with the relevant process, IT, HR, security, legal or business owner."],
  ["What is the DPDP readiness score?", "The score is an assessment indicator generated from the answers and mapped controls. It shows relative readiness and areas needing attention. It is not a government score, legal certification, audit opinion or guarantee of compliance."],
  ["What score should we try to achieve?", "There is no legally prescribed PrivacyMap score that proves compliance. The practical goal is to address identified gaps, reduce material privacy risk, establish governance and evidence, and move toward a consistently strong readiness position. A high score with incomplete or inaccurate answers is not proof of compliance."],
  ["Why can a finding be high risk?", "Risk reflects potential impact and likelihood or exposure indicated by the assessment. A high risk does not automatically mean the organisation violated the law; it means the issue deserves stronger attention or review."],
  ["What are Key Privacy Findings?", "They are the principal issues identified by the assessment. Other report sections may refer to the same findings. Finding titles link back to their original entry in Key Privacy Findings."],
  ["What is a treatment plan?", "A treatment plan records what the organisation intends to do about an identified risk, including ownership, status, actions and expected completion."],
  ["What is residual risk?", "Residual risk is the risk that remains after existing or planned controls and treatments are considered. It does not mean all risk has been eliminated."],
  ["Why is management approval sometimes required?", "Some residual-risk decisions need an accountable authority to review and approve them. Completing a risk decision and obtaining formal approval are separate governance activities."],
  ["What are Evidence & Closure?", "They record proof that an action or control was addressed and verified. Examples include policy references, procedures, screenshots, tickets, training records and configuration records."],
  ["Why do I need to provide an owner and review date?", "Privacy work needs accountability and follow-up. An owner identifies who is responsible for the action or decision, while a review date establishes when it should be reconsidered."],
  ["What are the assessment steps?", "The workflow moves through organisation and industry, business type, business process, collection channels, personal-data categories, data handling, risk assessment, treatment, residual-risk decision, DPDP mapping, governance, remediation and evidence/closure. Later steps require their prerequisites to be completed."],
  ["Why does a later step remain locked?", "PrivacyMap uses prerequisites so incomplete information is not carried into later stages. A locked step does not necessarily mean there is a privacy violation; it means required workflow information is incomplete."],
  ["What is Industry and Business Type used for?", "They provide context so PrivacyMap can present relevant business processes and improve its intelligence. They do not automatically determine compliance or non-compliance."],
  ["What are Data Entry / Collection Channels?", "They describe where personal data enters or is collected, such as web forms, mobile apps, email, telephone, messaging apps, social media, physical forms, APIs and AI assistants."],
  ["Why is AI prompts / AI assistants a collection channel?", "People can enter personal data into AI tools. PrivacyMap treats AI prompts / AI assistants as a first-class channel so organisations can consider what is entered, why, the provider, retention/training settings where known and other relevant processing facts. AI use alone does not automatically create a privacy finding."],
  ["Why are WhatsApp and Telegram grouped together?", "They are examples of messaging apps. PrivacyMap uses one Messaging Apps category and can optionally record the specific provider/platform, avoiding a separate field for every product."],
  ["Can I resume later?", "Yes. Assessment continuity supports local saving and resume, together with export/import and restore capabilities where provided."],
  ["Can someone edit an exported JSON file?", "Yes. JSON is data, not a tamper-proof signature. PrivacyMap validates imported structure and values to reduce unsafe or malformed input, but validation cannot prove that contents are truthful or originally produced by an authorised person."],
  ["Does PrivacyMap provide legal advice?", "No. It provides assessment guidance and readiness information. Obtain appropriate professional advice for important legal interpretations or organisation-specific decisions."],
];

const categories: Array<[string, Entry[]]> = [
  ["Owners & Responsibilities", [
    ["Assessment Owner", "Coordinates the overall assessment, helps questions reach the right people and follows up the resulting actions."],
    ["Process Owner", "Responsible for the business process being assessed and its actual collection, use, storage and sharing practices."],
    ["Risk Owner", "Accountable for managing an identified privacy risk and ensuring an appropriate response is decided and followed through."],
    ["Treatment Owner", "Responsible for implementing a specific risk treatment or corrective action."],
    ["Evidence Owner", "Responsible for providing, maintaining or locating evidence supporting completion of a treatment or control."],
    ["Approver / Management Approver", "A person authorised to formally approve a risk or governance decision. Approval should only be recorded by an authorised person."],
    ["Reviewer / Verifier", "Checks whether a treatment, control or evidence meets the applicable criteria. A reviewer does not automatically become the action owner."],
    ["Can one person have several roles?", "Yes. Smaller organisations may have one person performing several roles. Where internal governance requires separation, assign the roles to appropriate different people."],
  ]],
  ["Dates", [
    ["Assessment Date", "The date associated with the assessment snapshot or assessment activity."],
    ["Target / Due Date", "The date by which an action, treatment or decision is expected to be completed. It is a target, not proof of completion."],
    ["Review Date", "The date when a decision, risk, control or treatment should be reviewed again."],
    ["Treatment Due Date", "The expected completion date for a specific risk treatment or action."],
    ["Evidence Verification Date", "The date on which someone checks evidence and confirms whether it supports the claimed completion or control status."],
    ["Closure Date", "The date on which an item is formally considered closed after required completion and verification conditions are met."],
  ]],
  ["Statuses & Decisions", [
    ["Not Started", "The activity has not yet begun."],
    ["In Progress", "Work has started but the required outcome has not been completed."],
    ["Complete", "The required information or activity for that workflow stage has been completed. Complete does not automatically mean approved or verified."],
    ["Pending", "An action, decision, review or approval still requires completion. A residual-risk decision may be recorded while formal management approval remains pending."],
    ["Approved", "An authorised approver has formally accepted the relevant decision according to organisational governance."],
    ["Rejected", "An authorised decision-maker has not approved the relevant proposal or decision; follow the organisation's governance process for the next action."],
    ["Requires Review / Attention", "The information indicates that the user should inspect the item, provide information or take a recommended action."],
    ["Verified", "A reviewer has checked the relevant evidence or completion claim and found it satisfactory against the applicable criteria."],
    ["Closed", "The required treatment, verification and closure conditions have been satisfied. Closure should not be used simply because an action was started."],
  ]],
  ["Risk & Treatment", [
    ["Finding", "A privacy issue or condition identified by the assessment that requires attention, review or treatment."],
    ["Risk", "The potential for a privacy issue to cause harm, exposure or an unwanted outcome, considered using the application's risk model."],
    ["Inherent Risk", "The assessed risk before considering the effect of controls or treatments."],
    ["Residual Risk", "The risk that remains after existing or planned controls and treatments are considered."],
    ["Likelihood", "An indication of how likely the relevant risk scenario is considered to occur under the assessment model."],
    ["Impact", "An indication of the potential consequence or seriousness if the relevant risk scenario occurs."],
    ["Risk Score / Risk Rating", "An assessment indicator used to help prioritise privacy issues. Interpret it with the underlying finding, context and evidence rather than as a standalone legal conclusion."],
    ["Risk Acceptance", "A documented decision to retain a residual risk under defined conditions and accountability. Acceptance does not mean the risk is harmless or legal obligations do not apply."],
    ["Risk Treatment", "An action or set of actions intended to reduce, avoid, transfer or otherwise manage a risk."],
    ["Treatment Plan", "A plan describing what the organisation intends to do about a finding or risk, including actions, ownership, status and expected completion."],
  ]],
  ["Governance, Evidence & Closure", [
    ["Governance", "The roles, decisions, accountability, approvals and oversight used to manage privacy risks and obligations."],
    ["Evidence", "Information supporting the claim that a control, action or remediation activity exists or has been completed. Examples include policies, procedures, tickets, training records, configurations, contracts and approvals."],
    ["Is completing an action the same as verifying it?", "No. An action can be marked complete, while evidence may still need review. Verification confirms that the claimed completion or control is supported by appropriate evidence."],
    ["Is verification the same as closure?", "No. Verification checks evidence or completion. Closure is the final governance decision that required treatment, verification and closure conditions have been satisfied."],
  ]],
  ["Privacy & Legal", [
    ["Personal data", "Information relating to an identifiable individual."],
    ["Data Principal", "The individual to whom personal data relates."],
    ["Data Fiduciary", "An organisation or person that determines the purpose and means of processing personal data."],
    ["Data Processor", "A party that processes personal data on behalf of another organisation."],
    ["Processing", "Activities performed on personal data, such as collecting, storing, using, sharing or deleting it."],
    ["Consent", "A permission mechanism used where processing relies on consent and the applicable requirements are met."],
    ["Notice", "Information provided to a person about relevant personal-data processing."],
    ["Data minimisation", "Limiting collection and use to what is relevant and necessary for the intended purpose."],
    ["Retention", "How long personal data is kept."],
    ["Deletion", "Removing personal data when it is no longer required, subject to applicable requirements and legitimate retention needs."],
    ["Cross-border transfer", "Transfer or access involving personal data moving to or being accessed from another jurisdiction."],
    ["DPDP", "The Digital Personal Data Protection framework in India."],
  ]],
  ["Security & Technology", [
    ["Encryption", "A security technique that transforms information so it is not readable without the appropriate key or mechanism."],
    ["Authentication", "Establishing that a user or system is who or what it claims to be."],
    ["Authorisation", "Determining what an authenticated user or system is permitted to access or do."],
    ["Access control", "Rules and mechanisms that limit who or what can access information or systems."],
    ["API", "An interface that allows software systems to exchange data or invoke functions."],
    ["AI assistant", "A software system that can generate or transform content in response to prompts. Personal data entered into it may become part of a processing activity."],
    ["Messaging app", "A communication platform such as WhatsApp, Telegram, Signal or similar services."],
    ["Cloud service", "A computing or storage service provided through networked infrastructure rather than only local equipment."],
    ["Third party", "An external organisation or person involved in a processing, service or other business relationship."],
  ]],
  ["Assessment Terms", [
    ["Readiness score", "PrivacyMap's assessment indicator showing how the recorded answers align with its readiness model. It is not legal certification."],
    ["Risk score / risk level", "An indicator used to prioritise privacy issues."],
    ["Pass", "The relevant check or condition met the application's defined criterion."],
    ["Review / Attention", "The user should inspect the issue or provide additional evidence or action."],
    ["Fail", "The defined condition was not met."],
  ]],
];

const steps: Entry[] = [
  ["Step 1 — Organisation & industry", "Identify the organisation, assessment context and industry."],
  ["Step 2 — Business type", "Select the type of organisation or business operation being assessed."],
  ["Step 3 — Business process", "Identify the relevant process, such as registration, payments, recruitment or customer support."],
  ["Step 4 — Data entry / collection channels", "Identify where personal data enters the organisation, including web, email, messaging apps, APIs and AI assistants."],
  ["Step 5 — Personal data categories", "Identify the types of personal data involved."],
  ["Step 6 — How the data is handled", "Describe relevant handling, access, storage, sharing, retention and other processing practices."],
  ["Step 7 — Privacy risk assessment", "Assess conditions that may create privacy findings and risks."],
  ["Step 8 — Risk treatment & action", "Decide what should be done about identified risks and assign actions."],
  ["Step 9 — Residual Risk Decision & Approval", "Record the residual-risk decision, rationale, owner and review information. Formal approval, where required, is a separate governance activity."],
  ["Step 10 — DPDP Mapping", "Review how findings and controls relate to the applicable DPDP readiness areas."],
  ["Step 11 — Governance / approval", "Record accountable governance decisions and required approvals."],
  ["Step 12 — Remediation", "Track planned or outstanding actions toward completion."],
  ["Step 13 — Evidence & Closure", "Provide or reference evidence, verify remediation and close items when appropriate."],
];

export default function FAQPage() {
  const [tab, setTab] = useState<"faq" | "terms">("faq");
  const [query, setQuery] = useState("");
  const source: Entry[] = tab === "faq" ? faq : [...steps, ...categories.flatMap(([, entries]) => entries)];
  const filtered = useMemo(() => source.filter(([title, text]) => `${title} ${text}`.toLowerCase().includes(query.toLowerCase())), [source, query]);

  return (
    <main style={{ minHeight: "100vh", background: "#f8fafc", padding: "28px 16px 64px", color: "#0f172a" }}>
      <div style={{ maxWidth: 900, margin: "0 auto" }}>
        <header style={{ marginBottom: 24 }}>
          <div style={{ fontWeight: 800, letterSpacing: ".02em" }}>PRIVACYMAP INDIA</div>
          <h1 style={{ margin: "10px 0 8px", fontSize: "clamp(28px, 5vw, 42px)" }}>Help, FAQ & Terminology</h1>
          <p style={{ color: "#475569", lineHeight: 1.6, maxWidth: 760 }}>Plain-language guidance for using the assessment, understanding scores, fields, owners, dates and statuses, and interpreting common privacy, security, technical and governance terms.</p>
        </header>

        <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 14 }}>
          <button onClick={() => { setTab("faq"); setQuery(""); }} aria-pressed={tab === "faq"} style={{ border: "1px solid #cbd5e1", borderRadius: 10, padding: "10px 14px", background: tab === "faq" ? "#0f172a" : "white", color: tab === "faq" ? "white" : "#0f172a", fontWeight: 700 }}>Frequently Asked Questions</button>
          <button onClick={() => { setTab("terms"); setQuery(""); }} aria-pressed={tab === "terms"} style={{ border: "1px solid #cbd5e1", borderRadius: 10, padding: "10px 14px", background: tab === "terms" ? "#0f172a" : "white", color: tab === "terms" ? "white" : "#0f172a", fontWeight: 700 }}>Terminology & User Guide</button>
        </div>

        <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder={tab === "faq" ? "Search questions..." : "Search terms, fields, owners, dates or steps..."} aria-label="Search help" style={{ width: "100%", boxSizing: "border-box", padding: "12px 14px", border: "1px solid #cbd5e1", borderRadius: 10, background: "white", marginBottom: 16, fontSize: 16 }} />

        {tab === "terms" && !query && (
          <div style={{ display: "grid", gap: 12, marginBottom: 18 }}>
            {categories.map(([category, entries]) => (
              <section key={category} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 16px" }}>
                <h2 style={{ margin: "0 0 10px", fontSize: 18 }}>{category}</h2>
                <div style={{ display: "grid", gap: 8 }}>
                  {entries.map(([title, text]) => <details key={`${category}-${title}`}><summary style={{ cursor: "pointer", fontWeight: 700 }}>{title}</summary><p style={{ margin: "8px 0 0", color: "#475569", lineHeight: 1.6 }}>{text}</p></details>)}
                </div>
              </section>
            ))}
            <section style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: "14px 16px" }}>
              <h2 style={{ margin: "0 0 10px", fontSize: 18 }}>Assessment Steps</h2>
              <div style={{ display: "grid", gap: 8 }}>
                {steps.map(([title, text]) => <details key={title}><summary style={{ cursor: "pointer", fontWeight: 700 }}>{title}</summary><p style={{ margin: "8px 0 0", color: "#475569", lineHeight: 1.6 }}>{text}</p></details>)}
              </div>
            </section>
          </div>
        )}

        {(tab === "faq" || query) && (
          <section style={{ display: "grid", gap: 12 }}>
            {filtered.map(([title, text]) => <details key={title} style={{ background: "white", border: "1px solid #e2e8f0", borderRadius: 12, padding: "15px 16px" }}><summary style={{ cursor: "pointer", fontWeight: 750 }}>{title}</summary><p style={{ margin: "12px 0 2px", color: "#475569", lineHeight: 1.65 }}>{text}</p></details>)}
            {!filtered.length && <p style={{ color: "#64748b" }}>No matching information found.</p>}
          </section>
        )}

        <footer style={{ marginTop: 28, color: "#64748b", fontSize: 13, lineHeight: 1.6 }}>
          PrivacyMap is an assessment and readiness tool. It does not provide legal advice, certification or a guarantee of compliance.
        </footer>
      </div>
    </main>
  );
}
