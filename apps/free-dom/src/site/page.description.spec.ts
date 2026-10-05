import { signal } from '@reely/dommy';

import { describePage } from './page.description';
import { mounted } from '../testing/dom.testing';

const described = (): string | null | undefined =>
  document.head.querySelector('meta[name="description"]')?.getAttribute('content');

describe('describePage', () => {
  it('describes the page while it is shown, follows its text, and leaves with it', () => {
    const text = signal('Sixteen cards, eight packages.');
    const page = mounted(() => {
      describePage(() => text.value);
      return document.createElement('main');
    });

    expect(described()).toBe('Sixteen cards, eight packages.');
    text.value = 'Шестнадцать карт.';
    expect(described()).toBe('Шестнадцать карт.');

    page.dispose();
    expect(described()).toBeUndefined();
  });
});
