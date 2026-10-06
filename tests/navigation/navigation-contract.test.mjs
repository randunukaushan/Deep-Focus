import assert from 'node:assert/strict';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import test from 'node:test';

const root = process.cwd();
const source = (path) => readFileSync(join(root, path), 'utf8');

test('native tab shell declares the approved five destinations in order', () => {
  const layout = source('src/app/(tabs)/_layout.tsx');
  const routes = [...layout.matchAll(/<NativeTabs\.Trigger name="([^"]+)"/g)].map((match) => match[1]);
  assert.deepEqual(routes, ['home', 'plan', 'focus', 'progress', 'profile']);
});

test('Plan tab links only to existing task and goal routes', () => {
  const plan = source('src/app/(tabs)/plan.tsx');
  assert.match(plan, /router\.push\('\/tasks'\)/);
  assert.match(plan, /router\.push\('\/goals'\)/);
  assert.ok(existsSync(join(root, 'src/app/tasks/index.tsx')));
  assert.ok(existsSync(join(root, 'src/app/goals/index.tsx')));
});

test('Progress history, detail and rewards are canonical routes', () => {
  for (const path of [
    'src/app/(tabs)/progress/index.tsx',
    'src/app/(tabs)/progress/_layout.tsx',
    'src/app/(tabs)/progress/history.tsx',
    'src/app/(tabs)/progress/history/[sessionId].tsx',
    'src/app/(tabs)/progress/rewards.tsx',
  ]) assert.ok(existsSync(join(root, path)), `${path} exists`);
  assert.match(source('src/app/(tabs)/progress/history.tsx'), /pathname: '\/progress\/history\/\[sessionId\]'/);
  assert.match(source('src/app/(tabs)/progress/history/[sessionId].tsx'), /router\.replace\('\/progress\/history'\)/);
});

test('legacy analytics and reward links redirect and retain dynamic session ID', () => {
  assert.match(source('src/app/analytics.tsx'), /<Redirect href="\/progress"/);
  assert.match(source('src/app/rewards.tsx'), /<Redirect href="\/progress\/rewards"/);
  assert.match(source('src/app/analytics/history.tsx'), /<Redirect href="\/progress\/history"/);
  const detailAlias = source('src/app/analytics/history/[sessionId].tsx');
  assert.match(detailAlias, /pathname: '\/progress\/history\/\[sessionId\]'/);
  assert.match(detailAlias, /params: \{ sessionId \}/);
});
