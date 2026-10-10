# Android preview native-runtime repair

Task: restore the owner's Android development preview from the supplied log.
Scope: local build from clean `C:\Dev\Deep-Focus` checkpoint `fbef074`, generated
ignored Android/build output, installation of the matching debug binary on the
connected owner's test phone, and this evidence record. No source/lockfile upgrade,
database workaround, data clearing/uninstall, commit, push or release deployment.
Risk: MEDIUM local development build; existing HIGH persistence review gates remain.
Acceptance: matching native Worklets and ExpoSQLite included; device can open the
app without the supplied native-module errors. A successful compile alone is not
runtime acceptance. Preserve existing app data; stop on signing/install conflict.
Read: AI rules, execution policy, DoD, guardrails, map, task brief; development guide
environment/setup sections; official Expo local-development and Worklets troubleshooting.

Observed: supplied log reports JS Worklets 0.8.3 versus native 0.10.1 and missing
ExpoSQLite. Cascading router import/default-export/ErrorBoundary errors follow.
The C:\Dev checkout is clean on the checkpoint branch; native android directory
is absent. `expo install --check` reports dependencies up to date. SQLite is already
declared in package.json and app.json. Connected SM-A107F reports armeabi-v7a ABI.
No reason to remove SQLite, fake route exports or upgrade the SDK to match an old APK.

Sources:
- https://docs.expo.dev/guides/local-app-development/
- https://docs.swmansion.com/react-native-worklets/docs/guides/troubleshooting/
- https://docs.expo.dev/versions/v56.0.0/sdk/sqlite/

## Local build evidence — 2026-10-08

The local debug APK was rebuilt with the repository's existing Android project;
no source, lockfile or provider configuration was changed for this build.

Command: `android\gradlew.bat assembleDebug --offline --no-daemon`

Latest result: `BUILD SUCCESSFUL` (exit code 0), 662 actionable tasks, 55
executed and 607 up-to-date. The debug APK is:
`android\app\build\outputs\apk\debug\app-debug.apk`

The latest rebuild was repeated after adding the ignored local development
configuration for the owner-approved `deep-focus-dev` Supabase project and
after the local SQLite v5 locale preference, locale-aware primary navigation,
reduced-motion splash handling, v4 outbox and onboarding personalization
changes. Gradle
reported that `.env.local` loaded the two public `EXPO_PUBLIC_SUPABASE_*`
values. No service-role key or private credential was used, and the file is
ignored by Git.

- Size: 257,075,010 bytes
- SHA-256: `5553642BDC4B9BFF144F40F4D54D2D2E6891FF8F3D2D7F30050B80D103964993`
- This 2026-10-08 rebuild includes the local SQLite v5 locale preference,
  locale-aware primary navigation, reduced-motion splash handling, v4 outbox
  foundation and onboarding personalization confirmation flow.
- Warnings: existing Kotlin/C++ deprecation warnings, SDK XML compatibility
  notice and Gradle deprecation notice; no build failure.

After a privileged ADB daemon retry, `adb devices -l` returned only the header
with no attached device or emulator.
Therefore APK installation and Android runtime/end-to-end verification remain
`NOT_RUN`; a successful local build is not device acceptance.
