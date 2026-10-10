# Auth callback accessibility localization — 2026-10-09

## Scope

The authentication callback loading indicator now reuses the localized
callback loading title for its accessibility label. The auth flow, session
handling and error behavior are unchanged.

## Changed files

- `src/app/auth/callback.tsx`
- `tests/components/auth-callback-accessibility-locale.test.mjs`
- `docs/CHANGELOG.md`

## Actual checks

- Focused callback and copy checks: **2/2 PASS**
- TypeScript no-emit check: **PASS**
- ESLint with `--max-warnings=0` for the affected route: **PASS**
- Full bundled-runtime regression suite: **307/307 PASS**
- Documentation checker: **PASS** (152 Markdown files, 936 local links, 80/80 requirements)
- `git diff --check`: **PASS** (exit 0; only Git line-ending notices)

## Boundaries

No authentication provider call, session mutation, database change,
dependency, production configuration or deployment was performed. Provider
runtime and independent security/accessibility review remain `NOT_RUN` /
`REVIEW_PENDING`.
