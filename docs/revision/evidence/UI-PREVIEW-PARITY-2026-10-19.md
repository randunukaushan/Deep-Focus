# Native preview parity — 2026-10-19

TASK: Replace the native Plan landing links with the actual preview planning layout, backed by real tasks; continue other preview screens in subsequent coherent slices.
STATE: READY
APPROVAL: Owner explicitly requested preview-matching native UI and explicitly approved optional task estimated minutes and a separate planned date in the async reply this turn.
RISK: HIGH — additive local SQLite migration and persisted task fields; no remote schema or deployment. Work alone; self-review is not independent review. Production acceptance remains gated.
READ: AI_RULES, execution/DoD/guardrails/map; prior planning UI record and prototype README/index.html/plan-light.png; DATA_MODEL section 7, DATABASE_SCHEMA Tasks, SECURITY input validation; existing task storage and owner-isolation tests.
ALLOWED: src/features/tasks/task-types.ts; new task-planning.ts and task-plan-screen.tsx; new localization/task-plan-copy.ts; local-database.ts; src/app/(tabs)/plan.tsx; Plan UI/domain/SQLite tests and relevant schema-version expectations; data model/database/decision register/changelog and this evidence record. No unrelated dirty work reverted.
BEHAVIOR: Optional estimatedMinutes is an integer 1..480 matching the preview form. Optional plannedDate is a real YYYY-MM-DD local calendar label, independent of dueAt. Today includes missing dates and past/today dates; Upcoming includes future dates. Archived/cancelled work excluded. Pending counts and estimated totals derived from visible real tasks; missing estimates explicitly identified. New task defaults to the viewed date group. No auto-reschedule or task/session completion linkage.
PERSISTENCE: Add nullable typed columns in schema 19, preserve existing rows/legacy JSON and owner keys; migrate transactionally on existing paths. New metadata remains local-only; no unsupported wire fields sent to gateway.
ACCEPTANCE: Preview structure (brand/header/add, segmented period, count/time overview, real task rows/completion badge, add action, calm footer) with both themes and localized copy; add modal validates before writes, failed save preserves draft, duplicate taps guarded; completion reuses trusted local completeTask and expected revision; retained Tasks/Goals access. SQLite v18->19 is additive, old tasks roundtrip unchanged, metadata survives reload and completion, invalid metadata rejected atomically and owner isolation unchanged.
CHECKS: Installed tsc/ESLint; actual SQLite node:sqlite harness; Plan bounded hook/JSX tests; date/filter/summary domain tests; existing task/goal/storage tests; docs/diff checks. Native visual/TalkBack/large-font acceptance remains separate.
NON-GOALS: No domain/provider/dependency switch, remote data rewrite, prototype fake tasks/timer, new ads/AI/reward policy, spending, commit or deployment.
VISUAL SLICE: Also allowed: replace the existing simplified DeepFocusScene with deterministic local light/dark SVG assets derived from the approved prototype scene function/palette; pure generator scripts/preview-scene-assets.mjs and regression test. Reuse already installed expo-image per SDK56 docs; no new dependency or animation. Home/Focus callers retain their layout/session behavior.
DESIGN PARITY: Owner's exact-preview request also admits aligning existing theme tokens to the prototype light/dark palette and fixing primary Button accent/foreground contrast; existing loading/disabled semantics must remain. Home may be reorganized into the preview's scenery hero, real next-task priority and secondary rows while preserving active/paused session recovery, standalone focus, existing quick actions and honest local progress. New preview-home-copy.ts is allowed; no demo data or timer engine replacement.
FOCUS PRESENTATION: Add reusable FocusDial and pure SVG ring generator/tests; replace only setup/session timer presentation with the preview circle and bottom scenery. Keep actual use-focus-session engine, timestamp projection, pause/end/complete/retry controls and recovery untouched. Make session content scrollable; do not import the demo timer.
Focus tab entry may now route directly to existing setup, or the existing persisted active/paused session, instead of showing the extra landing cards. Read failure must block navigation to new-session setup and offer retry; never auto-start or auto-resume.
PROGRESS PRESENTATION: Put the preview-style all-time completed-session count and recent actual session rows first; keep existing period analytics, charts, goals/rewards and error states, with detailed analytics behind an accessible non-animated disclosure. Update related localized copy/tests. No progression rules change.
ROLLBACK: Code rollback is not a DB downgrade; preserve schema19 data and refuse older binaries. No deleting/recreating user DB. Use forward fix if migration fails; transaction must retain prior version/data.
SEQUENCE: (1) Task planning metadata/storage proofs; (2) Plan parity UI; (3) verify current slice; (4) Home/Focus/Progress/Profile parity based on actual remaining differences. Never claim whole-app parity from the Plan slice.

PROFILE AMENDMENT: Owner delegated the persistence choice for personal motivational words, Off and focus display. Choose owner-isolated device-local presentation preferences (new presentation-preferences/context/panel/copy and tests). SQLite20 adds a separate device_presentation_preferences table, never the remote settings/outbox; appearance is an explicit device override over the OS, not a second synced user_settings.theme value. Default system appearance, additional reduced motion false (system remains authoritative), default words, empty private phrase, focus display false. At most 240 Unicode code points; no credentials or markup interpretation. Failed load blocks editing but not core focus; failed save preserves the draft. Owner switch immediately hides old preferences and rejects stale async replies. Static focus phrase captured for the current session; Off/focus opt-out immediately hides it. Do not persist private words to session history or send them remotely. Allowed: local DB20 migration, theme hooks/root composition/splash, Profile/Home/session presentation and focused tests; canonical data/database docs and changelog. Migration and privacy review remain HIGH/REVIEW_PENDING; no production integration/deployment authority.

## Verification checkpoint

TASK_STATUS: IMPLEMENTED / REVIEW_PENDING; VERIFICATION_STATUS: PARTIAL.
Local schema is now20, with planning introduced at19 and presentation at20.
Rollback references above to19 concern that planning step, not a downgrade path.

- Installed TypeScript `node node_modules/typescript/bin/tsc --noEmit`: PASS,
  exit0 after Profile/provider/focus-words changes.
- Installed ESLint on all changed current-slice source files, theme hooks/root,
  localized copy, storage and scene generator: PASS, exit0. Initial effect/ref
  lint failures were corrected without disabling the rules, then rerun.
- `node --test` on the following20 files: 93 tests PASS, zero failures, exit0:
  components/{focus-entry,home-preview,home-accessibility-locale,
  home-session-recovery,focus-timer-accessibility,
  focus-setup-accessibility-locale,profile-safe-error-locale,
  plan-navigation-accessibility,progress,progress-filter-accessibility,button,
  focus-dial,presentation-panel,presentation-context}.test.mjs;
  domain/{local-database-ownership,task-planning,plan-storage,resource-storage,
  teacher-assignment-storage,preview-scene-assets}.test.mjs.
  Run with `node --test tests/components/<each file>.test.mjs
  tests/domain/<each file>.test.mjs` (expand the names above; no test script added).
  Tests use the actual node:sqlite adapter plus bounded JSX/hook fixtures;
  fixture checks are not native interaction/TalkBack evidence.
- `node docs/revision/check-docs.mjs`: PASS, exit0,937 links checked.
- `git diff --check`: PASS, exit0; existing Windows CRLF normalization warnings
  remain. New authored files inspected; unrelated auth/backend edits preserved.
- Self-review: inspected task source/new files and storage/root/theme/Profile
  diff; checked privacy/owner switching, additive migration, draft preservation,
  task routing and actual-timer reuse. No independent reviewer dispatched.

Device checkpoint: ADB connected to owner-supplied192.168.8.101:39803;
reverse tcp8081 succeeded. Metro initially hung, then localhost bound only::1;
restarted only the verified task-created process with LAN8081. HTTP IPv4 status
now returns `packager-status:running`. UI hierarchy package was systemui/lock
screen; asked owner to unlock themselves, never requested a PIN/password.
Native visual parity, real touches, large-text Sinhala/Tamil layout, TalkBack,
Android lifecycle and full phone acceptance remain NOT_RUN. No new APK or
production deployment claimed. Independent migration/privacy review remains
pending before acceptance/integration; release NOT_READY.

Follow-up: owner unlocked the phone, but the Android bundle HTTP check received
no bytes within180 seconds (HTTP000); this is NOT a successful bundle/build.
Owner then explicitly requested stopping all current servers and starting fresh.
Read-only process/port inspection found two project Metro instances on8081/8082.
Stopped the verified project process trees only (six processes), preserved other
programs/ADB and user data, then started one fresh LAN Metro on8081 with hidden
window and restored ADB reverse8081. Native verification remains pending; do not
infer app parity or bundle success from a healthy Metro status alone.

Restart diagnosis also exposed an actual asset-resolution regression in prior
Metro logs: tsconfig maps the more-specific @/assets alias to root assets, while
the new scenery files live in src/assets. Corrected only DeepFocusScene's two
requires to importer-relative paths; added a real-filesystem importer-resolution
regression check. Native bundling remains pending until rerun succeeds; earlier
93 fixture passes did not prove bundler resolution.

Fresh-restart checkpoint: the single verified Metro process17144 subsequently
returned `packager-status:running` at127.0.0.1:8081. No additional terminal server
was started. Default-sandbox process inspection was misleading; elevated process
inspection confirmed it was still running. Reconnected ADB reverse and reopened
the development-client URL. Corrected relative-asset regression test passes;
native bundle/device interaction acceptance still not established.

Owner's subsequent error report (timestamp1792430458594) still names the old
`@/assets/branding/preview-scene-dark.svg` dependency even though the code frame
and filesystem show the corrected importer-relative requires. This supports a
stale transform/dependency-cache hypothesis; not proof that every failure is
cache-related. The actual SVG resolution regression check reran PASS (one test).
Restarted only the verified Metro process with supported `--clear`, using the
verified junction target D:\ChatGPT\Deep Focus as working directory. No app,
account, credential, database or user files were deleted. Metro explicitly
reported an empty cache rebuild. Health did not become ready within the bounded
initial checks; bundle HTTP000/connection refusal is NOT a successful build.
Read-only OS memory check showed108MB free of3958MB physical memory. Restarted
only this verified Metro with supported `--max-workers 1` (without clearing the
cache again), and asked the owner to close unneeded programs themselves after
saving work. No unrelated programs were terminated. Actual Android bundle and
phone acceptance remain pending until a successful response/native observation.
