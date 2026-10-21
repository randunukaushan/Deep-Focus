# Rewards locale slice — 2026-10-09

## Implemented

The native Rewards route now uses a locale-aware copy module for the page
heading, loading/error/empty states, milestone summaries, milestone names,
status text and accessibility labels in `en`, `si` and `ta`. Local reward
calculation and session-history read behavior are unchanged.

## Verification

- Rewards component tests: **3/3 pass**.
- Full bundled-runtime repository suite: **244/244 pass**.
- TypeScript: **PASS**.
- Affected ESLint: **PASS**.

## Remaining gates

Human translation review, text scaling, screen-reader behavior and Android
device verification remain `REVIEW_PENDING`. This is not proof of backend,
entitlement or production readiness.
