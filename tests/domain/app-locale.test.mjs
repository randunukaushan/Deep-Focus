import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';

const ts = createRequire(import.meta.url)('typescript');
const source = readFileSync(new URL('../../src/features/localization/app-locale.ts', import.meta.url), 'utf8');
const { outputText } = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } });
const exports = {};
runInNewContext(outputText, { exports });
const { getAppLocaleCopy } = exports;

test('locale copy uses stable navigation labels for all approved locales', () => {
  assert.equal(JSON.stringify(getAppLocaleCopy('si').tabs), JSON.stringify({ home: 'මුල් පිටුව', plan: 'සැලැස්ම', focus: 'අවධානය', progress: 'ප්‍රගතිය', profile: 'පැතිකඩ' }));
  assert.equal(JSON.stringify(getAppLocaleCopy('ta').tabs), JSON.stringify({ home: 'முகப்பு', plan: 'திட்டம்', focus: 'கவனம்', progress: 'முன்னேற்றம்', profile: 'சுயவிவரம்' }));
  assert.equal(getAppLocaleCopy('en').tabs.focus, 'Focus');
});

test('locale copy has a deterministic English fallback for invalid persisted input', () => {
  assert.equal(getAppLocaleCopy('xx').tabs.home, 'Home');
});

test('entry and sign-in copy is available in every approved locale', () => {
  for (const locale of ['en', 'si', 'ta']) {
    const copy = getAppLocaleCopy(locale);
    assert.ok(copy.welcome.title);
    assert.ok(copy.signIn.title);
    assert.ok(copy.signIn.email);
    assert.ok(copy.signIn.emailError);
    assert.ok(copy.signIn.password);
    assert.ok(copy.signIn.passwordError);
    assert.ok(copy.signUp.title);
    assert.ok(copy.signUp.confirmPassword);
    assert.ok(copy.recovery.resetTitle);
    assert.ok(copy.recovery.savePassword);
    assert.ok(copy.recovery.resetSent);
    assert.ok(copy.recovery.recoveryError);
    assert.ok(copy.home.heroTitle);
    assert.ok(copy.home.quickActions);
    assert.ok(copy.focus.title);
    assert.ok(copy.focus.start);
    assert.ok(copy.focus.savedLocally);
    assert.ok(copy.focus.setupTitle);
    assert.ok(copy.focus.taskUnavailable);
    assert.ok(copy.focus.durationError);
    assert.ok(copy.focus.summaryEyebrow);
    assert.ok(copy.focus.anotherSession);
    assert.ok(copy.plan.title);
    assert.ok(copy.plan.tasksDetail);
    assert.ok(copy.profile.title);
    assert.ok(copy.profile.privateNote);
    assert.ok(copy.profile.syncStatus);
    assert.ok(copy.profile.syncStatusLoading);
    assert.ok(copy.profile.syncStatusLocalDetail);
    assert.ok(copy.profile.syncStatusPendingDetail.includes('{count}'));
    assert.ok(copy.profile.syncStatusUnavailable);
    assert.ok(copy.planner.title);
    assert.ok(copy.planner.loadError);
    assert.ok(copy.planner.confirm);
    assert.ok(copy.goals.saveError);
    assert.ok(copy.tasks.loadError);
    assert.ok(copy.profile.resources);
  assert.ok(copy.resourcesPage.title);
  assert.ok(copy.resourcesPage.referenceInput);
  assert.ok(copy.resourcesPage.taskSection);
    assert.ok(copy.resourcesPage.linkChangedError);
    assert.ok(copy.historyPage.title);
    assert.ok(copy.historyPage.loadErrorDetail);
    assert.ok(copy.historyPage.noMatchingDetail);
  }
  assert.equal(getAppLocaleCopy('si').signIn.signIn, 'ඇතුල් වන්න');
  assert.equal(getAppLocaleCopy('ta').welcome.signIn, 'உள்நுழைக');
  assert.equal(getAppLocaleCopy('si').home.tasks, 'කාර්ය');
  assert.equal(getAppLocaleCopy('si').focus.start, 'අවධානම් සැසිය ආරම්භ කරන්න');
  assert.equal(getAppLocaleCopy('ta').plan.goals, 'இலக்குகள்');
  assert.equal(getAppLocaleCopy('si').profile.signOut, 'ඉවත් වන්න');
  assert.equal(getAppLocaleCopy('si').planner.confirm, 'මෙම යෝජනාව තහවුරු කරන්න');
  assert.equal(getAppLocaleCopy('si').focus.setupTitle, 'සැසි සැකසුම');
  assert.equal(getAppLocaleCopy('ta').tasks.add, 'பணியைச் சேர்க்கவும்');
  assert.equal(getAppLocaleCopy('si').focus.summaryEyebrow, 'සැසි සාරාංශය');
  assert.equal(getAppLocaleCopy('si').resourcesPage.save, 'සම්පත සුරකින්න');
  assert.equal(getAppLocaleCopy('si').historyPage.title, 'සැසි ඉතිහාසය');
  assert.equal(getAppLocaleCopy('ta').historyPage.title, 'அமர்வு வரலாறு');
});
