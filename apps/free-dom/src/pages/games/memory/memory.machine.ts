import { scopedLogger } from '@reely/logger';
import { ObjectStore } from '@reely/simple-store';
import { createStateMachine, runActionEffect } from '@reely/state-machine';
import type {
  IStateMachine,
  StateMachineSelection,
} from '@reely/state-machine';
import { noop } from '@reely/utils';

import { createLeaderboard, postResult } from './memory.leaderboard';
import { canTurn, isWon, turnBack, turnCard } from './memory.rules';

import type { Leaderboard } from './memory.leaderboard';
import type { MemoryState } from './memory.rules';

/** How long a wrong pair stays up before it turns back, in ms. */
export const turnBackAfter = 1000;

/**
 * The world outside the game, reached through parameters, so the machine runs
 * and is tested without it.
 */
export interface MemoryWorld {
  readonly deal: () => MemoryState;
  /** The clock that dates a win. */
  readonly now: () => number;
  /** Runs `fn` after `ms`; returns the cancel. */
  readonly later: (ms: number, fn: VoidFunction) => VoidFunction;
  /** Where the best ten are kept; without it they last as long as the page. */
  readonly storage?: Pick<Storage, 'getItem' | 'setItem'>;
}

/**
 * What the machine works on: the stores it writes, the table and the best ten,
 * and its world.
 */
export interface MemoryContext extends MemoryWorld {
  readonly table: ObjectStore<MemoryState>;
  readonly leaderboard: ObjectStore<Leaderboard>;
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
const phaseOf = (table: MemoryState): MemoryPhase =>
  isWon(table)
    ? 'won'
    : (['ready', 'oneUp', 'wrongPair'] as const)[table.open.length] ?? 'ready';

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

/**
 * A game of memory as a state machine, with stores of its own for the table and
 * the best ten.
 */
export const memoryMachine = (world: MemoryWorld): IStateMachine<Memory> => {
  const context: MemoryContext = {
    ...world,
    table: new ObjectStore(world.deal()),
    leaderboard: createLeaderboard(world.storage),
  };
  let cancelTurnBack: VoidFunction = noop;

  return createStateMachine<Memory>(
    {
      initial: 'ready',
      context,
      // #region deal
      // from any state: leaving a wrong pair cancels its timer
      on: {
        deal: {
          target: 'ready',
          actions: ({ context: { table, deal } }) => (table.value = deal()),
        },
      },
      // #endregion
      states: {
        ready: { entry: turnUp, on: { turn: toward } },
        oneUp: { entry: turnUp, on: { turn: toward } },
        // #region wrongPair
        // no `turn` here: a click is refused until the pair turns back
        wrongPair: {
          entry: [
            turnUp,
            ({ machine, context: { later } }): void => {
              cancelTurnBack = later(turnBackAfter, () =>
                machine.send('turnBack')
              );
            },
          ],
          exit: [
            (): void => cancelTurnBack(),
            ({ context: { table } }): void => {
              table.value = turnBack(table.value);
            },
          ],
          on: { turnBack: 'ready' },
        },
        // #endregion
        // #region won
        won: {
          entry: [
            turnUp,
            ({ context: { table, leaderboard, now } }): void => {
              leaderboard.set(({ board }) =>
                postResult(board, { moves: table.value.moves, at: now() })
              );
            },
          ],
        },
        // #endregion
      },
    },
    // a failed action is reported, not thrown at the click that sent the event
    { logger: scopedLogger('memory') }
  );
};
