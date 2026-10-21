# Settings accessibility localization — 2026-10-09

## Scope

Settings duration and interface-language radio options no longer use
English-only accessibility phrases. They reuse the localized settings copy.
Duration option labels include the unit (`m`) so they remain distinct from the
parent duration card label in the accessibility tree.

## Changed files

- `src/app/profile/settings.tsx`
- `tests/components/settings.test.mjs`
- `tests/components/settings-accessibility-locale.test.mjs`
- `docs/CHANGELOG.md`

## Actual checks

- Focused settings and localization checks: **10/10 PASS**
- TypeScript no-emit check: **PASS**
- ESLint with `--max-warnings=0` for affected route/test: **PASS**
- Existing settings persistence, failure-recovery and duplicate-write checks
  remain enabled and pass.

## Boundaries

No settings storage semantics, database schema, auth provider, remote sync,
dependency, production configuration or deployment change was made.
Independent native accessibility review remains `REVIEW_PENDING`.
