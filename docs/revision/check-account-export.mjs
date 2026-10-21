// Draft artifact/reference checks ONLY. No database, downloads, JCS or legal proof.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
import assert from 'node:assert/strict';
const here = path.dirname(fileURLToPath(import.meta.url));
const read = f => fs.readFileSync(path.join(here, f), 'utf8');
const require = createRequire(path.join(here, '../../package.json'));
const failures = []; let dtoCases = 0; let semanticCases = 0; let refs = 0;
const run = (label, fn) => { try { fn(); } catch (e) { failures.push(`${label}: ${e.message}`); } };
const sem = (label, fn) => { semanticCases++; run(label, fn); };
const id = n => `00000000-0000-4000-8000-${String(n).padStart(12, '0')}`;
const digest = 'a'.repeat(64); // Deliberate placeholder, NOT a computed JCS digest.
const at = '2026-09-20T03:00:00.000Z', end = '2026-09-20T04:00:00.000Z';
const families = ['ai_activity','consent_history','billing_records','cloud_resources','shared_workspaces','support_records','telemetry','connector_data'];
try {
  const names = ['personal-api','backend-extensions','operations-api','rewards-ai','planning','plan-management','replication-v2','account-export'];
  const schemas = new Map(names.map(n => { const s = JSON.parse(read(`contracts/${n}.schema.json`)); return [s.$id, s]; }));
  const Ajv = require('ajv'); const ajv = new Ajv({ allErrors: true, format: 'full', jsonPointers: true });
  for (const s of schemas.values()) ajv.addSchema(s);
  const schema = schemas.get('urn:deep-focus:account-export:2026-09-20');
  const validate = ajv.getSchema(`${schema.$id}#/definitions/AccountExport`);
  for (const n of Object.keys(schema.definitions)) assert.ok(ajv.getSchema(`${schema.$id}#/definitions/${n}`));
  const identity = { id: id(1), email: 'synthetic@example.invalid', phone: null, createdAt: at, updatedAt: at };
  const profile = { id: id(1), displayName: 'Synthetic owner', personalWorkspaceId: id(2), version: 1 };
  const settings = { id: id(3), version: 1, theme: 'system', uiLocale: 'si-LK', defaultFocusDurationMinutes: 25, defaultBreakDurationMinutes: 5, aiFeaturesEnabled: false, updatedAt: at };
  const task = { id: id(4), workspaceId: id(2), title: 'Small steps', description: null, priority: 'medium', goalId: id(5), due: { kind: 'none' }, status: 'completed', version: 1, createdAt: at, updatedAt: end, completedAt: end, archivedAt: null };
  const goal = { id: id(5), workspaceId: id(2), title: 'Focus', type: 'session_count', period: 'daily', startsAt: at, endsAt: end, timeZone: 'Asia/Colombo', targetValue: 1, targetUnit: 'count', status: 'active', version: 1, createdAt: at, updatedAt: at };
  const session = { id: id(6), workspaceId: id(2), taskId: task.id, taskTitleSnapshot: task.title, status: 'completed', plannedMs: 1500000, focusedMs: 1500000, pausedMs: 0, startedAt: at, endedAt: end, recordedAt: end, verificationState: 'verified', version: 1 };
  const event = { id: id(7), sessionId: session.id, sequence: 1, type: 'complete', occurredAt: end, receivedAt: end };
  const rest = { id: id(8), focusSessionId: session.id, startedAt: at, endedAt: end, plannedMs: 300000, actualMs: 300000, outcome: 'completed', version: 1, verificationState: 'verified' };
  const reminder = { id: id(9), taskId: task.id, scheduledFor: at, timeZone: 'Asia/Colombo', enabled: false, delivery: 'local_device', version: 1, updatedAt: at, deletedAt: null };
  const plan = { id: id(10), workspaceId: id(2), localDate: '2026-09-20', timeZone: 'Asia/Colombo', availableStart: at, availableEnd: end, explanation: null, blocks: [{ id: id(11), kind: 'focus', taskId: task.id, startsAt: at, endsAt: end, reminderId: reminder.id }], version: 1, createdAt: at, updatedAt: at, state: 'active', sourceProposalId: id(12) };
  const reward = { id: id(13), ledgerSequence: '9007199254740993', sourceType: 'focus_session', sourceId: session.id, awardKind: 'focus', ruleVersion: 'draft-1', recordedAt: end, kind: 'award', deltaXp: 1, correctsEntryId: null, reason: 'earned' };
  const usage = { status: 'unconfigured', policyVersion: null, checkedAt: null, unit: 'action', availableActions: null, reservedActions: null, buckets: null, enabledActions: null, nextRefreshAt: null };
  const grant = { grantId: id(14), licenseId: null, capability: 'focus.core', scopeType: 'personal', scopeId: id(1), state: 'active', validUntil: null, source: 'promotion', checkedAt: at, catalogVersion: 'draft-1' };
  const appSession = { id: id(15), displayLabel: 'Synthetic device', state: 'revoked', createdAt: at, lastSeenAt: end };
  const section = records => ({ recordCount: records.length, pageCount: 1, pages: [{ pageIndex: 0, records }], sectionDigest: digest });
  const records = { identity, profile, settings, tasks: task, goals: goal, sessions: session, focusEvents: event, breaks: rest, reminders: reminder, rewardHistory: reward, aiUsage: usage, entitlements: grant, accountSessions: appSession };
  const sections = Object.fromEntries(Object.entries(records).map(([n, r]) => [n, section([r])]));
  sections.plans = { manifest: { contractVersion: 2, section: 'plans', exportJobId: id(20), snapshotAt: end, highWater: '9007199254740994', privacyEpoch: '1', planCount: 1, pageCount: 1, manifestDigest: digest }, pages: [{ pageIndex: 0, plans: [plan], pageDigest: digest }] };
  const bundle = { format: 'deep-focus-account-export', contractVersion: 1, manifest: { exportJobId: id(20), snapshotAt: end, generatedAt: end, highWater: '9007199254740994', privacyEpoch: '1', timeEncoding: 'UTC_with_record_time_zones', coverage: 'contract_scoped', exclusions: ['local_only','credentials','internal_security','deleted_content','raw_ai_content'], deferredFamilies: families.map(family => ({ family, disposition: 'not_collected', policyRef: null })), artifactDigest: digest }, sections };
  function shape(label, value, expected, name = 'AccountExport') {
    dtoCases++; run(label, () => { const v = ajv.getSchema(`${schema.$id}#/definitions/${name}`); assert.equal(Boolean(v(value)), expected, JSON.stringify(v.errors)); });
  }
  shape('complete typed fixture', bundle, true);
  for (const [n, value] of [['Identity',identity],['FocusEvent',event],['SafeAccountSession',appSession],['Manifest',bundle.manifest],['DeferredFamily',bundle.manifest.deferredFamilies[0]], ...Object.entries(sections).filter(([n]) => n !== 'plans').map(([n,v]) => [`${n}Section`,v])]) {
    shape(n, value, true, n); shape(`${n} unknown property`, { ...value, secret: 'not-real' }, false, n);
    for (const k of Object.keys(value)) { const v = structuredClone(value); delete v[k]; shape(`${n} missing ${k}`, v, false, n); }
  }
  const mutate = (label, fn, expected = false) => { const v = structuredClone(bundle); fn(v); shape(label, v, expected); };
  for (const n of Object.keys(sections)) mutate(`missing section ${n}`, b => delete b.sections[n]);
  mutate('unknown section', b => b.sections.providerDump = {});
  mutate('wrong outer version', b => b.contractVersion = 2);
  mutate('credentials in identity', b => b.sections.identity.pages[0].records[0].refreshToken = 'forbidden');
  mutate('local path in task', b => b.sections.tasks.pages[0].records[0].localUri = 'file:///private');
  mutate('deleted reminder', b => b.sections.reminders.pages[0].records[0].deletedAt = at);
  mutate('workspace entitlement', b => b.sections.entitlements.pages[0].records[0].scopeType = 'workspace');
  mutate('request-relative session current', b => b.sections.accountSessions.pages[0].records[0].current = true);
  mutate('missing exclusion', b => b.manifest.exclusions.pop());
  mutate('101 records page', b => b.sections.tasks.pages[0].records = Array(101).fill(task));
  mutate('separate process without policy', b => b.manifest.deferredFamilies[0].disposition = 'separate_process');
  mutate('separate process shape only', b => b.manifest.deferredFamilies[0] = { family: families[0], disposition: 'separate_process', policyRef: 'privacy-access@1' }, true);
  mutate('localized text retained', b => b.sections.tasks.pages[0].records[0].title = 'කුඩා පියවර — சிறிய படிகள்', true);

  const rows = (b,n) => n === 'plans' ? b.sections.plans.pages.flatMap(p => p.plans) : b.sections[n].pages.flatMap(p => p.records);
  const decimal = (v,min=0n) => typeof v === 'string' && /^(0|[1-9][0-9]*)$/.test(v) && BigInt(v) >= min && BigInt(v) <= 9223372036854775807n;
  // Inventory is a synthetic trusted oracle, not a DB ownership/coverage implementation.
  const emptyInventory = Object.fromEntries(families.map(n => [n,{retained:false}]));
  function semantics(b, inventory) {
    if (!validate(b)) return false;
    if (!inventory || families.some(n => !Object.hasOwn(inventory,n))) return false;
    const m = b.manifest;
    if (!decimal(m.highWater) || !decimal(m.privacyEpoch,1n) || m.generatedAt < m.snapshotAt) return false;
    const known = new Set(m.deferredFamilies.map(x => x.family));
    if (known.size !== families.length || families.some(n => !known.has(n))) return false;
    for (const [n, data] of Object.entries(inventory)) {
      const declared = m.deferredFamilies.find(x => x.family === n);
      if (!declared || !data || data.unavailable || typeof data.retained !== 'boolean') return false;
      if (data.retained && (declared.disposition !== 'separate_process' || !data.approvedPolicies?.includes(declared.policyRef))) return false;
    }
    for (const d of m.deferredFamilies) if (d.disposition === 'separate_process' && !inventory[d.family]?.approvedPolicies?.includes(d.policyRef)) return false;
    for (const [n,s] of Object.entries(b.sections)) {
      if (n === 'plans') continue;
      const r = rows(b,n);
      if (s.recordCount !== r.length || s.pageCount !== s.pages.length || s.pages.some((p,i) => p.pageIndex !== i)) return false;
      if (!r.length && (s.pageCount !== 1 || s.pages[0].records.length)) return false;
      if (n === 'aiUsage') continue;
      const key = n === 'rewardHistory' ? 'ledgerSequence' : n === 'entitlements' ? 'grantId' : 'id';
      if (n === 'rewardHistory' && r.some(x => !decimal(x[key],1n))) return false;
      if (r.some((x,i) => i && (key === 'ledgerSequence' ? BigInt(r[i-1][key]) >= BigInt(x[key]) : r[i-1][key] >= x[key]))) return false;
      if (new Set(r.map(x => x.id ?? x.grantId)).size !== r.length) return false;
    }
    const ps = b.sections.plans, plans = rows(b,'plans');
    if (['exportJobId','snapshotAt','highWater','privacyEpoch'].some(k => ps.manifest[k] !== m[k])) return false;
    if (ps.manifest.pageCount !== ps.pages.length || ps.manifest.planCount !== plans.length || ps.pages.some((p,i) => p.pageIndex !== i)) return false;
    if (!plans.length && ps.pages.length !== 1) return false;
    if (plans.some((p,i) => i && plans[i-1].id >= p.id)) return false;
    const actor = rows(b,'identity')[0].id, profileRow = rows(b,'profile')[0], ws = profileRow.personalWorkspaceId;
    if (profileRow.id !== actor) return false;
    for (const n of ['tasks','goals','sessions','plans']) if (rows(b,n).some(r => r.workspaceId !== ws)) return false;
    if (rows(b,'entitlements').some(r => r.scopeId !== actor)) return false;
    const tasks = new Map(rows(b,'tasks').map(t => [t.id,t])), goals = new Set(rows(b,'goals').map(g => g.id));
    const reminders = new Map(rows(b,'reminders').map(r => [r.id,r])), sessions = new Set(rows(b,'sessions').map(s => s.id));
    if ([...tasks.values()].some(t => t.goalId && !goals.has(t.goalId))) return false;
    if ([...reminders.values()].some(r => !tasks.has(r.taskId))) return false;
    if (rows(b,'breaks').some(r => !sessions.has(r.focusSessionId)) || rows(b,'focusEvents').some(e => !sessions.has(e.sessionId))) return false;
    const eventKeys = rows(b,'focusEvents').map(e => `${e.sessionId}/${e.sequence}`);
    if (new Set(eventKeys).size !== eventKeys.length) return false;
    if (plans.some(p => p.blocks.some(block => block.kind === 'focus' && (!tasks.has(block.taskId) || (block.reminderId !== null && reminders.get(block.reminderId)?.taskId !== block.taskId))))) return false;
    return true; // Not crypto, real inventory completeness, time rules or physical ownership proof.
  }
  const sm = (label, fn, expected=false, inventory={}) => { const b = structuredClone(bundle); fn(b); sem(label, () => assert.equal(semantics(b, {...emptyInventory,...inventory}),expected)); };
  sem('missing inventory fails closed', () => assert.equal(semantics(bundle),false));
  sem('incomplete inventory fails closed', () => assert.equal(semantics(bundle,{}),false));
  sm('coherent fixture with distinct settings ID', () => {}, true);
  sm('record count mismatch', b => b.sections.tasks.recordCount = 2);
  sm('page count mismatch', b => b.sections.tasks.pageCount = 2);
  sm('page index gap', b => b.sections.tasks.pages[0].pageIndex = 1);
  sm('duplicate across pages', b => { const s=b.sections.tasks; s.pages.push({pageIndex:1,records:[task]}); s.pageCount=2;s.recordCount=2; });
  sm('page identity order', b => { const s=b.sections.tasks;s.pages[0].records.push({...task,id:id(2)});s.recordCount=2; });
  sm('epoch overflow', b => b.manifest.privacyEpoch = '9223372036854775808');
  sm('future snapshot', b => b.manifest.snapshotAt = '2026-09-21T04:00:00.000Z');
  for (const k of ['exportJobId','snapshotAt','highWater','privacyEpoch']) sm(`nested plans mismatch ${k}`, b => b.sections.plans.manifest[k] = k === 'exportJobId' ? id(88) : k === 'snapshotAt' ? at : '2');
  sm('foreign workspace', b => b.sections.tasks.pages[0].records[0].workspaceId = id(99));
  sm('foreign profile', b => b.sections.profile.pages[0].records[0].id = id(99));
  sm('foreign grant scope', b => b.sections.entitlements.pages[0].records[0].scopeId = id(99));
  sm('missing plan task', b => b.sections.plans.pages[0].plans[0].blocks[0].taskId = id(99));
  sm('missing plan reminder', b => b.sections.plans.pages[0].plans[0].blocks[0].reminderId = id(99));
  sm('missing break session', b => b.sections.breaks.pages[0].records[0].focusSessionId = id(99));
  sm('missing event session', b => b.sections.focusEvents.pages[0].records[0].sessionId = id(99));
  sm('retained session reference not resurrected', b => b.sections.sessions.pages[0].records[0].taskId = id(99), true);
  sm('duplicate coverage family', b => b.manifest.deferredFamilies[1] = b.manifest.deferredFamilies[0]);
  sm('collected family cannot be not-collected', () => {}, false, {ai_activity:{retained:true}});
  sm('unknown collected family', () => {}, false, {new_feature:{retained:true}});
  sm('unavailable inventory', () => {}, false, {billing_records:{retained:false,unavailable:true}});
  sm('missing retained state is not empty', () => {}, false, {billing_records:{}});
  sm('unreviewed policy label', b => b.manifest.deferredFamilies[0] = {family:'ai_activity',disposition:'separate_process',policyRef:'privacy-access@1'});
  sm('reviewed separate-process reference', b => b.manifest.deferredFamilies[0] = {family:'ai_activity',disposition:'separate_process',policyRef:'privacy-access@1'}, true, {ai_activity:{retained:true,approvedPolicies:['privacy-access@1']}});
  sm('empty optional sections retain required singletons', b => {
    for (const n of Object.keys(b.sections)) if (!['identity','profile','settings','aiUsage','plans'].includes(n)) b.sections[n]=section([]);
    b.sections.plans.manifest.planCount=0;b.sections.plans.pages[0].plans=[];
  }, true);
  function walk(v, from) {
    if (!v || typeof v !== 'object') return;
    if (v.$ref) { const [base,pointer=''] = v.$ref.split('#'); let x=schemas.get(base || from); assert.ok(x,`unknown ${v.$ref}`);
      for (const k of pointer.split('/').filter(Boolean)) x=x?.[k.replace(/~1/g,'/').replace(/~0/g,'~')]; assert.notEqual(x,undefined,v.$ref);refs++; }
    for (const x of Object.values(v)) walk(x,from);
  }
  walk(schema,schema.$id);
  const doc=read('28-ACCOUNT-EXPORT-ARTIFACT-CONTRACT.md');
  assert.equal([...doc.matchAll(/^\| AE-T\d{2} \|/gm)].length,10);
  assert.equal(Object.keys(schema.definitions.AccountExport.properties.sections.properties).length,14);
  console.log(JSON.stringify({status:failures.length?'FAIL':'PASS',definitions:Object.keys(schema.definitions).length,sections:14,dtoCases,semanticCases,references:refs,scope:'Draft shapes and synthetic content/coverage only; no auth/SQL/JCS/download/legal proof',failures},null,2));
  process.exitCode=failures.length?1:0;
} catch(e) { console.error(JSON.stringify({status:'CHECKER_ERROR',message:e.message}));process.exitCode=2; }
