import assert from 'node:assert/strict';
import test from 'node:test';

const { createMockAiPlanningProvider } = await import('../../src/features/planning/ai-planner.ts');
const { createServerAiPlanningBoundary } = await import('../../supabase/functions/_shared/server-ai-planning-boundary.ts');
const { SafeBoundaryError } = await import('../../supabase/functions/_shared/server-boundary.ts');

const OWNER = '11111111-1111-4111-8111-111111111111';
const SESSION = '22222222-2222-4222-8222-222222222222';
const RECEIPT = '33333333-3333-4333-8333-333333333333';
const NOW = '2026-10-10T00:00:00.000Z';
const request = { model: 'test-model', availableMinutes: 60, createdAt: NOW, tasks: [{ id: '44444444-4444-4444-8444-444444444444', title: 'Read', status: 'pending' }] };

function boundary(overrides = {}) {
  const events = [];
  const usage = {
    reserve: async (value) => { events.push(['reserve', value]); return { allowed: true }; },
    settle: async (value) => { events.push(['settle', value]); return { allowed: true, status: value.action === 'consume' ? 'consumed' : 'released' }; },
  };
  const applied = [];
  const service = createServerAiPlanningBoundary({ provider: createMockAiPlanningProvider(), usage, recheckSession: async (ownerId, sessionId) => events.push(['recheck', { ownerId, sessionId }]), applyConfirmed: async (value) => applied.push(value), ...overrides });
  return { service, events, applied };
}

test('proposal lifecycle reserves AI allowance and consumes it only after provider success', async () => {
  const h = boundary();
  const proposal = await h.service.createProposal({ verifiedActorId: OWNER, sessionId: SESSION, periodKey: '2026-10', receiptId: RECEIPT, now: NOW, request });
  assert.equal(proposal.requiresConfirmation, true);
  assert.equal(h.events[0][0], 'reserve');
  assert.equal(h.events[1][1].action, 'consume');
  assert.equal(h.events[0][1].sessionId, SESSION);
});

test('provider failure releases the reservation and never applies a plan', async () => {
  const h = boundary({ provider: { createProposal: async () => { throw new Error('provider detail'); } } });
  await assert.rejects(() => h.service.createProposal({ verifiedActorId: OWNER, sessionId: SESSION, periodKey: '2026-10', receiptId: RECEIPT, now: NOW, request }), (error) => {
    assert.match(error.message, /AI_PROVIDER_UNAVAILABLE/);
    assert.doesNotMatch(error.message, /provider detail/);
    return true;
  });
  assert.equal(h.events.at(-1)[1].action, 'release');
  assert.equal(h.applied.length, 0);
});

test('allowance denial prevents provider calls and writes', async () => {
  let called = false;
  const h = boundary({ provider: { createProposal: async () => { called = true; throw new Error('must not call'); } }, usage: { reserve: async () => ({ allowed: false }), settle: async () => ({ allowed: true, status: 'released' }) } });
  await assert.rejects(() => h.service.createProposal({ verifiedActorId: OWNER, sessionId: SESSION, periodKey: '2026-10', receiptId: RECEIPT, now: NOW, request }), /AI_ALLOWANCE_EXCEEDED/);
  assert.equal(called, false);
});

test('apply requires matching explicit confirmation before server callback', async () => {
  const h = boundary();
  const proposal = await h.service.createProposal({ verifiedActorId: OWNER, sessionId: SESSION, periodKey: '2026-10', receiptId: RECEIPT, now: NOW, request });
  await assert.rejects(() => h.service.applyConfirmed({ verifiedActorId: OWNER, sessionId: SESSION, proposal, confirmationToken: 'wrong', confirmedAt: NOW }), /VALIDATION_FAILED/);
  assert.equal(h.applied.length, 0);
  const plan = await h.service.applyConfirmed({ verifiedActorId: OWNER, sessionId: SESSION, proposal, confirmationToken: proposal.id, confirmedAt: NOW });
  assert.equal(plan.confirmed, true);
  assert.equal(h.applied.length, 1);
  assert.equal(h.events.at(-1)[0], 'recheck');
});

test('revoked session blocks confirmed plan apply before server write', async () => {
  let applied = false;
  const h = boundary({ recheckSession: async () => { throw new SafeBoundaryError(401, 'AUTH_REQUIRED'); }, applyConfirmed: async () => { applied = true; } });
  const proposal = await h.service.createProposal({ verifiedActorId: OWNER, sessionId: SESSION, periodKey: '2026-10', receiptId: RECEIPT, now: NOW, request });
  await assert.rejects(() => h.service.applyConfirmed({ verifiedActorId: OWNER, sessionId: SESSION, proposal, confirmationToken: proposal.id, confirmedAt: NOW }), /AUTH_REQUIRED/);
  assert.equal(applied, false);
});

test('raw apply failures become safe dependency errors without leaking details', async () => {
  const h = boundary({ applyConfirmed: async () => { throw new Error('private SQL detail'); } });
  const proposal = await h.service.createProposal({ verifiedActorId: OWNER, sessionId: SESSION, periodKey: '2026-10', receiptId: RECEIPT, now: NOW, request });
  await assert.rejects(() => h.service.applyConfirmed({ verifiedActorId: OWNER, sessionId: SESSION, proposal, confirmationToken: proposal.id, confirmedAt: NOW }), (error) => {
    assert.match(error.message, /DEPENDENCY_UNAVAILABLE/);
    assert.doesNotMatch(error.message, /private SQL detail/);
    return true;
  });
});

test('raw session recheck failures become safe dependency errors before apply', async () => {
  let applied = false;
  const h = boundary({ recheckSession: async () => { throw new Error('private session store detail'); }, applyConfirmed: async () => { applied = true; } });
  const proposal = await h.service.createProposal({ verifiedActorId: OWNER, sessionId: SESSION, periodKey: '2026-10', receiptId: RECEIPT, now: NOW, request });
  await assert.rejects(() => h.service.applyConfirmed({ verifiedActorId: OWNER, sessionId: SESSION, proposal, confirmationToken: proposal.id, confirmedAt: NOW }), (error) => {
    assert.match(error.message, /DEPENDENCY_UNAVAILABLE/);
    assert.doesNotMatch(error.message, /private session store detail/);
    return true;
  });
  assert.equal(applied, false);
});

test('raw allowance reservation failures become safe errors before provider call', async () => {
  let called = false;
  const h = boundary({
    usage: { reserve: async () => { throw new Error('private allowance SQL detail'); }, settle: async () => ({ allowed: true, status: 'released' }) },
    provider: { createProposal: async () => { called = true; throw new Error('must not call'); } },
  });
  await assert.rejects(() => h.service.createProposal({ verifiedActorId: OWNER, sessionId: SESSION, periodKey: '2026-10', receiptId: RECEIPT, now: NOW, request }), (error) => {
    assert.match(error.message, /DEPENDENCY_UNAVAILABLE/);
    assert.doesNotMatch(error.message, /private allowance SQL detail/);
    return true;
  });
  assert.equal(called, false);
});
