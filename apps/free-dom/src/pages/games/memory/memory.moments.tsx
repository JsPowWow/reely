import { Await, Keyed, Show, signal } from '@reely/dommy';
import type { ReelyNode, Signal } from '@reely/dommy';
import type { StateMachineChange } from '@reely/state-machine';

import { SourceView } from '../../../demo/source.view';
import { sourceRegion } from '../../../highlight/source.regions';
import { pluralOf } from '../../../i18n/plural';

import css from './memory.module.css';

import type { Memory, MemoryPhase } from './memory.machine';
import type { MemoryState } from './memory.rules';

/** What the code panel shows: the region of the machine that ran, and why. */
export interface CodeMoment {
  readonly region: 'turn' | 'deal' | 'wrongPair' | 'won';
  readonly caption: string;
}

/** A transition taken: the code that ran, and what the player reads then. */
export interface Moment extends CodeMoment {
  readonly status: (table: MemoryState) => string;
}

const pluralEn = pluralOf('en');
export const movesOf = (count: number): string =>
  `${count} ${pluralEn(count, { one: 'move', other: 'moves' })}`;

const nothingUp = (): string => 'Turn a card.';
const upFaces = ({ deck, open }: MemoryState): string =>
  open.map((place) => deck[place]).join(' and ');

/** Every transition, by its event, or by the state a turn reached. */
export const moments: Record<MemoryPhase | 'deal' | 'turnBack', Moment> = {
  deal: {
    region: 'deal',
    caption:
      'New game: `deal` is taken from any state; `exit` stops the timer.',
    status: nothingUp,
  },
  oneUp: {
    region: 'turn',
    caption: 'The first card: one card up is `oneUp`, whose `entry` turns it.',
    status: (table) => `${upFaces(table)}: now find its pair.`,
  },
  ready: {
    region: 'turn',
    caption: 'A pair: no card is left up, so the game is `ready` again.',
    status: ({ found }) => `A pair of ${found.at(-1)}.`,
  },
  wrongPair: {
    region: 'wrongPair',
    caption: 'No match: `wrongPair` refuses every `turn` until `turnBack`.',
    status: (table) => `${upFaces(table)} do not match.`,
  },
  turnBack: {
    region: 'wrongPair',
    caption: 'A second later `turnBack` came, and `exit` turned the pair down.',
    status: nothingUp,
  },
  won: {
    region: 'won',
    caption: 'Every pair found: `won` posts the result to the leaderboard.',
    status: ({ found, moves }) =>
      `All ${found.length} pairs found in ${movesOf(moves)}.`,
  },
};

export const momentOf = ({ event, to }: StateMachineChange<Memory>): Moment =>
  moments[event.type === 'turn' ? to : event.type];

/** A turn the machine refused: the state it was in has no target for it. */
export const refused = (state: MemoryPhase): CodeMoment => ({
  region: moments[state].region,
  caption: `Refused: \`${state}\` takes this card nowhere, so nothing changes.`,
});

// the names in backticks are code: every other piece of the split
const withCode = (text: string): ReelyNode[] =>
  text
    .split('`')
    .map((part, index) => (index % 2 ? <code>{part}</code> : part));

/**
 * Out of the way until asked for: a disclosure under the board that shows the
 * part of the machine that ran for the last move, cut from its source; the
 * highlighted source loads the first time it is opened.
 */
export const MomentCode = ({
  moment,
}: {
  moment: Signal<CodeMoment>;
}): Node => {
  const open = signal(false);
  return (
    <details
      className={css.code}
      onToggle={(event) => open.set(event.currentTarget.open)}
    >
      <summary className={css.codeToggle}>The code that just ran</summary>
      <Show when={open}>
        {() => (
          <Await
            promise={import('./memory.sources')}
            fallback={() => <p className={css.note}>Loading the code…</p>}
            catch={() => <p className={css.note}>The code failed to load.</p>}
          >
            {({ machineSource }) => (
              <Keyed value={moment}>
                {({ region, caption }) => (
                  <>
                    <p className={css.said}>{withCode(caption)}</p>
                    <SourceView
                      source={sourceRegion(machineSource, region)}
                      caption='memory.machine.ts'
                    />
                  </>
                )}
              </Keyed>
            )}
          </Await>
        )}
      </Show>
    </details>
  );
};
