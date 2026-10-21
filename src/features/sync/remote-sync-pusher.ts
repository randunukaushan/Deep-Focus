// Keep this adapter directly importable by the bundled domain-test runtime.
// @ts-expect-error The bundled domain test runner imports TypeScript modules directly.
import { RemoteApiError, type RemoteApiFetch, createRemoteApiClient } from '../auth/remote-api-client.ts';
import type { SyncPushItem, SyncPushResult } from './sync-service';

type RemoteRequestClient = {
  request<T>(path: string, options?: { method?: 'GET' | 'POST' | 'PATCH' | 'DELETE'; body?: unknown; idempotencyKey?: string; expectedVersion?: number }): Promise<T>;
};

export type RemoteSyncPusherDependencies = {
  baseUrl: string | undefined;
  getAccessToken: () => Promise<string | null>;
  fetcher?: RemoteApiFetch;
  client?: RemoteRequestClient;
};

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const SAFE_ERROR_CODE = /^[A-Z][A-Z0-9_]{0,79}$/;

function objectBody(value: unknown): Record<string, unknown> {
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new RemoteApiError(0, 'SYNC_PAYLOAD_INVALID');
  const body = value as Record<string, unknown>;
  if ('ownerId' in body || 'userId' in body || 'serviceRole' in body) throw new RemoteApiError(0, 'SYNC_PAYLOAD_INVALID');
  return body;
}

function pathId(value: string): string {
  if (!UUID.test(value)) throw new RemoteApiError(0, 'SYNC_TARGET_INVALID');
  return encodeURIComponent(value);
}

function eventBody(value: Record<string, unknown>): Record<string, unknown> {
  const event = value.event;
  if (!event || typeof event !== 'object' || Array.isArray(event)) throw new RemoteApiError(0, 'SYNC_EVENT_REQUIRED');
  return objectBody(event);
}

function versionOnly(body: Record<string, unknown>): number {
  if (Object.keys(body).length !== 1 || !Number.isSafeInteger(body.expectedVersion) || (body.expectedVersion as number) < 1 || (body.expectedVersion as number) > 2_147_483_647) {
    throw new RemoteApiError(0, 'SYNC_PAYLOAD_INVALID');
  }
  return body.expectedVersion as number;
}

function requestFor(item: SyncPushItem): { path: string; method: 'POST' | 'PATCH' | 'DELETE'; body?: Record<string, unknown>; expectedVersion?: number } {
  const body = objectBody(item.body);
  switch (item.command) {
    case 'task.create': return { path: '/v1/tasks', method: 'POST', body };
    case 'task.patch': return { path: `/v1/tasks/${pathId(item.targetId)}`, method: 'PATCH', body };
    case 'task.action': return { path: `/v1/tasks/${pathId(item.targetId)}/actions`, method: 'POST', body };
    case 'task.delete': return { path: `/v1/tasks/${pathId(item.targetId)}`, method: 'DELETE', expectedVersion: versionOnly(body) };
    case 'goal.create': return { path: '/v1/goals', method: 'POST', body };
    case 'goal.patch': return { path: `/v1/goals/${pathId(item.targetId)}`, method: 'PATCH', body };
    case 'goal.delete': return { path: `/v1/goals/${pathId(item.targetId)}`, method: 'DELETE', expectedVersion: versionOnly(body) };
    case 'session.start': return { path: '/v1/focus-sessions', method: 'POST', body };
    case 'session.event': return { path: `/v1/focus-sessions/${pathId(item.targetId)}/events`, method: 'POST', body: eventBody(body) };
    case 'break.record': return { path: '/v1/breaks', method: 'POST', body };
    case 'settings.patch': return { path: '/v1/settings', method: 'PATCH', body };
    case 'reminder.create': return { path: '/v1/task-reminders', method: 'POST', body };
    case 'reminder.patch': return { path: `/v1/task-reminders/${pathId(item.targetId)}`, method: 'PATCH', body };
    case 'reminder.delete': return { path: `/v1/task-reminders/${pathId(item.targetId)}`, method: 'DELETE', expectedVersion: versionOnly(body) };
    case 'profile.patch': return { path: '/v1/me', method: 'PATCH', body };
    case 'session.terminal':
      // The local seconds-based terminal snapshot is not a server SessionEvent.
      // Do not reinterpret it as trusted focused milliseconds or invent a sequence.
      throw new RemoteApiError(0, 'SYNC_EVENT_REQUIRED');
    default: throw new RemoteApiError(0, 'SYNC_COMMAND_UNSUPPORTED');
  }
}

function safeRejectedCode(error: RemoteApiError): string {
  return SAFE_ERROR_CODE.test(error.code) ? error.code : 'SYNC_REMOTE_REJECTED';
}

function isPermanentContractRejection(error: RemoteApiError): boolean {
  if ([400, 403, 404, 409, 410, 422].includes(error.status)) return true;
  return error.status === 0 && [
    'SYNC_PAYLOAD_INVALID', 'SYNC_TARGET_INVALID', 'SYNC_EVENT_REQUIRED',
    'SYNC_COMMAND_UNSUPPORTED', 'SYNC_IDEMPOTENCY_INVALID',
  ].includes(error.code);
}

/**
 * Adapts the local outbox to the approved personal API routes without trusting
 * local ownership fields. It is intentionally not wired into app startup until
 * the reviewed gateway, server schema and UUID/idempotency contract exist.
 */
export function createRemoteSyncPusher(dependencies: RemoteSyncPusherDependencies) {
  const client = dependencies.client ?? createRemoteApiClient(dependencies);
  return async function push(items: SyncPushItem[], _batchKey: string): Promise<SyncPushResult> {
    const acceptedMutationIds: string[] = [];
    const rejectedMutationIds: { mutationId: string; errorCode: string }[] = [];
    for (const item of items) {
      try {
        if (!UUID.test(item.mutationId)) throw new RemoteApiError(0, 'SYNC_IDEMPOTENCY_INVALID');
        const request = requestFor(item);
        await client.request(request.path, {
          method: request.method,
          ...(request.body === undefined ? {} : { body: request.body }),
          ...(request.expectedVersion === undefined ? {} : { expectedVersion: request.expectedVersion }),
          idempotencyKey: item.mutationId,
        });
        acceptedMutationIds.push(item.mutationId);
      } catch (error) {
        if (error instanceof RemoteApiError && isPermanentContractRejection(error)) {
          rejectedMutationIds.push({ mutationId: item.mutationId, errorCode: safeRejectedCode(error) });
          continue;
        }
        throw error;
      }
    }
    return { acceptedMutationIds, ...(rejectedMutationIds.length === 0 ? {} : { rejectedMutationIds }) };
  };
}
