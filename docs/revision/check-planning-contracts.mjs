// Read-only draft DTO/semantic examples. NOT application, provider, SQL or security tests.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';
import assert from 'node:assert/strict';
import { isDeepStrictEqual } from 'node:util';

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (p) => fs.readFileSync(path.join(here, p), 'utf8');
const requireLocal = createRequire(path.resolve(here, '../../package.json'));
const failures = [];
let dtoFixtures = 0; let semanticCases = 0; let resolvedReferences = 0;
const test = (name, run) => { try { run(); } catch (e) { failures.push(`${name}: ${e.message}`); } };
const copy = (v) => JSON.parse(JSON.stringify(v));
const id = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
try {
  const schemaFiles = ['personal-api', 'backend-extensions', 'operations-api', 'rewards-ai', 'planning'].map((n) => `${n}.schema.json`);
  const apiFiles = ['personal-api', 'personal-extensions', 'operations-api', 'rewards-ai', 'planning'].map((n) => `${n}.openapi.json`);
  const docs = new Map([...schemaFiles, ...apiFiles].map((f) => [f, JSON.parse(read(`contracts/${f}`))]));
  const Ajv = requireLocal('ajv');
  const ajv = new Ajv({ allErrors: true, jsonPointers: true, format: 'full' });
  const aliases = new Map();
  for (const f of schemaFiles) { const s = docs.get(f); ajv.addSchema(s); aliases.set(s.$id, f); }
  const planning = docs.get('planning.schema.json');
  for (const n of Object.keys(planning.definitions)) assert.ok(ajv.getSchema(`${planning.$id}#/definitions/${n}`));
  const checkShape = (name, value, expected, label, file = 'planning.schema.json') => {
    dtoFixtures += 1;
    test(label, () => {
      const validate = ajv.getSchema(`${docs.get(file).$id}#/definitions/${name}`);
      assert.equal(Boolean(validate(value)), expected, JSON.stringify(validate.errors));
    });
  };
  const start = '2026-09-19T03:00:00.000Z';
  const end = '2026-09-19T05:00:00.000Z';
  const focus = { id: id(10), kind: 'focus', taskId: id(1), startsAt: start,
    endsAt: '2026-09-19T03:25:00.000Z', reminderId: id(40) };
  const rest = { id: id(11), kind: 'break', afterBlockId: id(10), startsAt: focus.endsAt,
    endsAt: '2026-09-19T03:30:00.000Z' };
  const second = { ...focus, id: id(12), startsAt: rest.endsAt, endsAt: '2026-09-19T03:55:00.000Z', reminderId: null };
  const plan = { id: id(20), workspaceId: id(2), localDate: '2026-09-19', timeZone: 'Asia/Colombo',
    availableStart: start, availableEnd: end, explanation: 'Synthetic planning example.', blocks: [focus, rest, second] };
  const input = { requestId: id(50), taskIds: [id(1)], availableStart: start, availableEnd: end,
    timeZone: 'Asia/Colombo', preferences: { defaultFocusMinutes: 25, defaultBreakMinutes: 5, reminderLeadMinutes: 0 } };
  const reminder = { id: id(41), command: 'reminder.create', targetId: id(40), dependsOn: [],
    payload: { id: id(40), taskId: id(1), scheduledFor: start, timeZone: 'Asia/Colombo', delivery: 'local_device' } };
  const planOp = { id: id(21), command: 'plan.create', targetId: id(20), dependsOn: [id(41)], payload: plan };
  const proposal = { contractVersion: 2, id: id(60), version: 1, generationRequestId: id(50), actionType: 'plan_my_day',
    expiresAt: end, reviewDigest: 'a'.repeat(64), state: 'ready',
    inputVersions: [{ entity: 'task', entityId: id(1), version: 2 }], operations: [reminder, planOp] };
  const pending = { requestId: id(50), actionType: 'plan_my_day', version: 1, createdAt: '2026-09-19T02:00:00.000Z',
    updatedAt: '2026-09-19T02:00:00.000Z', deadlineAt: '2026-09-19T02:05:00.000Z',
    status: 'pending', completedAt: null, result: null, failureCode: null, reservedActions: 1, consumedActions: 0 };
  const completed = { ...pending, version: 2, status: 'completed', updatedAt: '2026-09-19T02:01:00.000Z',
    completedAt: '2026-09-19T02:01:00.000Z', result: { proposalId: id(60), contractVersion: 2 }, reservedActions: 0, consumedActions: 1 };
  const failed = { ...completed, status: 'failed', result: null, failureCode: 'INVALID_OUTPUT', consumedActions: 0 };
  const cancelled = { ...failed, status: 'cancelled', failureCode: null };
  const revision = { expectedProposalVersion: 1, reviewDigest: 'a'.repeat(64), replacements: [{ operationId: id(21), payload: plan }] };
  const receipt = { data: { proposalId: id(60), previousVersion: 1, proposalVersion: 2,
    reviewDigest: 'b'.repeat(64), mutationId: id(70), revisedAt: completed.completedAt } };
  const saved = { data: {
    plan: { ...plan, version: 1, state: 'active', createdAt: completed.completedAt,
      updatedAt: completed.completedAt, sourceProposalId: id(60) },
    boundReminders: [{ ...reminder.payload, enabled: true, version: 1,
      updatedAt: completed.completedAt, deletedAt: null }],
  } };
  const positives = [
    ['FocusBlock', focus], ['BreakBlock', rest], ['PlanCreate', plan], ['PlanGenerationInput', input],
    ['PlanGenerationInput', { ...input, preferences: { ...input.preferences, defaultBreakMinutes: 0, reminderLeadMinutes: null } }],
    ...[pending, completed, failed, cancelled].map((data) => ['RequestResponse', { data }]),
    ['PendingResponse', { data: pending }], ['TerminalResponse', { data: completed }],
    ['CancelResponse', { data: { mutationId: id(70), outcome: 'cancelled', request: cancelled } }],
    ['CancelResponse', { data: { mutationId: id(70), outcome: 'already_terminal', request: completed } }],
    ['ProposalRevisionInput', revision], ['RevisionResponse', receipt], ['PlanResponse', saved], ['Empty', {}],
  ];
  for (const [n, value] of positives) {
    checkShape(n, value, true, `valid ${n}`);
    checkShape(n, { ...value, ownerId: id(99) }, false, `${n} forbids injected owner`);
  }
  for (const [n, value] of [['PlanCreate', plan], ['PlanGenerationInput', input], ['FocusBlock', focus], ['BreakBlock', rest]]) {
    for (const key of Object.keys(value)) { const v = copy(value); delete v[key]; checkShape(n, v, false, `${n} requires ${key}`); }
  }
  const negatives = [
    ['PlanCreate', { ...plan, blocks: [] }], ['PlanCreate', { ...plan, blocks: [rest] }],
    ['FocusBlock', { ...focus, status: 'completed' }], ['BreakBlock', { ...rest, taskId: id(1) }],
    ['PlanGenerationInput', { ...input, taskIds: [id(1), id(1)] }],
    ['PlanGenerationInput', { ...input, taskIds: [] }],
    ['PlanGenerationInput', { ...input, availableStart: '2026-09-19T08:30:00+05:30' }],
    ['PlanGenerationInput', { ...input, preferences: { ...input.preferences, defaultFocusMinutes: '25' } }],
    ['PlanGenerationInput', { ...input, preferences: { ...input.preferences, defaultFocusMinutes: 0 } }],
    ['PlanGenerationInput', { ...input, preferences: { ...input.preferences, defaultBreakMinutes: -1 } }],
    ['PlanGenerationInput', { ...input, preferences: { ...input.preferences, provider: 'client-choice' } }],
    ['RequestResponse', { data: { ...pending, consumedActions: 1 } }],
    ['RequestResponse', { data: { ...completed, result: null } }],
    ['RequestResponse', { data: { ...failed, consumedActions: 1 } }],
    ['RequestResponse', { data: { ...cancelled, failureCode: 'INTERNAL_FAILURE' } }],
    ['RequestResponse', { data: { ...completed, result: { ...completed.result, rawPrompt: 'private' } } }],
    ['RequestResponse', { data: { ...pending, actionType: 'break_down_task' } }],
    ['PendingResponse', { data: completed }], ['TerminalResponse', { data: pending }],
    ['CancelResponse', { data: { mutationId: id(70), outcome: 'cancelled', request: completed } }],
    ['CancelResponse', { data: { mutationId: id(70), outcome: 'already_terminal', request: cancelled } }],
    ['ProposalRevisionInput', { ...revision, replacements: [] }],
    ['ProposalRevisionInput', { ...revision, replacements: [{ ...revision.replacements[0], command: 'plan.create' }] }],
    ['PlanResponse', { data: { ...saved.data, xp: 100 } }],
  ];
  negatives.forEach(([n, v], i) => checkShape(n, v, false, `negative ${i + 1} ${n}`));
  checkShape('ReviewableProposal', proposal, true, 'v2 complete plan proposal', 'rewards-ai.schema.json');
  checkShape('ReviewableProposal', { ...proposal, contractVersion: 1 }, false, 'v1 cannot carry plan command', 'rewards-ai.schema.json');
  checkShape('ReviewableProposal', { ...proposal, actionType: 'break_down_task' }, false, 'v2 is not hierarchy admission', 'rewards-ai.schema.json');
  checkShape('ReviewableProposal', { ...proposal, operations: [reminder] }, false, 'v2 requires plan', 'rewards-ai.schema.json');
  checkShape('ReviewableProposal', { ...proposal, contractVersion: 3 }, false, 'future version not accepted', 'rewards-ai.schema.json');
  checkShape('ApplyResult', { operationId: id(21), command: 'plan.create', targetId: id(20), entityVersion: 1 }, true, 'plan apply receipt result', 'rewards-ai.schema.json');
  checkShape('ReviewableProposal', { ...proposal, operations: [reminder, { id: id(90), command: 'task.patch', targetId: id(1), dependsOn: [], payload: { expectedVersion: 2, title: 'Not a v2 command' } }, planOp] }, false, 'v2 forbids task changes', 'rewards-ai.schema.json');
  const apiText = fs.readFileSync(path.join(here, '../API_SPEC.md'), 'utf8');
  const generationSection = apiText.split('### 3. Generate Plan My Day Proposal')[1]?.split('### 4.')[0];
  const canonicalExample = JSON.parse(generationSection.match(/```json\s*([\s\S]*?)```/)[1]);
  checkShape('PlanGenerationInput', canonicalExample, true, 'canonical API example matches current input schema');
  test('canonical example header agrees with body', () => assert.ok(generationSection.includes(`Idempotency-Key: ${canonicalExample.requestId}`)));

  // Deliberately limited reference oracles; they do not establish real authorization.
  const instant = (s) => typeof s === 'string' && /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}\.\d{3}Z$/.test(s)
    && Number.isFinite(Date.parse(s)) && new Date(s).toISOString() === s;
  const zone = (z) => { try { if (z !== 'UTC' && !z.includes('/')) return false; new Intl.DateTimeFormat('en', { timeZone: z }).format(); return true; } catch { return false; } };
  const localDate = (s, z) => {
    const parts = Object.fromEntries(new Intl.DateTimeFormat('en', { timeZone: z, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(new Date(s)).map((p) => [p.type, p.value]));
    return `${parts.year}-${parts.month}-${parts.day}`;
  };
  function schedule(p) {
    if (!zone(p.timeZone) || !instant(p.availableStart) || !instant(p.availableEnd)) return false;
    const from = Date.parse(p.availableStart), to = Date.parse(p.availableEnd);
    if (to <= from || to - from > 172800000 || localDate(p.availableStart, p.timeZone) !== p.localDate) return false;
    const seen = new Set(); let previous;
    for (const b of p.blocks) {
      if (seen.has(b.id) || !instant(b.startsAt) || !instant(b.endsAt)) return false;
      const a = Date.parse(b.startsAt), z = Date.parse(b.endsAt);
      if (a < from || z > to || a >= z || (previous && a < Date.parse(previous.endsAt))) return false;
      if (b.kind === 'break' && (!previous || previous.kind !== 'focus' || b.afterBlockId !== previous.id || b.startsAt !== previous.endsAt)) return false;
      seen.add(b.id); previous = b;
    }
    return p.blocks.some((b) => b.kind === 'focus');
  }
  function binding(p) {
    const plans = p.operations.filter((o) => o.command === 'plan.create');
    if (p.contractVersion !== 2 || plans.length !== 1 || p.operations.at(-1).command !== 'plan.create' || !schedule(plans[0].payload)) return false;
    if (new Set(p.operations.map((o) => o.id)).size !== p.operations.length || new Set(p.operations.map((o) => o.targetId)).size !== p.operations.length) return false;
    if (new Set(p.inputVersions.map((v) => `${v.entity}:${v.entityId}`)).size !== p.inputVersions.length) return false;
    const seen = new Set(); const reminders = new Map();
    const pinned = new Set(p.inputVersions.filter((v) => v.entity === 'task').map((v) => v.entityId));
    for (const op of p.operations) {
      if (!['plan.create', 'reminder.create'].includes(op.command) || op.targetId !== op.payload.id || !op.dependsOn.every((v) => seen.has(v))) return false;
      if (op.command === 'reminder.create') {
        if (!pinned.has(op.payload.taskId)) return false;
        reminders.set(op.targetId, op);
      } else {
        const required = []; const bound = new Set();
        for (const b of op.payload.blocks.filter((b) => b.kind === 'focus')) {
          if (!pinned.has(b.taskId)) return false;
          if (b.reminderId === null) continue;
          const r = reminders.get(b.reminderId);
          if (!r || bound.has(b.reminderId) || r.payload.taskId !== b.taskId || r.payload.timeZone !== op.payload.timeZone ||
              Date.parse(r.payload.scheduledFor) > Date.parse(b.startsAt)) return false;
          bound.add(b.reminderId); required.push(r.id);
        }
        if (op.dependsOn.length !== required.length || !required.every((v) => op.dependsOn.includes(v))) return false;
      }
      seen.add(op.id);
    }
    return true;
  }
  function statusTime(r) {
    if (![r.createdAt, r.updatedAt, r.deadlineAt].every(instant)) return false;
    if (r.deadlineAt <= r.createdAt || r.updatedAt < r.createdAt) return false;
    if (r.status === 'pending') return r.completedAt === null;
    if (!instant(r.completedAt) || r.completedAt < r.createdAt || r.updatedAt < r.completedAt) return false;
    return r.status !== 'completed' || r.completedAt < r.deadlineAt;
  }
  const sem = (name, actual, expected) => { semanticCases += 1; test(name, () => assert.equal(actual, expected)); };
  sem('valid schedule', schedule(plan), true);
  sem('invalid calendar date', instant('2026-02-30T00:00:00.000Z'), false);
  sem('unknown zone', schedule({ ...plan, timeZone: 'Not/AZone' }), false);
  sem('ambiguous abbreviation is not zone', zone('CST'), false);
  sem('wrong local calendar date', schedule({ ...plan, localDate: '2026-09-20' }), false);
  sem('reversed availability', schedule({ ...plan, availableEnd: start }), false);
  sem('excessive window', schedule({ ...plan, availableEnd: '2026-09-22T05:00:00.000Z' }), false);
  sem('duplicate blocks', schedule({ ...plan, blocks: [focus, focus] }), false);
  sem('out of order', schedule({ ...plan, blocks: [second, focus] }), false);
  sem('overlapping blocks', schedule({ ...plan, blocks: [focus, { ...second, startsAt: start }] }), false);
  sem('zero length', schedule({ ...plan, blocks: [{ ...focus, endsAt: start }] }), false);
  sem('outside window', schedule({ ...plan, blocks: [{ ...focus, endsAt: '2026-09-19T06:00:00.000Z' }] }), false);
  sem('orphan break', schedule({ ...plan, blocks: [rest, second] }), false);
  sem('wrong preceding block', schedule({ ...plan, blocks: [focus, { ...rest, afterBlockId: id(99) }] }), false);
  sem('gaps stay unallocated', schedule({ ...plan, blocks: [focus, { ...second, startsAt: '2026-09-19T03:40:00.000Z' }] }), true);
  sem('no final break required', schedule({ ...plan, blocks: [focus] }), true);
  sem('valid captured task/reminder binding', binding(proposal), true);
  const mutated = (fn) => { const p = copy(proposal); fn(p); return p; };
  sem('uncaptured task', binding(mutated((p) => { p.inputVersions = []; })), false);
  sem('missing reminder dependency', binding(mutated((p) => { p.operations[1].dependsOn = []; })), false);
  sem('duplicate plan operations', binding(mutated((p) => { p.operations.push(copy(p.operations[1])); })), false);
  sem('late reminder', binding(mutated((p) => { p.operations[0].payload.scheduledFor = end; })), false);
  sem('reminder zone mismatch', binding(mutated((p) => { p.operations[0].payload.timeZone = 'UTC'; })), false);
  sem('duplicate reminder binding', binding(mutated((p) => { p.operations[1].payload.blocks[2].reminderId = id(40); })), false);
  sem('unknown reminder binding', binding(mutated((p) => { p.operations[1].payload.blocks[0].reminderId = id(99); })), false);
  sem('clear reminder and recompute dependencies', binding(mutated((p) => { p.operations[1].payload.blocks[0].reminderId = null; p.operations[1].dependsOn = []; })), true);
  sem('duplicate captured version', binding(mutated((p) => { p.inputVersions.push(copy(p.inputVersions[0])); })), false);
  const selected = (p, ids) => ids.length > 0 && new Set(ids).size === ids.length && ids.every((n) =>
    p.operations.some((o) => o.id === n && o.dependsOn.every((dependency) => ids.includes(dependency))));
  sem('whole plan with explicit reminder', selected(proposal, [id(21), id(41)]), true);
  sem('plan missing explicit reminder dependency', selected(proposal, [id(21)]), false);
  sem('standalone reminder only is possible', selected(proposal, [id(41)]), true);
  sem('unknown selected command', selected(proposal, [id(99)]), false);
  function revisionAllowed(p, request) {
    if (request.expectedProposalVersion !== p.version || request.reviewDigest !== p.reviewDigest ||
        new Set(request.replacements.map((r) => r.operationId)).size !== request.replacements.length) return false;
    const next = copy(p); let changed = false;
    for (const r of request.replacements) {
      const op = next.operations.find((o) => o.id === r.operationId);
      if (!op || r.payload.id !== op.payload.id) return false;
      if (op.command === 'plan.create') {
        for (const key of ['workspaceId', 'localDate', 'timeZone', 'availableStart', 'availableEnd']) if (r.payload[key] !== op.payload[key]) return false;
        if (!Array.isArray(r.payload.blocks) || r.payload.blocks.some((b) => !op.payload.blocks.some((old) => old.id === b.id && old.kind === b.kind))) return false;
      } else if (op.command !== 'reminder.create' || r.payload.delivery !== op.payload.delivery) return false;
      if (!isDeepStrictEqual(op.payload, r.payload)) changed = true;
      op.payload = copy(r.payload);
    }
    const planOperation = next.operations.find((o) => o.command === 'plan.create');
    const required = new Set(planOperation.payload.blocks.filter((b) => b.kind === 'focus' && b.reminderId !== null).map((b) => b.reminderId));
    planOperation.dependsOn = next.operations.filter((o) => o.command === 'reminder.create' && required.has(o.targetId)).map((o) => o.id);
    return changed && binding(next);
  }
  const edit = (payload) => ({ ...revision, replacements: [{ operationId: id(21), payload }] });
  sem('manual edit without new generation', revisionAllowed(proposal, edit({ ...plan, explanation: 'Revised synthetic note.' })), true);
  sem('no-op revision rejects', revisionAllowed(proposal, revision), false);
  sem('revision cannot change workspace', revisionAllowed(proposal, edit({ ...plan, workspaceId: id(99) })), false);
  sem('revision cannot change availability silently', revisionAllowed(proposal, edit({ ...plan, availableEnd: '2026-09-19T06:00:00.000Z' })), false);
  sem('revision cannot invent a block', revisionAllowed(proposal, edit({ ...plan, blocks: [{ ...focus, id: id(99) }] })), false);
  sem('revision can remove final focus block', revisionAllowed(proposal, edit({ ...plan, blocks: [focus, rest] })), true);
  sem('revision cannot leave orphan break', revisionAllowed(proposal, edit({ ...plan, blocks: [rest, second] })), false);
  sem('revision removes reminder binding explicitly', revisionAllowed(proposal, edit({ ...plan, blocks: [{ ...focus, reminderId: null }, rest, second] })), true);
  sem('stale proposal revision rejects', revisionAllowed(proposal, { ...edit({ ...plan, explanation: 'Changed' }), expectedProposalVersion: 9 }), false);
  sem('duplicate replacement IDs reject', revisionAllowed(proposal, { ...revision, replacements: [revision.replacements[0], revision.replacements[0]] }), false);
  for (const r of [pending, completed, failed, cancelled]) sem(`valid ${r.status} chronology`, statusTime(r), true);
  sem('late successful publication', statusTime({ ...completed, completedAt: pending.deadlineAt, updatedAt: pending.deadlineAt }), false);
  sem('backdated completion', statusTime({ ...completed, completedAt: '2026-09-18T00:00:00.000Z' }), false);
  sem('generation header/body equality', input.requestId === id(50), true);
  sem('mismatched generation key', input.requestId === id(51), false);
  sem('revision counter advances once', receipt.data.proposalVersion === receipt.data.previousVersion + 1, true);
  const safeMinuteConversion = (n) => Number.isSafeInteger(n) && n >= 0 && Number.isSafeInteger(n * 60000);
  sem('exact minute conversion', safeMinuteConversion(25) && 25 * 60000 === 1500000, true);
  sem('unsafe multiplied duration rejects', safeMinuteConversion(Number.MAX_SAFE_INTEGER), false);
  // Explicit instants through the repeated New York hour; no wall-time guessing.
  const dstPlan = { ...plan, localDate: '2026-11-01', timeZone: 'America/New_York',
    availableStart: '2026-11-01T05:00:00.000Z', availableEnd: '2026-11-01T07:00:00.000Z',
    blocks: [{ ...focus, startsAt: '2026-11-01T05:30:00.000Z', endsAt: '2026-11-01T06:30:00.000Z', reminderId: null }] };
  sem('fall-back repeated hour preserves elapsed hour', schedule(dstPlan), true);
  sem('fall-back actual elapsed milliseconds', Date.parse(dstPlan.blocks[0].endsAt) - Date.parse(dstPlan.blocks[0].startsAt) === 3600000, true);
  const night = { ...plan, availableStart: '2026-09-19T18:00:00.000Z', availableEnd: '2026-09-19T20:00:00.000Z',
    blocks: [{ ...focus, startsAt: '2026-09-19T18:00:00.000Z', endsAt: '2026-09-19T19:00:00.000Z', reminderId: null }] };
  sem('Colombo cross-midnight window keeps start date', schedule(night), true);

  function resolve(ref, file) {
    const [target, fragment = ''] = ref.split('#');
    const name = aliases.get(target) ?? (target || file);
    let value = docs.get(name);
    assert.ok(value, `Unknown reference ${ref}`);
    assert.ok(!fragment || fragment.startsWith('/'), `Non-pointer ref ${ref}`);
    for (const part of fragment.split('/').slice(1)) {
      const key = part.replace(/~1/g, '/').replace(/~0/g, '~');
      assert.ok(value && Object.hasOwn(value, key), `Missing ref ${ref}`); value = value[key];
    }
    resolvedReferences += 1; return value;
  }
  function walk(v, f) {
    if (!v || typeof v !== 'object') return;
    if (v.$ref) resolve(v.$ref, f);
    Object.values(v).forEach((child) => walk(child, f));
  }
  test('all local/URN references resolve', () => docs.forEach(walk));
  const pairs = new Set(), operationIds = new Set(), extensionIds = new Set(), planningIds = new Set();
  const wanted = {
    'PG-01': ['POST /ai/plan-my-day', 'PlanGenerationInput', { 200: 'TerminalResponse', 202: 'PendingResponse' }],
    'PG-02': ['GET /ai/requests/{requestId}', null, { 200: 'RequestResponse' }],
    'PG-03': ['POST /ai/requests/{requestId}/cancel', 'Empty', { 200: 'CancelResponse' }],
    'PG-04': ['POST /ai/proposals/{id}/revisions', 'ProposalRevisionInput', { 200: 'RevisionResponse' }],
    'PG-05': ['GET /plans/{id}', null, { 200: 'PlanResponse' }],
  };
  for (const file of apiFiles) {
    const api = docs.get(file);
    test(`API header ${file}`, () => { assert.equal(api.openapi, '3.1.1'); assert.equal(api.servers.length, 1); assert.equal(api.servers[0].url, '/v1'); });
    for (const [route, item] of Object.entries(api.paths)) for (const method of ['get', 'post', 'put', 'patch', 'delete', 'head', 'options', 'trace']) {
      const op = item[method]; if (!op) continue;
      const pair = `${method.toUpperCase()} ${route}`;
      test(`unique/auth ${pair}`, () => {
        assert.ok(!pairs.has(pair) && op.operationId && !operationIds.has(op.operationId));
        const security = op.security ?? api.security;
        if (op['x-registry-id'] !== 'EX-22') assert.deepEqual(security, [{ UserBearer: [] }]);
        else assert.deepEqual(security, [{ UserBearer: [] }, { DeletionStatusReceipt: [] }]);
      });
      pairs.add(pair); operationIds.add(op.operationId);
      if (op['x-registry-id']) { test(`unique EX ${pair}`, () => assert.ok(!extensionIds.has(op['x-registry-id']))); extensionIds.add(op['x-registry-id']); }
      if (file !== 'planning.openapi.json') continue;
      const pg = op['x-planning-id'];
      test(`mapping ${pg}`, () => {
        assert.ok(!planningIds.has(pg)); assert.ok(wanted[pg]); assert.equal(pair, wanted[pg][0]);
        assert.equal(op['x-active-account-required'], true); assert.equal(op['x-unknown-query-keys'], 'reject');
        const params = op.parameters;
        assert.ok(!params.some((p) => p.in === 'query'));
        const pathNames = [...route.matchAll(/\{([^}]+)\}/g)].map((m) => m[1]);
        assert.deepEqual(params.filter((p) => p.in === 'path').map((p) => p.name), pathNames);
        for (const p of params) {
          assert.equal(p.required, true);
          if (pg === 'PG-05' && p.name === 'Plan-Contract-Version') assert.deepEqual(p.schema, { type: 'integer', const: 2 });
          else assert.deepEqual(p.schema, { type: 'string', format: 'uuid' });
        }
        if (wanted[pg][1]) {
          assert.equal(op.requestBody.required, true);
          assert.equal(op.requestBody.content['application/json'].schema.$ref, `planning.schema.json#/definitions/${wanted[pg][1]}`);
          assert.deepEqual(params.filter((p) => p.in === 'header').map((p) => p.name), ['Idempotency-Key']);
        } else {
          assert.equal(op.requestBody, undefined);
          assert.deepEqual(params.filter((p) => p.in === 'header').map((p) => p.name), pg === 'PG-05' ? ['Plan-Contract-Version'] : []);
          if (pg === 'PG-05') assert.equal(op.responses['200'].headers['Plan-Contract-Version'].schema.const, 2);
        }
        assert.deepEqual(Object.keys(op.responses).sort(), [...Object.keys(wanted[pg][2]), 'default'].sort());
        for (const [code, n] of Object.entries(wanted[pg][2])) {
          assert.equal(op.responses[code].content['application/json'].schema.$ref, `planning.schema.json#/definitions/${n}`);
          assert.equal(op.responses[code].headers['Cache-Control'].schema.const, 'private, no-store');
        }
        const error = resolve(op.responses.default.$ref, file);
        assert.equal(error.content['application/json'].schema.$ref, 'personal-api.schema.json#/definitions/Error');
        assert.equal(error.headers['Cache-Control'].schema.const, 'private, no-store');
        if (pg === 'PG-01') { assert.equal(op['x-idempotency-key-equals'], 'requestId'); assert.ok(op.responses['202'].headers.Location); }
        if (pg === 'PG-04') assert.equal(op['x-generation-unit-debit'], 0);
      });
      planningIds.add(pg);
    }
  }
  test('complete five-slice coverage', () => {
    assert.equal(pairs.size, 52); assert.equal(operationIds.size, 52); assert.equal(extensionIds.size, 33);
    assert.deepEqual([...planningIds].sort(), Object.keys(wanted).sort());
    const contract = read('24-DAILY-PLAN-AND-GENERATION-WIRE-CONTRACT.md');
    const rows = [...contract.matchAll(/^\| (PG-\d{2}) \| `([^`]+)`/gm)];
    assert.equal(rows.length, 5);
    for (const row of rows) assert.equal(row[2], wanted[row[1]][0]);
    assert.equal([...contract.matchAll(/^\| DP-T\d{2} \|/gm)].length, 16);
  });
  console.log(JSON.stringify({ status: failures.length ? 'FAIL' : 'PASS', scope: 'Draft DTOs, references, wire metadata and semantic examples only; no runtime/security certification',
    definitions: Object.keys(planning.definitions).length, dtoFixtures, semanticCases, selectedOperations: planningIds.size,
    combinedOperations: pairs.size, coveredExtensionIds: extensionIds.size, resolvedReferences, failures }, null, 2));
  process.exitCode = failures.length ? 1 : 0;
} catch (error) {
  console.error(JSON.stringify({ status: 'CHECKER_ERROR', message: error.message })); process.exitCode = 2;
}
