import { access, stat } from 'node:fs/promises';
import { resolve } from 'node:path';
import { spawnSync } from 'node:child_process';

const root = process.cwd();
const runtimeMode = process.argv.includes('--runtime');
const checks = [];

function record(name, passed, detail) {
  checks.push({ name, passed, detail });
}

async function exists(relativePath) {
  try {
    await access(resolve(root, relativePath));
    return true;
  } catch {
    return false;
  }
}

function command(name, executable, args) {
  const result = spawnSync(executable, args, {
    cwd: root,
    encoding: 'utf8',
    shell: false,
  });
  record(name, result.status === 0, result.status === 0
    ? 'passed'
    : `exit ${result.status ?? 'unavailable'}`);
}

for (const relativePath of [
  'supabase/functions/deep-focus-gateway/index.ts',
  'supabase/functions/deep-focus-gateway/deno.json',
  'supabase/functions/.env.example',
  'supabase/migrations',
]) {
  record(`artifact:${relativePath}`, await exists(relativePath), 'required local deployment artifact');
}

// ADR-011 is intentionally unresolved. Keep this preflight fail-closed until
// the owner records retention, hosting region and recovery objectives; never
// turn an absent production policy into an implicit deployment approval.
record('policy:ADR-011', false, 'retention, hosting region, RPO and RTO require owner decision');

command('migration-manifest', process.execPath, [
  '--test',
  'tests/domain/migration-manifest.test.mjs',
  'tests/domain/migration-safety-contract.test.mjs',
  'tests/domain/all-private-migrations-security.test.mjs',
]);
command('backend-contracts', process.execPath, ['docs/revision/check-backend-contracts.mjs']);
command('classroom-contract-boundaries', process.execPath, [
  'docs/revision/check-classroom-contracts.mjs',
  'docs/revision/check-classroom-bridge.mjs',
  'docs/revision/check-classroom-helpers.mjs',
  'docs/revision/check-classroom-key-policy.mjs',
]);
command('local-recovery-boundaries', process.execPath, [
  '--test',
  'tests/domain/backup-restore.test.mjs',
  'tests/domain/postgres-backup-restore-adapter.test.mjs',
  'tests/domain/local-database-ownership.test.mjs',
  'tests/domain/sync-pull-apply.test.mjs',
  'tests/domain/sync-service.test.mjs',
]);
command('gateway-owner-authorization', process.execPath, [
  '--test',
  'tests/domain/gateway-authorization.test.mjs',
  'tests/domain/postgres-gateway-authorization-adapter.test.mjs',
]);
command('gateway-session-boundaries', process.execPath, [
  '--test',
  'tests/domain/supabase-provider-session-verifier.test.mjs',
  'tests/domain/request-session.test.mjs',
  'tests/domain/auth-session-issuance.test.mjs',
]);
command('gateway-rate-limit-boundaries', process.execPath, [
  '--test',
  'tests/domain/gateway-rate-limit.test.mjs',
  'tests/domain/postgres-rate-limit-adapter.test.mjs',
]);
command('gateway-request-composition', process.execPath, [
  '--test',
  'tests/domain/gateway-admission.test.mjs',
  'tests/domain/gateway-entrypoint.test.mjs',
  'tests/domain/gateway-router.test.mjs',
]);
command('edge-env-template', process.execPath, ['--test', 'tests/domain/edge-env-template.test.mjs']);
command('edge-server-config-boundaries', process.execPath, [
  '--test',
  'tests/domain/deep-focus-gateway-config.test.mjs',
  'tests/domain/deployable-secret-boundary.test.mjs',
]);
command('typecheck', process.execPath, ['node_modules/typescript/bin/tsc', '--noEmit']);

const denoExecutable = process.env.DEEP_FOCUS_DENO_PATH?.trim() || 'deno';
const deno = spawnSync(denoExecutable, ['--version'], { cwd: root, encoding: 'utf8', shell: false });
record('runtime:deno', deno.status === 0, deno.status === 0 ? 'available' : 'not available locally');
if (deno.status === 0) {
  command('edge-deno-check', denoExecutable, [
    'check',
    '--config',
    'supabase/functions/deep-focus-gateway/deno.json',
    'supabase/functions/deep-focus-gateway/index.ts',
  ]);
}

const supabaseCli = process.env.DEEP_FOCUS_SUPABASE_CLI_PATH?.trim();
let supabaseCliAvailable = false;
if (supabaseCli) {
  try {
    supabaseCliAvailable = (await stat(supabaseCli)).isFile();
  } catch {
    supabaseCliAvailable = false;
  }
}
record('runtime:supabase-cli', supabaseCliAvailable, supabaseCliAvailable
  ? 'configured local executable found'
  : 'set DEEP_FOCUS_SUPABASE_CLI_PATH to a local CLI executable');
const docker = spawnSync('docker', ['--version'], { cwd: root, encoding: 'utf8', shell: false });
record('runtime:docker', docker.status === 0, docker.status === 0
  ? 'available'
  : 'not available locally for Supabase Edge Runtime serving');

const pgliteModule = process.env.DEEP_FOCUS_PGLITE_MODULE;
let pgliteAvailable = false;
if (pgliteModule) {
  try {
    pgliteAvailable = (await stat(pgliteModule)).isFile();
  } catch {
    pgliteAvailable = false;
  }
}
record('runtime:pglite', pgliteAvailable, pgliteAvailable
  ? 'configured external module found'
  : 'DEEP_FOCUS_PGLITE_MODULE is absent or does not point to a file');
if (pgliteAvailable) {
  command('migration-integration', process.execPath, [
    '--test',
    'tests/integration/migration-review-sql.test.mjs',
  ]);
}

if (runtimeMode) {
  try {
    const { DEEP_FOCUS_HOSTED_GATEWAY_ENV_NAMES, readDeepFocusGatewayConfig } = await import(new URL('../supabase/functions/deep-focus-gateway/config.ts', import.meta.url));
    for (const name of DEEP_FOCUS_HOSTED_GATEWAY_ENV_NAMES) {
      record(`runtime-env:${name}`, Boolean(process.env[name]?.trim()), 'presence only; value is never printed');
    }
    readDeepFocusGatewayConfig({ get: (name) => process.env[name] });
    record('runtime:gateway-config', true, 'server configuration accepted without exposing values');
  } catch {
    record('runtime:gateway-config', false, 'server configuration contract rejected or unavailable; values are not printed');
  }
}

const passed = checks.every((check) => check.passed);
process.stdout.write(`${JSON.stringify({
  status: passed ? 'READY_FOR_EXTERNAL_GATES' : 'LOCAL_PREREQUISITES_INCOMPLETE',
  remoteActionsPerformed: false,
  runtimeMode,
  checks,
}, null, 2)}\n`);
process.exitCode = passed ? 0 : 1;
