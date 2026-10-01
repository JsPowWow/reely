import { mount } from '@reely/dommy';

import { EvolutionPage } from './evolution.page';
import { evolutionSteps } from './evolution.steps';
import { MutationMeter } from '../../demo/mutation.meter';
import { chooseLocale } from '../../i18n/locale';
import { textsLoaded } from '../../i18n/localized';
import { clickButton, flushMutations } from '../../testing/dom.testing';

// the first-render node count, then text edits, attribute edits, nodes moved, nodes added or removed
const readWrites = (meter: Element): string[] =>
  Array.from(meter.querySelectorAll('figcaption dd')).map((count) => count.textContent ?? '');

const readAnnouncement = (meter: Element): string => meter.querySelector('[aria-live]')?.textContent ?? '';

const renderStep = (slug: string): HTMLElement => {
  const step = evolutionSteps.find((item) => item.slug === slug);
  if (!step) {
    throw new Error(`No "${slug}" step`);
  }
  return MutationMeter({ children: step.Demo() });
};

describe('evolution', () => {
  it('has a unique slug for every step', () => {
    const slugs = evolutionSteps.map((step) => step.slug);

    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('counts the nodes a static step builds once, and no writes after that', async () => {
    const meter = renderStep('factories');
    await flushMutations();

    expect(readWrites(meter)).toEqual(['24', '0', '0', '0', '0']);
    expect(readAnnouncement(meter)).toBe('');
  });

  it('renders the same card from factories, JSX and components', () => {
    const [factories, jsx, components] = ['factories', 'jsx', 'components'].map(
      (slug) => renderStep(slug).querySelector('section')?.outerHTML
    );

    expect(factories).toContain('The first app built on dommy');
    expect(jsx).toBe(factories);
    expect(components).toBe(factories);
  });

  // Every ticket step, after +1, +1, −1 clicked in turn: the first-render node count, then text
  // edits, attribute edits, nodes moved and nodes added or removed, each with the last click's delta.
  describe('ticket steps', () => {
    const clickInTurn = async (meter: Element, labels: readonly string[]): Promise<void> => {
      for (const label of labels) {
        clickButton(meter, label);
        await flushMutations();
      }
    };

    it.each([
      ['signal', ['7', '0', '0', '0', '6+2']],
      ['bind-by-hand', ['7', '0', '0', '0', '6+2']],
      ['bind', ['7', '3+1', '0', '0', '0']],
      ['derived', ['7', '3+1', '3+1', '0', '0']],
      ['getter', ['7', '3+1', '4+1', '0', '0']],
      ['two-signals', ['9', '9+3', '4+1', '0', '0']],
      ['batch', ['9', '6+2', '4+1', '0', '0']],
    ])('step "%s" makes the writes it shows', async (slug, expected) => {
      const meter = renderStep(slug);

      await clickInTurn(meter, ['+1', '+1', '−1']);

      expect(meter.querySelector('output')?.textContent).toBe('1');
      expect(readWrites(meter)).toEqual(expected);
    });

    it('step "bind" updates the one text node it bound, never replacing it', async () => {
      const meter = renderStep('bind');
      const text = meter.querySelector('output')?.firstChild;

      await clickInTurn(meter, ['+1', '+1']);

      expect(meter.querySelector('output')?.firstChild).toBe(text);
      expect(text?.textContent).toBe('2');
    });

    it('step "getter" disables −1 at zero', async () => {
      const meter = renderStep('getter');
      const minus = Array.from(meter.querySelectorAll('button')).find((item) => item.textContent === '−1');

      expect(minus?.disabled).toBe(true);
      await clickInTurn(meter, ['+1']);
      expect(minus?.disabled).toBe(false);
    });
  });

  describe('step "dom"', () => {
    it('counts and replaces the output text node on every click', async () => {
      const meter = renderStep('dom');

      for (const label of ['+1', '+1', '−1']) {
        clickButton(meter, label);
        await flushMutations();
      }

      expect(meter.querySelector('output')?.textContent).toBe('1');
      expect(readWrites(meter)).toEqual(['7', '0', '0', '0', '6+2']);
    });

    it('announces what the last click changed', async () => {
      const meter = renderStep('dom');

      clickButton(meter, '+1');
      await flushMutations();

      expect(readAnnouncement(meter)).toBe('Last change: 2 nodes added or removed. 2 writes since the first render.');
    });

    it('announces every click, even when it changes the same as the last one', async () => {
      const meter = renderStep('dom');

      clickButton(meter, '+1');
      await flushMutations();
      clickButton(meter, '+1');
      await flushMutations();

      expect(readAnnouncement(meter)).toBe('Last change: 2 nodes added or removed. 4 writes since the first render.');
    });
  });

  describe('board steps', () => {
    const rowsOf = (root: Element): HTMLLIElement[] => Array.from(root.querySelectorAll('li'));
    const changeOf = (row: Element): number => Number.parseFloat(row.querySelector('data')?.value ?? 'NaN');
    const readMoves = (meter: Element): number => Number.parseInt(readWrites(meter)[3] ?? '', 10);
    const readNodeWrites = (meter: Element): number => Number.parseInt(readWrites(meter)[4] ?? '', 10);

    it('step "keyed-list" keeps every row and moves fewer rows than a rebuild would', async () => {
      const meter = renderStep('keyed-list');
      const before = rowsOf(meter);

      clickButton(meter, 'Update prices');
      await flushMutations();
      const after = rowsOf(meter);

      expect(before).toHaveLength(8);
      expect(new Set(after)).toEqual(new Set(before));
      expect(after.map(changeOf)).toEqual(after.map(changeOf).toSorted((x, y) => y - x));
      expect(after.map((row) => row.querySelector('b')?.textContent)).toEqual(['1', '2', '3', '4', '5', '6', '7', '8']);
      // rows move; a rebuild would remove and add every row, 16 node writes
      expect(readMoves(meter)).toBeGreaterThan(0);
      expect(readMoves(meter)).toBeLessThan(8);
      expect(readNodeWrites(meter)).toBe(0);
    });

    describe('step "five-hundred"', () => {
      beforeEach(() => {
        vi.useFakeTimers({ toFake: ['setInterval', 'clearInterval'] });
      });
      afterEach(() => {
        vi.useRealTimers();
        document.body.replaceChildren();
      });

      // a radio or a checkbox changes on click only while it is in the document
      const renderConnected = (): HTMLElement => {
        const meter = renderStep('five-hundred');
        document.body.append(meter);
        return meter;
      };

      const findButton = (root: Element, label: string): HTMLButtonElement | undefined =>
        Array.from(root.querySelectorAll('button')).find((item) => item.textContent === label);
      const findField = (root: Element, label: string): HTMLInputElement | undefined =>
        Array.from(root.querySelectorAll('label'))
          .find((item) => item.textContent?.includes(label))
          ?.querySelector('input') ?? undefined;
      const updateOf = (root: Element): string =>
        Array.from(root.querySelectorAll('p')).find((item) => item.textContent?.startsWith('Update '))?.textContent ??
        '';
      const readoutOf = (root: Element, label: string): string =>
        Array.from(root.querySelectorAll('dt')).find((item) => item.textContent === label)?.nextElementSibling
          ?.textContent ?? '';

      it('ranks five hundred stocks, moving the rows it keeps', async () => {
        const meter = renderStep('five-hundred');
        const before = new Set(rowsOf(meter));

        clickButton(meter, 'Start');
        vi.advanceTimersToNextTimer();
        vi.advanceTimersToNextTimer();
        await flushMutations();

        expect(before.size).toBe(500);
        expect(updateOf(meter)).toBe('Update 2');
        expect(readoutOf(meter, 'Last update')).toMatch(/ms$/);
        // two updates say nothing about a percentile yet
        expect(readoutOf(meter, '95th percentile')).toBe('–');
        expect(new Set(rowsOf(meter))).toEqual(before);
        expect(findButton(meter, 'Stop')).toBeDefined();
      });

      it('builds every row again when the keys change every update, and writes more nodes than moving them', async () => {
        const moving = renderConnected();
        const rebuilding = renderConnected();
        findField(rebuilding, 'New keys every update')?.click();
        const before = rowsOf(rebuilding);

        for (const meter of [moving, rebuilding]) {
          clickButton(meter, 'Start');
        }
        vi.advanceTimersToNextTimer();
        await flushMutations();

        expect(rowsOf(rebuilding).some((row) => before.includes(row))).toBe(false);
        expect(readNodeWrites(rebuilding)).toBe(1000);
        expect(readNodeWrites(moving)).toBeLessThan(1000);
      });

      it('times each key mode on its own, and gives a median once 20 updates are timed', () => {
        const meter = renderConnected();
        clickButton(meter, 'Start');
        for (let update = 0; update < 20; update++) {
          vi.advanceTimersToNextTimer();
        }
        const medianOf20 = readoutOf(meter, 'Median');

        findField(meter, 'New keys every update')?.click();

        expect(medianOf20).toMatch(/ms$/);
        expect(readoutOf(meter, 'Median')).toBe('–');
      });

      it('changes the market size between runs', () => {
        const meter = renderConnected();

        findField(meter, '100')?.click();

        expect(rowsOf(meter)).toHaveLength(100);
      });

      it('stops updating when stopped, and when the page is taken down', () => {
        const host = document.createElement('div');
        const dispose = mount(host, () => renderStep('five-hundred'));
        clickButton(host, 'Start');
        vi.advanceTimersToNextTimer();
        clickButton(host, 'Stop');
        vi.advanceTimersToNextTimer();
        const afterStop = updateOf(host);
        clickButton(host, 'Start');

        dispose();

        expect(afterStop).toBe('Update 1');
        expect(vi.getTimerCount()).toBe(0);
      });
    });
  });

  describe('EvolutionPage', () => {
    // the accessible name of the source listing, from the caption it is labelled by
    const sourceName = (page: Element): string => {
      const ids = page.querySelector('pre')?.getAttribute('aria-labelledby')?.split(' ') ?? [];
      return ids.map((id) => page.querySelector(`#${id}`)?.textContent).join('. ');
    };

    const renderPage = (slug?: string): Element => {
      const host = document.createElement('div');
      host.append(EvolutionPage({ slug }));
      return host;
    };

    it('shows the first step by default and marks it as current', () => {
      const page = renderPage();

      expect(page.querySelector('h1')?.textContent).toBe('Step 1. Markup with tag factories');
      expect(page.querySelector('nav a[href="/dommy/evolution/factories"]')?.getAttribute('aria-current')).toBe('step');
    });

    it('diffs a step against the previous step of the same demo and says so', () => {
      const jsx = renderPage('jsx');
      const dom = renderPage('dom');

      expect(sourceName(jsx)).toBe('Source. Highlighted: new since step 1');
      expect(jsx.querySelectorAll('pre ins').length).toBeGreaterThan(0);
      expect(sourceName(dom)).toBe('Source. A new demo starts here');
      expect(dom.querySelectorAll('pre ins')).toHaveLength(0);
    });

    it('ends the chain with the way into the docs instead of a next step', () => {
      const last = renderPage(evolutionSteps.at(-1)?.slug);

      expect(last.querySelector('a[rel="next"]')).toBeNull();
      expect(last.querySelector('footer h2')?.textContent).toBe('Where to go from here');
      expect(last.querySelector('footer a[href="/dommy/docs"]')?.textContent).toBe('Read the docs');
    });

    it('names the step in the document title', () => {
      renderPage('jsx');

      expect(document.title).toBe('Step 2. The same markup in JSX | reely evolution');
    });

    it('speaks Russian once it is chosen, and keeps the demo as the reader left it', async () => {
      const host = document.createElement('div');
      const dispose = mount(host, () => <EvolutionPage slug='bind' />);
      clickButton(host, '+1');
      const output = host.querySelector('output');

      chooseLocale('ru');
      await textsLoaded();

      expect(host.querySelector('h1')?.textContent).toBe('Шаг 7. Привязка сигнала');
      expect(sourceName(host)).toBe('Исходный код. Подсвечено: новое с шага 6');
      expect(host.querySelector('a[rel="next"]')?.textContent).toBe('Дальше: Производные значения');
      expect(document.title).toBe('Шаг 7. Привязка сигнала | эволюция reely');
      expect(host.querySelector('output')).toBe(output);
      expect(output?.textContent).toBe('1');

      chooseLocale('en');
      dispose();
    });

    it('explains an unknown step and links to the first one instead of rendering a demo', () => {
      const page = renderPage('nope');

      expect(page.querySelector('h1')?.textContent).toBe('There is no step “nope”');
      expect(page.querySelector('main a[href="/dommy/evolution/factories"]')?.textContent).toBe('Start with step 1');
      expect(page.querySelector('figure')).toBeNull();
      expect(document.title).toBe('Not found | reely');
    });
  });
});
