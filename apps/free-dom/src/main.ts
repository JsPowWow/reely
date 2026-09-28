import { a, createAsyncRouter, defineDommyConfig, p } from '@reely/dommy';
import { scopedLogger } from '@reely/logger';
import { isInstanceOf } from '@reely/utils';

import { followPagerKey } from './pages/tutorial/pager.keys';
import { routes } from './routing/routes';

defineDommyConfig({
  debug: import.meta.env.DEV,
  logger: scopedLogger('dommy'),
});

document.addEventListener('keydown', followPagerKey);

createAsyncRouter(routes)
  .resolve({ pathname: new URL(location.href).pathname })
  .then((result) => {
    if (isInstanceOf(Node, result)) {
      document.body.append(result);
    }
  })
  .catch((error: unknown) => {
    // every URL has a route, so this is a bug: say so instead of leaving a blank page
    scopedLogger('free-dom').error(error);
    document.body.append(
      p(null, 'This page failed to load. ', a({ href: '/tutorial' }, 'Open the course from step 1'), '.')
    );
  });
