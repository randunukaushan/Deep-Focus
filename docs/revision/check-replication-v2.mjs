// Read-only draft shapes/reference examples. NOT live sync, crypto, SQL or security tests.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const here = path.dirname(fileURLToPath(import.meta.url));
const read = f => fs.readFileSync(path.join(here, f), 'utf8');
const require = createRequire(path.join(here, '../../package.json'));
const failures = []; let dtoCases = 0; let semanticCases = 0; let references = 0;
const test = (label, fn) => { try { fn(); } catch (e) { failures.push(`${label}: ${e.message}`); } };
const sem = (label, fn) => { semanticCases++; test(label, fn); };
const id = n => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const clone = structuredClone;
try {
  const schemas = ['personal-api', 'backend-extensions', 'operations-api', 'rewards-ai', 'planning', 'plan-management', 'replication-v2'];
  const apis = ['personal-api', 'personal-extensions', 'operations-api', 'rewards-ai', 'planning', 'plan-management', 'replication-v2'];
  const files = new Map([...schemas.map(n => `${n}.schema.json`), ...apis.map(n => `${n}.openapi.json`)].map(f => [f, JSON.parse(read(`contracts/${f}`))]));
  const Ajv = require('ajv'); const ajv = new Ajv({ allErrors: true, format: 'full', jsonPointers: true });
  const aliases = new Map();
  for (const n of schemas) { const f = `${n}.schema.json`; const s = files.get(f); ajv.addSchema(s); aliases.set(s.$id, f); }
  const schema = files.get('replication-v2.schema.json');
  for (const n of Object.keys(schema.definitions)) assert.ok(ajv.getSchema(`${schema.$id}#/definitions/${n}`));
  function shape(n, v, expected, label = n, file = 'replication-v2.schema.json') {
    dtoCases++; test(label, () => { const check = ajv.getSchema(`${files.get(file).$id}#/definitions/${n}`);
      assert.equal(Boolean(check(v)), expected, JSON.stringify(check.errors)); });
  }
  const at = '2026-09-20T03:00:00.000Z', end = '2026-09-20T04:00:00.000Z';
  const plan = { id: id(1), workspaceId: id(2), localDate: '2026-09-20', timeZone: 'Asia/Colombo',
    availableStart: at, availableEnd: end, explanation: null,
    blocks: [{ id: id(3), kind: 'focus', taskId: id(4), startsAt: at, endsAt: end, reminderId: null }],
    version: 1, createdAt: at, updatedAt: at, state: 'active', sourceProposalId: id(9) };
  const record = { entity: 'plan', entityId: plan.id, version: 1, payload: plan };
  const change = { ...record, sequence: '9007199254740993', operation: 'upsert' };
  const group = { transactionId: id(10), committedThrough: '9007199254740994', changeCount: 1, groupDigest: 'a'.repeat(64), changes: [change] };
  const action = { mutationId: id(11), command: 'plan.archive', targetId: plan.id,
    body: { action: 'archive', expectedVersion: 1, reminderVersions: [] } };
  const legacy = { mutationId: id(12), command: 'task.patch', targetId: id(4), body: { expectedVersion: 1, title: 'Synthetic task' } };
  const push = { contractVersion: 2, privacyEpoch: '1', items: [legacy, action] };
  const receipt = { mutationId: action.mutationId, command: action.command, targetId: plan.id,
    previousVersion: 1, entityVersion: 2, state: 'archived', committedThrough: group.committedThrough,
    updatedAt: at, reminderResults: [] };
  const outcome = { mutationId: action.mutationId, command: action.command, targetId: plan.id, status: 'applied', receipt };
  const pull = { data: [group], meta: { contractVersion: 2, privacyEpoch: '1', highWater: group.committedThrough, nextCursor: 'opaque-next', caughtUp: true } };
  const job = { id: id(20), kind: 'sync_snapshot', state: 'queued', updatedAt: at };
  const meta = { snapshotId: job.id, contractVersion: 2, privacyEpoch: '1', highWater: group.committedThrough,
    createdAt: at, expiresAt: end, pageCount: 1, manifestDigest: 'b'.repeat(64), firstPageCursor: 'opaque-first', resumeCursor: 'opaque-resume' };
  const page = { data: [record], meta: { contractVersion: 2, privacyEpoch: '1', snapshotId: job.id,
    pageIndex: 0, pageCount: 1, highWater: meta.highWater, pageDigest: 'c'.repeat(64), nextCursor: null } };
  const manifest = { contractVersion: 2, section: 'plans', exportJobId: id(30), snapshotAt: at, highWater: meta.highWater,
    privacyEpoch: '1', planCount: 1, pageCount: 1, manifestDigest: 'd'.repeat(64) };
  const exportSection = { manifest, pages: [{ pageIndex: 0, plans: [plan], pageDigest: 'e'.repeat(64) }] };
  const positives = [['SnapshotRecord', record], ['SyncChange', change], ['SyncChange', { ...change, operation: 'delete', payload: null }],
    ['PlanMutation', action], ['Mutation', legacy], ['PushInput', push], ['PlanOutcome', outcome],
    ['PlanOutcome', { mutationId: id(11), command: 'plan.delete', targetId: id(1), status: 'retryable', code: 'SYNC_RESET_REQUIRED' }],
    ['PushResponse', { data: { contractVersion: 2, privacyEpoch: '1', outcomes: [outcome] } }],
    ['ChangeGroup', group], ['PullResponse', pull], ['SnapshotCreate', { contractVersion: 2 }],
    ['SnapshotAccepted', { data: { contractVersion: 2, privacyEpoch: '1', job } }], ['SnapshotMeta', meta],
    ['SnapshotStatus', { data: { contractVersion: 2, privacyEpoch: '1', job, snapshot: null } }],
    ['SnapshotStatus', { data: { contractVersion: 2, privacyEpoch: '1', job: { ...job, state: 'succeeded' }, snapshot: meta } }],
    ['SnapshotPage', page], ['PlanList', { data: [plan], meta: { contractVersion: 2, privacyEpoch: '1', nextCursor: null } }],
    ['PullQuery', { cursor: 'opaque-next' }], ['PageQuery', { cursor: 'opaque-page' }], ['PlanListQuery', {}],
    ['ExportPlansManifest', manifest], ['ExportPlansPage', exportSection.pages[0]], ['ExportPlansSection', exportSection]];
  for (const [n, v] of positives) {
    shape(n, v, true); shape(n, { ...v, ownerId: id(99) }, false, `${n} rejects owner`);
    for (const k of Object.keys(v)) { const x = clone(v); delete x[k];
      // Optional query keys are tested separately; all keys in these fixtures are required.
      if (!n.endsWith('Query')) shape(n, x, false, `${n} requires ${k}`);
    }
  }
  for (const [n, v] of [
    ['PushInput', { ...push, contractVersion: 1 }], ['PushInput', { ...push, privacyEpoch: '0' }],
    ['PlanMutation', { ...action, body: { ...action.body, action: 'delete' } }], ['PlanMutation', { ...action, command: 'plan.create' }],
    ['PullResponse', { ...pull, data: [change] }], ['PullResponse', { ...pull, meta: { ...pull.meta, nextCursor: null } }],
    ['SnapshotRecord', { ...record, payload: { ...plan, ownerId: id(99) } }],
    ['SnapshotRecord', { ...record, entity: 'resource' }], ['SyncChange', { ...change, operation: 'delete' }],
    ['SnapshotCreate', {}], ['SnapshotMeta', { ...meta, contractVersion: 1 }],
    ['SnapshotStatus', { data: { contractVersion: 2, privacyEpoch: '1', job, snapshot: meta } }],
    ['SnapshotStatus', { data: { contractVersion: 2, privacyEpoch: '1', job: { ...job, state: 'succeeded' }, snapshot: null } }],
    ['PullQuery', { cursor: 'x', limit: '50' }], ['PlanListQuery', { state: 'deleted' }],
    ['ExportPlansSection', { ...exportSection, localUri: 'file:///private' }],
    ['ExportPlansPage', { ...exportSection.pages[0], plans: [{ ...plan, state: 'deleted' }] }],
    ['ChangeGroup', { ...group, changeCount: 501 }],
  ]) shape(n, v, false, `negative ${n} ${dtoCases}`);
  shape('SyncPush', { contractVersion: 1, items: [action] }, false, 'v1 still rejects plans', 'backend-extensions.schema.json');
  shape('SnapshotRecord', record, false, 'v1 snapshot still rejects plan', 'operations-api.schema.json');
  const commands = files.get('backend-extensions.schema.json').definitions.SyncMutation.properties.command.enum;
  assert.equal(commands.length, 14); assert.equal(schema.definitions.PlanMutation.oneOf.length, 4);

  const bigint = (v, positive = false) => typeof v === 'string' && /^(0|[1-9][0-9]*)$/.test(v)
    && BigInt(v) >= (positive ? 1n : 0n) && BigInt(v) <= 9223372036854775807n;
  function validPull(p, after, epoch) {
    if (!bigint(after) || !bigint(p.meta.highWater) || !bigint(epoch, true) || p.meta.privacyEpoch !== epoch) return false;
    let prev = BigInt(after); const h = BigInt(p.meta.highWater); let total = 0; const ids = new Set();
    if (prev > h || p.data.length > 100) return false;
    for (const g of p.data) {
      if (!bigint(g.committedThrough) || BigInt(g.committedThrough) <= prev || BigInt(g.committedThrough) > h || ids.has(g.transactionId)) return false;
      ids.add(g.transactionId); if (g.changeCount !== g.changes.length || g.changeCount < 1 || g.changeCount > 500) return false;
      let s = prev; total += g.changeCount;
      for (const c of g.changes) {
        if (!bigint(c.sequence) || BigInt(c.sequence) <= s || BigInt(c.sequence) > BigInt(g.committedThrough)) return false;
        if (c.operation === 'upsert' && (c.payload.id !== c.entityId || c.payload.version !== c.version)) return false;
        if (c.operation === 'delete' && c.payload !== null) return false;
        s = BigInt(c.sequence);
      }
      prev = BigInt(g.committedThrough);
    }
    return total <= 500; // Opaque scan position/caughtUp, JCS and byte limits require separate real tests.
  }
  const rp = (name, fn, expected = false) => { const p = clone(pull); fn(p); sem(name, () => assert.equal(validPull(p, '9007199254740992', '1'), expected)); };
  rp('full group past Number precision', () => {}, true);
  rp('epoch mismatch', p => p.meta.privacyEpoch = '2');
  rp('partial group count', p => p.data[0].changeCount = 2);
  rp('change beyond own commit', p => p.data[0].changes[0].sequence = '9007199254740995');
  rp('commit beyond fixed high-water', p => p.data[0].committedThrough = '9007199254740995');
  rp('mismatched payload ID', p => p.data[0].changes[0].payload.id = id(88));
  rp('mismatched payload version', p => p.data[0].changes[0].version = 2);
  rp('duplicate group', p => p.data.push(clone(p.data[0])));
  rp('duplicate/out-of-order change', p => { p.data[0].changes.push(clone(change)); p.data[0].changeCount = 2; });
  rp('empty caught-up page allowed', p => p.data = [], true);
  for (const [v, ok] of [['9223372036854775807', true], ['9223372036854775808', false], ['01', false], ['1e4', false], ['-1', false]])
    sem(`decimal range ${v}`, () => assert.equal(bigint(v), ok));
  function validPages(m, pages) {
    if (pages.length !== m.pageCount || m.pageCount < 1 || !bigint(m.privacyEpoch, true) || !bigint(m.highWater)) return false;
    const keys = []; let previous = '';
    for (let i = 0; i < pages.length; i++) {
      const p = pages[i]; const x = p.meta;
      if (x.snapshotId !== m.snapshotId || x.privacyEpoch !== m.privacyEpoch || x.highWater !== m.highWater || x.contractVersion !== 2
        || x.pageIndex !== i || x.pageCount !== m.pageCount || (i === pages.length - 1 ? x.nextCursor !== null : !x.nextCursor)) return false;
      for (const r of p.data) {
        const k = `${r.entity}/${r.entityId}`;
        if (k <= previous || r.entityId !== r.payload.id || r.version !== r.payload.version) return false;
        previous = k; keys.push(k);
      }
    }
    return new Set(keys).size === keys.length;
  }
  sem('complete snapshot page metadata', () => assert.equal(validPages(meta, [page]), true));
  for (const changes of [{ pageIndex: 1 }, { privacyEpoch: '2' }, { highWater: '0' }, { snapshotId: id(77) }, { nextCursor: 'loop' }])
    sem(`snapshot mismatch ${JSON.stringify(changes)}`, () => assert.equal(validPages(meta, [{ ...page, meta: { ...page.meta, ...changes } }]), false));
  sem('snapshot duplicate record prevents install', () => assert.equal(validPages(meta, [{ ...page, data: [record, record] }]), false));
  sem('empty snapshot has one page', () => assert.equal(validPages(meta, [{ ...page, data: [] }]), true));
  function validExport(x) {
    const m = x.manifest;
    const plans = x.pages.flatMap(p => p.plans);
    return x.pages.length === m.pageCount && plans.length === m.planCount && m.pageCount >= 1
      && x.pages.every((p, i) => p.pageIndex === i) && plans.every(p => ['active', 'archived'].includes(p.state))
      && plans.every((p, i) => i === 0 || plans[i - 1].id < p.id);
  }
  sem('export archived included', () => assert.equal(validExport({ manifest, pages: [{ ...exportSection.pages[0], plans: [{ ...plan, state: 'archived' }] }] }), true));
  sem('export count mismatch', () => assert.equal(validExport({ ...exportSection, manifest: { ...manifest, planCount: 2 } }), false));
  sem('export deleted excluded', () => assert.equal(validExport({ manifest, pages: [{ ...exportSection.pages[0], plans: [{ ...plan, state: 'deleted' }] }] }), false));
  sem('zero export requires one empty page', () => assert.equal(validExport({ manifest: { ...manifest, planCount: 0 }, pages: [{ pageIndex: 0, plans: [] }] }), true));
  // Synthetic opaque-cursor metadata oracle; not actual parsing/signature/auth.
  const eligible = (c, owner, epoch, protocol) => c.owner === owner && c.epoch === epoch && c.protocol === protocol;
  const c = { owner: 'alice', epoch: '1', protocol: 2 };
  for (const [owner, ep, protocol, ok] of [['alice', '1', 2, true], ['bob', '1', 2, false], ['alice', '2', 2, false], ['alice', '1', 1, false]])
    sem(`cursor binding ${owner}/${ep}/${protocol}`, () => assert.equal(eligible(c, owner, ep, protocol), ok));
  const normalize = m => ({ mutationId: m.mutationId, command: m.command, targetId: m.targetId, body: m.body });
  sem('epoch/envelope is not domain intent', () => assert.deepEqual(normalize({ ...action, epoch: '1' }), normalize({ ...action, epoch: '2' })));
  const processEpochs = (accepted, epochs) => epochs.map((ep, i) => epochs.slice(0, i + 1).every(x => x === accepted) ? 'process' : 'reset');
  sem('mid-batch epoch change prevents later work', () => assert.deepEqual(processEpochs('1', ['1', '2', '2']), ['process', 'reset', 'reset']));
  const coherent = records => {
    const tasks = new Set(records.filter(r => r.entity === 'task').map(r => r.entityId));
    const reminders = new Map(records.filter(r => r.entity === 'reminder').map(r => [r.entityId, r.payload]));
    return records.filter(r => r.entity === 'plan').every(r => r.payload.blocks.filter(b => b.kind === 'focus').every(b => {
      if (!tasks.has(b.taskId)) return false;
      if (b.reminderId === null) return true;
      const rem = reminders.get(b.reminderId); return rem && rem.taskId === b.taskId && rem.deletedAt === null;
    }));
  };
  const linked = { ...record, payload: { ...plan, blocks: [{ ...plan.blocks[0], reminderId: id(5) }] } };
  const taskRecord = { entity: 'task', entityId: id(4), payload: { id: id(4) } }; // reference-only, not a Task DTO fixture
  const reminderRecord = { entity: 'reminder', entityId: id(5), payload: { id: id(5), taskId: id(4), deletedAt: null } };
  sem('half group has dangling reference', () => assert.equal(coherent([taskRecord, linked]), false));
  sem('whole group resolves companion references', () => assert.equal(coherent([taskRecord, linked, reminderRecord]), true));

  function resolve(ref, from) {
    const [base, pointer = ''] = ref.split('#'); const f = base ? aliases.get(base) ?? base : from;
    let v = files.get(f); assert.ok(v, `unknown ref file ${f}`);
    for (const k of pointer.split('/').filter(Boolean)) v = v?.[k.replace(/~1/g, '/').replace(/~0/g, '~')];
    assert.notEqual(v, undefined, `unresolved ${ref}`); return v;
  }
  function walk(v, f) { if (!v || typeof v !== 'object') return; if (v.$ref) { resolve(v.$ref, f); references++; } for (const x of Object.values(v)) walk(x, f); }
  for (const [f, v] of files) walk(v, f);
  const routes = {
    'RP-01': ['POST /replication/v2/push', 'PushInput', 'PushResponse', '200', null],
    'RP-02': ['GET /replication/v2/pull', null, 'PullResponse', '200', 'PullQuery'],
    'RP-03': ['POST /replication/v2/snapshots', 'SnapshotCreate', 'SnapshotAccepted', '202', null],
    'RP-04': ['GET /replication/v2/snapshots/{id}', null, 'SnapshotStatus', '200', null],
    'RP-05': ['GET /replication/v2/snapshots/{id}/pages', null, 'SnapshotPage', '200', 'PageQuery'],
    'RP-06': ['GET /plans', null, 'PlanList', '200', 'PlanListQuery'],
  };
  const pairs = new Set(), ids = new Set(), rpIds = new Set();
  for (const name of apis) {
    const api = files.get(`${name}.openapi.json`); assert.equal(api.openapi, '3.1.1'); assert.equal(api.servers[0].url, '/v1');
    for (const [url, item] of Object.entries(api.paths)) for (const [method, op] of Object.entries(item)) {
      if (!['get', 'post', 'patch', 'put', 'delete'].includes(method)) continue;
      const pair = `${method.toUpperCase()} ${url}`;
      assert.ok(!pairs.has(pair) && !ids.has(op.operationId)); pairs.add(pair); ids.add(op.operationId);
      if (name !== 'replication-v2') continue;
      const rp = op['x-replication-id']; assert.ok(routes[rp] && !rpIds.has(rp)); rpIds.add(rp);
      const [expectedPair, input, output, status, query] = routes[rp]; assert.equal(pair, expectedPair);
      assert.deepEqual(op.security ?? api.security, [{ UserBearer: [] }]);
      assert.equal(op['x-active-account-required'], true); assert.equal(op['x-unknown-query-keys'], 'reject');
      assert.deepEqual(Object.keys(op.responses).sort(), [status, 'default'].sort());
      assert.equal(op.responses[status].content['application/json'].schema.$ref, `replication-v2.schema.json#/definitions/${output}`);
      assert.equal(op.responses[status].headers['Cache-Control'].schema.const, 'private, no-store');
      const error = resolve(op.responses.default.$ref, `${name}.openapi.json`);
      assert.equal(error.headers['Cache-Control'].schema.const, 'private, no-store');
      assert.equal(error.content['application/json'].schema.$ref, 'personal-api.schema.json#/definitions/Error');
      if (input) {
        assert.equal(op.requestBody.required, true); assert.equal(op['x-max-body-bytes'], 65536);
        assert.equal(op.requestBody.content['application/json'].schema.$ref, `replication-v2.schema.json#/definitions/${input}`);
      } else assert.equal(op.requestBody, undefined);
      const hp = op.parameters.filter(p => p.in === 'header');
      assert.deepEqual(hp.map(p => p.name), input ? ['Idempotency-Key'] : rp === 'RP-06' ? ['Plan-Contract-Version'] : []);
      for (const p of op.parameters.filter(p => p.in !== 'query')) {
        assert.equal(p.required, true); assert.deepEqual(p.schema, p.name === 'Plan-Contract-Version' ? { type: 'integer', const: 2 } : { type: 'string', format: 'uuid' });
      }
      assert.deepEqual(op.parameters.filter(p => p.in === 'path').map(p => p.name), url.includes('{id}') ? ['id'] : []);
      const qp = op.parameters.filter(p => p.in === 'query');
      assert.deepEqual(qp.map(p => p.name), query ? Object.keys(schema.definitions[query].properties) : []);
      for (const p of qp) { assert.deepEqual(p.schema, schema.definitions[query].properties[p.name]); assert.equal(p.required, schema.definitions[query].required.includes(p.name)); }
    }
  }
  assert.equal(pairs.size, 60); assert.equal(ids.size, 60); assert.equal(rpIds.size, 6);
  const doc = read('27-PLAN-REPLICATION-SNAPSHOT-EXPORT-WIRE.md');
  assert.equal([...doc.matchAll(/^\| RP-T\d{2} \|/gm)].length, 12);
  for (const row of doc.matchAll(/^\| (RP-\d{2}) \| `([^`]+)`/gm)) assert.equal(row[2], routes[row[1]][0]);
  console.log(JSON.stringify({ status: failures.length ? 'FAIL' : 'PASS', definitions: Object.keys(schema.definitions).length,
    dtoCases, semanticCases, commandKinds: commands.length + 4, entityKinds: 7, combinedOperations: pairs.size,
    selectedOperations: rpIds.size, references, scope: 'Shapes, refs, metadata and synthetic examples only; no runtime/crypto/security proof', failures }, null, 2));
  process.exitCode = failures.length ? 1 : 0;
} catch (e) { console.error(JSON.stringify({ status: 'CHECKER_ERROR', message: e.message })); process.exitCode = 2; }
