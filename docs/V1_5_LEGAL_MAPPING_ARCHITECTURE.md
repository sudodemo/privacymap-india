# V1.5 Legal Mapping Architecture

## Principle

Keep legal knowledge separate from application logic.

## Control object

Each legal control contains:
- id
- title
- Act reference
- Rule reference
- applicability
- effective date
- requirement
- assessment question
- evidence expectation
- remediation
- source URL
- last verified
- KB version

## Status semantics

NOT_ASSESSED:
No usable assessment information.

REVIEW_REQUIRED:
Assessment information indicates an unknown, missing or potentially weak control.

EVIDENCE_RECORDED:
The relevant assessment information is populated and evidence may exist.

These statuses are deliberately not named COMPLIANT / NON-COMPLIANT.

## Effective dates

The application must not treat every notified provision as immediately applicable. Effective-date logic belongs in the KB and should be tested.

## Future overlays

The same control engine can later support:
- sectoral education requirements
- healthcare/privacy requirements
- payment/financial overlays
- contractual requirements
- ISO/SOC2 control mappings

Each overlay should remain independently versioned.
