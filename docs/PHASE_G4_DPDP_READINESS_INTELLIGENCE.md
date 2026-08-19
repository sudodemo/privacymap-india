# Phase G4 — DPDP Readiness Intelligence

## Status
Implemented as a deterministic, local mapping layer over the versioned DPDP control knowledge base.

## Purpose

G4 connects canonical assessment findings to the existing DPDP control knowledge base and provides readiness-oriented status, effective-date context, evidence expectations, remediation guidance, and source references.

## Important boundary

G4 is an assessment/readiness aid. It does not certify compliance, determine non-compliance, or provide legal advice.

## Current statuses

- `NOT_ASSESSED` — the available assessment information is insufficient to conclude that the control is satisfied.
- `REVIEW_REQUIRED` — reserved for future explicit review-state inputs.
- `EVIDENCE_RECORDED` — reserved for future evidence-state integration.
- `TREATMENT_REQUIRED` — a related canonical finding indicates that the control should be reviewed and treated where applicable.

The implementation intentionally does not infer compliance merely because no finding was generated.

## Effective dates

Control effective dates are read from the versioned KB. The current implementation reports whether each date is current, future, or unknown relative to the browser's current date.

## Output

Each control readiness record contains:

- control ID and title;
- Act and Rules references;
- effective date and effective-date status;
- readiness status;
- requirement/question;
- evidence expectation;
- remediation guidance;
- source URL;
- plain-language reason;
- KB version.

## Security and privacy

The calculation is local and deterministic. No assessment response is sent to an external service. Imported assessment data remains subject to the existing continuity/import validation before it can reach intelligence processing.

## Version

Methodology version: `1.0.0`.

## Future G4 refinement

Future iterations can add explicit assessment-key contracts and evidence/treatment-state inputs so that `REVIEW_REQUIRED` and `EVIDENCE_RECORDED` are driven by validated state rather than inference. Such changes must be versioned and regression-tested.
