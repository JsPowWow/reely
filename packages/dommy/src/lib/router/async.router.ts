// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { hasSome, isSomeFunction } from '@reely/basics';
import { Either, hasProperty, isNil, isString } from '@reely/utils';

import { getMatchingRoutes, RouteNotFoundError } from './utils/match-path';
import { parseConfig } from './utils/route-config';

import type {
  ResolveContext,
  Route,
  RouteContext,
  RouteParams,
  RouterContext,
  RouteResolver,
  RouteResult,
  RouterOptions,
  Routes,
} from './router.types';
import type { ParsedRoute, RouteConfig } from './utils/route-config';

export const createAsyncRouter = <R = any, C extends RouterContext = RouterContext>(
  routes: Routes<R, C> | Route<R, C>,
  options?: RouterOptions<R, C>
): AsyncRouter<R, C> => new AsyncRouter<R, C>(routes, options);

class AsyncRouter<R = any, C extends RouterContext = RouterContext> {
  private readonly root: RouteConfig<CallableFunction>[];

  private readonly baseUrl: string;

  private readonly options: RouterOptions<R, C>;

  constructor(routes: RouteConfig<CallableFunction> | RouteConfig<CallableFunction>[], options?: RouterOptions<R, C>) {
    assertIsValidRoutes(routes);
    routes = Array.isArray(routes) ? routes : [routes];
    this.options = { ...options };
    this.baseUrl = this.options.baseUrl || '';
    this.root = routes;
  }

  /** Resolves the first route, in definition order, that matches and whose action returns non-nil. */
  public async resolve(
    pathnameOrContext: string | (RouterContext & { pathname: string })
  ): Promise<RouteResult<unknown>> {
    const baseContext = {
      router: this,
      ...(isString(pathnameOrContext) ? { pathname: pathnameOrContext } : pathnameOrContext),
      baseUrl: this.baseUrl,
    } satisfies ResolveContext;

    const routesConfig = parseConfig(this.root); // TODO AR in constructor ?
    const routePathList = Object.keys(routesConfig); // TODO AR in constructor ?
    const searchUrl = baseContext.pathname.substring(this.baseUrl.length);
    const matchedRoutes = getMatchingRoutes(routePathList, searchUrl);
    if (!matchedRoutes.length) {
      throw new RouteNotFoundError();
    }

    const visited = new Set<ParsedRoute<RouteResolver>>();

    for (const matchedRoute of matchedRoutes) {
      // TODO AR here

      const matchedCfgRoute = routesConfig[matchedRoute.pathname];
      const resolver = this.options.resolveRoute ?? resolveRoute;
      const gen = routeChainFromRoot(matchedCfgRoute);
      let result = gen.next();

      while (!result.done) {
        const pp = result.value;
        if (visited.has(pp)) {
          result = gen.next();
          continue;
        }

        const params = Object.fromEntries(
          Object.entries(matchedRoute.params).map(([key, value]) => [key, decode(value)])
        );
        const currParams = extractParamsFromPath(pp.path, params);
        const currentContext = {
          ...baseContext,
          baseUrl: baseContext.baseUrl + (pp.parentRoute?.pathname ?? ''),
          path: pp.path,
          ...{
            route: { ...pp },
            params,
          },
          next: async function (): Promise<unknown> {
            return 'aa';
          },
        };

        const res = await resolver(currentContext, currParams);

        if (hasSome(res)) {
          return res;
        }
        visited.add(pp);
        result = gen.next();
      }
    }
    throw new Error('Route not found');
  }
}

function resolveRoute<R = any, C extends RouterContext = object>(
  context: RouteContext<R, C>,
  _params: RouteParams
): RouteResult<R> {
  if (isSomeFunction(context.route.action)) {
    const { route, router: _routerIgnored, ...rest } = context;
    const providedContext = {
      ...rest,
      route: {
        path: route.path,
        action: route.action,
      },
    };

    return context.route.action(providedContext, providedContext.params);
  }
  return undefined;
}

function extractParamsFromPath(path: string, params: RouteParams): RouteParams {
  const matches = path.match(/:([a-zA-Z0-9_]+)/g);
  if (!matches) return {};
  const result: RouteParams = {};
  matches.forEach((m) => {
    const key = m.slice(1);
    if (hasProperty(key, params)) {
      result[key] = params[key];
    }
  });
  return result;
}

function decode(val: string): string {
  return Either.tryCatch(() => decodeURIComponent(val)).getOrDefault(val);
}

class InvalidRoutesError extends Error {
  constructor(message = 'Invalid routes') {
    super(message);
    this.name = 'InvalidRoutesError';
  }
}

function assertIsValidRoutes<Handler extends RouteResolver>(
  routes: unknown
): asserts routes is RouteConfig<Handler> | RouteConfig<Handler>[] {
  if (isNil(routes)) throw new InvalidRoutesError();
  if (Array.isArray(routes)) {
    routes.forEach(assertIsValidRoutes);
    return;
  }
  const hasPath = hasProperty('path', routes) && isString(routes.path);
  const hasAction = hasProperty('action', routes) && isSomeFunction(routes.action);
  if (!hasAction && !hasPath) throw new InvalidRoutesError();
}

function* routeChainFromRoot(route: ParsedRoute<RouteResolver>): Generator<ParsedRoute<RouteResolver>> {
  if (route.parentRoute) {
    yield* routeChainFromRoot(route.parentRoute);
  }
  yield route;
}
