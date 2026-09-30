import { a, defineDommyConfig, p } from '@reely/dommy';
import { createAsyncRouter } from '@reely/dommy/router';
import { scopedLogger } from '@reely/logger';
import { isInstanceOf, isSomeFunction } from '@reely/utils';

import { textsLoaded } from './i18n/localized';
import { navigateInPage } from './routing/page.navigation';
import { createPageView } from './routing/page.view';
import { followPagerKey } from './routing/pager.keys';
import { routes } from './routing/routes';
import { siteText } from './site/site.text';

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
    showPage(() =>
      p(
        null,
        () => `${siteText().failed.text} `,
        a({ href: '/docs' }, () => siteText().failed.openDocs)
      )
    );
  }
  return true;
};

/** After a move to another page: start at its top, with focus on its heading for screen readers. */
const enterPage = (): void => {
  window.scrollTo(0, 0);
  const heading = document.querySelector('h1');
  if (isInstanceOf(HTMLElement, heading)) {
    heading.tabIndex = -1;
    heading.focus({ preventScroll: true });
  }
};

document.addEventListener('keydown', followPagerKey);
navigateInPage((pathname) => {
  void renderPage(pathname).then((drawn) => drawn && enterPage());
});
// a reader who chose Russian last time sees it from the first render, not after a flash of English
void textsLoaded().then(() => renderPage(location.pathname));
