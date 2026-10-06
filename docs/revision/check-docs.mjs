// Read-only structural checks for this draft package; not product/security verification.
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const revisionDir = path.dirname(fileURLToPath(import.meta.url));
const repoDir = path.resolve(revisionDir, '../..');
const errors = [];
const notes = [];
const expected = [
  'README.md', '01-REQUIREMENTS-AND-DECISIONS.md',
  '02-RESEARCH-AND-RECOMMENDATIONS.md', '03-PRODUCT-AND-EXPERIENCE.md',
  '04-BACKEND-SECURITY-AND-SYNC.md', '05-WEB-AND-INTEGRATIONS.md',
  '06-MONETIZATION-AND-ENTITLEMENTS.md', '07-LUNA-IMPLEMENTATION-PLAYBOOK.md',
  '08-VERIFICATION-AND-RELEASE.md', '09-COVERAGE-AND-AUDIT.md',
  '10-SRI-LANKA-EDUCATION-RESEARCH-SI.md', '11-SRI-LANKA-EDUCATION-CONTRACTS.md',
  '12-LOCAL-RESOURCES-AND-WORK-PLANNING.md',
  '13-CORE-RELIABILITY-CONTRACTS.md',
  '14-BACKEND-API-DATABASE-BUILD-CONTRACT.md',
  '15-EXPERIENCE-AND-NAVIGATION-BUILD-CONTRACT.md',
  '16-BACKEND-EXTENSIONS-AND-OPERATIONS.md',
  '17-WEBSITE-PORTAL-AND-RELEASE-RUNBOOK.md',
  '18-IMPLEMENTATION-READINESS-AND-OWNER-DECISIONS.md',
  '19-SAFETY-AND-COMMITMENT-CONTRACT.md',
  '20-SETTINGS-PROGRESS-AND-UNITS.md',
  '21-ENGINEERING-WORKFLOW-AUDIT.md',
  '22-REWARD-GOAL-AND-AI-WIRE-CONTRACT.md',
  '23-AI-GENERATION-RECOVERY-AND-REVISION.md',
  '24-DAILY-PLAN-AND-GENERATION-WIRE-CONTRACT.md',
  '25-SAVED-PLAN-LIFECYCLE-AND-PRIVACY.md',
  '26-SAVED-PLAN-MANAGEMENT-WIRE.md',
  '27-PLAN-REPLICATION-SNAPSHOT-EXPORT-WIRE.md',
  '28-ACCOUNT-EXPORT-ARTIFACT-CONTRACT.md',
  '29-PLAN-DATABASE-RPC-TEST-PACKET.md',
  '30-MOBILE-PLAN-STORAGE-OUTBOX-RECOVERY.md',
  '31-PLAN-ACTIVATION-AND-RECOVERY-GATES.md',
  '32-JANUARY-RELEASE-SCOPE-AND-DECISIONS.md',
  '33-PAID-CLOUD-ADMISSION-AND-RECOVERY.md',
  '34-LOCAL-RESOURCE-IMPORT-AND-RECOVERY.md',
  '35-RESOURCE-FORMAT-LIMIT-AND-VIEWER-OPTIONS.md',
];
if (!fs.existsSync(path.join(revisionDir, '00-OWNER-REVIEW-SI.md'))) errors.push('Missing Sinhala owner review');
for (const name of expected) {
  if (!fs.existsSync(path.join(revisionDir, name))) errors.push(`Missing package file: ${name}`);
}
function markdownFiles(dir) {
  return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const full = path.join(dir, entry.name);
    if (entry.isSymbolicLink()) return [];
    if (entry.isDirectory()) return markdownFiles(full);
    return entry.isFile() && entry.name.endsWith('.md') ? [full] : [];
  });
}
const revisionFiles = markdownFiles(revisionDir);
const canonicalFiles = [
  'V1_FEATURE_SCOPE.md', 'POST_V1_FEATURE_SCOPE.md', 'V1_SCREEN_MAP.md',
  'V1_IMPLEMENTATION_PLAN.md', 'DATA_MODEL.md', 'TESTING_STRATEGY.md',
  'ARCHITECTURE.md', 'UI_UX_DESIGN_SPECIFICATION.md', 'COMPONENT_LIBRARY.md',
  'API_SPEC.md', 'DATABASE_SCHEMA.md', 'SECURITY.md', 'AI_RULES.md', 'CHANGELOG.md',
  'DEVELOPMENT_GUIDE.md',
  'PROJECT_VISION.md', 'BLUEPRINT.md',
  'CONTRIBUTING.md', 'DOCUMENTATION_MAP.md',
].map((name) => path.join(repoDir, 'docs', name));
const governanceFiles = ['AGENTS.md', 'README.md',
  'docs/ai/AI_EXECUTION_POLICY.md', 'docs/ai/DEFINITION_OF_DONE.md',
  'docs/ai/ENGINEERING_GUARDRAILS.md', 'docs/ai/MODEL_ESCALATION_POLICY.md',
  'docs/ai/TASK_BRIEF_TEMPLATE.md',
].map((name) => path.join(repoDir, name));
const files = [...revisionFiles, ...canonicalFiles, ...governanceFiles];
let checkedLinks = 0;
let skippedMachineLinks = 0;
for (const file of files) {
  const contents = fs.readFileSync(file, 'utf8');
  const lines = contents.split(/\r?\n/);
  let fence = null;
  const outside = [];
  for (let i = 0; i < lines.length; i += 1) {
    const marker = lines[i].match(/^\s{0,3}(`{3,}|~{3,})(.*)$/);
    if (marker) {
      if (!fence) fence = { character: marker[1][0], length: marker[1].length, line: i + 1 };
      else if (marker[1][0] === fence.character && marker[1].length >= fence.length && !marker[2].trim()) fence = null;
      continue;
    }
    if (!fence) outside.push(lines[i]);
  }
  if (fence) errors.push(`${path.relative(repoDir, file)}:${fence.line}: unclosed fence`);
  const prose = outside.join('\n');
  const definitions = [...prose.matchAll(/^\[\^(\d+)\]:/gm)].map((match) => match[1]);
  const definitionSet = new Set(definitions);
  if (definitions.length !== definitionSet.size) errors.push(`${path.relative(repoDir, file)}: duplicate numbered footnote definition`);
  const references = new Set([...prose.replace(/^\[\^\d+\]:.*$/gm, '').matchAll(/\[\^(\d+)\]/g)].map((match) => match[1]));
  for (const id of references) if (!definitionSet.has(id)) errors.push(`${path.relative(repoDir, file)}: undefined footnote ${id}`);
  for (const id of definitionSet) if (!references.has(id)) errors.push(`${path.relative(repoDir, file)}: unused footnote ${id}`);
  for (const match of outside.join('\n').matchAll(/!?\[[^\]\n]*\]\((<[^>\n]+>|[^)\n]+)\)/g)) {
    let target = match[1].trim().replace(/^<|>$/g, '');
    if (/^(?:https?:|mailto:|tel:|codex:|data:|#)/i.test(target)) continue;
    if (/^[A-Za-z]:[\\/]/.test(target)) {
      skippedMachineLinks += 1;
      continue; // historical input references, explicitly documented as non-portable
    }
    target = target.split('#')[0];
    try { target = decodeURIComponent(target); } catch { errors.push(`Invalid link encoding: ${target}`); }
    // Codex file links may include a one-based :line suffix.
    const lineSuffix = target.match(/:(\d+)$/);
    const lineNumber = lineSuffix ? Number(lineSuffix[1]) : null;
    if (lineSuffix) target = target.slice(0, -lineSuffix[0].length);
    if (!target) continue;
    const resolved = path.resolve(path.dirname(file), target);
    const relative = path.relative(repoDir, resolved);
    if (relative.startsWith(`..${path.sep}`) || relative === '..' || path.isAbsolute(relative)) {
      errors.push(`${path.relative(repoDir, file)}: relative link leaves repository: ${target}`);
      continue;
    }
    checkedLinks += 1;
    if (!fs.existsSync(resolved)) errors.push(`${path.relative(repoDir, file)}: broken local link: ${target}`);
    else if (lineNumber !== null && fs.statSync(resolved).isFile()) {
      const lineCount = fs.readFileSync(resolved, 'utf8').split(/\r?\n/).length;
      if (lineNumber < 1 || lineNumber > lineCount) errors.push(`Invalid line reference: ${target}:${lineNumber}`);
    }
  }
}
const register = fs.readFileSync(path.join(revisionDir, expected[1]), 'utf8');
const ids = [...register.matchAll(/^\| (DF-\d{3}) \|/gm)].map((match) => match[1]);
const adrIds = [...register.matchAll(/^\| (ADR-\d{3}) \|/gm)].map((match) => match[1]);
for (const [prefix, count, actual] of [['DF', 80, ids], ['ADR', 12, adrIds]]) {
  const wanted = Array.from({ length: count }, (_, i) => `${prefix}-${String(i + 1).padStart(3, '0')}`);
  if (actual.length !== count || new Set(actual).size !== count || wanted.some((id) => !actual.includes(id))) {
    errors.push(`${prefix} register must contain exactly ${count} unique sequential table IDs`);
  }
}
const audit = fs.readFileSync(path.join(revisionDir, expected[9]), 'utf8');
// Coverage/status regression only: not semantic approval or release readiness.
const releaseMap = fs.readFileSync(path.join(revisionDir, '32-JANUARY-RELEASE-SCOPE-AND-DECISIONS.md'), 'utf8');
const releaseIds = [...releaseMap.matchAll(/^\| (DF-\d{3}) \|/gm)].map((m) => m[1]);
if (releaseIds.length !== 80 || new Set(releaseIds).size !== 80
  || ids.some((id) => !releaseIds.includes(id))) errors.push('Release map must cover each of the 80 register families exactly once');
const approvalCounts = { APPROVED: 0, PARTIAL: 0, OPEN: 0 };
for (const row of register.matchAll(/^\| ADR-\d{3} \| ([^|]+)\|/gm)) {
  const status = row[1].trim().startsWith('APPROVED') ? 'APPROVED'
    : row[1].trim().startsWith('PARTIAL') ? 'PARTIAL' : 'OPEN';
  approvalCounts[status] += 1;
}
if (approvalCounts.APPROVED !== 2 || approvalCounts.PARTIAL !== 9 || approvalCounts.OPEN !== 1) {
  errors.push('September 26 ADR checkpoint must remain 2 approved, 9 partial, 1 open until an explicit new recorded approval updates this guard');
}
const cloudPacket = fs.readFileSync(path.join(revisionDir, '33-PAID-CLOUD-ADMISSION-AND-RECOVERY.md'), 'utf8');
const cloudRuntimeRows = [...cloudPacket.matchAll(/^\| CC-T\d{2} \|.*$/gm)].map((m) => m[0]);
if (cloudRuntimeRows.some((row) => !row.endsWith('| NOT_RUN |'))) {
  errors.push('Cloud runtime inventory has no execution evidence yet; do not promote NOT_RUN through a document check');
}
const covered = new Set();
const resourceOptions = fs.readFileSync(path.join(revisionDir, '35-RESOURCE-FORMAT-LIMIT-AND-VIEWER-OPTIONS.md'), 'utf8');
const resourceOptionRows = [...resourceOptions.matchAll(/^\| (RO-T\d{2}) \|.*$/gm)];
const expectedResourceOptions = Array.from({ length: 8 }, (_, i) => `RO-T${String(i + 1).padStart(2, '0')}`);
if (resourceOptionRows.length !== 8 || new Set(resourceOptionRows.map((m) => m[1])).size !== 8
  || expectedResourceOptions.some((id) => !resourceOptionRows.some((m) => m[1] === id))
  || resourceOptionRows.some((m) => !m[0].endsWith('| NOT_RUN |'))) {
  errors.push('Resource option sheet must contain RO-T01–08, all NOT_RUN until real evidence is recorded and this guard reviewed');
}
const localResourcePacket = fs.readFileSync(path.join(revisionDir, '34-LOCAL-RESOURCE-IMPORT-AND-RECOVERY.md'), 'utf8');
const localRuntimeRows = [...localResourcePacket.matchAll(/^\| LR-T\d{2} \|.*$/gm)].map((m) => m[0]);
if (localRuntimeRows.some((row) => !row.endsWith('| NOT_RUN |'))) {
  errors.push('Local resource runtime evidence is absent; document checks cannot promote NOT_RUN cases');
}
for (const match of audit.matchAll(/^\| DF-(\d{3})\.\.DF-(\d{3}) \|/gm)) {
  const first = Number(match[1]);
  const last = Number(match[2]);
  if (first < 1 || last > 80 || first > last) errors.push(`Invalid coverage range ${match[0]}`);
  for (let number = first; number <= last; number += 1) {
    const id = `DF-${String(number).padStart(3, '0')}`;
    if (covered.has(id)) errors.push(`Duplicate coverage row: ${id}`);
    covered.add(id);
  }
}
for (const id of ids) if (!covered.has(id)) errors.push(`Missing coverage: ${id}`);
const education = fs.readFileSync(path.join(revisionDir, '11-SRI-LANKA-EDUCATION-CONTRACTS.md'), 'utf8');
const educationTests = [...education.matchAll(/^\| (SL-T\d{2}) \|/gm)].map((match) => match[1]);
const educationCards = [...education.matchAll(/^\| (SL-\d{2}) \|/gm)].map((match) => match[1]);
for (const [prefix, count, actual] of [['SL-T', 18, educationTests], ['SL-', 10, educationCards]]) {
  const wanted = Array.from({ length: count }, (_, i) => `${prefix}${String(i + 1).padStart(2, '0')}`);
  if (actual.length !== count || new Set(actual).size !== count || wanted.some((id) => !actual.includes(id))) {
    errors.push(`${prefix} table must contain exactly ${count} unique sequential IDs`);
  }
}
if (skippedMachineLinks) notes.push(`${skippedMachineLinks} historical machine-local attachment links excluded from portability checks`);
const resources = fs.readFileSync(path.join(revisionDir, '12-LOCAL-RESOURCES-AND-WORK-PLANNING.md'), 'utf8');
const resourceTests = [...resources.matchAll(/^\| (R-T\d{2}) \|/gm)].map((match) => match[1]);
const resourceCards = [...resources.matchAll(/^\| (R-\d{2}) \|/gm)].map((match) => match[1]);
for (const [prefix, count, actual] of [['R-T', 16, resourceTests], ['R-', 6, resourceCards]]) {
  const wanted = Array.from({ length: count }, (_, i) => `${prefix}${String(i + 1).padStart(2, '0')}`);
  if (actual.length !== count || new Set(actual).size !== count || wanted.some((id) => !actual.includes(id))) {
    errors.push(`${prefix} table must contain exactly ${count} unique sequential IDs`);
  }
}
const core = fs.readFileSync(path.join(revisionDir, '13-CORE-RELIABILITY-CONTRACTS.md'), 'utf8');
const coreTests = [...core.matchAll(/^\| (CR-T\d{2}) \|/gm)].map((match) => match[1]);
const coreCards = [...core.matchAll(/^\| (CR-\d{2}) \|/gm)].map((match) => match[1]);
for (const [prefix, count, actual] of [['CR-T', 20, coreTests], ['CR-', 6, coreCards]]) {
  const wanted = Array.from({ length: count }, (_, i) => `${prefix}${String(i + 1).padStart(2, '0')}`);
  if (actual.length !== count || new Set(actual).size !== count || wanted.some((id) => !actual.includes(id))) {
    errors.push(`${prefix} table must contain exactly ${count} unique sequential IDs`);
  }
}
const coreDiagnostic = fs.readFileSync(path.join(revisionDir, 'inspect-core-baseline.mjs'), 'utf8');
const diagnosticCases = [...coreDiagnostic.matchAll(/\['(CR-T\d{2})',/g)].map((match) => match[1]);
if (diagnosticCases.length !== 8 || new Set(diagnosticCases).size !== 8
  || diagnosticCases.some((id, i) => id !== `CR-T${String(i + 1).padStart(2, '0')}` || !coreTests.includes(id))) {
  errors.push('Core diagnostic must map exactly CR-T01–08 to documented scenarios');
}
const extraCounts = {};
for (const [file, cardPrefix, testPrefix, cardCount, testCount] of [
  ['14-BACKEND-API-DATABASE-BUILD-CONTRACT.md', 'BE-', 'BE-T', 8, 18],
  ['15-EXPERIENCE-AND-NAVIGATION-BUILD-CONTRACT.md', 'UX-', 'UX-T', 8, 24],
  ['16-BACKEND-EXTENSIONS-AND-OPERATIONS.md', 'BX-', 'BX-T', 8, 24],
  ['17-WEBSITE-PORTAL-AND-RELEASE-RUNBOOK.md', 'WP-', 'WP-T', 10, 24],
  ['19-SAFETY-AND-COMMITMENT-CONTRACT.md', 'SC-', 'SC-T', 4, 20],
  ['20-SETTINGS-PROGRESS-AND-UNITS.md', 'SP-', 'SP-T', 5, 24],
  ['25-SAVED-PLAN-LIFECYCLE-AND-PRIVACY.md', 'PL-', 'PL-T', 5, 12],
  ['33-PAID-CLOUD-ADMISSION-AND-RECOVERY.md', 'CC-', 'CC-T', 6, 20],
  ['34-LOCAL-RESOURCE-IMPORT-AND-RECOVERY.md', 'LR-', 'LR-T', 5, 20],
]) {
  const body = fs.readFileSync(path.join(revisionDir, file), 'utf8');
  for (const [prefix, count] of [[cardPrefix, cardCount], [testPrefix, testCount]]) {
    const actual = [...body.matchAll(new RegExp(`^\\| (${prefix}\\d{2}) \\|`, 'gm'))].map((m) => m[1]);
    const wanted = Array.from({ length: count }, (_, i) => `${prefix}${String(i + 1).padStart(2, '0')}`);
    if (actual.length !== count || new Set(actual).size !== count || wanted.some((id) => !actual.includes(id))) {
      errors.push(`${prefix} table must contain exactly ${count} unique sequential IDs`);
    }
    extraCounts[prefix] = actual.length;
  }
}
for (const name of ['check-backend-contracts.mjs', 'check-experience-contracts.mjs',
  'contracts/personal-api.schema.json', 'contracts/personal-api.openapi.json',
  'contracts/personal-core.sql', 'contracts/mobile-navigation.json', 'contracts/experience-tokens.json',
  'check-extension-contracts.mjs', 'contracts/backend-extensions.schema.json', 'contracts/web-surfaces.json',
  'contracts/personal-extensions.openapi.json', 'check-operations-contracts.mjs',
  'contracts/operations-api.schema.json', 'contracts/operations-api.openapi.json',
  'contracts/rewards-ai.schema.json', 'contracts/rewards-ai.openapi.json', 'check-rewards-ai-contracts.mjs',
  'contracts/ai-generation-lifecycle.json', 'check-ai-generation-lifecycle.mjs',
  'contracts/planning.schema.json', 'contracts/planning.openapi.json', 'check-planning-contracts.mjs',
  'check-plan-lifecycle.mjs', 'check-plan-management.mjs',
  'contracts/plan-management.schema.json', 'contracts/plan-management.openapi.json',
  'check-replication-v2.mjs', 'contracts/replication-v2.schema.json',
  'contracts/replication-v2.openapi.json', 'contracts/account-export.schema.json',
  'check-account-export.mjs', 'contracts/plan-database-test-packet.json',
  'check-plan-database-packet.mjs', 'contracts/mobile-plan-recovery.json',
  'check-mobile-plan-recovery.mjs', 'contracts/plan-activation-evidence.json',
  'check-plan-activation.mjs']) {
  if (!fs.existsSync(path.join(revisionDir, name))) errors.push(`Missing contract artifact: ${name}`);
}
// Narrow regression guards for specifically reconciled legacy clauses, not an
// NLP/medical-policy audit. Negative examples and historical evidence are valid.
const legacyPolicyChecks = [
  ['BLUEPRINT.md', 'XP forfeiture rule', /Ending the session early may reduce or forfeit/i],
  ['BLUEPRINT.md', 'optional XP staking', /users may (?:choose to stake|voluntarily stake)/i],
  ['ARCHITECTURE.md', 'Focus Bet result processor', /Focus Bet results where enabled/i],
  ['COMPONENT_LIBRARY.md', 'positive prevention example', /^- Burnout Prevention\s*$/m],
  ['COMPONENT_LIBRARY.md', 'positive risk-card example', /^- Burnout Risk Card\s*$/m],
  ['COMPONENT_LIBRARY.md', 'positive risk-indicator example', /^- Burnout Risk Indicator\s*$/m],
  ['COMPONENT_LIBRARY.md', 'positive health-indicator example', /^- Burnout Indicators\s*$/m],
  ['TESTING_STRATEGY.md', 'unapproved risk calculation test', /Burnout risk calculations where implemented/i],
  ['UI_UX_DESIGN_SPECIFICATION.md', 'conditional emergency availability', /Emergency Exit where required/i],
];
for (const [file, label, pattern] of legacyPolicyChecks) {
  const body = fs.readFileSync(path.join(repoDir, 'docs', file), 'utf8');
  if (pattern.test(body)) errors.push(`${file}: superseded legacy clause reintroduced (${label})`);
}
// Stable policy must not require editing model IDs whenever a mapping changes.
// This is a narrow text regression check, not proof of policy consistency.
for (const name of ['AGENTS.md', 'docs/AI_RULES.md',
  'docs/ai/AI_EXECUTION_POLICY.md', 'docs/ai/DEFINITION_OF_DONE.md',
  'docs/ai/ENGINEERING_GUARDRAILS.md']) {
  if (/\bgpt-\d/i.test(fs.readFileSync(path.join(repoDir, name), 'utf8'))) {
    errors.push(`${name}: move model identifiers to MODEL_ESCALATION_POLICY.md`);
  }
}
console.log(JSON.stringify({
  status: errors.length ? 'FAIL' : 'PASS', markdownFiles: revisionFiles.length,
  canonicalMarkdownFilesChecked: canonicalFiles.length,
  governanceAndEntryFilesChecked: governanceFiles.length,
  localLinksChecked: checkedLinks, requirements: ids.length, decisions: adrIds.length,
  coveredRequirements: covered.size, notes, errors,
  releaseMapRequirements: releaseIds.length, approvalCounts,
  cloudRuntimeScenariosSpecified: cloudRuntimeRows.length, cloudRuntimeScenariosRun: 0,
  localResourceRuntimeScenariosSpecified: localRuntimeRows.length, localResourceRuntimeScenariosRun: 0,
  resourceOptionProbesSpecified: resourceOptionRows.length, resourceOptionProbesRun: 0,
  educationCards: educationCards.length, educationAcceptanceScenarios: educationTests.length,
  resourceCards: resourceCards.length, resourceAcceptanceScenarios: resourceTests.length,
  coreCards: coreCards.length, coreAcceptanceScenarios: coreTests.length,
  currentSourceDiagnosticCases: diagnosticCases.length,
  buildContractIds: extraCounts,
  knownLegacyPolicyChecks: legacyPolicyChecks.length,
}, null, 2));
process.exitCode = errors.length ? 1 : 0;
