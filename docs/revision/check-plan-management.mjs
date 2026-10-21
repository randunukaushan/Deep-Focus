// Read-only PL-01 DTO/reference checks. Not application, SQL, auth, crypto or device tests.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
import { isDeepStrictEqual } from 'node:util';

const here = path.dirname(fileURLToPath(import.meta.url));
const read = f => fs.readFileSync(path.join(here, f), 'utf8');
const require = createRequire(path.join(here, '../../package.json'));
const failures = []; let dtoCases = 0; let semanticCases = 0; let references = 0;
const test = (name, fn) => { try { fn(); } catch (e) { failures.push(`${name}: ${e.message}`); } };
const copy = structuredClone;
const id = n => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const unique = rows => new Set(rows.map(r => r.id)).size === rows.length;
const sorted = rows => [...rows].sort((a, b) => a.id < b.id ? -1 : a.id > b.id ? 1 : 0);
const sameIds = (a, b) => isDeepStrictEqual([...a].sort(), [...b].sort());
try {
  const schemaNames = ['personal-api', 'backend-extensions', 'operations-api', 'rewards-ai', 'planning', 'plan-management'];
  const apiNames = ['personal-api', 'personal-extensions', 'operations-api', 'rewards-ai', 'planning', 'plan-management'];
  const files = new Map([...schemaNames.map(n => `${n}.schema.json`), ...apiNames.map(n => `${n}.openapi.json`)]
    .map(f => [f, JSON.parse(read(`contracts/${f}`))]));
  const Ajv = require('ajv'); const ajv = new Ajv({ allErrors: true, format: 'full', jsonPointers: true });
  const aliases = new Map();
  for (const n of schemaNames) { const f = `${n}.schema.json`; const s = files.get(f); ajv.addSchema(s); aliases.set(s.$id, f); }
  const schema = files.get('plan-management.schema.json');
  for (const name of Object.keys(schema.definitions)) assert.ok(ajv.getSchema(`${schema.$id}#/definitions/${name}`));
  function shape(n, value, expected, label = n, file = 'plan-management.schema.json') {
    dtoCases++; test(label, () => {
      const validate = ajv.getSchema(`${files.get(file).$id}#/definitions/${n}`);
      assert.equal(Boolean(validate(value)), expected, JSON.stringify(validate.errors));
    });
  }
  const at = '2026-09-20T03:00:00.000Z'; const end = '2026-09-20T04:00:00.000Z';
  const now = '2026-09-20T02:00:00.000Z';
  const focus = { id: id(3), kind: 'focus', taskId: id(4), startsAt: at, endsAt: end, reminderId: id(5) };
  const plan = { id: id(1), workspaceId: id(2), localDate: '2026-09-20', timeZone: 'Asia/Colombo',
    availableStart: at, availableEnd: end, explanation: 'Synthetic schedule.', blocks: [focus] };
  const saved = { ...plan, version: 2, createdAt: now, updatedAt: now, state: 'active', sourceProposalId: id(9) };
  const reminder = { id: id(5), taskId: id(4), scheduledFor: at, timeZone: 'Asia/Colombo',
    enabled: true, delivery: 'local_device', version: 3, updatedAt: now, deletedAt: null };
  const detail = { plan: saved, boundReminders: [reminder] };
  const keep = { action: 'keep', id: id(5), expectedVersion: 3 };
  const disable = { ...keep, action: 'disable' };
  const update = { ...keep, action: 'update', scheduledFor: '2026-09-20T02:55:00.000Z', timeZone: 'Asia/Colombo', enabled: true };
  const create = { action: 'create', id: id(6), taskId: id(4), scheduledFor: at, timeZone: 'Asia/Colombo', delivery: 'local_device' };
  const edit = { expectedVersion: 2, plan: { ...plan, explanation: 'Explicitly edited.' },
    taskVersions: [{ id: id(4), expectedVersion: 7 }], reminderActions: [keep] };
  const action = { action: 'archive', expectedVersion: 2, reminderVersions: [{ id: id(5), expectedVersion: 3 }] };
  const receipt = { mutationId: id(8), command: 'plan.archive', targetId: id(1), previousVersion: 2,
    entityVersion: 3, state: 'archived', committedThrough: '9007199254740993', updatedAt: now,
    reminderResults: [{ id: id(5), action: 'disable', version: 4 }] };
  const positives = [['VersionRef', edit.taskVersions[0]], ['ReminderKeep', keep], ['ReminderDisable', disable],
    ['ReminderUpdate', update], ['ReminderCreate', create], ['PlanEditInput', edit], ['PlanActionInput', action],
    ['PlanActionInput', { ...action, action: 'delete' }],
    ['PlanActionInput', { action: 'restore', expectedVersion: 3, reminderVersions: [] }],
    ['ReminderResult', receipt.reminderResults[0]], ['MutationReceipt', receipt], ['MutationResponse', { data: receipt }]];
  for (const [n, v] of positives) {
    shape(n, v, true); shape(n, { ...v, ownerId: id(99) }, false, `${n} rejects owner injection`);
    for (const k of Object.keys(v)) { const x = copy(v); delete x[k]; shape(n, x, false, `${n} requires ${k}`); }
  }
  shape('PlanResponse', { data: detail }, true, 'current read', 'planning.schema.json');
  shape('PlanResponse', { data: saved }, false, 'old read shape rejected', 'planning.schema.json');
  for (const k of ['state', 'updatedAt']) { const v = copy(saved); delete v[k]; shape('SavedPlan', v, false, `saved requires ${k}`, 'planning.schema.json'); }
  shape('SavedPlan', { ...saved, state: 'deleted' }, false, 'tombstone is not saved content', 'planning.schema.json');
  for (const [n, v] of [
    ['ReminderCreate', { ...create, enabled: false }], ['ReminderCreate', { ...create, delivery: 'push' }],
    ['ReminderUpdate', { ...update, taskId: id(20) }], ['ReminderKeep', { ...keep, enabled: false }],
    ['PlanEditInput', { ...edit, taskVersions: [] }], ['PlanEditInput', { ...edit, reminderActions: Array(201).fill(keep) }],
    ['PlanEditInput', { ...edit, plan: { ...plan, state: 'archived' } }],
    ['PlanActionInput', { ...action, action: 'restore' }], ['PlanActionInput', { ...action, action: 'complete' }],
    ['MutationReceipt', { ...receipt, state: 'active' }], ['MutationReceipt', { ...receipt, explanation: 'leak' }],
    ['MutationReceipt', { ...receipt, committedThrough: '01' }], ['MutationReceipt', { ...receipt, entityVersion: 2147483648 }],
    ['ReminderUpdate', { ...update, scheduledFor: '2026-09-20T03:00:00+00:00' }],
  ]) shape(n, v, false, `negative ${n} ${dtoCases}`);

  // These pure reference predicates assume shape validation and synthetic trusted
  // repository inputs. They are not actual access checks or complete time validators.
  const instant = value => Number.isFinite(Date.parse(value)) && new Date(value).toISOString() === value;
  function validRead(d) {
    const p = d.plan; const rs = d.boundReminders;
    const bs = p.blocks.filter(b => b.kind === 'focus' && b.reminderId !== null);
    return instant(p.createdAt) && instant(p.updatedAt) && p.createdAt <= p.updatedAt && unique(rs)
      && new Set(bs.map(b => b.reminderId)).size === bs.length
      && sameIds(bs.map(b => b.reminderId), rs.map(r => r.id)) && isDeepStrictEqual(rs, sorted(rs))
      && (p.state !== 'archived' || bs.length === 0)
      && bs.every(b => { const r = rs.find(r => r.id === b.reminderId); return r && r.deletedAt === null
        && r.taskId === b.taskId && r.timeZone === p.timeZone && Date.parse(r.scheduledFor) <= Date.parse(b.startsAt); });
  }
  const tasks = new Map([[id(4), 7], [id(10), 1]]);
  function validEdit(d, q, currentTasks = tasks, usedIds = new Set([id(5), id(90)]), removedBlocks = new Set([id(91)])) {
    const old = d.plan; const p = q.plan; const acts = q.reminderActions; const oldRs = new Map(d.boundReminders.map(r => [r.id, r]));
    if (!validRead(d) || old.state !== 'active' || q.expectedVersion !== old.version || old.version === 2147483647
      || p.id !== old.id || p.workspaceId !== old.workspaceId || !unique(acts) || !unique(q.taskVersions) || !unique(p.blocks)) return false;
    const tids = [...new Set(p.blocks.filter(b => b.kind === 'focus').map(b => b.taskId))];
    if (!sameIds(tids, q.taskVersions.map(t => t.id)) || q.taskVersions.some(t => currentTasks.get(t.id) !== t.expectedVersion)) return false;
    if (p.blocks.some(b => removedBlocks.has(b.id) || (old.blocks.some(o => o.id === b.id && o.kind !== b.kind)))) return false;
    if (!sameIds(acts.filter(a => a.action !== 'create').map(a => a.id), [...oldRs.keys()])) return false;
    const result = []; let changedReminder = false;
    for (const a of acts) {
      const r = oldRs.get(a.id);
      if (a.action === 'create') {
        if (usedIds.has(a.id) || Date.parse(a.scheduledFor) <= Date.parse(now)) return false;
        result.push({ ...a, enabled: true, deletedAt: null }); changedReminder = true;
      } else {
        if (!r || r.version !== a.expectedVersion) return false;
        if (a.action === 'disable') {
          if (r.enabled && r.version === 2147483647) return false;
          changedReminder = true; continue;
        }
        if (a.action === 'keep') result.push(r);
        else {
          const moved = a.scheduledFor !== r.scheduledFor || a.timeZone !== r.timeZone;
          if (!moved && a.enabled === r.enabled) return false;
          if ((moved || (!r.enabled && a.enabled)) && Date.parse(a.scheduledFor) <= Date.parse(now)) return false;
          if (r.version === 2147483647) return false;
          result.push({ ...r, scheduledFor: a.scheduledFor, timeZone: a.timeZone, enabled: a.enabled }); changedReminder = true;
        }
      }
    }
    const oldContent = Object.fromEntries(Object.keys(plan).map(k => [k, old[k]]));
    if (!changedReminder && isDeepStrictEqual(oldContent, p)) return false;
    return validRead({ plan: { ...p, state: old.state, createdAt: old.createdAt, updatedAt: old.updatedAt }, boundReminders: sorted(result) });
  }
  function validAction(d, q) {
    const p = d.plan;
    return validRead(d) && q.expectedVersion === p.version && p.version < 2147483647
      && (q.action === 'delete' || (q.action === 'archive' && p.state === 'active') || (q.action === 'restore' && p.state === 'archived'))
      && unique(q.reminderVersions) && sameIds(q.reminderVersions.map(r => r.id), d.boundReminders.map(r => r.id))
      && d.boundReminders.every(r => !r.enabled || r.version < 2147483647)
      && q.reminderVersions.every(r => d.boundReminders.some(o => o.id === r.id && o.version === r.expectedVersion));
  }
  const sem = (name, fn) => { semanticCases++; test(name, fn); };
  const variant = (name, mutate, expected = false, base = edit, check = q => validEdit(detail, q)) => {
    const q = copy(base); mutate(q); sem(name, () => assert.equal(check(q), expected));
  };
  sem('valid owned-reference fixture read', () => assert.equal(validRead(detail), true));
  sem('unchanged reminder can accompany manual text edit', () => assert.equal(validEdit(detail, edit), true));
  variant('missing reminder action', q => { q.reminderActions = []; });
  variant('duplicate reminder action', q => q.reminderActions.push(keep));
  variant('stale plan', q => q.expectedVersion++);
  variant('foreign workspace', q => q.plan.workspaceId = id(77));
  variant('wrong path identity', q => q.plan.id = id(77));
  variant('stale task version', q => q.taskVersions[0].expectedVersion++);
  variant('duplicate task pin', q => q.taskVersions.push(q.taskVersions[0]));
  variant('extra task pin', q => q.taskVersions.push({ id: id(10), expectedVersion: 1 }));
  variant('unowned/unavailable task', q => { q.plan.blocks[0].taskId = id(99); q.taskVersions = [{ id: id(99), expectedVersion: 1 }]; });
  variant('stale reminder', q => q.reminderActions[0].expectedVersion++);
  variant('disable must detach', q => q.reminderActions = [disable]);
  variant('detach plus disable', q => { q.reminderActions = [disable]; q.plan.blocks[0].reminderId = null; }, true);
  variant('retained binding cannot vanish silently', q => q.plan.blocks[0].reminderId = null);
  variant('update time explicit', q => q.reminderActions = [update], true);
  variant('update later than block', q => q.reminderActions = [{ ...update, scheduledFor: end }]);
  variant('no-op update', q => q.reminderActions = [{ ...update, scheduledFor: at }]);
  variant('update wrong zone', q => q.reminderActions = [{ ...update, timeZone: 'UTC' }]);
  variant('no-op whole edit', q => q.plan = copy(plan));
  variant('retired block ID', q => q.plan.blocks[0].id = id(91));
  variant('duplicate block ID', q => q.plan.blocks.push(copy(q.plan.blocks[0])));
  variant('replace old reminder with explicit new one', q => { q.reminderActions = [disable, create]; q.plan.blocks[0].reminderId = create.id; }, true);
  variant('new unbound reminder', q => q.reminderActions.push(create));
  variant('reused/tombstoned reminder ID', q => { q.reminderActions = [disable, { ...create, id: id(90) }]; q.plan.blocks[0].reminderId = id(90); });
  variant('new reminder in past', q => { q.reminderActions = [disable, { ...create, scheduledFor: now }]; q.plan.blocks[0].reminderId = create.id; });
  variant('new reminder task mismatch', q => { q.reminderActions = [disable, { ...create, taskId: id(10) }]; q.plan.blocks[0].reminderId = create.id; });
  sem('archive exact reminder versions', () => assert.equal(validAction(detail, action), true));
  variant('archive missing reminder confirmation', q => { q.reminderVersions = []; }, false, action, q => validAction(detail, q));
  variant('archive stale reminder confirmation', q => q.reminderVersions[0].expectedVersion++, false, action, q => validAction(detail, q));
  sem('restore active plan denied', () => assert.equal(validAction(detail, { ...action, action: 'restore' }), false));
  const archived = { plan: { ...saved, state: 'archived', blocks: [{ ...focus, reminderId: null }] }, boundReminders: [] };
  sem('restore archived with no alerts', () => assert.equal(validAction(archived, { action: 'restore', expectedVersion: 2, reminderVersions: [] }), true));
  sem('archived content cannot be edited', () => assert.equal(validEdit(archived, edit), false));
  sem('archived plan cannot have bindings', () => assert.equal(validRead({ ...detail, plan: { ...saved, state: 'archived' } }), false));
  sem('missing read reminder rejected', () => assert.equal(validRead({ ...detail, boundReminders: [] }), false));
  sem('deleted reminder not serialized', () => assert.equal(validRead({ ...detail, boundReminders: [{ ...reminder, deletedAt: now }] }), false));
  sem('updatedAt before createdAt rejected', () => assert.equal(validRead({ ...detail, plan: { ...saved, updatedAt: '2026-09-19T00:00:00.000Z' } }), false));
  const oldAlert = { ...detail, boundReminders: [{ ...reminder, scheduledFor: '2026-09-19T03:00:00.000Z' }] };
  sem('explicitly kept past alert remains historical', () => assert.equal(validEdit(oldAlert, edit), true));
  sem('disable-only update may retain past time', () => assert.equal(validEdit(oldAlert, { ...edit,
    reminderActions: [{ ...update, scheduledFor: oldAlert.boundReminders[0].scheduledFor, enabled: false }] }), true));
  sem('retimed past alert rejects', () => assert.equal(validEdit(detail, { ...edit,
    reminderActions: [{ ...update, scheduledFor: now }] }), false));
  sem('archive cannot overflow reminder version', () => assert.equal(validAction({ ...detail,
    boundReminders: [{ ...reminder, version: 2147483647 }] }, { ...action,
    reminderVersions: [{ id: reminder.id, expectedVersion: 2147483647 }] }), false));
  const parseHeader = values => values.length === 1 && values[0] === '2';
  for (const [values, expected] of [[['2'], true], [[], false], [['1'], false], [['02'], false], [['2', '2'], false], [['2.0'], false]]) {
    sem(`plan header ${JSON.stringify(values)}`, () => assert.equal(parseHeader(values), expected));
  }
  const normalize = q => ({ ...q, taskVersions: sorted(q.taskVersions), reminderActions: sorted(q.reminderActions) });
  const two = { ...edit, taskVersions: [...edit.taskVersions, { id: id(10), expectedVersion: 1 }], reminderActions: [disable, create] };
  sem('set array order is not new intent', () => assert.deepEqual(normalize(two), normalize({ ...two, taskVersions: [...two.taskVersions].reverse(), reminderActions: [...two.reminderActions].reverse() })));
  sem('block order remains intent', () => {
    const a = { ...edit, plan: { ...plan, blocks: [focus, { ...focus, id: id(7) }] } };
    assert.notDeepEqual(normalize(a), normalize({ ...a, plan: { ...a.plan, blocks: [...a.plan.blocks].reverse() } }));
  });
  const receiptValid = r => r.mutationId === id(8) && r.targetId === saved.id && r.command === 'plan.archive'
    && r.state === 'archived' && r.previousVersion === 2 && r.entityVersion === 3
    && BigInt(r.committedThrough) > 0n && BigInt(r.committedThrough) <= 9223372036854775807n
    && isDeepStrictEqual(r.reminderResults, [{ id: id(5), action: 'disable', version: 4 }]);
  sem('minimal receipt matches original transaction', () => assert.equal(receiptValid(receipt), true));
  for (const changes of [{ mutationId: id(99) }, { entityVersion: 4 }, { reminderResults: [] }, { committedThrough: '9223372036854775808' }]) {
    sem(`mismatched receipt ${JSON.stringify(changes)}`, () => assert.equal(receiptValid({ ...receipt, ...changes }), false));
  }

  function resolve(ref, from) {
    const [base, pointer = ''] = ref.split('#');
    const file = base ? aliases.get(base) ?? base : from;
    let value = files.get(file); assert.ok(value, `unknown ref file ${file}`);
    for (const key of pointer.split('/').filter(Boolean)) value = value?.[key.replace(/~1/g, '/').replace(/~0/g, '~')];
    assert.notEqual(value, undefined, `missing ref ${ref}`); return value;
  }
  function walk(value, file) {
    if (!value || typeof value !== 'object') return;
    if (typeof value.$ref === 'string') { resolve(value.$ref, file); references++; }
    for (const v of Object.values(value)) walk(v, file);
  }
  for (const [file, value] of files) walk(value, file);
  const pairs = new Set(); const operationIds = new Set(); const pmIds = new Set();
  for (const name of apiNames) {
    const api = files.get(`${name}.openapi.json`);
    assert.equal(api.openapi, '3.1.1'); assert.equal(api.servers[0].url, '/v1');
    for (const [route, item] of Object.entries(api.paths)) for (const [method, op] of Object.entries(item)) {
      if (!['get', 'post', 'patch', 'delete', 'put'].includes(method)) continue;
      const pair = `${method.toUpperCase()} ${route}`;
      assert.ok(!pairs.has(pair) && !operationIds.has(op.operationId)); pairs.add(pair); operationIds.add(op.operationId);
      if (name !== 'plan-management') continue;
      const pm = op['x-plan-management-id']; assert.ok(!pmIds.has(pm)); pmIds.add(pm);
      assert.equal(pair, pm === 'PM-01' ? 'PATCH /plans/{id}' : 'POST /plans/{id}/actions');
      assert.deepEqual(op.security ?? api.security, [{ UserBearer: [] }]);
      assert.equal(op['x-active-account-required'], true); assert.equal(op['x-unknown-query-keys'], 'reject');
      assert.equal(op['x-generation-unit-debit'], 0); assert.equal(op['x-max-body-bytes'], 65536);
      assert.deepEqual(op.parameters.map(p => [p.name, p.in, p.required]), [['id', 'path', true], ['Plan-Contract-Version', 'header', true], ['Idempotency-Key', 'header', true]]);
      assert.deepEqual(op.parameters[1].schema, { type: 'integer', const: 2 });
      for (const i of [0, 2]) assert.deepEqual(op.parameters[i].schema, { type: 'string', format: 'uuid' });
      assert.equal(op.requestBody.required, true);
      assert.equal(op.requestBody.content['application/json'].schema.$ref, `plan-management.schema.json#/definitions/${pm === 'PM-01' ? 'PlanEditInput' : 'PlanActionInput'}`);
      assert.deepEqual(Object.keys(op.responses).sort(), ['200', 'default']);
      assert.equal(op.responses['200'].content['application/json'].schema.$ref, 'plan-management.schema.json#/definitions/MutationResponse');
      assert.equal(op.responses['200'].headers['Cache-Control'].schema.const, 'private, no-store');
      assert.equal(op.responses['200'].headers['Plan-Contract-Version'].schema.const, 2);
      const err = resolve(op.responses.default.$ref, `${name}.openapi.json`);
      assert.equal(err.headers['Cache-Control'].schema.const, 'private, no-store');
      assert.equal(err.content['application/json'].schema.$ref, 'personal-api.schema.json#/definitions/Error');
    }
  }
  assert.equal(pairs.size, 54); assert.equal(operationIds.size, 54); assert.deepEqual([...pmIds].sort(), ['PM-01', 'PM-02']);
  const doc = read('26-SAVED-PLAN-MANAGEMENT-WIRE.md');
  assert.equal([...doc.matchAll(/^\| PM-T\d{2} \|/gm)].length, 10);
  for (const m of doc.matchAll(/^\| PM-\d{2} \| `([^`]+)`/gm)) assert.ok(pairs.has(m[1]));
  console.log(JSON.stringify({ status: failures.length ? 'FAIL' : 'PASS', definitions: Object.keys(schema.definitions).length,
    dtoCases, semanticCases, combinedOperations: pairs.size, selectedOperations: pmIds.size, references,
    scope: 'Document DTOs/refs and synthetic semantic examples; NOT runtime/security/crypto verification', failures }, null, 2));
  process.exitCode = failures.length ? 1 : 0;
} catch (e) { console.error(JSON.stringify({ status: 'CHECKER_ERROR', message: e.message })); process.exitCode = 2; }
