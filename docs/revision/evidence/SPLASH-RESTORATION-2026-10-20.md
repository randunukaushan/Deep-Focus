# Original splash restoration

TASK: Restore the supplied Deep Focus lockup and readable launch timing.
STATE: IN_PROGRESS
APPROVAL: Owner asked to restore the original logo and replace the excessively
fast transition, then confirmed implementation on 2026-10-20. This approves a
bounded 1.5-second reading interval after image load, followed by a 350ms fade,
as an exception to UI specification 9.2's no decorative delay default.
RISK: MEDIUM; local presentation only, no account or persisted-state changes.
READ: AI_RULES, execution policy, DoD, guardrails, documentation map,
UI specification 9.2 and evidence/Brand-Reference.md.
BASELINE: Existing dirty work preserved. Previous overlay scaled the whole
screen, faded by 420ms, and substituted a moon for the supplied identity.
ALLOWED FILES: animated-icon.tsx, app.json, original-logo asset copy,
Android splash resources/colors, this record and CHANGELOG.md.
ACCEPTANCE: Original unmodified supplied logo/name/tagline; no screen zoom;
reading interval starts after image load; reduced motion skips decoration;
unmount cancels timers/animation; failed image cannot trap launch.
CHECKS: Installed TypeScript and targeted ESLint; actual release build and
phone observation when connected. No new dependencies or authentication edits.
ROLLBACK: Restore only this task's presentation changes, preserving other work.
VERIFICATION: Pending.
