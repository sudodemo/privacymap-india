# PrivacyMap India — F5 Mobile Security Review

Version: F5.1

## Purpose

F5 verifies that the responsive/mobile implementation preserves the existing E1–E5 security controls. Mobile is not a separate security architecture: the same application boundaries, validation, browser protections and local-data model must remain effective on phone and tablet browsers.

This review does not claim that the user's mobile device is secure. Device compromise, screenshots, OS monitoring, malicious software and browser compromise remain outside application control.

## E1 — Input Security

- [ ] Assessment fields remain validated on phone and tablet layouts.
- [ ] Touch controls cannot bypass required-field or value validation.
- [ ] Long text and unexpected characters do not create horizontal overflow or unsafe HTML.
- [ ] Validation messages remain visible and understandable at mobile widths.
- [ ] Keyboard/autofill interactions do not bypass validation.

**Expected:** identical validation decisions on desktop and mobile for the same input.

## E2 — State & Import Security

- [ ] Local autosave continues to use browser-local storage only.
- [ ] Resume restores the same validated assessment state on mobile.
- [ ] JSON import remains treated as untrusted input.
- [ ] Package import remains validated before being stored.
- [ ] Corrupted, oversized, malformed and unexpected input is rejected safely.
- [ ] Import does not upload the selected file to an application endpoint.
- [ ] Imported assessment identifiers cannot silently overwrite a different assessment without the existing continuity rules permitting it.

**Expected:** mobile file pickers and browser storage do not change the security boundary.

## E3 — Output Security

- [ ] Findings, treatment text, evidence and governance values remain rendered as data, not executable markup.
- [ ] Long exported/report values wrap safely on mobile.
- [ ] CSV, XML, Markdown and filename sanitisation remain unchanged by responsive UI changes.
- [ ] Finding navigation anchors remain generated from validated report data.
- [ ] Mobile report links do not place assessment content in the URL query string.

**Expected:** responsive presentation changes layout only; it does not weaken output encoding/sanitisation.

## E4 — Browser / Client Security & OWASP Hardening

- [ ] HTTPS / secure browser context works on supported mobile browsers.
- [ ] Web Crypto availability is preserved where browser-side security utilities require it.
- [ ] CSP remains enforced on mobile browsers.
- [ ] HSTS remains enforced on production HTTPS responses.
- [ ] Clickjacking protection remains effective.
- [ ] Content-type and referrer protections remain effective.
- [ ] No responsive component introduces an unsafe third-party resource.
- [ ] Mobile navigation does not expose assessment data through query parameters, fragments or referrers beyond the intended finding anchor.
- [ ] Relevant OWASP risks remain covered by the existing browser-first architecture and E6 release gate.

## E5 — Privacy & Data Protection Assurance

- [ ] Local storage availability check works on mobile.
- [ ] Secure-context check works on mobile.
- [ ] URL data-exposure check works on mobile.
- [ ] Third-party resource check behaves consistently on mobile.
- [ ] Privacy assurance messaging remains understandable to non-technical users.
- [ ] Browser/device limitations are not presented as a guarantee of device security.

The existing browser assurance checks are intentionally limited to what the application can observe. fileciteturn73file0L2-L2

## F4 continuity regression checks

- [ ] Saved Locally is usable without horizontal scrolling.
- [ ] Resume is touch-friendly.
- [ ] Export Package opens the native mobile download flow correctly.
- [ ] Import Assessment Package opens the native mobile file picker.
- [ ] Import JSON Assessment opens the native mobile file picker.
- [ ] Create New Assessment reaches the Organisation Name field.
- [ ] No continuity control is hidden or inaccessible at narrow widths.

## Mobile viewport review

Test at minimum:

- 320px wide phone
- 375px wide phone
- 390px wide phone
- 430px wide phone
- tablet portrait

Verify:

- no horizontal page overflow;
- no clipped buttons or form controls;
- no text rendered outside cards;
- focus states remain visible;
- touch targets remain comfortably usable;
- report finding links still navigate to the canonical Key Privacy Findings destination.

## Release decision

F5 is **PASS** when the E1–E5 regression checks and mobile continuity checks above pass, with no new security regression introduced by responsive implementation.

F5 does **not** close E6's production verification requirements. E6 remains the final release gate and remains CONDITIONAL until its manual production checks are completed. The existing E6 design explicitly separates browser-observable checks from deployment verification. fileciteturn74file0L2-L2
