import { createObjectReference } from '@reely/basics';
import { signal } from '@reely/dommy';

import type { ReelyNode } from '@reely/dommy';

const count = signal(0);

// a JSX expression is a `Node`, whatever the tag or the component returns
export const Counter = (): Node => <button onClick={() => count.value++}>{() => count.value}</button>;

const Label = ({ children }: { children?: ReelyNode }): ReelyNode => children;

// an object ref from `@reely/basics` and a function ref, both typed by the tag
export const searchField = createObjectReference<HTMLInputElement>();
export const Search = (): Node => (
  <form>
    <input elementRef={searchField} />
    <button elementRef={(button) => button.form?.reset()} />
  </form>
);

export const labelled = (parent: Element): void => parent.append(<Label>{() => count.value}</Label>, <Counter />);
