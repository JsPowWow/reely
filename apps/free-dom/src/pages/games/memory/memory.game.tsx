import { computed, effect, Keyed, onCleanup, signal } from '@reely/dommy';
import { later, persisted } from '@reely/dommy-kit';

import { MemoryCard } from './memory.card';
import { BestTen, Victory } from './memory.dialogs';
import { isBoard } from './memory.leaderboard';
import { memoryMachine } from './memory.machine';
import { MomentCode, momentOf, moments, refused } from './memory.moments';
import { cardAt, dealTable } from './memory.rules';
import { sitePackages } from '../../../site/site.packages';

import css from './memory.module.css';

import type { MemoryResult } from './memory.leaderboard';
import type { CodeMoment } from './memory.moments';
import type { MemoryTable, RandomSource } from './memory.rules';

const pairs = 8;

/** How long a wrong pair stays up before it turns back, in ms. */
export const turnBackAfter = 1000;

interface MemoryGameProps {
  random?: RandomSource;
  /** The clock that dates a win. */
  now?: () => number;
  storage?: Pick<Storage, 'getItem' | 'setItem'>;
}

/**
 * Sixteen cards of eight reely packages: find the pairs in as few moves as you
 * can. A state machine moves the game on over signals the page draws.
 */
export const MemoryGame = ({
  random = Math.random,
  now = Date.now,
  storage,
}: MemoryGameProps = {}): Node => {
  // #region state
  const deal = (): MemoryTable => dealTable(sitePackages, pairs, random);
  const table = signal(deal());
  // kept in localStorage, and in memory alone where storage fails
  const best = persisted<readonly MemoryResult[]>(
    'reely.memory.leaderboard',
    [],
    { storage, is: isBoard }
  );
  const place = signal<number | undefined>(undefined);
  const game = memoryMachine({ table, best, place, deal, now });
  // the deck changes only with a new game, which lays out new cards
  const cards = computed(() => table().deck);
  // #endregion

  const phase = signal(game.state);
  const status = signal(moments.deal.status(table()));
  const code = signal<CodeMoment>(moments.deal);
  const victoryOpen = signal(false);
  const bestTenOpen = signal(false);

  onCleanup(
    game.on('stateChanged', (change) => {
      const moment = momentOf(change);
      phase.set(change.to);
      status.set(moment.status(table()));
      code.set(moment);
      victoryOpen.set(change.to === 'won');
    })
  );

  // #region timer
  // the machine keeps no time: a wrong pair turns back a second after it is
  // up; a new game, or the view going, cancels the timer with this effect run
  effect(
    () =>
      phase() === 'wrongPair' &&
      later(turnBackAfter, () => game.send('turnBack'))
  );
  // #endregion

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
      <div className={css.table}>
        <div className={css.bar}>
          <dl className={css.counters}>
            <div>
              <dt>Moves</dt>
              <dd>{() => table().moves}</dd>
            </div>
            <div>
              <dt>Pairs</dt>
              <dd>{() => `${table().found.length}/${pairs}`}</dd>
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
          <p className={css.status} aria={{ ariaLive: 'polite' }}>
            {status}
          </p>
        </div>
        <Keyed value={cards}>
          {(deck) => (
            <ul
              className={css.board}
              aria={{
                ariaLabel: 'Cards',
                ariaBusy: () => String(phase() === 'wrongPair'),
              }}
            >
              {deck.map((face, place) => (
                <MemoryCard
                  place={place}
                  face={face}
                  side={() => cardAt(table(), place)}
                  onTurn={turn}
                />
              ))}
            </ul>
          )}
        </Keyed>
        <MomentCode moment={code} />
      </div>
      <Victory
        open={victoryOpen}
        moves={() => table().moves}
        place={place}
        onNewGame={newGame}
      />
      <BestTen open={bestTenOpen} best={best} place={place} />
    </div>
  );
};
