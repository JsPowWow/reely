import type { ParamsOf } from './router.types';

// the names of the params of every pattern of a union, since `href` may get any of them
type ParamNames<P extends string> = P extends string ? keyof ParamsOf<P> : never;

/**
 * What `href` takes after the pattern: its params, or nothing for a pattern without any; a union of
 * patterns takes the params of each, and a pattern typed `string` any.
 */
export type HrefParams<P extends string> = string extends P
  ? [params?: Readonly<Record<string, string>>]
  : [ParamNames<P>] extends [never]
  ? []
  : [params: { [Name in ParamNames<P>]: string }];

/**
 * The URL of a route: its pattern with the params filled in and encoded, typed from the pattern,
 * so a link and the route it opens share one path. `*rest` keeps its slashes.
 */
export function href<P extends string>(pattern: P, ...params: HrefParams<P>): string;
export function href(pattern: string, params: Readonly<Record<string, string>> = {}): string {
  return pattern
    .split('/')
    .map((part) => {
      const value = params[part.slice(1)] ?? '';
      if (part.startsWith(':')) {
        return encodeURIComponent(value);
      }
      return part.startsWith('*') ? value.split('/').map(encodeURIComponent).join('/') : part;
    })
    .join('/');
}
