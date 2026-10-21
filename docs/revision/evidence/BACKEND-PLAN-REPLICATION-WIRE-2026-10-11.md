# Backend evidence — Plan replication and export wire candidate (2026-10-11)

Added a local, review-gated PL-02 wire helper without changing the current v1
sync feed. It validates canonical `SavedPlan` records, admits only the four
versioned plan commands (`edit`, `archive`, `restore`, `delete`), rejects
duplicate mutation IDs and target mismatches, verifies ordered transaction
groups with a SHA-256 digest, and builds a bounded plans-only export section
with deterministic pages and manifest digest. Its restore verifier checks the
same page/manifest digests, ordering and counts before returning any plan.
Deleted data and bound reminders
are not invented by this helper; live database snapshot, epoch, authorization,
and artifact suppression remain server integration responsibilities.

The same review-gated slice now includes owner-bound `GET /v1/plans` discovery:
it excludes tombstones, orders by `(created_at, id)`, hydrates each result through
the canonical plan reader, and uses an HMAC-signed, owner/limit/expiry-bound
cursor. It is not activated in the current v1 sync feed.

A separate review-gated migration candidate now supplies the v2 persistence
foundation: owner-bound `sync_v2_heads` with privacy epochs,
`sync_v2_transaction_groups` with bounded digest commitments, and
`sync_v2_changes` with plan/tombstone support. It does not alter the v1 tables
or grant client roles access.

The local v2 transaction adapter now appends a whole owner-bound group through
one injected transaction boundary. It locks the v2 head, validates the active
profile and privacy epoch, rejects duplicate entity identities and out-of-range
PostgreSQL `bigint`/non-finite JSON values, replays only an exact stored group,
and fails closed on changed replays. It is not wired to a live database or the
current v1 gateway.

The matching local v2 pull reader returns only complete groups whose change
count, ordered boundaries, per-change hash and group digest all verify. It
binds reads to the current privacy epoch and fixed high-water, returns an
honest empty caught-up page, and fails closed instead of exposing a partial
plan/reminder group. It is not wired to a live route or client.

The pull page candidate now requires an HMAC-signed v2 cursor bound to the
owner, protocol, privacy epoch, limit, high-water and expiry. It emits a
continuation cursor only after the verified group page is read; the v1 cursor
contract remains unchanged.

The local client boundary now validates complete v2 groups and their digest
before invoking one injected atomic SQLite page-and-cursor callback. Invalid
groups never reach storage, and callback failures remain retryable; this is a
local candidate and does not claim native/device verification.

The isolated V2 push admission candidate now validates the complete envelope
before execution: positive epoch, exact command/item keys, unique mutation IDs,
1–25 items, the 65,536-byte UTF-8 bound, create/action target identity, and all
fourteen existing command bodies through the current DTO validators. Plan
commands reuse the canonical plan wire validator. It is not wired to a route,
does not derive ownership from client input, and does not execute a mutation.

The V2 push orchestration candidate now performs trusted-owner and epoch
admission before each ordered item. It validates executor identity/receipt
shapes, maps safe domain failures to per-item outcomes, and stops later items
after an epoch change with `SYNC_RESET_REQUIRED` retry outcomes. It remains an
injected local candidate and performs no database writes.

An HTTP-shaped V2 push handler candidate now reuses common request admission
for the 64KiB body bound, JSON content type and UUID batch idempotency key, then
wraps execution in the batch-receipt contract. Exact retries replay the stored
response and changed bodies conflict before execution. It is not registered in
the current router and does not authenticate the runtime itself.

The isolated V2 batch receipt contract now binds the batch key and request hash
to the verified owner. Exact retries replay without execution, changed intent
returns `IDEMPOTENCY_CONFLICT`, foreign/corrupt stored rows fail closed, and a
receipt-save failure propagates so the caller can retry. It is an injected
transaction contract only; no live receipt table or route adapter is enabled.

The matching migration candidate adds an owner-plus-batch primary key, a
lowercase SHA-256 request hash check, bounded object response storage, fixed
HTTP-200 status, RLS and service-only select/insert grants. It is additive and
does not alter V1 sync tables or per-item mutation receipts; remote execution
remains `REVIEW_PENDING / NOT_RUN`.

The matching PostgreSQL adapter candidate performs owner/batch `FOR UPDATE`
reads, fails closed on foreign or malformed returned rows, inserts only
parameterized receipt data, and verifies returned owner/batch identity. Its
client, runner and batch executor are injected; it is not connected to a live
Supabase project.

The server page reader, signed cursor and local apply boundary are covered by
an integration contract check: a verified group advances to the next signed
boundary, while invalid group data never reaches local storage.

An isolated versioned SQLite V2 storage candidate now persists pull state,
transaction groups and their changes with owner keys and foreign-key bounds.
Real `node:sqlite` checks cover complete apply, exact replay, owner isolation,
injected mid-group rollback and restart retry. It is deliberately not wired
into the main app schema version or production sync path until the separate
SQLite migration/review gate is accepted.

Its `plan.edit` input validation now follows the canonical management wire:
the editable payload is the eight-field `PlanCreate` shape, while persisted
`SavedPlan` metadata remains read/export-only. Task version references and
reminder actions are exact, bounded identifiers with duplicate and unknown-field
rejection. The edit candidate also checks schedule-window bounds, non-overlap,
break predecessor references and complete focus-task version coverage before any
future transaction adapter can receive it.

## Actual checks

- PL-02 wire and restore helper tests: **6/6 PASS**.
- Plan-edit shape and action validation are covered by the same **6/6 PASS**
  focused wire suite.
- Plan list cursor and read-handler tests: **7/7 PASS**.
- v2 plan-sync migration and private-table security checks: **16/16 PASS**.
- v2 transaction adapter checks: **4/4 PASS** (including bigint and JSON-boundary regressions).
- v2 pull reader plus transaction adapter checks: **9/9 PASS**.
- v2 cursor and pull-page checks: **12/12 PASS**.
- v2 local SQLite group-apply checks: **4/4 PASS**.
- v2 server-page/cursor/local-apply integration checks: **17/17 PASS**.
- isolated real SQLite V2 storage checks: **2/2 PASS**.
- isolated V2 push admission checks: **2/2 PASS** (all fourteen legacy command
  mappings plus envelope/duplicate/target/size rejection).
- isolated V2 push orchestration checks: **5/5 PASS** (epoch admission, ordered
  server-owner binding, reset stop, safe failure mapping and receipt integrity).
- isolated V2 push handler checks: **6/6 PASS** (HTTP admission, owner binding,
  safe errors, item-level retry response, exact replay without a second
  execution, and changed-body conflict).
- isolated V2 batch receipt checks: **5/5 PASS** (exact replay, changed-intent
  conflict, receipt-save retry, foreign/corrupt row rejection and pre-storage
  identity validation).
- V2 batch receipt migration contract checks: **1/1 PASS**.
- PostgreSQL V2 batch receipt adapter checks: **5/5 PASS**.
- TypeScript typecheck: **PASS**.
- Affected ESLint: **PASS**.
- Full repository regression: **1182/1182 PASS** (all `tests/**/*.test.mjs`
  files discovered and executed by the bundled Node runtime).
- Documentation checker: **PASS** — 348 Markdown
  files, 80/80 requirements, 936 local links checked.

## Gates

- Real PostgreSQL repeatable-read snapshot, privacy epoch and RLS execution:
  **REVIEW_PENDING / NOT_RUN**.
- v2 sync/pull/push activation, account-export job/artifact delivery,
  deletion suppression and restore rehearsal: **REVIEW_PENDING / NOT_RUN**.
- Independent security review and Android/device verification:
  **REVIEW_PENDING / NOT_RUN**.
