// Documentation fixtures only: no provider calls, database writes or application imports.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (file) => fs.readFileSync(path.join(here, file), 'utf8');
const requireLocal = createRequire(path.resolve(here, '../../package.json'));
const errors = [];
const assert = (condition, label) => { if (!condition) errors.push(label); };
try {
  const Ajv = requireLocal('ajv');
  const ajv = new Ajv({ allErrors: true, jsonPointers: true, format: 'full' });
  const core = JSON.parse(read('contracts/personal-api.schema.json'));
  const extension = JSON.parse(read('contracts/backend-extensions.schema.json'));
  const web = JSON.parse(read('contracts/web-surfaces.json'));
  ajv.addSchema(core); ajv.addSchema(extension);
  // Compile every definition, including those not exercised by a particular fixture.
  for (const name of Object.keys(extension.definitions)) {
    assert(Boolean(ajv.getSchema(`${extension.$id}#/definitions/${name}`)), `Unresolved definition: ${name}`);
  }
  const a = '10000000-0000-4000-8000-000000000001';
  const b = '20000000-0000-4000-8000-000000000002';
  const at = '2026-09-16T00:00:00.000Z';
  const later = '2026-09-16T00:05:00.000Z';
  const title = { id: a, workspaceId: b, title: 'Prepare own resource' };
  const goal = { ...title, type: 'focus_time', period: 'daily', startsAt: at,
    endsAt: '2026-09-17T00:00:00.000Z', timeZone: 'Asia/Colombo', targetValue: 1500000, targetUnit: 'ms' };
  const version = { expectedVersion: 1 };
  const reminder = { id: a, taskId: b, scheduledFor: later, timeZone: 'Asia/Colombo', delivery: 'local_device' };
  const rest = { id: a, focusSessionId: b, startedAt: at, endedAt: later, plannedMs: 300000, outcome: 'completed' };
  const proposal = { expectedProposalVersion: 1, reviewDigest: 'a'.repeat(64), selectedOperationIds: [a] };
  const settings = { id: a, version: 1, theme: 'system', uiLocale: 'en',
    defaultFocusDurationMinutes: 25, defaultBreakDurationMinutes: 5,
    aiFeaturesEnabled: false, updatedAt: at };
  const period = { start: at, end: later, timeZone: 'Asia/Colombo' };
  const meta = { status: 'current', asOf: later, sourceSequence: '0', ruleVersion: 'synthetic-fixture-only' };
  const totals = { verifiedFocusMs: 0, completedSessionCount: 0, completedTaskCount: 0 };
  const noSnapshot = { status: 'unavailable', asOf: null, sourceSequence: null, ruleVersion: null };
  const analytics = (metadata, summary) => ({ data: { period, meta: metadata, summary } });
  const breakResult = { ...rest, actualMs: 300000, version: 1, verificationState: 'verified' };
  const reminderResult = { ...reminder, enabled: true, version: 1, updatedAt: at, deletedAt: null };
  const page = (data, nextCursor = null) => ({ data, meta: { nextCursor } });
  const deletion = (entity) => ({ data: {
    tombstone: { id: a, entity, version: 2, deletedAt: later },
    receipt: { receiptId: b, mutationId: b, command: `${entity}.delete`, targetId: a, entityVersion: 2, committedThrough: '9' },
  } });
  const commandBodies = {
    'task.create': title,
    'task.patch': { ...version, title: 'Changed title' },
    'task.action': { id: a, ...version, action: 'complete', occurredAt: at },
    'task.delete': version,
    'goal.create': goal,
    'goal.patch': { ...version, description: null },
    'goal.delete': version,
    'session.start': { id: a, workspaceId: b, plannedMs: 1500000, startedAt: at },
    'session.event': { id: a, ...version, type: 'pause', occurredAt: later, clientSequence: 1 },
    'break.record': rest,
    'settings.patch': { ...version, theme: 'dark' },
    'reminder.create': reminder,
    'reminder.patch': { ...version, enabled: false },
    'reminder.delete': version,
  };
  const mutation = (command, body) => ({ mutationId: b, command, targetId: a, body });
  const cases = [];
  for (const [command, body] of Object.entries(commandBodies)) {
    cases.push(['SyncMutation', mutation(command, body), true, `${command} strict body`]);
    cases.push(['SyncMutation', mutation(command, { ...body, ownerId: b }), false, `${command} rejects owner injection`]);
  }
  cases.push(
    ['AccountSettingsPatch', { ...version, theme: 'system', uiLocale: 'si-LK' }, true, 'locale syntax only, not release support'],
    ['AccountSettingsPatch', version, false, 'empty settings patch'],
    ['AccountSettingsPatch', { ...version, personalPhrases: ['Private'] }, false, 'phrases not account allowlist'],
    ['AccountSettingsPatch', { ...version, notificationPermission: 'granted' }, false, 'no device permission from portal'],
    ['AccountSettingsPatch', { ...version, defaultFocusDurationMinutes: 0 }, false, 'positive focus duration'],
    ['AccountSettingsPatch', { ...version, defaultBreakDurationMinutes: 7 }, false, 'break enum'],
    ['GoalPatch', { ...version, targetValue: 100 }, false, 'no silent historic goal retargeting'],
    ['GoalPatch', { ...version, title: ' ' }, false, 'blank goal title'],
    ['BreakRecord', { ...rest, xp: 9 }, false, 'no rest reward injection'],
    ['BreakRecord', { ...rest, outcome: 'skipped' }, false, 'skip has no fabricated completed break'],
    ['ReminderCreate', { ...reminder, delivery: 'all_devices' }, false, 'no all-device implicit scheduling'],
    ['SyncPush', { contractVersion: 1, items: [mutation('task.create', title)] }, true, 'push shape'],
    ['SyncPush', { contractVersion: 1, items: [] }, false, 'empty batch'],
    ['SyncPush', { contractVersion: 1, items: Array.from({ length: 26 }, () => mutation('task.create', title)) }, false, 'batch bound'],
    ['SyncMutation', mutation('reward.grant', { amount: 999 }), false, 'no reward command'],
    ['SyncMutation', mutation('task.create', { ...title, resourceUri: 'synthetic-local-reference' }), false, 'no local resource transmission'],
    ['SyncPull', { cursor: 'opaque-test-only', limit: 100 }, true, 'pull boundary'],
    ['SyncPull', { cursor: 'opaque-test-only', limit: 101 }, false, 'pull bound'],
    ['Sequence', '9007199254740993', true, 'sequence above Number precision retained as string'],
    ['Sequence', 9007199254740992, false, 'sequence must not be numeric'],
    ['Sequence', '01', false, 'canonical decimal sequence'],
    ['ExportRequest', { format: 'json', scope: 'own_account_data' }, true, 'own JSON export'],
    ['ExportRequest', { format: 'json', scope: 'all_users' }, false, 'no expanded export scope'],
    ['DeletionRequest', { challengeId: a, acknowledgedConsequencesVersion: 'review-1' }, true, 'challenge shape only'],
    ['DeletionRequest', { challengeId: a, acknowledgedConsequencesVersion: 'review-1', ownerId: b }, false, 'no target-owner deletion override'],
    ['ProposalConfirmation', proposal, true, 'reviewed subset shape'],
    ['ProposalConfirmation', { ...proposal, selectedOperationIds: [a, a] }, false, 'duplicate selection'],
    ['ProposalConfirmation', { ...proposal, reviewDigest: 'client-says-approved' }, false, 'digest shape'],
    ['ProposalConfirmation', { ...proposal, operations: [{ action: 'delete_account' }] }, false, 'no unreviewed arbitrary operation'],
    ['Job', { id: a, kind: 'export', state: 'queued', updatedAt: at }, true, 'safe job status'],
    ['Job', { id: a, kind: 'export', state: 'succeeded', updatedAt: at, serviceKey: 'synthetic-forbidden-field' }, false, 'job output allowlist'],
    ['AccountSettingsResponse', { data: settings }, true, 'strict account settings response'],
    ['AccountSettingsResponse', { data: { ...settings, hapticsEnabled: true } }, false, 'no device-only response field'],
    ['AccountSettingsResponse', { data: { ...settings, version: null } }, false, 'settings version required'],
    ['AccountSettingsResponse', { data: { ...settings, defaultBreakDurationMinutes: 7 } }, false, 'response shares break enum'],
    ['AccountSettingsResponse', { data: { ...settings, defaultFocusDurationMinutes: 0 } }, false, 'response positive duration'],
    ['AccountSettingsResponse', { data: settings, token: 'synthetic-forbidden' }, false, 'no secret top-level field'],
    ['AccountSettingsPatch', { ...version, ordinaryEarlyExitEnabled: false }, false, 'commitment not silently cloud enabled'],
    ['AccountSettingsPatch', { ...version, defaultFocusDurationMinutes: 1440 }, true, 'shape limit is not product range approval'],
    ['AnalyticsSummaryResponse', analytics(meta, totals), true, 'genuine current empty period'],
    ['AnalyticsSummaryResponse', analytics({ ...meta, status: 'stale' }, totals), true, 'stale snapshot metadata'],
    ['AnalyticsSummaryResponse', analytics({ ...meta, status: 'pending' }, totals), true, 'pending known snapshot'],
    ['AnalyticsSummaryResponse', analytics(noSnapshot, null), true, 'unavailable has null not zero totals'],
    ['AnalyticsSummaryResponse', analytics(noSnapshot, totals), false, 'unavailable cannot fabricate zero snapshot'],
    ['AnalyticsSummaryResponse', analytics(meta, null), false, 'current cannot claim null snapshot'],
    ['AnalyticsSummaryResponse', analytics({ ...meta, asOf: null }, totals), false, 'current needs freshness instant'],
    ['AnalyticsSummaryResponse', analytics({ ...noSnapshot, sourceSequence: '0' }, null), false, 'unavailable metadata is explicitly unknown'],
    ['AnalyticsSummaryResponse', analytics(meta, { ...totals, verifiedFocusMs: -1 }), false, 'negative focus rejected'],
    ['AnalyticsSummaryResponse', analytics(meta, { ...totals, completedSessionCount: 0.5 }), false, 'fractional count rejected'],
    ['AnalyticsSummaryResponse', analytics(meta, { ...totals, burnoutRisk: 0.9 }), false, 'no health inference output'],
    ['AnalyticsSummaryResponse', analytics({ ...meta, sourceSequence: 0 }, totals), false, 'sequence remains a string'],
    ['AnalyticsSummaryResponse', analytics(meta, { ...totals, verifiedFocusMs: Number.MAX_SAFE_INTEGER + 1 }), false, 'unsafe total rejected'],
    ['AnalyticsQuery', { ...period, ownerId: a }, false, 'no client analytics owner override'],
    ['AnalyticsQuery', { ...period, start: 'not-a-date' }, false, 'invalid query timestamp'],
    ['AnalyticsQuery', { ...period, start: later, end: at }, true, 'ordering requires service validation, not proven here'],
    ['AnalyticsQuery', { ...period, timeZone: 'not-a-zone' }, true, 'zone catalog requires semantic validator'],
    ['ListQuery', {}, true, 'empty list query uses documented defaults'],
    ['ListQuery', { cursor: '', limit: 50 }, false, 'empty cursor is not a restart token'],
    ['ListQuery', { limit: 0 }, false, 'positive page size'],
    ['ListQuery', { limit: 101 }, false, 'page size upper bound'],
    ['ListQuery', { ownerId: a }, false, 'no list owner injection'],
    ['BreakResponse', { data: breakResult }, true, 'strict break output'],
    ['BreakResponse', { data: { ...breakResult, actualMs: -1 } }, false, 'no negative rest duration'],
    ['BreakResponse', { data: { ...breakResult, actualMs: 0.5 } }, false, 'integer rest milliseconds'],
    ['BreakResponse', { data: { ...breakResult, actualMs: 86400001 } }, false, 'defensive rest shape ceiling'],
    ['BreakResponse', { data: { ...breakResult, verificationState: 'physically_proven' } }, false, 'no invented verification claim'],
    ['BreakResponse', { data: { ...breakResult, xpEarned: 100 } }, false, 'no focus reward from rest output'],
    ['BreakResponse', { data: { ...breakResult, ownerId: a } }, false, 'no internal owner field'],
    ['BreakListResponse', page([]), true, 'empty break history is an explicit page'],
    ['BreakListResponse', page([breakResult], 'synthetic-cursor'), true, 'nonterminal history page'],
    ['BreakListResponse', page(Array(101).fill(breakResult)), false, 'break page bound'],
    ['BreakListResponse', page([], ''), false, 'end cursor must be null not empty'],
    ['BreakListResponse', { data: [] }, false, 'history page metadata required'],
    ['ReminderResponse', { data: reminderResult }, true, 'enabled intent not delivery evidence'],
    ['ReminderResponse', { data: { ...reminderResult, enabled: false } }, true, 'disabled intent remains readable'],
    ['ReminderResponse', { data: { ...reminderResult, delivered: true } }, false, 'no fabricated OS delivery field'],
    ['ReminderResponse', { data: { ...reminderResult, deviceToken: 'synthetic-forbidden' } }, false, 'no device credential in intent'],
    ['ReminderResponse', { data: { ...reminderResult, delivery: 'all_devices' } }, false, 'one-device transport only'],
    ['ReminderListResponse', page([reminderResult]), true, 'strict reminder page'],
    ['ReminderListResponse', page([]), true, 'empty reminder page'],
    ['ReminderListResponse', page(Array(101).fill(reminderResult)), false, 'reminder page bound'],
    ['TaskDeletionResponse', deletion('task'), true, 'task-specific tombstone envelope'],
    ['GoalDeletionResponse', deletion('goal'), true, 'goal-specific tombstone envelope'],
    ['ReminderDeletionResponse', deletion('reminder'), true, 'reminder-specific tombstone envelope'],
    ['TaskDeletionResponse', deletion('goal'), false, 'task endpoint cannot return a goal deletion'],
    ['GoalDeletionResponse', deletion('task'), false, 'goal endpoint cannot return a task deletion'],
    ['ReminderDeletionResponse', deletion('task'), false, 'reminder endpoint cannot return a task deletion'],
    ['DeletionResponse', { data: { ...deletion('task').data, receipt: { ...deletion('task').data.receipt, command: 'goal.delete' } } }, false, 'tombstone and command kind agree'],
    ['DeletionResponse', { data: { tombstone: deletion('task').data.tombstone } }, false, 'durable receipt required'],
    ['DeletionResponse', { data: { ...deletion('task').data, receipt: { ...deletion('task').data.receipt, committedThrough: 9 } } }, false, 'receipt sequence remains string'],
    ['DeletionResponse', { data: { ...deletion('task').data, receipt: { ...deletion('task').data.receipt, accessToken: 'synthetic-forbidden' } } }, false, 'domain receipt is not a credential'],
    ['DeletionResponse', { data: { ...deletion('task').data, tombstone: { ...deletion('task').data.tombstone, version: 0 } } }, false, 'tombstone version positive'],
    ['DeletionResponse', { data: { ...deletion('task').data, receipt: { ...deletion('task').data.receipt, targetId: b } } }, true, 'cross-field ID equality needs semantic validation'],
  );
  const apiSettings = read('../API_SPEC.md').split('## 15. Settings Endpoints')[1]?.split('## 16.')[0];
  const canonicalSettingsExamples = [...(apiSettings ?? '').matchAll(/```json\s*([\s\S]*?)```/g)]
    .map((match) => JSON.parse(match[1]));
  assert(canonicalSettingsExamples.length === 2, 'Expected one canonical settings response and one patch example');
  if (canonicalSettingsExamples.length === 2) {
    cases.push(['AccountSettingsResponse', canonicalSettingsExamples[0], true, 'canonical settings response matches schema']);
    cases.push(['AccountSettingsPatch', canonicalSettingsExamples[1], true, 'canonical settings patch matches schema']);
  }
  const results = cases.map(([definition, input, expected, label], index) => {
    const validate = ajv.getSchema(`${extension.$id}#/definitions/${definition}`);
    const actual = Boolean(validate(input));
    assert(actual === expected, `${label}: expected ${expected}, got ${actual}`);
    return { id: `EXT-${String(index + 1).padStart(2, '0')}`, definition, label, pass: actual === expected };
  });
  const declared = extension.definitions.SyncMutation.properties.command.enum;
  assert(declared.length === 14 && declared.every((c) => Object.hasOwn(commandBodies, c)), 'Every command kind needs a fixture');
  const paths = web.routes.map((r) => r.path);
  assert(paths.length === 25 && new Set(paths).size === 25, 'Expected 25 unique web page routes');
  const counts = Object.fromEntries(['public', 'auth', 'account'].map((s) => [s, web.routes.filter((r) => r.surface === s).length]));
  assert(counts.public === 13 && counts.auth === 5 && counts.account === 7, 'Web surface counts differ');
  for (const r of web.routes) {
    if (r.surface === 'public') assert(r.cache === 'public-content-only', `Private data cannot enter public cache: ${r.path}`);
    else assert(r.cache === 'private-no-store' && r.index === false, `Private route cache/index policy: ${r.path}`);
  }
  assert(web.handlers.length === 2 && web.handlers.every((h) => h.cache === 'private-no-store'), 'Auth handler cache policy');
  assert(web.handlers.find((h) => h.path === '/auth/logout')?.method === 'POST', 'Logout must not be GET');
  assert(web.returnToAllowlist.every((p) => web.routes.some((r) => r.path === p && r.surface === 'account')), 'Redirect allowlist must resolve to own portal paths');
  const allowedSettings = Object.keys(extension.definitions.AccountSettingsPatch.properties).filter((p) => p !== 'expectedVersion').sort();
  assert(JSON.stringify(allowedSettings) === JSON.stringify([...web.accountPreferenceFields].sort()), 'Portal/account settings allowlists disagree');
  const responseSettings = Object.keys(extension.definitions.AccountSettings.properties)
    .filter((p) => !['id', 'version', 'updatedAt'].includes(p)).sort();
  assert(JSON.stringify(allowedSettings) === JSON.stringify(responseSettings), 'Account read/write preference allowlists disagree');
  assert(web.localOnlyFields.every((field) => !allowedSettings.includes(field)), 'Local-only field exposed to portal settings');
  assert(Object.values(web.launchOperations).every((value) => value === false), 'Draft manifest cannot authorize checkout/upload/deployment');
  const backendDoc = read('16-BACKEND-EXTENSIONS-AND-OPERATIONS.md');
  const endpoints = [...backendDoc.matchAll(/^\| (EX-\d{2}) \| `([A-Z]+) ([^`]+)` \|/gm)];
  assert(endpoints.length === 33 && new Set(endpoints.map((m) => `${m[2]} ${m[3]}`)).size === 33, 'Expected 33 unique extension method/path pairs');
  endpoints.forEach((m, i) => assert(m[1] === `EX-${String(i + 1).padStart(2, '0')}`, 'Extension IDs must be sequential'));
  const coreApi = JSON.parse(read('contracts/personal-api.openapi.json'));
  const extensionApi = JSON.parse(read('contracts/personal-extensions.openapi.json'));
  const documents = new Map([
    ['personal-api.schema.json', core], ['backend-extensions.schema.json', extension],
    ['personal-api.openapi.json', coreApi], ['personal-extensions.openapi.json', extensionApi],
  ]);
  const aliases = new Map([[core.$id, 'personal-api.schema.json'], [extension.$id, 'backend-extensions.schema.json']]);
  let resolvedReferences = 0;
  function resolve(ref, source) {
    const [part, fragment = ''] = ref.split('#');
    const name = aliases.get(part) ?? (part || source);
    let value = documents.get(name);
    if (!value || (fragment && !fragment.startsWith('/'))) throw new Error(`Unknown reference: ${ref}`);
    for (const encoded of fragment.split('/').slice(1)) {
      const key = encoded.replace(/~1/g, '/').replace(/~0/g, '~');
      if (!value || !Object.hasOwn(value, key)) throw new Error(`Unresolved reference: ${ref}`);
      value = value[key];
    }
    resolvedReferences += 1;
    return { value, source: name };
  }
  function dereference(value, source) {
    for (let depth = 0; value?.$ref; depth++) {
      if (depth >= 32) throw new Error('Reference cycle/depth exceeds checker bound');
      ({ value, source } = resolve(value.$ref, source));
    }
    return { value, source };
  }
  function walkReferences(value, source) {
    if (!value || typeof value !== 'object') return;
    if (typeof value.$ref === 'string') resolve(value.$ref, source);
    for (const child of Object.values(value)) walkReferences(child, source);
  }
  for (const [name, document] of documents) walkReferences(document, name);
  const methods = ['get', 'post', 'patch', 'delete', 'put', 'head', 'options', 'trace'];
  const ids = new Set(); const pairs = new Set(); const selected = [];
  const expectedExtensions = ['EX-01', 'EX-02', 'EX-03', 'EX-04', 'EX-05', 'EX-06', 'EX-07', 'EX-08', 'EX-09', 'EX-10', 'EX-11', 'EX-17'];
  const exactSuccessSchemas = {
    'EX-01': ['200', 'personal-api.openapi.json#/components/schemas/GoalEnvelope'],
    'EX-02': ['200', 'backend-extensions.schema.json#/definitions/GoalDeletionResponse'],
    'EX-03': ['200', 'backend-extensions.schema.json#/definitions/TaskDeletionResponse'],
    'EX-04': ['200', 'backend-extensions.schema.json#/definitions/AccountSettingsResponse'],
    'EX-05': ['200', 'backend-extensions.schema.json#/definitions/AccountSettingsResponse'],
    'EX-06': ['201', 'backend-extensions.schema.json#/definitions/BreakResponse'],
    'EX-07': ['200', 'backend-extensions.schema.json#/definitions/BreakListResponse'],
    'EX-08': ['201', 'backend-extensions.schema.json#/definitions/ReminderResponse'],
    'EX-09': ['200', 'backend-extensions.schema.json#/definitions/ReminderListResponse'],
    'EX-10': ['200', 'backend-extensions.schema.json#/definitions/ReminderResponse'],
    'EX-11': ['200', 'backend-extensions.schema.json#/definitions/ReminderDeletionResponse'],
    'EX-17': ['200', 'backend-extensions.schema.json#/definitions/AnalyticsSummaryResponse'],
  };
  for (const [name, api] of [['personal-api.openapi.json', coreApi], ['personal-extensions.openapi.json', extensionApi]]) {
    assert(api.openapi === '3.1.1', `Unexpected OpenAPI version: ${name}`);
    assert(JSON.stringify(api.components.securitySchemes.UserBearer) === JSON.stringify(coreApi.components.securitySchemes.UserBearer), `Auth scheme mismatch: ${name}`);
    assert(JSON.stringify(api.servers.map((s) => s.url)) === JSON.stringify(['/v1']), `Logical base mismatch: ${name}`);
    for (const [route, pathItem] of Object.entries(api.paths)) for (const method of methods) {
      const op = pathItem[method]; if (!op) continue;
      const pair = `${method.toUpperCase()} ${route}`;
      assert(Boolean(op.operationId) && !ids.has(op.operationId), `Missing/duplicate operation ID: ${pair}`);
      assert(!pairs.has(pair), `Duplicate method/path across slices: ${pair}`);
      ids.add(op.operationId); pairs.add(pair);
      assert(JSON.stringify(op.security ?? api.security) === JSON.stringify([{ UserBearer: [] }]), `Private auth weakened: ${pair}`);
      if (name !== 'personal-extensions.openapi.json') continue;
      const id = op['x-registry-id']; selected.push(id);
      const inventory = endpoints.find((m) => m[1] === id);
      assert(Boolean(inventory) && `${inventory[2]} ${inventory[3]}` === pair, `Inventory/wire mismatch: ${id}`);
      const parameters = [...(pathItem.parameters ?? []), ...(op.parameters ?? [])].map((p) => dereference(p, name).value);
      assert(new Set(parameters.map((p) => `${p.in}:${p.name}`)).size === parameters.length, `Duplicate parameters: ${id}`);
      for (const match of route.matchAll(/\{([^}]+)\}/g)) assert(parameters.some((p) => p.name === match[1] && p.in === 'path' && p.required), `Required path parameter: ${id}`);
      if (method !== 'get') {
        assert(parameters.some((p) => p.name === 'Idempotency-Key' && p.in === 'header' && p.required), `Missing mutation identity: ${id}`);
        const command = op['x-command'];
        const rule = extension.definitions.SyncMutation.allOf.find((r) => {
          const condition = r.if.properties.command;
          return condition.const === command || condition.enum?.includes(command);
        });
        assert(Boolean(rule), `No shared command schema: ${id}`);
        if (method === 'delete') {
          assert(!op.requestBody, `DELETE must normalize the header, not a body: ${id}`);
          const parameter = parameters.find((p) => p.in === 'header' && p.name === 'Expected-Version');
          assert(parameter?.required && parameter.schema.$ref === 'backend-extensions.schema.json#/definitions/Version', `Delete version header: ${id}`);
          assert(rule?.then.properties.body.$ref === '#/definitions/VersionOnly', `Delete domain body mismatch: ${id}`);
        } else {
          const body = dereference(op.requestBody, name);
          assert(body.value?.required === true, `Required request body: ${id}`);
          const request = dereference(body.value?.content?.['application/json']?.schema, body.source).value;
          const sync = dereference(rule?.then.properties.body, 'backend-extensions.schema.json').value;
          assert(JSON.stringify(request) === JSON.stringify(sync), `Direct/sync input mismatch: ${id}`);
        }
      } else {
        assert(!op.requestBody && !op['x-command'], `GET cannot mutate: ${id}`);
        const queryDefinition = id === 'EX-17' ? extension.definitions.AnalyticsQuery
          : ['EX-07', 'EX-09'].includes(id) ? extension.definitions.ListQuery : { properties: {} };
        const query = parameters.filter((p) => p.in === 'query');
        assert(JSON.stringify(query.map((p) => p.name).sort()) === JSON.stringify(Object.keys(queryDefinition.properties).sort()), `Exact query allowlist: ${id}`);
        for (const p of query) {
          assert(Boolean(p.required) === Boolean(queryDefinition.required?.includes(p.name)), `Required query field: ${id}/${p.name}`);
          const actual = dereference(p.schema, name).value;
          const expected = dereference(queryDefinition.properties[p.name], 'backend-extensions.schema.json').value;
          assert(JSON.stringify(actual) === JSON.stringify(expected), `Query bound mismatch: ${id}/${p.name}`);
        }
      }
      const [status, expectedRef] = exactSuccessSchemas[id] ?? [];
      const response = dereference(op.responses?.[status], name);
      const actualShape = dereference(response.value?.content?.['application/json']?.schema, response.source).value;
      const expectedShape = dereference({ $ref: expectedRef }, name).value;
      assert(Boolean(actualShape) && JSON.stringify(actualShape) === JSON.stringify(expectedShape), `Success schema/status mismatch: ${id}`);
      const failure = dereference(op.responses?.default, name).value;
      assert(failure?.content?.['application/json']?.schema?.$ref === 'personal-api.schema.json#/definitions/Error', `Safe error envelope: ${id}`);
    }
  }
  assert(JSON.stringify(selected.sort()) === JSON.stringify(expectedExtensions), 'Exactly twelve selected extension operations required');
  assert(ids.size === 26 && pairs.size === 26, 'Two draft slices must contain 26 unique operations');
  // Documentation parser reference only, not a deployed header adapter.
  const parseExpectedVersion = (raw) => typeof raw === 'string' && /^[1-9][0-9]{0,9}$/.test(raw)
    && Number(raw) <= 2147483647 ? Number(raw) : null;
  const headerCases = [['1', 1], ['2147483647', 2147483647], ['2147483648', null],
    ['01', null], ['0', null], ['-1', null], ['1.0', null], ['1junk', null],
    [' 1', null], ['1,2', null], [['1', '2'], null], [undefined, null]];
  headerCases.forEach(([raw, expected], i) => assert(parseExpectedVersion(raw) === expected, `Version header reference ${i + 1}`));
  // Reference arithmetic only, not an app migration or production adapter test.
  const scaleWhole = (value, factor) => {
    if (!Number.isSafeInteger(value) || value < 0 || !Number.isSafeInteger(value * factor)) return null;
    return value * factor;
  };
  const unitCases = [
    [25, 60000, 1500000], [3000, 1000, 3000000], [90, 60000, 5400000],
    [0, 1000, 0], [-1, 1000, null], [0.5, 1000, null],
    [Infinity, 1000, null], [Number.MAX_SAFE_INTEGER, 1000, null],
  ];
  unitCases.forEach(([value, factor, expected], i) => assert(scaleWhole(value, factor) === expected, `Unit reference ${i + 1}`));
  console.log(JSON.stringify({
    status: errors.length ? 'FAIL' : 'PASS',
    scope: 'Draft JSON shapes, unit reference arithmetic and document manifests only; no API/SQL/browser/security behavior verified',
    dtoFixtures: results.length, commandKinds: declared.length, extensionEndpoints: endpoints.length,
    extensionOpenApiOperations: selected.length, combinedOpenApiOperations: pairs.size, resolvedReferences,
    webPages: paths.length, surfaceCounts: counts, authHandlers: web.handlers.length,
    unitReferenceCases: unitCases.length, versionHeaderReferenceCases: headerCases.length,
    errors, ...(process.argv.includes('--details') ? { results } : {}),
  }, null, 2));
  process.exitCode = errors.length ? 1 : 0;
} catch (error) {
  console.error(JSON.stringify({ status: 'CHECKER_ERROR', message: error.message }));
  process.exitCode = 2;
}
