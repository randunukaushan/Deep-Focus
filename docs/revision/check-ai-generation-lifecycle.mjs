// Read-only design/reference checks. No app imports, DB, provider, crypto or network.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (name) => fs.readFileSync(path.join(here, name), 'utf8');
const model = JSON.parse(read('contracts/ai-generation-lifecycle.json'));
const contract = read('23-AI-GENERATION-RECOVERY-AND-REVISION.md');
const errors = [];
let fixtures = 0;
let histories = 0;
function test(name, run) {
  fixtures += 1;
  try { run(); } catch (error) { errors.push(`${name}: ${error.message}`); }
}
const copy = (value) => JSON.parse(JSON.stringify(value));
const expectedStates = {
  pending: { reservationUnits: 1, consumedUnits: 0, resultCount: 0 },
  completed: { reservationUnits: 0, consumedUnits: 1, resultCount: 1 },
  failed: { reservationUnits: 0, consumedUnits: 0, resultCount: 0 },
  cancelled: { reservationUnits: 0, consumedUnits: 0, resultCount: 0 },
};
test('exact reference states, not product quotas', () => {
  assert.equal(model.contractVersion, 1);
  assert.equal(model.status, 'draft-reference-only');
  assert.equal(model.initialState, 'pending');
  assert.equal(model.wireOperationsAdded, 0);
  assert.deepEqual(model.states, expectedStates);
  assert.deepEqual(model.terminalStates, ['completed', 'failed', 'cancelled']);
  assert.equal(model.terminalEventRule, 'preserve_state_accounting_and_result');
});
const expectedTransitions = [
  ['complete', 'completed', 'live_fence_and_deadline_and_current_authority_and_valid_result'],
  ['cancel', 'cancelled', 'authorized_cancel'],
  ['fail', 'failed', 'trusted_terminal_failure'],
  ['deadline', 'failed', 'server_deadline_reached'],
  ['disconnect', 'pending', 'no_server_transition'],
  ['provider_unknown', 'pending', 'no_blind_redispatch'],
  ['renew_lease', 'pending', 'prior_lease_expired_new_fence'],
];
test('exact transition matrix and guard names', () => {
  assert.deepEqual(model.transitions, expectedTransitions.map(([event, to, guard]) =>
    ({ from: 'pending', event, to, guard })));
});

// A serial mathematical example, NOT real authorization or concurrency enforcement.
// Guard flags below are supplied synthetic truth; they cannot prove real checks.
const initial = () => ({ status: 'pending', fence: 1, ...copy(model.states.pending) });
function event(state, name, facts = {}) {
  const next = copy(state);
  if (model.terminalStates.includes(state.status)) return next;
  const transition = model.transitions.find((row) => row.from === state.status && row.event === name);
  if (!transition) return next;
  if (name === 'complete' && (facts.fence !== state.fence || facts.live !== true ||
      facts.authorized !== true || facts.validResult !== true || facts.validGrant !== true)) return next;
  if (name === 'cancel' && facts.authorized !== true) return next;
  if (name === 'fail' && facts.trustedFailure !== true) return next;
  if (name === 'deadline' && facts.deadlineReached !== true) return next;
  if (name === 'renew_lease') {
    if (facts.leaseExpired !== true || facts.live !== true) return next;
    next.fence += 1;
  }
  return { ...next, status: transition.to, ...copy(model.states[transition.to]) };
}
const good = { fence: 1, live: true, authorized: true, validResult: true, validGrant: true };
const terminal = (status, fence = 1) => ({ status, fence, ...expectedStates[status] });
test('successful completion consumes once', () => {
  const done = event(initial(), 'complete', good);
  assert.deepEqual(done, terminal('completed'));
  assert.deepEqual(event(done, 'complete', good), done);
});
test('cancel then completion cannot publish', () => {
  const cancelled = event(initial(), 'cancel', good);
  assert.deepEqual(event(cancelled, 'complete', good), terminal('cancelled'));
});
test('completion then cancel is not a refund', () => {
  assert.deepEqual(event(event(initial(), 'complete', good), 'cancel', good), terminal('completed'));
});
test('failure and late result remain failed', () => {
  assert.deepEqual(event(event(initial(), 'fail', { trustedFailure: true }), 'complete', good), terminal('failed'));
});
test('deadline and late result remain failed', () => {
  assert.deepEqual(event(event(initial(), 'deadline', { deadlineReached: true }), 'complete', good), terminal('failed'));
});
for (const name of ['disconnect', 'provider_unknown']) test(`${name} is not a failed request`, () => {
  assert.deepEqual(event(initial(), name), initial());
});
test('stale worker cannot finish after a new fence', () => {
  const reclaimed = event(initial(), 'renew_lease', { leaseExpired: true, live: true });
  assert.equal(reclaimed.fence, 2);
  assert.deepEqual(event(reclaimed, 'complete', good), reclaimed);
  assert.deepEqual(event(reclaimed, 'complete', { ...good, fence: 2 }), terminal('completed', 2));
});
for (const flag of ['live', 'authorized', 'validResult', 'validGrant']) {
  test(`completion guard ${flag} is required`, () => {
    assert.deepEqual(event(initial(), 'complete', { ...good, [flag]: false }), initial());
  });
}
test('lease must expire before reassignment', () => {
  assert.deepEqual(event(initial(), 'renew_lease', { leaseExpired: false, live: true }), initial());
});
test('untrusted failure/cancel/deadline cannot change state', () => {
  for (const name of ['fail', 'cancel', 'deadline']) assert.deepEqual(event(initial(), name), initial());
});

// Fixed expected outcomes above are an oracle independent of manifest changes.
// Exhaustive bounded serial event histories supplement, not replace, those cases.
test('all event histories through depth five preserve accounting/terminal states', () => {
  const events = ['complete', 'cancel', 'fail', 'deadline', 'disconnect', 'provider_unknown', 'renew_lease'];
  function explore(state, depth) {
    assert.deepEqual({ reservationUnits: state.reservationUnits, consumedUnits: state.consumedUnits,
      resultCount: state.resultCount }, expectedStates[state.status]);
    assert.ok(state.reservationUnits + state.consumedUnits <= 1);
    assert.equal(state.resultCount, state.consumedUnits);
    if (!depth) return;
    for (const name of events) {
      const next = event(state, name, { ...good, fence: state.fence, trustedFailure: true,
        deadlineReached: true, leaseExpired: true });
      if (model.terminalStates.includes(state.status)) assert.deepEqual(next, state);
      histories += 1;
      explore(next, depth - 1);
    }
  }
  explore(initial(), 5);
});

// Identity/revision counterexamples use synthetic strings, NOT production hashes.
function accept(store, owner, requestId, intent, available) {
  const key = `${owner}:${requestId}`;
  if (store.has(key)) return store.get(key) === intent ? 'replayed' : 'conflict';
  if (available < 1) return 'denied';
  store.set(key, intent);
  return 'accepted';
}
test('lost acknowledgement reuses request with zero additional availability', () => {
  const requests = new Map();
  assert.equal(accept(requests, 'A', 'request', 'plan-one', 1), 'accepted');
  assert.equal(accept(requests, 'A', 'request', 'plan-one', 0), 'replayed');
  assert.equal(requests.size, 1);
  assert.equal(accept(requests, 'A', 'request', 'changed-intent', 10), 'conflict');
});
test('identity is owner scoped; allowance failure creates no identity', () => {
  const requests = new Map();
  accept(requests, 'A', 'request', 'first-intent', 1);
  assert.equal(accept(requests, 'B', 'request', 'other-intent', 0), 'denied');
  assert.equal(requests.size, 1);
  assert.equal(accept(requests, 'B', 'request', 'other-intent', 1), 'accepted');
  assert.equal(requests.size, 2);
});
const base = () => ({ state: 'ready', version: 1, digest: 'synthetic-v1', expires: 100,
  immutable: 'same-ids-commands-edges-inputVersions', value: 'old', consumed: 1, receipts: {} });
function revise(proposal, command, now) {
  const next = copy(proposal);
  const intent = JSON.stringify(command); // synthetic comparison only; never JCS/crypto
  if (next.receipts[command.key]) return {
    outcome: next.receipts[command.key].intent === intent ? 'replayed' : 'conflict', proposal: next,
  };
  if (next.state !== 'ready' || now >= next.expires || command.version !== next.version ||
      command.digest !== next.digest || command.immutable !== next.immutable ||
      command.value === next.value) return { outcome: 'rejected', proposal: next };
  next.version += 1;
  next.digest = `synthetic-v${next.version}`;
  next.value = command.value;
  next.receipts[command.key] = { intent, version: next.version, digest: next.digest };
  return { outcome: 'revised', proposal: next };
}
const edit = { key: 'one', version: 1, digest: 'synthetic-v1',
  immutable: base().immutable, value: 'new' };
test('manual edit preserves consumption, expiry and protected identity', () => {
  const changed = revise(base(), edit, 50);
  assert.equal(changed.outcome, 'revised');
  assert.equal(changed.proposal.version, 2);
  for (const key of ['consumed', 'expires', 'immutable']) assert.equal(changed.proposal[key], base()[key]);
});
test('revision lost-response replay does not advance version', () => {
  const changed = revise(base(), edit, 50).proposal;
  const replay = revise(changed, edit, 101);
  assert.equal(replay.outcome, 'replayed'); // minimal receipt, NOT content revival
  assert.deepEqual(replay.proposal, changed);
  assert.equal(revise(changed, { ...edit, value: 'different' }, 51).outcome, 'conflict');
});
test('stale revision versus revision, protected changes and no-op reject atomically', () => {
  const changed = revise(base(), edit, 50).proposal;
  for (const command of [{ ...edit, key: 'two' }, { ...edit, immutable: 'new-owner' },
    { ...edit, value: 'old' }]) {
    const input = command.key === 'two' ? changed : base();
    const result = revise(input, command, 51);
    assert.equal(result.outcome, 'rejected');
    assert.deepEqual(result.proposal, input);
  }
});
test('expired or applied proposal cannot revive through a new revision', () => {
  assert.equal(revise(base(), edit, 100).outcome, 'rejected');
  assert.equal(revise({ ...base(), state: 'applied' }, edit, 50).outcome, 'rejected');
});
test('document has all task/scenario identifiers and explicit gaps', () => {
  const ids = [...contract.matchAll(/^\| (AG-T\d{2}) \|/gm)].map((m) => m[1]);
  assert.deepEqual(ids, Array.from({ length: 24 }, (_, i) => `AG-T${String(i + 1).padStart(2, '0')}`));
  const cards = [...contract.matchAll(/^\| (AG-\d{2}) \|/gm)].map((m) => m[1]);
  assert.deepEqual(cards, ['AG-01', 'AG-02', 'AG-03', 'AG-04', 'AG-05']);
  for (const text of ['NOT RUN', 'REVIEW_PENDING', '47 operations', 'not yet additional OpenAPI coverage',
    'does **not** encode ordered focus blocks', 'key/metadata retention policy is unresolved']) {
    assert.ok(contract.includes(text), `Missing boundary: ${text}`);
  }
});
console.log(JSON.stringify({ status: errors.length ? 'FAIL' : 'PASS', referenceFixtures: fixtures,
  serialHistoryEdges: histories, maximumHistoryDepth: 5, futureIntegrationScenarios: 24,
  draftCards: 5, wireOperationsAdded: 0, runtimeSecurityVerified: false, errors }, null, 2));
process.exitCode = errors.length ? 1 : 0;
