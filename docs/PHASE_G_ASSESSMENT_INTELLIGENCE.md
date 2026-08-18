# Phase G — Assessment Intelligence

**Status:** Specification approved for implementation planning  
**Repository:** `sudodemo/privacymap-india`  
**Depends on:** Phases A–F, including E1–E6 security controls and F1–F5 assessment experience  
**Current public posture:** Free assessment; monetisation remains intentionally disabled

## 1. Purpose

Phase G turns the existing PrivacyMap India assessment from a structured questionnaire into a deterministic, explainable privacy decision-support system.

The objective is not to provide legal advice or an automated declaration of DPDP compliance/non-compliance. The objective is to interpret assessment inputs consistently, identify areas requiring attention, prioritise risks, map findings to relevant DPDP controls, and produce actionable treatment, evidence, governance, and residual-risk information.

Phase G must build on the existing architecture rather than replace it.

## 2. Core architectural principles

1. **Local-first processing** — assessment responses remain in the browser unless a separately approved future feature explicitly changes this architecture.
2. **Knowledge-driven intelligence** — legal and regulatory knowledge lives in versioned knowledge-base data, not scattered through UI components.
3. **Deterministic results** — identical validated assessment state and knowledge-base version must produce the same intelligence output.
4. **Explainability** — material findings, priorities, mappings, and recommendations must have an understandable reason.
5. **Stable finding identity** — findings need stable identifiers so references across the report and assessment can resolve to the canonical finding.
6. **No opaque AI dependency** — Phase G must not require an external LLM/API to make assessment decisions.
7. **Legal safety** — results must not be presented as legal advice or an authoritative certification of compliance.
8. **Security preservation** — existing E1–E6 controls, import validation, local continuity, and output sanitisation remain mandatory.
9. **Backward compatibility** — existing assessments, continuity packages, exports, and reports must remain usable unless a documented migration is required.
10. **Mobile parity** — intelligence must not depend on viewport, device type, or desktop-only behaviour.

## 3. Phase G workstreams

### G1 — Intelligence & Knowledge Base Foundation

Establish the versioned intelligence contract around the existing knowledge base.

Requirements:

- Version knowledge-base inputs.
- Keep DPDP provisions, effective dates, controls, findings, rules, treatments, evidence guidance, and legal references structured and separate from UI code.
- Define explicit schemas for intelligence inputs and outputs.
- Record the knowledge-base version used to generate a result.
- Avoid silently changing historical assessment interpretation when knowledge-base content changes.

Acceptance criteria:

- Intelligence rules can consume the existing KB without UI-specific hard coding.
- Knowledge-base version is available in the resulting assessment/report metadata.
- Invalid or unsupported KB data fails safely.

### G2 — Intelligent Finding Engine

Convert validated assessment answers into canonical privacy findings.

Pipeline:

```text
Assessment state
      ↓
Input normalisation
      ↓
Applicable rules
      ↓
Finding generation
      ↓
Deduplication
      ↓
Canonical finding set
```

Requirements:

- Stable finding IDs.
- Deterministic rule evaluation.
- Explicit handling of unanswered or unavailable inputs.
- Deduplicate findings without losing relevant source context.
- Preserve finding references across Key Privacy Findings, Risk Assessment, Risk Governance, Risk Treatment & Action, Residual Risks, Remediation, and Evidence & Closure.
- Canonical destination for navigation remains **Key Privacy Findings**.

Acceptance criteria:

- The same assessment produces the same finding IDs and finding set.
- No duplicate finding is created solely because it appears in multiple report sections.
- Every derived finding can identify the assessment conditions/rules that caused it.

### G3 — Risk Prioritisation

Produce an explainable priority for each finding.

Potential factors include:

- Severity and impact.
- Likelihood where supported by the assessment model.
- Nature/sensitivity of personal data.
- Children/student data.
- Processing scale/scope.
- Third-party sharing.
- Cross-border processing.
- Security exposure.
- Existing controls.
- Evidence status.
- Regulatory/effective-date relevance.

Requirements:

- Use a documented deterministic scoring/ranking model.
- Preserve the underlying factors so the priority can be explained.
- Avoid implying that the calculated priority is a statutory or legal risk rating.
- Use consistent terminology across assessment and report.

Acceptance criteria:

- Priority changes only when relevant input factors change.
- Users can understand the main reason a finding has its priority.
- Missing inputs do not silently become favourable assumptions.

### G4 — DPDP Readiness Intelligence

Map findings and assessment responses to relevant DPDP requirements and controls.

Possible states include:

- `NOT_ASSESSED`
- `REVIEW_REQUIRED`
- `EVIDENCE_RECORDED`
- `TREATMENT_REQUIRED`
- Other states only where explicitly defined by the knowledge-base contract.

Requirements:

- Use the existing effective-date metadata.
- Distinguish applicability, assessment status, treatment status, and evidence status.
- Do not automatically label an organisation “DPDP compliant” or “DPDP non-compliant”.
- Explain why a control is relevant and why attention is indicated.

Acceptance criteria:

- A finding can resolve to its relevant control(s) using the KB.
- Effective-date context is preserved.
- User-facing language remains assessment/readiness language rather than legal certification.

### G5 — Treatment Intelligence

Turn findings into actionable remediation/treatment plans.

Pipeline:

```text
Finding
  ↓
Risk priority
  ↓
Recommended treatment
  ↓
Owner
  ↓
Priority/timeframe
  ↓
Evidence expected
  ↓
Closure
```

Requirements:

- Recommendations should be contextual to the finding.
- Preserve owner, timeframe, status, and action information already supported by the application.
- Avoid presenting generic recommendations where the KB provides a specific treatment.
- Treatments must remain editable by the organisation.

Acceptance criteria:

- Each actionable finding can produce a clear recommended treatment where one exists.
- Treatment records remain compatible with continuity and report/export schemas.

### G6 — Evidence Intelligence

Help users identify useful evidence for treatment and closure.

Examples may include:

- Privacy notices.
- Consent records.
- Data-processing/data-sharing agreements.
- Data-flow records.
- Vendor due-diligence records.
- Security policies or test evidence.
- Breach/incident procedures.
- Governance approvals.

Requirements:

- Evidence guidance must be contextual to the finding/control.
- Clearly distinguish “evidence recorded” from “control proven effective”.
- Never fabricate evidence.
- Preserve existing evidence references, owner, notes, and verification state.

Acceptance criteria:

- Users can understand what evidence would help demonstrate treatment progress.
- Existing evidence records remain intact through autosave, import/export, and reporting.

### G7 — Governance Intelligence

Connect findings and treatments to accountability and decision-making.

Potential governance information:

- Responsible owner.
- Business owner.
- Privacy/DPO owner where applicable.
- Security/IT owner where applicable.
- Approval state.
- Risk acceptance/decision.
- Review date.
- Escalation requirement.

Requirements:

- Governance data remains organisation-controlled.
- Recommendations must not silently assign accountability without an explicit user-editable basis.
- Governance outputs must remain compatible with existing report sections.

### G8 — Explainability

Every material intelligence result must be explainable to a non-technical user.

Examples:

> **Why did this finding appear?**
>
> The assessment indicates that personal data is shared with third parties and the assessment does not record the relevant documented arrangement.

> **Why is this a high priority?**
>
> The priority reflects the assessment factors identified for this finding, such as data sensitivity, scope, exposure, and the current control/evidence status.

Requirements:

- Explanations must be generated from known rule/factor data.
- Do not expose internal rule IDs, phase IDs, implementation identifiers, or engineering diagnostics to ordinary users.
- Technical diagnostics may remain available to developers/security reviewers through appropriate internal mechanisms.
- Explanations must not overstate certainty.

### G9 — Intelligence QA & Regression

Create deterministic regression coverage for the intelligence engine.

Test categories:

- Every finding rule.
- Positive and negative cases.
- Boundary conditions.
- Missing/unanswered responses.
- Conflicting responses.
- Duplicate findings.
- Effective-date changes.
- Invalid imported values.
- Large assessments.
- Imported/restored assessments.
- Existing report navigation.
- Export compatibility.
- Mobile/desktop parity.
- Regression against known assessment fixtures.

Required property:

> The same validated assessment state, application version, and knowledge-base version must produce the same intelligence output.

## 4. Data-flow contract

Phase G should follow this high-level local data flow:

```text
User responses
      ↓
Validated assessment state
      ↓
Normalisation
      ↓
Versioned local knowledge base
      ↓
Deterministic intelligence engine
      ↓
Findings / risk / controls / treatments / evidence / governance
      ↓
Existing report + continuity + exports
```

No assessment response should be sent to an external intelligence service as part of Phase G.

## 5. Security requirements

Phase G must preserve all existing E1–E6 controls.

In particular:

- Imported JSON/package data remains untrusted input.
- Existing schema, identifier, size, nesting, and value validation remains mandatory.
- Intelligence calculations must not execute arbitrary imported code.
- Findings and report anchors must be safely generated.
- Export formats must retain existing injection protections.
- No secrets or private credentials may enter client-side intelligence data.
- No assessment payload may be added to URLs.
- Knowledge-base content must be treated as application-controlled data.

## 6. Performance and scalability

Phase G should remain suitable for browser-local operation.

Requirements:

- Avoid unnecessary recalculation when unrelated answers change.
- Prefer pure functions for rule evaluation and scoring.
- Keep intelligence datasets structured and cacheable.
- Avoid large duplicated objects in React component state.
- Avoid blocking the UI for normal assessment sizes.
- Ensure mobile devices receive the same results without requiring desktop-only processing.

## 7. User experience principles

Intelligence should help users act, not overwhelm them.

User-facing language should:

- Prefer plain language.
- Explain technical/privacy concepts where needed.
- Show the most important issues first.
- Avoid exposing internal E1–E6, rule IDs, implementation IDs, or engineering diagnostics.
- Provide actionable next steps.
- Keep finding titles as the primary navigation control.
- Keep the canonical finding destination in Key Privacy Findings.

## 8. Legal and regulatory safety

PrivacyMap is an assessment/readiness tool and must not present its automated outputs as legal advice, certification, or a definitive legal conclusion.

The intelligence engine should use wording such as:

- “requires attention”
- “assessment indicates”
- “review recommended”
- “treatment recommended”
- “evidence recorded”

Avoid automated statements such as:

- “You are DPDP compliant.”
- “You are DPDP non-compliant.”
- “This guarantees compliance.”

Effective dates and legal references must come from the versioned knowledge base.

## 9. Monetisation boundary

Future monetisation remains intentionally disabled during Phase G.

The planned future flow is:

```text
Assessment completed
        ↓
Free results
        ↓
Unlock Full Assessment Report
        ↓
Payment / UPI
        ↓
Payment confirmation
        ↓
Full PDF / JSON / CSV / XML / Markdown
```

Phase G must not activate payment collection, payment processing, or report paywalls. Any future monetisation capability must be implemented behind an explicit feature/capability boundary and must not compromise the free local assessment experience.

## 10. Completion criteria for Phase G

Phase G is complete only when:

- G1–G9 acceptance criteria are implemented or explicitly marked not applicable with a documented reason.
- Existing A–F functionality passes regression testing.
- Intelligence is deterministic and explainable.
- Finding identity and cross-section navigation remain stable.
- Local-only assessment data flow remains intact.
- Import/export/continuity remain compatible.
- Mobile and desktop produce equivalent intelligence results.
- Security regression tests pass.
- The knowledge-base version used for results is identifiable.
- User-facing output does not expose internal engineering diagnostics.
- No monetisation/payment functionality is enabled.

## 11. Implementation sequence

Implementation should proceed incrementally:

1. **G1** — establish/confirm intelligence contracts and KB interfaces.
2. **G2** — implement/normalise canonical finding generation.
3. **G3** — implement explainable risk prioritisation.
4. **G4** — strengthen DPDP control/readiness mapping.
5. **G5** — strengthen contextual treatment recommendations.
6. **G6** — strengthen evidence guidance and closure intelligence.
7. **G7** — strengthen governance outputs.
8. **G8** — expose user-friendly explanations.
9. **G9** — complete deterministic regression and security testing.

Each workstream should be committed and verified before moving to the next where practical.

## 12. Change-control rule

If implementation discovers that an existing A–F architectural assumption conflicts with this specification, do not silently change the architecture. Document the conflict, preserve security and continuity, and update this specification before making the architectural change.

---

**Phase G principle:**

> PrivacyMap should not merely count answers. It should explain what the answers indicate, why an issue matters, what should be reviewed or treated, what evidence would help, and who should act — while keeping the assessment local, deterministic, explainable, and security-conscious.
