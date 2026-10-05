import { batch, computed, effect, For, Keyed, Show, signal } from '@reely/dommy';
import { later, persisted } from '@reely/dommy-kit';

import { formatDay, isMemoryResults, postResult } from './memory.leaderboard';
import { cardAt, dealGame, isLocked, isWon, turnBack, turnCard } from './memory.rules';
import { Modal } from './modal';
import { packageGlyph } from './package.glyphs';
import { sitePackages } from '../../../site/site.packages';

import css from './memory.module.css';

import type { MemoryResult } from './memory.leaderboard';
import type { CardSide, MemoryGame as Game, RandomSource } from './memory.rules';
import type { SitePackage } from '../../../site/site.packages';

const pairs = 8;

/** How long a wrong pair stays up before it turns back, in ms. */
export const turnBackAfter = 1000;

interface MemoryGameProps {
  random?: RandomSource;
  /** The clock that dates a win. */
  now?: () => number;
  storage?: Pick<Storage, 'getItem' | 'setItem'>;
}

const CardFace = ({ face }: { face: SitePackage }): Node => (
  <span className={css.face} aria={{ ariaHidden: 'true' }}>
    {packageGlyph(face)}
    <span className={css.scope}>@reely/</span>
    <span className={css.name}>{face}</span>
  </span>
);

const sideLabels = {
  down: (place: number): string => `Card ${place + 1}, face down`,
  up: (place: number, face: string): string => `Card ${place + 1}, ${face}`,
  found: (place: number, face: string): string => `Card ${place + 1}, ${face}, found`,
} satisfies Record<CardSide, (place: number, face: string) => string>;

const plural = (count: number, one: string): string => `${count} ${one}${count === 1 ? '' : 's'}`;

/** Sixteen cards of eight reely packages: find the pairs in as few moves as you can. */
export const MemoryGame = ({ random = Math.random, now = Date.now, storage }: MemoryGameProps = {}): Node => {
  const deal = (): Game<SitePackage> => dealGame(sitePackages, pairs, random);
  const game = signal(deal());
  const status = signal('Turn a card.');
  const leaderboard = persisted<MemoryResult[]>('reely.memory.leaderboard', [], { storage, is: isMemoryResults });
  const lastWin = signal<{ result: MemoryResult; place: number | undefined } | undefined>(undefined);
  const victoryOpen = signal(false);
  const leaderboardOpen = signal(false);

  // a new move or a new game first cancels the timer of the wrong pair before it
  effect(() => {
    if (isLocked(game.value)) {
      later(turnBackAfter, () => game.update(turnBack));
    }
  });

  const turn = (place: number): void => {
    const before = game.peek();
    const after = turnCard(before, place);
    if (after === before) {
      return;
    }
    const face = after.deck[place] ?? '';
    batch(() => {
      game.value = after;
      if (isWon(after)) {
        const result = { moves: after.moves, at: now() };
        const posted = postResult(leaderboard.peek(), result);
        leaderboard.value = posted.board;
        lastWin.value = { result, place: posted.place };
        status.value = `All ${pairs} pairs found in ${plural(after.moves, 'move')}.`;
        victoryOpen.value = true;
      } else if (after.found.length > before.found.length) {
        status.value = `A pair of ${face}.`;
      } else if (isLocked(after)) {
        status.value = `${after.open.map((open) => after.deck[open]).join(' and ')} do not match.`;
      } else {
        status.value = `${face}: now find its pair.`;
      }
    });
  };

  const newGame = (): void =>
    batch(() => {
      game.value = deal();
      status.value = 'Turn a card.';
      victoryOpen.value = false;
    });

  // the deck changes only with a new game, which lays out new cards
  const deck = computed(() => game.value.deck);

  const Card = ({ place, face }: { place: number; face: SitePackage }): Node => {
    const side = computed(() => cardAt(game.value, place));
    return (
      <li>
        <button
          type='button'
          className={css.card}
          data-side={side}
          aria={{
            ariaLabel: () => sideLabels[side.value](place, face),
            ariaDisabled: () => String(side.value !== 'down'),
          }}
          onClick={() => turn(place)}
        >
          <span className={css.turn}>
            <span className={css.back} aria={{ ariaHidden: 'true' }}>
              r
            </span>
            <CardFace face={face} />
          </span>
        </button>
      </li>
    );
  };

  return (
    <div className={css.game}>
      <div className={css.bar}>
        <dl className={css.counters}>
          <div>
            <dt>Moves</dt>
            <dd>{() => game.value.moves}</dd>
          </div>
          <div>
            <dt>Pairs</dt>
            <dd>{() => `${game.value.found.length}/${pairs}`}</dd>
          </div>
        </dl>
        <div className={css.controls}>
          <button type='button' className={css.solid} onClick={newGame}>
            New game
          </button>
          <button type='button' onClick={() => leaderboardOpen.set(true)}>
            Leaderboard
          </button>
        </div>
      </div>
      <p className={css.status} aria={{ ariaLive: 'polite' }}>
        {status}
      </p>
      <Keyed value={deck}>
        {(cards) => (
          <ul className={css.board} aria={{ ariaLabel: 'Cards', ariaBusy: () => String(isLocked(game.value)) }}>
            {cards.map((face, place) => (
              <Card place={place} face={face} />
            ))}
          </ul>
        )}
      </Keyed>
      <Modal open={victoryOpen} title={`All ${pairs} pairs found`}>
        <p className={css.posted}>{() => plural(lastWin.value?.result.moves ?? 0, 'move')}</p>
        <p className={css.note}>
          {() => {
            const place = lastWin.value?.place;
            return place === undefined ? 'Not in the best ten this time.' : `Number ${place} on the leaderboard.`;
          }}
        </p>
        <div className={css.actions}>
          <button type='button' className={css.solid} onClick={newGame}>
            New game
          </button>
          <button type='button' onClick={() => victoryOpen.set(false)}>
            Close
          </button>
        </div>
      </Modal>
      <Modal open={leaderboardOpen} title='Leaderboard'>
        <Show
          when={() => leaderboard.value.length > 0}
          fallback={() => <p className={css.note}>No wins yet. Find all eight pairs to post the first.</p>}
        >
          {() => (
            <table className={css.results}>
              <caption className='visually-hidden'>The best ten wins, fewest moves first</caption>
              <thead>
                <tr>
                  <th scope='col'>Place</th>
                  <th scope='col'>Moves</th>
                  <th scope='col'>Date</th>
                </tr>
              </thead>
              <tbody>
                <For each={leaderboard} by={(result) => `${result.at}:${result.moves}`}>
                  {(result, index) => (
                    <tr aria={{ ariaCurrent: () => String(result().at === lastWin.value?.result.at) }}>
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
          <button type='button' onClick={() => leaderboardOpen.set(false)}>
            Close
          </button>
        </div>
      </Modal>
    </div>
  );
};
