// The router ships as its own entry, `@reely/dommy/router`: an app without one ships none of it.
export { currentPath } from './lib/router/router.current';
export { Router, type RouterProps } from './lib/router/router.flow';
export { href, type HrefParams } from './lib/router/router.href';
export { navigate } from './lib/router/router.navigate';
export { defineRoutes, type RouteTable } from './lib/router/router.routes';
export type { Page, ParamsOf, RouteAnswer, Routes } from './lib/router/router.types';
