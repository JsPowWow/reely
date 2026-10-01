import { mount } from '@reely/dommy';
import { defineRoutes, navigate, Router } from '@reely/dommy/router';

import type { Page } from '@reely/dommy/router';

const page =
  (title: string): Page =>
  () => (
    <main>
      <h1>{title}</h1>
    </main>
  );

export const shopRoutes = defineRoutes({
  '/': () => page('Shop'),
  '/orders/:id': ({ id }) => Promise.resolve(page(`Order ${id}`)),
  '/*rest': ({ rest }) => page(`No page at /${rest}`),
});

export const start = (root: Element): VoidFunction =>
  mount(root, () => <Router routes={shopRoutes} catch={(error) => <p role='alert'>{error.message}</p>} />);

export { navigate };
