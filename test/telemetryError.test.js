import test from 'node:test';
import assert from 'node:assert/strict';
import {
  TELEMETRY_ERROR_CODE,
  TelemetryError,
  normalizeTelemetryError,
  telemetryErrorMessage
} from '../src/utils/telemetryError.js';

test('preserves a structured telemetry error', () => {
  const error = new TelemetryError(
    TELEMETRY_ERROR_CODE.HTTP,
    'HTTP 503',
    { status: 503 }
  );

  assert.equal(normalizeTelemetryError(error), error);
  assert.equal(error.status, 503);
  assert.equal(telemetryErrorMessage(error), 'ESP32 API trả về lỗi HTTP 503.');
});

test('normalizes AbortError into aborted code', () => {
  const normalized = normalizeTelemetryError({ name: 'AbortError', message: 'aborted' });
  assert.equal(normalized.code, TELEMETRY_ERROR_CODE.ABORTED);
});

test('normalizes TypeError into network code', () => {
  const normalized = normalizeTelemetryError(new TypeError('fetch failed'));
  assert.equal(normalized.code, TELEMETRY_ERROR_CODE.NETWORK);
  assert.equal(telemetryErrorMessage(normalized), 'Không thể kết nối tới nguồn dữ liệu ESP32.');
});

test('returns stable user message for invalid payload', () => {
  const error = new TelemetryError(
    TELEMETRY_ERROR_CODE.INVALID_PAYLOAD,
    'bad payload'
  );

  assert.equal(telemetryErrorMessage(error), 'Dữ liệu nhận từ ESP32 không đúng định dạng.');
});
