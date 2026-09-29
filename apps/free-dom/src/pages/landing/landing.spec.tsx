import { mount } from '@reely/dommy';

import { clickButton, flushMutations } from '../../testing/dom.testing';
import { answerDelay } from './examples/api.search';
import { landingExamples } from './landing.examples';
import { LandingPage } from './landing.page';

const typeInto = (input: HTMLInputElement | null | undefined, text: string): void => {
  if (!input) {
    throw new Error('No input');
  }
  input.value = text;
  input.dispatchEvent(new Event('input', { bubbles: true }));
};

const section = (host: Element, id: string): Element => {
  const found = host.querySelector(`section#${id}`);
  if (!found) {
    throw new Error(`No section #${id}`);
  }
  return found;
};

/** The write board under a demo: text edits, attribute edits, nodes moved, nodes added or removed. */
const writes = (example: Element): number[] =>
  Array.from(example.querySelectorAll('figcaption dd'), (count) => Number(count.firstChild?.textContent)).slice(1);

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
    expect(host.textContent).toContain('This page, its examples and their write counters are built with reely.');
  });

  it('shows every example live beside its source, then the size and speed', () => {
    const examples = landingExamples.map(({ id }) => section(host, id));

    expect(examples.every((example) => example.querySelector('figure') && example.querySelector('pre'))).toBe(true);
    expect(section(host, 'numbers').querySelector('td')?.textContent).toBe('1.3 kB');
  });

  it('animates the button a factory returned, and writes nothing to the DOM for it', async () => {
    const elements = section(host, 'elements');
    const animate = vi.fn();
    const shake = elements.querySelector('button');
    if (!shake) {
      throw new Error('No button');
    }
    shake.animate = animate;
    await flushMutations();

    clickButton(elements, 'Shake me');
    await flushMutations();

    expect(shake).toBeInstanceOf(HTMLButtonElement);
    expect(animate).toHaveBeenCalledOnce();
    expect(writes(elements)).toEqual([0, 0, 0, 0]);
  });

  it('edits two text nodes per keystroke, as the signals example claims', async () => {
    const signals = section(host, 'signals');
    await flushMutations();

    typeInto(signals.querySelector('input'), 'Grace');
    await flushMutations();

    expect(signals.querySelector('figure p')?.textContent).toBe('Hello, Grace!');
    expect(signals.textContent).toContain('5 letters');
    expect(writes(signals)).toEqual([2, 0, 0, 0]);
  });

  it('moves a row with the note typed into it, and counts moves, no new nodes', async () => {
    const lists = section(host, 'lists');
    const firstNote = lists.querySelector('input');
    typeInto(firstNote, 'check the typos');
    await flushMutations();

    clickButton(lists, 'Reverse');
    await flushMutations();
    const notes = Array.from(lists.querySelectorAll('input'));
    const [text, attributes, moved, nodes] = writes(lists);

    expect(notes.at(-1)).toBe(firstNote);
    expect(notes.at(-1)?.value).toBe('check the typos');
    expect(lists.querySelector('li')?.textContent).toContain('Release');
    expect([text, attributes, nodes]).toEqual([0, 0, 0]);
    expect(moved).toBeGreaterThan(0);
  });

  it('greets a stranger and counts one letter in the singular', () => {
    const signals = section(host, 'signals');

    typeInto(signals.querySelector('input'), '');
    const empty = signals.querySelector('figure p')?.textContent;
    typeInto(signals.querySelector('input'), 'A');

    expect(empty).toBe('Hello, stranger!');
    expect(signals.textContent).toContain('1 letter');
    expect(signals.textContent).not.toContain('1 letters');
  });

  describe('the async example', () => {
    // the first search starts at render, so the page mounts again on the fake clock
    beforeEach(() => {
      vi.useFakeTimers();
      dispose();
      host = document.createElement('div');
      dispose = mount(host, () => <LandingPage />);
    });

    afterEach(() => {
      vi.useRealTimers();
    });

    it('shows only the answer to the latest query, and counts the late answers it dropped', async () => {
      const search = section(host, 'async');
      const input = search.querySelector('input');
      const idle = search.textContent;

      typeInto(input, 'e');
      typeInto(input, 'ef');
      typeInto(input, 'eff');
      await vi.advanceTimersByTimeAsync(answerDelay('eff'));
      const first = Array.from(search.querySelectorAll('li'), (item) => item.textContent);
      await vi.advanceTimersByTimeAsync(answerDelay('e'));

      expect(idle).toContain('Type to search 11 names');
      expect(answerDelay('e')).toBeGreaterThan(answerDelay('eff'));
      expect(first).toEqual(['effect']);
      expect(search.textContent).toContain('Answer to “eff”');
      expect(Array.from(search.querySelectorAll('li'), (item) => item.textContent)).toEqual(['effect']);
      expect(search.textContent).toContain('Late answers dropped: 2');
    });
  });
});
