// EB-00 documentation/DTO and pure-model checks. NO SQL, Edge, auth or AES execution.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const read = name => JSON.parse(fs.readFileSync(path.join(dir, 'contracts', name), 'utf8'));
const bridge = read('classroom-bridge.schema.json'), wire = read('classroom.schema.json');
const api = read('classroom.openapi.json');
const requireLocal = createRequire(path.resolve(dir, '../../package.json'));
const Ajv = requireLocal('ajv'); // Already installed; no dependency changes.
const ajv = new Ajv({ allErrors: true, format: 'full' });
for (const schema of [bridge, wire]) { assert(ajv.validateSchema(schema)); ajv.addSchema(schema); }
const check = (name, value) => ajv.validate(`${bridge.$id}#/definitions/${name}`, value);
let fixtures = 0, negative = 0;
function fixture(name, value, expected) {
  fixtures++; if (!expected) negative++;
  assert.equal(check(name, value), expected, `${name}: ${JSON.stringify(ajv.errors)}`);
}
const operations = Object.values(api.paths).flatMap(p => Object.values(p)).filter(o => o['x-classroom-id']);
const mutations = operations.filter(o => o['x-mutation']).map(o => o['x-classroom-id']).sort();
assert.equal(mutations.length, 13); assert.equal(operations.length - mutations.length, 9);
assert.deepEqual(bridge.definitions.Operation.enum, mutations);
const actor = '10000000-0000-4000-8000-000000000001';
const cls = '20000000-0000-4000-8000-000000000002';
const invite = '30000000-0000-4000-8000-000000000003';
const command = '40000000-0000-4000-8000-000000000004';
const instant = '2026-10-01T12:30:00.123456Z';
const plan = { inviteId: invite, classId: cls, issuerId: actor, expiresAt: instant, keyId: 'synthetic-aead-1' };
const lookup = bytes => createHash('sha256').update('deep-focus/classroom-invite/v1\0').update(bytes).digest('hex');
const fakePlaintext = Buffer.alloc(32, 7); // Model output only; never an actual encrypted/decrypted token.
const delivery = { ...plan, encryptionVersion: 1, tokenDigestHex: lookup(fakePlaintext),
  nonceHex: '11'.repeat(12), ciphertextHex: '22'.repeat(32), tagHex: '33'.repeat(16) };
const base = { bridgeVersion: 1, operation: 'CW-05', commandId: command, scope: { kind: 'class', id: cls },
  policyRevision: 1, digest: { version: 1, keyId: 'synthetic-mac-1' } };
const prep = { ...base, mode: 'fresh', issue: plan, deliveryKeyId: null };
const material = { ...base, digest: { ...base.digest, macHex: '44'.repeat(32) }, issue: delivery };
for (const operation of mutations) {
  const scope = { kind: operation === 'CW-01' ? 'creator' : 'class', id: operation === 'CW-01' ? actor : cls };
  fixture('Preparation', { ...prep, operation, scope, issue: operation === 'CW-05' ? plan : null }, true);
  fixture('MutationMaterial', { ...material, operation, scope, issue: operation === 'CW-05' ? delivery : null }, true);
}
fixture('Preparation', { ...prep, mode: 'replay', issue: null, deliveryKeyId: plan.keyId }, true);
fixture('Preparation', { ...prep, mode: 'replay', issue: null, deliveryKeyId: null }, true);
fixture('MutationMaterial', { ...material, issue: null }, true); // Runtime fresh branch must reject; replay permits.
const prepBad = [x => { x.actorId = actor; }, x => { x.operation = 'CW-07'; },
  x => { x.issue = null; }, x => { x.mode = 'replay'; }, x => { x.deliveryKeyId = 'unexpected'; },
  x => { x.scope.kind = 'creator'; }, x => { x.digest.macHex = '44'.repeat(32); },
  x => { x.issue.expiresAt = '2026-10-01T12:30:00.123Z'; }, x => { x.policyRevision = 0; }];
for (const mutate of prepBad) { const x = structuredClone(prep); mutate(x); fixture('Preparation', x, false); }
const materialBad = [x => { x.mode = 'fresh'; }, x => { x.digest.macHex = 'aa'; },
  x => { x.digest.keyId = 'bad key'; }, x => { x.issue.nonceHex = '11'.repeat(11); },
  x => { x.issue.tagHex = 'AA'.repeat(16); }, x => { x.issue.ciphertextHex = '22'.repeat(48); },
  x => { x.issue.token = 'A'.repeat(43); }, x => { x.operation = 'CW-04'; },
  x => { x.bridgeVersion = 2; }, x => { delete x.commandId; },
  x => { x.digest.keyId += '\n'; }, x => { x.digest.macHex += '\n'; },
  x => { x.issue.nonceHex += '\n'; }, x => { x.issue.tagHex += '\n'; }];
for (const mutate of materialBad) { const x = structuredClone(material); mutate(x); fixture('MutationMaterial', x, false); }
const result = { bridgeVersion: 1, view: { inviteId: invite, classId: cls, version: 1, state: 'issued', expiresAt: instant }, delivery };
fixture('BridgeInviteResult', result, true);
for (const state of ['consumed', 'revoked', 'expired']) {
  fixture('BridgeInviteResult', { ...result, view: { ...result.view, state }, delivery: null }, true);
  fixture('BridgeInviteResult', { ...result, view: { ...result.view, state } }, false);
}
fixture('BridgeInviteResult', { ...result, delivery: null }, false);
fixture('BridgeInviteResult', { ...result, view: { ...result.view, token: 'A'.repeat(43) } }, false);
fixture('BridgeInviteResult', { ...result, rawKey: 'not-allowed' }, false);

// Relational checks cannot be expressed as ordinary draft-07 cross-field equality.
function projectModel(value, verifiedActor, modeledPlaintext) {
  assert(check('BridgeInviteResult', value));
  const v = value.view;
  let token = null;
  if (v.state === 'issued') {
    for (const key of ['inviteId', 'classId', 'expiresAt']) assert.equal(value.delivery[key], v[key]);
    assert.equal(value.delivery.issuerId, verifiedActor);
    assert(Buffer.isBuffer(modeledPlaintext) && modeledPlaintext.length === 32);
    assert.equal(lookup(modeledPlaintext), value.delivery.tokenDigestHex);
    token = modeledPlaintext.toString('base64url');
  }
  const out = { data: { inviteId: v.inviteId, classId: v.classId, version: v.version,
    state: v.state, expiresAt: v.expiresAt, token } };
  assert(ajv.validate(`${wire.$id}#/definitions/InviteViewResponse`, out));
  return out;
}
const projected = projectModel(result, actor, fakePlaintext);
assert.equal(projected.data.token, fakePlaintext.toString('base64url'));
assert.deepEqual(Object.keys(projected.data).sort(), wire.definitions.InviteAvailable.required.slice().sort());
for (const state of ['consumed', 'revoked', 'expired'])
  assert.equal(projectModel({ ...result, view: { ...result.view, state }, delivery: null }, actor, null).data.token, null);
const bindingMutations = [x => { x.delivery.classId = actor; }, x => { x.delivery.inviteId = cls; },
  x => { x.delivery.issuerId = cls; }, x => { x.delivery.expiresAt = '2026-10-01T12:31:00.123456Z'; },
  x => { x.delivery.tokenDigestHex = '00'.repeat(32); }];
for (const mutate of bindingMutations) {
  const x = structuredClone(result); mutate(x); assert.throws(() => projectModel(x, actor, fakePlaintext));
}
assert.throws(() => projectModel(result, actor, Buffer.alloc(31)));

// Pure decision model only: does not prove current SQL state or actual lock ordering.
function decision(s) {
  if (!s.auth) return 'AUTH_REQUIRED';
  if (!s.allowed) return 'NOT_FOUND';
  if (!s.bindings) return 'DEPENDENCY_UNAVAILABLE';
  if (s.crossScopeConflict) return 'COMMAND_CONFLICT';
  if (s.receipt === 'closed' || s.expired) return 'COMMAND_EXPIRED';
  if (s.receipt === 'active') {
    if (!s.keyMatches) return 'PREPARATION_STALE';
    return s.macMatches ? 'REPLAY_STORED' : 'COMMAND_CONFLICT';
  }
  if (!s.policyMatches || !s.keyMatches) return 'PREPARATION_STALE';
  if (!s.freshAllowed) return 'INVALID_TRANSITION';
  if (!s.issuePresent || !s.issueCurrent) return 'PREPARATION_STALE';
  return 'FRESH_ATOMIC';
}
const state = { auth: true, allowed: true, bindings: true, crossScopeConflict: false, receipt: 'absent',
  expired: false, keyMatches: true, macMatches: true, policyMatches: true, freshAllowed: true,
  issuePresent: true, issueCurrent: true };
const cases = [[{}, 'FRESH_ATOMIC'], [{ auth: false }, 'AUTH_REQUIRED'], [{ allowed: false }, 'NOT_FOUND'],
  [{ bindings: false }, 'DEPENDENCY_UNAVAILABLE'], [{ crossScopeConflict: true }, 'COMMAND_CONFLICT'],
  [{ receipt: 'closed', keyMatches: false }, 'COMMAND_EXPIRED'], [{ receipt: 'active', expired: true }, 'COMMAND_EXPIRED'],
  [{ receipt: 'active', keyMatches: false }, 'PREPARATION_STALE'], [{ receipt: 'active', macMatches: false }, 'COMMAND_CONFLICT'],
  [{ receipt: 'active', policyMatches: false, freshAllowed: false, issuePresent: false }, 'REPLAY_STORED'],
  [{ policyMatches: false }, 'PREPARATION_STALE'], [{ keyMatches: false }, 'PREPARATION_STALE'],
  [{ freshAllowed: false }, 'INVALID_TRANSITION'], [{ issuePresent: false }, 'PREPARATION_STALE'],
  [{ issueCurrent: false }, 'PREPARATION_STALE']];
for (const [change, expected] of cases) assert.equal(decision({ ...state, ...change }), expected);
// Model a competing preparer's unused token and a committed winner's response.
const losingPlaintext = Buffer.alloc(32, 8);
assert.notEqual(projectModel(result, actor, fakePlaintext).data.token, losingPlaintext.toString('base64url'));
const outcome = (validated, commit) => !validated ? 'ROLLBACK' : commit === 'ok' ? 'RELEASE' : commit === 'unknown' ? 'RECOVER_ORIGINAL' : 'ROLLBACK';
for (const [validated, commit, expected] of [[false, 'ok', 'ROLLBACK'], [true, 'ok', 'RELEASE'],
  [true, 'failed', 'ROLLBACK'], [true, 'unknown', 'RECOVER_ORIGINAL']]) assert.equal(outcome(validated, commit), expected);
const doc = fs.readFileSync(path.join(dir, '46-CLASSROOM-EDGE-DATABASE-BRIDGE.md'), 'utf8');
for (const term of ['ADAPTER_HOLD', 'classroom_prepare_v1', 'p_bridge jsonb', 'DF012', 'df_class_prepare', 'NO SQL EXECUTION.']) assert(doc.includes(term));
console.log(JSON.stringify({ status: 'PASS', definitions: Object.keys(bridge.definitions).length,
  mutationOperations: mutations.length, readOperations: 9, dtoFixtures: fixtures, rejectedDtoFixtures: negative,
  projectionPositiveCases: 4, projectionNegativeCases: bindingMutations.length + 1,
  decisionModelCases: cases.length, winnerModelCases: 1, commitModelCases: 4, runtimeCasesRun: 0,
  scope: 'Internal DTO/reference and pure decision models only; no AES/JWT/SQL/Edge/grant/concurrency verification' }, null, 2));
