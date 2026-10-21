# Eight audit findings — bounded repair

Owner requested implementation of all six code-audit and two website contrast
findings. HIGH risk: local persistence/lifecycle integrity. Candidate only;
independent review and native/device evidence remain required for acceptance.

Outcome: terminal history cannot be revived by stale saves; every store write
enforces foreign keys; migrated goals remain usable; failed initialization is
retryable; save-failure waiting time is not focus credit; Tasks reports failures
without false success; Plans/footer text has AA normal-text contrast.

Read: AI rules, execution policy, DoD, engineering guardrails, task brief,
documentation map; database local SQLite/legacy import contract, recorded October
6 owner decisions, existing source/callers and test fixtures. Exact Expo SDK 56
SQLite documentation and installed transaction implementation consulted.

Allowed: local-database.ts, focus hook, Tasks screen and a focused task-state
helper if needed; affected domain/component tests; web globals and contrast tests;
this evidence file, domain README and changelog. No schema/data migration,
dependencies, accounts, production access, commit/push/deployment or other agents.
Preserve all pre-existing dirty work. Baseline: mobile 47, web 6 passing tests.
Rollback only this patch; do not remove existing work or stored data.

Acceptance: discriminating regressions for all eight issues, retained baseline,
root/web typecheck and scoped lint. Synthetic SQLite/hooks do not establish native
durability or screen-reader behavior. Actual results will be recorded below.

## Implemented fixes (continued October 7)

1. Active-session writes reject an existing completed/cancelled ID within the
   transaction. Regression covers terminal commit followed by queued stale save.
2. Store owns a private SQLite connection and queues both reads and writes.
   Foreign keys are enabled and checked before `BEGIN IMMEDIATE`; commit/rollback
   happen on that same connection. The test shim no longer supplies artificial
   serialization or a pre-enabled foreign-key setting. This does not claim a
   cross-process JavaScript lock; SQLite still arbitrates other connections.
3. Bulk goal saves allow only unchanged existing legacy goal snapshots, checking
   them against stored rows inside the transaction. Forged/edited legacy goals
   still reject; creating a new bounded goal no longer rejects the old snapshot.
4. A current active-save failure creates an in-memory paused snapshot. Explicit
   save retry persists that snapshot; focus resumes only by user action. Five
   minutes spent waiting is verified as pause time, not focus credit. If the app
   dies while storage is failing, the last durable snapshot still governs recovery;
   no durability of unsaved state is promised.
5. Failed initialization clears the cached promise so same-store retry can read
   again; a successfully opened private connection is reused without repeated opens.
6. Tasks now distinguishes loading/read failure, offers non-destructive retry,
   commits UI changes only after saving, retains failed drafts/list state and
   prevents duplicate submissions and editing during an in-flight save.
7. Plans navigation uses the theme's ink token instead of fixed navy.
8. Footer note uses the theme's muted text token instead of fixed gray. A new
   regression checks actual selector token use and light/dark normal-text ratios.

## Evidence and limits

The completed combined regression run before the continuation passed 64/64:
57 mobile (original 47 + six store/hook + four Tasks handler cases), and seven
website tests (original six + the two-role contrast regression). Two initial new
assertions were corrected to compare persisted JSON on both sides: optional
undefined fields are absent on storage round-trip. No existing assertions removed.

Tests execute the actual store/hook/route source with synthetic SQLite/platform
and React scheduling, not an installed native app. The website check is CSS/token
level, not screen-reader or real-browser certification. Independent review,
Android/iOS lifecycle verification and browser accessibility checks remain pending.
No dependency/security-advisory remediation, production data operation, install,
commit, push or deployment was included in this repair. Review status:
REVIEW_PENDING; release status: NOT_READY. Final continuation checks recorded below.

### Continuation verification — 2026-10-07

- Combined regression command above rerun: 64/64 pass, no skips/todos.
- Root and web `node node_modules/typescript/bin/tsc --noEmit`: pass.
- Root direct ESLint for local-database, focus hook, Tasks route and changed
  domain/component tests: pass. Web direct ESLint for public-pages.test.mjs: pass.
- The initial continuation lint flagged inline task ID creation in a nested
  async handler under React Compiler purity analysis. Moved task creation into
  a module-level factory invoked only by submit; focused Tasks tests rerun 4/4.
- No Android/iOS or real-browser/screen-reader result is claimed. Store and
  controller changes still require independent review before acceptance.

Changed code: src/features/storage/local-database.ts,
src/features/focus/use-focus-session.ts, src/app/tasks/index.tsx,
web/src/app/globals.css. Tests: tests/domain/session-boundaries.test.mjs,
new tests/components/tasks.test.mjs, web/tests/public-pages.test.mjs.
Evidence: this record, tests/domain/README.md, docs/CHANGELOG.md.
