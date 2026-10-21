# Changelog

## 2026-10-21

- Reconciled PR #20 with main's color-system commits. Retained the October
  presentation palette and action contrast, restored semantic progress/info/
  danger/focus/pressed tokens and routed color work through the canonical record.
- Repaired stale session-boundary fixture imports and the extracted Plan-screen
  navigation check; SVG parity now tolerates Git CRLF checkout without ignoring
  artwork differences. Removed an unused teacher-screen import.
- Executed the isolated PostgreSQL migration/RLS suite with PGlite 0.3.14.
  Corrected the reward owner-denial oracle for the BEFORE INSERT trigger and
  added a foreign completed-session fixture plus unchanged-ledger assertion.
  Automated suite 1758/1758 and SQL suite 10/10 pass. Independent review and
  native/hosted release verification remain pending; see the PR #20 evidence.

## 2026-10-20

- Restored the owner's original arcs/coral-dot logo, wordmark and tagline in
  the launch overlay. Removed whole-screen zoom; loaded artwork remains visible
  for 1500ms then fades for 350ms. Reduced motion bypasses decoration; asset
  failure and a watchdog prevent a trapped launch. Native Android splash
  resources use the same supplied artwork and navy background.

- Changed signed-out root entry to open Sign Up first, with an explicit Sign In
  path for returning users. Added local email-shape validation to sign-in and
  sign-up, preserved safe provider error copy, and exposed a direct Create
  Account action after invalid credentials. Replaced the plain startup overlay
  with a short branded Deep Focus logo/name transition that respects reduced
  motion. Native splash asset replacement and phone visual verification remain
  pending.

- Added an official-source competitive UI research note covering Forest,
  Focusmate, Todoist and TickTick. Applied a bounded Sinhala language polish to
  onboarding focus-block wording, progress labels and presentation preferences;
  no data, navigation or focus-session behavior changed. Native typography and
  device verification remain pending.

- Unified Welcome and Auth callback with the original-scene AuthFrame while
  preserving callback alert/live-region copy and sign-in return. Added permanent
  goal-composer labels, checked/readable selections, standalone safe-area and
  keyboard handling, plus scrollable goal/focus-entry failure states. No Auth,
  goal persistence or focus-navigation logic changed; native QA remains pending.

- Aligned Task detail, Plan My Day and Rewards with shared preview-style headings
  and semantic actions. Added persistent task-edit labels, standalone safe-area
  and keyboard handling, readable locked milestones, shared retry/empty buttons
  and explicit return to Progress. Task/planner/reward handlers and persistence
  remain unchanged; native visual/keyboard acceptance remains pending.
  Native tab chrome now follows saved app appearance instead of bypassing it
  with the OS hook, with explicit default/selected semantic icon and label colors.

- Polished break, summary and recovery presentation: shared calm headings and
  actual-time dial, checked/readable duration selections, scrollable summary and
  recovery states, centered finalized results and Home-first summary actions.
  Existing pause/resume, finalized-record reads, reward receipts and task actions
  remain unchanged. Native visual/accessibility verification is still pending;
  the existing break lifecycle/spec mismatch is recorded separately.

- Connected Settings to its existing saved appearance/motion editor instead of
  static System descriptions. Shared the existing action-contrast rule with
  selected controls, aligned history headings and made session detail scrollable
  without changing history totals, filters or persistence. Targeted checks pass;
  native visual/accessibility acceptance remains pending.

- Extended the shared form presentation and duplicate-action guard to recovery
  and verification, retaining recovery-only routing and enumeration-safe copy.
  Aligned resource/assignment headers/actions and made goal detail scrollable
  with keyboard avoidance. Existing goal edit/delete/failure tests remain green;
  native visual and large-text/keyboard acceptance are still pending.

- Aligned sign-in/sign-up with a shared preview-scene frame, safe-area/keyboard
  handling, semantic actions and keyboard field progression. Added synchronous
  duplicate-submit protection, safe thrown-error fallback and unmounted-callback
  invalidation without changing Auth service/provider policies or making live
  account requests. Native visual/keyboard verification remains pending.

- Recorded the owner's superseding five-step onboarding scope (language plus
  focus duration, break duration, appearance and motion) and whole-app preview
  alignment goal. Added a version-2 definition, selected old/new review mapping,
  owner-local atomic settings/completion application, draft resume lookup and
  completed-attempt retry receipts. No schema reset or legacy answer rewrite.
  Connected the real language/questions/review routes with localized preview-style
  UI, owner-bound resume/retry, selected old/new review and Profile redo. Language
  changes no longer rewrite duration settings. Account switches hide stale
  onboarding markers and invalidate old callbacks. Whole-app polish, native
  bundling/accessibility/translation verification and independent review remain open.

## 2026-10-19

- Ported the preview's Home/Plan/Focus/Progress presentation, original offline
  scenery, semantic palette and accessible timer dial without importing demo
  tasks/timer logic. Plan derives real task counts/time and supports optional
  planned dates/estimates with additive SQLite19 columns.
- Added explicit-save, owner-isolated device-local Profile appearance/motion
  and motivational preferences via SQLite20. Personal words are not synced or
  written to history; focus display defaults off with a stable phrase. Native
  device/accessibility acceptance and independent migration/privacy review
  remain pending.

- Continued the native planning UI with shared localized, theme-aware headings
  across Plan/Tasks/Goals and clearer Plan navigation cards. Task completion and
  task opening now have separate controls, and pending tasks no longer show a
  checkmark. Existing storage/domain behavior is preserved; new phone visual and
  accessibility acceptance remains pending device/Metro reconnection.

- Auth now distinguishes malformed email, restricted email delivery, throttling
  and retryable connection failures using safe localized copy. Verification
  resend preserves these errors instead of hiding them. Unknown failures no
  longer assert a connection problem. Real inbox delivery remains unverified;
  email confirmation stays enabled and no SMTP/provider policy was changed.

- Deployed the authenticated development gateway and configured its missing
  server secrets after explicit owner authorization. Real synthetic-account
  checks passed account bootstrap/profile, task write/read/replay, cross-owner
  denial, sync pull and app-session revocation. Fixed Postgres driver value
  normalization, bootstrap FK ordering, JSONB receipt comparison and the profile
  response contract exposed by these checks.
- Connected mobile sign-in/restoration to backend account bootstrap and verified
  workspace lookup with foreground retry. Preserved function mount paths in
  API URLs and stopped old-account outbox delivery after account switches.
  Tasks/Goals/Focus automatic domain sync is not activated by this account
  connection; phone end-to-end verification remains pending.

- Authentication forms now preserve the existing localized, safe Supabase Auth
  error message instead of replacing it with a generic failure. Real-provider
  device verification and independent authentication review remain pending.

## 2026-10-16

- Connected Plan My Day's local proposal screen to the existing deterministic
  `ai-planner` mock-provider and explicit confirmation boundary. Saved plans
  remain local and owner-scoped; live OpenAI transport and allowance handling
  remain review-pending.

- Made new local-resource ID collisions fail closed instead of overwriting an
  existing owner record.

- Added Sinhala and Tamil copy for the public Plans status page. It remains an
  honest no-checkout development notice and does not add prices or billing.

- Added a regression gate against directly rendering caught exception messages
  or stacks in mobile and portal user-facing source.

- Localized shared public-website review and feature-readiness labels for the
  selected Sinhala, Tamil or English locale. Untranslated page content remains
  explicitly marked rather than being represented as translated.

- Localized the Account Portal's downloaded summary note for the selected
  Sinhala, Tamil or English website locale. The export remains portal-visible
  status only and does not include private app data.

- Added owner-scoped local-resource rename with optimistic stale-write handling.
  It preserves resource IDs, revisions and linked task associations; it does not
  import files, open resources or upload anything.

- Localized persisted goal-status and task-priority labels in the Task and Goal
  detail flows, and the Progress activity chart's screen-reader duration, so
  Sinhala and Tamil views do not expose internal status values or raw seconds.

- Added a local-only Supabase reward-progression schema candidate for the
  approved V1 owner-bound XP ledger, progression summary, achievement catalogue
  and one-time Summary presentation receipt. It has no direct client table
  grants and is not applied, deployed or remote-verified; server transaction,
  Auth/RLS and sync evidence remain review-pending.

## 2026-10-15

- Added deterministic user-local Streak derivation from owner-scoped terminal
  sessions and moved existing Rewards milestones into a pure duplicate-safe
  domain projection. XP/Level grants and a persisted achievement ledger remain
  deferred because their canonical amounts/catalog are not frozen; no cash or
  betting mechanics were added.

- Hardened V1 Progress/Analytics with a user-local Today period, pure derived
  average/Focus-Plan/task-rate metrics, duplicate/conflict fail-closed handling,
  and persisted-data-only Summary task completion. A focus session never
  silently completes its linked task; device verification and independent
  review remain pending.

- Hardened local Tasks completion so a stale screen can no longer rewrite an
  entire task list and recreate a concurrently deleted record. SQLite now
  completes one owner-scoped task by stable ID and revision, with safe replay
  behavior; focused regression coverage preserves linked Goals and Focus
  history behavior. Device verification and independent review remain pending.

- Core Focus now preserves historical task IDs after task deletion, routes
  Session Summary by durable session ID only, and exposes the established
  terminal outbox identity as the exactly-once processing boundary for future
  derived consumers. Real-device lifecycle verification remains pending.

- Applied all 36 ordered Supabase migrations to the previously empty,
  owner-approved `deep-focus-dev` development target. Hosted verification found
  37/37 private tables with RLS, zero client table grants, 134 service-role
  grants, 49 policies and 12 covering foreign-key indexes. Supabase advisors
  now report zero unindexed-FK notices; remaining INFO-level private-table
  policy and unused-index notices are documented. Production acceptance,
  real Auth/gateway isolation and independent review remain pending.

- Hardened Core Focus recovery: active and paused sessions are surfaced from
  startup/Home paths, terminal recovery remains fail-closed, and True Zen Break
  uses timestamp/deadline projection with lifecycle refresh and clock checks.
- Added focused break-timer and Home recovery regression coverage; no V1 scope
  or UI redesign was introduced.

- Added the Supabase migration self-review record. Static security and migration
  checks pass, but remote application remains `REVIEW_PENDING` pending isolated
  hosted authorization/recovery evidence and qualified independent review.
- Re-ran the local PostgreSQL-compatible migration suite from an already cached
  runtime: all nine migration/RLS/recovery cases pass. This does not replace
  hosted Supabase Auth, Edge, or independent security-review evidence.
- Confirmed read-only that `deep-focus-dev` has no applied migration history;
  no remote database change was made.

## Unreleased

- Added a bounded remote Supabase migration review packet with the target,
  current local evidence, unrun runtime limitations and required independent
  RLS/ownership/rollback review checks. No remote migration or deployment was
  performed.
- Reconciled the seconds-based mobile model with the explicit millisecond
  remote migration boundary; live conversion round-trip verification remains a
  required review check.

- Added the approved app-language choice to onboarding. The Sinhala, Tamil or
  English selection is saved to local settings without changing course medium,
  assessment data or other onboarding state; failed saves keep the previous
  language and show the existing retryable settings error. Human translation,
  independent review and Android verification remain pending.

- Fixed sync cursor and account-bootstrap time generation so long-lived Edge
  gateway isolates resolve the current time and TTL for each request instead of
  retaining a handler-creation timestamp. Added regression coverage for
  consecutive pulls and the Edge entrypoint wiring.

- Hardened the PostgreSQL AI plan reader so plan and block result rows cross
  the same dense plain-JSON boundary before owner-bound plan data is mapped.
- Added regression coverage proving sparse plan rows fail closed without
  fabricating a saved plan.
- Hardened ready snapshot page and metadata reads to reject ambiguous duplicate
  database rows instead of silently selecting the first row.
- Added regression coverage for duplicate snapshot page and metadata results.
- Added local PostgreSQL backup/restore adapter coverage for verified-owner
  export, transaction-bound restore, validation-before-write and writer failure
  propagation.
- Added authenticated gateway runtime regression coverage proving request and
  rate-limit clocks are sampled per request rather than retained from setup.
- Hardened privacy download-grant creation to reject a database acknowledgement
  that is already expired, matching the existing replay-path expiry check.
- Added a regression test for an expired created-grant acknowledgement.
- Made the Supabase deployment preflight explicitly fail-closed while the
  owner has not selected ADR-011 retention, hosting-region, RPO and RTO policy.
- Added a regression test preventing unresolved production policy from being
  interpreted as deployment approval.
- Recorded the 2026-10-14 classroom local-gate verification separately from
  the still-unrun SQL/RLS, runtime, device and independent-review gates.
- Added classroom contract, bridge, helper and key-policy checks to the local
  Supabase deployment preflight; these remain documentation/synthetic checks
  and do not mark classroom runtime or RLS evidence complete.
- Added local SQLite, sync-recovery and backup/restore regression suites to the
  same preflight so recovery coverage cannot be omitted from the readiness
  evidence.
- Wired the existing PostgreSQL gateway handler catalog into the Edge runtime
  instead of exposing only the two sync handlers. Added separate fail-closed
  list and snapshot cursor secrets and composition regression checks; this is
  still a local candidate pending Edge/runtime and independent review gates.

- Hardened authenticated gateway read handlers to validate every PostgreSQL
  result-row array as dense plain JSON before mapping owner-bound DTOs,
  pagination, progress, privacy and session responses.
- Added a regression test proving sparse database row arrays fail closed before
  a task response can be produced.
- Hardened AI-generation and sync-snapshot worker list queries to reject sparse
  or non-plain database row arrays before lease work is exposed to workers.
- Added regression tests for both worker queues' sparse result handling.
- Hardened the AI-generation status reader to reject sparse or non-plain request
  result rows before exposing status or proposal references.
- Added a regression test for sparse request rows failing closed.
- Hardened the PostgreSQL app-session adapter so every returned row array is
  dense plain JSON before session or revocation state is read or changed.
- Added a regression test for sparse app-session database rows.
- Hardened gateway owner authorization lookups to reject sparse or non-plain
  database rows before owner identity can be used for authorization.
- Added a regression test for sparse gateway owner rows.
- Hardened the PostgreSQL session guard to reject sparse or non-plain session
  result rows before accepting an active session.
- Added a regression test for sparse session-guard rows.
- Hardened the session-revocation worker adapter to reject sparse or non-plain
  database result rows before lease transitions or provider-revocation work.
- Added a regression test for sparse revocation-worker rows.
- Hardened the PostgreSQL sync snapshot source reader to reject sparse or
  non-plain source and sync-head rows before materializing snapshot records.
- Added a regression test for sparse snapshot source rows.
- Hardened the PostgreSQL sync pull adapter to reject sparse or non-plain
  high-water and change result rows before returning a sync page.
- Added a regression test for sparse sync change rows.
- Hardened snapshot job enqueue results to reject sparse or non-plain rows
  before queued-job state is trusted or replayed.
- Added a regression test for sparse snapshot job rows.
- Hardened the V2 sync pull adapter to reject sparse or non-plain result rows
  before reading sync heads or complete transaction groups.
- Added a regression test for sparse V2 sync-head rows.
- Hardened the sync change writer to reject sparse or non-plain entity, head,
  insert and head-advance result rows before publishing a sync change.
- Added a regression test for sparse owner-head rows.
- Hardened the V2 sync transaction adapter to reject sparse or non-plain
  profile, head, replay, insert and head-advance result rows before reporting
  an applied or replayed group.
- Added a regression test for sparse V2 profile rows.
- Hardened the migration runner adapter to reject sparse or non-plain result
  rows before trusting migration catalog, receipts or write acknowledgements.
- Added a regression test for sparse migration receipt rows.
- Hardened the standalone migration receipt adapter to reject sparse or
  non-plain receipt result rows before replay or insert acknowledgement.
- Added a regression test for sparse migration receipt rows.
- Hardened saved Plan My Day block reads to reject sparse or non-plain database
  row arrays before block ordering and reminder binding.
- Added a regression test for sparse saved-plan block results.
- Hardened AI generation admission to reject sparse or non-plain existing-request
  result arrays before allowance or request replay decisions.
- Added a regression test for sparse existing-request results.

- Hardened the snapshot payload boundary to accept only finite, plain JSON
  values, rejecting coercion/omission-prone runtime objects and cycles before
  hashing or storage.
- Hardened AI cancellation receipt replay validation to reject non-plain JSON
  response objects returned by storage before exposing or reusing them.
- Hardened account-session revocation receipts to reject sparse or otherwise
  coercion-prone session ID arrays before storage and replay.
- Hardened AI proposal apply selection validation to reject sparse operation ID
  arrays before state changes or replay.
- Hardened the AI apply receipt JSON validator to reject sparse nested arrays
  before a receipt can be applied or replayed.
- Hardened the V2 sync batch receipt JSON validator to reject sparse nested
  arrays before receipt persistence or replay.
- Hardened AI usage projection to reject sparse bucket and enabled-action data
  before calculating server-authoritative totals.
- Hardened catalog response validation to reject sparse offer, capability and
  territory arrays before displaying subscription claims.
- Hardened entitlement response validation to reject sparse rights arrays
  before exposing server-authoritative access projections.
- Hardened session revocation planning to reject sparse session records and
  replay target arrays before selecting or revoking sessions.
- Hardened Plan My Day input validation to reject sparse task ID arrays before
  creating a generation request.
- Hardened gateway DTO validation to reject sparse AI selection and sync-change
  arrays before operation admission.
- Hardened the migration runner dependency boundary so malformed stores fail
  with a bounded validation error before manifest processing or migration work.
- Hardened AI apply receipts to reject coercion-prone or oversized response
  bodies before proposal application or receipt persistence.
- Hardened V2 sync batch receipts to reject coercion-prone response bodies
  before replay validation or receipt persistence.
- Added a shared bounded plain-JSON response boundary for domain mutation
  receipts, rejecting coercion-prone replay and apply payloads consistently.
- Hardened gateway success responses to use the shared bounded plain-JSON
  boundary, rejecting runtime values that JSON serialization would coerce.
- Added a local, fail-closed Supabase deployment preflight that verifies local
  artifacts and checks without applying a migration, deploying a function or
  revealing secret values; it runs isolated PostgreSQL migration integration
  tests when an explicitly configured PGlite module is available and runs a
  Deno Edge entrypoint check when a local Deno executable is available.
- Added a regression check that preserves exact function-local Deno dependency
  pins for the deployed gateway imports.
- Made local Supabase CLI and Docker availability explicit preflight checks for
  the separate local Edge Runtime test gate; no local runtime is started.
- Added an ignored Edge environment-file boundary and Git-safe server variable
  template, with regression coverage against privileged-key placeholders.
- Corrected deployment-preflight runtime checks to cover every gateway
  configuration input, preventing an incomplete secret/policy setup from
  appearing ready.
- Added fail-closed runtime configuration-shape validation to the deployment
  preflight without logging server-side values.
- Centralized the hosted Edge variable-name contract so the server template and
  runtime preflight remain synchronized with gateway configuration.
- Included gateway configuration validation and static deployable-secret checks
  in the single local Supabase deployment preflight gate.
- Included gateway and PostgreSQL owner-authorization regression tests in the
  local Supabase deployment preflight gate.
- Included fail-closed provider/session issuance and request-session boundary
  tests in the same local preflight gate.
- Included gateway and PostgreSQL rate-limit boundary tests in the local
  Supabase deployment preflight gate.
- Included gateway request-admission, routing and entrypoint composition tests
  in the local Supabase deployment preflight gate.
- Extended isolated PostgreSQL migration coverage so every private table rejects
  direct reads from `anon` and `authenticated` roles after the complete chain.
- Extended the same local migration proof to require PostgreSQL RLS enabled on
  every private table, in addition to client-role SELECT denial.
- Extended the isolated private-table privilege proof to reject every direct
  PostgreSQL table privilege for client roles, not only SELECT grants.
- Extended the task RLS owner-isolation fixture with an unauthenticated `anon`
  read case under a test-only grant.
- Added isolated PostgreSQL proof that personal-core composite foreign keys
  reject task→goal and focus-session→task links crossing account ownership.
- Added isolated authenticated-RLS proof that a simulated owner can read only
  its own task after a transaction-local test grant; production client grants
  remain denied.
- Added a repository-wide migration regression check that requires every newly
  created `df_private` table to enable RLS and deny direct `public`, `anon` and
  `authenticated` grants, while preserving the personal-core dynamic policy
  loop.
- Moved PostgreSQL backup export and restore admission ahead of transaction
  opening, so malformed or foreign artifacts cannot consume a database
  transaction; valid restore writes remain caller-owned and atomic.
- Hardened the remote API authentication boundary so token-provider failures
  and malformed runtime dependencies fail closed without exposing storage or
  credential details.
- Hardened the remote mutation client to require UUID idempotency keys and to
  reject keys on read requests before constructing a request header.
- Hardened local premium-capability admission so an entitlement for one
  capability cannot authorize a different capability.
- Hardened the server AI planning boundary against null and array request
  containers before allowance, provider, session or apply callbacks run.
- Added pre-reservation canonical planning-request validation so malformed AI
  inputs cannot reserve allowance before being rejected.
- Hardened the Supabase provider-session boundary to reject explicitly
  anonymous claims, preserving the approved no-guest policy before app-session
  issuance or database authorization.
- Hardened account-session revocation receipt writes for concurrent retries:
  duplicate mutation IDs now re-read the frozen receipt, while a different
  request digest fails as an idempotency conflict instead of leaking a raw
  database uniqueness error.
- Hardened sync owner admission against runtime-confused account identities so
  malformed owner readers fail before the local outbox is touched.
- Hardened sync dependency admission so malformed optional owner and clock
  providers fail before local outbox access.
- Hardened remote API error handling so untrusted server error-code text is
  bounded to the documented code format before reaching client error surfaces.
- Hardened app-session bootstrap inserts for concurrent retries: a duplicate
  provider session now reuses the owner-bound registry row instead of exposing
  a raw uniqueness error or overwriting session state.
- Hardened server sync payload integrity by rejecting non-plain JSON objects
  before hashing or opening the transaction, keeping hash and wire serialization
  semantics aligned.
- Added a migration security regression that requires concrete owner-bound
  `UPDATE` policies to retain both `USING` and `WITH CHECK` predicates.
- Hardened the personal API gateway to reject non-plain JSON bodies before
  hashing or dispatch, preserving replay-hash and transport consistency.

2026-10-13: Hardened diagnostic logging against null, array and runtime type
confusion inputs before event or request-ID validation.

2026-10-13: Hardened request-session authorization against null and array
runtime inputs so malformed auth composition cannot escape as a raw exception.

2026-10-13: Hardened rate-limit admission against malformed input and counter
dependencies before constructing or issuing a shared counter request.

2026-10-13: Hardened gateway request admission against null, array and
malformed header containers before reading authentication metadata.

2026-10-13: Hardened local sync-pull application against runtime-confused
owner IDs and missing storage dependencies before page validation or writes.

2026-10-13: Hardened sync outbox orchestration against malformed store or push
dependencies before creating a shared in-flight operation.

2026-10-13: Hardened local account namespace creation against runtime-confused
account identities before opening SQLite or creating an owner namespace.

2026-10-13: Hardened the SQLite store factory against missing or malformed
database dependency functions before initialization or migration.

2026-10-13: Hardened SQLite owner namespace validation so device-local and
authenticated-account stores cannot be constructed with mismatched identities.

2026-10-14: Hardened the SQLite store factory against malformed optional clock
dependencies before initialization or migration.

2026-10-13: Hardened gateway entrypoints against malformed composition inputs
and provider/session dependency exceptions escaping the public error boundary.

2026-10-13: Hardened gateway execution against malformed runtime composition
inputs so they return a safe validation envelope before handler dispatch.

2026-10-13: Hardened gateway owner authorization against null, array and
malformed admitted-request inputs, failing closed before ownership lookups.

2026-10-13: Added a deployable-source secret-boundary test for mobile, web and
Edge code. It rejects static secret-key, database credential and private-key
literals without reading ignored environment files or changing remote settings.

2026-10-13: Hardened verified session issuance to reject null or array runtime
inputs before reading claims or opening the persistence transaction.

2026-10-13: Updated the local Edge gateway configuration to prefer Supabase's
hosted publishable-key map, fail closed for malformed key maps and retain only
explicit local/legacy fallbacks. No key values, remote settings or deployment
were changed.

2026-10-13: Hardened account bootstrap transaction composition by rejecting a
non-callable operation before opening the injected transaction boundary.

2026-10-13: Hardened account bootstrap result validation so null, array or
otherwise malformed returned rows fail closed before profile, workspace or sync
head field access.

2026-10-13: Hardened gateway profile and settings singleton reads by validating
result containers and rejecting ambiguous rows instead of trusting the first
database row.

2026-10-13: Hardened server capability admission against null/array runtime
inputs so malformed entitlement requests return a structured denial instead of
throwing an unhandled type error.

2026-10-13: Hardened sync outbox dispatch so quarantined `rejected` mutations
are never automatically resent, even if a malformed store response includes
them in the pending list; explicit recovery remains required.

2026-10-13: Hardened settings mutation response validation by requiring the
returned settings record identifier to be a UUID; malformed persistence rows
now fail closed without changing optimistic-version behavior.

2026-10-13: Added a verified-owner server-side rate limit to account bootstrap
before workspace allocation or PostgreSQL writes. Denials return a bounded
`429 RATE_LIMITED` response with `retry-after`; malformed provider claims do not
consume a bucket. Added retry, denial and owner-isolation regression coverage.

2026-10-12: Hardened AI generation completion by validating the locked job's
terminal transition receipt, including state, cleared lease fields and fence;
malformed runner results now fail closed without weakening settlement or replay rules.

2026-10-12: Hardened plan lifecycle persistence by validating profile/head/plan/reminder result containers and rejecting ambiguous singleton rows; preserved owner locks, reminder version checks and plan state transitions.

2026-10-12: Hardened local reminder persistence by validating task/session/result containers, rejecting ambiguous rows, and validating returned reminder identity and scheduling fields; also reconciled the account-bootstrap HTTP retry type boundary and Edge import annotations so repository typecheck remains clean.

2026-10-12: Hardened break-record persistence by validating session/duplicate/result containers, rejecting ambiguous rows and requiring returned timestamps to match the requested interval; preserved actual-duration validation.

2026-10-12: Hardened focus-session start and event persistence by validating task/workspace/session/event result containers and rejecting ambiguous locked or returned rows; preserved owner/version, event ordering and focused-time rules.

2026-10-12: Hardened goal contribution attribution by validating goal/session/result containers, rejecting ambiguous replay rows, validating contribution identity/version fields and rejecting malformed runner configuration; added data-integrity regression coverage.

2026-10-12: Hardened goal create, patch and delete persistence by validating workspace/result containers and rejecting ambiguous multi-row reads/returns; added malformed-result regression coverage without changing goal ownership or unit rules.

2026-10-12: Hardened task patch, delete and action persistence by validating result containers and rejecting ambiguous multi-row reads/returns; added malformed-result regression coverage without changing owner/version predicates.

2026-10-12: Added a strict mobile account-bootstrap client boundary. It sends
only an explicit display name and idempotency key, then refuses a malformed or
foreign-owner bootstrap response before local account data can use it.

2026-10-12: Hardened task creation persistence by validating workspace/goal/result containers and rejecting ambiguous multi-row task returns; added malformed-result regression coverage.

2026-10-12: Reconciled auth-session test fixtures with the idempotent session issuance contract by modeling the pre-insert registry read and preserving database-failure assertions; no production behavior was weakened.

2026-10-12: Made provider-verified app-session bootstrap retries idempotent.
An active matching server registry row is reused; revoked and expired rows are
never revived, and an account retry cannot overwrite its canonical profile or
workspace.

2026-10-12: Hardened settings updates by rejecting ambiguous multi-row `RETURNING` results instead of trusting the first row; added duplicate-result regression coverage.

2026-10-12: Hardened profile updates by rejecting ambiguous multi-row `RETURNING` results instead of trusting the first row; added duplicate-result regression coverage.

2026-10-12: Hardened account bootstrap persistence by validating PostgreSQL result containers, transaction clients and runner configuration before reading or returning profile, workspace and sync-head rows; added malformed-result coverage.

2026-10-12: Hardened AI-generation request creation by validating every PostgreSQL result container before reading rows and rejecting ambiguous insert results; added malformed-result regression coverage.

2026-10-12: Hardened privacy-job claim, complete and fail transitions by requiring returned rows to preserve the original `operation_id`, with cross-operation return regression coverage.

2026-10-12: Hardened session-revocation worker transitions by requiring returned rows to preserve the locked owner and session identity; added cross-owner return regression coverage.

2026-10-12: Added a pinned Edge-only PostgreSQL transaction runner and a
fail-closed `deep-focus-gateway` entrypoint for personal-core sync. It composes
verified provider claims, active app-session rechecks, owner-bound sync
pull/push, server-side rate limiting and serializable rollback behavior without
placing database credentials in mobile or Git configuration. Remote deployment
and migrations remain pending independent review and real runtime evidence.

2026-10-12: Added a bounded provider-verified account-bootstrap endpoint. It
accepts only an access token and display name, derives the owner server-side,
and returns safe authentication/dependency failures without accepting a client
owner ID or exposing provider details.

2026-10-12: Hardened AI-generation worker claim/renew/reconcile transitions by requiring returned jobs to retain the originally locked dispatch key; added cross-dispatch return regression coverage.

2026-10-12: Hardened snapshot-worker claim/complete/fail transitions by requiring the database-returned job to remain bound to the originally locked snapshot; added cross-snapshot return regression coverage.

2026-10-12: Hardened mutation-to-sync change writes by validating database-returned entity identity and operation in addition to owner, sequence and hash; added altered-return regression coverage.

2026-10-12: Hardened legacy sync change inserts by validating the database-returned entity identity, operation and hash, preserving the existing payload-hash replay guard; added altered-return regression coverage.

2026-10-12: Hardened AI-generation cancellation receipt writes by validating the returned outcome and complete request response before reporting cancellation; added altered-return regression coverage.

2026-10-12: Hardened V2 sync group commits by validating database-returned group metadata, per-change identity/hash fields and head privacy epoch; added altered-return regression coverage.

2026-10-12: Hardened domain mutation receipt writes by validating the complete database-returned mutation receipt, including request hash, response payload and status; added altered-return regression coverage.

2026-10-12: Hardened V2 sync batch receipt writes by validating the complete database-returned replay receipt, including request hash, response payload/status and creation timestamp; added altered-return regression coverage.

2026-10-12: Hardened AI proposal apply receipt writes by validating every database-returned receipt field, including proposal version, hashes, response payload/status, commit sequence and applied timestamp; added altered-return regression coverage.

2026-10-12: Corrected local PostgreSQL migration candidates: bootstrap migration receipts atomically with the core schema, serialize runner receipt reads with a transaction advisory lock, make legacy usage receipt addition idempotent without inventing balances, enforce revocation owner/session identity, and add missing owner/id keys required by existing foreign keys. Added isolated migration-chain regression coverage; no remote database was changed.

2026-10-12: Hardened the authenticated remote API boundary to reject blank or malformed runtime access tokens before any request is sent; added regression coverage.

2026-10-12: Hardened the personal API gateway to fail closed with `AUTH_REQUIRED` when a runtime authorization header is not a string; added malformed-header regression coverage.

2026-10-12: Hardened remote API transport errors and request-body serialization. Network failures now use a stable `DEPENDENCY_UNAVAILABLE` code and non-serializable bodies fail as `REQUEST_BODY_INVALID` before transport.

2026-10-12: Hardened migration receipt persistence by verifying the database-returned receipt matches the requested checksum, schema version and actor before reporting success.

2026-10-12: Strengthened the private-migration security regression to require an explicit `ENABLE ROW LEVEL SECURITY` clause per table instead of treating any `ALTER TABLE` statement as RLS evidence.

2026-10-12: Added regression coverage for the server authorization adapter's AI-plan ownership table mapping; all allowlisted resource kinds are now exercised.

2026-10-12: Hardened SQLite v2 replay validation to recompute and compare each persisted change hash, rejecting corrupted replay rows without accepting them as duplicates.

2026-10-12: Hardened account-session revocation receipt writes by validating the complete database-returned receipt, including hash, session IDs, current-session state and provider status.

2026-10-12: Hardened usage reservation and settlement writes by validating returned units, policy version, remaining units and lifecycle status, not only ownership identifiers.

2026-10-12: Hardened client Supabase project URL configuration. The app now
  accepts only HTTPS URLs with a host and no embedded credentials, query or
  fragment data; publishable-key-only client configuration remains unchanged.

2026-10-12: Hardened Google OAuth callback validation. Browser-returned
  callback URLs must now match the configured Deep Focus redirect origin and
  path before a one-time authorization code is exchanged; PKCE, cancellation
  and session checks remain unchanged.

2026-10-12: Hardened local account-sync runtime dependency admission.
Malformed session clients and owner readers now return `unavailable` before
token or network access; endpoint validation, bearer-only transport and
verified-owner sync boundaries remain unchanged.

2026-10-12: Moved PostgreSQL entitlement reader identity validation ahead of
  session and database access. Invalid owner, capability or session identities
  now fail before entitlement reads; server verification markers, grace-state
  representation and admission decisions remain unchanged.

2026-10-12: Moved PostgreSQL usage-service request validation ahead of the
transaction boundary. Malformed reserve, settle and capability-read requests
now fail before session, entitlement or allowance queries; Promise rejection
behavior, server-authoritative quota rules and replay/settlement semantics
remain unchanged.

2026-10-12: Hardened AI generation cancellation dependencies. Malformed
transaction runners and clients now fail closed before cancellation receipt,
session request or allowance state access; replay, reservation release and
terminal-timestamp preservation remain unchanged.

2026-10-12: Hardened server-authoritative AI allowance admission dependencies.
Malformed runners and transaction clients now fail closed before session,
entitlement, allowance or request/job state changes; reservation ordering,
replay handling and denial mapping remain unchanged.

2026-10-12: Hardened AI generation request creation dependencies. Malformed
request input retains its validation precedence, while valid requests with
malformed PostgreSQL clients or runners now fail closed before request/job SQL;
idempotent request replay and allowance-related fields remain unchanged.

2026-10-12: Hardened the saved Plan My Day PostgreSQL reader boundary.
Malformed transaction runners and database clients now fail closed before plan
or block queries; owner binding, typed plan validation and block ordering remain
unchanged.

2026-10-12: Hardened the server-authoritative AI proposal operation executor
boundary. Malformed transaction containers now fail closed before client or
proposal access; reviewed command allowlisting, user-selection requirements,
owner-bound appliers and sync receipts remain unchanged.

2026-10-12: Hardened PostgreSQL focus-session mutation admission. Start-session
and session-event operations now validate the client, request shape, actor and
event resource identity before SQL; owner binding, ordered events and actual
focused/paused millisecond calculations remain unchanged.

2026-10-12: Hardened PostgreSQL task-reminder mutation admission. Create,
patch and delete reminder operations now validate the client, request shape,
actor and resource identity before SQL; local-device delivery, task ownership,
version checks and tombstones remain unchanged.

2026-10-12: Hardened the PostgreSQL `recordBreak` admission boundary.
Malformed clients, outer requests and actor identities now fail closed before
session or break-record SQL; break duration calculation, terminal-session
ownership and duplicate-record handling remain unchanged.

2026-10-12: Hardened the PostgreSQL goal-contribution admission boundary.
Malformed contribution requests, including non-string runtime values, now fail
before opening a transaction; actual focused-time `ms` attribution,
session-count semantics and idempotent contribution handling remain unchanged.

2026-10-12: Hardened the PostgreSQL backup/restore adapter boundary. Invalid
runner, source or writer dependencies and malformed transaction clients now
fail closed before owner-bound export or restore callbacks can run.

2026-10-12: Hardened the PostgreSQL migration runner boundary against a
malformed transaction client. Migration callbacks now fail closed before any
receipt read, migration SQL or receipt write can run.

2026-10-12: Hardened the PostgreSQL gateway ownership lookup against a
malformed transaction client. Authorization preflight now fails closed before
an owner query can be attempted.

2026-10-12: Hardened the PostgreSQL entitlement reader against a malformed
transaction client. Session re-check and capability lookup now fail closed
before any database query can be attempted.

2026-10-12: Hardened the PostgreSQL rate-limit counter composition boundary.
Malformed runner and transaction-client dependencies now fail closed before an
atomic gateway counter query can run.

2026-10-12: Hardened the PostgreSQL usage service boundary. Reservation,
settlement and allowance reads now validate transaction clients before session
or quota access, and transaction stores reject non-callable operations before
opening a transaction.

2026-10-12: Hardened the PostgreSQL sync-change writer input boundary. Invalid
transaction clients, actor identities and mutation results now fail closed
before committed-entity reads or sync-head writes.

2026-10-12: Hardened the PostgreSQL sync gateway composition boundary. Invalid
runner, cursor-secret, time-window and request-container inputs now fail before
sync pull or commit storage access.

2026-10-12: Hardened the PostgreSQL sync-pull adapter composition boundary.
Invalid runner, session and transaction-client dependencies now fail closed
before owner-scoped change reads.

2026-10-12: Hardened the PostgreSQL sync-transaction adapter composition
boundary. Invalid runners, operations and transaction clients now fail closed
before sync reads or writes.

2026-10-12: Hardened the PostgreSQL snapshot source reader against malformed
database clients. Owner-bound snapshot reads now fail closed before the head or
entity queries can run.

2026-10-12: Hardened the PostgreSQL snapshot staging adapter. Invalid runners,
transaction clients and database result containers now fail closed before
snapshot publication or ready-state reporting.

2026-10-12: Hardened the PostgreSQL snapshot-job enqueue adapter. Invalid
runner/client dependencies and malformed insert or replay result containers
now fail closed before an idempotent job state is trusted.

2026-10-12: Hardened the PostgreSQL migration-receipt adapter. Invalid
runner/client dependencies and malformed receipt result containers now fail
closed before a migration is reported as applied or replayed.

2026-10-12: Hardened the PostgreSQL privacy-job worker adapter. Invalid
runner and transaction-client dependencies now fail closed before export or
deletion job state is read or changed.

2026-10-12: Hardened the PostgreSQL privacy download-grant adapter. Invalid
runner, request and transaction-client dependencies now fail closed before
export-job or grant state is accessed; raw token values remain outside results.

2026-10-12: Hardened the PostgreSQL app-session adapter against ambiguous
singleton session/receipt rows and non-callable transaction operations. Auth
session and revocation boundaries now fail closed before trusting duplicates.

2026-10-12: Hardened the PostgreSQL provider-revocation worker adapter and
added direct adapter coverage. Lease claim/complete/fail operations now reject
malformed runner, request, result-container, duplicate-row and returned-row
data before worker state can be trusted.

2026-10-12: Hardened the PostgreSQL account-session revocation handler
composition and request boundary. Missing runner/clock dependencies and
malformed request containers now fail before revocation transactions, while
owner-bound outbox, receipt and idempotent revoke behavior remains unchanged.

2026-10-12: Hardened authenticated account bootstrap admission. Invalid
transaction runners and workspace-ID generation now fail before persistence;
the generated workspace identity is validated once and reused through the
transaction, preserving provider-verified owner binding and retry behavior.

2026-10-12: Hardened authenticated PostgreSQL gateway runtime composition.
Provider verification, transaction, ownership and rate-limit dependencies plus
issuer/audience configuration are now rejected at the startup boundary when
malformed, before an authenticated request can reach protected handlers.

2026-10-12: Hardened V2 push orchestration dependency admission and epoch
classification. Missing server callbacks now fail as dependency errors, while
an invalid epoch reader is distinct from a valid but stale privacy epoch reset.

2026-10-12: Hardened the PostgreSQL V2 batch-receipt adapter against malformed
query results, duplicate stored rows, returned insert rows and runner/client
configuration. Replay and write receipts now fail closed before an untrusted
response can be treated as an idempotent result.

2026-10-12: Hardened the PostgreSQL V2 sync push transaction boundary against
malformed query results, stored group rows and runner configuration. Atomic
append/replay, ownership and privacy-epoch checks now fail closed before
untrusted database data can be treated as a valid sync group.

2026-10-12: Hardened the PostgreSQL V2 sync pull boundary against malformed
database result containers, rows and runner/session configuration. Pull now
fails closed before trusting incomplete groups, preserving signed-cursor,
privacy-epoch and transaction-boundary checks.

2026-10-12: Hardened the PostgreSQL snapshot source reader against unsafe
owner runtime values. Invalid owner identity now fails before any snapshot
source query while owner-bound row reads and high-water validation remain
unchanged.

2026-10-12: Hardened the PostgreSQL snapshot source reader against malformed
database result shapes and rows. Invalid adapter responses now fail as a safe
dependency error before snapshot records are materialized.

2026-10-12: Hardened the PostgreSQL consistent snapshot builder against unsafe
identity, timestamp and source high-water runtime types. Invalid build input
fails before a transaction, and malformed source metadata fails before staging.

2026-10-12: Hardened snapshot page-cursor factory admission against unsafe
owner, snapshot, expiry and secret runtime types. Invalid configuration now
fails before cursor signing.

2026-10-12: Hardened snapshot materializer admission against null, unsafe
snapshot identity and high-water runtime values. Invalid input now fails before
digest callbacks or page staging.

2026-10-12: Hardened snapshot cursor verification against null or array
verification contexts. Invalid context now fails before HMAC verification.

2026-10-12: Hardened app-session boundaries against null and array runtime
inputs. Invalid session admission, issuance and revocation requests now fail
closed without touching session storage.

2026-10-12: Hardened migration manifest admission against null and array
inputs. Invalid coordinator input now fails before reading migration files or
building receipts.

2026-10-12: Hardened backup/restore admission against malformed outer inputs,
missing callbacks and non-boolean overwrite state. Restore now cannot treat an
unknown `targetHasData` value as an empty target.

2026-10-12: Hardened the PostgreSQL gateway authorization adapter factory
against malformed transaction-runner configuration. Invalid configuration now
fails before the owner lookup boundary is exposed.

2026-10-12: Hardened the PostgreSQL mutation adapter factory against malformed
transaction runner, mutation applier and sync-writer dependencies. Invalid
configuration now fails before mutation transactions or writes are exposed.

2026-10-12: Hardened the PostgreSQL app-session guard against malformed
database-client dependencies. Invalid clients now return a safe dependency
failure before authentication queries are attempted.

2026-10-12: Hardened PostgreSQL app-session persistence adapters against
malformed runner configuration, query result containers and returned rows.
Invalid persistence dependencies now fail safely without authorizing or
mutating a session.

2026-10-12: Hardened PostgreSQL usage and entitlement adapters against
malformed runner and database-client dependencies. Invalid quota persistence
configuration now fails before reservation or settlement work.

2026-10-12: Hardened PostgreSQL entitlement reads against malformed runner
configuration and query result containers. Invalid server-authoritative
entitlement dependencies now fail before capability admission.

2026-10-12: Hardened the PostgreSQL AI proposal-apply store against malformed
runner and operation dependencies. Invalid apply configuration now fails before
the proposal confirmation transaction begins.

2026-10-12: Hardened PostgreSQL AI proposal create/load/apply persistence
against malformed runner, client and query-result dependencies. Invalid rows
now fail safely before proposal state is trusted or changed.

2026-10-12: Hardened the PostgreSQL snapshot materializer against unsafe
session, timestamp, cursor-secret, owner, job and snapshot runtime types.
Invalid scheduler/job input now fails before transaction or snapshot-build
access while session binding and consistent snapshot semantics remain unchanged.

2026-10-12: Hardened PostgreSQL snapshot staging validation against unsafe
owner, session, timestamp, page-data and cursor runtime types. Invalid input
now fails before staging writes while retry/conflict and ready-publication
semantics remain unchanged.

2026-10-12: Hardened the PostgreSQL snapshot metadata adapter against unsafe
owner, snapshot, session and clock runtime types. Invalid requests now fail
before session or metadata SQL access while bigint and ready-state checks stay
unchanged.

2026-10-12: Hardened the PostgreSQL snapshot page adapter against unsafe
owner, snapshot, session and clock runtime types. Invalid requests now fail
before session or page SQL access while stored-row integrity checks remain.

2026-10-12: Hardened PostgreSQL snapshot read handler request validation
against unsafe actor, session, snapshot and clock runtime types. Invalid input
now fails before session/storage access while owner and revoked-session checks
remain unchanged.

2026-10-12: Rechecked the local Supabase execution prerequisites. `supabase`,
`psql` and `docker` are not available in this workspace, so no real PostgreSQL
or RLS integration run was attempted; the local migration and server-boundary
candidate remains review-gated.

2026-10-12: Hardened mutation ownership/idempotency admission against unsafe
runtime actor, mutation, operation, hash and stored-receipt types. Invalid
values now fail before replay decisions or mutation execution.

2026-10-12: Hardened gateway route matching against unsafe method, path and
resource-ID runtime types. Invalid values now fail as safe 404s before route
matching or resource authorization.

2026-10-12: Hardened gateway rate-limit admission against unsafe actor and
operation runtime types. Invalid values now fail before the shared counter is
called, preserving bounded denial and retry behavior.

2026-10-12: Hardened gateway admission and domain mutation validation against
unsafe runtime identity, path, idempotency and body types. Invalid values now
fail before authorization or transaction opening; existing rate, ownership,
replay and receipt rules remain unchanged.

2026-10-12: Hardened resource, session, break and plan list cursor verification
against unsafe expected owner and clock runtime types. Invalid contexts now
fail before HMAC verification across all five list endpoints.

2026-10-12: Hardened snapshot page cursor verification against unsafe owner,
snapshot and clock runtime types. Invalid contexts now fail before HMAC
verification without changing snapshot ownership or expiry semantics.

2026-10-12: Applied the signed expected-owner and clock type guards to the
legacy V1 sync cursor verifier as well. Invalid values fail before HMAC
verification without changing V1 ownership, limit or expiry semantics.

2026-10-12: Hardened V2 signed cursor verification against unsafe expected
owner and clock runtime types. Invalid values now fail before HMAC verification
and cursor admission without changing signature, expiry or account binding.

2026-10-12: Hardened the server sync transaction boundary against unsafe
runtime page and change values. Invalid identities, cursors and change fields
now fail before transaction opening, while replay, ordering and rollback rules
remain unchanged.

2026-10-12: Hardened the server AI planning boundary against unsafe runtime
identity and clock types. Invalid values now fail with the safe validation
error before provider calls, allowance operations or confirmed-plan writes.

2026-10-12: Hardened server usage reservation and settlement against unsafe
runtime identity and period-key types. Invalid values now fail closed before
receipt/allowance reads or writes; existing quota, replay and settlement rules
remain unchanged.

2026-10-12: Hardened server capability admission against unsafe runtime input
types. Non-string actor IDs and clocks now fail closed with typed denial results
instead of allowing regex/date parsing to throw; entitlement and client-grant
boundaries remain server-authoritative.

2026-10-11: Reconciled the Copilot PR #16 security report against the current
repository. The `.env.example` values remain placeholders, and no local RLS,
session, sync, AI-apply or localization defect was confirmed by the available
evidence. The audit record now reflects the actual **1219/1219** repository
test result; live Supabase isolation, provider revocation, Android recovery,
native rendering and independent security review remain `NOT_RUN` or
`REVIEW_PENDING`.

2026-10-11: Added a local `REVIEW_PENDING` bound for sync snapshot page JSON.
Materialization, PostgreSQL staging and page reads reject payloads over 256 KiB
before digest, insert or trusted return; the additive SQL check is `NOT VALID`
and was not run against a database.

2026-10-11: Corrected the local PostgreSQL migration runner candidate so a
checksummed `BEGIN … COMMIT` migration is validated as a wrapper but only its
body is sent through the already-open transaction. Empty or nested transaction
control is rejected before SQL execution; no remote migration was run.

2026-10-11: Added an 8 MiB UTF-8 JSON payload bound to the local backup and
restore digest boundary. Oversized artifacts now fail before hashing or the
restore transaction callback; record-count and ownership checks remain intact.
No backup was uploaded or restored remotely.

2026-10-12: Added the missing local regression for an expired, otherwise
matching AI proposal. The atomic apply path rejects it before domain writes;
live provider/database expiry and duplicate-apply checks remain gated.

2026-10-12: Hardened backup restore validation order so payloads over the
10,000-record bound are rejected before canonical digest work or the restore
transaction callback.

2026-10-12: Matched the V2 batch receipt runtime guard to its SQL 256 KiB
response-body constraint. Oversized batch responses now fail before receipt
persistence instead of relying on a later database rejection.

2026-10-12: Matched the PostgreSQL V2 batch receipt adapter to the same
canonical response-body bound. Oversized stored replay rows now fail closed,
and direct adapter receipt writes cannot bypass the runtime limit. No live
database execution was performed.

2026-10-12: Hardened the PostgreSQL account-session revocation adapter's
 receipt write boundary. Duplicate session IDs, malformed boolean state and
 unknown provider-revocation states now fail before SQL; live revocation and
 provider tests remain gated.

2026-10-12: Hardened the PostgreSQL entitlement reader to reject malformed
 expiry timestamps before returning a server capability record. This remains
 a local fail-closed candidate; live entitlement/provider execution is gated.

2026-10-12: Hardened the PostgreSQL usage adapter against malformed stored
 quota state. Reservation units and allowance counters are now validated before
 settlement or admission; negative or inconsistent values cannot reach quota
 update SQL.

2026-10-12: Added runtime validation for usage settlement actions. Unknown
 actions now stop before receipt reads or quota writes; the PostgreSQL adapter
 applies the same allowlist at its direct settlement boundary.

2026-10-12: Hardened the sync payload canonicalization path so non-finite
 nested numbers are rejected instead of silently becoming JSON `null`. The
 validation and hash paths now share the same strict JSON representation.

2026-10-12: Applied the same non-finite payload rejection to the owner-bound
 sync pull response validator, so invalid stored data cannot be signed into a
 continuation response.

2026-10-12: Applied the same guard to the PostgreSQL sync pull adapter and
mapped malformed stored numeric payloads to the safe dependency error before
hash verification can leak a raw runtime exception.

2026-10-12: Applied strict numeric validation and safe hash-error mapping to
 the PostgreSQL mutation-to-sync writer. Malformed committed entity payloads
 now stop before sync insertion or raw hash exceptions.

2026-10-12: Hardened gateway mutation hashing to reject non-finite numeric
 values instead of collapsing them to JSON `null` and producing an ambiguous
 idempotency hash.

2026-10-12: Hardened Plan replication/export canonical digests and push-size
 validation to reject non-finite numbers before hashing or accepting a wire
 command.

2026-10-12: Hardened the AI proposal adapter's stored JSON validation so
 non-finite nested values cannot cross the proposal load/create boundary or
 alter replay/apply intent through JSON `null` coercion.

2026-10-12: Hardened snapshot payload bounds and retry comparison against
  non-finite numbers. Malformed numeric values now fail before storage or page
  digest comparison instead of being coerced to JSON `null`.

2026-10-12: Hardened client replay hashing and V2 batch receipt response bounds
against non-finite numbers. Such values now fail before a mutation hash or
receipt write can treat them as JSON `null`.

2026-10-12: Hardened the local SQLite snapshot canonical JSON boundary against
non-finite nested numbers. Malformed staged pages now fail before opening the
write transaction, preserving retry and recovery state.

2026-10-11: Added a local `REVIEW_PENDING` sync payload-boundary candidate.
New sync upserts are limited to 64 KiB by the database constraint and both
server pull validators; the SQL constraint is `NOT VALID` so existing rows are
not rewritten during preparation. Remote validation was not run.

The same 64 KiB guard now runs before server sync transactions or PostgreSQL
sync-change writes, so oversized payloads do not reach the insert.

2026-10-11: Added a local `REVIEW_PENDING` additive constraint and runtime guard
for core mutation receipts. New replay responses must be bounded JSON objects
of at most 256 KiB; invalid responses fail before receipt persistence so the
surrounding transaction can roll back. The SQL constraint is `NOT VALID` so
existing data is not rewritten during preparation.

The PostgreSQL replay adapter also rejects malformed hashes, non-success
statuses and oversized legacy response bodies before returning a replay.
The generic ownership/idempotency guard applies the same fail-closed checks to
stored receipts supplied by other server adapters.

2026-10-11: Added a local `REVIEW_PENDING` PostgreSQL candidate that makes
applied schema migration receipts append-only, protecting recorded migration
identity and checksums from later mutation. No remote execution or receipt
repair was performed.

2026-10-11: Added a local `REVIEW_PENDING` PostgreSQL candidate that makes AI
proposal-apply receipts and V2 batch replay receipts append-only through a
security-invoker trigger. No live AI, paid service, remote database execution
or V2 route activation was performed.

2026-10-11: Added a local `REVIEW_PENDING` PostgreSQL candidate that makes
`mutation_receipts` and `sync_changes` append-only through a security-invoker
trigger. Exact replay evidence and committed sync history cannot be rewritten
or deleted by this candidate; no remote execution or activation was performed.

2026-10-11: Added a local `REVIEW_PENDING` PostgreSQL candidate that makes the
goal-attribution ledger append-only through a security-invoker trigger. Its
owner/source/rule-version and duplicate-prevention constraints are unchanged;
no remote database execution or runtime activation was performed.

2026-10-11: Added a local `REVIEW_PENDING` PostgreSQL candidate for terminal
focus-session immutability and append-only focus events. Completed/cancelled
sessions reject later updates and event rows reject updates/deletes through
security-invoker triggers; event timestamps outside the session-to-database
time window are rejected as well. No remote database execution or runtime
activation was performed.

2026-10-11: Strengthened the review-gated safe server logger with runtime
object/type validation. Unknown fields, secret/token-shaped fields, invalid
error combinations and unsafe durations now fail closed before the sink; no
production logging sink was selected or connected.

2026-10-11: Added a review-gated PostgreSQL migration-runner adapter candidate.
It binds one validated migration to one injected transaction, verifies the SQL
checksum before execution, locks and validates existing receipts, and writes
the receipt inside the same transaction. It does not connect to a remote
project or activate production migrations.
The adapter also rejects non-transactional or destructive SQL before opening
the execution query.

2026-10-11: Expanded the review-gated account sync coordinator evidence for
failure recovery. A pull-apply failure cannot start an outbox push, and a push
failure does not undo an already committed pull page or acknowledge pending
outbox work. Account-switch checks remain enforced around each boundary.

2026-10-11: Strengthened the review-gated backup/restore digest boundary to
reject values that are not safely representable as JSON, including non-finite
numbers, undefined values, bigint values and custom objects. Canonical digest
behaviour for valid JSON data is unchanged.

2026-10-11: Added a local composition regression for the provider-verified
claims adapter and the app-session request boundary. It confirms that verified
claims still pass issuer, audience, expiry and owner/session registry checks;
real Supabase Auth execution remains gated.

2026-10-11: Strengthened server-authoritative usage reservations so the
allowance policy version must match the active entitlement policy version.
Mismatched or stale allowance rows now fail closed before a reservation grant.

2026-10-11: Prevented a replayed reserved usage receipt from making a second
provider call. Without a durable provider-status lookup, the execution helper
now returns `reservation_in_progress` and leaves settlement unchanged for
explicit reconciliation.

2026-10-11: Hardened gateway rate-limit admission to reject negative clock
 values before reaching the shared counter. This keeps fixed-window keys from
 being derived from invalid timestamps.

2026-10-11: Added a review-gated V2 push-envelope admission candidate. It
enforces the versioned positive privacy epoch, 1–25 unique mutation IDs, the
65,536-byte UTF-8 envelope limit, target identity for create/action commands,
and routes all fourteen existing command bodies through their current DTO
validators before any future execution. Plan commands reuse the canonical
plan validator; V1 `/v1/sync` and live routes remain unchanged.

2026-10-11: Added a review-gated V2 push orchestration candidate. It derives
the owner only from trusted server context, checks the privacy epoch before
the batch and before every item, preserves item order, validates executor
identity and receipts, and returns safe per-item rejected/retryable outcomes.
An epoch change stops later execution and marks remaining items for reset;
the route and database transaction wiring remain disabled.

2026-10-11: Added a review-gated HTTP-shaped V2 push handler candidate. It
reuses the common JSON size, content-type and batch idempotency admission,
then wraps execution in the batch-receipt contract so exact retries replay and
changed request bodies conflict before execution. It returns the versioned
response or safe public errors, is not registered in the live router, and still
requires authenticated runtime and receipt-store integration review.

2026-10-11: Added a review-gated V2 batch receipt contract. It binds the batch
idempotency key and request hash to the verified owner, replays exact retries,
rejects changed intent, and propagates receipt-save failures so a batch is not
reported successful without durable replay evidence. The real PostgreSQL
receipt migration/adapter and route integration remain pending review.

2026-10-11: Added the review-gated `sync_v2_batch_receipts` PostgreSQL
migration candidate. It uses an owner-plus-batch primary key, bounded object
responses, fixed success status, RLS and service-only select/insert grants;
it is additive, does not replace per-item receipts, and has not been run on a
remote database.

2026-10-11: Added the review-gated PostgreSQL V2 batch-receipt adapter
candidate. It locks owner-scoped receipt reads, validates stored identities and
response shapes, inserts parameterized receipts, and verifies returned owner
and batch identities. The database client and transaction runner remain
injected; no remote connection is created.

2026-10-11: Added a review-gated v2 plan-sync schema candidate with separate
owner-bound heads/privacy epochs, transaction-group commitments and changes that
support plan upserts and null delete tombstones. Added a local transaction
adapter candidate with exact replay/conflict checks and atomic head advancement.
Current v1 sync tables and client grants are unchanged; live activation remains
review-pending.

2026-10-11: Added a review-gated v2 pull-reader candidate. It returns only
complete owner-bound transaction groups, verifies ordered boundaries, per-change
hashes and group digests, and fails closed on stale epochs or partial groups.
It remains separate from the current v1 pull route and live capability activation.

2026-10-11: Added the review-gated v2 pull cursor candidate. The HMAC cursor
binds owner, protocol, privacy epoch, limit, high-water and expiry, and the
page reader emits a continuation only after verified group reads. The v1 cursor
contract is unchanged.

2026-10-11: Added the review-gated local v2 pull-apply boundary. It validates
complete transaction groups and their digest before one atomic SQLite
page-and-cursor callback, preserving retryability when storage fails.

2026-10-11: Added an isolated, review-gated V2 SQLite storage candidate for
durable pull state, transaction groups and changes. Real `node:sqlite` checks
cover replay, owner isolation, rollback and retry; main app schema wiring stays
pending its separate migration review.

2026-10-11: Added a review-gated `PATCH /v1/plans/{id}` boundary. It validates
the canonical editable plan identity, owner route and idempotency key, then
delegates only to an explicit mutation candidate. Plan writes remain separate
from the current v1 sync writer pending the reviewed v2 protocol.

2026-10-11: Added a review-gated `POST /v1/plans/{id}/actions` gateway
boundary. It validates archive/restore/delete commands, checks route-plan
ownership and idempotency, and only delegates to an explicitly supplied
mutation candidate; an unconfigured candidate fails closed.

2026-10-11: Corrected the review-gated `plan.edit` validator to accept the
canonical editable `PlanCreate` payload instead of requiring persisted
`SavedPlan` metadata. Added exact task-version and reminder-action validation,
including duplicate and unknown-field rejection, schedule-window and block-graph
checks; export/read validation remains unchanged.

2026-10-11: Added a review-gated owner-bound `GET /v1/plans` discovery candidate.
It excludes deleted plan tombstones, hydrates canonical plans through the same
validated reader as the single-plan route, and signs cursors with owner, limit
and expiry binding. It is not enabled in the current v1 sync feed.

2026-10-11: Added a review-gated plans-export restore verifier. It checks
page/manifest SHA-256 digests, sequential pages, UUID ordering, counts and
canonical plan shapes before returning restored records; corrupted or partial
exports fail closed.

2026-10-11: Added a review-gated plan action idempotency candidate on the
existing domain receipt boundary. Identical retries replay the stored result
without plan/reminder writes; changed intent under the same key is rejected.
It is not registered in the current v1 sync gateway.

2026-10-11: Added a review-gated PostgreSQL Plan lifecycle adapter. It locks
the active owner/head, validates current plan and reminder versions, updates
reminders and archive/restore/delete state in one injected transaction, and
stores a read-suppressed delete tombstone. Remote execution remains disabled.

2026-10-11: Added a review-gated Plan My Day lifecycle command candidate. It
validates archive/restore/delete transitions, exact reminder versions and
stale/deleted plan handling; restore never re-enables reminders and delete
returns a non-resurrectable tombstone decision without performing SQL writes.

2026-10-11: Added a review-gated PL-02 plan replication/export wire candidate.
It validates version 2 plan commands and transaction-group digests and builds
bounded deterministic plans-only export pages, without modifying the current
v1 sync feed or enabling live export/snapshot delivery.

2026-10-11: Added a review-gated `GET /v1/plans/{id}` candidate. It requires
`Plan-Contract-Version: 2`, rechecks the active app session, authorizes the
verified owner, returns canonical `SavedPlan` plus bound reminders, and fails
closed on mismatched bindings. It remains outside sync/export/deletion activation.

2026-10-11: Reconciled the review-gated Plan My Day PostgreSQL candidate with
the canonical SavedPlan contract: owner workspace and local date are persisted,
state is `active|archived`, explanations use the bounded nullable shape, and
the read mapping rejects non-canonical rows before any future gateway wiring.

2026-10-11: Added a review-gated owner-bound Plan My Day read candidate. It
loads only one verified owner's plan and typed blocks, returns `null` for a
missing plan, and fails closed for foreign, malformed, duplicate, overlapping
or out-of-window rows. It is not wired to a public route or sync feed.

2026-10-11: Added a review-gated Plan My Day persistence schema candidate.
It stores owner-bound v2 plan metadata and typed focus/break blocks with
composite ownership, proposal/request/task/reminder relationships and private
server-only access. It deliberately does not add plans to the current sync
feed, export path or client grants until the documented capability gate closes.

2026-10-11: AI completion now treats a late callback for an already terminal
request as a read-only replay. It does not settle usage, create a proposal,
rewrite terminal timestamps or clear another worker's lease. This preserves
the cancellation/completion exactly-once boundary while the adapter remains
review-gated and local-only.

2026-10-11: Added a local PostgreSQL AI completion adapter candidate. It locks
the owner-bound request and fenced job, validates the proposal identity,
settles the reserved action, updates the terminal request and clears the job
lease in one injected transaction. The adapter fails closed on stale fences,
foreign proposals and malformed stored rows; provider wiring, live execution
and independent review remain gated.

2026-10-11: Added a review-gated pure AI completion transition. A result is
accepted only for a pending request with a live matching worker fence and
server deadline; success exposes only an owner-bound v2 proposal reference and
one consume settlement, while failure releases the hold with a safe error code.
Terminal, stale, expired and malformed outcomes fail closed. The PostgreSQL
publication/settlement wiring remains isolated until transaction and
independent-review gates pass.

2026-10-11: Added a local PostgreSQL AI admission candidate that keeps session
recheck, allowance reservation, generation request and queued job admission in
one transaction. It refuses to repair a pending request with a missing
reservation receipt, maps allowance denial to safe public errors, and remains
isolated from the HTTP route until provider and policy gates are reviewed.

2026-10-11: Strengthened AI generation request replay integrity. A pending
request retry now requires the same owner-bound reservation identity and
dispatch identity; changed values return an idempotency conflict before public
status recovery. This prevents a retry from silently attaching a different
allowance receipt or queued job to an existing request.

2026-10-11: Added strict admission for `POST /v1/ai/plan-my-day`. The route
validates the canonical bounded request, rechecks the authenticated app
session, and fails closed with `POLICY_UNCONFIGURED` until the reviewed
reservation/request/job transaction and provider policy are configured. It
does not create a request or charge an allowance while those gates are open.
Focused route checks and the full regression suite pass.

2026-10-11: Connected the owner-bound `POST /v1/ai/requests/{requestId}/cancel`
route to the local PostgreSQL cancellation candidate. The route requires an
exact empty JSON body and preserves server-derived request ownership. Terminal
or already-cancelled retries now record their outcome without rewriting the
terminal request or refunding usage. Focused cancellation and route checks
pass; live Supabase execution, RLS/concurrency evidence and independent review
remain pending.

2026-10-11: Added a local candidate PostgreSQL AI-proposal create adapter. It
validates ready, unexpired owner-bound proposals, uses the owner/request/version
unique key for duplicate-safe replay, and rejects changed replays. Raw provider
prompts are not persisted. Live database execution and independent security
review remain pending.

2026-10-11: AI-proposal duplicate replay comparison now uses canonical JSON
object ordering, so PostgreSQL `jsonb` key normalization cannot turn an
identical request into a false conflict.

2026-10-11: Added a server-only Plan My Day generation-input validator. It
enforces the canonical exact fields, UUID uniqueness, UTC millisecond instants,
bounded availability, real IANA time zones and explicit integer preferences;
authorization, provider selection and generation remain separate gates.

2026-10-11: Added strict validation for the canonical Plan My Day request
status response. Pending, completed, failed and cancelled states enforce their
exact result and allowance counters, while raw provider and worker metadata are
rejected at the public boundary.

2026-10-11: Added a local REVIEW_PENDING PostgreSQL candidate migration for
owner-bound Plan My Day request and fenced job state. It protects lifecycle
accounting, reservation/proposal relationships, client-role access and
deduplication metadata without choosing unresolved provider, deadline, retry or
retention policy values.

2026-10-11: Added a local owner-bound AI generation status reader. It selects
only the public lifecycle DTO columns, hides input/provider/worker details,
returns no fabricated state for missing requests and fails closed on foreign or
malformed rows.

2026-10-11: Connected the owner-bound AI generation status reader to the local
candidate `GET /v1/ai/requests/{requestId}` gateway route. The route remains
bodyless and session-checked, returns only the public status DTO, and preserves
not-found behavior for missing or foreign requests. Live Supabase execution and
independent security review remain pending.

2026-10-11: Added a local candidate PostgreSQL AI-generation request creator.
It creates the owner-bound request and queued job in one transaction only after
the caller supplies an already-authorized reservation, server-selected
deadline, intent digest and dispatch identity. Same-intent retries replay the
existing status without a second job; changed intent, missing jobs and malformed
input fail closed. Provider execution, allowance policy and live migration
remain review-gated.

2026-10-11: Added a local AI generation worker state machine for queued,
running and reconciling jobs. Claims increment a fencing value, expired leases
can be reclaimed, only the current lease can renew or enter reconciliation, and
provider errors stay allowlisted. The migration's unresolved terminal-job and
retry policy decisions remain isolated rather than being invented.

2026-10-11: Added the local PostgreSQL AI-generation worker adapter. It binds
claim, renewal and reconciliation updates to owner/request identity and the
current fence, normalizes bounded PostgreSQL counters, and fails closed when an
update is not acknowledged or a returned row is foreign/malformed. No provider
I/O or terminal request settlement is included.

2026-10-11: Added the local AI generation cancellation transition. Pending
requests become cancelled once, advance their version and release exactly the
reserved action; cancelled requests replay without another release, while
completed or failed requests remain terminal without an implicit refund. The
database receipt and usage-settlement adapter remains a separate review-gated
slice.

2026-10-11: Added the local PostgreSQL AI-generation cancellation adapter. It
locks the owner-bound request, releases exactly one reserved AI action when
pending, commits the cancellation state and writes the durable response receipt
in one transaction. Matching retries replay without writes; foreign rows and
unacknowledged updates fail closed. Live execution remains review-gated.

2026-10-11: Added a local REVIEW_PENDING migration candidate for AI generation
cancellation receipts. It binds each response to the owner, request and
idempotency mutation, constrains outcomes and response shape, prevents a second
receipt for one request, and denies direct client roles. Remote execution and
the request/usage settlement transaction remain gated.

2026-10-11: Added the local candidate `/v1/auth/sign-out` gateway route. It
requires an exact empty body, binds revocation to the verified current session,
and fails closed unless the backend confirms that session was revoked. Live
Supabase execution and independent security review remain pending.

2026-10-11: Added schema-safety contract coverage for the additive sync-change
hash and usage-receipt decision migrations. Tests require bounded nullable
columns, preserve legacy NULL rows, and reject destructive/backfill SQL.

2026-10-11: Normalized the PostgreSQL `bigint` sequence returned by a newly
inserted focus event before comparing it with the client sequence. Valid event
writes no longer fail because the driver returned a decimal string.

2026-10-11: Normalized PostgreSQL `bigint` fencing versions in sync-snapshot
and privacy-job worker adapters. Valid lease fencing now works with driver
strings while malformed or unsafe versions fail closed.

2026-10-11: PostgreSQL sync pull now verifies each stored change hash before
serving it to the client. Tampered private change payloads fail closed at the
read boundary instead of entering local recovery or mirror state.

2026-10-11: Sync transaction replays now recompute and verify the stored
change hash against the stored payload before accepting a replay. A tampered
private sync row fails closed instead of being treated as valid history.

2026-10-11: Normalized PostgreSQL `bigint` values in committed sync-change
payloads for goals, sessions and breaks. Sync hashes now cover the bounded
numeric contract rather than driver-specific string representations.

2026-10-11: Normalized PostgreSQL `bigint` fields while building cloud sync
snapshots. Goal targets, session durations/sequences and break durations now
enter snapshot payloads as bounded safe integers; unsafe values abort the
snapshot read instead of contaminating the local mirror.

2026-10-11: Normalized PostgreSQL `bigint` goal target values in gateway read
DTOs. Malformed targets now fail closed instead of exposing driver strings or
invalid goal data to the client.

2026-10-11: Normalized PostgreSQL `bigint` timer values in session and break
history read DTOs. Unsafe, malformed or out-of-range durations now fail closed
instead of leaking driver strings into the API contract.

2026-10-11: Normalized PostgreSQL `bigint` timer totals and event sequence
values in the session-event adapter. Malformed storage values now fail closed
before an event insert, while valid driver strings preserve timer arithmetic.

2026-10-11: Normalized PostgreSQL `bigint` break durations at the
`recordBreak` boundary and verified returned planned/actual durations and
outcome before exposing the record. Mismatched storage now fails closed.

2026-10-11: Normalized PostgreSQL `bigint` strings at the goal-attribution
boundary. Focused milliseconds and stored contribution values now remain
safe integers before comparison or return, preserving idempotency checks
against real PostgreSQL driver results.

2026-10-11: Made snapshot page retry comparison canonical across JSON object
key order. This prevents PostgreSQL `jsonb` normalization from turning an
identical page into a false idempotency conflict; array order remains strict.

2026-10-11: Hardened sync-snapshot job response validation so a non-failed job
cannot carry a safe error code at the adapter boundary. Added malformed-row
coverage without changing the migration or remote schema.

2026-10-11: Closed the sync-snapshot enqueue idempotency gap. Reusing an
operation key with a different job or snapshot identity now returns
`IDEMPOTENCY_CONFLICT`; exact-intent retries still replay the existing job.

2026-10-11: Hardened the session-revocation worker adapter with pre-query
validation for revocation/lease identity, timestamps, retry bounds and safe
provider codes. Returned rows must also retain the requested revocation ID;
negative regression tests cover both boundaries.

2026-10-11: Hardened the privacy-job PostgreSQL adapter so claim, completion
and failure transitions reject a foreign owner/job row returned by storage.
Added a regression test; no remote database or privacy provider was contacted.

2026-10-11: Hardened sync-snapshot worker persistence against a foreign row
returned by a claimed owner query. Claim, completion and failure transitions
now re-check the requested owner/job identity at the adapter boundary, with a
negative regression test; no remote database was contacted.

2026-10-11: Closed the session-revocation outbox partial-lease gap. The
schema, worker state machine and PostgreSQL adapter now require `lease_id` and
`lease_until` to appear together, while malformed rows fail closed. Added
regression and migration-contract coverage; live Supabase execution remains
`REVIEW_PENDING`.

2026-10-11: Connected the verified session-owner boundary to the native auth
provider flow. A session now opens the local account namespace only after a
provider-verified subject matches the session user, with a secure offline
binding fallback and stale-auth-event fences covering provider, cleanup and
session-restore failure paths. Mismatches fail closed and do not claim account
access. Added five regression tests; live Supabase Auth,
RLS, restart and device evidence remain `REVIEW_PENDING` / `NOT_RUN`.

2026-10-11: Added an explicit local account-sync runtime composition. It reads
only the configured public API endpoint and the current provider access token,
keeps owner binding in the verified local boundary, and remains inert without
both dependencies. Unsafe endpoints and invalid owner IDs fail before token
access. It is not activated at startup and does not claim live cloud-sync
evidence.

2026-10-11: Added a snapshot-restore regression check proving deletion
tombstones retain `payload: null` and cannot recreate a deleted remote entity.
This remains local recovery evidence; installed backup/restore and provider
retention verification are still pending.

2026-10-11: Added a repository-wide migration security regression check for
unsafe `auth.role()` and user-editable metadata authorization, public
`SECURITY DEFINER` code and client-role grants. It is static SQL evidence only;
live PostgreSQL/RLS behavior remains pending.

2026-10-11: Added a source scan that rejects server-secret identifiers from the
public mobile and web source trees. Test fixtures, documentation and dependency
folders are excluded; runtime secret custody and built-artifact review remain
pending.

2026-10-11: Added an inert account-sync composition boundary that connects a
verified owner callback, owner-scoped local outbox, bearer-token provider and
remote pusher only when an endpoint is explicitly configured. Missing owner or
endpoint performs no network call. It remains a local `REVIEW_PENDING`
candidate and is not activated from app startup.

2026-10-11: Added an optional authenticated-owner binding to local outbox sync.
If the account changes before or during the remote push, the batch is not sent
or its response applied to local acknowledgement/rejection state; the old
outbox remains pending for recovery. Account-switch regression tests cover both
timing windows. This is still a local candidate and not live sync evidence.

2026-10-11: Strengthened the local migration manifest guard to reject schema,
table, type and column drops, truncate variants and `ALTER TABLE ... DROP
COLUMN` before opening a transaction. Existing constraint-replacement
migrations, ownership clauses and RLS delete policies remain valid; focused
manifest tests cover the new rejection cases. This remains a local candidate
and no remote SQL was executed.

2026-10-11: Added the EX-27 local revocation-receipt candidate. Request hash,
mutation ID and the original owned target session IDs are stored in one
transaction before reporting success, so an exact replay cannot include a
session created later and a changed replay is rejected. Duplicate session rows
and receipt-write failures fail closed. Added the server-only receipt migration
and recovery tests; remote SQL execution and independent security review remain
`REVIEW_PENDING`.

2026-10-11: Added strict gateway validation for the EX-27 revocation result.
Malformed counts, current-session flags or provider-revocation states now fail
closed instead of being returned as a successful response.

2026-10-11: EX-27 gateway admission now requires an explicit recent-auth
verifier before invoking the revocation dependency. A missing verifier remains
dependency-unavailable, and a failed verification returns `AUTH_REQUIRED`.

2026-10-11: Added a local PostgreSQL EX-27 handler composition candidate. It
revalidates the admitted request shape, freezes and revokes owner sessions in
one transaction, queues provider work and returns only the bounded revocation
projection. It is not wired to a remote project or provider credentials.

2026-10-11: Gateway handler composition now selects that local EX-27 candidate
only when both an explicit recent-auth verifier and a local time source exist;
otherwise it remains dependency-unavailable. This keeps the route fail-closed
without silently inventing an authentication policy.

2026-10-11: Added a local versioned migration coordinator. It validates the
complete manifest before opening a transaction, applies ordered SQL through a
caller-supplied transaction, records receipts only after success, replays exact
receipts and permits safe retry after failure. It does not execute remote SQL.

2026-10-11: Connected the confirmed AI apply route to a local PostgreSQL
executor for the canonical first-slice task-create, task-patch and
reminder-create commands. It reuses owner-bound domain appliers and sync-change
writing, rejects unsupported commands before writes, and remains a local
candidate pending live database and independent security review.

2026-10-11: Added the EX-31 AI usage route. Until an owner-approved source
allocation policy exists, it rechecks the authenticated session and returns an
explicit unconfigured state instead of fabricating allowance or price claims.

2026-10-11: Added authenticated EX-28 entitlement and EX-29 catalog visibility
routes. They return canonical unavailable responses until provider, pricing and
entitlement policy decisions are configured; no rights or offers are invented.

2026-10-11: Added strict EX-27 account-session revoke route admission for
`one`, `others` and `all` scopes. The handler remains fail-closed until
recent-auth and durable replay/frozen-target persistence are wired.

2026-10-11: Added a local migration manifest builder. It validates ordered
filename IDs, transaction markers and non-destructive SQL, then computes exact
SHA-256 receipts without executing or writing any migration.

2026-10-11: Added the local PostgreSQL migration-receipt adapter. It records
validated migration identity/checksum/version rows transactionally, replays an
exact match, and rejects a checksum/version/authority mismatch. It does not
run migrations or connect to a remote project.

2026-10-11: Added a local versioned migration-receipt candidate. It records
the migration identity, SHA-256 checksum, schema version and approved runner
authority behind service-role-only access; it does not execute or apply SQL.

2026-10-11: Added a non-destructive sync-snapshot retention planner. It binds
expiry actions to one owner, rejects duplicates/foreign rows and requires an
explicit caller-supplied cutoff; it never deletes or updates database rows.

2026-10-11: Added a local server-only safe logging boundary. It allowlists
operational event fields, requires safe error codes for failures, rejects raw
messages/payloads/secrets and bounds request IDs and durations. It does not
configure a production log sink.

2026-10-11: Added the local PostgreSQL snapshot job executor composition.
It requires scheduler-supplied session and expiry context, claims through the
fenced worker adapter, and delegates materialization/retry to existing bounded
boundaries. It does not start a scheduler or connect to a remote project.

2026-10-11: Added the local snapshot materializer composition. A scheduler
must provide the verified app-session binding and immutable build window; the
materializer then combines the owner-bound source reader with the repeatable-
read builder without selecting credentials or remote connections.

2026-10-11: Added the local owner-bound sync snapshot source reader. It reads
the approved personal tables through the caller's transaction, validates the
sync high-water mark and row identity/version, preserves deletion tombstones,
and excludes credentials and unapproved tables. Remote execution remains
review-pending.

2026-10-11: Added the local snapshot worker runner. It claims one fenced job,
passes only verified owner/job/snapshot identity to an injected materializer,
completes on success and schedules bounded safe retries on failure. It never
selects source tables or credentials by itself.

2026-10-11: Added the local PostgreSQL snapshot-worker adapter. Claim,
complete and retry transitions now use owner/job predicates, `FOR UPDATE` and
fencing-version checks, while malformed rows fail closed before publication.
No remote database connection was made.

2026-10-11: Added the local sync snapshot lease/fencing state machine. It
supports due/expired-lease claims, stale-worker rejection, terminal success and
bounded retries. Transient failures do not violate the migration rule that
`safe_error_code` belongs only to terminal failed jobs; raw provider errors are
never stored.

2026-10-11: Added a local consistent-snapshot builder boundary. Source reads,
materialization and page staging now share one `REPEATABLE READ` transaction
and the same database client; invalid input or source failure cannot publish a
partial snapshot. Job claim/retry policy and real source-table reader remain
separate review-pending work.

2026-10-11: Added the local EX-14 sync snapshot request foundation. The new
`sync_snapshot_jobs` migration and owner/idempotent adapter reserve a job and
snapshot identity, while `POST /v1/sync/snapshots` returns only a coarse HTTP
202 response. No pages are marked ready and no worker or remote migration is
enabled; materialization remains separately gated.

2026-10-11: Connected existing owner-bound snapshot metadata and signed-page
readers to the local gateway at `GET /v1/sync/snapshots/{id}` and
`GET /v1/sync/snapshots/{id}/pages?cursor=...`. Snapshot pages now require an
explicit cursor and reject extra query fields; ownership, expiry and session
checks remain server-side. Snapshot creation/remote execution is not enabled.

2026-10-11: Connected the existing owner-bound sync pull/commit candidates to
the local gateway at `GET /v1/sync/pull` and `POST /v1/sync/push`. Requests now
use strict bounded DTOs, verified app-session rechecks, signed cursor binding,
ordered replay/conflict handling and no client-supplied owner field. The sync
gateway is still a local `REVIEW_PENDING` candidate; no remote database or
deployment was touched.

2026-10-11: Added the reviewed-configuration recent-auth gate and required it
before export download-grant database access. Stale, future or malformed auth
evidence fails closed; no fixed TTL was invented.

2026-10-11: Connected the local EX-21 gateway candidate at
`POST /v1/privacy/exports`. It admits only the exact own-account JSON request,
requires the existing authenticated session and UUID idempotency key, and
returns a coarse HTTP 202 queued response. Artifact creation and download stay
disabled pending the privacy delivery review.

2026-10-11: Added the EX-23 private export download-grant candidate. It
requires a succeeded, owned and unexpired export job, stores only a SHA-256
token digest, and replays an existing unexpired grant without silently
extending it. No download URL, raw token or live storage access is enabled.

2026-10-11: Added the EX-21 export-job enqueue foundation. It creates an
owner-bound queued job with validated UUID/time input and replays an existing
job for the same owner/operation instead of creating duplicates. Export
materialization, download tokens and live database execution remain pending.

2026-10-11: Added the EX-22 privacy-job status read candidate at
`GET /v1/privacy/jobs/{id}`. It rechecks the authenticated app session,
binds the query to the verified owner and returns only the validated coarse
status DTO; private artifact locators and foreign-job existence are hidden.
Live database/RLS and device verification remain pending.

2026-10-11: Added the local PostgreSQL privacy-job adapter candidate. It uses
owner and lease predicates for fenced claim/complete/retry transitions and
fails closed on malformed rows; no remote database was contacted.

2026-10-11: Added the local privacy-job lease/fencing worker state machine.
It supports injected retry policy, safe errors, expired-lease recovery and
stale-worker rejection without connecting to a provider or production queue.

2026-10-11: Added the local `privacy_jobs` migration candidate for EX-21–25.
It adds owner-scoped operation identity, lease fencing, retry state, safe error
codes and private artifact metadata with RLS and no public table grants. The
migration was not applied remotely.

2026-10-11: Added the EX-25 deletion-confirmation request validation
foundation. It accepts only the account-bound challenge and acknowledged
consequences version, without freezing accounts or starting deletion.

2026-10-11: Added the EX-24 deletion-challenge response validation foundation.
It bounds the challenge/job IDs and receipt lifetime without generating a
credential, freezing an account or starting deletion.

2026-10-11: Added the EX-23 export download-grant validation foundation. It
requires an empty request, a future expiry and an HTTPS artifact URL on a
configured allowlist, while leaving credential issuance and storage integration
pending.

2026-10-11: Added the EX-21/EX-22 privacy request and coarse job-response
validation foundation. Export scope is restricted to own-account JSON data and
job responses cannot expose raw locators or unsafe error details. No export or
deletion operation is executed by this slice.

2026-10-11: Added the EX-30 management-link validation foundation. It rejects
unsafe or unallowlisted destinations, credentials, unexpected ports and
redirect chains without selecting a billing provider or performing a live
management action.

2026-10-11: Added the EX-29 catalog-response validation foundation. It keeps
unconfigured or unavailable billing explicit, validates bounded server-shaped
offers and price freshness metadata, and does not select a provider or invent
prices.

2026-10-11: Replaced the real development project URL and publishable client
key in `.env.example` with placeholders. Local development values remain
outside the example file, and the publishable key is not treated as a secret.

2026-10-11: Added the EX-28 canonical entitlement-response validator. It
rejects fabricated unavailable rights and validates server-shaped grant,
scope, state, source and timestamp fields. Existing local entitlement data is
not mapped into billing rights until the canonical provider mapping is defined.

2026-10-11: Added the local EX-33 owner-bound AI proposal read candidate.
Missing/foreign proposals remain private, ready proposals expire explicitly,
and applied proposals expose only their reviewed state. Provider execution and
apply integration remain `REVIEW_PENDING`.

2026-10-11: Added the EX-31 server-authoritative AI usage projection
foundation. It aggregates validated server allowance buckets and fails closed
for unconfigured/unavailable state without exposing client grants, prices or
provider details. Live entitlement storage and independent review remain
`REVIEW_PENDING`.

2026-10-11: Added an EX-18 reward-projection validation foundation. It fails
closed on unavailable projections that fabricate zero values and validates
freshness metadata, safe counts, streak consistency, dates and IANA timezones
without inventing an XP, level or achievement policy. Trusted ledger and live
RLS work remain `REVIEW_PENDING`.

2026-10-11: Added the local EX-17 `GET /v1/analytics/summary` candidate with
strict period query admission, an explicit reviewed maximum range, owner-bound
completed-session/task totals, sync source sequence and projection metadata.
Missing range policy fails closed. Live RLS/freshness evidence and independent
review remain `REVIEW_PENDING`/`NOT_RUN`.

- 2026-10-11: Added a local `EX-26` account-session list candidate with owner-bound signed pagination, current-session marking, fail-closed row validation and focused **29/29 PASS** verification. Live Supabase/RLS, device and independent review remain `REVIEW_PENDING` / `NOT_RUN`; no remote migration or deployment.
- 2026-10-11: Aligned the local EX-27 target-session query with the canonical `(issued_at DESC, session_id DESC)` deterministic lock order. Recent-auth policy and revoke route remain `REVIEW_PENDING`.
- 2026-10-11: Added a local provider-revocation worker runner that binds claim, opaque provider identity, fenced completion and safe retry/error mapping. Focused runner tests **12/12 PASS**; live provider execution remains `REVIEW_PENDING`.
- 2026-10-11: Added a bounded PostgreSQL outbox `listDue` candidate with stable ordering for pending and expired processing jobs. Scheduler/runtime execution remains `REVIEW_PENDING`.
- 2026-10-11: Added a bounded local revocation batch coordinator over the due-job snapshot and fenced runner. It has no deployment scheduler or provider credentials; runtime scheduling remains `REVIEW_PENDING`.
- 2026-10-11: Strengthened the PostgreSQL revocation worker adapter to fail closed on malformed UUIDs, states, timestamps, leases and provider error codes before returning due jobs.
- 2026-10-11: Added a batch-coordinator regression test proving a store transition failure is surfaced rather than reported as a false revocation success.
- 2026-10-11: Fixed revocation runner error boundaries so provider failures retry, while completion-store failures propagate and cannot be misreported as provider failures.
- 2026-10-11: Added the owner-bound `GET /v1/breaks` history candidate with signed descending pagination, typed row validation and fail-closed malformed-row handling.
- 2026-10-11: Added the EX-17 analytics query validation foundation: exact fields, valid IANA timezone, positive half-open range and explicit caller-supplied maximum range; no analytics route or freshness claim added yet.
- Session-revocation outbox සඳහා lease/fencing worker state machine candidate එකක්
  එකතු කළා. Expired lease reclaim, stale completion rejection, bounded retry සහ
  safe error-code validation පරීක්ෂා කරයි. Worker/provider runtime තවම
  `REVIEW_PENDING / NOT_RUN`. Worker state checks **5/5 PASS** සහ PostgreSQL
  adapter checks **3/3 PASS**.
- Account-session revocation සඳහා owner-bound `one / others / all` planner සහ
  transaction candidate එකතු කළා. Expired/revoked/foreign sessions තෝරා නොගනී;
  provider-revocation outbox එක සාර්ථකව enqueue නොවුණොත් registry write නොකර
  fail වේ. Owner-scoped PostgreSQL adapter candidate එකත් එකතු කළා. Focused
  checks **5/5 PASS**. Public endpoint, real PostgreSQL/RLS,
  provider worker සහ recent-auth policy wiring තවම `REVIEW_PENDING / NOT_RUN`.
- Focus-time goal progress සඳහා owner-bound append-only contribution ledger
  migration සහ PostgreSQL candidate applier එකතු කළා. Cancelled session එකකත්
  සත්‍ය `focused_ms` පමණක් ගනී; goal period, owner, status, duplicate replay සහ
  history conflict පරීක්ෂා කරයි. Task-completion reward formula එක මෙයට ඇතුළත්
  කළේ නැහැ. Focus contribution checks **5/5 PASS**; full suite count update
  evidence එකේ ඇත. සැබෑ PostgreSQL/RLS සහ independent review තවම
  `REVIEW_PENDING / NOT_RUN`. Full repository suite after this slice **757/757
  PASS**.
- Goal progress සඳහා owner/session-bound read handler එකක් එකතු කළා. Ledger එකෙන්
  පමණක් `currentValue` සහ `contributionCount` ගණනය කර, goal period/type,
  source sequence සහ rule version response එකට බැඳේ. Focused route, read-handler
  සහ contribution checks **11/11 PASS**. සැබෑ PostgreSQL/RLS සහ independent
  data review තවම `REVIEW_PENDING / NOT_RUN`.
- Supabase Auth provider-token verifier candidate එකක් එකතු කළා. `getSession()` හෝ
  unverified JWT decode එකක් භාවිත නොකර `getClaims()` මගින් verify වූ
  `sub/session_id/exp/iss/aud` පමණක් authenticated gateway එකට යවයි; provider
  error, expired-token path සහ malformed claims fail-closed වේ. Checks **3/3
  PASS**. සැබෑ Supabase Auth/RLS/device සහ independent security review තවම
  `REVIEW_PENDING / NOT_RUN`. Full repository suite after this slice **748/748
  PASS**.
- Reminder intent slice එක සම්පූර්ණ කළා. Version 14 SQLite schema එකේ owner/task
  bound reminder table, server-side local-device intent routes, version checks,
  sync upserts සහ delete tombstones එකතු කළා. Local delete එක delivery disable
  කරලා පසුව එන stale upsert එකකින් ID එක නැවත මතු නොවන ලෙස ආරක්ෂා කරයි.
  අදාළ local/applier/sync-writer checks **42/42 PASS**. OS notification,
  Supabase execution, Android device evidence සහ independent review තවම
  `REVIEW_PENDING / NOT_RUN`. Full repository suite is now **723/723 PASS**.
- Reminder list read candidate එකත් එකතු කළා. Active session එක transaction
  ඇතුළේ නැවත පරීක්ෂා කර owner-scoped, tombstone-excluding, bounded read එකක්
  ලබා දෙයි; malformed rows fail-closed වේ. Route/read checks **21/21 PASS**.
  Canonical opaque cursor forwarding, remote execution, device verification සහ
  independent review තවම `REVIEW_PENDING / NOT_RUN`.
- Reminder list එකට signed opaque cursor pagination එක එකතු කළා. Cursor එක owner,
  endpoint, limit, sort key සහ expiry එකට බැඳී ඇත; query keys/limits fail-closed
  ලෙස validate කරයි. Cursor/query/pagination checks **33/33 PASS**. වෙනත් list
  endpoints තවම පැරණි bounded-read candidates ලෙස පවතින අතර remote/device/
  independent review තවම `REVIEW_PENDING / NOT_RUN`.
- Focus-session history list එකටත් signed descending cursor pagination එකතු කළා.
  Owner/session recheck, keyset query, bounded page සහ cursor expiry tests එකතු
  කළා. Cursor/read-handler checks **3/3 PASS** සහ full repository suite
  **745/745 PASS**. සැබෑ PostgreSQL/RLS, device සහ independent review තවම
  `REVIEW_PENDING / NOT_RUN`.
- AI proposal apply සඳහා server-only receipt decision guard එකක් එකතු කළා.
  එකම mutation එක replay කරයි, වෙනස් payload එකක් conflict කරයි, සහ වෙනත් keyකින්
  දැනටමත් apply කළ proposal එක නැවත apply වීම නවත්වයි. Tests **5/5 PASS**.
  Owner-bound PostgreSQL receipt adapter/migration candidate සහ failure/ownership
  checks **5/5 PASS** ලෙස එකතු කළා. Owner-bound versioned proposal storage
  candidate සහ guarded apply transition checks **5/5 PASS** ලෙස එකතු කළා. සැබෑ PostgreSQL execution/RLS සහ independent
  review තවම `REVIEW_PENDING / NOT_RUN`; migration එක remote එකක ධාවනය කළේ නැහැ.
  Transaction coordinator candidate එකෙන් selected-operation dependency order,
  domain callback, proposal mark සහ receipt write එක එකම caller-owned transaction
  boundary එකකට බැඳුවා; checks **5/5 PASS**. එකම PostgreSQL client transaction
  එක භාවිත කරන unified adapter checks **3/3 PASS**. Full repository suite නැවත
  ධාවනය කළ පසු full repository suite **743/743 PASS** ලෙස තහවුරු කළා.
- Copilot PR #16 security report එක repository code, tests සහ canonical docs
  සමඟ තනි තනිව reconcile කළා. `.env.example` හි අගයන් approved development
  project URL එක සහ `sb_publishable_` client value එකක් බව තහවුරු වුණා;
  secret leak එකක් තහවුරු වුණේ නැහැ. RLS/දෙගිණුම් isolation, සැබෑ Auth
  revocation, Android offline/restart, rendering සහ independent security review
  තවම `REVIEW_PENDING / NOT_RUN`. AI confirmed-plan duplicate apply සඳහා
  durable receipt contract එකක් තවම අවශ්‍යයි; in-memory workaround එකක් නොදැම්මා.
  Reconciliation evidence එකේ full suite **711/711 PASS** ලෙස සටහන් කළා.
- Post-focus break record සඳහා local-only backend foundation එක එකතු කළා.
  Owned terminal focus session පරීක්ෂාව, server-derived `actualMs`, duplicate
  rejection, bounded timestamps, RLS/server-only migration, gateway route සහ
  sync payload wiring ඇතුළත්. SQLite schema version 13 break materializer එකත්
  එකතු කළා; invalid linked session/data වලදී page එක සහ cursor එක rollback වේ.
  Focused checks **49/49 PASS**, mobile SQLite checks **25/25 PASS**; full suite
  **702/702 PASS**; TypeScript, affected ESLint, docs checker සහ diff check
  **PASS**. OS scheduling, remote apply, independent
  review සහ Android verification තවම `NOT_RUN / REVIEW_PENDING`.
- PostgreSQL sync change contract එකේ තිබූ mismatch එක නිවැරදි කිරීමට
  local-only migration candidate එකක් එකතු කළා. `settings` upsert changes
  පිළිගන්න අතර delete tombstones සඳහා `payload = NULL` නීතියත් schema එකට
  ඇතුළත් කළා. Operation/payload consistency constraint එක නිසා වැරදි
  payload එකක් සමඟ sync change commit වීම වැළකේ. Migration සහ security
  contract checks **12/12 PASS**. Remote apply, PostgreSQL execution,
  independent review සහ production migration තවම `NOT_RUN / REVIEW_PENDING`.
- User settings sync සඳහා mobile SQLite materializer එක එකතු කළා. Remote
  payload validation, owner isolation, stale-version protection, replay safety
  සහ receipt/mirror/settings/cursor එකම transaction එකක atomic කිරීම ඇතුළත්.
  Local SQLite schema version 13 migration එකෙන් settings typed columns සහ
  sync receipt constraint එක එකතු කළා; පරණ JSON source මකා නැහැ. Mobile
  focused checks **24/24 PASS**; full suite **693/693 PASS**; TypeScript,
  affected ESLint, docs checker සහ diff check **PASS**. Supabase/production
  apply, independent security review සහ Android device verification තවම
  `NOT_RUN / REVIEW_PENDING`.
- Canonical settings contract එකට ගැළපෙන local-only `df_private.user_settings`
  migration foundation එක එකතු කළා. Owner binding, version, bounded defaults,
  RLS සහ `service_role`-only grants ඇතුළත්. Supabase වෙත apply කළේ නැහැ.
  Migration checks **8/8 PASS**; full suite **686/686 PASS**; TypeScript,
  affected ESLint, docs checker සහ diff check **PASS**. Owner-bound
  `GET /v1/settings` read route එකත් එකතු කළා. දැන් owner/version-bound
  `PATCH /v1/settings` සහ `settings` sync entity support එකත් ඇත. Settings
  focused checks **37/37 PASS**, full suite **692/692 PASS**. Mobile materializer,
  remote runtime/RLS, independent review සහ device verification තවම
  `NOT_RUN / REVIEW_PENDING`.
- Local gateway candidate එකට owner-scoped `DELETE /v1/tasks/{id}` එකතු කළා.
  Task එක physical delete නොකර version bump එකක් සහ null-payload task tombstone
  එකක් sync feed එකට දමයි; කලින් focus-session history රැකේ. Gateway transaction
  integration regression එකත් එකතු කළා. Focused checks **49/49 PASS**; full suite
  **685/685 PASS**; TypeScript, affected ESLint,
  docs checker සහ diff check **PASS**. Reminder cancellation සහ live planning
  link cleanup සඳහා canonical storage contract නැති නිසා ඒවා `REVIEW_PENDING`.
  Remote runtime, independent security review සහ Android/device verification
  තවම `NOT_RUN / REVIEW_PENDING`.
- Local gateway candidate එකට owner-scoped `DELETE /v1/goals/{id}` එකතු කළා.
  Physical delete නොකර soft-delete version bump එකක්, null-payload goal
  tombstone එකක් සහ committed sync sequence එකට බැඳුණු idempotency receipt එකක්
  භාවිතා කරයි. Focused checks **55/55 PASS**; full suite **680/680 PASS**;
  TypeScript, affected ESLint, docs checker සහ diff check **PASS**. Remote
  runtime, independent security review සහ Android/device verification තවම
  `NOT_RUN / REVIEW_PENDING`.
- Sync push/pull validators වල canonical delete change එකට `payload: null`
  නිවැරදිව allow කළා. Upsert payload validation දුර්වල කළේ නැහැ; delete hash,
  ordering සහ replay checks තවම ක්‍රියාත්මකයි. Focused checks **12/12 PASS**;
  full suite **693/693 PASS**; TypeScript, ESLint සහ docs checker **PASS**.
- PostgreSQL mutation transaction එකට optional response finalizer එකක් එකතු කළා.
  Sync change sequence එක DB transaction එකෙන් ලැබුණු පසුව response එකත්
  idempotency receipt එකත් එකම committed result එකට බැඳිය හැක. මෙය canonical
  delete tombstone සඳහා foundation එකක් පමණයි; delete route සක්‍රිය කළේ නැහැ.
  Focused checks **31/31 PASS**; full suite **691/691 PASS**; TypeScript,
  ESLint, docs checker සහ diff check **PASS**.
- Local server candidate එකට owner-scoped `PATCH /v1/goals/{id}` එකතු කළා.
  `expectedVersion` අනිවාර්යයි; title/description පමණක් වෙනස් කළ හැකි අතර
  version match නොවුණොත් conflict වේ. Commit එකෙන් පසු patched goal එක owner
  sync change feed එකට ඇතුළත් වේ. Focused checks **28/28 PASS**; full suite
  **690/690 PASS**; TypeScript, ESLint, docs checker සහ diff check **PASS**.
  Goal delete tombstone/receipt එක වෙනම `REVIEW_PENDING`.
- Canonical sync command 14 අතරින් remote pusher එකේ අඩුවී තිබූ task/goal delete
  සහ patch, break, settings, reminder commands map කළා. Versioned delete
  requests `Expected-Version` header එකෙන් පමණක් යවයි; remote API client එකට
  idempotent `DELETE` සහ range validation එකතු කළා. Focused remote checks
  **15/15 PASS**; full suite **687/687 PASS**; TypeScript, ESLint සහ docs
  checker **PASS**. Remote runtime සහ independent review තවම
  `NOT_RUN / REVIEW_PENDING`.
- Gateway evidence notes වල පරණ test counts current repository outputට ගලපලා update කළා:
  entrypoint **10/10**, execution **7/7**, full suite **685/685**. Code behavior
  වෙනස් කළේ නැහැ; docs checker සහ affected checks **PASS**. Remote runtime සහ
  independent review තවම `NOT_RUN / REVIEW_PENDING`.
- Sync outbox cleanup එකේ failed load එකකට පස්සේ ඇතිවිය හැකි unhandled rejection
  අවදානම ඉවත් කළා. මුල් error එක caller වෙතම යන අතර ඊළඟ retry එකට store lock
  නොවී නැවත sync විය හැකි බව regression test එකෙන් තහවුරු කළා. Sync focused
  checks **20/20 PASS**; full suite **685/685 PASS**; TypeScript, affected ESLint
  සහ docs checker **PASS**. Remote sync runtime සහ independent review තවම
  `NOT_RUN / REVIEW_PENDING`.
- Server entitlement migration contract එකට `service_role` පමණක් privilege ලැබෙන බවත්
  `public/anon/authenticated` grants නොමැති බවත් regression assertions දෙකකින් තහවුරු කළා.
  Full suite, TypeScript, affected ESLint සහ docs checker **PASS**. Live RLS,
  remote runtime සහ independent review තවම `NOT_RUN / REVIEW_PENDING`.
- AI proposal එකේ allowance reservation fail වුණොත් raw storage error leak නොවී
  safe `DEPENDENCY_UNAVAILABLE` ලැබෙන ලෙස සකස් කළා; provider call එකට පෙරම
  නවත්වන regression test එකක් එක් කළා. AI/planning focused checks
  **22/22 PASS**; full suite **684/684 PASS**; TypeScript, affected ESLint සහ
  docs checker **PASS**. Remote runtime සහ independent review තවම
  `NOT_RUN / REVIEW_PENDING`.
- AI apply boundary එකේ session recheck raw failuresත් safe
  `DEPENDENCY_UNAVAILABLE` response එකකට map කළා. Server-defined auth errors
  preserve කරන අතර apply callback එකට යාම නවත්වන regression test එකක් එකතු කළා.
  AI/planning focused checks **21/21 PASS**; full suite **683/683 PASS**;
  TypeScript, affected ESLint සහ docs checker **PASS**. Remote runtime සහ
  independent review තවම `NOT_RUN / REVIEW_PENDING`.
- AI confirmed-plan apply callback එකේ raw errors safe `DEPENDENCY_UNAVAILABLE`
  boundary එකකට map කළා; දැනටමත් server-defined `SafeBoundaryError` codes
  preserve කරනවා. Provider/session/apply leakage regression coverage සමඟ
  AI/planning focused checks **20/20 PASS**; full suite **682/682 PASS**;
  TypeScript, affected ESLint සහ docs checker **PASS**. සැබෑ provider සහ
  remote runtime තවම `NOT_RUN / REVIEW_PENDING`.
- Authenticated gateway සඳහා synthetic accounts දෙකක isolation regression එකක්
  එක් කළා. Account A සහ Account B requests දෙකම verified actor/session සහ
  owner-scoped resource එකටම බැඳෙන බව පරීක්ෂා වේ. Gateway focused checks
  **23/23 PASS**; full suite **681/681 PASS**; TypeScript, affected ESLint සහ
  docs checker **PASS**. මෙය local boundary evidence එකක් පමණයි; සැබෑ
  Supabase/RLS පරීක්ෂණ තවම `NOT_RUN / REVIEW_PENDING`.
- Confirmed AI plan apply boundary එකට apply-වීමට පෙර verified actor/session
  recheck එක අනිවාර්ය කළා. Revoked-session regression test එක server apply
  callback එකට පෙර නවත්වන බව තහවුරු කරයි. AI/planning focused checks
  **19/19 PASS**; full suite **680/680 PASS**; TypeScript, affected ESLint සහ
  docs checker **PASS**. සැබෑ provider, remote allowance store සහ independent
  review තවම `NOT_RUN / REVIEW_PENDING`.
- PostgreSQL snapshot metadata/page adapters වලටත් `sessionId` අනිවාර්ය කළා.
  Session recheck එක metadata/page private readsට පෙර සිදු වන අතර missing-session
  direct composition එක fail-closed වේ. Snapshot focused checks **21/21 PASS**;
  full suite **679/679 PASS**; TypeScript, affected ESLint සහ docs checker
  **PASS**. Remote RLS, independent review සහ device verification තවම
  `NOT_RUN / REVIEW_PENDING`.
- PostgreSQL sync pull/commit adapters වලට `sessionId` දැන් අනිවාර්ය කළා.
  Session recheck එක private sync head/change queriesට පෙර transaction එක තුළම
  සිදු වේ; session නැති direct composition එක fail-closed වේ. Sync focused
  checks **19/19 PASS**; full suite **677/677 PASS**; TypeScript, affected
  ESLint සහ docs checker **PASS**. Remote RLS, independent review සහ device
  verification තවම `NOT_RUN / REVIEW_PENDING`.
- PostgreSQL read-handler boundary එක දැන් `sessionId` නැති direct composition එකක්
  දත්ත query වෙත යාමට පෙර `AUTH_REQUIRED` ලෙස නවත්වයි. Valid session තිබෙන reads
  සහ missing-session regression coverage එකතු කළා. Gateway/read focused checks
  **22/22 PASS**; full suite **676/676 PASS**; TypeScript, affected ESLint සහ
  docs checker **PASS**. Remote RLS, independent review සහ device verification
  තවම `NOT_RUN / REVIEW_PENDING`.
- PostgreSQL entitlement read contract එකෙන් `sessionId` දැන් අනිවාර්ය කළා.
  Usage reserve/read paths දැනටමත් කළ app-session recheck එකට එම ID එකම pass
  කරන නිසා, session-boundary එක මඟහැරෙන internal composition එකක් compile-time
  මට්ටමේදීත් වැළකේ. Entitlement/capability/usage focused checks **29/29 PASS**;
  full suite **675/675 PASS**. Remote PostgreSQL/RLS, independent security
  review සහ device verification තවම `NOT_RUN / REVIEW_PENDING`.
- Server AI planning boundary candidate එකක් එක් කළා. AI allowance එක server-side
  reserve නොවුණොත් provider call නොකරයි; provider failure එකේ reservation
  release කරයි; success එකේ consume කරයි. Plan apply callback එක explicit,
  matching confirmation token එකෙන් පසුව පමණක් කැඳවයි. AI/usage focused checks
  **31/31 PASS**; full suite **675/675 PASS**; TypeScript, affected ESLint සහ
  docs checker **PASS**. මෙය සැබෑ OpenAI integration එකක් නොවන අතර provider,
  credentials, remote storage සහ independent review තවම
  `NOT_RUN / REVIEW_PENDING`.
- AI provider failure එක raw error එකක් ලෙස ඉහළට නොයවා
  `AI_PROVIDER_UNAVAILABLE` safe boundary code එකකට map කළා; allowance release
  සහ apply-not-called regression එකත් රැකුණා. AI boundary checks
  **31/31 PASS**.
- Rate-limit denial response එකට bounded `Retry-After` header එක සම්බන්ධ කළා.
  Header එක server-derived seconds වලින් පමණක් එන අතර error body එකේ secret හෝ
  internal detail නැත. Gateway/error-boundary checks **18/18 PASS**; full
  suite **670/670 PASS**; TypeScript, affected ESLint සහ docs checker **PASS**.
- Gateway error path එකට allowlisted diagnostic logger hook එකක් සම්බන්ධ කළා.
  `SafeBoundaryError` code/status/retryability සහ validated request ID පමණක්
  log කරයි; raw error message, stack, SQL, token හෝ request body නොයයි. Logger
  එක fail වුණත් public response එක වෙනස් නොවේ. Error-boundary/gateway checks
  **14/14 PASS**; full suite **670/670 PASS**; TypeScript, affected ESLint සහ
  docs checker **PASS**. Remote logging integration සහ independent review
  `NOT_RUN / REVIEW_PENDING`.
- Gateway rate-limit සඳහා local PostgreSQL atomic counter adapter සහ
  `gateway_rate_limit_buckets` migration candidate එක් කළා. Owner/operation/
  fixed-window key එක `ON CONFLICT` update එකකින් ගණන් කරයි; malformed DB result
  fail-closed වේ. Local concurrent counter contract එකත් පරීක්ෂා කරයි.
  Rate-limit/migration focused checks **26/26 PASS**; full suite **671/671
  PASS**; TypeScript, affected ESLint සහ docs checker **PASS**.
  Remote SQL, retention cleanup, distributed load test සහ independent review
  තවම `NOT_RUN / REVIEW_PENDING`.
- Authenticated gateway එකට actor/operation scoped atomic rate-limit admission
  සම්බන්ධ කළා. Counter එක deny කළොත් handler එකට යාමට පෙර bounded `429`
  response එකක් ලැබේ. Gateway/rate-limit checks **11/11 PASS**; full suite
  **662/662 PASS**; TypeScript, affected ESLint සහ docs checker **PASS**.
  Distributed counter, retention cleanup සහ runtime configuration තවම
  `REVIEW_PENDING`.
- Authenticated mutation gateway එකේ write handlers සඳහා `sessionId` දැන්
  අනිවාර්යයි. Session එක නොමැති request එක owner/profile/head write කිරීමට
  පෙර `AUTH_REQUIRED` ලෙස නවතයි. Gateway/domain focused checks **23/23 PASS**;
  full suite **661/661 PASS**; TypeScript, affected ESLint සහ docs checker
  **PASS**. Remote PostgreSQL/RLS සහ independent review
  `NOT_RUN / REVIEW_PENDING`.
- Snapshot build/staging writes දැන් verified `sessionId` එකෙන් transaction
  ඇතුළත recheck කරයි. Revoked session එකකදී snapshot insert/update එකට පෙර
  fail-closed වේ. Snapshot staging/build checks **14/14 PASS**; full suite
  **660/660 PASS**; TypeScript, affected ESLint සහ docs checker **PASS**.
  Remote PostgreSQL/RLS, independent review සහ device verification
  `NOT_RUN / REVIEW_PENDING`.
- Snapshot metadata, page සහ signed-cursor reads වලට verified `sessionId`
  transaction එකට බැඳුණා. Revoked session එකකදී snapshot query එකට පෙර
  `AUTH_REQUIRED` ලෙස නවතන regression coverage එක එක් කළා. Snapshot read/cursor
  checks **12/12 PASS**; full regression **659/659 PASS**; TypeScript සහ
  affected ESLint **PASS**; docs checker **PASS** (226 Markdown, 936 links,
  80/80 requirements). Real PostgreSQL/RLS, independent security review සහ
  Android/device verification `NOT_RUN / REVIEW_PENDING`.
- Entitlement/usage migration contract tests තවත් තද කළා: profile foreign key,
  owner-capability primary key, composite allowance/receipt ownership සහ client
  role grants නොමැති බව explicitව පරීක්ෂා කරයි. Migration/security checks
  **9/9 PASS**; full regression **657/657 PASS**; TypeScript සහ affected ESLint
  **PASS**. Remote SQL/RLS execution සහ independent review තවම
  `NOT_RUN / REVIEW_PENDING`.
- AI/cloud usage service boundary එකේ reserve, settle සහ allowance read සඳහා
  verified `sessionId` දැන් අනිවාර්ය කළා. Session එකක් නොමැති හෝ revoked වූ විට
  entitlement, allowance හෝ receipt data වෙත යාමට පෙර fail-closed වේ. Usage
  focused checks **34/34 PASS**; full regression **657/657 PASS**; TypeScript
  සහ affected ESLint **PASS**. Live billing/provider integration,
  PostgreSQL/RLS සහ independent review තවම `NOT_RUN / REVIEW_PENDING`.
- Server entitlement reads වලට session-bound transaction recheck එක එක් කළා.
  AI/cloud capability record එක කියවීමට පෙර active app session එක lock කරයි;
  revoked session එකකදී capability data වෙත නොයයි. Entitlement focused checks
  **11/11 PASS**; full regression **655/655 PASS**; TypeScript සහ affected
  ESLint **PASS**. Live billing/provider integration, PostgreSQL/RLS සහ
  independent review තවම `NOT_RUN / REVIEW_PENDING`.
- Authenticated PostgreSQL read handlers වලටත් transaction-level app-session
  recheck එක එක් කළා. Session revoke/expiry race එකක් තිබුණත් protected query
  එකට පෙර `AUTH_REQUIRED` ලෙස නවතයි. Read/gateway focused checks **17/17 PASS**;
  full regression **653/653 PASS**; TypeScript සහ affected ESLint **PASS**.
  Real PostgreSQL/RLS, independent security review සහ Android verification
  තවම `NOT_RUN / REVIEW_PENDING`.

- Sync pull/commit gateway එකට verified app session recheck එක සම්බන්ධ කළා.
  Pull සහ commit දෙකේම data read/head lock කිරීමට පෙර `app_sessions` row එක
  transaction එකේ lock කර active, නොකල් ඉකුත් වූ සහ revoke නොකළ බව පරීක්ෂා කරයි.
  Sync gateway tests **4/4 PASS**; අදාළ adapter checks සමඟ **28/28 PASS**;
  full regression **651/651 PASS**; TypeScript සහ affected ESLint **PASS**.
  Real PostgreSQL/RLS සහ independent security review තවම
  `NOT_RUN / REVIEW_PENDING`.
- Backup restore regression coverage දැන් පළමු transaction rollback වීමෙන් පසු
  එකම digest-bound artifact එක නැවත භාවිතයෙන් සාර්ථක retry එකක්ද පරීක්ෂා කරයි.
  Backup checks **12/12 PASS**; full regression **650/650 PASS**; TypeScript සහ
  affected ESLint **PASS**. මෙය actual database restore හෝ production backup
  evidence එකක් නොවන අතර ඒවා තවම `NOT_RUN / REVIEW_PENDING`.

- Domain mutation contract එකට session-bound negative coverage එක එක් කළා:
  malformed session ID එක transaction එක විවෘත කිරීමට පෙර reject වෙයි; session
  recheck adapter එක නොමැති නම් owner head lock එකට යාමට පෙර fail-closed වෙයි.
  Focused transaction/gateway/adapter checks **24/24 PASS**; full regression
  **649/649 PASS**; TypeScript සහ affected ESLint **PASS**. Real PostgreSQL/RLS,
  independent security review සහ Android/device verification තවම
  `NOT_RUN / REVIEW_PENDING`.

- Domain mutation writes දැන් actorගේ app session එකත් එකම database transaction එකේ
  නැවත lock කර පරීක්ෂා කරයි. Active, නොකල් ඉකුත් වූ සහ revoke නොකළ session එකක්
  නැතිනම් mutation applier එකට හෝ sync head lock එකට නොයයි. Gateway එක verified
  session ID එක transaction context එකට pass කරන බවට regression assertion එකක්ද
  එක් කළා. Focused checks **26/26 PASS**; full regression **647/647 PASS**;
  TypeScript සහ affected ESLint **PASS**. Real PostgreSQL/RLS execution,
  independent security review සහ Android/device verification තවම
  `NOT_RUN / REVIEW_PENDING`.

- Domain mutation transaction එක `sync_heads` lock කිරීමට පෙර එකම transaction
  එකේ actorගේ active profile row එක lock කරලා නැවත පරීක්ෂා කරන ලෙස ශක්තිමත්
  කළා. Missing/disabled profile එකකින් mutation එකක් ඉදිරියට නොයයි. නව
  regression test සමඟ focused domain/gateway checks **12/12 PASS**; full
  regression **645/645 PASS**. Real PostgreSQL/RLS execution, independent
  review සහ device verification තවම `NOT_RUN / REVIEW_PENDING`.

- Migration safety gate එකට private-table migration එකකින් `public`, `anon` හෝ
  `authenticated` වෙත direct `GRANT` එකක් නොයන බවට වෙනම assertion එකක් එක්
  කළා. Migration safety checks **3/3 PASS**; full regression **644/644 PASS**.
  මෙය static SQL evidence එකක් පමණයි; remote migration/RLS execution,
  independent review සහ device verification තවම `NOT_RUN / REVIEW_PENDING`.

- PostgreSQL task action, sync head advance සහ snapshot publish `RETURNING`
  contracts සම්පූර්ණ කළා. Task action එකේ SQL එක දැන් code එක validate කරන
  `owner_id` field එකම ආපසු ලබා දෙයි; sync head සහ ready snapshot දෙකම owner හා
  resource identity validate කරයි. Foreign returned metadata සඳහා regression
  tests 2ක් එක් කළා. Combined focused checks **27/27 PASS**; full regression
  **644/644 PASS**. Remote PostgreSQL/RLS execution, independent review සහ
  device verification තවම `NOT_RUN / REVIEW_PENDING`.

- PostgreSQL usage reservation සහ settlement writes වල returned receipt/allowance
  metadata validate කරන ලෙස ශක්තිමත් කළා. Foreign owner, capability හෝ period
  metadata ලැබුණොත් grant/settlement එක සාර්ථක ලෙස report කරන්නේ නැහැ. නව
  regression checks 5ක් සමඟ usage adapter focused checks **16/16 PASS**;
  full regression **642/642 PASS**. TypeScript, affected ESLint, docs checker
  සහ diff checkත් සාර්ථකයි. Remote entitlement/RLS review, independent review
  සහ device verification තවම `NOT_RUN / REVIEW_PENDING`.

- Session revocation outbox insert එකේ returned `owner_id`, `session_id` සහ
  `revocation_id` validate කරන ලෙස ශක්තිමත් කළා. Foreign outbox metadata
  ලැබුණොත් revocation එක created ලෙස report කරන්නේ නැහැ. Focused checks
  **7/7 PASS**; full regression **637/637 PASS**. Remote auth/RLS review,
  independent review සහ device verification තවම `NOT_RUN / REVIEW_PENDING`.

- App session create/revoke writes වල returned owner, session ID සහ revoke
  status validate කරන ලෙස auth adapter එක ශක්තිමත් කළා. Foreign session
  metadata ලැබුණොත් write එක පිළිගන්නේ නැහැ. Focused checks **6/6 PASS**;
  full regression **636/636 PASS**. Remote auth/RLS review, independent review
  සහ device verification තවම `NOT_RUN / REVIEW_PENDING`.

- Mutation receipt ලියන විට returned `owner_id`, operation සහ `mutation_id`
  request receipt එකට ගැළපෙනවාදැයි පරීක්ෂා කරන ලෙස ශක්තිමත් කළා. Foreign
  receipt metadata ලැබුණොත් idempotency result එක පිළිගන්නේ නැහැ. Focused
  checks **11/11 PASS**; full regression **635/635 PASS**. Remote RLS,
  independent review සහ device verification තවම `NOT_RUN / REVIEW_PENDING`.

- Sync head advance එකේ returned `owner_id` සහ sequence verified actor/next
  sequence එකට ගැළපෙනවාදැයි පරීක්ෂා කරන ලෙස ශක්තිමත් කළා. Foreign head
  metadata ලැබුණොත් advance එක පිළිගන්නේ නැහැ. Sync writer focused checks
  **7/7 PASS**; full regression **634/634 PASS**. Remote RLS, independent
  review සහ device verification තවම `NOT_RUN / REVIEW_PENDING`.

- Mutation-to-sync change writer එකේ returned insert row එකේ `owner_id`,
  sequence සහ hash පරීක්ෂා කරන ලෙස ශක්තිමත් කළා. Foreign metadata ලැබුණොත්
  sync head advance නොකර fail-closed වේ. Sync writer focused checks **6/6
  PASS**; full regression **633/633 PASS**. Remote RLS, independent review
  සහ device verification තවම `NOT_RUN / REVIEW_PENDING`.

- PostgreSQL sync transaction change insert එකේ returned `owner_id`, sequence සහ
  hash request එකට ගැළපෙනවාදැයි පරීක්ෂා කරන ලෙස ශක්තිමත් කළා. Foreign insert
  metadata එකක් ලැබුණොත් owner head advance නොකර fail-closed වේ. Sync focused
  checks **11/11 PASS**; full regression **632/632 PASS**. Remote RLS,
  independent review සහ device verification තවම `NOT_RUN / REVIEW_PENDING`.

- Task actions වල අවසාන update එකෙන් ආපසු ලැබෙන task `owner_id` සහ `id`
  verified actor/task එකට ගැළපෙනවාදැයි පරීක්ෂා කරන ලෙස ශක්තිමත් කළා. Foreign
  metadata එකක් ලැබුණොත් success response එකක් නොදෙයි. Focused checks
  **5/5 PASS**; full regression **631/631 PASS**. Remote RLS, independent
  review සහ device verification තවම `NOT_RUN / REVIEW_PENDING`.

- Task creation `RETURNING` row එකේ `owner_id`, `workspace_id` සහ `id`
  verified actor/request එකට ගැළපෙනවාදැයි පරීක්ෂා කරන ලෙස ශක්තිමත් කළා.
  Foreign metadata එකක් ලැබුණොත් success response එකක් නොදෙයි. Focused checks
  **8/8 PASS**; full regression **630/630 PASS**. Remote RLS, independent
  review සහ device verification තවම `NOT_RUN / REVIEW_PENDING`.

- Task patch update එකේ returned task `owner_id` සහ `id` verified actor/task
  එකට ගැළපෙනවාදැයි පරීක්ෂා කරන ලෙස ශක්තිමත් කළා. Foreign ownership metadata
  එකක් ලැබුණොත් success response එකක් නොදෙයි. Focused checks **6/6 PASS**;
  full regression **629/629 PASS**. Remote RLS, independent review සහ device
  verification තවම `NOT_RUN / REVIEW_PENDING`.

- Session event update එකේ returned session `owner_id` සහ `id` verified
  actor/session එකට ගැළපෙනවාදැයි පරීක්ෂා කරන ලෙස ශක්තිමත් කළා. Foreign
  metadata එකක් ලැබුණොත් success response එකක් නොදෙයි. Focused checks
  **7/7 PASS**; full regression **628/628 PASS**. Remote RLS, independent
  review සහ device verification තවම `NOT_RUN / REVIEW_PENDING`.

- Session event insert එකෙන් ආපසු ලැබෙන event `owner_id`, `session_id`,
  `sequence` සහ `type` request එකට ගැළපෙනවාදැයි පරීක්ෂා කරන ලෙස ශක්තිමත් කළා.
  Foreign හෝ replay-shaped metadata එකක් ලැබුණොත් session update නොකර
  fail-closed වේ. Focused checks **6/6 PASS**; full regression **627/627
  PASS**. Remote RLS, independent review සහ device verification තවම
  `NOT_RUN / REVIEW_PENDING`.

- Focus session start කිරීමේදී returned session `owner_id`, `workspace_id` සහ
  `id` verified actor/request එකට ගැළපෙනවාදැයි පරීක්ෂා කරන ලෙස ශක්තිමත් කළා.
  Foreign metadata එකක් ලැබුණොත් response එක පිළිගන්නේ නැහැ. Focused checks
  **7/7 PASS**; full regression **626/626 PASS**. Remote RLS, independent
  review සහ device verification තවම `NOT_RUN / REVIEW_PENDING`.

- Goal creation සඳහා database එකෙන් ආපසු ලැබෙන goal `owner_id`, `workspace_id`
  සහ `id` verified actor/request එකට ගැළපෙනවාදැයි පරීක්ෂා කරන ලෙස ශක්තිමත්
  කළා. Foreign metadata එකක් ලැබුණොත් response එක accept නොකර
  `DEPENDENCY_UNAVAILABLE` ලෙස fail-closed වේ. Focused checks **6/6 PASS**;
  full regression **625/625 PASS**. Remote RLS, independent review සහ device
  verification තවම `NOT_RUN / REVIEW_PENDING`.

- Task actions (`begin`, `complete`, `cancel`, `archive`) සඳහා current task row
  එකේ returned `owner_id` සහ `id` verified actor/request එකට ගැළපෙනවාදැයි
  පරීක්ෂා කරන ලෙස ශක්තිමත් කළා. Foreign metadata එකක් ලැබුණොත් state update
  නොකර fail-closed වේ. Focused checks **4/4 PASS**; full regression
  **624/624 PASS**. Remote RLS, independent review සහ device verification
  තවම `NOT_RUN / REVIEW_PENDING`.

- Task patch කරන විට goal join එකෙන් ආපසු ලැබෙන task owner, task ID, goal owner,
  goal workspace සහ goal ID නැවත validate කරන ලෙස ශක්තිමත් කළා. Foreign
  metadata එකක් ලැබුණොත් task update නොකර fail-closed වේ. Focused checks
  **5/5 PASS**; full regression **623/623 PASS**. Remote RLS/workspace
  isolation, independent review සහ device verification තවම
  `NOT_RUN / REVIEW_PENDING`.

- Task create goal lookup එක returned owner, workspace සහ goal ID verified
  actor/request එකට ගැළපෙනවාදැයි පරීක්ෂා කරන ලෙස ශක්තිමත් කළා. Foreign goal
  metadata එකක් task එකකට භාවිත වීම නවත්වන regression test එකක් එක් කළා.
  Remote RLS/workspace isolation, independent review සහ device verification
  තවම `NOT_RUN / REVIEW_PENDING`. Focused checks **7/7 PASS**; full
  regression **622/622 PASS**.

- Task create workspace lookup එක returned owner සහ workspace ID verified actor
  එකට ගැළපෙනවාදැයි පරීක්ෂා කරන ලෙස ශක්තිමත් කළා. Foreign workspace metadata
  එකක් task එකකට භාවිත වීම නවත්වන regression test එකක් එක් කළා. Remote
  RLS/workspace isolation, independent review සහ device verification තවම
  `NOT_RUN / REVIEW_PENDING`. Focused checks **6/6 PASS**; full regression
  **621/621 PASS**.

- Task නැති `startSession` අවස්ථාවේ workspace lookup එක returned owner සහ ID
  verified actor/request එකට ගැළපෙනවාදැයි පරීක්ෂා කරන ලෙස ශක්තිමත් කළා.
  Foreign workspace metadata එකක් session එකකට භාවිත වීම නවත්වන regression test
  එකක් එක් කළා. Remote RLS/session isolation, independent review සහ device
  verification තවම `NOT_RUN / REVIEW_PENDING`. Focused checks **6/6 PASS**;
  full regression **620/620 PASS**.

- Snapshot staging retry එක existing page row එක accept කිරීමට පෙර returned
  owner සහ snapshot identity පරීක්ෂා කරන ලෙස ශක්තිමත් කළා. Foreign page metadata
  එකක් ready snapshot එකකට ඇතුළු වීම නවත්වන regression test එකක් එක් කළා.
  Remote snapshot/RLS, independent review සහ device verification තවම
  `NOT_RUN / REVIEW_PENDING`. Focused staging/build checks **12/12 PASS**;
  full regression **619/619 PASS**.

- Idempotency mutation receipt reads වල returned owner, operation සහ mutation ID
  replay request එකට ගැළපෙනවාදැයි පරීක්ෂා කරන ලෙස adapter එක ශක්තිමත් කළා.
  Foreign receipt data එකක් replay success එකක් වීම නවත්වන regression test එකක්
  එක් කළා. Remote database/RLS, independent review සහ device verification තවම
  `NOT_RUN / REVIEW_PENDING`. Focused checks **6/6 PASS**; full regression
  **618/618 PASS**.

- Goal creation workspace lookup එක returned owner සහ workspace ID verified
  actor/request එකට ගැළපෙනවාදැයි පරීක්ෂා කරන ලෙස ශක්තිමත් කළා. Foreign workspace
  metadata එකක් goal එකකට බැඳීම නවත්වන regression test එකක් එක් කළා. Remote
  RLS/workspace isolation, independent review සහ device verification තවම
  `NOT_RUN / REVIEW_PENDING`. Focused checks **5/5 PASS**; full regression
  **617/617 PASS**.

- Start-session task lookup එක returned owner, workspace සහ task ID request
  එකට ගැළපෙනවාදැයි පරීක්ෂා කරන ලෙස ශක්තිමත් කළා. Foreign task metadata එකක්
  session snapshot එකට copy වීම නවත්වන regression test එකක් එක් කළා. Remote
  RLS/session isolation, independent review සහ device verification තවම
  `NOT_RUN / REVIEW_PENDING`. Focused checks **5/5 PASS**; full regression
  **616/616 PASS**.

- Session event update එකේ locked session row එකේ returned owner සහ session ID
  verified actor/resource එකට ගැළපෙනවාදැයි පරීක්ෂා කරන ලෙස ශක්තිමත් කළා.
  Foreign row එකක් fail-closed කරන regression test එකක් එක් කළා. Remote
  RLS/event isolation, independent review සහ device verification තවම
  `NOT_RUN / REVIEW_PENDING`. Focused checks **5/5 PASS**; full regression
  **615/615 PASS**.

- App-session registry read එක returned owner සහ session identity request එකට
  ගැළපෙනවාදැයි පරීක්ෂා කරන ලෙස ශක්තිමත් කළා. Foreign session row එකක්
  authorization/revocation flow එකට යාම නවත්වන regression test එකක් එක් කළා.
  Remote auth/RLS, independent review සහ device verification තවම
  `NOT_RUN / REVIEW_PENDING`. Focused checks **5/5 PASS**; full regression
  **614/614 PASS**.

- Usage allowance reads වල owner, capability සහ period scope එකත්, settlement
  receipt reads වල owner සහ receipt identity එකත් නැවත validate කරන ලෙස adapter
  එක ශක්තිමත් කළා. Foreign allowance row එකක් fail-closed කරන regression test
  එකක් එක් කළා. Remote entitlement execution, independent review සහ device
  verification තවම `NOT_RUN / REVIEW_PENDING`. Focused checks **11/11 PASS**;
  full regression **613/613 PASS**.

- Sync transaction replay reads වල stored change owner identity එක request
  account එකට ගැළපෙනවාදැයි පරීක්ෂා කරන ලෙස adapter එක ශක්තිමත් කළා. Foreign
  replay row එකක් fail-closed කරන regression test එකක් එක් කළා. Remote RLS,
  independent review සහ device verification තවම `NOT_RUN / REVIEW_PENDING`.
  Focused checks **7/7 PASS**; full regression **612/612 PASS**.

- Mutation-to-sync change writer එක committed entity row එකේ owner සහ entity ID
  request එකට ගැළපෙනවාදැයි පරීක්ෂා කරන ලෙස ශක්තිමත් කළා. Foreign row එකක්
  sync stream එකට ඇතුළු වීම නවත්වන regression test එකක් එක් කළා. Remote RLS,
  independent review සහ device verification තවම `NOT_RUN / REVIEW_PENDING`.
  Focused checks **5/5 PASS**; full regression **611/611 PASS**.

- Sync pull adapter එක returned change row එකේ `owner_id` request account එකට
  ගැළපෙනවාදැයි පරීක්ෂා කරන ලෙස ශක්තිමත් කළා. වෙනත් account එකක returned row
  එකක් fail-closed කරන regression test එකක් එක් කළා. Remote RLS, independent
  review සහ device verification තවම `NOT_RUN / REVIEW_PENDING`. Focused sync
  pull checks **5/5 PASS**; full regression **610/610 PASS**.

- Ready snapshot metadata reads වල returned owner සහ snapshot identity request
  එකට ගැළපෙනවාදැයි නැවත පරීක්ෂා කළා. Foreign metadata row එකක් fail-closed
  කරන regression test එකක් එක් කළා. Remote RLS, independent review සහ device
  verification තවම `NOT_RUN / REVIEW_PENDING`. Metadata/read focused checks
  **10/10 PASS**; page සහ metadata/read එකතුව **21/21 PASS**.

- Snapshot page reads වල returned owner, snapshot සහ page identity request එකට
  ගැළපෙනවාදැයි adapter boundary එකේම නැවත පරීක්ෂා කළා. Foreign-shaped returned
  row එකක් fail-closed කරන regression test එකක් එක් කළා. Remote RLS, independent
  review සහ device verification තවම `NOT_RUN / REVIEW_PENDING`. Focused snapshot
  checks **8/8 PASS**.

- Entitlement expiry timestamp එක වැරදි නම් capability access grant නොකරන
  fail-closed behavior එකට adapter regression coverage එකක් එක් කළා. Remote
  entitlement execution සහ independent review තවම `NOT_RUN / REVIEW_PENDING`.

- Task create applier එක goal link එකක් නැති අවස්ථාවකත් workspace ownership එක
  server-side තහවුරු කරන ලෙස ශක්තිමත් කළා. Foreign workspace task creation සඳහා
  regression test එකක් එක් කළා. Remote RLS execution සහ independent review තවම
  `NOT_RUN / REVIEW_PENDING`. Focused task checks **9/9 PASS**; full regression
  **606/606 PASS**.

- Task edit එකක `goalId` වෙනස් කරන විට goal එක එකම owner workspace එකට අයිතිදැයි
  server-side තහවුරු කරන ලෙස patch applier එක ශක්තිමත් කළා. Cross-workspace
  link regression test එකක් එක් කළා. Remote RLS execution සහ independent review
  තවම `NOT_RUN / REVIEW_PENDING`. Focused checks **12/12 PASS**; full
  regression **605/605 PASS**.

- Task එකක් නැති focus session එකක් ආරම්භ කරන විට workspace ownership එකත්
  server-side තහවුරු කරන ලෙස start-session applier එක ශක්තිමත් කළා. Foreign
  workspace regression test එකක් එක් කළා. Remote RLS execution සහ independent
  review තවම `NOT_RUN / REVIEW_PENDING`. Focused checks **12/12 PASS**; full
  regression **604/604 PASS**.

- Goal create applier එක verified actorට අයිති workspace එකක් පමණක් භාවිත කරන
  ලෙස server-side check එකක් එක් කළා. Foreign workspace goal creation සඳහා
  regression test එකක් එක් කළා. Remote RLS execution සහ independent review තවම
  `NOT_RUN / REVIEW_PENDING`. Focused checks **8/8 PASS**; full regression
  **603/603 PASS**.

- Task create applier එක linked goal එකේ owner සහ workspace දෙකම server-side
  පරීක්ෂා කරන ලෙස ශක්තිමත් කළා. Foreign හෝ වෙනත් workspace goal එකකට task
  link කිරීම නවත්වන regression test එකක් එක් කළා. Remote RLS execution සහ
  independent review තවම `NOT_RUN / REVIEW_PENDING`. Focused checks **8/8
  PASS**; full regression **602/602 PASS**.

- PostgreSQL read handlers වල returned resource/profile row identity නැවත
  පරීක්ෂා කර foreign හෝ malformed row එකක් DTO එකක් ලෙස යැවීම වසා දැමුවා.
  Account-isolation regression tests දෙකක් එක් කළා. Remote RLS execution සහ
  independent review තවම `NOT_RUN / REVIEW_PENDING`. Focused read checks **9/9
  PASS**; full regression **601/601 PASS**.

- Entitlement storage row එක requested owner සහ capability සමඟ exact match නොවුණොත්
  server capability grant එකකට map නොකර fail-closed කරන ලදී. Foreign-shaped
  storage row එකක් සඳහා account-isolation regression test එකක් එක් කළා. Remote
  entitlement execution සහ independent review තවම `NOT_RUN / REVIEW_PENDING`.
  Focused entitlement checks **13/13 PASS**; full regression **599/599 PASS**.

- PostgreSQL usage reservation එකේ allowance update වූ පසු receipt insert එක
  තහවුරු නොකර success වීම වසා දැමුවා. `returning receipt_id` සහ missing
  acknowledgement regression test එකක් එක් කළා. Remote billing/provider
  execution සහ independent review තවම `NOT_RUN / REVIEW_PENDING`. Focused usage
  checks **25/25 PASS**; full regression **598/598 PASS**.

- PostgreSQL sync transaction adapter එකේ `sync_changes` insert acknowledgement
  නැතිව owner head එක advance වීම වසා දැමුවා. Expected sequence සහ exact hash
  පරීක්ෂා කරන regression test එකක් එක් කළා. Remote PostgreSQL/RLS සහ independent
  review තවම `NOT_RUN / REVIEW_PENDING`. Focused adapter checks **6/6 PASS**;
  full regression **597/597 PASS**.

- PostgreSQL `sync_changes` insert එකෙන් expected sequence සහ exact change hash
  ආපසු ලැබුණාදැයි තහවුරු නොවුණොත් owner sync head එක advance නොකරන ලෙස
  fail-closed කළා. Missing acknowledgement සඳහා regression test එකක් එක් කළා;
  focused gateway/sync checks **8/8 PASS**, full regression **596/596 PASS**.
  Remote PostgreSQL/RLS execution සහ independent review තවම
  `NOT_RUN / REVIEW_PENDING`.

- PostgreSQL focus-session event insert එක ලියා ඇති බව `returning sequence` මගින්
  තහවුරු නොවුණොත් session update එකෙන් success නොකියන ලෙස fail-closed කළා.
  Database acknowledgement නැති අවස්ථාවට regression test එකක් එක් කළා. Remote
  database execution සහ independent review තවම `REVIEW_PENDING`. Focused checks
  **7/7 PASS**; full regression **595/595 PASS**, TypeScript, affected ESLint සහ
  docs checkerත් **PASS**.

- PostgreSQL app-session create කිරීමේ `INSERT` එකෙන් `session_id` row එකක්
  ආපසු ලැබුණාදැයි තහවුරු නොකර success වාර්තා වීම වසා දැමුවා. `returning
  session_id` සහ database acknowledgement නැති විට fail-closed regression test
  එකක් එක් කළා. Remote auth/database execution සහ independent review තවම
  `REVIEW_PENDING`. Focused checks **4/4 PASS**; full regression **594/594
  PASS**, TypeScript, affected ESLint සහ docs checkerත් **PASS**.

- PostgreSQL domain mutation receipt එක ලියූ බව `returning mutation_id` row එකෙන්
  තහවුරු නොවුණොත් mutation එක සාර්ථක ලෙස වාර්තා නොකර
  `DEPENDENCY_UNAVAILABLE` ලෙස fail-closed කරන ලදී. Database acknowledgement
  නැති වීම සඳහා regression test එකක් එක් කළා; gateway test harness එකත් සැබෑ
  returning row එක නිරූපණය කරන ලෙස යාවත්කාලීන කළා. Focused checks **15/15
  PASS**; remote database execution සහ independent review තවම
  `REVIEW_PENDING`.

- Usage settlement receipt update එකේ affected row එක තහවුරු නොකර success කියන
  අවදානම වසා දැමුවා. `returning receipt_id` check එක සහ regression test එකක්
  එක් කළා. Focused usage checks **24/24 PASS**; remote provider/billing,
  PostgreSQL concurrency සහ independent review තවම `REVIEW_PENDING`. Full
  regression **592/592 PASS**, TypeScript, ESLint සහ docs checkerත් **PASS**.

- Usage settlement එකේ allowance counter එක වෙනස් වුණත් receipt status row එක
  update නොවුණොත් success කියන අවදානම වසා දැමුවා. `returning receipt_id`
  පරීක්ෂාවක් සහ fail-closed regression test එකක් එක් කළා. සැබෑ billing/provider
  execution සහ independent review තවම `REVIEW_PENDING`.

- App-session admission සහ revoke transition එක storage එකෙන් ලැබෙන registry row
  එකේ owner/session IDs, timestamps සහ status/revocation ගැළපීම නැවත validate
  කරන ලෙස fail-closed කළා. Corrupt row එකක් authorization හෝ revoke write එකක්
  බවට පත් නොවන regression test එකක් එක් කළා. Remote auth execution සහ
  independent review තවම `REVIEW_PENDING`. Focused auth/session checks
  **20/20 PASS**; full regression **591/591 PASS**, TypeScript, ESLint සහ docs
  checkerත් **PASS**.

- Revocation worker එක storage එකෙන් ලැබෙන claim record එකේ owner/session UUID,
  `processing` state, lease ID සහ lease expiry නැවත පරීක්ෂා කරන ලෙස fail-closed
  කළා. වැරදි හෝ පැරණි lease එකකින් provider action එකකට යාම වළක්වන regression
  test එකක් එක් කළා. Remote provider execution සහ independent review තවම
  `REVIEW_PENDING`. Focused revocation checks **12/12 PASS**; full regression
  **590/590 PASS**, TypeScript, ESLint සහ docs checkerත් **PASS**.

- සියලුම private-table migrations සඳහා RLS enable කිරීම සහ `public`/`anon`/
  `authenticated` table access revoke කිරීම අනිවාර්ය කරන migration safety
  regression guard එකක් එක් කළා. දැනට තිබෙන migrations වල security boundary
  වෙනස් කළේ නැහැ; remote execution සහ independent review තවම
  `REVIEW_PENDING`.

- PostgreSQL sync head එක update වූ බව row count එකෙන් තහවුරු නොකර සාර්ථක බව
  පෙන්විය හැකි අවදානම වසා දැමුවා. Transaction adapter සහ mutation change writer
  දෙකම `returning last_sequence` පරීක්ෂා කර row එකක් නොවෙනස් වුණොත් fail-closed
  වේ. Focused checks **11/11 PASS**; remote PostgreSQL/RLS සහ independent
  review තවම `REVIEW_PENDING`. Full regression **588/588 PASS**, TypeScript,
  affected ESLint සහ docs checkerත් **PASS**.

- Server pull එකෙන් නිකුත් කරන signed `payload.signature` cursor එක sync
  transaction boundary එකේ පැරණි single-segment validation නිසා නවතින ගැටලුව
  නිවැරදි කළා. පැරණි opaque cursor support එක රැකගෙන bounded signed format එක
  සහ regression test එකක් එක් කළා. Focused checks **15/15 PASS**; remote
  full regression suite **586/586 PASS**, TypeScript **PASS**, affected ESLint
  **PASS**, docs checker **PASS**; remote
  PostgreSQL/RLS, independent review සහ device verification තවම
  `REVIEW_PENDING` / `NOT_RUN`.

- Remote sync එකට නොගැලපෙන local mutation (`session.terminal`, malformed
  payload/target/command/ID) offline retry loop එකකට යවන්නේ නැතිව per-item
  permanent rejection ලෙස quarantine කරන ලෙස සකස් කළා. Batch එකේ කලින්
  accepted items අහිමි නොවන ලෙස partial result එක රැකේ. Focused tests සහ full
  regression evidence පසුව සටහන් කරයි; remote production sync තවම
  `REVIEW_PENDING`.

  Verification: focused sync checks **16/16 PASS**, full regression suite
  **585/585 PASS**, TypeScript **PASS**, affected ESLint **PASS**, සහ docs
  checker **PASS** (80/80 requirements). Remote production wiring සහ
  independent/device review තවම `REVIEW_PENDING`.

- Local sync pull apply validator එක server pull boundary එකෙන් එන signed
  `payload.signature` cursor පිළිගන්නා ලෙස ගලපලා, cursor එක page data සමඟ
  atomic store callback වෙතම යන regression test එකක් එක් කළා. පැරණි
  single-segment fixtures රැකේ; real server/local SQLite integration තවම
  `REVIEW_PENDING`.

- Server entitlement boundary එක malformed `verifiedBy`/`policyVersion` metadata
  එකක් නිසා access grant නොකරන ලෙස fail-closed කළා. Focused entitlement,
  PostgreSQL admission සහ usage checks වලින් පරීක්ෂා කරයි; live billing/provider
  execution සහ independent review තවම `REVIEW_PENDING`.

- App-session issue path එකේ owner-provided/verified `issuedAt` අගය record එකේ
  රැකගෙන PostgreSQL insert එකට parameter ලෙස යවන ලෙස නිවැරදි කළා; runtime
  clock එකෙන් නිහඬව වෙනස් timestamp එකක් හදන්නේ නැහැ. Adapter regression එකෙන්
  ඒක පරීක්ෂා කරයි. Remote auth execution සහ independent security review තවම
  `REVIEW_PENDING`.

- Local snapshot mirror validator එක server build එකෙන් එන signed
  `payload.signature` cursor පිළිගන්නා ලෙස server-side validators සමඟ ගලපලා,
  complete mirror swap regression test එකක් එකතු කළා. පැරණි cursor ආකෘතියද
  රැකේ; remote/device/independent review evidence තවම `REVIEW_PENDING`.

- Incremental sync cursor parser එක malformed base64 input එකේ raw decoder
  error නොපෙන්වා `SYNC_CURSOR_INVALID` ලෙස fail-closed වන ලෙසත්, token එකට
  උපරිම දිග සීමාවක් ඇති ලෙසත් දැඩි කළා. Focused checks සහ full regression
  results evidence record එකේ දක්වා ඇත; remote security execution සහ
  independent review තවම `REVIEW_PENDING`.

- Snapshot cursor validation materializer, staging සහ page reader අතර ගලපලා
  පැරණි single-segment cursors රැකගෙන signed `payload.signature` opaque cursors
  ද පිළිගන්නා ලෙස සකස් කළා. Build integration failure එකෙන් හමු වූ contract
  mismatch එකට regression coverage තිබේ; full suite evidence ඊළඟ check එකේ
  සටහන් කරයි. Remote execution සහ independent review තවම `REVIEW_PENDING`.

- Materializer → PostgreSQL staging composition candidate එකක් එකතු කළා.
  Authorized records pages වලට බෙදා signed cursors සමඟ existing transactional
  stager වෙත යවයි; staging failure propagate කරන අතර `ready` තත්ත්වය තමන්ම
  ප්‍රකාශ නොකරයි. Focused checks: **4/4 PASS**. Public job route, real
  PostgreSQL/RLS, secret custody, retention සහ independent review තවම
  `REVIEW_PENDING`.

- Snapshot materializer එකට asynchronous server-signed cursor factory එකක්
  බැඳිය හැකි කළා. Non-final page එකට signed next-page cursor එකක් සහ final
  page එකට `null` තබයි; owner, snapshot, page count, expiry සහ secret
  boundaries validate කරයි. Focused checks: **4/4 PASS**. Secret custody,
  route wiring, remote execution, RLS සහ independent review තවම
  `REVIEW_PENDING`.

- Snapshot page cursor handler composition candidate එකක් එකතු කළා. HMAC cursor
  verify වූ පසුව පමණක් signed owner/snapshot/page index එකෙන් page reader එකට
  යයි; client page index, foreign/tampered/expired/wrong-secret cursor විශ්වාස
  නොකරයි. Focused checks: **5/5 PASS**. Public route registration, secret
  custody, real RLS සහ independent review තවම `REVIEW_PENDING`.

- Snapshot page සඳහා owner/snapshot/page/expiry-bound HMAC opaque cursor
  candidate එකක් එකතු කළා. Incremental sync cursor එකෙන් scope එක වෙන් කරයි;
  tamper, foreign reuse, expiry සහ invalid secret tests තිබේ. Focused checks:
  **5/5 PASS**. Secret custody, route wiring, real RLS සහ independent review
  තවම `REVIEW_PENDING`.

- Snapshot materialization boundary එකක් එකතු කළා. Authorized records stable
  order එකට pages 100ක් බැගින් බෙදයි; empty snapshot, duplicate identity,
  malformed record, digest සහ cursor checks තිබේ. Focused checks: **5/5 PASS**.
  JCS implementation, cursor minting, real database materialization සහ review
  gates තවම `REVIEW_PENDING`.

- Snapshot metadata/page readers සඳහා verified actor-bound read-handler
  composition candidate එකක් එකතු කළා. Missing/expired/foreign rows safe
  `NOT_FOUND` ලෙස හසුරුවයි. Focused checks: **4/4 PASS**; route registry,
  opaque cursor wiring, real RLS සහ independent review තවම `REVIEW_PENDING`.

- Owner-bound, unexpired `ready` snapshot metadata reader candidate එකක් එකතු
  කළා. Contract version, digest, page count, timestamp සහ decimal PostgreSQL
  `bigint` validation තිබේ. Focused checks: **5/5 PASS**; job lifecycle, RLS,
  remote execution සහ independent review තවම `REVIEW_PENDING`.

- PostgreSQL snapshot staging adapter candidate එකක් එකතු කළා. Owner-bound
  metadata `FOR UPDATE`, immutable page retry/deduplication, complete-page
  `ready` transition, duplicate entity checks සහ PostgreSQL `bigint` සීමා
  enforce කරයි. Focused checks: **7/7 PASS**. Remote PostgreSQL execution,
  RLS, retention, independent security review සහ production migration තවම
  `REVIEW_PENDING`.

- PostgreSQL snapshot page reader candidate එකක් එකතු කළා. Owner-bound snapshot
  join, `ready` status, expiry check සහ malformed page fail-closed validation
  තිබේ. Entity identity/version/payload validation සහ PostgreSQL bigint
  high-water සහ snapshot metadata consistency handling ද එක් කළා. Focused checks:
  **7/7 PASS**; staging writes,
  retention සහ mirror swap
  තවම `REVIEW_PENDING`.

- Local migration safety contract checks එකතු කළා: version prefixes duplicate නොවීම,
  `BEGIN`/`COMMIT` transaction boundary සහ destructive reset statements නොතිබීම.
  Focused checks: **2/2 PASS**; remote rollback/restart verification තවම
  `REVIEW_PENDING`.

- Sync adapter එක private `focus_session` storage kind එක canonical wire
  `session` kind එකට pull වෙද්දී map කරන අතර, inbound `session` changes storage
  සඳහා legacy internal kind එකට normalize කරයි. Focused pull/transaction checks:
  **8/8 PASS**; remote sync runtime සහ independent review තවම
  `REVIEW_PENDING`.

- Owner-bound PostgreSQL read handlers එකතු කළා: profile, tasks, goals සහ focus sessions
  list/read operations. Fixed owner predicates, bounded result sizes, safe DTO mapping සහ
  privacy-preserving not-found behavior තිබේ. Focused coverage **3/3 PASS**; real SQL/RLS
  execution සහ independent review තවම `REVIEW_PENDING`.

- Gateway handler registry එක local PostgreSQL transaction සහ operation-specific appliers
  සමඟ සම්බන්ධ කළා. `createTask`, `patchTask`, task actions, goal create සහ session writes
  සඳහා verified context, idempotency receipt සහ SQL adapter එක එක chain එකක යයි. Focused
  coverage **3/3 PASS**; remote integration සහ independent review තවම `REVIEW_PENDING`.

- `applySessionEvent` සඳහා owner/version/sequence-bound PostgreSQL SQL applier candidate එක
  එකතු කළා. Pause/resume/complete/cancel event order, focused/paused milliseconds, state
  transitions සහ completion target enforce කරයි. Focused coverage **3/3 PASS**; SQL
  execution සහ independent review තවම `REVIEW_PENDING`.

- `applyTaskAction` සඳහා owner/version-bound PostgreSQL SQL applier candidate එක එකතු කළා.
  Begin/complete/cancel/archive transitions, route ID binding සහ deleted/terminal protection
  enforce කරයි. Focused coverage **3/3 PASS**; SQL execution සහ independent review තවම
  `REVIEW_PENDING`.

- `startSession` සඳහා owner-bound PostgreSQL SQL applier candidate එක එකතු කළා. Verified
  task title snapshot, seconds-based timer input, contract version 2 සහ unsafe/foreign
  task rejection enforce කරයි. Focused coverage **3/3 PASS**; SQL execution සහ
  independent review තවම `REVIEW_PENDING`.

- `createGoal` සඳහා owner-bound PostgreSQL SQL applier candidate එක එකතු කළා. Goal type/unit,
  positive target, ordered UTC instants, bounded timezone සහ allowlisted fields enforce කරයි.
  Focused coverage **3/3 PASS**; SQL execution සහ independent review තවම `REVIEW_PENDING`.

- `patchTask` සඳහා optimistic-version සහ owner-bound PostgreSQL SQL applier candidate එක
  එකතු කළා. Optional fields පැහැදිලිව update/clear කරයි; stale, foreign, deleted හෝ
  terminal records fail-closed කරයි. Focused coverage **3/3 PASS**; SQL execution සහ
  independent review තවම `REVIEW_PENDING`.

- `createTask` සඳහා owner-bound PostgreSQL SQL applier candidate එක එකතු කළා. Owner ID
  trusted context එකෙන් පමණක් ගනී; typed due fields parameterized SQL වෙත map කරයි;
  body owner injection සහ malformed result fail-closed කරයි. Focused coverage **3/3 PASS**.
  SQL execution සහ independent review තවම `REVIEW_PENDING`.

- Local PostgreSQL domain-mutation adapter contract එක එකතු කළා. `sync_heads` owner lock,
  receipt replay, exact mutation apply input සහ receipt insert එක caller-owned transaction
  එකක තබයි. Focused adapter coverage **4/4 PASS**; remote wiring සහ independent review
  තවම `REVIEW_PENDING`.

- Domain mutation transaction එක `requestSha256` සහ validated body එක adapter `apply` call එකට
  එකට ලබාදෙයි. එම නිසා PostgreSQL adapter එකට එකම transaction එක තුළ mutation apply කිරීමත්
  intent-bound receipt එක ලිවීමත් කළ හැක. Focused transaction coverage **6/6 PASS**.

- Gateway mutation hash එක server-derived handler context එකට ලබාදෙන ලෙස wiring කළා.
  Domain transaction එකට operation/path/validated body එකට බැඳුණු idempotency hash එකක්
  ලැබෙනවා. Focused execution test එකෙන් exact hash එක පරීක්ෂා කළා; PostgreSQL adapter
  wiring සහ independent security review තවම `REVIEW_PENDING`.

- Gateway mutation canonical hash helper එක එකතු කළා. Operation/path/body සඳහා
  key-order independent SHA-256 hash එකක් සාදයි; owner ID, token හෝ secret එකක්
  input එකට ඇතුළත් නොකරයි. Focused checks **3/3 PASS**; receipt/database wiring
  සහ PostgreSQL evidence තවම `REVIEW_PENDING`.

- Revocation retry schedule එක එකතු කළා. Attempt count අනුව exponential delay එකක්
  ගණනය කර bounded maximum එකක නවත්වයි; raw provider error වෙනුවට allowlisted
  code පමණක් තබයි. Focused checks **3/3 PASS**; production backoff policy සහ
  worker runtime තවම `REVIEW_PENDING`.

- Revocation outbox worker lease/fencing contract එක එකතු කළා. Claim එක worker සහ
  lease IDකට බැඳේ; stale completion ප්‍රතික්ෂේප කරයි; provider failure එක raw
  error නොතබා allowlisted code සහ retry time සමඟ schedule කරයි. Focused checks
  **4/4 PASS**; real worker/RPC concurrency තවම `REVIEW_PENDING`.

- App-session provider revocation outbox candidate එක එකතු කළා. Session revoke
  සහ durable outbox enqueue එක එක transaction එකක සිදු කරයි; provider API call එක
  transaction ඇතුළේ නොකරයි; replay/foreign/failure cases fail-closed. Focused
  checks **4/4 PASS**; actual worker/provider runtime තවම `REVIEW_PENDING`.

- Gateway rate-limit admission contract එක එකතු කළා. Actor සහ operation scoped
  atomic counter store එකක් හරහා bounded window/limit පරීක්ෂා කරයි; denied request
  `429 RATE_LIMITED`, malformed counter result `503` ලෙස fail-closed වේ.
  Focused checks **4/4 PASS**; distributed production limiter තවම `REVIEW_PENDING`.

- Domain mutation transaction contract එක එකතු කළා. Owner-head lock, owner/operation/
  mutation receipt replay, changed-payload conflict, domain apply සහ receipt write
  එකම caller-owned transaction එකක අනුපිළිවෙළට යයි. Focused checks **5/5 PASS**;
  සැබෑ PostgreSQL RPC/transaction execution තවම `REVIEW_PENDING`.

- Gateway success response validation එක එකතු කළා. Operation එකට ගැළපෙන
  `200/201` status, object body, undefined-field rejection, JSON serializability
  සහ 256 KiB response limit පරීක්ෂා කරයි. Invalid handler output success ලෙස
  නොයයි. Focused execution checks **7/7 PASS**; response schema/runtime තවම
  `REVIEW_PENDING`.

- Personal-core DTO semantic validation එක එකතු කළා. UUID, version, timestamp,
  duration, text, due, goal unit සහ session/task transition fields contract
  limits අනුව පරීක්ෂා කරයි. Invalid semantic payload handler/database layer වෙත
  නොයයි. Focused checks **4/4 PASS**; full schema/runtime integration තවම
  `REVIEW_PENDING`.

- Gateway entrypoint composition එක එකතු කළා. Request admission → route-specific
  DTO → owner authorization → domain handler යන අනුපිළිවෙළ එකම local entrypoint
  එකකින් පවත්වාගෙන යයි; malformed/foreign requests handler හෝ owner store වෙත
  නොයයි. Focused checks **4/4 PASS**; සැබෑ Edge Function runtime සහ database
  transaction තවම `REVIEW_PENDING`.


- Gateway owner authorization boundary එක එකතු කළා. Resource, workspace සහ
  linked goal/task owner IDs server-side store callback එකෙන් actor සමඟ සසඳයි;
  foreign/missing ownership `404` ලෙස fail-closed වන අතර handler එක ඊට පෙර
  නොකැඳවේ. Focused authorization/execution checks **9/9 PASS**; සැබෑ
  PostgreSQL/RLS transaction proof තවම `REVIEW_PENDING`.

- Domain handler execution boundary එක එකතු කළා. Admitted operation එකට අදාළ
  handler එක පමණක් server-derived actor/resource/body context සමඟ කැඳවයි; handler
  නැතිනම් හෝ raw error එකක් ආවොත් safe `DEPENDENCY_UNAVAILABLE` response එකක්
  පමණක් දෙයි. Focused checks **4/4 PASS**; සැබෑ domain/database handlers සහ
  Supabase runtime තවම `REVIEW_PENDING`.

- Personal-core operation DTO admission එක එකතු කළා. Route එක අනුව allowed සහ
  required body fields පරීක්ෂා කරයි; `ownerId` වැනි client ownership injection
  fields ප්‍රතික්ෂේප කරයි; task action ID එක path ID සමඟ ගැළපිය යුතුය. Focused
  checks **4/4 PASS**; full semantic schema validation, handler/database write
  සහ remote runtime තවම `REVIEW_PENDING`.

- Personal-core gateway route allowlist එක එකතු කළා. Approved OpenAPI operation
  14ක් method/path අනුව map කරයි; unknown route, wrong method සහ malformed
  resource UUID domain layer එකට යාමට පෙර fail-closed වේ. Router focused checks
  **3/3 PASS**; actual Edge Function handlers, database authorization සහ remote
  runtime තවම `REVIEW_PENDING`.

- Gateway request admission candidate එක එකතු කළා. `/v1` method/path, verified
  actor UUID, write idempotency key, request/body byte limits, JSON object shape
  සහ unknown-field rejection domain handler එකට පෙර සිදු කරයි. Gateway focused
  checks **5/5 PASS**; සැබෑ Edge Function route, provider auth සහ database
  transaction තවම `REVIEW_PENDING`.

- Usage reservation/settlement transaction helpers එකතු කළා. Allowance read,
  receipt replay check සහ reserve/consume/release write එක caller-owned
  transaction boundary එකකට බැඳේ. Usage focused checks **10/10 PASS**; සැබෑ
  PostgreSQL concurrency තවම `REVIEW_PENDING`.

- AI usage execution lifecycle එක තද කළා. Settled receipt replay එක provider
  call එකට යන්නේ නැහැ; reserved call success එක consume කරයි, provider failure
  එක release කරයි, settlement failure එක success ලෙස නොපෙන්වයි. Usage focused
  checks **9/9 PASS**; live provider/ledger තවම `REVIEW_PENDING`.

- Request session admission candidate එක එකතු කළා. Bearer token එක provider
  verifier එකෙන් තහවුරු කර active app-session registry row එක නැවත පරීක්ෂා
  කරයි; guest fallback, raw provider errors සහ malformed-token pass-through නැහැ.
  Focused checks **5/5 PASS**; live Auth/Edge Function runtime තවම
  `REVIEW_PENDING`.

- App-session revoke race boundary එක එකතු කළා. Registry read සහ revoke
  transition එක caller-owned transaction එකකින් එකට සිදු කරයි; issue path එකටත්
  transaction helper එකක් ඇත. Focused app-session checks **7/7 PASS**; සැබෑ
  Supabase transaction/runtime තවම `REVIEW_PENDING`.

- Backup export candidate එක එකතු කළා. Verified owner source එකෙන් records
  කියවා ownership/duplicate checks පසු digest-bound manifest එකක් සාදයි; source
  failures සඟවන්නේ නැහැ. Backup focused checks **11/11 PASS**; actual storage,
  retention සහ restore runtime තවම `REVIEW_PENDING`.

- Supabase server-side sync pull candidate එක එකතු කළා. Verified actor සහ signed
  cursor scope පරීක්ෂා කර owner-bound high-water page එකක් කියවයි; malformed,
  unordered හෝ store-failure result එක fail-closed වේ. Focused checks **4/4
  PASS**; remote read, RLS සහ independent review තවම `REVIEW_PENDING`.

- Supabase server-side sync transaction candidate එක එකතු කළා. Verified actor,
  cursor-owner binding, locked-head conflict, canonical replay hash සහ atomic
  change/head commit contract එක පනවයි. Focused checks **5/5 PASS**; PostgreSQL,
  Edge Function සහ independent review තවම `REVIEW_PENDING`.

- Stale sync cursor recovery සඳහා SQLite reset adapter එක එකතු කළා. Remote
  receipts/cursors පමණක් reset කර snapshot bootstrap එකට ඉඩ දෙයි; remote mirror,
  local tasks සහ pending work නොමකයි. Real SQLite recovery check **1/1 PASS**;
  සම්පූර්ණ suite **367/367 PASS**; cloud/device/independent review තවම
  `REVIEW_PENDING`.

- Incremental SQLite sync pull adapter එක එකතු කළා. Account-scoped sequence
  receipts, duplicate replay handling, conflicting replay rejection සහ cursor
  update එක එක transaction එකකින් සිදු කරයි. Cursor write failure එකේ entity,
  receipt සහ cursor rollback වේ. Focused checks **26/26 PASS** සහ සම්පූර්ණ suite
  **366/366 PASS**; cloud/device/independent review තවම `REVIEW_PENDING`.

- SQLite remote mirror apply candidate එක එකතු කළා. Account-scoped remote
  entities සහ sync cursor එක එකම transaction එකකින් replace කරයි; local domain
  rows, pending outbox සහ local overlay preserve කරයි. Simulated cursor-write
  failure එකේ පෙර mirror/cursor නැවත ලැබීම තහවුරු කළා. SQLite focused checks
  **21/21 PASS** සහ සම්පූර්ණ suite **365/365 PASS**; cloud/device/independent
  review තවම `REVIEW_PENDING`.

- Snapshot mirror apply boundary එක එකතු කළා. සම්පූර්ණ snapshot validation
  පසුව එක් atomic store callback එකකට entities යවයි; outbox සහ local overlay
  preserve flags අනිවාර්යයි. Apply-boundary checks **3/3 PASS**; සැබෑ domain-row
  swap සහ cloud/device verification තවම `REVIEW_PENDING`.

- Backup payload සඳහා canonical JSON SHA-256 digest helper එක එකතු කළා. Object
  key order වෙනස් වුණත් digest එක ස්ථාවරයි; data වෙනස් වුණොත් digest mismatch
  හඳුනාගත හැක. Backup focused checks **8/8 PASS**; actual backup storage සහ
  restore transaction තවම `REVIEW_PENDING`. Restore path එක caller digest එක
  පමණක් නොව payload එකම නැවත hash කරයි; focused checks **9/9 PASS**.

- Server boundary එකට allowlisted safe diagnostic log helper එක එකතු කළා.
  Error/message/stack/token values serialize නොකර event, status, stable code,
  retryability සහ bounded request ID පමණක් තබයි. Focused checks **5/5 PASS**;
  live log sink සහ secret rotation තවම `REVIEW_PENDING`.

- App-session issue/revoke lifecycle candidate එක එකතු කළා. Session issue එක
  verified owner UUID සහ valid expiry වලට බැඳී ඇත; revoke එක foreign owner,
  expired record සහ repeated revoke fail-closed කරයි. Focused checks **6/6
  PASS**; provider/session database transaction තවම `REVIEW_PENDING`.

- Usage allowance ledger සඳහා private Supabase migration candidate එකක් එකතු
  කළා. Owner/capability/period key, consumed/reserved limit check, composite
  replay receipt key, allowance foreign key සහ client direct grants නැති RLS
  boundary ඇත. Contract checks **12/12 PASS**; remote apply සහ PostgreSQL
  concurrency verification තවම `REVIEW_PENDING`.

- Server-side usage allowance decision boundary එක එකතු කළා. Verified active
  capability, owner, capability, period, policy version, consumed/reserved
  counters සහ bounded request units පරීක්ෂා කරයි; limit ඉක්මවීම fail-closed වේ.
  Payment/provider integration හෝ live charge එකක් නැහැ. Focused checks **7/7
  PASS** සහ replay-safe atomic reservation/consume/release contract checks
  **7/7 PASS**; actual database write integration තවම review gate යටතේ.

- Local SQLite snapshot staging adapter එක එකතු කළා. Snapshot header/page writes
  transaction එකකින් owner-scoped ලෙස සිදු කරයි; retry duplicate pages
  idempotent, වෙනස් replay conflict, incomplete finalize reject, reopen පසුව
  ready snapshot නැවත කියවිය හැක. Interrupted staging එක pages නොමකා failed
  state එකේ තබා explicit resume එකක් ලබාගනී. Validated snapshot orchestration එක
  owner-bound ලෙස stage/finalize කරයි; validated mirror pages live domain rows
  වෙනස් නොකර local staging වෙත map කරයි. Focused checks **20/20 PASS** සහ full suite
  **361/361 PASS**; mirror swap, crash recovery සහ device/cloud verification
  තවම `REVIEW_PENDING`.

- Local SQLite schema version **9** එකට owner-scoped snapshot staging සහ page
  tables එකතු කළා. High-water, page/digest, cursor, JSON validity සහ composite
  foreign-key checks ඇත; existing outbox, active session සහ resources tables
  වෙනස් නොවේ. Focused ownership/migration checks **17/17 PASS** සහ full suite
  **344/344 PASS**; actual mirror swap තවම `REVIEW_PENDING`.

- Sync snapshot staging සඳහා versioned migration candidate එකක් එකතු කළා.
  Owner-bound snapshot metadata/pages, high-water/page-count/digest constraints,
  expiry/status fields, composite page FK සහ private RLS boundary ඇත. Client
  direct grants නැහැ. Focused migration checks: **5/5 PASS**; PostgreSQL execution
  සහ ready-state transaction තවම `REVIEW_PENDING`.

- App-session registry සඳහා වෙනම versioned Supabase migration candidate එකක්
  එකතු කළා. Owner FK, active/revoked state, expiry constraints, index සහ RLS
  policies ඇත; `anon`/`authenticated` direct grants නොමැත. Focused migration
  checks: **4/4 PASS**; SQL execution සහ remote apply තවම `REVIEW_PENDING`.

- Server-side app-session registry admission candidate එක එකතු කළා. Provider
  verifier එකෙන් ලැබුණු issuer/audience/subject/session expiry claims සහ active
  registry row එක එකට පරීක්ෂා කරයි; revoked/foreign/missing sessions fail-closed.
  Focused checks: **3/3 PASS**; සැබෑ Supabase session registry සහ revocation
  transaction තවම `REVIEW_PENDING`.

- Snapshot mirror candidate එක complete pages, high-water, cursor, page digest සහ
  duplicate entity identities පරීක්ෂා කරලා එක staged-install callback එකකට පමණක්
  යවයි. Validation හෝ store failure එකකදී partial success නොපෙන්වයි. Focused
  checks: **3/3 PASS**; සැබෑ SQLite mirror swap/cloud snapshot තවම
  `REVIEW_PENDING`.

- Sync pull cursor එක stale වුණාම `SYNC_RESET_REQUIRED` සඳහා snapshot bootstrap
  ආරම්භ කරන recovery policy එක එකතු කළා. Local outbox සහ unsynced overlay රැකෙනවා;
  `AUTH_REQUIRED`, `ACCESS_DENIED`, rate-limit සහ transient failure වෙනම
  හැසිරවෙයි. Focused checks: **3/3 PASS**; actual cloud snapshot/install
  transaction තවම `REVIEW_PENDING`.

- Backup restore candidate එක දැන් සම්පූර්ණ payload එක validate කරලා, owner/schema/
  digest/empty-target checks පසු එක transaction callback එකකට පමණක් යවයි.
  Foreign හෝ duplicate records write වීමට පෙර ප්‍රතික්ෂේප වේ; transaction failure
  caller වෙත යන නිසා rollback/retry කළ හැක. Focused checks: **7/7 PASS**;
  actual SQLite/PostgreSQL restore transaction තවම `REVIEW_PENDING`.

- Remote client එක gatewayගේ nested safe error envelope එකෙන් `code` නිවැරදිව
  කියවයි. එමඟින් `ACCESS_DENIED` සහ `VERSION_CONFLICT` වැනි server decisions
  outbox quarantine policy එකට යන අතර private error message එකක් නොගනී.
  Focused checks: remote client **7/7 PASS**, remote sync pusher **6/6 PASS**;
  live gateway integration තවම `REVIEW_PENDING`.

- Local outbox sync එකේ server-side permanent rejection policy එක එකතු කළා.
  `ACCESS_DENIED`, `ENTITY_DELETED`, `VERSION_CONFLICT` සහ validation වැනි
  user-action අවශ්‍ය ප්‍රතික්ෂේප `rejected` ලෙස quarantine කරයි; network/transport
  failures පමණක් retry කරයි. Focused checks: **26/26 PASS**; actual remote
  mutation transaction සහ recovery UI තවම `REVIEW_PENDING`.

- Local sync pull adapter එකක් එකතු කළා. Change page එකේ cursor, sequence,
  entity IDs, entity kinds සහ page size පරීක්ෂා කරලා, page එකත් cursor එකත්
  එකම atomic store callback එකකට පමණක් යවයි. Validation හෝ storage failureකදී
  cursor advance නොවේ. Focused checks: **4/4 PASS**; real cloud pull/local
  mirror transaction තවම `REVIEW_PENDING`.

- Server mutation guard candidate එකක් එකතු කළා. Verified actor සහ resource
  ownership match වීම අනිවාර්යයි; foreign resources privacy-preserving
  `not_found` ලෙස ප්‍රතික්ෂේප වේ. එකම mutation receipt එකේ එකම payload නම්
  replay කරන අතර වෙනස් payload එකක් conflict වේ. Focused checks: **4/4 PASS**;
  actual database transaction/row-lock execution තවම `REVIEW_PENDING`.

- Sync mutation batch validation දැන් එක් එක් item එකේ UUID mutation ID,
  command සීමාව, UUID target ID, object payload සහ client ownership fields
  පරීක්ෂා කරයි. Invalid items server dispatcher එකට යන්නේ නැහැ. Focused
  gateway checks: **12/12 PASS**; per-item database authorization තවම
  `REVIEW_PENDING`.

- AI/cloud capability admission සඳහා server-only entitlement candidate එකක්
  එකතු කළා. Matching verified owner, capability, active status, policy version
  සහ expiry පමණක් පිළිගනී; client flags, prices හෝ provider claims වලින් access
  ලැබෙන්නේ නැහැ. Database reader එක server-only admission policy එකට compose
  කරලා active, expired සහ missing entitlement checks එකතු කළා. Focused checks:
  **7/7 PASS**, foreign-owner isolation check ඇතුළුව. Real billing/webhook/
  allowance ledger integration තවම
  `REVIEW_PENDING`.

- Entitlement, allowance/receipt සහ app-session migration candidates සඳහා RLS,
  owner binding, bounded counters, foreign keys සහ service-role access static
  contract checks එකතු කළා. Migration SQL එක remote Supabase එකට යොදා නැහැ.
  Outbox ownership, private provider-error boundary සහ lease fencing checks ද
  එක් කළා. Focused checks: **6/6 PASS**; remote execution, advisors සහ independent
  security review තවම `REVIEW_PENDING`.

- Usage reservation service එක entitlement read, allowance lock සහ receipt
  write එක එකම PostgreSQL transaction boundary එකකට compose කළා. Entitlement
  නැති විට allowance query එකට යන්නේ නැහැ. Reservation, settlement සහ
  admission/allowance snapshot checks: **8/8 PASS**;
  live provider, billing සහ remote database execution තවම `REVIEW_PENDING`.

- Non-destructive backup restore admission candidate එකක් එකතු කළා. Restore
  කිරීමට පෙර verified owner, schema version, payload SHA-256 සහ empty-target
  condition පරීක්ෂා කරයි; foreign/future/corrupt/overwrite cases fail-closed.
  Focused checks: **4/4 PASS**. Actual backup storage, restore transaction සහ
  retention policy තවම `REVIEW_PENDING`.

- Server boundary helpers now reject public/short/control-character secrets,
  non-HTTPS service URLs and raw provider/SQL/stack errors. Public error
  responses use stable safe codes only. Focused checks: **4/4 PASS**; actual
  secret-store injection and Edge Function runtime verification remain
  `REVIEW_PENDING`.

- Server-only signed sync cursor candidate එකක් එකතු කළා. Cursor එක owner,
  endpoint, page limit, decimal sequence high-water mark සහ expiry සමඟ HMAC
  signature එකකට බැඳේ; tamper, cross-account reuse, wrong limit, expiry සහ
  දුර්වල secret fail-closed වේ. Focused cursor checks: **4/4 PASS**. Key
  storage, rotation සහ live database integration `REVIEW_PENDING`.

- Personal sync gateway routing now includes bounded `GET /v1/sync` and
  `POST /v1/sync/mutations` contracts with actor-derived identity, cursor/page
  limits and a maximum batch of 25. Database cursor signing, transaction
  ordering and per-item authorization remain isolated review gates. Focused
  gateway checks: **11/11 PASS**.

- Mutation requests now carry a canonical JSON SHA-256 digest alongside the
  idempotency key, allowing the reviewed server/database receipt layer to
  distinguish a safe replay from the same key being reused with changed data.
  Raw tokens and secrets are not hashed or logged. Focused gateway checks:
  **9/9 PASS**; live receipt execution remains `REVIEW_PENDING`.

- Personal API gateway now fail-closes when the verified resolver returns a
  non-UUID actor, and regression coverage records expired/revoked-session
  rejection plus stable idempotency-key forwarding for server-side replay
  handling. Focused gateway checks: **8/8 PASS**; TypeScript and ESLint pass.
  This remains an isolated contract boundary, not live Supabase/RLS evidence.

- Backend migration candidate RLS now declares explicit owner-bound
  `SELECT`/`INSERT`/`UPDATE`/`DELETE` policies, including both existing-row and
  resulting-row checks for updates. Direct client grants remain revoked and
  the remote development project was not changed. Focused contract checks:
  **3/3 PASS**; TypeScript and affected-file ESLint pass. Isolated SQL/RLS
  penetration verification remains `REVIEW_PENDING`.

- Password recovery outcome messages now use the approved Sinhala/Tamil/English
  locale copy and do not expose provider error text directly in native recovery
  routes.

- The local account portal now clears password state when signing out and exposes
  its busy state to assistive technology; provider and sync behavior are
  unchanged.

- Native Sign In email and password validation now use the shared
  Sinhala/Tamil/English locale copy instead of hardcoded English messages;
  authentication behavior is unchanged.

- Home duration facts now use the selected locale's minute copy; Settings
  labels, stored seconds/minute values and timer behavior remain unchanged.

## 2026-10-09

- Onboarding profile application failures now use safe localized copy instead
  of exposing raw exception text; profile accessibility labels also use the
  selected locale. Focused check: **1/1 PASS**; TypeScript and ESLint pass.

- Assessment persistence now stores stable safe failure categories instead of
  copying arbitrary storage exception text into flow state. Focused check:
  **1/1 PASS**; TypeScript and ESLint pass.

- Focus setup preset labels and accessibility names now use the selected
  locale's minute copy instead of hardcoded English text. Focused check: **1/1
  PASS**; TypeScript and ESLint also pass.

- Teacher assignment draft saving state now uses localized Sinhala, Tamil and
  English copy instead of a hardcoded ellipsis. Focused check: **1/1 PASS**;
  TypeScript and ESLint also pass.

- Auth callback loading indicator now uses the localized callback loading title
  instead of a hardcoded English accessibility label. Focused checks are
  **2/2 PASS**; TypeScript and ESLint also pass.

- Settings duration and language option accessibility labels now use the
  localized section copy and distinguish selectable options from their parent
  cards. Focused settings/localization checks are **10/10 PASS**; TypeScript
  and ESLint also pass.

- Home focus hero accessibility labeling now reuses the selected locale's
  existing start-focus copy instead of a hardcoded English label. Focused
  checks are **4/4 PASS**; TypeScript and ESLint also pass. The full suite
  after the regression test is **305/305 PASS**.

- Onboarding assessment accessibility labels now use the approved localized
  copy for the back action and progress indicator. Focused assessment and
  locale checks are **8/8 PASS**; TypeScript and ESLint also pass. The full
  suite after the regression test is **304/304 PASS**.

- Auth session/configuration/link errors now use locale-aware safe copy in
  `AuthProvider` for Sinhala, Tamil and English. The focused auth-copy checks
  are **2/2 PASS**; TypeScript and ESLint also pass. The full suite after the
  regression test is **303/303 PASS**.

- Resource mutation failures now use localized, resource-specific safe copy
  instead of exposing raw storage error messages. The focused resource and
  locale checks are **5/5 PASS**; TypeScript and ESLint also pass. The full
  suite after adding the regression test is **302/302 PASS**.

- Resources loading state now uses resource-specific Sinhala/Tamil/English
  copy instead of the unrelated Tasks loading message. The focused check is
  **1/1 PASS** and the full suite is **301/301 PASS**.

- Tasks save failures now use the existing localized task copy, preserving the
  draft and list behavior. The focused check is **1/1 PASS** and the full suite
  is **300/300 PASS**.

- Progress History accessibility summaries now use localized history copy for
  the focus-time summary, filter-empty state and session-list count. The
  focused check is **1/1 PASS** and the full suite is **299/299 PASS**.

- Added a fail-closed Cloud Resources upload-intent boundary. It requires
  explicit selection, matching ownership, consent and a server-verified active
  entitlement, but performs no upload, download, quota reservation or charge;
  focused checks are **4/4 PASS** and the full suite is **298/298 PASS**.

- Added a Profile-linked local teacher assignment draft screen with Sinhala,
  Tamil and English labels, accessible fields and explicit save/error states.
  It remains device-local and performs no invite or cloud write; the current
  full suite remains **294/294 PASS**.
- Rebuilt the Android debug APK after the education UI slice: `assembleDebug`
  succeeded with **662** tasks (61 executed, 601 up-to-date). Device install,
  runtime and accessibility evidence remain `NOT_RUN` because no device was
  connected.
- A fresh Android device probe could not start the local `adb` daemon
  (`failed to check server version`); no device evidence was inferred.

- Added a local-only, versioned teacher assignment draft boundary with bounded
  text and Sri Lankan education metadata validation. It does not create classes,
  invite learners or send server writes; focused tests are **4/4 PASS** and the
  current full suite is **294/294 PASS**.
- Added SQLite v8 owner-scoped persistence for teacher assignment drafts. Newer
  revisions replace older local drafts, stale writes are rejected, owners remain
  isolated and corrupt metadata fails closed; storage tests are **3/3 PASS**.

- Progress summary and goal-card accessibility labels now use localized copy
  for totals, focus time and goal progress; analytics and navigation are
  unchanged. Progress tests are **4/4 PASS** and the full suite is
  **287/287 PASS**.
- Progress period selector accessibility now uses localized Progress copy;
  period selection and analytics calculations are unchanged. The full
  **287/287** suite remains pass.
- Active Task row accessibility labels now use localized ready-state copy
  instead of hard-coded `pending`; task behavior is unchanged. Tasks tests are
  **5/5 PASS** and the full suite is **287/287 PASS**.
- Task detail accessibility labels now use localized Task Detail copy for
  loading, summary, description, due-date and no-goal states. Task editing,
  validation and persistence are unchanged; Task detail tests are **19/19
  PASS** and the full suite is **287/287 PASS**.
- Profile signed-in status and sign-out accessibility labels now use the
  localized account copy; authentication and sign-out behavior are unchanged.
  The full **287/287** suite remains pass.
- Root auth-gate loading text and its accessibility label now use the existing
  localized sign-in loading copy. Secure session restore and route decisions are
  unchanged; the full **287/287** suite remains pass.
- Profile and Focus tab accessibility labels now use existing localized copy;
  the Focus tab no longer announces raw internal session statuses. Navigation
  and session behavior are unchanged; the full **287/287** suite remains pass.
- Settings accessibility labels now use the existing localized copy for loading,
  failure/retry, navigation, duration, appearance, language and local-data
  states. Settings persistence and save-retry behavior are unchanged; component
  tests are **6/6 PASS** and the full suite remains **287/287 PASS**.
- The True Zen Break route now localizes its timer, visible duration choices and
  duration-choice
  accessibility labels in `en`/`si`/`ta`; saved settings, retry behavior and
  countdown units are unchanged. Focused checks, typecheck, lint and the full
  **287/287** suite pass; human translation and device review remain pending.
- The active focus-session route now localizes its remaining-time warning,
  timer accessibility label and terminal history-save recovery message in
  `en`/`si`/`ta`, without changing seconds-based timing or persistence
  behavior. Locale/session tests, typecheck, lint and the full **286/286**
  suite pass; human translation and device review remain pending.
- Added a pure Task/Goal sync mutation-envelope draft. It binds each validated
  create payload to the verified actor and workspace and carries a UUID
  idempotency key; it does not enqueue or send remote writes. Invalid identity
  or mutation IDs fail closed. Focused tests are **5/5 PASS** and the bundled
  suite is **286/286 PASS**; server receipts, RLS, outbox integration and
  independent security review remain pending.
- New locally-created Tasks, Goals and Focus Sessions now receive UUID-shaped
  stable IDs while existing legacy IDs remain unchanged. Timer storage remains
  seconds-based; this only prepares new records for the reviewed server contract
  and does not enable remote sync. Stable-ID regression tests were added; the
  the bundled suite was **276/276 PASS** at that slice.
- Added a side-effect-free Task/Goal create-payload boundary that requires
  verified UUID record and workspace IDs, preserves explicit fields, and makes
  the seconds-to-milliseconds goal conversion explicit. It is not wired to
  remote writes until workspace bootstrap, server ownership and review gates
  exist; builder tests cover legacy-ID rejection and conversion safety.
- Added a fail-closed `/me` workspace-bootstrap parser that binds the returned
  profile to the already verified session actor, validates the personal
  workspace UUID and positive version, and rejects extra or malformed fields.
  It performs no network or local account write until the real backend exists;
  the bundled suite after this slice is **282/282 PASS**.
- Added the typed client boundary that requests only `GET /v1/me` and passes the
  response through the ownership-bound parser. It is not wired into auth startup
  or a deployed server, so it cannot create a local workspace from unverified
  data. The full bundled suite after this slice is **284/284 PASS**.
- Native Profile now shows the existing owner-scoped SQLite outbox status in
  Sinhala/Tamil/English. It reports loading, local read failure, no pending
  changes or pending local changes without claiming that secure remote sync is
  active. TypeScript, affected lint and the full **274/274** runtime suite pass;
  backend/RLS, independent security review and Android device verification stay
  pending. Evidence: `LOCAL-SYNC-STATUS-UI-2026-10-09.md`.
- Local personal API gateway boundary එක එක් කළා. Bearer identity, actor
  derivation, UUID idempotency, owner-field rejection, approved route mapping සහ
  safe dependency errors tests සමඟ සකස් කළා. මෙය Edge Function එකට deploy කරලා
  නැති local boundary එකක් පමණයි; RLS, transaction receipts සහ independent
  security review තවම pending.
- Local remote-sync dispatcher boundary එකක් එක් කළා. Approved personal API
  routes සඳහා command mapping, UUID idempotency keys, client-supplied owner
  field rejection, legacy seconds-based terminal snapshot rejection සහ
  permanent conflict/retryable error වෙන්කිරීම tests සමඟ සකස් කළා. එය app
  startup එකට හෝ remote project එකට තවම සම්බන්ධ කර නැහැ; reviewed gateway,
  server schema සහ independent security review අවශ්‍යයි.
- Supabase CLI `2.120.0` එක තාවකාලික, project එකෙන් පිටත runtime එකකින් භාවිත කර
  local `supabase/migrations/20261009071127_personal_core_v1.sql` schema candidate එක
  සකස් කළා. එහි private `df_private` tables, composite owner foreign keys,
  RLS enablement සහ direct client grants නැති බවට structural tests එකතු කළා.
  මෙය remote project එකට යොදා නැහැ; SQL execution, RLS penetration test සහ
  independent security review තවම `REVIEW_PENDING`.
- Local Android debug APK එක Gradle wrapper එකෙන් සාර්ථකව build කළා. APK hash
  සහ build output evidence එක `ANDROID-DEBUG-BUILD-2026-10-09.md` හි සටහන් කර ඇත.
  Device/emulator එකක් නොතිබූ නිසා install සහ Android end-to-end verification
  තවම `NOT_RUN`; backend security review සහ production release readiness ද
  තවම pending ය.
- Website tests `17/17`, TypeScript, ESLint සහ local optimized `next build`
  pass වුණා. Build එකෙන් static pages 16/16 generate වුණා. Sandboxed run එකේ
  Windows path access දෝෂයක් තිබුණත්, අවශ්‍ය local access සමඟ build එක
  සාර්ථකයි. Browser/provider/deployment review තවම pending; remote publish කළේ
  නැහැ.
- Account Portal session verification error එකට Sinhala/Tamil/English retry
  action එකක් එක් කළා. Provider error එකක් hidden success එකක් ලෙස නොපෙන්වා,
  userට නැවත session check කරන්න පුළුවන්; provider sync behavior වෙනස් කළේ නැහැ.
- Mobile no-guest route guard audit එක ලේඛනගත කළා. Signed-out usersට protected
  routes වෙත direct navigation කළත් sign-in වෙත යොමු වන අතර, session restore
  වනතුරු protected UI නොපෙන්වයි. Provider/RLS/device acceptance මෙයින් තහවුරු
  නොවේ.
- Sync outbox response validation එක තද කළා. එකම mutation එක accepted සහ
  rejected දෙකේම තිබුණොත්, duplicate ID තිබුණොත් හෝ foreign ID එකක් තිබුණොත්
  local mutation acknowledge නොකර retryable error එකක් තබයි. New regression
  test එක ඇතුළුව bundled-runtime suite එක **241/241 PASS** ලෙස නැවත පරීක්ෂා
  කළා. Real server/RLS sync තවම review-pending.
- Corrupt local outbox එකක duplicate `mutationId` තිබුණොත් remote push එකට යැවීම
  නවතා `SYNC_OUTBOX_INVALID` retry state එකක් තබන validation එකක් එක් කළා.
- Duplicate outbox regression test එකෙන් පසුව full bundled-runtime suite එක
  **242/242 PASS**. Corrupt local rows server push boundary එකට නොයන බව local
  safety test එකෙන් තහවුරු කළා; real backend sync තවම review-pending.
- Authenticated remote API boundary එකේ 2xx response එකක් වුණත් වැරදි JSON,
  array/scalar response හෝ decode failure එකක් නම් `REMOTE_RESPONSE_INVALID`
  ලෙස fail-closed කරන ලදි. Server error status fallback එක රැකගෙන focused
  boundary tests **6/6**, full bundled-runtime suite **244/244**, TypeScript සහ
  affected lint සහ project Expo lint pass වුණා. Remote server/RLS, independent
  security review සහ Android device verification තවම pending.
- Native Session History සහ Session Detail routes වල title,
  loading/error/empty states, filters, statuses, metrics සහ accessibility hints
  shared `en`/`si`/`ta` locale layer එකට ගෙනා. Focused history/locale tests
  **7/7**, full bundled-runtime suite **244/244**, TypeScript සහ affected lint
  pass. Translation review සහ Android device gate තවම `REVIEW_PENDING`; session
  storage/calculations වෙනස් කළේ නැහැ.
- Native Rewards route එකේ heading, loading/error/empty states, milestone copy,
  statuses සහ accessibility labels `en`/`si`/`ta` locale module එකට ගෙනා.
  Rewards tests **3/3**, full bundled-runtime suite **244/244**, TypeScript සහ
  affected lint pass. Reward calculations, session history සහ entitlement
  behavior වෙනස් කළේ නැහැ; translation/device review තවම pending.
- Native Progress route එකේ heading, loading/error/empty states, period controls,
  metrics, insight සහ navigation copy `en`/`si`/`ta` locale module එකට ගෙනා.
  Progress tests **4/4**, full bundled-runtime suite **244/244**, TypeScript සහ
  affected lint pass. Progress calculations, time windows සහ local storage
  behavior වෙනස් කළේ නැහැ; translation/device review තවම pending.
- Extended native Task Detail with locale-driven Sinhala/English labels for
  loading, editing, goals, dates, priorities, archive/delete actions and
  status copy. Existing accessibility labels and task safety behavior remain
  intact. Focused Task Detail tests pass 19/19; the current bundled-runtime
  regression suite passes 240/240. No backend, migration, dependency,
  production or release gate was changed.
- Extended native Settings with locale-driven Sinhala/Tamil/English sections,
  saved-error recovery, focus/break preferences, accessibility, privacy and
  account status copy. Existing settings persistence and timer units are
  unchanged; focused Settings tests pass 6/6.
- Extended the onboarding productivity-profile surface with Sinhala/English
  locale copy for saved-answer previews, retry/error states and the explicit
  local-settings confirmation flow. Assessment persistence and suggestion
  semantics are unchanged; focused onboarding tests pass 4/4.
- Extended the seven-question assessment screen with Sinhala/English locale
  copy for navigation, progress context, loading/error/retry, answer choices,
  skip and profile actions. Question IDs, validation and local persistence are
  unchanged; the bundled assessment suite remains 4/4.
- Extended the onboarding entry screen with Sinhala/English locale copy for
  its introduction, three-step explanation, privacy note and navigation
  actions. Assessment routing and answer-clearing behavior are unchanged.
- Added Tamil locale copy for the complete onboarding flow: entry, assessment
  and productivity profile. Question IDs, persistence, validation and explicit
  settings confirmation remain unchanged; human translation review is still
  required.

- Recorded a read-only backend gate: the local personal-core contract checker
  passed 36 DTO fixtures, 7 cursor fixtures, 14 operations and 9 declared
  prototype tables; the approved development Supabase project remains empty
  with zero migrations and zero security-advisor lints. This is not deployed
  schema/RLS proof. A fresh bundled-runtime root regression run passed 188/188,
  with typecheck, lint and documentation checks passing. No migration, remote
  write, dependency change, commit or push was made. See
  `revision/evidence/BACKEND-READONLY-GATE-2026-10-09.md`.
- Extended the approved `si/ta/en` locale layer to the native Plan, Focus and
  Profile tabs, including account state, recovery, preference and privacy copy.
  Timer, ownership and persistence behavior did not change; human translation
  and device accessibility review remain pending.
- Extended locale coverage to the local Plan My Day preview: time input,
  loading/error/empty states, task selection, reordering, proposal confirmation
  and start actions now use `si/ta/en` copy. The preview remains local-only;
  saved-plan lifecycle and AI provider integration remain review-pending.
- Extended the local account portal with `en/si/ta` copy selected from the
  HTTP-only site-locale cookie. Sign-in, sign-up, reset, session-state,
  sync-boundary and browser-secret safety messages are translated without
  changing provider authentication or private-data behavior. Portal sync
  remains review-pending.
- Extended the native Goals screen with locale-driven headings, goal composer,
  validation, loading/error/empty states and accessibility labels for
  `en`/`si`/`ta`. Goal storage, calculations, seconds units and ownership
  behavior did not change.
- Extended the native Tasks screen with locale-driven headings, composer,
  validation, loading/error/empty states, archive controls and task-row
  accessibility labels for `en`/`si`/`ta`. Task persistence, retry behavior,
  completion semantics and owner boundaries did not change.
- Extended the native Focus setup screen with locale-driven task selection,
  duration choices, loading/error validation and start/back actions for
  `en`/`si`/`ta`. Timer state, duration bounds and saved settings behavior did
  not change.
- Removed the unnecessary Windows-sensitive Turbopack root override from the
  local website config. An elevated local verification then completed the
  Next.js production build successfully: compile, TypeScript, page data and
  static generation for all 16 pages. This is build evidence only; no hosting
  or deployment was performed.
- Extended the native Session Summary screen with locale-driven completion,
  cancellation, metrics, status and next-session copy for `en`/`si`/`ta`.
  Session calculations, stored history and seconds-based units did not change.
- Started the local-resource foundation with bounded domain validation for
  user-entered references and explicit HTTPS links. Unsafe schemes, embedded
  credentials, control characters and invalid bounds are rejected; no network
  fetch, file import, cloud upload, AI input or task persistence was added in
  this slice.
- Added a local SQLite v6 resource repository for explicit references and
  HTTPS links. Resources and task links are owner-scoped, revision-checked,
  duplicate-safe and transaction-backed; missing resources are retained rather
  than deleted, and corrupt rows fail closed. Added five real SQLite regression
  tests plus the existing ownership suite; the fresh focused run passed 22/22.
  This remains `REVIEW_PENDING`: no file picker/import, cloud upload, AI input,
  paid storage, UI or production migration was added.
- Fresh full verification after the resource slice passed `196/196` root tests,
  root typecheck, root lint, documentation checks and `git diff --check`.
  The test-run module warnings are tooling warnings only; no test was skipped.
- Added an isolated configurable AI-planning provider boundary with a
  deterministic local mock. It validates bounded task input, returns a
  proposal marked as requiring confirmation, and rejects mismatched or early
  confirmations without changing tasks. No OpenAI request, credential, cost,
  allowance or live provider integration was added.
- Fresh full verification after the planning slice passed `199/199` root tests,
  typecheck, lint, documentation checks and `git diff --check`.
- Added a local advertising-policy guard only: it requires explicit consent and
  adult eligibility, and blocks ads on focus, recovery, True Zen Break, auth and
  settings surfaces. No advertising SDK, targeting, impression call or paid
  service was activated.
- Fresh full verification after the ad-policy slice passed `202/202` root tests,
  typecheck, lint, documentation checks and `git diff --check`.
- Added the first local Resources UI slice. Users can add bounded references or
  explicit HTTPS links, review locally stored items, and mark an item missing
  without deleting its history. The Profile screen links to it in all three
  supported locales. File import, network fetch, cloud upload and paid storage
  remain disabled.
- Added task-detail resource association. Users can link or unlink an active
  owner-scoped local resource revision without uploading or syncing content;
  focused task-detail coverage remains `19/19` passing.
- Added local confirmed-plan persistence for Plan My Day. SQLite v7 stores
  ordered plan items under the active owner, retires a replaced plan, rejects
  foreign tasks and rolls back invalid writes. No task status is changed and
  no AI request or remote sync is performed; focused UI/domain coverage is
  `11/11` passing.
- Added a tested local outbox sync orchestration boundary. It sends only due
  mutations in bounded batches, uses a stable retry idempotency key, acknowledges
  only explicit server mutation IDs, and retains rejected or malformed results
  for retry; concurrent calls for the same owner share one push. Focused sync
  coverage is `6/6` passing. No remote endpoint is enabled because the reviewed
  sync contract and backend runtime are still pending.
- Localized the Task detail resource-association labels, empty state and
  recoverable link errors through the approved `en`/`si`/`ta` locale layer;
  task behavior and storage boundaries are unchanged.
- Added a local-only entitlement decision boundary for AI and cloud resources.
  Core focus remains available, premium access requires a matching
  server-verified active entitlement, and the sandbox provider cannot purchase
  or restore anything. No prices, charges, billing provider or premium grant
  were enabled.
- Added a local classroom-policy foundation for synthetic/adult development
  fixtures: invite previews omit tokens, expired/revoked invites fail closed,
  and policy-version agreement is required. Real-minor pilot access remains
  disabled unless separately approved legal and pilot gates are present; no
  classroom data or remote sharing is enabled.

## 2026-10-08

- Added owner-scoped local UI-locale preference storage for the approved
  Sinhala, Tamil and English choices. Existing settings migrate additively to
  schema v5 with an English fallback; the Settings screen saves the choice
  without changing timer defaults. The locale now also drives the five primary
  native navigation labels through a small stable-ID copy layer. Full screen
  translations, font and accessibility review, and Android runtime verification
  remain pending.
- Added explicit local onboarding personalization: after review and confirmation,
  assessment choices can set future focus and break defaults; failed writes are
  visible and existing tasks/goals/session state remain unchanged. Device and
  human language/accessibility review remain pending.
- Added reduced-motion handling to the native splash overlay. The overlay stays
  static while the device preference is being read and skips the decorative
  animation when reduced motion is enabled; installed-device accessibility
  verification remains pending.
- Added an Android SQLite v4, owner-scoped durable outbox foundation for
  terminal focus-session mutations. History and the pending mutation commit
  atomically; retries, acknowledgement, payload-digest validation and account
  isolation are covered by real SQLite tests. This remains `REVIEW_PENDING` and
  is not a deployed backend sync implementation.

- Started the public-site locale preference foundation for the approved Sinhala, Tamil and English interface locales. Full page translations and human language/accessibility review remain pending; no site deployment.
- Localized public homepage copy and shared shell labels for Sinhala, Tamil and English. Other public content pages remain English and localized wording awaits human language review.
- Added Sinhala/Tamil copies for personal, education, roadmap, updates and help pages; untranslated commercial/legal/feature pages disclose that the content remains English.
- Added an evidence-based V1 implementation checklist that distinguishes local implementation, incomplete integrations, verification gates, and owner actions.
- Added local SQLite onboarding draft restore, serialized/revision-checked saves, retry-visible errors, and owner-scoped cancellation for skipped assessments. Applying suggestions to settings/tasks remains separate and pending.
- Added an explicit local Plan My Day proposal confirmation gate before starting a proposed task. It remains an in-memory confirmation only; no plan, schedule, reminder, AI call or task mutation is persisted.
- Added provider-backed email/password and Google development flows to the local account portal using only the publishable Supabase key. Private sync, privileged credentials and deletion controls remain review-pending.
- Added a tested remote API client boundary that requires authenticated bearer
  access, HTTPS `/v1/` paths and idempotency keys for mutations while preserving
  server conflict codes; no remote endpoint was contacted.
- Added a local account-portal status foundation that refuses fake sessions and clearly separates pending provider/backend work from the public preview.
- Rebuilt the local Android debug APK successfully (exit code 0) and recorded
  its artifact hash. Device installation and runtime verification remain
  `NOT_RUN` because no Android device or emulator is attached.
- Added an additive local SQLite v3 default-focus-duration setting (25/45/60
  minutes), Settings controls, and Focus Session Setup restoration. Existing
  break settings and older local data remain preserved; persisted-storage review
  and installed-device verification remain pending.
- Added ignored local development configuration for the approved Supabase
  development project using only its publishable client values; no private key,
  remote schema write or deployment was performed.

## Unreleased — 2026-10-08

- Personal Assessment now has a versioned seven-question V1 definition with
  stable question/option IDs, required-answer validation, reversible choices,
  and a deterministic profile that separates exactly what the user shared
  from optional starting suggestions. Answers remain only in the onboarding
  flow's memory and are cleared when it is left; they do not modify settings or
  tasks. This is a preview only, not persisted onboarding. Storage wiring waits
  for independent review and Android migration verification. Focused domain and
  route tests: 6/6 PASS; see
  [assessment profile evidence](revision/evidence/ASSESSMENT-PROFILE-IN-MEMORY-2026-10-08.md).

## Unreleased — 2026-10-07

- Prepared an isolated HIGH-risk auth owner-binding candidate using Supabase
  `getClaims()` and same-account SecureStore offline binding. It is deliberately
  not wired into the active `AuthProvider`; the existing auth path remains
  unchanged pending independent security review. Mocked tests do not prove
  native SecureStore, real Supabase, offline, or account-switch behavior. See
  [auth owner-binding evidence](revision/evidence/AUTH-SESSION-OWNER-BINDING-2026-10-07.md).
- The public Features page now shows an evidence-linked status for core focus,
  tasks/progress, Plan My Day and the Account Portal, with surface and date.
  Every item is explicitly unreleased; prototype/plan limitations remain visible.
  Responsive cards follow light/dark text contrast checks. Public copy is still
  pending independent content/accessibility review and has not been published.
  Web suite: 9/9 PASS; TypeScript, ESLint and Next.js build pass (15 static
  routes generated). Browser/screen-reader checks remain NOT_RUN. See
  [feature-status evidence](revision/evidence/WEB-FEATURE-STATUS-2026-10-07.md).
- Added owner-scoped SQLite assessment-draft tables and a version-2 local schema
  upgrade. Draft answers are type-checked, saved atomically with revision checks,
  and can be reopened; the upgrade rollback/retry, duplicate, concurrent-writer,
  corrupted-value and account-isolation cases use real SQLite. This is storage
  groundwork only: onboarding UI is not wired, assessment questions/result rules
  remain separate, and the high-risk migration is `REVIEW_PENDING`. Focused real
  SQLite suite: 15/15 PASS; whole-suite results are in the evidence note. No
  production database was opened or migrated. See
  [assessment-storage evidence](revision/evidence/ASSESSMENT-STORAGE-V2-2026-10-07.md).
- Rewards now distinguishes a failed local session-history read from a genuine
  empty history. Failures show a generic accessible message and retry action;
  milestone totals render only after a successful read. No reward rules, writes,
  or trusted XP were added. Route regressions: 3/3 PASS; combined checks recorded
  in the task evidence. Device/screen-reader verification remains NOT_RUN. See
  [Rewards recovery evidence](revision/evidence/REWARDS-READ-RECOVERY-2026-10-07.md).
- Plan My Day suggestions now preserve a user-controlled task order. Accessible
  earlier/later controls reorder only visible blocks, disable at list boundaries,
  and use 48dp targets. This changes only the in-memory preview; it does not save
  a plan or touch tasks. Available time now rejects values below the approved
  25-minute starting duration and integers outside JavaScript's safe range with
  an accessible explanation. Tests: focused route 6/6 PASS; full suite 163/163
  PASS; typecheck and affected-file ESLint pass. See
  [proposal-order evidence](revision/evidence/PLAN-MY-DAY-PROPOSAL-ORDER-2026-10-07.md).
- Plan My Day now distinguishes task loading, a local read failure with retry,
  and a successfully empty task list. A delayed read resolving after the route
  loses focus is ignored; proposal controls remain disabled until tasks load.
  This is local recovery only—the proposal is still heuristic, not OpenAI-backed,
  and it does not write tasks or schedules. Route regressions: 3/3 PASS; full
  suite: 160/160 PASS; typecheck and affected-file ESLint pass. See
  [Plan My Day recovery evidence](revision/evidence/PLAN-MY-DAY-READ-RECOVERY-2026-10-07.md).
- The public-site header now switches to a native, keyboard-operable disclosure
  on small screens, keeping the menu reachable without JavaScript and giving its
  trigger and links 48px minimum targets with visible focus. Desktop navigation
  remains unchanged. Web suite 8/8, TypeScript, ESLint and Next production build
  pass; browser/screen-reader checks remain NOT_RUN. See the
  [small-screen navigation evidence](revision/evidence/WEB-MOBILE-NAV-2026-10-07.md).
- Progress now has local week/month/all-time summaries for actual focused
  seconds (including ended-early sessions), completed-session count, completed
  tasks and saved goal progress, plus a timezone-aware weekly activity chart.
  Conflicting or invalid local records fail closed instead of inflating totals
  or appearing as zero; no client reward/XP grants or cloud analytics were
  added. Domain and route tests pass; the current combined full suite is
  156/156. TypeScript and direct affected-file ESLint pass. Native/device,
  localization, and independent review
  remain pending. See
  [local Progress evidence](revision/evidence/PROGRESS-LOCAL-ANALYTICS-2026-10-07.md).
- Settings now load and save the existing 5/10/15-minute default break choice
  with distinct loading/read-error states, serialized updates, and truthful
  save-failure recovery. The old value remains selected until SQLite confirms
  the write; web reports the unsupported local-SQLite path instead of claiming
  an in-memory value was persisted. No settings schema/migration changed. Four
  route regressions cover load, save, retry and duplicate writes; the combined
  suite is 156/156 PASS, with typecheck and affected-file ESLint PASS. Native
  device/review checks remain pending. See
  [Settings recovery evidence](revision/evidence/SETTINGS-BREAK-RECOVERY-2026-10-07.md).
- The optional break screen now handles saved-setting read failures without an
  unhandled rejection. It offers retry, or lets the user explicitly choose an
  unsaved break length without overwriting preferences; it only starts once a
  saved or manually chosen length is known. Three route regressions cover saved
  default, read failure/manual choice and retry. Combined suite: 151/151 PASS;
  typecheck and affected ESLint pass. Android verification is NOT_RUN. See
  [break recovery evidence](revision/evidence/FOCUS-BREAK-SETTINGS-RECOVERY-2026-10-07.md).
- Tasks can now be archived and restored without deleting the task, changing
  its ID, or detaching focus history. Archive state is owner-scoped, revision-
  checked and retained through the existing JSON extension field (no schema
  migration); archived records are hidden from active lists and Plan My Day,
  remain discoverable on request, cannot start new focus work, and remain in
  history/progress sources. SQLite tests cover reopen/retry, stale revisions,
  owner isolation and history preservation; route tests cover restore/error and
  list behavior. Full suite: 156/156 PASS; typecheck and affected ESLint PASS.
  Independent review/device checks remain pending. See
  [task archive evidence](revision/evidence/TASK-ARCHIVE-2026-10-07.md).
- Recorded the owner's expanded V1 implementation authorization: Supabase Auth,
  backend, secure sync, Google/email sign-in, Apple-ready iOS flow, no guest mode,
  and the exact `deep-focus-dev` project. This records scope only; it does not
  claim authentication, account isolation, provider setup, independent review,
  device verification or release readiness. See
  [authorization and auth task brief](revision/evidence/V1-AUTH-FOUNDATION-TASK-2026-10-07.md).
- Added a `REVIEW_PENDING` mobile authentication/local-identity candidate:
  SecureStore-backed Supabase Auth, email/password, Google PKCE, Apple iOS,
  verification/recovery routes, signed-out gating, sign-out, and account-scoped
  SQLite namespaces. Auth service/route-gate tests cover key error and callback
  replay paths. Provider configuration, backend/RLS/sync, native behavior and
  independent security review are still unverified; this is not release-ready.
- Task detail and Plan My Day now pass a stored `taskId` into focus setup. Setup
  and the session hook resolve the task in the active owner namespace; session
  history stores the stable relationship and title snapshot. Missing/completed
  tasks fail closed, and SQLite's existing composite owner foreign key rejects
  cross-owner references. Focus/session, real-SQLite ownership and task-route
  regressions pass; this persisted HIGH-risk slice remains `REVIEW_PENDING` for
  independent storage/ownership review and native verification.
- Task detail now supports editing an active task's title. SQLite performs an
  owner-scoped conditional update against the loaded `updatedAt`, preserves the
  stable task ID, returns the database timestamp, and refuses stale or terminal
  task edits. Failed saves retain the draft; conflicts offer a reload instead
  of overwriting newer data. The focused route/SQLite tests pass; task editing
  remains part of the broader task lifecycle `REVIEW_PENDING` and has not had
  native accessibility/device verification.
- The same task editor now also supports the existing optional description and
  low/medium/high priority fields. They are validated and updated with the title
  in the same owner-scoped, revision-checked SQLite statement; goal links and due
  dates are preserved. No new schema fields were added. Actual tests are recorded
  in the task evidence; due-date editing and a separate reversible archive state
  remain open.
- Task editing can now associate a task with one of the active goals owned by
  the current local namespace, or clear the optional link. SQLite's composite
  owner/goal foreign key rejects cross-account links. A storage regression found
  and fixed stale duplicate `goalId`/priority/due-date values being resurrected
  from legacy JSON after typed-column updates. Goal-read errors are recoverable;
  no account sync or goal-progress formula changed. Independent review remains
  pending.
- Task deletion is now an explicit confirmation flow. The owner-scoped SQLite
  transaction detaches linked focus sessions by clearing only `task_id`, keeps
  each existing `task_name` snapshot (or the task title when no snapshot exists),
  and then deletes the task. Revision mismatch, duplicate requests, and write
  failure do not delete newer data or history. Independent review and device
  verification remain pending; see the task deletion evidence.
- Goal detail now edits the title and target for active current-period goals.
  Focus targets show minutes while SQLite continues storing seconds; period
  boundaries, type, status, identity and derived progress are preserved. Writes
  are owner-scoped and revision-checked; failures retain the draft and stale
  revisions require reload. Route and real-SQLite regressions cover retry,
  conflict, unit conversion and account isolation. Independent review remains
  `REVIEW_PENDING`; device verification is `NOT_RUN`. See the
  [goal-edit evidence](revision/evidence/GOAL-EDIT-2026-10-07.md).
- Goal detail now offers confirmed goal deletion. SQLite checks the loaded goal
  revision and atomically unlinks its tasks (advancing task revisions) before
  deleting the goal; task records and focus history remain. Stale requests and
  injected transaction failure leave the goal and links unchanged. Independent
  review remains `REVIEW_PENDING`; Android device/accessibility checks are
  `NOT_RUN`. See the [goal-deletion evidence](revision/evidence/GOAL-DELETE-2026-10-07.md).
- Task detail now edits an optional due date using strict `YYYY-MM-DD` input,
  stored as UTC midnight for stable cross-device calendar dates. Existing dates
  remain unchanged unless edited; blank clears, invalid dates do not write. The
  local schema is unchanged; SQLite typed due-date values now override stale
  legacy JSON duplicates. Tests cover date parsing/formatting, failed validation,
  update/clear and account isolation. Independent review is `REVIEW_PENDING`;
  device keyboard/accessibility checks are `NOT_RUN`. See the
  [task-date evidence](revision/evidence/TASK-DUE-DATE-2026-10-07.md).
- Goals now complete automatically inside the same local SQLite transaction
  when verified session activity reaches the target. Focus-time counts actual
  focused seconds from completed/cancelled sessions; session-count counts
  completed sessions only. Completion records the first qualifying event time,
  is duplicate-safe and rolls back with a failed session write. Target edits and
  preserved local JSON imports also reconcile. Elapsed bounded goals become
  expired; verified late events still reconcile by their event time. No XP/reward
  grant was added.
  Independent storage/security review is `REVIEW_PENDING`; Android/device checks
  are `NOT_RUN`. See the
  [goal-completion evidence](revision/evidence/GOAL-AUTO-COMPLETION-2026-10-07.md).
- The combined domain, component, navigation and web regression suite now passes
  112/112 after these additions; root TypeScript check, changed-file ESLint and
  documentation checker also pass. This does not clear independent review or
  Android/iOS device gates.
- After goal lifecycle and task deadline additions, the combined regression
  suite passes 135/135. Root typecheck, affected-file ESLint, documentation
  checker, and diff check pass. Independent review and Android/device checks
  remain pending.
- Re-ran official npm 11.6.2 full and `--omit=dev` audits on the current tree:
  32 records (12 moderate, 20 high, 0 critical) in both reports. Triage did not
  establish compatible safe fixes, so no package/lockfile changes were made;
  SDK check remains clean. Reachability and release impact are recorded in the
  [dependency audit evidence](revision/evidence/Dependency-Audit-2026-10-06.md).

## Audit fixes — 2026-10-07

- Guarded terminal session history against stale active writes; moved local
  SQLite operations onto a private serialized connection with foreign keys
  checked before transactions. Failed initialization is retryable in-process.
- Preserved unchanged migrated goals during new-goal saves; save-failure waiting
  time now stays paused until explicit user resume. Tasks keeps drafts/list state
  on failed saves and exposes load/retry/saving states.
- Corrected Plans navigation and footer-note text contrast using theme tokens.
  Added regressions for all eight audit findings; combined suite passed 64/64.
- Independent/native/browser verification remains pending; no production-ready
  claim. Details: [audit-fix evidence](revision/evidence/AUDIT-FIXES-2026-10-06.md).
- Goals now distinguishes a failed local goals/session-history read from a real
  empty result, preserves existing data, and offers retry. Added route and domain
  failure/recovery tests. Save now prevents duplicate in-flight submissions,
  disables editing/cancel while pending, and preserves the draft on failure.
  Combined suite passes 71/71, root typecheck and focused ESLint pass. Native
  screen-reader/device behavior remains pending; see
  [Goals read-failure evidence](revision/evidence/GOAL-READ-FAILURE-2026-10-07.md).
- Task detail now loads only a persisted task by ID, reports recoverable read/save
  failures, and changes completion UI only after a successful write. Route titles
  are no longer passed or trusted; duplicate completion is guarded. Four focused
  regression cases are included. Goal detail now distinguishes storage errors
  from genuinely missing goals and offers retry. Session History list/detail also
  recover from read failures instead of showing false empty/missing states. The
  latest combined suite passes 82/82. Task lifecycle review and
  native interaction remain `REVIEW_PENDING`; see
  [Task detail evidence](revision/evidence/TASK-DETAIL-RECOVERY-2026-10-07.md).

All notable changes to the Deep Focus project should be documented in this file.

This changelog provides a chronological record of significant project updates and helps developers, contributors, and future users understand how Deep Focus has evolved over time.

The format is inspired by Keep a Changelog principles and adapted to the needs of the Deep Focus project.

The changelog should record completed and meaningful changes rather than planned or speculative work.

## Unreleased — 2026-10-06

- Corrected the public-site skip link to target the page's programmatically
  focusable `<main>` landmark on home, public content and not-found routes.
  Added regression assertions for all three render paths and small accent-text
  contrast across sampled light/dark page surfaces (minimum 5.75:1 and 6.06:1).
  Website tests 6/6, typecheck, ESLint, Next production build and local route
  response smoke check pass. Real keyboard/screen-reader browser verification
  remains pending.

- Applied 16 semver-compatible transitive dependency updates from a reviewed
  `npm audit fix` (without `--force`); root SDK/framework versions were not
  changed by this remediation step. The command's fresh audit output reported
  32 findings (20 high, 12 moderate, 0 critical), down from the recorded 38
  after SDK patch alignment. Remaining advisories include `braces`,
  `decode-uri-component`, `image-size`, `node-forge` and `uuid`; npm's proposed
  fixes for several require breaking Expo/router changes and were not applied.
  Fresh full and `--omit=dev` audits both confirm 32 findings (20 high,
  12 moderate, 0 critical): 7 direct and 25 transitive. The same graph under
  `--omit=dev` does not prove runtime exploitability. The final Expo SDK
  compatibility check reports dependencies up to date. Root tests
  47/47, root typecheck, focus ESLint, web tests 6/6, web typecheck/ESLint and
  Next production build pass. The website's fresh production-only audit reports
  0 findings; its full audit has five high dev-tool findings through `braces`,
  with no patched compatible path applied. Details and limitations:
  [dependency audit evidence](revision/evidence/Dependency-Audit-2026-10-06.md).

- Focus recovery now routes startup read failures to an explicit, retryable
  recovery state instead of leaving a rejected promise or implying there is no
  active session. The flow is read-only and preserves the active record. This
  HIGH-risk candidate remains `REVIEW_PENDING`; independent review and Android/
  iOS lifecycle evidence are not complete. Details:
  [focus recovery read-failure evidence](revision/evidence/FOCUS-RECOVERY-READ-FAILURE-2026-10-06.md).

- Added an isolated Next.js public-site preview with twelve static public routes,
  responsive navigation and reduced-motion support. It clearly labels the
  product as in development and does not fake accounts, prices, policies,
  downloads or support. Isolated website dependency installation succeeded;
  website tests, typecheck, ESLint and Next production build pass after fixing
  Turbopack root inference. Browser/accessibility review, account portal, legal
  review, locale QA, hosting and publication remain pending. Evidence:
  [WEB-01/02 preview](revision/evidence/WEB-01-public-preview-2026-10-06.md).

- Progress now distinguishes an unreadable session history from a genuinely
  empty one, gives a non-destructive retry, and avoids exposing storage error
  details. Added read-state and transient-retry regression tests. This does not
  alter stored data or progress calculations; native rendering and screen-reader
  behavior remain pending. Task evidence:
  [Progress read-failure slice](revision/evidence/UX-02-progress-read-failure-2026-10-06.md).
  Final focused suite: 43/43 pass; TypeScript typecheck, direct ESLint and docs
  checker pass. No platform interaction was run.
- Clarified Goals screen copy to distinguish focused time from completed-session
  count. Added direct regressions for both approved outcomes (cancelled session
  time counts; its session count does not). The complete mobile test command
  passes 45/45; root typecheck, focused ESLint, docs checker and whitespace check
  pass. No native device UI test was run. Details:
  [goal semantics evidence](revision/evidence/GOAL-SEMANTICS-UI-2026-10-06.md).

- Recorded owner-approved SQLite local-store, no-auto-account-claim, and ages
  15–17 development/legal release boundary decisions in canonical contracts.
- Added an Expo SQLite v1 schema/import repository draft and routed native task,
  goal, settings, and session storage adapters through it. Legacy JSON inputs are
  retained and import is transactional; production data/migration/deployment
  remain explicitly out of scope.
- Updated goal progress semantics: completed and cancelled sessions contribute
  confirmed seconds to time goals; only completed sessions count toward
  session-count goals. Existing legacy goal time units convert explicitly.
- Evidence: TypeScript typecheck, docs checker, in-memory SQLite DDL execution
  (7 tables), ESLint and whitespace check passed. The earlier 35-test run omitted
  the separate three-test Button suite; the historical 38-test baseline was 31
  timer/session + 4 navigation + 3 component tests. All 38 remain, and three new
  SQLite-backed migration/ownership tests bring the combined total to 41/41.
  The seven former JSON-adapter safety cases now run through SQLite and retain
  failure/retry/restart/concurrency/corruption/duplicate assertions. Tests use
  Node's built-in SQLite engine with a narrow Expo API shim, not an installed
  Android/iOS runtime. Independent review, native device checks, qualified legal
  review for real-minor access, and production migration/deployment remain pending.
- The initial install reported 40 vulnerabilities without retaining their
  advisory detail. On 2026-10-06, official npm CLI 11.21.0 ran from an isolated
  temporary folder with Node 24.19.0. Full and `--omit=dev` audits both returned
  40 findings (27 high, 13 moderate, 0 critical): 7 direct, 33 transitive, none
  exclusively dev-only in the production dependency graph. Project manifests
  were hash-checked unchanged. Actual app exploitability/binary reachability
  remain conditional and unverified; findings and remediation scope are in
  [the dated dependency audit evidence](revision/evidence/Dependency-Audit-2026-10-06.md).
  At the time of that initial read-only audit, no audit fix or dependency upgrade
  had been attempted; the later reviewed remediation is recorded at the top of
  this Unreleased section and in the linked evidence addendum.

---

## Versioning

---

Deep Focus intends to use Semantic Versioning principles for public releases where appropriate.

Version numbers generally follow the format:

`MAJOR.MINOR.PATCH`

Examples:

- `1.0.0`
- `1.1.0`
- `1.1.1`

In general:

- `MAJOR` represents significant incompatible or major product changes
- `MINOR` represents backward-compatible functionality or meaningful feature additions
- `PATCH` represents backward-compatible fixes and smaller corrections

Before the first stable public release, versioning may remain flexible while the product and release process are still evolving.

Version numbers should communicate meaningful differences between releases as clearly and consistently as practical.

---

## Change Categories

---

Changes may be recorded under the following categories:

## Unreleased

### Accessible loading state for shared buttons — 2026-10-06

- Loading buttons now expose a changed accessible name alongside their busy and
  disabled states; callers may supply localized loading copy. Added synthetic
  source-level component tests for loading, localization override and idle state;
  38/38 combined focus/navigation/component tests pass. Real VoiceOver/TalkBack
  announcement behavior remains NOT_RUN.

### Approved mobile navigation skeleton — 2026-10-06

- Aligned the tabs with Home / Plan / Focus / Progress / Profile. Plan links to
  existing Tasks and Goals; Rewards and session history now live under Progress.
  Legacy Analytics, Rewards and history routes redirect to their canonical
  destinations while preserving the history session ID.
- Added static navigation-contract checks. Expo Router cold/warm links, Back,
  account switching and Android/iOS behavior remain NOT_RUN; the read-only ADB
  inventory found no connected Android device.
- Focused verification: 35/35 session/timer/navigation tests pass; TypeScript
  typecheck and ESLint pass. Static checks do not establish native navigation
  behavior.
- The document-only experience checker passes: 27 routes, five aliases and 56
  proposed-token contrast pairs; these figures do not certify runtime UI.

### Session persistence recovery — 2026-10-06

- Surface active/history/cleanup write failures, serialize same-runtime storage
  operations, and persist terminal history before clearing the active recovery
  file. Identical terminal retries are idempotent; a pending terminal active file
  can be restored and finalized after restart. Malformed history is preserved.
- Added synthetic failure, retry, restart, conflicting-duplicate and
  concurrent-append tests; 31/31
  domain/boundary tests, typecheck and focused ESLint pass. The legacy JSON adapter
  still lacks a cross-process lock and atomic multi-file transaction; HIGH review
  and Android/iOS failure/restart evidence remain pending.

### Remaining timer contracts and guarded startup — 2026-10-06

- Fixed CR-T02/06/08: early completion retains the live session; invalid duration
  and malformed timing records reject explicitly. Preserved CR-T04/05 repairs
  and the existing seconds schema/engine return types.
- Timer startup now waits for hydration, catches validation/read errors, blocks
  controls/writes/auto-completion on error and preserves unreadable active data.
  Added loading/recovery UI, early-completion feedback, guarded break navigation
  and restored task-name display. New route duration follows setup's 5–180 range.
- 24 domain/boundary tests pass; typecheck and direct ESLint pass. Boundary tests
  use substituted React/platform scheduling, not device integration. See
  `tests/domain/README.md` for exact evidence and remaining storage risks.
- HIGH lifecycle candidate: independent review/device checks remain pending.
  No storage transaction rewrite, V2 migration, dependency changes or deployment.

### Focus timer projection corrections — 2026-10-06

- Corrected seconds-based projection of completed/cancelled sessions to use their
  stored totals, and treated an epoch-zero pause timestamp as present.
- Added CR-T04/CR-T05 regression coverage. The focused suite reports 7 pass and
  3 remaining failures (CR-T02/06/08); TypeScript check passes. Lint remains
  unverified because `npm` and `npx` are unavailable. No schema, UI, return type,
  persistence or V2 migration change; broader timer review remains pending.

### Optional onboarding prototype — 2026-10-06

- Added UI-P3 intro, optional conditional 9/10-step questionnaire, selected-change
  review, defaults, keep/resume/discard and Profile re-entry to the isolated preview.
- Added draft en/si/ta onboarding/card copy, independent learning-context/medium
  choices and personalized Home card. Sri Lanka is explicitly a metadata preview,
  not an installed/verified syllabus; no auth, provider, upload or persistence.
- New browser flow and existing interaction/motion checks pass. Native language,
  accessibility and production integration remain unverified; see
  `artifacts/ui-prototype/ONBOARDING.md` for evidence and Luna handoff.

### Prototype scenery and motion refinement — 2026-10-04

- UI-P2 adds layered day/night SVG scenery, finite entrance replay, start/pause
  feedback and completion check reveal to the isolated browser prototype.
- OS/manual reduced-motion and session scenery freeze tested; existing flows and
  320/390px checks pass. Visual approval and native performance remain pending.
  No production Expo code, providers or dependencies changed.

### Interactive UI reference — 2026-10-04

- Added isolated `artifacts/ui-prototype` Home/Plan/Focus browser preview with
  light/dark scenery, sample task and timer interactions, personal motivation
  controls, reduced-motion support, and local preview server.
- Edge interaction/320px/390px smoke checks passed; screenshots and limitations
  recorded in its README. No production Expo implementation or release readiness
  is claimed; final visual approval remains pending.

- October 3 FG-01: finalized the existing build guide as the single working
  entry, with canonical phases 0–10, required launch lanes and feature-specific
  pending inputs. Routed root/revision README, map and implementation plan to it;
  replaced the duplicate diagnostic handoff with a pointer to the coding prompt.
  Closed the broad editorial pass while retaining unresolved feature/review
  requirements. No new numbered document or app/source change.

- October 3 BH-01: inventoried eight OpenAPI sources / 82 operations and local
  schema references; documented four repeated component-name groups without
  flattening their meanings. Corrected the personal-core draft to reject a
  supplied empty cursor, with seven parameter fixtures. Prepared the first
  bounded coding-task handoff and refreshed actual timer diagnostic evidence
  (three passing cases, five existing gaps). No app repair or runtime API work.

- October 3 DH-01: consolidated remaining documentation into nine linked
  workstreams with concrete completion evidence, added a copyable read-only
  first-task handoff, and refreshed January capacity to 90 days / approximately
  321–450 gross owner hours. Preserved feature/review gates and identified API
  operation/schema ownership inventory as the next document task.

- October 1 EB-00: drafted typed classroom Edge/database preparation, crypto
  material and encrypted invitation result contracts; reconciled internal
  signatures/grants/recovery and added local bridge schema/model checks. Corrected
  the prose operation split to 13 mutations/nine reads against unchanged OpenAPI.
  No public API, app/SQL implementation or production key/nonce policy change;
  independent review and runtime integration remain pending.
- October 2 KN-00: drafted separate command/AES key custody options, committed-
  before-use nonce allocation/recovery rules, rotation/restore fencing and a
  reviewer-ready independent security review brief. No keys, KMS, allocator,
  provider account or runtime integration was created or approved.
- October 1 FA-00: recorded classroom adapter feasibility self-review, placed the
  incompatible SQL-only AES-GCM path on ADAPTER_HOLD and documented the proposed
  Edge/atomic-database correction. Added decoded-NUL guard/reference regressions
  and reconciled implementation warnings. No app/SQL/Edge implementation, provider
  change or independent security acceptance.
- September 30 HC-00: specified classroom canonical command digest/replay,
  closed-command denial, opaque cursor registry and invitation helper behavior;
  added synthetic encoding/HMAC/token and predicate-model fixtures/checker.
  Reconciled auxiliary-storage and helper references; public DTOs and app code
  unchanged. No SQL/crypto adapter, legal retention or production policy implemented.
- September 30 SF-00: documented 22 classroom internal function signatures,
  capability restrictions, seven ordered uncreated migration seams and isolated
  runner admission/barrier/oracle requirements; mapped all 40 TX/TI scenarios to
  required execution surfaces. Extended read-only contract checks; no SQL, runner,
  app, provider or production policy implemented and no runtime tests claimed.
- September 30 TI-00: selected draft private acceptance tombstone/live-FK and
  server-only Edge/PostgreSQL identity-bridge designs in packet 42; reconciled
  owner-head/session/class lock ordering and added 16 NOT_RUN integration scenarios.
  No public DTO, app code, SQL, role, credential or retention-policy change.
- September 30 CR-00: reconciled bounded-classroom references across canonical
  API/data/database/security/testing documents; added 22-operation/11-table access
  and integrity review matrices, privacy-export boundaries and six OPEN isolated
  SQL admission gates in packet 41. Expanded read-only document coverage checks;
  no migration, app implementation, new export DTO or independent acceptance.
- September 30: added draft classroom wire/data packet 40, 57 strict JSON Schema
  definitions, 22 OpenAPI operations, a read-only DTO/reference checker and 24
  NOT_RUN isolated transaction scenarios. Documented relational constraints,
  authorization/replay/locking and private-task recovery boundaries. No SQL,
  app code, deployment or independent security acceptance is claimed.
- September 29: added draft bounded-classroom packet 39 with eight implementation
  preparation cards, 24 NOT_RUN scenarios, explicit private/class payload and
  retry/revocation boundaries, inspected Task-storage prerequisites and six gates.
  Included primary-source authorization checks and canonical reconciliation map;
  no app/SQL implementation, independent review or runtime/security pass claimed.
- September 29: recorded bounded classroom sharing in the V1 target, January-first
  feature-deferral policy and delegated routine specification boundaries. Reconciled
  canonical scope/sequence and active education/release/owner summaries, preserving
  full productivity web later and required Website/Portal. No specific feature cut,
  app implementation, security acceptance or production readiness is claimed.
- September 28: added the twelve-field source-to-migration inventory, actual
  legacy reader limitations and six pending migration failure cases. A synthetic
  probe confirmed two pause histories can produce identical legacy JSON; clarified
  why conversion cannot recover lost precision. No real data read/migrated, app
  fix, new schema, ownership policy or independent review claimed.
- September 28: reconciled stale active summaries with already recorded teacher,
  locale, age-target, selected-stack and resource-format decisions. Updated the
  owner entry point to current core review/harness work. Kept legal, configuration,
  limits, translation/native QA and independent-review gates; no new approvals,
  application changes or production acceptance.
- September 28: prepared the seven-choice core review/reconciliation packet with
  specific questions, canonical destinations and evidence requirements. Corrected
  draft cutoff precedence after resume and clarified enclosing validation context;
  linked the Luna handoff/readiness gates. Self-review only, no canonical timing
  adoption, app/test code, installed package or independent sign-off.
- September 28: extended the harness investigation with the concrete renderer/
  reconciler React peer mismatch and a narrower uninstalled candidate. Expanded
  the existing core contract with seven proposed freeze choices, typed projection
  outcomes, eight fixture oracles and target-cutoff provenance across pause/resume.
  Updated readiness/playbook; no app fixes, schema migration or approval inferred.
- September 28: completed revision 38's test-harness proposal after interrupted
  research: no-new-package Node domain slice, exact future files/commands, eight
  acceptance cases and separate Expo/RNTL component gates. Recorded passing
  import smoke, deliberate failure canary and unchanged five engine gaps;
  no test-suite files, packages, app fixes or device/security verification added.
- September 28: refreshed the read-only core diagnostic (three checks pass,
  five existing contract gaps reproduced) and added revision 13's gap-to-caller
  handoff with regression oracles and exact next harness-proposal requirements.
  Updated playbook/readiness; no app fixes, dependencies or native tests claimed.
- September 28: added revision 37's proposed viewer permission/containment contract,
  separating Android/iOS feasibility, logical UI revocation, native quiescence and
  disk cleanup. Added view-lease/CLOSE_PENDING behavior and six NOT_RUN refinements
  of existing device cases. No permission/config/code change, adapter selection,
  runtime evidence or security acceptance; viewer integration remains HOLD.

- September 28: completed the bounded PDF-viewer source investigation in revision
  36 §7. Verified four public npm archive checksums in memory and matched eight
  viewer files to its release commit; corrected branch-versus-published plugin
  version assumptions. Recorded permission, parsing, loader/cleanup and review
  gaps with a HOLD disposition. No package installation, app edit, runtime test or
  complete transitive-security certification; all twelve device cases remain NOT_RUN.

- Added September 26 viewer compatibility research and isolated device-test plan
  (revision 36): inspected lock/installed native-stack baseline, primary-source
  candidate and plugin-version evidence, parser-engine distinctions, synthetic
  measurement/harness prerequisites and twelve NOT_RUN device cases. No library
  selected, installed or built; numeric policy, native security/accessibility
  evidence and independent review remain open. App behavior is unchanged.

- Recorded the later September 26 owner approval of initial PDF/JPG/PNG,
  website/video links and book/page references, with in-app read-only PDF/image
  viewing. Reconciled resource scope, options and readiness summaries. Numeric
  limits, detailed format restrictions, native adapters and production acceptance
  remain open; no code, dependencies or runtime behavior changed. ADR totals
  remain 2 approved / 9 partial / 1 open.

- Added the requested resource format/limit/viewer option sheet (September 26,
  revision 35): three scope alternatives, recommended bounded local PDFs/images,
  numerical prototype candidates with exact units, native/external/remote viewer
  tradeoffs and eight NOT_RUN probes. No owner approval, measured safety, PDF
  package choice, app change or paid-cloud allowance is inferred. Independent
  review and real native compatibility/security/accessibility evidence remain open.

- Recorded September 26 owner clarifications: desired 15+ product audience,
  intended Sri Lanka company publisher, resource-organising concept and planned
  AWS Device Farm/friends' Android testing. Consent, incorporation, merchant and
  format/size/viewer choices remain separate gates. Added revision 34's local
  import/open/recovery draft with five cards and twenty NOT_RUN cases; routed
  scope/readiness/test planning and document checks. No source, package, native,
  provider, purchase or deployment change; independent review remains pending.

- Reconciled the September 25 owner release answers: Android+iOS, Website/Portal,
  O/L/A/L/higher-stage education, independent personal-teacher launch, si/ta/en
  and optional paid cloud. Added revision 32's complete 80-family placement map;
  retained numeric-age/consent, exact feature, price/quota and operational gates.
  Added revision 33's source-backed paid-cloud admission/recovery draft, six cards
  and twenty NOT_RUN runtime cases. Updated scope/routing/readiness and structural
  checks; fifteen document/reference checkers PASS. No app, provider, purchase,
  migration or deployment change; independent review and real tests still pending.

- Added PL-05 saved-plan activation/pause/recovery draft (September 25): revision
  31, eight unfilled evidence gates, four cards, twelve NOT_RUN scenarios and a
  fail-closed reference checker. Completes the five PL specification drafts, not
  implementation or release acceptance. Specifies compatible writer/cursor rollout,
  preserved privacy duties, worker/receipt recovery and safe-forward boundaries.
  No app/API/SQL/config change, real rollout or independent review performed.

- Added PL-04 mobile saved-plan storage/outbox/editor recovery specification
  (September 20–21): revision 30, six cards, six open gates, twenty NOT_RUN device
  cases and a synthetic state/guard checker. Reconciled data/security/testing and
  documentation routing. Defines honest pending/receipt states, account fences,
  crash/conflict/privacy reset and reminder recovery; no app/package/SQL/OS
  implementation or capability activation. Independent review remains pending.

- Added PL-03 isolated database/RPC/migration test specification (September 20):
  revision 29, seven ordered cards, seven open gates and 24 detailed future cases,
  plus a structural packet checker. Separates prototype foundation gaps, trusted
  actor/privilege design, atomic commands, cutover and safe recovery. No executable
  SQL, runtime test, new API operation, app change or database action; independent
  review and actual implementation/evidence remain pending.

- Added account-export artifact draft (September 20): revision 28, nineteen schema
  definitions, fourteen typed sections, explicit deferred-family dispositions,
  snapshot/digest and private delivery rules; added reference checker and routing.
  EX-21–23 and the 60-operation API inventory are unchanged. Source mapping,
  deferred-family access, policy/runtime/independent review remain gates; no app,
  SQL, provider, cloud upload or deployment was performed.

- Added PL-02 replication/snapshot/export-component draft (September 20): revision
  27, 23 DTO definitions and six operations (60 across seven partial API files).
  Defines atomic groups, privacy epochs, legacy isolation and archived-plan export;
  added reference checker and reconciled routing/readiness docs. Full account-export
  packaging, real SQL/client tests and independent review remain open. No app,
  database, provider or deployment change; this is not a shipped sync feature.

- Completed the interrupted saved-plan management wire draft (September 20):
  revision 26, thirteen DTO definitions, two management operations (54 combined),
  exact reminder actions/versions and minimal receipts. Reconciled PG-05's
  undeployed current-plan read/header and added its document checker; initial
  interruption left stale fixtures and a missing checker, now addressed.
  No app/backend/SQL changes; replication/export wire and independent review
  remain pending. This records documentation work, not a shipped feature.

- Added the draft saved-plan lifecycle/privacy contract (revision 25): explicit
  edit/archive/restore/delete effects, known-context erasure, owner transactions,
  privacy-epoch artifact suppression and legacy/v2 sync boundaries; five bounded
  next packets and twelve future runtime cases. Added a read-only synthetic
  lifecycle checker and reconciled data/security/routing references. No wire/API
  count change, executable SQL, app/backend implementation or production action;
  strict lifecycle/replication DTOs and independent review remain pending.

- Added draft daily-plan focus/break/reminder contracts, strict generation/status/
  cancellation/revision/plan-read wire schemas and five OpenAPI operations (52
  across five slices). Proposed contractVersion 2 separates whole-plan confirmation
  from v1 task/reminder changes, with no progress awarded for planning. Added
  read-only negative/time/dependency checks; plan migrations, sync/export/deletion,
  provider/runtime integration and independent review remain gated. No app changes.

- Specified the proposed AI generation/reservation, lost-response recovery,
  cancellation-versus-completion, worker fencing and manual-revision lifecycles
  in revision 23, with a read-only transition model/reference checker and five
  follow-up cards / 24 future integration scenarios. Reconciled canonical timeout,
  cancellation and legacy data-shape notes. Strict generation wire/schedule/provider
  contracts and independent/runtime review remain open; the existing OpenAPI count
  is unchanged at 47. No application code, provider or database changes.

- Added the six remaining extension-inventory wire contracts for rewards/history,
  goal progress, AI usage, proposal retrieval and atomic selected apply, with
  strict schemas and read-only negative/semantic-reference fixtures. Four draft
  slices now cover 47 operations / all 33 extension rows, not the full V1 API.
  Reconciled the older editable AI-apply and introductory-five response examples;
  preserved no failed-generation debit, zero apply debit and explicit policy gates.
  Generation/revision/provider contracts, migrations and independent/runtime
  security verification remain incomplete. No application code changed.

- Added a critically reviewed, bounded engineering-workflow specification:
  documentation authority/map, risk/STOP/escalation rules, evidence-based
  Definition of Done, replaceable model mapping and task brief. Shortened root
  AGENTS/AI entry points with detailed constraints preserved in routed guardrails;
  reconciled playbook/contribution/development workflow and authorization language.
  Independent governance/security review remains pending; this is not a completed
  enterprise implementation freeze. No app/model/provider configuration changed.
- Corrected the draft SyncPull query schema to express its existing shared
  default limit of 50; no checker assertion was weakened and no runtime default
  application is implied.

- Added fifteen proposed sync/privacy/session/billing-visibility wire operations
  and strict DTO fixtures (41 unique operations across three partial OpenAPI
  slices). Specified snapshot/poll cursors, filtered profile-log mapping, lost
  deletion-response recovery via a pre-issued narrow status credential, secret
  replay isolation, app-session revocation and truthful billing states/IDs.
  Corrected an older ruleVersion-based reward deduplication reference. Exact
  security/TTL/key/merchant/price policies and provider-specific implementation
  remain gated; no app, SQL execution, payment, account deletion or deployment.

- Added a proposed twelve-operation extension OpenAPI slice alongside the
  fourteen-operation core, with strict break/reminder/page and typed soft-delete
  receipt schemas. Clarified bodyless delete/version-header normalization,
  direct/sync reuse, error codes and live pagination; extended document-only
  fixtures and cross-file contract checks. Corrected settings endpoint IDs and
  the stale fixed-five/ad-only packaging note. Restored required unobtrusive ads
  explicitly in the January admission checklist, added its release gate and
  refreshed capacity-date arithmetic. No API deployment, app changes, ad SDK,
  new owner policy, dependency, purchase or runtime-test pass is claimed.

- Reconciled legacy settings defaults/cloud API examples and clarified numeric
  XP examples, calendar-day ordering and minute/second/millisecond boundaries.
  Added a proposed settings/progress contract with five SP cards/24 NOT RUN cases,
  strict account-settings/analytics response shapes and truthful zero versus
  unavailable snapshots. Extended document fixtures to compare canonical settings
  examples with schemas and check reference unit arithmetic. Numeric reward/day
  policies, full extension APIs and actual migrations remain open; no app code,
  production default, XP formula, service or dependency changed.

- Reconciled both legacy Focus Bet stake/forfeiture sections, architecture reward
  references and misleading positive health-component examples with approved
  non-punitive/non-diagnostic rules. Retained clearly labelled prohibited examples
  and historical evidence. Aligned canonical strict-mode exit guidance; added
  proposed safety/commitment contract with four SC cards and twenty NOT RUN cases.
  Exact default/interaction/schema adoption remains gated; no app, health model,
  shielding capability or Emergency exit implementation was changed.

- Recorded September 17 owner approval that a separate Emergency exit remains
  available when ordinary End early is disabled through pre-session Settings.
  Synchronized scope, AI rules and revision decision/product/readiness summaries;
  exact interaction and in-session preference details remain open. Documentation
  only; no strict-mode or emergency-exit UI implementation is claimed.

- Reconciled the owner's safety/AI/advertising decisions in the requirement
  register, product/monetization/readiness summaries and canonical AI scope,
  vision, blueprint, plan, architecture, data/database/API, UI and testing rules.
  No missed-work XP penalties or unverified health predictions; limited free AI
  plus optional paid AI; unobtrusive initial-release ads required. Fixed-five/
  ad-only assumptions were superseded or marked as legacy examples. Pre-session
  exit configurability is recorded without inventing an emergency/hard-lock
  policy. Exact allowance/prices/ad settings and complete paid-AI contracts
  remain open. Documentation only; no app code or advertising service changed.

- Added remaining-backend and Website/Portal documentation: strict extension
  DTOs, fourteen sync command kinds, 33 extension/overlapping endpoint contracts,
  snapshot/replay/progress/AI/privacy-job/operations rules, eight BX cards and
  24 future cases. Added a 25-page/two-handler web manifest, ten WP cards/24 future
  cases and publication/rollback runbook. Consolidated readiness/owner decisions
  and corrected the cloud-settings assumption for local phrases/assessment data.
  Read-only checks passed 59 new DTO fixtures plus existing contract/document
  checks. No app code, provider, SQL migration, website scaffold or deployment
  changed; open policies and missing complete response/API/migration contracts
  remain explicit, not silently marked ready.

- Recorded approved Supabase Edge Functions API, Expo SQLite/SecureStore and
  Home/Plan/Focus/Progress/Profile navigation with Rewards under Progress.
  Reconciled the canonical 27-route inventory, architecture navigation and five
  UI examples; updated primary-brand/button guidance to the approved blue
  direction while exact tokens remain proposed. Added backend DTO/OpenAPI and
  guarded SQL prototype documentation, eight BE cards/eighteen future cases,
  and detailed experience/personalization/motivation contracts with eight UX
  cards/twenty-four future cases. Read-only checks passed 32 DTO fixtures and
  56 proposed contrast pairs, plus route/relative-link/ID consistency. These
  are document checks, not deployed backend, app UI, SQL/RLS or accessibility
  certification. No application code or production service was changed.

- Reconciled confirmed January Website/Account Portal inclusion, current weekly
  capacity, selected Auth and the reopened documentation phase in canonical scope,
  screen-map and implementation-plan clauses. Added detailed core lifecycle,
  save/retry/recovery and legacy-migration draft contracts, six CR cards and twenty
  acceptance scenarios. A read-only current-engine diagnostic ran eight synthetic
  checks: three passed and five existing contract gaps were reproduced. No app
  code or dependency was changed and no bug was fixed; detailed new schema and
  implementation choices remain gated. Extended structural documentation checks.
- Clarified education as students' study-work and teachers' independent preparation/marking organisation using their own resources, excluding Deep Focus-supplied papers, notes, videos and other academic materials. Added local-resource/import/recovery and optional paid-cloud draft contracts, six R cards and sixteen future acceptance scenarios. Recorded the owner's refinement from local-only storage to local default plus optional subscription cloud; added a dated provider-cost input snapshot and revenue/cost model without selecting retail prices, quotas or a cloud launch date. Updated affected product/data/security/scope references; no app code, storage service or paid checkout was changed.
- Recorded the owner's product-purpose clarification: organise work and make carrying it out easier across personal/professional and education contexts. Updated revision decision/product/education contracts to explicitly exclude academic lesson-video production/upload/hosting/sales; curriculum structure and optional resource-link proposals do not imply a course-content platform. Existing V1 and AI approval gates remain unchanged. Documentation only; no app functionality changed.
- Recorded the owner's Supabase PostgreSQL/Auth and Next.js Website/Account Portal selections on 2026-09-14 and reconciled those selections in architecture, security, database/API introductions and revision references. Hosting and detailed runtime/policies remain open. Added a cited Sri Lanka student/teacher research report and draft education ownership/flow contracts, ten bounded subcards and eighteen future acceptance scenarios. Updated the January privacy gate after verifying Gazette 2498/16. No infrastructure, app code, real-user pilot or deployment was changed.
- Added the initial research-backed enterprise documentation review draft in `docs/revision/`, including an 80-family requirements register, initially 12 pending architecture/product decisions, retained 20-app evidence, product/security/web/billing contracts, Luna task preparation, release gates and a structural documentation validator. Added README/AI-rules discovery notes. That initial draft did not approve providers, complete the canonical rewrite, fix application code or publish any feature; subsequent stack approval is recorded separately above.
- Implemented local focus-session history and session detail views.
- Added welcome, onboarding, assessment, productivity profile, and account-access UI flows.
- Added focus break, recovery, and automatic pause/resume navigation.
- Added Plan My Day proposal UI and connected account access from Profile and Settings.
- Improved settings with selectable break-duration controls while keeping unsupported sync, notification, and authentication behavior explicit.
- Persisted the selected default break duration locally across app restarts.
- Added a visible Session Recovery entry point under Profile > Your Focus.
- Fixed navigation wiring for Sign In, Create Account, Email Verification, and Forgot Password routes.
- Added `COLOR_SYSTEM.md` as the canonical source for Light/Dark palette values, semantic color meanings, component color mapping, and theme-governance rules.
- Replaced the implementation color foundation with the approved blue/teal productivity palette, calm light neutrals, deep navy dark surfaces, and consistent success/warning/danger/achievement roles.

- Added
- Changed
- Improved
- Fixed
- Removed
- Deprecated
- Security

### Added

Used for new functionality, capabilities, or significant project additions.

### Changed

Used when existing behavior, architecture, workflows, or requirements change meaningfully.

### Improved

Used as a Deep Focus project convention for meaningful enhancements that do not clearly represent entirely new functionality or defect fixes.

### Fixed

Used for resolved defects or incorrect behavior.

### Removed

Used for functionality, files, APIs, or supported behavior that has been removed.

### Deprecated

Used for functionality that remains available but is planned for future removal or replacement.

### Security

Used for meaningful security-related changes or fixes that are appropriate to document publicly.

Not every category needs to appear in every release.

Empty categories should be omitted from finalized release entries.

---

## Unreleased

---

The `Unreleased` section contains notable completed changes that have not yet been included in a public release.

Only work that has actually been completed should be recorded here.

### Added

- Initial project documentation
- Project vision
- Product blueprint
- UI/UX design specification
- Component library
- AI development rules
- Architecture documentation
- Development guide
- Contribution guide
- Testing strategy
- Initial changelog structure
- EAS development, preview, production, and submission configuration
- Added the initial shared design-token foundation for colors, typography, spacing, radii, shadows, opacity, motion, and layout.
- Added an accessible shared Button component with primary, secondary, ghost, destructive, disabled, and loading states
- Added canonical V1 and post-V1 feature-scope documents, including permanent links to the pre-change documentation snapshot
- Added a canonical V1 screen map covering full-screen routes, primary navigation, contextual interfaces, and unresolved implementation decisions
- Added local task and weekly-goal creation, detail, completion, and progress flows.
- Added Home-matched Focus, Analytics, Rewards, Profile, Settings, Task, and Goal screens with accessible empty and loading states.
- Added `COLOR_SYSTEM.md` as the canonical design-system reference for Light/Dark colors and semantic color roles.

### Changed

- Renamed the application configuration and package metadata from MyFirstApp to Deep Focus
- Replaced the experimental session setup entry screen with the Phase 0 Deep Focus home  screen
- Simplified web navigation to the active Home route
- Documented `Plan My Day` as required V1 scope and `Break Down This Task` plus `Review My Day Lite` as release-gated V1 targets
- Documented the November 15 scope checkpoint, November 30 beta, December 15 store submission, and January 1, 2027 public-release targets
- Synchronized the Blueprint, UI specification, architecture, and implementation plan with the canonical five-tab V1 navigation model
- Replaced the temporary Home and Explore navigation with a connected five-tab V1 route skeleton and contextual workflow routes
- Canonicalized the shared visual tokens to the Deep Focus navy and mint palette,
  including accessible dark/light theme values and a distinct AI-only lavender accent
- Replaced the current canonical theme-token mapping with the approved focus-blue, progress-teal, achievement-purple, semantic status, and neutral Light/Dark palette defined in `COLOR_SYSTEM.md`.
- Fixed legacy Home theme aliases to resolve to the canonical Light palette so time-of-day copy does not silently introduce separate morning/evening color systems.
- Refined the Home dashboard into a calm, premium zero-state experience with a
  clear session entry point and working quick-action routes
- Added the first timestamp-based Focus Session vertical slice with live timer,
  pause/resume, completion, cancellation, and session summary states
- Added guarded local active-session and history persistence with a recovery route
- Extended the local focus workflow with session-history details, derived analytics, calm milestone progress, and local task/goal progress views.

### Fixed

- Fixed Quick Action and profile links so Tasks and Goals resolve to their list routes instead of the dynamic detail routes.
- Fixed Welcome and authentication links so the onboarding index resolves through its canonical `/onboarding` route.

### Removed

- Removed obsolete Explore, Focus, Summary, and legacy index prototype routes


### Improved

- Improved project documentation structure and consistency
- Refined documentation for maintainability and future scalability
- Strengthened accessibility guidance
- Strengthened privacy and security guidance
- Refined AI behavior and development guidance
- Expanded development and contribution standards
- Expanded testing, compatibility, performance, release, and defect-management guidance
- Synchronized product, UI, component, architecture, data, database, API, security, and testing contracts for proposal-first AI actions, task reminders, subtasks, action accounting, and trusted rewarded unlocks

---

## Release Guidelines

---

Every public release should be represented in this changelog.

Each release entry should include, where applicable:

- Version number
- Release date
- Significant user-visible changes
- Important internal changes
- Added functionality
- Changed functionality
- Meaningful improvements
- Bug fixes
- Removed functionality
- Deprecated functionality
- Security-related updates

Release notes should remain:

- Clear
- Concise
- Accurate
- Factual
- Easy to understand

Changelog entries should describe what changed rather than provide unnecessary implementation detail.

Features that are planned but not completed should not be recorded as released functionality.

---

## Version History

---

Released versions should appear below `Unreleased`.

The newest released version should appear first.

Example:

```text
## [1.0.0] - YYYY-MM-DD

### Added

- Added Feature A.
- Added Feature B.

### Changed

- Updated existing application behavior.

### Improved

- Improved application performance.

### Fixed

- Fixed a notification issue.

### Removed

- Removed deprecated functionality.

### Deprecated

- Deprecated legacy functionality scheduled for future removal.

### Security

- Improved authentication handling.
```

Categories without relevant changes should be omitted.

Release dates should use a consistent format:

`YYYY-MM-DD`

Released entries should not normally be modified after publication except to correct inaccurate information.

Material corrections to historical entries should preserve the accuracy of the project history.

---

## Pre-Release Versions

---

Before Deep Focus reaches its first stable public release, pre-release versions may be used where appropriate.

Examples may include:

- `0.1.0`
- `0.2.0`
- `1.0.0-alpha.1`
- `1.0.0-beta.1`
- `1.0.0-rc.1`

Pre-release identifiers should only be introduced when they provide useful meaning to the development or release process.

The project does not need to create version numbers for every internal development change.

---

## Release Process

---

Before publishing a new release:

- Complete the intended release scope
- Complete appropriate testing and validation
- Resolve release-blocking defects
- Review relevant documentation
- Update the application version where required
- Review the `Unreleased` section
- Move applicable completed entries into the new release section
- Add the release version and date
- Remove empty categories
- Review the changelog for accuracy
- Create the appropriate Git release tag
- Publish release notes where applicable

After creating a release, the `Unreleased` section should remain available for subsequent completed changes.

A public release should represent a version that has completed the verification appropriate to its intended scope.

---

## Release Tags

---

Public release tags should correspond clearly with application versions.

A consistent tag format should be used, such as:

```text
v1.0.0
v1.1.0
v1.1.1
```

Pre-release tags may follow the corresponding version identifier where applicable.

Examples:

```text
v1.0.0-beta.1
v1.0.0-rc.1
```

Tags should reference the commit representing the intended release state.

Release tags should not be created for ordinary documentation or development commits.

---

## Documentation Updates

---

Significant documentation changes may be recorded when they materially affect:

- Project direction
- Product requirements
- Architecture
- Development standards
- Testing requirements
- Contributor expectations
- Security or privacy guidance
- Accessibility requirements
- AI behavior or development rules
- Release processes

Minor editorial changes, formatting corrections, and typo fixes generally do not need individual changelog entries unless they materially change project understanding.

Documentation entries should describe completed documentation changes accurately.

---

## Change Recording Principles

---

Every recorded change should:

- Be accurate
- Represent completed work
- Be concise and understandable
- Describe user-visible impact when applicable
- Describe significant internal or documentation changes when relevant
- Avoid unnecessary implementation detail
- Avoid duplicate entries
- Avoid speculative future functionality
- Use the most appropriate change category
- Remain understandable without requiring commit-history investigation

The changelog should not function as:

- A project roadmap
- A complete commit log
- A task tracker
- A list of every modified file
- A record of insignificant editorial changes

Git history should preserve implementation-level change history, while the changelog should preserve meaningful release-level project history.

---

## Changelog Maintenance

---

The changelog should be updated as meaningful work is completed rather than reconstructed entirely at release time.

Before a release, contributors should verify that:

- Relevant completed changes are represented
- Planned but incomplete work is excluded
- Duplicate entries are removed
- Categories are accurate
- Descriptions reflect actual implementation
- Security-sensitive details are not unnecessarily exposed
- Historical release information remains accurate

Changelog maintenance should remain lightweight and proportional to the scale of the project.

---

## Conclusion

---

This changelog serves as the historical record of significant changes made to Deep Focus.

Maintaining an accurate changelog helps developers, contributors, and future users understand the evolution of the application while improving transparency and release traceability.

A well-maintained changelog should provide:

- Clear version history
- Accurate change records
- Consistent release documentation
- Reliable release notes
- Useful historical context
- Long-term project traceability

The changelog should remain concise, factual, maintainable, and synchronized with completed project work.

As Deep Focus evolves, changelog practices may evolve with the release process while preserving the principles of accuracy, clarity, and meaningful historical documentation.

---
## 2026-10-08

- Connected the native Welcome, Sign In, Create Account and password-recovery
  screens to the persisted English/Sinhala/Tamil locale-copy layer. Added copy
  coverage for each approved locale. This does not claim full app-wide
  translation or accessibility/device acceptance.
- Added a local account-portal password-reset request flow using the public
  Supabase client. Responses do not reveal whether an account exists; private
  app-data sync and provider/runtime review remain pending.
- Connected the native Home screen's greeting, focus hero, paused-session
  recovery, progress labels and quick actions to the approved locale-copy
  layer. Timer and progress calculations remain unchanged.

## 2026-10-09

- Completed the remaining Progress route locale wiring for the weekly focus
  chart, goals heading and session units. Calculations and stored data remain
  unchanged; human translation, accessibility and Android device review are
  still pending.
- Connected the native Goal detail route's states and actions to the approved
  English/Sinhala/Tamil copy layer without changing goal storage, calculations,
  stale-write protection or delete confirmation behavior.
- Connected the native interrupted-session recovery screen to the approved
  English/Sinhala/Tamil copy layer without changing recovery reads or routing.
- Connected Plan My Day confirmed-plan saved and save-failure messages to the
  approved English/Sinhala/Tamil copy layer without changing planning or local
  persistence behavior.
- Added a local Sri Lankan education-metadata validator for bounded O/L, A/L
  and higher-stage context. It does not enable classroom sharing or supply
  teaching materials; those contracts remain review-pending.
- Added a policy-gated local classroom boundary helper: explicit learner
  confirmation creates a private task, while selected progress shares exclude
  focus history, private notes and resources. Server authorization and review
  gates remain pending.
- Added revision-bound, teacher-role-only feedback preparation to the same local
  classroom boundary; it is not server authorization or a release gate.
- Connected the native True Zen Break screen to the approved
  English/Sinhala/Tamil copy layer without changing timing or saved settings.
- Connected the Focus summary's return-home action to the shared locale copy
  without changing session calculations or navigation behavior.
- Connected the active focus-session state and action copy to the approved
  English/Sinhala/Tamil locale layer without changing timer or persistence logic.
### 2026-10-09

- Localized the native authentication callback loading/error state for the
  supported Sinhala, Tamil and English app locales. Provider verification and
  account/backend acceptance remain separate pending gates.
- Added a central age-sensitive access decision: ages 15–17 remain available
  for development, while real-minor classroom pilot/release access requires
  explicit legal review and pilot enablement. Unknown and under-15 states fail
  closed.
- Added a portal-visible account summary download that contains only provider-
  visible status; private app data is excluded while sync is disabled, and
  account deletion remains clearly unavailable until the reviewed server flow
  exists.
- Made the local Plan My Day model label configurable through a bounded build
  setting, with the local mock remaining the default. No OpenAI request,
  credential or paid allowance is enabled by this change.
- Added an isolated OpenAI planning-provider boundary with strict structured
  proposal validation and the same explicit-confirmation requirement. It has no
  network transport, credentials, task mutation or paid usage enabled.
### Backend candidate — owner-bound profile update

- Added a local `patchMe` PostgreSQL candidate with active-account and optimistic-version checks, plus gateway registry wiring and regression coverage. This remains a local `REVIEW_PENDING` candidate; no remote database was changed.

### Backend candidate — authenticated gateway boundary

- Added a local gateway wrapper that verifies the provider token, rechecks the app-session registry, and only then binds the verified owner to gateway admission. Invalid or revoked sessions fail closed without touching owner storage.

### Backend candidate — PostgreSQL sync pull adapter

- Added an owner-bound, bounded and snapshot-transactional `sync_changes` read adapter with signed high-water continuation support and fail-closed row validation. It remains local and `REVIEW_PENDING`.
- Wired the implemented PostgreSQL domain mutation store to append complete owner-bound entity snapshots and advance the owner sequence in the same transaction before writing the mutation receipt.
- Added a versioned local `change_hash` migration and PostgreSQL sync transaction adapter for exact replay, duplicate prevention and changed-replay conflict handling.
- Added a local PostgreSQL usage reservation adapter with locked allowances, replay-safe receipts, consume/release settlement and non-fabricating replay metadata migration.
- Added a local PostgreSQL app-session registry and revocation-outbox adapter with owner/session locking and idempotent outbox enqueue.
- Added a generic server-authoritative entitlement schema and owner-bound reader for AI/cloud capability admission; provider and pricing integration remain isolated and pending.
- Added local PostgreSQL sync gateway handlers that compose signed pull and owner-bound ordered commit adapters.
# 2026-10-11

- Added the EX-32 AI proposal apply gateway route with strict confirmation
  validation, owner/session recheck and fail-closed executor wiring. This is a
  local candidate only; live database/provider execution and independent review
  remain pending.
## 2026-10-11

- Added a backup-restore regression guard that rejects manifest record-count
  mismatches before opening the caller-owned transaction; live restore remains
  `NOT_RUN` and independent review remains `REVIEW_PENDING`.

- Added a local PostgreSQL backup/restore composition boundary that keeps owner
  validation, digest checks and writes inside an injected transaction; live
  Supabase restore remains `NOT_RUN`.

- Added rollback/source-failure regression coverage for the backup boundary;
  failed reads and writes do not produce a successful restore result.

- Added migration receipt-save failure coverage; a failed receipt write is not
  reported as applied and the same migration can be retried from a clean store.

- Hardened server capability admission with runtime validation for untrusted
  capability values; invalid values are rejected before entitlement reads.

- Applied the same runtime capability validation to usage reservations so an
  untrusted capability cannot receive an allowance grant.

- Added a migration guard requiring every new `df_private` table to grant
  access only to `service_role` while denying client roles.

- Fixed a local sync ordering gap: after a snapshot establishes a cursor,
  stale incremental sequences are rejected even when no replay receipts exist.

- Rejected zero-valued incremental sync sequences at both the pull boundary
  and SQLite adapter, matching the server's positive sequence constraint;
  added no-mutation regression coverage.

- Made the same positive-sequence rule explicit in the server pull validator
  and added a server-side zero-sequence regression case.

- Hardened PostgreSQL read DTO boundaries by validating returned resource
  ownership for tasks, goals, focus sessions and reminders; added foreign-owner
  regression coverage.

- Added the same zero-sequence fail-closed guard to the PostgreSQL sync read
  adapter, covering inconsistent storage results before client delivery.

- Added sync cursor recovery fencing: a continuation now rejects a signed
  high-water value above the current database high-water instead of hiding a
  rollback as an empty page.

- Fixed PostgreSQL sync replay validation so valid delete mutations retain their
  canonical `null` payload and can be replayed safely after a retry.

- Hardened the PostgreSQL app-session adapter against malformed or
  out-of-order registry timestamps before revocation logic uses a session row.

- Hardened the account-session list read boundary with the same timestamp and
  status-consistency checks, so malformed registry rows fail closed before they
  reach the client; added regression coverage.

- Applied the same active/revoked status consistency check to the PostgreSQL
  app-session persistence adapter and added malformed-registry regression
  coverage.

- Closed a sync-snapshot worker lease-integrity gap: `lease_owner` and
  `lease_expires_at` must be present together or absent together across the
  schema, state machine and PostgreSQL adapter; added corruption tests.

- Reconciled the entitlement state model with the canonical billing contract:
  `grace` is now representable in the local schema and server adapter while
  capability admission still grants access only to `active` records.

- Added server-side validation of AI provider proposals before allowance
  consumption; malformed proposals now release the reservation and surface a
  safe provider failure.

- Reconciled the usage-ledger schema with its PostgreSQL adapter by adding the
  bounded `remaining_units` replay field required by reservation receipts.

- Hardened privacy-job worker transitions with fencing-version predicates and
  rejected partial lease state in the schema, worker state machine and
  PostgreSQL adapter.
# 2026-10-11

- Security: clear the active local account namespace immediately after a successful provider sign-out, while preserving the existing namespace on sign-out failure or cancellation.
2026-10-11: Reconciled the supplied Copilot PR #16 security findings against
repository code, canonical contracts and actual checks. `.env.example` was
confirmed to contain placeholders only; focused auth/session/gateway/sync
verification was **69/69 PASS**. No new defect was confirmed or hidden, and
live Supabase RLS/Auth, Android recovery, provider-backed AI and independent
security review remain `REVIEW_PENDING` / `NOT_RUN`.
2026-10-11: Added a local provider-verified app-session issuance candidate. It
revalidates issuer, audience, owner/session UUIDs and expiry, then inserts the
owner-bound registry row through the existing transaction boundary. Raw tokens
are never accepted or decoded. Focused issuance checks and live provider wiring
remain separate; Supabase runtime, database and independent security review are
still `REVIEW_PENDING` / `NOT_RUN`.

2026-10-11: Added an atomic account bootstrap candidate for profile, personal
workspace and zeroed sync head creation. Duplicate retries return canonical
existing rows without overwriting names or workspace IDs; malformed rows and
transaction failures fail closed. Focused bootstrap checks are local only;
Supabase execution, live RLS and independent security review remain
`REVIEW_PENDING` / `NOT_RUN`.

2026-10-11: Added a bounded Edge-compatible Fetch adapter around the
authenticated gateway runtime. It preserves query/header/body transport,
rejects oversized bodies, emits `no-store` JSON and keeps unexpected failures
inside the safe error envelope. Real Edge execution and independent review
remain `REVIEW_PENDING` / `NOT_RUN`.
2026-10-11: Added the PostgreSQL gateway owner-lookup adapter for workspace,
task, goal, focus-session and reminder preflight authorization. Table names are
allowlisted and IDs are parameterized/validated; missing, foreign or malformed
rows fail closed. Domain appliers remain the final in-transaction ownership
authority. Live PostgreSQL/RLS and independent review remain
`REVIEW_PENDING` / `NOT_RUN`.
2026-10-11: Added an injectable authenticated PostgreSQL gateway runtime
composition. It wires provider-verified claims, transaction-bound app-session
rechecks, preflight owner lookup, rate limiting and handlers without opening
connections or exposing secrets. Session issuance/bootstrap remains separate;
live Edge runtime, PostgreSQL/RLS and independent review remain
`REVIEW_PENDING` / `NOT_RUN`.

2026-10-11: Added the provider-verified authenticated account bootstrap flow.
It creates the app session, profile, personal workspace and sync head under one
caller-owned transaction, with no guest path or client-supplied owner ID.
Provider-backed execution, PostgreSQL/RLS, device checks and independent review
remain `REVIEW_PENDING` / `NOT_RUN`.

2026-10-11: Added an all-migration security regression guard. Every created
`df_private` table must have RLS, client-role revocation and a `service_role`
grant; direct private-table grants to client roles are rejected. This remains
source-level coverage, not live PostgreSQL/RLS evidence.

2026-10-11: Added a bounded remote sync-pull adapter. It validates the
`account:<UUID>` owner namespace and page envelope, sends only cursor/limit,
and leaves SQLite application to the caller's atomic boundary. Startup wiring,
live sync and device verification remain `REVIEW_PENDING` / `NOT_RUN`.

2026-10-11: Added account-scoped sync orchestration. It applies one validated
remote page atomically before processing local outbox work, checks account
switches around the operation and preserves state on pull failure. Startup
activation and live/device verification remain `REVIEW_PENDING` / `NOT_RUN`.

2026-10-12: Hardened authenticated app-session admission against malformed
runtime clock values. Non-string clock input now returns `invalid_claims`
without reading the session registry or leaking a date-parsing exception.

2026-10-12: Hardened app-session issue and revoke transitions against runtime
type confusion. UUID and timestamp validation now rejects non-string values
before regular-expression or date parsing, keeping malformed inputs on the
bounded `invalid_input` path without invoking persistence.

2026-10-12: Hardened the request-session boundary against non-object runtime
headers. Malformed header input now fails closed as `missing_token` before the
provider verifier is called.

2026-10-12: Hardened session-revocation batch, worker and retry boundaries
against runtime type confusion. Non-string UUID, timestamp and provider-code
inputs are rejected before due-work reads, lease claims, provider calls or
retry scheduling.

2026-10-12: Extended revocation type-boundary validation to target planning and
the PostgreSQL worker adapter. Malformed scopes, mutation identities, returned
rows and adapter inputs now fail before transaction or SQL access.

2026-10-12: Hardened the account-session revocation handler and legacy outbox
helper against malformed request bodies, identities and clocks. Invalid input
now stops before transaction or provider-outbox access.

2026-10-12: Added the same runtime type-boundary protection inside the
PostgreSQL app-session adapter. Invalid returned IDs, timestamps, receipt
metadata and direct adapter inputs now fail before SQL execution.

2026-10-12: Hardened account bootstrap identity and foundation-row validation.
Malformed owner/workspace IDs and unsafe sync-head values now fail before the
bootstrap transaction or PostgreSQL SQL access.

2026-10-12: Hardened the AI proposal apply receipt boundary against runtime
type confusion. Malformed intent and stored receipt fields now fail through the
bounded validation path before owner transaction access; exact replay behavior
remains unchanged.

2026-10-12: Hardened AI generation cancellation input handling. Malformed
reservation IDs, clocks and stored request values now fail through the intended
validation or dependency path before a cancellation transition.

2026-10-12: Hardened AI generation worker lease and fencing validation. Runtime
type confusion in job identities, worker IDs, lease timestamps, counters or
fences now fails before claim, renewal or reconciliation transitions.

2026-10-12: Hardened AI generation completion validation. Malformed request/job
identity, lease and proposal values now fail before terminal settlement, while
live-fence success consumes once and failure releases once as before.

2026-10-12: Hardened the PostgreSQL AI apply-receipt adapter's direct boundary.
Malformed owner, receipt identity, hash, decimal and stored-row values now fail
before SQL or receipt writes; owner-scoped replay behavior remains unchanged.

2026-10-12: Hardened the PostgreSQL AI generation worker adapter's direct
boundary. Malformed request objects, identities and returned job rows now fail
before SQL or lease transitions; owner/fence predicates remain unchanged.

2026-10-12: Hardened the PostgreSQL AI generation status reader. Malformed
owner/request inputs and null or malformed returned rows now fail before a
status DTO is exposed, while owner-scoped public status mapping remains intact.

2026-10-12: Hardened AI generation request creation at both public and
transaction-helper boundaries. Malformed identities, null inputs and
non-serializable snapshots now fail before request/job SQL or partial admission;
idempotent replay behavior remains unchanged.

2026-10-12: Moved AI generation request validation ahead of session,
entitlement and allowance admission. Malformed request, period and clock inputs
now fail before quota reservation or database work.

2026-10-12: Hardened the PostgreSQL AI cancellation adapter boundary. Malformed
request identities and hashes now fail before opening a transaction, while
owner-bound receipt replay and reservation-release ordering remain unchanged.

2026-10-12: Hardened the PostgreSQL AI proposal adapter boundary. Malformed
owner/proposal identities, stored rows, hashes, versions, dates and selected
operation IDs now fail before exposing or applying proposal state.

2026-10-12: Hardened the PostgreSQL AI proposal-apply owner boundary. Non-string
owner identities now fail before a transaction can be opened.

2026-10-12: Hardened the PostgreSQL AI plan reader boundary. UUID fields and
nullable references now require actual strings, malformed rows fail closed, and
invalid runtime identities cannot reach the database transaction.

2026-10-12: Hardened the PostgreSQL entitlement reader boundary. Runtime ID
 confusion, malformed rows and duplicate entitlement results now fail closed
 instead of exposing ambiguous server-authoritative capability state.

2026-10-12: Hardened the PostgreSQL AI operation executor boundary. Foreign
proposals, malformed operation records, invalid selections and non-string
runtime identities now fail before domain writes or sync changes.

2026-10-12: Hardened the PostgreSQL gateway authorization lookup boundary.
Malformed database result containers now fail closed before owner metadata is
used for preflight authorization.

2026-10-12: Hardened the PostgreSQL sync-change writer boundary. Entity,
sequence-head, insert and head-advance results now require exactly one valid
row before a sync change can be written or acknowledged.

2026-10-12: Hardened the PostgreSQL sync-pull boundary. Malformed result
containers, duplicate or out-of-bound sequences and non-record change rows now
fail closed before a page is returned to local sync.

2026-10-12: Hardened the PostgreSQL sync-transaction boundary. Head, replay,
insert and advance results now require one valid row, preventing ambiguous
replay or sequence state from being accepted.

2026-10-12: Hardened the PostgreSQL session guard boundary. Runtime identity
 confusion and malformed or ambiguous session result containers now fail closed
 before protected work can continue.

2026-10-12: Hardened the PostgreSQL migration-runner receipt boundary.
Malformed receipt result containers and null returned receipt rows now fail
closed without reporting migration success.

2026-10-12: Hardened backup and restore identity boundaries. Runtime owner and
digest type confusion now produces an explicit invalid admission result instead
of a regex type exception.

2026-10-12: Hardened the PostgreSQL privacy-job adapter boundary. Malformed or
ambiguous job result containers now fail closed before lease, completion or
retry state can be accepted.

2026-10-12: Hardened the PostgreSQL download-grant boundary. Runtime digest
 confusion and malformed job/grant result containers now fail closed before a
 download grant can be issued or replayed.

2026-10-12: Hardened the PostgreSQL usage-ledger boundary. Runtime identity
confusion and malformed or duplicate allowance/receipt results now fail closed
before usage reservation or settlement state is accepted.

2026-10-12: Hardened the PostgreSQL gateway rate-limit boundary. Runtime key
type confusion and malformed or ambiguous counter results now fail closed
instead of accepting an unreliable rate-limit count.

2026-10-12: Hardened the PostgreSQL mutation receipt boundary. Malformed or
ambiguous owner/head/receipt results and non-string sync sequences now fail
closed before a mutation replay or durable receipt is accepted.

2026-10-12: Hardened gateway-generated privacy and snapshot job identity
 boundaries. Non-string generated IDs now fail before session or database work.
2026-10-12: Hardened the server error boundary against runtime-confused status
and error-code values; invalid values now normalize to the safe dependency
failure response.
2026-10-12: Hardened the Supabase provider-claims adapter against malformed
runtime response shapes; invalid provider results now fail as token errors.
2026-10-12: Closed gateway owner-check gaps for task deletion and goal patch/
deletion routes; foreign resource IDs now fail before mutation handlers run.
2026-10-12: Extended the same gateway owner preflight to goal-progress reads.
2026-10-12: Added fail-closed local outbox-row validation before sync push;
malformed rows are left untouched and never sent to the remote endpoint.
2026-10-12: Added the canonical 64 KiB byte bound to the local sync-pull page
apply boundary; oversized remote pages are rejected before SQLite writes.
2026-10-12: Enabled SQLite foreign-key enforcement for the V2 sync storage
connection before creating or applying its schema.
2026-10-12: Applied the canonical 64 KiB page bound to V2 sync-pull
validation before local atomic apply.
2026-10-12: Hardened the PostgreSQL consistent snapshot builder factory
against malformed transaction-runner dependencies. Invalid runners now fail
closed with `VALIDATION_FAILED` before a snapshot transaction can start; the
snapshot transaction, ownership and staging semantics are unchanged.

2026-10-12: Hardened the PostgreSQL snapshot build adapter factory against
malformed transaction-runner dependencies. Invalid runners now fail closed
before cursor materialization or staging can begin; snapshot ownership and
staging semantics are unchanged.

2026-10-12: Hardened the PostgreSQL snapshot cursor handler boundary against
malformed dependencies and runtime identity types. Invalid runners, weak cursor
secrets and malformed request identities now fail closed before cursor or page
access; signed scope and session authorization semantics are unchanged.

2026-10-12: Hardened the PostgreSQL sync-snapshot materializer composition
boundary. Invalid runners, digest dependencies and scheduler configuration now
fail closed before materialization or database access; owner/session binding and
repeatable-read snapshot semantics are unchanged.

2026-10-12: Hardened the PostgreSQL sync-snapshot worker adapter boundary.
Malformed runners and claim/complete/fail/list requests now fail before opening
a transaction; lease, fencing and owner predicates remain unchanged.

2026-10-12: Hardened the PostgreSQL V2 sync-pull request boundary. Malformed
owner, sequence, cursor, clock and secret values now fail before session,
transaction or query access; privacy-epoch, group-digest and signed-cursor
verification semantics are unchanged.

2026-10-12: Hardened the PostgreSQL V2 sync-group builder and append boundary.
Malformed entity identities and append requests now fail before hashing or a
transaction; replay, ordered-sequence and atomic-head semantics are unchanged.

2026-10-12: Hardened the PostgreSQL V2 batch-receipt adapter against runtime
type confusion in receipt identity, hash and timestamp fields. Invalid values
now fail through the bounded validation path before receipt queries or writes;
replay and receipt immutability semantics are unchanged.

2026-10-12: Hardened PostgreSQL sync gateway actor/session admission against
runtime type confusion. Malformed identity values now fail before pull/commit
session or transaction access; verified-owner and cursor binding semantics are
unchanged.

2026-10-12: Hardened the PostgreSQL plan lifecycle boundaries. Malformed
client, runner, owner/plan identity and clock configuration now fail through
the bounded admission path before plan or reminder storage access; lifecycle
locks, version checks and tombstone semantics are unchanged.

2026-10-12: Hardened the PostgreSQL sync-change writer resource-ID boundary.
Runtime-confused resource IDs now fail before committed-entity reads or sync
ledger writes; owner binding, payload bounds and head advancement are
unchanged.

2026-10-12: Hardened the PostgreSQL profile update boundary against malformed
clients, actor identities, bodies and result containers. Invalid values now
fail through bounded validation before profile SQL or response mapping; owner
and optimistic-version semantics are unchanged.

2026-10-12: Hardened the PostgreSQL settings update boundary against malformed
clients, actor identities, bodies and result containers. Invalid values now
fail before settings SQL or response mapping; allowlisted fields and optimistic
version semantics are unchanged.

2026-10-12: Hardened the PostgreSQL create-task admission boundary against
malformed clients, actor identities and bodies. Invalid values now fail before
workspace/goal reads; ownership, goal-link and task field validation remain
unchanged.

2026-10-12: Hardened PostgreSQL patch/delete/action task mutation boundaries
against malformed clients, actor identities and resource IDs. Invalid values
now fail before task or goal reads; optimistic versions, owner predicates and
task state transitions remain unchanged.

2026-10-12: Hardened PostgreSQL create/patch/delete goal mutation boundaries
against malformed clients, actor identities and resource IDs. Invalid values
now fail before workspace or goal storage access; time-unit validation, owner
rules, optimistic versions and tombstones remain unchanged.

# 2026-10-14

- Re-ran the no-download Supabase deployment preflight: local migration,
  recovery, authorization, gateway, secret-boundary and TypeScript checks pass.
  The preflight remains fail-closed for unresolved ADR-011 and unavailable local
  Deno, Supabase CLI, Docker and PGlite runtimes; it performed no remote action.
- Recorded targeted ESLint evidence for the local gateway prerequisites. Shared
  source and the preflight script pass; the Edge entrypoint remains outside the
  Expo resolver because its Deno import map owns the `@db/postgres` alias.
- Confirmed the PGlite migration runner rejects an existing private schema when
  its migration receipt is absent; it fails closed rather than assuming replay
  safety.
- Re-ran selected PGlite migration recovery/isolation cases: service-role
  cross-owner revocation writes are denied, legacy null balances stay null, and
  transaction-scoped advisory locks release after both commit and rollback.
- Completed the remaining selected PGlite bootstrap/RLS migration cases. The
  current nine cases pass individually, including receipt replay, private-table
  grants, cross-owner foreign keys, authenticated task isolation and rollback
  retry; this is still not a hosted Supabase rehearsal.

- Backend sync pull now rejects `Date`, custom-prototype, and `undefined` payload values before transport serialization; JSON-coercible shapes cannot cross the owner-bound pull boundary.
- Server sync hashing now rejects sparse, symbol-bearing, and extra-property arrays instead of producing a hash that differs from transport JSON.
- Shared response validation now rejects sparse, symbol-bearing, and extra-property arrays before gateway, mutation, or receipt serialization.
- Plan replication/export digests now reject sparse, symbol-bearing, and custom-prototype values before integrity verification.
- Recorded the owner-approved onboarding language flow: choose Sinhala, Tamil, or English first, save the choice, and allow later changes from Settings.
- Backup payload digests now reject sparse, symbol-bearing, and extra-property arrays before restore or export integrity checks.
- AI proposal operation digests now reject sparse, symbol-bearing, and custom-prototype values before replay or persistence.
- Gateway mutation hashes now reject sparse, symbol-bearing, extra-property, and custom-prototype values before idempotency comparison.
- V2 sync group digests now reject sparse, symbol-bearing, extra-property, and custom-prototype payloads before persistence or replay.
- Snapshot staging retry comparisons now reject sparse, symbol-bearing, extra-property, and custom-prototype stored payloads.
- AI generation request creation now rejects JSON-coercible snapshot and version values before reservation/request SQL.
- Hardened PostgreSQL snapshot staging result-row validation so sparse or otherwise non-plain JSON row containers fail closed before snapshot publication or retry comparison; added a regression test.
- Hardened PostgreSQL V2 sync batch receipt result validation so sparse or otherwise non-plain JSON row containers fail closed before replay or receipt writes; added a regression test.
- Hardened PostgreSQL goal-contribution result validation so sparse or otherwise non-plain JSON rows fail closed before focus-time attribution or contribution writes; added a regression test.
- Hardened PostgreSQL goal-applier result validation so sparse or otherwise non-plain JSON rows fail closed before goal creation, patching or deletion; added a regression test.
- Hardened PostgreSQL break-record result validation so sparse or otherwise non-plain JSON rows fail closed before session-bound break writes; added a regression test.
- Hardened PostgreSQL task-applier result validation so sparse or otherwise non-plain JSON rows fail closed before task creation, linking or state mutations; added a regression test.
- Hardened PostgreSQL entitlement result validation so sparse or otherwise non-plain JSON capability rows fail closed instead of granting server capability access; added a regression test.
- Hardened PostgreSQL profile update result validation so sparse or otherwise non-plain JSON rows fail closed before returning an account mutation success; added a regression test.
- Hardened PostgreSQL settings update result validation so sparse or otherwise non-plain JSON rows fail closed before reporting a personalization mutation success; added a regression test.
- Hardened PostgreSQL privacy-job result validation so sparse or otherwise non-plain JSON job rows fail closed before export/deletion work is returned or advanced; added a regression test.
- Hardened PostgreSQL rate-limit result validation so sparse or otherwise non-plain JSON counter rows fail closed before admission decisions; added a regression test.
- Hardened PostgreSQL usage/allowance result validation so sparse or otherwise non-plain JSON ledger rows fail closed before AI or cloud-resource quota decisions; added a regression test.
- Hardened PostgreSQL privacy download-grant result validation so sparse or otherwise non-plain JSON job rows fail closed before issuing an artifact grant; added a regression test.
- Hardened PostgreSQL snapshot metadata reads so sparse or otherwise non-plain JSON result rows fail closed before exposing ready snapshot state; added a regression test.
- Hardened PostgreSQL snapshot page reads so sparse or otherwise non-plain JSON result rows fail closed before exposing page payloads; added a regression test.
- Hardened PostgreSQL plan lifecycle result validation so sparse or otherwise non-plain JSON rows fail closed before confirmed-plan transitions or reminder writes; added a regression test.
- Hardened PostgreSQL reminder result validation so sparse or otherwise non-plain JSON rows fail closed before reminder ownership checks or writes; added a regression test.
- Hardened PostgreSQL session result validation so sparse or otherwise non-plain JSON rows fail closed before session creation or event writes; added a regression test.
- Hardened PostgreSQL sync transaction result validation so sparse or otherwise non-plain JSON rows fail closed before sync replay or change writes; added a regression test.
- Hardened PostgreSQL AI proposal result validation so sparse or otherwise non-plain JSON rows fail closed before proposal load, replay, or apply state changes; added a regression test.
- Hardened the PostgreSQL domain mutation result boundary so sparse or otherwise non-plain JSON rows fail closed before owner-head locking or mutation receipts; added a regression test.
- Hardened PostgreSQL account bootstrap result validation so sparse or otherwise non-plain JSON rows fail closed before profile, workspace, or sync-head decisions; added a regression test.
- Hardened PostgreSQL AI generation request result validation so sparse or otherwise non-plain JSON rows fail closed before request replay or job creation; added a regression test.
- Hardened PostgreSQL AI generation cancellation result validation so sparse or otherwise non-plain JSON rows fail closed before reservation release or cancellation receipts; added a regression test.
- Hardened PostgreSQL AI generation completion result validation so sparse or otherwise non-plain JSON rows fail closed before settlement or terminal publication; added a regression test.
- Hardened PostgreSQL AI apply-receipt result validation so sparse or otherwise non-plain JSON rows fail closed before replay or receipt writes; added a regression test.
- Hardened PostgreSQL AI generation worker result validation so sparse or otherwise non-plain JSON rows fail closed before lease, renewal, or reconciliation updates; added a regression test.
- Completed PostgreSQL AI generation worker acknowledgement validation so sparse or otherwise non-plain JSON rows also fail closed after lease updates; added a regression test.
- Hardened PostgreSQL sync snapshot worker result validation so sparse or otherwise non-plain JSON rows fail closed before snapshot lease, completion, or retry updates; added a regression test.
