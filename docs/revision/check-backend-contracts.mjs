// Read-only documentation validation. Does not execute SQL, mount Edge, or verify auth/RLS.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const contractDir = path.join(dir, 'contracts');
const requireLocal = createRequire(path.resolve(dir, '../../package.json'));
const errors = [];
try {
  const Ajv = requireLocal('ajv'); // Existing transitive dev dependency, not a new app choice.
  const ajv = new Ajv({ allErrors: true, jsonPointers: true, format: 'full' });
  const schema = JSON.parse(fs.readFileSync(path.join(contractDir, 'personal-api.schema.json'), 'utf8'));
  const api = JSON.parse(fs.readFileSync(path.join(contractDir, 'personal-api.openapi.json'), 'utf8'));
  ajv.addSchema(schema);
  // Exercise the actual optional OpenAPI query parameter, not a copied rule.
  const cursorParameter = api.components.parameters.Cursor;
  assert.equal(cursorParameter.required, false);
  const cursorQuery = ajv.compile({ type: 'object', additionalProperties: false,
    properties: { cursor: cursorParameter.schema } });
  const cursorCases = [
    [{}, true, 'omitted first-page cursor'],
    [{ cursor: '' }, false, 'supplied empty cursor'],
    [{ cursor: 'a' }, true, 'one-character shape, not a verified token'],
    [{ cursor: 'a'.repeat(2048) }, true, 'maximum cursor shape'],
    [{ cursor: 'a'.repeat(2049) }, false, 'overlong cursor'],
    [{ cursor: null }, false, 'null cursor'],
    [{ cursor: 1 }, false, 'numeric cursor'],
  ];
  for (const [input, expected, label] of cursorCases) {
    assert.equal(cursorQuery(input), expected, label);
  }
  const u = '10000000-0000-4000-8000-000000000001';
  const w = '20000000-0000-4000-8000-000000000002';
  const now = '2026-09-15T00:00:00.000Z';
  const task = { id: u, workspaceId: w, title: 'Prepare own notes' };
  const goal = { ...task, type: 'focus_time', period: 'weekly', startsAt: now,
    endsAt: '2026-09-22T00:00:00.000Z', timeZone: 'Asia/Colombo', targetValue: 9000000, targetUnit: 'ms' };
  const session = { id: u, workspaceId: w, plannedMs: 1500000, startedAt: now };
  const event = { id: u, expectedVersion: 1, type: 'complete', occurredAt: now, clientSequence: 1 };
  const readTask = { ...task, description: null, priority: null, goalId: null, due: { kind: 'none' },
    status: 'pending', version: 1, createdAt: now, updatedAt: now, completedAt: null, archivedAt: null };
  const cases = [
    ['TaskCreate', task, true, 'minimal task'],
    ['TaskCreate', { ...task, due: { kind: 'date', date: '2026-09-20' } }, true, 'date-only due'],
    ['TaskCreate', { ...task, due: { kind: 'instant', at: now } }, true, 'instant due'],
    ['TaskCreate', { ...task, ownerId: u }, false, 'owner field forbidden'],
    ['TaskCreate', { ...task, title: '   ' }, false, 'blank title'],
    ['TaskCreate', { ...task, title: 'a'.repeat(241) }, false, 'title bound'],
    ['TaskCreate', { ...task, priority: 'normal' }, false, 'preserve medium enum'],
    ['TaskCreate', { ...task, resourceUri: 'file:///private/paper.pdf' }, false, 'no resource transmission'],
    ['TaskCreate', { ...task, due: { kind: 'none', date: '2026-09-20' } }, false, 'mutually exclusive due'],
    ['TaskPatch', { expectedVersion: 1, description: null }, true, 'explicit nullable clear'],
    ['TaskPatch', { expectedVersion: 1 }, false, 'empty patch'],
    ['TaskPatch', { expectedVersion: 1, status: 'completed' }, false, 'state via action only'],
    ['TaskPatch', { expectedVersion: 0, title: 'x' }, false, 'positive version'],
    ['TaskAction', { id: u, expectedVersion: 1, action: 'complete', occurredAt: now }, true, 'task action'],
    ['GoalCreate', goal, true, 'explicit goal milliseconds'],
    ['GoalCreate', { ...goal, type: 'session_count', targetUnit: 'count', targetValue: 4 }, true, 'count goal'],
    ['GoalCreate', { ...goal, targetUnit: 'count' }, false, 'reject wrong goal unit'],
    ['GoalCreate', { ...goal, targetValue: 1.5 }, false, 'integer target'],
    ['GoalCreate', { ...goal, currentValue: 999 }, false, 'no client progress'],
    ['SessionStart', session, true, 'start evidence'],
    ['SessionStart', { ...session, plannedMs: 0 }, false, 'positive duration'],
    ['SessionStart', { ...session, plannedMs: Number.MAX_SAFE_INTEGER + 1 }, false, 'safe numeric bound'],
    ['SessionStart', { ...session, focusedMs: 999999 }, false, 'no client focus total'],
    ['SessionStart', { ...session, startedAt: 'not-a-date' }, false, 'invalid timestamp'],
    ['SessionEvent', event, true, 'event shape only, not valid completion time'],
    ['SessionEvent', { ...event, xp: 200 }, false, 'no client XP'],
    ['MutationBatch', { mutations: [{ id: u, operation: 'task.create', payload: task }] }, true, 'bounded create batch'],
    ['MutationBatch', { mutations: Array.from({ length: 26 }, () => ({ id: u, operation: 'task.create', payload: task })) }, false, 'batch bound'],
    ['Task', readTask, true, 'read DTO nulls'],
    ['Task', { ...readTask, serviceKey: 'synthetic-forbidden-field' }, false, 'response allowlist'],
    ['Profile', { id: u, displayName: 'Synthetic', personalWorkspaceId: w, version: 1 }, true, 'self profile'],
    ['Error', { error: { code: 'NOT_FOUND', messageKey: 'errors.notFound', requestId: u, retryable: false } }, true, 'safe error'],
    ['Error', { error: { code: 'ENTITY_DELETED', messageKey: 'errors.entityDeleted', requestId: u, retryable: false } }, true, 'owned tombstone conflict'],
    ['Error', { error: { code: 'SYNC_RESET_REQUIRED', messageKey: 'errors.syncResetRequired', requestId: u, retryable: false } }, true, 'explicit sync rebootstrap'],
    ['Error', { error: { code: 'RAW_SQL_FAILURE', messageKey: 'errors.unavailable', requestId: u, retryable: true } }, false, 'unknown provider error rejected'],
    ['Error', { error: { code: 'NOT_FOUND', messageKey: 'errors.notFound', requestId: u, retryable: false, actualOwnerId: w } }, false, 'no owner disclosure in error'],
  ];
  const results = cases.map(([definition, data, expected, name], i) => {
    // A JSON transport drops undefined fields; fixtures model bytes received by API.
    const input = JSON.parse(JSON.stringify(data));
    const validate = ajv.getSchema(`${schema.$id}#/definitions/${definition}`);
    if (!validate) throw new Error(`Missing schema ${definition}`);
    const actual = validate(input);
    const id = `DTO-${String(i + 1).padStart(2, '0')}`;
    if (actual !== expected) errors.push(`${id}: ${name}; expected valid=${expected}, actual=${actual}`);
    return { id, definition, name, expectedValid: expected, result: actual === expected ? 'PASS' : 'FAIL' };
  });
  const documents = new Map([
    ['personal-api.schema.json', schema], ['personal-api.openapi.json', api],
  ]);
  let refs = 0;
  function resolve(ref, sourceName) {
    const [filePart, fragment = ''] = ref.split('#');
    const file = filePart || sourceName;
    const root = documents.get(file);
    if (!root || (fragment && !fragment.startsWith('/'))) throw new Error(`Unsupported reference ${ref}`);
    let current = root;
    for (const part of fragment.split('/').slice(1)) {
      const key = part.replace(/~1/g, '/').replace(/~0/g, '~');
      if (!current || !Object.hasOwn(current, key)) throw new Error(`Broken reference ${ref}`);
      current = current[key];
    }
    refs += 1;
    return current;
  }
  function walk(value, source) {
    if (!value || typeof value !== 'object') return;
    if (typeof value.$ref === 'string') resolve(value.$ref, source);
    for (const child of Object.values(value)) walk(child, source);
  }
  for (const [name, data] of documents) walk(data, name);
  const operationIds = [];
  for (const [route, item] of Object.entries(api.paths)) {
    for (const method of ['get', 'post', 'patch', 'delete', 'put']) {
      const op = item[method];
      if (!op) continue;
      operationIds.push(op.operationId);
      if (op.security?.length === 0) errors.push(`Unauthenticated private operation ${op.operationId}`);
      if (['post', 'patch', 'delete', 'put'].includes(method)) {
        const parameters = [...(item.parameters ?? []), ...(op.parameters ?? [])].map((p) => p.$ref ? resolve(p.$ref, 'personal-api.openapi.json') : p);
        if (!parameters.some((p) => p.name === 'Idempotency-Key' && p.required)) errors.push(`Missing idempotency: ${op.operationId}`);
      }
      for (const match of route.matchAll(/\{([^}]+)\}/g)) {
        const parameters = [...(item.parameters ?? []), ...(op.parameters ?? [])].map((p) => p.$ref ? resolve(p.$ref, 'personal-api.openapi.json') : p);
        if (!parameters.some((p) => p.in === 'path' && p.name === match[1] && p.required)) errors.push(`Missing path parameter: ${route}`);
      }
    }
  }
  assert.equal(api.openapi, '3.1.1');
  assert.deepEqual(api.security, [{ UserBearer: [] }]);
  assert.equal(operationIds.length, 14);
  assert.equal(new Set(operationIds).size, 14);
  const sql = fs.readFileSync(path.join(contractDir, 'personal-core.sql'), 'utf8');
  const tables = [...sql.matchAll(/create table df_private\.(\w+)/g)].map((m) => m[1]);
  assert.equal(tables.length, 9);
  assert.equal(new Set(tables).size, 9);
  assert.ok(sql.includes("current_setting('deepfocus.contract_sandbox', true)"));
  const statementsWithoutComments = sql.replace(/--[^\n]*/g, '');
  assert.ok(!/grant[^;]*\bto\s+(?:public|anon|authenticated)\b/i.test(statementsWithoutComments));
  console.log(JSON.stringify({
    status: errors.length ? 'FAIL' : 'PASS',
    scope: 'DTO fixtures, local refs, endpoint metadata and SQL text guard checks ONLY; no SQL/API/auth/RLS execution or full OAS certification.',
    ajvVersion: requireLocal('ajv/package.json').version,
    dtoFixtures: results.length, cursorQueryFixtures: cursorCases.length,
    operations: operationIds.length, resolvedReferences: refs,
    declaredSqlTables: tables.length, errors,
    ...(process.argv.includes('--details') ? { results } : {}),
  }, null, 2));
  process.exitCode = errors.length ? 1 : 0;
} catch (error) {
  console.error(JSON.stringify({ status: 'CHECKER_ERROR', message: error.message }));
  process.exitCode = 2;
}
