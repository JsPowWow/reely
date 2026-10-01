import { mount } from '@reely/dommy';
import { noop } from '@reely/utils';

import { PackagePage } from './package.page';
import { chooseLocale } from '../../i18n/locale';
import { textsLoaded } from '../../i18n/localized';
import { pagedPackages } from '../../site/site.packages';
import { clickButton, tick } from '../../testing/dom.testing';

import type { PagedPackage } from '../../site/site.packages';

describe('PackagePage', () => {
  let host: HTMLElement;
  let dispose: VoidFunction = noop;

  const open = (name: PagedPackage): void => {
    host = document.createElement('div');
    dispose = mount(host, () => <PackagePage name={name} />);
  };

  afterEach(() => {
    dispose();
    chooseLocale('en');
    vi.restoreAllMocks();
  });

  it.each(pagedPackages)('gives @reely/%s its name, install line, facts, a live example and its source', (name) => {
    open(name);

    expect(host.querySelector('h1')?.textContent).toBe(`@reely/${name}`);
    expect(host.querySelector('code')?.textContent).toBe(`npm i @reely/${name}`);
    expect(host.querySelector('dd')?.textContent).toMatch(/^\d+\.\d+\.\d+$/);
    expect(host.querySelector('figure > div > *')).not.toBeNull();
    expect(host.querySelector('[id^="source-caption-"]')?.textContent).toMatch(/\.tsx$/);
    expect(document.title).toBe(`@reely/${name} | reely`);
  });

  it('links the packages it is built on to their pages, and its README and npm page', () => {
    open('state-machine');

    const links = Array.from(host.querySelectorAll('dd a'), (link) => link.getAttribute('href'));

    expect(links).toEqual(['/basics', '/emitter', '/queue']);
    expect(host.querySelector('a[href="https://github.com/JsPowWow/reely/tree/main/packages/state-machine#readme"]'))
      .not.toBeNull();
    expect(host.querySelector('a[href="https://www.npmjs.com/package/@reely/state-machine"]')).not.toBeNull();
  });

  it('echoes under the logger example what reached the console, and gives the console back on leaving', () => {
    const info = vi.spyOn(console, 'info').mockImplementation(noop);
    open('logger');
    tick(host);

    clickButton(host, 'Restore the cart');
    const echoed = host.querySelector('[data-console]')?.textContent;
    dispose();

    expect(echoed).toContain('[[checkout]]\t cart restored {"items":2}');
    expect(console.info).toBe(info);
  });

  it('lists the values a package exports', () => {
    open('basics');

    const exported = Array.from(host.querySelectorAll('li > code'), (name) => name.textContent);

    expect(exported).toEqual(expect.arrayContaining(['forEachSettled', 'hasSome', 'messageOf']));
  });

  it('speaks Russian once it is chosen', async () => {
    open('queue');

    chooseLocale('ru');
    await textsLoaded();

    expect(host.querySelector('h2')?.textContent).toBe('Две бригады, пять машин');
  });
});
