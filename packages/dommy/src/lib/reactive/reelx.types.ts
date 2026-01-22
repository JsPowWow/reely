export interface Reelx {
  <S>(computed: () => S, equal?: (prev: S, next: S) => boolean): RlxComputedState<S>;
  <S>(initial: S): RlxValueState<S>;
  <S>(initial?: S): RlxValueState<S>;
  notify: {
    (): void;
    schedule?: null | VoidFunction;
  };
}

export interface RlxValueState<S> {
  (newState?: S): S;
  subscribe(cb: (value: S, prevValue?: S) => void): VoidFunction;
}

export interface RlxComputedState<S> {
  (): S;
  subscribe(cb: (state: S, prevState?: S) => void): VoidFunction;
}
