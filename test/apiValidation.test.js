import test from 'node:test';
import assert from 'node:assert/strict';
import { validateTemperaturePayload } from '../src/services/api.js';

test('accepts a complete three-sensor payload', () => {
  assert.equal(validateTemperaturePayload({
    status: 'online',
    sensors: [
      { online: true, temp: -23 },
      { online: true, temp: -28 },
      { online: true, temp: -20 }
    ]
  }), true);
});

test('rejects malformed and incomplete payloads', () => {
  assert.equal(validateTemperaturePayload({}), false);
  assert.equal(validateTemperaturePayload({ sensors: [{ online: true }] }), false);
  assert.equal(validateTemperaturePayload({
    sensors: [
      { online: true, temp: undefined },
      { online: true, temp: -28 },
      { online: true, temp: -20 }
    ]
  }), false);
});

test('accepts offline sensors with null temperature', () => {
  assert.equal(validateTemperaturePayload({
    sensors: [
      { online: false, temp: null },
      { online: true, temp: -28 },
      { online: true, temp: -20 }
    ]
  }), true);
});
