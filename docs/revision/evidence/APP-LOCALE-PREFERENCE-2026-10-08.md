# App locale preference foundation — 2026-10-08

## Status

Implemented locally; `REVIEW_PENDING` for translation quality, fonts,
accessibility and installed-device verification. This slice is a preference
foundation, not a claim that the whole app is translated.

## Implemented

- Added `ui_locale` to the owner-scoped SQLite `user_settings` table.
- Added additive schema-v5 migration and retry-safe handling for older local
  databases. Existing rows receive the explicit fallback `en`; legacy JSON
  imports preserve the same fallback when no locale exists.
- Added a visible Settings selector for `සිංහල`, `தமிழ்` and `English`.
- Added a small stable-ID copy layer and connected it to the five primary native
  navigation labels; changing the saved preference updates the shell copy.
- Locale writes preserve the focus and break defaults and remain isolated by
  local owner.
- Existing onboarding personalization writes merge with current settings so a
  locale preference is not silently discarded.

## Boundary

No cloud sync, account claim, production migration, live translation service,
or deployment was added. This does not translate every screen or legal/policy
surface. Full translation coverage, native font rendering,
screen-reader behavior and Android runtime checks remain `NOT_RUN` or
`REVIEW_PENDING` until their respective gates are completed.

The native splash overlay also respects the device reduced-motion setting;
this local accessibility behavior still needs installed-device and
screen-reader review.
