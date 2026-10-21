# Task brief — Focus recovery read failure

```text
TASK: CR-T10 UI candidate — preserve a recoverable state when active-session hydration fails
STATE: IMPLEMENTED; REVIEW_PENDING
DELIVERABLE: root hydration fallback, recovery route error/retry state, pure read-result helper and regression tests
REQUIREMENT / PHASE: Focus recovery / V1 phase 3; CR-T10, Core Reliability §6
APPROVALS: owner-approved local SQLite architecture and retained recovery data; no change to schema, ownership, or stored session semantics
RISK / REASON: HIGH — active-session lifecycle/recovery affects persisted user work; reversible UI handling only, no database mutation
REVIEW GATE: independent qualified review required before acceptance; Android/iOS restart and storage-failure checks remain pending

READ: AGENTS.md; docs/AI_RULES.md; docs/ai/AI_EXECUTION_POLICY.md; docs/ai/DEFINITION_OF_DONE.md; docs/ai/ENGINEERING_GUARDRAILS.md; docs/DOCUMENTATION_MAP.md; docs/revision/13-CORE-RELIABILITY-CONTRACTS.md §§5–7, 9 and 12.E; docs/revision/07-LUNA-IMPLEMENTATION-PLAYBOOK.md L-03/L-06; docs/revision/01-REQUIREMENTS-AND-DECISIONS.md ADR-012 and 2026-10-06 local persistence decision; docs/COMPONENT_LIBRARY.md; docs/UI_UX_DESIGN_SPECIFICATION.md
INSPECT: src/app/_layout.tsx; src/app/focus/recovery.tsx; src/features/focus/session-storage.ts; current SQLite read adapter; existing domain test harness and dirty work
BASELINE: preserved the user-owned dirty tree; immediately prior focused mobile suite was 45/45; native device unavailable/unverified
ALLOWED FILES: root hydration route, focus recovery route, new pure recovery-state helper/test, this evidence record and docs/CHANGELOG.md
NON-GOALS: timer arithmetic or return types, SQLite schema/adapter/migration, owner identity, session writes/clear, account/auth, other feature integration, dependencies, production data, deployment

BEHAVIOR: found active session routes to the existing session screen; empty read retains the existing empty-recovery UI; rejected read remains visibly distinct, generic, offers retry and safe home exit; root startup rejection opens the recovery route rather than becoming unhandled
PERSISTENCE: read-only. Failure never clears or rewrites the active record.
FAILURES / EDGES: synthetic empty, failed, and fail-then-found reads; persistence-layer transaction/restart behavior is not inferred from these helper tests
SECURITY / ACCESSIBILITY: storage exception details are discarded; loading/error regions announce politely; accessible retry and safe exit controls. Native announcement, contrast and touch interaction NOT_RUN.
ACCEPTANCE: failed load is distinct from empty; retry can recover the same active record; no storage mutation or false “nothing to recover” state
VERIFICATION: focused mobile regression suite (including Button, timer/session/SQLite, goal/progress, recovery helper and navigation): 47/47 PASS; `node node_modules/typescript/bin/tsc --noEmit`: exit 0; direct focused ESLint: exit 0; docs checker: PASS, 59 Markdown files / 914 local links / all 80 requirements covered; `git diff --check`: exit 0, with existing LF-to-CRLF notices only. The lint command was fixed after an initial hook-rule failure (effect dispatch was deferred and cleaned up); final lint passes. Synthetic helper tests do not execute the Expo route or native SQLite runtime.
STOP / OPEN DECISIONS: CR-02R/CR-04 independent review, native lifecycle/device evidence, and acceptance of broader persistence integration remain open; this candidate does not waive those gates
```
