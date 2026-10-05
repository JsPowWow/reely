import type { Signal } from '@reely/dommy';
import { scopedLogger } from '@reely/logger';
import { createStateMachine, runActionEffect } from '@reely/state-machine';
import type {
  IStateMachine,
  StateMachineSelection,
  StateMachineStateConfig,
} from '@reely/state-machine';

import { postResult } from './memory.leaderboard';
import { canTurn, isWon, turnBack, turnCard } from './memory.rules';

import type { MemoryResult } from './memory.leaderboard';
import type { MemoryTable } from './memory.rules';

/**
 * What the machine works on: the table, the best ten and the place of the last
 * win, in signals the page draws, and the deal and the clock, given so a test
 * brings its own.
 */
export interface MemoryContext {
  readonly table: Signal<MemoryTable>;
  readonly best: Signal<readonly MemoryResult[]>;
  readonly place: Signal<number | undefined>;
  readonly deal: () => MemoryTable;
  readonly now: () => number;
}

/**
 * The flow of a game: no card up, one card up, a wrong pair waiting, every pair
 * found.
 */
export interface Memory {
  state: 'ready' | 'oneUp' | 'wrongPair' | 'won';
  events: { turn: number; turnBack: undefined; deal: undefined };
  context: MemoryContext;
}

export type MemoryPhase = Memory['state'];

// #region turn
// the table tells the phase: no card up, one, or a wrong pair, unless all are
// found
const byCardsUp: Record<MemoryTable['open']['length'], MemoryPhase> = {
  0: 'ready',
  1: 'oneUp',
  2: 'wrongPair',
};
const phaseOf = (table: MemoryTable): MemoryPhase =>
  isWon(table) ? 'won' : byCardsUp[table.open.length];

// a card that cannot turn has no target: the send is refused, nothing changes
const toward = ({
  context: { table },
  event,
}: StateMachineSelection<Memory, 'sync', 'turn'>): MemoryPhase | undefined =>
  canTurn(table(), event.data)
    ? phaseOf(turnCard(table(), event.data))
    : undefined;
// #endregion

// every state a turn leads to turns its card up on entering
const turnUp = runActionEffect<Memory>().when(
  { type: 'turn' },
  ({ event, context }) => {
    context.table.update((table) => turnCard(table, event.data));
  }
);

// no card up or one: the next card turns, if it can
const turning: StateMachineStateConfig<Memory> = {
  entry: turnUp,
  on: { turn: toward },
};

/** A game of memory as a state machine over the signals it is given. */
export const memoryMachine = (context: MemoryContext): IStateMachine<Memory> =>
  createStateMachine<Memory>(
    {
      initial: 'ready',
      context,
      // #region deal
      // from any state: leaving a wrong pair turns it down first
      on: {
        deal: {
          target: 'ready',
          actions: ({ context: { table, deal } }): void => {
            table.set(deal());
          },
        },
      },
      // #endregion
      states: {
        ready: turning,
        oneUp: turning,
        // #region wrongPair
        // no `turn` here: a click is refused until `turnBack` arrives
        wrongPair: {
          entry: turnUp,
          exit: ({ context: { table } }): void => {
            table.update(turnBack);
          },
          on: { turnBack: 'ready' },
        },
        // #endregion
        // #region won
        won: {
          entry: [
            turnUp,
            ({ context: { table, best, place, now } }): void => {
              const posted = postResult(best(), {
                moves: table().moves,
                at: now(),
              });
              best.set(posted.board);
              place.set(posted.place);
            },
          ],
        },
        // #endregion
      },
    },
    // a failed action is reported, not thrown at the click that sent the event
    { logger: scopedLogger('memory') }
  );
