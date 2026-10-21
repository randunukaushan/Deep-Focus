# Backend evidence — PostgreSQL read handlers (2026-10-10)

## Implemented

The local gateway candidate now includes owner-bound reads for the verified profile, task/goal/session lists, and individual task/goal/session records. Reads use server-derived actor/resource values, fixed result limits for lists, and explicit DTO mapping that does not expose raw database rows or client-controlled ownership fields.

## Verification

- `postgres-gateway-read-handlers.test.mjs`: 3/3 passed.
- Full bundled runtime suite: 499/499 passed.
- TypeScript typecheck: passed.
- Affected ESLint: passed.
- Docs checker: passed.
- `git diff --check`: no content errors; existing LF/CRLF conversion warnings were reported.

## Boundaries

This is a local candidate only. No Supabase connection, remote SQL, migration, production data, or deployment was used. Real RLS/read isolation tests, independent security review, and Android/device verification remain `REVIEW_PENDING`.

## Follow-up: transaction-level app-session recheck — 2026-10-10

- When authenticated gateway context includes the verified session ID, every
  PostgreSQL read handler locks and rechecks the matching active app-session row
  before the protected query runs.
- Revoked, expired, missing or foreign sessions fail with `AUTH_REQUIRED` before
  protected data access.
- Read/gateway focused checks — **17/17 PASS**; full bundled-runtime suite —
  **653/653 PASS**; TypeScript and affected ESLint — **PASS**.
- Real PostgreSQL/RLS read isolation, independent security review and Android/
  device verification remain **NOT_RUN / REVIEW_PENDING**.

## Follow-up: usage reservation returned metadata validation — 2026-10-10

- Reservation inserts now require returned `owner_id`, `capability`,
  `period_key` and `receipt_id` to match the verified request. Settlement
  allowance and receipt updates validate the returned owner, capability,
  period, receipt and final status before reporting success.
- Added regression coverage for foreign reservation receipt scope, foreign
  settlement metadata and foreign allowance scope; the existing ownership
  checks remain.
- Usage adapter focused checks — **16/16 PASS**.
- Full bundled-runtime repository suite — **642/642 PASS**; TypeScript,
  affected ESLint, docs checker and `git diff --check` passed.
- Remote entitlement/RLS execution, independent security review and Android/
  device verification remain **NOT_RUN / REVIEW_PENDING**.

## Follow-up: returned-row identity validation — 2026-10-10

- Individual resource reads now verify the returned ID matches the route ID;
  profile reads verify the returned owner matches the verified actor; list rows
  verify resource IDs before DTO mapping. Foreign-shaped rows fail closed.
- Read-handler and authorization focused checks — **9/9 PASS**.
- Remote RLS/read isolation, independent review and device verification remain
  **NOT_RUN / REVIEW_PENDING**.

## Follow-up: usage allowance and receipt identity validation — 2026-10-10

- Usage allowance reads now validate owner, capability and period against the
  requested scope. Settlement receipt reads validate owner and receipt identity
  before changing allowance or receipt state.
- Usage adapter focused checks — **11/11 PASS**.
- TypeScript typecheck and affected ESLint — **PASS**.
- Full bundled-runtime repository suite — **613/613 PASS**.
- Remote entitlement execution, independent review and device verification
  remain **NOT_RUN / REVIEW_PENDING**.

## Follow-up: app-session returned-row identity validation — 2026-10-10

- App-session registry reads now validate returned owner and session identity
  against the requested values before authorization or revocation logic uses the
  row. A foreign returned session fails closed.
- App-session adapter focused checks — **5/5 PASS**.
- TypeScript typecheck and affected ESLint — **PASS**.
- Full bundled-runtime repository suite — **614/614 PASS**.
- Remote auth/RLS execution, independent review and device verification remain
  **NOT_RUN / REVIEW_PENDING**.

## Follow-up: session-event returned-row ownership validation — 2026-10-10

- Session-event updates now validate the locked session row's returned owner and
  session identity against the verified actor and route resource before timing,
  sequencing or state changes proceed.
- Session-event focused checks — **5/5 PASS**.
- TypeScript typecheck and affected ESLint — **PASS**.
- Full bundled-runtime repository suite — **615/615 PASS**.
- Remote RLS/event isolation, independent review and device verification remain
  **NOT_RUN / REVIEW_PENDING**.

## Follow-up: start-session task identity validation — 2026-10-10

- Start-session task reads now validate returned task owner, workspace and ID
  before copying its title into a new session snapshot. Foreign task metadata
  fails closed before the session insert.
- Start-session focused checks — **5/5 PASS**.
- TypeScript typecheck and affected ESLint — **PASS**.
- Full bundled-runtime repository suite — **616/616 PASS**.
- Remote RLS/session isolation, independent review and device verification
  remain **NOT_RUN / REVIEW_PENDING**.

## Follow-up: task-create workspace identity validation — 2026-10-10

- Task creation now validates returned workspace owner and ID before checking
  goal links or inserting the task. Foreign workspace metadata fails closed.
- Task-applier focused checks — **6/6 PASS**.
- TypeScript typecheck and affected ESLint — **PASS**.
- Full bundled-runtime repository suite — **621/621 PASS**.
- Remote RLS/workspace isolation, independent review and device verification
  remain **NOT_RUN / REVIEW_PENDING**.

## Follow-up: goal workspace returned-row validation — 2026-10-10

- Goal creation now validates the returned workspace owner and ID against the
  verified actor and requested workspace before inserting the goal. Foreign
  workspace metadata fails closed.
- Goal-applier focused checks — **5/5 PASS**.
- TypeScript typecheck and affected ESLint — **PASS**.
- Full bundled-runtime repository suite — **617/617 PASS**.
- Remote RLS/workspace isolation, independent review and device verification
  remain **NOT_RUN / REVIEW_PENDING**.

## Follow-up: mutation receipt identity validation — 2026-10-10

- Idempotency receipt reads now validate returned owner, operation and mutation
  identity against the requested replay scope before trusting the response.
  Foreign receipt data fails closed.
- Domain mutation adapter focused checks — **6/6 PASS**.
- TypeScript typecheck and affected ESLint — **PASS**.
- Full bundled-runtime repository suite — **618/618 PASS**.
- Remote database/RLS execution, independent review and device verification
  remain **NOT_RUN / REVIEW_PENDING**.

## Follow-up: snapshot staging returned-page identity validation — 2026-10-10

- Snapshot staging retries now validate returned page owner and snapshot
  identity before accepting an existing page as idempotent. Foreign page
  metadata fails closed without publishing a ready snapshot.
- Snapshot staging/build focused checks — **12/12 PASS**.
- TypeScript typecheck and affected ESLint — **PASS**.
- Full bundled-runtime repository suite — **619/619 PASS**.
- Remote snapshot/RLS execution, independent review and device verification
  remain **NOT_RUN / REVIEW_PENDING**.

## Follow-up: taskless start-session workspace identity validation — 2026-10-10

- Taskless start-session requests now validate returned workspace owner and ID
  before inserting a session. Foreign workspace metadata fails closed.
- Start-session focused checks — **6/6 PASS**.
- TypeScript typecheck and affected ESLint — **PASS**.
- Full bundled-runtime repository suite — **620/620 PASS**.
- Remote RLS/session isolation, independent review and device verification
  remain **NOT_RUN / REVIEW_PENDING**.

## Follow-up: sync transaction returned-row ownership validation — 2026-10-10

- Sync transaction replay reads now select and validate the stored change
  owner's identity before comparing or replaying it. A foreign returned replay
  row fails closed.
- Sync transaction focused checks — **7/7 PASS**.
- TypeScript typecheck and affected ESLint — **PASS**.
- Full bundled-runtime repository suite — **612/612 PASS**.
- Remote RLS/read isolation, independent review and device verification remain
  **NOT_RUN / REVIEW_PENDING**.
- Existing sync gateway harness data was aligned with the owner-bound row
  contract; no assertions were removed or weakened.
- Full bundled-runtime repository suite after sync fixture alignment —
  **610/610 PASS**.

## Follow-up: sync change writer returned-row ownership validation — 2026-10-10

- Mutation-to-sync serialization now validates the returned entity row's owner
  and entity ID before hashing and appending a change. A foreign committed row
  fails closed and cannot enter the owner's sync stream.
- Sync change writer focused checks — **5/5 PASS**.
- TypeScript typecheck and affected ESLint — **PASS**.
- Full bundled-runtime repository suite after gateway fixture alignment —
  **611/611 PASS**.
- Remote RLS/read isolation, independent review and device verification remain
  **NOT_RUN / REVIEW_PENDING**.
- The existing cursor/read-handler fixtures were aligned with the new returned
  identity contract; no assertions were removed or weakened.
- Full bundled-runtime repository suite after fixture alignment — **608/608
  PASS**.
- TypeScript typecheck — **PASS**; affected ESLint — **PASS**; documentation
  checker — **PASS** (80/80 requirements, 0 errors).

## Follow-up: session-revocation outbox returned ownership validation — 2026-10-10

- Revocation outbox inserts now validate returned owner, session and revocation
  ID before reporting a new outbox record. Foreign metadata fails closed.
- App-session focused checks — **7/7 PASS**.
- TypeScript typecheck and affected ESLint — **PASS**.
- Full bundled-runtime repository suite — **637/637 PASS**.
- Remote auth/RLS isolation, independent review and device verification remain
  **NOT_RUN / REVIEW_PENDING**.

## Follow-up: app-session write returned ownership validation — 2026-10-10

- App-session create and revoke writes now validate returned owner/session
  identity and revoke status before accepting the write. Foreign metadata fails
  closed.
- App-session focused checks — **6/6 PASS**.
- TypeScript typecheck and affected ESLint — **PASS**.
- Full bundled-runtime repository suite — **636/636 PASS**.
- Remote auth/RLS isolation, independent review and device verification remain
  **NOT_RUN / REVIEW_PENDING**.

## Follow-up: mutation receipt returned ownership validation — 2026-10-10

- Mutation receipt writes now validate returned owner, operation and mutation
  ID before accepting the idempotency receipt. Foreign metadata fails closed.
- Mutation-adapter/gateway focused checks — **11/11 PASS**.
- TypeScript typecheck and affected ESLint — **PASS**.
- Full bundled-runtime repository suite — **635/635 PASS**.
- Remote RLS/workspace isolation, independent review and device verification
  remain **NOT_RUN / REVIEW_PENDING**.

## Follow-up: sync-writer head ownership validation — 2026-10-10

- Sync head advancement now validates returned owner and sequence before
  completing the mutation-to-sync write. Foreign head metadata fails closed.
- Sync-writer focused checks — **7/7 PASS**.
- TypeScript typecheck and affected ESLint — **PASS**.
- Full bundled-runtime repository suite — **634/634 PASS**.
- Remote RLS/workspace isolation, independent review and device verification
  remain **NOT_RUN / REVIEW_PENDING**.

## Follow-up: mutation sync-writer returned ownership validation — 2026-10-10

- Mutation-to-sync change writes now validate returned owner, sequence and hash
  before advancing the owner head. Foreign insert metadata fails closed.
- Sync-writer focused checks — **6/6 PASS**.
- TypeScript typecheck and affected ESLint — **PASS**.
- Full bundled-runtime repository suite — **633/633 PASS**.
- Remote RLS/workspace isolation, independent review and device verification
  remain **NOT_RUN / REVIEW_PENDING**.

## Follow-up: sync transaction returned ownership validation — 2026-10-10

- Sync transaction append now validates returned owner, sequence and hash before
  advancing the owner head. Foreign insert metadata fails closed.
- Sync transaction/gateway focused checks — **11/11 PASS**.
- TypeScript typecheck and affected ESLint — **PASS**.
- Full bundled-runtime repository suite — **632/632 PASS**.
- Remote RLS/workspace isolation, independent review and device verification
  remain **NOT_RUN / REVIEW_PENDING**.

## Follow-up: task-action update ownership validation — 2026-10-10

- Task actions now validate returned task owner and ID before accepting the
  updated state. Foreign metadata fails closed.
- Task-action focused checks — **5/5 PASS**.
- TypeScript typecheck and affected ESLint — **PASS**.
- Full bundled-runtime repository suite — **631/631 PASS**.
- Remote RLS/workspace isolation, independent review and device verification
  remain **NOT_RUN / REVIEW_PENDING**.

## Follow-up: task-create returned ownership validation — 2026-10-10

- Task creation now validates returned task owner, workspace and ID before
  accepting the new task response. Foreign metadata fails closed.
- Task-applier focused checks — **8/8 PASS**.
- TypeScript typecheck and affected ESLint — **PASS**.
- Full bundled-runtime repository suite — **630/630 PASS**.
- Remote RLS/workspace isolation, independent review and device verification
  remain **NOT_RUN / REVIEW_PENDING**.

## Follow-up: task-patch update ownership validation — 2026-10-10

- Task patch updates now validate returned task owner and ID before accepting
  the updated state. Foreign metadata fails closed.
- Task-patch focused checks — **6/6 PASS**.
- TypeScript typecheck and affected ESLint — **PASS**.
- Full bundled-runtime repository suite — **629/629 PASS**.
- Remote RLS/workspace isolation, independent review and device verification
  remain **NOT_RUN / REVIEW_PENDING**.

## Follow-up: session-event update identity validation — 2026-10-10

- Session event updates now validate returned session owner and ID before
  accepting the new state. Foreign metadata fails closed.
- Session-event focused checks — **7/7 PASS**.
- TypeScript typecheck and affected ESLint — **PASS**.
- Full bundled-runtime repository suite — **628/628 PASS**.
- Remote RLS/workspace isolation, independent review and device verification
  remain **NOT_RUN / REVIEW_PENDING**.

## Follow-up: session-event returned metadata validation — 2026-10-10

- Session event inserts now validate returned owner, session, sequence and
  event type before updating the session row. Foreign metadata fails closed.
- Session-event focused checks — **6/6 PASS**.
- TypeScript typecheck and affected ESLint — **PASS**.
- Full bundled-runtime repository suite — **627/627 PASS**.
- Remote RLS/workspace isolation, independent review and device verification
  remain **NOT_RUN / REVIEW_PENDING**.

## Follow-up: session-start returned ownership validation — 2026-10-10

- Session start now validates returned session owner, workspace and ID before
  accepting the new session response. Foreign metadata fails closed.
- Session-applier focused checks — **7/7 PASS**.
- TypeScript typecheck and affected ESLint — **PASS**.
- Full bundled-runtime repository suite — **626/626 PASS**.
- Remote RLS/workspace isolation, independent review and device verification
  remain **NOT_RUN / REVIEW_PENDING**.

## Follow-up: goal-create returned ownership validation — 2026-10-10

- Goal creation now validates returned goal owner, workspace and ID before
  accepting the response. Foreign metadata fails closed.
- Goal-applier focused checks — **6/6 PASS**.
- TypeScript typecheck and affected ESLint — **PASS**.
- Full bundled-runtime repository suite — **625/625 PASS**.
- Remote RLS/workspace isolation, independent review and device verification
  remain **NOT_RUN / REVIEW_PENDING**.

## Follow-up: task-action returned ownership validation — 2026-10-10

- Task actions now validate the returned current task owner and ID before
  applying a state transition. Foreign metadata fails closed.
- Task-action focused checks — **4/4 PASS**.
- TypeScript typecheck and affected ESLint — **PASS**.
- Full bundled-runtime repository suite — **624/624 PASS**.
- Remote RLS/workspace isolation, independent review and device verification
  remain **NOT_RUN / REVIEW_PENDING**.

## Follow-up: task-patch goal identity validation — 2026-10-10

- Task patch goal linking now validates returned task ID/owner and goal
  owner/workspace/ID before updating. Foreign metadata fails closed.
- Task-patch focused checks — **5/5 PASS**.
- TypeScript typecheck and affected ESLint — **PASS**.
- Full bundled-runtime repository suite — **623/623 PASS**.
- Remote RLS/workspace isolation, independent review and device verification
  remain **NOT_RUN / REVIEW_PENDING**.

## Follow-up: task-create goal identity validation — 2026-10-10

- Task creation now validates returned goal owner, workspace and ID before
  inserting the task. Foreign goal metadata fails closed.
- Task-applier focused checks — **7/7 PASS**.
- TypeScript typecheck and affected ESLint — **PASS**.
- Full bundled-runtime repository suite — **622/622 PASS**.
- Remote RLS/workspace isolation, independent review and device verification
  remain **NOT_RUN / REVIEW_PENDING**.

## Follow-up: snapshot metadata identity validation — 2026-10-10

- Ready snapshot metadata reads now validate returned owner and snapshot identity
  against the verified request before mapping the response. Foreign metadata
  fails closed.
- Metadata/read focused checks — **10/10 PASS**; combined snapshot page and
  metadata/read coverage is **21/21 PASS**.
- TypeScript typecheck, affected ESLint and documentation checker — **PASS**.
- Remote RLS/read isolation, independent review and device verification remain
  **NOT_RUN / REVIEW_PENDING**.
- Full bundled-runtime repository suite after metadata fixture alignment —
  **609/609 PASS**.

## Follow-up: sync pull returned-row ownership validation — 2026-10-10

- Sync pull rows now include and validate `owner_id` before mapping changes to
  the client-facing contract. A foreign returned change fails closed.
- Sync pull focused checks — **5/5 PASS**.
- TypeScript typecheck and affected ESLint — **PASS**.
- Remote RLS/read isolation, independent review and device verification remain
  **NOT_RUN / REVIEW_PENDING**.
- TypeScript — **PASS**; affected ESLint — **PASS**; documentation checker —
  **PASS** (80/80 requirements, 0 errors).
- Full bundled-runtime repository suite — **601/601 PASS**.

## Follow-up: snapshot page identity validation — 2026-10-10

- Snapshot page reads now validate the returned page owner, snapshot owner,
  snapshot identity and page index against the requested values before mapping
  the DTO. A foreign returned ownership row fails closed.
- Snapshot page focused checks — **8/8 PASS**.
- Remote RLS/read isolation, independent review and device verification remain
  **NOT_RUN / REVIEW_PENDING**.

## Follow-up: fail-closed direct read composition — 2026-10-10

- Every PostgreSQL read handler now requires a non-empty `sessionId` and
  rechecks the matching active app-session row before the protected query.
- Direct handler calls without a session fail with `AUTH_REQUIRED` and do not
  touch protected data; valid session, revoked session and foreign-row tests
  remain covered.
- Read/gateway focused checks — **22/22 PASS**.
- Full bundled-runtime repository suite — **676/676 PASS**.
- TypeScript, affected ESLint and documentation checker — **PASS**.
- Remote PostgreSQL/RLS execution, independent security review and Android/device
  verification remain **NOT_RUN / REVIEW_PENDING**.
