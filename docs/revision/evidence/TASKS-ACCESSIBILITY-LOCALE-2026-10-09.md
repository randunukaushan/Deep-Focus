# Tasks save-error locale boundary — 2026-10-09

The native Tasks route now uses the existing localized task copy for save
failures instead of exposing a hard-coded English message. The task list,
retry behavior and data-preservation behavior are unchanged.

## Evidence

- Focused source/accessibility test: **1/1 PASS**.
- TypeScript no-emit check: **PASS**.
- Affected ESLint check: **PASS**.
- Current bundled-runtime suite: **300/300 PASS**, 0 failures.

Human translation review and Android screen-reader/text-scaling verification
remain pending.
