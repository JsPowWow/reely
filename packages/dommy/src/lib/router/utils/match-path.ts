import { hasSome, isInstanceOf } from '@reely/utils';

import type { MatchingRoute, RouteMatchingResult, RoutePath } from './types';

const toRegExp = (route: string): RegExp => {
  const usedNames = {};
  return new RegExp(
    route
      /** replaces literal dot "." in the route with the escaped dot (\\.) */
      .replaceAll('.', String.raw`\.`)
      /** escape literal slashes */
      .replaceAll('/', '/')
      /** replaces literal question marks (?) with escaped question marks (\\?) */
      .replaceAll('?', String.raw`\?`)
      /** removes any trailing slashes (/) at the end of the route string */
      .replace(/\/+$/, '')
      /** replace  * (wildcard) characters in the route to the regular expression .* */
      .replaceAll(/\*+/g, '.*')
      /** converts params from form of `:paramName` (e.g., :id) into regular expression named capturing groups. */
      .replaceAll(
        /:([^\d/^|]\w*(?=(?:\/|\\.)|$))/g,
        (_, parameterName) => `(?<${makeRegexWithUniqueGroups(parameterName, usedNames)}>[^/]+?)`
      )
      /** Allow optional trailing slash */
      .concat(String.raw`(\/|$)`),
    'gi'
  );
};

function makeRegexWithUniqueGroups(parameterName: string, usedNames: Record<string, number> = {}): string {
  if (!usedNames[parameterName]) {
    usedNames[parameterName] = 1;
    return parameterName;
  } else {
    usedNames[parameterName]++;
    return `${parameterName}_${usedNames[parameterName]}`;
  }
}
type MatchPathWithUrlOutput = {
  matches: boolean;
  params: Record<string, string> | null;
};
export const matchPathWithUrl = (routePath: RoutePath, url: string): MatchPathWithUrlOutput => {
  const expression = isInstanceOf(RegExp, routePath) ? routePath : toRegExp(routePath);

  const match = expression.exec(url) || false;

  const matches = isInstanceOf(RegExp, routePath) ? !!match : !!match && match[0] === match.input;

  return {
    matches,
    params: match && matches ? match.groups || null : null,
  };
};

const toMatchingRoute =
  (url: string) =>
  (pathname: string): MatchingRoute | undefined => {
    const match = matchPathWithUrl(pathname, url);

    return match.matches
      ? {
          searchedTerm: url,
          pathname,
          params: match.params ?? {},
        }
      : undefined;
  };

export class RouteNotFoundError extends Error {
  public readonly status = 404;
  constructor(message = 'Route not found') {
    super(message);
    this.name = 'RouteNotFoundError';
  }
}

export const getMatchingRoutes = (routes: string[], url: string): MatchingRoute[] =>
  routes.map(toMatchingRoute(url)).filter((r) => hasSome(r));

export const toRouteMatchingResult = (matchedRoutes: MatchingRoute[], url: string): RouteMatchingResult => {
  if (matchedRoutes.length === 0) {
    return { success: false, error: new RouteNotFoundError() };
  }

  if (matchedRoutes.length > 1) {
    const exact = matchedRoutes.find((route) => route.pathname === url);
    if (exact) {
      return { success: true, route: exact };
    }
    // console.warn('matchedRoutes: ', matchedRoutes);
    return { success: false, error: new Error(`There was found more than one matching for url-request: "${url}"`) };
  }

  return { success: true, route: matchedRoutes[0] };
};

export const findMatchingRoute = (routes: string[], url: string): RouteMatchingResult => {
  return toRouteMatchingResult(getMatchingRoutes(routes, url), url);
};
