import { h2, li, mount, section, signal, ul } from '@reely/dommy';

import { markup } from './markup';
import { add, begin, depth, end, within } from './within';

import type { ReelyNode } from '@reely/dommy';

interface Car {
  name: string;
  out: boolean;
}

const grid: Car[] = [
  { name: 'Car 7', out: false },
  { name: 'Car 3', out: true },
  { name: 'Car 1', out: false },
];

const texts = (parent: ParentNode, selector: string): (string | null)[] =>
  Array.from(parent.querySelectorAll(selector), (node) => node.textContent);

describe('Variant A: markup with generators', () => {
  it('builds children with loops and conditions inside JSX', () => {
    const board = (
      <ul>
        {markup(function* () {
          for (const [place, car] of grid.entries()) {
            if (car.out) {
              continue;
            }
            yield <li>{`${place + 1}. ${car.name}`}</li>;
          }
          if (grid.some((car) => car.out)) {
            yield <li>Retired: 1</li>;
          }
        })}
      </ul>
    );

    expect(texts(board as HTMLElement, 'li')).toEqual(['1. Car 7', '3. Car 1', 'Retired: 1']);
  });

  it('builds children of tag factories too, and composes builders with `yield*`', () => {
    function* rows(cars: readonly Car[]): Generator<ReelyNode> {
      for (const car of cars) {
        yield li(null, car.name);
      }
    }

    const panel = section(
      null,
      ...markup(function* () {
        yield h2(null, 'Running');
        yield ul(null, ...markup(() => rows(grid.filter((car) => !car.out))));
        yield h2(null, 'Out');
        yield* rows(grid.filter((car) => car.out));
      })
    );

    expect(texts(panel, 'h2, li')).toEqual(['Running', 'Car 7', 'Car 1', 'Out', 'Car 3']);
  });

  it('keeps the bindings inside it reactive: one text node per change', () => {
    const leader = signal('Car 7');
    const host = document.createElement('div');
    mount(host, () => (
      <p>
        {markup(function* () {
          yield 'Leader: ';
          yield leader;
        })}
      </p>
    ));
    const [, text] = Array.from(host.querySelector('p')?.childNodes ?? []);

    leader.value = 'Car 3';

    expect(host.textContent).toBe('Leader: Car 3');
    expect(host.querySelector('p')?.childNodes[1]).toBe(text);
  });

  it('drops a child built without `yield`, and nothing catches it', () => {
    const list = (
      <ul>
        {markup(function* () {
          yield <li>Car 7</li>;
          // the forgotten `yield`: the element is built and thrown away
          <li>Car 3</li>;
        })}
      </ul>
    );

    expect(texts(list as HTMLElement, 'li')).toEqual(['Car 7']);
  });

  it('lets TypeScript check what is yielded, and keeps the structure static', () => {
    // @ts-expect-error an object is not a child; TypeScript marks the builder, not the `yield` line
    markup(function* () {
      yield { name: 'Car 7' };
    });
    const laps = signal(1);

    // @ts-expect-error a getter of children is not a child: a changing structure goes through `For` or `Show`
    const reactive = <ul>{() => markup(function* () { for (let lap = 0; lap < laps.value; lap += 1) yield <li /> })}</ul>;

    expect(reactive).toBeInstanceOf(HTMLUListElement);
  });
});

describe('A typed `end` in a generator', () => {
  const END: unique symbol = Symbol('end');

  it('can be demanded by the return type, yet it only restates the closing brace', () => {
    function* closed(): Generator<ReelyNode, typeof END> {
      yield <li>Car 7</li>;
      return END;
    }
    // @ts-expect-error a builder that does not return `END` does not type-check
    function* open(): Generator<ReelyNode, typeof END> {
      yield <li>Car 7</li>;
    }

    expect(texts(ul(null, ...markup(closed)), 'li')).toEqual(['Car 7']);
    expect(open).toBeTypeOf('function');
  });
});

describe('Variant B: `using within(parent)`', () => {
  it('appends to the current parent and closes with the block, even when it throws', () => {
    const list = document.createElement('ul');

    const build = (): void => {
      using _list = within(list);
      for (const car of grid) {
        add(<li>{car.name}</li>);
        if (car.out) {
          throw new Error('stop');
        }
      }
    };

    expect(build).toThrow('stop');
    expect(texts(list, 'li')).toEqual(['Car 7', 'Car 3']);
    expect(depth()).toBe(0);
  });

  it('shares the current parent across an `await`, so two builds interleave into the wrong parents', async () => {
    const first = document.createElement('ul');
    const second = document.createElement('ul');
    const build = async (list: HTMLElement, name: string): Promise<void> => {
      using _list = within(list);
      add(<li>{`${name} 1`}</li>);
      await Promise.resolve();
      add(<li>{`${name} 2`}</li>);
    };

    await Promise.all([build(first, 'A'), build(second, 'B')]);

    expect(texts(first, 'li')).toEqual(['A 1']);
    expect(texts(second, 'li')).toEqual(['B 1', 'A 2', 'B 2']);
  });
});

describe('Variant C: `begin`/`end` by hand', () => {
  it('leaves the parent current when an `end` is missing', () => {
    const page = document.createElement('main');
    const results = document.createElement('ul');

    begin(page);
    add(results);
    begin(results);
    add(<li>Car 7</li>);
    // the missing end(): the note meant for the page goes into the list
    add(<p>Lap 5</p>);
    end();
    const unbalanced = depth();
    end();

    expect(unbalanced).toBe(1);
    expect(texts(page, ':scope > *')).toEqual(['Car 7Lap 5']);
  });
});
