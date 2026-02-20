// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
import { Either, hasProperty, hasSome, isNil, isSomeFunction, isString } from '@reely/utils';

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

  private readonly options: RouterOptions;

  constructor(routes: RouteConfig<CallableFunction> | RouteConfig<CallableFunction>[], options?: RouterOptions) {
    assertIsValidRoutes(routes);
    // console.log('routes!!!!!', routes);
    routes = Array.isArray(routes) ? routes : [routes];
    // ^?
    // this.options = { decode, ...options };
    this.options = { ...options };
    this.baseUrl = this.options.baseUrl || '';
    this.root = routes; // { path: '', children: routes, parent: null };
    //this.root.parent = null;
  }

  /**
   * Traverses the list of routes in the order they are defined until it finds
   * the first route that matches provided URL path string and whose action function
   * returns anything other than `null` or `undefined`.
   */
  public async resolve(
    pathnameOrContext: string | (RouterContext & { pathname: string })
  ): Promise<RouteResult<unknown>> {
    const baseContext = {
      router: this,
      // ...this.options.context,
      ...(isString(pathnameOrContext) ? { pathname: pathnameOrContext } : pathnameOrContext),
      baseUrl: this.baseUrl,
    } satisfies ResolveContext;

    const routesConfig = parseConfig(this.root); // TODO AR in constructor ?
    const routePathList = Object.keys(routesConfig); // TODO AR in constructor ?
    const searchUrl = baseContext.pathname.substring(this.baseUrl.length);
    console.log('routePathList', { pathnameOrContext, routePathList });
    const matchedRoutes = getMatchingRoutes(routePathList, searchUrl);
    if (!matchedRoutes.length) {
      throw new RouteNotFoundError();
    }

    const visited = new Set<ParsedRoute<RouteResolver>>();

    for (const matchedRoute of matchedRoutes) {
      // TODO AR here
      //const matchedRoute = toRouteMatchingResult(matchedRoutes, searchUrl);

      //if (matchedRoute.success) {
      const matchedCfgRoute = routesConfig[matchedRoute.pathname];
      const resolver = this.options.resolveRoute ?? resolveRoute;
      console.log('!!matchedRoutes!!', matchedRoutes);
      //console.log('~~ CfgMatchedRoute', matchedCfgRoute);
      const gen = routeChainFromRoot(matchedCfgRoute);
      let result = gen.next();

      while (!result.done) {
        console.log('RESULT-BEG', { result });
        const pp = result.value;
        if (visited.has(pp)) {
          result = gen.next();
          // pp = result.value;
          continue;
        }

        const params = Object.fromEntries(
          Object.entries(matchedRoute.params).map(([key, value]) => [key, decode(value)])
        );
        const currParams = extractParamsFromPath(pp.path, params);
        // console.log('AAA', { params, currParams, pp: pp.params });
        const currentContext = {
          ...baseContext,
          baseUrl: baseContext.baseUrl + (pp.parentRoute?.pathname ?? ''),
          path: pp.path,
          ...{
            route: { ...pp },
            params,
          },
          next: async function (): Promise<unknown> {
            // const { value, done } = gen.next();
            // console.log('CALL next', { value, done });
            // const res = await resolver(currentContext, currParams);
            // if (hasSome(res)) {
            //   return res;
            // }
            // visited.add(pp);
            return 'aa'; //currentContext.route.action(currentContext, currentContext.params);
          },
        };

        const res = await resolver(currentContext, currParams);

        console.log('CHAIN', {
          path: pp.path,
          result: res,
          // pp,
          // ppparams: pp.params,
        });
        if (hasSome(res)) {
          return res;
        }
        visited.add(pp);
        result = gen.next();

        console.log('RESULT-E', { result });
      }
      // throw new Error('Route not found'); //Error('No route resolved');
      // } else throw matchedRoute.error;
    }
    throw new Error('Route not found'); //Error('No route resolved');
    // for (const pp of routeChainFromRoot(matchedCfgRoute)) {
    //   console.log('CHAIN', pp.path, pp.action());
    // }

    // const matchedRoute = findMatchingRoute(routePathList, context.pathname.substring(this.baseUrl.length));
    // console.log('findMatchingRoute', matchedRoute);

    // if (matchedRoute.success) {
    //   const matchedCfgRoute = routesConfig[matchedRoute.route.pathname];
    //   const resolve = this.options.resolveRoute ?? resolveRoute;
    //
    //   console.log('~~~matchedCfgRoute', matchedCfgRoute);
    //   console.log('~~~matchedRoute', matchedRoute);
    //   for (const pp of routeChainFromRoot(matchedCfgRoute)) {
    //     console.log('CHAIN', pp.path, pp.action());
    //   }
    //
    //   const currentContext = {
    //     ...context,
    //     path: matchedRoute.route.pathname,
    //     ...{
    //       route: { ...matchedCfgRoute },
    //       params: Object.fromEntries(
    //         Object.entries(matchedRoute.route.params).map(([key, value]) => [key, decode(value)])
    //       ),
    //     },
    //   };
    //   console.log('ctx', currentContext);
    //   return Promise.resolve(resolve(currentContext, matchedRoute.route.params));
    //   // .then((result) => {
    //   // if (result !== null && result !== undefined) {
    //   //   return result;
    //   // }
    //   // return next(resume, parent, result);
    // } else {
    //   throw matchedRoute.error;
    // }

    // const matchResult = matchRoute(this.root, this.baseUrl, this.options, context.pathname.substr(this.baseUrl.length));
    // const resolve = this.options.resolveRoute || resolveRoute;
    // let matches: IteratorResult<RouteMatch<R, C>, false>;
    // let nextMatches: IteratorResult<RouteMatch<R, C>, false> | null;
    // let currentContext = context;
    //
    // function next(
    //   resume: boolean,
    //   parent: Route<R, C> | false = !matches.done && matches.value.route,
    //   prevResult?: RouteResult<R>
    // ): Promise<RouteResult<R>> {
    //   const routeToSkip = prevResult === null && !matches.done && matches.value.route;
    //   matches = nextMatches || matchResult.next(routeToSkip);
    //   nextMatches = null;
    //
    //   if (!resume) {
    //     if (matches.done || !isChildRoute(parent, matches.value.route)) {
    //       nextMatches = matches;
    //       return Promise.resolve(null);
    //     }
    //   }
    //
    //   if (matches.done) {
    //     const error: RouteError = new Error('Route not found');
    //     error.status = 404;
    //     return Promise.reject(error);
    //   }
    //
    //   currentContext = { ...context, ...matches.value };
    //
    //   return Promise.resolve(resolve(currentContext as RouteContext<R, C>, matches.value.params)).then((result) => {
    //     if (result !== null && result !== undefined) {
    //       return result;
    //     }
    //     return next(resume, parent, result);
    //   });
    // }
    //
    // context['next'] = next;
    //
    // try {
    //   //await Promise.resolve();
    //   return await next(true, this.root);
    // } catch (error_1) {
    //   if (this.options.errorHandler) {
    //     return this.options.errorHandler(error_1, currentContext);
    //   }
    //   throw error_1;
    // }
  }
}

// function matchRoute<R, C extends RouterContext>(
//   route: Route<R, C>,
//   baseUrl: string,
//   options: RouterOptions<R, C>,
//   pathname: string,
//   parentParams?: RouteParams
// ): Iterator<RouteMatch<R, C>, false, Route<R, C> | false> {
//   let matchResult: Match<RouteParams>;
//   let childMatches: Iterator<RouteMatch<R, C>, false, Route<R, C> | false> | null;
//   let childIndex = 0;
//
//   return {
//     next(routeToSkip: Route<R, C> | false): IteratorResult<RouteMatch<R, C>, false> {
//       if (route === routeToSkip) {
//         return { done: true, value: false };
//       }
//
//       if (!matchResult) {
//         const rt = route;
//         const end = !rt.children;
//         if (!rt.match) {
//           rt.match = match<RouteParams>(rt.path || '', { end, ...options });
//         }
//         matchResult = rt.match(pathname);
//
//         if (matchResult) {
//           const { path } = matchResult;
//           matchResult.path = !end && path.charAt(path.length - 1) === '/' ? path.substr(1) : path;
//           matchResult.params = { ...parentParams, ...matchResult.params };
//           return {
//             done: false,
//             value: {
//               route,
//               baseUrl,
//               path: matchResult.path,
//               params: matchResult.params,
//             },
//           };
//         }
//       }
//
//       if (matchResult && route.children) {
//         while (childIndex < route.children.length) {
//           if (!childMatches) {
//             const childRoute = route.children[childIndex]!;
//             childRoute.parent = route;
//
//             childMatches = matchRoute<R, C>(
//               childRoute,
//               baseUrl + matchResult.path,
//               options,
//               pathname.substr(matchResult.path.length),
//               matchResult.params
//             );
//           }
//
//           const childMatch = childMatches.next(routeToSkip);
//           if (!childMatch.done) {
//             return { done: false, value: childMatch.value };
//           }
//
//           childMatches = null;
//           childIndex++;
//         }
//       }
//
//       return { done: true, value: false };
//     },
//   };
// }

function resolveRoute<R = any, C extends RouterContext = object>(
  context: RouteContext<R, C>,
  params: RouteParams
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

    console.log('🔥 exec ', { providedContext, params });
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

// function isChildRoute<R = any, C extends RouterContext = object>(
//   parentRoute: Route<R, C> | false,
//   childRoute: Route<R, C>
// ): boolean {
//   let route: Route<R, C> | null | undefined = childRoute;
//   while (route) {
//     route = route.parent;
//     if (route === parentRoute) {
//       return true;
//     }
//   }
//   return false;
// }

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

// function* routeChain(route) {
//   while (route) {
//     yield route;
//     route = route.parentRoute;
//   }
// }

// v1
// const matchedRoute = findMatchingRoute(routePathList, context.pathname.substring(this.baseUrl.length));
// // console.log('findMatchingRoute', matchedRoute);
//
// if (matchedRoute.success) {
//   const matchedCfgRoute = routesConfig[matchedRoute.route.pathname];
//   const resolve = this.options.resolveRoute ?? resolveRoute;
//
//   console.log('~~~matchedCfgRoute', matchedCfgRoute);
//   console.log('~~~matchedRoute', matchedRoute);
//   for (const pp of routeChainFromRoot(matchedCfgRoute)) {
//     console.log('CHAIN', pp.path, pp.action());
//   }
//
//   const currentContext = {
//     ...context,
//     path: matchedRoute.route.pathname,
//     ...{
//       route: { ...matchedCfgRoute },
//       params: Object.fromEntries(Object.entries(matchedRoute.route.params).map(([key, value]) => [key, decode(value)])),
//     },
//   };
//   console.log('ctx', currentContext);
//   return Promise.resolve(resolve(currentContext, matchedRoute.route.params));
//   // .then((result) => {
//   // if (result !== null && result !== undefined) {
//   //   return result;
//   // }
//   // return next(resume, parent, result);
// } else {
//   throw matchedRoute.error;
// }
