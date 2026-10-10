# Account portal sign-out privacy and busy-state copy — 2026-10-09

## Implemented

- The local portal clears the in-memory password state as sign-out starts.
- The portal main landmark exposes its current busy state through `aria-busy`.
- Provider authentication, private sync, deletion and deployment behavior are
  unchanged.

## Verification

- Website regression suite: **19/19 PASS**.
- TypeScript and ESLint checks remain required for the website build lane.

## Limits

This does not prove provider runtime, browser security review, private-data
deletion, secure sync or production readiness.
