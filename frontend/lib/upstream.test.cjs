const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function client(fetch) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(require.resolve('./upstream.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2021 } }).outputText;
  vm.runInNewContext(source, { exports, fetch });
  return exports;
}
test('DNS failure reports its specific cause without exposing infrastructure', async () => {
  const api = client(async () => { throw { cause: { code: 'ENOTFOUND' } }; });
  await assert.rejects(api.fetchUpstream('https://example.invalid', {}), error => error.code === 'API_DNS_ERROR' && error.status === 502);
});
test('timeout and refused connections are distinguished', async () => {
  for (const [failure, code, status] of [[{ name: 'TimeoutError' }, 'API_TIMEOUT', 504], [{ cause: { code: 'ECONNREFUSED' } }, 'API_CONNECTION_REFUSED', 502]]) {
    const api = client(async () => { throw failure; });
    await assert.rejects(api.fetchUpstream('http://localhost', {}), error => error.code === code && error.status === status);
  }
});
test('HTML gateway responses are not forwarded to the browser', async () => {
  const api = client(async () => new Response('<html>Bad Gateway</html>', { status: 502 }));
  await assert.rejects(api.fetchUpstream('http://localhost', {}), error => error.code === 'API_INVALID_RESPONSE');
});
test('API validation errors preserve backend message and status', async () => {
  const api = client(async () => Response.json({ ok: false, message: 'Phone is not registered' }, { status: 400 }));
  const result = await api.fetchUpstream('http://localhost', {});
  assert.equal(result.status, 400);
  assert.equal(result.result.message, 'Phone is not registered');
});
