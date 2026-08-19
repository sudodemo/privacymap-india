# Phase G10 — Industry & Processing Intelligence Foundation

## Status
**Implemented foundation — ready for build verification and UX/regression validation.**

G10 now provides the controlled industry/business-type taxonomy, reusable business-process taxonomy, scalable collection-channel taxonomy, and a derived processing-activity model. Existing assessment answers remain the authoritative state model.

## Implemented

- 12 active initial industries with stable IDs.
- 24 initial business types spanning the 12 industries.
- Reusable cross-industry business processes.
- Existing school-specific processes retained alongside reusable processes.
- Collection channels covering Web, Mobile, Email, Telephone, Messaging apps, Social media, AI prompts / AI assistants, Physical, File exchange, API / integration, Device / sensor, In-person and Other.
- WhatsApp / Telegram / Signal are grouped under **Messaging apps** rather than separate top-level fields.
- **AI prompts / AI assistants** are a first-class collection channel.
- Optional platform/provider detail is supported through the existing custom-entry-point mechanism without creating vendor-specific assessment fields.
- A typed processing-activity model and a derivation helper that builds processing-activity context from the existing assessment answers without creating a second state model.
- G10 taxonomy access is exposed through the knowledge-base layer.
- Steps 3 and 4 can now use the reusable G10 process/channel taxonomy for all enabled business types while retaining the existing school-specific content where available.

## Architecture

```text
Industry
   ↓
Business Type
   ↓
Business Process
   ↓
Processing Activity (derived from existing answers)
   ↓
Collection Channels
   ↓
Existing assessment answers
   ↓
G2–G9 intelligence
```

Technology providers are metadata, not assessment logic. New messaging or AI products can therefore be recorded without adding a new top-level assessment field.

## AI-specific UX rule

Selecting **AI prompts / AI assistants** does not itself create a privacy finding. The assessment must establish the relevant processing facts before any risk rule can apply.

The interface explains that an AI provider/tool can be recorded as optional context and that PrivacyMap does not connect to that service or transmit assessment data to it.

## Remaining G10 validation work

The implementation must still pass the normal GitHub/Vercel build and regression checks, including:

- local autosave/resume;
- JSON/package export/import/restore;
- mobile responsive behaviour;
- existing finding navigation;
- E5/E6 security controls;
- G9 intelligence validation.

No new external data flow is introduced.

## Scope boundary

G10 does not introduce payment, report monetisation, external AI APIs, automated legal advice, certification, or claims that an industry-specific assessment establishes compliance.

## Next phase

After G10 validation passes, proceed to Phase H — Public Launch / Growth.
