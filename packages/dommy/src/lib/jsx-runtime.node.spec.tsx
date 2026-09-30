import { subscriberCount } from '@reely/signals/testing';

import { createElement, mount, signal } from '../index';

import type { ReelyNode } from '../index';

describe('a JSX expression is a node', () => {
  it('gives a `Node` for a tag, so a component can declare `(): Node`', () => {
    const count = signal(0);
    const Counter = (): Node => <button onClick={() => count.value++}>{() => count.value}</button>;
    const parent = document.createElement('div');

    parent.append(<Counter />);

    expect(parent.innerHTML).toBe('<button>0</button>');
  });

  it('renders a component that returns a getter as a text node that follows it', () => {
    const count = signal(1);
    const Label = (): ReelyNode => () => count.value;
    const parent = document.createElement('p');

    parent.append(<Label />);
    count.value = 2;

    expect(parent.innerHTML).toBe('2');
  });

  it('renders a component that returns text, a list or nothing as its nodes', () => {
    const Text = (): ReelyNode => 'lap';
    const List = (): ReelyNode => ['a', <b>b</b>];
    const Nothing = (): ReelyNode => null;
    const parent = document.createElement('p');

    parent.append(<Text />, <List />, <Nothing />);

    expect(parent.innerHTML).toBe('lapa<b>b</b>');
  });

  it('releases the text node a returned getter is bound to when disposed', () => {
    const count = signal(1);
    const Label = (): ReelyNode => () => count.value;
    const parent = document.createElement('div');

    const dispose = mount(parent, () => <p><Label /></p>);
    const bound = subscriberCount(count);
    dispose();

    expect(bound).toBe(1);
    expect(subscriberCount(count)).toBe(0);
  });

  it('gives a node for a component called through `createElement`', () => {
    const count = signal(1);
    const Label = (): ReelyNode => ['lap ', () => count.value];
    const parent = document.createElement('p');

    parent.append(createElement(Label, {}));
    count.value = 2;

    expect(parent.innerHTML).toBe('lap 2');
  });

  it('keeps a single node child as it is, with no fragment around it', () => {
    const place = <b>1</b>;

    expect(<>{place}</>).toBe(place);
  });
});
