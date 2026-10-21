# PR #16 security finding reconciliation — 2026-10-11

STATUS: LOCAL EVIDENCE RECORDED / LIVE AND INDEPENDENT GATES PENDING

## Scope

The Copilot report was treated as a list of claims to verify, not as authority.
Repository code, canonical backend/security contracts and focused tests were
checked. No remote database, production migration, deployment or merge was
performed. The complete Copilot report was not included in the task, so its
reported aggregate test count cannot be independently reconciled from the
report text alone.

## Findings

1. **`.env.example` values — not a confirmed secret leak.**
   The file contains a placeholder Supabase URL and an `sb_publishable_` client
   key placeholder. It contains no service-role/secret value. The API base URL
   is also an example placeholder. The publishable-key boundary is still
   subject to real RLS and server authorization evidence; this is not a reason
   to claim the backend is secure.

2. **RLS/account isolation — local synthetic evidence only.**
   Gateway tests cover two synthetic accounts and reject foreign reads before
   handler execution. Migration/SQL contract tests cover private-table RLS and
   grants. A real PostgreSQL/Supabase two-account penetration test was not run.
   Status: `REVIEW_PENDING` / `NOT_RUN`.

3. **Session logout/revocation — local boundary covered; real provider flow not
   proven.**
   Local tests cover provider verification, app-session registry checks, expired
   and revoked sessions, account switching, local sign-out failure handling and
   safe error mapping. The repository has no deployed Edge Function entrypoint;
   the gateway is a local composition candidate. Real Supabase Auth sign-out,
   old-token rejection, restart and account-switch verification remain
   `REVIEW_PENDING` / `NOT_RUN`.

4. **Offline sync/restart recovery — local sync logic covered; device proof
   absent.**
   Local tests cover stable idempotency, retry preservation, partial
   acknowledgement quarantine, malformed acknowledgements, duplicates,
   concurrent calls and account switching. The remote pusher is intentionally
   not wired into app startup until the reviewed gateway and schema exist.
   Android network-loss/restart recovery was not run. Status:
   `REVIEW_PENDING` / `NOT_RUN`.

5. **AI proposal token expiry/duplicate apply — no confirmed regression from
   this report.**
   Existing local AI receipt/confirmation guards remain in scope and were not
   weakened. Provider-backed token-expiry and live duplicate-apply evidence
   were not run. Status: `REVIEW_PENDING` / `NOT_RUN`.

6. **Sinhala/English/Tamil, accessibility and device rendering — not fully
   confirmed.**
   Source-level localization/accessibility work exists, but complete language
   coverage and native device rendering were not established by this review.
   Status: `REVIEW_PENDING` / `NOT_RUN`.

7. **Review depth — confirmed limitation.**
   Copilot's report is a targeted review, not independent line-by-line security
   acceptance. Independent security review remains required for the HIGH-risk
   auth/RLS/sync candidate.

## Actual local checks

Focused auth/session/gateway/sync suite: **69/69 PASS**.

The latest repository verification after the local slices:

- Full domain/component/navigation/web suite: **1225/1225 PASS**.
- TypeScript typecheck: **PASS**.
- Affected ESLint checks: **PASS**.
- Documentation checker: **PASS** (`355` Markdown files, `936` local links,
  `80/80` requirements).

These checks do not establish live RLS, provider revocation, device recovery,
independent review or production readiness.

## Confirmed fixes in this reconciliation

No new product/security defect was confirmed from the supplied findings. The
placeholder environment values were already safe placeholders. Tests and
assertions were not removed or weakened. No lockfile, dependency, database or
remote environment was changed.

## Remaining gates

- `REVIEW_PENDING`: independent auth/RLS/security review.
- `NOT_RUN`: real Supabase two-account RLS and authorization test.
- `NOT_RUN`: provider-backed logout/revocation and old-token test.
- `NOT_RUN`: Android offline/restart/retry/duplicate recovery test.
- `NOT_RUN`: complete Sinhala/English/Tamil native rendering and accessibility
  verification.
- `NOT_RUN`: provider-backed AI token-expiry and duplicate-apply test.
- `BLOCKED_PENDING_RUNTIME`: reviewed Supabase Edge Function entrypoint,
  runtime configuration and approved external test access are not present in
  the repository.
