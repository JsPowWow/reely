import { defineDommyConfig } from '@reely/dommy';
import { createAsyncRouter } from '@reely/dommy/router';
import { scopedLogger } from '@reely/logger';
import { isSomeFunction } from '@reely/utils';

import { textsLoaded } from './i18n/localized';
import { navigateInPage } from './routing/page.navigation';
import { createPageView, enterPage } from './routing/page.view';
import { followPagerKey } from './routing/pager.keys';
import { routes } from './routing/routes';
import { FailedPage } from './site/failed.page';

defineDommyConfig({
  debug: import.meta.env.DEV,
  logger: scopedLogger('dommy'),
});

const router = createAsyncRouter(routes);
const showPage = createPageView(document.body);
// the pathname asked for last; a slower page resolved for an older one is dropped
let latestPathname = '';

/** Draws the page for a pathname in place of the current one; resolves once it is drawn. */
const renderPage = async (pathname: string): Promise<boolean> => {
  latestPathname = pathname;
  try {
    const render = await router.resolve({ pathname });
    if (pathname !== latestPathname || !isSomeFunction(render)) {
      return false;
    }
    showPage(render);
  } catch (error: unknown) {
    // every URL has a route, so this is a bug: say so instead of leaving a blank page
    scopedLogger('free-dom').error(error);
    showPage(FailedPage);
  }
  return true;
};

document.addEventListener('keydown', followPagerKey);
navigateInPage((pathname) => {
  void renderPage(pathname).then((drawn) => drawn && enterPage());
});
// a reader who chose Russian last time sees it from the first render, not after a flash of English;
// a link to a place on a page opens there, drawn after the browser looked for it
void textsLoaded()
  .then(() => renderPage(location.pathname))
  .then((drawn) => drawn && location.hash !== '' && enterPage());
