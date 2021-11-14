export const isApple = (): boolean =>
  typeof navigator !== 'undefined' && /Mac OS X/.test(navigator.userAgent)
