// The router ships as its own entry, `@reely/dommy/router`: an app without one ships none of it.
export { currentPath, defineRoutes, followLinks, href, memoryHistory, navigate } from '@reely/router';
export type { HrefParams, NavigateOptions, ParamsOf, RouterHistory, RouteTable } from '@reely/router';
export { Router, type RouterProps } from './lib/router/router.flow';
export type { Page, RouteAnswer, Routes } from './lib/router/router.types';
