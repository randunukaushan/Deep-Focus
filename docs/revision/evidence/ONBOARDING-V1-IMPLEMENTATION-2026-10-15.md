# V1 onboarding implementation evidence — 2026-10-15

Status: `IMPLEMENTED_AND_LOCALLY_TESTED` for the local routing, owner-scoped SQLite state, assessment resume behavior, and EN/SI/TA copy checks. Native device, process-death, screen-reader, production RLS and independent review gates remain `NOT_RUN`.

## Implemented behavior

- Authenticated owners resolve onboarding state from their account-local SQLite namespace before protected routing.
- New owners begin at `not_started`; `Continue` sets `in_progress` and enters the existing assessment; `Skip for now` sets `skipped` without cancelling an assessment draft.
- Assessment completion reaches the profile screen; profile confirmation, defaults, or starting a focus session sets `completed` before navigation.
- Assessment answers remain in the existing assessment draft store. The intro no longer calls `clearAnswers()`; the explicit Use defaults action remains the only onboarding action that clears the draft.
- `user_settings` stores `onboarding_status`, `onboarding_step`, and `onboarding_version = 1`. Migration version 16 treats existing account owners with focus sessions, tasks, goals, or completed assessments as completed, while a genuinely empty account remains not started.
- Locale is reloaded from the active owner settings whenever auth ownership changes. Device-local settings are loaded after sign-out.
- Active-session recovery remains higher priority than onboarding.
- Migration version 17 adds an owner-scoped pending Summary handoff. It is cleared when the matching persisted Summary opens; it never grants XP or unlocks achievements.

## Local checks

The focused command is:

```text
node --test --test-reporter=tap tests/domain/auth-routing.test.mjs tests/domain/app-locale.test.mjs tests/domain/assessment-profile.test.mjs tests/domain/assessment-flow-safe-errors.test.mjs tests/components/assessment-accessibility-locale.test.mjs tests/domain/local-database-ownership.test.mjs
```

This covers routing, locale copy, assessment profile behavior, assessment safe errors, accessibility/localization source checks, SQLite migrations, owner isolation, Summary handoff and persisted progression. The focused rerun passed 38/38 tests with no skips or todos.

`node node_modules/typescript/bin/tsc --noEmit` — PASS. The existing `Fonts` import in `src/components/ui/button.tsx` resolves to the canonical export in `src/constants/theme.ts`.

Direct ESLint was attempted for the changed onboarding/routing/localization/storage files but did not complete within the bounded run and was stopped. `npm run lint` was not used as a passing result.

## Remaining gates

- Android and iOS cold launch, restart, offline, account switching and process-death behavior: `NOT_RUN`.
- TalkBack, VoiceOver, Dynamic Type and reduced-motion device checks: `NOT_RUN`.
- Supabase/RLS production ownership verification: `NOT_RUN`.
- Terminal session persisted before Summary but app closes before Summary navigation: implemented locally through the owner-scoped pending Summary handoff and locally tested. Physical process-death/device verification remains `NOT_RUN`; the handoff does not reprocess XP or achievement unlocks.
