import assert from 'node:assert/strict';
import { readdirSync, readFileSync } from 'node:fs';
import path from 'node:path';
import test from 'node:test';

function sourceFiles(directory) {
  return readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const fullPath = path.join(directory, entry.name);
    if (entry.isDirectory()) return sourceFiles(fullPath);
    return fullPath.endsWith('.tsx') ? [fullPath] : [];
  });
}

function unlabeledBlocks(source, tag) {
  return [...source.matchAll(new RegExp(`<(?:${tag})(?:(?!<${tag})[\\s\\S]){0,700}`, 'g'))]
    .filter((match) => !/accessibilityLabel\s*=/.test(match[0]));
}

test('interactive Pressable and TextInput controls expose accessible names', () => {
  const files = sourceFiles(path.resolve('src/app'));
  const missing = files.flatMap((file) => {
    const source = readFileSync(file, 'utf8');
    return ['Pressable', 'TextInput']
      .flatMap((tag) => unlabeledBlocks(source, tag).map(() => `${file}:${tag}`));
  });

  assert.deepEqual(missing, []);
});
