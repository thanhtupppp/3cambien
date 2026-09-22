import { CONNECTION_STATUS } from '../constants/connectionStatus.js';

export function statusAfterFailure(failCount) {
  return failCount >= 3 ? CONNECTION_STATUS.OFFLINE : CONNECTION_STATUS.RECONNECTING;
}

export function statusAfterSuccess() {
  return CONNECTION_STATUS.CONNECTED;
}
