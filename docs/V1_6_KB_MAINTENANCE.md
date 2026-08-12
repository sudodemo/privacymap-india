# V1.6 Legal Intelligence & Knowledge-Base Maintenance

## Why this version exists

Legal requirements change independently of application code. PrivacyMap therefore treats legal content as a versioned data product.

## Maintenance controls

- KB version
- release manifest
- SHA-256 integrity
- change log
- source verification date
- effective date
- effective-date basis
- structural regression tests
- applicability matching

## Status vocabulary

- NOT_ASSESSED
- REVIEW_REQUIRED
- EVIDENCE_RECORDED

Legal compliance is intentionally not represented as a simple yes/no score.

## Effective dates

The DPDP Act commencement notice provides different dates for different provisions. The notified Rules likewise have phased commencement. PrivacyMap must use provision/rule-specific effective dates rather than a single Act-level effective date.

## Source hierarchy

1. Gazette / official notification
2. India Code consolidated Act
3. MeitY official Rules / notifications
4. Secondary sources only for discovery, never as the authoritative legal record

## Update procedure

1. Review official source.
2. Record source and verification date.
3. Create new KB version.
4. Update affected controls.
5. Run regression tests.
6. Review effective dates.
7. Record change log.
8. Publish release manifest.
9. Re-test representative assessments.
