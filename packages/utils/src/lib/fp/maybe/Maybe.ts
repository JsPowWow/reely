import { hasSome } from '../../objects/hasSome';
import isNil from '../../objects/isNil';

import type { Nullable } from '../../types/core.types';

type MaybeWrapper<T> = { maybe: 'some'; value: NonNullable<T> } | { maybe: 'none' };

export class Maybe<T> {
  // private static nothing: Maybe<null>;
  private constructor(private value: Nullable<T>) {}

  public static some = <T>(value: T): Maybe<NonNullable<T>> => {
    if (!hasSome(value)) {
      throw new Error('The provide value must not be a nullable.');
    }
    return new Maybe(value);
  };

  public static none = <T>(): Maybe<T> => {
    return new Maybe<T>(null); // TODO AR nothing constant
    // if (!this.nothing) {
    //   this.nothing = new Maybe(null);
    // }
    // return this.nothing;
  };

  public static from = <T>(value: Nullable<T>): Maybe<T> => {
    return hasSome(value) ? Maybe.some(value) : Maybe.none<T>();
  };

  public tapNonNullable(f: (wrapped: NonNullable<T>) => void): Maybe<T> {
    if (hasSome(this.value)) {
      f(this.value);
    }
    return this;
  }

  public map<R>(f: (wrapped: NonNullable<T>) => R): Maybe<R> {
    return hasSome(this.value) ? Maybe.from(f(this.value)) : Maybe.none<R>();
  }

  public mapNullable<R>(f: (r: T) => Nullable<R>): Maybe<NonNullable<R>> {
    if (hasSome(this.value)) {
      const result = f(this.value);
      if (isNil(result)) {
        return Maybe.none();
      }
      return Maybe.some(result);
    }

    return Maybe.none();
  }

  public flatMap<R>(f: (wrapped: NonNullable<T>) => Maybe<R>): Maybe<R> {
    return hasSome(this.value) ? f(this.value) : Maybe.none<R>();
  }

  public unwrap<R, D>(some: (wrapped: NonNullable<T>) => R, none: () => D): R | D {
    return hasSome(this.value) ? some(this.value) : none();
  }

  public match<R, D>(pattern: { some: (wrapped: NonNullable<T>) => R; none?: () => D }): R | D | undefined {
    return hasSome(this.value) ? pattern.some(this.value) : pattern.none?.();
  }

  public get(): MaybeWrapper<T> {
    return hasSome(this.value) ? { maybe: 'some', value: this.value } : { maybe: 'none' };
  }

  public getOrThrow(error?: Error): T {
    if (hasSome(this.value)) {
      return this.value;
    }
    throw error ?? new Error('The wrapped value is "nothing".');
  }

  public getOrElse<V>(value: V): V | NonNullable<T> {
    return hasSome(this.value) ? this.value : value;
  }

  public getOrDefault(defaultValue: NonNullable<T>): NonNullable<T> {
    return hasSome(this.value) ? this.value : defaultValue;
  }
}

export const { from, some, none } = Maybe;
