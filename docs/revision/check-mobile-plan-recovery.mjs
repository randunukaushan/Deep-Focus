// Read-only specification/reference checks. No production code or runtime tests.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const model = JSON.parse(fs.readFileSync(path.join(here, 'contracts/mobile-plan-recovery.json'), 'utf8'));
const doc = fs.readFileSync(path.join(here, '30-MOBILE-PLAN-STORAGE-OUTBOX-RECOVERY.md'), 'utf8');
const failures = []; let referenceCases = 0;
const states = ['queued','in_flight','unknown','acknowledged','settled','needs_review','rejected','cancelled','privacy_blocked'];
const guards = ['dispatch_permitted','never_attempted','attempted','matching_receipt','definitive_result','mirror_reconciled','reset_required'];
const keys = (o, expected) => assert.deepEqual(Object.keys(o).sort(), expected.slice().sort());
function verify(m) {
  keys(m, ['contractVersion','task','executionAuthorized','independentReview','states','terminalInReference','transitions','runtimeScenarios','limits']);
  assert.equal(m.contractVersion, 1); assert.equal(m.task, 'PL-04');
  assert.equal(m.executionAuthorized, false); assert.equal(m.independentReview, 'PENDING');
  assert.deepEqual(m.states, states);
  assert.deepEqual(m.terminalInReference, states.slice(4));
  assert.deepEqual(m.runtimeScenarios, {prefix:'MP-T',count:20,status:'NOT_RUN'});
  assert.ok(m.limits.length > 80);
  const seen = new Set();
  assert.equal(m.transitions.length, 13);
  for (const t of m.transitions) {
    keys(t, ['from','event','to','guard']);
    assert.ok(states.includes(t.from) && states.includes(t.to) && guards.includes(t.guard));
    assert.ok(!m.terminalInReference.includes(t.from));
    const k = `${t.from}/${t.event}`;
    assert.ok(!seen.has(k), `duplicate ${k}`); seen.add(k);
  }
}
function test(name, run) {
  referenceCases++;
  try { run(); } catch (e) { failures.push(`${name}: ${e.message}`); }
}
// Synthetic fixture strings are not wire DTOs, keys or real user content.
const base = () => ({state:'queued',owner:'synthetic-A',generation:1,epoch:'2',
  attempted:false,key:'synthetic-mutation',command:'plan.edit',target:'synthetic-plan',
  body:{expectedVersion:4,syntheticEdit:'reviewed'},receipt:null});
const context = (overrides={}) => ({owner:'synthetic-A',generation:1,epoch:'2',auth:true,
  reset:false,caughtUp:true,definitive:false,...overrides});
const receipt = (item, overrides={}) => ({key:item.key,command:item.command,target:item.target,
  previousVersion:4,entityVersion:5,committedThrough:'9007199254740993',...overrides});
function step(item, event, ctx, payload) {
  // These booleans stand in for verified infrastructure, not implementations of it.
  assert.equal(ctx.owner, item.owner); assert.equal(ctx.generation, item.generation);
  const t = model.transitions.find(x => x.from === item.state && x.event === event);
  assert.ok(t, `disallowed ${item.state}/${event}`);
  switch (t.guard) {
    case 'dispatch_permitted':
      assert.ok(ctx.auth && !ctx.reset && ctx.caughtUp);
      assert.equal(ctx.epoch, item.epoch); assert.ok(item.body); break;
    case 'never_attempted': assert.equal(item.attempted, false); break;
    case 'attempted': assert.equal(item.attempted, true); break;
    case 'matching_receipt':
      assert.ok(item.attempted && ctx.auth && !ctx.reset);
      for (const k of ['key','command','target']) assert.equal(payload[k], item[k]);
      assert.equal(payload.previousVersion, item.body.expectedVersion);
      assert.equal(payload.entityVersion, payload.previousVersion + 1); break;
    case 'definitive_result': assert.ok(ctx.auth && ctx.definitive && !ctx.reset); break;
    case 'mirror_reconciled':
      assert.ok(ctx.auth && !ctx.reset && ctx.caughtUp && item.receipt);
      assert.equal(ctx.epoch, item.epoch);
      assert.ok(BigInt(ctx.mirrorThrough) >= BigInt(item.receipt.committedThrough)); break;
    case 'reset_required': assert.equal(ctx.reset, true); break;
    default: assert.fail('unknown guard');
  }
  const next = structuredClone(item); next.state = t.to;
  if (event === 'dispatch') next.attempted = true;
  if (event === 'receipt') next.receipt = structuredClone(payload);
  return next;
}
const dispatch = () => step(base(), 'dispatch', context());
const unknown = () => step(dispatch(), 'response_lost', context());
const acknowledged = () => {const i=dispatch();return step(i,'receipt',context(),receipt(i));};
test('strict model inventory', () => verify(model));
for (const [label, mutate] of [
  ['invented execution',m=>m.executionAuthorized=true],
  ['invented review',m=>m.independentReview='COMPLETE'],
  ['invented runtime pass',m=>m.runtimeScenarios.status='PASS'],
  ['missing edge',m=>m.transitions.pop()],
  ['terminal replay',m=>m.transitions[0].from='privacy_blocked'],
  ['unknown guard',m=>m.transitions[0].guard='always'],
  ['duplicate edge',m=>m.transitions[1]=structuredClone(m.transitions[0])],
]) test(label,()=>{const m=structuredClone(model);mutate(m);assert.throws(()=>verify(m));});
test('dispatch persists attempt; input unchanged',()=>{const b=base(),n=step(b,'dispatch',context());assert.equal(n.attempted,true);assert.equal(b.attempted,false);assert.deepEqual(n.body,b.body);});
test('never attempted cancellation',()=>assert.equal(step(base(),'cancel',context()).state,'cancelled'));
test('cannot cancel in flight',()=>assert.throws(()=>step(dispatch(),'cancel',context())));
test('cannot cancel unknown',()=>assert.throws(()=>step(unknown(),'cancel',context())));
test('attempt marker prevents fake unsent cancel',()=>assert.throws(()=>step({...base(),attempted:true},'cancel',context())));
test('retry retains frozen body/key/version',()=>{const u=unknown(),n=step(u,'dispatch',context());assert.deepEqual(n.body,u.body);assert.equal(n.key,u.key);assert.equal(n.body.expectedVersion,4);});
test('auth pause',()=>assert.throws(()=>step(base(),'dispatch',context({auth:false}))));
test('not caught up',()=>assert.throws(()=>step(base(),'dispatch',context({caughtUp:false}))));
test('reset fence',()=>assert.throws(()=>step(base(),'dispatch',context({reset:true}))));
test('epoch fence',()=>assert.throws(()=>step(base(),'dispatch',context({epoch:'3'}))));
test('foreign account callback',()=>assert.throws(()=>step(dispatch(),'receipt',context({owner:'synthetic-B'}),receipt(base()))));
test('A-B-A callback generation',()=>assert.throws(()=>step(dispatch(),'receipt',context({generation:3}),receipt(base()))));
test('wrong receipt identity',()=>assert.throws(()=>step(dispatch(),'receipt',context(),receipt(base(),{key:'different'}))));
test('wrong receipt version',()=>assert.throws(()=>step(dispatch(),'receipt',context(),receipt(base(),{entityVersion:6}))));
test('receipt is not settled',()=>assert.equal(acknowledged().state,'acknowledged'));
test('unknown receipt recovery',()=>{const u=unknown();assert.equal(step(u,'receipt',context(),receipt(u)).state,'acknowledged');});
test('mirror one bigint step behind',()=>assert.throws(()=>step(acknowledged(),'reconcile',context({mirrorThrough:'9007199254740992'}))));
test('mirror beyond watermark',()=>assert.equal(step(acknowledged(),'reconcile',context({mirrorThrough:'9007199254740994'})).state,'settled'));
test('uncertain failure is not rejection',()=>assert.throws(()=>step(dispatch(),'reject',context())));
test('definite conflict needs review',()=>assert.equal(step(dispatch(),'conflict',context({definitive:true})).state,'needs_review'));
test('definite rejection stops automatic resend',()=>{const n=step(dispatch(),'reject',context({definitive:true}));assert.equal(n.state,'rejected');assert.throws(()=>step(n,'dispatch',context()));});
test('privacy quarantine has no automatic retry',()=>{const n=step(unknown(),'privacy_reset',context({reset:true}));assert.equal(n.state,'privacy_blocked');assert.throws(()=>step(n,'dispatch',context()));});
test('privacy fence preserves minimal receipt evidence',()=>{const a=acknowledged(),n=step(a,'privacy_reset',context({reset:true}));assert.deepEqual(n.receipt,a.receipt);});
test('document scenario/card/gate inventory',()=>{
  for(const [prefix,n] of [['MP-',6],['MP-G',6],['MP-T',20]]) {
    const found=[...doc.matchAll(new RegExp(`^\\| (${prefix}\\d{2}) \\|`,'gm'))].map(m=>m[1]);
    assert.deepEqual(found,Array.from({length:n},(_,i)=>`${prefix}${String(i+1).padStart(2,'0')}`));
  }
  const owned = [...doc.matchAll(/^\| MP-\d{2} \|[^\n]+\| (MP-T[^|]+)\|$/gm)].map(row => {
    const match = row[1].match(/^MP-T(\d{2})(?:–(\d{2}))?/);
    assert.ok(match);
    const first = Number(match[1]), last = Number(match[2] ?? match[1]);
    return Array.from({length:last-first+1},(_,i)=>first+i);
  });
  assert.deepEqual(owned, [[1],[2,3,4,5,6],[7,8,9,10],[11,12,13,14],[15,16,17,18],[19,20]]);
  assert.ok(doc.includes('all NOT_RUN') && doc.includes('REVIEW_PENDING'));
});
console.log(JSON.stringify({status:failures.length?'FAIL':'PASS',states:model.states.length,
  transitions:model.transitions.length,referenceCases,runtimeScenariosSpecified:20,
  runtimeScenariosRun:0,scope:'Synthetic state/guard and document inventory ONLY; no durable storage, privacy purge, OS or security verification',failures},null,2));
process.exitCode=failures.length?1:0;
