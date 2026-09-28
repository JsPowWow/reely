import { MutationMeter } from './mutation.meter';
import { SourceView } from './source.view';
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

    it('marks nothing for the first step', () => {
      const view = SourceView({ source: 'const a = 1;' });

      expect(view.querySelectorAll('ins')).toHaveLength(0);
    });
  });
});
