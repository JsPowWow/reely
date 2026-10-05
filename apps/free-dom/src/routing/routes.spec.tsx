import { mount } from '@reely/dommy';
import { isNil } from '@reely/utils';

import { siteRoutes } from './routes';
import { stubDialogs } from '../testing/dom.testing';

const renderAt = async (pathname: string): Promise<Element> => {
  const page = await siteRoutes(pathname);
  if (isNil(page)) {
    throw new Error(`No page at ${pathname}`);
  }
  const host = document.createElement('div');
  mount(host, page);
  return host;
};

const headingAt = async (pathname: string): Promise<string | null | undefined> =>
  (await renderAt(pathname)).querySelector('h1')?.textContent;

describe('routes', () => {
  beforeAll(stubDialogs);
  it('opens the home page, the way into every package, at the root', async () => {
    expect(await headingAt('/')).toBe('reely — small TypeScript packages, no dependencies');
  });

  it('opens the dommy page under its own path', async () => {
    expect(await headingAt('/dommy')).toBe('Real DOM. One write per change.');
  });

  it("opens dommy's docs at their first topic and at a topic", async () => {
    expect(await headingAt('/dommy/docs')).toBe('Getting started');
    expect(await headingAt('/dommy/docs/signals')).toBe('Signals');
  });

  it('opens reely evolution at its first step and at a step', async () => {
    expect(await headingAt('/dommy/evolution')).toMatch(/^Step 1\. /);
    expect(await headingAt('/dommy/evolution/jsx')).toMatch(/^Step 2\. /);
  });

  it('opens the memory game under the games', async () => {
    expect(await headingAt('/games/memory')).toBe('Memory game');
  });

  it('opens the page of every package but dommy at its name', async () => {
    expect(await headingAt('/emitter')).toBe('@reely/emitter');
    expect(await headingAt('/simple-store')).toBe('@reely/simple-store');
    expect(await headingAt('/nope')).toBe('There is no page at /nope');
    // the first package page transforms the highlighted source of every demo it shows
  }, 15_000);

  it('opens the labs', async () => {
    const labs = await renderAt('/labs');

    expect(labs.querySelector('header nav [aria-current="true"]')?.textContent).toBe('Labs');
  });

  it('marks the package and the part of its pages a page belongs to', async () => {
    const docs = await renderAt('/dommy/docs/lists');
    const evolution = await renderAt('/dommy/evolution/batch');

    expect(docs.querySelector('header nav [aria-current="true"]')?.textContent).toBe('Packages');
    expect(docs.querySelector('nav[aria-label="@reely/dommy"] [aria-current="true"]')?.textContent).toBe('Docs');
    expect(evolution.querySelector('nav[aria-label="@reely/dommy"] [aria-current="true"]')?.textContent).toBe(
      'Evolution'
    );
  });

  it('takes a pathname with a trailing slash to the same page', async () => {
    expect(await headingAt('/dommy/docs/signals/')).toBe('Signals');
  });

  it('keeps no page at the paths the docs had before they moved under dommy', async () => {
    expect(await headingAt('/docs/signals')).toBe('There is no page at /docs/signals');
  });

  it('answers an unknown URL with a page that says what is missing', async () => {
    const page = await renderAt('/nope/deeper');

    expect(page.querySelector('h1')?.textContent).toBe('There is no page at /nope/deeper');
    expect(page.querySelector('main a[href="/#packages"]')?.textContent).toBe('See the packages');
    expect(page.querySelector('[aria-current]')).toBeNull();
  });
});
