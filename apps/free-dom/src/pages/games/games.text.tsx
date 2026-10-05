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
        Here is how this game is made, step by step. At each step: what we want, why we do it this way, where it usually
        goes wrong, and what reely does to help. All the code below is taken from the game you just played, not from a
        cleaned-up copy.
      </>
    ),
    chapters: {
      rules: {
        title: 'Step 1. Rules first, no page yet',
        Body: ({ Snippet }): Node => (
          <>
            <p>
              We want rules we can check without a browser. So the game starts as plain data: the deck, the cards turned
              up right now, the pairs found, and the number of moves. No DOM, no timer, no clicks.
            </p>
            <Snippet file='memory.rules.ts' region='state' />
            <p>
              Turning a card is a function: it takes a game and gives back the next one. The catch is the clicks that
              should do nothing: a fast double click, a click on a found card, a click while a wrong pair is still up.
              Usually each of them needs its own check in the click handler. Here, when a card can’t turn, the function
              simply returns the same game. Nothing changes, so there is nothing to guard against.
            </p>
            <Snippet file='memory.rules.ts' region='turn-card' />
            <p>
              Shuffling has a catch too. The popular <code>sort(() =&gt; Math.random() - 0.5)</code> looks fine, but
              some orders come up more often than others. We use the Fisher–Yates method instead: take a random card
              from those left, again and again. Every order is equally likely. The random source is a parameter, so a
              test can deal exactly the deck it needs.
            </p>
            <Snippet file='memory.rules.ts' region='shuffle' />
            <p>reely isn’t needed here at all, and that is the point: the rules don’t depend on any framework.</p>
          </>
        ),
      },
      machine: {
        title: 'Step 2. Give each moment of the game a name',
        Body: ({ Snippet }): Node => (
          <>
            <p>
              A click should do the right thing at the right moment. The game has only four moments: no card up, one
              card up, a wrong pair waiting, all pairs found.
            </p>
            <p>
              The usual way is a few flags, like <code>isLocked</code> or <code>firstCard</code>, and an <code>if</code>{' '}
              in every handler to check them. Forget one <code>if</code>, and fast clicks break the game. With{' '}
              <code>@reely/state-machine</code> each moment is a state, and the current one comes straight from the
              table: zero, one or two cards up.
            </p>
            <Snippet file='memory.machine.ts' region='turn' />
            <p>
              A card only sends <code>turn</code>. It never asks whether it is allowed to. When the rules say no, the
              machine answers <code>refused</code> and nothing changes. While a wrong pair is waiting, that state simply
              has no <code>turn</code>, so every click is refused. There is no check to forget, because there is no
              check.
            </p>
            <Snippet file='memory.machine.ts' region='wrongPair' />
            <p>
              That is where the <code>0 if</code> at the top comes from. The decisions haven’t gone anywhere: they sit
              in the machine’s config and a small lookup table, all in one place.
            </p>
          </>
        ),
      },
      time: {
        title: 'Step 3. Turn a wrong pair back after a second',
        Body: ({ Snippet }): Node => (
          <>
            <p>
              A wrong pair should stay up for a second, then turn back. The obvious answer is <code>setTimeout</code>,
              and that is where the trouble starts: a variable for the timer id, cancelling it on a new game, cancelling
              it when the reader leaves the page. Miss one, and an old timer turns back cards of the next game.
            </p>
            <p>
              The machine keeps no clock on purpose: it only reacts to events. So the page sends <code>turnBack</code>,
              and <code>later</code> from <code>@reely/dommy-kit</code>, inside an <code>effect</code>, is the whole
              timer.
            </p>
            <Snippet file='memory.game.tsx' region='timer' />
            <p>
              The effect reads the phase. When the phase changes, the effect runs again and the timer of its last run is
              cancelled. A new game cancels it, leaving the page cancels it, and there is no id to keep anywhere.
            </p>
          </>
        ),
      },
      state: {
        title: 'Step 4. Keep the state in signals',
        Body: ({ Snippet }): Node => (
          <>
            <p>
              The page should always show the game as it is. When you copy state into the DOM by hand, you will sooner
              or later forget a place, and the screen starts to lie.
            </p>
            <p>
              With <code>@reely/signals</code> the whole state is three signals: the table, the best ten, and the place
              of the last win. The machine changes them with <code>set</code> and <code>update</code>; the page reads
              them with a plain call, <code>table()</code>. A signal bound to a node updates that node and nothing else.
              There is nothing to sync and nothing to subscribe to by hand.
            </p>
            <Snippet file='memory.game.tsx' region='state' />
            <p>
              The best ten are a <code>persisted</code> signal from <code>@reely/dommy-kit</code>. It is saved to{' '}
              <code>localStorage</code> on every change, checked when read back, and still works in memory where storage
              fails, for example in a private window.
            </p>
            <p>
              One more catch: rebuilding all sixteen cards on every turn would be wasteful. The deck is a{' '}
              <code>computed</code> of the table, and it only reports a change when the deck itself is new. So the
              buttons are built again on a new game, and never on a turn.
            </p>
          </>
        ),
      },
      card: {
        title: 'Step 5. A card is a button plus CSS',
        Body: ({ Snippet }): Node => (
          <>
            <p>
              A card should flip smoothly and tell a screen reader what it shows. It is a real button, built once. Only
              two things in it follow the game: <code>data-side</code> and the label a screen reader reads. A turn
              changes those two attributes on one button, and the board under the game counts them as you play.
            </p>
            <Snippet file='memory.card.tsx' region='card' />
            <p>
              The flip isn’t JavaScript. <code>data-side</code> drives a 3D turn in CSS, and each side hides when it
              faces away.
            </p>
            <Snippet file='memory.module.css' region='flip' />
            <p>
              The catch: motion makes some people dizzy. So the animation only exists when the system hasn’t asked to
              reduce motion. Everyone else gets the same game, just without the turn.
            </p>
            <Snippet file='memory.module.css' region='motion' />
          </>
        ),
      },
      leaderboard: {
        title: 'Step 6. The best ten',
        Body: ({ Snippet }): Node => (
          <>
            <p>
              We want the ten best wins, by moves and then by the earlier day, and the winner’s place in them. This is a
              pure function again: drop the same result if it is already there, add the new one, sort, keep ten, and say
              where the new one landed.
            </p>
            <Snippet file='memory.leaderboard.ts' region='rank' />
            <p>
              The catch: if the place were saved together with the list, a reload or another tab would highlight a win
              that isn’t yours. So only the list is saved, and the place lives in memory.
            </p>
            <p>
              Nobody calls save. The machine sets the best ten, and <code>persisted</code> writes them down.
            </p>
          </>
        ),
      },
      dialog: {
        title: 'Step 7. Use the browser’s own dialog',
        Body: ({ Snippet }): Node => (
          <>
            <p>
              We need two dialogs, the win and the leaderboard. Each closes with a button, with Escape, or with a click
              outside, and while one is open the page behind it can’t be clicked or scrolled. A hand-made modal means
              catching focus, Escape, layers and stray clicks yourself.
            </p>
            <p>
              The native <code>&lt;dialog&gt;</code> with <code>showModal</code> does most of it: the page behind
              becomes inert, and Escape closes it on its own. Our component is small: whether it is open is a signal,
              and the signal follows the <code>close</code> event. A click outside lands on the dialog itself, because
              the dialog has no padding, and that closes it too.
            </p>
            <Snippet file='modal.tsx' region='dialog' />
            <p>Keeping the page still is one CSS rule: while a dialog is open, the page doesn’t scroll.</p>
            <Snippet file='memory.module.css' region='scroll-lock' />
          </>
        ),
      },
      proof: {
        title: 'Step 8. Prove it',
        Body: ({ Snippet }): Node => (
          <>
            <p>
              <code>0 if</code> shouldn’t be just a nice line in the header. The page loads the source of every module
              of the game, strips the comments and counts <code>if</code> and <code>switch</code>. A test fails as soon
              as one appears. The code in this story is cut from the same files, so what you have read is exactly what
              runs.
            </p>
            <Snippet file='memory.sources.ts' region='count' />
            <p>
              You can also watch it live. Open “The code that just ran” under the board, make a move, and see which part
              of the machine answered.
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
