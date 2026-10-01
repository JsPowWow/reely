import { startRouter } from '@reely/router';
import type { RouterHistory } from '@reely/router';

import { createFlowSlot } from '../flow/flow.slot';

import type { Page, Routes } from './router.types';
import type { ReelyNode } from '../types/dommy.types';

export interface RouterProps {
  /** The app's routes: from `defineRoutes`, or any function of an address to a page. */
  routes: Routes;
  /** Required, so a page that fails to load or to render, and a path no route answers, still have a view. */
  catch: (error: Error) => ReelyNode;
  /** Where the addresses come from: the browser's history when left out, or a `memoryHistory` for a widget with pages. */
  history?: RouterHistory;
}

/**
 * Shows the page of the current URL in its place and keeps following it (`startRouter` of
 * `@reely/router`): each page renders under its own owner and is taken down at the next move, and the
 * router stops with the render that holds it.
 */
export const Router = ({ routes, catch: renderError, history }: RouterProps): DocumentFragment => {
  const slot = createFlowSlot('Router');
  startRouter(routes, {
    history,
    show: (page) => {
      slot.show(page);
      return slot.nodes();
    },
    fail:
      (error): Page =>
      () =>
        renderError(error),
  });
  return slot.fragment;
};
