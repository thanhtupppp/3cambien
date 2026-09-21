import test from 'node:test';
import assert from 'node:assert/strict';
import { statusAfterFailure, statusAfterSuccess } from '../src/utils/connectionTransitions.js';

test('connection transitions from connected to reconnecting after transient failures', () => {
  assert.equal(statusAfterFailure(1), 'reconnecting');
  assert.equal(statusAfterFailure(2), 'reconnecting');
});

test('connection transitions to offline after the third consecutive failure', () => {
  assert.equal(statusAfterFailure(3), 'offline');
  assert.equal(statusAfterFailure(4), 'offline');
});

test('successful telemetry recovers connection back to connected', () => {
  assert.equal(statusAfterSuccess(), 'connected');
});

test('full transition sequence is connected -> reconnecting -> offline -> connected', () => {
  const sequence = [
    'connected',
    statusAfterFailure(1),
    statusAfterFailure(3),
    statusAfterSuccess()
  ];
  assert.deepEqual(sequence, ['connected', 'reconnecting', 'offline', 'connected']);
});
