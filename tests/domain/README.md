# Timer-domain regression harness — L-02A

## Eight audit-finding repairs — October 6–7, 2026

See [repair evidence](../../docs/revision/evidence/AUDIT-FIXES-2026-10-06.md).
Combined command: `node --test tests/domain/*.test.mjs tests/components/*.test.mjs tests/navigation/*.test.mjs web/tests/*.test.mjs`.
Completed run: 64/64 pass (57 mobile + 7 website). Added stale terminal-save,
transaction FK enforcement, migrated-goal preservation, same-runtime initialization
and import retries, and pause accounting during save failure. Tasks handler tests
cover rejected add/completion, load retry and duplicate-submit protection.
The SQLite shim no longer provides serialization on behalf of production code.
Actual native transaction/device behavior and independent review remain pending.

## Current repair brief — remaining timer failures (2026-10-06)

Owner requested finding and fixing the remaining faults. Outcome: reject early
completion, invalid duration and malformed records without crashing the timer
screen or overwriting an unreadable active record. Keep the seconds schema and
engine return types; no V2 migration, dependency, provider or visual redesign.
Allowed files: focus engine, hook, storage, session route, domain tests, this
README and changelog. Preserve unrelated dirty work. Acceptance: all existing
timer tests plus invalid-input/record regressions pass; typecheck and focused
ESLint pass; hydration gates all actions, writes and automatic completion.
Risk HIGH for lifecycle/read-boundary changes: implementation candidate only;
independent review and device verification remain required before acceptance.
Storage transaction redesign and full-app bug certification are outside this
slice. Roll back only this task's patch, never existing work or stored data.
Actual checks are recorded below after execution.

## Authorized continuation — local session persistence reliability

Owner requested fixing hidden save failures, terminal active-file deletion before
history durability, and in-process concurrent write loss. Follow core contract
13 §§5–7 and CR-T10–14 plus playbook L-06. Preserve the legacy seconds records
and current JSON files; do not add SQLite, schema/migration, cloud, ownership or
provider behavior in this slice. The exact transaction/ADR-012 and production
recovery gates remain separate.

Outcome/acceptance: write errors reach callers; retry after failure works; a
terminal history write failure preserves the active terminal record; active
cleanup occurs only after idempotent history persistence; crash-window restart
can retry a terminal record; concurrent writes preserve both history entries;
malformed history is not filtered then overwritten. The hook/route surface save
failure and offer a bounded retry. Add deterministic mock-filesystem and hook
failure/recovery cases; rerun the 24-test baseline plus additions, typecheck and
local ESLint. Inspect real native device/crash behavior as NOT_RUN.

Allowed files: `src/features/focus/session-storage.ts`,
`src/features/focus/use-focus-session.ts`, `src/app/focus/session.tsx`,
`tests/domain/session-boundaries.test.mjs`, this README and `docs/CHANGELOG.md`.
Preserve existing dirty timer-engine fixes/tests and all unrelated files. No
stored user file is read or changed by tests. Risk HIGH: local persisted-session
lifecycle/integrity; implementation may be verified synthetically but remains
REVIEW_PENDING until independent qualified review and Android/iOS failure/restart
evidence. Existing JSON files have no cross-process lock or multi-file database
transaction, so this patch must not claim those guarantees.

### Current repair results — 2026-10-06

- `node --test tests/domain/session-engine.test.mjs tests/domain/session-boundaries.test.mjs`
  — 24 tests pass, 0 failures/skips/todos. Original CR-T01–08 all pass. Added
  invalid duration/time/record, early paused completion and rollback coverage.
- Boundary tests execute actual hook/storage source transpiled in memory using
  the installed TypeScript compiler. React hooks, timers, AppState and filesystem
  are substituted. They establish bounded hydration/error/control behavior, not
  real React scheduling, navigation, disk durability or device lifecycle proof.
- `node node_modules/typescript/bin/tsc --noEmit` — exit 0.
- Direct installed ESLint over the four changed production files and two test
  files — exit 0, no warnings. This avoids the unavailable npm/npx wrapper.
- `git diff --check` — exit 0 (existing LF/CRLF notices only).
- Initial boundary-harness failures came from cross-realm promise settling; the
  harness now waits one event-loop turn, not simulated elapsed focus time. A
  typed Home route error and harness hook-naming lint error were corrected.

Engine records remain seconds-based. Invalid creation inputs throw RangeError;
early completion returns the unchanged live record. New route input retains the
setup screen's integer 5–180 minute range. Existing stored sessions are restored
before considering new-route input. Malformed/read-failed active files produce a
recovery screen and are not overwritten by timer startup. Other read-only
storage consumers retain their legacy best-effort loading behavior.

Independent review and real-device/React navigation tests remain open. At the
time of this timer-repair result, persistence defects were outside scope; the
separately authorized continuation below addresses an interim subset. Full
clock-change reconciliation and seconds-rounding migration remain outside this
bounded repair. No whole-app bug-free or production-ready claim; no commit/push.

### Persistence continuation results — 2026-10-06

- Reconfirmed the pre-change baseline: 24/24 tests passed, including the existing
  CR-T04/CR-T05 fixes; typecheck and direct ESLint passed.
- Test-first storage additions reproduced swallowed write errors, terminal records
  becoming unrecoverable, lost concurrent history append and malformed history
  being at risk of overwrite.
- Final focused run: `node --test --test-reporter=tap tests/domain/session-engine.test.mjs tests/domain/session-boundaries.test.mjs`
  — 31/31 pass, 0 skipped/todo. The 24 prior cases remain passing; seven added
  checks cover active-save retry, terminal-history failure, active cleanup failure
  and restart retry, concurrent appends, malformed-history preservation,
  conflicting duplicate preservation, and hook save-error/retry behavior.
- `node node_modules/typescript/bin/tsc --noEmit` — exit 0.
- Direct local ESLint over the four affected production files and two domain test
  files — exit 0, no warnings. `git diff --check` — exit 0 (line-ending notices).
- Node still reports `MODULE_TYPELESS_PACKAGE_JSON`; tests load and pass. The mock
  filesystem does not establish actual Expo filesystem atomicity, multi-process
  locking, Android/iOS crash behavior or real route navigation.

The interim JSON adapter serializes operations in one JS runtime and keeps the
terminal active record until history is written. It is not a multi-file database
transaction or cross-process lock. HIGH lifecycle/integrity review and actual
device/restart checks remain REVIEW_PENDING; this is not release acceptance.

## UX-02 navigation foundation — 2026-10-06

Outcome: align the mobile tab shell with the approved Home / Plan / Focus /
Progress / Profile order, provide Plan entry points to existing Tasks and Goals,
nest Rewards and History under Progress, and retain the old Analytics/Rewards/
History URLs as replace-style redirects. This slice does not change session
storage, identity guards, business behavior, token values or the user's dirty
Home/theme files.

Acceptance/evidence: static Node tests assert tab order, existing Plan target
routes, canonical Progress route files and legacy redirect destinations (including
preservation of the history `sessionId`). These checks do not execute Expo Router;
Android/iOS cold/warm deep links, Back behavior and account switching remain
NOT_RUN. Read-only `adb devices -l` returned an empty connected-device list;
iOS simulator/device availability is also NOT established. Risk MEDIUM
navigation compatibility; code is an implementation candidate, not accepted
until actual platform checks. Changes limited to the tab
layout, Plan tab, route moves/aliases, affected internal history links, one
navigation contract test, this record and changelog.

Actual checks: `node --test --test-reporter=tap tests/domain/session-engine.test.mjs tests/domain/session-boundaries.test.mjs tests/navigation/navigation-contract.test.mjs`
— 35/35 pass (the 31 timer/session tests remain passing, plus four static
navigation checks); `node node_modules/typescript/bin/tsc --noEmit` — exit 0;
direct ESLint over the 13 changed app/test files — exit 0; `git diff --check` —
exit 0 with existing LF/CRLF notices. Expo Router generated refreshed local
route types during an offline dev-server startup; no device/client interaction
was run. Initial static tab-order test failed, the tab sequence was corrected,
and the final complete run passed. Native links, visual/accessibility behavior,
and real Back-stack behavior remain NOT_RUN and REVIEW_PENDING.
- `node docs/revision/check-experience-contracts.mjs` — PASS (27 documented
  routes, five aliases, 56 contrast pairs in the **proposed token sheet**).
  This checks documents, not current rendered app colors or UI.

## Task brief (2026-10-06)

READY, phase 0 implementation: owner explicitly asked this assistant to start the
real app implementation using existing docs. Follow build guide 49 §3 and harness
plan 38 §3, not a replacement plan. MEDIUM: test-only, synthetic pure source calls;
no persisted data, network, native modules, provider or production state effects.
Self-review appropriate for this bounded harness; timer repair HIGH review gates
remain unchanged.

Read mandatory AI/execution/DoD/guardrails/map/template; implementation-plan intro,
38 §3, 13 §§8/11/12 and guide 49; actual engine/types, diagnostic and package scripts.
Allowed new files: this README and session-engine.test.mjs. Evidence updates:
docs/revision/09-COVERAGE-AND-AUDIT.md and docs/CHANGELOG.md. Preserve all dirty work,
especially Home/theme and existing documentation/prototype changes. No app edits,
dependency/lock/config changes, install, commit, push, migration or deployment.

Acceptance: eight independent CR-T01–08 cases import the actual engine; failures
remain failures; fresh-fixture repeat is deterministic; false assertion signals
failure; loader failures distinct; TH-T01–08 assessed. No skip/todo/only, real-time
waiting, random-ID snapshots or copied engine. Rollback only the new harness,
never user data. Stop on unexpected loader/new baseline changes and investigate.

## Run

From repository root, using installed Node v24.19.0:

```text
node --test --test-reporter=tap tests/domain/session-engine.test.mjs
node node_modules/typescript/bin/tsc --noEmit
npm run lint
```

There is no npm test script. Node's native TypeScript erasure is not a typecheck;
the app's typecheck is separate. This source currently has only an erased type
import. Review future runtime imports before running tests. A known
MODULE_TYPELESS_PACKAGE_JSON warning does not justify changing the app's package
module type. Unsupported imports or missing files are tooling errors, not case
passes or reproduced product defects.

## Baseline and scope

Engine SHA-256 before changes:
44c029a482e1a452acc633577dacac4a59b6a01df373cfa8eb1654716c1c78a4.
Expected unchanged baseline: CR-T01/03/07 pass; CR-T02/04/05/06/08 fail.
That verifies defect detection, not product correctness. After an admitted repair,
all relevant cases must pass; never encode five failures as suite success.

Zero duration and malformed timestamp cases accept only explicit INVALID_INPUT /
INVALID_RECORD result/error codes or RangeError (legacy diagnostic convention).
Unexpected exceptions propagate; successful NaN objects are never rejection.
No new production error API is approved by this adapter. A future accepted result
shape change needs an explicit adapter update, preserving the numeric oracles.

No React/controller, storage, device lifecycle, migration, security, reward or UI
claim follows from these tests. CR-02F/CR-02R decisions and independent review
still gate changed timing/storage behavior. Existing UI prototypes remain design
references, not production timing/persistence code.

## Actual results

Run 2026-10-06 in the repository workspace:

- `node --test --test-reporter=tap tests/domain/session-engine.test.mjs` — exit 1;
  8 tests executed, 3 passed (CR-T01/03/07), 5 failed at the expected contract
  assertions (CR-T02/04/05/06/08), with no skips or todos. The Node
  `MODULE_TYPELESS_PACKAGE_JSON` warning appeared; source loading and all cases
  completed, so this is the known module-type warning rather than a loader error.
- `node node_modules/typescript/bin/tsc --noEmit` — exit 0.
- `npm run lint` — NOT RUN: `npm` is not available in the current PowerShell
  command environment (`npm` was not recognized).
- Engine SHA-256 observed: `44c029a482e1a452acc633577dacac4a59b6a01df373cfa8eb1654716c1c78a4`,
  matching the recorded baseline. No engine or test edits were made in this run.

This is the pure-domain baseline only; controller, persistence, UI, device,
recovery and security behavior remain unverified. Acceptance source: revision 38
TH-T01–08; numerical source: revision 13 CR-T01–08 and §11, linked through
build guide 49. The owner has since approved the narrowly scoped seconds-format
CR-T04/CR-T05 repair below; this does not adopt the broader CR-02/V2 proposal.

## Approved scoped repair — CR-T04 and CR-T05

Owner approval: preserve the existing seconds-based representation and change
only terminal projection (CR-T04) and epoch-zero pause accounting (CR-T05).
Do not change persistence/schema, UI, function return types or introduce V2.
Risk: MEDIUM, a reversible pure projection correction with no writes or record
format change. Files: `src/features/focus/session-engine.ts`, this test file,
this evidence record and `docs/CHANGELOG.md`. Existing unrelated work is preserved.

### Actual results — 2026-10-06

- `node --test --test-reporter=tap tests/domain/session-engine.test.mjs` — exit 1;
  10 tests, 7 pass and 3 fail. CR-T01/03/04/05/07 pass, including added CR-T04
  stored-focus-and-pause totals and CR-T05 resume-after-epoch-zero regressions.
  CR-T02, CR-T06 and CR-T08 remain visible failures. No skips or todos.
- `node node_modules/typescript/bin/tsc --noEmit` — exit 0.
- `git diff --check -- src/features/focus/session-engine.ts tests/domain/session-engine.test.mjs`
  — exit 0; Git reported only its existing LF-to-CRLF working-copy warning.
- `npm run lint` could not start because `npm` is unavailable. Direct
  `node node_modules/expo/bin/cli lint` also could not complete because the Expo
  lint script invokes unavailable `npx`.

The broader CR-02 choices, storage/controller behavior, device lifecycle and
independent review remain open; these results establish only the approved pure
engine cases, not end-to-end timer correctness or acceptance.

## SQLite migration and session adapter continuation — 2026-10-06

The former seven session-persistence tests that failed after adapter cutover were
not removed or weakened. Their fixtures now call the production TypeScript
SQLite repository/session adapter against Node 24's built-in SQLite database
(SQLite 3.53.3), with only Expo SQLite, filesystem and platform boundaries
shimmed. Assertions continue to cover strict/corrupt load, failed save and retry,
terminal-save rollback before pointer cleanup, restart/retry without duplication,
concurrent history writes, malformed-source preservation and conflicting
duplicates. Three more cases prove whole-import rollback plus restart/retry,
identical active/history de-duplication and composite owner-key isolation.

Actual combined command:
`node --test --test-reporter=tap tests/domain/session-engine.test.mjs tests/domain/session-boundaries.test.mjs tests/navigation/navigation-contract.test.mjs tests/components/button.test.mjs`
— 41/41 pass, 0 skipped/todo (31 pre-existing timer/session, four navigation,
three Button, three added SQLite migration/ownership cases). The earlier 35-test
run omitted `tests/components/button.test.mjs`; the exact old count was
31 + 4 + 3 = 38. No files or assertions were lost; the SQLite follow-up adds
three, so the current combined count is 41.

Typecheck, focused ESLint, docs checker and `git diff --check` pass. This
synthetic Node SQLite run does not establish Expo native binding behavior,
Android/iOS process death, device storage failure, independent review or
production migration. The initial install reported 40 vulnerabilities; these
were subsequently re-audited with official npm CLI 11.21.0 in an isolated temp
folder: 27 high, 13 moderate, 0 critical; 7 direct and 33 transitive.
`--omit=dev` returned the same 40 because the lockfile marks them production-
reachable. This does not establish inclusion/exploitability in the shipped app;
impact and remediation scope are assessed in
`docs/revision/evidence/Dependency-Audit-2026-10-06.md`. No project dependency,
manifest or lockfile changes were made by audit; no audit fix was run.
