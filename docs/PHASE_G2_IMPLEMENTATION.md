# Phase G2 — Intelligent Finding Engine

**Status:** Implemented foundation

## What is implemented

Phase G2 now has a deterministic canonical finding layer in `app/assessment/lib/canonicalFindingEngine.ts`.

The layer:

- consumes the existing deterministic `RiskResult`;
- preserves existing finding IDs for backward compatibility with Phases A–F;
- removes duplicate findings by stable ID;
- resolves findings to the versioned knowledge-base finding template where a safe match exists;
- resolves the associated knowledge-base risk rule where available;
- records the knowledge-base version used for the finding metadata;
- distinguishes `KB_MAPPED` findings from `LEGACY_UNMAPPED` findings;
- provides a stable lookup by finding ID;
- performs all processing locally.

The report builder now consumes this canonical finding layer before producing report findings. This establishes the canonical finding identity without changing the existing risk scoring behaviour or breaking existing treatment/report navigation.

## Compatibility decision

The existing risk engine contains established A–F behaviour and a broader set of user-facing heuristics than the current declarative KB rule file. G2 therefore does **not** replace those heuristics with a narrower KB rule set in one step.

Instead, G2 introduces the canonical identity and KB mapping boundary first. Future G2 refinement can migrate individual rules from the legacy engine into declarative KB rules with fixture-based regression tests, without changing all assessment behaviour at once.

## Security and privacy

- Assessment responses remain in the browser.
- The KB is read-only application data.
- Imported assessment data continues to pass through existing validation before risk processing.
- No external AI/LLM/API is used.
- No rule ID or engineering diagnostic is exposed to ordinary users by this implementation.

## Acceptance status

- Stable finding IDs: **implemented**
- Deterministic canonicalisation: **implemented**
- Deduplication: **implemented**
- KB template/rule source metadata: **implemented**
- Existing report/navigation compatibility: **preserved**
- Full migration of every legacy heuristic to declarative KB rules: **deferred intentionally** to avoid an unsafe behavioural change and to allow fixture-based migration in a subsequent G2 refinement.
