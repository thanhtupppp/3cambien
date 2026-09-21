import test from 'node:test';
import assert from 'node:assert/strict';
import { statusAfterFailure, statusAfterSuccess } from '../src/utils/connectionTransitions.js';
import { CONNECTION_STATUS, isOnlineConnectionStatus } from '../src/constants/connectionStatus.js';

test('connection transitions from connected to reconnecting after transient failures', () => {
  assert.equal(statusAfterFailure(1), CONNECTION_STATUS.RECONNECTING);
  assert.equal(statusAfterFailure(2), CONNECTION_STATUS.RECONNECTING);
});

test('connection transitions to offline after the third consecutive failure', () => {
  assert.equal(statusAfterFailure(3), CONNECTION_STATUS.OFFLINE);
  assert.equal(statusAfterFailure(4), CONNECTION_STATUS.OFFLINE);
});

test('successful telemetry recovers connection back to connected', () => {
  assert.equal(statusAfterSuccess(), CONNECTION_STATUS.CONNECTED);
});

test('full transition sequence is connected -> reconnecting -> offline -> connected', () => {
  const sequence = [
    CONNECTION_STATUS.CONNECTED,
    statusAfterFailure(1),
    statusAfterFailure(3),
    statusAfterSuccess()
  ];
  assert.deepEqual(sequence, [CONNECTION_STATUS.CONNECTED, CONNECTION_STATUS.RECONNECTING, CONNECTION_STATUS.OFFLINE, CONNECTION_STATUS.CONNECTED]);
});

test('online helper only treats connected and demo as online', () => {
  assert.equal(isOnlineConnectionStatus(CONNECTION_STATUS.CONNECTED), true);
  assert.equal(isOnlineConnectionStatus(CONNECTION_STATUS.DEMO), true);
  assert.equal(isOnlineConnectionStatus(CONNECTION_STATUS.RECONNECTING), false);
  assert.equal(isOnlineConnectionStatus(CONNECTION_STATUS.OFFLINE), false);
});
