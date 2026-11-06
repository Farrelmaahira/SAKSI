export interface Store<T> {
  get: () => T
  set: (fn: (prev: T) => T) => void
  reset: () => void
  subscribe: (listener: () => void) => () => void
  use: () => T
}
