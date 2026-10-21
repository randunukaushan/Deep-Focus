# Email validation and delivery diagnosis — 2026-10-19

TASK: Distinguish invalid email, delivery restrictions, throttling and connection failures in existing auth flows; investigate missing verification email.
STATE: IMPLEMENTED — delivery investigation remains blocked on sender settings evidence
PHASE: V1 Phase 2; owner requested these reported phone defects be fixed.
RISK: HIGH conservatively: auth-facing error handling; no authorization/session policy change.
REVIEW: Work alone; development activation owner amendment applies, not production certification or completed independent review.
READ: AI_RULES, execution policy, Definition of Done, documentation map, engineering guardrails, SECURITY section 4, V1_IMPLEMENTATION_PLAN section 6, Supabase SMTP/error-code docs.
BASELINE: Dirty UI/backend/config changes preserved. Invalid email throws an uncoded RangeError and falls through to connection-oriented generic copy. Resend screen discards safe service errors. Hosted signup/resend HTTP 200 does not prove delivery.
ALLOWED FILES: This new evidence file; auth-service.ts; auth-service-copy.ts; verify-email.tsx; auth-service.test.mjs; sign-in-validation-locale.test.mjs; CHANGELOG.md. Ignored .expo diagnostic config may support read-only CLI config preview.
NON-GOALS: No provider/dependency change, account creation, email sending without owner recipient action, key exposure, confirmation bypass, paid service, production deployment, or domain sync.
ACCEPTANCE: Invalid local email makes zero provider calls and returns localized validation copy; provider email errors/rate limits safely distinguished; unknown errors never expose raw details or falsely assert connection failure; resend displays safe returned error; registration/session/callback behavior retained. Hosted email delivery needs actual SMTP configuration and recipient evidence, not API success alone.
CHECKS: node --test tests/domain/auth-service.test.mjs tests/components/sign-in-validation-locale.test.mjs tests/components/auth-callback-accessibility.test.mjs; installed TypeScript/ESLint; git diff --check. Device and delivery checks recorded separately.
ROLLBACK: Revert only task-specific hunks; no remote state mutation intended.
OPEN: Sender configuration/credentials and real recipient delivery not yet established. Never print secrets or personal input.

## Results

- Added localized invalid-email, delivery-restricted and retryable-connection messages in en/si/ta; generic copy no longer attributes every failure to connectivity. Local validation returns zero provider calls. No email existence inference or server raw error is shown.
- Resend verification now preserves the safe returned error; conditional success copy and assertive accessibility error semantics remain intact.
- `node --test tests/domain/auth-service.test.mjs tests/components/sign-in-validation-locale.test.mjs tests/components/auth-callback-accessibility.test.mjs`: 14 PASS, 0 FAIL.
- `node node_modules/typescript/bin/tsc --noEmit`: exit 0.
- Scoped `node node_modules/eslint/bin/eslint.js` on the three changed TS/TSX files and two tests: exit 0. `git diff --check`: exit 0 (line-ending warnings only).
- `node --test tests/domain/user-facing-error-safety.test.mjs tests/domain/public-secret-scan.test.mjs`: 2 PASS. `node docs/revision/check-docs.mjs`: PASS, 657 Markdown files.
- Read-only hosted CLI config preview confirmed `auth.email.enable_confirmations=true`. CLI initially required a local config; an ignored isolated `.expo` config enabled the dry run and was removed after use. No remote settings were written. SMTP was not exposed in the preview; absence from this limited preview is NOT proof SMTP is disabled.
- Earlier safe aggregate Auth log check: signup 200 (2), resend 200 (3), signup 422 (1) in the default last-24-hour window. These are not recipient-specific delivery receipts; no private addresses, credentials or tokens were retrieved.
- Supabase docs confirm default sender restrictions and `email_address_not_authorized` handling, but actual sender selection/delivery is still unverified. Requested a redacted SMTP settings screenshot; no new provider, spending or email-confirmation bypass authorized or applied.
- Independent review not performed; owner development-only waiver is not production readiness. Phone rendering, screen-reader/large-text and actual mailbox receipt NOT_RUN for these new changes.
- Self-review: reviewed full changed source/test diff, preserving prior auth form-display changes and unrelated dirty work.
