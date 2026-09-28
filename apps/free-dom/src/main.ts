import './pages/nx/nx.naive.component';
import './pages/nx/nx.naive.jsx.component';

// import './app/nx.playground.jsx.component';

import { defineDommyConfig } from '@reely/dommy';
import { scopedLogger } from '@reely/logger';
import { isInstanceOf } from '@reely/utils';

import { router } from './routing/routes';

router.resolve({ pathname: new URL(location.href).pathname }).then((result) => {
  if (isInstanceOf(Node, result)) {
    document.body.append(result);
  }
});

defineDommyConfig({
  debug: true,
  logger: scopedLogger('dommy'),
});
