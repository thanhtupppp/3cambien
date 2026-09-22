export const TELEMETRY_ERROR_CODE = Object.freeze({
  ABORTED: 'aborted',
  TIMEOUT: 'timeout',
  NETWORK: 'network',
  HTTP: 'http',
  INVALID_PAYLOAD: 'invalid_payload',
  UNKNOWN: 'unknown'
});

export class TelemetryError extends Error {
  constructor(code, message, options = {}) {
    super(message, options.cause ? { cause: options.cause } : undefined);
    this.name = 'TelemetryError';
    this.code = code;
    this.status = options.status ?? null;
  }
}

export function normalizeTelemetryError(error) {
  if (error instanceof TelemetryError) return error;

  if (error?.name === 'AbortError') {
    return new TelemetryError(
      TELEMETRY_ERROR_CODE.ABORTED,
      error?.message || 'Telemetry request aborted',
      { cause: error }
    );
  }

  if (error instanceof TypeError) {
    return new TelemetryError(
      TELEMETRY_ERROR_CODE.NETWORK,
      error.message || 'Telemetry network request failed',
      { cause: error }
    );
  }

  return new TelemetryError(
    TELEMETRY_ERROR_CODE.UNKNOWN,
    error?.message || 'Unknown telemetry error',
    { cause: error }
  );
}

export function telemetryErrorMessage(error) {
  const normalized = normalizeTelemetryError(error);

  switch (normalized.code) {
    case TELEMETRY_ERROR_CODE.ABORTED:
      return 'Yêu cầu dữ liệu đã bị hủy.';
    case TELEMETRY_ERROR_CODE.TIMEOUT:
      return 'ESP32 không phản hồi trong thời gian cho phép.';
    case TELEMETRY_ERROR_CODE.NETWORK:
      return 'Không thể kết nối tới nguồn dữ liệu ESP32.';
    case TELEMETRY_ERROR_CODE.HTTP:
      return normalized.status
        ? `ESP32 API trả về lỗi HTTP ${normalized.status}.`
        : 'ESP32 API trả về lỗi HTTP.';
    case TELEMETRY_ERROR_CODE.INVALID_PAYLOAD:
      return 'Dữ liệu nhận từ ESP32 không đúng định dạng.';
    default:
      return 'Không thể đọc dữ liệu từ ESP32.';
  }
}
