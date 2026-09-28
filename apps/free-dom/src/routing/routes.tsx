import type { Routes } from '@reely/dommy/router';
import { DocsPage } from '../pages/docs/docs.page';
import { EvolutionPage } from '../pages/evolution/evolution.page';
import { NotFoundPage } from '../site/not-found.page';

// A route answers with how to render its page; `createPageView` renders it under an owner.
export const routes = [
  // TODO AR the landing page takes `/` once it is built
  { path: '/', action: () => () => <DocsPage /> },
  {
    path: '/docs',
    children: [
      { path: '', action: () => () => <DocsPage /> },
      { path: '/:topic', action: (_ctx, { topic }) => () => <DocsPage slug={String(topic)} /> },
    ],
  },
  {
    path: '/evolution',
    children: [
      { path: '', action: () => () => <EvolutionPage /> },
      { path: '/:step', action: (_ctx, { step }) => () => <EvolutionPage slug={String(step)} /> },
    ],
  },
  { path: '/*rest', action: (ctx) => () => <NotFoundPage pathname={ctx.pathname} /> },
] as const satisfies Routes<() => Node>;
