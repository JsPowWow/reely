import { For, Show } from '@reely/dommy';
import type { Signal } from '@reely/dommy';

import { formatDay } from './memory.leaderboard';
import { movesOf } from './memory.moments';
import { Modal } from './modal';

import css from './memory.module.css';

import type { Leaderboard } from './memory.leaderboard';

interface VictoryProps {
  open: Signal<boolean>;
  moves: () => number;
  leaderboard: () => Leaderboard;
  onNewGame: VoidFunction;
}

/** The win, posted: its moves, and its place when it made the best ten. */
export const Victory = (props: VictoryProps): Node => (
  <Modal open={props.open} title='All pairs found'>
    <div className={css.score}>
      <p className={css.posted}>{() => movesOf(props.moves())}</p>
      <Show
        when={() => props.leaderboard().place}
        fallback={() => (
          <p className={css.note}>Not in the best ten this time.</p>
        )}
      >
        {(place) => (
          <p className={css.ranked}>
            <span className={css.place} data-place={place}>
              {place}
            </span>{' '}
            on the leaderboard
          </p>
        )}
      </Show>
    </div>
    <div className={css.actions}>
      <button type='button' className={css.solid} onClick={props.onNewGame}>
        New game
      </button>
      <button type='button' onClick={() => props.open.set(false)}>
        Close
      </button>
    </div>
  </Modal>
);

interface BestTenProps {
  open: Signal<boolean>;
  leaderboard: () => Leaderboard;
}

/** The best ten as a timing sheet: the leader's plate in signal, by CSS. */
export const BestTen = ({ open, leaderboard }: BestTenProps): Node => (
  <Modal open={open} title='Leaderboard'>
    <Show
      when={() => leaderboard().board.length > 0}
      fallback={() => (
        <p className={css.note}>
          No wins yet. Find all eight pairs to post the first.
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
            <For
              each={() => leaderboard().board}
              by={({ at, moves }) => `${at}:${moves}`}
            >
              {(result, index) => (
                <tr
                  aria={{
                    ariaCurrent: () =>
                      String(index() + 1 === leaderboard().place),
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
