# Supabase migration self-review — 2026-10-15

```text
TASK: Static and development-host verification of the Supabase migration and gateway candidate
STATE: REVIEW_PENDING — development candidate applied; production acceptance remains gated
DELIVERABLE: documentation / isolated verification evidence / approved development-host rehearsal
REQUIREMENT / PHASE: backend foundation; no remote migration or deployment
APPROVALS: Supabase PostgreSQL/Auth selected in revision/01; remote execution still gated
RISK / REASON: HIGH — account-owned data, privileged gateway database connection, RLS and irreversible schema changes
REVIEW GATE: independent qualified review remains required; this author self-review is not independent
READ: AGENTS.md; docs/AI_RULES.md; docs/SECURITY.md; docs/DATABASE_SCHEMA.md;
  docs/API_SPEC.md; docs/revision/14-BACKEND-API-DATABASE-BUILD-CONTRACT.md;
  docs/revision/evidence/SUPABASE-REMOTE-MIGRATION-REVIEW-PACKET-2026-10-15.md;
  Supabase/Postgres security and RLS guidance
INSPECT: 34 local SQL migrations; gateway configuration/entry point; static migration/security tests
BASELINE: large pre-existing dirty worktree preserved; `deep-focus-dev` was empty before the explicitly approved development apply
ALLOWED FILES: this evidence record and CHANGELOG only
NON-GOALS: production migration/acceptance, Edge deployment, secret configuration, account creation, dependency changes, commit/push
```

## Review result

**DEVELOPMENT REHEARSAL COMPLETE; PRODUCTION ACCEPTANCE REMAINS REVIEW_PENDING.**
No direct static privilege-escalation defect was found in the reviewed candidate.
After the owner explicitly authorized a development-only candidate apply, all 36
migrations were applied to the previously empty `deep-focus-dev` project and the
resulting schema was inspected. The final additive migration adds 12 covering
foreign-key indexes without changing grants or RLS. This is not production approval, an Edge deploy,
or proof of real Auth/gateway owner isolation.

## Static findings

| ID | Severity | Finding and evidence | Disposition |
| --- | --- | --- | --- |
| SR-01 | High | The private schema revokes `public`, `anon` and `authenticated` access, grants schema/table access only to `service_role`, enables RLS, and builds owner policies using `(select auth.uid()) = owner_id`. See `20261009071127_personal_core_v1.sql:13-16`, `:175-191`, `:206-208`; later tables repeat service-only grants. This matches the reviewed least-privilege and RLS performance pattern. | Static and in-memory role-matrix pass; must be proven with real Supabase roles after deployment. |
| SR-02 | High | `service_role` is intentionally the only role with direct table privileges and can bypass RLS. The actual authorization boundary is consequently the Edge gateway, which must verify the provider token and derive the actor before owner-bound queries. See `deep-focus-gateway/index.ts:78-118,150`, `config.ts:86-113`, and the migration header at `personal_core_v1.sql:1-8`. | Hosted negative tests must prove forged owner IDs, expired/revoked tokens and cross-owner reads/writes are denied. Do not treat RLS text tests as that proof. |
| SR-03 | Medium | All reviewed stored trigger functions are `security invoker`, pin `search_path = pg_catalog, df_private`, and no `SECURITY DEFINER` function was found in the migration set. See `20261011270000_focus_session_immutability_v1.sql:7-47` and the four related immutability migrations. | Static pass. Exercise insert/update/delete denials and terminal-ledger behavior in an isolated database. |
| SR-04 | Medium | Foreign keys pair owner IDs with dependent IDs for workspace, task, goal, session, plan and sync relationships. Supporting composite primary/unique/index keys cover the reviewed owner-scoped access paths. See `20261009071127_personal_core_v1.sql:29-165`, `20261011240000_plan_persistence_v1.sql:24-66`, and `20261011250000_plan_sync_v2_wire.sql:9-47`. | Static pass; test cross-owner FK rejection and restart/retry behavior in PostgreSQL. |
| SR-05 | High | The mobile/local contract uses seconds while the remote candidate deliberately stores `ms`; the client conversion is explicit. See `src/features/sync/sync-mutation-builders.ts:65,82` and `personal_core_v1.sql:43-45,98-101`. | Run an isolated end-to-end round trip for 60 seconds and 3,600 seconds before remote acceptance; prove no double conversion or truncation. |
| SR-06 | High | Migration receipt manifest binds filenames to checksums and rejects malformed, duplicate and destructive SQL before execution. The migrations themselves use `begin`/`commit`. This is local validation only, not a hosted rollback rehearsal. | Run a disposable hosted migration with injected failure, restart/retry, duplicate receipt and checksum-mismatch cases. |

## Checks actually run

| Check | Result | Limit |
| --- | --- | --- |
| Focused Node security/migration suite | 33/33 pass | Text/adapter fixtures; no hosted PostgreSQL role execution. |
| Isolated PGlite migration/RLS suite | 9/9 pass across two bounded runs | In-memory PostgreSQL-compatible runtime from an existing local cache; not Supabase hosted Auth, Edge or production PostgreSQL. |
| `node docs/revision/check-docs.mjs` | pass — 643 Markdown files, 937 links | Documentation integrity only. |
| `git diff --check` | pass | Existing LF/CRLF warnings only; not a runtime check. |
| Hosted `deep-focus-dev` migration history | 36/36 applied in timestamp order | Empty development target; no production data; per-migration tool calls resumed safely after a request-state expiry. |
| Hosted schema/RLS/grant inventory | 37/37 private tables have RLS; 0 tables without RLS; 0 `anon`/`authenticated` table grants; 134 `service_role` grants; 49 policies | Read-only catalog query through Supabase; does not prove Auth token or gateway behavior. |
| Hosted advisors | 24 INFO RLS-without-policy notices; 0 unindexed-FK notices; 44 INFO unused-index notices | Private service-only tables intentionally have no client policies; unused-index notices are expected on a newly created, unused development schema and require workload evidence before removal. |

The Node run emitted the existing `MODULE_TYPELESS_PACKAGE_JSON` warning. It was
not changed because adding a module-mode declaration could affect the Expo
application and is outside this review scope.

## Required acceptance evidence before production acceptance

1. On a disposable/isolated Supabase database, authenticate owner A and owner B;
   prove anonymous, forged-owner, cross-owner, expired-token and revoked-token
   reads/writes are denied.
2. Apply every migration once, inject a failure, restart, retry, and verify no
   partial schema/receipt state or duplicate receipt is accepted.
3. Exercise the service gateway with a real verified token, not a fixture;
   verify it never accepts an owner ID supplied by the request body as authority.
4. Prove the seconds-to-milliseconds round trip for time goals and focus sessions.
5. Have a qualified independent reviewer examine the SQL, gateway source and the
   resulting hosted evidence. Until then, retain `REVIEW_PENDING`.

## Scope statement

No SQL, gateway code, remote database, Edge Function, secret, dependency, commit,
push or deployment was changed by this self-review.

After the approved development rehearsal, the read-only Supabase migration
inventory for `deep-focus-dev` returned all 36 candidate migrations. The target
contained no user data before the apply; this is a development-host rehearsal,
not production evidence.

The isolated run covered full-chain apply/replay, client-role privilege denial,
cross-owner foreign keys, RLS task reads with test-only grants, receipt-failure
rollback/retry, existing-schema fail-closed handling, service-role cross-owner
revocation denial, nullable legacy balance preservation, and advisory-lock release.
