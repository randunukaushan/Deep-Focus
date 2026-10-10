# Assessment accessibility localization — 2026-10-09

## Scope

The onboarding assessment route no longer hardcodes English accessibility
labels for the back action or progress indicator. It reuses the localized
assessment copy already selected by the app locale. The existing navigation,
answer persistence and explicit skip behavior remain unchanged.

## Changed files

- `src/app/onboarding/assessment.tsx`
- `tests/components/assessment.test.mjs`
- `tests/components/assessment-accessibility-locale.test.mjs`
- `docs/CHANGELOG.md`

## Actual checks

- Focused assessment and locale checks: **8/8 PASS**
- TypeScript no-emit check: **PASS**
- ESLint with `--max-warnings=0` for affected route/tests: **PASS**
- Full regression suite after this slice: **304/304 PASS**
- Documentation checker: **PASS** (150 Markdown files, 936 local links,
  80/80 requirements covered)
- `git diff --check`: **PASS** with existing line-ending notices only.
- The initial old-label assertion was updated to the new approved localized
  contract; no behavior assertion was removed or weakened.

## Boundaries

No database, authentication provider, remote sync, dependency, production
configuration or deployment change was made. Android device verification and
independent accessibility/security review remain `NOT_RUN` / `REVIEW_PENDING`.
