import assert from 'node:assert/strict';
import test from 'node:test';

import { authRedirectCode, createAuthService, exchangeAuthCodeOnce } from '../../src/features/auth/auth-service.ts';

function makeClient(overrides = {}) {
  const calls = [];
  const defaults = {
    signInWithPassword: async () => ({ data: { session: { user: { id: 'user-1' } } }, error: null }),
    signUp: async () => ({ data: { session: null }, error: null }),
    resend: async () => ({ error: null }),
    resetPasswordForEmail: async () => ({ error: null }),
    updateUser: async () => ({ error: null }),
    signInWithOAuth: async () => ({ data: { url: 'https://provider.example/auth' }, error: null }),
    exchangeCodeForSession: async () => ({ data: { session: { user: { id: 'user-1' } } }, error: null }),
    signInWithIdToken: async () => ({ data: { session: { user: { id: 'user-1' } } }, error: null }),
    signOut: async () => ({ error: null }),
  };
  const auth = Object.fromEntries(Object.entries({ ...defaults, ...overrides }).map(([name, operation]) => [name, async (...args) => {
    calls.push({ name, args });
    return operation(...args);
  }]));
  return { client: { auth }, calls };
}

const redirectUrl = 'deepfocus://auth/callback';

test('email sign-in validates input and only reports success with a session', async () => {
  const { client, calls } = makeClient();
  const service = createAuthService({ client, redirectUrl, openAuthSession: async () => ({ type: 'cancel' }) });
  assert.equal((await service.signInWithPassword(' user@example.com ', 'secret')).status, 'signed_in');
  assert.deepEqual(calls[0].args[0], { email: 'user@example.com', password: 'secret' });

  const noSession = makeClient({ signInWithPassword: async () => ({ data: { session: null }, error: null }) });
  assert.equal((await createAuthService({ client: noSession.client, redirectUrl, openAuthSession: async () => ({ type: 'cancel' }) }).signInWithPassword('user@example.com', 'secret')).status, 'error');
  assert.equal(noSession.calls.length, 1);
});

test('email registration distinguishes verification and immediate authenticated sessions', async () => {
  const awaiting = makeClient();
  const service = createAuthService({ client: awaiting.client, redirectUrl, openAuthSession: async () => ({ type: 'cancel' }) });
  assert.deepEqual(await service.signUpWithPassword('user@example.com', 'pass'), { status: 'verification_required' });
  assert.equal(awaiting.calls[0].args[0].options.emailRedirectTo, redirectUrl);
  const immediate = makeClient({ signUp: async () => ({ data: { session: { user: { id: 'user-1' } } }, error: null }) });
  assert.deepEqual(await createAuthService({ client: immediate.client, redirectUrl, openAuthSession: async () => ({ type: 'cancel' }) }).signUpWithPassword('user@example.com', 'pass'), { status: 'signed_in' });
});

test('provider errors and SecureStore write failures become safe user-facing errors', async () => {
  const failing = makeClient({ signInWithPassword: async () => { throw Object.assign(new Error('sensitive detail'), { code: 'secure_storage_write_failed' }); } });
  const service = createAuthService({ client: failing.client, redirectUrl, openAuthSession: async () => ({ type: 'cancel' }) });
  const result = await service.signInWithPassword('user@example.com', 'pass');
  assert.equal(result.status, 'error');
  assert.match(result.message, /Secure sign-in could not be saved/);
  assert.doesNotMatch(result.message, /sensitive detail/);
});

test('Google OAuth uses PKCE redirect and rejects cancellation or missing exchange session', async () => {
  const canceled = makeClient();
  assert.deepEqual(await createAuthService({ client: canceled.client, redirectUrl, openAuthSession: async () => ({ type: 'cancel' }) }).signInWithGoogle(), { status: 'cancelled' });
  assert.equal(canceled.calls[0].args[0].options.redirectTo, redirectUrl);

  const missingSession = makeClient({ exchangeCodeForSession: async () => ({ data: { session: null }, error: null }) });
  const result = await createAuthService({ client: missingSession.client, redirectUrl, openAuthSession: async () => ({ type: 'success', url: `${redirectUrl}?code=pkce-code` }) }).signInWithGoogle();
  assert.equal(result.status, 'error');
  assert.equal(missingSession.calls.filter((call) => call.name === 'exchangeCodeForSession').length, 1);
});

test('Apple exchanges a hashed nonce credential with the original raw nonce', async () => {
  const { client, calls } = makeClient();
  const service = createAuthService({
    client,
    redirectUrl,
    openAuthSession: async () => ({ type: 'cancel' }),
    apple: { AppleAuthenticationScope: { EMAIL: 1, FULL_NAME: 2 }, signInAsync: async ({ nonce }) => { assert.equal(nonce, 'sha256-hash'); return { identityToken: 'identity-token' }; } },
    crypto: { randomUUID: () => 'raw-nonce', digestStringAsync: async (_algorithm, nonce) => { assert.equal(nonce, 'raw-nonce'); return 'sha256-hash'; }, CryptoDigestAlgorithm: { SHA256: 'SHA-256' } },
  });
  assert.deepEqual(await service.signInWithApple(), { status: 'signed_in' });
  assert.deepEqual(calls[0].args[0], { provider: 'apple', token: 'identity-token', nonce: 'raw-nonce' });
});

test('password recovery responses do not disclose account existence and redirect parsing is strict', async () => {
  const { client, calls } = makeClient();
  const service = createAuthService({ client, redirectUrl, openAuthSession: async () => ({ type: 'cancel' }) });
  assert.deepEqual(await service.requestPasswordReset('user@example.com'), { status: 'sent' });
  assert.equal(calls[0].args[1].redirectTo, redirectUrl);
  assert.deepEqual(authRedirectCode(`${redirectUrl}?code=abc&type=recovery`, redirectUrl), { code: 'abc', error: false, recovery: true });
  assert.equal(authRedirectCode('https://attacker.example/auth/callback?code=abc', redirectUrl), null);
  assert.equal(authRedirectCode('deepfocus://auth/other?code=abc', redirectUrl), null);
});

test('a callback code delivered by browser and deep-link listeners is exchanged once', async () => {
  const calls = [];
  let release;
  const client = { auth: { exchangeCodeForSession: (code) => { calls.push(code); return new Promise((resolve) => { release = resolve; }); } } };
  const browserDelivery = exchangeAuthCodeOnce(client, 'single-use-code', 100);
  const deepLinkDelivery = exchangeAuthCodeOnce(client, 'single-use-code', 100);
  assert.strictEqual(deepLinkDelivery, browserDelivery);
  assert.deepEqual(calls, ['single-use-code']);
  release({ data: { session: { user: { id: 'user-1' } } }, error: null });
  assert.deepEqual(await browserDelivery, { data: { session: { user: { id: 'user-1' } } }, error: null });
});
