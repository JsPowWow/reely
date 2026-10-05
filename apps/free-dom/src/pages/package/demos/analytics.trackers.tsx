import { forEachSettled, messageOf } from '@reely/basics';
import { signal } from '@reely/dommy';
import type { Signal } from '@reely/dommy';

import css from '../../../demo/examples.module.css';

import own from './demos.module.css';

interface Tracker {
  name: string;
  shows: Signal<string>;
  track: VoidFunction;
}

const counting = (name: string): Tracker => {
  const shows = signal('0 events');
  let events = 0;
  return {
    name,
    shows,
    track: (): void => {
      events += 1;
      shows.value = `${events} ${events === 1 ? 'event' : 'events'}`;
    },
  };
};

const blocked = (name: string): Tracker => ({
  name,
  shows: signal('blocked'),
  track: (): never => {
    throw new Error('Blocked by an ad blocker');
  },
});

// One tracker blocked in the visitor's browser must not cost
// the others the order: `forEachSettled` calls every one,
// then throws the error once each has had its turn.
export const AnalyticsTrackers = (): Node => {
  const trackers = [
    counting('Product analytics'),
    blocked('Ads pixel'),
    counting('Data warehouse'),
  ];
  const problem = signal('');

  const placeOrder = (): void => {
    try {
      forEachSettled(trackers, ({ track }) => track());
      problem.value = '';
    } catch (error) {
      problem.value = `Reported to the rest. ${messageOf(error)}.`;
    }
  };

  return (
    <div className={css.stack}>
      <ul className={own.screens}>
        {trackers.map(({ name, shows }) => (
          <li>
            {name}
            <output>{shows}</output>
          </li>
        ))}
      </ul>
      <button type='button' className={css.solid} onClick={placeOrder}>
        Place the order
      </button>
      <p className={css.note}>{problem}</p>
    </div>
  );
};
