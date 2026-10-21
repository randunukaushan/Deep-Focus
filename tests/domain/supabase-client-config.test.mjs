import assert from 'node:assert/strict';
import test from 'node:test';

const { isValidSupabaseProjectUrl } = await import('../../src/features/auth/supabase-config.ts');

test('Supabase project URL accepts only an HTTPS host without embedded credentials or query data', () => {
  assert.equal(isValidSupabaseProjectUrl('https://example.supabase.co'), true);
  for (const value of [
    'http://example.supabase.co',
    'https://user:password@example.supabase.co',
    'https://example.supabase.co?key=secret',
    'https://example.supabase.co/#fragment',
    'not-a-url',
    null,
  ]) assert.equal(isValidSupabaseProjectUrl(value), false);
});
