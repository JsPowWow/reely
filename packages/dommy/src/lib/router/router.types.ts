import type { Routes as RoutesOf } from '@reely/router';
import type { Nullable } from '@reely/utils';

import type { ReelyNode } from '../types/dommy.types';

/** A component without props: what a route answers with, rendered once its route is shown. */
export type Page = () => ReelyNode;

/** A page, or nothing to pass to the next route; a page that loads (`import()`) comes as a promise. */
export type RouteAnswer = Nullable<Page> | PromiseLike<Nullable<Page>>;

/**
 * `Routes` of `@reely/router`: the routes of an app as one function, the page for an address or
 * undefined when none answers; its pages are dommy `Page`s unless named otherwise.
 */
export type Routes<P = Page> = RoutesOf<P>;
