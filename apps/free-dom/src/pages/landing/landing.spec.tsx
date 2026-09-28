import { mount } from '@reely/dommy';

import { clickButton, flushMutations } from '../../testing/dom.testing';
import { pitStopDelay } from '../docs/demos/pit.stop';
import { LandingPage } from './landing.page';
import { lapSectors } from './landing.sectors';

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
    expect(bar).toEqual(['#markup', '#signals', '#lists', '#async', '#finish']);
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

  it('shows on the board the split the lists sector claims for lap 1', async () => {
    const lists = host.querySelector('section#lists');
    if (!lists) {
      throw new Error('No lists sector');
    }
    await flushMutations();

    clickButton(lists, 'Race a lap');
    await flushMutations();
    // the first-render node count, then text edits, attribute edits, nodes added or removed
    const [, text, attributes, nodes] = Array.from(lists.querySelectorAll('figcaption dd')).map(
      (count) => count.firstChild?.textContent
    );

    expect([text, attributes, nodes]).toEqual(['10', '0', '4']);
    expect(lists.querySelector('header')?.textContent).toContain('2 rows moved');
  });

  describe('the async sector', () => {
    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('shows on the board the split it claims for a stop after the first', async () => {
      const pits = host.querySelector('section#async');
      if (!pits) {
        throw new Error('No async sector');
      }
      const nodeWrites = (): number => Number(pits.querySelectorAll('figcaption dd')[3]?.firstChild?.textContent);
      // the crew's timer and the mutation reports both run on the fake clock
      const stop = async (): Promise<void> => {
        clickButton(pits, 'Box, box');
        await vi.advanceTimersByTimeAsync(pitStopDelay);
      };

      await stop();
      const afterFirst = nodeWrites();
      await stop();

      expect(nodeWrites() - afterFirst).toBe(4);
      expect(pits.querySelector('header')?.textContent).toContain('4 nodes a stop');
    });
  });
});

