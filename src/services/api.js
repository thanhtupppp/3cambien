import { CONNECTION_STATUS } from '../constants/connectionStatus.js';

const REQUEST_TIMEOUT_MS = 3000;
const FALLBACK_API_URL = import.meta.env.VITE_TEMPERATURE_API_URL || 'http://localhost:8180/api/temperatures';

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
  const response = await fetch(url, {
    signal,
    headers: { Accept: 'application/json' }
  });
  if (!response.ok) throw new Error(`Temperature API HTTP ${response.status}`);
  const data = await response.json();
  if (!validateTemperaturePayload(data)) throw new Error('Invalid temperature payload');
  return data;
}

/**
 * Fetch validated ESP32 telemetry. A caller-provided AbortSignal is respected;
 * otherwise this function enforces a short timeout.
 */
export async function getTemperatures(signal) {
  const timeoutController = new AbortController();
  const timeoutId = setTimeout(() => timeoutController.abort(), REQUEST_TIMEOUT_MS);
  const effectiveSignal = signal || timeoutController.signal;

  try {
    try {
      const bridgeData = await fetchTemperatureEndpoint('/api/temperatures', effectiveSignal);
      if (bridgeData.status === CONNECTION_STATUS.CONNECTED || bridgeData.sensors.some((sensor) => sensor.online)) {
        return bridgeData;
      }
    } catch (error) {
      if (effectiveSignal.aborted) throw error;
    }

    return await fetchTemperatureEndpoint(FALLBACK_API_URL, effectiveSignal);
  } finally {
    clearTimeout(timeoutId);
  }
}
