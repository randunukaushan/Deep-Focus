# V1 implementation task brief — 2026-10-07

```text
TASK: L-05A — mobile authentication and account-isolation foundation
STATE: IN_PROGRESS; approved scope recorded in 01-REQUIREMENTS-AND-DECISIONS.md
OUTCOME: enable genuine Supabase-backed account entry without guest access;
         preserve account-scoped offline local data and provider boundaries
PHASE: V1 implementation plan steps 7–11; Playbook L-04/L-05, then L-06/L-07
APPROVALS: Supabase Auth/Edge + SQLite + SecureStore; Google and email/password;
           Apple-ready for iOS; no guest; exact development project only;
           no production operation, real-minor access, spend or deployment
RISK: HIGH — identity, credentials, local ownership and startup routing
REVIEW: independent qualified security review required; REVIEW_PENDING
READ: AI rules, execution policy, Definition of Done, guardrails; guide 49;
      playbook 07 §§1–5/L-04/L-05; ADR register 01; Security auth/token sections;
      API auth sections; backend contract 14 §§2–3/10; data/database and UX routes
ALLOWED: auth-related mobile modules/screens/tests, local account namespace,
         approved package/lock changes, dev-only environment examples, this brief,
         decision register and changelog; isolated website portal groundwork
NON-GOALS: change another Supabase project; execute production SQL/migrations;
           live OAuth provider setup without its credentials; production user data;
           automatic local-data claim/upload; real-minor pilot; live AI/ads/payments;
           iOS/AWS Device Farm claims; commit/push/deploy/store submission
ACCEPTANCE: no protected route opens while signed out/initializing; restore,
            sign-in/out, verification, failure and retry are explicit; token
            persistence failure does not yield signed-in state; account changes
            cannot read/write another account's SQLite rows; old device-local
            records remain untouched; Google/email flows use trusted Supabase Auth;
            Apple path is present but provider setup/device verification is stated
VERIFICATION: existing suite + auth-state/service negatives + typecheck/lint;
              Android build/smoke if tooling/device exists; isolated DB/RLS tests
              only on authorized development target; never call mocks live integration
STOP: unsafe credential storage, ambiguous identity switching, unexplained data
      leakage, provider write outside named dev project, or required review gate
      before integration. Continue independent UI, tests, portal and docs work.
STATUS: implementation and verification reported separately; HIGH acceptance and
        release remain blocked on independent review, provider setup, legal and devices
```

The existing branch was created as `codex/v1-implementation`; all pre-existing
working-tree changes and user artifacts were preserved. Initial inspection
found placeholder mobile auth screens, no Supabase/SecureStore package in the
root manifest, static root navigation to Home, and a local SQLite schema with a
`device_local` owner. These are observations, not security validation.

## Progress record — mobile auth/local identity slice

Implemented candidate files include `src/features/auth/`, auth routes,
`src/app/_layout.tsx`, `src/app/(tabs)/profile.tsx`, SQLite owner scoping,
Expo config and `.env.example`. The sample uses the approved development
project's URL and client-safe publishable key; it contains no secret/service-role
key. Email/password signup/sign-in, privacy-preserving verification resend and
password-reset responses, recovery-password update, Google OAuth PKCE, iOS Apple
token/nonce exchange, sign-out and signed-out route gating are wired. Account
storage uses a distinct `account:<authenticated UUID>` SQLite namespace and
does not import or claim the legacy device-local JSON. Callback delivery is
coalesced so a PKCE code is not redeemed twice when browser and app-link events
race.

Automated auth service/route-policy tests use fake clients and pure routing
decisions. They cover requiring a session,
verification, safe storage errors, Google cancellation/missing session, Apple
nonce handling, privacy-preserving reset, strict callback URL validation and
duplicate callback delivery. They do not establish live Supabase integration.
No provider-console settings were changed. SecureStore/native route behavior,
account-switch races, email delivery, actual Google/Apple login and installed
deep links are unverified. No guest/local bypass is available after login gating.

**Status: IMPLEMENTED candidate / HIGH `REVIEW_PENDING`; not accepted.** Checks:
99/99 latest combined mobile/domain/component/navigation/web tests pass; root TypeScript
typecheck and direct ESLint over changed production/test files pass; Expo SDK
dependency check, public config resolution and docs checker pass. Android
build/smoke remains `NOT_RUN` (Android SDK/adb unavailable). Next: obtain qualified
independent auth/ownership review; run isolated disposable development-project
integration and owner-isolation/RLS negative tests before integration. Never
target production data. Apple device verification and real-minor pilot/release
remain pending. Google OAuth credentials, provider setup and approved redirect
entries remain an owner/configuration action limited to the named dev project.
