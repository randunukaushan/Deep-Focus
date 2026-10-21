# Plan My Day proposal ordering — 2026-10-07

```text
TASK: V1 Plan My Day — edit the in-memory proposal order
STATE: IMPLEMENTED; focused product/accessibility review pending
DELIVERABLE: earlier/later controls limited to visible preview tasks plus an
  exact in-memory confirmation gate before the normal focus action
REQUIREMENT / PHASE: required Plan My Day proposal can be edited before apply
APPROVALS: existing tasks only; exact user-visible proposal remains unpersisted;
  no task/status/schedule/reminder writes or provider calls
RISK: MEDIUM — reversible in-memory proposal behavior; no trust/persistence change
REVIEW: self-review complete; product and device accessibility review pending
READ: AGENTS.md; docs/AI_RULES.md; execution policy; DoD; guardrails;
  V1_FEATURE_SCOPE.md §11.2; revision/15 §4; revision/24 ordered proposal rules
ALLOWED FILES: src/app/plan-my-day.tsx; tests/components/plan-my-day.test.mjs;
  docs/CHANGELOG.md; this evidence file
NON-GOALS: AI/provider, schedule-time generation, reminders, saved plans, task
  mutation, SQLite/backend/API, schema, package/dependency or release changes.
  The confirmation gate is not a saved-plan apply operation.
BEHAVIOR: proposal order follows selected IDs. Move controls swap adjacent
  visible blocks; boundary controls are disabled. Selected items hidden because
  of the current time limit remain behind visible items and are not promoted by
  reordering. Available time must be an integer >=25 and within JavaScript's
  safe-integer range; invalid input explains the reason and disables proposal
  generation. Start remains a separate action for an existing task.
PERSISTENCE: component state only. No changes to the stored task objects/order.
ACCESSIBILITY: each control names its task and direction, exposes disabled state,
  and has a 48x48 target. Native TalkBack and visual layout verification NOT_RUN.
ACCEPTANCE: reordering changes preview order, boundary moves are unavailable,
  hidden tasks are not promoted, original task records remain unchanged, exact
  user confirmation is required before starting a proposed task, and invalid
  available-time values cannot produce a proposal.
VERIFICATION: focused route tests 6/6 PASS; latest full `node --test` —
  193/193 PASS;
  root `node node_modules/typescript/bin/tsc --noEmit` — PASS; direct ESLint on
  changed route/test — PASS; `node docs/revision/check-docs.mjs` — PASS
  (82 Markdown files, 931 local links, no errors); `git diff --check` — exit 0
  with line-ending notices. Android device checks NOT_RUN.
ROLLBACK: revert the in-memory ordering function and controls; no data recovery
  is needed because there are no writes.
STOP: saving/applying schedules is gated by reviewed plan persistence/API and
  confirmation contracts; OpenAI credentials/cost approval remains pending.
```
