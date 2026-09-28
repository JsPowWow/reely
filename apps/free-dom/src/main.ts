import { createAsyncRouter, defineDommyConfig } from '@reely/dommy';
import { scopedLogger } from '@reely/logger';
import { isInstanceOf } from '@reely/utils';

import { routes } from './routing/routes';

createAsyncRouter(routes)
  .resolve({ pathname: new URL(location.href).pathname })
  .then((result) => {
    if (isInstanceOf(Node, result)) {
      document.body.append(result);
    }
  });

defineDommyConfig({
  debug: true,
  logger: scopedLogger('dommy'),
});
