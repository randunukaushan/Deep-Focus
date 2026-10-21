# Local sync account-switch guard — 2026-10-11

## Scope

This slice hardens the local outbox coordinator against an authenticated
account changing while a remote push is being prepared or is still in flight.
It does not connect the app to a remote Supabase project and does not claim
live sync, RLS or device evidence.

## Behavior

- An optional verified-owner callback captures the owner at the start of one
  sync attempt.
- A switch detected after local loading prevents the batch from being sent.
- A switch detected after the remote response prevents acknowledgement,
  rejection or retry-state writes from consuming that response.
- The old outbox remains recoverable; no client-supplied owner field is added.
- Existing callers without the callback retain the previous local contract;
  the eventual runtime composition must supply the callback from the verified
  account/session owner, not from editable UI state.

## Actual checks

- Sync-focused tests: **20/20 PASS**.
- Full repository suite after this slice: **927/927 PASS**.
- TypeScript: **PASS**.
- Affected ESLint: **PASS**.
- Documentation check: **PASS**, 80/80 requirements covered.
- `git diff --check`: **PASS**.

## Limits and pending gates

Source usage inspection found that `syncPendingOutbox` and
`createRemoteSyncPusher` are local candidates and are not currently wired into
app startup. Therefore real Supabase sync, token/account-switch behavior,
Android restart/network recovery, live RLS and independent security review are
`REVIEW_PENDING` / `NOT_RUN`. No remote database, production data, deployment,
commit or push was used.
