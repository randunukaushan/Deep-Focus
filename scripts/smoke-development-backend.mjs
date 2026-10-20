// Explicit opt-in smoke test for the single approved development project.
// Credentials stay in process memory; stdout contains checks and fixture IDs only.
import { spawnSync } from 'node:child_process';
import { randomBytes, randomUUID } from 'node:crypto';
import { createClient } from '@supabase/supabase-js';

const ref = 'wffyrevlhnqiycoybqia';
if (!process.argv.includes(`--project-ref=${ref}`)) throw new Error('EXPLICIT_DEVELOPMENT_TARGET_REQUIRED');
const cli = process.env.DEEP_FOCUS_SUPABASE_CLI_PATH;
if (!cli) throw new Error('SUPABASE_CLI_PATH_REQUIRED');
const keysResult = spawnSync(cli, ['projects', 'api-keys', '--project-ref', ref, '--output', 'json'], { encoding: 'utf8' });
if (keysResult.status !== 0) throw new Error('PROJECT_KEY_LOOKUP_FAILED');
const keys = JSON.parse(keysResult.stdout);
const key = keys.find((item) => item.name === 'service_role' && !item.disabled)?.api_key;
const publicKey = keys.find((item) => item.name === 'anon' && !item.disabled)?.api_key;
if (!key || !publicKey) throw new Error('DEVELOPMENT_TEST_KEYS_UNAVAILABLE');
const url = `https://${ref}.supabase.co`;
const admin = createClient(url, key, { auth: { persistSession: false, autoRefreshToken: false } });
const fixtures = [];
const checks = [];
const reuseIds = process.argv.filter((arg) => arg.startsWith('--reuse-fixture=')).map((arg) => arg.slice(16));

if (process.argv.includes('--retire-auth-fixtures')) {
  for (const id of process.argv.filter((arg) => arg.startsWith('--fixture=')).map((arg) => arg.slice(10))) {
    const existing = await admin.auth.admin.getUserById(id);
    if (existing.error || existing.data.user?.app_metadata?.deep_focus_smoke_fixture !== true) throw new Error('FIXTURE_IDENTITY_NOT_CONFIRMED');
    const retired = await admin.auth.admin.updateUserById(id, { ban_duration: '876000h' });
    if (retired.error) throw new Error('AUTH_FIXTURE_RETIRE_FAILED');
    console.log(JSON.stringify({ disabledAuthFixture: id }));
  }
  process.exit(0);
}

function check(name, passed, status) {
  checks.push({ name, passed, ...(status === undefined ? {} : { status }) });
  if (!passed) throw new Error(`CHECK_FAILED:${name}`);
}
async function request(path, token, method = 'GET', body, mutationId = randomUUID()) {
  const response = await fetch(`${url}/functions/v1/deep-focus-gateway${path}`, {
    method,
    headers: { ...(token ? { Authorization: `Bearer ${token}` } : {}), ...(body === undefined ? {} : { 'Content-Type': 'application/json' }), ...(method === 'GET' ? {} : { 'Idempotency-Key': mutationId }) },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
    signal: AbortSignal.timeout(25_000),
  });
  const json = await response.json();
  return { status: response.status, json };
}

try {
  const missing = await request('/v1/me');
  check('missing_auth_denied', missing.status === 401, missing.status);
  for (let index = 0; index < 2; index += 1) {
    const client = createClient(url, publicKey, { auth: { persistSession: false, autoRefreshToken: false } });
    let login;
    let user;
    if (reuseIds[index]) {
      const existing = await admin.auth.admin.getUserById(reuseIds[index]);
      if (existing.error || existing.data.user?.app_metadata?.deep_focus_smoke_fixture !== true) throw new Error('FIXTURE_IDENTITY_NOT_CONFIRMED');
      user = existing.data.user;
      const link = await admin.auth.admin.generateLink({ type: 'magiclink', email: user.email });
      if (link.error || !link.data.properties?.hashed_token) throw new Error('FIXTURE_SESSION_FAILED');
      login = await client.auth.verifyOtp({ type: 'magiclink', token_hash: link.data.properties.hashed_token });
    } else {
    const email = `deep-focus-smoke-${randomUUID()}@example.com`;
    const password = randomBytes(24).toString('base64url');
    const created = await admin.auth.admin.createUser({ email, password, email_confirm: true, app_metadata: { deep_focus_smoke_fixture: true } });
    if (created.error || !created.data.user) throw new Error('SYNTHETIC_USER_CREATE_FAILED');
    user = created.data.user;
    login = await client.auth.signInWithPassword({ email, password });
    }
    const fixture = { id: user.id, workspaceId: null, token: null };
    fixtures.push(fixture);
    check(`fixture_${index}_session`, !login.error && Boolean(login.data.session));
    fixture.token = login.data.session.access_token;
    const bootstrap = await request('/v1/account/bootstrap', fixture.token, 'POST', { displayName: `Development smoke ${index}` });
    check(`fixture_${index}_bootstrap`, bootstrap.status === 200 && bootstrap.json.data?.profile?.ownerId === fixture.id, bootstrap.status);
    fixture.workspaceId = bootstrap.json.data.workspace.workspaceId;
    const me = await request('/v1/me', fixture.token);
    check(`fixture_${index}_owned_profile`, me.status === 200 && me.json.data?.id === fixture.id, me.status);
  }
  const taskId = randomUUID();
  const mutationId = randomUUID();
  const body = { id: taskId, workspaceId: fixtures[0].workspaceId, title: 'Disposable development smoke task', due: { kind: 'none' } };
  const create = await request('/v1/tasks', fixtures[0].token, 'POST', body, mutationId);
  check('task_database_write', create.status === 201, create.status);
  const replay = await request('/v1/tasks', fixtures[0].token, 'POST', body, mutationId);
  check('task_idempotent_replay', replay.status === 201, replay.status);
  const own = await request(`/v1/tasks/${taskId}`, fixtures[0].token);
  check('own_task_read', own.status === 200, own.status);
  const foreign = await request(`/v1/tasks/${taskId}`, fixtures[1].token);
  check('foreign_task_denied', foreign.status === 404 || foreign.status === 403, foreign.status);
  const pull = await request('/v1/sync/pull?limit=50', fixtures[0].token);
  check('owned_sync_pull', pull.status === 200 && Array.isArray(pull.json.data?.changes), pull.status);
  const signout = await request('/v1/auth/sign-out', fixtures[0].token, 'POST', {});
  check('session_revoked', signout.status === 200 || signout.status === 204, signout.status);
  const revoked = await request('/v1/me', fixtures[0].token);
  check('revoked_session_denied', revoked.status === 401 || revoked.status === 403, revoked.status);
} catch (error) {
  console.log(JSON.stringify({ status: 'FAIL', failure: /^CHECK_FAILED:/.test(error.message) ? error.message : 'SMOKE_DEPENDENCY_FAILED', checks, fixtureIds: fixtures.map((fixture) => fixture.id) }));
  process.exitCode = 1;
} finally {
  console.log(JSON.stringify({ checks, fixtureIds: fixtures.map((fixture) => fixture.id), cleanupRequired: fixtures.length > 0 }));
}
