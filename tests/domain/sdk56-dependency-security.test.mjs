import test from 'node:test';
import assert from 'node:assert/strict';
import { Buffer } from 'node:buffer';
import { createRequire } from 'node:module';
import { readFileSync, writeFileSync, mkdtempSync, mkdirSync, copyFileSync, appendFileSync, rmSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { spawnSync } from 'node:child_process';
import { patches, transform } from '../../scripts/security/sdk56-backports.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const require = createRequire(resolve(root, 'package.json'));
const child = code => {
  const result = spawnSync(process.execPath, ['-e', code], { cwd: root, encoding: 'utf8', timeout: 4000 });
  assert.equal(result.error, undefined, `Child failed/timed out: ${result.error}`);
  assert.equal(result.status, 0, result.stderr);
};

test('SDK56, React Native, Router and all patched package versions stay pinned', () => {
  const pkg = require('./package.json');
  assert.equal(pkg.dependencies.expo, '~56.0.23');
  assert.equal(pkg.dependencies['react-native'], '0.85.3');
  assert.equal(pkg.dependencies['expo-router'], '~56.2.21');
  const lock = require('./package-lock.json');
  for (const patch of patches) assert.equal(lock.packages[`node_modules/${patch.name}`].version, patch.version);
});

test('backports are present in both installed trees', () => {
  for (const args of [[], ['--web']]) {
    for (const repeat of [0, 1]) {
      const result = spawnSync(process.execPath, ['scripts/security/apply-sdk56-backports.mjs', ...args, '--check'], { cwd: root, encoding: 'utf8' });
      assert.equal(result.status, 0, `${repeat}: ${result.stderr}`);
    }
  }
});

test('unknown source cannot be transformed', () => {
  for (const patch of patches) assert.throws(() => transform('unreviewed input', patch), /Unknown source/);
});

test('installer refuses source drift, missing files and wrong versions', () => {
  const fixture = mkdtempSync(resolve(tmpdir(), 'deep-focus-security-'));
  try {
    for (const file of ['apply-sdk56-backports.mjs', 'sdk56-backports.mjs', 'backport-hashes.json']) {
      const target = resolve(fixture, 'scripts/security', file);
      mkdirSync(dirname(target), { recursive: true });
      copyFileSync(resolve(root, 'scripts/security', file), target);
    }
    for (const patch of patches) {
      for (const file of [patch.file, 'package.json']) {
        const path = `node_modules/${patch.name}/${file}`;
        mkdirSync(dirname(resolve(fixture, path)), { recursive: true });
        copyFileSync(resolve(root, path), resolve(fixture, path));
      }
    }
    const run = () => spawnSync(process.execPath, ['scripts/security/apply-sdk56-backports.mjs', '--check'], { cwd: fixture, encoding: 'utf8' });
    assert.equal(run().status, 0);
    const applied = spawnSync(process.execPath, ['scripts/security/apply-sdk56-backports.mjs'], { cwd: fixture, encoding: 'utf8' });
    assert.equal(applied.status, 0, applied.stderr);
    assert.match(applied.stdout, /0 writes/);
    const target = resolve(fixture, 'node_modules/image-size/dist/types/utils.js');
    appendFileSync(target, '\n// unexpected modification\n');
    assert.notEqual(run().status, 0);
    copyFileSync(resolve(root, 'node_modules/image-size/dist/types/utils.js'), target);
    const packagePath = resolve(fixture, 'node_modules/image-size/package.json');
    const packageJson = JSON.parse(readFileSync(packagePath, 'utf8'));
    packageJson.version = '99.0.0';
    writeFileSync(packagePath, JSON.stringify(packageJson));
    assert.match(run().stderr, /Version drift/);
    copyFileSync(resolve(root, 'node_modules/image-size/package.json'), packagePath);
    rmSync(target);
    assert.notEqual(run().status, 0);
    const production = resolve(fixture, 'web/node_modules/next/package.json');
    mkdirSync(dirname(production), { recursive: true });
    copyFileSync(resolve(root, 'web/node_modules/next/package.json'), production);
    const webCheck = () => spawnSync(process.execPath, ['scripts/security/apply-sdk56-backports.mjs', '--web', '--check'], { cwd: fixture, encoding: 'utf8' });
    assert.equal(webCheck().status, 0);
    rmSync(production);
    assert.notEqual(webCheck().status, 0, 'Missing web install must not pass as production-only');
  } finally {
    rmSync(fixture, { recursive: true, force: true });
  }
});

test('Metro image-size callable API still reads PNG, JPEG and SVG assets', () => {
  const size = require('image-size');
  assert.equal(typeof size, 'function');
  const png = Buffer.alloc(24);
  Buffer.from('89504e470d0a1a0a0000000d49484452', 'hex').copy(png);
  png.writeUInt32BE(17, 16); png.writeUInt32BE(23, 20);
  assert.deepEqual({ ...size(png) }, { width: 17, height: 23, type: 'png' });
  const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" width="31" height="19"></svg>');
  assert.equal(size(svg).width, 31);
  assert.equal(size(svg).height, 19);
  // Actual repository assets exercise the build's current image formats.
  const files = require('node:fs').readdirSync(resolve(root, 'assets/images'));
  for (const file of files.filter(name => /\.(png|jpe?g)$/.test(name))) {
    const dimensions = size(readFileSync(resolve(root, 'assets/images', file)));
    assert.ok(dimensions.width > 0 && dimensions.height > 0, file);
  }
});

test('zero-size selected JXL/HEIF boxes terminate without entering a parser loop', () => {
  child(`
    const assert = require('node:assert/strict');
    const { findBox } = require('./node_modules/image-size/dist/types/utils.js');
    const { JXL } = require('./node_modules/image-size/dist/types/jxl.js');
    for (const name of ['jxlp', 'jxlc', 'ftyp', 'meta', 'iprp', 'ipco', 'ispe']) {
      const b = Buffer.alloc(12); b.write(name, 4);
      assert.equal(findBox(b, name, 0), undefined);
      assert.throws(() => JXL.calculate(b));
    }
    for (const length of [1, 4, 7]) {
      const b = Buffer.alloc(12); b.writeUInt32BE(length); b.write('jxlp', 4);
      assert.equal(findBox(b, 'jxlp', 0), undefined);
    }
  `);
});

test('valid HEIF box dimensions still work', () => {
  const { HEIF } = require('./node_modules/image-size/dist/types/heif.js');
  const box = (name, content) => { const b = Buffer.alloc(8 + content.length); b.writeUInt32BE(b.length); b.write(name, 4); content.copy(b, 8); return b; };
  const properties = Buffer.alloc(12); properties.writeUInt32BE(37, 4); properties.writeUInt32BE(41, 8);
  const b = box('meta', Buffer.concat([Buffer.alloc(4), box('iprp', box('ipco', box('ispe', properties)))]));
  assert.equal(HEIF.calculate(b).width, 37);
  assert.equal(HEIF.calculate(b).height, 41);
});

test('ICNS zero/short first and later records fail promptly; valid records remain readable', () => {
  child(`
    const assert = require('node:assert/strict'), size = require('image-size');
    for (const first of [true, false]) for (const length of [0, 1, 7]) {
      const b = Buffer.alloc(first ? 16 : 24); b.write('icns'); b.writeUInt32BE(b.length, 4);
      b.write('icp4', 8); b.writeUInt32BE(first ? length : 8, 12);
      if (!first) { b.write('icp5', 16); b.writeUInt32BE(length, 20); }
      assert.throws(() => size(b), /Invalid ICNS/);
    }
    const valid = Buffer.alloc(16); valid.write('icns'); valid.writeUInt32BE(16, 4);
    valid.write('icp4', 8); valid.writeUInt32BE(8, 12);
    assert.equal(size(valid).width, 16);
  `);
});

test('URI fallback preserves literal dollar replacements, mixed text and locale decoding', () => {
  const decode = require('decode-uri-component');
  for (const text of ['සිංහල', 'தமிழ்', 'hello world', '$&', '$`', "$'", '\uFEFF', '😀']) {
    assert.equal(decode(encodeURIComponent(text)), text);
    assert.equal(decode(encodeURIComponent(text) + '%FF'), text + '%FF');
  }
  assert.equal(decode('one+two'), 'one two');
  assert.equal(decode('%FE%FF'), '\uFFFD\uFFFD');
  assert.equal(decode('%C2'), '\uFFFD');
  assert.throws(() => decode(null), TypeError);
  const query = require('query-string');
  assert.equal(query.parse('text=%E0%B7%83%FF').text, 'ස%FF');
});

test('adversarial malformed URI run completes in a bounded child process', () => {
  child(`
    const assert = require('node:assert/strict'), decode = require('decode-uri-component');
    const input = '%FF'.repeat(12000) + '%E0%B7%83';
    assert.equal(decode(input), '%FF'.repeat(12000) + 'ස');
  `);
});

test('braces retains normal compile/expand/escape behavior in mobile and web', () => {
  for (const resolveFrom of [root, resolve(root, 'web')]) {
    const braces = createRequire(resolve(resolveFrom, 'package.json'))('braces');
    assert.deepEqual(braces.expand('src/{app,features}/*.{ts,tsx}'), ['src/app/*.ts', 'src/app/*.tsx', 'src/features/*.ts', 'src/features/*.tsx']);
    assert.equal(braces.compile('{a,b}'), '(a|b)');
    assert.equal(braces.stringify(braces.parse('a\\{b,c\\}')), 'a{b,c}');
  }
});

test('braces rejects deeply nested strings before recursive normalization/walks', () => {
  child(`
    const assert = require('node:assert/strict'), braces = require('braces');
    for (const [a,b] of [['{','}'], ['(',')']]) {
      const input = a.repeat(4000) + 'a,b' + b.repeat(4000);
      for (const method of ['parse', 'compile', 'expand', 'stringify'])
        assert.throws(() => braces[method](input), /Brace nesting limit/);
    }
  `);
});

test('braces also rejects caller-supplied deeply nested ASTs', () => {
  const braces = require('braces');
  const rootNode = { type: 'root', nodes: [] };
  let node = rootNode;
  for (let n = 0; n < 150; n++) { const next = { type: 'brace', nodes: [], parent: node }; node.nodes.push(next); node = next; }
  for (const method of ['compile', 'expand', 'stringify']) assert.throws(() => braces[method](rootNode), /Brace nesting limit/);
});

test('Forge accepts valid SHA256 signatures with optional NULL and rejects extra nested elements', () => {
  const forge = require('node-forge');
  const { privateKey } = require('node:crypto').generateKeyPairSync('rsa', { modulusLength: 1024, publicExponent: 3 });
  const key = forge.pki.privateKeyFromPem(privateKey.export({ type: 'pkcs1', format: 'pem' }).toString());
  const publicKey = forge.pki.setRsaPublicKey(key.n, key.e);
  const digest = forge.md.sha256.create().update('synthetic regression').digest().getBytes();
  const a = forge.asn1;
  const seq = values => a.create(a.Class.UNIVERSAL, a.Type.SEQUENCE, true, values);
  const oid = () => a.create(a.Class.UNIVERSAL, a.Type.OID, false, a.oidToDer(forge.oids.sha256).getBytes());
  const nil = () => a.create(a.Class.UNIVERSAL, a.Type.NULL, false, '');
  const octet = value => a.create(a.Class.UNIVERSAL, a.Type.OCTETSTRING, false, value);
  const signature = algorithm => key.sign(a.toDer(seq([seq(algorithm), octet(digest)])).getBytes(), null);
  for (const algorithm of [[oid()], [oid(), nil()]]) assert.equal(publicKey.verify(digest, signature(algorithm)), true);
  for (const algorithm of [[oid(), nil(), octet('garbage')], [oid(), octet('garbage')], [oid(), nil(), nil()]]) {
    assert.throws(() => publicKey.verify(digest, signature(algorithm)), /DigestInfo/);
  }
  assert.equal(publicKey.verify('wrong digest', signature([oid(), nil()])), false);
  // Exercise the actual SDK56 caller too, not only our ASN.1 fixtures.
  const certificates = require('@expo/code-signing-certificates');
  const keyPair = { privateKey: key, publicKey };
  const certificate = certificates.generateSelfSignedCodeSigningCertificate({
    keyPair, commonName: 'Synthetic dependency regression',
    validityNotBefore: new Date(Date.now() - 60000), validityNotAfter: new Date(Date.now() + 60000),
  });
  certificates.validateSelfSignedCertificate(certificate, keyPair);
  assert.ok(certificates.signBufferRSASHA256AndVerify(key, certificate, Buffer.from('synthetic bundle')).length > 0);
});

test('UUID consumers remain v4-only and generated project identifiers retain shape', () => {
  for (const path of ['node_modules/@expo/ngrok/index.js', 'node_modules/xcode/lib/pbxProject.js']) {
    const source = readFileSync(resolve(root, path), 'utf8');
    assert.match(source, /uuid\.v4\(/);
    assert.doesNotMatch(source, /uuid\.v[356]\(/);
  }
  assert.match(require('uuid').v4(), /^[a-f0-9]{8}-[a-f0-9]{4}-4[a-f0-9]{3}-[89ab][a-f0-9]{3}-[a-f0-9]{12}$/);
});
