import { localized } from '../../i18n/localized';

import type { SitePackage } from '../../site/site.packages';

/** The packages the memory game is made with; the credits name the part each one does. */
export const memoryPackages = [
  'state-machine',
  'signals',
  'dommy',
  'dommy-kit',
  'logger',
] as const satisfies readonly SitePackage[];

type MemoryPackage = (typeof memoryPackages)[number];

/** The chapters of the story under the game, in reading order. */
export const memoryChapters = ['rules', 'machine', 'time', 'state', 'card', 'leaderboard', 'dialog', 'proof'] as const;

export type MemoryChapter = (typeof memoryChapters)[number];

/** Quotes a region of a module of the game, cut from the source that runs. */
export type Snippet = (props: { file: string; region: string }) => Node;

interface Chapter {
  title: string;
  Body: (props: { Snippet: Snippet }) => Node;
}

const en = {
  documentTitle: 'Memory game without one if | reely',
  description:
    'A memory game in TypeScript with no if in its code: a state machine moves it on over signals the page draws. Play it, then read how it is built.',
  title: 'Memory game',
  pitch: 'Sixteen cards, eight reely packages: find every pair in as few moves as you can.',
  branches: 'in its code, and not one switch either',
  loadingSource: 'Loading the source…',
  sourceFailed: 'The source failed to load; reload the page to try again.',
  madeWith: 'The game is made with',
  parts: {
    'state-machine': 'the flow of the game',
    signals: 'reactive state',
    dommy: 'the DOM: cards, counters, dialogs',
    'dommy-kit': 'the timer',
    logger: 'error reports',
  } satisfies Record<MemoryPackage, string>,
  builtWith:
    'The board under the game counts every DOM write it makes; the code that ran for each move is one click away.',
  story: {
    title: 'How the game is built',
    Lede: (): Node => (
      <>
        Memory is a small game, which makes it a good place to watch reely’s packages work together with nothing in the
        way. Here is how this one is built, in the order you would build it yourself: the rules first, then the moments
        of the game, then time, storage and the page. Every piece of code below is cut from the modules that run the
        game above, not from a tidied-up copy.
      </>
    ),
    chapters: {
      rules: {
        title: 'Start with the rules, not the page',
        Body: ({ Snippet }): Node => (
          <>
            <p>
              Before there is a single card on the screen, a game is a plain value: the deck as it lies, the cards
              turned up in this move, the faces already found, and the moves. Nothing in it knows about the DOM, a timer
              or a click, so every rule can be tested without a browser.
            </p>
            <Snippet file='memory.rules.ts' region='state' />
            <p>
              Turning a card is a function from one game to the next. The part worth noticing is what it does when a
              card can’t turn, because it is already up, already found, or a wrong pair is still waiting: it returns the
              very same object. So a double click counts nothing, and no click handler needs a guard against it.
            </p>
            <Snippet file='memory.rules.ts' region='turn-card' />
            <p>
              The deck is shuffled the way Ronald Fisher and Frank Yates described it in 1938: each card is drawn at
              random from those still left. Every order is equally likely, and the random source is a parameter, so a
              test deals exactly the deck it needs.
            </p>
            <Snippet file='memory.rules.ts' region='shuffle' />
          </>
        ),
      },
      machine: {
        title: 'Four moments, one state machine',
        Body: ({ Snippet }): Node => (
          <>
            <p>
              A memory game has very few moments: nothing is up, one card is up, a wrong pair is waiting, every pair is
              found. Most implementations hide them in a couple of booleans and the <code>if</code>s that check them in
              every handler. Here they are the four states of a <code>@reely/state-machine</code>, and the current one
              is read straight off the table: no card up, one, or two.
            </p>
            <Snippet file='memory.machine.ts' region='turn' />
            <p>
              A card does one thing on a click: it sends <code>turn</code>. It never asks whether it may. Where the
              rules say no, the selector returns <code>undefined</code>, the machine answers <code>refused</code>, and
              nothing changes. While a wrong pair waits there is no <code>turn</code> at all, so every click is refused
              by construction, not by a check someone might forget to write.
            </p>
            <Snippet file='memory.machine.ts' region='wrongPair' />
            <p>
              That is why the figure at the top can say <code>0 if</code>. The decisions are still there; they live in
              the machine’s config and in a few lookup tables, where you can read all of them in one place.
            </p>
          </>
        ),
      },
      time: {
        title: 'The machine keeps no time; the view does',
        Body: ({ Snippet }): Node => (
          <>
            <p>
              A wrong pair has to turn back after a second. The tempting move is a <code>setTimeout</code> inside the
              machine, then a cancel for it, a variable to hold the cancel, and the question of who calls it on a new
              game. <code>@reely/state-machine</code> has no clock on purpose: you send it events. So the view sends{' '}
              <code>turnBack</code>.
            </p>
            <Snippet file='memory.game.tsx' region='timer' />
            <p>
              <code>later</code> from <code>@reely/dommy-kit</code> inside an <code>effect</code> is the whole timer.
              The effect reads the phase; when the phase changes, the effect runs again, and the timer of its last run
              is cancelled with it. A new game cancels it, leaving the page cancels it, and there is no handle to keep.
            </p>
          </>
        ),
      },
      state: {
        title: 'One state, in signals',
        Body: ({ Snippet }): Node => (
          <>
            <p>
              The whole state of the game is two signals: the table, and the best ten. The machine writes them, the page
              reads them, and a signal bound to a node updates exactly that node, so there is nothing to sync and
              nothing to subscribe by hand.
            </p>
            <Snippet file='memory.game.tsx' region='state' />
            <p>
              The best ten are a <code>persisted</code> signal from <code>@reely/dommy-kit</code>: written to{' '}
              <code>localStorage</code> on every change, checked when read back, and kept in memory alone where storage
              fails, in a private window or with a full quota. The deck is a <code>computed</code> of the table: it
              notifies only when the deck itself is new, so the sixteen buttons are laid out again on a new game, and
              never on a turn.
            </p>
          </>
        ),
      },
      card: {
        title: 'A card binds two things, and CSS turns it',
        Body: ({ Snippet }): Node => (
          <>
            <p>
              A card is a button, built once. Of everything inside it, only two things follow the game:{' '}
              <code>data-side</code>, and the label a screen reader announces. A turn writes those two attributes on one
              button; the board under the game counts them as you play.
            </p>
            <Snippet file='memory.card.tsx' region='card' />
            <p>
              The flip itself isn’t JavaScript. The side in <code>data-side</code> drives a 3D turn in CSS, and the back
              and the face hide whenever they look away.
            </p>
            <Snippet file='memory.module.css' region='flip' />
            <p>
              The motion is opt-in: the transition exists only for those who haven’t asked their system to reduce
              motion. Everyone else plays the same game, without the turn.
            </p>
            <Snippet file='memory.module.css' region='motion' />
          </>
        ),
      },
      leaderboard: {
        title: 'The best ten, as a pure function',
        Body: ({ Snippet }): Node => (
          <>
            <p>
              Posting a win is a pure function again: drop an identical result, add the new one, sort by moves and then
              by the earlier day, keep ten. It also says where the new result landed, which is how the victory dialog
              knows your place.
            </p>
            <Snippet file='memory.leaderboard.ts' region='rank' />
            <p>
              Nobody calls save: the machine assigns the result to the leaderboard signal, and <code>persisted</code>{' '}
              writes it down.
            </p>
          </>
        ),
      },
      dialog: {
        title: 'Use the dialog the browser already has',
        Body: ({ Snippet }): Node => (
          <>
            <p>
              Both dialogs, the win and the leaderboard, are one small component over the native{' '}
              <code>&lt;dialog&gt;</code>. <code>showModal</code> makes the page behind it inert, so no card or button
              can be clicked; Escape closes it on its own, and the signal follows the <code>close</code> event. A click
              on the dimmed page lands on the dialog itself, because the dialog has no padding of its own.
            </p>
            <Snippet file='modal.tsx' region='dialog' />
            <p>Holding the page still is one rule of CSS: while the root has an open dialog, it doesn’t scroll.</p>
            <Snippet file='memory.module.css' region='scroll-lock' />
          </>
        ),
      },
      proof: {
        title: 'Proof, not a promise',
        Body: ({ Snippet }): Node => (
          <>
            <p>
              The <code>0 if</code> at the top isn’t typed by hand. The page imports every module of the game as
              highlighted source, drops the comments and counts <code>if</code> and <code>switch</code> statements, and
              a test fails the moment one appears. The code in this story is cut from the same files by region markers,
              so what you have just read is exactly what runs.
            </p>
            <Snippet file='memory.sources.ts' region='count' />
            <p>
              Under the board, “The code that just ran” shows the same thing live: open it, make a move, and see the
              part of the machine that answered.
            </p>
          </>
        ),
      },
    } satisfies Record<MemoryChapter, Chapter>,
    Ending: (): Node => (
      <>
        Every module, with its specs next to it, is on{' '}
        <a href='https://github.com/JsPowWow/reely/tree/main/apps/free-dom/src/pages/games/memory'>GitHub</a>.
      </>
    ),
  },
};

export type GamesText = typeof en;

export const gamesText = localized(en, () => import('./games.text.ru').then((module) => module.ru));
