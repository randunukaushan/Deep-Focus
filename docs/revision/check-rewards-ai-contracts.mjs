// Read-only DTO/wire fixtures and tiny semantic references; NOT app/security tests.
import fs from 'node:fs';
import path from 'node:path';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const here = path.dirname(fileURLToPath(import.meta.url));
const read = (name) => fs.readFileSync(path.join(here, name), 'utf8');
const requireLocal = createRequire(path.resolve(here, '../../package.json'));
const errors = [];
const check = (ok, message) => { if (!ok) errors.push(message); };
try {
  const Ajv = requireLocal('ajv');
  const ajv = new Ajv({ allErrors: true, jsonPointers: true, format: 'full' });
  const files = ['personal-api.schema.json', 'backend-extensions.schema.json',
    'operations-api.schema.json', 'rewards-ai.schema.json', 'planning.schema.json', 'personal-api.openapi.json',
    'personal-extensions.openapi.json', 'operations-api.openapi.json', 'rewards-ai.openapi.json'];
  const documents = new Map(files.map((file) => [file, JSON.parse(read(`contracts/${file}`))]));
  const schemas = files.filter((file) => file.endsWith('.schema.json')).map((file) => documents.get(file));
  schemas.forEach((schema) => ajv.addSchema(schema));
  const schema = documents.get('rewards-ai.schema.json');
  const extension = documents.get('backend-extensions.schema.json');
  const validate = (name) => ajv.getSchema(`${schema.$id}#/definitions/${name}`);
  Object.keys(schema.definitions).forEach((name) => check(Boolean(validate(name)), `Compile ${name}`));
  const id = (n) => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
  const at = '2026-09-19T00:00:00Z'; const end = '2026-09-20T00:00:00Z';
  const copy = (value) => JSON.parse(JSON.stringify(value));
  const meta = { status: 'current', asOf: at, sourceSequence: '9', ruleVersion: 'synthetic-only' };
  const unavailable = { status: 'unavailable', asOf: null, sourceSequence: null, ruleVersion: null };
  const summary = { totalXp: 0, level: 1, currentStreakDays: 0, longestStreakDays: 0,
    lastQualifyingDate: null, timeZone: 'Asia/Colombo', achievementCount: 0 };
  const reward = { data: { meta, summary } };
  const goal = { id: id(1), workspaceId: id(2), title: 'Synthetic goal', type: 'focus_time',
    period: 'custom', startsAt: at, endsAt: end, timeZone: 'Asia/Colombo', targetValue: 1000,
    targetUnit: 'ms', status: 'active', version: 1, createdAt: at, updatedAt: at };
  const progress = { data: { goal, meta, progress: { currentValue: 1500, contributionCount: 1 } } };
  const award = { id: id(3), ledgerSequence: '9', sourceType: 'focus_session', sourceId: id(4),
    awardKind: 'synthetic-award', ruleVersion: 'synthetic-only', recordedAt: at,
    kind: 'award', deltaXp: 1, correctsEntryId: null, reason: 'earned' };
  const correction = { ...award, id: id(5), ledgerSequence: '10', kind: 'correction',
    deltaXp: -1, correctsEntryId: id(3), reason: 'duplicate_grant_reversal' };
  const history = { data: [correction, award], meta: { nextCursor: null, ledgerHighWater: '10' } };
  const usage = { data: { status: 'current', policyVersion: 'synthetic-only', checkedAt: at,
    unit: 'action', availableActions: 3, reservedActions: 1,
    buckets: [{ source: 'free', availableActions: 2, reservedActions: 1 },
      { source: 'paid', availableActions: 1, reservedActions: 0 }],
    enabledActions: ['plan_my_day'], nextRefreshAt: null } };
  const unknown = { data: Object.fromEntries(Object.keys(usage.data).map((key) =>
    [key, key === 'status' ? 'unconfigured' : key === 'unit' ? 'action' : null])) };
  const create = { id: id(10), command: 'task.create', targetId: id(11), dependsOn: [],
    payload: { id: id(11), workspaceId: id(2), title: 'Synthetic task',
      description: null, priority: null, goalId: null, due: { kind: 'none' } } };
  const reminder = { id: id(12), command: 'reminder.create', targetId: id(13), dependsOn: [id(10)],
    payload: { id: id(13), taskId: id(11), scheduledFor: end, timeZone: 'Asia/Colombo', delivery: 'local_device' } };
  const patch = { id: id(14), command: 'task.patch', targetId: id(15), dependsOn: [],
    payload: { expectedVersion: 2, title: 'Synthetic changed task' } };
  const proposal = { contractVersion: 1, id: id(20), version: 1, generationRequestId: id(21),
    actionType: 'plan_my_day', expiresAt: end, reviewDigest: 'a'.repeat(64), state: 'ready',
    inputVersions: [], operations: [create, reminder] };
  const applied = { ...proposal, state: 'applied', appliedAt: at, selectedOperationIds: [id(10), id(12)] };
  delete applied.inputVersions; delete applied.operations;
  const receipt = { proposalId: id(20), proposalVersion: 1, reviewDigest: 'a'.repeat(64),
    mutationId: id(22), appliedAt: at, committedThrough: '12',
    results: proposal.operations.map((op) => ({ operationId: op.id, command: op.command,
      targetId: op.targetId, entityVersion: 1 })) };
  const confirmation = { expectedProposalVersion: 1, reviewDigest: 'a'.repeat(64), selectedOperationIds: [id(10), id(12)] };
  const fixtures = [];
  const add = (name, value, expected, label) => fixtures.push({ name, value, expected, label });
  const mutate = (name, source, edit, expected, label) => { const value = copy(source); edit(value); add(name, value, expected, label); };
  for (const [name, value] of [['RewardsResponse', reward], ['RewardHistoryResponse', history],
    ['GoalProgressResponse', progress], ['AiUsageResponse', usage], ['AiUsageResponse', unknown],
    ['ProposalResponse', { data: proposal }], ['ProposalResponse', { data: applied }],
    ['ProposalApplyResponse', { data: receipt }]]) {
    add(name, value, true, 'synthetic valid shape, not approved product amounts');
    add(name, { ...value, ownerId: id(90) }, false, 'unknown owner field');
    mutate(name, value, (v) => { v.data = null; }, false, 'whole data cannot be null');
  }
  for (const status of ['pending', 'stale']) add('RewardsResponse', { data: { meta: { ...meta, status }, summary } }, true, 'retained snapshot');
  add('RewardsResponse', { data: { meta: unavailable, summary: null } }, true, 'unknown is not zero');
  add('RewardsResponse', { data: { meta: unavailable, summary } }, false, 'unavailable cannot invent totals');
  add('RewardsResponse', { data: { meta, summary: null } }, false, 'current needs snapshot');
  for (const [key, value] of [['totalXp', -1], ['level', 0], ['achievementCount', 0.5], ['timeZone', '']]) {
    mutate('RewardsResponse', reward, (v) => { v.data.summary[key] = value; }, false, `invalid ${key}`);
  }
  mutate('RewardsResponse', reward, (v) => { v.data.summary.burnoutRisk = 1; }, false, 'no health inference');
  add('GoalProgressResponse', { data: { goal, meta: unavailable, progress: null } }, true, 'goal known, projection unavailable');
  mutate('GoalProgressResponse', progress, (v) => { v.data.goal.targetUnit = 'count'; }, false, 'time goal unit mismatch');
  mutate('GoalProgressResponse', progress, (v) => { v.data.progress.currentValue = 0.5; }, false, 'integer ms/count');
  mutate('GoalProgressResponse', progress, (v) => { v.data.goal.targetValue = 0; }, false, 'positive target');
  add('RewardEntry', correction, true, 'append-only correction');
  for (const [key, value] of [['deltaXp', -1], ['correctsEntryId', id(3)], ['reason', 'missed_day_penalty']]) {
    add('RewardEntry', { ...award, [key]: value }, false, `invalid award ${key}`);
  }
  add('RewardEntry', { ...correction, deltaXp: 0 }, false, 'no empty correction');
  add('RewardEntry', { ...correction, correctsEntryId: null }, false, 'correction reference required');
  add('RewardEntry', { ...award, ledgerSequence: 9 }, false, 'sequence string required');
  add('RewardEntry', { ...award, ledgerSequence: '0' }, false, 'real ledger entry has positive sequence');
  mutate('RewardHistoryResponse', history, (v) => { v.data = Array(101).fill(award); }, false, 'page bound');
  add('RewardHistoryResponse', { data: [], meta: { nextCursor: null, ledgerHighWater: '0' } }, true, 'real empty history');
  for (const status of ['unconfigured', 'unavailable']) add('AiUsageResponse', { data: { ...unknown.data, status } }, true, status);
  mutate('AiUsageResponse', unknown, (v) => { v.data.availableActions = 0; }, false, 'unknown is not zero allowance');
  mutate('AiUsageResponse', usage, (v) => { v.data.availableActions = -1; }, false, 'negative allowance');
  mutate('AiUsageResponse', usage, (v) => { v.data.enabledActions = ['plan_my_day', 'plan_my_day']; }, false, 'duplicate features');
  mutate('AiUsageResponse', usage, (v) => { v.data.buckets[0].verificationToken = 'synthetic'; }, false, 'no raw verification evidence');
  for (const op of [create, patch, reminder]) add('ProposalOperation', op, true, op.command);
  add('ProposalOperation', { ...create, command: 'goal.create' }, false, 'unsupported AI command');
  add('ProposalOperation', { ...create, payload: { ...create.payload, ownerId: id(90) } }, false, 'no forged owner');
  mutate('ProposalOperation', create, (v) => { delete v.payload.priority; }, false, 'effective create defaults must be reviewed');
  add('ProposalOperation', { ...create, payload: { ...create.payload, title: '<script>synthetic</script>' } }, true, 'text shape is not safe rendering proof');
  add('ProposalOperation', { ...patch, payload: { title: 'Missing version' } }, false, 'patch requires version');
  mutate('ProposalResponse', { data: proposal }, (v) => { v.data.operations = []; }, false, 'ready requires actions');
  mutate('ProposalResponse', { data: proposal }, (v) => { v.data.operations = Array(26).fill(create); }, false, 'operation cap');
  mutate('ProposalResponse', { data: proposal }, (v) => { v.data.rawPrompt = 'synthetic'; }, false, 'no provider prompt');
  mutate('ProposalResponse', { data: proposal }, (v) => { v.data.reviewDigest = 'bad'; }, false, 'digest format');
  mutate('ProposalResponse', { data: applied }, (v) => { v.data.operations = [create]; }, false, 'applied not executable');
  mutate('ProposalApplyResponse', { data: receipt }, (v) => { v.data.results[0].status = 'failed'; }, false, 'no partial success');
  mutate('ProposalApplyResponse', { data: receipt }, (v) => { v.data.results = []; }, false, 'no empty selected success');
  add('Confirmation', confirmation, true, 'existing shared apply request');
  add('Confirmation', { ...confirmation, items: [create] }, false, 'reject old editable body');
  add('Confirmation', { ...confirmation, selectedOperationIds: [] }, false, 'nonempty selection');
  add('Confirmation', { ...confirmation, selectedOperationIds: [id(10), id(10)] }, false, 'no duplicate selections');
  // Deliberately pass shape validation; semantic rules must reject these later.
  mutate('AiUsageResponse', usage, (v) => { v.data.availableActions = 99; }, true, 'sum needs semantic check');
  mutate('ProposalResponse', { data: proposal }, (v) => { v.data.operations[1].dependsOn = []; }, true, 'implicit resource dependency needs semantic check');
  fixtures.forEach(({ name, value, expected, label }) => {
    const validator = name === 'Confirmation' ? ajv.getSchema(`${extension.$id}#/definitions/ProposalConfirmation`) : validate(name);
    check(Boolean(validator(value)) === expected, `${name}: ${label}`);
  });

  // These helpers demonstrate invariants, not production validation/authorization.
  const bigint = (value) => typeof value === 'string' && /^(0|[1-9][0-9]{0,18})$/.test(value) && BigInt(value) <= 9223372036854775807n;
  const bucketSums = (u) => new Set(u.buckets.map((b) => b.source)).size === u.buckets.length
    && ['availableActions', 'reservedActions'].every((key) => u.buckets.reduce((sum, b) => sum + BigInt(b[key]), 0n) === BigInt(u[key]));
  function graph(p) {
    if (new Set(p.operations.map((o) => o.id)).size !== p.operations.length
      || new Set(p.operations.map((o) => o.targetId)).size !== p.operations.length
      || new Set(p.inputVersions.map((v) => `${v.entity}:${v.entityId}`)).size !== p.inputVersions.length) return false;
    const seen = new Set();
    const creates = new Map(p.operations.filter((o) => o.command === 'task.create').map((o) => [o.targetId, o.id]));
    const pinned = (entity, entityId, version) => p.inputVersions.some((v) => v.entity === entity && v.entityId === entityId && (version === undefined || version === v.version));
    for (const op of p.operations) {
      if (!op.dependsOn.every((dependency) => seen.has(dependency))) return false;
      if (op.command.endsWith('.create') && op.targetId !== op.payload.id) return false;
      if (op.command === 'task.patch' && !pinned('task', op.targetId, op.payload.expectedVersion)) return false;
      if (op.payload.goalId && !pinned('goal', op.payload.goalId)) return false;
      if (op.command === 'reminder.create') {
        const creator = creates.get(op.payload.taskId);
        if (creator ? !op.dependsOn.includes(creator) : !pinned('task', op.payload.taskId)) return false;
      }
      seen.add(op.id);
    }
    return true;
  }
  const closedSelection = (p, selected) => selected.length > 0 && new Set(selected).size === selected.length
    && selected.every((key) => p.operations.some((op) => op.id === key && op.dependsOn.every((d) => selected.includes(d))));
  const normalizedSelection = (p, selected) => p.operations.filter((op) => selected.includes(op.id)).map((op) => op.id);
  const matchesReceipt = (p, selected, r, mutationId) => r.mutationId === mutationId && r.proposalId === p.id && r.proposalVersion === p.version && r.reviewDigest === p.reviewDigest
    && r.results.length === selected.length && new Set(r.results.map((x) => x.operationId)).size === selected.length
    && r.results.every((item, index) => normalizedSelection(p, selected)[index] === item.operationId && p.operations.some((op) => op.id === item.operationId && op.command === item.command && op.targetId === item.targetId));
  const validHistory = (page) => bigint(page.meta.ledgerHighWater) && new Set(page.data.map((e) => e.id)).size === page.data.length
    && page.data.every((e, i) => bigint(e.ledgerSequence) && BigInt(e.ledgerSequence) <= BigInt(page.meta.ledgerHighWater)
      && (i === 0 || BigInt(page.data[i - 1].ledgerSequence) > BigInt(e.ledgerSequence)));
  const missingDependency = copy(proposal); missingDependency.operations[1].dependsOn = [];
  const cycle = copy(proposal); cycle.operations[0].dependsOn = [id(12)];
  const wrongTarget = copy(proposal); wrongTarget.operations[0].targetId = id(99);
  const patched = { ...proposal, operations: [patch], inputVersions: [{ entity: 'task', entityId: id(15), version: 2 }] };
  const semantic = [
    [bucketSums(usage.data), true], [bucketSums({ ...usage.data, availableActions: 99 }), false],
    [bucketSums({ ...usage.data, buckets: [usage.data.buckets[0], usage.data.buckets[0]] }), false],
    [graph(proposal), true], [graph(missingDependency), false], [graph(cycle), false], [graph(wrongTarget), false],
    [graph(patched), true], [graph({ ...patched, inputVersions: [] }), false],
    [graph({ ...proposal, operations: [create, create] }), false],
    [closedSelection(proposal, [id(10)]), true], [closedSelection(proposal, [id(12)]), false],
    [closedSelection(proposal, [id(99)]), false], [closedSelection(proposal, [id(10), id(10)]), false],
    [JSON.stringify(normalizedSelection(proposal, [id(12), id(10)])) === JSON.stringify(confirmation.selectedOperationIds), true],
    [matchesReceipt(proposal, confirmation.selectedOperationIds, receipt, id(22)), true],
    [matchesReceipt(proposal, [id(10)], receipt, id(22)), false],
    [matchesReceipt(proposal, confirmation.selectedOperationIds, { ...receipt, results: [receipt.results[0], receipt.results[0]] }, id(22)), false],
    [matchesReceipt(proposal, confirmation.selectedOperationIds, receipt, id(99)), false],
    [matchesReceipt(proposal, confirmation.selectedOperationIds, { ...receipt, results: [...receipt.results].reverse() }, id(22)), false],
    [graph({ ...patched, inputVersions: [{ entity: 'task', entityId: id(15), version: 3 }] }), false],
    [validHistory(history), true], [validHistory({ ...history, data: [...history.data].reverse() }), false],
    [validHistory({ ...history, meta: { ...history.meta, ledgerHighWater: '8' } }), false],
    [bigint('9223372036854775807'), true], [bigint('9223372036854775808'), false],
    [summary.currentStreakDays <= summary.longestStreakDays, true],
    [{ ...summary, currentStreakDays: 2 }.currentStreakDays <= summary.longestStreakDays, false],
  ];
  semantic.forEach(([actual, expected], i) => check(actual === expected, `Semantic reference ${i + 1}`));

  let refs = 0;
  const aliases = new Map(schemas.map((s) => [s.$id, files.find((f) => documents.get(f) === s)]));
  function resolve(ref, source) {
    const [file, fragment = ''] = ref.split('#');
    const name = aliases.get(file) ?? (file || source);
    let value = documents.get(name);
    if (!value || (fragment && !fragment.startsWith('/'))) throw new Error(`Invalid ref ${ref}`);
    for (const segment of fragment.split('/').slice(1)) {
      const key = segment.replace(/~1/g, '/').replace(/~0/g, '~');
      if (!value || !Object.hasOwn(value, key)) throw new Error(`Missing ref ${ref}`);
      value = value[key];
    }
    refs++;
    return { value, source: name };
  }
  function deref(value, source) {
    for (let i = 0; value?.$ref; i++) {
      if (i > 32) throw new Error('Reference depth exceeded');
      ({ value, source } = resolve(value.$ref, source));
    }
    return { value, source };
  }
  function walk(value, source) {
    if (!value || typeof value !== 'object') return;
    if (value.$ref) resolve(value.$ref, source);
    Object.values(value).forEach((child) => walk(child, source));
  }
  documents.forEach((doc, name) => walk(doc, name));
  const inventory = [...read('16-BACKEND-EXTENSIONS-AND-OPERATIONS.md').matchAll(/^\| (EX-\d{2}) \| `([A-Z]+) ([^`]+)` \|/gm)];
  const responseNames = { 'EX-18': 'RewardsResponse', 'EX-19': 'RewardHistoryResponse',
    'EX-20': 'GoalProgressResponse', 'EX-31': 'AiUsageResponse', 'EX-32': 'ProposalApplyResponse', 'EX-33': 'ProposalResponse' };
  const pairs = new Set(); const ids = new Set(); const registry = new Set(); const selected = [];
  for (const file of files.filter((f) => f.endsWith('.openapi.json'))) {
    const api = documents.get(file);
    check(api.openapi === '3.1.1' && api.servers.length === 1 && api.servers[0].url === '/v1', `API base ${file}`);
    for (const [route, item] of Object.entries(api.paths)) for (const method of ['get', 'post', 'patch', 'delete', 'put', 'head', 'options', 'trace']) {
      const op = item[method]; if (!op) continue;
      const pair = `${method.toUpperCase()} ${route}`; const key = op['x-registry-id'];
      check(!pairs.has(pair) && op.operationId && !ids.has(op.operationId), `Duplicate operation ${pair}`);
      pairs.add(pair); ids.add(op.operationId);
      if (key) { check(!registry.has(key), `Duplicate registry ${key}`); registry.add(key); }
      const auth = op.security ?? api.security;
      check(JSON.stringify(auth) === JSON.stringify(key === 'EX-22' ? [{ UserBearer: [] }, { DeletionStatusReceipt: [] }] : [{ UserBearer: [] }]), `Private auth ${pair}`);
      if (file !== 'rewards-ai.openapi.json') continue;
      selected.push(key);
      const row = inventory.find((r) => r[1] === key);
      check(Boolean(row) && `${row[2]} ${row[3]}` === pair, `Inventory ${key}`);
      check(op['x-active-account-required'] === true, `Active account ${key}`);
      const params = [...(item.parameters ?? []), ...(op.parameters ?? [])].map((p) => deref(p, file).value);
      check(new Set(params.map((p) => `${p.in}:${p.name}`)).size === params.length, `Duplicate params ${key}`);
      for (const match of route.matchAll(/\{([^}]+)\}/g)) check(params.some((p) => p.in === 'path' && p.name === match[1] && p.required && p.schema.format === 'uuid'), `Path ID ${key}`);
      const success = deref(op.responses['200'], file).value;
      check(success.content['application/json'].schema.$ref === `rewards-ai.schema.json#/definitions/${responseNames[key]}`, `Output mapping ${key}`);
      check(success.headers?.['Cache-Control']?.schema?.const === 'private, no-store', `No-store ${key}`);
      const error = deref(op.responses.default, file).value;
      check(error.content['application/json'].schema.$ref === 'personal-api.schema.json#/definitions/Error', `Safe error ${key}`);
      check(error.headers?.['Cache-Control']?.schema?.const === 'private, no-store', `Error no-store ${key}`);
      const query = params.filter((p) => p.in === 'query');
      if (key === 'EX-19') {
        check(op['x-query-schema'] === 'backend-extensions.schema.json#/definitions/ListQuery', 'History query schema');
        check(query.map((p) => p.name).sort().join(',') === 'cursor,limit', 'History query names');
        for (const p of query) check(!p.required && JSON.stringify(deref(p.schema, file).value) === JSON.stringify(deref(extension.definitions.ListQuery.properties[p.name], 'backend-extensions.schema.json').value), `History query bounds ${p.name}`);
      } else check(query.length === 0 && !op['x-query-schema'], `No unexpected query ${key}`);
      if (key === 'EX-32') {
        check(params.some((p) => p.in === 'header' && p.name === 'Idempotency-Key' && p.required && p.schema.format === 'uuid'), 'Apply idempotency');
        check(op.requestBody?.required && op.requestBody.content['application/json'].schema.$ref === 'backend-extensions.schema.json#/definitions/ProposalConfirmation', 'Confirmation mapping');
        check(op['x-atomic-selected-apply'] === true && op['x-generation-unit-debit'] === 0, 'Apply invariant markers');
      } else check(!op.requestBody && !params.some((p) => p.in === 'header'), `No write body/header ${key}`);
    }
  }
  check(selected.sort().join(',') === Object.keys(responseNames).sort().join(','), 'Six selected operations');
  check(pairs.size === 47 && ids.size === 47 && registry.size === 33, '47 operations / 33 extension IDs');
  const remaining = inventory.filter((row) => !registry.has(row[1])).map((row) => row[1]);
  check(inventory.length === 33 && remaining.length === 0, 'All inventory rows covered, not full V1 API');
  const safeCodes = documents.get('personal-api.schema.json').definitions.Error.properties.error.properties.code.enum;
  for (const code of ['AI_PROPOSAL_EXPIRED', 'AI_PROPOSAL_MISMATCH', 'AI_PROPOSAL_ALREADY_APPLIED']) check(safeCodes.includes(code), `Missing safe error ${code}`);
  console.log(JSON.stringify({ status: errors.length ? 'FAIL' : 'PASS',
    scope: 'Draft shapes/wire mappings and semantic references ONLY; no auth/DB/provider/app/crypto execution or full OAS certification',
    definitions: Object.keys(schema.definitions).length, dtoFixtures: fixtures.length,
    semanticReferenceCases: semantic.length, operations: selected.length, combinedOperations: pairs.size,
    coveredExtensionIds: registry.size, remainingExtensionIds: remaining, resolvedReferences: refs, errors }, null, 2));
  process.exitCode = errors.length ? 1 : 0;
} catch (error) {
  console.error(JSON.stringify({ status: 'CHECKER_ERROR', message: error.message }));
  process.exitCode = 2;
}
