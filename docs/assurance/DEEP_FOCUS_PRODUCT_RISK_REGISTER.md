# Deep Focus product risk inventory

Reconciled 2026-10-22 against main `ecd6d348093292c27b06751815eb09694a41665a`.
Owner: Deep Focus product owner. Qualitative triage only; no measured probability,
new security design, risk acceptance or changed release rule. [Pack authority](README.md).
Original IDs retained; historical branch observations are not current defects.

| ID | Risk / current evidence | Qualitative concern | Residual status / next evidence |
| --- | --- | --- | --- |
| DF-R-001 | Wrong baseline/project: SDK56 main retained; stored EAS ID matches historical SDK57 text, private account not inspected | High configuration/release impact | OPEN: owner/account/signing/build provenance; no upgrade or project reassignment here |
| DF-R-002 | False completion/credit: current engine rejects early completion; local progression receipts/tests exist | High integrity concern; old source defect superseded | OPEN native/trusted-server acceptance, not a current confirmed early-completion bug |
| DF-R-003 | Data exposure: owner-scoped SQLite21, retained legacy JSON and secure credential adapter are distinct stores | High privacy concern | OPEN actual backup, platform protection, logs, export/delete and threat review; SQLite is not an encryption proof |
| DF-R-004 | Loss/duplication across interruption: transaction and disk rollback/restart fixtures exist | High reliability concern | OPEN Android/iOS disk/process/upgrade/account-switch evidence; local tests do not close lifecycle risk |
| DF-R-005 | Claims exceed shipped behavior: matrix shows partial auth/web/resources/AI/cloud/classroom | High trust/release concern | OPEN truthful claims and complete required-surface acceptance; no scope cut inferred |
| DF-R-006 | SDK/AI/provider data handling unknown: manifest/source is not live traffic/retention evidence | High privacy concern | OPEN actual minimized data inventory, provider/SDK review and disclosures under existing contracts |
| DF-R-007 | Account/data lifecycle incomplete: account/Portal/privacy modules exist, not accepted end-to-end | High release concern, applicable now to required account scope | OPEN actual in-app/external deletion, export, revocation, retention and propagation evidence; not deferred as optional |
| DF-R-008 | Inaccessible controls/locales: semantics/static checks do not prove real assistive technology | High exclusion/recovery concern | OPEN TalkBack/VoiceOver/keyboard/large-text/motion/si-ta-en native and browser evidence |
| DF-R-009 | Native/dependency/config regressions despite preserved SDK56 | High compatibility concern | OPEN supported-platform builds/manifests/permissions; no new SDK acceptance |
| DF-R-010 | Dependency/supply-chain weakness: manifests/lockfile exist | High security concern | OPEN candidate advisory/SBOM/licence review and triage; no current vulnerability-free claim |
| DF-R-011 | Secret/signing exposure: no secret audit conducted in this task | Potential critical impact; exposure not asserted | OPEN authorized secret/history/build-access review; no rotation or privileged-data access authorized by register |
| DF-R-012 | Clock/period anomalies: timestamp validation/clock-error handling exists | High trust/reliability concern | OPEN actual device clock/timezone tests; elapsed wall time does not prove attention |
| DF-R-013 | Harmful pressure: existing no-penalty, Emergency-exit and focus-safe-ad rules remain | Meaningful safety concern | OPEN copy/interaction/AI/notification and user-feedback acceptance under existing policy |
| DF-R-014 | Store/website disclosure mismatch with actual SDK/data/commercial behavior | High release/privacy concern | OPEN named-build accurate notices/forms/claims and review; no submission performed |
| DF-R-015 | Regression escapes without CI: local suites/results exist, no listed Actions/workflow evidence | High verification concern | OPEN repeatable candidate records/CI evidence where admitted; no-suite claim superseded |
| DF-R-016 | Required web/Portal falsely substituted by landing page or mobile success | High scope/access/privacy concern | OPEN real supported account/settings/subscription/privacy/browser/operational evidence |
| DF-R-017 | Classroom/resource/minor/commercial scope treated as automatically enabled | High privacy/eligibility concern | OPEN trusted sharing, import/viewer, cloud/entitlement and qualified legal gates; real-minor access remains disabled |

Review with [evidence register](DEEP_FOCUS_EVIDENCE_REGISTER.md), current canonical
security/safety/data contracts and qualified reviewers where required. Existing
owner risk/release authority and legal/platform obligations are unchanged.
A document or local pass cannot accept residual risks, waive independent review
or invent an approval/expiry. No risk is closed by merging this inventory.
