import { mount } from '@reely/dommy';
import { isInstanceOf } from '@reely/utils';

import { MutationMeter } from './mutation.meter';
import { SourceView } from './source.view';
import { TutorialPage } from './tutorial.page';
import { tutorialSteps } from './tutorial.steps';

import type { SourceLines } from '../../highlight/source.types';

const flushMutations = (): Promise<void> => new Promise((resolve) => setTimeout(resolve));

const clickButton = (root: Element, label: string): void => {
  const button = Array.from(root.querySelectorAll('button')).find((item) => item.textContent === label);
  if (!button) {
    throw new Error(`No "${label}" button`);
  }
  button.click();
};

// the first-render node count, then text edits, attribute edits, nodes added or removed
const readWrites = (meter: Element): string[] =>
  Array.from(meter.querySelectorAll('figcaption dd')).map((count) => count.textContent ?? '');

const readAnnouncement = (meter: Element): string => meter.querySelector('[aria-live]')?.textContent ?? '';

const renderStep = (slug: string): HTMLElement => {
  const step = tutorialSteps.find((item) => item.slug === slug);
  if (!step) {
    throw new Error(`No "${slug}" step`);
  }
  return MutationMeter({ children: step.Demo() });
};

describe('tutorial', () => {
  it('has a unique slug for every step', () => {
    const slugs = tutorialSteps.map((step) => step.slug);

    expect(new Set(slugs).size).toBe(slugs.length);
  });

  it('counts the nodes a static step builds once, and no writes after that', async () => {
    const meter = renderStep('factories');
    await flushMutations();

    expect(readWrites(meter)).toEqual(['24', '0', '0', '0']);
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

  // Every counter step, after +1, +1, −1 clicked in turn: the first-render node count, then text
  // edits, attribute edits and nodes added or removed, each with the last click's delta.
  describe('counter steps', () => {
    const clickInTurn = async (meter: Element, labels: readonly string[]): Promise<void> => {
      for (const label of labels) {
        clickButton(meter, label);
        await flushMutations();
      }
    };

    it.each([
      ['signal', ['7', '0', '0', '6+2']],
      ['bind-by-hand', ['7', '0', '0', '6+2']],
      ['bind', ['7', '3+1', '0', '0']],
      ['derived', ['7', '3+1', '3+1', '0']],
      ['getter', ['7', '3+1', '4+1', '0']],
      ['two-signals', ['9', '9+3', '4+1', '0']],
      ['batch', ['9', '6+2', '4+1', '0']],
    ])('step "%s" makes the writes its lesson is about', async (slug, expected) => {
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
      expect(readWrites(meter)).toEqual(['7', '0', '0', '6+2']);
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
    const distanceOf = (row: Element): number => Number.parseFloat(row.querySelector('data')?.value ?? 'NaN');
    const readNodeWrites = (meter: Element): number => Number.parseInt(readWrites(meter)[3] ?? '', 10);

    it('step "keyed-list" keeps every row and moves fewer rows than a rebuild would', async () => {
      const meter = renderStep('keyed-list');
      const before = rowsOf(meter);

      clickButton(meter, 'Race a lap');
      await flushMutations();
      const after = rowsOf(meter);

      expect(before).toHaveLength(8);
      expect(new Set(after)).toEqual(new Set(before));
      expect(after.map(distanceOf)).toEqual(after.map(distanceOf).toSorted((x, y) => y - x));
      expect(after.map((row) => row.querySelector('b')?.textContent)).toEqual(['1', '2', '3', '4', '5', '6', '7', '8']);
      expect(readNodeWrites(meter)).toBeGreaterThan(0);
      // a rebuild removes and adds every row: 16 node writes
      expect(readNodeWrites(meter)).toBeLessThan(16);
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
        Array.from(root.querySelectorAll('label')).find((item) => item.textContent?.includes(label))?.querySelector('input') ??
        undefined;
      const lapOf = (root: Element): string =>
        Array.from(root.querySelectorAll('p')).find((item) => item.textContent?.startsWith('Lap '))?.textContent ?? '';
      const readoutOf = (root: Element, label: string): string =>
        Array.from(root.querySelectorAll('dt')).find((item) => item.textContent === label)?.nextElementSibling?.textContent ?? '';

      it('races five hundred rows, moving the rows it keeps', async () => {
        const meter = renderStep('five-hundred');
        const before = new Set(rowsOf(meter));

        clickButton(meter, 'Start');
        vi.advanceTimersToNextTimer();
        vi.advanceTimersToNextTimer();
        await flushMutations();

        expect(before.size).toBe(500);
        expect(lapOf(meter)).toBe('Lap 2');
        expect(readoutOf(meter, 'Last lap')).toMatch(/ms$/);
        // two laps say nothing about a percentile yet
        expect(readoutOf(meter, '95th percentile')).toBe('–');
        expect(new Set(rowsOf(meter))).toEqual(before);
        expect(findButton(meter, 'Stop')).toBeDefined();
      });

      it('builds every row again when the keys change every lap, and writes more nodes than moving them', async () => {
        const moving = renderConnected();
        const rebuilding = renderConnected();
        findField(rebuilding, 'New keys every lap')?.click();
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

      it('times each key mode on its own, and gives a median once 20 laps are timed', () => {
        const meter = renderConnected();
        clickButton(meter, 'Start');
        for (let lap = 0; lap < 20; lap++) {
          vi.advanceTimersToNextTimer();
        }
        const medianOf20 = readoutOf(meter, 'Median');

        findField(meter, 'New keys every lap')?.click();

        expect(medianOf20).toMatch(/ms$/);
        expect(readoutOf(meter, 'Median')).toBe('–');
      });

      it('changes the field size between races', () => {
        const meter = renderConnected();

        findField(meter, '100')?.click();

        expect(rowsOf(meter)).toHaveLength(100);
      });

      it('stops racing when stopped, and when the page is taken down', () => {
        const host = document.createElement('div');
        const dispose = mount(host, () => renderStep('five-hundred'));
        clickButton(host, 'Start');
        vi.advanceTimersToNextTimer();
        clickButton(host, 'Stop');
        vi.advanceTimersToNextTimer();
        const afterStop = lapOf(host);
        clickButton(host, 'Start');

        dispose();

        expect(afterStop).toBe('Lap 1');
        expect(vi.getTimerCount()).toBe(0);
      });
    });
  });

  describe('MutationMeter', () => {
    afterEach(() => {
      Reflect.deleteProperty(Element.prototype, 'animate');
    });

    it('flashes the rows a lap moved, not the list that holds them', async () => {
      const animate = vi.fn();
      Element.prototype.animate = animate;
      const meter = renderStep('keyed-list');

      clickButton(meter, 'Race a lap');
      await flushMutations();
      const flashed = new Set<unknown>(animate.mock.contexts);

      expect(flashed.has(meter.querySelector('ol'))).toBe(false);
      expect([...flashed].some((element) => isInstanceOf(HTMLLIElement, element))).toBe(true);
    });

    it('flashes the nodes a small change touched, and leaves a large change to the counts', async () => {
      const animate = vi.fn();
      Element.prototype.animate = animate;
      const small = renderStep('bind');
      const large = renderStep('keyed-list');

      clickButton(small, '+1');
      await flushMutations();
      const flashedForSmall = animate.mock.calls.length;
      animate.mockClear();
      for (let lap = 0; lap < 12; lap++) {
        clickButton(large, 'Race a lap');
      }
      await flushMutations();

      expect(flashedForSmall).toBe(1);
      expect(animate).not.toHaveBeenCalled();
    });
  });

  describe('SourceView', () => {
    // a source without colors, one token per line
    const plain = (text: string): SourceLines => text.split('\n').map((line) => [{ content: line }]);

    it('marks lines that the previous step did not have', () => {
      const view = SourceView({
        source: plain('const a = 1;\nconst b = 2;'),
        previous: { source: plain('const a = 1;'), number: 1 },
      });

      expect(Array.from(view.querySelectorAll('ins')).map((line) => line.textContent)).toEqual(['const b = 2;\n']);
    });

    it('marks structural lines too, by a line diff rather than a lookup', () => {
      const view = SourceView({
        source: plain('run(() => {\n  one();\n});\nrun(() => {\n  two();\n});'),
        previous: { source: plain('run(() => {\n  one();\n});'), number: 1 },
      });

      expect(Array.from(view.querySelectorAll('ins')).map((line) => line.textContent)).toEqual([
        'run(() => {\n',
        '  two();\n',
        '});\n',
      ]);
    });

    it('marks blank lines inside an inserted block, but not around it', () => {
      const view = SourceView({
        source: plain('const a = 1;\n\nconst b = 2;\n\nconst c = 3;'),
        previous: { source: plain('const a = 1;\n'), number: 1 },
      });

      expect(Array.from(view.querySelectorAll('ins')).map((line) => line.textContent)).toEqual([
        'const b = 2;\n',
        '\n',
        'const c = 3;\n',
      ]);
    });

    it('colors each token with its theme color', () => {
      const view = SourceView({
        source: [[{ content: 'const', color: '#9CC3FF' }, { content: ' count = 0;' }]],
      });
      const [keyword, rest] = Array.from(view.querySelectorAll('code span span'));

      expect(keyword?.textContent).toBe('const');
      expect(isInstanceOf(HTMLElement, keyword) && keyword.style.color).toBe('rgb(156, 195, 255)');
      expect(rest?.textContent).toBe(' count = 0;');
    });

    it('marks nothing for the first step', () => {
      const view = SourceView({ source: plain('const a = 1;') });

      expect(view.querySelectorAll('ins')).toHaveLength(0);
    });
  });

  describe('TutorialPage', () => {
    // the accessible name of the source listing, from the caption it is labelled by
    const sourceName = (page: Element): string => {
      const ids = page.querySelector('pre')?.getAttribute('aria-labelledby')?.split(' ') ?? [];
      return ids.map((id) => page.querySelector(`#${id}`)?.textContent).join('. ');
    };

    const renderPage = (slug?: string): Element => {
      const page = TutorialPage({ slug });
      if (!(page instanceof Element)) {
        throw new Error('The page is not an element');
      }
      return page;
    };

    it('shows the first step by default and marks it as current', () => {
      const page = renderPage();

      expect(page.querySelector('h1')?.textContent).toBe(`Step 1. ${tutorialSteps[0]?.title}`);
      expect(page.querySelector('nav a[href="/tutorial/factories"]')?.getAttribute('aria-current')).toBe('step');
    });

    it('diffs a step against the previous step of the same demo and says so', () => {
      const jsx = renderPage('jsx');
      const dom = renderPage('dom');

      expect(sourceName(jsx)).toBe('Source. Highlighted: new since step 1');
      expect(jsx.querySelectorAll('pre ins').length).toBeGreaterThan(0);
      expect(sourceName(dom)).toBe('Source. A new demo starts here');
      expect(dom.querySelectorAll('pre ins')).toHaveLength(0);
    });

    it('ends the course with what comes next instead of a next step', () => {
      const last = renderPage(tutorialSteps.at(-1)?.slug);

      expect(last.querySelector('a[rel="next"]')).toBeNull();
      expect(last.querySelector('footer h2')?.textContent).toBe('What comes next');
      expect(last.querySelector('footer a[href="https://github.com/JsPowWow/reely"]')).not.toBeNull();
    });

    it('names the step in the document title', () => {
      renderPage('jsx');

      expect(document.title).toBe('Step 2. The same markup in JSX | reely');
    });

    it('explains an unknown step and links to the first one instead of rendering a demo', () => {
      const page = renderPage('nope');

      expect(page.querySelector('h1')?.textContent).toBe('There is no step “nope”');
      expect(page.querySelector('main a[href="/tutorial/factories"]')?.textContent).toBe('Start with step 1');
      expect(page.querySelector('figure')).toBeNull();
      expect(document.title).toBe('Not found | reely');
    });
  });
});
