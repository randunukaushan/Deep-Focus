# Stable local IDs — 2026-10-09

## Implemented

New Tasks, Goals and Focus Sessions now use UUID-shaped stable IDs through one
small identity helper. Existing imported or previously saved IDs are not
rewritten, so this change does not perform a migration or claim remote identity.
Timer duration fields remain seconds-based.

## Verification

- Stable-ID focused tests: 2/2 PASS.
- New focus-session fields retain the existing seconds-based values.
- TypeScript `tsc --noEmit`: PASS.
- Affected ESLint for the identity helper, session engine, Tasks route, Goals
  route and their harnesses: PASS with `--max-warnings=0`.
- Bundled runtime suite: **276/276 PASS**, 0 failed.
- The custom component test loaders were updated with explicit identity test
  doubles; no behavior assertions were removed or weakened.

## Pending

Workspace assignment, server-side UUID validation, event-based session sync,
RLS/security review and Android device runtime evidence remain pending. This
slice alone does not enable server writes.
