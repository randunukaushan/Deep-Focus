import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';

const sourceRoots = [
  path.resolve('src/app'),
  path.resolve('src/features'),
  path.resolve('web/src/app'),
  path.resolve('web/src/components'),
];

function sourceFiles(root) {
  return fs.readdirSync(root, { recursive: true })
    .filter((entry) => typeof entry === 'string' && /\.(?:ts|tsx)$/.test(entry))
    .map((entry) => path.join(root, entry));
}

test('mobile and portal UI source does not render raw caught exception details', () => {
  const forbidden = [
    /\{\s*(?:error|err)\.(?:message|stack)\s*\}/,
    /set(?:Message|Error)\(\s*(?:error|err)\.(?:message|stack)\s*\)/,
  ];
  for (const file of sourceRoots.flatMap(sourceFiles)) {
    const source = fs.readFileSync(file, 'utf8');
    for (const pattern of forbidden) assert.doesNotMatch(source, pattern, path.relative(process.cwd(), file));
  }
});
