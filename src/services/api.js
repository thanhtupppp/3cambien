import { CONNECTION_STATUS } from '../constants/connectionStatus.js';
import { MONITORING_CONFIG } from '../constants/monitoringConfig.js';
import {
  TELEMETRY_ERROR_CODE,
  TelemetryError,
  normalizeTelemetryError
} from '../utils/telemetryError.js';

const FALLBACK_API_URL = import.meta.env?.VITE_TEMPERATURE_API_URL || 'http://localhost:8180/api/temperatures';

function isValidSensor(sensor) {
  if (!sensor || typeof sensor !== 'object' || typeof sensor.online !== 'boolean') return false;
  if (!sensor.online) return sensor.temp === null || sensor.temp === undefined || Number.isFinite(sensor.temp);
  return Number.isFinite(sensor.temp);
}

export function validateTemperaturePayload(data) {
  if (!data || typeof data !== 'object' || !Array.isArray(data.sensors) || data.sensors.length < 3) {
    return false;
  }
  return data.sensors.slice(0, 3).every(isValidSensor);
}

async function fetchTemperatureEndpoint(url, signal) {
  let response;

  try {
    response = await fetch(url, {
      signal,
      headers: { Accept: 'application/json' }
    });
  } catch (error) {
    if (signal?.aborted) throw error;
    throw new TelemetryError(
      TELEMETRY_ERROR_CODE.NETWORK,
      'Temperature API network request failed',
      { cause: error }
    );
  }

  if (!response.ok) {
    throw new TelemetryError(
      TELEMETRY_ERROR_CODE.HTTP,
      `Temperature API HTTP ${response.status}`,
      { status: response.status }
    );
  }

  let data;
  try {
    data = await response.json();
  } catch (error) {
    throw new TelemetryError(
      TELEMETRY_ERROR_CODE.INVALID_PAYLOAD,
      'Temperature API returned invalid JSON',
      { cause: error }
    );
  }

  if (!validateTemperaturePayload(data)) {
    throw new TelemetryError(
      TELEMETRY_ERROR_CODE.INVALID_PAYLOAD,
      'Invalid temperature payload'
    );
  }

  return data;
}

/**
 * Fetch validated ESP32 telemetry with a hard timeout. Caller cancellation and
 * timeout are normalized into stable telemetry error codes.
 */
export async function getTemperatures(signal) {
  const requestController = new AbortController();

  const abortFromCaller = () => requestController.abort('caller');
  if (signal?.aborted) abortFromCaller();
  else signal?.addEventListener('abort', abortFromCaller, { once: true });

  const timeoutId = setTimeout(() => requestController.abort('timeout'), MONITORING_CONFIG.requestTimeoutMs);

  try {
    try {
      const bridgeData = await fetchTemperatureEndpoint('/api/temperatures', requestController.signal);
      if (bridgeData.status === CONNECTION_STATUS.CONNECTED || bridgeData.sensors.some((sensor) => sensor.online)) {
        return bridgeData;
      }
    } catch (error) {
      if (requestController.signal.aborted) throw error;
    }

    return await fetchTemperatureEndpoint(FALLBACK_API_URL, requestController.signal);
  } catch (error) {
    if (requestController.signal.aborted) {
      const callerAborted = Boolean(signal?.aborted);
      throw new TelemetryError(
        callerAborted ? TELEMETRY_ERROR_CODE.ABORTED : TELEMETRY_ERROR_CODE.TIMEOUT,
        callerAborted ? 'Telemetry request aborted by caller' : 'Telemetry request timed out',
        { cause: error }
      );
    }

    throw normalizeTelemetryError(error);
  } finally {
    clearTimeout(timeoutId);
    signal?.removeEventListener?.('abort', abortFromCaller);
  }
}
