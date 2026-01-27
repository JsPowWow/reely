// import './app/nx.naive.component';
import './app/nx.naive.jsx.component';
// import './app/nx.playground.jsx.component';

import { defineDommyConfig } from '@reely/dommy';
import { scopedLogger } from '@reely/logger';

defineDommyConfig({
  debug: true,
  logger: scopedLogger('dommy'),
});
