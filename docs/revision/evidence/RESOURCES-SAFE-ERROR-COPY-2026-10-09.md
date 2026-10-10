# Resources safe error copy — 2026-10-09

## Scope

Resource save and missing-marking failures no longer expose raw storage
`Error.message` values to the user. The screen uses localized
`resourcesPage.saveError` copy for both mutation paths. This keeps technical
storage details out of the UI and preserves the existing fail-closed behavior.

## Changed files

- `src/app/resources/index.tsx`
- `src/features/localization/app-locale.ts`
- `tests/components/resources-error-copy.test.mjs`
- `docs/CHANGELOG.md`

## Actual checks

- Focused resource/localization tests: **5/5 PASS**
- TypeScript no-emit check: **PASS**
- ESLint with `--max-warnings=0` for affected files: **PASS**
- Full suite before this slice: **301/301 PASS**
- Full suite after this slice (including the new regression test): **302/302 PASS**

## Boundaries

No database, provider, remote sync, dependency, production data or deployment
change was made. Independent security review and Android device verification
remain `REVIEW_PENDING` / `NOT_RUN`.
