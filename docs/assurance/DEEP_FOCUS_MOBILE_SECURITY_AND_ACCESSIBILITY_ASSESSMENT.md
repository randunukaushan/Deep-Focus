# Deep Focus security and accessibility assessment preparation

Reconciled 2026-10-22, main `ecd6d348093292c27b06751815eb09694a41665a`.
Owner: Deep Focus product owner. **PARTIAL mapping, not a performed penetration
test, MASVS/WCAG conformance audit, independent review or certificate.**
[Baseline references](DEEP_FOCUS_PRODUCT_ASSURANCE_BASELINE.md) and [pack authority](README.md)
apply. Existing security/accessibility controls are not changed or accepted here.

## 1. Mobile mapping and remaining evidence

Formal verification must pin applicable MASVS control IDs, MASTG procedures,
MASWE weaknesses, source versions, build/environment and actual results.
These family-level questions are not a complete control-by-control assessment.

| Area | Current source/evidence context | Still unverified / next actual assessment |
| --- | --- | --- |
| MASVS-STORAGE | Owner-scoped SQLite21, retained legacy JSON and separate credential adapter, not the old JSON-only session store | Native backup/protection/encryption need, logs/cache/export/delete and account-switch isolation at real boundaries |
| MASVS-CRYPTO | Platform/provider crypto and key handling require actual inventory | No blanket no-crypto finding; review actual usage/key lifecycle under existing security contract |
| MASVS-AUTH | Selected provider/adapters, owner activation and partial Portal exist; local negative suites indexed | Live identity/callback/revocation, trusted authorization, guessed IDs/two owners and privacy lifecycle |
| MASVS-NETWORK | Backend/transport/provider adapters exist | Actual traffic/TLS/endpoints/failure behavior and minimal payloads, not just schemas |
| MASVS-PLATFORM | Router scheme/plugins/native configuration present | Generated manifests/deep links, permissions, clipboard/screenshots/notifications/backups and installed-build behavior |
| MASVS-CODE | Lockfiles and extensive local suites exist; dated local runs indexed | Candidate advisories/SBOM/reproducible build/debug config, secret history review and real CI; no vulnerability-free claim |
| MASVS-RESILIENCE | Threat-based applicability only | No newly required root detection/anti-tampering selected; client defenses do not replace trusted controls |
| MASVS-PRIVACY | Source-family inventory and privacy modules exist | Actual SDK/processor/retention/deletion, minor eligibility and truthful disclosures |

Do not mark these passed based on local suite counts. Independent qualified
review remains required for HIGH-risk implementations. PR14/20 development-only
exceptions do not waive this assessment or release gates. No security control,
root-detection policy or cryptographic design is introduced by the mapping.

## 2. Website/Portal boundary

MASVS is a mobile reference, not a complete web security verification.
Required Website/Portal need their own existing
[web17](../revision/17-WEBSITE-PORTAL-AND-RELEASE-RUNBOOK.md) and
[security](../SECURITY.md) acceptance: real identity/session lifecycle,
authorization, CSRF/origin where applicable, safe private-cache behavior,
account switching, recovery, subscription/privacy operations, safe content/
logging and provider/operational failures. Browser tests, deployment and trusted
negative results remain NOT_RUN here. No new web framework/profile is adopted.

## 3. Accessibility matrix — actual device/browser results pending

[WCAG 2.2](https://www.w3.org/TR/WCAG22/) is a web Recommendation;
[WCAG2ICT](https://www.w3.org/TR/wcag2ict-22/) is informative non-web guidance
(official sources checked 2026-10-22). Use native platform guidance as well.
Static semantics/token contrast cannot certify rendered or assistive behavior.

| ID | Existing acceptance topic | Android / iOS evidence needed | Website / Portal evidence needed |
| --- | --- | --- | --- |
| DF-ACC-01 | Names/roles/state and decorative icons | TalkBack / VoiceOver core actions | Browser accessibility tree and screen reader |
| DF-ACC-02 | Reading/focus order, modal/route return | Actual navigation/recovery focus | Keyboard/tab/dialog focus and safe return |
| DF-ACC-03 | Calm understandable timer/state changes | Announcement rate, errors and completion | Relevant status/loading/error announcements, not a required browser timer |
| DF-ACC-04 | Text/display scaling | Large font / Dynamic Type, no lost controls | Zoom/reflow, no hidden private/account actions |
| DF-ACC-05 | Contrast and non-color meaning | Both themes on rendered devices | Rendered public/private states and focus indicators |
| DF-ACC-06 | Operable targets and states | Actual touch/assistive input | Pointer/keyboard targets and disabled/error states |
| DF-ACC-07 | Reduced motion | OS and app preference respected | Browser preference and nonessential animation |
| DF-ACC-08 | Usable recovery/Emergency and timing | Core focus/break/recovery paths, safety retained | Session expiry/recovery without inaccessible time limits |
| DF-ACC-09 | Localized copy/errors | si/ta/en script/layout and qualified language review | Required localized public/Portal routes and errors |
| DF-ACC-10 | Alternative input where supported | Switch/keyboard and platform services | Complete keyboard-only operation and relevant assistive input |

All rows require actual candidate evidence; no device/browser row executed here.
Current static contrast/route checker result is recorded only in PR15 task evidence.
For each future run capture commit/build, environment/OS/device/browser,
settings, test steps/expected/actual, tester/reviewer, redacted artifact and
defect/fix/retest. Do not upload real personal content or secrets for testing.

## 4. Limits and refresh

No current-candidate penetration assessment, network capture, secret/SBOM audit,
native build or full rendered accessibility pass was conducted in this task.
Refresh on affected UI/data-flow/dependency/config change and before candidate
acceptance. Use [risk register](DEEP_FOCUS_PRODUCT_RISK_REGISTER.md) for open
residuals; product remains NOT_READY, not certified or independently reviewed.
