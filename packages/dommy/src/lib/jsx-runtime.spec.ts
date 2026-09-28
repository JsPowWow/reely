import { createElement, signal } from '../index';
import { Fragment, jsx, jsxs } from './jsx-runtime';

describe('jsx runtime (automatic)', () => {
  it('builds an element from a tag, props and `children`', () => {
    const element = jsxs('ul', {
      className: 'rows',
      children: [jsx('li', { children: 'one' }), jsx('li', { children: 'two' })],
    });

    expect(element).toBeInstanceOf(HTMLUListElement);
    expect(element instanceof Element && element.outerHTML).toBe('<ul class="rows"><li>one</li><li>two</li></ul>');
  });

  it('never renders the `key`', () => {
    const element = jsx('li', { children: 'one' }, 'racer-1');

    expect(element instanceof Element && element.outerHTML).toBe('<li>one</li>');
  });

  it('renders a `Fragment` as its children, without a wrapper', () => {
    const fragment = jsx(Fragment, { children: ['a', jsx('b', { children: 'b' })] });
    const parent = document.createElement('p');

    parent.append(fragment instanceof Node ? fragment : '');

    expect(parent.innerHTML).toBe('a<b>b</b>');
  });

  it('calls a component with its props, `children` included', () => {
    const Badge = ({ label, children }: { label: string; children?: unknown }): Node =>
      document.createTextNode(`${label}:${String(children)}`);

    const node = jsx(Badge, { label: 'P', children: 1 });

    expect(node instanceof Node && node.textContent).toBe('P:1');
  });

  it('binds a signal child, updating only its text node', () => {
    const place = signal(1);
    const cell = jsx('td', { children: place });
    const text = cell instanceof Node ? cell.firstChild : null;

    place.value = 2;

    expect(cell instanceof Node && cell.textContent).toBe('2');
    expect(cell instanceof Node && cell.firstChild).toBe(text);
  });

  it('supports `key` after a spread, which compiles to the root `createElement`', () => {
    const Row = ({ name }: { name: string }): Node => document.createTextNode(name);

    const row = createElement('li', { title: 't', key: 'racer-1' }, 'one');
    const component = createElement(Row, { name: 'Bolt', key: 'racer-1' });

    expect(row.outerHTML).toBe('<li title="t">one</li>');
    expect(component instanceof Node && component.textContent).toBe('Bolt');
  });

  it('passes a component its props without `key`, and argument children as `children`', () => {
    const Probe = (props: Record<string, unknown>): Node => document.createTextNode(JSON.stringify(props));
    const read = (node: unknown): unknown => (node instanceof Node ? JSON.parse(node.textContent ?? '') : null);

    expect(read(createElement(Probe, { name: 'Bolt', key: 'racer-1' }))).toEqual({ name: 'Bolt' });
    expect(read(createElement(Probe, { children: 'kept' }))).toEqual({ children: 'kept' });
    expect(read(createElement(Probe, {}, 'one'))).toEqual({ children: 'one' });
    expect(read(createElement(Probe, {}, 'one', 'two'))).toEqual({ children: ['one', 'two'] });
  });
});
