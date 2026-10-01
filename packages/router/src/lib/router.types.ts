/** The params a path pattern names: `:name` for one segment, `*name` for the rest of the path. */
export type ParamsOf<P extends string> = Flat<
  P extends `${string}:${infer Name}/${infer Rest}`
    ? Record<Name, string> & ParamsOf<`/${Rest}`>
    : P extends `${string}:${infer Name}`
    ? Record<Name, string>
    : P extends `${string}*${infer Name}`
    ? Name extends ''
      ? NoParams
      : Record<Name, string>
    : NoParams
>;

type NoParams = Record<never, string>;

type Flat<T> = { [K in keyof T]: T[K] } & {};

/**
 * The routes of an app as one function: the page for an address (a path and its query), or
 * undefined when no route answers it. A page is whatever the app shows: a render function, an
 * element, an object with a title.
 */
export type Routes<Page> = (address: string) => Promise<Page | undefined>;
