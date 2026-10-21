import assert from 'node:assert/strict';
import test from 'node:test';

const { createMockAiPlanningProvider, createOpenAiPlanningProvider, confirmationToken, confirmPlanProposal } = await import('../../src/features/planning/ai-planner.ts');

const request = (overrides = {}) => ({
  model: 'test-model', availableMinutes: 90, createdAt: '2026-10-09T03:00:00.000Z',
  tasks: [
    { id: 'task-a', title: 'Read', status: 'pending' },
    { id: 'task-b', title: 'Write', status: 'in_progress' },
    { id: 'task-c', title: 'Review', status: 'pending' },
  ], ...overrides,
});

test('mock planning is deterministic, bounded and does not mutate task input', async () => {
  const input = request();
  const before = structuredClone(input);
  const provider = createMockAiPlanningProvider();
  const first = await provider.createProposal(input);
  const second = await provider.createProposal(input);
  assert.deepEqual(first, second);
  assert.deepEqual(input, before);
  assert.equal(first.provider, 'mock');
  assert.equal(first.requiresConfirmation, true);
  assert.deepEqual(first.items.map(({ taskId, position }) => ({ taskId, position })), [
    { taskId: 'task-a', position: 0 }, { taskId: 'task-b', position: 1 }, { taskId: 'task-c', position: 2 },
  ]);
  assert.ok(first.items.every((item) => item.focusDurationSeconds === 1500 && item.breakDurationSeconds === 300));
});

test('planning rejects duplicate, terminal, oversized and unsafe task input', async () => {
  const provider = createMockAiPlanningProvider();
  await assert.rejects(provider.createProposal(request({ tasks: [{ id: 'x', title: 'x', status: 'pending' }, { id: 'x', title: 'y', status: 'pending' }] })), /INVALID_PLANNING_REQUEST/);
  await assert.rejects(provider.createProposal(request({ tasks: [{ id: 'x', title: 'x', status: 'completed' }] })), /INVALID_PLANNING_REQUEST/);
  await assert.rejects(provider.createProposal(request({ availableMinutes: 721 })), /INVALID_PLANNING_REQUEST/);
  await assert.rejects(provider.createProposal(request({ model: '' })), /INVALID_PLANNING_REQUEST/);
});

test('a proposal cannot be applied without explicit matching confirmation', async () => {
  const proposal = await createMockAiPlanningProvider().createProposal(request({ availableMinutes: 60 }));
  assert.throws(() => confirmPlanProposal(proposal, 'wrong-token', '2026-10-09T03:01:00.000Z'), /INVALID_PLAN_CONFIRMATION/);
  const confirmed = confirmPlanProposal(proposal, confirmationToken(proposal), '2026-10-09T03:01:00.000Z');
  assert.equal(confirmed.confirmed, true);
  assert.equal(confirmed.id, proposal.id);
  assert.deepEqual(confirmed.items, proposal.items);
  assert.throws(() => confirmPlanProposal(proposal, confirmationToken(proposal), '2026-10-09T02:59:00.000Z'), /INVALID_PLAN_CONFIRMATION/);
});

test('OpenAI boundary validates structured output and still requires confirmation', async () => {
  let received;
  const provider = createOpenAiPlanningProvider(async (input) => {
    received = input;
    return { items: [{ taskId: 'task-a', position: 0, focusDurationSeconds: 1500, breakDurationSeconds: 300 }] };
  });
  const proposal = await provider.createProposal(request({ availableMinutes: 60, tasks: [request().tasks[0]] }));
  assert.equal(proposal.provider, 'openai');
  assert.equal(proposal.requiresConfirmation, true);
  assert.equal(received.model, 'test-model');
  await assert.rejects(createOpenAiPlanningProvider(async () => ({ items: [{ taskId: 'unknown', position: 0, focusDurationSeconds: 1500, breakDurationSeconds: 300 }] })).createProposal(request()), /AI_RESPONSE_INVALID/);
  assert.equal(confirmPlanProposal(proposal, confirmationToken(proposal), '2026-10-09T03:01:00.000Z').confirmed, true);
});
