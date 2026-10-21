import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
const ts = createRequire(import.meta.url)('typescript');
const code = ts.transpileModule(readFileSync('src/hooks/use-form-action.ts', 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
function deferred() { let resolve, reject; const promise = new Promise((yes, no) => { resolve = yes; reject = no; }); return { promise, resolve, reject }; }
function fixture() {
  const slots = []; let cursor = 0, cleanup, errors = 0;
  const deps = { useRef(initial) { return slots[cursor++] ??= { current: initial }; }, useState(initial) { const i = cursor++; slots[i] ??= { value: initial }; return [slots[i].value, value => { slots[i].value = value; }]; }, useEffect(fn) { if (!cleanup) cleanup = fn(); } };
  const exports = {}; runInNewContext(code, { exports, require: () => deps });
  return { render() { cursor = 0; return exports.useFormAction(() => { ++errors; }); }, unmount() { cleanup(); }, get errors() { return errors; }, settle: () => new Promise(setImmediate) };
}
test('duplicate password/provider submissions are blocked before a busy render', async () => {
  const app = fixture(), hook = app.render(), request = deferred(); let calls = 0, received;
  const work = () => { ++calls; return request.promise; };
  hook.run(work, result => { received = result; }); hook.run(work, () => {});
  assert.equal(calls, 1); assert.equal(app.render().busy, true);
  request.resolve({ status: 'error', message: 'safe localized service message' }); await app.settle();
  assert.equal(received.message, 'safe localized service message'); assert.equal(app.errors, 0); assert.equal(app.render().busy, false);
});
test('unexpected synchronous and asynchronous exceptions use the safe fallback and release the lock', async () => {
  const app = fixture(), hook = app.render();
  hook.run(() => { throw Error('private provider detail'); }, () => assert.fail('must not receive a failed action'));
  await app.settle(); assert.equal(app.errors, 1);
  app.render().run(() => Promise.reject(Error('private disk path')), () => assert.fail());
  await app.settle(); assert.equal(app.errors, 2); assert.equal(app.render().busy, false);
});
test('late callbacks cannot navigate or publish errors after unmount', async () => {
  const app = fixture(), hook = app.render(), request = deferred(); let received = false, calls = 0;
  hook.run(() => { ++calls; return request.promise; }, () => { received = true; }); app.unmount();
  request.resolve({ status: 'verification_required' }); await app.settle();
  assert.equal(received, false); hook.run(async () => { ++calls; }, () => {});
  assert.equal(calls, 1); assert.equal(app.errors, 0);
});
test('auth frame uses bundled preview art, keyboard avoidance, safe area and accessible back', () => {
  const frame = readFileSync('src/components/ui/auth-frame.tsx', 'utf8');
  assert.match(frame, /SafeAreaView/); assert.match(frame, /KeyboardAvoidingView/);
  assert.match(frame, /DeepFocusScene dark=\{dark\}/); assert.match(frame, /accessibilityLabel=\{backLabel\}/);
  assert.match(frame, /accessibilityRole="header"/); assert.match(frame, /keyboardShouldPersistTaps="handled"/);
  for (const page of ['sign-in', 'sign-up']) {
    const source = readFileSync(`src/app/auth/${page}.tsx`, 'utf8');
    assert.match(source, /<AuthFrame/); assert.match(source, /useFormAction/);
    assert.match(source, /editable=\{!busy\}/); assert.match(source, /onSubmitEditing/);
    assert.doesNotMatch(source, /setBusy/); assert.doesNotMatch(source, /error\.message/);
    assert.match(source, /const action = theme.primary/);
  }
});

test('recovery screens reuse the frame/lock without altering enumeration-safe outcomes or recovery-only navigation', () => {
  for (const page of ['forgot-password', 'reset-password', 'verify-email']) {
    const source = readFileSync(`src/app/auth/${page}.tsx`, 'utf8');
    assert.match(source, /<AuthFrame/);
    assert.match(source, /useFormAction/);
    assert.doesNotMatch(source, /setBusy|error\.message/);
  }
  const reset = readFileSync('src/app/auth/reset-password.tsx', 'utf8');
  assert.match(reset, /<ThemedText type="smallBold">\{copy.recovery.newPassword\}/);
  assert.match(reset, /<ThemedText type="smallBold">\{copy.recovery.confirmNewPassword\}/);
  assert.match(reset, /onSubmitEditing=\{submit\}/);
  assert.doesNotMatch(reset, /onBack=|\/auth\/sign-in/);
  const forgot = readFileSync('src/app/auth/forgot-password.tsx', 'utf8');
  assert.match(forgot, /failed \? copy.recovery.recoveryError : copy.recovery.resetSent/);
  assert.doesNotMatch(forgot, /setMessage\(result.message\)/);
});
