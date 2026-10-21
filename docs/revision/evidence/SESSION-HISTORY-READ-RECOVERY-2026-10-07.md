# Session History read recovery — 2026-10-07

```text
TASK: Progress history reliability — recover from local history read failure
STATE: IMPLEMENTED; native device/accessibility review pending
DELIVERABLE: list and detail error/retry states using existing readProgressHistory
REQUIREMENT / PHASE: V1 Progress, local history; independent of auth/backend/sync
APPROVALS: local SQLite/device-only boundary ADR-012; history and goal event
  semantics unchanged
RISK / REASON: MEDIUM — read-only views of persisted records; no write changes
REVIEW GATE: self-review; TalkBack/VoiceOver and Android/iOS route checks pending
READ: AGENTS.md; AI rules, execution policy, DoD and engineering guardrails;
  documentation map; docs/V1_FEATURE_SCOPE.md §§8/11; docs/COMPONENT_LIBRARY.md
  loading/empty/error/retry; docs/revision/07 L-07; docs/revision/15 UX-02;
  docs/revision/01 ADR-012
INSPECT: Progress history list/detail routes, readProgressHistory helper, session
  history storage reader, tests and dirty worktree
ALLOWED FILES: two history routes, focused route test, this evidence,
  tests/components/README.md and docs/CHANGELOG.md
NON-GOALS: timing, filters, goal calculations, schema/storage implementation,
  auth/ownership/sync, session writes or deletion
BEHAVIOR: failed reads show generic error and explicit retry. Only successful reads
  may show an intentional empty state or “session unavailable.” Retry reads from
  storage; unmounted screens ignore late responses.
PERSISTENCE: read-only; no data is cleared or rewritten
FAILURES / EDGES: history list failure/empty, detail failure/retry and absent ID
SECURITY / ACCESSIBILITY: no storage exception detail; polite loading label, alert,
  retry and safe navigation. Actual screen-reader/focus/device interaction NOT_RUN.
ACCEPTANCE: four route regressions pass; empty and error/missing are distinct.
VERIFICATION: `node --test --test-reporter=tap tests/domain/*.test.mjs
  tests/components/*.test.mjs tests/navigation/*.test.mjs web/tests/*.test.mjs`
  — 82/82 pass, 0 failures/skips/todos; root typecheck exit 0; focused ESLint for
  both routes/tests exit 0. Docs checker PASS, 65 Markdown files / 918 links /
  80/80 requirements covered; `git diff --check` exit 0 (LF/CRLF notices).
  Component tests use synthetic hooks/platform primitives, not native execution.
REVIEW_STATUS: self-review; native evidence pending
RELEASE_STATUS: NOT_READY
```
