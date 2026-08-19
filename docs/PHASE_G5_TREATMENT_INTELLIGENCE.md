# Phase G5 — Treatment Intelligence

## Status
Implemented as a deterministic local treatment recommendation layer over the G2 canonical finding set and versioned knowledge base.

## Purpose

G5 turns each canonical finding into an actionable treatment record without replacing the existing treatment UI or organisation-entered treatment data.

## Behaviour

For each finding the engine resolves, where available:

- the KB finding template;
- the template's recommended action;
- the relevant DPDP control evidence expectation;
- the finding's existing severity/priority.

If no specific KB treatment exists, the engine falls back to the existing finding recommendation and otherwise asks the user to review and record an appropriate treatment.

## Output

Each treatment contains:

- stable finding ID;
- finding title;
- recommended action;
- treatment priority;
- treatment status;
- evidence expectation;
- plain-language reason;
- KB version;
- treatment methodology version.

## Safety boundaries

- Recommendations are guidance, not legal advice.
- Recommendations do not certify compliance.
- Existing user-entered treatment records are not overwritten by this layer.
- No external AI/LLM service is required.
- Assessment data remains local.
- The engine is deterministic for the same canonical finding and KB version.

## Version

Treatment methodology version: `1.0.0`.

## Future refinement

G5 can later incorporate the G3 priority score, treatment status, owner, target date, governance state and evidence state once those contracts are explicitly integrated. Such changes must be versioned and regression-tested.
