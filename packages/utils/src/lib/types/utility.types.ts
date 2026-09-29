import type { Nil, Nullable, KeyValueObject } from './core.types';

export type ConstructorOf<T> = { prototype: T; new (...parameters: never[]): T };

export type ValueOf<T> = T[keyof T];

export type NullableValuesOf<T> = { [P in keyof T]: T[P] | Nil };

export type WithRequired<T, K extends keyof T> = T & { [P in K]-?: T[P] };
export type WithRequiredNonNullable<T, K extends keyof T> = T & { [P in K]-?: NonNullable<T[P]> };
export type WithNullableValues<T> = { [P in keyof T]: Nullable<T[P]> };

export type WithOptional<T, K extends keyof T> = Omit<T, K> & { [P in K]?: T[P] };

export type DeepPartial<T> = T extends KeyValueObject ? { [P in keyof T]?: DeepPartial<T[P]> } : T;

export type PartialShape<T extends object> = {
  [P in keyof T]?: Nullable<T[P]>;
};

export type PartialBy<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export type DistributiveOmit<T, K extends keyof any> = T extends any ? Omit<T, K> : never;

/** Flattens an object type so its hover shows the fields. */
export type Prettify<T> = {
  [K in keyof T]: T[K];
} & unknown;

/** Keys of `T` whose values are assignable to `V`. */
export type KeysWithType<T, V> = { [K in keyof T]-?: T[K] extends V ? K : never }[keyof T];

export type Head<T extends unknown[]> = T extends [infer H, ...unknown[]] ? H : never;

export type Last<T extends unknown[]> = T extends [] ? never : T extends [...unknown[], infer L] ? L : never;
