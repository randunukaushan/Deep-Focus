# Planning UI continuation — 2026-10-19

TASK: Continue the existing native planning UI in the calm preview direction.
STATE: IMPLEMENTED — automated verification passed; native visual acceptance pending
AUTHORITY: Owner requested continued UI implementation; existing Plan/Tasks/Goals functionality only. No new domain capability admitted.
RISK: MEDIUM — reversible presentation and separate task checkbox/open hit targets. No storage, session, authorization or provider changes.
READ: AI rules, map, execution policy, Definition of Done, engineering guardrails; Component Library 1.8–1.10 and 6.1–6.2; UI specification 11.5–11.7; existing prototype README/plan-light.png and current native routes/tokens/button.
BASELINE: Plan offers two plain links; task checkbox always displays a checkmark and nests inside the row action; Tasks/Goals headings duplicate large fixed typography. Existing dirty auth/backend/Home/focus/config work is preserved.
ALLOWED FILES: new src/components/ui/section-heading.tsx; src/app/(tabs)/plan.tsx; src/app/tasks/index.tsx; src/app/goals/index.tsx; tests/components/tasks.test.mjs; tests/components/goals.test.mjs; tests/components/plan-navigation-accessibility.test.mjs; new tests/components/section-heading.test.mjs; this new record; CHANGELOG.md.
ACCEPTANCE: Shared theme-aware headings use existing localized copy and scalable text; Plan retains Tasks/Goals navigation with clearer icon/surface hierarchy; task open and completion controls are siblings, pending checkbox has no check glyph, completed checkbox is checked/disabled; existing task save/failure/archive and goal behavior tests remain passing.
NON-GOALS: No demo data or fabricated statistics, no new AI entry point, no timer/persistence/sync/auth changes, no new dependencies, build, deployment, commit or paid service. No prototype in-memory business logic port.
CHECKS: Existing bounded hook/JSX component tests, new heading and task control regressions, installed tsc/ESLint, docs checker and git diff --check. Harness is not a native renderer; phone visual/TalkBack/large-font evidence must be recorded honestly.
REVIEW: Self-review; owner visual acceptance pending. No extra agents.
ROLLBACK: Revert only this task's hunks; no persisted data change.
NEXT: After this slice, visually verify on connected phone, then continue Progress/Profile in the same design language.

## Implementation and evidence

- Added presentation-only `SectionHeading` with existing localized content, theme colors, token typography, wrapping title and decorative icon hidden from assistive technologies. Applied to Plan/Tasks/Goals; removed obsolete heading styles.
- Plan navigation retains its two existing destinations and gains explicit themed surfaces, icon tiles, spacing and generous touch areas. No fake counts or sample data introduced.
- Task checkbox/open action are siblings rather than nested pressables. Only completed items render a check glyph; pending outline uses the theme muted-text color. Titles are no longer restricted to two lines. Existing save/complete/archive handlers are unchanged.
- Six scoped component suites: 17 PASS, 0 FAIL. Tests cover Plan destinations/theme surfaces, translated scalable heading structure and task checked/disabled/glyph semantics, plus existing goal/task failure/retry/draft/duplicate/archive cases. Tests use the existing bounded hook/JSX model, not native layout rendering.
- Installed `node node_modules/typescript/bin/tsc --noEmit`: exit 0. Scoped ESLint on changed routes, heading and existing/new task/goal/heading tests: exit 0. A redundant concurrent lint rerun was stopped; not counted as passing verification.
- `node docs/revision/check-docs.mjs`: PASS, 658 Markdown files; `git diff --check`: exit 0, existing CRLF conversion warnings only.
- Phone check: `adb -s 192.168.8.101:40243 get-state` reported device not found; Metro `/status` on 8081 timed out after six seconds. No phone state/data changed. Native screenshots, TalkBack, large-font wrapping and actual touch interactions NOT_RUN.
- Self-reviewed source/test diff and new files; unrelated dirty auth/backend/config/Home/focus work preserved. Owner visual acceptance pending. No deployment/release readiness claim.
