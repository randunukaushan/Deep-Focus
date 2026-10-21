# Backend, Security and Synchronization Contract

Status: logical contracts targeting the owner-approved Supabase PostgreSQL/Auth selection (ADR-001). Other contracts depend on ADR-009/011/012 and exact API deployment decisions. Not production SQL, deployed policy or a security certification. Concrete migrations, token lifetimes, regions and retention cannot be guessed by Luna.

September follow-up: Edge Functions API, Expo SQLite domain storage and SecureStore
credentials are selected. [14](14-BACKEND-API-DATABASE-BUILD-CONTRACT.md) refines the
first personal-core slice with concrete DTO/OpenAPI files and an isolated SQL
prototype. It leaves business RPCs, remaining modules and integration tests
explicitly unfinished; neither grants nor private schemas have been deployed.

## 1. Trust boundaries

```text
Mobile / browser (untrusted input; local cache)
  → HTTPS authenticated request
  → schema validation + rate limit + identity + object/workspace authorisation
  → application service / transaction
  → PostgreSQL constraints + RLS (approved Supabase target)
  → auditable result / sync change

Provider webhook → signature/replay validation → trusted inbox → ledger transaction
AI / imported content → untrusted proposal → user confirmation → normal API checks
```

Use one deployable modular backend initially; avoid a premature microservice fleet. Boundaries: identity/access, personal planning, focus ledger, learning, collaboration, billing/entitlements, integrations/AI, audit/operations. UI cannot decide trusted reward, payment, membership or ownership outcomes.

Public publishable config is distinct from secrets. Never embed database credentials, signing secrets, service-role keys, AI provider keys or refresh tokens in public Expo variables/browser bundles. Personal API requests use identity-scoped access; privileged jobs have narrow server-only authority. RLS is defence in depth, not a reason to skip API ownership checks. Ordinary clients cannot directly write rewards, entitlements, roles or webhook events.

## 2. Identity and tenancy model

Resource exception: local-mode study/teaching files, metadata and task-resource associations are excluded from generic cloud sync/telemetry/AI. The owner subsequently approved optional paid-cloud direction, so a separately approved cloud mode may upload only explicitly selected resources after server entitlement/quota/ownership checks. No Storage bucket or upload API is provisioned by this draft. See [12](12-LOCAL-RESOURCES-AND-WORK-PLANNING.md); independently entered task/account data retains its own contract but must not automatically include resource-derived details.

Proposed common model: every account has one `personal` workspace; organisations/classes use separate workspaces when those modules are approved. Workspace is an authorisation boundary, not just a UI filter. Active UI workspace is never trusted as proof of membership.

| Logical entity | Minimum identity/invariant | Access / lifecycle |
| --- | --- | --- |
| `user_profiles` | Auth subject ID, display name, locale; no role chosen by untrusted profile edit | Self read/edit allowed fields; admin rights separate |
| `workspaces` | UUID, kind personal/organisation/education, lifecycle | Personal workspace membership exactly one owner; transfer not allowed as ordinary edit |
| `memberships` | workspace+subject unique, role, status, version | Server-managed invitation/acceptance/revocation; no self-promotion |
| `preferences` | subject+schema version, values, provenance | Private; previewed reset/merge |
| `tasks`, `goals` | UUID, workspace, author, version, lifecycle fields | Personal first; shared permissions require separate approved role contract |
| `focus_sessions` | UUID, personal workspace, subject, state, duration/config snapshot | Owner; terminal outcome unique; selected sharing is a separate record |
| `focus_events` | session+event UUID unique, type, sequence, timestamp data | Validated append; cannot rewrite terminal session from client |
| `reward_ledger` | unique owner+sourceType+sourceId+awardKind; ruleVersion is provenance, not a new grant key | Trusted write only; correction is linked compensating entry, not silent overwrite; see 16/20 |
| `return_tickets`, `outcome_receipts` | subject, personal workspace, optional task/session, version | Private; share copies/links only through explicit sharing service |
| `learning_records` | learner, workspace, assignment/topic/version references | Owner and explicitly authorised class scope; not all personal history |
| `shares` | source reference, field allowlist, recipients, expiry, revokedAt | Explicit consent; server rechecks on every read |
| `billing_customers`, `licenses` | subject/org scope, provider IDs, lifecycle | Server authoritative; no client “premium=true” write |
| `connector_accounts` | subject, provider, scoped consent, encrypted secret reference | Server token vault; private; revocation lifecycle |
| `audit_events` | actor, action, target identifier, time, request ID | Minimal/redacted; append through trusted service |

Mutable synced records use `id`, `workspaceId`, `createdBy`, `version` (server integer), `createdAt`, `updatedAt`, `deletedAt?`. UTC instants use ISO 8601; local dates are separately typed `YYYY-MM-DD`; duration uses integer milliseconds. IDs are collision-resistant UUIDs, not timestamps plus `Math.random`. A client-generated UUID is an identifier, never proof of ownership. Server validates all references and rejects cross-workspace links. Do not expose internal auth/provider schemas directly as public domain contracts.

Proposed constraints: duration positive and within approved product bounds; pause end ≥ pause start; terminal state/date consistent; one terminal application per session; goal end > start; foreign keys compatible with workspace; unique active personal membership; unique provider event IDs; unique entitlement grants. Enforce applicable invariants in transactions/DB as well as input validation. Add DB indexes from real access patterns, not every possible field.

## 3. Permission matrix (deny by default)

| Actor | Private personal data | Organisation/class records | Billing/roles | Audit |
| --- | --- | --- | --- | --- |
| Signed-out | None; public marketing only | None | Public catalog only | None |
| Account owner | Own allowed CRUD/export/delete | Only active memberships and record policy | Own purchase/manage request; cannot grant rights | Own security events if exposed |
| Invited but unaccepted user | Own personal data | Minimal invitation preview only | Cannot consume org seat until valid grant | None beyond own events |
| Member/learner | Own personal data | Assigned/shared permitted records | Read own effective access | No workspace-wide audit |
| Teacher/team lead | Own personal data | Explicit class/project scope, not private work | No self-elevation | Scoped events if approved |
| Organisation owner/admin | Own personal data | Organisation-owned administration within policy | Seat/member management with safeguards | Organisation audit only |
| Support operator | None by default | None by default | Scoped audited support workflow | Least privilege |
| Trusted worker | Only required fields for one job | Only required job scope | Narrow ledger/job authority | Append approved fields |

No wildcard support impersonation. Emergency support access, if later required, needs explicit purpose, approval, expiry and audit. A removed membership invalidates API and realtime access promptly; cached content handling and notification recipients must be tested. A user cannot manufacture another workspace ID in an URL, JWT custom field, request body or database filter to gain access.

## 4. Logical API contracts

These are **proposed route shapes**, not existing endpoints. With the provider now selected, freeze OpenAPI and generated/validated types when remaining domain/runtime decisions are fixed; method/field/response details must be shared by mobile, portal and future web. Do not independently reimplement contracts in each client.

| Method / route proposal | Input / guard | Success / conflict |
| --- | --- | --- |
| `GET /v1/me` | Valid identity | Profile, memberships, effective access; never tokens |
| `PATCH /v1/me/preferences` | Allowlisted fields, expected version | New version; 409 on stale write |
| `POST /v1/workspaces/{w}/tasks` | Membership, validated DTO, idempotency | Created task; owner derived from identity |
| `PATCH /v1/workspaces/{w}/tasks/{id}` | Record rights, expected version | New version; no role/owner field changes |
| `POST /v1/focus-sessions` | Valid config, stable ID, idempotency | Accepted session/config; server time and version |
| `POST /v1/focus-sessions/{id}/events` | Event ID, allowed transition, expected version | Applied/deduplicated event and state, or 409 |
| `GET /v1/sync?cursor=...` | Identity, scope, bounded page size | Changes/tombstones and next cursor; no foreign records |
| `POST /v1/sync/mutations` | Bounded batch, per-item IDs/schema | Per-item ack/conflict/deny; no fake whole-batch success |
| `POST /v1/ai/proposals` | Entitlement/quota, minimal context consent | Validated proposal, no domain side effects |
| `POST /v1/proposals/{id}/apply` | Exact approved operations/hash, fresh authorisation | Atomic supported apply or explicit conflict |
| `POST /v1/account/export` | Recent auth where required, request ID | Async job status and expiring download when ready |
| `POST /v1/account/deletion` | Recent auth, explained consequences | Deletion lifecycle receipt, not immediate false success |
| `POST /v1/billing/webhooks/{provider}` | Signature, timestamp/replay checks, raw body handling | Safe acknowledgement after durable inbox |

Error envelope: `{ error: { code, messageKey, requestId, retryable, fieldErrors? } }`. No stack, SQL, token or another user's existence. Use stable codes: `VALIDATION_FAILED`, `AUTH_REQUIRED`, `ACCESS_DENIED`, `NOT_FOUND`, `VERSION_CONFLICT`, `INVALID_TRANSITION`, `RATE_LIMITED`, `DEPENDENCY_UNAVAILABLE`, `CURSOR_EXPIRED`. An inaccessible object can return privacy-preserving 404; use consistently. Do not use 200 with a hidden failure message.

Every non-idempotent user mutation uses a key scoped to subject+workspace+operation, with payload hash and durable result. Same key+same payload returns original outcome; same key+different payload fails. Key retention must cover the approved retry/offline window; ADR-011 must fix that window before launch. Ledger/event unique constraints provide long-lived duplicate protection beyond cached HTTP responses. Retries use bounded exponential backoff+jitter and respect Retry-After; non-retryable auth/schema conflicts wait for resolution.

## 5. Local persistence and safe migration

Expo SQLite and Expo SecureStore were selected on September 15 for mobile domain
data and login credentials respectively. The SQLite repository owns transactions;
UI hooks depend on repository interfaces, not SQL. No auth secrets in domain
tables/plain JSON. Exact adapter/key/backup settings and tests remain gated.
Local schema version and account namespace must be explicit. SQLCipher is not
approved merely by SQLite selection; it requires a supported native build, secure
key lifecycle and recovery design. Expo Go does not prove production behaviour.

Existing JSON → new store migration task:

1. Inventory actual files/schema and capture non-destructive test fixtures, including corrupt/partial records. Do not log real user payloads.
2. Create the new DB in a separate path and validate schema before reading old files.
3. Import with deterministic legacy-ID mapping, integrity checks, terminal-state validation and a migration marker inside a transaction.
4. Re-run safely after interruption; verify record counts, links, durations and duplicate absence.
5. Switch reads only after verified import. Preserve recoverable original files for the approved migration-retention period; deletion is a separate authorised action.
6. If import fails, keep old data readable where safe and offer recovery; never pretend an empty history is successful migration.

Changing storage does not itself fix lifecycle races. Repository writes must be serialised/transactional and surfaced to the caller. A failed save cannot show “Saved”. Web local storage requires a separate supported adapter later; the current web no-op storage is not a production offline implementation.

The [core reliability contract sections 4–7](13-CORE-RELIABILITY-CONTRACTS.md)
specifies proposed unit-version mapping, typed load/write outcomes, terminal
transaction boundaries, hydration states and migration failure/rollback limits.
Integer milliseconds here are the proposed expanded contract, not the current
canonical `*Seconds` DTO; conversion must be explicit and versioned. Do not
auto-adopt legacy ownerless records into the account currently signed in.

## 6. Focus transaction and cross-device policy

Local terminal transaction: validate transition → persist session terminal record → add unique outbox mutation → clear active pointer → commit. On failure roll back all four changes; keep recovery available. Network acknowledgement is later and is not required to keep a local terminal record. Completion UI distinguishes local saved from cloud verified.

Proposed multi-device policy: one server-recognised active focus session per personal account. Online start uses a transactional lease/active constraint. Offline start is allowed as local pending work; it cannot acquire a global lock or promise no overlap. On reconnect, overlapping sessions are retained for review but shared verified time/rewards cannot double-count the overlap. Exact overlap-credit and clock-tolerance rules must be approved and given numeric fixtures before this task is READY; Luna must not guess them.

Client timestamps, monotonic elapsed observations and server receipt time help detect inconsistency but **do not prove attention or physical activity**. Never use focus time as a payroll, exam-proctoring or anti-cheat guarantee. Clock rollback/large jumps put the affected record into reviewable uncertain status, not automatic full XP. Local progress may remain visibly provisional while core use continues.

## 7. Offline synchronization protocol

Outbox record proposal: `mutationId`, account namespace, workspace, entity ID/type, operation, baseVersion, payload schema version, payload hash, clientCreatedAt, attemptCount, nextAttemptAt, state. Payload is minimal and protected according to data classification. Never replay one account's queue with another account's access token.

Server transaction: authenticate → authorise each reference → validate schema/baseVersion → deduplicate → apply invariant-safe change → assign server change sequence → save ack. Cursor is an opaque authorised server sequence, not client `updatedAt` sorting. Pagination must not skip or duplicate changes; duplicates on replay are harmless. Pull includes tombstones and current permission removals. Sync acknowledgements are durable before local queue deletion.

Conflict policy:

- Same mutation: return original result.
- Stale editable task/preferences: return current version and conflicts; keep user's draft, offer explicit merge/retry. No last-write-wins for role/owner/billing fields.
- Terminal session: reject contradictory transition; preserve local evidence for reconciliation, never silently create another completion.
- Server deletion vs offline edit: deletion wins visibility; keep recoverable unsent draft per approved retention and offer create-new only with explicit user action.
- Revoked access: stop pushes/pulls and purge protected cache according to approved policy; do not repeatedly retry forbidden writes.
- Cursor expired: rebuild only that account/scope's authorised mirror, preserving unacknowledged local work in a separate queue. Never use a broad filesystem or database wipe.

Connectivity flapping, request timeout after successful server commit, partial batch failures and pagination restart all need fixtures. Sync status is `local only | pending | syncing | up to date | action needed`, with last success time. “Up to date” requires no outstanding mutations and a completed authorised pull.

Sign-out/switch account: show pending work and offer sync/export where supported; do not claim unsynced work is backed up. Revoke/clear session credentials as required, detach listeners, cancel old requests and isolate/remove cache under approved retention policy. Do not retain readable private cache on shared devices by default. Exact handling of unsynced work vs immediate secure sign-out is a release decision requiring a tested recovery path, not an excuse to trap the user signed in.

## 8. Data ownership, export and deletion

Classification: public marketing/catalog; private profile/planning; sensitive credentials/self-reports; institution-owned operational records; security/billing records with applicable retention duties. Collect no journal, contact list or third-party notification contents by default. Store selected share records separately from the private originals and minimise derived data leakage.

Export must include user-readable data and documented machine-readable versions, with scope manifest, timezone semantics and omitted-data reasons. Re-authenticate sensitive downloads; links expire; another user cannot access a guessed job ID. Pricing expiry must not remove statutory privacy controls.

Deletion lifecycle proposal: requested → re-auth/ownership checked → access disabled/revoked → live data deletion/anonymisation jobs → connector revocation and share invalidation → completion receipt; failures remain observable/retryable. Billing/security retention exceptions are disclosed before confirmation. Backups expire under the approved schedule; restoration must replay deletion tombstones so erased accounts are not silently resurrected. Do not promise immediate deletion from immutable backups or cancellation of all store subscriptions as an automatic side effect.

ADR-011 must specify retention per class, backup expiry, idempotency/offline windows, export TTL, incident log retention, host region and transfer policy. This document intentionally does not invent legal retention numbers. No production personal data before these values and responsible owner are recorded.

## 9. AI, realtime and integration security

AI prompt/input can contain hostile instructions. Treat documents, calendar descriptions, chat and model output as data. Validate outputs with a schema, enforce quotas and timeouts, and expose no unrestricted database/network tool. Generate proposals separately from applying the exact confirmed operations. A provider outage must not block a timer, tasks or access to user's own data.

Realtime channels require server-authorised membership, minimal payloads and revocation tests; a guessed room name is not access control. Signed media/upload URLs require type/size restrictions, private buckets and malware/content handling appropriate to the feature. Do not enable arbitrary attachments before those controls exist.

OAuth uses state/PKCE where supported, verified redirect allowlists, least-privilege scopes, server-held refresh credentials and explicit revoke. Incoming webhooks are untrusted until verified. Outbound requests must prevent SSRF and uncontrolled redirects. Disconnect stops future processing, cleans the connector mirror under policy and preserves independently created Deep Focus records.

## 10. Operations and security acceptance

Separate local/dev, staging and production projects, credentials and databases. CI has minimal scoped access. Secrets scanning, dependency review, redacted structured logs, request IDs, rate limits and bounded resource usage are release requirements. Do not copy production data into developer machines without a separately approved safe process.

Backups are not proven until a restore drill succeeds in isolation. Owner must select RPO/RTO objectives, restore privileges and on-call/support responsibility. Migrations require staging rehearsal, backward-compatible rollout, backup checks, monitoring and a realistic rollback/forward-fix plan. Destructive migrations need explicit approval.

Required security evidence S-01…S-10: two-user object isolation; cross-workspace reference denial; role escalation denial; revoked membership/realtime denial; duplicate webhook/session reward prevention; forged client premium/ad claims denied; no secrets in mobile/web/log artifacts; expired/revoked token rejection; export/deletion isolation and restore non-resurrection; rate-limit and AI prompt-injection boundary tests. These checks are specified, **not executed by this documentation change**.
