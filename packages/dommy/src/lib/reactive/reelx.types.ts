export interface Reelx {
  <S>(computed: () => S, equal?: (prev: S, next: S) => boolean): RlxDerived<S>;
  <S>(initial: S): RlxValue<S>;
  <S>(initial?: S): RlxValue<S>;
  notify: {
    (): void;
    schedule?: null | VoidFunction;
  };
}

export interface RlxValue<S> {
  (newState?: S): S;
  subscribe(cb: (value: S, prevValue?: S) => void): VoidFunction;
}

export interface RlxDerived<S> {
  (): S;
  subscribe(cb: (state: S, prevState?: S) => void): VoidFunction;
}
