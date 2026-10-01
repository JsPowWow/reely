import { hasSome } from '@reely/basics';
import { isNil } from '@reely/utils';

import { decode } from './router.decode';
import { anyOrigin } from './router.history';

import type { ParamsOf, Routes } from './router.types';

type Params = Readonly<Record<string, string>>;

/**
 * A route table: each path pattern with the function that answers it from the params the pattern
 * names and the address's query. An answer is a page, a promise of one (`import()`), or nothing to
 * pass the address on to the next route.
 */
export type RouteTable<T> = { [P in keyof T & string]: (params: ParamsOf<P>, query: URLSearchParams) => T[P] };

/** The pages a route table answers with, loaded. */
export type PageOf<T> = NonNullable<Awaited<T[keyof T]>>;

const segmentsOf = (path: string): string[] => path.split('/').filter((segment) => segment !== '');

// the params a pattern takes from a pathname's segments, or undefined when it does not match them
const matchSegments = (pattern: readonly string[], segments: readonly string[]): Params | undefined => {
  const params: Record<string, string> = {};
  for (const [index, part] of pattern.entries()) {
    if (part.startsWith('*')) {
      params[part.slice(1)] = decode(segments.slice(index).join('/'));
      return params;
    }
    const segment = segments[index];
    if (isNil(segment) || (!part.startsWith(':') && part !== segment)) {
      return undefined;
    }
    if (part.startsWith(':')) {
      params[part.slice(1)] = decode(segment);
    }
  }
  return segments.length === pattern.length ? params : undefined;
};

/**
 * Turns a table of path patterns into the app's routes: an address gets the page of the first route
 * that matches its path and answers. `:name` takes one segment, `*name` the rest of the path; a route
 * that answers nothing passes the address on to the next one.
 */
export function defineRoutes<T>(table: RouteTable<T>): Routes<PageOf<T>>;
export function defineRoutes(
  table: Readonly<Record<string, (params: Params, query: URLSearchParams) => unknown>>
): Routes<unknown> {
  const routes = Object.entries(table).map(([pattern, answer]) => ({ pattern: segmentsOf(pattern), answer }));
  return async (address) => {
    const { pathname, searchParams } = new URL(address, anyOrigin);
    const segments = segmentsOf(pathname);
    for (const { pattern, answer } of routes) {
      const params = matchSegments(pattern, segments);
      const page: unknown = hasSome(params) ? await answer(params, searchParams) : undefined;
      if (hasSome(page)) {
        return page;
      }
    }
    return undefined;
  };
}
