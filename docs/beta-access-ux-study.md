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
| Visual proof | Atomic uses current light product imagery and labels the preview honestly | Synth's embedded app images were dark captures from an older surface | Use a current RP2350 Edge Logger review-workspace capture as the lead view, with the populated board and status visible; keep the deeper views available only where they are verified |

## Scope for this change

1. Add a visually quiet beta-request section to the Synth product page with name, email, and idea fields.
2. Post requests to a public synth-ee endpoint with an origin allow-list, strict field limits, honeypot handling, and duplicate-safe persistence.
3. Add an authenticated admin read surface so requests do not depend on direct database access.
4. Replace the stale lead app capture with the current RP2350 workspace; add further feature captures only after they have been retaken from an authenticated deployed workspace.

The form does not create an account, promise a launch date, or claim that a request guarantees access. It is an application for a beta conversation, matching Atomic's current language and the actual private-beta state of Synth.
