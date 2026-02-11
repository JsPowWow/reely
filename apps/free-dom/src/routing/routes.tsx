import { createAsyncRouter, Routes } from '@reely/dommy';
import { MainPage } from '../pages/mainPage';
import { NxPage } from '../pages/nx/nxPage';
import { Layout } from './Layout';
import { TutorialPage } from '../pages/tutorial/tutorialPage';
import { CountersPlayground } from '../pages/tutorial/counters/counters.playground.jsx.component';

const routes = [
  {
    path: '/',
    action: () => (
      <Layout>
        <MainPage />
      </Layout>
    ),
  },
  {
    path: '/nx',
    children: [
      {
        path: '',
        action: () => {
          return (
            <Layout>
              <NxPage>
                <free-dom-nx-naive />
              </NxPage>
            </Layout>
          );
        },
      },
      {
        path: '/:mode',
        action: (ctx, { mode }) => {
          if (mode === 'naive') {
            return (
              <Layout>
                <NxPage>
                  <free-dom-nx-naive />
                </NxPage>
              </Layout>
            );
          }
          if (mode === 'jsx') {
            return (
              <Layout>
                <NxPage>
                  <free-dom-nx-naive-jsx />
                </NxPage>
              </Layout>
            );
          }
          return <h1>Not Found</h1>;
        },
      },
    ],
  },
  {
    path: '/tutorial',
    children: [
      {
        path: '',
        action: () => {
          return (
            <Layout>
              <TutorialPage>
                <CountersPlayground />
              </TutorialPage>
            </Layout>
          );
        },
      },
      {
        path: '/:mode',
        action: (ctx, { mode }) => {
          if (mode === 'counters') {
            return (
              <Layout>
                <TutorialPage>
                  <CountersPlayground />
                </TutorialPage>
              </Layout>
            );
          }
          return <h1>Not Found</h1>;
        },
      },
    ],
  },
  { path: '/*all', action: () => <h1>Not Found</h1> },
] as const satisfies Routes<JSX.Element>;

export const router = createAsyncRouter(routes);
