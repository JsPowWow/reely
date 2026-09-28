import { For, mount, signal } from '../index';

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

    expect(board.innerHTML).toBe('<li class="p1">Flash</li><li class="p2">Bolt</li><!--For-->');
  });
});
