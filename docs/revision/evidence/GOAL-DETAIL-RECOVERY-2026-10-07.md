# Goal detail local-read recovery — 2026-10-07

```text
TASK: L-07 Goals detail — distinguish read failure from missing record
STATE: IMPLEMENTED; native accessibility/device review pending
DELIVERABLE: generic loading/error/retry state reusing the Goals read helper
REQUIREMENT / PHASE: V1 Goal detail local behavior; independent of account/backend/sync
APPROVALS: ADR-012 local SQLite and device-only/no-auto-claim boundary; existing
  goal progress semantics unchanged
RISK / REASON: MEDIUM — read-only route state over local data
REVIEW GATE: self-review; native TalkBack/VoiceOver and installed-device checks pending
READ: AGENTS.md; docs/AI_RULES.md; docs/ai/AI_EXECUTION_POLICY.md;
  docs/ai/DEFINITION_OF_DONE.md; docs/ai/ENGINEERING_GUARDRAILS.md;
  docs/DOCUMENTATION_MAP.md; docs/V1_FEATURE_SCOPE.md §6;
  docs/COMPONENT_LIBRARY.md loading/empty/error/retry; docs/revision/07 L-07;
  docs/revision/15 §7; docs/revision/01 ADR-012
INSPECT: src/app/goals/[goalId].tsx, Goals list, read helper and current tests
ALLOWED FILES: Goal detail route, focused route test, this evidence,
  tests/components/README.md and docs/CHANGELOG.md
NON-GOALS: goal calculation, write, schema, ownership, auth, history semantics or sync
BEHAVIOR: failed goals or session-history read yields a generic error with retry;
  it does not impersonate a missing goal. Only successful reads can report the ID
  unavailable. Loading is announced politely; retry reloads both reads.
PERSISTENCE: read-only; no user data changed
FAILURES / EDGES: either read can fail independently; retry; successful absent ID
  remains distinct from storage failure
SECURITY / ACCESSIBILITY: no storage exception text shown; alert and retry controls;
  actual screen-reader/native behavior NOT_RUN
ACCEPTANCE: 3 route regressions plus helper cases pass; no failed read shown as
  zero progress or missing record. Overall implementation remains a candidate.
VERIFICATION: combined Node command across domain/component/navigation/web tests
  — 78/78 pass, no failure/skip/todo; root `node node_modules/typescript/bin/tsc
  --noEmit` — exit 0; focused direct ESLint for changed app routes/helpers/tests —
  exit 0. `node docs/revision/check-docs.mjs` — PASS, 65 Markdown files / 918 links /
  80 of 80 requirements covered; `git diff --check` — exit 0 with existing LF/CRLF
  notices. Synthetic route harness is not a React Native/device test.
REVIEW_STATUS: device check pending; independent review not required for this
  read-only state helper alone, but other HIGH task/session slices remain pending
RELEASE_STATUS: NOT_READY
```
