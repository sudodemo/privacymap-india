# Phase G3 — Risk Prioritisation

## Status
Implemented as a deterministic, local, explainable prioritisation layer.

## Purpose

G3 adds prioritisation to the canonical G2 finding set without replacing the established A–F risk engine.

## Model

Each canonical finding receives a bounded score derived from:

- existing finding severity;
- contextual category exposure;
- indicated data sensitivity; and
- language indicating a control/evidence gap.

The score is mapped to Critical, High, Medium, or Low priority.

The result retains the individual factors and an explanation so the priority is auditable and understandable.

## Safety boundaries

- This is an assessment prioritisation, not a statutory or legal risk rating.
- It does not determine DPDP compliance or non-compliance.
- It does not use an external AI/LLM service.
- Assessment responses remain local.
- Existing finding IDs are preserved.
- Existing A–F risk behaviour is not replaced.

## Version

Prioritisation algorithm version: `1.0.0`.

## Future refinement

G3 can later incorporate additional explicitly modelled factors such as processing scale, cross-border processing, third-party exposure, evidence state, and effective-date relevance once those inputs have stable contracts in the G4–G7 workstreams. Such changes must be versioned and regression-tested rather than silently altering historical results.
