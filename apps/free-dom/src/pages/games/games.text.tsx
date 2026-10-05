import { localized } from '../../i18n/localized';

import type { LayersLabels } from './memory/memory.layers';
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
export const memoryChapters = ['rules', 'state', 'machine', 'time', 'card', 'leaderboard', 'dialog', 'wrapUp'] as const;

export type MemoryChapter = (typeof memoryChapters)[number];

/** Quotes a region of a module of the game, cut from the source that runs. */
export type Snippet = (props: { file: string; region: string }) => Node;

interface Chapter {
  title: string;
  Body: (props: { Snippet: Snippet; Diagram: () => Node; Layers: () => Node }) => Node;
}

const en = {
  documentTitle: 'Memory game, built step by step | reely',
  description:
    'A memory game in TypeScript, and how it is built: rules as plain data, a state machine for the flow, signals for the state, time and storage at the edges.',
  title: 'Memory game',
  pitch: 'Sixteen cards, eight reely packages: find every pair in as few moves as you can.',
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
    layers: {
      name: 'The memory game as layers: the rules inside the flow, time, storage and the page at the edges',
      page: 'the page',
      pageHolds: 'cards, dialogs, CSS',
      time: 'time',
      timeHolds: 'the timer',
      storage: 'storage',
      storageHolds: 'the best ten',
      flow: 'the flow',
      flowDoes: 'what can happen when',
      rules: 'the rules',
      rulesAre: 'plain functions over plain data',
      eventsIn: 'events go in',
      stateOut: 'state is read out',
      afterASecond: 'after a second',
      calls: 'calls',
      inward: 'nothing inside knows what is outside',
      sends: 'sends',
      reads: 'reads',
    } satisfies LayersLabels,
    Lede: (): Node => (
      <>
        Memory is the first game many of us ever played: sixteen cards face down, flip two, remember where things are.
        It is also a perfect little lab. Behind its four rules hide the same troubles as in any real app: clicks that
        come too fast, timers that outlive their screen, a page that drifts away from the data behind it. Let’s build it
        step by step and watch a few good habits make those troubles simply not happen. Every piece of code below is the
        real code of the game above.
      </>
    ),
    chapters: {
      rules: {
        title: 'Step 1. Rules first, screen later',
        Body: ({ Snippet }): Node => (
          <>
            <p>
              It’s tempting to start with cards on the page. Let’s not. First we describe the game as plain data and
              call it the table: the deck as it lies, the cards that are up right now, the pairs already found, and the
              number of moves.
            </p>
            <Snippet file='memory.rules.ts' region='state' />
            <p>
              Look at <code>open</code>. At most two cards are ever up, and the type says exactly that: none, one or two
              places. Code that tries to put up a third card won’t even compile, so a whole family of bugs is gone
              before we’ve written a line of logic.
            </p>
            <p>
              Now the main rule. Turning a card is a function: a table goes in, the next table comes out. The
              interesting part is what <code>turnCard</code> does when a card can’t turn, because it’s already up,
              already found, or a wrong pair is still waiting: it returns the very same table. A double click, a click
              on a found card, a click at the wrong moment all change nothing, and nobody had to write a check for them.
            </p>
            <Snippet file='memory.rules.ts' region='turn-card' />
            <p>
              One more trap hides in the shuffle. The popular one-liner <code>sort(() =&gt; Math.random() - 0.5)</code>{' '}
              looks fine, but some orders come up more often than others. <code>shuffled</code> uses the Fisher–Yates
              method instead: take a random card from those left, again and again, and every order is equally likely.
              The randomness comes in as a parameter, so a test can deal exactly the deck it wants.
            </p>
            <Snippet file='memory.rules.ts' region='shuffle' />
            <p>
              Why start here? Data in, data out is the easiest code you will ever test: no browser, no mocks, one line
              per case. Everything that follows only decides <em>when</em> to call these functions, never <em>what</em>{' '}
              they do.
            </p>
          </>
        ),
      },
      state: {
        title: 'Step 2. Keep the state in one place',
        Body: ({ Snippet }): Node => (
          <>
            <p>
              The page has to show the table, and never an old one. The classic bug is copying state into the page by
              hand: you update the move counter, forget the card, and the screen starts to lie.
            </p>
            <p>
              So the state lives in signals: small boxes that remember who looked inside. Read one and you are
              subscribed; change it and exactly those readers update. Here is everything the game remembers:
            </p>
            <Snippet file='memory.game.tsx' region='state' />
            <p>
              <code>deal</code> lays out a fresh table, and <code>table</code> holds the current one. <code>best</code>{' '}
              is the ten best wins; <code>persisted</code> keeps them in <code>localStorage</code>, saved on every
              change, checked when read back, and still working in memory where storage is blocked, as in a private
              window. <code>place</code> is where the last win landed. <code>game</code> is the state machine of the
              next step, given all of the above. And <code>cards</code> follows the table but changes only when the deck
              itself is new, so the sixteen buttons are built again for a new game and never for a simple turn.
            </p>
            <p>
              In any app this is the difference between “the page shows the state” and “the page shows what someone
              remembered to update”. There is nothing to keep in sync and no list of dependencies to get wrong: the page
              reads <code>table()</code> wherever it needs it. The board under the game counts every write to the page;
              play a few moves and see how little each one costs.
            </p>
          </>
        ),
      },
      machine: {
        title: 'Step 3. Give each moment of the game a name',
        Body: ({ Snippet, Diagram }): Node => (
          <>
            <p>
              Now the clicks. A memory game has only four moments: no card up, one card up, a wrong pair waiting, every
              pair found. The usual way to handle them is a couple of flags, like <code>isLocked</code> and{' '}
              <code>firstCard</code>, and an <code>if</code> in every click handler. Forget one <code>if</code> and fast
              clicks break the game.
            </p>
            <p>
              Instead, the four moments become the four states of a state machine, and each state lists the events it
              accepts. Here is the whole machine, and its picture:
            </p>
            <Snippet file='memory.machine.ts' region='machine' />
            <Diagram />
            <p>
              Read it from the top. A new game, <code>deal</code>, is accepted in any state and leads to{' '}
              <code>ready</code>. <code>ready</code> and <code>oneUp</code> behave the same, so they share one piece of
              config, <code>turning</code>. <code>wrongPair</code> has no <code>turn</code> at all: while a wrong pair
              is up, every click is refused, not because someone remembered a check, but because there is nothing to
              check. When the pair turns back, its <code>exit</code> puts both cards face down. And <code>won</code>{' '}
              posts the result to the best ten.
            </p>
            <p>
              Here is <code>turning</code>. Whatever state a <code>turn</code> leads to, its card goes up on the way in:
            </p>
            <Snippet file='memory.machine.ts' region='turning' />
            <p>
              And where does a <code>turn</code> lead? <code>toward</code> asks the rules. A card that can’t turn has no
              target, so the machine answers <code>refused</code> and nothing changes. Otherwise it turns the card on
              paper and looks at the result: zero, one or two cards up, unless every pair is found.
            </p>
            <Snippet file='memory.machine.ts' region='turn' />
            <p>
              This pays off in any app. A state machine turns “which mix of flags is possible?” into a short list you
              can read at a glance, and a mix that makes no sense, like two cards up with the board unlocked, can’t even
              be written down. Every event in every state has exactly one answer, so double clicks and fast taps can’t
              sneak between two checks. Forms that submit and retry, wizards, players and connections all have this
              shape. Here it lets a test throw five thousand random clicks, new games and turn-backs at the machine and
              check the rules after every single one.
            </p>
          </>
        ),
      },
      time: {
        title: 'Step 4. Let time live outside',
        Body: ({ Snippet }): Node => (
          <>
            <p>
              A wrong pair should stay up for a second, then turn back. The first idea is a <code>setTimeout</code> in
              the click handler, and that is where the trouble starts: a variable for the timer, a cancel on a new game,
              another cancel when the player leaves the page. Miss one, and an old timer flips the cards of the next
              game.
            </p>
            <p>
              Our machine doesn’t know what time it is, on purpose: it only reacts to events. So the page sends{' '}
              <code>turnBack</code>, and the whole timer is this:
            </p>
            <Snippet file='memory.game.tsx' region='timer' />
            <p>
              The <code>effect</code> runs again whenever the phase changes, and <code>later</code> cancels its timer
              when it does. A new game changes the phase, and the timer is gone. The page goes away, and the timer is
              gone. There is no timer id to keep anywhere.
            </p>
            <p>
              The general rule: anything that lives for a while, a timer, a listener, a request, belongs to the code
              that started it and stops together with it. Then cleanup isn’t something you write and forget; it just
              happens.
            </p>
          </>
        ),
      },
      card: {
        title: 'Step 5. A card is a button and a bit of CSS',
        Body: ({ Snippet }): Node => (
          <>
            <p>
              A card has to flip nicely and tell a screen reader what it shows. It is a real button, built once, and
              only two things on it follow the game: <code>data-side</code> and its label.
            </p>
            <Snippet file='memory.card.tsx' region='card' />
            <p>
              The flip is plain CSS. <code>data-side</code> turns the card in 3D, and each side hides when it faces
              away:
            </p>
            <Snippet file='memory.module.css' region='flip' />
            <p>
              Motion makes some people feel sick, and their system can say so. So the turn exists only when nobody asked
              to reduce motion; everyone else plays the same game, just without the spin.
            </p>
            <Snippet file='memory.module.css' region='motion' />
            <p>
              The code says what state a card is in; CSS decides how it looks and moves. The browser runs the animation
              on its own, so a busy script doesn’t make it stutter, and a redesign never touches the logic.
            </p>
          </>
        ),
      },
      leaderboard: {
        title: 'Step 6. The best ten',
        Body: ({ Snippet }): Node => (
          <>
            <p>
              We want the ten best wins, fewest moves first and the earlier day on a tie, and the place of the new one.
              That is a pure function again: drop the same result if it is already there, add the new one, sort, keep
              ten, and say where the new one landed.
            </p>
            <Snippet file='memory.leaderboard.ts' region='rank' />
            <p>
              Two small details. Nobody calls “save”: the machine sets <code>best</code>, and <code>persisted</code>{' '}
              writes it down. And only the list is saved, not the place; otherwise, after a reload or in another tab,
              the dialog would proudly highlight a win that isn’t yours.
            </p>
          </>
        ),
      },
      dialog: {
        title: 'Step 7. Use the dialog the browser already has',
        Body: ({ Snippet }): Node => (
          <>
            <p>
              We need two dialogs, the win and the leaderboard. Each closes with a button, with Escape, or with a click
              outside, and while one is open the page behind it can’t be clicked or scrolled. A hand-made modal means
              juggling focus, layers and stray clicks yourself.
            </p>
            <p>
              The native <code>&lt;dialog&gt;</code> with <code>showModal</code> does most of it for free: the page
              behind becomes inert, and Escape closes it. Our component only adds <code>open</code>, a signal that
              follows the <code>close</code> event. A click outside lands on the dialog itself, which has no padding,
              and closes it too.
            </p>
            <Snippet file='modal.tsx' region='dialog' />
            <p>And keeping the page still is one CSS rule:</p>
            <Snippet file='memory.module.css' region='scroll-lock' />
            <p>
              A native element brings keyboard, focus and screen-reader behaviour that a custom one has to rebuild, and
              then maintain forever.
            </p>
          </>
        ),
      },
      wrapUp: {
        title: 'What we ended up with',
        Body: ({ Layers }): Node => (
          <>
            <p>Step back and look at the whole thing:</p>
            <Layers />
            <p>
              That is the whole trick, and it isn’t about memory games. Keep decisions where you can see them, push side
              effects to the edges, let one place own the state. Then double clicks, stray timers and a screen out of
              sync stop being bugs you fix; they become things that can’t happen.
            </p>
            <p>
              Want to see it move? Open “The code that just ran” under the board, make a move, and watch which part of
              the machine answers.
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
