# Dependency audit evidence — 2026-10-06

> **Remediation addendum (later on 2026-10-06):** The original audit below is
> historical and reports the pre-remediation graph. Expo SDK-compatible direct
> patch alignment reduced that graph from 40 to 38 findings (25 high, 13
> moderate). A reviewed, non-force `npm audit fix` then changed 16
> semver-compatible transitive packages (0 additions/removals) and its bundled
> fresh full-audit output reported 32 findings (20 high, 12 moderate, 0
> critical). Fresh standalone full and `--omit=dev` audits also both report 32:
> 7 direct and 25 transitive. No `--force`, major framework switch or downgrade
> was used. The initial direct/transitive split and impact analysis below are
> not presented as a post-remediation package inventory.

## Fresh audit after auth dependencies — 2026-10-07

Using official npm CLI 11.6.2 from the separate pnpm dlx tool cache, Node
24.19.0, without installing/updating project dependencies:

- `pnpm dlx npm@11.6.2 audit --json` — exit 1, 32 findings: 12 moderate,
  20 high, 0 critical; 7 direct package records, 25 transitive package records.
- `pnpm dlx npm@11.6.2 audit --json --omit=dev` — same 32/12/20/0 counts.
- `node node_modules/expo/bin/cli install --check` — “Dependencies are up to
  date.” Root SDK values remain Expo 56.0.23, Router 56.2.21, React Native
  0.85.3, Reanimated 4.3.1 and Worklets 0.8.3. The SDK 56 compatibility table
  targets React Native 0.85; no framework downgrade was attempted.

Direct audit records: `@expo/ngrok`, `expo`, `expo-router`,
`expo-splash-screen`, `react-native`, `react-native-reanimated`,
`react-native-worklets`. Remaining records are transitive. The unchanged
`--omit=dev` count is a package-lock/root-manifest classification: those root
dependencies are placed under `dependencies`, including Expo CLI/Metro tooling.
It does **not** prove all named packages or call paths ship in the installed
mobile application. No production mobile bundle was built here.

Call-path triage (not an exploitability certification):

- `decode-uri-component@0.2.2` is brought by `query-string@7.1.3`, a dependency
  of Expo Router. The reported issue is malformed-input decoding DoS. Version
  0.5.0 is published as ESM (`type: module`, ESM export), while the installed
  query-string 7 entrypoint is CommonJS and uses `require`; a simple override
  would break module loading. Expo Router 58 is a major jump. No override was
  applied. Treat malformed-link availability as a release blocker pending a
  compatible upstream fix or reviewed adapter plus tests.
- `image-size@1.2.1` appears in the Metro/build dependency tree. Advisories
  describe parser loops on crafted JXL/HEIF/ICNS inputs, affecting build-process
  availability if an attacker-controlled image reaches that parser. Registry
  query for `image-size@1.2.2` returned 404; available 2.x is a major API line,
  so no override was applied. Do not treat repository assets as the only future
  input until the build path is reviewed.
- `node-forge@1.4.0` is in Expo CLI/certificate tooling. The advisory concerns
  RSA PKCS#1 v1.5 signature verification with malformed nested algorithm data.
  Registry query for 1.4.1 returned 404 and the registry's current version was
  1.4.0; no patched release could be confirmed. Exposure is build/CLI-side, not
  evidence of an app-runtime exploit.
- `uuid` occurs as 3.4.0 under `@expo/ngrok` and 7.0.3 in the root tree. The
  advisory concerns v3/v5/v6 when a caller supplies a buffer. Inspected call
  sites in `xcode` and `@expo/ngrok` call `uuid.v4()` without a buffer, so this
  advisory's stated trigger was not found in those call sites; this is bounded
  source evidence, not a claim that every consumer is safe. Both uses are
  tooling/development pathways in this app.
- `braces`/`micromatch` and `image-size` findings are in the Metro/watch/build
  chain; crafted patterns/assets can affect developer or build availability.
  `expo`, `@expo/*`, Metro and Xcode-related records are mostly aggregated
  descendants, not independent additional CVEs. Do not count 32 package records
  as 32 distinct root advisories.
- The `react-native`/virtualized-list, Reanimated and Worklets nodes are also
  present in the application dependency graph, so their release impact cannot
  be dismissed as dev-only. Npm's grouped report does not by itself show a
  vulnerable call path or prove exploitation. Keep them pending a package- and
  advisory-specific review; maintain the Expo SDK 56/RN 0.85.3 supported set.

Primary advisory references: [braces GHSA-vfj7-8cjw-p6xm](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), [decode-uri-component GHSA-vcc3-ghjq-m6fr](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr), [image-size GHSA-5p2g-fcmc-qvqq](https://github.com/advisories/GHSA-5p2g-fcmc-qvqq), [image-size GHSA-w3rx-r6r6-pgpr](https://github.com/advisories/GHSA-w3rx-r6r6-pgpr), [node-forge GHSA-86w9-cpqp-85rv](https://github.com/advisories/GHSA-86w9-cpqp-85rv), and [uuid GHSA-w5hq-g745-h8pq](https://github.com/advisories/GHSA-w5hq-g745-h8pq). Expo's [SDK 56 version table](https://docs.expo.dev/versions/v56.0.0/) confirms the supported React Native major/minor. These sources inform issue descriptions and compatibility only; no exploit testing against a live service occurred.

**Disposition:** no `audit fix`, force, override, downgrade, lockfile change or
project dependency change was made during this fresh audit. `pnpm dlx` initially
hit sandbox `EPERM` resolving the user profile; the authorized retry succeeded.
The only registry metadata sent was dependency names/versions through the audit
and targeted package metadata queries; no app/user data or secrets were sent.
These findings remain a release/security-review gate. This fresh report does not
erase or replace the historical 2026-10-06 remediation record above.

The six approved Expo SDK 56-compatible direct patches were applied before the
transitive remediation: `expo` `~56.0.23`, `expo-constants` `~56.0.27`,
`expo-dev-client` `~56.0.27`, `expo-image` `~56.0.13`, `expo-linking`
`~56.0.18`, and `expo-router` `~56.2.21`. Expo's local compatibility check
passed immediately after those patches. A post-remediation rerun initially hit
registry `EACCES`; after using the approved network permission, the final
`node node_modules/expo/bin/cli install --check` passed with “Dependencies are
up to date.” Fresh full and `--omit=dev` npm audits both returned 32 findings
(20 high, 12 moderate, 0 critical; 7 direct, 25 transitive). The root app's
47/47 tests, TypeScript typecheck and focused ESLint passed after dependency
changes. The website's 5/5 tests, typecheck,
ESLint and static production build also passed. These checks are not native
device verification or independent review.

The last npm audit report listed `braces`, `decode-uri-component`,
`image-size`, `node-forge` and `uuid` among remaining vulnerable packages.
The audit proposed breaking remediation paths (including an Expo 44
downgrade and Expo Router 58 jump); none was applied. The reviewed transitive
updates included only npm's semver-compatible non-force candidates. Actual
runtime/build reachability review remains pending. The same npm dependency-graph
classification under `--omit=dev` means the affected graph is reachable through
root production dependencies, not that every affected module ships in or is
called by the application. Dependency advisory presence is not proof of
exploitability; graph inclusion alone does not prove a reachable exploit path.
The reviewed actions changed the root `package.json`/`package-lock.json` for
the six Expo SDK-compatible patch versions and the 16 semver-compatible
transitive updates; no global Node configuration or website dependencies were
changed by the root remediation. `npm audit fix` exited 1 because the fresh
report still contains these unresolved findings. npm also warned that the
`unrs-resolver@1.12.2` postinstall script is outside the current `allowScripts`
policy; that script was not approved or executed. No audit `--force` was used.

## Command and scope

- Used the official npm CLI 11.21.0 package in a unique temporary directory,
  with Node v24.19.0 (supported by npm 11's documented Node engine range).
- Read-only queries: `npm audit --json` and `npm audit --json --omit=dev`.
  Both audit reports used the existing `package-lock.json`; no install, fix,
  package-manager setup or dependency resolution command was run.
- The owner approved sending package/dependency metadata to the default npm
  registry. No app/user data or secrets were included intentionally.
- Temp reports and CLI: `C:\Users\User\AppData\Local\Temp\deep-focus-npm-audit-c4e45b736c434675a043787ab94c09ce`.
- The audit process verified `package.json` and `package-lock.json` hashes were
  unchanged before/after. Observed hashes afterward:
  `package.json` `A378D2D5ACF2D3C3C4F75B407420D30ABCFA3AA76E71807FCAD0162A469690CA`;
  `package-lock.json` `6E4B125AAD7ACE5F080295D475A30FE42623CA2C778B35049A5EDA081EDC843B`.
  Both files were already modified in the working tree before this audit.

## Results

Both full and `--omit=dev` reports returned 40 affected package entries: 27
high, 13 moderate, 0 critical/low. npm classifies 7 findings as direct and 33
as transitive. The production-only query returned the same 40 entries, so none
is exclusively reachable through lockfile entries marked development-only.
Some copies of `brace-expansion` are dev-only, but a vulnerable production-tree
copy also exists. This is npm dependency-graph classification, not proof that
all entries ship in the application binary or execute for users.

Direct root dependencies reported:

| Severity | Package | Locked version | Audit relation / remediation signal |
| --- | --- | --- | --- |
| Moderate | `@expo/ngrok` | 4.1.3 | Via `uuid`; npm reports no automatic fix. Source search found no app import; likely developer tunnel utility, but remains declared as production dependency. |
| High | `expo` | 56.0.21 | Aggregates vulnerable Expo CLI/config/Metro dependencies; npm's suggested Expo 44.0.6 is a major downgrade and not an acceptable fix. |
| Moderate | `expo-router` | 56.2.20 | Via `query-string` / `decode-uri-component`; suggested 58.0.15 is a major version jump. |
| Moderate | `expo-splash-screen` | 56.0.15 | Via Expo config tooling; suggested 55.0.25 crosses the SDK major line. |
| High | `react-native` | 0.85.3 | Aggregates Metro/CLI and virtualized-list entries; suggested 0.72.17 is a major downgrade. |
| High | `react-native-reanimated` | 4.3.1 | Audit associates it with the React Native finding; suggested 4.2.2 is flagged as a breaking remediation. |
| High | `react-native-worklets` | 0.8.3 | Via React Native Metro config; suggested 0.7.4 is a breaking remediation. |

Transitive findings, grouped by severity (versions from this lockfile):

- **High (23):** `@expo/cli` 56.1.25; `@expo/code-signing-certificates` 0.0.6;
  `@expo/metro` 56.0.2; `@expo/metro-config` 56.0.19;
  `@expo/metro-file-map` 56.0.4; `@react-native/community-cli-plugin` 0.85.3;
  `@react-native/metro-config` 0.85.3; `@react-native/virtualized-lists` 0.85.3;
  `@xmldom/xmldom` 0.8.13 and 0.9.10; `brace-expansion` 5.0.6 (plus dev-only
  copies at 1.1.18); `braces` 3.0.3; `browserslist` 4.28.4; `compression` 1.8.1;
  `http-cache-semantics` 4.2.0; `image-size` 1.2.1; `metro` 0.84.4/0.84.5;
  `metro-config` 0.84.4/0.84.5; `metro-file-map` 0.84.4/0.84.5;
  `metro-transform-worker` 0.84.4/0.84.5; `micromatch` 4.0.8;
  `node-forge` 1.4.0; `shell-quote` 1.8.4; `source-map-js` 1.2.1.
- **Moderate (10):** `@expo/config` 56.0.14; `@expo/config-plugins` 56.0.16;
  `@expo/inline-modules` 0.0.16; `@expo/local-build-cache-provider` 56.0.12;
  `@expo/prebuild-config` 56.0.23; `baseline-browser-mapping` 2.10.38;
  `decode-uri-component` 0.2.2; `query-string` 7.1.3; `uuid` 3.4.0/7.0.3;
  `xcode` 3.0.1.

## Impact assessment

The report aggregates some parent findings from vulnerable descendants, so the
40 package entries are not 40 independent exploit chains. Audit details include
specific XML injection/parser/CPU/memory denial-of-service issues in `@xmldom`,
image parser infinite loops in `image-size`, RSA PKCS#1 v1.5 verification
weakness in `node-forge`, cache-isolation disclosure in `http-cache-semantics`,
and parsing/resource-exhaustion issues in other transitive packages. These
require their corresponding vulnerable code paths and attacker-controlled
inputs; the audit alone does not demonstrate those preconditions in this app.

The source/lockfile graph indicates a mixed surface:

- Expo CLI, config/prebuild, Metro, Xcode/plist, image-size, ngrok and much of
  the parser/glob/source-map chain are developer/build tooling. Potential impact
  is on local development or CI/build machines processing untrusted project,
  asset, source-map, XML/configuration or tunnel input—not automatically on
  installed app users.
- React Native / virtualized lists, Reanimated/Worklets, and Expo Router are
  runtime-facing dependencies. Their report entries warrant focused SDK/source
  review, especially URL/query parsing and list/runtime behavior; no affected
  call-site exploitability or native-binary inclusion was established here.
- npm's identical `--omit=dev` result arises because Expo/React Native tooling
  is currently reachable from root `dependencies`, not `devDependencies`.
  Moving packages between dependency sections is not a safe audit-only fix and
  was not done.

Thus findings are **confirmed vulnerable dependency metadata**, not confirmed
exploitation. They also cannot be blanket-labeled harmless: some have runtime
paths and some could affect developer/build machines when vulnerable operations
receive crafted input. Actual deployed reachability remains unverified without
the supported platform builds and call-site/dependency review.

## Remediation disposition

> This disposition records the original read-only audit result. It is
> superseded for current state by the remediation addendum at the top of this
> file.

- No project files, lockfile, dependencies, versions or global Node setup were
  changed. No `npm audit fix` was run.
- npm's proposed root fixes include Expo 44, React Native 0.72 and other
  cross-major/older SDK targets. Reject these as automatic remediations; they
  require a separately planned and approved coordinated framework upgrade.
- Several transitive entries are marked fixable without a root-major change,
  while `@expo/ngrok` has no automated fix. Before patching, obtain a current
  Expo SDK 56-compatible resolution plan, confirm advisory-specific fixed
  versions in registry/advisory sources, and test Expo compatibility, native
  builds and the full app suite. No upgrade was attempted under this audit task.
- Independent security review and Android/iOS device verification remain
  separate pending gates. This report is not production/release approval.

## SDK-compatible remediation check — 2026-10-06 (pre-fix historical assessment)

Official Expo documentation confirms SDK 56 targets React Native 0.85 and React
19.2.3; those root versions are not arbitrary mismatches. Expo's SDK 56 changelog
also records a Hermes V1 memory regression affecting apps that import
`react-native-worklets` or `react-native-reanimated`, and recommends SDK 57 for
resolution. Expo states the fix landed in `expo@57.0.9` with React Native 0.86.2,
while explaining that moving 0.85→0.86 entails a substantial change set and was
intentionally not folded into an SDK 56 routine package fix. Sources:
[SDK 56 changelog](https://expo.dev/changelog/sdk-56),
[SDK 57 changelog](https://expo.dev/changelog/sdk-57), and
[SDK 56 compatibility table](https://docs.expo.dev/versions/v56.0.0/).

This is an official runtime compatibility/performance warning, separate from
the npm advisory severities; it is not evidence that a vulnerability is
exploitable in this app. SDK 57 was not applied: doing so would change the
React Native/native dependency baseline and needs a planned, lockfile-backed
upgrade with Android/iOS builds and device review. No `audit fix --force`, major
framework switch, downgrade, override or package-version change was made.

An isolated public-site dependency install was attempted with the approved npm
CLI and pinned Next.js 16.3.8 / React 19.2.3 peer-compatible declarations. The
registry request for the React package manifest returned `ENOTFOUND
registry.npmjs.org`; npm then reported `react@undefined` during tree resolution.
This is missing network metadata, not a demonstrated peer incompatibility. The
install was stopped without `--force`/`--legacy-peer-deps`; no web lockfile or
installed packages were produced. Exact further patch fixes cannot be safely
installed or tested until this environment can reach the official npm registry.
