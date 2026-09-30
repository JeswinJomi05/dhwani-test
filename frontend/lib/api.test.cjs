const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
function client(fetch) {
  const exports = {};
  const source = ts.transpileModule(fs.readFileSync(require.resolve('./api.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  vm.runInNewContext(source, { exports, fetch });
  return exports;
}
const response = (status, body) => ({ status, ok: status < 400, json: async () => body });
test('checkout uses server pricing and documented request fields', async () => {
  const api = client(async (url, options) => {
    assert.equal(url, '/api/guest/bookings/stayhub/checkout');
    assert.equal(options.method, 'POST');
    assert.deepEqual(JSON.parse(options.body), { stayhubId: 'venue', sharingType: 'Triple' });
    return response(201, { ok: true, data: { amountPaise: 12345 } });
  });
  assert.equal((await api.api('bookings/stayhub/checkout', { stayhubId: 'venue', sharingType: 'Triple' })).amountPaise, 12345);
});
test('expired session refreshes once and retries', async () => {
  const calls = [];
  const api = client(async url => { calls.push(url); return calls.length === 1 ? response(401, {}) : response(200, { data: {} }); });
  await api.api('bookings/stayhub');
  assert.deepEqual(calls, ['/api/guest/bookings/stayhub', '/api/guest/auth/guest/refresh', '/api/guest/bookings/stayhub']);
});
test('failed refresh stops retries', async () => {
  let calls = 0;
  const api = client(async () => { calls++; return response(401, { message: 'Please sign in' }); });
  await assert.rejects(api.api('bookings/stayhub'), error => error.status === 401);
  assert.equal(calls, 2);
});
test('capacity conflict does not retry reservation', async () => {
  let calls = 0;
  const api = client(async () => { calls++; return response(409, { message: 'No seat left' }); });
  await assert.rejects(api.api('bookings/stayhub/checkout', {}), error => error.status === 409 && error.message === 'No seat left');
  assert.equal(calls, 1);
});
test('invalid OTP is not retried through refresh', async () => {
  let calls = 0;
  const api = client(async () => { calls++; return response(401, { message: 'Invalid code' }); });
  await assert.rejects(api.api('auth/guest/verify-otp', {}));
  assert.equal(calls, 1);
});
