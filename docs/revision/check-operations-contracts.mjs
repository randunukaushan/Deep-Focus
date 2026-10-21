// Read-only documentation fixtures. No app imports, provider calls, DB or credential operations.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (name) => fs.readFileSync(path.join(here, name), 'utf8');
const requireLocal = createRequire(path.resolve(here, '../../package.json'));
const errors = [];
const check = (condition, message) => { if (!condition) errors.push(message); };
try {
  const Ajv = requireLocal('ajv');
  const ajv = new Ajv({ allErrors: true, jsonPointers: true, format: 'full' });
  const names = ['personal-api.schema.json', 'backend-extensions.schema.json', 'operations-api.schema.json', 'rewards-ai.schema.json', 'planning.schema.json',
    'personal-api.openapi.json', 'personal-extensions.openapi.json', 'operations-api.openapi.json', 'rewards-ai.openapi.json'];
  const documents = new Map(names.map((name) => [name, JSON.parse(read(`contracts/${name}`))]));
  const schemas = names.filter((name) => name.endsWith('.schema.json')).map((name) => documents.get(name));
  for (const schema of schemas) ajv.addSchema(schema);
  const schema = documents.get('operations-api.schema.json');
  for (const definition of Object.keys(schema.definitions)) {
    check(Boolean(ajv.getSchema(`${schema.$id}#/definitions/${definition}`)), `Compile definition: ${definition}`);
  }
  const a = '10000000-0000-4000-8000-000000000001';
  const b = '20000000-0000-4000-8000-000000000002';
  const at = '2026-09-18T00:00:00.000Z';
  const later = '2026-09-18T00:05:00.000Z';
  const end = '2026-09-19T00:00:00.000Z';
  const settings = { id: a, version: 1, theme: 'system', uiLocale: 'en',
    defaultFocusDurationMinutes: 25, defaultBreakDurationMinutes: 5, aiFeaturesEnabled: false, updatedAt: at };
  const task = { id: a, workspaceId: b, title: 'Synthetic only', description: null, priority: null,
    goalId: null, due: { kind: 'none' }, status: 'pending', version: 1, createdAt: at,
    updatedAt: at, completedAt: null, archivedAt: null };
  const goal = { id: a, workspaceId: b, title: 'Synthetic only', description: null,
    type: 'focus_time', period: 'daily', startsAt: at, endsAt: end, timeZone: 'Asia/Colombo',
    targetValue: 1500000, targetUnit: 'ms', status: 'active', version: 1, createdAt: at, updatedAt: at };
  const session = { id: a, workspaceId: b, taskId: null, taskTitleSnapshot: null, status: 'completed',
    plannedMs: 300000, focusedMs: 300000, pausedMs: 0, startedAt: at, endedAt: later,
    recordedAt: later, verificationState: 'pending', version: 1 };
  const rest = { id: a, focusSessionId: b, startedAt: at, endedAt: later,
    plannedMs: 300000, actualMs: 300000, outcome: 'completed', version: 1, verificationState: 'pending' };
  const reminder = { id: a, taskId: b, scheduledFor: later, timeZone: 'Asia/Colombo',
    enabled: true, delivery: 'local_device', version: 1, updatedAt: at, deletedAt: null };
  const payloads = { task, goal, session, break: rest, settings, reminder };
  const record = (entity) => ({ entity, entityId: a, version: 1, payload: payloads[entity] });
  const change = (entity) => ({ ...record(entity), sequence: '9007199254740993', operation: 'upsert' });
  const outcome = { mutationId: a, command: 'task.patch', targetId: b, status: 'applied',
    receiptId: a, entityVersion: 2, committedThrough: '9' };
  const denied = { mutationId: a, command: 'task.patch', targetId: b, status: 'rejected', code: 'VERSION_CONFLICT' };
  const job = (kind, state = 'queued') => ({ id: a, kind, state, updatedAt: later });
  const snapshot = { snapshotId: a, contractVersion: 1, highWater: '9', createdAt: at,
    expiresAt: later, pageCount: 1, manifestDigest: 'a'.repeat(64), firstPageCursor: 'synthetic-page', resumeCursor: 'synthetic-pull' };
  const snapshotStatus = (state, value) => ({ data: { job: job('sync_snapshot', state), snapshot: value } });
  const page = { data: [record('task')], meta: { snapshotId: a, pageIndex: 0, pageCount: 1,
    highWater: '9', pageDigest: 'b'.repeat(64), nextCursor: null } };
  const pull = { data: [change('task')], meta: { nextCursor: 'synthetic-continue', caughtUp: true, highWater: '9007199254740993' } };
  const challenge = { data: { challengeId: a, jobId: b, consequencesVersion: 'synthetic-v1', expiresAt: later,
    statusReceipt: { credential: 's'.repeat(43), expiresAt: end } } };
  const entitlement = { grantId: a, licenseId: b, capability: 'synthetic.planning', scopeType: 'personal', scopeId: a,
    state: 'active', validUntil: later, source: 'web_provider', checkedAt: at, catalogVersion: 'synthetic-only' };
  const rights = { data: { status: 'current', checkedAt: at, catalogVersion: 'synthetic-only', entitlements: [entitlement] }, meta: { nextCursor: null } };
  const unknownRights = { data: { status: 'unavailable', checkedAt: null, catalogVersion: null, entitlements: null }, meta: { nextCursor: null } };
  // Arbitrary synthetic values test serialization, not actual offers, prices, currency support or approval.
  const offer = { id: 'synthetic-offer', catalogVersion: 'synthetic-only', title: 'Synthetic fixture',
    scopeType: 'personal', capabilities: ['synthetic.planning'], purchaseType: 'subscription',
    intervalUnit: 'month', intervalCount: 1, disclosureVersion: 'synthetic-only',
    price: { currency: 'USD', amountMinor: '123', fractionDigits: 2, displayText: 'Synthetic only',
      source: 'web_provider', checkedAt: at, expiresAt: later } };
  const catalog = { data: { status: 'ready', surface: 'web', catalogVersion: 'synthetic-only', checkedAt: at, offers: [offer] }, meta: { nextCursor: null } };
  const noCatalog = { data: { status: 'unconfigured', surface: 'web', catalogVersion: null, checkedAt: null, offers: null }, meta: { nextCursor: null } };
  const link = { data: { licenseId: a, url: 'https://provider.example.invalid/manage/synthetic', expiresAt: later } };
  const fixtures = [];
  const add = (definition, input, expected, label) => fixtures.push({ definition, input, expected, label });
  for (const entity of Object.keys(payloads)) {
    add('SnapshotRecord', record(entity), true, `${entity} snapshot shape`);
    add('SyncChange', change(entity), true, `${entity} upsert shape`);
    add('SyncChange', { ...change(entity), payload: { ...payloads[entity], resourceUri: 'synthetic-local-only' } }, false, `${entity} excludes local resource fields`);
    add('SnapshotRecord', { ...record(entity), ownerId: b }, false, `${entity} excludes internal owner field`);
  }
  for (const entity of ['task', 'goal', 'reminder']) {
    add('SyncChange', { sequence: '9', entity, entityId: a, version: 2, operation: 'delete', payload: null }, true, `${entity} tombstone`);
  }
  add('SyncChange', { ...change('task'), payload: settings }, false, 'entity and payload type mismatch');
  add('SyncChange', { ...change('task'), payload: { ...task, id: b } }, true, 'ID equality needs semantic validation');
  add('SyncChange', { ...change('settings'), operation: 'delete', payload: null }, false, 'no arbitrary settings deletion command');
  add('SyncChange', { ...change('task'), operation: 'delete' }, false, 'tombstone cannot carry content');
  add('SyncChange', { ...change('task'), sequence: 9007199254740992 }, false, 'sequence not numeric');
  add('SnapshotRecord', { ...record('task'), entity: 'billing' }, false, 'no billing in generic snapshot');
  add('SnapshotRecord', { ...record('task'), entity: 'resource' }, false, 'no resource sync');
  add('SyncOutcome', outcome, true, 'committed result');
  add('SyncOutcome', { ...outcome, status: 'replayed' }, true, 'replayed result');
  add('SyncOutcome', denied, true, 'rejected command');
  add('SyncOutcome', { ...denied, status: 'retryable', code: 'DEPENDENCY_UNAVAILABLE', retryAfterSeconds: 1 }, true, 'bounded retry metadata');
  add('SyncOutcome', { ...denied, receiptId: a }, false, 'failure cannot fabricate receipt');
  add('SyncOutcome', { ...outcome, code: 'NOT_FOUND' }, false, 'success cannot include failure code');
  add('SyncOutcome', { ...denied, status: 'retryable', retryAfterSeconds: 0 }, false, 'positive retry delay');
  add('SyncPushResponse', { data: { outcomes: [outcome, denied] } }, true, 'partial batch results');
  add('SyncPushResponse', { data: { outcomes: [] } }, false, 'nonempty push outcomes');
  add('SyncPushResponse', { data: { outcomes: Array(26).fill(outcome) } }, false, 'batch result bound');
  add('SyncPullResponse', pull, true, 'caught-up has next polling cursor');
  add('SyncPullResponse', { data: [], meta: { ...pull.meta } }, true, 'empty caught-up poll');
  add('SyncPullResponse', { ...pull, meta: { ...pull.meta, nextCursor: null } }, false, 'caught-up does not discard cursor');
  add('SyncPullResponse', { ...pull, data: Array(101).fill(change('task')) }, false, 'pull result bound');
  add('SnapshotStatusResponse', snapshotStatus('queued', null), true, 'queued has no fabricated snapshot');
  add('SnapshotStatusResponse', snapshotStatus('succeeded', snapshot), true, 'ready metadata');
  add('SnapshotStatusResponse', snapshotStatus('succeeded', null), false, 'ready requires metadata');
  add('SnapshotStatusResponse', snapshotStatus('running', snapshot), false, 'running cannot expose partial snapshot');
  add('SnapshotStatusResponse', snapshotStatus('expired', null), true, 'expired explicit state');
  add('SnapshotMeta', { ...snapshot, pageCount: 0 }, false, 'empty account still has one page');
  add('SnapshotMeta', { ...snapshot, manifestDigest: 'not-a-hash' }, false, 'digest shape');
  add('SnapshotPageResponse', page, true, 'typed page');
  add('SnapshotPageResponse', { ...page, data: [] }, true, 'empty snapshot page');
  add('SnapshotPageResponse', { ...page, data: Array(101).fill(record('task')) }, false, 'snapshot page bound');
  add('SnapshotPageQuery', { cursor: 'synthetic-page' }, true, 'bound page cursor');
  add('SnapshotPageQuery', { cursor: 'synthetic-page', offset: 100 }, false, 'no arbitrary offset');
  add('SnapshotJobResponse', { data: job('export') }, false, 'snapshot endpoint cannot return export');
  add('ExportJobResponse', { data: job('export') }, true, 'accepted export job');
  add('PrivacyJobResponse', { data: job('sync_snapshot') }, false, 'privacy route cannot expose snapshot job');
  add('DeletionJobResponse', { data: job('deletion', 'succeeded') }, true, 'coarse deletion status');
  add('DeletionJobResponse', { data: { ...job('deletion'), accountEmail: 'synthetic@example.invalid' } }, false, 'no account content in receipt result');
  add('DeletionJobResponse', { data: job('export') }, false, 'receipt cannot read export status');
  add('Job', { ...job('export', 'failed'), safeErrorCode: 'DEPENDENCY_UNAVAILABLE' }, true, 'allowlisted job error');
  add('Job', { ...job('export', 'failed'), safeErrorCode: 'secret_provider_exception' }, false, 'no raw provider error');
  add('DeletionChallengeResponse', challenge, true, 'pre-issued reserved status credential');
  add('DeletionChallengeResponse', { data: { ...challenge.data, statusReceipt: { credential: 'short', expiresAt: end } } }, false, 'credential minimum shape');
  add('DeletionChallengeResponse', { data: { ...challenge.data, ownerId: a } }, false, 'no independent owner override');
  add('ExportDownloadResponse', { data: { jobId: a, url: 'https://download.example.invalid/synthetic', expiresAt: later } }, true, 'synthetic HTTPS grant');
  add('ExportDownloadResponse', { data: { jobId: a, url: 'http://download.example.invalid/synthetic', expiresAt: later } }, false, 'download needs HTTPS');
  add('AccountSessionsResponse', { data: [{ id: a, displayLabel: 'Synthetic device', current: true, state: 'active', createdAt: at, lastSeenAt: later }], meta: { nextCursor: null } }, true, 'coarse owned session registry');
  add('AccountSession', { id: a, displayLabel: 'Synthetic', current: true, state: 'active', createdAt: at, lastSeenAt: later, refreshToken: 'synthetic-forbidden' }, false, 'no refresh token output');
  add('RevokeSessionsRequest', { scope: 'one', sessionId: a }, true, 'one own session');
  add('RevokeSessionsRequest', { scope: 'others' }, true, 'other own sessions');
  add('RevokeSessionsRequest', { scope: 'all' }, true, 'all own sessions');
  add('RevokeSessionsRequest', { scope: 'all', sessionId: a }, false, 'scope selection unambiguous');
  add('RevokeSessionsRequest', { scope: 'one' }, false, 'one requires ID');
  add('RevokeSessionsRequest', { scope: 'all', ownerId: b }, false, 'no revoking someone else');
  add('RevokeSessionsResponse', { data: { revokedCount: 1, currentSessionRevoked: true, providerRevocationStatus: 'pending' } }, true, 'registry versus provider state');
  add('EntitlementsResponse', rights, true, 'authoritative current rights');
  add('EntitlementsResponse', unknownRights, true, 'unknown rights are null');
  add('EntitlementsResponse', { ...unknownRights, data: { ...unknownRights.data, entitlements: [] } }, false, 'unavailable is not free');
  add('EntitlementsResponse', { ...rights, data: { ...rights.data, checkedAt: null } }, false, 'current needs freshness');
  add('EntitlementsResponse', { ...unknownRights, meta: { nextCursor: 'stale-page' } }, false, 'unavailable has no continuation');
  add('Entitlement', { ...entitlement, premium: true }, false, 'no boolean grant bypass');
  add('Entitlement', { ...entitlement, licenseId: null, source: 'organization' }, true, 'non-owned sponsoring license not exposed');
  add('Entitlement', { ...entitlement, grantId: null }, false, 'stable grant identity required');
  add('Entitlement', { ...entitlement, licenseId: 'store-secret-receipt' }, false, 'license is app UUID not purchase secret');
  add('CatalogQuery', { surface: 'ios', limit: 100 }, true, 'surface is display hint');
  add('CatalogQuery', { surface: 'web', ownerId: a }, false, 'no catalog owner override');
  add('CatalogQuery', { surface: 'web', price: 0 }, false, 'no client-selected price');
  add('CatalogResponse', catalog, true, 'synthetic ready catalog');
  add('CatalogResponse', noCatalog, true, 'unconfigured is explicit');
  add('CatalogResponse', { ...noCatalog, data: { ...noCatalog.data, offers: [] } }, false, 'unconfigured cannot masquerade as published empty catalog');
  add('CatalogResponse', { ...catalog, data: { ...catalog.data, offers: null } }, false, 'ready cannot have null offers');
  add('Price', { ...offer.price, amountMinor: 123 }, false, 'money amount is integer string');
  add('Price', { ...offer.price, amountMinor: '1.23' }, false, 'no fractional minor units');
  add('Price', { ...offer.price, amountMinor: '-1' }, false, 'no negative charge');
  add('Price', { ...offer.price, currency: 'usd' }, false, 'canonical currency syntax');
  add('Offer', { ...offer, purchaseType: 'one_time', intervalUnit: null, intervalCount: null }, true, 'one-time has no recurring interval');
  add('Offer', { ...offer, purchaseType: 'one_time' }, false, 'no one-time with recurring terms');
  add('Offer', { ...offer, intervalUnit: null }, false, 'subscription needs interval');
  add('ManagementLinkRequest', { licenseId: a }, true, 'owned license lookup only');
  add('ManagementLinkRequest', { licenseId: a, returnUrl: 'https://example.invalid' }, false, 'no client destination');
  add('ManagementLinkResponse', link, true, 'synthetic HTTPS destination');
  add('ManagementLinkResponse', { data: { ...link.data, url: 'javascript:synthetic' } }, false, 'no executable URL');
  add('ManagementLinkResponse', { data: { ...link.data, url: 'https://unapproved.example.invalid/' } }, true, 'host approval requires semantic allowlist');
  const results = fixtures.map(({ definition, input, expected, label }, index) => {
    const validate = ajv.getSchema(`${schema.$id}#/definitions/${definition}`);
    const actual = Boolean(validate(input));
    check(actual === expected, `${definition}: ${label}; expected ${expected}; got ${actual}`);
    return { id: `OPS-${String(index + 1).padStart(3, '0')}`, definition, label, pass: actual === expected };
  });

  const aliases = new Map(schemas.map((s) => [s.$id, names.find((n) => documents.get(n) === s)]));
  let references = 0;
  function resolve(ref, source) {
    const [file, fragment = ''] = ref.split('#');
    const name = aliases.get(file) ?? (file || source);
    let value = documents.get(name);
    if (!value || (fragment && !fragment.startsWith('/'))) throw new Error(`Unknown reference ${ref}`);
    for (const part of fragment.split('/').slice(1)) {
      const key = part.replace(/~1/g, '/').replace(/~0/g, '~');
      if (!value || !Object.hasOwn(value, key)) throw new Error(`Broken reference ${ref}`);
      value = value[key];
    }
    references++;
    return { value, source: name };
  }
  function dereference(value, source) {
    for (let i = 0; value?.$ref; i++) {
      if (i > 32) throw new Error('Reference depth exceeded');
      ({ value, source } = resolve(value.$ref, source));
    }
    return { value, source };
  }
  function walk(value, source) {
    if (!value || typeof value !== 'object') return;
    if (value.$ref) resolve(value.$ref, source);
    for (const child of Object.values(value)) walk(child, source);
  }
  for (const [name, doc] of documents) walk(doc, name);
  const inventory = [...read('16-BACKEND-EXTENSIONS-AND-OPERATIONS.md').matchAll(/^\| (EX-\d{2}) \| `([A-Z]+) ([^`]+)` \|/gm)];
  const expected = {
    'EX-12': ['200', 'SyncPushResponse', 'backend-extensions.schema.json#/definitions/SyncPush'],
    'EX-13': ['200', 'SyncPullResponse', null],
    'EX-14': ['202', 'SnapshotJobResponse', 'operations-api.schema.json#/definitions/Empty'],
    'EX-15': ['200', 'SnapshotStatusResponse', null],
    'EX-16': ['200', 'SnapshotPageResponse', null],
    'EX-21': ['202', 'ExportJobResponse', 'backend-extensions.schema.json#/definitions/ExportRequest'],
    'EX-22': ['200', 'PrivacyJobResponse', null],
    'EX-23': ['200', 'ExportDownloadResponse', 'operations-api.schema.json#/definitions/Empty'],
    'EX-24': ['201', 'DeletionChallengeResponse', 'operations-api.schema.json#/definitions/Empty'],
    'EX-25': ['202', 'DeletionJobResponse', 'backend-extensions.schema.json#/definitions/DeletionRequest'],
    'EX-26': ['200', 'AccountSessionsResponse', null],
    'EX-27': ['200', 'RevokeSessionsResponse', 'operations-api.schema.json#/definitions/RevokeSessionsRequest'],
    'EX-28': ['200', 'EntitlementsResponse', null],
    'EX-29': ['200', 'CatalogResponse', null],
    'EX-30': ['200', 'ManagementLinkResponse', 'operations-api.schema.json#/definitions/ManagementLinkRequest'],
  };
  const pairs = new Set(); const operationIds = new Set(); const registryIds = new Set(); const selected = [];
  for (const name of names.filter((n) => n.endsWith('.openapi.json'))) {
    const api = documents.get(name);
    check(JSON.stringify(api.security) === JSON.stringify([{ UserBearer: [] }]), `Root auth: ${name}`);
    check(api.openapi === '3.1.1' && api.servers.length === 1 && api.servers[0].url === '/v1', `API version/base: ${name}`);
    for (const [route, item] of Object.entries(api.paths)) for (const method of ['get', 'post', 'patch', 'delete', 'put', 'head', 'options', 'trace']) {
      const op = item[method]; if (!op) continue;
      const pair = `${method.toUpperCase()} ${route}`;
      check(!pairs.has(pair) && op.operationId && !operationIds.has(op.operationId), `Duplicate/missing operation: ${pair}`);
      pairs.add(pair); operationIds.add(op.operationId);
      const id = op['x-registry-id'];
      if (id) { check(!registryIds.has(id), `Duplicate registry ID ${id}`); registryIds.add(id); }
      const auth = op.security ?? api.security;
      check(JSON.stringify(auth) === JSON.stringify(id === 'EX-22' ? [{ UserBearer: [] }, { DeletionStatusReceipt: [] }] : [{ UserBearer: [] }]), `Private auth weakened: ${pair}`);
      if (name !== 'operations-api.openapi.json') continue;
      selected.push(id);
      const row = inventory.find((r) => r[1] === id);
      check(Boolean(row) && `${row[2]} ${row[3]}` === pair, `Inventory mismatch ${id}`);
      const parameters = [...(item.parameters ?? []), ...(op.parameters ?? [])].map((p) => dereference(p, name).value);
      check(new Set(parameters.map((p) => `${p.in}:${p.name}`)).size === parameters.length, `Duplicate parameter ${id}`);
      for (const match of route.matchAll(/\{([^}]+)\}/g)) check(parameters.some((p) => p.name === match[1] && p.in === 'path' && p.required), `Path parameter ${id}`);
      const [status, responseName, requestRef] = expected[id] ?? [];
      const response = dereference(op.responses?.[status], name);
      check(response.value?.content?.['application/json']?.schema?.$ref === `operations-api.schema.json#/definitions/${responseName}`, `Success mapping ${id}`);
      check(dereference(op.responses?.default, name).value?.content?.['application/json']?.schema?.$ref === 'personal-api.schema.json#/definitions/Error', `Error mapping ${id}`);
      if (method === 'post') {
        check(parameters.some((p) => p.name === 'Idempotency-Key' && p.in === 'header' && p.required), `Idempotency key ${id}`);
        const body = dereference(op.requestBody, name).value;
        check(body?.required && body.content?.['application/json']?.schema?.$ref === requestRef, `Request mapping ${id}`);
      } else check(!op.requestBody && requestRef === null, `Read cannot take a mutation body ${id}`);
      const query = parameters.filter((p) => p.in === 'query');
      const querySchema = op['x-query-schema'] ? dereference({ $ref: op['x-query-schema'] }, name).value : { properties: {} };
      check(JSON.stringify(query.map((p) => p.name).sort()) === JSON.stringify(Object.keys(querySchema.properties).sort()), `Query fields ${id}`);
      for (const p of query) {
        check(Boolean(p.required) === Boolean(querySchema.required?.includes(p.name)), `Required query ${id}/${p.name}`);
        const actual = dereference(p.schema, name).value;
        const querySource = op['x-query-schema'].split('#')[0];
        const expectedQuery = dereference(querySchema.properties[p.name], querySource).value;
        check(JSON.stringify(actual) === JSON.stringify(expectedQuery), `Query bounds ${id}/${p.name}`);
      }
      check(Boolean(op['x-recent-auth-required']) === ['EX-21', 'EX-23', 'EX-24', 'EX-25', 'EX-27'].includes(id), `Recent auth marker ${id}`);
      check(Boolean(op['x-sensitive-response']) === ['EX-23', 'EX-24', 'EX-30'].includes(id), `Sensitive response marker ${id}`);
      if (id === 'EX-22') check(op['x-receipt-response-schema'] === 'operations-api.schema.json#/definitions/DeletionJobResponse', 'Receipt-only response narrowed');
    }
  }
  check(JSON.stringify(selected.sort()) === JSON.stringify(Object.keys(expected).sort()), 'Exactly fifteen operations in operations slice');
  check(pairs.size === 47 && operationIds.size === 47 && registryIds.size === 33, 'Expected 47 unique operations / 33 covered extension IDs');
  const remaining = inventory.filter((r) => !registryIds.has(r[1])).map((r) => r[1]);
  check(remaining.length === 0, 'All extension inventory operations now covered across four slices; not the full V1 API');

  // Tiny semantic references, not production serializers, cursors, DB ordering or auth tests.
  const validChangeIdentity = (c) => c.operation === 'delete' ? c.payload === null
    : c.entityId === c.payload.id && c.version === c.payload.version;
  const inBigintRange = (s) => typeof s === 'string' && /^(0|[1-9][0-9]{0,18})$/.test(s) && BigInt(s) <= 9223372036854775807n;
  const semanticCases = [
    [validChangeIdentity(change('task')), true],
    [validChangeIdentity({ ...change('task'), payload: { ...task, id: b } }), false],
    [validChangeIdentity({ ...change('task'), version: 2 }), false],
    [inBigintRange('9007199254740993'), true], [inBigintRange('9223372036854775807'), true],
    [inBigintRange('9223372036854775808'), false], [inBigintRange('01'), false], [inBigintRange(9), false],
  ];
  semanticCases.forEach(([actual, expectedValue], i) => check(actual === expectedValue, `Semantic reference ${i + 1}`));
  console.log(JSON.stringify({ status: errors.length ? 'FAIL' : 'PASS',
    scope: 'Documentation DTOs, references, wire metadata and small semantic references only; NOT runtime/auth/SQL/provider tests or full OAS certification',
    definitions: Object.keys(schema.definitions).length, dtoFixtures: fixtures.length, semanticReferenceCases: semanticCases.length,
    operations: selected.length, combinedOperations: pairs.size, remainingExtensionIds: remaining,
    resolvedReferences: references, errors, ...(process.argv.includes('--details') ? { results } : {}),
  }, null, 2));
  process.exitCode = errors.length ? 1 : 0;
} catch (error) {
  console.error(JSON.stringify({ status: 'CHECKER_ERROR', message: error.message }));
  process.exitCode = 2;
}
