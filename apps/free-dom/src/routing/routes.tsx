import type { JSX, Routes } from '@reely/dommy';
import { MainPage } from '../pages/mainPage';
import { Layout } from './Layout';
import { TutorialPage } from '../pages/tutorial/tutorial.page';

export const routes = [
  {
    path: '/',
    action: () => (
      <Layout>
        <MainPage />
      </Layout>
    ),
  },
  {
    path: '/tutorial',
    children: [
      { path: '', action: () => <TutorialPage /> },
      { path: '/:step', action: (_ctx, { step }) => <TutorialPage slug={String(step)} /> },
    ],
  },
  { path: '/*all', action: () => <h1>Not Found</h1> },
] as const satisfies Routes<JSX.Element>;
