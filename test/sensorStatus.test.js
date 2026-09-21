import test from 'node:test';
import assert from 'node:assert/strict';
import { getSensorStatus } from '../src/utils/sensorStatus.js';

test('T1 and T2 use air-temperature semantics', () => {
  assert.equal(getSensorStatus(0, -23, true).text, 'KHO ĐÔNG');
  assert.equal(getSensorStatus(1, -28, true).text, 'KHÍ RA LẠNH');
});

test('T3 does not label sub-zero suction temperature as deep cold', () => {
  assert.equal(getSensorStatus(2, -20, true).text, 'ĐANG ĐO GAS HỒI');
});

test('offline sensor always reports signal loss', () => {
  assert.equal(getSensorStatus(2, -20, false).className, 'status-error');
});
