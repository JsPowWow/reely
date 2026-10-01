import { hasSome } from '@reely/basics';
import { isNil } from '@reely/utils';

import { decode } from './router.decode';

import type { ParamsOf, Routes, RouteAnswer } from './router.types';

type Params = Readonly<Record<string, string>>;

/** A route table: each path pattern with the function that answers it. */
export type RouteTable<T> = { [P in keyof T & string]: (params: ParamsOf<P>) => RouteAnswer };

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
 * Turns a table of path patterns into the app's routes: a pathname gets the page of the first route
 * that matches it and answers. `:name` takes one segment, `*name` the rest of the path; a route that
 * answers nothing passes the pathname on to the next one.
 */
export function defineRoutes<T>(table: RouteTable<T>): Routes;
export function defineRoutes(table: Readonly<Record<string, (params: Params) => RouteAnswer>>): Routes {
  const routes = Object.entries(table).map(([pattern, answer]) => ({ pattern: segmentsOf(pattern), answer }));
  return async (pathname) => {
    const segments = segmentsOf(pathname);
    for (const { pattern, answer } of routes) {
      const params = matchSegments(pattern, segments);
      const page = hasSome(params) ? await answer(params) : undefined;
      if (hasSome(page)) {
        return page;
      }
    }
    return undefined;
  };
}
