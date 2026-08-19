# Phase G7 — Governance Intelligence

## Status
Implemented as a deterministic local governance guidance layer over canonical findings and the existing residual-risk decision records.

## Purpose

G7 identifies governance attention required for findings, including approval, escalation, accountability and review expectations. It complements the existing governance workflow rather than replacing user-entered decisions.

## Inputs

- G2 canonical findings and stable finding IDs;
- existing residual-risk decision records;
- current risk level;
- existing approval and escalation state;
- versioned knowledge-base metadata.

## Output

Each finding receives:

- residual-risk level;
- governance attention state;
- decision authority;
- accountable-owner requirement;
- approval status;
- review requirement;
- escalation requirement;
- plain-language reason;
- KB version;
- governance methodology version.

## Governance attention states

- `ESCALATION_REQUIRED` — high/critical risk or an explicit escalation requires heightened governance attention.
- `APPROVAL_REQUIRED` — the recorded or inferred decision requires documented approval.
- `REVIEW_REQUIRED` — the finding remains subject to governance review.
- `NO_ADDITIONAL_ATTENTION` — no additional governance action is indicated by the current recorded decision.

## Safety boundaries

- Governance guidance is not legal advice or a compliance certification.
- The engine does not silently change an organisation's risk decision, owner, approval or review date.
- Existing user-entered governance records remain authoritative.
- No external AI/LLM service is required.
- Assessment data remains local.
- Results are deterministic for the same findings, decisions and KB version.

## Version

Governance methodology version: `1.0.0`.

## Future refinement

G7 can later integrate governance roles from the assessment profile, explicit policy/risk-tolerance settings and evidence closure state. Any change to governance rules must be versioned and regression-tested.
