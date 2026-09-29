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

The package has no dependencies. It ships ES modules with TypeScript types.

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
import { effect, onCleanup } from '@reely/dommy';
import { flip, listen, machine, media, persisted, size, throttled } from '@reely/dommy/kit';

// a state machine: the state moves only along its transitions; states and events are typed from the config
const race = machine({
  initial: 'idle',
  states: { idle: { start: 'countdown' }, countdown: { go: 'running', cancel: 'idle' }, running: { finish: 'idle' } },
});
race.send('start'); // true: idle → countdown
race.can('finish'); // false, and reactive like any read of `race.state`
effect(() => {
  if (race.state.value === 'countdown') {
    const timer = setTimeout(() => race.send('go'), 3000); // entering the state
    onCleanup(() => clearTimeout(timer)); // leaving it
  }
});

const phone = media('(max-width: 700px)'); // follows the media query
const theme = persisted('theme', 'light'); // kept in localStorage, synced across tabs
listen(window, 'keydown', (event) => event.key === 'Escape' && race.send('cancel')); // removed with the view

const board = document.createElement('ol');
const box = size(board); // { width, height } through a ResizeObserver
const width = throttled(() => box.value.width, 500); // at most one change per 500 ms, the latest last
flip(board, () => board.append(...Array.from(board.children).reverse())); // rows glide to their new places

effect(() => console.log(phone.value, theme.value, width.value));
```

- `machine({ initial, states })` gives `state` (a computed), `send(event)` and `can(event)`; enter and leave a state with an effect and `onCleanup`.
- `media(query)`, `size(element)` and `throttled(source, ms)` give computeds.
- `persisted(key, initial, { storage, is })` gives a signal; what is read back must be of the kind of `initial`, or pass `is` to check it; a storage that throws leaves it working in memory.
- `listen(target, type, handler, options)` types the event by target and returns the function that removes it.
- `flip(container, change)` animates the children `change` moved, not those it added; nothing moves under reduced motion.

## Router

`@reely/dommy/router` holds an experimental async router (`createAsyncRouter`). Its API will change; it is not part of the stable surface.

## License

MIT
