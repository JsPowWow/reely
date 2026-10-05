import { Keyed, onCleanup, signal } from '@reely/dommy';

import { MemoryCard } from './memory.card';
import { BestTen, Victory } from './memory.dialogs';
import { memoryMachine } from './memory.machine';
import { MomentCode, momentOf, moments, refused } from './memory.moments';
import { cardAt, dealGame, isLocked } from './memory.rules';
import { following, ownedLater } from './memory.wiring';
import { sitePackages } from '../../../site/site.packages';

import css from './memory.module.css';

import type { CodeMoment } from './memory.moments';
import type { RandomSource } from './memory.rules';

const pairs = 8;

interface MemoryGameProps {
  random?: RandomSource;
  /** The clock that dates a win. */
  now?: () => number;
  storage?: Pick<Storage, 'getItem' | 'setItem'>;
}

/**
 * Sixteen cards of eight reely packages: find the pairs in as few moves as you
 * can. A state machine moves the game on, stores hold the table and the best
 * ten, and signals bound to the DOM draw what the stores hold.
 */
export const MemoryGame = ({
  random = Math.random,
  now = Date.now,
  storage,
}: MemoryGameProps = {}): Node => {
  const game = memoryMachine({
    deal: () => dealGame(sitePackages, pairs, random),
    now,
    later: ownedLater(),
    storage,
  });
  const table = following(game.context.table);
  const leaderboard = following(game.context.leaderboard);
  // the deck changes only with a new game, which lays out new cards
  const deck = following(game.context.table.select(({ deck: cards }) => cards));

  const status = signal(moments.deal.status(table.value));
  const code = signal<CodeMoment>(moments.deal);
  const victoryOpen = signal(false);
  const bestTenOpen = signal(false);

  onCleanup(
    game.on('stateChanged', (change) => {
      const moment = momentOf(change);
      status.value = moment.status(change.context.table.value);
      code.value = moment;
      victoryOpen.value = change.to === 'won';
    })
  );

  // a card never asks whether it may turn: the machine refuses what the rules
  // do not allow, and the code panel shows where
  const turn = (place: number): void => {
    game.send('turn', place).status === 'refused' &&
      code.set(refused(game.state));
  };
  const newGame = (): void => {
    game.send('deal');
  };

  return (
    <div className={css.game}>
      <div className={css.bar}>
        <dl className={css.counters}>
          <div>
            <dt>Moves</dt>
            <dd>{() => table.value.moves}</dd>
          </div>
          <div>
            <dt>Pairs</dt>
            <dd>{() => `${table.value.found.length}/${pairs}`}</dd>
          </div>
        </dl>
        <div className={css.controls}>
          <button type='button' className={css.solid} onClick={newGame}>
            New game
          </button>
          <button type='button' onClick={() => bestTenOpen.set(true)}>
            Leaderboard
          </button>
        </div>
      </div>
      <p className={css.status} aria={{ ariaLive: 'polite' }}>
        {status}
      </p>
      <Keyed value={deck}>
        {(cards) => (
          <ul
            className={css.board}
            aria={{
              ariaLabel: 'Cards',
              ariaBusy: () => String(isLocked(table.value)),
            }}
          >
            {cards.map((face, place) => (
              <MemoryCard
                place={place}
                face={face}
                side={() => cardAt(table.value, place)}
                onTurn={turn}
              />
            ))}
          </ul>
        )}
      </Keyed>
      <MomentCode moment={code} />
      <Victory
        open={victoryOpen}
        moves={() => table.value.moves}
        leaderboard={() => leaderboard.value}
        onNewGame={newGame}
      />
      <BestTen open={bestTenOpen} leaderboard={() => leaderboard.value} />
    </div>
  );
};
