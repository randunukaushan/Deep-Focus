import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
import test from 'node:test';

const ts = createRequire(import.meta.url)('typescript');
const code = ts.transpileModule(readFileSync('src/components/animated-icon.tsx', 'utf8'), {
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.CommonJS },
}).outputText;

function fixture(reduceMotion = false) {
  const slots = [], effects = [], timers = new Map(), fades = [];
  let cursor = 0, now = 0, id = 0;
  const deps = {
    react: {
      useState(initial) {
        const i = cursor++;
        if (!(i in slots)) slots[i] = typeof initial === 'function' ? initial() : initial;
        return [slots[i], value => { slots[i] = value; }];
      },
      useEffect(fn, args) {
        const i = cursor++, prior = slots[i];
        if (!prior || args.some((arg, n) => arg !== prior.args[n])) {
          prior?.cleanup?.();
          const effect = { args }; slots[i] = effect;
          effects.push(() => { effect.cleanup = fn(); });
        }
      },
    },
    'expo-image': { Image: 'Image' },
    'react-native': {
      AccessibilityInfo: { isReduceMotionEnabled: async () => reduceMotion, addEventListener: () => ({ remove() {} }) },
      Animated: { View: 'AnimatedView', Value: class { constructor(value) { this.value = value; } },
        timing: (_, options) => ({ start(callback) { fades.push(options); callback({ finished: true }); }, stop() {} }) },
      Easing: { quad: value => value, inOut: value => value },
      StyleSheet: { create: value => value, absoluteFill: {} }, View: 'View',
    },
    '@/features/settings/presentation-context': { usePresentation: () => ({ loading: false, preferences: { reduceMotion: false } }) },
    'react/jsx-runtime': { jsx: (type, props) => ({ type, props }), jsxs: (type, props) => ({ type, props }) },
    '../../assets/images/deep-focus-brand-reference.png': 'original-logo',
  };
  const exports = {};
  runInNewContext(code, {
    exports, require: key => { assert.ok(key in deps, key); return deps[key]; },
    setTimeout(fn, delay) { const key = ++id; timers.set(key, { fn, at: now + delay }); return key; },
    clearTimeout: key => timers.delete(key),
  });
  return {
    render() { cursor = 0; const tree = exports.AnimatedSplashOverlay(); effects.splice(0).forEach(fn => fn()); return tree; },
    advance(ms) { now += ms; for (const [key, timer] of timers) if (timer.at <= now) { timers.delete(key); timer.fn(); } },
    unmount() { slots.forEach(slot => slot?.cleanup?.()); },
    fades, timers,
  };
}

test('reading interval starts after the original artwork loads, then fades without zoom', async () => {
  const app = fixture();
  app.render(); await Promise.resolve();
  let tree = app.render(); app.advance(1000);
  assert.equal(app.fades.length, 0);
  assert.equal(tree.props.children.props.source, 'original-logo');
  tree.props.children.props.onLoad(); app.render();
  app.advance(1499); assert.equal(app.fades.length, 0);
  app.advance(1); assert.equal(app.fades[0].duration, 350);
  assert.equal(app.render(), null);
});

test('reduced motion bypasses decoration and image failure dismisses the overlay', async () => {
  const reduced = fixture(true); reduced.render(); await Promise.resolve();
  assert.equal(reduced.render(), null); assert.equal(reduced.fades.length, 0);
  const failed = fixture(); const tree = failed.render();
  tree.props.children.props.onError(); assert.equal(failed.render(), null);
});

test('watchdog bounds missing asset callbacks and unmount cancels pending work', () => {
  const stalled = fixture(); stalled.render(); stalled.advance(5000);
  assert.equal(stalled.render(), null);
  const app = fixture(); app.render(); app.unmount();
  assert.equal(app.timers.size, 0); app.advance(10000); assert.equal(app.fades.length, 0);
});
