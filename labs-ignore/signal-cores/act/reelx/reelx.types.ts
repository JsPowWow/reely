export interface Reelx {
  <S>(computed: () => S, equal?: (prev: S, next: S) => boolean): RlxDerivedState<S>;
  <S>(initial: S): RlxState<S>;
  <S>(initial?: S): RlxState<S>;
  /** A state holding `initial` as is, even a function. */
  state: <S>(initial: S) => RlxState<S>;
  flushSync: VoidFunction;
  batch: <T>(fn: () => T) => T;
  untracked: <T>(fn: () => T) => T;
}

export interface RlxSubscribe<S> {
  subscribe(cb: (value: S, prevValue?: S) => void): VoidFunction;
}

export interface RlxState<S> extends RlxSubscribe<S> {
  (newState?: S): S;
}

export interface RlxDerivedState<S> extends RlxSubscribe<S> {
  (): S;
}
