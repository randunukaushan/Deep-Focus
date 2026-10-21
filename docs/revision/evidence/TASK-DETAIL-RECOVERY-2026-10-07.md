# Task detail read and completion recovery — 2026-10-07

```text
TASK: L-07 local Task detail reliability — trust stored ID, not route title
STATE: IMPLEMENTED; HIGH / REVIEW_PENDING
DELIVERABLE: task-detail loading/error/retry and save-first completion UI
REQUIREMENT / PHASE: V1 Task detail local behavior; explicitly independent of auth/backend/sync
APPROVALS: local SQLite/device-only storage boundary (ADR-012); existing Tasks and
  Focus navigation. No ownership, schema or account behavior is introduced.
RISK / REASON: HIGH provisionally — task completion mutates persisted user data;
  a route identifier selects the local record and a failure must not fake success
REVIEW GATE: independent qualified review required before acceptance/integration;
  Android/iOS UI, screen reader, storage failure and lifecycle checks pending
READ: AGENTS.md; docs/AI_RULES.md; docs/ai/AI_EXECUTION_POLICY.md;
  docs/ai/DEFINITION_OF_DONE.md; docs/ai/ENGINEERING_GUARDRAILS.md;
  docs/DOCUMENTATION_MAP.md; docs/V1_FEATURE_SCOPE.md §6; docs/V1_SCREEN_MAP.md
  route 15; docs/COMPONENT_LIBRARY.md loading/retry/duplicate-submit rules;
  docs/revision/07-LUNA-IMPLEMENTATION-PLAYBOOK.md L-07; ADR-012
INSPECT: src/app/tasks/index.tsx callers, src/app/tasks/[taskId].tsx, task types/storage,
  route tests and existing working-tree changes
ALLOWED FILES: src/app/tasks/index.tsx, src/app/tasks/[taskId].tsx,
  tests/components/task-detail.test.mjs, this evidence, tests/components/README.md,
  docs/CHANGELOG.md
NON-GOALS: edit/delete/archive, task-goal links, task/session DB transactions,
  account ownership/auth, backend/sync, schema/migration, product-policy changes
BEHAVIOR: read errors show generic retry, not “missing”; a missing stored ID stays
  unavailable and route title cannot fabricate a task. Completion re-reads the
  current local list, fails if the ID vanished, saves before UI confirmation, and
  rejects duplicate in-flight actions. Save failure remains pending with retry.
PERSISTENCE: uses existing loadTasks/saveTasks only; no format or transaction changes
FAILURES / EDGES: read failure/retry, missing ID, route title forgery, save failure/
  retry, duplicate completion, no false success
SECURITY / ACCESSIBILITY: route data treated as untrusted; private title removed from
  URL; safe generic errors; loading state and labeled action. No auth/ownership claim.
  Native focus/touch/VoiceOver/TalkBack NOT_RUN.
ACCEPTANCE: 4 actual-route-source synthetic regressions pass; stored data preserved
  on read/write failure. Review and native evidence still required for acceptance.
VERIFICATION: full command `node --test --test-reporter=tap tests/domain/*.test.mjs
  tests/components/*.test.mjs tests/navigation/*.test.mjs web/tests/*.test.mjs`
  — 75/75 pass, no failure/skip/todo; root `node node_modules/typescript/bin/tsc
  --noEmit` — exit 0; direct ESLint on both task routes and affected Goals/helper
  tests — exit 0. `node docs/revision/check-docs.mjs` — PASS, 62 Markdown files,
  917 links, 80/80 requirements covered; `git diff --check` — exit 0 with existing
  LF/CRLF notices. Synthetic route harness is not a React Native/device test.
STOP / OPEN DECISIONS: independent review and actual native/device evidence; no
  production data, migration, commit, push or deployment authorized/performed here
```
