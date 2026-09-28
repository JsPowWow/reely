import { mount } from '@reely/dommy';

import { LandingPage } from './landing.page';
import { lapSectors } from './landing.sectors';

const clickButton = (root: Element, label: string): void => {
  const button = Array.from(root.querySelectorAll('button')).find((item) => item.textContent === label);
  if (!button) {
    throw new Error(`No "${label}" button`);
  }
  button.click();
};

describe('LandingPage', () => {
  let host: HTMLElement;
  let dispose: VoidFunction;

  beforeEach(() => {
    host = document.createElement('div');
    dispose = mount(host, () => <LandingPage />);
  });

  afterEach(() => dispose());

  it('says what reely is and leads into the docs', () => {
    expect(host.querySelector('h1')?.textContent).toBe('Real DOM. One write per change.');
    expect(host.querySelector('main a[href="/docs"]')?.textContent).toBe('Open the docs');
    expect(host.querySelector('main code')?.textContent).toBe('npm i @reely/dommy@next');
  });

  it('says that the site itself is built with reely', () => {
    expect(host.textContent).toContain('This site is built with reely');
  });

  it('drives the lap: a sector per claim, each with its live demo and source, then the finish', () => {
    const sectors = lapSectors.map(({ id }) => host.querySelector(`section#${id}`));
    const bar = Array.from(host.querySelectorAll('nav[aria-label="The lap"] a')).map((link) =>
      link.getAttribute('href')
    );

    expect(sectors.every((sector) => sector?.querySelector('figure') && sector.querySelector('pre'))).toBe(true);
    expect(bar).toEqual(['#markup', '#signals', '#lists', '#finish']);
    expect(host.querySelector('section#finish td')?.textContent).toBe('1.3 kB');
  });

  it('runs every sector demo live', () => {
    const signals = host.querySelector('section#signals');
    const lists = host.querySelector('section#lists');
    if (!signals || !lists) {
      throw new Error('No sectors');
    }
    const leader = lists.querySelector('li');

    clickButton(signals, 'Complete a lap');
    clickButton(lists, 'Race a lap');

    expect(signals.querySelector('output')?.textContent).toBe('1');
    expect(signals.textContent).toContain('4 laps to go');
    expect(lists.textContent).toContain('Lap 1');
    expect(lists.querySelectorAll('li')).toHaveLength(5);
    expect(lists.querySelector('li')).not.toBe(leader);
  });
});
