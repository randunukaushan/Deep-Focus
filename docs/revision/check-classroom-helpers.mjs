// HC-00 reference vectors ONLY: no app imports, network, SQL or provider access.
// Not a production JSON parser, JCS package, authorization service or crypto adapter.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createHash, createHmac } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const packet = JSON.parse(fs.readFileSync(path.join(dir, 'contracts/classroom-helper-vectors.json'), 'utf8'));
function checkPacket(p) {
  assert.deepEqual(Object.keys(p).sort(), ['contractVersion', 'task', 'syntheticOnly', 'executionAuthorized',
    'independentReview', 'policyFixture', 'canonical', 'commandGolden', 'replay', 'cursor', 'delivery'].sort());
  assert.equal(p.contractVersion, 1); assert.equal(p.task, 'HC-00');
  assert.equal(p.syntheticOnly, true); assert.equal(p.executionAuthorized, false);
  assert.equal(p.independentReview, 'PENDING');
  assert.deepEqual(p.policyFixture, { cursorSeconds: 600, inviteSeconds: 900, commandSeconds: 86400 });
  for (const [name, prefix, count] of [['canonical', 'C', 19], ['replay', 'R', 10], ['cursor', 'P', 13], ['delivery', 'I', 9]]) {
    assert.equal(p[name].length, count);
    assert.deepEqual(p[name].map(v => v.id), Array.from({ length: count }, (_, i) => `HC-${prefix}${String(i + 1).padStart(2, '0')}`));
    for (const v of p[name]) {
      assert.deepEqual(Object.keys(v).sort(), ['id', name === 'canonical' ? 'raw' : 'change', 'expected'].sort());
      if (name === 'canonical') {
        assert.equal(typeof v.raw, 'string'); assert(v.expected === null || typeof v.expected === 'string');
      } else {
        assert(v.change && typeof v.change === 'object' && !Array.isArray(v.change));
        assert.equal(typeof v.expected, 'string');
        const allowed = {
          replay: ['authenticated', 'authorized', 'acceptScopeConflict', 'state', 'now', 'keyAvailable', 'sameDigest'],
          cursor: ['authenticated', 'authorized', 'recordPresent', 'now', 'actor', 'session', 'scope', 'operation', 'limit', 'selectors', 'filter', 'filterVersion', 'orderVersion'],
          delivery: ['authenticated', 'authorizedIssuer', 'commandActive', 'state', 'now', 'deliveryAvailable', 'tagValid'],
        };
        for (const key of Object.keys(v.change)) assert(allowed[name].includes(key), `unknown model input: ${key}`);
      }
    }
  }
  assert.deepEqual(Object.keys(p.commandGolden).sort(), ['keyHex', 'canonical', 'hmacSha256Hex'].sort());
  assert(/^[0-9a-f]{64}$/.test(p.commandGolden.keyHex));
  assert(/^[0-9a-f]{64}$/.test(p.commandGolden.hmacSha256Hex));
  assert.equal(typeof p.commandGolden.canonical, 'string');
}
checkPacket(packet);

// Small bounded parser retains duplicate-name evidence that JSON.parse discards.
function parseSynthetic(raw) {
  assert(Buffer.byteLength(raw, 'utf8') <= 32768);
  let i = 0;
  const ws = () => { while (i < raw.length && /[\x20\t\r\n]/.test(raw[i])) i++; };
  function string() {
    const re = /"(?:[^"\\\x00-\x1f]|\\(?:["\\/bfnrt]|u[0-9a-fA-F]{4}))*"/y;
    re.lastIndex = i; const m = re.exec(raw); assert(m, 'JSON string');
    i = re.lastIndex;
    const value = JSON.parse(m[0]); assert(value.isWellFormed(), 'Unicode scalar string');
    assert(!value.includes('\u0000'), 'PostgreSQL text/jsonb profile excludes decoded NUL');
    return value;
  }
  function value(depth = 0) {
    assert(depth <= 32, 'bounded fixture depth'); ws(); const c = raw[i];
    if (c === '"') return string();
    if (c === '{' || c === '[') {
      const object = c === '{', end = object ? '}' : ']'; i++; ws();
      const result = object ? Object.create(null) : [], seen = new Set();
      if (raw[i] === end) { i++; return result; }
      while (true) {
        ws(); let key;
        if (object) { key = string(); assert(!seen.has(key), 'duplicate decoded key'); seen.add(key); ws(); assert.equal(raw[i++], ':'); }
        const item = value(depth + 1);
        if (object) result[key] = item; else result.push(item);
        ws(); if (raw[i] === end) { i++; return result; } assert.equal(raw[i++], ',');
      }
    }
    for (const [word, item] of [['true', true], ['false', false], ['null', null]]) {
      if (raw.startsWith(word, i)) { i += word.length; return item; }
    }
    const re = /-?(?:0|[1-9]\d*)(?:\.\d+)?(?:[eE][+-]?\d+)?/y;
    re.lastIndex = i; const m = re.exec(raw); assert(m, 'JSON value'); i = re.lastIndex;
    const n = Number(m[0]); assert(Number.isSafeInteger(n), 'restricted integer profile'); return n;
  }
  const result = value(); ws(); assert.equal(i, raw.length, 'trailing input'); return result;
}
function canonical(v) {
  if (v === null || typeof v === 'boolean') return JSON.stringify(v);
  if (typeof v === 'number') { assert(Number.isSafeInteger(v)); return JSON.stringify(v); }
  if (typeof v === 'string') { assert(v.isWellFormed()); assert(!v.includes('\u0000')); return JSON.stringify(v); }
  if (Array.isArray(v)) return `[${v.map(canonical).join(',')}]`;
  assert(v && typeof v === 'object');
  return `{${Object.keys(v).sort().map(k => `${canonical(k)}:${canonical(v[k])}`).join(',')}}`;
}
for (const v of packet.canonical) {
  const run = () => canonical(parseSynthetic(v.raw));
  if (v.expected === null) assert.throws(run, v.id); else assert.equal(run(), v.expected, v.id);
}
assert.notEqual(canonical({ a: 'é' }), canonical({ a: 'e\u0301' }), 'no Unicode normalization');
assert.notEqual(canonical([1, 2]), canonical([2, 1]), 'array ordering preserved');
const digest = input => createHmac('sha256', Buffer.from(packet.commandGolden.keyHex, 'hex'))
  .update('deep-focus/classroom-command/v1\0', 'utf8').update(canonical(input), 'utf8').digest('hex');
const golden = parseSynthetic(packet.commandGolden.canonical);
assert.equal(canonical(golden), packet.commandGolden.canonical, 'literal canonical oracle');
assert.equal(digest(golden), packet.commandGolden.hmacSha256Hex, '.NET command golden');
assert.equal(createHmac('sha256', Buffer.alloc(20, 0x0b)).update('Hi There').digest('hex'),
  'b0344c61d8db38535ca8afceaf0bf12b881dc200c9833da726e9376c2e32cff7', 'RFC 4231 case 1');
const digestMutations = [x => { x.actorId = 'B'; }, x => { x.operation = 'CW-04'; },
  x => { x.scope.id = 'C2'; }, x => { x.selectors.classId = 'C2'; },
  x => { x.command.commandId = 'K2'; }, x => { x.command.expectedVersion = 1; },
  x => { x.command.payload.label = 'Study '; }];
// These mutate digest semantics only; invalid DTOs would be rejected before hashing in runtime.
for (const mutate of digestMutations) { const x = structuredClone(golden); mutate(x); assert.notEqual(digest(x), digest(golden)); }
assert.equal(digest(parseSynthetic(JSON.stringify(golden, null, 2))), digest(golden));

function decodeToken(token) {
  assert(/^[A-Za-z0-9_-]{43}$/.test(token)); const bytes = Buffer.from(token, 'base64url');
  assert.equal(bytes.length, 32); assert.equal(bytes.toString('base64url'), token); return bytes;
}
const syntheticToken = Buffer.alloc(32).toString('base64url');
assert.equal(syntheticToken.length, 43); assert.equal(decodeToken(syntheticToken).length, 32);
const invalidTokens = [syntheticToken.slice(0, 42), `${syntheticToken}=`, `${syntheticToken} `,
  `${'A'.repeat(42)}B`, '123456', '+'.repeat(43)];
for (const t of invalidTokens) assert.throws(() => decodeToken(t));
const lookup = purpose => createHash('sha256').update(`deep-focus/classroom-${purpose}/v1\0`)
  .update(decodeToken(syntheticToken)).digest('hex');
assert.notEqual(lookup('cursor'), lookup('invite'), 'domain-separated token lookup');

function replay(s) {
  if (!s.authenticated) return 'AUTH_REQUIRED'; if (!s.authorized) return 'NOT_FOUND';
  if (s.acceptScopeConflict) return 'COMMAND_CONFLICT';
  if (s.state === 'absent') return 'FRESH_CHECKS_REQUIRED';
  if (s.state === 'closed' || s.now >= s.expiresAt) return 'COMMAND_EXPIRED';
  if (!s.keyAvailable) return 'DEPENDENCY_UNAVAILABLE';
  return s.sameDigest ? 'REPLAY_CURRENT' : 'COMMAND_CONFLICT';
}
const replayBase = { authenticated: true, authorized: true, acceptScopeConflict: false,
  state: 'active', now: 1000, expiresAt: 1000 + packet.policyFixture.commandSeconds, keyAvailable: true, sameDigest: true };
for (const v of packet.replay) assert.equal(replay({ ...replayBase, ...v.change }), v.expected, v.id);
const binding = { actor: 'A', session: 'S1', scope: 'C1', operation: 'CW-18', limit: 20,
  selectors: { classId: 'C1', assignmentId: 'X1' }, filter: {}, filterVersion: 1, orderVersion: 1 };
function cursor(s) {
  if (!s.authenticated) return 'AUTH_REQUIRED'; if (!s.authorized) return 'NOT_FOUND';
  if (!s.recordPresent || s.now < 1000 || s.now >= 1000 + packet.policyFixture.cursorSeconds) return 'VALIDATION_FAILED';
  for (const key of Object.keys(binding)) if (canonical(s[key]) !== canonical(binding[key])) return 'VALIDATION_FAILED';
  return 'CONTINUE';
}
for (const v of packet.cursor) assert.equal(cursor({ ...binding, authenticated: true, authorized: true,
  recordPresent: true, now: 1000, ...v.change }), v.expected, v.id);
function delivery(s) {
  if (!s.authenticated) return 'AUTH_REQUIRED'; if (!s.authorizedIssuer) return 'NOT_FOUND';
  if (!s.commandActive) return 'COMMAND_EXPIRED';
  if (s.state !== 'issued' || s.now >= 1000 + packet.policyFixture.inviteSeconds) return 'NULL_TOKEN';
  return s.deliveryAvailable && s.tagValid ? 'SAME_TOKEN' : 'DEPENDENCY_UNAVAILABLE';
}
for (const v of packet.delivery) assert.equal(delivery({ authenticated: true, authorizedIssuer: true,
  commandActive: true, state: 'issued', now: 1000, deliveryAvailable: true, tagValid: true, ...v.change }), v.expected, v.id);

// Numeric tuples model already validated DB timestamp/UUID order, not JS Date precision or SQL RLS.
const rows = [[20, 3], [20, 2], [20, 1], [19, 9]];
const first = rows.slice(0, 2), boundary = first.at(-1);
const rest = rows.filter(([t, id]) => t < boundary[0] || (t === boundary[0] && id < boundary[1]));
assert.deepEqual(rest, [[20, 1], [19, 9]], 'last returned row, strict tuple boundary');
assert.equal(new Set([...first, ...rest].map(x => x.join(':'))).size, rows.length);

const mutations = [p => { p.syntheticOnly = false; }, p => { p.executionAuthorized = true; },
  p => { p.independentReview = 'DONE'; }, p => { p.cursor.pop(); }, p => { p.policyFixture.cursorSeconds = 0; },
  p => { p.productionDefaults = true; }, p => { p.replay[0].change.unrecognized = true; },
  p => { p.commandGolden.keyHex = 'invalid'; }];
for (const mutate of mutations) { const p = structuredClone(packet); mutate(p); assert.throws(() => checkPacket(p)); }
const spec = fs.readFileSync(path.join(dir, '44-CLASSROOM-COMMAND-CURSOR-INVITATION-HELPERS.md'), 'utf8');
assert(spec.includes('DRAFT / HIGH / REVIEW_PENDING. NO SQL EXECUTION.'));
for (const term of ['digest_key_id', 'replay_state', 'private_classroom_cursor_handles', 'commandDigestV1',
  'cursorIssueV1', 'cursorResolveV1', 'inviteIssueV1', 'inviteDeliveryV1', 'inviteConsumeV1']) assert(spec.includes(term));
console.log(JSON.stringify({ status: 'PASS', canonicalVectors: packet.canonical.length,
  commandGoldenVectors: 1, standardHmacVectors: 1, digestChangeCases: digestMutations.length,
  invalidTokenCases: invalidTokens.length, replayModelCases: packet.replay.length,
  cursorModelCases: packet.cursor.length, deliveryModelCases: packet.delivery.length,
  keysetModelCases: 1, packetNegativeCases: mutations.length, runtimeCasesRun: 0,
  scope: 'Synthetic reference vectors/models ONLY; no production parser, randomness, AES adapter, SQL, HTTP, RLS or device verification' }, null, 2));
