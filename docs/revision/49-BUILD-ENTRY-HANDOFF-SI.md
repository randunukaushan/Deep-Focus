# Deep Focus — Final Build Guide

## Clickable UI reference — 2026-10-04

[Home / Plan / Focus prototype](../../artifacts/ui-prototype/index.html) සහ
[Luna interaction notes / actual checks](../../artifacts/ui-prototype/README.md)
දැන් තිබේ. මෙය sample-data browser preview එකකි; production Expo implementation
හෝ final visual approval නොවේ. Existing app code වෙනස් කර නැත.

දිනය: 2026-10-03, Asia/Colombo.

**මේ ගොනුවෙන් පටන් ගන්න.** මෙය existing documentation එක භාවිත කරලා
implementation ආරම්භ කිරීමට සහ release දක්වා වැඩ ගෙනියන්න ඇති ප්‍රධාන guide එකයි.
විස්තර නැවත පිටපත් කරනවා වෙනුවට අදාළ contract එකට සම්බන්ධ කර තිබෙනවා.
මුල් coding prompt එක §3; සම්පූර්ණ build order එක §4; feature එකකට අදාළ
ඉතිරි වැඩ සහ decisions §§5–6 තුළ තිබෙනවා.

මේ consolidation pass එකෙන් guide එක අවසන් කරනවා. මෙතැන් සිට documentation
වෙනස් කරන්නේ තෝරාගත් implementation task එකේ අවශ්‍යතාවක්, තහවුරු කළ defect
එකක් හෝ අලුත් owner decision එකක් සඳහායි. සාමාන්‍ය “continue” එකකට තවත්
planning packet එකක් එකතු කිරීම ඊළඟ default step එක නොවේ.

Guide එක අවසන් වීමත් සියලු feature specifications අනුමත වීමත් වෙනස් දේවල්.
මිල, legal facts, provider settings සහ HIGH design review වැනි ඉතිරි inputs
ඒවා අවශ්‍ය feature එකටම බැඳලා තිබෙනවා. ඒ නිසා මුල් test harness එකට අවශ්‍ය
නැති තීරණයක් නිසා එම task එක නතර කරන්න එපා. අදාළ feature එකට අවශ්‍ය
නොවිසඳුණු contract එකක් තිබුණොත් ඒක අනුමාන කර implementation කරන්නත් එපා.

### Product scope retained

| Area | Retained direction | Scope owner |
| --- | --- | --- |
| Product | Personal/Professional සහ Education සඳහා shared focus, planning සහ recovery core | [Vision](../PROJECT_VISION.md), [product direction](03-PRODUCT-AND-EXPERIENCE.md) |
| Release | Android, iOS, Public Website සහ Account Portal; full productivity web පසුව | [32 release map](32-JANUARY-RELEASE-SCOPE-AND-DECISIONS.md) |
| Education | ශ්‍රී ලංකා O/L, A/L සහ ඉහළ අධ්‍යාපන අවධි; personal teacher organizer සහ bounded classroom sharing | [11](11-SRI-LANKA-EDUCATION-CONTRACTS.md), [39](39-BOUNDED-CLASSROOM-SHARING-CONTRACT.md) |
| Resources | Userගේම PDF/JPG/PNG, links, book/page references; local default, selected optional paid cloud; app එකෙන් lessons/papers සපයන්නේ නැහැ | [12](12-LOCAL-RESOURCES-AND-WORK-PLANNING.md), [33](33-PAID-CLOUD-ADMISSION-AND-RECOVERY.md), [34](34-LOCAL-RESOURCE-IMPORT-AND-RECOVERY.md) |
| Experience | Home / Plan / Focus / Progress / Profile; Rewards inside Progress; blue/navy/coral direction, light/dark, si/ta/en; language country pack එකෙන් ස්වාධීනයි | [15](15-EXPERIENCE-AND-NAVIGATION-BUILD-CONTRACT.md), [20](20-SETTINGS-PROGRESS-AND-UNITS.md) |
| Commercial/AI | Limited free AI, optional paid AI, unobtrusive launch ads; core app works without AI | [06](06-MONETIZATION-AND-ENTITLEMENTS.md), [22](22-REWARD-GOAL-AND-AI-WIRE-CONTRACT.md) |
| Control | No missed-work XP loss or health prediction; ordinary exit configurable beforehand, Emergency exit retained | [19](19-SAFETY-AND-COMMITMENT-CONTRACT.md) |
| Future scope | Integrations, advanced professional/team workflows සහ අනෙකුත් enterprise extensions ඒවායේ current placement එක අනුව | [05](05-WEB-AND-INTEGRATIONS.md), 07 FUT cards and 32's complete DF-001–080 map |

මෙම සාරාංශයෙන් CANDIDATE/CONDITIONAL/LATER feature එකක් January scope එකට
promote කරන්නේ නැහැ. Optional onboarding expansion, custom motivation,
Return Ticket/Outcome Receipt සහ වෙනත් differentiated features සඳහා 32හි
placement හා අදාළ card එක පරීක්ෂා කරන්න. කිසිදු approved feature එකක් මෙම
guide එකෙන් කපා නැහැ; measured date risk එකකදී approved deferral process එක භාවිත කරන්න.

## 1. දැන් පටන් ගත හැකි තැන

මුල් coding task එක **L-02A: timer domain regression test harness**.
එයට අවශ්‍ය source, expected results, files සහ commands පහතින් දක්වා තිබෙනවා.
එය app එකේ timer bugs හඳුනාගන්න මුල් පියවරයි. සියලු launch features සඳහා
decisions අවසන් වන තුරු මේ bounded foundation එක සැලසුම් කිරීම නතර විය යුතු නැහැ.

මේ handoff එක documentation deliverable එකක්. Owner implementation පටන් ගන්න
කියන විට පහත task එක භාවිත කරන්න. මේ ගොනුවෙන් app implementation, HIGH review,
paid tools හෝ publication ස්වයංක්‍රීයව අනුමත වෙන්නේ නැහැ.

ප්‍රධාන source index:

- [Documentation map](../DOCUMENTATION_MAP.md): අදාළ authoritative contract තෝරන තැන.
- [Playbook](07-LUNA-IMPLEMENTATION-PLAYBOOK.md): වැඩ කරන dependency order එක.
- [Readiness §6](18-IMPLEMENTATION-READINESS-AND-OWNER-DECISIONS.md#6-bounded-documentation-closeout-queue--october-3): විස්තරාත්මක feature prerequisites සහ historical preparation queue.
- [API inventory](48-API-OWNERSHIP-AND-CONSOLIDATION.md): public operations 82ක හිමිකාරීත්වය සහ consolidation findings.
- [Release scope](32-JANUARY-RELEASE-SCOPE-AND-DECISIONS.md): January targets සහ deferral policy.

## 2. දැන් පරීක්ෂා කළ timer තත්ත්වය

October 3 actual diagnostic: Node v24.19.0, TypeScript 6.0.3,
`node docs/revision/inspect-core-baseline.mjs`, exit **1**.
Engine SHA-256:
`44c029a482e1a452acc633577dacac4a59b6a01df373cfa8eb1654716c1c78a4`.

| Case | Expected behavior | Actual diagnostic |
| --- | --- | --- |
| CR-T01 | Full 25-minute session completes at 1,500,000 ms | PASS |
| CR-T02 | At 60,000 ms, still active/rejected; no full completion | CONTRACT_GAP: marked completed |
| CR-T03 | Pause 300,000; resume 420,000; project 1,320,000 → 1200 focus / 120 paused / 300 remaining seconds | PASS |
| CR-T04 | Cancel at 60,000; later projection stays at 60 focus seconds | CONTRACT_GAP: grew to 120 |
| CR-T05 | Pause at epoch zero; at 60,000 → 0 focus / 60 paused seconds | CONTRACT_GAP: counted 60 focus |
| CR-T06 | Zero duration produces explicit validation rejection | CONTRACT_GAP |
| CR-T07 | Repeated complete/cancel preserves terminal record | PASS |
| CR-T08 | Invalid startedAt produces explicit invalid-record outcome | CONTRACT_GAP |

මේ ප්‍රතිඵල pure engine එකට පමණයි. Storage, app restart, screens, devices,
backend හෝ rewards පරීක්ෂා කළ බවක් මෙයින් කියන්නේ නැහැ. Bugs පහ තවම තිබෙනවා.

## 3. Lunaට දිය හැකි මුල් coding task එක

පහත prompt එක භාවිත කරන්නේ owner coding/test phase ආරම්භ කරන විටයි.
Implementation files හා acceptance සඳහා [38 §3](38-TEST-HARNESS-ADMISSION-PLAN.md#3-l-02a-implementation-proposal--pure-domain-only)
තනි source එක ලෙස පවත්වාගන්න; එය වෙනස් වුණොත් prompt එකත් යාවත්කාලීන කරන්න.

```text
Implement only L-02A, the Deep Focus pure timer-domain baseline harness.
Read AGENTS.md and all mandatory routed instructions first. Read revision
38 section 3 and core contract 13 sections 8, 11 and 12. Inspect actual source,
package scripts and dirty files before edits. Fill the repository task brief.

Allowed new files:
  tests/domain/session-engine.test.mjs
  tests/domain/README.md
Allowed evidence updates:
  docs/revision/09-COVERAGE-AND-AUDIT.md
  docs/CHANGELOG.md

Use installed Node node:test and node:assert/strict. Import the actual engine
from ../../src/features/focus/session-engine.ts. Do not copy its implementation.
Write CR-T01–08 from independent expected values in contract 13 and handoff 49.
Use synthetic explicit timestamps and fresh fixtures; do not wait in real time
or assert random IDs. Include the existing passing cases as well as failures.

Run the named test file, then the existing project typecheck and lint if their
installed local tools are available. Record exact commands and exit statuses.
Use TH-T01–08 from 38 for harness acceptance, including a disposable false-
assertion probe and repeated fresh-fixture run. Keep loader/tooling errors
distinct from contract failures. No skip/todo/only or expected-failure inversion.

Expected unchanged-engine baseline: CR-T01/03/07 pass; CR-T02/04/05/06/08 fail.
A red baseline establishes defect detection, not a working app. If the source
hash changed, investigate the results instead of forcing the old failure count.

Do not change app code, package/lock/configuration, providers, credentials or
stored user data in this task. No new dependency is needed. Preserve dirty work.
Review the entire task diff, update evidence, then hand off the next CR-02 review
and repair boundary. Report in Sinhala with English technical identifiers.
```

Exact future run commands, once the test file exists:

```text
node --test --test-reporter=tap tests/domain/session-engine.test.mjs
node node_modules/typescript/bin/tsc --noEmit
npm run lint
```

There is no root `npm test` script. Installed runtime path fallback is in 38.
These test-file/typecheck/lint commands were not run by this documentation task.

## 4. Foundation සිට publication දක්වා build order එක

පහත table එක [canonical implementation plan](../V1_IMPLEMENTATION_PLAN.md)
හි phases 0–10 වෙත map වෙනවා. මුල් L-02A test harness එක phase 0 verification
වැඩක්; production timer/auth/storage phase order මඟහැරීමක් නොවේ.

| Phase | Implement / select existing cards | Read for the selected slice | Exit evidence |
| --- | --- | --- | --- |
| 0 — Readiness | Inspect repository, L-02A regression harness; exact tooling admission | §3 above, [38](38-TEST-HARNESS-ADMISSION-PLAN.md), 07 L-00–02 | Actual baseline, TH-T01–08, identified failures and real commands |
| 1 — App foundation | Reuse tokens/components/navigation; establish local persistence/service boundaries | Canonical architecture/UI/components; [15](15-EXPERIENCE-AND-NAVIGATION-BUILD-CONTRACT.md), [13](13-CORE-RELIABILITY-CONTRACTS.md), L-04/L-09 | Selected interfaces, loading/error states and approved adapter tests; preserve existing user edits |
| 2 — Identity | Auth/account, credentials, protected routes and owned records | [14](14-BACKEND-API-DATABASE-BUILD-CONTRACT.md), [16](16-BACKEND-EXTENSIONS-AND-OPERATIONS.md), canonical Security, L-05 | Real isolated auth/ownership/session tests and required review |
| 3 — Focus | Configure/start/pause/resume/complete/cancel, durable save, recovery, history and optional break | 13 CR-02–06 and CR-02R; [19](19-SAFETY-AND-COMMITMENT-CONTRACT.md), [20](20-SETTINGS-PROGRESS-AND-UNITS.md), L-03/L-06 | Accepted timing/caller/migration rules; engine, failed-save, process-restart and device evidence |
| 4 — Tasks/goals | CRUD, stable links, supported goal periods and progress | 14/16/20, [22](22-REWARD-GOAL-AND-AI-WIRE-CONTRACT.md), L-07 | Owned data, date/period bounds, rename/archive/delete and offline/retry cases |
| 5 — Rewards/progress | Streaks, XP/levels/achievements, history and analytics | 20/22 and canonical reward/day contracts | Agreed formulas, duplicate prevention, trusted grants and correct period attribution |
| 6 — Settings/accessibility | Preferences, notifications, locale-ready controls and admitted personalization/motivation | 15/20, canonical screen/UI contracts, L-09/10 | si/ta/en review, skip/redo where admitted, large text, reduced motion, screen readers and permission failures |
| 7 — Assessment/AI | Baseline assessment and Plan My Day; conditional AI only at its checkpoint | [23](23-AI-GENERATION-RECOVERY-AND-REVISION.md), [24](24-DAILY-PLAN-AND-GENERATION-WIRE-CONTRACT.md), [25](25-SAVED-PLAN-LIFECYCLE-AND-PRIVACY.md) through [31](31-PLAN-ACTIVATION-AND-RECOVERY-GATES.md), L-13 | Exact proposal confirmation, quota/failure/cancel/retry evidence, durable plans and provider prerequisites |
| 8 — Sync hardening | Account-isolated outbox, replay/conflict/snapshot and privacy recovery | 16, [27](27-PLAN-REPLICATION-SNAPSHOT-EXPORT-WIRE.md), [28](28-ACCOUNT-EXPORT-ARTIFACT-CONTRACT.md), L-08 | Real integration, interruption, account switch, deletion/export and recovery evidence |
| 9 — Release hardening | Complete selected journeys, device/browser/locale/performance/security and regression tests | [08](08-VERIFICATION-AND-RELEASE.md), [17](17-WEBSITE-PORTAL-AND-RELEASE-RUNBOOK.md), canonical testing, L-16 | Named candidate with passing required evidence and dispositions for remaining defects |
| 10 — Publication | Version/store/site/support/rollout and recovery operations | 08/17, canonical phase 10, L-17/18 | Owner release approval for the exact candidate/environment and actual publication checks |

Backend and sync correctness needed by earlier slices is implemented with those
slices; phase 8 is hardening, not permission to postpone all ownership/retry work.
L-09/L-10 cards span foundation and settings phases; select only the required
subcard. Do not treat card numbering as authority to reverse canonical phases.

### Required launch lanes alongside the core

| Lane | Start after | Existing task source | Feature-local gate |
| --- | --- | --- | --- |
| Student/personal teacher organizer | Tasks/planning, settings/locale and durable local foundations | 11 SL cards, 12 R cards; 34 LR cards for local resources | Resource formats/viewer/backup restrictions and device evidence; supplied teaching content remains excluded |
| Bounded classroom | Private Task identity, authenticated ownership and explicit sharing foundations | 39 CL cards; 40–48 exact wire/access/bridge references | Eligibility/retention, reviewed identity/crypto design and real cross-class/revocation tests |
| Paid cloud | Local resources + account identity + verified catalog/entitlements | 33 CC cards, 06 cost model, 12 resource boundary | Exact object API/quotas/recovery contracts, approved commercial policy and real storage isolation tests |
| AI/billing/ads | Trusted identity, usage/grant boundaries and admitted provider setup | 06/16/22, 07 L-13/L-15 | Prices/allowances/ad settings and eligibility; sandbox webhook/replay/failure tests; no focus/break interruption |
| Website/Account Portal | Public content may start after its design; account actions follow real shared services | 05 WEB cards, 17 WP cards, L-14 | Host configuration, real auth/privacy/billing services and browser/security evidence |

මේ lanes January targets තුළ තිබෙනවා; ඒවා පහසු නිසා core foundation එක
මඟහැරිය යුතු නැහැ. Public website content සහ review preparation අතරතුර
කරගෙන යා හැකියි. එකම කෙනාගේ 25–35 hours/week තුළ සියල්ල සැලසුම් කරන්න.

### Per-task working loop

1. Pick the next dependency-ready card. Read its canonical contract and only
   the needed revision sections through the map; inspect current source.
2. Fill the existing task brief with one observable outcome, allowed files and
   acceptance. Resolve only the decisions this task uses. Record any specific
   missing contract in the same feature document before changing its behavior.
3. Implement and verify a small slice. Preserve failing evidence, unrelated
   edits and valid behavior; include applicable failure/recovery/accessibility cases.
4. Update the audit/changelog and actual task state. Independent review remains
   separate when required. Select the next admitted task; do not restart the
   whole documentation project after every slice.

## 5. Owner සහ reviewer වෙතින් තව අවශ්‍ය දේ

දැනටමත් තීරණය කළ stack, navigation, brand direction, languages, age target,
AI/ad direction, resource formats සහ release surfaces නැවත අහන්න අවශ්‍ය නැහැ.

| When needed | Exact input | Prepared material |
| --- | --- | --- |
| Before adopting new-session duration limits | CF-03 recommendation: initial 25; presets 25/45/60; custom whole minutes 5–180. Record actual adoption; preserve valid settings/history | [13 §12](13-CORE-RELIABILITY-CONTRACTS.md#12-enginecaller-decision-packet--cr-02f) and [20](20-SETTINGS-PROGRESS-AND-UNITS.md) |
| Before HIGH timing/storage acceptance | Qualified reviewer disposition on CF-01–07, migration and caller behavior | 13 §12.E review request; self-review does not close it |
| Before resource/classroom implementation acceptance | Qualified platform/security review of the selected adapter, key/nonce and recovery design | [37](37-VIEWER-PERMISSIONS-AND-CONTAINMENT.md), [47](47-CLASSROOM-KEY-NONCE-AND-REVIEW-BRIEF.md). Owner has no reviewer yet; briefs are ready, no contact made |
| Before real accounts/minor-data/production storage | Verified entity/age-consent, region/retention/recovery/operator facts and policy review | [18 §3](18-IMPLEMENTATION-READINESS-AND-OWNER-DECISIONS.md#3-minimum-decision-sheet), ADR-009–011 |
| Before paid cloud/AI/billing/ads activation | Approved prices/quotas, merchant eligibility, ad configuration, exact provider accounts and spending | [06](06-MONETIZATION-AND-ENTITLEMENTS.md), [33](33-PAID-CLOUD-ADMISSION-AND-RECOVERY.md); budget/prices remain deferred |
| Before publication | Actual Android/iOS/browser/locale/provider evidence, operational readiness and owner release approval | [08](08-VERIFICATION-AND-RELEASE.md), [17](17-WEBSITE-PORTAL-AND-RELEASE-RUNBOOK.md) |

මේවා සියල්ල මුල් test harness එකට පෙර අවශ්‍ය නැහැ. අදාළ implementation
boundary එකට එන විට අවශ්‍ය input එක පමණක් ලබාගන්න. Reviewer විසින් කර යුතු
technical verification එක userගේ සාමාන්‍ය “හරි” පිළිතුරකින් සම්පූර්ණ වෙන්නේ නැහැ.

## 6. ඉතිරි විස්තර අදාළ feature එකේම අවසන් කරන තැන

Readiness 18හි D1–D9 queue එක මේ table එකෙන් implementation lanes වෙත බැඳෙනවා.
කිසිදු open item එකක් PASS ලෙස වෙනස් කරන්නේ නැහැ. මේ සියල්ල first harness
එකට පෙර අවසන් කළ යුතු global checklist එකක් ලෙස භාවිත කරන්න එපා.

| Existing item | Handle at | Concrete remaining work / stop boundary |
| --- | --- | --- |
| D1 Foundation handoff | Phase 0, then focus review | First prompt complete in §3. Create/run the harness when coding starts; obtain CR-02R dispositions before affected timer/storage acceptance |
| D2 Core reconciliation | Selected phase 3–6 task | Reconcile exact units, timing/goal/day/reward/default/break clauses used by that task in 13/19/20 and its canonical contract; unresolved semantics stop that task |
| D3 API consolidation | Selected API/client task | Ownership inventory complete in 48. Preserve scoped references; a generated bundle is needed only if the chosen tooling needs it. Missing cloud/other operation schemas must be specified before those handlers |
| D4 Storage/recovery | Foundation/identity/focus and saved-plan tasks | Exact versioned schema, legacy data treatment, transaction and rollback/recovery design in 13/14/16/29/30; review and actual isolated tests before integration |
| D5 Education/resources | Each resource/classroom/cloud lane | Complete the selected missing wire/adapter/policy detail in 11/33–47, then tests. No whole-classroom review dependency for independent personal planning |
| D6 Experience/locales | Selected UI component/flow | Resolve that component's token/font/copy/defaults and render in si/ta/en with applicable accessibility checks; no need to redesign unrelated screens first |
| D7 AI/commercial | AI/billing/ad task | Exact provider schema, quota/grant/entitlement rules and actual commercial/legal inputs; core manual focus remains independently usable |
| D8 Website/release | WP card / release candidate | Choose exact hosting setup for the admitted web task; connect actual account operations when shared services exist; keep release evidence in 08/17 |
| D9 Package review | Each changed contract, then phase 9 | Check the selected requirement-to-code/test mapping and contradictions as it is implemented; final regression/readiness check covers the actual release set |

මේ guide එකෙන් ඉතිරි technical work කර අවසන් වූ බවක් කියන්නේ නැහැ.
ඒවායේ ස්ථානය සහ අවසන් කිරීමට අවශ්‍ය evidence පැහැදිලි කර තිබෙනවා.
External review නොමැති විට affected HIGH acceptance `REVIEW_PENDING` ලෙස
තබන්න; එය unrelated test/document/UI task එකක අවසරය ඉවත් කරන්නේ නැහැ.

## 7. Final handoff status

- **First build-task specification:** concrete and prepared above; implementation
  has not started in this documentation work.
- **API ownership audit:** completed for the eight current slices; F2 Cursor
  mismatch corrected in the draft. Missing launch families remain visible in 48.
- **Build-guide consolidation:** completed and document checks passed in FG-01.
  Root and revision entry points route here.
- **Whole V1/enterprise specification freeze:** incomplete; selected feature
  decisions and specifications are finished at the boundaries in §6. They are
  not erased or counted as completed by ending this documentation pass.
- **App correctness/release:** not established. Five reproduced engine gaps,
  real integration/device tests and independent reviews remain.

**ඊළඟ ක්‍රියාව:** owner coding ආරම්භ කරන විට §3හි L-02A task එක ක්‍රියාත්මක
කරන්න. තවත් general planning packet එකක් සෑදීම අවශ්‍ය නැහැ.
