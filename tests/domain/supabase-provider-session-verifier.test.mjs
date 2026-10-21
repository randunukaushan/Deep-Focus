import assert from 'node:assert/strict';
import test from 'node:test';

const { createSupabaseProviderSessionVerifier } = await import('../../supabase/functions/_shared/supabase-provider-session-verifier.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const SESSION = '22222222-2222-4222-8222-222222222222';
const claims = { sub: OWNER, session_id: SESSION, exp: 1791590700, iss: 'https://project.supabase.co/auth/v1', aud: 'authenticated' };

test('Supabase verifier requests provider-verified claims and maps only gateway claims', async () => {
  const calls = [];
  const verify = createSupabaseProviderSessionVerifier({ auth: { getClaims: async (...args) => { calls.push(args); return { data: { claims }, error: null }; } } });
  assert.deepEqual(await verify('provider-token'), { sub: OWNER, sessionId: SESSION, exp: claims.exp, iss: claims.iss, aud: claims.aud });
  assert.deepEqual(calls, [['provider-token', { allowExpired: false }]]);
});

test('Supabase verifier fails closed on provider errors, missing claims and malformed identity', async () => {
  const error = createSupabaseProviderSessionVerifier({ auth: { getClaims: async () => ({ data: null, error: new Error('provider detail') }) } });
  await assert.rejects(() => error('token'), /PROVIDER_TOKEN_INVALID/);
  const missing = createSupabaseProviderSessionVerifier({ auth: { getClaims: async () => ({ data: { claims: {} }, error: null }) } });
  await assert.rejects(() => missing('token'), /PROVIDER_TOKEN_INVALID/);
  const malformed = createSupabaseProviderSessionVerifier({ auth: { getClaims: async () => ({ data: { claims: { ...claims, session_id: 'foreign' } }, error: null }) } });
  await assert.rejects(() => malformed('token'), /PROVIDER_TOKEN_INVALID/);
});

test('Supabase verifier rejects an explicitly anonymous provider claim', async () => {
  const verify = createSupabaseProviderSessionVerifier({
    auth: { getClaims: async () => ({ data: { claims: { ...claims, is_anonymous: true } }, error: null }) },
  });
  await assert.rejects(() => verify('token'), /PROVIDER_TOKEN_INVALID/);
});

test('Supabase verifier rejects malformed tokens before contacting Auth', async () => {
  let calls = 0;
  const verify = createSupabaseProviderSessionVerifier({ auth: { getClaims: async () => { calls += 1; return { data: { claims }, error: null }; } } });
  for (const token of ['', 'has whitespace', 'x'.repeat(8193)]) await assert.rejects(() => verify(token), /PROVIDER_TOKEN_INVALID/);
  assert.equal(calls, 0);
});

test('Supabase verifier maps runtime-confused provider responses to token failure', async () => {
  for (const response of [Symbol('result'), [], { data: [], error: null }, { data: { claims: Symbol('claims') }, error: null }]) {
    const verify = createSupabaseProviderSessionVerifier({ auth: { getClaims: async () => response } });
    await assert.rejects(() => verify('token'), /PROVIDER_TOKEN_INVALID/);
  }
});
