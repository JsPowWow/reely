import { batch, computed, For, mount, onCleanup, Show, signal, untracked } from '@reely/dommy';
import { createAsyncRouter } from '@reely/dommy/router';

import type { Signal } from '@reely/dommy';

interface Racer {
  id: string;
  name: string;
  color: string;
  progress: number;
}

const Row = ({ racer, place }: { racer: () => Racer; place: () => number }) => (
  <li className={() => (place() < 3 ? `p${place() + 1}` : '')} styles={{ '--car-color': () => racer().color }}>
    <span>{() => racer().name}</span>
    <span className="res">{() => `${racer().progress}%`}</span>
  </li>
);

export const Board = ({ racers, finished }: { racers: Signal<readonly Racer[]>; finished: Signal<boolean> }) => {
  const leader = computed(() => racers.value[0]?.name ?? '—');
  const timer = setInterval(() => untracked(() => racers.peek().length), 1000);
  onCleanup(() => clearInterval(timer));
  return (
    <section>
      <h2>{() => `Leader: ${leader.value}`}</h2>
      <ol>
        <For each={racers} by={(racer) => racer.id}>
          {(racer, index) => <Row racer={racer} place={index} />}
        </For>
      </ol>
      <Show when={finished} fallback={() => <p>Racing</p>}>
        {() => <p>Finished</p>}
      </Show>
      <input
        onInput={(event) => {
          const value: string = event.currentTarget.value;
          batch(() => {
            finished.value = value === 'done';
          });
        }}
      />
    </section>
  );
};

export const start = (root: HTMLElement): VoidFunction => {
  const racers = signal<readonly Racer[]>([
    { id: 'a', name: 'Bolt', color: 'red', progress: 10 },
    { id: 'b', name: 'Flash', color: 'blue', progress: 20 },
  ]);
  const finished = signal(false);
  return mount(root, () => <Board racers={racers} finished={finished} />);
};

export const router = createAsyncRouter([{ path: '/', action: () => <main /> }]);
