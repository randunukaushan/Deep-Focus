# Home accessibility localization — 2026-10-09

## Scope

The home screen focus hero card now uses the selected locale's existing
start-focus accessibility copy. The visible label and navigation behavior are
unchanged; the accessibility tree no longer introduces an English-only label
when Sinhala or Tamil is selected.

## Changed files

- `src/features/home/home-screen.tsx`
- `tests/components/home-accessibility-locale.test.mjs`
- `docs/CHANGELOG.md`

## Actual checks

- Focused home/localization checks: **4/4 PASS**
- TypeScript no-emit check: **PASS**
- ESLint with `--max-warnings=0` for the affected screen: **PASS**
- Full regression suite after this slice: **305/305 PASS**
- Documentation checker: **PASS** (151 Markdown files, 936 local links,
  80/80 requirements covered)
- `git diff --check`: **PASS** with existing line-ending notices only.

## Boundaries

No database, auth provider, remote sync, dependency, production configuration,
deployment or device operation was performed. Independent native accessibility
review remains `REVIEW_PENDING`.
