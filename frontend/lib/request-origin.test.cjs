const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const exportsObject = {};
const source = ts.transpileModule(fs.readFileSync(require.resolve('./request-origin.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
vm.runInNewContext(source, { exports: exportsObject, URL });
const check = (headers, target = 'http://0.0.0.0:3000') => exportsObject.isSameOriginRequest(new Headers(headers), target);

test('accepts localhost when Next binds to all interfaces', () => {
  assert.equal(check({ origin: 'http://localhost:3000', host: 'localhost:3000' }), true);
});
test('accepts LAN access without Fetch Metadata', () => {
  assert.equal(check({ origin: 'http://192.168.1.5:3000', host: '192.168.1.5:3000' }), true);
});
test('accepts browser same-origin requests behind an HTTPS reverse proxy', () => {
  assert.equal(check({ origin: 'https://stay.example.com', 'sec-fetch-site': 'same-origin' }), true);
});
test('rejects cross-site and same-site requests even when other headers match', () => {
  for (const site of ['cross-site', 'same-site', 'none']) {
    assert.equal(check({ origin: 'http://localhost:3000', host: 'localhost:3000', 'sec-fetch-site': site }), false);
  }
});
test('fallback rejects foreign, missing, opaque and malformed origins', () => {
  for (const origin of ['https://evil.example', 'null', 'not a URL', 'http://localhost:3001']) {
    assert.equal(check({ origin, host: 'localhost:3000' }), false);
  }
  assert.equal(check({ host: 'localhost:3000' }), false);
});
