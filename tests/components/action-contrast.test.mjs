import assert from 'node:assert/strict';
import test from 'node:test';
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import { runInNewContext } from 'node:vm';
const ts = createRequire(import.meta.url)('typescript');
const compile = path => ts.transpileModule(readFileSync(path, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022 } }).outputText;
const tokens = {}; runInNewContext(compile('src/theme/tokens.ts'), { exports: tokens });
const colors = {}; runInNewContext(compile('src/theme/action-colors.ts'), { exports: colors, require: () => tokens });
function luminance(hex) {
  const normalized = Number.parseInt(hex.substring(1), 16);
  const values = [(normalized >> 16) & 255, (normalized >> 8) & 255, normalized & 255].map(channel => {
    const fraction = channel / 255;
    return fraction > 0.04045 ? Math.pow((fraction + 0.055) / 1.055, 2.4) : fraction / 12.92;
  });
  return values[0] * 0.2126 + values[1] * 0.7152 + values[2] * 0.0722;
}
test('actual preview light/dark action fills have at least 4.5:1 chosen text contrast', () => {
  assert.equal(colors.accentTextColor(tokens.Colors.light.primary), '#FFFFFF');
  assert.equal(colors.accentTextColor(tokens.Colors.dark.primary), '#0F2537');
  for (const theme of Object.values(tokens.Colors)) {
    const a = luminance(theme.primary), b = luminance(colors.accentTextColor(theme.primary));
    const ratio = (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
    assert.ok(ratio >= 4.5, `unrounded ratio ${ratio}`);
  }
});
test('selected controls use the same foreground rule as real buttons', () => {
  for (const file of ['src/app/profile/settings.tsx', 'src/app/(tabs)/progress/history.tsx', 'src/app/plan-my-day.tsx', 'src/app/(tabs)/progress/rewards.tsx', 'src/app/goals/index.tsx', 'src/app/(tabs)/progress/index.tsx', 'src/app/tasks/index.tsx']) {
    const source = readFileSync(file, 'utf8');
    assert.match(source, /const action = theme.primary/);
    assert.match(source, /const onAction = accentTextColor\(action\)/);
    if (file.endsWith('/rewards.tsx')) {
      assert.match(source, /onAction=\{onAction\}/);
      assert.match(source, /color=\{unlocked \? onAction : action\}/);
    } else if (file.endsWith('/progress/index.tsx')) {
      assert.match(source, /window === option \? onAction : action/);
    } else if (file.endsWith('/tasks/index.tsx')) {
      assert.match(source, /color=\{onAction\} name="checkmark"/);
    } else {
      assert.match(source, /color: onAction|selected \? onAction/);
    }
    assert.doesNotMatch(source, /selected \? \{ color: Palette.deepNavy \}|selected \? Palette.deepNavy/);
  }
  assert.match(readFileSync('src/components/ui/button.tsx', 'utf8'), /import \{ accentTextColor \} from '@\/theme\/action-colors'/);
});
test('Settings offers actual stored presentation controls, not an always-System claim', () => {
  const settings = readFileSync('src/app/profile/settings.tsx', 'utf8');
  assert.match(settings, /<PresentationPanel \/>/);
  assert.doesNotMatch(settings, /settingsCopy.systemTheme|settingsCopy.reducedMotionDetail/);
  const detail = readFileSync('src/app/(tabs)/progress/history/[sessionId].tsx', 'utf8');
  assert.match(detail, /<ScrollView contentContainerStyle=\{styles.content\}/);
  assert.match(detail, /flexGrow: 1/);
  assert.doesNotMatch(detail, /#FFF1D6/);
});
