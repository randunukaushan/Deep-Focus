// Read-only synthetic design examples, NOT production code, auth, SQL or race tests.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import { fileURLToPath } from 'node:url';

const failures = [];
let cases = 0;
const test = (name, run) => {
  cases++;
  try { run(); } catch (error) { failures.push(`${name}: ${error.message}`); }
};
const fresh = () => ({
  owner: 'alice', active: true, epoch: 1, receipts: {},
  plan: { id: 'p1', version: 1, state: 'active', explanation: 'Synthetic context',
    dependencies: ['t1', 't2', 't3'], blocks: [
      { id: 'b1', kind: 'focus', taskId: 't1', reminderId: 'r1' },
      { id: 'b2', kind: 'break', afterBlockId: 'b1' },
      { id: 'b3', kind: 'focus', taskId: 't2', reminderId: null },
    ] },
  reminders: { r1: true, standalone: true }, actualSessions: 4, xp: 80,
});
function authorize(s, actor) {
  if (!s.active || s.owner !== actor) throw new Error('DENIED');
}
function detach(s) {
  for (const b of s.plan.blocks) {
    if (b.kind === 'focus' && b.reminderId !== null) {
      s.reminders[b.reminderId] = false; b.reminderId = null;
    }
  }
}
function tombstone(s) {
  s.plan = { id: s.plan.id, version: s.plan.version + 1, state: 'deleted' };
}
// Fixed tuple is a synthetic oracle, NOT production JCS/hash or storage policy.
// Never persist this plaintext intent representation in a real receipt table.
function mutate(s, actor, key, expected, action, text = null) {
  authorize(s, actor);
  const intent = JSON.stringify([s.plan.id, expected, action, text]);
  if (Object.hasOwn(s.receipts, key)) {
    if (s.receipts[key].intent !== intent) throw new Error('KEY_CONFLICT');
    return s.receipts[key].receipt;
  }
  if (s.plan.state === 'deleted') throw new Error('DELETED');
  if (s.plan.version !== expected) throw new Error('VERSION_CONFLICT');
  if (s.plan.version >= 2147483647) throw new Error('VERSION_OVERFLOW');
  if (action === 'edit') {
    if (s.plan.state !== 'active' || text === s.plan.explanation) throw new Error('INVALID_EDIT');
    s.plan.explanation = text; // Only explanation edits modeled; not schedule validation.
  } else if (action === 'archive') {
    if (s.plan.state !== 'active') throw new Error('NO_OP');
    detach(s); s.plan.state = 'archived';
  } else if (action === 'restore') {
    if (s.plan.state !== 'archived') throw new Error('NO_OP');
    s.plan.state = 'active';
  } else if (action === 'delete') {
    detach(s); s.epoch++; tombstone(s);
  } else throw new Error('UNKNOWN_ACTION');
  if (action !== 'delete') s.plan.version++;
  const receipt = { id: s.plan.id, version: s.plan.version };
  s.receipts[key] = { intent, receipt };
  return receipt;
}
function eraseTask(s, taskId) {
  // Assumes trusted caller/owner transaction; this helper tests only cascade shape.
  if (s.plan.state !== 'deleted') {
    const removed = new Set(s.plan.blocks.filter(b => b.kind === 'focus' && b.taskId === taskId).map(b => b.id));
    const affected = removed.size > 0 || s.plan.dependencies.includes(taskId);
    if (affected) {
      for (const b of s.plan.blocks) if (removed.has(b.id) && b.reminderId) s.reminders[b.reminderId] = false;
      s.plan.blocks = s.plan.blocks.filter(b => !removed.has(b.id) && !(b.kind === 'break' && removed.has(b.afterBlockId)));
      s.plan.explanation = null;
      s.plan.dependencies = s.plan.dependencies.filter(id => id !== taskId);
      if (!s.plan.blocks.some(b => b.kind === 'focus')) tombstone(s);
      else s.plan.version++;
    }
  }
  s.epoch++;
}
const canReadArtifact = (s, artifact, actor) =>
  s.active && actor === s.owner && artifact.owner === s.owner && artifact.epoch === s.epoch;
const project = (rows, protocol) => {
  if (![1, 2].includes(protocol)) throw new Error('UNSUPPORTED_PROTOCOL');
  return { rows: rows.filter(r => protocol === 2 || r.entity !== 'plan'),
    scannedThrough: rows.at(-1)?.sequence ?? '0' };
};

test('archive disables bound intent only; actual work unchanged', () => {
  const s = fresh(); mutate(s, 'alice', 'a', 1, 'archive');
  assert.equal(s.plan.state, 'archived'); assert.equal(s.plan.version, 2);
  assert.deepEqual(s.reminders, { r1: false, standalone: true });
  assert.equal(s.plan.blocks[0].reminderId, null);
  assert.equal(s.actualSessions, 4); assert.equal(s.xp, 80);
});
test('restore never re-enables reminders or changes blocks', () => {
  const s = fresh(); mutate(s, 'alice', 'a', 1, 'archive');
  const blocks = structuredClone(s.plan.blocks);
  mutate(s, 'alice', 'b', 2, 'restore');
  assert.deepEqual(s.plan.blocks, blocks); assert.equal(s.reminders.r1, false);
});
test('same-key delete replay precedes tombstone/version rejection', () => {
  const s = fresh(); const r = mutate(s, 'alice', 'd', 1, 'delete');
  assert.deepEqual(mutate(s, 'alice', 'd', 1, 'delete'), r);
  assert.deepEqual(s.plan, { id: 'p1', version: 2, state: 'deleted' });
  assert.equal(s.epoch, 2); assert.deepEqual(Object.keys(r).sort(), ['id', 'version']);
});
test('changed intent under existing key rejects', () => {
  const s = fresh(); mutate(s, 'alice', 'a', 1, 'archive');
  assert.throws(() => mutate(s, 'alice', 'a', 2, 'restore'), /KEY_CONFLICT/);
});
test('foreign owner cannot replay a valid receipt', () => {
  const s = fresh(); mutate(s, 'alice', 'a', 1, 'archive');
  assert.throws(() => mutate(s, 'bob', 'a', 1, 'archive'), /DENIED/);
});
test('frozen account cannot replay receipt', () => {
  const s = fresh(); mutate(s, 'alice', 'a', 1, 'archive'); s.active = false;
  assert.throws(() => mutate(s, 'alice', 'a', 1, 'archive'), /DENIED/);
});
test('stale new mutation leaves state unchanged', () => {
  const s = fresh(); mutate(s, 'alice', 'a', 1, 'edit', 'New synthetic text');
  const before = structuredClone(s);
  assert.throws(() => mutate(s, 'alice', 'b', 1, 'archive'), /VERSION_CONFLICT/);
  assert.deepEqual(s, before);
});
test('no-op edit and archived edit reject', () => {
  const s = fresh(); assert.throws(() => mutate(s, 'alice', 'a', 1, 'edit', s.plan.explanation), /INVALID_EDIT/);
  mutate(s, 'alice', 'b', 1, 'archive');
  assert.throws(() => mutate(s, 'alice', 'c', 2, 'edit', 'x'), /INVALID_EDIT/);
});
test('version overflow rejects without write', () => {
  const s = fresh(); s.plan.version = 2147483647;
  assert.throws(() => mutate(s, 'alice', 'a', s.plan.version, 'archive'), /VERSION_OVERFLOW/);
  assert.equal(s.plan.state, 'active');
});
test('deleted ID cannot be restored using a new key', () => {
  const s = fresh(); mutate(s, 'alice', 'd', 1, 'delete');
  assert.throws(() => mutate(s, 'alice', 'r', 2, 'restore'), /DELETED/);
});
test('task erasure removes its focus and associated break, not another block', () => {
  const s = fresh(); eraseTask(s, 't1');
  assert.deepEqual(s.plan.blocks.map(b => b.id), ['b3']);
  assert.equal(s.plan.explanation, null); assert.equal(s.plan.version, 2);
  assert.equal(s.reminders.r1, false); assert.equal(s.reminders.standalone, true);
});
test('context-only task erasure clears explanation', () => {
  const s = fresh(); const blocks = structuredClone(s.plan.blocks); eraseTask(s, 't3');
  assert.deepEqual(s.plan.blocks, blocks); assert.equal(s.plan.explanation, null);
  assert.ok(!s.plan.dependencies.includes('t3')); assert.equal(s.plan.version, 2);
});
test('archived plans also sanitize on task erasure', () => {
  const s = fresh(); mutate(s, 'alice', 'a', 1, 'archive'); eraseTask(s, 't1');
  assert.equal(s.plan.state, 'archived'); assert.equal(s.plan.version, 3);
  assert.deepEqual(s.plan.blocks.map(b => b.id), ['b3']);
});
test('last focus removal yields content-free tombstone', () => {
  const s = fresh(); eraseTask(s, 't1'); eraseTask(s, 't2');
  assert.deepEqual(s.plan, { id: 'p1', version: 3, state: 'deleted' });
});
test('unrelated task erasure does not rewrite plan', () => {
  const s = fresh(); const plan = structuredClone(s.plan); eraseTask(s, 'other');
  assert.deepEqual(s.plan, plan); assert.equal(s.epoch, 2);
});
test('old snapshot/export and late job result fail epoch check', () => {
  const s = fresh(); const artifact = { owner: 'alice', epoch: 1 };
  assert.equal(canReadArtifact(s, artifact, 'alice'), true); eraseTask(s, 't3');
  assert.equal(canReadArtifact(s, artifact, 'alice'), false);
  assert.equal(canReadArtifact(s, { owner: 'alice', epoch: 2 }, 'alice'), true);
});
test('artifact checks reject foreign owner and frozen account', () => {
  const s = fresh(); const a = { owner: 'alice', epoch: 1 };
  assert.equal(canReadArtifact(s, a, 'bob'), false);
  assert.equal(canReadArtifact(s, { owner: 'bob', epoch: 1 }, 'alice'), false);
  s.active = false; assert.equal(canReadArtifact(s, a, 'alice'), false);
});
test('legacy scan advances over trailing plan rows; v2 retains them', () => {
  const rows = [{ sequence: '9007199254740993', entity: 'task' }, { sequence: '9007199254740994', entity: 'plan' }];
  assert.deepEqual(project(rows, 1), { rows: [rows[0]], scannedThrough: rows[1].sequence });
  assert.deepEqual(project(rows, 2).rows, rows);
  assert.throws(() => project(rows, 3), /UNSUPPORTED_PROTOCOL/);
});
test('plan-only legacy page can be empty without losing scan position', () => {
  assert.deepEqual(project([{ sequence: '9', entity: 'plan' }], 1), { rows: [], scannedThrough: '9' });
});
test('draft task/runtime inventory and unchanged wire count are explicit', () => {
  const doc = fs.readFileSync(fileURLToPath(new URL('./25-SAVED-PLAN-LIFECYCLE-AND-PRIVACY.md', import.meta.url)), 'utf8');
  assert.equal([...doc.matchAll(/^\| PL-T\d{2} \|/gm)].length, 12);
  assert.equal([...doc.matchAll(/^\| PL-\d{2} \|/gm)].length, 5);
  assert.ok(doc.includes('52 operations')); assert.ok(doc.includes('REVIEW_PENDING'));
});
console.log(JSON.stringify({ status: failures.length ? 'FAIL' : 'PASS', cases,
  scope: 'Synthetic lifecycle examples only; no database, security, wire or device proof', failures }, null, 2));
process.exitCode = failures.length ? 1 : 0;
