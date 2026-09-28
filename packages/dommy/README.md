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

- Props are DOM names: `className`, `htmlFor`, `tabIndex`. `value`, `checked` and other live state are set as properties.
- `styles={{ marginTop: '1rem', '--accent': 'red' }}` sets inline styles, custom properties included.
- `aria={{ role: 'status', ariaLabel: 'Score' }}` sets `role` and `aria-*` attributes.
- `onClick`, `onInput` and every other `on*` prop takes a function; the event and `event.currentTarget` are typed by the element. A string is never rendered as an inline handler.
- `elementRef` gets the element: an object from `createObjectReference()` or a function `(element) => void`.
- Text is always inserted as text, so user input cannot become markup.

A component is a function of props that returns nodes. It runs once.

```tsx
import type { ChildDOMElement } from '@reely/dommy';

const Link = ({ href, children }: { href: string; children?: ChildDOMElement }): ChildDOMElement => (
  <a href={href}>{children}</a>
);
```

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

A function child renders text; to switch between nodes, use `Show`. A bound `null` or `undefined` removes the attribute; boolean props such as `hidden` or `disabled` take `true` and `false`.

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

A row of `For` and a branch of `Show` run their cleanups when they go away.

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

## Router

`@reely/dommy/router` holds an experimental async router (`createAsyncRouter`). Its API will change; it is not part of the stable surface.

## License

MIT
