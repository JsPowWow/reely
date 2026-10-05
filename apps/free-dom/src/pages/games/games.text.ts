import { localized } from '../../i18n/localized';

import type { SitePackage } from '../../site/site.packages';

/** The packages the memory game is made with; the credits name the part each one does. */
export const memoryPackages = ['signals', 'dommy', 'dommy-kit'] as const satisfies readonly SitePackage[];

type MemoryPackage = (typeof memoryPackages)[number];

/** The modules of the game shown under it, in reading order. */
export type MemoryModule = 'game' | 'rules' | 'leaderboard' | 'modal';

const en = {
  documentTitle: 'Memory | reely',
  title: 'Memory',
  pitch:
    'Sixteen cards, eight reely packages. Turn two at a time and find every pair in as few moves as you can; a wrong pair turns back after a second. Your best ten wins stay in this browser.',
  madeWith: 'The game is made with',
  parts: {
    signals: 'the state of the game, its moves and its pairs',
    dommy: 'the cards, the counters and both dialogs',
    'dommy-kit': 'the second before a wrong pair turns back, and the leaderboard kept in localStorage',
  } satisfies Record<MemoryPackage, string>,
  builtWith: 'The board under the game counts every DOM write it makes.',
  modules: {
    game: {
      title: 'The game, on the page',
      claim:
        'A component that runs once: each card binds its side, its name for a screen reader and nothing else, so a turn writes a few attributes of one button. A new game lays out new cards.',
    },
    rules: {
      title: 'The rules, without a page',
      claim:
        'A game is a plain value, and turning a card gives the next one: a card that cannot turn gives the same game back, so a repeated click counts nothing. The deck is shuffled by Fisher–Yates.',
    },
    leaderboard: {
      title: 'The best ten',
      claim:
        'Fewest moves first, the earlier win first among equals; one win is posted once. What storage gives back is checked before it is trusted.',
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
