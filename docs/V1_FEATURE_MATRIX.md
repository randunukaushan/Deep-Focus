# Deep Focus V1 feature matrix

Snapshot: **2026-10-22, Asia/Colombo**. Inspected main:
`7916d81180ddcfd0901c1869a648541516e1f9aa` (PR #14 merged after PR #20).
This is an implementation/evidence inventory, not a new scope or release approval.
[V1 scope](V1_FEATURE_SCOPE.md), dated [owner decisions](revision/01-REQUIREMENTS-AND-DECISIONS.md)
and the [release map](revision/32-JANUARY-RELEASE-SCOPE-AND-DECISIONS.md) govern
admission. Later scope is not automatically promoted by a module or route.

## Reading the status

- **Local slice**: source and local behavior exist; not a complete feature claim.
- **Boundary only**: adapter, intent, contract or fixtures exist; not a live service.
- **Partial**: required behavior or acceptance remains incomplete.
- **Not established**: this audit has no sufficient execution/acceptance evidence.
- **Tests present** names repository tests; a filename alone is not a passing run.
- **Release: NOT_READY** applies to every required row below. No device, hosted,
  commercial, legal, accessibility or independent-review gate is passed by this table.

Source links describe the named snapshot; future main changes require refresh.
The exact current checks and inherited test provenance are recorded in
[PR #19 evidence](revision/evidence/PR19-STATUS-RECONCILIATION-2026-10-22.md).
The earlier full 1776/1776 suite is [dated PR #14 evidence](revision/evidence/PR14-BREAK-RECOVERY-2026-10-21.md),
not a new full-suite run for this docs-only change. See also the
[current core audit](V1_CORE_FOCUS_AUDIT.md) and
[superseded October 15 audit](revision/evidence/V1-CORE-FOCUS-AUDIT-2026-10-15-HISTORICAL.md).

## A. Mobile foundation and core productivity

All rows in this section are retained V1 scope. The five-step setup amendment
supersedes older onboarding question-count examples; no mandatory new survey.

| Area | UI / logic at baseline | Persistence / sync | Tests present / evidence | Remaining gap; release NOT_READY |
| --- | --- | --- | --- | --- |
| Splash, Welcome, startup | [Root auth/onboarding/recovery routing](../src/app/_layout.tsx), [Welcome](../src/app/welcome.tsx) local slice | Current-owner recovery; not a hosted session guarantee | [Startup/Home checks](../tests/components/home-session-recovery.test.mjs), [entry presentation](../tests/components/entry-presentation.test.mjs) | Actual cold/warm launch, deep links and Back-stack on Android/iOS |
| Onboarding / personalization | [Versioned setup definition](../src/features/onboarding/setup-definition.ts): language plus four real preference choices; optional legacy assessment retained | [SQLite settings/drafts](../src/features/storage/local-database.ts), owner-scoped, confirmed application | [Setup flow](../tests/domain/setup-flow.test.mjs), [setup storage](../tests/domain/setup-preferences-storage.test.mjs) | Real-device flow, translation, accessibility; answers are not proven behavioral facts |
| Home dashboard | [Home screen](../src/features/home/home-screen.tsx), persisted activity and recovery actions | Local data reads; no full cloud freshness guarantee | [Home recovery checks](../tests/components/home-session-recovery.test.mjs) | Full required metric/state coverage and device evidence |
| Focus session | [Setup](../src/app/focus/setup.tsx), [engine](../src/features/focus/session-engine.ts), [hook](../src/features/focus/use-focus-session.ts): timestamps, validated duration, stable task ID, guarded completion/cancel | [SQLite21](../src/features/storage/local-database.ts); active pointer, durable terminal transaction and outbox | [Engine](../tests/domain/session-engine.test.mjs), [boundaries](../tests/domain/session-boundaries.test.mjs) | Native interruptions/clocks; hosted reconciliation and release safety acceptance |
| True Zen Break | [Recovery hook](../src/features/focus/use-break-recovery.ts): original deadline, explicit clock/error/retry, no automatic focus resume | Owner/session/pause-bound SQLite active break; idempotent start and atomic resume/terminal cleanup | [Real synthetic SQLite](../tests/domain/break-recovery-storage.test.mjs), [controller](../tests/domain/break-recovery-controller.test.mjs) | Android/iOS force-close/reopen and accessibility; active break is not completed-break history or trusted credit |
| Session Summary | [Summary](../src/app/focus/summary.tsx) reads terminal record; local XP/level, achievement receipt, streak, explicit linked-task completion | Durable Summary handoff and achievement-presentation receipt; no automatic task completion | [Summary data](../tests/domain/session-summary-data.test.mjs), [support presentation](../tests/components/focus-support-presentation.test.mjs) | Full goal/break-summary coverage and native/error/provider acceptance |
| Tasks | [Task storage](../src/features/tasks/task-storage.ts), create/edit/complete/archive/delete and planning fields local slice | Owner-scoped SQLite; stable task/session/goal links; history preserved; sync remains separate | [Task detail](../tests/components/task-detail.test.mjs), [ownership](../tests/domain/local-database-ownership.test.mjs) | Cross-device synchronization and installed-build interactions |
| Goals | [Goal progress](../src/features/goals/goal-progress.ts), period bounds, supported edit/delete and local reconciliation | SQLite preserves linked tasks/history; no claim every local contribution is remotely verified | [Goal progress](../tests/domain/goal-progress.test.mjs), [ownership](../tests/domain/local-database-ownership.test.mjs) | Hosted contribution/duplicate evidence and full native lifecycle |
| Streaks | [Streak](../src/features/progress/streak.ts) computes current/longest using local-day rules | Derived from durable session history; not independent UI-only increments | [Streak cases](../tests/domain/streak.test.mjs) | Device timezone/DST and remote reconciliation acceptance |
| XP, levels, achievements | [Progression rules](../src/features/progress/progression-rules.ts) and [SQLite transaction](../src/features/storage/local-database.ts) implement local duplicate-safe progression/receipts | Owner-scoped local processing; server fixtures exist separately, not production trust | [Progression](../tests/domain/progression-rules.test.mjs), [SQLite ownership](../tests/domain/local-database-ownership.test.mjs) | Independent qualified review and hosted end-to-end trusted grants |
| Analytics / Progress — mandatory | [Progress route](../src/app/(tabs)/progress/index.tsx), [aggregation](../src/features/progress/progress-analytics.ts): period filters, averages, tasks/goals/streak and local XP/level | Local sessions/tasks/goals/reward reads; conflicting duplicate detection | [Calculations](../tests/domain/progress-analytics.test.mjs), [UI states](../tests/components/progress.test.mjs), [filters](../tests/components/progress-filter-accessibility.test.mjs) | Recovery-break metrics, complete offline/cloud freshness semantics and actual accessibility |
| Session History | [Canonical Progress history](../src/app/(tabs)/progress/history.tsx); old analytics URLs retained as aliases | Local terminal history and supported detail lookup | [History](../tests/components/session-history.test.mjs), [navigation](../tests/navigation/navigation-contract.test.mjs) | Complete filter, back/deep-link and installed-build state acceptance |
| Profile / settings | [Profile](../src/app/(tabs)/profile.tsx), [settings](../src/app/profile/settings.tsx): local account/preferences controls | Owner-scoped settings and device-only presentation; not all settings/providers wired | [Settings](../tests/components/settings.test.mjs), [localized accessibility](../tests/components/settings-accessibility-locale.test.mjs) | Full account/privacy/provider, sound/haptics and device acceptance |
| Notifications | Reminder contracts/storage/server handlers exist; native scheduling/delivery not established | Reminder intents are not OS permission, alarm or delivery proof | [Reminder applier](../tests/domain/postgres-reminder-applier.test.mjs) | Installed OS adapter, permission/denial, scheduling, cancel/reboot and timezone tests |
| Authentication / account | Auth routes and [existing owner activation](../src/features/auth/session-owner-activation.ts) source slice; provider selection is already recorded | SecureStore adapter and local owner namespaces; hosted/provider configuration still needs evidence | [Auth service](../tests/domain/auth-service.test.mjs), [owner activation](../tests/domain/session-owner-activation.test.mjs), [SQLite ownership](../tests/domain/local-database-ownership.test.mjs) | Live callbacks, revocation/expiry and hosted authorization; no policy changed by this audit |
| Offline / sync / recovery | Local continuity plus [account sync runtime](../src/features/sync/account-sync-runtime.ts) and adapters | Durable outbox/snapshot/pull primitives; runtime explicitly does not activate itself at startup | [Sync runtime](../tests/domain/account-sync-runtime.test.mjs), [SQLite sync](../tests/domain/sqlite-v2-sync-storage.test.mjs) | Complete mobile↔hosted multi-device operation, conflict/retry and privacy lifecycle |

## B. Required January surfaces and admitted extensions

| Area / scope placement | Current evidence | Boundary / remaining gap; release NOT_READY |
| --- | --- | --- |
| Public Website — required | [Next.js app](../web/src/app/page.tsx), localized public content and [web tests](../web/tests/public-pages.test.mjs) | Development content is not publication, hosting/domain, approved claims or commercial/legal readiness |
| Account Portal — required, not replaceable by a landing page | [Account route](../web/src/app/account/page.tsx), [portal component](../web/src/components/account-portal.tsx), browser client adapter exist | Partial account/auth UI is not full supported settings/subscription/privacy integration. Older web README describes an earlier public-only slice; current source shows a portal candidate, not a complete deployed portal |
| Sinhala / Tamil / English — launch locales | [Locale definitions](../src/features/localization/app-locale.ts), mobile copy modules and web locale content | Source and string consistency do not establish fluent translation or device/script/layout acceptance; language does not choose country/consent |
| Sri Lanka learner education — admitted O/L, A/L, higher stage | [Education metadata](../src/features/education/education-metadata.ts), profile/resource metadata slices; [tests](../tests/domain/education-metadata.test.mjs) | Not a complete curriculum/exam/country-pack implementation or accreditation; age gates remain separate |
| Independent personal-teacher organizer — admitted | [Teacher assignment draft](../src/features/education/teacher-assignment-draft.ts), [route](../src/app/education/teacher-assignment.tsx), [storage tests](../tests/domain/teacher-assignment-storage.test.mjs) | Local draft is not a real class, invite, delivery or full teacher workspace |
| Bounded classroom sharing — September 29 V1 amendment | [Classroom policy](../src/features/education/classroom-policy.ts), [local helpers](../src/features/education/classroom-local.ts), [tests](../tests/domain/classroom-local.test.mjs) and proposed contracts | Invitation/assignment/explicit private-plan adoption/selected progress/feedback require reviewed real end-to-end service. No full LMS, chat, file distribution or private timetable/history disclosure |
| User-owned local resources — local default | [Resource storage](../src/features/resources/resource-storage.ts), [route](../src/app/resources/index.tsx), [SQLite tests](../tests/domain/resource-storage.test.mjs) | PDF/JPG/PNG, links and book/page direction is not complete native import/viewer/permission/backup evidence; app supplies no academic content library |
| Optional paid Cloud Resources — required January capability, user-optional | [Cloud intent/disabled adapter](../src/features/resources/cloud-resource-adapter.ts), [tests](../tests/domain/cloud-resource-adapter.test.mjs) | Upload/download deliberately disabled; no live storage, consent/entitlement/quota/billing/retention/operations acceptance. Cannot silently drop or invent commercial success |
| Plan My Day — required AI | [Proposal/confirm route](../src/app/plan-my-day.tsx), [planner](../src/features/planning/ai-planner.ts), [SQLite plan tests](../tests/domain/plan-storage.test.mjs) | Deterministic/mock and transport boundaries are not a configured, evaluated live provider or full trusted usage/replication. Confirm exact proposals; core works without AI |
| Break Down This Task / Review My Day Lite — conditional V1 | [Scope §11/checkpoint §13](V1_FEATURE_SCOPE.md); no complete released implementation established here | Preserve conditional placement, not a mandatory release-ready claim; no autonomous task changes or medical diagnosis |
| Limited free AI + optional paid AI, unobtrusive launch ads — existing direction | [Entitlement policy](../src/features/monetization/entitlement-policy.ts), [ad policy](../src/features/monetization/ad-policy.ts) boundaries and tests | Prices/allowances/providers/placements/eligibility still gated. Rewarded unlock only if selected; client ad claims cannot grant trusted usage; no ads during focus/break |
| Commitment / ordinary exit / Emergency exit — retained safety direction | [Scope §4](V1_FEATURE_SCOPE.md) and dated [decisions](revision/01-REQUIREMENTS-AND-DECISIONS.md) | Current cancel action does not prove full configurable commitment modes/Emergency-exit acceptance. Early exit remains cancellation, no missed-work XP penalty |
| Ages 15–17 development, not live access approval | [October 6 boundary](revision/01-REQUIREMENTS-AND-DECISIONS.md) | Real-minor pilot/release access remains disabled pending qualified legal review and separately implemented controls; target 15+ is not consent or ad/payment/cloud eligibility |
| Accessibility / privacy / security — release blockers | Semantic UI, reduced-motion/localization code, local negative fixtures and backend test modules exist | No whole-app accessibility, hosted security, penetration/compliance or production data-lifecycle certification |
| Android + iOS release — both required | Expo SDK56 source, existing package/build setup; [release runbook](revision/08-VERIFICATION-AND-RELEASE.md) | Named release-candidate builds, actual device lifecycle, stores, operations/support and owner release approval still required |

Full productivity web, desktop, wearables and wider enterprise/LMS directions
remain later unless a separate exact owner amendment changes placement. This
matrix neither selects a scope cut nor promises the January date.

## Analytics reconciliation — source present, acceptance still partial

The former checklist marked averages, period summaries, task/goal/streak/XP
integration, filter controls and calculation tests as absent/unknown. At this
snapshot the aggregation and Progress route contain these local slices:

- `today`, `week`, `month`, `all` windows; local-day/timezone filtering;
- total focus time (including measured cancelled-session time), completed-session
  count, completed-session average and Focus/Plan ratio;
- task-completion counts/rate using the implemented cohort semantics;
- goal progress, current/longest streak, owner-local XP/level reads;
- weekly activity chart with labels, history entry and loading/empty/error/retry UI;
- duplicate/conflicting record validation and calculation/UI test files.

This is not a pass for every metric definition, timezone/device interaction,
offline freshness, remote trust or accessibility requirement. Recovery-break
analytics and full break/goal Summary integration remain unestablished. Do not
restore the old "no tests" checklist or convert local code into release ticks.

## Dependency-safe next work — recommendation, not new approval

1. Obtain actual Android/iOS focus/break/restart/Back/accessibility evidence and
   qualified review for the affected high-risk implementation; fix evidenced defects.
2. Reconcile the next bounded mobile↔hosted integration gap with its contracts,
   ownership/privacy and replay evidence; adapters are not a complete sync service.
3. Complete required Website/Portal, education/resources and commercial lanes
   through their existing gates; measure effort before any owner-approved deferral.
4. Refresh this matrix for the next named commit. Keep release acceptance separate
   from document merge, full-suite count, provider selection and prototype polish.
