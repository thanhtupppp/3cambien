export const CONNECTION_STATUS = Object.freeze({
  DEMO: 'demo',
  CONNECTING: 'connecting',
  CONNECTED: 'connected',
  RECONNECTING: 'reconnecting',
  OFFLINE: 'offline'
});

export function isOnlineConnectionStatus(status) {
  return status === CONNECTION_STATUS.CONNECTED || status === CONNECTION_STATUS.DEMO;
}
