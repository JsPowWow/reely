import { li, ul } from '@reely/dommy';

// van-dml's `begin`/`end`, trimmed: one current parent for the whole module,
// and tags that land in it on their own.
const parents: Element[] = [];
const begin = <T extends Element>(parent: T): T => {
  parents.at(-1)?.append(parent);
  parents.push(parent);
  return parent;
};
const end = (): void => {
  parents.pop();
};
const appending =
  <A extends unknown[], E extends Element>(factory: (...args: A) => E) =>
  (...args: A): E => {
    const element = factory(...args);
    parents.at(-1)?.append(element);
    return element;
  };
const row = appending(li);

const orders = [
  { id: 'A-1042', status: 'shipped' },
  { id: 'A-1043', status: 'cancelled' },
  { id: 'A-1044', status: 'packing' },
  { id: 'A-1045', status: 'shipped' },
] as const;

// `for`, `continue`, `switch` and `if`, between `begin` and `end`
export const OrdersDml = (): Node => {
  const list = begin(ul());
  for (const { id, status } of orders) {
    if (status === 'cancelled') {
      continue;
    }
    switch (status) {
      case 'shipped':
        row(`${id}: on its way`);
        break;
      case 'packing':
        row(`${id}: being packed`);
        break;
    }
  }
  const cancelled = orders.filter(({ status }) => status === 'cancelled');
  if (cancelled.length > 0) {
    row(`${cancelled.length} cancelled, not shown`);
  }
  end();
  return list;
};
