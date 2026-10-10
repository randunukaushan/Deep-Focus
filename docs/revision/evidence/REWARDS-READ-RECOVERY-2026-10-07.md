# Rewards read recovery — 2026-10-07

```text
TASK: Progress reliability — distinguish Rewards read failure from empty history
STATE: IMPLEMENTED; independent review and device accessibility checks pending
DELIVERABLE: local read error/retry state and route regressions
REQUIREMENT / PHASE: V1 Progress/Rewards; local completed-session milestones
APPROVALS: Existing local milestones retained; no trusted XP/reward grants
RISK / REASON: MEDIUM — read-only persisted history and user-visible progress
REVIEW GATE: self-check only; independent review and Android screen-reader/device
  verification pending; iOS verification NOT_RUN
READ: AGENTS.md; docs/AI_RULES.md; docs/ai/AI_EXECUTION_POLICY.md;
  docs/ai/DEFINITION_OF_DONE.md; docs/ai/ENGINEERING_GUARDRAILS.md;
  docs/DOCUMENTATION_MAP.md; docs/revision/20-SETTINGS-PROGRESS-AND-UNITS.md;
  docs/revision/22-REWARD-GOAL-AND-AI-WIRE-CONTRACT.md
INSPECT: Rewards route, local session-history reader, progress read recovery,
  current route-test harness, dirty worktree and installed verification scripts
ALLOWED FILES: src/app/(tabs)/progress/rewards.tsx;
  tests/components/rewards.test.mjs; docs/CHANGELOG.md; this evidence
NON-GOALS: new reward catalog, XP/level/streak, storage/schema or goal changes,
  authentication, cloud writes, localization, migration or device claims
BEHAVIOR: loading, successful-empty and read-error are distinct. Failed reads
  expose a generic accessible alert and explicit retry, without rendering false
  zero totals. Late reads after blur/retry are ignored. Existing local milestone
  rules remain unchanged.
PERSISTENCE: read-only; no records are changed or removed
FAILURES / EDGES: storage rejection, retry success, successful empty history
SECURITY / ACCESSIBILITY: storage exception text is not exposed; error uses alert
  role and retry has an accessible name. Screen-reader/device behavior NOT_RUN.
ACCEPTANCE: regression tests assert errors do not show the empty/zero state;
  retry shows stored sessions; genuine empty results keep the existing empty UI.
VERIFICATION: `node --test --test-reporter=tap tests/components/rewards.test.mjs`
  — 3/3 PASS; complete root suite (`tests/domain/*.test.mjs
  tests/components/*.test.mjs tests/navigation/*.test.mjs web/tests/*.test.mjs`)
  — 166/166 PASS, 0 failures/skips/todos; `node
  node_modules/typescript/bin/tsc --noEmit` — exit 0; focused direct ESLint for
  route/test — exit 0; `node docs/revision/check-docs.mjs` — PASS, 83 Markdown
  files / 932 local links / 80 requirements covered; `git diff --check` — exit 0
  (existing LF/CRLF notices). Harness uses synthetic hooks/native primitives;
  native device and screen-reader behavior NOT_RUN.
ROLLBACK / RECOVERY: revert only this isolated route/test/docs slice if needed;
  no persisted data is touched
STOP / OPEN DECISIONS: none for this read-only recovery slice
```
