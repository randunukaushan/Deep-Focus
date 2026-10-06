# Backend, API and Database Build Contract

මෙම specification එකේ අරමුණ mobile, Account Portal සහ පසුව Full Web App එක
එකම ownership, validation සහ synchronization rules භාවිත කිරීමයි. Frontend
එක ලස්සනට පෙනීම backend එක ආරක්ෂිත බවට සාක්ෂියක් නොවේ.

Status: approved platform selections; **proposed detailed contract and isolated
SQL prototype**. Supabase PostgreSQL/Auth, Supabase Edge Functions, Expo SQLite
and SecureStore are selected. Next.js Website/Portal is selected; its host is not.
No installation, account, key, DB migration or deployment has occurred.
This file makes the first personal-core slice concrete; it does not complete
the whole personal backend or enterprise schema. Section 10 lists missing modules.

## 1. Concrete artifacts and their authority

| Artifact | What is concrete | What is not claimed |
| --- | --- | --- |
| [JSON Schemas](contracts/personal-api.schema.json) | Named request/response DTOs, unknown-field rejection, unit types, shape limits | Authz, semantic date ordering, clock verification or running handlers |
| [OpenAPI 3.1.1](contracts/personal-api.openapi.json) | Fourteen personal-core operations, authentication/header/body/response references | Complete V1 API, public deployment or full OpenAPI conformance certification |
| [PostgreSQL prototype](contracts/personal-core.sql) | Nine tables, composite ownership FKs, enums/checks/indexes, deny-by-default grants and RLS | Executed migrations, business RPCs, exact policy/age/retention or tested security |
| [Contract checker](check-backend-contracts.mjs) | Local reference resolution, DTO fixtures and declared structural checks | PostgreSQL execution, RLS penetration test, Edge or auth integration |

Machine artifacts are deliberately under `docs/revision/contracts`, not an
auto-applied migration/deployment directory. Do not copy them into production
because they look executable. Proposed numeric field/page limits below are
engineering defaults, separate from product focus-duration limits and retention.

JSON Schemas explicitly declare draft-07 so the already installed local Ajv can
exercise examples without a dependency install. The OpenAPI document is 3.1.1;
clients/generators must support the external schemas' declared dialect before
adoption. Version labels are contract formats, not the app's release number.[^1]

## 2. Selected topology and trust boundaries

```text
Mobile: SQLite domain data + SecureStore credentials
    └─ user access JWT → Edge application API
Portal: browser → same-origin Next.js server routes → Edge application API
    └─ server-owned session cookies; no service secret or auth token in HTML
Edge: validate identity → permission → DTO → domain command → DB transaction
PostgreSQL: private tables + constraints + restricted database functions
```

The Edge gateway owns input/auth/rate-limit/error handling. Domain modules own
task/session transitions. Database transactions own atomic persistence and
uniqueness. Browser/mobile presentation cannot write trusted progress or grants.
Use one modular API initially; do not create a service per persona.

Recommended DB access topology: private `df_private` tables, a narrowly exposed
`df_api` RPC schema, and server-only execution privileges. The prototype creates
only private tables; business RPCs/exposed-schema configuration are **not yet
provided or activated**. Implement each RPC before its corresponding endpoint.
Do not expose `df_private` simply to make a failing SDK call work.

September 30 classroom refinement: [TI-00](42-PRIVATE-TASK-TOMBSTONE-AND-IDENTITY-BRIDGE.md)
chooses a dedicated narrow PostgreSQL gateway login with server-only function
EXECUTE and per-transaction verified actor/session binding, not client-callable
RPCs. This is a HIGH review-pending design candidate. The prototype's existing
service_role grants/auth.uid policies do not implement that role boundary and
remain unchanged; deployment needs a reviewed explicit privilege reconciliation.

Public/anonymous/authenticated Data API roles have no table grants in the
prototype. Private-table SELECT policies are dormant defence if read access is
deliberately introduced later; they do not themselves grant access. A server
secret uses privileged access and can bypass RLS, so every server operation
must independently check actor/record/linked-record ownership. Keep user-scoped
and privileged clients separate; never reuse a mutable global auth context.[^2]

Supabase documents grants and RLS as separate controls, and Data API checks do
not automatically protect Storage or Realtime. Verify all entry points; hiding
mobile buttons or securing only the Edge URL is insufficient.[^3] Do not add
Realtime or resource buckets to the personal-core prototype.

## 3. Authentication and account lifecycle

Use Supabase Auth for credential handling. Proposed initial supported flow is
email/password plus verification/recovery; social login/passkeys are not silently
added. Final factor/verification/minimum-age/session policy needs approval.

Auth state: `initializing → signed_out | verification_required | signed_in`;
refreshing, recovering, failed-secure-store and signing-out are explicit
controller states. A successful-looking form is not authenticated identity.
Validate the user JWT's signature/issuer/audience/expiry using the selected
provider's supported verification path; a publishable project key is not a user
JWT. Never decode a token and trust its payload without verification.[^4]

Before private reads/writes, verify account state is active. Before sensitive
export/delete/change-password operations, require the approved recent-auth policy
and fresh provider/user-session validation where needed. Stateless JWT verification
does not promise immediate revocation of an already issued token. Define and test
the residual TTL/disabled-account check; do not advertise instant global logout
without that evidence.

### Mobile credential adapter

Only the credential adapter may call SecureStore. A token-write failure makes
authentication non-durable; do not navigate into a falsely restored account.
SQLite stores domain/cache/outbox data, not passwords or access/refresh tokens.
Refresh has one in-flight operation per identity; rotating token saves are
serialized. On account switch, cancel old requests/listeners, resolve pending
work under its original namespace, clear credentials as required and never render
old account data in the new UI.

SecureStore is not an irreplaceable-data backup. Configure and test its platform
accessibility, restore/uninstall and authentication-change behaviour in installed
builds; do not assume a lost credential or encryption key can always be recovered.[^5]
SQLCipher is a separate unapproved choice, not a feature automatically enabled
by selecting SQLite. OS device protection is not an E2EE claim.

### Portal session design

Recommended server-owned session: browser submits to same-origin Next.js routes;
the server handles Auth and forwards user-authorised calls to Edge. Use secure,
HttpOnly cookies for this design and do not simultaneously require a browser
Supabase client to read those cookies. Scope callback destinations to an allowlist;
PKCE/state and reset/verification links are single-purpose, expiring and replay-safe.
No user token in page props, script, telemetry, URL parameters or localStorage.

Validate identity at each server data boundary, not only navigation middleware.
Supabase's Next.js guidance warns against trusting an unvalidated session object
for protected server data. Its standard browser/server integration is not a
blanket claim that every session cookie is HttpOnly; implement and test the
chosen server-owned variant explicitly.[^6]

Cookie-authenticated writes require origin/CSRF protection and no shared caching.
API bearer-auth calls and provider webhooks use their own authentication; they
must not be “fixed” by disabling JWT verification on all functions. For signed
webhooks the provider signature is the authentication boundary, not a public API
key. No webhook endpoint is included in this first personal-core OpenAPI slice.

## 4. Request, response and limit contract

Logical base `/v1`, mapped once to the deployed Edge function's gateway path.
Do not invent a production domain. Internal mobile routes and API routes are
different namespaces. JSON only for these operations; reject unknown fields.
Proposed maximum JSON request body 64 KiB, list limit default 50/max 100,
cursor max 2048 characters and sequential mutation batch max 25. Apply byte limits
before JSON parsing. Resource files never enter this endpoint family.

All writes require a stable UUID `Idempotency-Key`. Identity comes from the
verified session, never body `ownerId`, `userId`, role or workspace selector alone.
An inaccessible object or cross-owner link returns privacy-preserving 404.
Account-level denial may return 403 without revealing another account.

| Status | Code / meaning | Client behaviour |
| --- | --- | --- |
| 400 | `VALIDATION_FAILED` for malformed JSON/unsupported fields | Retain draft; field feedback; no automatic retry |
| 401 | `AUTH_REQUIRED` | One supported refresh attempt, then sign-in without losing local draft |
| 403 | `ACCESS_DENIED` | Stop privileged retries; explain available own-account action |
| 404 | `NOT_FOUND` | Safe parent; never disclose another owner's record |
| 409 | `VERSION_CONFLICT`, `INVALID_TRANSITION`, `DURATION_NOT_REACHED`, `CLOCK_UNCERTAIN`, `IDEMPOTENCY_CONFLICT`, `ENTITY_DELETED` for an already-authorized owned tombstone | Preserve draft/evidence; resolve exact conflict, no blind overwrite or resurrection |
| 410 | `CURSOR_EXPIRED` for list pagination; `SYNC_RESET_REQUIRED` for sync | Restart that list or bootstrap sync respectively; preserve local drafts/outbox |
| 422 | `VALIDATION_FAILED` for semantic values/references within authorised context | Show safe field/action error |
| 429 | `RATE_LIMITED` plus Retry-After | Bounded backoff; no retry storm |
| 503 | `DEPENDENCY_UNAVAILABLE` | Keep local work; retry stable command after checking result |

Unexpected failures also return a safe error envelope, never SQL/stack/provider
payloads. Do not return HTTP 200 containing a failed operation. Rate-limit values
are server configuration to be load-tested; client UI limits are not enforcement.

Strings: trim user-entered titles before preview/save; max 240 Unicode code
points, description 4000, display name 100. Preserve users' language; reject
control-only/blank titles. SQL/JSON length semantics must match via test fixtures.
Priority remains optional (`null | low | medium | high`), preserving the old
canonical vocabulary. Task archive is separate `archivedAt`, not a new status.

## 5. Personal-core endpoint semantics

The attached OpenAPI contains fourteen operations: profile get/patch; tasks
list/create/get/patch/action; goals list/create/get; sessions list/start/get/event.
The counted operations are the first backend slice, not all required V1 endpoints.

- `GET /me`: owned public-to-self profile and personal workspace only. Bootstrap
  profile/workspace/sync-head atomically after authorised account creation; a
  partial bootstrap returns retryable setup state, not an empty successful account.
- Task create: stable client UUID, owned personal workspace, validated optional
  goal and due value. Defaults: pending, version 1, nullable optional fields, due none.
- Task patch: expectedVersion required; omitted means preserve, explicit null
  clears nullable fields; cannot change ID, owner, workspace, status or progress.
- Task action: pending→in_progress for begin; pending/in_progress→completed or
  cancelled; archive sets archive time without altering historical completed status.
  Repeated identical terminal action is duplicate-safe. Reopen/edit-completed
  policies need a later explicit contract; no extra rewards through status toggling.
- Goal create: supported legacy types/periods, explicit start/end/timezone and
  positive target. Focus-time target uses `ms`; counts use `count`. Never pass old
  minutes/seconds as milliseconds. Server verifies valid IANA timezone, interval
  ordering and period boundaries; JSON shape validation alone is insufficient.
- Session start: fixed task/config snapshot; timestamps remain untrusted evidence.
  Online accepted active state is unique per owner. Offline work cannot acquire
  that lock and remains local pending until reconciliation.
- Session events: event UUID + client sequence + expected server version;
  pause/resume/complete/cancel use [13](13-CORE-RELIABILITY-CONTRACTS.md), never
  client `focusedMs`, XP or premium values. Replay event IDs cannot add time.
- Session response explicitly separates status and verificationState. A complete
  local timer is not proof of verified focus, mastery or physical activity.

Canonical old individual `/pause`/`resume`/`complete` routes and proposed
workspace-nested task routes are older contract alternatives, not deployed APIs.
The personal slice standardizes the compact task routes and one event endpoint.
Before a real deployment choose one wire version and reconcile callers; do not
send the same intent to both endpoints. If a deployed old API is discovered,
version/adapter migration becomes mandatory rather than silently breaking it.

### Reads, pagination and output mapping

Use owned keyset ordering `(created_at,id)` for task/goal lists and terminal
history ordering `(ended_at,id)` for session history; define separate active
session lookup, not a null-ended record mixed into terminal pages. List endpoint
in this slice returns terminal sessions; `GET /focus-sessions/{id}` can return
the owned active record. Archive/deleted visibility is explicit; no foreign rows.

October 3 draft query reconciliation: omit `cursor` for the first page; when
supplied it must be a string of 1–2048 characters. Empty is invalid rather than
an alias for omitted. This aligns the personal OpenAPI parameter with the
existing extension Cursor definition; structural validity does not establish
signature, ownership, expiry or token authenticity. No runtime handler changed.

Cursor binds actor, endpoint, query, sort and last key with server integrity
protection. Reject tampering or cross-account reuse; fresh authorization on every
page. These normal lists are live views, not a snapshot export. The sync feed
below uses a distinct high-water sequence; do not reuse the list cursor as sync.

DB rows map to allowlisted DTOs. Convert timestamptz values to UTC ISO `Z` form,
date-only values to `YYYY-MM-DD` without timezone shifting, and nullable fields
consistently. Validate response shape as well as requests. Bigint progress/time
must fit the safe numeric DTO bound; sync sequences are decimal strings, not
lossy JavaScript numbers. Do not return internal owner/grant/credential columns.

## 6. SQL invariants and transaction algorithm

Prototype tables: profiles, workspaces, goals, tasks, focus_sessions, focus_events,
mutation_receipts, sync_heads and sync_changes. Composite FKs prevent linking an
owner's session/task/goal to another owner/workspace even if a service bug supplies
an incorrect reference. Referential constraints use RESTRICT, not automatic
account cascades; deletion is an explicit ordered job.

Every mutating RPC, including background jobs, follows this order:

1. Derive actor at Edge and recheck active profile/permission in the transaction.
2. Lock the owner's `sync_heads` row before other owned domain locks. All writers
   use this order; provisioning creates that row. Bound transaction time.
3. Read receipt by owner+operation+mutation ID. Same server-computed canonical
   payload hash returns original receipt; different hash returns conflict.
4. Validate current version, ownership of all links and domain transition.
5. Apply one domain change; increment version exactly once; insert unique event.
6. Increment locked head; append one immutable allowlisted change payload/tombstone.
7. Save success receipt with response; commit; then return. No HTTP/AI/file I/O inside.

A sequence allocated outside commit ordering can skip a late-committing change
when clients advance cursors. The per-owner head lock serializes allocation until
commit; **all writers** must use it, not only task create. Replays return the old
receipt without allocating a new sequence. Duplicate/time-out UI retries reuse
the original key and intent time, never a new request identity.

Do not mistake DDL constraints for complete business enforcement. The prototype
does not implement temporal event validation, goal attribution, terminal
immutability triggers, mutation RPCs or trusted rewards. These are required tasks
before those tables receive application traffic. No direct-client reward writes.
Reward deduplication must prevent re-awarding the same source merely because the
rule version changed; store ruleVersion as provenance, not a new entitlement to XP.

## 7. Sync, deletion and lifecycle rules

Pull captures the committed head as high-water mark, then pages immutable
changes `after < sequence <= highWater`; next cursor binds owner/contract/query.
Because the head is transactional, a client cannot advance past a missing earlier
same-owner commit. Use decimal-string sequences. Apply a received page and its
cursor atomically in SQLite. Never clear pending outbox entries before durable ack.

Batch writes are per-item transactions in order, not fictional all-or-nothing
success. The current JSON schema includes create-operation batch shapes only;
the extended command DTO and bootstrap/push/pull protocol now appear in
[16](16-BACKEND-EXTENSIONS-AND-OPERATIONS.md). Its `SyncPush` is the proposed
replacement transport; the older create-only `MutationBatch` remains a historical
shape fixture, not a second production endpoint. Full OpenAPI/response schema
integration and actual handlers are still unfinished. Do not advertise complete
offline sync from either document-only example.

Soft deletion emits a tombstone and prevents normal reads; offline edit cannot
resurrect it. Goal deletion clears relevant live task links through a transaction
while preserving history. Purge jobs delete children in documented order after
retention/permissions checks. Ownerless legacy data stays quarantined/local until
explicit migration ownership is resolved; signup is not consent to import/upload it.

Resources remain local by default and are excluded from generic sync payloads,
including local URIs, metadata and associations. Paid-cloud resource storage has
its own [contract](12-LOCAL-RESOURCES-AND-WORK-PLANNING.md); this SQL does not create
Storage buckets or resource-upload policies. Local domain sync and paid file
storage are separate products/costs/permissions.

## 8. Environment and deployment contract

Proposed configuration names below are **names only**, never secrets or completed
provider setup. Select concrete dev/staging/prod project IDs and URLs in the
owner-controlled environment inventory before running deployment commands.

| Name / location | Classification and use |
| --- | --- |
| `EXPO_PUBLIC_SUPABASE_URL`, `EXPO_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Public project routing/config, not authorisation |
| `EXPO_PUBLIC_DEEP_FOCUS_API_BASE_URL` | Public approved Edge API base; validate expected environment |
| `SUPABASE_URL`, `SUPABASE_PUBLISHABLE_KEY` in web server | Project config; no private page data generated at build time |
| `DEEP_FOCUS_API_BASE_URL` in Next.js server | Edge routing for server-owned user requests |
| Provider-issued server secret in managed secret store | Server-only privileged DB/RPC client; never Expo public or NEXT_PUBLIC |
| `DEEP_FOCUS_CURSOR_SIGNING_KEY` | Server-only integrity key; rotation/version policy required |
| Provider email/AI/billing/webhook secrets | Separate later module scopes; not needed for the pure domain fixtures |

No guessed domain, business identity, email sender or payout details. Never put
real secret values in docs/example env files. Client and preview bundles must
be checked for leaks. Create separate staging/production provider projects only
with owner authority; this document does not grant it.

Edge workers have finite wall/CPU/resource limits. Supabase's documented limits
mean exports, large scans and long AI/content jobs need bounded durable jobs,
not a promise that an HTTP handler keeps running forever.[^7] Do not choose a
queue vendor or paid tier merely by writing this contract.

## 9. Bounded build order and acceptance

| Card | Deliverable | Gate and mandatory evidence |
| --- | --- | --- |
| BE-01 | Freeze DTO/wire version and policies; runtime/SDK compatibility manifest | Platform selections already approved; unknown policy fields remain explicit |
| BE-02 | Isolated Supabase setup and reviewed schema migration | Exact disposable target + authority; execute DDL, FK/check/grant tests; record Postgres version |
| BE-03 | Auth bootstrap and mobile credential adapter | Factor/age/token/backup policy; verify sign-in/restore/refresh/switch/failure, not mock success |
| BE-04 | Owned profile/task/goal RPCs and Edge handlers | DTO+DB+rate-limit implementation; wrong-owner, stale-version and replay tests |
| BE-05 | Session event transaction and immutable terminal processing | Approved timing/clock/overlap policy; CR cases and lost-response retry |
| BE-06 | Full sync protocol and tombstones | Complete batch/feed DTOs; commit-order, page restart, account-change, offline deletion tests |
| BE-07 | Trusted progress/settings/assessment/AI/entitlement extensions | Approved domain rules/catalog; no direct-client trusted writes |
| BE-08 | Export/deletion/retention/restore and production runbook | Legal/region/RPO/RTO policies, isolated restore and non-resurrection; explicit release approval |

| Test | Required negative/success evidence |
| --- | --- |
| BE-T01 | Anonymous/project-key-only call cannot access private API |
| BE-T02 | Wrong issuer/expired/forged token rejected; disabled account cannot mutate |
| BE-T03 | A cannot GET/PATCH/link B's task, goal, session, receipt or cursor |
| BE-T04 | Direct REST/RPC/Realtime alternate entry cannot bypass Edge/domain policy |
| BE-T05 | Unknown owner/role/XP/resource fields rejected; title/date/unit constraints agree |
| BE-T06 | Two same-version patches: one commits, other conflict; no silent lost update |
| BE-T07 | Same idempotency key/payload returns original; changed payload conflicts |
| BE-T08 | Crash/timeout between transaction and response does not duplicate event/receipt |
| BE-T09 | Two delayed concurrent writers cannot produce skipped sync sequence |
| BE-T10 | One account's outbox/async refresh cannot execute as another account |
| BE-T11 | Date-only deadline unchanged by timezone; goal end excluded |
| BE-T12 | Fake completed duration/XP and conflicting terminal events rejected |
| BE-T13 | Cursor pagination/restart/expiration preserves unacknowledged local work |
| BE-T14 | Deleted goal/task preserves history; deletion wins offline edit |
| BE-T15 | Cookie CSRF/open redirect/private cache attacks fail; no browser service secret |
| BE-T16 | Failed SecureStore/refresh/uninstall/restore handled honestly on installed devices |
| BE-T17 | Deletion/export job ownership and restored deletion tombstones verified |
| BE-T18 | Provider outage/rate limit leaves local timer/tasks usable; no retry storm |

These eighteen BE tests are future integration/security evidence, not completed
checks. Local JSON fixtures do not pass them. Every BE card uses the Luna bounded
prompt/allowed-file/verification/handoff rules in [07](07-LUNA-IMPLEMENTATION-PLAYBOOK.md).

## 10. Remaining API modules, not silently dropped

Before the complete V1 backend is READY, add versioned contracts/migrations for:
goal edit/delete/progress, task delete/reopen if approved, settings and assessment,
break history, streaks/reward ledger/analytics, AI grants/proposals/confirmation,
full sync, account export/deletion, and the selected billing model. Website/Portal
must consume those same contracts. Education/resources and enterprise sharing
extend the shared core only under their own ownership/release gates.

This list is an explicit incomplete boundary. Fourteen concrete operations and
nine tables must not be presented as a finished production backend or complete
Luna-buildable enterprise specification.

[16](16-BACKEND-EXTENSIONS-AND-OPERATIONS.md) now gives each listed module a
concrete disposition, 33 extension/overlapping endpoint contracts, command DTOs,
state/transaction rules, eight BX cards and 24 future tests. It does not supply
executed migrations/RPCs or settle open numeric/merchant/retention policies.

September 18: its [selected extension OpenAPI](contracts/personal-extensions.openapi.json)
adds twelve explicit operations (EX-01–11, EX-17) alongside this core's fourteen.
Shared references and method/operation-ID uniqueness are checked across the two
files. They remain partial draft slices, not a merged full V1 API. Bodyless DELETE
version headers, break/reminder/deletion outputs and list/query mapping refine
the older extension prose; no deployed endpoint has changed.

The later operations slice adds fifteen sync/privacy/session/billing-visibility
operations, bringing the three partial files to 41 unique operations. Section 11
of `16` explains the private-log/public-feed kind mapping and requires new
migrations: the nine-table prototype cannot simply run the new contracts.
Secret-bearing response capsules/status receipts must not be put into its generic
plaintext mutation receipt payload. [22](22-REWARD-GOAL-AND-AI-WIRE-CONTRACT.md)
now adds six reward/goal-progress/AI extension outputs: 47 operations across four
draft files. Production policies/handlers, generation/revision/provider families
and the merged V1 contract remain incomplete.

## Sources

[^1]: OpenAPI Initiative, [OpenAPI Specification 3.1.1](https://spec.openapis.org/oas/v3.1.1.html), accessed 2026-09-15. Format/dialect reference; local checker is not a formal conformance certification.
[^2]: Supabase, [Row Level Security](https://supabase.com/docs/guides/database/postgres/row-level-security), accessed 2026-09-15. Privileged-key/RLS boundaries.
[^3]: Supabase, [Securing your API](https://supabase.com/docs/guides/api/securing-your-api), accessed 2026-09-15. Grants, RLS, exposed schemas and alternate product boundaries.
[^4]: Supabase, [Securing Edge Functions](https://supabase.com/docs/guides/functions/auth), accessed 2026-09-15. User JWT versus public/secret/webhook authentication; exact SDK integration still needs version testing.
[^5]: Expo, [SecureStore — SDK 56](https://docs.expo.dev/versions/v56.0.0/sdk/securestore/), accessed 2026-09-15. Secure credential storage and platform persistence limitations; no installed-build test claimed.
[^6]: Supabase, [Creating an SSR client for Next.js](https://supabase.com/docs/guides/auth/server-side/creating-a-client?framework=nextjs&queryGroups=framework), accessed 2026-09-15. Server auth verification; server-owned-cookie variant is the proposed Deep Focus design.
[^7]: Supabase, [Edge Function limits](https://supabase.com/docs/guides/functions/limits), accessed 2026-09-15. Finite worker resources; durable-job choice remains separate.
