import { computed, For, mount, signal } from '../../index';

import type { ForProps, ReactiveValue } from '../../index';

interface Racer {
  id: string;
  name: string;
}

describe('For in JSX', () => {
  it('takes its row renderer as children and infers the item type from `each`', () => {
    const racers = signal<readonly Racer[]>([
      { id: 'a', name: 'Bolt' },
      { id: 'b', name: 'Flash' },
    ]);
    const board = document.createElement('ol');

    mount(board, () => (
      <For each={racers} by={(racer) => racer.id}>
        {(racer, index) => <li className={() => `p${index() + 1}`}>{() => racer().name}</li>}
      </For>
    ));
    racers.value = [...racers.value].reverse();

    expect(board.innerHTML).toBe('<!--For--><li class="p1">Flash</li><li class="p2">Bolt</li><!--/For-->');
  });

  it('infers the item type from a getter written in place and from a computed kept in a variable', () => {
    const racers = signal<readonly Racer[]>([{ id: 'a', name: 'Bolt' }]);
    const names = computed(() => racers.value.map((racer) => racer.name));
    const board = document.createElement('ol');

    mount(board, () => (
      <>
        <For each={() => ['1:31', '1:29']} by={(lap) => lap}>
          {(lap) => {
            expectTypeOf(lap).toEqualTypeOf<ReactiveValue<string>>();
            return <li>{lap}</li>;
          }}
        </For>
        <For each={names} by={(name) => name}>
          {(name) => {
            expectTypeOf(name).toEqualTypeOf<ReactiveValue<string>>();
            return <li>{name}</li>;
          }}
        </For>
      </>
    ));

    expect(board.textContent).toBe('1:311:29Bolt');
  });

  // a TypeScript limit (README, Lists): once TypeScript lifts it, this fails and the README changes
  it('leaves the item `unknown` for a signal written in place, and takes no plain array', () => {
    const board = document.createElement('ol');

    mount(board, () => (
      <For each={signal(['1:31'])} by={(lap) => String(lap)}>
        {(lap) => {
          expectTypeOf(lap).toEqualTypeOf<ReactiveValue<unknown>>();
          return <li>{() => String(lap())}</li>;
        }}
      </For>
    ));

    expect(board.textContent).toBe('1:31');
    expectTypeOf(['1:31']).not.toExtend<ForProps<string>['each']>();
  });
});
