import type { JSX } from '@reely/dommy';
import type { Routes } from '@reely/dommy/router';
import { TutorialPage } from '../pages/tutorial/tutorial.page';

export const routes = [
  // The course is the home page until the reely landing page exists.
  { path: '/', action: () => <TutorialPage /> },
  {
    path: '/tutorial',
    children: [
      { path: '', action: () => <TutorialPage /> },
      { path: '/:step', action: (_ctx, { step }) => <TutorialPage slug={String(step)} /> },
    ],
  },
  { path: '/*rest', action: (ctx) => <TutorialPage missingPath={ctx.pathname} /> },
] as const satisfies Routes<JSX.Element>;
