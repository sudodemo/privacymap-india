# Phase G6 — Evidence Intelligence

## Status
Implemented as a deterministic, local evidence-guidance layer over the G2 canonical finding set and versioned knowledge base.

## Purpose

G6 helps users understand what evidence may support treatment and closure of a finding. It does not upload, inspect, or fabricate evidence.

## Behaviour

For each canonical finding, the engine resolves the applicable KB control where available and returns its evidence expectation. It also provides plain-language guidance for verification and closure.

If no finding-specific KB evidence expectation exists, the engine provides a conservative generic instruction to record evidence supporting the treatment.

## Evidence state

The current intelligence layer starts every generated guidance record as `NOT_RECORDED`. Existing organisation-entered evidence records are not overwritten. A future integration can map validated evidence state into `RECORDED` once the existing evidence schema is explicitly connected to the intelligence contract.

## Safety boundaries

- Evidence is never fabricated.
- “Evidence recorded” does not mean a control is proven effective.
- The engine does not determine legal compliance.
- No external AI/LLM service is used.
- Assessment data remains local.
- Evidence guidance is deterministic for the same canonical finding and KB version.

## Output

Each guidance record contains:

- stable finding ID;
- finding title;
- evidence expectation;
- evidence status;
- verification guidance;
- closure guidance;
- reason;
- KB version;
- methodology version.

## Version

Evidence methodology version: `1.0.0`.
