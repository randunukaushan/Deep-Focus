# Five-step onboarding and whole-app preview-aligned UI polish

## Superseding owner direction — 2026-10-20

The active goal supersedes the earlier seven-question reply below. The owner
authorizes language first plus four useful questions chosen by the implementer,
real answer-driven behavior, preview parity across the whole native app including
screens absent from the preview, and a final polish pass. The historical packet
below is retained as baseline, not the current question-count requirement.

STATE: IN_PROGRESS; full goal remains active. HIGH persistence/integrity and
cross-cutting UI effects; independent review and native accessibility remain
pending, not waived. Work alone; no deployment, accounts or remote writes.

Current bounded slice: establish the version-2, five-step contract and atomic
owner-local application before replacing routes. Questions: language (en/si/ta,
saved first), future focus duration (25/45/60/current), future break duration
(5/10/15/current), appearance (system/light/dark/current), motion
(system/reduced/current). Review is not a sixth question. No inferred traits,
role/education/background collection, reminders, AI transmission or consent.
System motion follows OS preferences; a local answer cannot override OS reduce
motion. Theme/motion remain device-local per account, as in the existing Profile.

ALLOWED for this slice: new `src/features/onboarding/setup-definition.ts`,
additive snapshot/apply methods in existing local-database.ts (schema stays 20),
new domain/SQLite tests and the existing loader, this record, decision register,
canonical UI/assessment clarification, documentation map and changelog.
Later slices cover the existing onboarding/context/routes and localized copy,
Home/Profile/settings, shared native UI primitives, auth presentation and all
remaining route families; inspect and record each slice before changing it.
Preserve all earlier dirty work; no broad replacement or removal of functionality.

Acceptance for foundation: F1 exactly language + four versioned questions;
F2 invalid IDs/values/objects rejected and skipped/current answers make no
replacement; F3 selected old/new review values only, exact durations, no fake
effects; F4 both settings tables and completion marker commit together or roll
back; F5 stale reviewed fields rejected, unrelated locale/personal words/tasks/
history preserved; F6 owner A/B/device isolation and retry/idempotency tested.
Routes remain on version 1 until draft/resume/review integration is implemented;
this foundation alone is NOT a shipped five-step experience.

Sequence toward full objective:
1. Versioned questions, safe persistence and real preference effects.
2. Language-first welcome, four questions, review/resume/redo and failure UX.
3. Preview-aligned onboarding, login/signup and shared form/layout components.
4. Audit every native route; align non-preview screens without losing features.
5. Whole-app polish, tests, rendered/device/large-text/theme/accessibility audit.

Verification: installed Node24 node:test for pure domain and actual node:sqlite;
installed TypeScript/ESLint; focused existing regressions, docs/diff checks.
Rollback: leave existing settings untouched on failed transaction; additive API
and new definition do not read/rewrite legacy assessment attempts. No migration.
Full native/platform, independent review and final completion audit remain open.

### Foundation checkpoint

Implemented v2 definition/review selection, atomic preferences and completion,
v2-only resumable lookup, immutable queued inputs, stale-field/draft checks and
completed-attempt receipts. Old v1 attempts are left readable and unchanged.
The new API is not yet called by routes; the visible app still uses the old flow.

- Node24 (`C:/Users/User/AppData/Local/DeepFocusTools/node-v24.18.0-win-x64/node.exe`)
  `--test --test-concurrency=1 tests/domain/local-database-ownership.test.mjs
  tests/domain/assessment-profile.test.mjs tests/domain/assessment-personalization.test.mjs
  tests/domain/setup-definition.test.mjs tests/domain/setup-preferences-storage.test.mjs`:
  **65/65 PASS**, no skips/todos, after final draft/receipt changes. Of these,
  16 new cases exercise the five-step definition and real SQLite behavior;
  existing v1/owner/migration/session regressions also remain green.
- `node node_modules/typescript/bin/tsc --noEmit`: PASS after latest source changes.
- `node docs/revision/check-docs.mjs`: PASS (661 Markdown files, 938 local links)
  before this checkpoint text; recheck after later documentation edits.
- `git diff --check`: PASS. Existing repository-wide CRLF conversion warnings
  remain; no Git configuration changed.
- First scoped ESLint invocation used PATH Node20, whose resolver rejected
  `node:sqlite` in the new Node24-only test (one import/no-unresolved finding).
  Rechecked the same files with bundled Node24: PASS, exit 0; no rule disabled.
  Native lint/verification is not inferred from domain tests.

Review: self-review of new files and task diff; additive repository methods are
isolated from prior task/presentation migrations already dirty in this checkout.
Independent qualified review remains REVIEW_PENDING. No native visual acceptance,
translation certification, provider test, account mutation, deployment or commit.

Next integration findings: root auth routing requires the persisted onboarding
step to match the exact route; do not implement redirect aliases that loop against
that guard. Profile's current direct review link is redirected for completed
owners, so redo must first set onboarding in_progress. The presentation provider
caches values: refresh it after the atomic apply without a second settings write.
Owner-key/in-flight invalidation and failed-load/save retry must precede new UI.

Whole-app audit inventory (no family dropped from goal): welcome; sign-in,
sign-up, verify, forgot/reset, callback; onboarding intro/questions/review; five
tabs Home/Plan/Focus/Progress/Profile; task list/detail; goal list/detail;
focus setup/session/break/summary/recovery; progress history/detail/rewards;
resources; teacher-assignment draft; Plan My Day; Profile settings. Layout/root,
redirect-only analytics/rewards aliases and recovery/navigation interactions
must be checked separately. Preview parity already exists for some primary
screens from prior work, but each still needs final whole-app polish evidence.

## Route integration slice
Current second slice (2026-10-20): wire version 2 into the three existing
onboarding routes, replacing their version-1 presentation without deleting old
records/domain definitions. Allowed new files: setup-flow.ts, setup-context.tsx,
setup-copy.ts, setup-ui.tsx and setup-screens.tsx in features/onboarding, focused domain/component
tests/loaders. Extend local-database with owner-bound setup adapter and locale-only
write; onboarding-context with guarded refresh of the committed marker; Profile
redo action and shared presentation refresh. Do not change remote Auth or its
route policy. Owner-keyed layout disposes queued actions on account change.
Acceptance: actual five-step localized UI uses real persisted preferences;
save/load failures retain answers and Retry, duplicate actions blocked,
no automatic question advance, proper Back, safe skip keeps draft, reviewed
selected changes only; theme updates without a second write; Profile redo works.
Root route exact-step guard is preserved; native/device/independent review open.


Implementation checkpoint: the three real onboarding routes now render the new
language/questions/review screens. Original scenery, semantic theme tokens,
scrolling, marked radio/checkbox choices and a five-step accessible progressbar
are reused. Review accessible names include current/proposed values. EN/SI/TA
copy is present, but qualified translation/device shaping checks remain NOT_RUN.

The new controller binds one owner store, synchronously blocks repeat actions,
restores once, preserves failed-save answers, differentiates load/save/conflict/
apply retries and does not advance on save. Disposal invalidates later actions.
Locale-only SQL preserves duration defaults. Apply refreshes presentation and
the already committed onboarding marker without writing settings again. Profile
redo first persists the intro step, preserving active-session recovery priority.
Onboarding context hides stale owner markers immediately and rejects old owner
callbacks before publishing or initiating writes.

Verification checkpoint:
- Bundled Node24 `--test --test-concurrency=1` over assessment + accessibility +
  onboarding-context + presentation-context component tests, auth-routing,
  setup-flow/definition/storage and local-database-ownership domain tests:
  **92/92 PASS**, no skips/todos. Includes actual SQLite controller resume and
  four-field apply, rollback, idempotency, locale preservation and owner-switch
  callbacks. These are not Android/iOS visual acceptance.
- Updated profile-safe-error-locale test (now follows the actual route export)
  and retained legacy assessment-flow-safe-errors test: **2/2 PASS** separately.
  Legacy seven-question UI assertions were replaced by the superseding five-step
  requirements; legacy version-1 domain/records remain supported and unchanged.
- `node node_modules/typescript/bin/tsc --noEmit`: PASS after all source changes.
- `git diff --check`: PASS; existing CRLF conversion warnings unchanged.
- Scoped ESLint initially reported two effect state updates. Fixed with initial
  platform state and signature-tagged review selection; narrow rerun PASS,
  full scoped rerun PASS, exit0 (session2031). No rules disabled.
  Documentation checker also PASS (661 Markdown files, 940 local links).

Native checkpoint: ADB SM-A107F at 192.168.8.101:39803 was connected but locked.
Owner cannot unlock now; native inspection deferred without another request.
Existing Metro PID6220 returned HTTP500: uninitialized DependencyGraph resolution
cache, not an app module-error proof. Validated exact PID/command/8081 ownership,
stopped only that server, restarted installed Expo CLI using bundled Node24,
dev-client/LAN, port8081, one worker and --clear. New PID12552 is starting; ignored
logs `.expo/setup-v2-metro.log` / `.expo/setup-v2-metro-error.log`. Revalidate the
same process/logs/port before next action, not restart on observation timeout.
No node_modules changes, package install, native visual pass or build pass claimed.

Status: IN_PROGRESS; whole-app polish, native bundle/rendered acceptance,
independent review and final completion audit remain open. Next: finish server/
bundle evidence when ready, then auth/shared and secondary-screen alignment.
The full active goal is not narrowed to onboarding or marked complete.

## Auth presentation slice — 2026-10-20

Continuation scope: apply the same existing AuthFrame and form-action lock to
forgot-password, reset-password and verify-email routes; focused recovery UI
tests. Preserve recovery-only routing and anti-enumeration response policy; no
new Auth API/provider/config or live email action. Reset has no fake Back link
that would loop against the recovering route guard. Add persistent field labels
and keyboard progression. Existing signed-in/recovery behavior must not change.

Allowed: new shared `src/components/ui/auth-frame.tsx`,
`src/hooks/use-form-action.ts`, existing sign-in/sign-up routes and focused
component/hook tests, this evidence and changelog. Owner's whole-app preview
alignment includes these screens. Reuse original scenery/tokens, safe area,
keyboard avoidance and permanent labels. Synchronously guard duplicate provider
and password submits, ignore late callbacks after unmount, retain inputs/errors.
No AuthService/API/provider/SMTP/redirect/policy change or live account action.
Risk MEDIUM presentation/interaction; existing HIGH identity gates remain pending.
Verify actual hook delayed/duplicate/rejection behavior, route error/localization,
shared-frame accessibility/keyboard structure, tsc/lint and focused regressions.
Native visual/keyboard/TalkBack/iOS and independent review remain unverified.

Implemented: sign-in/sign-up now share a bundled-scene AuthFrame with safe area,
keyboard avoidance, scroll/tap handling, consistent heading and semantic primary
action. Persistent labels remain; email→password→confirmation keyboard focus and
submit are explicit. Inputs and alternate navigation disable while submitting.
The shared synchronous form lock blocks duplicate password/social calls before
React re-renders, releases on rejection, uses localized fallback only for thrown
exceptions, preserves safe service messages and ignores callbacks after unmount.
Error text uses the existing high-contrast text token rather than low-contrast
red body copy; error field borders and explicit alert text remain.

Tests: `node24 --test tests/components/form-action.test.mjs
tests/components/sign-in-validation-locale.test.mjs`: 7/7 PASS, repeated after
cleanup. TypeScript final cleanup rerun PASS (session59817). Initial scoped lint
PASS (session77880); final post-cleanup lint running in session83210, docs checker
in session37053 at checkpoint. Reuse live handles; do not restart on a timeout.
Prior source changes preserved;
no auth service/context/network operation or live sign-in/signup performed.
Supabase skill guided keeping verification/security/provider boundaries intact.
Official password Auth and RN0.85 keyboard docs read; Markdown changelog fetch
was unsupported, so HTML changelog was checked. HTTP TLS compatibility notice
is a future release/device check, not a reason to change Auth policy in this UI slice.

Metro update: exact existing PID12552 remained live but its new error log now
reports `Failed to construct transformer: Failed to start watch mode` from the
installed watcher timeout. This is affirmative failure evidence, not just a
slow observation. No healthy bundle claimed. Do not patch node_modules or reset
data. A later bounded diagnostic can inspect watcher configuration or use the
installed non-watch export workflow to verify bundling while preserving 8081.


## Settings and history consistency slice — 2026-10-20

Allowed: existing Settings, Profile, progress/history and history detail routes;
Button's existing contrast function extracted unchanged into new
`src/theme/action-colors.ts`; targeted tests/fixtures and this record/changelog.
Settings replaces obsolete static System/motion descriptions with the existing
real PresentationPanel, preserving duration/locale transactions and all other
settings. Reuse SectionHeading, semantic action colors and the shared contrast
rule for selected controls. History detail becomes scrollable for large text.
History read/filter/routing, totals and record semantics stay unchanged. MEDIUM
presentation risk; no schema/provider/identity policy or live mutation. Preserve
existing loading/error/retry/failed-write tests, add contrast and wiring checks.
Native visual/translation/a11y/independent review remain pending.

Implemented: Settings now uses the existing saved PresentationPanel rather than
always describing theme/motion as System. Profile retains keyboard taps while
editing personal words. Selected settings/history controls use the shared
contrast calculation extracted unchanged from Button; history detail scrolls
and no longer uses a hard-coded light-yellow cancelled surface in dark mode.
No duration/locale transaction, history filter/total, storage or routing change.

Verification: 25/25 targeted action contrast, Button, Settings/locale,
history/accessibility and presentation panel/context tests PASS, no skips/todos
(session68636 exit0). Independent numeric checks cover both semantic primary
foreground contrast ratios. TypeScript PASS (session89327 exit0). Scoped lint
PASS (session91610 exit0). Device/rendered/large-text QA and
independent review remain NOT_RUN; the owner cannot unlock the phone now, so
do not repeatedly request it or treat fixture tests as device acceptance.
Documentation link/contract checker PASS (661 Markdown files, 940 local links);
`git diff --check` PASS. Inspected route/helper/test diffs; earlier unrelated
Profile/onboarding changes remain intact. Remaining focus routes have only been
read for the next slice; no timer/reward/recovery behavior was changed here.

## Secondary screen alignment slice — 2026-10-20

Allowed: resources/index, education/teacher-assignment, goals/[goalId], matching
component fixtures/checks and this record/changelog. Reuse SectionHeading/Button
and semantic primary colors; resource fields gain permanent labels and retain
keyboard taps. Goal detail becomes scrollable/keyboard-aware so large text and
edit/delete controls are not cut off. Preserve all resource/assignment/goal
storage, validation, optimistic revisions, recovery and deletion confirmations.
Risk MEDIUM presentation; no live actions/schema/service change. Native visual,
large-text/keyboard and independent review remain pending. Regression tests must
retain goal edit/delete/failure cases, not replace them with style-only checks.

Implemented: resources and assignment reuse SectionHeading; assignment saves use
the shared accessible Button; resources have visible input labels and keyboard
tap handling. Goal detail retains all actions inside a scrollable, iOS keyboard-
aware container instead of a fixed vertically centered card. Semantic primary
actions replace the old raw accent in resource/goal detail. No domain writes or
destructive behavior were changed. Whitespace check caught one trailing space
in the assignment style cleanup; removed and reformatted that style block.

Recovery continuation: forgot/reset/verify now share AuthFrame and the existing
form-action lock. Reset labels are permanent and keyboard progression explicit;
reset does not add a Back link that loops against the recovering-route guard.
Reset/forgot generic outcome copy and verification safe service-error/live-region
distinction are preserved. No real account request/email sent.

Verification: bundled Node24 `--test --test-concurrency=1` across goal-detail,
teacher-assignment-accessibility-locale, resources-choice/error/loading,
secondary-screen-presentation, form-action, recovery-copy,
reset-password-accessibility and sign-in-validation-locale: **30/30 PASS**, no
skips/todos. All twelve existing goal read/edit/conflict/delete/rollback UI cases
remain; new checks do not replace them. Native large-font/keyboard/rendered QA
still NOT_RUN. Final TypeScript PASS (session31126), whitespace PASS
(session58917), docs PASS (661 Markdown files/940 links, session89545).
Subsequent completion: scoped lint37341 PASS (exit0); Android export5778 PASS
(exit0), 2028 modules and 57 assets including both original preview-scene SVGs.
The non-watch Android dev bundle is 12 MB. Sources changed after that export,
so a final unchanged-source export is still required for the final revision.

Runtime checkpoint: the task-started failed Metro PID12552 was revalidated by
command and affirmative watcher-error log, then stopped (no healthy server or
unrelated process stopped). Installed Expo CLI `export --help` inspected before
starting an Android-only dev/no-minify/no-bytecode, one-worker, process-local
EXPO_OFFLINE export into a checked-new ignored directory
`.expo/ui-android-bundle-check-20261020`. Export session5778 subsequently completed
successfully as recorded above. This is a non-watch resolution/bundle check, not
a production build, installation, running 8081 server or provider/device test.
No node_modules patch/install or cache deletion.

Remaining full-goal polish inventory (not a completion claim): Profile/settings
selected foreground contrast; focus break/summary/recovery; progress history,
detail and rewards; task detail and Plan My Day; welcome/callback/entry states;
final cross-screen primary-tab consistency and rendered/native/a11y/translation
audit. Earlier preview-style primary tabs still require the final whole-app pass.


## Focus supporting-screen polish slice — 2026-10-20

TASK: Align break, finalized summary and session-recovery presentation with the
owner-approved preview, keeping authoritative timing/storage behavior unchanged.
STATE: READY / IN_PROGRESS. Previous goal turn made progress: Settings/history
source changes and 25 tests, typecheck/lint/docs checks passed.
PHASE/APPROVAL: Existing Phase3 journey presentation, October20 whole-app UI
amendment; no new foundation, provider or persistence work.
READ: AI rules, execution/DoD/guardrails/map/template; UI specification 9.13/9.14
visual/data/accessibility rules and 11.1–11.6; component library 1.8–1.10 and
4.15–4.17; implementation plan Phase3; actual prototype summary markup and
completion-sample.png. Existing dirty work and package scripts inspected.
ALLOWED: src/app/focus/{break,summary,recovery}.tsx; focused component fixtures
and new focus-support-presentation.test.mjs; this record and changelog.
RISK: MEDIUM presentation only. Reuse SectionHeading/FocusDial and action contrast
helper; scroll long summary/recovery content, use calm centered completion
hierarchy and Home-primary/another-session-secondary actions like the preview.
ACCEPTANCE: All states retain safe navigation/retry and actual persisted record
values; break selection has checked state/readable foreground and real timer
projection; summary and recovery states scroll with scalable text. No demo data,
new persistence/reward/receipt/timer code or networking.
CHECKS: Existing break/settings-failure and summary-source/recovery tests;
actual route-render fixtures for summary/recovery success/failure/retry/routes;
tsc, scoped ESLint, docs and full scoped diff. Native/rendered/large-text checks
remain NOT_RUN because owner cannot unlock phone; no repeated unlock request.
CONFLICT: Canonical 9.13 describes completed-session→break→summary; current break
is an optional pause→break→explicit resume flow. Preserve this baseline in this
UI-only slice and do not claim canonical lifecycle parity. Lifecycle reconciliation
needs a separate approved scope; do not silently redirect or change stored state.
Review: self-review here, existing independent integrity review remains pending.

IMPLEMENTED: Break uses SectionHeading, semantic primary, the shared contrast
rule and checked radio state. FocusDial receives the timestamp-derived remaining
value/progress; it is outside the padded card so its viewport-based size does not
overflow that card on narrow screens. No timer/interval/foreground logic changed.
Summary loading/error/results all scroll, use a centered completion/time hierarchy
and put Home before the secondary new-session action. Cancelled status is neutral
and textual, not low-contrast red body copy. Recovery checking/error/empty states
scroll with bounded width and the ready header reuses SectionHeading.

TESTS: Installed Node24 `--test --test-concurrency=1` with component files
focus-support-presentation, focus-break, focus-dial, session-summary-source,
home-session-recovery, action-contrast, section-heading, focus-timer-accessibility,
focus-setup-accessibility-locale: **20/20 PASS**, exit0 (session48294). New route
fixtures run actual JSX and the real terminal-record/recovery validators with
synthetic repositories; they cover completed/cancelled/missing/open/blank-ID,
safe failed-read retry, linked-task failure/retry, navigation and both themes.
Break fixtures now use actual localized copy, preserve manual-choice/error tests
and assert actual dial value/progress plus explicit resume destination. These
fixtures do not prove real reward integrity, race freedom or native rendering.
Domain files break-engine, break-copy, session-recovery-copy,
session-recovery-state, session-summary-data: **10/10 PASS**, exit0. Covers deadline
projection after background gaps, invalid records/clocks and safe read failure.
TypeScript PASS (session49520 exit0); scoped whitespace PASS. Scoped ESLint
PASS (session53055 exit0). Docs checker PASS (661 Markdown files/940 links).
Final layout self-review found the root Stack hides its header and these three
standalone routes lacked safe-area padding. Reused the already installed
SafeAreaView on every route state (all edges, as in AuthFrame); installed package
source/API inspected, no dependency/native build change. Actual route fixtures
now assert safe-area wrappers as well as scrolling. Final source checks after
this change: same 20 component tests PASS (session9139 exit0), TypeScript PASS
(session15864 exit0), scoped ESLint PASS (session33806 exit0). Ten domain checks
remain applicable because their source and timing behavior were unchanged.
No device/account/provider operation, data deletion, new dependency or commit.
Full goal remains IN_PROGRESS; native/a11y/translation and independent review
gates have not been established, and the recorded lifecycle mismatch stays open.

Remaining-route inspection: welcome and auth/callback still use old raw action
colors; callback has a fixed non-scroll layout. Task detail, Plan My Day and
progress/rewards still need the preview-alignment pass. Rewards/Goals/Progress
and the primary-tab/standalone boundaries need the final semantic-action,
selected-foreground and safe-area audit (not blanket root padding, which could
double-pad nested tabs). This is evidence of incomplete whole-app scope, not a
completion claim. No edits to those remaining routes in this focus slice.

## Task detail, planner and milestones polish slice — 2026-10-20

TASK: Extend the preview's calm reusable hierarchy and readable controls to
Task detail, Plan My Day and Rewards without changing domain behavior.
Previous goal turn: PROGRESS (three focus-route edits and 30 passing checks).
STATE: READY / IN_PROGRESS. Authority: October20 whole-app UI amendment; existing
Phase4/5/7 surface polish only, no additional AI/reward/provider integration.
READ: AI rules/execution/DoD/guardrails/template/map; decision-register October20
amendment; UI spec 9.16 purpose/visual/accessibility and 13.1–13.2 proposal-first
constraints; component-library labels/helper/buttons; existing route sources,
tests, scripts and native-tab/progress-stack boundaries. Huge dirty work retained.
ALLOWED: src/app/tasks/[taskId].tsx, src/app/plan-my-day.tsx,
src/app/(tabs)/progress/rewards.tsx; matching three component fixtures and the
existing action-contrast.test.mjs wiring check; this record and changelog.
RISK: MEDIUM presentation. Reuse SectionHeading/Button, semantic primary and
existing foreground contrast helper, persistent input labels, keyboard avoidance
and standalone safe-area padding. Do not double-pad Rewards inside native tabs.
ACCEPTANCE: Existing actual task content/read/edit/archive/delete confirmations,
optimistic revisions, resources, planner selection/order/explicit confirmation,
failed-save retry and stored achievement-unlock semantics remain unchanged.
No new provider calls, AI claims, XP grants, persisted fields or resets. Improve
locked milestone readability without implying unlock; labels/icons remain.
CHECKS: All existing task-detail (including destructive negative cases), planner
and rewards fixture tests; added layout/label/contrast/reuse checks; tsc, scoped
lint, docs and full slice diff. Native visual/keyboard/TalkBack/large-text and
independent review remain pending; owner cannot unlock phone now.
NON-GOALS: No lifecycle/confirmation/integrity fix under styling, provider/policy
or architecture change, dependency/install, account action, commit or deployment.

IMPLEMENTED: All three screens reuse SectionHeading and semantic primary. Task
detail has persistent title/note labels, checked radio semantics and a single
stored-title/status heading. Standalone Task detail and Plan My Day use existing
SafeAreaView and iOS KeyboardAvoidingView; planner scroll preserves keyboard taps,
and its time-input underline/checks/numbered blocks use theme-aware colors.
Rewards keeps native-tab inset ownership, removes locked-card opacity rather
than fading essential text, uses shared Button for retry/empty actions and adds
an explicit localized Back to Progress action. No reward state/rule changed.

CHECKS: Installed Node24 `--test --test-concurrency=1` on task-detail,
plan-my-day, rewards, action-contrast component tests: **37/37 PASS**, exit0,
repeated after final fixture cleanup. Original 31 cases retained; new route
assertions cover Android/iOS layout props, visible labels, no writes from edit
opening, real selection/confirmation gate, readable locked/unlocked distinction
and explicit back navigation. Contrast ratios still use real light/dark tokens
and an independent numeric oracle; mocks do not establish native rendering.
The first expanded contrast run had 36 PASS/1 FAIL: its selected-text regex did
not understand Rewards' `unlocked ? onAction : action` icon path. Added a precise
Rewards prop+icon check rather than removing the contrast requirement; rerun PASS.
Whitespace checker then caught one trailing space from style cleanup; removed
and split Rewards styles into readable rows.

TypeScript PASS (session71051 exit0); scoped ESLint PASS (session2419 exit0).
Read-only TypeScript AST comparison against unchanged HEAD baseline confirms all
existing JSX action/input handlers remain exact: Task22, planner11, Rewards2;
the sole new handler is Back to Progress. Existing local mock planning provider
remains a mock; no real AI/provider integration or reward-integrity acceptance
is implied. Full slice self-review includes tests and existing dirty work.
Docs PASS (661 Markdown files/940 links); full tracked whitespace PASS after
cleanup. Native visual, actual keyboard/large font,
TalkBack/translation and independent review remain NOT_RUN/REVIEW_PENDING.

Audit finding before the correction below: NativeTabs imported OS useColorScheme
directly, so its chrome could ignore the saved appearance override used by screen
content. The following subsection corrects the hook/color bindings; actual native
rendering and whole-app theme parity still require platform verification.
Welcome/callback and the remaining primary-tab semantic-color/inset audit are
still open, followed by final unchanged-source bundling and rendered/device QA.

### Native-tab appearance correction within the final presentation audit

Allowed additionally: src/app/(tabs)/_layout.tsx and a new bounded
tests/components/tab-appearance.test.mjs. MEDIUM presentation-only correction:
replace the direct OS appearance-hook import with the existing app-aware hook,
without changing NativeTabs API/navigation or presentation persistence. Owner's
approved appearance question must affect chrome as well as route content.
Acceptance: actual tab-layout JSX uses app hook light/dark colors and localized
five-tab labels; OS hook must not bypass the saved override. Check with actual
compiled layout fixture, existing presentation-context tests and tsc/lint.
Native tab rendering itself remains unverified. No Expo API/version change.
Installed Expo Router56.2.21 NativeTabs types/converters and the matching
[SDK56 NativeTabs reference](https://docs.expo.dev/versions/v56.0.0/sdk/router/native-tabs/)
confirm separate default/selected label/icon colors. Set both states explicitly
to existing secondary/primary tokens so an opposite OS theme cannot supply
unreadable default icon colors. The five routes, icons and labels stay intact.
The first URL used an incorrect documentation path and was unavailable; the
correct versioned reference above was read before adding these color props.
Final tab/context/panel suite: 8/8 PASS, exit0 after explicit color props. Tests
compile the actual app-aware hook, constants and layout, covering saved light
against OS dark, saved dark against OS light, System/unspecified behavior and
all five localized label bindings. This is prop/logic evidence, not native paint.
All nine current slice files lint PASS (session77975 exit0) before the final tab
color props; the two affected files have a final focused lint rerun in flight.
Final TypeScript PASS (session24609 exit0). Final two-file lint PASS
(session8343 exit0).
Final scoped whitespace PASS. This turn's tests total45 PASS (37+8).

Coverage audit: index, analytics, analytics/history, analytics/history/[sessionId]
and rewards top-level routes are redirects to the actual presentation routes;
they do not need duplicate screens. Plan's existing add-task modal already has
persistent title/minutes/date labels. Goals' composer still lacks permanent
title/target labels and uses old selected foreground colors; Focus tab's recovery
gate still has a fixed error container. Include those in the final presentation
audit alongside Welcome/callback. No changes to those remaining routes here.

## Welcome, callback, goal composer and focus gate — 2026-10-20

Previous turn: PROGRESS (three supporting screens, native-tab override correction
and45 passing checks). Current outcome: finish remaining entry/composer layout
alignment without altering Auth, goals or focus-domain transitions.
STATE: READY / IN_PROGRESS. MEDIUM presentation risk; existing HIGH review gates
remain. October20 whole-app visual authority; no additional foundation or API.
READ: AI rules/execution/DoD/guardrails/map/template, existing UI/components
accessibility/labels/auth patterns and original preview direction. Current routes,
fixtures, scripts and dirty state inspected. Supabase skill read fully; changelog
Markdown unsupported, HTML changelog/Auth docs checked. Existing future TLS notice
does not justify a provider/configuration change in this UI slice.
ALLOWED: welcome.tsx, auth/callback.tsx, goals/index.tsx, (tabs)/focus.tsx;
AuthFrame's optional subtitle accessibility metadata; matching callback/goals/
focus-entry and contrast tests plus new entry-presentation.test.mjs; this record
and changelog. Reuse AuthFrame/original scenery rather than new illustration.
ACCEPTANCE: Welcome retains signup/signin routes and promise copy; callback keeps
safe localized loading/failure/alert and explicit sign-in return, without running
Auth operations; Goals retains every existing read/failure/save/duplicate test,
adds visible title/target labels, checked semantics, semantic contrast, standalone
safe area and keyboard scrolling. Focus gate preserves fail-closed active/paused
navigation and retries while making long errors scrollable within native tabs.
No storage, privacy, permissions, provider, account/query/email action, dependency,
commit or deployment. Synthetic route fixtures, tsc/lint/docs/diff are checks;
native rendering/keyboard/TalkBack/script layout and independent review stay open.
Supabase's live test-query instruction is inapplicable to these presentation-only
edits: verify JSX/state fixtures, not private DB access or a real account action.

IMPLEMENTED: Welcome/callback use the existing original-scene AuthFrame. A typed,
optional subtitle-accessibility prop forwards only role/live-region metadata so
the actual callback message remains an assertive error or polite loading detail;
other forms keep their prior behavior. Welcome retains all three promise texts
and both Auth routes. Goals uses semantic primary/contrast, persistent title and
target labels, checked radio state, safe area and iOS keyboard avoidance; loading,
failure and normal content scroll. Native-tab Focus entry error content scrolls
without changing recovery or automatically resuming paused work.

CHECKS: Node24 `--test --test-concurrency=1` across action-contrast,
entry-presentation, auth-callback-accessibility, auth-callback-accessibility-locale,
goals, goals-type-accessibility, focus-entry and form-action: **23/23 PASS**,
exit0 (session65766). New entry fixtures compile real routes and real AuthFrame,
use actual en/si/ta copy and both theme palettes, verify safe-area/scroll/keyboard
props, localized callbacks, safe message/fallback alert and exact explicit routes.
No Auth mutation/provider method is present in those fixture dependencies.
TypeScript PASS (session47432 exit0). Scoped lint session72111 is live.
Read-only AST comparison preserves every existing JSX handler against HEAD for
Welcome2, callback1 and Goals8; current Focus domain logic is preserved against
the pre-slice snapshot, not its much older HEAD landing-screen implementation.
Scoped whitespace PASS. Full native/UI/keyboard/TalkBack/translation review and
independent review are still NOT_RUN/REVIEW_PENDING.

Broader verification: running all current tests/components/*.test.mjs sequentially
with installed Node24 (paths enumerated from that directory), not an invented npm
test script. Retain its live handle and investigate any failure instead of treating
these23 tests as whole-app acceptance. Final source audit still finds raw action
colors in focus/setup, focus/session, tasks/index and progress/index; their selected
foregrounds/insets need the final pass before unchanged-source bundle verification.

Broader run session7283 completed: **163/165 PASS, two failures**, exit1. Preserved
failure evidence: duration-unit-locale still required the removed fixed25 and
5–180 Home cards instead of current real task estimates; interactive-label-audit's
700-character regex mistook four `useRef<TextInput>` type arguments for unlabeled
JSX. Actual fields all have labels. Scope extended to those two existing tests
and home-preview.test.mjs: use a TypeScript JSX AST audit with explicit unlabeled/
empty-label negatives and a >700-character positive case; retain locale-unit
assertions for real priority/secondary estimates, plus render actual Home with
three different minute units. No app source changed to satisfy stale tests.
Targeted verifier/Home rerun:7/7 PASS. Full sequential component rerun
session39741: **167/167 PASS**, exit0,51 files, no skips/todos. The two added tests
exercise actual localized Home estimates and AST-audit negatives rather than
dropping the failed requirements. Final app-source tsc/scoped lint PASS
(sessions47432/72111); new verifier-test-only lint PASS (session79550 exit0).
Docs PASS (661 Markdown files/940 local links), scoped whitespace PASS.
Direct before/current comparison additionally confirms the complete Goals
state/load/save function block and Focus entry recovery block are unchanged from
the captured pre-slice worktree (not just unchanged JSX handler text).
TASK_STATUS: IMPLEMENTED, verification PARTIAL (automated evidence passes;
native/script-layout/keyboard/TalkBack and independent review pending). Whole
goal remains IN_PROGRESS; primary Focus/Tasks/Progress color/inset pass, final
current-source bundling and rendered/native acceptance remain required.

## Final primary-surface color and inset pass — 2026-10-20

Previous turn: PROGRESS (entry/composer/focus-gate changes; full component suite
167/167 PASS after two evidence-checker repairs). Current outcome: remove the
remaining raw-action/selected-foreground mismatch on Focus, Tasks and Progress.
STATE: READY / IN_PROGRESS. MEDIUM presentation only, October20 whole-app UI
authority. Existing timer/task/progression foundations are preserved, not changed
or accepted by this slice. Work alone; no independent review or release claimed.
READ: AI rules/execution/DoD/guardrails/map and prior task template; UI spec
9.12/9.15 visual/accessibility, component button accessibility, owner amendment;
current source/config/scripts and dirty work. Matching SDK56 StatusBar reference
and installed56.0.4 version confirm explicit light/dark text style support.
ALLOWED: src/app/focus/{setup,session}.tsx, src/app/tasks/index.tsx,
src/app/(tabs)/progress/index.tsx; matching fixtures plus action-contrast tests
and a new focus-presentation.test.mjs; evidence/changelog.
ACCEPTANCE: Semantic primary/foreground across both themes; checked preset state;
Focus standalone safe area/status-bar consistency, scrollable error and long
session content; Tasks standalone keyboard/safe-area/labels and readable completed
text; Progress heading/filter/metric readability inside native-tab inset ownership.
No domain calculation/state, route/confirmation handler, schema/owner/permissions,
API/provider/reward rule, dependency, commit or deployment change. Preserve real
loading/error/retry and destructive/session-exit behavior, not mock preview data.
VERIFY: Existing component suite and real route fixtures, independent contrast
oracle, before/current domain/handler comparison, tsc/lint/docs/diff; then final
unchanged-source non-watch Android bundling. Native font/TalkBack/keyboard and
rendered/theme parity still require platform evidence; phone remains unavailable.
Inset audit also found no root StatusBar policy for non-Focus routes. Extend
allowed files to src/app/_layout.tsx and tab-appearance.test.mjs only for a
declarative StatusBar element in all three existing render branches, using the
already app-aware color scheme. No provider composition, guard, recovery effect
or route decision change. Verify actual RootNavigator render branches in a
fixture with all side effects disabled, not a live Auth action.
The same headerless-standalone audit found Resources, teacher-assignment, goal
detail and Settings still lacked their own safe-area wrapper. Extend scope to
those four routes and their existing goal-detail/Settings fixtures solely for
safe-area padding and existing-form keyboard avoidance, preserving every handler
and repository call. Native-tab routes keep their existing inset ownership.

## Historical seven-question packet (superseded count/scope)

TASK: Improve the existing seven-question native onboarding, make reviewed
preferences affect real future focus/break defaults, then polish onboarding,
Home rhythm summary and sign-in/sign-up presentation in the approved preview style.
STATE: READY / IN_PROGRESS. Owner explicitly chose to keep the existing seven
questions in the structured reply; do not add role/education questions.
RISK: HIGH for draft persistence/settings integrity; UI-only presentation MEDIUM.
Review: work alone, self-review plus tests; independent review remains pending
before acceptance/integration. No production readiness or deployment claimed.

READ: AI_RULES, execution/DoD/guardrails/template/map; V1 implementation Phase7
assessment definition/start/questions/validation/persistence/retakes; canonical
UI assessment flow, review, optionality, saving and personalization sections;
Component Library input principles/labels/helper text; revision03 section3,
15 sections3–5,20 sections1–2; October14 language-selection amendment;
prototype ONBOARDING.md and onboarding visual styles. Supabase skill governs
preserving Auth/security boundaries; SDK56 and RN0.85 keyboard guidance checked.
BASELINE: Seven stable version1 questions; answer-saving/error states still
allow navigation; resume effect can advance the step again after every save;
cancelled fixed-ID draft cannot be restarted cleanly; empty failed load cannot
retry; review lacks current/new per-field choices and stale-settings protection.
Source/config already dirty from prior authorized work; preserve unrelated edits.

ALLOWED: assessment definition/flow/storage/personalization/settings application;
onboarding routes/context as needed for scoped safe transitions; local-database
additive repository methods (no schema migration); settings-storage wrapper;
new shared preview-flow UI/localized copy; Home rhythm card; existing auth
sign-in/sign-up presentation and shared form UI; focused tests/loaders; affected
data/docs/changelog and this evidence record. New helpers only for actual reuse.
NON-GOALS: No new questions/role/education data, AI calls, medical/personality
scores, new provider/dependency, remote Auth/backend/SMTP/RLS changes, accounts,
deletion, deployment, commit/push, notification permission or schedule changes.

BEHAVIOR / ACCEPTANCE:
- ON1: Seven stable IDs/options retained, clearer localized descriptions and
  exact duration choices; skip all/use current settings remains available.
- ON2: Restore once, Back retains choices, no automatic advance after a save;
  saving/failed writes cannot claim durable completion. Retry failed load and
  failed save distinctly; reject duplicate actions and stale callbacks.
- ON3: Owner-keyed provider and cancelled/redo attempt handling preserve prior
  records; queued writes must not enter another account after unmount/switch.
- ON4: Review actual saved current/new focus and break values. Uncertain or
  flexible answers propose no replacement; changes require per-field selection
  and explicit Apply. Failed/stale apply preserves prior committed settings.
  Locale/presentation/history/tasks and running sessions remain unchanged.
- ON5: Applied defaults are observable in real setup/break and Home, not fake
  preview data. Use current settings does not reset earlier explicit values.
- UI1: Reuse original scenery/tokens/buttons; calm welcome/question/review cards,
  selected marks, clear progress, responsive scrolling and en/si/ta copy.
- UI2: Sign-in/sign-up have branded calm layout, persistent labels, keyboard
  access, safe localized errors/loading, duplicate-submit guard and retained
  entered values. No credential logging or server policy changes.

PERSISTENCE: Existing owner-scoped SQLite tables only; bounded new lookup/CAS
methods and unique retake IDs may be added without resetting existing drafts.
VERIFICATION: Installed TypeScript/ESLint; targeted domain/hook/component tests;
real node:sqlite ownership, cancellation/redo and settings-CAS tests using the
existing installed Node24 harness; docs/diff checks; Android bundle/device checks
only when available. State unrun native/iOS/TalkBack/large-font/translation gates.
STOP: Unexpected ownership/data regressions or a required policy conflict stops
affected risky writes. Never claim synthetic fixture success as native evidence.
