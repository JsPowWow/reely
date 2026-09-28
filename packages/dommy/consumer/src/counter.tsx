import { signal } from '@reely/dommy';

import type { ReelyNode } from '@reely/dommy';

const count = signal(0);

// a JSX expression is a `Node`, whatever the tag or the component returns
export const Counter = (): Node => <button onClick={() => count.value++}>{() => count.value}</button>;

const Label = ({ children }: { children?: ReelyNode }): ReelyNode => children;

export const labelled = (parent: Element): void => parent.append(<Label>{() => count.value}</Label>, <Counter />);
