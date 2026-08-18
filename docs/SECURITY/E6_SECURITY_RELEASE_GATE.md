# PrivacyMap India — E6 Security Assurance & Release Gate

Version: E6.1

## Purpose

E6 is the final security assurance gate after E1 Input Security, E2 State & Import Security, E3 Output Security, E4 Browser/Client Security & OWASP hardening, and E5 Privacy & Data Protection Assurance.

E6 does not introduce authentication or a server-side assessment database. It validates that the browser-first architecture is safe to release and that production configuration matches the intended security controls.

## Automated browser checks

- HTTPS / secure browser context
- localStorage availability
- Web Crypto availability
- valid application origin

## Production verification checklist

### HTTP security headers

- [ ] Content-Security-Policy is present and matches `next.config.ts`.
- [ ] `X-Content-Type-Options: nosniff` is present.
- [ ] `X-Frame-Options: DENY` is present.
- [ ] CSP `frame-ancestors 'none'` is present.
- [ ] `Referrer-Policy: strict-origin-when-cross-origin` is present.
- [ ] `Permissions-Policy` is present with unnecessary device capabilities disabled.
- [ ] `Cross-Origin-Opener-Policy: same-origin` is present.
- [ ] `Cross-Origin-Resource-Policy: same-origin` is present.
- [ ] `Origin-Agent-Cluster: ?1` is present.
- [ ] `X-DNS-Prefetch-Control: off` is present.
- [ ] `X-Permitted-Cross-Domain-Policies: none` is present.
- [ ] Production HTTPS response contains HSTS with the configured max-age and `includeSubDomains`.

### Build and supply chain

- [ ] `npm run build` succeeds on the exact release commit.
- [ ] TypeScript compilation has zero errors.
- [ ] No client-visible secrets are present in source or generated bundles.
- [ ] `npm audit` or the approved dependency scanner has been run against the exact lockfile.
- [ ] High/critical dependency findings have been reviewed and dispositioned.

### Local-only data-flow verification

- [ ] Complete an assessment with DevTools Network open.
- [ ] Confirm assessment responses are not posted to an application endpoint.
- [ ] Confirm local autosave uses browser storage only.
- [ ] Confirm import reads the selected local file and does not upload it.
- [ ] Confirm export is generated client-side.
- [ ] Confirm no assessment payload is appended to URLs, query strings, or referrer values.

### Import security

Test packages containing:

- [ ] malformed JSON
- [ ] invalid schema/version
- [ ] unexpected properties
- [ ] oversized strings
- [ ] oversized arrays
- [ ] deep nesting
- [ ] invalid identifiers
- [ ] HTML-like markup
- [ ] unsafe URLs/schemes
- [ ] duplicate or conflicting assessment IDs

Expected result: reject safely without crashing the application or executing imported content.

### Output security

Test hostile values containing:

- [ ] `=`, `+`, `-`, `@` CSV formula prefixes
- [ ] commas and quotes
- [ ] XML special characters
- [ ] Markdown control characters
- [ ] HTML-like tags
- [ ] unsafe filenames
- [ ] unsafe report anchors

Expected result: output remains data-only and does not create executable markup or spreadsheet formulas.

### OWASP applicability

The browser-only architecture materially reduces some traditional server-side risks, but the following remain relevant:

| OWASP area | Applicability | E6 verification |
|---|---|---|
| Broken Access Control | Low / architectural | No authenticated server resources; verify no hidden privileged endpoints |
| Cryptographic Failures | Medium | HTTPS/HSTS; do not claim localStorage is encrypted |
| Injection | High | Input boundary + imported package + export tests |
| Insecure Design | High | Threat model and release checklist |
| Security Misconfiguration | High | HTTP security headers and deployment checks |
| Vulnerable Components | Medium | Dependency audit |
| Identification/Auth Failures | Low | No user authentication by design |
| Software/Data Integrity Failures | Medium | Import validation and release commit verification |
| Logging/Monitoring Failures | Low/architectural | No sensitive assessment logging by design |
| SSRF | Low | No server-side user-controlled URL fetching |

## E6 sign-off rule

E6 must **not** be marked fully closed solely because browser-side automated checks pass.

The release is:

- **READY** only when automated checks pass and all deployment verification items are completed.
- **CONDITIONAL** while manual production verification remains outstanding.
- **BLOCKED** if an automated security check fails.

## Important architectural statement

PrivacyMap is designed as a public, browser-first assessment application. Assessment responses are intended to remain on the user's device and are not intentionally uploaded to PrivacyMap servers.

This statement does not mean that a browser/device is immune to extensions, malware, screen capture, operating-system monitoring, or compromise outside the application's control.
