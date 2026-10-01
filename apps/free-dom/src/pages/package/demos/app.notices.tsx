import { messageOf } from '@reely/basics';
import { For, signal } from '@reely/dommy';
import { EventEmitter } from '@reely/emitter';

import css from '../../../demo/examples.module.css';

import own from './demos.module.css';

interface Notices {
  notice: { id: number; text: string };
}

// Any part of the app can announce a notice on one typed
// channel. The chat widget's listener throws, and still the
// toasts and the badge hear it: `emit` reports it after.
export const AppNotices = (): Node => {
  const notices = new EventEmitter<Notices>();
  const toasts = signal<readonly Notices['notice'][]>([]);
  const unread = signal(0);
  const problem = signal('');
  let sent = 0;

  notices.on('notice', (notice) => {
    toasts.value = [notice, ...toasts.value].slice(0, 3);
  });
  notices.on('notice', () => {
    throw new Error('The chat widget threw');
  });
  notices.on('notice', () => {
    unread.value += 1;
  });

  const announce = (text: string): void => {
    try {
      sent += 1;
      notices.emit('notice', { id: sent, text });
      problem.value = '';
    } catch (error) {
      problem.value = `${messageOf(error)}: the others heard it`;
    }
  };

  return (
    <div className={css.stack}>
      <div className={css.row}>
        <button type='button' onClick={() => announce('Profile saved')}>
          Save the profile
        </button>
        <button type='button' onClick={() => announce('Connection lost, retrying')}>
          Lose the connection
        </button>
        <span className={own.unread} data-unread=''>
          {() => String(unread.value)}
        </span>
      </div>
      <ul className={own.ticker}>
        <For each={toasts} by={(toast) => toast.id}>
          {(toast) => <li>{() => toast().text}</li>}
        </For>
      </ul>
      <p className={css.note}>{problem}</p>
    </div>
  );
};
