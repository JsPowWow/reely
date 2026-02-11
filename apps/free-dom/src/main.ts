import './pages/nx/nx.naive.component';
import './pages/nx/nx.naive.jsx.component';

// import './app/nx.playground.jsx.component';

import { defineDommyConfig } from '@reely/dommy';
import { scopedLogger } from '@reely/logger';

import { router } from './routing/routes';

router.resolve({ pathname: new URL(location.href).pathname }).then((result) => {
  result && document.body.append(result as Node);
});

defineDommyConfig({
  debug: true,
  logger: scopedLogger('dommy'),
});
