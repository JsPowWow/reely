import type { Routes } from '@reely/dommy/router';

import { DocsPage } from '../pages/docs/docs.page';
import { DommyPage } from '../pages/dommy/dommy.page';
import { EvolutionPage } from '../pages/evolution/evolution.page';
import { HomePage } from '../pages/home/home.page';
import { LabsPage } from '../pages/labs/labs.page';
import { PackagePage } from '../pages/package/package.page';
import { NotFoundPage } from '../site/not-found.page';
import { pagedPackageOf } from '../site/site.packages';
import { sitePaths } from '../site/site.paths';

// A route answers with how to render its page; `createPageView` renders it under an owner.
export const routes: Routes<() => Node> = [
  { path: sitePaths.home, action: () => () => <HomePage /> },
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
  {
    path: '/:name',
    // a name that is no package's falls through to the page for unknown paths
    action: (_ctx, { name }): (() => Node) | undefined => {
      const paged = pagedPackageOf(String(name));
      return paged && ((): Node => <PackagePage name={paged} />);
    },
  },
  { path: '/*rest', action: (ctx) => () => <NotFoundPage pathname={ctx.pathname} /> },
];
