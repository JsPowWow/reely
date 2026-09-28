import { MutationMeter } from './mutation.meter';
import { SourceView } from './source.view';
import { TutorialPage } from './tutorial.page';
import { tutorialSteps } from './tutorial.steps';

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
      ['bind', ['7', '3+1', '0', '0']],
      ['derived', ['7', '3+1', '4+1', '0']],
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

    it('step "derived" disables −1 at zero', async () => {
      const meter = renderStep('derived');
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

  describe('SourceView', () => {
    it('marks lines that the previous step did not have', () => {
      const view = SourceView({
        source: 'const a = 1;\nconst b = 2;',
        previous: { source: 'const a = 1;', number: 1 },
      });

      expect(Array.from(view.querySelectorAll('ins')).map((line) => line.textContent)).toEqual(['const b = 2;\n']);
    });

    it('marks structural lines too, by a line diff rather than a lookup', () => {
      const view = SourceView({
        source: 'run(() => {\n  one();\n});\nrun(() => {\n  two();\n});',
        previous: { source: 'run(() => {\n  one();\n});', number: 1 },
      });

      expect(Array.from(view.querySelectorAll('ins')).map((line) => line.textContent)).toEqual([
        'run(() => {\n',
        '  two();\n',
        '});\n',
      ]);
    });

    it('marks blank lines inside an inserted block, but not around it', () => {
      const view = SourceView({
        source: 'const a = 1;\n\nconst b = 2;\n\nconst c = 3;',
        previous: { source: 'const a = 1;\n', number: 1 },
      });

      expect(Array.from(view.querySelectorAll('ins')).map((line) => line.textContent)).toEqual([
        'const b = 2;\n',
        '\n',
        'const c = 3;\n',
      ]);
    });

    it('marks nothing for the first step', () => {
      const view = SourceView({ source: 'const a = 1;' });

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
