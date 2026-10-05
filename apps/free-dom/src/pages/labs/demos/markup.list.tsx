import type { ReelyNode } from '@reely/dommy';

// The lab's `markup`, whole: every `yield` of the builder becomes one child.
const markup = (build: () => Iterable<ReelyNode>): ReelyNode[] =>
  Array.from(build());

const orders = [
  { id: 'A-1042', status: 'shipped' },
  { id: 'A-1043', status: 'cancelled' },
  { id: 'A-1044', status: 'packing' },
  { id: 'A-1045', status: 'shipped' },
] as const;

// `for`, `continue`, `switch` and `if` inside JSX; the builder runs once, like a component.
export const MarkupList = (): Node => (
  <ul>
    {markup(function* () {
      for (const { id, status } of orders) {
        if (status === 'cancelled') {
          continue;
        }
        switch (status) {
          case 'shipped':
            yield <li>{`${id}: on its way`}</li>;
            break;
          case 'packing':
            yield <li>{`${id}: being packed`}</li>;
            break;
        }
      }
      const cancelled = orders.filter(({ status }) => status === 'cancelled');
      if (cancelled.length > 0) {
        yield <li>{`${cancelled.length} cancelled, not shown`}</li>;
      }
    })}
  </ul>
);
