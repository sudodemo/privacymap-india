# Phase G8 — Explainability & Intelligence Presentation

## Status
Implemented as a deterministic local explainability/presentation model for G2–G7 intelligence outputs.

## Purpose

G8 provides a common, user-friendly explanation contract so intelligence can be presented consistently without exposing internal engineering diagnostics or knowledge-base implementation details to ordinary assessment users.

## User-facing model

For each finding, G8 can explain:

1. **What was found** — the finding summary.
2. **Why it matters** — the assessment significance and, when available, related DPDP readiness context.
3. **What to do next** — the treatment recommendation.
4. **What evidence to record** — the evidence expectation.
5. **What governance follow-up may be needed** — approval, escalation, ownership or review context.
6. **Where the guidance comes from** — a concise PrivacyMap knowledge-base source statement.

## Presentation boundary

G8 is an explanation contract, not a new report UI. Existing A–F UI remains the presentation layer until explicit UI integration is undertaken.

Internal implementation identifiers, methodology versions, control IDs and engineering diagnostics should remain out of ordinary user-facing copy unless an administrator/debug view is intentionally introduced later.

## Safety

- Explanations are assessment guidance, not legal advice.
- No explanation may state that the organisation is legally compliant solely because an intelligence result was generated.
- No external AI/LLM service is used.
- Assessment responses remain local.
- The same finding and KB version produce deterministic explanation content.

## Version

Explainability methodology version: `1.0.0`.
