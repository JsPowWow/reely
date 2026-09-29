# @reely/dommy

Real DOM from tag factories and JSX, bound to signals. There is no virtual DOM and no re-render: a component runs once, and a signal updates exactly the one text node or attribute bound to it.

```tsx
import { mount, signal } from '@reely/dommy';

const count = signal(0);

mount(document.body, () => (
  <p>
    <button onClick={() => (count.value += 1)}>+1</button>
    <output>{count}</output>
  </p>
));
```

Each click changes the text of one text node inside `<output>`; nothing else in the page is touched.

## Install

```sh
npm i @reely/dommy@next
```

It has no third-party dependencies: its one dependency is `@reely/basics`, small helpers from the same repo. It ships ES modules with TypeScript types.

### JSX setup

`tsconfig.json`:

```json
{
  "compilerOptions": {
    "jsx": "react-jsx",
    "jsxImportSource": "@reely/dommy"
  }
}
```

esbuild: `--jsx=automatic --jsx-import-source=@reely/dommy`. Vite takes the same two options from `tsconfig.json`.

## Elements

Every HTML tag is a factory that returns a real element: props first, children after. JSX compiles to the same calls.

```tsx
import { a, li, ul } from '@reely/dommy';

const links = ul({ className: 'links' }, li(null, a({ href: '/docs' }, 'Docs')));
const same = (
  <ul className="links">
    <li>
      <a href="/docs">Docs</a>
    </li>
  </ul>
);
```

- Props are DOM property names: `className`, `htmlFor`, `tabIndex`, and lowercase where the DOM has them so: `autocomplete`, `autofocus`. `value`, `checked` and other live state are set as properties, after the children, so `<select value="b">` selects its option `b`; attributes go before them.
- `list` and `form`, which the DOM types as elements, take an id: `<input list="cars" />`.
- `styles={{ marginTop: '1rem', '--accent': 'red' }}` sets inline styles, custom properties included.
- `aria={{ role: 'status', ariaLabel: 'Score' }}` sets `role` and `aria-*` attributes.
- Handler props take a function, named the DOM way (`onkeydown`) or in camelCase with every word capitalised, as in React (`onKeyDown`, `onPointerMove`; `dblclick` is `onDblClick`). The event and `event.currentTarget` are typed by the element. A string is never rendered as an inline handler.
- `elementRef` gets the element: an object from `createObjectReference()` or a function `(element) => void`.
- Text is always inserted as text, so user input cannot become markup.

## Components

A component is a function of props that runs once. It returns a `ReelyNode`, the counterpart of React's `ReactNode`: a node, text, a number, a getter, nothing (`null`, `undefined`, a boolean) or a list of these. `children` are a `ReelyNode` too.

A JSX expression is always a `Node`, ready for `append`. A tag gives its element; a component that returns anything else gives a `DocumentFragment` holding it.

```tsx
import { signal } from '@reely/dommy';
import type { ReelyNode } from '@reely/dommy';

const laps = signal(0);
const Link = ({ href, children }: { href: string; children?: ReelyNode }): Node => <a href={href}>{children}</a>;
const Laps = (): ReelyNode => () => `${laps.value} laps`;

document.body.append(<Link href="/race"><Laps /></Link>);
```

A component is a plain function, so it can be called as one: `mount(el, () => Card({ file }))` is `<Card file={file} />`.

A fragment, whether from such a component, `<>…</>`, `Show`, `Keyed`, `Await` or `For`, empties into its parent on `append`, so place it once. To move or remove it later, keep it inside an element, or render it with `mount`.

## Signals

```ts
import { batch, computed, effect, signal, untracked } from '@reely/dommy';

const laps = signal(0);
const done = computed(() => laps.value >= 3);

effect(() => console.log(`lap ${laps.value}`)); // runs now, then after every change
batch(() => {
  laps.value += 1; // effects run once, when the batch ends
  laps.value += 1;
});
untracked(() => laps.value); // reads without subscribing; same as `laps.peek()`
```

Effects run synchronously. A write of an equal value (`Object.is`) changes nothing. A signal holds any value, a function included.

Each run of an effect has its own owner: `onCleanup` inside it runs before the next run and when the effect is disposed, and the effects it created go with it.

```ts
import { effect, onCleanup, signal } from '@reely/dommy';

const lap = signal(1);

effect(() => {
  const timer = setTimeout(() => console.log(`lap ${lap.value} is slow`), 30_000);
  onCleanup(() => clearTimeout(timer)); // the next lap, or dispose, cancels it
});
```

## Bindings

A signal, or any function, in a child or a prop (other than `on*`) is bound: when the signals it reads change, dommy writes the new value to that one node or attribute.

```tsx
import { signal } from '@reely/dommy';

const speed = signal(120);

const gauge = (
  <meter value={speed} max={300} className={() => (speed.value > 200 ? 'fast' : 'slow')}>
    {() => `${speed.value} km/h`}
  </meter>
);
```

A function child renders text; to switch between nodes, use `Show` or `Keyed`. To toggle one class among static ones, bind the whole `className`: `className={() => (flash.value ? 'cell flash' : 'cell')}`, still one attribute write per change. A bound `null` or `undefined` removes the attribute; boolean props such as `hidden` or `disabled` take `true` and `false`.

## Lists

`For` renders one row per key, once. When the items change, a row whose key stays keeps its nodes, so focus, selection and state inside it survive; only rows that changed places are moved, new keys get new rows, and gone rows are removed with their subscriptions. The key prop is `by`, because JSX keeps `key` for itself.

```tsx
import { For, signal } from '@reely/dommy';

interface Racer {
  id: string;
  name: string;
  lap: number;
}

const racers = signal<readonly Racer[]>([]);

const board = (
  <ol>
    <For each={racers} by={(racer) => racer.id}>
      {(racer, index) => (
        <li className={() => (index() === 0 ? 'leader' : '')}>
          {() => racer().name} — lap {() => racer().lap}
        </li>
      )}
    </For>
  </ol>
);

racers.value = [...racers.value].sort((x, y) => y.lap - x.lap); // moves rows, rewrites changed text
```

`racer()` and `index()` follow later updates of that key.

## Conditions

`Show` renders `children` while `when` is truthy and `fallback` otherwise. Both are functions: a branch is built when it is shown and removed with its subscriptions when it is hidden.

```tsx
import { Show, signal } from '@reely/dommy';

const winner = signal<string | null>(null);

const banner = (
  <Show when={winner} fallback={() => <p>Racing…</p>}>
    {() => <p>Winner: {winner}</p>}
  </Show>
);
```

`Show` keeps its branch while the truthiness stays. `Keyed` builds the branch anew, with new state, whenever the value changes: the review form of another participant, the card of another file.

```tsx
import { Keyed, signal } from '@reely/dommy';

const reviewer = signal('Ada');

const review = <Keyed value={reviewer}>{(name) => <textarea placeholder={`Review by ${name}`} />}</Keyed>;

reviewer.value = 'Linus'; // a new, empty textarea
```

## Async

`Await` renders `fallback` while a promise is pending, then `children` with its value, or `catch` with the reason as an `Error`. `catch` is required, so a failure always has a view (JavaScript that leaves it out shows the error as text). Like `Show`, each branch is a function, built when it is shown and released when it is hidden.

```tsx
import { Await } from '@reely/dommy';

interface Final {
  winner: string;
  laps: number;
}

const loadFinal = (): Promise<Final> => fetch('/final.json').then((response) => response.json());

const result = (
  <Await promise={loadFinal()} fallback={() => <p>Loading the final…</p>} catch={(error) => <p>{error.message}</p>}>
    {(final) => (
      <p>
        {final.winner} wins after {final.laps} laps
      </p>
    )}
  </Await>
);
```

`promise` can also be a getter, and that makes a resource: the getter is tracked, so a change of a signal it reads loads again. Only the latest promise renders; the one it replaced is dropped, its result and its rejection alike, and so is everything that settles after the view is disposed.

```tsx
import { Await, signal } from '@reely/dommy';

const loadLap = (lap: number): Promise<string[]> => fetch(`/laps/${lap}.json`).then((response) => response.json());

const lap = signal(1);

const standings = (
  <Await
    promise={() => loadLap(lap.value)}
    fallback={() => <p>Loading lap {lap}…</p>}
    catch={(error) => <p>Lap {lap} did not load: {error.message}</p>}
  >
    {(cars) => (
      <ol>
        {cars.map((car) => (
          <li>{car}</li>
        ))}
      </ol>
    )}
  </Await>
);

lap.value = 2; // the fallback again, then lap 2; a late answer for lap 1 is dropped
```

`promise={loadFinal}` starts the load when the view renders. A getter that throws counts as a rejection (`Await` calls it through `Promise.try`, in every browser since 2025). To retry, read a signal in the getter and change it. To wait for several promises under one fallback, give `Await` their `Promise.all`.

## Mount and clean up

`mount(parent, render)` appends a view and returns the function that removes it and releases every binding and effect created while rendering it. `onCleanup` adds your own release: a timer, an animation frame, an observer, an outside subscription.

```tsx
import { mount, onCleanup, signal } from '@reely/dommy';

const Clock = () => {
  const now = signal(new Date());
  const timer = setInterval(() => (now.value = new Date()), 1000);
  onCleanup(() => clearInterval(timer));
  return <time>{() => now.value.toLocaleTimeString()}</time>;
};

const unmount = mount(document.body, () => <Clock />);
unmount(); // the timer stops, the bindings are released, the view is gone
```

A row of `For` and a branch of `Show`, `Keyed` or `Await` run their cleanups when they go away.

## SVG

SVG-only tags are created in the SVG namespace, in JSX and with factories (`svg`, `g`, `path`, `circle`, `text` and other common tags). Props are attributes under the names written in SVG, and bind like any prop.

```tsx
import { signal } from '@reely/dommy';

const dot = signal('red');

const icon = (
  <svg viewBox="0 0 24 24" className="icon">
    <circle cx={12} cy={12} r={10} fill={dot} stroke-width={2} />
  </svg>
);
```

`a`, `title`, `script` and `style` are HTML tags too, so they are always created as HTML elements.

## Kit

Small helpers over signals and the owner live in their own entry, `@reely/dommy/kit`; an app that does not import it does not ship it. Each one that listens or times stops with the render that created it.

```tsx
import { effect, signal } from '@reely/dommy';
import { flip, later, listen, media, persisted, size, throttled } from '@reely/dommy/kit';

const phone = media('(max-width: 700px)'); // follows the media query
const theme = persisted('theme', 'light'); // kept in localStorage, synced across tabs

const menuOpen = signal(false);
listen(window, 'keydown', (event) => event.key === 'Escape' && (menuOpen.value = false)); // removed with the view
effect(() => {
  if (menuOpen.value) {
    later(5000, () => (menuOpen.value = false)); // closing it first, or disposing the view, cancels the timer
  }
});

const board = document.createElement('ol');
const box = size(board); // { width, height } through a ResizeObserver
const width = throttled(() => box.value.width, 500); // at most one change per 500 ms, the latest last
flip(board, () => board.append(...Array.from(board.children).reverse())); // rows glide to their new places

effect(() => console.log(phone.value, theme.value, width.value));
```

- `media(query)`, `size(element)` and `throttled(source, ms)` give computeds.
- `persisted(key, initial, { storage, is })` gives a signal; what is read back must be of the kind of `initial`, or pass `is` to check it; a storage that throws leaves it working in memory.
- `listen(target, type, handler, options)` types the event by target and returns the function that removes it.
- `later(ms, fn)` runs `fn` once after `ms`, unless the view is disposed or the effect runs again first; it returns its own cancel. `later(0, fn)` runs after the render is in the document.
- `flip(container, change)` animates the children `change` moved, not those it added; nothing moves under reduced motion.

## State machines

A machine of [`@reely/state-machine`](../state-machine/README.md) has no signals of its own; a signal that follows its `stateChanged` makes the view follow it. Create it while rendering, so `onCleanup` unsubscribes with the view:

```tsx
import { Keyed, onCleanup, signal } from '@reely/dommy';
import type { Signal } from '@reely/dommy';
import type { IStateMachine, StateMachineMode, StateMachineTypes } from '@reely/state-machine';

const stateOf = <M extends StateMachineTypes, Mode extends StateMachineMode>(
  machine: IStateMachine<M, Mode>
): Signal<M['state']> => {
  const state = signal(machine.state);
  onCleanup(machine.on('stateChanged', ({ to }) => (state.value = to)));
  return state;
};

// `final` is the machine from the README of @reely/state-machine
const Race = (): Node => {
  const phase = stateOf(final);
  return (
    <section>
      <button onClick={() => final.send('play')}>{() => (phase.value === 'running' ? 'Pause' : 'Play')}</button>
      <Keyed value={phase}>{(now) => <PhaseView name={now} />}</Keyed>
    </section>
  );
};
```

A transition to the same state leaves the signal as it is. What the view shows of the context is best kept in signals inside the context itself: actions write them, and the view reads them as any other signal.

## Advanced topics

The pitfalls [VanJS lists](https://vanjs.org/advanced), and how each one goes in reely. Each answer is checked in `src/lib/advanced.topics.spec.tsx`.

### DOM attributes vs. properties

Live state (`value`, `checked`, `selected`, `indeterminate`, `muted`) is set as a property, so a form shows it and a bound change is not lost to a user edit. Everything else is an attribute (`className` → `class`, `htmlFor` → `for`), a read-only `list` included. A property that has no attribute and takes an object goes through `elementRef`, which gets the element before its props:

```tsx
const stream = await navigator.mediaDevices.getUserMedia({ video: true });

const camera = <video autoplay elementRef={(video) => (video.srcObject = stream)} />;
```

### Why can't a signal hold a DOM node?

A bound child is text: `{name}` writes `name.value` into one text node. TypeScript rejects a signal of nodes as a child; from JavaScript the node renders as `[object HTMLElement]` and the dommy logger reports it. To switch nodes, use `Show` (by truthiness) or `Keyed` (by value); each builds its branch as its own nodes.

```tsx
import { Show, signal } from '@reely/dommy';

const bold = signal(false);

const welcome = (
  <p>
    Welcome to{' '}
    <Show when={bold} fallback={() => 'reely'}>
      {() => <b>reely</b>}
    </Show>
  </p>
);
```

### Signal granularity

A binding runs again when any signal it read changes, so a signal of a whole object rewrites every binding that reads any of its fields. Prefer a signal per field that changes on its own. When the object stays one signal, read a field through a `computed`: it passes a change on only when its result differs.

```ts
import { computed, signal } from '@reely/dommy';

const settings = signal({ theme: 'dark', laps: 5 });
const theme = computed(() => settings.value.theme); // a new `laps` does not reach theme bindings
```

### The scope of DOM updates

The problem VanJS describes (a binding function that rebuilds a whole `<p>` on every keystroke) has no counterpart here: a function child renders text only, and `Show` keeps its branch while the truthiness of `when` stays, so typing a name rewrites only the text node bound to it:

```tsx
import { Show, signal } from '@reely/dommy';

const name = signal('');

const greeting = (
  <Show when={() => name.value.trim() !== ''} fallback={() => <p>Enter your name</p>}>
    {() => (
      <p>
        Hello <b>{name}</b>
      </p>
    )}
  </Show>
);
```

### Conditional bindings

A binding, `computed` or `effect` depends on the signals its last run read. `() => (formula.value === 'a + b' ? a.value + b.value : c.value)` does not run for `c` while the formula is `a + b`, and stops running for `a` and `b` once it is `c`.

### Advanced state derivation

An effect can write several signals from one source, and the kit covers the timed derivations: `persisted` keeps a signal in storage, `throttled` passes at most one change per interval, and `later` delays one:

```ts
import { effect, signal } from '@reely/dommy';
import { later } from '@reely/dommy/kit';

const fullName = signal('Tao Xin');
const firstName = signal('');
const lastName = signal('');
const delayed = signal('');

effect(() => {
  [firstName.value = '', lastName.value = ''] = fullName.value.split(' ');
});
effect(() => {
  const name = fullName.value;
  later(1000, () => (delayed.value = name)); // the next change cancels the pending one
});
```

A stream of every value (VanJS's `for await` example) is not provided: an effect already sees every change, synchronously.

### Self-referencing in effects

A signal an effect reads and then writes in the same run stops being its dependency (as in VanJS 1.3): the write does not run the effect again, so a counter can count in the effect that watches its source:

```ts
import { effect, signal } from '@reely/dommy';

const checked = signal(false);
const timesChecked = signal(0);

effect(() => {
  if (checked.value) timesChecked.value += 1; // resetting `timesChecked` does not re-run it
});
```

It still runs for the signals it only reads, and a read after the write depends on the signal again. The price: it does not see later writes of a signal it wrote, so an effect that clamps `laps` to 10 stops clamping; derive the clamped value with `computed` instead. To read a signal without depending on it, use `untracked` or `.peek()`. Two effects that each write what the other reads would run forever; after 100 waves of writes the flush stops and throws a cycle error instead of hanging the page.

### Releasing bindings

reely has no garbage collection of bindings, so nothing is dropped behind your back: a view keeps its bindings while it is built, before it is connected, and across an `await`. They are released by the owner instead: `mount` returns the dispose, and a branch of `For`, `Show`, `Keyed` or `Await` releases what was created in it (computeds and effects included) when it goes away.

The cost is the other side: a node built outside any owner (at module level, or in an event handler and appended by hand) keeps its bindings as long as their signals live. Build views inside `mount`, and show nodes that come and go through `Show`, `Keyed`, `For` or `Await`.

### Lifecycle hooks

A component runs once and returns its nodes before they are in the document; there is no mount hook. What must run once the view is connected, such as focusing a field or measuring a node, goes in `later(0, fn)` from the kit: it runs after the render that called it and is cancelled if the view is disposed first. The cleanup side is `onCleanup`, which runs when the owner lets the view go; a node that leaves the document some other way (moved by hand, or by outside code) is not noticed, and only a custom element's `disconnectedCallback` sees that. Effects run synchronously, so a signal written in a component is seen at once, not in a later cycle.

```tsx
import { input } from '@reely/dommy';
import { later } from '@reely/dommy/kit';

const Search = (): Node => {
  const field = input({ type: 'search' }); // a factory gives the element type; a JSX tag is a `Node`
  later(0, () => field.focus());
  return field;
};
```

## Router

`@reely/dommy/router` holds an experimental async router (`createAsyncRouter`). Its API will change; it is not part of the stable surface.

## License

MIT

## Credits

- The signal core (`reelx`) is adapted from [act](https://github.com/artalar/act) by artalar, MIT licence.
- The signal tests are adapted from [@preact/signals-core](https://github.com/preactjs/signals), Copyright (c) 2022-present Preact Team, MIT licence.
