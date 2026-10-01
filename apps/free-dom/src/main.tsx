import { defineDommyConfig, mount } from '@reely/dommy';
import { pageLoading, Router } from '@reely/dommy/router';
import { scopedLogger } from '@reely/logger';

import { textsLoaded } from './i18n/localized';
import { followPagerKey } from './routing/pager.keys';
import { siteRoutes } from './routing/routes';
import { FailedPage } from './site/failed.page';
import css from './site/site.module.css';

// in development, dommy's warnings reach the console: a bound node, a string handler, an unowned binding
if (import.meta.env.DEV) {
  defineDommyConfig({ useLogger: true, logger: scopedLogger('dommy').setEnabled(true), warnUnowned: true });
}

// a page that did not load (a lost connection, a chunk gone after a deploy) or a bug: say so, not a blank page
const failed = (error: Error): Node => {
  scopedLogger('free-dom').error(error);
  return <FailedPage />;
};

document.addEventListener('keydown', followPagerKey);
// a reader who chose Russian last time sees it from the first render, not after a flash of English
// the page shown stays while the next one's chunk loads: a bar on top says it is coming
void textsLoaded().then(() =>
  mount(document.body, () => (
    <>
      <div className={css.loading} hidden={() => !pageLoading()} />
      <Router routes={siteRoutes} catch={failed} />
    </>
  ))
);
