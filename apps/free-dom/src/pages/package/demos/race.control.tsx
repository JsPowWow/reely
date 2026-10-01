import { messageOf } from '@reely/basics';
import { For, signal } from '@reely/dommy';
import { EventEmitter } from '@reely/emitter';

import css from '../../../demo/examples.module.css';

import own from './demos.module.css';

type Flag = 'green' | 'yellow' | 'red';

interface RaceControlEvents {
  flag: { flag: Flag; message: string };
}

interface Call {
  flag: Flag;
  button: string;
  message: string;
}

const calls: readonly Call[] = [
  { flag: 'yellow', button: 'Yellow flag', message: 'Yellow flag in sector 2' },
  { flag: 'red', button: 'Red flag', message: 'Red flag, session stopped' },
  { flag: 'green', button: 'Green flag', message: 'Track clear, green flag' },
];

// Race control talks to every screen through one typed
// channel. The team radio throws, and still the marshals
// and the ticker hear each flag: `emit` reports it after.
export const RaceControl = (): Node => {
  const control = new EventEmitter<RaceControlEvents>();
  const flag = signal<Flag>('green');
  const ticker = signal<readonly { id: number; message: string }[]>([]);
  const problem = signal('');

  control.on('flag', (call) => (flag.value = call.flag));
  control.on('flag', () => {
    throw new Error('Team radio is down');
  });
  control.on('flag', ({ message }) => {
    const id = (ticker.value[0]?.id ?? 0) + 1;
    ticker.value = [{ id, message }, ...ticker.value].slice(0, 3);
  });

  const wave = ({ flag: next, message }: Call): void => {
    try {
      control.emit('flag', { flag: next, message });
      problem.value = '';
    } catch (error) {
      problem.value = `${messageOf(error)}: the others heard it`;
    }
  };

  return (
    <div className={css.stack}>
      <p className={own.flag} data-flag={flag}>
        {() => `${flag.value} flag`}
      </p>
      <div className={css.row}>
        {calls.map((call) => (
          <button type='button' onClick={() => wave(call)}>
            {call.button}
          </button>
        ))}
      </div>
      <ul className={own.ticker}>
        <For each={ticker} by={(call) => call.id}>
          {(call) => <li>{() => call().message}</li>}
        </For>
      </ul>
      <p className={css.note}>{problem}</p>
    </div>
  );
};
