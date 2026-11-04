# Synth beta access and visual review

## Review basis

Reviewed the current Synth website and authenticated Synth workspace on 4 November 2026, the current Atomic website, Atomic's early-access screens, and the Atomic website implementation in `absmach/atomic-website`.

## Findings

| Area | Atomic pattern | Synth finding | Decision |
| --- | --- | --- | --- |
| First action | A single early-access request with a clear promise | Synth sends every visitor directly to sign-in, even while beta access is gated | Add a short request form on the product site; keep workspace sign-in as a secondary action |
| Qualification | Captures the idea plus lightweight context before email | Synth has the visitor's board brief but no durable request capture | Capture name, email, and board idea; do not ask for a long survey |
| Confirmation | Dedicated, calm confirmation state with the submitted idea repeated | No request confirmation exists | Replace the form in place with a clear “request received” state and explain what happens next |
| Operations | Listmonk-backed subscriber upsert, duplicate-safe behavior, honeypot, Turnstile, and optional thank-you email | No public beta-interest endpoint | Put validation, duplicate handling, rate limiting, and persistence in synth-ee; never expose mail credentials in the website |
| Visual proof | Atomic uses current light product imagery and labels the preview honestly | Synth's embedded app images were dark captures from an older surface and did not explain the full workflow | Lead with the populated RP2350 Edge Logger workspace, then show Parts & BOM, component inspection, schematic, light 3D, checks, and the JLCPCB quote/order surface as a single feature tour |

## Scope for this change

1. Add a visually quiet beta-request section to the Synth product page with name, email, and idea fields.
2. Post requests to a public synth-ee endpoint with an origin allow-list, strict field limits, honeypot handling, and duplicate-safe persistence.
3. Add an authenticated admin read surface so requests do not depend on direct database access.
4. Replace the stale lead app capture with the current light-mode RP2350 workspace and add feature captures for component selection, BOM inspection, schematic connectivity, light 3D review, checks, and JLCPCB manufacturing handoff.

The feature captures are kept as first-class website assets rather than simulated marketing illustrations. They mirror the Synth workspace surfaces and use the same RP2350/environmental-logger story throughout, so the page explains what a visitor can actually inspect before opening the app.

The form does not create an account, promise a launch date, or claim that a request guarantees access. It is an application for a beta conversation, matching Atomic's current language and the actual private-beta state of Synth.
