# AI proposal apply receipt guard — 2026-10-11

## Implemented candidate

- Added a server-only decision guard for an owner-bound AI proposal apply
  intent.
- An identical mutation receipt is replayed without executing domain writes.
- A changed payload under the same mutation ID is rejected as
  `IDEMPOTENCY_CONFLICT`.
- A different mutation ID for an already-consumed proposal is rejected as
  `AI_PROPOSAL_ALREADY_APPLIED`.
- Proposal version, review digest, mutation ID, request digest, response
  status, committed sequence and timestamp are validated before a stored
  receipt can be replayed.
- Added a PostgreSQL adapter candidate and isolated migration with owner-bound
  uniqueness for `(owner, mutation)` and `(owner, proposal)`, fail-closed row
  decoding, and transaction-scoped read/write methods.
- Added a separate owner-bound proposal storage candidate with version/digest/
  expiry checks and a guarded `ready` → `applied` transition. Full operation
  schema validation and domain apply remain separate.
- Added a transaction coordinator that normalizes selected operation order,
  rejects missing dependencies, runs the domain callback, marks the proposal,
  and writes the apply receipt within the caller-owned transaction boundary.
- Added a unified PostgreSQL adapter candidate that supplies proposal and receipt
  operations from one transaction client; replay avoids proposal/domain writes.

## Verification

- AI receipt-guard tests: **5/5 PASS**; PostgreSQL adapter tests: **5/5 PASS**;
  proposal adapter tests: **5/5 PASS**; combined migration/safety contract
  checks in the focused run: **11/11 PASS**; atomic coordinator tests: **5/5
  PASS**; unified PostgreSQL adapter tests: **3/3 PASS**. Combined focused run:
  **34/34 PASS**.
- Full repository suite after this slice: **743/743 PASS**.
- The migration and adapter are local candidates only; no remote database was
  changed and no durable runtime claim is made.

## Review boundary

Real PostgreSQL execution/RLS, full operation schema validation and actual domain
write integration remain `REVIEW_PENDING / NOT_RUN`. The coordinator and unified
adapter are local candidates and do not perform provider or remote database I/O.
Provider credentials, live AI calls, paid allowances and production data were
not touched.
