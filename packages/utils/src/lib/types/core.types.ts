export type Nil = null | undefined;

export type Nullable<T> = T | Nil;

export type PrimitiveValue = string | number | boolean | bigint;

export type KeyValueObject<Values = unknown> = Record<PropertyKey, Values>;

export type WithAutoComplete<T extends string> = T | (string & {});
