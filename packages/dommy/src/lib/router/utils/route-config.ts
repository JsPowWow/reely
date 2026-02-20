// export type RouteDefinition<Handler extends CallableFunction> = {
//   action: Handler;
//   params: Record<string, string>;
// };

export type RouteConfig<Handler extends CallableFunction, P extends string = string> = {
  path: P;
  action: Handler;
  children?: RouteConfig<Handler>[];
};

export type ParsedRoute<Handler extends CallableFunction> = RouteConfig<Handler> & {
  pathname: string;
  isSubRoute: boolean;
  nestedLevel: number;
  params: Record<string, string>;
  parentRoute?: ParsedRoute<Handler>;
};

export type ParsedRoutesConfig<Handler extends CallableFunction> = Record<string, ParsedRoute<Handler>>;

export const parseConfig = <Handler extends CallableFunction>(
  config: RouteConfig<Handler>[],
  basePath = '',
  nestedLevel = 0,
  parentRoute?: ParsedRoute<Handler>
): ParsedRoutesConfig<Handler> =>
  config.reduce((acc, routeInfo) => {
    const pathname = `${basePath}${routeInfo.path}`;

    const parsed = {
      ...routeInfo,
      pathname,
      params: pathname.includes(':') ? toObjectWithKeys(extractParams(pathname)) : {},
      isSubRoute: Boolean(basePath),
      nestedLevel,
      parentRoute,
    } satisfies ParsedRoute<Handler>;

    const current = {
      [pathname]: parsed,
    };
    const children = routeInfo.children ? parseConfig(routeInfo.children, pathname, nestedLevel + 1, parsed) : {};

    return { ...acc, ...current, ...children };
  }, {});

const toObjectWithKeys = (keys: string[]): Record<string, string> => Object.fromEntries(keys.map((key) => [key, '']));

const splitPath = (path: string): string[] => path.split('/').slice(2);

const extractParams = (pathname: string): string[] => splitPath(pathname.replaceAll(':', ''));
