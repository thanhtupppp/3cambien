export function statusAfterFailure(failCount) {
  return failCount >= 3 ? 'offline' : 'reconnecting';
}

export function statusAfterSuccess() {
  return 'connected';
}
