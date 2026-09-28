import { createAsyncRouter } from '@reely/dommy';
import { isInstanceOf } from '@reely/utils';

import { routes } from './routes';

const renderAt = async (pathname: string): Promise<Element> => {
  const page = await createAsyncRouter(routes).resolve(pathname);
  if (!isInstanceOf(Element, page)) {
    throw new Error(`No page at ${pathname}`);
  }
  return page;
};

const headingAt = async (pathname: string): Promise<string | null | undefined> =>
  (await renderAt(pathname)).querySelector('h1')?.textContent;

describe('routes', () => {
  it('opens the course at the root and at a step', async () => {
    expect(await headingAt('/')).toMatch(/^Step 1\. /);
    expect(await headingAt('/tutorial/jsx')).toMatch(/^Step 2\. /);
  });

  it('answers an unknown URL with a page that says what is missing', async () => {
    const page = await renderAt('/nope/deeper');

    expect(page.querySelector('h1')?.textContent).toBe('There is no page at /nope/deeper');
    expect(page.querySelector('main a[href="/tutorial/factories"]')?.textContent).toBe('Start with step 1');
  });
});
