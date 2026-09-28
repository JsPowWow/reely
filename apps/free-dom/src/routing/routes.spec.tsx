import { createAsyncRouter } from '@reely/dommy/router';
import { isSomeFunction } from '@reely/utils';

import { routes } from './routes';

const renderAt = async (pathname: string): Promise<Element> => {
  const render = await createAsyncRouter(routes).resolve(pathname);
  if (!isSomeFunction(render)) {
    throw new Error(`No page at ${pathname}`);
  }
  const host = document.createElement('div');
  host.append(render());
  return host;
};

const headingAt = async (pathname: string): Promise<string | null | undefined> =>
  (await renderAt(pathname)).querySelector('h1')?.textContent;

describe('routes', () => {
  it('opens the docs at their first topic and at a topic', async () => {
    expect(await headingAt('/docs')).toBe('Getting started');
    expect(await headingAt('/docs/signals')).toBe('Signals');
  });

  it('opens reely evolution at its first step and at a step', async () => {
    expect(await headingAt('/evolution')).toMatch(/^Step 1\. /);
    expect(await headingAt('/evolution/jsx')).toMatch(/^Step 2\. /);
  });

  it('marks the part of the site a page belongs to', async () => {
    const docs = await renderAt('/docs/lists');
    const evolution = await renderAt('/evolution/batch');

    expect(docs.querySelector('header nav [aria-current="page"]')?.textContent).toBe('Docs');
    expect(evolution.querySelector('header nav [aria-current="page"]')?.textContent).toBe('Evolution');
  });

  it('answers an unknown URL with a page that says what is missing', async () => {
    const page = await renderAt('/nope/deeper');

    expect(page.querySelector('h1')?.textContent).toBe('There is no page at /nope/deeper');
    expect(page.querySelector('main a[href="/docs"]')?.textContent).toBe('Open the docs');
  });
});
