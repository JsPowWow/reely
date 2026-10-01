import { defineDommyConfig, mount } from '@reely/dommy';
import { Router } from '@reely/dommy/router';
import { scopedLogger } from '@reely/logger';

import { textsLoaded } from './i18n/localized';
import { followPagerKey } from './routing/pager.keys';
import { siteRoutes } from './routing/routes';
import { FailedPage } from './site/failed.page';

defineDommyConfig({
  debug: import.meta.env.DEV,
  logger: scopedLogger('dommy'),
});

// a page that did not load (a lost connection, a chunk gone after a deploy) or a bug: say so, not a blank page
const failed = (error: Error): Node => {
  scopedLogger('free-dom').error(error);
  return <FailedPage />;
};

document.addEventListener('keydown', followPagerKey);
// a reader who chose Russian last time sees it from the first render, not after a flash of English
void textsLoaded().then(() => mount(document.body, () => <Router routes={siteRoutes} catch={failed} />));
