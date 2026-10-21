import assert from 'node:assert/strict';
import { readFile } from 'node:fs/promises';
import test from 'node:test';

const SCRIPT = new URL('../../scripts/verify-supabase-deployment-prereqs.mjs', import.meta.url);

test('deployment preflight stays fail-closed while ADR-011 production policy is unresolved', async () => {
  const source = await readFile(SCRIPT, 'utf8');
  assert.match(source, /record\('policy:ADR-011', false/);
  assert.match(source, /retention, hosting region, RPO and RTO require owner decision/);
});

test('deployment preflight includes classroom contract checks without claiming runtime evidence', async () => {
  const source = await readFile(SCRIPT, 'utf8');
  assert.match(source, /command\('classroom-contract-boundaries'/);
  assert.match(source, /check-classroom-contracts\.mjs/);
  assert.match(source, /check-classroom-bridge\.mjs/);
  assert.match(source, /check-classroom-helpers\.mjs/);
  assert.match(source, /check-classroom-key-policy\.mjs/);
});

test('deployment preflight includes local recovery and backup boundaries', async () => {
  const source = await readFile(SCRIPT, 'utf8');
  assert.match(source, /command\('local-recovery-boundaries'/);
  assert.match(source, /backup-restore\.test\.mjs/);
  assert.match(source, /postgres-backup-restore-adapter\.test\.mjs/);
  assert.match(source, /local-database-ownership\.test\.mjs/);
  assert.match(source, /sync-pull-apply\.test\.mjs/);
  assert.match(source, /sync-service\.test\.mjs/);
});
