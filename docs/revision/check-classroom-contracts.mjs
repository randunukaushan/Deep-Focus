// Read-only DTO/reference/packet checks. Never executes SQL, HTTP or app code.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { createRequire } from 'node:module';
import { fileURLToPath } from 'node:url';

const dir = path.dirname(fileURLToPath(import.meta.url));
const read = name => JSON.parse(fs.readFileSync(path.join(dir, 'contracts', name), 'utf8'));
const schema = read('classroom.schema.json');
const api = read('classroom.openapi.json');
const packet = read('classroom-transaction-tests.json');
const requireLocal = createRequire(path.resolve(dir, '../../package.json'));
const Ajv = requireLocal('ajv'); // Existing transitive tooling; no installation.
const ajv = new Ajv({ allErrors: true, jsonPointers: true, format: 'full' });
assert(ajv.validateSchema(schema), JSON.stringify(ajv.errors));
ajv.addSchema(schema);
const id = '10000000-0000-4000-8000-000000000001';
const other = '20000000-0000-4000-8000-000000000002';
const at = '2026-09-30T12:00:00.000Z';
const token = 'A'.repeat(43); // Synthetic syntax, not a usable invitation.
const content = { title: 'Own work', instructions: 'Finish the selected work.', due: null };
const selection = { progress: 'in_progress' };
const command = (payload = {}, expectedVersion = null) => ({ contractVersion: 1, commandId: id, expectedVersion, payload });
const cls = { classId: id, label: 'Synthetic class', state: 'active', version: 1, educatorDisplayName: 'E1', membershipId: other, membershipVersion: 1, role: 'educator' };
const member = { membershipId: other, classId: id, version: 1, state: 'active', role: 'learner', displayName: 'A' };
const assignment = { assignmentId: other, classId: id, version: 1, revision: 1, state: 'published', content };
const accepted = { linkId: id, assignmentId: other, acceptedRevision: 1, taskId: other, taskState: 'present', acceptedAt: at };
const shared = { submissionId: id, classId: id, assignmentId: other, assignmentRevision: 1, version: 1, state: 'shared', membershipId: other, displayName: 'A', selection, receivedAt: at };
const withdrawn = { submissionId: id, classId: id, assignmentId: other, version: 2, state: 'withdrawn' };
const feedback = { feedbackId: other, submissionId: id, submissionVersion: 1, version: 1, content: { text: 'Choose your next step.' }, receivedAt: at };
const issued = { inviteId: other, classId: id, version: 1, state: 'issued', expiresAt: at, token };
const preview = { classId: id, label: 'Synthetic class', educatorDisplayName: 'E1', policyVersion: 1 };
const valid = {
  CreateClass: command({ label: 'Synthetic class' }), ArchiveClass: command({}, 1),
  IssueInvite: command({}, 1), RevokeInvite: command({}, 1), PreviewInvite: { token },
  AcceptInvite: command({ token, policyVersion: 1, classDisplayName: 'A' }),
  RevokeMember: command({}, 1), LeaveClass: command({}, 1),
  PublishAssignment: command({ assignmentId: null, content }),
  AssignmentLifecycle: command({ action: 'close' }, 1),
  AcceptAssignment: command({ assignmentRevision: 1, copyDue: true }),
  SubmitProgress: command({ assignmentRevision: 1, selection, policyVersion: 1 }),
  WithdrawSubmission: command({}, 2),
  PublishFeedback: command({ submissionVersion: 1, content: { text: 'Useful step.' } }),
  PageQuery: {}, AssignmentQuery: {}, ClassViewResponse: { data: cls },
  MembershipViewResponse: { data: member }, AssignmentViewResponse: { data: assignment },
  AcceptanceViewResponse: { data: accepted }, SubmissionViewResponse: { data: shared },
  SubmissionWithFeedbackResponse: { data: { submission: shared, feedback } },
  FeedbackViewResponse: { data: feedback }, InviteViewResponse: { data: issued },
  InvitePreviewResponse: { data: preview }, ClassList: { data: [cls], nextCursor: null },
  AssignmentList: { data: [assignment], nextCursor: null },
  SubmissionList: { data: [{ submission: shared, feedback }], nextCursor: null },
  MembershipList: { data: [member], nextCursor: null },
  Error: { error: { code: 'NOT_FOUND', messageKey: 'errors.notFound', requestId: id, retryable: false } },
};
let fixtures = 0; let negatives = 0; let refs = 0;
function fixture(name, value, expected, label) {
  const validate = ajv.getSchema(`${schema.$id}#/definitions/${name}`);
  assert(validate, name);
  const result = validate(structuredClone(value));
  fixtures++;
  if (!expected) negatives++;
  assert.equal(result, expected, `${label}: ${JSON.stringify(validate.errors)}`);
}
for (const [name, value] of Object.entries(valid)) {
  fixture(name, value, true, `${name} positive`);
  fixture(name, { ...value, ownerId: other }, false, `${name} unknown root key`);
}
for (const [name, value] of Object.entries(valid).filter(([, v]) => v.commandId)) {
  fixture(name, { ...value, commandId: 'not-uuid' }, false, `${name} command ID`);
  fixture(name, { ...value, payload: { ...value.payload, role: 'educator' } }, false, `${name} payload mass assignment`);
  fixture(name, { ...value, expectedVersion: 0 }, false, `${name} invalid version zero`);
}
for (const key of ['privateTaskId', 'notes', 'resourceUri', 'focusMinutes', 'grade', 'xp', 'schedule']) {
  const p = structuredClone(valid.SubmitProgress);
  p.payload.selection[key] = key === 'focusMinutes' ? 30 : 'synthetic-forbidden';
  fixture('SubmitProgress', p, false, `no ${key} sharing`);
  fixture('SubmissionViewResponse', { data: { ...shared, [key]: 'forbidden' } }, false, `no response ${key}`);
}
fixture('PublishAssignment', command({ assignmentId: other, content }, 1), true, 'versioned publication');
fixture('PublishAssignment', command({ assignmentId: other, content }), false, 'existing publication needs version');
fixture('PublishAssignment', command({ assignmentId: null, content }, 1), false, 'new publication has no previous version');
fixture('SubmitProgress', command(valid.SubmitProgress.payload, 2), true, 'amend/re-share expected version');
fixture('SubmissionViewResponse', { data: withdrawn }, true, 'withdrawn minimal tombstone');
fixture('SubmissionViewResponse', { data: { ...withdrawn, selection } }, false, 'withdrawn report has no selected data');
fixture('SubmissionWithFeedbackResponse', { data: { submission: withdrawn, feedback: null } }, true, 'withdrawn feedback hidden');
fixture('SubmissionWithFeedbackResponse', { data: { submission: withdrawn, feedback } }, false, 'no feedback behind withdrawn record');
fixture('InviteViewResponse', { data: { ...issued, state: 'consumed', token: null } }, true, 'closed invite no token');
fixture('InviteViewResponse', { data: { ...issued, state: 'revoked' } }, false, 'revoked invite cannot expose token');
fixture('PreviewInvite', { token: '123456' }, false, 'not a short PIN');
fixture('PageQuery', { limit: 50 }, true, 'page bound');
fixture('PageQuery', { limit: 51 }, false, 'page overflow');
fixture('PageQuery', { limit: '20' }, false, 'no coercion inside JSON Schema');
fixture('PageQuery', { cursor: 'https://example.invalid' }, false, 'no cursor redirect');
fixture('AssignmentContent', { ...content, title: '   ' }, false, 'blank title');
fixture('AssignmentContent', { ...content, title: 'a'.repeat(240) }, true, 'title boundary');
fixture('AssignmentContent', { ...content, title: 'a'.repeat(241) }, false, 'title overflow');
fixture('AssignmentContent', { ...content, due: { at, timeZone: 'Asia/Colombo' } }, true, 'UTC due with zone');
fixture('AssignmentContent', { ...content, due: { at: '2026-02-30T12:00:00.000Z', timeZone: 'Asia/Colombo' } }, false, 'nonexistent date');
fixture('AssignmentContent', { ...content, due: { at: '2026-09-30T12:00:00+05:30', timeZone: 'Asia/Colombo' } }, false, 'UTC transport');
fixture('Selection', { progress: 'completed', percent: 100 }, false, 'no inferred percentage');
fixture('AcceptanceViewResponse', { data: { ...accepted, taskState: 'deleted' } }, true, 'deleted link recovery');

const documents = { 'classroom.schema.json': schema, 'classroom.openapi.json': api };
function resolve(ref, from) {
  const [file, pointer] = ref.split('#');
  let current = documents[file || from];
  assert(current, `external reference not allowlisted: ${ref}`);
  for (const key of (pointer || '').split('/').slice(1)) current = current?.[key.replace(/~1/g, '/').replace(/~0/g, '~')];
  assert(current !== undefined, `unresolved ${ref}`);
  refs++;
  return current;
}
function walk(value, file) {
  if (!value || typeof value !== 'object') return;
  if (value.$ref) resolve(value.$ref, file);
  for (const item of Object.values(value)) walk(item, file);
}
for (const [file, data] of Object.entries(documents)) walk(data, file);
const operations = Object.entries(api.paths).flatMap(([route, methods]) => Object.entries(methods).map(([method, op]) => ({ route, method, op })));
assert.equal(operations.length, 22);
assert.equal(api['x-execution-authorized'], false);
assert.equal(new Set(operations.map(x => x.op.operationId)).size, 22);
assert.deepEqual(operations.map(x => x.op['x-classroom-id']).sort(), Array.from({ length: 22 }, (_, i) => `CW-${String(i + 1).padStart(2, '0')}`));
for (const { route, method, op } of operations) {
  assert.deepEqual(op.security, [{ UserBearer: [] }]);
  assert.equal(op['x-unknown-query-keys'], 'reject');
  const pathKeys = [...route.matchAll(/\{(\w+)\}/g)].map(m => m[1]).sort();
  assert.deepEqual(op.parameters.filter(p => p.in === 'path').map(p => p.name).sort(), pathKeys);
  assert(op.parameters.filter(p => p.in === 'path').every(p => p.required));
  if (method === 'get') assert.equal(op.requestBody, undefined);
  if (op['x-mutation']) assert.equal(op.requestBody.required, true);
  if (op.requestBody) {
    const ref = op.requestBody.content['application/json'].schema.$ref;
    assert(valid[ref.split('/').at(-1)], `missing request fixture ${ref}`);
  }
  assert(valid[op.responses['200'].content['application/json'].schema.$ref.split('/').at(-1)], 'missing response fixture');
  for (const response of Object.values(op.responses)) {
    assert.equal(response.headers['Cache-Control'].schema.const, 'private, no-store');
    assert(response.content['application/json'].schema.$ref);
  }
  if (op['x-query-schema']) {
    const query = resolve(op['x-query-schema'].$ref, 'classroom.openapi.json');
    const params = op.parameters.filter(p => p.in === 'query');
    assert.deepEqual(params.map(p => p.name).sort(), Object.keys(query.properties).sort());
    for (const p of params) {
      const s = p.schema.$ref ? resolve(p.schema.$ref, 'classroom.openapi.json') : p.schema;
      const expected = query.properties[p.name];
      assert.deepEqual(s, expected.$ref ? resolve(expected.$ref, 'classroom.schema.json') : expected);
    }
  }
}

function checkPacket(p) {
  assert.deepEqual(Object.keys(p).sort(), ['contractVersion', 'task', 'executionAuthorized', 'independentReview', 'databaseTarget', 'tests'].sort());
  assert(Array.isArray(p.tests));
  assert.equal(p.contractVersion, 1); assert.equal(p.task, 'CW-00');
  assert.equal(p.executionAuthorized, false); assert.equal(p.independentReview, 'PENDING');
  assert.equal(p.databaseTarget, 'UNSELECTED_ISOLATED_SYNTHETIC_ONLY');
  assert.deepEqual(p.tests.map(t => t.id), Array.from({ length: 24 }, (_, i) => `TX-${String(i + 1).padStart(2, '0')}`));
  const opIds = new Set(operations.map(x => x.op['x-classroom-id']));
  for (const test of p.tests) {
    assert.deepEqual(Object.keys(test).sort(), ['id', 'operation', 'given', 'interleaving', 'expected', 'sourceCases', 'status', 'evidence'].sort());
    assert.equal(test.status, 'NOT_RUN'); assert.deepEqual(test.evidence, []);
    assert(opIds.has(test.operation));
    for (const key of ['given', 'interleaving', 'expected']) assert(typeof test[key] === 'string' && test[key].trim().length >= 20);
    assert(Array.isArray(test.sourceCases) && test.sourceCases.length > 0 && test.sourceCases.every(id => /^CT-(0[1-9]|1\d|2[0-4])$/.test(id)));
  }
}
checkPacket(packet);
const mutations = [p => { p.executionAuthorized = true; }, p => { p.independentReview = 'DONE'; },
  p => { p.tests[0].status = 'PASS'; }, p => { p.tests[0].evidence = ['invented']; },
  p => { p.tests.pop(); }, p => { p.tests[0].operation = 'CW-99'; },
  p => { p.tests[0].interleaving = ''; }, p => { p.databaseTarget = 'production'; },
  p => { p.approved = true; }, p => { p.tests[0].passed = true; },
  p => { p.tests[0].expected = Array(30).fill('not an oracle'); },
  p => { p.tests[0].given = ' '.repeat(30); }];
for (const mutate of mutations) { const changed = structuredClone(packet); mutate(changed); assert.throws(() => checkPacket(changed)); }

// Coverage only: prose predicates are not executed as authorization logic.
const reconciliationName = '41-CLASSROOM-RECONCILIATION-AND-SQL-TEST-PREPARATION.md';
const reconciliation = fs.readFileSync(path.join(dir, reconciliationName), 'utf8');
const wireText = fs.readFileSync(path.join(dir, '40-CLASSROOM-WIRE-DATA-AND-TRANSACTION-TESTS.md'), 'utf8');
const tableNames = [...wireText.matchAll(/^\| ((?:private_)?classroom\w*) \/ /gm)].map(m => m[1]).sort();
assert.equal(tableNames.length, 11);
function checkReconciliation(value) {
  const operationRows = [...value.matchAll(/^\| (CW-\d+) \| (.+) \| (.+) \|$/gm)];
  assert.deepEqual(operationRows.map(m => m[1]).sort(), operations.map(x => x.op['x-classroom-id']).sort());
  const tableRows = [...value.matchAll(/^\| ((?:private_)?classroom\w*) \| (.+) \| (.+) \|$/gm)];
  assert.deepEqual(tableRows.map(m => m[1]).sort(), tableNames);
  for (const row of [...operationRows, ...tableRows]) assert(row[2].trim().length > 10 && row[3].trim().length > 10);
  const gates = [...value.matchAll(/^\| (SQ-\d+) \| (.+) \| (\w+) \|$/gm)];
  assert.deepEqual(gates.map(m => [m[1], m[3]]), Array.from({ length: 6 }, (_, i) => [`SQ-0${i + 1}`, 'OPEN']));
  assert(value.includes('DRAFT / HIGH / REVIEW_PENDING. SQL EXECUTION NOT AUTHORIZED.'));
  assert(value.includes('Full runtime and TX-01–24 status: **NOT_RUN**.'));
}
checkReconciliation(reconciliation);
const documentMutations = [
  s => s.replace(/^\| CW-02 .+$/m, ''),
  s => s.replace('| CW-01 |', '| CW-99 |'),
  s => s.replace(/^\| classroom_invites .+$/m, ''),
  s => s.replace(/(\| SQ-01 .+)\| OPEN \|/, '$1| PASS |'),
  s => s.replace('SQL EXECUTION NOT AUTHORIZED.', 'SQL EXECUTION AUTHORIZED.'),
];
for (const mutate of documentMutations) assert.throws(() => checkReconciliation(mutate(reconciliation)));
const canonicalFiles = ['API_SPEC.md', 'DATA_MODEL.md', 'DATABASE_SCHEMA.md', 'SECURITY.md', 'TESTING_STRATEGY.md'];
for (const file of canonicalFiles) {
  const value = fs.readFileSync(path.join(dir, '..', file), 'utf8');
  assert(value.includes(`revision/${reconciliationName}`), `missing scoped canonical reference: ${file}`);
}
const identityText = fs.readFileSync(path.join(dir, '42-PRIVATE-TASK-TOMBSTONE-AND-IDENTITY-BRIDGE.md'), 'utf8');
function checkIdentityPacket(value) {
  const decisions = [...value.matchAll(/^\| (TI-D\d+) \| (.+) \| (.+) \|$/gm)];
  assert.deepEqual(decisions.map(m => m[1]), ['TI-D1', 'TI-D2', 'TI-D3', 'TI-D4']);
  const cases = [...value.matchAll(/^\| (TI-T\d+) \| (.+) \| (.+) \| (\w+) \|$/gm)];
  assert.deepEqual(cases.map(m => [m[1], m[4]]), Array.from({ length: 16 }, (_, i) => [`TI-T${String(i + 1).padStart(2, '0')}`, 'NOT_RUN']));
  for (const row of [...decisions, ...cases]) assert(row[2].trim().length > 20 && row[3].trim().length > 20);
  for (const field of ['accepted_task_id', 'live_task_id', 'task_link_state', 'task_deleted_at', 'link_version']) {
    assert(value.includes(`| ${field} |`), `missing tombstone field ${field}`);
  }
  assert(value.includes('DRAFT / HIGH / REVIEW_PENDING. NO SQL EXECUTION.'));
}
checkIdentityPacket(identityText);
const identityMutations = [
  s => s.replace(/^\| TI-T01 .+$/m, ''),
  s => s.replace(/(\| TI-T02 .+)\| NOT_RUN \|/, '$1| PASS |'),
  s => s.replace('| TI-D2 |', '| TI-D9 |'),
  s => s.replace('| live_task_id |', '| unknown_field |'),
  s => s.replace('NO SQL EXECUTION.', 'SQL EXECUTION APPROVED.'),
];
for (const mutate of identityMutations) assert.throws(() => checkIdentityPacket(mutate(identityText)));
// SF-00 checks an internal-call specification, not executable SQL or a runner.
const functionText = fs.readFileSync(path.join(dir, '43-CLASSROOM-SQL-FUNCTION-AND-RUNNER-SPEC.md'), 'utf8');
const functionOwners = ['manage', 'read', 'read', 'manage', 'invite', 'invite', 'invite', 'invite',
  'manage', 'manage', 'assignment', 'assignment', 'read', 'accept', 'share', 'share',
  'feedback', 'read', 'read', 'accept', 'share', 'read'];
const txSurfaces = Array.from({ length: 24 }, () => 'DB, EDGE');
for (const n of [3, 9]) txSurfaces[n - 1] = 'DB';
for (const n of [10, 22]) txSurfaces[n - 1] = 'DB, EDGE, MOBILE';
txSurfaces[20] = 'DB, RESTORE, PRIVACY';
txSurfaces[23] = 'DB, EDGE, PRIVACY';
const tiSurfaces = ['DB, EDGE', 'DB', 'DB', 'DB', 'DB, EDGE', 'EDGE, MOBILE', 'DB, RESTORE',
  'DB, EDGE', 'DB, EDGE', 'DB', 'DB, EDGE', 'DB, EDGE', 'DB, EDGE', 'DB, EDGE', 'DB', 'DB'];
function checkFunctionSpecification(value) {
  assert(value.includes('DRAFT / HIGH / REVIEW_PENDING. NO SQL EXECUTION.'));
  const callBlock = value.match(/```text\r?\n([\s\S]*?)\r?\n```/)[1];
  for (const parameter of ['p_actor_id uuid', 'p_provider_session_id uuid', 'p_token_expires_at timestamptz', 'p_input jsonb', 'RETURNS jsonb']) {
    assert(callBlock.includes(parameter), `missing shared parameter in operation call block: ${parameter}`);
  }
  assert(value.includes('p_bridge jsonb'), 'mutation-only bridge argument');
  assert(value.includes('classroom_prepare_v1'), 'preparation entry');
  assert(value.includes('13 MUTATION') && value.includes('nine READ'), 'correct effect counts');
  const rows = value.split(/\r?\n/).filter(s => /^\| CW-\d+ \|/.test(s))
    .map(s => s.split('|').slice(1, -1).map(c => c.trim()));
  assert.equal(rows.length, 22);
  assert.equal(new Set(rows.map(r => r[1])).size, 22, 'unique internal names');
  for (const [index, row] of rows.entries()) {
    assert.equal(row.length, 7);
    const expectedId = `CW-${String(index + 1).padStart(2, '0')}`;
    assert.equal(row[0], expectedId);
    const { op, route } = operations.find(x => x.op['x-classroom-id'] === expectedId);
    assert(/^[a-z][a-z_]+$/.test(row[1]), 'static function identifier');
    const selectors = [...route.matchAll(/\{(\w+)\}/g)].map(m =>
      `p_${m[1].replace(/[A-Z]/g, c => `_${c.toLowerCase()}`)} uuid`).join(', ') || '—';
    assert.equal(row[2], selectors, `${expectedId} selector order/type`);
    const inputRef = op.requestBody?.content['application/json'].schema.$ref || op['x-query-schema']?.$ref;
    assert.equal(row[3], inputRef?.split('/').at(-1) || 'EmptyQuery');
    const publicResult = op.responses['200'].content['application/json'].schema.$ref.split('/').at(-1);
    assert.equal(row[4], expectedId === 'CW-05' ? 'BridgeInviteResult' : publicResult);
    if (expectedId === 'CW-05') assert.equal(publicResult, 'InviteViewResponse', 'unchanged public invitation');
    assert.equal(row[5], functionOwners[index]);
    assert.equal(row[6], op['x-mutation'] ? 'MUTATION' : 'READ');
  }
  const migrations = [...value.matchAll(/^\| (SF-M\d+) \| ([^|]+) \| ([^|]+) \| (\w+) \|$/gm)];
  assert.deepEqual(migrations.map(m => [m[1], m[4]]), Array.from({ length: 7 }, (_, i) => [`SF-M0${i + 1}`, 'UNCREATED']));
  for (const [i, m] of migrations.entries()) assert(m[2].trim().startsWith(`0${i + 1}-`) && m[2].trim().endsWith('.sql'));
  const cases = [...value.matchAll(/^\| (TX-\d+|TI-T\d+) \| ([^|]+) \| (\w+) \|$/gm)];
  const expected = [...packet.tests.map((t, i) => [t.id, txSurfaces[i], 'NOT_RUN']),
    ...tiSurfaces.map((surfaces, i) => [`TI-T${String(i + 1).padStart(2, '0')}`, surfaces, 'NOT_RUN'])];
  assert.deepEqual(cases.map(m => [m[1], m[2].trim(), m[3]]), expected);
}
checkFunctionSpecification(functionText);
const functionMutations = [
  s => s.replace(/^\| CW-02 .+$/m, ''),
  s => s.replace('| EmptyQuery | ClassViewResponse |', '| PageQuery | ClassViewResponse |'),
  s => s.replace('p_class_id uuid, p_invite_id uuid', 'p_invite_id uuid, p_class_id uuid'),
  s => s.replace('| PreviewInvite | InvitePreviewResponse | invite | READ |', '| PreviewInvite | InvitePreviewResponse | invite | MUTATION |'),
  s => s.replace('| AcceptanceViewResponse | accept |', '| AcceptanceViewResponse | read |'),
  s => s.replace('p_provider_session_id uuid', 'p_provider_session_id text'),
  s => s.replace(/(\| SF-M01 .+)\| UNCREATED \|/, '$1| APPLIED |'),
  s => s.replace(/^\| SF-M02 .+$/m, ''),
  s => s.replace('| TX-22 | DB, EDGE, MOBILE |', '| TX-22 | DB, EDGE |'),
  s => s.replace('| TI-T07 | DB, RESTORE | NOT_RUN |', '| TI-T07 | DB, RESTORE | PASS |'),
  s => s.replace(/^\| TI-T16 .+$/m, ''),
  s => s.replace('NO SQL EXECUTION.', 'SQL EXECUTION APPROVED.'),
  s => s.replaceAll('p_bridge jsonb', 'p_bridge text'),
  s => s.replace('| IssueInvite | BridgeInviteResult |', '| IssueInvite | InviteViewResponse |'),
  s => s.replaceAll('classroom_prepare_v1', 'unreviewed_prepare'),
];
for (const [index, mutate] of functionMutations.entries())
  assert.throws(() => checkFunctionSpecification(mutate(functionText)), `function negative ${index + 1}`);
console.log(JSON.stringify({ status: 'PASS', operations: operations.length, definitions: Object.keys(schema.definitions).length,
  dtoFixtures: fixtures, rejectedDtoFixtures: negatives, resolvedRefs: refs, packetNegativeCases: mutations.length,
  accessOperationsDocumented: operations.length, accessTablesDocumented: tableNames.length,
  sqlAdmissionGatesOpen: 6, canonicalReferences: canonicalFiles.length, documentNegativeCases: documentMutations.length,
  identityDecisionsDocumented: 4, identityScenariosSpecified: 16, identityScenariosRun: 0,
  identityPacketNegativeCases: identityMutations.length,
  functionSignaturesDocumented: 22, migrationSeamsUncreated: 7, executionSurfaceMappings: 40,
  functionSpecificationNegativeCases: functionMutations.length,
  transactionCasesSpecified: packet.tests.length, transactionCasesRun: 0,
  scope: 'DTO/reference/document-packet validation ONLY; no SQL, RLS, HTTP, device or production evidence' }, null, 2));
