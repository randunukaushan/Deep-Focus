# Deep Focus privacy and data inventory

Reconciled 2026-10-22, main `ecd6d348093292c27b06751815eb09694a41665a`.
Owner: Deep Focus product owner. **PARTIAL source inventory, not a privacy policy,
legal review, completed data-flow audit or store declaration.** No retention,
controller/processor agreement, consent method or new control is selected here.
Canonical [security](../SECURITY.md), [data](../DATA_MODEL.md), [decisions](../revision/01-REQUIREMENTS-AND-DECISIONS.md)
and [pack scope](README.md) retain authority; no private user/account data inspected.

## 1. Data families

| ID | Family / purpose | Current source observation | Unverified handling / release evidence |
| --- | --- | --- | --- |
| DF-DATA-01 | Session timing/state/history/progression | [SQLite21](../../src/features/storage/local-database.ts), [session adapter](../../src/features/focus/session-storage.ts); owner namespaces, terminal transactions/outbox and active break records | Actual OS protection/backups, device migration/failure, trusted sync and deletion/retention; no claim all data is encrypted |
| DF-DATA-02 | Task title and stable task/session links | [Task store](../../src/features/tasks/task-storage.ts), session title snapshot/taskId | Free text can be sensitive; actual export/delete/history/notification/log behavior |
| DF-DATA-03 | Preferences: focus/break, language, theme/motion | Owner-scoped local settings; [October 20 five-step record](../revision/evidence/ONBOARDING-AND-AUTH-POLISH-2026-10-20.md) | Not all future cycle/long-break settings verified; device presentation is not automatically cloud settings |
| DF-DATA-04 | Tasks/goals/periods/progress | [Goals](../../src/features/goals/), [progress](../../src/features/progress/), SQLite | Exact supported cloud/export/delete/retention coverage, timezone and actual account isolation |
| DF-DATA-05 | Onboarding/assessment records | Five-step language-first flow and retained legacy version-1 records | Do not present old role/health-profile questionnaire as current onboarding; do not rewrite old answers or infer medical facts |
| DF-DATA-06 | Account IDs/email/tokens | Auth source/dependency/secure-storage adapter present per [matrix](../V1_FEATURE_MATRIX.md); credentials separate from domain SQLite | Live callbacks, expiry/revocation/account switch, secure platform backup and authorization; no credential values stored here |
| DF-DATA-07 | AI proposals/context/saved plans | [Planning source](../../src/features/planning/); exact confirmation/lifecycle boundaries | Actual approved provider payload/retention, trusted usage, deletion and evaluation; no provider activation or personal data sent |
| DF-DATA-08 | Diagnostics/crashes/analytics/IDs | No complete runtime SDK/network inventory conducted here | Do not infer absent collection; actual build SDK inventory, traffic, privacy terms, disclosed minimal telemetry |
| DF-DATA-09 | OS/device/app metadata | Declared Expo/native dependencies/config | Actual collection/recipient/retention and platform declarations unknown |
| DF-DATA-10 | Permissions/capabilities | app.json includes native plugins and Apple sign-in configuration | Generated manifest/entitlements/privacy strings, least-privilege denial/revocation and actual release settings |
| DF-DATA-11 | Store/beta developer/tester records | No private console or current candidate record inspected | Access/classification, tester consent, age eligibility and platform retention under approved operations |
| DF-DATA-12 | Support/feedback/defect attachments | Support/operational acceptance not established | Safe intake/redaction/retention/access, no credentials/private task screenshots by default |
| DF-DATA-13 | User-owned resources / optional paid cloud | [Resource source](../../src/features/resources/); local default and disabled cloud transfer adapter | Native file URI/import/viewer/permissions, optional cloud consent/quota/billing/retention and export/delete; no academic content supply |
| DF-DATA-14 | Website/Account Portal private state | [Next.js source](../../web/src/app/), partial [Portal](../../web/src/components/account-portal.tsx) | Server/browser identity, private-cache isolation, settings/subscription/privacy integration and safe logs; no live hosted proof |
| DF-DATA-15 | Education/teacher/classroom information | [Education source](../../src/features/education/), bounded draft helpers | Explicit selected sharing, recipient/owner boundaries and actual trusted tests; no whole private timetable/history disclosure; minor access disabled |
| DF-DATA-16 | Ads/AI/paid-cloud subscription/entitlements | [Monetization source](../../src/features/monetization/), contracts | Providers/prices/allowances/eligible audience and verified transactions remain gated; no client-only grants or real charges |

These are family-level observations, not an exhaustive field/processor inventory.
Legacy JSON is retained under the approved migration contract; no cleanup,
automatic signed-in ownership claim or local-to-cloud upload occurs in this task.

## 2. Required unresolved evidence

Before any authorized beta/data processing or release, use existing contracts to
identify exact fields/purposes, controller/entity, recipients/subprocessors,
jurisdictions, lawful/consent basis where applicable, collection/default settings,
storage/backup protections, retention, export/deletion and recovery/incident
handling. Do not fill unknown retention/region/age policy with guessed values.
Real-minor pilots/production remain disabled pending qualified legal review and
separately implemented controls. Interface language is not country/consent.

Store disclosures must describe actual shipped app and SDK behavior, not the
intended architecture or a successful synthetic test. Official sources checked
2026-10-22: [Google User Data](https://support.google.com/googleplay/android-developer/answer/10144311),
[Apple review](https://developer.apple.com/app-store/review/guidelines/) and
[App Privacy](https://developer.apple.com/app-store/app-privacy-details/).
These include data disclosures and relevant account-deletion obligations;
qualified project/jurisdiction assessment and actual workflow verification remain.
No compliance conclusion is made.

Refresh on candidate/config/provider/SDK/data-flow/scope change. Link actual
results through [evidence register](DEEP_FOCUS_EVIDENCE_REGISTER.md); document-only
review does not complete a privacy assessment or authorize production collection.
