import test from 'node:test';
import assert from 'node:assert/strict';
import { calculateDeltaAir, evaluateDeltaAir } from '../src/utils/temperatureMetrics.js';

test('calculateDeltaAir uses inlet minus outlet', () => {
  assert.equal(calculateDeltaAir(-23, -28), 5);
  assert.equal(calculateDeltaAir(2, -4), 6);
});

test('calculateDeltaAir rejects missing or non-finite sensors', () => {
  assert.equal(calculateDeltaAir(null, -28), null);
  assert.equal(calculateDeltaAir(-23, undefined), null);
  assert.equal(calculateDeltaAir(Number.NaN, -28), null);
});

test('evaluateDeltaAir classifies reference ranges', () => {
  assert.equal(evaluateDeltaAir(5).status, 'optimal');
  assert.equal(evaluateDeltaAir(2).status, 'warning');
  assert.equal(evaluateDeltaAir(15).status, 'warning');
  assert.equal(evaluateDeltaAir(-1).status, 'danger');
  assert.equal(evaluateDeltaAir(null).status, 'unavailable');
});
