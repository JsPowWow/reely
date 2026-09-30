export type Nil = null | undefined;

export type Nullable<T> = T | Nil;

/** The values `if` rejects that a type can name; `NaN` is a `number` and stays in. */
export type Falsy = false | 0 | 0n | '' | Nil;

export type Truthy<T> = Exclude<T, Falsy>;

export type PrimitiveValue = string | number | boolean | bigint;

export type KeyValueObject<Values = unknown> = Record<PropertyKey, Values>;

export type WithAutoComplete<T extends string> = T | (string & {});
