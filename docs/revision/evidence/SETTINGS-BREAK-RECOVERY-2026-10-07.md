# Settings save and recovery — 2026-10-07

```text
TASK: SP-02 subset / existing break-duration preference recovery
STATE: IMPLEMENTED; REVIEW_PENDING for persisted preference lifecycle and device verification
DELIVERABLE: truthful read/write/retry behavior for the existing local break setting
REQUIREMENT / PHASE: Settings, Notifications and Accessibility; existing user_settings adapter only
APPROVALS: Preserve existing default 5 minutes and choices 5/10/15 minutes. No new preference semantics or cloud sync.
RISK / REASON: HIGH — persisted owner-scoped setting and account-switch/local-storage boundary, although this slice adds no schema or migration.
REVIEW GATE: self-review complete; independent review pending; Android/iOS/accessibility verification NOT_RUN.
READ: docs/AI_RULES.md; docs/ai/AI_EXECUTION_POLICY.md; docs/ai/DEFINITION_OF_DONE.md; docs/ai/ENGINEERING_GUARDRAILS.md; docs/TESTING_STRATEGY.md; docs/DOCUMENTATION_MAP.md; docs/revision/20-SETTINGS-PROGRESS-AND-UNITS.md §1–2; docs/revision/15-EXPERIENCE-AND-NAVIGATION-BUILD-CONTRACT.md §3–4; docs/revision/01-REQUIREMENTS-AND-DECISIONS.md owner amendments on SQLite ownership and account isolation.
INSPECT: Settings route, settings-storage wrapper, existing SQLite user_settings schema/read/write, package scripts and dirty state.
BASELINE: 144/144 full Node suite after local analytics; dirty repository paths remain user-owned and preserved.
ALLOWED FILES: src/app/profile/settings.tsx; src/features/settings/settings-storage.ts; tests/components/settings.test.mjs (new); docs/CHANGELOG.md; this evidence file.
NON-GOALS: no new settings field, schema/migration, account sync, notification permission, age/consent, AI, focus duration, provider, dependency, deployment or production data operation.

BEHAVIOR: Load failure is distinct from a genuine 5-minute default and can retry. Break choices remain 5/10/15. A newly chosen value is shown selected only after the local write resolves; while saving, choices are disabled. On failure, the previous choice remains selected and the same selection may be explicitly retried. Repeated rapid writes are rejected. Local SQLite unavailable on web is an explicit error, not a success-shaped no-op.
PERSISTENCE: Existing owner-routed SQLite user_settings table and `defaultBreakDurationMinutes` field only. This task does not change migration behavior.
FAILURES / EDGES: generic read/save messages disclose no internal storage details. Failed reads never present fallback defaults as loaded data. Unmount prevents a late read callback from updating state.
SECURITY / PRIVACY / ACCESSIBILITY: no new data leaves the current local owner namespace. Radio options retain selected semantics and disabled state while saving; error uses a polite live region and visible text. Actual native screen-reader/large-text verification is NOT_RUN.
ACCEPTANCE: successful load reflects stored choice; successful save updates the selected choice; failed load/save does not masquerade as empty/default/success; retry works; duplicate writes do not race.
VERIFICATION: at this slice's checkpoint `node --test` — 148/148 PASS; after break-read recovery and task archiving, the current combined full suite is 156/156 PASS. `node node_modules/typescript/bin/tsc --noEmit` — PASS; direct ESLint on this route, storage adapter and relevant tests — PASS; latest `node docs/revision/check-docs.mjs` — PASS (79 markdown files, 928 local links, no errors); latest `git diff --check` — PASS with existing LF/CRLF notices. `npm run lint -- --no-cache` is unavailable because `npm` is not in PATH; the direct installed Expo CLI also invokes missing `npx`, so targeted installed ESLint was used instead.
ROLLBACK / RECOVERY: only local preference writes through the existing upsert; preserve the previous value on failure. No data/schema migration was performed.
STOP / OPEN DECISIONS: independent review and native device verification remain required. Broader preference schema, onboarding application, age/legal eligibility, localization and cloud synchronization remain outside this slice.
```
