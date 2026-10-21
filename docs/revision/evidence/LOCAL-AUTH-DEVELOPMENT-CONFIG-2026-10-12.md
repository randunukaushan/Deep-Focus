# Local Auth development configuration — 2026-10-12

## Bounded task brief

- Outcome: configure the existing mobile Auth client for the owner-approved `deep-focus-dev` project in a Git-ignored local environment file.
- Scope: local Expo development configuration only; existing email/password, Google OAuth, Apple preparation, SecureStore and account-local namespace code are preserved.
- Risk: HIGH for the surrounding Auth boundary; this configuration itself uses only a publishable client key and changes no remote project state.
- Allowed files: `.env.local` (ignored, local only) and this evidence file. No migrations, Edge Functions, provider settings, users, keys, database data, commit, push or deploy.
- Acceptance: URL uses HTTPS project origin; only publishable client configuration is present; no API gateway URL activates sync; existing auth/account/sync boundary tests pass.
- Verification: `git check-ignore -v .env.local`; focused Node tests; TypeScript check. Actual user sign-in, provider redirect allowlists, email delivery, iOS Apple login, Edge API, RLS and real sync are NOT RUN.
- Recovery: remove the ignored `.env.local` file or restart Metro after changing it. No remote rollback required.

## Actual result

`deep-focus-dev` is active, while its remote migration and Edge Function inventories are empty. The local file contains the project HTTPS URL and its publishable client key only; secure sync endpoint remains intentionally unset. Focused auth/sync tests: 37 pass. TypeScript check passed. Independent security review, real-provider/device verification and secure sync deployment remain REVIEW_PENDING.
