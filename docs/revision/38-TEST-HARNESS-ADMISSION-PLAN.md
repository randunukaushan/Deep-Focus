# Test harness admission plan

Date: 2026-09-28. Status: **PROPOSED — not installed or implementation-approved**.

මුලින් timer logic එකේ ගැටලු විශ්වාසදායකව හඳුනාගන්න test setup එකක් හදමු.
ඊළඟට UI interactions, සැබෑ storage සහ devices වෙන වෙනම පරීක්ෂා කරමු.
පළමු කොටස pass වීමෙන් අනෙක් කොටස් pass වූ බව කියන්නේ නැහැ.

## 1. Task brief — L-02A documentation

- Outcome: bounded harness proposal following [13 §11](13-CORE-RELIABILITY-CONTRACTS.md#11-foundation-handoff-refresh--september-28),
  with exact first-slice files/commands, baseline oracles, tool compatibility
  evidence and separate component/native admission gates.
- Authority/phase: owner continuation of documentation; L-02 foundation before
  CR implementation. ADR-012 storage selections do not approve test packages.
- Risk: MEDIUM, reversible tooling design with no production boundary changes.
  Author self-review for this proposal; targeted tooling review before adoption.
  Existing HIGH storage/ownership/viewer review gates are unchanged.
- Read: full AI rules/execution/DoD/guardrails/map/task template; playbook §§1–4,
  core §11, readiness §4, testing strategy §4.1–4, implementation-plan introduction.
  Earlier interrupted research inspected engine/diagnostic, package/lock/installed
  versions, Expo bundled recommendations and tsconfig; refreshed dirty state,
  package and engine/Home/theme hashes on resume.
- Allowed current writes: this new file; docs/revision/07-LUNA-IMPLEMENTATION-PLAYBOOK.md,
  13-CORE-RELIABILITY-CONTRACTS.md, 18-IMPLEMENTATION-READINESS-AND-OWNER-DECISIONS.md,
  09-COVERAGE-AND-AUDIT.md and README.md in that same directory;
  docs/DOCUMENTATION_MAP.md and docs/CHANGELOG.md. No other files.
- Acceptance: first-slice commands/files are concrete; public metadata is not
  called runtime proof; deliberate failures remain visible; component/native
  boundaries and missing authority are explicit; document checks pass.
- Verification: existing check-docs, whitespace/identifier review, semantic
  self-review and retained read-only probes below. No new installed test suite.
- Non-goals: app fixes, dependencies, package scripts/config, React upgrade,
  accounts, real files/data, native build, paid test runs, agents or deployment.
- Recovery/STOP: correct only this documentation if evidence is wrong. Stop
  affected adoption for peer conflicts or unsupported imports; never weaken
  assertions, use forced dependency resolution or rewrite the app to hide them.

## 2. Recommended test layers

This is a staged recommendation, not approval of a second application framework.

| Layer | Proposed tool / environment | What it can establish | What it cannot establish |
| --- | --- | --- | --- |
| Pure timer domain first | Installed Node 24.19.0 `node:test` and `node:assert/strict`, explicit synthetic timestamps | Transition/projection arithmetic and validation outcomes in the actual engine | React behavior, mobile clock/lifecycle, durable saves or security |
| Hook/component second | Candidate Jest + SDK-matched jest-expo + React Native Testing Library; exact tuple below still untested | Loading/error/actions, no invalid completion navigation, injected storage failures | Real SQLite transactions, OS permissions, process death or platform accessibility |
| Storage/API integration | Separately approved disposable SQLite/backend targets and real adapters | Transactions, ownership, retry/migration effects in that environment | Production policy/compliance or every device condition |
| Device/release | Approved Android/iOS builds and device matrix under 08/13 | Background/restart, accessibility and real user flows | Universal correctness from one passing device |

Node 24.19.0 supports erasable TypeScript syntax without doing type checking;
it does not apply tsconfig path aliases or support TSX. Use it only for the
inspected pure-engine boundary, not the React hook. A separate project typecheck
is still required. [Node TypeScript reference](https://nodejs.org/download/release/v24.19.0/docs/api/typescript.html).

The Node test runner supports assertions and nonzero failure exit status. Use
finite one-shot runs, not watch mode, for handoff evidence.
[Node test runner](https://nodejs.org/download/release/v24.19.0/docs/api/test.html).

## 3. L-02A implementation proposal — pure domain only

**Do not execute this implementation from a general documentation continuation.**
After explicit bounded approval, proposed allowed new files are:

- `tests/domain/session-engine.test.mjs`: eight named tests CR-T01–08, using
  actual source imports, independent expected values from 13 §8/11 and fresh
  synthetic sessions. No copied replacement engine or provider/native mocks.
- `tests/domain/README.md`: exact runtime/command, expected baseline failures,
  source fingerprint, interpretation and limitations.

No dependency or lockfile change is needed for this initial proposal. No root
`test` script, `type: module`, tsconfig, app file or diagnostic rewrite is included.
Keep tests outside `src/app` so they are not routes. Start with explicit named
files rather than broad test discovery that might run unrelated fixtures.

Proposed test import from the future test file:

```js
import test from 'node:test';
import assert from 'node:assert/strict';
import * as engine from '../../src/features/focus/session-engine.ts';
```

This import path is for the future `.mjs` file, not a shell working-directory
path. The current engine has only an erased type import. Re-inspect any future
runtime imports before execution: no aliases, TSX/native modules or unexpected
top-level I/O may silently enter this layer. Loading tests is not a sandbox.

The read-only probe emitted `MODULE_TYPELESS_PACKAGE_JSON`, then successfully
reparsed the engine as ESM. Record this known warning; do not change the mobile
package's module type merely to suppress it. If a later runtime cannot load the
unchanged source, report a tooling error and review the boundary, not a pass.

### Proposed commands after the files exist (NOT_RUN as a file-based suite)

From repository root, with the inspected Node 24.19.0 executable as `node`:

```text
node --test --test-reporter=tap tests/domain/session-engine.test.mjs
node node_modules/typescript/bin/tsc --noEmit
```

On this Windows host, use the actual executable when Node is not on PATH:

```powershell
& 'C:/Users/User/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/bin/node.exe' --test --test-reporter=tap tests/domain/session-engine.test.mjs
```

The `.mjs` tests are runtime assertions, not covered as typed tests by the existing
TS/TSX include patterns. Review their assertions directly; project typecheck
validates the app separately. Do not call transpilation/type stripping a typecheck.
Inspect and run the existing `npm run lint` for an approved implementation;
it is not replaced by this proposal and was not rerun for this document-only work.

### Required acceptance of the future harness

| ID | Given / when | Required result | Current file-suite state |
| --- | --- | --- | --- |
| TH-T01 | Run the eight cases against the recorded unchanged engine | Exactly CR-T01/03/07 pass and CR-T02/04/05/06/08 fail with their contract assertions; eight executed, none skipped | NOT_RUN |
| TH-T02 | Attempt early completion, terminal reprojection and epoch-zero pause | Assert 13 §11's expected values, not the observed defective values; failures remain visible | NOT_RUN |
| TH-T03 | Zero duration or corrupt startedAt | Only the explicit rejection/result policy used by the baseline qualifies; arbitrary crashes do not count as valid rejection | NOT_RUN |
| TH-T04 | Run a disposable deliberately false assertion in a separate process | Nonzero failure with a named assertion; do not retain an always-failing canary in the product suite | NOT_RUN |
| TH-T05 | Missing source, invalid syntax or unsupported runtime import | Distinct loader/tooling diagnostic before claiming case results; never relabel it as a reproduced product gap | NOT_RUN |
| TH-T06 | Repeat the suite using fresh fixtures | Same case outcomes; no elapsed real waiting, random-ID snapshot expectation or state leakage across cases | NOT_RUN |
| TH-T07 | Inspect test inventory and process exit | No skip/todo/only, expected-failure inversion or swallowed error; zero discovered tests is not acceptance | NOT_RUN |
| TH-T08 | Compare worktree/package/source to the authorized baseline | Only approved test/docs files changed; no engine fixes or dependency changes hidden in harness adoption | NOT_RUN |

TH-T04 has supporting eval-probe evidence below, but the future file-suite
acceptance packet has not run. TH-T01's red baseline verifies fault detection,
not a successful product. After an approved engine repair, the acceptance target
becomes all eight relevant contract cases passing; never make “five failures” a
permanent success condition. Approved API changes require explicit test adapters,
not weaker assertions. Preserve the original diagnostic as historical evidence.

## 4. Component candidate versions and admission boundary

Local installed/lock inspection: Expo 56.0.21, React/React DOM 19.2.3,
React Native 0.85.3 and TypeScript 6.0.3. Jest, jest-expo, @types/jest,
@testing-library/react-native and react-test-renderer were absent in inspected
installed paths and lock entries. Expo's installed bundledNativeModules.json
recommends jest-expo `~56.0.5`; a recommendation range is not a tested resolution.

Public registry metadata was read on September 28, before interruption. Exact
candidate identities below are **not** an approved install list or complete
transitive audit. No `latest` reference is an implementation pin.

| Candidate | Observed metadata / consequence |
| --- | --- |
| [jest-expo 56.0.5](https://registry.npmjs.org/jest-expo/56.0.5) | Uses Jest-29-family dependencies, pins react-test-renderer 19.2.3; peer @react-native/jest-preset ^0.85.0; Expo and react-server-dom-webpack peers marked optional |
| [Jest 29.7.0](https://registry.npmjs.org/jest/29.7.0) + [@types/jest 29.5.14](https://registry.npmjs.org/@types%2Fjest/29.5.14) | Exact candidate metadata exists; Jest's Node range includes >=18; not proof of full Expo preset compatibility |
| [@react-native/jest-preset 0.85.3](https://registry.npmjs.org/@react-native%2Fjest-preset/0.85.3) | React peer ^19.2.3, Node >=20.19.4; matches inspected top-level versions by range |
| [@testing-library/react-native 14.0.1](https://registry.npmjs.org/@testing-library%2Freact-native/14.0.1) | Peers Jest >=29, React >=19, RN >=0.78 and test-renderer ^1.0.0; Node ^22.13.0 or >=24 |
| [test-renderer 1.3.0](https://registry.npmjs.org/test-renderer/1.3.0) | Initial candidate: React peer ^19, depends on react-reconciler ~0.34.0. Subsequent section 6 finds a transitive peer mismatch; do not adopt this candidate on the current stack |
| [react-server-dom-webpack 19.2.4](https://registry.npmjs.org/react-server-dom-webpack/19.2.4) | React/React DOM peers ^19.2.4 do not include current 19.2.3. This is an optional jest-expo peer, not proof the minimal client suite requires it |

Expo documents jest-expo as a native-mocking preset and recommends React Native
Testing Library for components. That establishes direction, not this tuple's
runtime compatibility. [Expo guide](https://docs.expo.dev/develop/unit-testing/).
RNTL 14 documents a **test-renderer** peer, a different package from deprecated
**react-test-renderer**. [RNTL quick start](https://oss.callstack.com/react-native-testing-library/docs/start/quick-start).
Do not conflate the two or remove a preset's declared dependency manually.

Before L-02B component implementation: inspect full candidate peers/transitives
and advisory/license metadata; determine optional server-rendering peer need;
approve exact install/config files; then test an isolated compatible resolution
and the actual hook with controlled storage/AppState/router doubles. No forced
peer bypass, blanket React upgrade or automatic removal of dependencies.

Proposed later files (not authorized now): `jest.config.cjs`,
`tests/component/focus-session.test.tsx`, `tests/component/setup.ts`, package and
lock updates. Define a component-only match pattern so Jest does not collect
Node `.mjs` domain tests. Scope mocks to external boundaries; keep the real hook
and engine where their interaction is under test. Do not put an always-successful
storage fake behind a failure test or mock the behavior being asserted.

Candidate one-shot command after admitted installation/configuration:
`node node_modules/jest/bin/jest.js --config jest.config.cjs --runInBand`.
This path does not exist now. Component loader, fake-time cleanup, pending load,
save-failure, rejection/navigation and cleanup/unmount smoke tests are NOT_RUN.
OS/device tests remain separate even after these pass.

## 5. Actual evidence retained from the interrupted research

- Native Node eval imported the unchanged actual engine and executed one
  full-duration completion/projection test: **1 PASS, exit 0**, known ESM warning.
- A separate eval `node:test` assertion `assert.equal(1, 2)` produced **exit 1**
  with ERR_ASSERTION. This deliberately failing canary confirms failure signalling,
  not an app defect. It created no file or permanently broken test.
- Existing `inspect-core-baseline.mjs` ran at `2026-09-27T20:33:43.600Z`:
  **3 PASS / 5 CONTRACT_GAP, exit 1**, unchanged engine SHA-256
  `44c029a482e1a452acc633577dacac4a59b6a01df373cfa8eb1654716c1c78a4`.
- Initial public registry requests hit a sandbox socket denial and returned null
  placeholders; those are not package facts. Approved read-only escalation then
  returned the metadata above. No install, extraction or package code execution.
- On resume, engine/Home/theme fingerprints matched the prior checkpoint. No
  complete test suite, component mount, typecheck/lint, native build, device,
  persistence or security test was performed by these probes.

## 6. Component compatibility follow-up — L-02B preparation

### Bounded task brief

Outcome: investigate the unresolved renderer peer chain and specify the smallest
candidate that does not require a mobile React upgrade. MEDIUM, metadata/review
preparation only; not independent review or dependency approval. Reads: section 4,
installed package/lock baseline, execution/DoD/guardrails/map and task template.
Allowed writes: this file, revision 07-LUNA-IMPLEMENTATION-PLAYBOOK.md,
18-IMPLEMENTATION-READINESS-AND-OWNER-DECISIONS.md, 09-COVERAGE-AND-AUDIT.md and
docs/CHANGELOG.md. Acceptance: exact peer chain, rejected/candidate distinction,
reproducible range checks and remaining actual-install gates. No package/config/
source edits, tarball execution, resolver install, peer override or spending.

Public exact-version metadata inspected September 28 establishes:

| Path | Exact inspected peer evidence | Disposition on React 19.2.3 |
| --- | --- | --- |
| test-renderer 1.3.0 → react-reconciler 0.34.0 (within ~0.34.0) | [react-reconciler 0.34.0](https://registry.npmjs.org/react-reconciler/0.34.0) requires React ^19.3.0 | Fails the inspected chain; broad top-level React ^19 promise is insufficient |
| [test-renderer 1.2.0](https://registry.npmjs.org/test-renderer/1.2.0) → react-reconciler 0.33.0 (within ~0.33.0) | [react-reconciler 0.33.0](https://registry.npmjs.org/react-reconciler/0.33.0) requires React ^19.2.0 | Passes this metadata range check; candidate for isolated resolution, not runtime acceptance |
| RNTL 14.0.1 → test-renderer ^1.0.0 | Exact 1.2.0 satisfies the declared range | Candidate must be pinned exactly; caret ^1.2.0 could later select 1.3.0 |
| jest-expo 56.0.5 → react-test-renderer 19.2.3 | [react-test-renderer 19.2.3](https://registry.npmjs.org/react-test-renderer/19.2.3) requires React ^19.2.3 | Existing candidate's direct peer matches; this remains a different renderer package |

The observed alternative metadata for test-renderer 1.0.0/1.1.0 points to
reconciler ~0.31.0/~0.32.0; those chains were not selected or fully investigated.
The proposed next component tuple is Jest 29.7.0, @types/jest 29.5.14,
jest-expo 56.0.5, @react-native/jest-preset 0.85.3, RNTL 14.0.1 and
**test-renderer 1.2.0**, retaining app React/React DOM 19.2.3 and RN 0.85.3.
This supersedes only the 1.3.0 candidate in section 4, not an owner ADR.

Read-only installed-semver assertions verified these five pairs:
19.2.3/^19.3.0 = false; 19.2.3/^19.2.0 = true;
1.2.0/^1.0.0 = true; 0.33.0/~0.33.0 = true;
24.19.0/(^22.13.0 or >=24) = true. Exit 0, no file writes.
These are range calculations, not a complete npm dependency solver or compatibility
test. The next lock may resolve another 0.33.x; inspect that exact resolved package
and all peers too. Do not add overrides to force the pictured chain into place.

Additional observations: @react-native/jest-preset 0.85.3 uses Jest-29.7-family
dependencies and React ^19.2.3; @types/react-reconciler 0.33.0 declares @types/react
as a peer. Inspected metadata declares MIT for the selected package records,
but license texts, all transitive licenses, integrity and advisory triage remain
unverified. No security conclusion follows from a package license field.

### Actual admission checks still needed

1. In an explicitly authorized disposable tooling environment, resolve the exact
   direct candidates and record every resolved renderer/reconciler/React copy,
   peer error, integrity value and install-script requirement. Environment/files
   and installation authority must be agreed before running a resolver.
2. Establish whether optional server-rendering peers are needed by the chosen
   client-only preset path. If not needed, record their absence. If required,
   investigate the React mismatch; do not upgrade app React, bypass peers or claim
   all preset paths work from one client smoke test.
3. Mount one simple React Native component through the real selected preset and
   renderer, then exercise the actual focus hook with controlled external adapters.
   Assertions must observe both render and interactions. Do not mock the renderer,
   the hook under test, or return a hard-coded expected screen.
4. Prove pending-load, failed-save, rejected-completion/no-summary-navigation,
   fake-time teardown and unmount/listener cleanup cases. A mock AppState event
   establishes only controller response; not Android/iOS process recovery.
5. Run the same project typecheck and unchanged positive domain cases, review the
   full dependency diff and preserve dirty user edits. Do not update snapshots
   automatically to hide an unexpected change or redefine warnings as success.

All five admission checks are NOT_RUN. The conflict has been identified and a
metadata-compatible candidate narrowed; **L-02B remains DRAFT**, not installed,
verified, reviewed independently or READY for production integration.

## 7. Next handoff

First obtain approval for the narrow L-02A two-file test addition, keeping code
and dependencies unchanged. That can establish a useful red regression baseline
without admitting the component stack. Do not mark all of L-02 or CR-02 READY:
the exact engine result/precision/cutoff contract and necessary caller tests
still need resolution; component tooling remains a separate L-02B task.

Document checks verify this proposal's structure, not its implementation. No
owner approval, independent review, install or production readiness is inferred
from a general “continue” message.
