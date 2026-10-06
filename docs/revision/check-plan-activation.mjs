// Document inventory and synthetic gate logic ONLY; cannot authorize deployment.
import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import { fileURLToPath } from 'node:url';
const here = path.dirname(fileURLToPath(import.meta.url));
const packet = JSON.parse(fs.readFileSync(path.join(here,'contracts/plan-activation-evidence.json'),'utf8'));
const doc = fs.readFileSync(path.join(here,'31-PLAN-ACTIVATION-AND-RECOVERY-GATES.md'),'utf8');
const failures=[]; let cases=0;
const ids=(prefix,n)=>Array.from({length:n},(_,i)=>`${prefix}${String(i+1).padStart(2,'0')}`);
const exact=(o,k)=>assert.deepEqual(Object.keys(o).sort(),k.slice().sort());
function baseline(p) {
  exact(p,['contractVersion','task','executionAuthorized','candidateFingerprint','environment','gates','independentReview','ownerAuthorization','runtimeScenarios','limits']);
  assert.equal(p.contractVersion,1); assert.equal(p.task,'PL-05');
  assert.equal(p.executionAuthorized,false);assert.equal(p.candidateFingerprint,null);assert.equal(p.environment,null);
  assert.deepEqual(p.gates.map(g=>g.id),ids('PA-G',8));
  for(const g of p.gates) {
    exact(g,['id','title','sources','status','candidateFingerprint','environment','evidence']);
    assert.ok(g.title.length>20);assert.equal(g.status,'NOT_RUN');
    assert.equal(g.candidateFingerprint,null);assert.equal(g.environment,null);assert.deepEqual(g.evidence,[]);
    assert.ok(g.sources.length>0);assert.equal(new Set(g.sources).size,g.sources.length);
    for(const source of g.sources) {
      assert.ok(/^(?:\d{2}-[A-Z0-9-]+|\.\.\/ai\/[A-Z_]+)\.md$/.test(source));
      assert.ok(fs.existsSync(path.join(here,source)));
    }
  }
  for(const k of ['independentReview','ownerAuthorization'])
    assert.deepEqual(p[k],{status:'PENDING',candidateFingerprint:null,environment:null,evidence:[]});
  assert.deepEqual(p.runtimeScenarios,{prefix:'PA-T',count:12,status:'NOT_RUN'});
  assert.ok(p.limits.includes('not release eligibility'));
}
// These values stand for evidence checked by authorized people, not authenticated
// signatures, executed tests or a deployable policy engine.
function referenceEligible(p) {
  const nonempty=s=>typeof s==='string' && s.trim().length>0;
  if(!nonempty(p.candidateFingerprint) || !['staging','production'].includes(p.environment)) return false;
  if(!Array.isArray(p.gates) || p.gates.length!==8) return false;
  if(new Set(p.gates.map(g=>g.id)).size!==8 || ids('PA-G',8).some(id=>!p.gates.some(g=>g.id===id))) return false;
  const bound=e=>e.candidateFingerprint===p.candidateFingerprint && e.environment===p.environment
    && Array.isArray(e.evidence) && e.evidence.length>0 && e.evidence.every(nonempty);
  return p.gates.every(g=>g.status==='PASS' && bound(g))
    && [p.independentReview,p.ownerAuthorization].every(a=>a?.status==='APPROVED' && bound(a));
}
function test(label,fn) {cases++;try{fn();}catch(e){failures.push(`${label}: ${e.message}`);}}
function fixture() {
  const p=structuredClone(packet);p.candidateFingerprint='SYNTHETIC-CANDIDATE-NOT-A-REAL-BUILD';p.environment='staging';
  for(const g of [...p.gates,p.independentReview,p.ownerAuthorization]) {
    g.status=p.gates.includes(g)?'PASS':'APPROVED';g.candidateFingerprint=p.candidateFingerprint;
    g.environment=p.environment;g.evidence=['SYNTHETIC-REFERENCE-NOT-RUNTIME-EVIDENCE'];
  }
  return p;
}
test('honest unfilled inventory',()=>baseline(packet));
test('actual draft blocked',()=>assert.equal(referenceEligible(packet),false));
test('complete synthetic fixture exercises positive path',()=>assert.equal(referenceEligible(fixture()),true));
for(const [label,mutate] of [
  ['missing candidate',p=>p.candidateFingerprint=null],
  ['unknown environment',p=>p.environment='anywhere'],
  ['missing gate',p=>p.gates.pop()],
  ['duplicate gate',p=>p.gates[1].id=p.gates[0].id],
  ['unrun test',p=>p.gates[2].status='NOT_RUN'],
  ['failed test',p=>p.gates[2].status='FAIL'],
  ['N/A cannot waive gate',p=>p.gates[2].status='N/A'],
  ['missing evidence',p=>p.gates[3].evidence=[]],
  ['blank reference',p=>p.gates[3].evidence=[' ']],
  ['different build',p=>p.gates[1].candidateFingerprint='OTHER-SYNTHETIC-BUILD'],
  ['staging proof not production proof',p=>p.environment='production'],
  ['pending independent review',p=>p.independentReview.status='PENDING'],
  ['author self-review not independent approval',p=>p.independentReview.status='SELF_REVIEWED'],
  ['missing owner approval',p=>p.ownerAuthorization.status='PENDING'],
  ['old owner approval',p=>p.ownerAuthorization.candidateFingerprint='OLD-SYNTHETIC-BUILD'],
]) test(label,()=>{const p=fixture();mutate(p);assert.equal(referenceEligible(p),false);});
test('no invented execution authority in draft',()=>{const p=structuredClone(packet);p.executionAuthorized=true;assert.throws(()=>baseline(p));});
test('no synthetic passes saved as actual evidence',()=>assert.throws(()=>baseline(fixture())));
test('document maps gates cards and scenarios',()=>{
  for(const [prefix,count] of [['PA-G',8],['PA-',4],['PA-T',12]]) {
    const found=[...doc.matchAll(new RegExp(`^\\| (${prefix}\\d{2}) \\|`,'gm'))].map(m=>m[1]);
    assert.deepEqual(found,ids(prefix,count));
  }
  assert.ok(doc.includes('all NOT_RUN') && doc.includes('REVIEW_PENDING'));
});
console.log(JSON.stringify({status:failures.length?'FAIL':'PASS',gates:8,cards:4,referenceCases:cases,
  actualDraftEligible:referenceEligible(packet),runtimeScenariosSpecified:12,runtimeScenariosRun:0,
  scope:'Document inventory/synthetic evidence rules only; no real approval verification or deployment authority',failures},null,2));
process.exitCode=failures.length?1:0;
