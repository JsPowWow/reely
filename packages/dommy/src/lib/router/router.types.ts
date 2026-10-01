import type { Nullable } from '@reely/utils';

import type { ReelyNode } from '../types/dommy.types';

/** A component without props: what a route answers with, rendered once its route is shown. */
export type Page = () => ReelyNode;

/** A page, or nothing to pass to the next route; a page that loads (`import()`) comes as a promise. */
export type RouteAnswer = Nullable<Page> | PromiseLike<Nullable<Page>>;

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

/** The routes of an app as one function: the page for a pathname, or undefined when none answers. */
export type Routes = (pathname: string) => Promise<Page | undefined>;
