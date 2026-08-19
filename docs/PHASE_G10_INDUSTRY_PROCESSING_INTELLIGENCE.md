# Phase G10 — Industry & Processing Intelligence Foundation

## Status
Specification approved for implementation. No assessment behaviour is changed by this document alone.

## Objective

Expand PrivacyMap India with a limited, scalable set of industry, business-process, processing-activity and data-entry/collection-channel contexts before Phase H public launch.

The design must extend the existing G2–G9 intelligence architecture rather than create parallel finding, risk or scoring models.

## Initial industry set

The first controlled taxonomy should cover:

1. Healthcare
2. Education
3. Financial Services / FinTech
4. E-commerce / Retail
5. IT / ITES / SaaS
6. Professional Services
7. Manufacturing
8. Telecommunications
9. Travel / Hospitality
10. Logistics / Transportation
11. Real Estate
12. Government / Public Sector

The taxonomy must be extensible without changing the core assessment engine.

## Business-process taxonomy

Create reusable process categories such as:

- customer acquisition and registration;
- account management;
- employee recruitment and administration;
- payroll;
- customer support;
- marketing and sales;
- payments;
- identity verification / KYC;
- vendor management;
- procurement and contracts;
- physical access and CCTV;
- IT administration;
- cloud hosting;
- analytics;
- fraud detection;
- complaints and grievances;
- data sharing;
- retention and deletion;
- incident and breach management;
- business continuity.

Industry-specific processes should compose these reusable concepts rather than duplicate them.

## Processing-activity model

Represent a processing activity independently from the industry. The model should be capable of capturing:

- purpose;
- data subjects;
- data categories;
- collection channel;
- systems/platforms;
- recipients/processors;
- storage/retention context;
- cross-border context;
- children/minor involvement;
- automated decision-making/AI involvement;
- optional organisation-defined notes.

The model must remain compatible with local assessment continuity, import validation and existing report/export behaviour.

## Data-entry / collection-channel taxonomy

Technology providers must not become hard-coded assessment fields. Use controlled channel categories with optional platform/provider metadata.

Initial categories:

- Web — website, web form, portal
- Mobile — mobile application
- Email
- Telephone / call centre
- Messaging apps — WhatsApp / Telegram / Signal / similar
- Social media — Instagram / Facebook / LinkedIn / similar
- AI prompts / AI assistants
- Physical — paper forms and physical documents
- File exchange — spreadsheets, documents, uploads
- API / system integration
- Device / sensor — CCTV, IoT, biometric and similar devices
- In-person — reception, branch, service desk and similar
- Other

### Messaging apps

Do not create separate top-level assessment fields for WhatsApp, Telegram, Signal or other individual messaging products. They belong under one **Messaging apps** collection channel. The optional platform field can capture the specific product where useful.

### AI prompts / AI assistants

AI prompts / AI assistants must be a first-class collection channel, not an item hidden under Other.

The model should optionally capture:

- AI provider/tool;
- purpose of use;
- whether personal data is entered;
- data category entered;
- whether the provider is external/internal;
- retention/training configuration where known;
- whether outputs influence a decision;
- cross-border context where known.

Do not infer that using an AI assistant is itself a violation. The assessment must establish the relevant processing facts first.

## Initial industry/process examples

Healthcare may include patient registration, appointments, clinical records, diagnostics, pharmacy, insurance/TPA and patient communications.

Education may include admissions, student records, parent/guardian information, attendance, examinations, learning platforms, transport and communications.

Financial Services / FinTech may include onboarding, KYC, account management, payments, transaction monitoring, fraud detection, credit assessment, collections and support.

E-commerce / Retail may include registration, ordering, payments, delivery, returns/refunds, marketing and customer analytics.

These are starting mappings, not exhaustive industry compliance rules.

## Intelligence integration

G10 must enrich the existing G2–G9 pipeline through validated context. It must not replace canonical findings, risk prioritisation, DPDP readiness, treatment, evidence, governance, explainability or validation.

Context may improve:

- finding explanations;
- risk relevance;
- treatment recommendations;
- evidence expectations;
- governance prompts;
- DPDP control mapping.

A context selection alone must never create a finding without a validated rule/mapping.

## UX principles

- Keep the initial assessment understandable for non-technical users.
- Prefer category + optional provider/platform detail over a long list of vendor-specific fields.
- Do not force users to understand legal or technical terminology.
- Avoid unnecessary questions when a process is not selected.
- Maintain mobile usability and no horizontal overflow.
- Preserve existing clickable finding navigation to Key Privacy Findings.

## Security and continuity requirements

- All G10 context must pass the existing import/package validation rules.
- No external service is required for G10.
- No assessment response should be transmitted to a G10 service.
- Provider names are metadata, not executable integrations.
- G10 must not introduce secrets, credentials or third-party API calls.
- Existing E5/E6 controls remain authoritative for browser and deployment security.

## Implementation sequence

### G10.1
Create versioned industry taxonomy.

### G10.2
Create reusable business-process taxonomy.

### G10.3
Create validated processing-activity model.

### G10.4
Create collection-channel taxonomy, including first-class AI prompts / AI assistants and grouped messaging apps.

### G10.5
Create limited industry/process mappings.

### G10.6
Add assessment UX with conditional process/channel questions.

### G10.7
Integrate validated context into G2–G9 intelligence.

### G10.8
Run regression, continuity, import/export, responsive and security checks.

## Definition of done

G10 is complete when:

- the 12 initial industries are represented by stable IDs;
- reusable processes and collection channels are represented by stable IDs;
- messaging apps are grouped rather than vendor-specific top-level fields;
- AI prompts / AI assistants are a first-class collection channel;
- processing activities can capture the defined contextual attributes;
- context survives local autosave, export/import and restore;
- existing assessment findings and navigation remain stable;
- G2–G9 consume context without creating a second finding/risk model;
- mobile UX remains usable;
- no new external data flow is introduced;
- regression and security validation passes.

## Scope boundary

G10 does not introduce payment, report monetisation, external AI APIs, automated legal advice, certification, or claims that an industry-specific assessment establishes compliance.

## Next phase

After G10 is implemented and validated, proceed to Phase H — Public Launch / Growth.
