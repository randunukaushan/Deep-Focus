// Same-version local mitigations. Upstream versions and npm alerts stay visible.
// Sources, limitations and removal criteria: docs/revision/evidence/SDK56-DEPENDENCY-SECURITY-2026-10-22.md
import { createHash } from 'node:crypto';

const decoder = `function decode(input) {
	// Decode at most four percent bytes per attempt: never recurse or retry prefixes.
	const output = [];
	for (let position = 0; position < input.length;) {
		const first = /^%([a-f0-9]{2})/i.exec(input.slice(position, position + 3));
		if (!first) {
			output.push(input[position++]);
			continue;
		}
		const byte = parseInt(first[1], 16);
		const count = byte < 0x80 ? 1 : byte >= 0xC2 && byte <= 0xDF ? 2 :
			byte >= 0xE0 && byte <= 0xEF ? 3 : byte >= 0xF0 && byte <= 0xF4 ? 4 : 0;
		const sequence = input.slice(position, position + count * 3);
		if (count && sequence.length === count * 3) {
			try {
				output.push(decodeURIComponent(sequence));
				position += sequence.length;
				continue;
			} catch { /* Preserve malformed bytes literally, like the old fallback. */ }
		}
		output.push(input.slice(position, position + 3));
		position += 3;
	}
	return output.join('');
}

function customDecodeURIComponent(input) {
	// Replace each encoded run once; never compile attacker input as a RegExp.
	return input.replace(multiMatcher, function (run) {
		return decode(run.replace(/%FE%FF|%FF%FE/g, '\\uFFFD\\uFFFD'))
			.replace(/%C2/g, '\\uFFFD');
	});
}
`;

export const patches = [
  {
    name: 'image-size', version: '1.2.1', file: 'dist/types/utils.js',
    sha: 'e9faf86abcc962a5fc2488a4c3c9d8dc915aa22a0dd6a7bad6556cd9a326c349',
    edits: [
      ['if (input.length - offset < 4)', 'if (input.length - offset < 8)'],
      ['if (input.length - offset < boxSize)', 'if (boxSize < 8 || input.length - offset < boxSize)'],
    ],
  },
  {
    name: 'image-size', version: '1.2.1', file: 'dist/types/icns.js',
    sha: '5e6a097fca237b0bb3b68a1be920e39a3846c0018d8917658b5ed88590a710e8',
    edits: [
      ['    const imageLengthOffset = imageOffset + ENTRY_LENGTH_OFFSET;',
        `    if (imageOffset + 8 > input.length) throw new TypeError('Invalid ICNS header');
    const entryLength = (0, utils_1.readUInt32BE)(input, imageOffset + ENTRY_LENGTH_OFFSET);
    if (entryLength < 8) throw new TypeError('Invalid ICNS entry length');
    const imageLengthOffset = imageOffset + ENTRY_LENGTH_OFFSET;`],
    ],
  },
  {
    name: 'decode-uri-component', version: '0.2.2', file: 'index.js',
    sha: '3b8ba0a765e1089d11bba9a919d0d8789ecd9a6833ea078d8d9114e1db093863',
    // Preserve CommonJS and the outer replacement/BOM/plus semantics.
    section: ['function decodeComponents(', 'module.exports = function', decoder + '\n'],
    edits: [],
  },
  {
    name: 'node-forge', version: '1.4.0', file: 'lib/rsa.js',
    sha: 'fd4740238145ec26470eb3f06a627c72039538ce1307dbdce40521f94dfd0a50',
    // Exact nested-count predicate proposed upstream in digitalbazaar/forge#1152.
    edits: [['            obj.value.length !== 2) {',
      `            obj.value.length !== 2 ||
            obj.value[0].value.length !== (('parameters' in capture) ? 2 : 1)) {`]],
  },
  {
    name: 'braces', version: '3.0.3', file: 'lib/parse.js',
    sha: 'e572166565f15fa6ad9865ae49d678218e32aabfd1b3720f6d0d43d39800d310',
    edits: [['      stack.push(block);',
      "      if (stack.length >= 128) throw new RangeError('Brace nesting limit exceeded');\n      stack.push(block);", 2]],
  },
  ...[
    ['compile', 'dc98f22eee3d511785d92a00758d5f0d48efed5f5813bdecc2de430c529b5c9f'],
    ['expand', '41ccc196ebfa7b7781a634e721eb744e4e7bcb54cba427a7e3d6806a1b9e58f7'],
    ['stringify', '379f22d77bfa1478341ccd49c5e4267464aabcbba03558bab332aac23fc6f23a'],
  ].map(([method, sha]) => {
    const walker = method === 'stringify' ? 'stringify' : 'walk';
    return {
      name: 'braces', version: '3.0.3', file: `lib/${method}.js`, sha,
      edits: [
        [`const ${walker} = (node, parent = {}) => {`,
          `const ${walker} = (node, parent = {}, depth = 0) => {\n    if (depth >= 128) throw new RangeError('Brace nesting limit exceeded');`],
        [method === 'stringify' ? 'stringify(child)' : 'walk(child, node)',
          `${walker}(child, ${method === 'stringify' ? '{}' : 'node'}, depth + 1)`],
      ],
    };
  }),
];

export const hash = text => createHash('sha256').update(text).digest('hex');

export function transform(original, patch) {
  if (hash(original) !== patch.sha) throw new Error(`Unknown source: ${patch.name}/${patch.file}`);
  let output = original;
  if (patch.section) {
    const [start, end, replacement] = patch.section;
    const from = output.indexOf(start);
    const to = output.indexOf(end, from);
    if (from < 0 || to < from) throw new Error('Missing decoder seam');
    output = output.slice(0, from) + replacement + output.slice(to);
  }
  for (const [before, after, count = 1] of patch.edits) {
    if (output.split(before).length - 1 !== count) throw new Error(`Patch seam mismatch: ${patch.file}`);
    output = output.split(before).join(after);
  }
  return output;
}
