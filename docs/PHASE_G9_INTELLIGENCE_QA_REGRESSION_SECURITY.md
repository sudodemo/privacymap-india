# Phase G9 — Intelligence QA, Regression & Security Validation

## Status
Implemented as a deterministic local validation layer for the G2–G8 intelligence pipeline.

## Validation coverage

G9 validates:

1. the static knowledge-base contract;
2. uniqueness of canonical finding IDs;
3. coverage of every canonical finding across prioritisation, treatment, evidence, governance and explainability outputs;
4. consistency of the knowledge-base version across generated intelligence;
5. local-generation guarantees.

## Regression principle

The G9 validator is intentionally additive. It does not replace the established A–F risk, continuity, security or report validation. Existing finding IDs and user-entered records remain authoritative.

## Security boundary

G9 checks that the intelligence results declare local generation. It does not claim to prove browser, network, deployment-header, dependency or device security; those remain covered by the existing E5/E6 controls.

## User experience

The validator is an engineering/QA capability. Its raw check identifiers and diagnostic messages should not be exposed to ordinary assessment users. If a release gate UI is introduced, present a simple pass/fail or readiness summary and reserve technical diagnostics for authorised maintainers.

## Version

Validation methodology version: `1.0.0`.

## G phase completion

G2 through G9 now provide the planned intelligence foundation: canonical findings, prioritisation, DPDP readiness, treatment, evidence, governance, explainability, and validation. Any future intelligence work should extend these versioned contracts rather than creating parallel scoring or finding models.
