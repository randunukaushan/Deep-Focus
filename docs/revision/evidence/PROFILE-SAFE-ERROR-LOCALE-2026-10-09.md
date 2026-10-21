# Onboarding profile safe error and accessibility copy — 2026-10-09

## Scope

The onboarding profile route now discards raw assessment-application
exceptions and shows the existing localized safe error copy. Three profile
accessibility labels also reuse the selected locale. The confirmation gate and
settings-application behavior remain unchanged.

## Actual checks

- Focused check: **1/1 PASS**
- Full bundled-runtime regression suite: **310/310 PASS**
- Documentation checker: **PASS** (155 Markdown files, 936 local links, 80/80 requirements)
- TypeScript no-emit check: **PASS**
- ESLint with `--max-warnings=0` for the affected route and test: **PASS**

Independent review and native device accessibility verification remain
`REVIEW_PENDING` / `NOT_RUN`.
