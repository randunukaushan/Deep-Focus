# Shared Button loading accessibility — L-09 reusable component state

## Task detail local read/completion recovery — 2026-10-07

Task brief: treat route parameters as untrusted, load only a stored task by ID,
and distinguish storage failure from a missing task. On complete, persist first;
only then show completed. A failed write stays pending and can be retried. Guard
duplicate submissions and keep task titles out of the route URL.

Risk: HIGH provisionally because completion mutates persisted user data and the
route is a record-identity boundary. No account/ownership model or storage
semantics changed. Acceptance remains `REVIEW_PENDING` until independent review
and Android/iOS interaction/storage-failure checks.

Four synthetic route tests cover read retry, forged/missing title, failed-save
retry and pending duplicate completion. They run the route source with substituted
hooks/platform primitives and are not native persistence evidence. Combined suite:
78/78 pass; root typecheck and affected-file ESLint pass.

The task detail editor now includes optional description and priority. Route tests
cover successful edit, failed-write draft retention and stale-edit conflict; actual
in-memory SQLite tests cover owner scoping, expected-revision checks, terminal
task rejection and preservation of goal/due-date fields. The combined suite is
104/104; device, keyboard and screen-reader verification remain NOT_RUN.

## Owner-scoped task deletion — 2026-10-07

Deletion requires an explicit in-app confirmation. SQLite detaches task links in
one transaction, preserving existing session task-name snapshots and owner
isolation. Route fixtures cover cancel, success, failure and stale-revision
recovery; real SQLite covers active and completed linked sessions, duplicate
requests and same-ID cross-owner records. Independent review and native device
verification remain `REVIEW_PENDING`/`NOT_RUN`. The regression suite is now
112/112; real device/SQLite lifecycle verification is still pending.

The editor now reads active goals from the selected local owner, supports
optional linking/unlinking, and retries goal-read failures. Actual SQLite covers
cross-owner FK rejection, clearing stale duplicate legacy JSON values, and
preserving due date/other task fields. This cross-entity write remains
`REVIEW_PENDING` pending independent ownership review and device verification.

## Goal detail read recovery — 2026-10-07

Reuses the Goals list's failure-vs-empty read helper. A failed goals or history
read has a generic error and retry; only a successful read that lacks the requested
ID reports the goal unavailable. No goal/session records are written or cleared.
Three route tests cover goals-read failure/retry, history-read failure and truly
missing goal. Synthetic route harness only; native screen reader/device checks
remain `REVIEW_PENDING`. Combined suite: 78/78; typecheck, affected ESLint and docs
checker pass.

## Goal completion from verified activity — 2026-10-07

Goals now transition to `completed` atomically when verified terminal activity
first reaches their target. Focus-time goals count actual focused seconds from
completed and cancelled sessions; session-count goals count completed sessions
only. The `completedAt` value is the qualifying event timestamp. Goal target
edits and imported local history are reconciled against the same rules. Route
and domain tests cover event ordering, half-open boundaries, duplicate IDs,
cancelled-session semantics, target reduction, owner isolation, import/source
preservation and rollback when the completion write fails. Bounded goals whose
period has elapsed are marked expired on load; a late in-period verified event
can reconcile an expired goal to completed, while unmet goals remain historical.
Completion does not grant XP/rewards. HIGH-risk persisted behavior remains
`REVIEW_PENDING`; Android and accessibility verification are `NOT_RUN`.

## Goal definition editing — 2026-10-07

The goal detail screen supports editing the title and target of an active,
current-period goal. Focus-time targets are displayed in minutes and stored in
seconds; unchanged values retain their exact stored seconds. Period, time-zone
boundaries, type, status, goal ID and derived progress remain unchanged. Save is
owner-scoped and guarded by the loaded `updatedAt`; stale edits offer reload,
and failed writes preserve the draft. Four synthetic route tests cover count
editing, failed-write retry, stale conflict and focus-minute conversion. A real
SQLite domain test covers owner isolation, same-clock revision advancement,
unchanged period semantics, invalid input and inactive-goal rejection. This
HIGH-risk persisted edit remains `REVIEW_PENDING`; native/device checks are
`NOT_RUN`.

Goal deletion is a separate explicit confirmation. The owner-scoped SQLite
transaction revision-checks the goal, unlinks its tasks while advancing their
revisions, and removes the goal without modifying task records or focus history.
Four synthetic route cases cover cancel, confirmed deletion, failed-write retry
and stale conflict. Real SQLite covers rollback, duplicate requests, owner
isolation and preserved task/history records. This data mutation remains
`REVIEW_PENDING`; device and accessibility verification are `NOT_RUN`.

## Task due-date editing — 2026-10-07

Task detail supports an optional calendar date in `YYYY-MM-DD` form. The chosen
implementation stores date-only input at UTC midnight to keep the calendar day
stable across devices, formats display with the user's locale, preserves an
unchanged legacy timestamp exactly, and allows the user to clear a deadline.
Invalid/impossible dates do not write. Route and domain tests cover set, clear,
invalid leap dates and formatting; real SQLite verifies update/clear, stale
legacy JSON duplicates, validation and owner-scoped revisions. Existing local
schema only; no migration or added dependency. This persisted task edit remains
`REVIEW_PENDING`; Android keyboard/date accessibility checks are `NOT_RUN`.

## Session History list/detail recovery — 2026-10-07

Both history routes reuse `readProgressHistory`. A failed local read gets a
generic retry state instead of a false empty list or “session unavailable”. A
successful empty history and a successfully missing session ID remain distinct.
Four synthetic route cases cover list retry/empty and detail retry/missing. No
history writes or timer calculations changed. Native screen-reader/device checks
remain pending. Combined suite: 82/82 pass.

## Goals read failure — 2026-10-07

Task brief: distinguish storage failure from an intentional empty Goals list.
If either the goals or supporting session-history read rejects, withhold the
list/progress UI, show a generic accessible error and permit retry. No storage
write, migration, goal formula, or session data changes are included.

Authority: `docs/V1_FEATURE_SCOPE.md` §6; `docs/COMPONENT_LIBRARY.md` error
recovery and loading-state requirements; `docs/revision/15-EXPERIENCE-AND-NAVIGATION-BUILD-CONTRACT.md`
§7; owner-approved local SQLite/no-account-claim boundary in ADR-012.
Risk MEDIUM: data-bearing screen error handling, read-only and reversible.
Allowed files: Goals route, goal read-state helper, focused tests, this README,
domain README, task evidence and changelog. Auth/backend/sync, persistence
semantics/schema, goal calculations, account ownership and native UI are excluded.

Acceptance: goal-read failure and history-read failure do not display a false
empty/zero-progress state; retry loads the real data; a genuine empty read still
shows the existing create-goal state; errors expose no internal storage detail.
Rapid submits produce one pending write; fields/cancel are disabled during it;
a failed save keeps the form values available for explicit retry.

Verification: `node --test --test-reporter=tap tests/domain/*.test.mjs
tests/components/*.test.mjs tests/navigation/*.test.mjs web/tests/*.test.mjs` —
71/71 PASS; root TypeScript typecheck and focused ESLint pass. Harness executes
the actual route source with substituted hooks/native primitives. Real device,
VoiceOver/TalkBack, dynamic-text and SQLite lifecycle behavior are NOT_RUN.
Independent review remains pending.

## Task brief — 2026-10-06

Outcome: a loading shared Button preserves the action's accessible context,
includes the loading state in its accessible name, remains busy/disabled,
and allows callers to provide localized loading copy. It does not change visual
tokens, persistence, navigation, action timing or button variants.

Authority: `docs/COMPONENT_LIBRARY.md` §§4.1–4.2, 4.8, 4.15–4.17;
`docs/revision/15-EXPERIENCE-AND-NAVIGATION-BUILD-CONTRACT.md` §7 primary-button
row; generic loading-state behavior in `docs/UI_UX_DESIGN_SPECIFICATION.md`
§7.1 Button States and Loading Buttons. Exact brand-token, app-wide localization
and native announcement claims remain outside this slice.

Risk: MEDIUM, shared cross-platform accessibility behavior; self-review and
synthetic contract tests do not prove screen-reader platform behavior. Keep
VoiceOver/TalkBack checks `REVIEW_PENDING`/`NOT_RUN` until actual devices are
checked. No independent reviewer was available; no self-review is represented as
independent approval.

Allowed files: `src/components/ui/button.tsx`, this test, this README, and
`docs/CHANGELOG.md`. Preserve all existing dirty files. No new dependency.

Acceptance: idle button name/state remain unchanged; loading button disables
repeat activation, retains the action text, has `busy=true`, exposes a loading
accessible name, hides the redundant spinner from assistive technology, and
supports caller-provided localized loading copy.

Verification command: `node --test --test-reporter=tap tests/components/button.test.mjs`
plus timer/session/navigation regression suite, TypeScript typecheck, direct
focused ESLint and `git diff --check`. Synthetic JSX/native primitives establish
the actual component's emitted props only, not rendered focus or spoken output.

Actual checks: component test — 3/3 pass; combined timer/session/navigation/
component run — 38/38 pass (31 timer/session, four navigation, three Button);
`node node_modules/typescript/bin/tsc --noEmit` — exit 0; focused direct ESLint
over changed app/test files — exit 0; `git diff --check` — exit 0 with existing
LF/CRLF notices. VoiceOver/TalkBack and dynamic text/device interaction remain
NOT_RUN, so the UI behavior stays REVIEW_PENDING.
# Assessment flow UI — 2026-10-08

`assessment.test.mjs` exercises the optional seven-question route in the
synthetic screen harness: unanswered progression is blocked, previous answers
remain editable, skip clears the transient choices, and the profile avoids
invented content when no answer set exists. The flow is intentionally memory-only
until the SQLite adapter passes its independent review and Android verification.
This harness does not prove native layout or screen-reader output. See
`docs/revision/evidence/ASSESSMENT-PROFILE-IN-MEMORY-2026-10-08.md`.
