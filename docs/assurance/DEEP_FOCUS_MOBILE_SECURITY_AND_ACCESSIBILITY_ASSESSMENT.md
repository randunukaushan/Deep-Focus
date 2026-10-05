# Deep Focus Mobile Security and Accessibility Assessment

## 1. Document Control

| Field | Value |
|---|---|
| Owner | Deep Focus product owner / maintainer |
| Assessment date | 2026-10-06 |
| Product baseline | Intended SDK57 branch upgrade/sdk-57; branch and EAS identity need confirmation |
| Status | Initial desk mapping; not a penetration test, conformance audit, or certificate |
| Classification | Internal |

## 2. Assessment Rules

The OWASP Mobile Application Security Verification Standard (MASVS), Testing Guide (MASTG), and Weakness Enumeration (MASWE) are used as a control and test planning framework. Before a formal verification pass, record the exact MASVS release/tag/commit and MASTG/MASWE snapshot used. Assess only controls applicable to the actual release architecture; justify exclusions.

Do not add expensive anti-tampering or root/jailbreak controls without a threat-based need. MASVS resilience controls are reviewed proportionately because client-side tamper resistance cannot replace server-side security or safe product design.

## 3. MASVS Mapping

| MASVS area | Deep Focus question / required control intent | Initial status | Evidence and next capture |
|---|---|---|---|
| MASVS-STORAGE | Are local session, task, settings, token, cache, log, and backup data minimized and stored with appropriate platform protections? | Needs Review | JSON session storage observed on main; inspect SDK57 source, Android/iOS backup settings, file exposure, logs, uninstall/reset/delete behavior, and encrypted-storage need. Capture MASTG procedures/results. |
| MASVS-CRYPTO | Is cryptography needed? If used, are vetted platform/library APIs and key storage used correctly? | Pending | No custom cryptographic implementation identified in inspected focus source. Avoid inventing cryptography. If tokens or sensitive fields require encryption, design the key lifecycle and verify platform-backed storage. |
| MASVS-AUTH | Are login, recovery, session lifecycle, logout, authorization, and protected routes secure? | Pending / future until account feature is confirmed | Auth screens are in scope, but provider/backend/token implementation is unverified. Trace actual flows; validate server-side authorization; test reset, replay, logout and token revocation. If no accounts ship, document applicability and re-evaluate before adding them. |
| MASVS-NETWORK | Are all network connections encrypted, host validation safe, cleartext disabled, and data minimized? | Pending | No complete data-flow/network inventory or release traffic capture. Inspect generated platform configs and network requests; test TLS failures and debug/prod endpoints. |
| MASVS-PLATFORM | Are deep links, intents, notifications, clipboard, screenshots, OS interactions, and permission requests safe? | Pending | Expo Router scheme and app config observed; inspect actual links, native manifests, notifications, OS sharing, backups, and exported components for release build. |
| MASVS-CODE | Are inputs validated, dependencies maintained, debugging disabled, production configuration safe, and builds reproducible? | Needs Review | Package lock and lint script exist; no test/typecheck/SCA workflow or CI evidence found. Add dependency scan/SBOM plan, input validation review, production build inspection and retained command results. |
| MASVS-RESILIENCE | Are anti-tampering/anti-debug controls proportionate to realistic product threats? | Risk-based; no control claim | Assess distribution and abuse risks. Do not treat root detection/obfuscation as a substitute for secure storage, correct state transitions, or server validation. Record decisions and limitations. |
| MASVS-PRIVACY | Are purposes, data collection, permissions, identifiers, consent, retention, deletion, and store declarations appropriate and accurate? | Needs Review | Privacy inventory started; verify every data path, included SDK and shipped store label. Capture a privacy review tied to release build. |

## 4. Security Verification Plan

### 4.1 Minimum review set

- Inspect dependency lockfile and release SBOM; run an appropriate vulnerability audit and triage transitive findings.
- Review secrets in current configuration and repository history; check that no privileged API key is embedded in the mobile app.
- Inspect production build flags, debug symbols/logging, environment endpoints, deep links, app backup settings, and app permissions.
- Test local state validation with missing, malformed, stale, duplicate, and unexpected records.
- Test state transitions and idempotency for start, pause, resume, completion, cancellation, and duplicate completion/history writes.
- Test network behavior only for features that actually make network calls.
- Review authentication/authorization only after confirming the live provider and backend path.
- Use MASWE entries to classify observed weaknesses and create linked defects; do not mark weaknesses absent without testing.

### 4.2 Security evidence limitations

The current assessment is a repository/document desk review. No MobSF or equivalent static analysis report, dynamic instrumentation session, proxy/network capture, independent penetration test, SBOM, secret-scan report, or formal MASVS verification report was observed.

## 5. Accessibility Assessment

WCAG 2.2 provides accessibility criteria for web content. WCAG2ICT is informative guidance for applying WCAG concepts to non-web ICT; native app checks must also use current Android and Apple guidance. This document does not claim WCAG conformance.

| ID | Requirement / check | Android evidence | iOS evidence | Current status |
|---|---|---|---|---|
| DF-ACC-01 | Core actions have accessible names, roles, values, and state; decorative icons are excluded. | TalkBack inspection for start/pause/resume/complete/cancel/setup controls. | VoiceOver inspection of same flows. | Pending |
| DF-ACC-02 | Focus order follows a clear reading/action sequence; modal and route focus is restored appropriately. | TalkBack navigation and accessibility tree check. | VoiceOver navigation/focus check. | Pending |
| DF-ACC-03 | Timer state is understandable and changes do not overwhelm screen-reader users. | Verify timer role/announcement frequency and completion announcement. | Verify timer role/announcement frequency and completion announcement. | Pending |
| DF-ACC-04 | Text resizing and display settings do not hide controls or truncate important meaning. | Large font/display-size test. | Dynamic Type / larger text test. | Pending |
| DF-ACC-05 | Text and interactive components have sufficient contrast in light/dark themes; meaning is not conveyed by color alone. | Automated contrast plus real screen review. | Automated contrast plus real screen review. | Pending |
| DF-ACC-06 | Interactive targets are comfortably operable and spaced; controls have clear pressed/disabled states. | Touch-target audit and motor interaction test. | Touch-target audit and motor interaction test. | Pending |
| DF-ACC-07 | Motion and animation are purposeful and respect reduced-motion preferences. | Remove/reduce animation setting and device test. | Reduce Motion test and device test. | Pending |
| DF-ACC-08 | Focus and break flows can be completed without time-dependent inaccessible actions; users can cancel or recover. | Complete full flow with TalkBack enabled. | Complete full flow with VoiceOver enabled. | Pending |
| DF-ACC-09 | Text labels, errors, validation, and instructions are plain, localized-ready, and not icon-only. | Review every current screen and validation path. | Review every current screen and validation path. | Pending |
| DF-ACC-10 | Keyboard/switch access is supported where the platform/app context requires it. | Verify with supported input/accessibility services. | Verify switch/assistive control where available. | Pending |

## 6. Accessibility Acceptance Record

For each test, record OS version, device, app commit/build, enabled accessibility settings, tester, screen/flow, observed barriers, screenshots or video with personal data redacted, defect ID, fix commit, and retest result. A code-level accessibility label is not a substitute for testing actual assistive technology behavior.

## 7. Framework Sources Checked

- OWASP MASVS: https://mas.owasp.org/MASVS/
- OWASP MASTG: https://mas.owasp.org/MASTG/
- OWASP MASWE: https://mas.owasp.org/MASWE/
- WCAG 2.2: https://www.w3.org/TR/WCAG22/
- WCAG2ICT: https://www.w3.org/TR/wcag2ict-22/
- Android accessibility: https://developer.android.com/guide/topics/ui/accessibility
- Apple accessibility: https://developer.apple.com/documentation/accessibility
