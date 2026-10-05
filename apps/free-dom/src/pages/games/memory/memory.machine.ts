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

import type { Leaderboard } from './memory.leaderboard';
import type { MemoryState } from './memory.rules';

/**
 * What the machine works on: the table and the best ten, in signals the page
 * draws, and the deal and the clock, given so a test brings its own.
 */
export interface MemoryContext {
  readonly table: Signal<MemoryState>;
  readonly leaderboard: Signal<Leaderboard>;
  readonly deal: () => MemoryState;
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
const byCardsUp: Record<number, MemoryPhase> = {
  0: 'ready',
  1: 'oneUp',
  2: 'wrongPair',
};
const phaseOf = (table: MemoryState): MemoryPhase =>
  isWon(table) ? 'won' : byCardsUp[table.open.length] ?? 'ready';

// a card that cannot turn has no target: the send is refused, nothing changes
const toward = ({
  context: { table },
  event,
}: StateMachineSelection<Memory, 'sync', 'turn'>): MemoryPhase | undefined =>
  canTurn(table.value, event.data)
    ? phaseOf(turnCard(table.value, event.data))
    : undefined;
// #endregion

// every state a turn leads to turns its card up on entering
const turnUp = runActionEffect<Memory>().when(
  { type: 'turn' },
  ({ event, context }) => {
    context.table.value = turnCard(context.table.value, event.data);
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
            table.value = deal();
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
            table.value = turnBack(table.value);
          },
          on: { turnBack: 'ready' },
        },
        // #endregion
        // #region won
        won: {
          entry: [
            turnUp,
            ({ context: { table, leaderboard, now } }): void => {
              leaderboard.value = postResult(leaderboard.value.board, {
                moves: table.value.moves,
                at: now(),
              });
            },
          ],
        },
        // #endregion
      },
    },
    // a failed action is reported, not thrown at the click that sent the event
    { logger: scopedLogger('memory') }
  );
