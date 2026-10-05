import { localized } from '../../i18n/localized';

import type { MemoryModule } from './memory/memory.sources';
import type { SitePackage } from '../../site/site.packages';

/** The packages the memory game is made with; the credits name the part each one does. */
export const memoryPackages = [
  'state-machine',
  'simple-store',
  'signals',
  'dommy',
] as const satisfies readonly SitePackage[];

type MemoryPackage = (typeof memoryPackages)[number];

const en = {
  documentTitle: 'Memory, a game without one if | reely',
  description:
    'A memory game in TypeScript with no if in its code: a state machine moves it on, stores hold it, signals draw it. Play it, then read the code that just ran.',
  title: 'Memory',
  pitch: 'Sixteen cards, eight reely packages: find every pair in as few moves as you can.',
  facts: {
    ifs: ' in its code: a state machine decides',
    lines: 'lines of code, counted on this page',
    modules: 'modules, the main six shown below',
  },
  loadingSource: 'Loading the source…',
  sourceFailed: 'The source failed to load; reload the page to try again.',
  madeWith: 'The game is made with',
  parts: {
    'state-machine': 'the flow: one card up, a wrong pair waiting, a win',
    'simple-store': 'the table and the best ten, saved on every change',
    signals: 'what the page draws, following the stores',
    dommy: 'the cards, the counters and both dialogs',
  } satisfies Record<MemoryPackage, string>,
  builtWith:
    'The board under the game counts every DOM write it makes; the code that ran for each move is one click away.',
  modules: {
    machine: {
      title: 'A state machine moves the game on',
      claim:
        'Four states and three events. A card sends turn and never asks whether it may: where the rules allow no turn, the machine refuses it. The wrong pair’s timer starts on entering its state and stops on leaving it, so a new game cancels it on its own.',
    },
    game: {
      title: 'Stores hold it, signals draw it',
      claim:
        'The table and the best ten live in stores the machine writes; the page follows them through signals, so a turn writes a few attributes of one card. A new game lays out new cards.',
    },
    leaderboard: {
      title: 'The best ten',
      claim:
        'Fewest moves first, the earlier win first among equals; one win is posted once. The store saves its board whenever the board changes, and checks what storage gives back before it trusts it.',
    },
    rules: {
      title: 'The rules, without a page',
      claim:
        'A game is a plain value, and turning a card gives the next one; a card that cannot turn gives the same game back. The deck is shuffled by Fisher–Yates.',
    },
    moments: {
      title: 'The code that just ran',
      claim:
        'Under the board, out of the way until asked for: each move shows the part of the machine that ran for it, cut from the same source as the listing above by its region markers.',
    },
    modal: {
      title: 'One dialog for both',
      claim:
        'The victory and the leaderboard are the same component over a native dialog: the page behind it is inert, and Escape, a click outside or a button closes it. The game goes on behind it.',
    },
  } satisfies Record<MemoryModule, { title: string; claim: string }>,
};

export type GamesText = typeof en;

export const gamesText = localized(en, () => import('./games.text.ru').then((module) => module.ru));
