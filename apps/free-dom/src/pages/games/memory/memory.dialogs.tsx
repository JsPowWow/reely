import { For, Show } from '@reely/dommy';
import type { Signal } from '@reely/dommy';
import { isNonEmpty } from '@reely/utils';

import { formatDay } from './memory.leaderboard';
import { movesOf } from './memory.moments';
import { Modal } from './modal';

import css from './memory.module.css';

import type { MemoryResult } from './memory.leaderboard';

interface VictoryProps {
  open: Signal<boolean>;
  moves: () => number;
  place: () => number | undefined;
  onNewGame: VoidFunction;
}

/** The win, posted: its moves, and its place when it made the best ten. */
export const Victory = ({
  open,
  moves,
  place,
  onNewGame,
}: VictoryProps): Node => (
  <Modal open={open} title='All pairs found'>
    <div className={css.score}>
      <p className={css.posted}>{() => movesOf(moves())}</p>
      <Show
        when={place}
        fallback={() => (
          <p className={css.note}>Not in the best ten this time.</p>
        )}
      >
        {(posted) => (
          <p className={css.ranked}>
            <span className={css.place} data-place={posted}>
              {posted}
            </span>{' '}
            on the leaderboard
          </p>
        )}
      </Show>
    </div>
    <div className={css.actions}>
      <button type='button' className={css.solid} onClick={onNewGame}>
        New game
      </button>
      <button type='button' onClick={() => open.set(false)}>
        Close
      </button>
    </div>
  </Modal>
);

interface BestTenProps {
  open: Signal<boolean>;
  best: () => readonly MemoryResult[];
  place: () => number | undefined;
}

/** The best ten as a timing sheet: the leader's plate in signal, by CSS. */
export const BestTen = ({ open, best, place }: BestTenProps): Node => (
  <Modal open={open} title='Leaderboard'>
    <Show
      when={() => isNonEmpty(best())}
      fallback={() => (
        <p className={css.note}>
          No wins yet. Find every pair to post the first.
        </p>
      )}
    >
      {() => (
        <table className={css.results}>
          <caption className='visually-hidden'>
            The best ten wins, fewest moves first
          </caption>
          <thead>
            <tr>
              <th scope='col'>Place</th>
              <th scope='col'>Moves</th>
              <th scope='col'>Date</th>
            </tr>
          </thead>
          <tbody>
            <For each={best} by={({ at, moves }) => `${at}:${moves}`}>
              {(result, index) => (
                <tr
                  aria={{
                    ariaCurrent: () =>
                      index() + 1 === place() ? 'true' : undefined,
                  }}
                >
                  <td>
                    <span className={css.place}>{() => index() + 1}</span>
                  </td>
                  <td>{() => result().moves}</td>
                  <td>{() => formatDay(result().at)}</td>
                </tr>
              )}
            </For>
          </tbody>
        </table>
      )}
    </Show>
    <div className={css.actions}>
      <button type='button' onClick={() => open.set(false)}>
        Close
      </button>
    </div>
  </Modal>
);
