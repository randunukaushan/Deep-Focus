# Task brief — Goal progress copy and semantics regression

```text
TASK: Align goal-screen explanatory copy with the approved time/count distinction
STATE: IMPLEMENTED; installed-device visual and screen-reader review pending
DELIVERABLE: one copy correction and pure domain regression tests
REQUIREMENT / PHASE: V1 goals; phase 4; owner decision recorded 2026-10-06
APPROVALS: cancelled-session actual focus seconds count toward time goals;
  cancelled sessions do not count as completed sessions
RISK / REASON: LOW/MEDIUM — no persistence or calculation changes; clarifies
  user-visible meaning of existing goal calculations
REVIEW GATE: self-review; SQLite integration acceptance remains REVIEW_PENDING

READ: docs/revision/01 owner amendment; docs/revision/13 core reliability;
  docs/revision/20 settings/progress units; docs/ai/ENGINEERING_GUARDRAILS.md
INSPECT: goal-progress.ts and Goals screen; current goal fixtures/tests
ALLOWED FILES: Goals list copy, goal progress test, this evidence, changelog
NON-GOALS: SQLite schema/adapters, goal edit lifecycle, history metrics

BEHAVIOR: time goals sum terminal sessions' recorded focused seconds; session
  count includes only completed sessions. UI names both forms accurately.
PERSISTENCE: unchanged.
FAILURES / EDGES: not changed in this copy/test slice.
ACCEPTANCE: fixtures verify 60 completed + 120 cancelled focus seconds = 180
  time-goal seconds, while the same pair contributes only one completed session.
VERIFICATION: final mobile suite 45/45 passes, including 2 goal semantics
  regressions; root TypeScript typecheck and direct focused ESLint exit 0; docs
  checker passes 58 Markdown files / 913 links; git diff --check exits 0 with
  existing line-ending notices. Native rendering remains NOT_RUN.
STOP / OPEN DECISIONS: none for this correction; separate SQLite review/device
  gates remain open.
```
