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

const readWrites = (meter: Element): string[] =>
  Array.from(meter.querySelectorAll('figcaption b')).map((count) => count.textContent ?? '');

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

  it('renders the same card from factories, JSX and components', () => {
    const [factories, jsx, components] = ['factories', 'jsx', 'components'].map(
      (slug) => renderStep(slug).querySelector('section')?.outerHTML
    );

    expect(factories).toContain('Everything is in there');
    expect(jsx).toBe(factories);
    expect(components).toBe(factories);
  });

  describe('step "dom"', () => {
    it('counts and replaces the output text node on every click', async () => {
      const meter = renderStep('dom');

      clickButton(meter, '+1');
      clickButton(meter, '+1');
      clickButton(meter, '−1');
      await flushMutations();

      expect(meter.querySelector('output')?.textContent).toBe('1');
      // text edits, attribute edits, nodes added or removed
      expect(readWrites(meter)).toEqual(['0', '0', '6']);
    });
  });

  describe('SourceView', () => {
    it('marks lines that the previous step did not have', () => {
      const view = SourceView({ source: 'const a = 1;\nconst b = 2;', previous: 'const a = 1;' });

      expect(Array.from(view.querySelectorAll('ins')).map((line) => line.textContent)).toEqual(['const b = 2;\n']);
    });

    it('marks structural lines too, by a line diff rather than a lookup', () => {
      const view = SourceView({
        source: 'run(() => {\n  one();\n});\nrun(() => {\n  two();\n});',
        previous: 'run(() => {\n  one();\n});',
      });

      expect(Array.from(view.querySelectorAll('ins')).map((line) => line.textContent)).toEqual([
        'run(() => {\n',
        '  two();\n',
        '});\n',
      ]);
    });

    it('marks nothing for the first step', () => {
      const view = SourceView({ source: 'const a = 1;' });

      expect(view.querySelectorAll('ins')).toHaveLength(0);
    });
  });

  describe('TutorialPage', () => {
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

    it('explains an unknown step instead of rendering a demo', () => {
      const page = renderPage('nope');

      expect(page.querySelector('h1')?.textContent).toBe('There is no step “nope”');
      expect(page.querySelector('figure')).toBeNull();
    });
  });
});
