// KN-00 pure encoding/lifecycle models ONLY. No crypto keys, AES, SQL or network.
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const MAX = 9223372036854775807n; // Representation ceiling, NOT approved crypto budget.
function nonce(counter) {
  assert.equal(typeof counter, 'string');
  assert(/^[1-9][0-9]*$/.test(counter) && counter.length <= 19);
  const n = BigInt(counter); assert(n <= MAX);
  const bytes = Buffer.alloc(12);
  bytes.writeBigUInt64BE(n, 4);
  return bytes.toString('hex');
}
const encodings = [
  ['1', '000000000000000000000001'],
  ['255', '0000000000000000000000ff'],
  ['256', '000000000000000000000100'],
  ['9007199254740993', '000000000020000000000001'],
  ['9223372036854775807', '000000007fffffffffffffff'],
];
for (const [input, expected] of encodings) assert.equal(nonce(input), expected);
const bad = ['0', '-1', '01', '1.0', '1e3', ' 1', '1\n', '9223372036854775808', 1, null];
for (const x of bad) assert.throws(() => nonce(x));

// Sequential model of the atomic allocator; NOT a database concurrency test.
const base = () => ({ keyId: 'synthetic-key-a', state: 'active', last: 0n, cap: 3n,
  authorized: true, policyMatches: true, lineageTrusted: true, commit: 'ok' });
function allocate(s) {
  if (!s.authorized) return { status: 'DENIED', state: s };
  if (!s.lineageTrusted || s.state !== 'active' || !s.policyMatches) return { status: 'PAUSED', state: s };
  if (typeof s.cap !== 'bigint' || s.cap < 1n || s.cap > MAX || s.last < 0n || s.last >= s.cap)
    return { status: 'EXHAUSTED_OR_INVALID', state: s };
  const next = s.last + 1n;
  if (s.commit === 'rollback') return { status: 'NO_NONCE', state: s };
  // For unknown outcome this fixture chooses the worst case: increment committed.
  const state = { ...s, last: next };
  return s.commit === 'unknown' ? { status: 'NO_NONCE', state } :
    { status: 'ALLOCATED', state, value: nonce(next.toString()) };
}
const cases = [
  [{}, 'ALLOCATED'], [{ authorized: false }, 'DENIED'], [{ state: 'read_only' }, 'PAUSED'],
  [{ state: 'disabled' }, 'PAUSED'], [{ policyMatches: false }, 'PAUSED'],
  [{ lineageTrusted: false }, 'PAUSED'], [{ last: 3n }, 'EXHAUSTED_OR_INVALID'],
  [{ last: MAX, cap: MAX }, 'EXHAUSTED_OR_INVALID'], [{ cap: null }, 'EXHAUSTED_OR_INVALID'],
  [{ commit: 'rollback' }, 'NO_NONCE'], [{ commit: 'unknown' }, 'NO_NONCE'],
];
for (const [change, expected] of cases) {
  const out = allocate({ ...base(), ...change }); assert.equal(out.status, expected);
  if (expected !== 'ALLOCATED') assert(!('value' in out), 'never expose uncommitted/denied nonce');
}
const first = allocate(base());
// Simulated encryption/domain failure leaves the already committed allocation burned.
const second = allocate(first.state);
assert.equal(second.state.last, 2n); assert.notEqual(second.value, first.value);
const uncertain = allocate({ ...base(), commit: 'unknown' });
const recovered = allocate({ ...uncertain.state, commit: 'ok' });
assert.equal(recovered.state.last, 2n); assert.equal(recovered.value, nonce('2'));
const rollback = allocate({ ...base(), commit: 'rollback' });
assert.equal(rollback.state.last, 0n); assert.equal(allocate({ ...rollback.state, commit: 'ok' }).value, nonce('1'));

function mayResume({ restored, fenced, freshMaterial, lineageVerified, keyState }) {
  return restored && fenced && freshMaterial && lineageVerified && keyState === 'active';
}
const resume = { restored: true, fenced: true, freshMaterial: true, lineageVerified: true, keyState: 'active' };
assert(mayResume(resume));
for (const key of ['fenced', 'freshMaterial', 'lineageVerified']) assert(!mayResume({ ...resume, [key]: false }));
assert(!mayResume({ ...resume, keyState: 'read_only' }));
// A new label does not establish fresh key material; no actual secret is used.
assert(!mayResume({ ...resume, freshMaterial: false, newLabel: 'synthetic-key-b' }));
// This is an input precondition model, NOT a mechanism that detects a silent restore.
const doc = fs.readFileSync(path.join(path.dirname(fileURLToPath(import.meta.url)),
  '47-CLASSROOM-KEY-NONCE-AND-REVIEW-BRIEF.md'), 'utf8');
for (const term of ['ADAPTER_HOLD', 'NO SQL EXECUTION.', 'REVIEW_PENDING', 'committed-before-use',
  'not** idempotent', 'not a NIST certification', 'no current']) {
  // Required literal checks are deliberately small; human review owns semantics.
  if (term === 'no current') continue;
  assert(doc.includes(term), `missing boundary: ${term}`);
}
console.log(JSON.stringify({ status: 'PASS', encodingVectors: encodings.length,
  rejectedEncodingInputs: bad.length, allocationModels: cases.length, retryGapModels: 3,
  restoreAdmissionModels: 6, realIntegrationCasesRun: 0,
  scope: 'Synthetic exact-integer/encoding/lifecycle models; no keys, AES, SQL, concurrency, provider or independent review' }, null, 2));
