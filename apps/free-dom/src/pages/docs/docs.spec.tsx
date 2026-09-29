import { mount } from '@reely/dommy';

import { clickButton } from '../../testing/dom.testing';
import { DeliveryTracker } from './demos/delivery.tracker';
import { ExchangeRate, quoteDelay } from './demos/exchange.rate';
import { StopwatchSlot } from './demos/stopwatch';
import { DocsPage } from './docs.page';
import { docTopics } from './docs.topics';

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

      expect(page.querySelector('figure button')?.textContent).toBe('Next stop');
      expect(page.querySelector('pre')?.textContent).toContain('<Show');
      expect(page.querySelector('pre')?.textContent).toContain('when={deliveredAt}');
      expect(page.querySelector('article h2')?.textContent).toBe('The props');
    });

    it('answers the advanced topics with a live demo each, under the headings of VanJS', () => {
      const page = renderPage('advanced');
      const headings = Array.from(page.querySelectorAll('article h2'), (heading) => heading.textContent);

      expect(page.querySelectorAll('figure')).toHaveLength(7);
      expect(headings).toEqual([
        'Conditional bindings',
        'DOM attributes vs. properties',
        'Why can’t a signal hold a DOM node?',
        'Signal granularity',
        'The scope of DOM updates',
        'Advanced state derivation',
        'Self-referencing in effects',
        'Releasing bindings',
        'Lifecycle hooks',
      ]);
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
      host.append(<DeliveryTracker />);
      return host;
    };

    it('updates the stops inside the shown branch without rebuilding it', () => {
      const demo = renderDemo();
      const branch = demo.querySelector('p');

      clickButton(demo, 'Next stop');

      expect(branch?.textContent).toBe('Out for delivery, 4 stops away');
      expect(demo.querySelector('p')).toBe(branch);
    });

    it('stops at the last stop before the door', () => {
      const demo = renderDemo();

      for (let stop = 0; stop < 4; stop++) {
        clickButton(demo, 'Next stop');
      }

      expect(demo.querySelector('p')?.textContent).toBe('Out for delivery, 2 stops away');
      expect(Array.from(demo.querySelectorAll('button')).find((item) => item.textContent === 'Next stop')?.disabled).toBe(true);
    });

    it('swaps the branch when the parcel is delivered, and back for another', () => {
      const demo = renderDemo();

      clickButton(demo, 'Next stop');
      clickButton(demo, 'Deliver');
      const delivered = demo.querySelector('p')?.textContent;
      clickButton(demo, 'Send another');

      expect(delivered).toBe('Delivered at 14:32');
      expect(demo.querySelector('p')?.textContent).toBe('Out for delivery, 5 stops away');
    });
  });

  describe('demo "async"', () => {
    const shown = (root: Element): string | null | undefined => root.querySelector('p')?.textContent;

    beforeEach(() => {
      vi.useFakeTimers();
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('shows the bank at work, then the rate', async () => {
      const host = document.createElement('div');
      const dispose = mount(host, () => <ExchangeRate />);
      const idle = shown(host);

      clickButton(host, 'Refresh the rate');
      const asking = shown(host);
      await vi.advanceTimersByTimeAsync(quoteDelay);

      expect([idle, asking, shown(host)]).toEqual([
        'EUR to USD: not loaded yet',
        'Asking the bank…',
        '1 EUR = 1.084 USD',
      ]);
      dispose();
    });

    it('drops the request a newer one replaced, shows a failed request, and the retry', async () => {
      const host = document.createElement('div');
      const dispose = mount(host, () => <ExchangeRate />);

      clickButton(host, 'Refresh the rate');
      await vi.advanceTimersByTimeAsync(quoteDelay);
      clickButton(host, 'Refresh the rate');
      clickButton(host, 'Refresh the rate');
      await vi.advanceTimersByTimeAsync(quoteDelay);
      const failed = shown(host);
      clickButton(host, 'Refresh the rate');
      await vi.advanceTimersByTimeAsync(quoteDelay);

      expect(failed).toBe('The bank timed out. Refresh again.');
      expect(shown(host)).toBe('1 EUR = 1.089 USD');
      expect(host.querySelectorAll('p')).toHaveLength(1);
      dispose();
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
      const dispose = mount(host, () => <StopwatchSlot />);

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
      const dispose = mount(host, () => <StopwatchSlot />);

      clickButton(host, 'Mount a stopwatch');
      dispose();

      expect(vi.getTimerCount()).toBe(0);
    });
  });
});
