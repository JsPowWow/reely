import type { Nullable } from '@reely/utils';

/** Arbitrary data passed to `router.resolve()`, available inside actions. */
export interface RouterContext {
  [propName: string]: any;
}

export interface Route<R = any, C extends RouterContext = RouterContext> {
  path: string;
  /** A unique name to generate the route URL by. */
  name?: string;
  /** Populated by the router; useful for breadcrumbs. */
  parent?: Route<R, C> | null;
  children?: Routes<R, C> | null;
  /** Returns non-nil to resolve; when every matched route returns nothing, the router throws. */
  action?: (context: RouteContext<R, C>, params: RouteParams) => RouteResult<R>;
}

export interface RouteContext<R = any, C extends RouterContext = RouterContext> extends ResolveContext {
  route: Route<R, C>;
  /** Relative to the path of the current route. */
  baseUrl: string;
  path: string;
  params: RouteParams;
}

export type Routes<R = any, C extends RouterContext = RouterContext> = Route<R, C>[];

export interface ResolveContext extends RouterContext {
  /** The URL passed to `router.resolve()`. */
  pathname: string;
}

export interface RouteParams {
  [paramName: string]: string;
}

export type RouteResult<T> = Nullable<T> | Promise<Nullable<T>>;

export type RouteResolver<R = any, C extends RouterContext = RouterContext> = (
  context: RouteContext<R, C>,
  params: RouteParams
) => RouteResult<R>;

export interface RouterOptions<R = any, C extends RouterContext = RouterContext> {
  baseUrl?: string;
  resolveRoute?: RouteResolver<R, C>;
}
