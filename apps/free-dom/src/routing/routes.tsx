import type { JSX } from '@reely/dommy';
import type { Routes } from '@reely/dommy/router';
import { TutorialPage } from '../pages/tutorial/tutorial.page';

// A route answers with how to render its page; `createPageView` renders it under an owner.
export const routes = [
  // The course is the home page until the reely landing page exists.
  { path: '/', action: () => () => <TutorialPage /> },
  {
    path: '/tutorial',
    children: [
      { path: '', action: () => () => <TutorialPage /> },
      { path: '/:step', action: (_ctx, { step }) => () => <TutorialPage slug={String(step)} /> },
    ],
  },
  { path: '/*rest', action: (ctx) => () => <TutorialPage missingPath={ctx.pathname} /> },
] as const satisfies Routes<() => JSX.Element>;
