import { mount } from '@reely/dommy';

import { LapClock } from './demos/lap.clock';
import { RaceFinish } from './demos/race.finish';
import { DocsPage } from './docs.page';
import { docTopics } from './docs.topics';

const clickButton = (root: Element, label: string): void => {
  const button = Array.from(root.querySelectorAll('button')).find((item) => item.textContent === label);
  if (!button) {
    throw new Error(`No "${label}" button`);
  }
  button.click();
};

const renderPage = (slug?: string): Element => {
  const host = document.createElement('div');
  host.append(DocsPage({ slug }));
  return host;
};

describe('docs', () => {
  it('has a unique slug for every topic', () => {
    const slugs = docTopics.map((topic) => topic.slug);

    expect(new Set(slugs).size).toBe(slugs.length);
  });

  describe('DocsPage', () => {
    it('opens at getting started and marks it as the current topic', () => {
      const page = renderPage();

      expect(page.querySelector('h1')?.textContent).toBe('Getting started');
      expect(page.querySelector('nav a[href="/docs/getting-started"]')?.getAttribute('aria-current')).toBe('page');
      expect(document.title).toBe('Getting started | reely docs');
    });

    it('shows a topic with its live demo, its source and its details', () => {
      const page = renderPage('conditions');

      expect(page.querySelector('figure button')?.textContent).toBe('Next lap');
      expect(page.querySelector('pre')?.textContent).toContain('<Show when={winner}');
      expect(page.querySelector('article h2')?.textContent).toBe('The props');
    });

    it('links the neighbouring topics, and ends with reely evolution', () => {
      const signals = renderPage('signals');
      const last = renderPage(docTopics.at(-1)?.slug);

      expect(signals.querySelector('a[rel="prev"]')?.getAttribute('href')).toBe('/docs/components');
      expect(signals.querySelector('a[rel="next"]')?.getAttribute('href')).toBe('/docs/bindings');
      expect(last.querySelector('a[rel="next"]')).toBeNull();
      expect(last.querySelector('footer a[href="/evolution"]')).not.toBeNull();
    });

    it('explains an unknown topic and links to the first one instead of rendering a demo', () => {
      const page = renderPage('nope');

      expect(page.querySelector('h1')?.textContent).toBe('There is no topic “nope”');
      expect(page.querySelector('main a[href="/docs/getting-started"]')).not.toBeNull();
      expect(page.querySelector('figure')).toBeNull();
    });
  });

  describe('demo "conditions"', () => {
    const renderDemo = (): Element => {
      const host = document.createElement('div');
      host.append(<RaceFinish />);
      return host;
    };

    it('updates the lap inside the shown branch without rebuilding it', () => {
      const demo = renderDemo();
      const branch = demo.querySelector('p');

      clickButton(demo, 'Next lap');

      expect(branch?.textContent).toBe('Racing, lap 2');
      expect(demo.querySelector('p')).toBe(branch);
    });

    it('swaps the branch when the race finishes, and back on restart', () => {
      const demo = renderDemo();

      clickButton(demo, 'Finish');
      const finished = demo.querySelector('p')?.textContent;
      clickButton(demo, 'Restart');

      expect(finished).toBe('Winner: Car 3');
      expect(demo.querySelector('p')?.textContent).toBe('Racing, lap 1');
    });
  });

  describe('demo "lifecycle"', () => {
    const timers = (root: Element): string | undefined => root.querySelector('p')?.textContent?.split(': ')[1];

    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('runs the stopwatch while it is mounted, and stops its timer on unmount', () => {
      const host = document.createElement('div');
      const dispose = mount(host, () => <LapClock />);

      clickButton(host, 'Mount a stopwatch');
      vi.advanceTimersByTime(1000);
      const shown = host.querySelector('output')?.textContent;
      const running = timers(host);
      clickButton(host, 'Stop and unmount');

      expect(shown).toBe('1.0');
      expect(running).toBe('1');
      expect(timers(host)).toBe('0');
      expect(host.querySelector('output')).toBeNull();
      expect(vi.getTimerCount()).toBe(0);
      dispose();
    });

    it('stops a running stopwatch when the page is taken down', () => {
      const host = document.createElement('div');
      const dispose = mount(host, () => <LapClock />);

      clickButton(host, 'Mount a stopwatch');
      dispose();

      expect(vi.getTimerCount()).toBe(0);
    });
  });
});
