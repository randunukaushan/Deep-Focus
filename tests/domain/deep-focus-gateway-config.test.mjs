import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const { gatewayIssuer, readDeepFocusGatewayConfig } = await import('../../supabase/functions/deep-focus-gateway/config.ts');
const denoConfig = JSON.parse(await readFile(new URL('../../supabase/functions/deep-focus-gateway/deno.json', import.meta.url), 'utf8'));
const gatewaySource = await readFile(new URL('../../supabase/functions/deep-focus-gateway/index.ts', import.meta.url), 'utf8');

function environment(values = {}) {
  return { get: (name) => values[name] };
}

function validValues(overrides = {}) {
  return {
    SUPABASE_DB_URL: 'postgresql://postgres:secret@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres',
    SUPABASE_URL: 'https://wffyrevlhnqiycoybqia.supabase.co',
    SUPABASE_ANON_KEY: 'sb_publishable_not_a_real_key',
    DEEP_FOCUS_SYNC_CURSOR_SECRET: 'c'.repeat(64),
    DEEP_FOCUS_LIST_CURSOR_SECRET: 'l'.repeat(64),
    DEEP_FOCUS_SNAPSHOT_CURSOR_SECRET: 's'.repeat(64),
    DEEP_FOCUS_GATEWAY_RATE_LIMIT_WINDOW_MS: '60000',
    DEEP_FOCUS_GATEWAY_RATE_LIMIT: '120',
    DEEP_FOCUS_SYNC_CURSOR_TTL_MS: '900000',
    ...overrides,
  };
}

test('gateway config accepts only complete server-side runtime values', () => {
  const config = readDeepFocusGatewayConfig(environment(validValues()));
  assert.equal(config.rateLimitLimit, 120);
  assert.equal(config.listCursorSecret, 'l'.repeat(64));
  assert.equal(config.snapshotCursorSecret, 's'.repeat(64));
  assert.equal(gatewayIssuer(config), 'https://wffyrevlhnqiycoybqia.supabase.co/auth/v1');
});

test('Edge dependency configuration keeps the gateway imports pinned and function-local', () => {
  assert.deepEqual(denoConfig.imports, {
    '@db/postgres': 'jsr:@db/postgres@0.19.5',
    '@supabase/supabase-js': 'npm:@supabase/supabase-js@2.117.2',
  });
  assert.match(gatewaySource, /from '@db\/postgres';/);
  assert.match(gatewaySource, /from '@supabase\/supabase-js';/);
  assert.match(gatewaySource, /createPostgresGatewayHandlers/);
  assert.match(gatewaySource, /handlers: gatewayHandlers/);
  assert.doesNotMatch(gatewaySource, /(?:jsr:|npm:)@[^'"\s]+(?:latest|\^|~)/);
});

test('long-lived Edge handlers resolve bootstrap and sync clocks inside each request path', () => {
  assert.match(gatewaySource, /bootstrap:\s*\(\{ accessToken, displayName \}\)\s*=>\s*\{[\s\S]{0,300}?const now = new Date\(\)/);
  assert.match(gatewaySource, /now:\s*\(\)\s*=>\s*new Date\(\)\.toISOString\(\)/);
  assert.match(gatewaySource, /syncCursorTtlMs:\s*config\.cursorTtlMs/);
  assert.match(gatewaySource, /cursorTtlMs:\s*config\.cursorTtlMs/);
  assert.doesNotMatch(gatewaySource, /now:\s*new Date\(\)\.toISOString\(\)/);
});

test('gateway config prefers the hosted default publishable-key map over legacy configuration', () => {
  const config = readDeepFocusGatewayConfig(environment(validValues({
    SUPABASE_PUBLISHABLE_KEYS: JSON.stringify({ default: 'sb_publishable_current_key' }),
  })));
  assert.equal(config.supabasePublishableKey, 'sb_publishable_current_key');
});

for (const [name, override] of [
  ['missing cursor secret', { DEEP_FOCUS_SYNC_CURSOR_SECRET: undefined }],
  ['short cursor secret', { DEEP_FOCUS_SYNC_CURSOR_SECRET: 'short' }],
  ['missing list cursor secret', { DEEP_FOCUS_LIST_CURSOR_SECRET: undefined }],
  ['short list cursor secret', { DEEP_FOCUS_LIST_CURSOR_SECRET: 'short' }],
  ['missing snapshot cursor secret', { DEEP_FOCUS_SNAPSHOT_CURSOR_SECRET: undefined }],
  ['short snapshot cursor secret', { DEEP_FOCUS_SNAPSHOT_CURSOR_SECRET: 'short' }],
  ['public database URL', { SUPABASE_DB_URL: 'https://wffyrevlhnqiycoybqia.supabase.co' }],
  ['non-https Supabase URL', { SUPABASE_URL: 'http://wffyrevlhnqiycoybqia.supabase.co' }],
  ['unsafe rate window', { DEEP_FOCUS_GATEWAY_RATE_LIMIT_WINDOW_MS: '0' }],
  ['unsafe cursor ttl', { DEEP_FOCUS_SYNC_CURSOR_TTL_MS: '90000000' }],
  ['malformed hosted publishable-key map', { SUPABASE_PUBLISHABLE_KEYS: '{not-json}' }],
  ['hosted publishable-key map without default key', { SUPABASE_PUBLISHABLE_KEYS: JSON.stringify({ alternate: 'sb_publishable_other' }) }],
]) {
  test(`gateway config rejects ${name}`, () => {
    assert.throws(() => readDeepFocusGatewayConfig(environment(validValues(override))), /GATEWAY_CONFIGURATION_INVALID/);
  });
}
