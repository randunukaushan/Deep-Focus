// Structural specification checks only. Does not run any DB-T acceptance scenario.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const packet = JSON.parse(fs.readFileSync(path.join(here,'contracts/plan-database-test-packet.json'),'utf8'));
const doc = fs.readFileSync(path.join(here,'29-PLAN-DATABASE-RPC-TEST-PACKET.md'),'utf8');
const failures=[]; let negativeCases=0;
const ids = (prefix,n) => Array.from({length:n},(_,i)=>`${prefix}${String(i+1).padStart(2,'0')}`);
const exactKeys = (o,ks) => assert.deepEqual(Object.keys(o).sort(),ks.slice().sort());
const nonempty = s => assert.ok(typeof s==='string' && s.trim().length>=12);
function verify(p) {
  exactKeys(p,['contractVersion','task','executionAuthorized','independentReview','scope','gates','cards','tests']);
  assert.equal(p.contractVersion,1); assert.equal(p.task,'PL-03');
  assert.equal(p.executionAuthorized,false); assert.equal(p.independentReview,'PENDING');
  nonempty(p.scope);
  assert.deepEqual(p.gates.map(g=>g.id),ids('DB-G',7));
  assert.deepEqual(p.cards.map(c=>c.id),ids('DB-',7));
  assert.deepEqual(p.tests.map(t=>t.id),ids('DB-T',24));
  const gates=new Set(p.gates.map(g=>g.id)), tests=new Set(p.tests.map(t=>t.id));
  const seen=new Set(), owners=new Map();
  for(const g of p.gates) {exactKeys(g,['id','title','state']);nonempty(g.title);assert.equal(g.state,'OPEN');}
  for(const c of p.cards) {
    exactKeys(c,['id','title','state','dependsOn','gates','tests','outcome']);
    nonempty(c.title);nonempty(c.outcome);assert.equal(c.state,'DRAFT');
    assert.equal(new Set(c.dependsOn).size,c.dependsOn.length);
    for(const dep of c.dependsOn) assert.ok(seen.has(dep),`out-of-order/cyclic dependency ${c.id}/${dep}`);
    if(c.id==='DB-01') assert.deepEqual(c.dependsOn,[]);
    else assert.ok(c.dependsOn.includes(`DB-${String(Number(c.id.slice(3))-1).padStart(2,'0')}`));
    assert.ok(c.gates.length>0);assert.equal(new Set(c.gates).size,c.gates.length);
    for(const g of c.gates) assert.ok(gates.has(g),`unknown gate ${g}`);
    if(Number(c.id.slice(3))>=3) assert.ok(c.gates.includes('DB-G07'),'required independent review gate');
    for(const t of c.tests) {assert.ok(tests.has(t));assert.ok(!owners.has(t),`duplicate test owner ${t}`);owners.set(t,c.id);}
    seen.add(c.id);
  }
  assert.equal(owners.size,24,'all scenarios scheduled once');
  assert.equal(owners.get('DB-T01'),'DB-01');assert.equal(owners.get('DB-T21'),'DB-03');
  for(const n of [2,3,4,5,6,7,8,9,10,11,16]) assert.equal(owners.get(`DB-T${String(n).padStart(2,'0')}`),'DB-04','handler tests require handlers');
  for(const t of p.tests) {
    exactKeys(t,['id','title','given','when','then','source','status','evidence']);
    for(const k of ['title','given','when','then']) nonempty(t[k]);
    assert.equal(t.status,'NOT_RUN');assert.deepEqual(t.evidence,[]);
    assert.ok(/^(25|26|27|28)-[A-Z0-9-]+\.md$/.test(t.source));
    assert.ok(fs.existsSync(path.join(here,t.source)),`missing contract ${t.source}`);
  }
}
try {verify(packet);} catch(e) {failures.push(`packet: ${e.message}`);}
function negative(label,fn) {
  negativeCases++;const p=structuredClone(packet);fn(p);
  try {assert.throws(()=>verify(p));} catch(e) {failures.push(`${label}: ${e.message}`);}
}
negative('no inferred execution approval',p=>p.executionAuthorized=true);
negative('no invented independent review',p=>p.independentReview='COMPLETE');
negative('no pretend runtime pass',p=>p.tests[0].status='PASS');
negative('no invented evidence',p=>p.tests[0].evidence=['fictional.log']);
negative('missing scenario',p=>p.tests.pop());
negative('duplicate test ID',p=>p.tests[1].id=p.tests[0].id);
negative('cyclic dependency',p=>p.cards[0].dependsOn=['DB-07']);
negative('unscheduled scenario',p=>p.cards[3].tests.pop());
negative('handler test before handler',p=>{p.cards[3].tests=p.cards[3].tests.filter(t=>t!=='DB-T02');p.cards[1].tests=['DB-T02'];});
negative('unknown policy gate',p=>p.cards[1].gates=['DB-G99']);
negative('independent gate omitted',p=>p.cards[2].gates=p.cards[2].gates.filter(g=>g!=='DB-G07'));
negative('empty expected result',p=>p.tests[2].then='');
negative('unknown source',p=>p.tests[0].source='25-MISSING.md');
negative('unknown command field',p=>p.runSql='not an executable packet');
try {
  assert.equal([...doc.matchAll(/^\| DB-G\d{2} \|/gm)].length,7);
  for(const [a,b] of [[1,4],[5,8],[9,12],[13,16],[17,20],[21,24]])
    assert.ok(doc.includes(`DB-T${String(a).padStart(2,'0')}–${String(b).padStart(2,'0')}`));
  assert.ok(doc.includes('NOT_RUN') && doc.includes('REVIEW_PENDING'));
} catch(e) {failures.push(`document mapping: ${e.message}`);}
console.log(JSON.stringify({status:failures.length?'FAIL':'PASS',cards:packet.cards.length,gates:packet.gates.length,
  runtimeScenariosSpecified:packet.tests.length,runtimeScenariosRun:0,structuralNegativeCases:negativeCases,
  scope:'Document inventory/dependency checks ONLY; no SQL/RPC/migration/security tests',failures},null,2));
process.exitCode=failures.length?1:0;
