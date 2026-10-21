# Local core phone-readiness verification — 2026-10-18

```text
TASK: Local mobile core verification after Focus/recovery readiness audit
STATE: VERIFIED locally; native device and live-provider gates remain open
DELIVERABLE: isolated verification evidence; no product-code change
REQUIREMENT / PHASE: V1 mobile core; Focus, Tasks, Goals, Progress, Rewards,
  Auth/onboarding, Settings, local Resources and Plan My Day boundaries
APPROVALS: existing V1 mobile scope and local-first boundary; no new provider,
  notification, theme, cloud or AI policy was inferred
RISK / REASON: MEDIUM — read-only verification over local application code;
  no user data, network, migration, credential or deployment action
REVIEW GATE: self-review recorded; independent review and native device checks
  remain pending where required
ALLOWED FILES: this evidence file only
NON-GOALS: no settings-policy freeze, live Supabase integration, OAuth provider
  setup, cloud sync deployment, AI provider activation, or release claim
```

## Verification environment

The system `node` is v20.19.4 and cannot directly load the repository's
TypeScript test imports or `node:sqlite`. The bundled Node runtime at
`C:\Users\User\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe`
is v24.19.0 and was used for the passing runs below. `MODULE_TYPELESS_PACKAGE_JSON`
warnings were emitted; they did not fail the tests.

## Focus and recovery

Command:

```text
bundled-node --test tests/domain/session-engine.test.mjs
  tests/domain/session-recovery-state.test.mjs
  tests/domain/session-boundaries.test.mjs
  tests/domain/break-engine.test.mjs
  tests/components/focus-break.test.mjs
  tests/components/home-session-recovery.test.mjs
```

Result: **49/49 pass**. Coverage includes timer projection, invalid input and
records, pause/resume, clock rollback, terminal idempotency, storage failure
and retry, restart recovery, break deadlines, and Home recovery states.

## Local data and progress

Command:

```text
bundled-node --test tests/domain/progress-analytics.test.mjs
  tests/domain/progression-rules.test.mjs tests/domain/streak.test.mjs
  tests/domain/reward-projection.test.mjs tests/domain/goal-progress.test.mjs
  tests/components/progress.test.mjs tests/components/rewards.test.mjs
  tests/components/goals.test.mjs tests/components/goal-detail.test.mjs
  tests/components/tasks.test.mjs tests/components/task-detail.test.mjs
```

Result: **72/72 pass**. Coverage includes owner-scoped task/goal operations,
retry and conflict states, progress periods and timezone boundaries, duplicate
identity handling, streaks, XP/level projections, rewards empty/error states,
and task deletion/archive/edit flows.

## Auth, onboarding and settings

Commands:

```text
bundled-node --test auth/onboarding focused domain/component tests
bundled-node --test settings/locale/reduced-motion focused domain/component tests
```

Results: **27/27 Auth/onboarding tests pass** and **23/23 Settings/locale tests
pass**. Local routing, safe errors, account namespace fail-closed behavior,
sign-out transitions, duration/break/locale persistence, retry behavior and
reduced-motion safety are covered.

The following are not established by these local tests: live Supabase/Auth,
real OAuth callbacks, SecureStore/native behavior, account A/B RLS isolation,
notification scheduling, sound/haptics, theme selection, or screen-reader
behavior on a physical device. Notification, sound and theme controls remain
outside this evidence because their exact product policy is not frozen.

## Resources, education drafts and Plan My Day

Command:

```text
bundled-node --test resource/education/planning focused domain/component tests
```

Result: **39/39 pass**. Coverage includes local reference/link validation,
owner isolation, revision-safe links, rollback and corruption handling, bounded
teacher drafts, Plan My Day loading/error/retry/reordering, mock-planning bounds,
and explicit proposal confirmation. The planning model remains local mock by
default; no live AI request was made.

## Remaining gates

- Android `arm64-v8a` Expo development/debug APK was rebuilt from the actual
  `D:\ChatGPT\Deep Focus` root with
  `gradlew.bat assembleDebug -PreactNativeArchitectures=arm64-v8a --no-parallel
  --max-workers=1 -Dorg.gradle.jvmargs=-Xmx1536m`. Result: **BUILD
  SUCCESSFUL**, 451 actionable tasks (21 executed, 430 up-to-date). The APK is
  `android/app/build/outputs/apk/debug/app-debug.apk`, 91,264,923 bytes,
  SHA-256
  `C0A68DB3034778217FC0F0E3C4B4EC5375F99C690B5180DB165607A76AA26B6B`.
  `apkanalyzer` reports application id `com.randunukaushan9.DeepFocus`, version
  `1.0.0`; this proves a build artifact only and no device installation is
  claimed. `apksigner verify --verbose` passed with APK Signature Scheme v2;
  `apkanalyzer` confirms min SDK 24, target SDK 36 and the expected
  `arm64-v8a` native libraries.
- The debug APK does not contain an embedded JavaScript bundle and launches
  through Expo Dev Launcher; a phone test using this artifact therefore needs
  a reachable Expo development server. A standalone release build then
  succeeded by invoking Gradle from the actual `D:\ChatGPT\Deep Focus` project
  root, so the junction-resolved dependency tree and project path shared one
  filesystem root. Command:
  `gradlew.bat assembleRelease -PreactNativeArchitectures=arm64-v8a
  --no-parallel --max-workers=1
  -Dorg.gradle.jvmargs=-Xmx1536m`. Result: **BUILD SUCCESSFUL**, 824
  actionable tasks (522 executed, 302 up-to-date), after the earlier
  `C:`/`D:` path-root failure. The standalone APK is
  `android/app/build/outputs/apk/release/app-release.apk`, 50,336,177 bytes,
  SHA-256
  `AC7DA04CB7E60948C04851F53334A0B473598EF8D2E35DD387018B20787823C5`.
  `assets/index.android.bundle` is present, `apkanalyzer` reports application
  id `com.randunukaushan9.DeepFocus`, version `1.0.0`, min SDK 24 and target
  SDK 36, and the APK contains `arm64-v8a` native libraries. `apksigner
  verify --verbose` passed with APK Signature Scheme v2. This proves a
  standalone build artifact only; device installation and runtime behavior
  remain unverified.
- `node_modules\\.bin\\tsc.cmd --noEmit` completed with exit code 0.
- `npm.cmd run lint -- --max-warnings=0` completed with exit code 0.
- Android physical-device lifecycle, rendering, TalkBack, background/force-stop
  recovery and permissions are **NOT_RUN**. A read-only `adb devices -l` probe
  also could not start the local ADB daemon in this environment.
- iOS device/simulator verification is **NOT_RUN**.
- Live Supabase migrations, Edge Functions, Auth/OAuth provider configuration,
  RLS and cloud sync integration are **NOT_RUN / REVIEW_PENDING**.
- This record proves local automated behavior only; it is not release readiness.

## Ordered next tasks

1. **Build artifact** — **PASS for debug and standalone release**. The
   `arm64-v8a` debug and release APK paths, metadata, checksums, embedded
   bundle and release signature evidence are recorded above.
2. **Phone core pass** — install the verified APK and run the owner-facing
   checklist: launch/onboarding, sign-in boundaries, Home, task/goal edits,
   Focus start/pause/resume/complete/cancel, break/recovery, Progress/Rewards,
   Settings/locale, force-stop/relaunch and accessibility spot checks.
3. **Fix only observed defects** — record each device failure as a small
   scoped task, change only approved app files, add a focused regression test,
   and repeat the relevant checks.
4. **Provider/security gate** — separately obtain the required authority and
   independent review before touching live Supabase migrations, Auth/OAuth,
   RLS, sync, secrets, billing or AI provider activation. These are not
   prerequisites for local-first core phone testing.

## Owner phone-core checklist

Use the standalone release APK for this pass. Record **PASS**, **FAIL** with a
short reproduction note, or **NOT_RUN**; do not infer a pass from local tests.

| Small task | Acceptance check | Status |
| --- | --- | --- |
| Install and launch | APK installs, opens, and remains responsive | NOT_RUN |
| Onboarding/auth boundary | First-run route, sign-in boundary, safe error and sign-out state | NOT_RUN |
| Home and local navigation | Home, tabs, back navigation and empty/loading/error states | NOT_RUN |
| Tasks | Create, edit, complete, archive/delete and reload persistence | NOT_RUN |
| Goals | Create/edit, detail progress and reload persistence | NOT_RUN |
| Focus session | Start, pause, resume, complete and cancel | NOT_RUN |
| Break/recovery | Break transition, restart/recovery and clock-safe visible state | NOT_RUN |
| Progress/rewards | Period view, streak/XP projection, empty/error states | NOT_RUN |
| Settings/locale | Duration, break and locale persistence; retry/error behavior | NOT_RUN |
| Relaunch resilience | Force-stop, relaunch and unfinished-session recovery | NOT_RUN |
| Accessibility spot-check | Labels, focus order, contrast/readability and TalkBack basics | NOT_RUN |
