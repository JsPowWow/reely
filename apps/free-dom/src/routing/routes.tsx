import type { Routes } from '@reely/dommy/router';

import { DocsPage } from '../pages/docs/docs.page';
import { DommyPage } from '../pages/dommy/dommy.page';
import { EvolutionPage } from '../pages/evolution/evolution.page';
import { LabsPage } from '../pages/labs/labs.page';
import { NotFoundPage } from '../site/not-found.page';
import { sitePaths } from '../site/site.paths';

// A route answers with how to render its page; `createPageView` renders it under an owner.
export const routes: Routes<() => Node> = [
  { path: sitePaths.home, action: () => () => <DommyPage /> },
  { path: sitePaths.dommy, action: () => () => <DommyPage /> },
  {
    path: sitePaths.docs,
    children: [
      { path: '', action: () => () => <DocsPage /> },
      { path: '/:topic', action: (_ctx, { topic }) => () => <DocsPage slug={String(topic)} /> },
    ],
  },
  {
    path: sitePaths.evolution,
    children: [
      { path: '', action: () => () => <EvolutionPage /> },
      { path: '/:step', action: (_ctx, { step }) => () => <EvolutionPage slug={String(step)} /> },
    ],
  },
  { path: sitePaths.labs, action: () => () => <LabsPage /> },
  { path: '/*rest', action: (ctx) => () => <NotFoundPage pathname={ctx.pathname} /> },
];
