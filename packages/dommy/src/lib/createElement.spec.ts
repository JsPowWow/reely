import { noop } from '@reely/utils';

import { createElement, createObjectReference } from '../index';

describe('createElement', () => {
  it('creates an element with the given tag', () => {
    const element = createElement('section');

    expect(element).toBeInstanceOf(HTMLElement);
    expect(element.outerHTML).toBe('<section></section>');
  });

  describe('children', () => {
    it('renders a string child as text, never as markup', () => {
      const element = createElement('p', null, '<b>bold</b>');

      expect(element.childNodes).toHaveLength(1);
      expect(element.firstChild).toBeInstanceOf(Text);
      expect(element.textContent).toBe('<b>bold</b>');
    });

    it('renders numbers as text, including zero', () => {
      const element = createElement('p', null, 0, 42);

      expect(element.textContent).toBe('042');
    });

    it('appends node children in order, keeping their identity', () => {
      const first = document.createElement('i');
      const second = document.createElement('b');

      const element = createElement('p', null, first, 'and', second);

      expect(Array.from(element.childNodes)).toEqual([first, expect.any(Text), second]);
      expect(element.childNodes[0]).toBe(first);
      expect(element.childNodes[2]).toBe(second);
    });

    it('flattens nested arrays of children', () => {
      const element = createElement('ul', null, ['a', ['b', ['c']]], 'd');

      expect(element.textContent).toBe('abcd');
      expect(element.childNodes).toHaveLength(4);
    });

    it('skips null, undefined and false', () => {
      const element = createElement('p', null, null, 'a', undefined, false, 'b');

      expect(element.textContent).toBe('ab');
      expect(element.childNodes).toHaveLength(2);
    });

    it('takes children from props when none are passed as arguments', () => {
      const element = createElement('p', { children: ['a', 'b'] });

      expect(element.textContent).toBe('ab');
    });

    it('prefers argument children over props children', () => {
      const element = createElement('p', { children: 'from props' }, 'from args');

      expect(element.textContent).toBe('from args');
    });
  });

  describe('elementRef', () => {
    it('calls a function ref with the created element', () => {
      const ref = vi.fn();

      const element = createElement('div', { elementRef: ref });

      expect(ref).toHaveBeenCalledExactlyOnceWith(element);
    });

    it('types a function ref parameter as the element, never `null`', () => {
      const tags: string[] = [];

      createElement('output', {
        elementRef: (element) => {
          expectTypeOf(element).toEqualTypeOf<HTMLOutputElement>();
          tags.push(element.tagName);
        },
      });

      expect(tags).toEqual(['OUTPUT']);
    });

    it('sets `current` of an object ref', () => {
      const ref = createObjectReference<HTMLDivElement>();

      const element = createElement('div', { elementRef: ref });

      expect(ref.current).toBe(element);
    });

    it('does not render `elementRef` as an attribute', () => {
      const element = createElement('div', { elementRef: noop });

      expect(element.attributes).toHaveLength(0);
    });
  });

  it('passes props given as a class instance to a component', () => {
    class CardProps {
      public id = 'card';
    }
    const Card = (props: CardProps): Node => createElement('div', { id: props.id });

    expect(createElement(Card, new CardProps())).toHaveProperty('outerHTML', '<div id="card"></div>');
  });
});
