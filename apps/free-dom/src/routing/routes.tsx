import type { JSX, Routes } from '@reely/dommy';
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
  { path: '/*all', action: () => <h1>Not Found</h1> },
] as const satisfies Routes<JSX.Element>;
