import { isInstanceOf } from '@reely/utils';

import { evolutionSteps } from '../pages/evolution/evolution.steps';
import { MutationMeter } from './mutation.meter';
import { SourceView } from './source.view';

import type { SourceLines } from '../highlight/source.types';

const flushMutations = (): Promise<void> => new Promise((resolve) => setTimeout(resolve));

const clickButton = (root: Element, label: string): void => {
  const button = Array.from(root.querySelectorAll('button')).find((item) => item.textContent === label);
  if (!button) {
    throw new Error(`No "${label}" button`);
  }
  button.click();
};

const renderStep = (slug: string): HTMLElement => {
  const step = evolutionSteps.find((item) => item.slug === slug);
  if (!step) {
    throw new Error(`No "${slug}" step`);
  }
  return MutationMeter({ children: step.Demo() });
};

describe('demo', () => {
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
        caption: 'New',
        previous: plain('const a = 1;'),
      });

      expect(Array.from(view.querySelectorAll('ins')).map((line) => line.textContent)).toEqual(['const b = 2;\n']);
    });

    it('marks structural lines too, by a line diff rather than a lookup', () => {
      const view = SourceView({
        source: plain('run(() => {\n  one();\n});\nrun(() => {\n  two();\n});'),
        caption: 'New',
        previous: plain('run(() => {\n  one();\n});'),
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
        caption: 'New',
        previous: plain('const a = 1;\n'),
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
        caption: 'Source',
      });
      const [keyword, rest] = Array.from(view.querySelectorAll('code span span'));

      expect(keyword?.textContent).toBe('const');
      expect(isInstanceOf(HTMLElement, keyword) && keyword.style.color).toBe('rgb(156, 195, 255)');
      expect(rest?.textContent).toBe(' count = 0;');
    });

    it('marks nothing without a previous source', () => {
      const view = SourceView({ source: plain('const a = 1;'), caption: 'Source' });

      expect(view.querySelectorAll('ins')).toHaveLength(0);
    });
  });
});
