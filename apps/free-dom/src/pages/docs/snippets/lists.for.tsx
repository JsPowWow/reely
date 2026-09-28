import { For, signal } from '@reely/dommy';

interface Racer {
  id: string;
  name: string;
}

const racers = signal<readonly Racer[]>([]);

// One row per `by` key; `racer()` and `index()` follow later updates of that key.
export const Standings = (): Node => (
  <ol>
    <For each={racers} by={(racer) => racer.id}>
      {(racer, index) => <li className={() => (index() === 0 ? 'leader' : '')}>{() => racer().name}</li>}
    </For>
  </ol>
);
