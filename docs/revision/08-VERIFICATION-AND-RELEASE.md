# Verification, Capacity and Release Gates

Status: proposed acceptance plan, started 2026-09-14; scope/capacity note refreshed 2026-09-25. Tests below are **required future evidence**, not reported passes. Actual checks performed for this documentation revision are recorded in [09](09-COVERAGE-AND-AUDIT.md).

## 1. January target and realistic capacity

From 2026-09-14 to 2027-01-01 is 109 days, approximately 15.57 weeks. At the owner's 25–35 hours/week, gross capacity is about **389–545 hours**. This includes decisions, reviewing generated code, testing, rework, store submission and support setup—not just writing features. No additional developer/agent capacity is assumed.

A proposed 30% contingency/verification allocation would leave about 272–382 hours for planned feature work; this is a planning recommendation, not an agreed budget or measured velocity. The bottom-up ranges below already include a dedicated QA lane, so do not subtract the 30% and then count the same QA twice.

| Work lane | Rough owner-assisted hours | Important uncertainty |
| --- | --- | --- |
| Decisions, canonical reconciliation and test planning | 20–35 | Provider/legal/content choices |
| Core lifecycle, persistence, tasks/goals correctness | 75–120 | Existing local data migration and failure cases |
| Auth, backend, sync and trusted ledgers | 70–120 | Provider-specific tests and offline conflicts |
| UI system, personalisation and locale foundations | 45–80 | Native-language review, accessibility and redesign |
| Differentiation and bounded Sri Lanka education slice | 35–70 | Earlier estimate; own-resource organiser/optional metadata detail requires re-estimation, paid cloud not included |
| Public Website and Account Portal | 45–75 | Secure account, policy, deployment and shared contracts |
| Verified billing/entitlements | 25–50 | Merchant/store approvals and transition complexity |
| Required AI planning slice | 20–40 | Approval, schema/evaluation and usage rules |
| Integration/device QA, release and rollback readiness | 70–110 | Real bugs, review rejection, infrastructure drills |
| **Total indicative range** | **405–700** | Not a quote or delivery guarantee |

This range overlaps available capacity only at its lower end. **The whole enterprise inventory is not a credible January commitment for one person.** Owner approval must set a tested release slice; do not silently reduce the explicit Website/Portal requirement. Scope, date or assistance would need reconsideration if measured velocity misses the lower range. The user's no-agent instruction still applies.

September 18 checkpoint: January 1 is now 105 days / 15 weeks away, or **375–525
gross owner hours** at the stated weekly availability, before other commitments.
The older 405–700 range above is retained as a historical estimate, not remaining
effort after this documentation work. Required launch-ad integration/consent/
eligibility/device testing was not separately estimated there; optional cloud
also lacks a production estimate. Re-estimate each admitted lane with measured
first-slice velocity and these dependencies. Do not add an invented ad estimate,
subtract unmeasured completed hours, or reuse the old total as a delivery promise.

September 25 historical availability: 98 days / 14 weeks / **350–490 gross hours**.
Android+iOS, three launch locales, independent teacher and paid-cloud placement
are now confirmed in [32](32-JANUARY-RELEASE-SCOPE-AND-DECISIONS.md). Re-estimate
these lanes, cloud and required ads explicitly; the historical table is not a
remaining-work estimate and does not prove feasibility. No mandatory scope is
silently removed if a forecast misses the target. The amendment recorded
September 29 now selects January-first feature deferral: prepare a visible
effort/dependency/user-impact cut list and record revised scope when needed.
No specific cut has been selected. Re-estimate bounded classroom work too;
these historical numbers are not current remaining capacity or a guarantee.

## 2. Confirmed envelope and remaining January scope negotiation

Current targets, subject to a recorded feature-deferral revision: reliable Android+iOS mobile core; tested identity/privacy where accounts ship; Website + Account Portal; Sri Lanka O/L/A/L/higher-stage education boundary; independent personal-teacher organizer plus bounded private classroom invitations/assignments/selected-progress/text feedback; si/ta/en. Accessibility, security, privacy, recovery and required review for shipped scope are not deferrable shortcuts. Retain existing approved Plan My Day requirement until explicitly revised. One differentiated loop and expanded optional onboarding remain recommendations requiring exact admission. General/custom own-resource organization needs no official curriculum pack; optional metadata is separately reviewed, not teaching material. Local resource mode is default; optional paid-cloud January inclusion is confirmed September 25, with commercial/security/production gates retained.

Also mandatory from the September 16 owner reply: **unobtrusive initial-release
ads**, with limited free AI plus optional paid AI and a usable non-AI core. The
earlier ads-free launch suggestion was rejected. Exact formats/provider/caps/
placements, targeting/age eligibility and paid ad-removal remain ADR-005 gates.
Do not silently remove ads to meet the date or enable unreviewed ads for minors;
resolve the eligible launch audience and safe placements before admission.

Do not promise all curricula, all languages, public communities, enterprise SSO, broad AI chat, every connector, strong cross-platform shielding or the full web app on January 1. Those stay in the enterprise inventory and future task map. Further feature choices remain ADR-006; optional metadata/pilot detail remains ADR-007. Initial si/ta/en selection is approved ADR-008 but qualified QA is unverified. Desired 15+ product age is not legal consent (ADR-009); only the bounded classroom subset is targeted for V1, not every cohort/institution proposal.

Suggested checkpoints, subject to approval:

- By September 28: stack/scope/age/merchant feasibility and canonical contracts decided; otherwise reforecast before coding dependent features.
- By October 31: core/auth/persistence vertical slice and early website/portal staging usable; no fabricated success flows.
- By November 15: first end-to-end expanded release slice on real devices, with representative data and failure testing.
- By November 30: proposed feature freeze; complete content/language/billing review and integration tests.
- By December 15: release candidate, store submission preparation and operational drills. Submission at this date does not guarantee approval.
- January 1: publish only if gates pass and owner approves; critical security/data-loss defects block release even if the date arrives.

Review actual completed-task hours weekly while implementing; adjust forecasts transparently. This document does not schedule an automation or promise unattended monitoring.

## 3. Acceptance matrix

Each row needs an evidence record: test name/version, build/commit, environment, date, expected/actual, log/screenshot reference with sensitive data removed, and reviewer. `Not applicable` requires a reason tied to approved scope; it cannot hide a failed launch feature.

| Gate | Coverage | Required scenarios / pass condition |
| --- | --- | --- |
| G-01 Domain/lifecycle | DF-027–029, P-08–12 | Timestamp projection, pause, early end, terminal immutability, clock anomaly and optional break fixtures |
| G-02 Durable local work | DF-028/036, L-04A/06A | Kill at each write boundary, corruption, low storage, migration restart, concurrent writes; no acknowledged loss or duplicate terminal state |
| G-03 Tasks/goals/metrics | DF-030–033, P-13–16 | Stable links, rename/archive, bounded periods/timezones, no cancelled credit, exact approved XP/streak fixtures and deduplication |
| G-04 Account isolation | DF-025/036, S-01–04/08 | Two users/two workspaces, guessed IDs, role escalation, signed-out/expired/revoked sessions, old-account queue and realtime denial |
| G-05 Sync/recovery | DF-036, S-05 | Offline changes, partial batches, retry after commit, cursor expiry, tombstones, multi-device overlap and access revocation |
| G-06 Personalisation/localisation | DF-014–018/034/075, P-01–07 | Skip/default/back/resume/redo, explicit overrides, language independent of pack/country, native scripts, missing translation/RTL as supported |
| G-07 UI/accessibility | DF-011–013/019/035 | Approved tokens, all component states, TalkBack/VoiceOver, text scaling, keyboard, contrast, reduced motion, small screens, no quote over critical controls |
| G-08 Education | DF-003/016/045–050/053 | General mode, source/rights/edition review, timetable exceptions, pack upgrade/removal, topic results not labelled mastery, age/consent policy |
| G-09 Differentiation | DF-051/054/056/057/059 | Optional return/outcome, real capacity bounds, manual override, private sharing, no automatic task completion or health claims |
| G-10 AI safety/usage | DF-037–039/061/062/070/071 | Consent/minimal context, invalid model output, injection, quota and retry, exact proposal confirmation, provider outage core fallback |
| G-11 Billing | DF-020/039, M-01–08 | Store/provider sandbox purchase/restore/cancel/refund/grace/overlap; forged client grants denied; no double debit or data hostage |
| G-12 Website/portal | DF-004/005, W-01–05 | Public links/content/SEO, authenticated routes, private cache isolation, account recovery/settings/billing/privacy, mobile browser and keyboard QA |
| G-13 Connectors | DF-021/072, W-06–08 | OAuth denial/expiry/revocation, scoped import/write preview, recurrence/all-day dates, pagination/410 recovery, no unrelated deletion |
| G-14 Collaboration | DF-023/047/048/067–069 | Consent/invites, blocked user enforcement, revoked membership, no private data leak, focus-safe delivery, reporting/moderation; block launch if child policy unresolved |
| G-15 Shield/audio/wellbeing | DF-058/063/064/076–080 | Platform permission/entitlement, honest fallback/safe exit, audio rights, no health efficacy or unbreakable claims |
| G-16 Operations/privacy | DF-022/074, S-06/07/09/10 | Secret scan, least privilege, restore/deletion non-resurrection, export isolation, rate limits, monitoring/support/incident drill and retention configuration |
| G-17 Release scope/content | DF-001–010/018/024/040–044/055/065/066/073 | Every feature classified and marketed truthfully; later web/platform/enterprise promises separate; cost/merchant/legal dependencies recorded |
| G-18 Unobtrusive advertising | DF-039; ADR-005/009 | Approved eligible audience/provider/format/placement/caps; no ads during active focus or True Zen, emergency exit/recovery never gated; SDK/network/consent denial leaves core usable; no private work/resource text sent to ads; accessible dismissal; if rewarded, trusted verification and replay-safe grants |

Sri Lanka extension: [SL-T01–SL-T18](11-SRI-LANKA-EDUCATION-CONTRACTS.md) provide learner/teacher cases for the selected slice. Link eventual evidence into G-04/05/06/08/12/14/16. The [pilot proposal](10-SRI-LANKA-EDUCATION-RESEARCH-SI.md) is not a performed study, approved real-data deployment or substitute for security testing. Require qualified syllabus/medium review if a pack is admitted and separate approval before any real-minor pilot. September 25 selected personal-teacher organization; the September 29 record adds bounded classroom V1 placement, not a full classroom web surface hidden inside Website/Portal. Applicable sharing/isolation/revocation tests remain required and NOT_RUN.

Resource extension: [R-T01–R-T16](12-LOCAL-RESOURCES-AND-WORK-PLANNING.md) cover local isolation/import/recovery, no unselected resource transmission, independent-teacher usefulness and optional paid cloud. Cloud release additionally requires approved cost scenarios/price/quotas, actual object restore/privacy, merchant/sandbox evidence and consented uploads. [CC-T01–20](33-PAID-CLOUD-ADMISSION-AND-RECOVERY.md) expands those future cases, not executed tests. Type/lint/docs checks cannot pass those gates. Paid cloud is now January-required; separately estimate it rather than reusing the historical range.

## 4. Test levels and environments

September 26 owner testing plan: Amazon-hosted devices (understood as AWS Device
Farm in this discussion) plus friends' Android phones. This is planned coverage,
not paid account/run authority, device availability or tests already performed.
Before each run identify model/OS/build, required capability, staging environment,
synthetic fixtures, retention/access for artifacts, budget approval and evidence.
Remote sessions record video/logs; AWS recommends test rather than sensitive
personal credentials. [AWS remote access](https://docs.aws.amazon.com/devicefarm/latest/developerguide/remote-access.html).
No production learner files, merchant credentials or personal accounts in recordings.

Use consented friends' Android builds for ordinary real-world lifecycle and
usability; do not wipe their data or conduct destructive backup/storage drills
on personal files. Installed Android/iOS backup, low-storage fault injection,
long-duration/battery, iOS signing and store billing require suitable verified
environments. If a cloud-device capability is unavailable, record NOT_RUN and
resolve another environment; do not turn Device Farm availability into a PASS.
[LR-T01–20](34-LOCAL-RESOURCE-IMPORT-AND-RECOVERY.md) adds local import/cancel/
account-fence/recovery cases, all currently NOT_RUN. No SDK/native install occurred.

Saved-plan admission: [PL-05](31-PLAN-ACTIVATION-AND-RECOVERY-GATES.md) maps the
25–30 design chain to eight evidence gates and twelve NOT_RUN activation/pause/
recovery scenarios. Its checker must report the actual unfilled draft ineligible;
a synthetic positive fixture or all five completed drafts cannot pass G-04/05/10/
16/17 or authorize deployment. Keep safe privacy duties active during a write pause.

Settings/progress extension: [SP-T01–24](20-SETTINGS-PROGRESS-AND-UNITS.md)
covers default/permission/consent separation, preference precedence, explicit
unit conversion, streak/reward replay and truthful projection states. Map real
evidence to G-01/02/03/05/06/07/10/12. JSON/arithmetic checks do not run those app
or backend scenarios; exact production policies still need approval.

Safety extension: [SC-T01–20](19-SAFETY-AND-COMMITMENT-CONTRACT.md) covers
ordinary/emergency exit, policy restoration, failed persistence, no XP loss,
truthful claims and accessibility. Map actual runtime evidence to G-01/02/03/07/
10/15. The documentation ID/phrase checks do not execute these tests.

Remaining-backend and portal extensions: [BX-T01–24](16-BACKEND-EXTENSIONS-AND-OPERATIONS.md)
and [WP-T01–24](17-WEBSITE-PORTAL-AND-RELEASE-RUNBOOK.md) provide durable-job,
sync/bootstrap, confirmed-AI, billing/session/privacy and browser/cache/CSRF/
redirect cases. Map them to the corresponding G-01–17 categories for the admitted
slice, plus G-18 for any admitted ad integration; they are not executed by the JSON/manifest checker. Actual website build
commands must be established after scaffolding, not invented in this mobile repo.

Backend extension: [BE-T01–18](14-BACKEND-API-DATABASE-BUILD-CONTRACT.md) map
auth/ownership/replay/transaction/sync/privacy failures to G-04/05/16 and portal
boundaries where relevant. The DTO/reference/SQL-text checker is read-only and
does not execute those integration tests or parse/execute PostgreSQL.

Experience extension: [UX-T01–24](15-EXPERIENCE-AND-NAVIGATION-BUILD-CONTRACT.md)
map personalization/locales to G-06, visual/navigation/accessibility to G-07 and
pack behavior to G-08, plus privacy/core gates as applicable. Token arithmetic
and route-manifest consistency are separate document evidence; they cannot pass
screen-reader, keyboard, account-switch, storage-failure or timer continuity tests.

Core extension: [CR-T01–CR-T20](13-CORE-RELIABILITY-CONTRACTS.md) refines G-01–05.
Eight current pure-engine cases have a read-only diagnostic. Its findings are
recorded separately from future controller/repository/device/server tests; neither
a passing baseline case nor the documentation validator passes a release gate.

Domain tests: fake/injected clock, table-driven states and deterministic fixtures. Component tests: semantic controls, disabled/error/pending states, navigation outcomes. Repository tests: fault injection, transaction/migration and account isolation. API/DB integration: real isolated test DB with authenticated identities, constraints/RLS and retry semantics. End-to-end: real mobile builds plus supported portal browsers, actual staging services, sandbox billing. Security review: negative access tests and boundary review, not only happy-path signup.

Use synthetic test data, no production learner profiles, real payment details or credentials in fixtures. Keep dev/staging/prod completely distinct. CI/test commands are chosen in L-02 and recorded in package scripts; until then a missing test runner is a gap, not a pass. Device coverage must name exact OS/build/device conditions at execution time rather than pre-claiming every iOS/Android version.

Manual release scenarios: install/update, permission deny/revoke, force-stop/relaunch, phone lock/unlock, background long enough for OS suspension, airplane mode, time/timezone change, storage pressure, account switch, logout with pending work, large local history, accessible login and full timer completion/cancel. Browser scenarios add reload, multiple tabs, cache eviction and private browsing where supported. Simulators alone cannot prove every background, secure storage or store-payment path.

Performance budgets (startup, list responsiveness, sync latency, battery, API error/latency) must be measured and agreed against representative devices/load in the first staging slice. No “enterprise scale” throughput or uptime claim without a tested capacity and support plan. Record p50/p95 where meaningful, dataset size and load conditions; do not report an empty local app benchmark as production performance.

## 5. Security and data release stop conditions

Sri Lanka timing: [Gazette No. 2498/16, July 22, 2026](https://dpa.gov.lk/Gazet/2498-16_E.pdf) specifies January 1, 2027 commencement for PDPA Sections 2/3 and Parts I/III. Record a pre-launch review of the current amended Act and applicable instruments, controller/processor roles, age/lawful basis, transfers, retention and actual disclosures. This is an evidence-backed release dependency, not a legal compliance certification or a claim that every Act provision commences together. Recheck for superseding instruments before release. Real student-data collection cannot precede its applicable policy and authorisation gate.

Block affected release for: cross-user/tenant access; exposed secrets; lost acknowledged work; duplicated paid/reward grants; account restore/deletion violations; unauthorised AI/external writes; unresolved child-data/consent policy for child-facing scope; incorrect subscription charges; unapproved destructive migration; critical accessibility barrier in core/account flow; misleading health/unbreakable-security claims.

Do not reclassify a critical defect as “future enhancement” to meet the date. Noncritical known issues require explicit severity, workaround, owner acceptance and user-facing disclosure where appropriate. A passing typecheck cannot overrule a failed data-integrity test.

## 6. Publication checklist

Before store/site submission: correct legal publisher and support details, privacy/terms/deletion pages reflecting actual behaviour, supported platform/locale matrix, rights for assets/content/audio, approved descriptions/screenshots, billing declarations/product IDs, permission explanations, age/content ratings and required review notes/accounts. Verify current store policy for the actual features; this report is not a substitute for release-time review.

Build/signing credentials belong to the owner-managed secure workflow. No secrets pasted into prompts or committed. Reproducible build/version identifiers, release notes and staging evidence must identify the exact candidate. Owner approves submission/publication; documentation authority alone does not permit deployment.

Rollout plan: approved small staged availability where platform supports it; health/error checks; purchase/sync smoke tests; accountable support channel; disable optional unsafe integration/AI/purchase entry via server flags where appropriate. Flags must not destroy data or retroactively fabricate entitlements. Mobile binary rollback is not instantaneous; compatible backend changes and a forward-fix path matter.

Recovery drill: simulate failed migration/service outage in staging; prove backup restore in isolation; verify deleted records remain deleted after restoration; confirm rollback-compatible clients; record measured recovery time/data gap against approved RPO/RTO. Never conduct a destructive “drill” on production without a separately approved operational plan.

## 7. Definition of done

A task is verified only when its approved contract, required tests, error/offline/accessibility states, docs and evidence are complete. A feature is released only when it exists in the published build and production services pass the relevant smoke checks. A document saying “implemented” is not evidence. An owner-approved January scope is necessary before the overall release checklist can be closed.
