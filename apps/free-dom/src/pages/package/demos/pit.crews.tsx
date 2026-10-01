import { onCleanup, signal } from '@reely/dommy';
import { AsyncQueue } from '@reely/queue';

import css from '../../../demo/examples.module.css';

import own from './demos.module.css';

type Status = 'waiting' | 'working' | 'done';

const cars = [
  { name: 'Comet', stop: 1200 },
  { name: 'Falcon', stop: 800 },
  { name: 'Lynx', stop: 1500 },
  { name: 'Orca', stop: 700 },
  { name: 'Vega', stop: 1000 },
];

// Two crews in the pit lane: the queue starts the next car
// the moment a crew is free, never a third at once, and
// says `drain` when the last car has gone.
export const PitCrews = (): Node => {
  const crews = new AsyncQueue({ concurrency: 2 });
  const pit = cars.map((car) => ({
    ...car,
    status: signal<Status>('waiting'),
  }));
  const served = signal('');
  const busy = signal(false);
  const timers = new Set<ReturnType<typeof setTimeout>>();
  onCleanup(() => timers.forEach(clearTimeout));

  const work = (ms: number): Promise<void> =>
    new Promise((done) => {
      const timer = setTimeout(() => {
        timers.delete(timer);
        done();
      }, ms);
      timers.add(timer);
    });
  crews.on('drain', () => {
    served.value = 'All cars served';
    busy.value = false;
  });

  const boxAll = (): void => {
    served.value = '';
    busy.value = true;
    for (const car of pit) {
      car.status.value = 'waiting';
      void crews.add(async () => {
        car.status.value = 'working';
        await work(car.stop);
        car.status.value = 'done';
      });
    }
  };

  return (
    <div className={css.stack}>
      <ul className={own.screens}>
        {pit.map(({ name, status }) => (
          <li data-status={status}>
            {name}
            <output>{status}</output>
          </li>
        ))}
      </ul>
      <button
        type='button'
        className={css.solid}
        disabled={busy}
        onClick={boxAll}
      >
        Box all cars
      </button>
      <p className={css.note}>{served}</p>
    </div>
  );
};
