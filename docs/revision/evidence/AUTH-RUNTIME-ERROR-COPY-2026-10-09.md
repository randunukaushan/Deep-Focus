# Auth runtime error copy — 2026-10-09

## Scope

`AuthProvider` now uses a locale-aware copy boundary for configuration,
session-restore, account-session, and callback-link errors. Sinhala, Tamil and
English are supported, with English as the deterministic fallback. This is a
presentation and privacy boundary only; it does not enable a provider,
change authentication protocol behavior, or weaken session identity checks.

## Changed files

- `src/features/localization/auth-runtime-copy.ts`
- `src/features/auth/auth-context.tsx`
- `tests/domain/auth-runtime-copy.test.mjs`
- `docs/CHANGELOG.md`

## Actual checks

- Focused auth copy tests: **2/2 PASS**
- TypeScript no-emit check: **PASS**
- ESLint with `--max-warnings=0` for affected files: **PASS**
- Full regression suite after this slice: **303/303 PASS**
- Documentation checker: **PASS** (149 Markdown files, 936 local links,
  80/80 requirements covered)
- `git diff --check`: **PASS** with existing line-ending notices only.

## Boundaries

No Supabase provider call, database write, dependency change, production
configuration, deployment or real account operation was performed. End-to-end
provider verification, independent security review and Android device
verification remain `REVIEW_PENDING` / `NOT_RUN`.
