import assert from 'node:assert/strict';
import test from 'node:test';

const { validateGatewayOperationDto } = await import('../../supabase/functions/_shared/gateway-dto-validation.ts');

const id = '11111111-1111-4111-8111-111111111111';
const workspaceId = '22222222-2222-4222-8222-222222222222';
const validTask = { id, workspaceId, title: 'Read', priority: null, due: { kind: 'none' } };

test('DTO validation accepts bounded task, goal and session values', () => {
  assert.doesNotThrow(() => validateGatewayOperationDto('createTask', validTask));
  assert.doesNotThrow(() => validateGatewayOperationDto('createGoal', { id, workspaceId, title: 'Focus', type: 'focus_time', period: 'daily', startsAt: '2026-10-10T00:00:00.000Z', endsAt: '2026-10-11T00:00:00.000Z', timeZone: 'Asia/Colombo', targetValue: 1500, targetUnit: 'ms' }));
  assert.doesNotThrow(() => validateGatewayOperationDto('startSession', { id, workspaceId, plannedMs: 1500, startedAt: '2026-10-10T00:00:00.000Z' }));
});

test('DTO validation rejects invalid UUID, version, title, instant and numeric bounds', () => {
  assert.throws(() => validateGatewayOperationDto('createTask', { ...validTask, id: 'not-an-id' }), /VALIDATION_FAILED/);
  assert.throws(() => validateGatewayOperationDto('patchTask', { expectedVersion: 0, title: 'Edit' }), /VALIDATION_FAILED/);
  assert.throws(() => validateGatewayOperationDto('createTask', { ...validTask, title: '   ' }), /VALIDATION_FAILED/);
  assert.throws(() => validateGatewayOperationDto('startSession', { id, workspaceId, plannedMs: 0, startedAt: '2026-10-10T00:00:00.000Z' }), /VALIDATION_FAILED/);
  assert.throws(() => validateGatewayOperationDto('startSession', { id, workspaceId, plannedMs: 1500, startedAt: '2026-10-10T00:00:00+05:30' }), /VALIDATION_FAILED/);
});

test('DTO validation preserves goal units and transition event constraints', () => {
  assert.throws(() => validateGatewayOperationDto('createGoal', { id, workspaceId, title: 'Count', type: 'session_count', period: 'daily', startsAt: '2026-10-10T00:00:00.000Z', endsAt: '2026-10-11T00:00:00.000Z', timeZone: 'Asia/Colombo', targetValue: 2, targetUnit: 'ms' }), /VALIDATION_FAILED/);
  assert.throws(() => validateGatewayOperationDto('applyTaskAction', { id, expectedVersion: 1, action: 'pause', occurredAt: '2026-10-10T00:00:00.000Z' }), /VALIDATION_FAILED/);
  assert.throws(() => validateGatewayOperationDto('applySessionEvent', { id, expectedVersion: 1, type: 'pause', occurredAt: '2026-10-10T00:00:00.000Z', clientSequence: 0 }), /VALIDATION_FAILED/);
});

test('DTO validation rejects unsafe nested due values and oversized text', () => {
  assert.throws(() => validateGatewayOperationDto('createTask', { ...validTask, due: { kind: 'instant', at: 'not-an-instant' } }), /VALIDATION_FAILED/);
  assert.throws(() => validateGatewayOperationDto('createTask', { ...validTask, description: 'x'.repeat(4001) }), /VALIDATION_FAILED/);
});
