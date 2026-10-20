# Auth development-flow task brief — 2026-10-19

```text
TASK: Show safe, actionable email/password and Google authentication failures in the Android development build.
STATE: IMPLEMENTED
DELIVERABLE: code plus isolated verification
REQUIREMENT / PHASE: V1 Phase 2 identity; decision register 2026-09-14
APPROVALS: Supabase Auth development project `deep-focus-dev`; email/password and Google are approved factors. No dashboard, provider, schema, RLS or deployment change is included.
RISK / REASON: HIGH — authentication UX changes affect a credential and session boundary, although the change only reuses existing safe, localized messages.
REVIEW GATE: Self-review now; independent qualified authentication review remains required before acceptance/integration.

READ: AGENTS.md; AI_RULES; AI_EXECUTION_POLICY; DEFINITION_OF_DONE; ENGINEERING_GUARDRAILS; DOCUMENTATION_MAP; SECURITY §4–5; V1_IMPLEMENTATION_PLAN Phase 2; revision 01 approval; revision 14 §3; Supabase native deep-linking and Expo SDK 56 WebBrowser guidance.
INSPECT: auth-service.ts, auth-context.tsx, sign-in.tsx, sign-up.tsx, app.json, .env.local configuration presence only, package scripts, device/dev-server state and auth tests.
BASELINE: User reports registration/sign-in show only a generic failure and Google returns to an Android development build that requires Metro. Existing unrelated UI/configuration changes are dirty and preserved.
ALLOWED FILES: src/app/auth/sign-in.tsx; src/app/auth/sign-up.tsx; tests/components/sign-in-validation-locale.test.mjs; docs/revision/evidence/AUTH-DEV-FLOW-2026-10-19.md.
NON-GOALS: Changing Supabase Dashboard, Google Cloud OAuth, email sender, redirect allowlist, keys, database/RLS, API, routing architecture, dependencies, EAS builds, releases or account data.

BEHAVIOR: Both forms display the existing `AuthServiceResult.message` only when status is `error`; successful/verification navigation remains unchanged.
PERSISTENCE: Unchanged.
FAILURES / EDGES: Never display provider raw error details, keys or tokens; cancellation remains non-error; verification-required state remains unchanged.
SECURITY / PRIVACY / ACCESSIBILITY: Existing service maps provider errors to localized safe copy. Existing assertive error semantics are retained.
ACCEPTANCE: AUTH-01 sign-in displays the returned safe message; AUTH-02 sign-up displays the returned safe message; AUTH-03 no raw provider detail is added; AUTH-04 Google/email flow behavior is otherwise unchanged.
VERIFICATION: PASS — `node --test tests/domain/auth-service.test.mjs tests/components/sign-in-validation-locale.test.mjs tests/components/auth-callback-accessibility.test.mjs` (11 passing); `node_modules\\.bin\\tsc.cmd --noEmit` (exit 0); `node_modules\\.bin\\eslint.cmd src/app/auth/sign-in.tsx src/app/auth/sign-up.tsx tests/components/sign-in-validation-locale.test.mjs` (exit 0); `git diff --check` (no whitespace errors). Real provider email and OAuth callback test is NOT_RUN until an installed non-development build and independent review are available.
ROLLBACK / RECOVERY: Revert only this bounded display change; no remote state is changed.
STOP / OPEN DECISIONS: A non-development APK is required for phone testing without Metro. Google OAuth callback/provider configuration is not changed by this task.
```
