const { test } = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const vm = require('node:vm');
const ts = require('typescript');
const output = {};
vm.runInNewContext(ts.transpileModule(fs.readFileSync(require.resolve('./otp.ts'), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText, { exports: output });
test('does not claim SMS was sent when API declines or omits confirmation', () => {
  for (const data of [undefined, {}, { sent: false }]) assert.throws(() => output.otpRequestNotice(data), /did not confirm/);
});
test('development fallback is not mistaken for SMS delivery', () => {
  assert.throws(() => output.otpRequestNotice({ sent: true, devCode: '123456' }), /SMS provider must be configured/);
});
test('accepted request does not claim handset delivery', () => {
  assert.match(output.otpRequestNotice({ sent: true }), /SMS request accepted/);
});
