import { createAsyncRouter } from '@reely/dommy';

import { routes } from './routes';

const headingAt = async (pathname: string): Promise<string | null | undefined> => {
  const page = await createAsyncRouter(routes).resolve(pathname);
  return page instanceof Element ? page.querySelector('h1')?.textContent : undefined;
};

describe('routes', () => {
  it('opens the course at the root and at a step', async () => {
    expect(await headingAt('/')).toMatch(/^Step 1\. /);
    expect(await headingAt('/tutorial/jsx')).toMatch(/^Step 2\. /);
  });

  it('answers an unknown URL with a page that says what is missing', async () => {
    expect(await headingAt('/nope/deeper')).toBe('There is no page at /nope/deeper');
  });
});
