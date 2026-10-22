# SDK56 dependency-security hardening — 2026-10-22

## Bounded task / authority

TASK SDK56-SEC-01; STATE VERIFIED_FOR_DEVELOPMENT_INTEGRATION; DELIVERABLE configuration, reproducible
dependency source backports and regression verification, development integration.
Owner explicitly requested fixes/tests/review/main merge, preserving SDK56.
Owner separately waived independent review for this task's development merge
only, not production. No extra agent. Baseline clean main60d62f2.

RISK HIGH: input parsers and development certificate signature validation;
same upstream APIs/versions, no product auth/data/ownership/provider change.
READ: AGENTS, AI_RULES, execution/DoD/task template/guardrails/map; SECURITY15–17;
architecture platform/layer principles, development conventions, implementation
plan Phase0 dependency review; installed manifests/lockfiles/callers; six GHSA
records and exact Expo56 documentation. Unpatched packages are not fixed simply
by changing audit severity or declaring them dev dependencies.

Allowed: root/web package.json and synchronized locks; new scripts/security/
backport definitions and installer; new tests/domain/sdk56-dependency-security
test; this evidence, CHANGELOG and development installation note. No app feature,
schema, hosted service, major dependency, scope or governing review-rule edits.
Discovered verifier correction: check-assurance-pack and check-education-direction
must bind their dated no-source-change assertions to accepted PR15/17 Git snapshots,
not treat all future authorized source/config changes as forbidden. Their original
path sets/equality assertions and historical body/link/structure checks remain;
no archive, normative authority or assertion is removed.

Outcome: bounded same-version guards for malformed image boxes/ICNS lengths,
linear URI fallback, nested DigestAlgorithm element count and nested brace
input; retain caller API. UUID callers use v4 rather than affected v3/v5 buffer
APIs: document residual package alert, do not force a major change. Development
tunnel remains available, not automatically exposed. Exact patches version/hash
checked, idempotent, fail closed on unknown bytes; no registry/package version
spoofing. All package alerts remain visible to npm audit.

Acceptance A1 SDK56/RN/Router/native dependencies and lock resolutions retained;
A2 negative regression tests reproduce affected shapes and positive API fixtures;
A3 clean install automatically applies patches, checker refuses drift/missing
required targets and accepts repeated application; A4 local full/SQL/types/lint,
web build, Metro Android/iOS export and docs checks; A5 full-diff self-review,
exact audit/residual/native limits and task-specific waiver recorded before merge.

Non-goals: native signed/device acceptance, production deployment/approval,
claiming upstream fixed releases or zero vulnerabilities. Rollback: revert
focused task commit then reinstall its lockfile, not editing shared caches.
STOP on source/version drift, regression, authority conflict or unsafe patch.

## Triage and implemented boundaries

| Advisory / package | Inspected caller / exposure | Scoped disposition |
| --- | --- | --- |
| [JXL/HEIF](https://github.com/advisories/GHSA-5p2g-fcmc-qvqq), [ICNS](https://github.com/advisories/GHSA-w3rx-r6r6-pgpr), image-size1.2.1 | Metro0.84.4 asset parser; build/development input, not an app resource viewer | Reject incomplete/zero/undersized box headers before selected-box return; reject short/zero ICNS records at both first/later reads. Callable CommonJS API retained. image-size2's changed export is not blindly substituted. |
| [URI decoder](https://github.com/advisories/GHSA-vcc3-ghjq-m6fr), decode-uri-component0.2.2 | Expo Router56.2.21 → query-string7.1.3; malformed route/query input can reach runtime | Bounded four-byte UTF-8 decoding and one replacement per encoded run; no recursion, prefix retries or attacker-derived dynamic RegExp. CommonJS/plus/BOM/literal-dollar behavior tested with si/ta/emoji and malformed runs. Patched0.5.0 is ESM and not a drop-in CommonJS override. |
| [Nested DigestAlgorithm](https://github.com/advisories/GHSA-86w9-cpqp-85rv), node-forge1.4.0 | Expo CLI56.1.26 and code-signing-certificates0.0.6 development/build tooling; not product Auth verifier | Backport the exact nested-element-count predicate proposed in [upstream PR1152](https://github.com/digitalbazaar/forge/pull/1152). Positive SHA256 with/without NULL and actual Expo certificate/sign-buffer caller pass; extra nested elements denied. No invented upstream1.4.1 release or complete cryptography audit. |
| [Nested brace walkers](https://github.com/advisories/GHSA-vfj7-8cjw-p6xm), braces3.0.3 | Mobile Expo file-map/micromatch and web Next lint/fast-glob development paths | Bound parser brace/paren stack and compile/expand/stringify recursion to128, including caller-provided ASTs; regular patterns/ranges/escaping remain tested. This is bounded nesting mitigation, not protection against every possible malicious AST/expansion. |
| [UUID buffer APIs](https://github.com/advisories/GHSA-w5hq-g745-h8pq), uuid3.4.0/7.0.3 | @expo/ngrok and xcode inspected source call only uuid.v4(), without supplied buffers | Affected v3/v5/v6 API path not used by inspected callers. Keep package alert open; no forced UUID major override or claim of a patched installed UUID. Re-triage on caller/dependency change and before RC. |

No Expo/RN/Router/Next or other package resolution, dependency range, registry
tarball URL/integrity changed. Both locks only add root hasInstallScript metadata.
Local files in node_modules are deliberately different after installing guards;
shared npm caches remain untouched. Eight mobile/four web files are patched,
with full preimage and patched SHA256 checks. All targets preflight before any
write; idempotent rerun writes zero files. Unexpected version/content/missing
required target fails closed. Production-only web omits braces explicitly;
an entirely missing web install does not falsely pass that branch.

These are local mitigations, not upstream advisory closure. No hosted service,
product authentication policy, ownership, database, native library or active
network listener/tunnel was changed. Do not expose development services to
untrusted networks or feed unreviewed assets/patterns into build tooling.

## Actual verification / failure preservation

Node24.18.0, Windows; isolated branch from60d62f2. Existing pinned dependencies
installed using root/web npm ci --ignore-scripts --no-audit --no-fund; explicit
postinstall applied8/4 files, npm run postinstall reruns wrote0 and security:check
passed in both. Ignore-scripts intentionally bypasses lifecycle hooks and MUST
be followed by the documented postinstall/check; the install itself is no test.

| Check | Result / limits |
| --- | --- |
| Full node --test --test-reporter=tap tests/domain/*.test.mjs tests/components/*.test.mjs tests/navigation/*.test.mjs web/tests/*.test.mjs | Final1791/1791 PASS, zero fail/skip,86961.0627ms; includes15 new dependency cases, not added twice |
| Existing isolated SQL test, external pinned PGlite0.3.14, test-concurrency1 | 10/10 PASS,90523.1669ms; no hosted DB |
| Focused dependency regression file after final refinements | 15/15 PASS,5411.4255ms; same cases already included in full suite |
| Mobile tsc --noEmit / eslint src tests scripts/security | Types PASS; final lint PASS with only four inherited test warnings; initial missing Buffer import lint error corrected explicitly |
| Web npm run typecheck / lint / build | All exit0 PASS, Next16.3.8; local build, not deployment/browser acceptance |
| Expo CLI install --check, EXPO_OFFLINE=1 | Exit0, dependencies up to date; tool itself warns offline validation is limited, not online Expo doctor proof |
| Android/iOS Expo export, max-workers2, dump-assetmap, Hermes enabled | Both exit0 PASS, actual .hbc bundles and asset metadata exported outside repo; not signed native builds or physical-device lifecycle acceptance |
| Docs/contract checkers | Final21/21 PASS. Initial19/21 pass; two historical source-preservation assertions incorrectly included all later authorized work. Corrected to immutable reviewed snapshots; exact equality/path sets retained. |
| npm audit retry root/full and omit=dev | Both exit1 with27 affected package entries:20high/7moderate/0critical |
| npm audit retry web/full and omit=dev | Full exit1 with5high development-chain entries; production exit0, zero findings |

Total final automated cases1801, zero skips. Initial negative run reproduced
image hangs, decoder failure and accepted malformed nested signature; logs
preserved. First attempted decoder mitigation retained a large dynamic RegExp
and failed the long malformed case; corrected by a linear run replacement,
not a smaller payload or weaker assertion. First brace fixture exceeded the
old10000-character cap; corrected to8003 characters. The unmodified baseline
then reproduces Maximum call stack size exceeded while the guarded input fails
promptly with the explicit nesting limit. An additional shell-quoting diagnostic
failed before executing; corrected diagnostic script/log preserved separately.

First native exports failed only when the sandbox denied Hermes' temporary .hbc
write. Retried with task-local TEMP/TMP and approved compiler execution: Android
and iOS both PASS. First four npm audits timed out; retries succeeded and the
failure logs remain. No timeout renamed a zero-finding audit. Alerts count package
entries, not27 independent vulnerabilities or proven device exploits; local
backports intentionally do not change registry audit ranges/severities.

Synthetic logs/build outputs are in the owner's separate workspace
`tmp/deep-focus-sdk56-security-logs`, not committed: full-tests-final.log,
sql-integration.log, security-regression-final.log, mobile-lint-final.log,
web-build.log, *-export-final.log, *-audit-retry.json and checker logs retain the
exact commands/results. No credentials, live identities or customer data used.

## Review / integration gates

Author self-review completed for the full13-file scope: exact package/lock identity,
patch target/version/hashes, positive and malformed inputs, caller compatibility,
install drift/idempotence, historical Git oracles and scope/privacy boundaries.
Independent review is WAIVED_BY_OWNER_FOR_THIS_DEVELOPMENT_MERGE_ONLY, not
performed or reused from an older PR; no extra agent. Native signed/device,
hosted-provider, production security acceptance and release gates remain NOT_RUN.

Production residual-risk acceptance is NOT_GRANTED. npm alerts stay OPEN pending
compatible upstream fixes and qualified release review; UUID assessment is only
the inspected v4 callers. Recommended re-triage before RC or any dependency/caller
change, with a proposed follow-up review by2026-11-05, not an approved automation
or a guarantee of safe production use. SDK56-preserving upstream replacements
must pass the same regressions/builds before removing individual local guards.

Acceptance A1–A5 PASS for the bounded local development artifact under the explicit
review waiver. Actual default npm-ci lifecycle execution is not separately
claimed: fresh installs deliberately disabled hooks, then explicit npm postinstall
and idempotence/security checks verified the registered hook. Signed/device and
production acceptance remain outside that result. Source/config diff and manifest
resolutions reviewed; no unresolved scoped functional regression found.

Development integration remains pending PR merge confirmation. Product release
status NOT_READY. Next foundation task:
actual Android core recovery/account-isolation acceptance on a real device.
