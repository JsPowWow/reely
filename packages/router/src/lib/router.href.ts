import type { ParamsOf } from './router.types';

/** What `href` takes after the pattern: its params, or nothing for a pattern without any. */
export type HrefParams<P extends string> = keyof ParamsOf<P> extends never ? [] : [params: ParamsOf<P>];

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
