# @reely/dommy

Real DOM from tag factories and JSX, bound to signals. There is no virtual DOM and no re-render: a component runs once, and a signal updates exactly the one text node or attribute bound to it.

```tsx
import { mount, signal } from '@reely/dommy';

const message = signal('');

mount(document.body, () => (
  <label>
    <textarea maxLength={280} onInput={(event) => message.set(event.currentTarget.value)} />
    <output>{() => 280 - message.value.length}</output> characters left
  </label>
));
```

Each keystroke changes the text of one text node inside `<output>`; nothing else in the page is touched.

## Install

```sh
npm i @reely/dommy
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
- `list` and `form`, which the DOM types as elements, take an id: `<input list="cities" />`.
- `styles={{ marginTop: '1rem', '--accent': 'red' }}` sets inline styles, custom properties included.
- `aria={{ role: 'status', ariaLabel: 'Cart total' }}` sets `role` and `aria-*` attributes.
- Handler props take a function, named the DOM way (`onkeydown`) or in camelCase with every word capitalised, as in React (`onKeyDown`, `onPointerMove`; `dblclick` is `onDblClick`). The event and `event.currentTarget` are typed by the element. A string is never rendered as an inline handler.
- `elementRef` gets the element: an object from `createObjectReference()` or a function `(element) => void`.
- Text is always inserted as text, so user input cannot become markup.

## Components

A component is a function of props that runs once. It returns a `ReelyNode`, the counterpart of React's `ReactNode`: a node, text, a number, a getter, nothing (`null`, `undefined`, a boolean) or a list of these. `children` are a `ReelyNode` too.

A JSX expression is always a `Node`, ready for `append`. A tag gives its element; a component that returns anything else gives a `DocumentFragment` holding it.

```tsx
import { signal } from '@reely/dommy';
import type { ReelyNode } from '@reely/dommy';

const unread = signal(3);
const Link = ({ href, children }: { href: string; children?: ReelyNode }): Node => <a href={href}>{children}</a>;
const Unread = (): ReelyNode => () => `Inbox (${unread.value})`;

document.body.append(<Link href="/inbox"><Unread /></Link>);
```

A component is a plain function, so it can be called as one: `mount(el, () => Card({ file }))` is `<Card file={file} />`.

A fragment, whether from such a component, `<>…</>`, `Show`, `Keyed`, `Await` or `For`, empties into its parent on `append`, so place it once. To move or remove it later, keep it inside an element, or render it with `mount`.

## Signals

The signals are [`@reely/signals`](https://www.npmjs.com/package/@reely/signals), re-exported; its README tells about owners and the testing entry.

```ts
import { batch, computed, effect, signal, untracked } from '@reely/dommy';

const tickets = signal(1);
const total = computed(() => tickets.value * 12.5); // euros

effect(() => console.log(`Pay €${total.value}`)); // runs now, then after every change
batch(() => {
  tickets.value += 1; // effects run once, when the batch ends
  tickets.value += 1;
});
untracked(() => tickets.value); // reads without subscribing; same as `tickets.peek()`

// the style of Angular works as well: a signal and a computed are functions
tickets(); // reads, as `tickets.value` does
tickets.set(4); // writes, as `tickets.value = 4` does
tickets.update((n) => n + 1); // writes from the value, read without subscribing
total(); // a computed reads the same way
```

Pick the style you like; the two mix freely.

Effects run synchronously. A write of an equal value (`Object.is`, or the `equals` you pass) changes nothing. A signal holds any value, a function included: `set` and `.value =` store it; `update` calls only the function you pass it.

```ts
import { signal } from '@reely/dommy';

const garage = { cars: ['Volvo'] };
const state = signal(garage, { equals: () => false }); // changed in place: every write notifies
garage.cars.push('Saab');
state.value = garage;

const standings = signal({ leader: 'Ada', lap: 3 }, { equals: (previous, next) => previous.leader === next.leader });
standings.value = { leader: 'Ada', lap: 4 }; // the same leader: nothing is notified, the value stays
```

`equals` decides whether the signal notifies. What derives from it compares its own result by `Object.is`: a `computed` that returns the same object notifies nothing, so derive the part that changes (`() => state.value.cars.length`). `For` re-reads its list on every notification, so a list changed in place gets its rows added, removed and moved; an item changed in place keeps its row as it was, so give a changed item a new object.

Each run of an effect has its own owner: `onCleanup` inside it runs before the next run and when the effect is disposed, and the effects it created go with it.

```ts
import { effect, onCleanup, signal } from '@reely/dommy';

const draft = signal('');
const typing = signal(false); // shows "typing…" to the other side of a chat

effect(() => {
  if (draft.value === '') return;
  typing.value = true;
  const timer = setTimeout(() => (typing.value = false), 2000);
  onCleanup(() => clearTimeout(timer)); // the next keystroke, or dispose, cancels it
});
```

## Bindings

A signal, or any function, in a child or a prop (other than `on*`) is bound: when the signals it reads change, dommy writes the new value to that one node or attribute.

```tsx
import { signal } from '@reely/dommy';

const uploaded = signal(0); // percent

const progress = (
  <progress value={uploaded} max={100} className={() => (uploaded.value === 100 ? 'done' : 'uploading')}>
    {() => `${uploaded.value}%`}
  </progress>
);
```

A function child renders text; to switch between nodes, use `Show` or `Keyed`. To toggle one class among static ones, bind the whole `className`: `className={() => (flash.value ? 'cell flash' : 'cell')}`, still one attribute write per change. A bound `null` or `undefined` removes the attribute; boolean props such as `hidden` or `disabled` take `true` and `false`.

## Lists

`For` renders one row per key, once. When the items change, a row whose key stays keeps its nodes, so focus, selection and state inside it survive; only rows that changed places are moved, new keys get new rows, and gone rows are removed with their subscriptions. The key prop is `by`, because JSX keeps `key` for itself.

```tsx
import { For, signal } from '@reely/dommy';

interface Track {
  id: string;
  title: string;
  plays: number;
}

const playlist = signal<readonly Track[]>([]);

const tracks = (
  <ol>
    <For each={playlist} by={(track) => track.id}>
      {(track, index) => (
        <li className={() => (index() === 0 ? 'up-next' : '')}>
          {() => track().title} ({() => track().plays} plays)
        </li>
      )}
    </For>
  </ol>
);

playlist.value = [...playlist.value].sort((one, other) => other.plays - one.plays); // most played first: moves rows, rewrites changed text
```

`track()` and `index()` follow later updates of that key.

## Conditions

`Show` renders `children` while `when` is truthy and `fallback` otherwise. Both are functions: a branch is built when it is shown and removed with its subscriptions when it is hidden.

```tsx
import { Show, signal } from '@reely/dommy';

const online = signal(navigator.onLine);
addEventListener('online', () => online.set(true));
addEventListener('offline', () => online.set(false));

const status = (
  <Show when={online} fallback={() => <p role="alert">You are offline. Changes will sync when you are back.</p>}>
    {() => <p>All changes saved</p>}
  </Show>
);
```

`Show` keeps its branch while the truthiness stays. `Keyed` builds the branch anew, with new state, whenever the value changes: the notes on another contact, the card of another file.

```tsx
import { Keyed, signal } from '@reely/dommy';

const contact = signal('Maria Silva');

const notes = <Keyed value={contact}>{(name) => <textarea placeholder={`Notes on ${name}`} />}</Keyed>;

contact.value = 'Kenji Watanabe'; // a new, empty textarea
```

## Async

`Await` renders `fallback` while a promise is pending, then `children` with its value, or `catch` with the reason as an `Error`. `catch` is required, so a failure always has a view (JavaScript that leaves it out shows the error as text). Like `Show`, each branch is a function, built when it is shown and released when it is hidden.

```tsx
import { Await } from '@reely/dommy';

interface Forecast {
  city: string;
  celsius: number;
  sky: string;
}

const loadForecast = (): Promise<Forecast> => fetch('/api/forecast?city=Lisbon').then((response) => response.json());

const today = (
  <Await promise={loadForecast()} fallback={() => <p>Checking the sky…</p>} catch={(error) => <p>{error.message}</p>}>
    {(forecast) => (
      <p>
        {forecast.city}: {forecast.celsius} °C, {forecast.sky}
      </p>
    )}
  </Await>
);
```

`promise` can also be a getter, and that makes a resource: the getter is tracked, so a change of a signal it reads loads again. Only the latest promise renders; the one it replaced is dropped, its result and its rejection alike, and so is everything that settles after the view is disposed.

```tsx
import { Await, signal } from '@reely/dommy';

const loadOrders = (page: number): Promise<string[]> =>
  fetch(`/api/orders?page=${page}`).then((response) => response.json());

const page = signal(1);

const orders = (
  <Await
    promise={() => loadOrders(page.value)}
    fallback={() => <p>Loading page {page}…</p>}
    catch={(error) => <p>Page {page} did not load: {error.message}</p>}
  >
    {(orderIds) => (
      <ul>
        {orderIds.map((id) => (
          <li>Order {id}</li>
        ))}
      </ul>
    )}
  </Await>
);

page.value = 2; // the fallback again, then page 2; a late answer for page 1 is dropped
```

`promise={loadForecast}` starts the load when the view renders. A getter that throws counts as a rejection (`Await` calls it through `Promise.try`, in every browser since 2025). To retry, read a signal in the getter and change it. To wait for several promises under one fallback, give `Await` their `Promise.all`.

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

const goal = signal(0.4); // the share of today's steps goal

const ring = (
  <svg viewBox="0 0 36 36" className="goal">
    <circle cx={18} cy={18} r={15.9} fill="none" stroke="#e5e7eb" stroke-width={3} />
    <circle cx={18} cy={18} r={15.9} fill="none" stroke="#16a34a" stroke-width={3} stroke-dasharray={() => `${goal.value * 100} 100`} />
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

/** What `stateOf` needs of a machine; every machine of `@reely/state-machine` has it. */
interface Followed<State> {
  readonly state: State;
  on(event: 'stateChanged', listener: (change: { readonly to: State }) => void): () => void;
}

const stateOf = <State,>(machine: Followed<State>): Signal<State> => {
  const state = signal(machine.state);
  onCleanup(machine.on('stateChanged', ({ to }) => state.set(to)));
  return state;
};

type Playback = 'stopped' | 'playing' | 'paused';

const Player = ({ player }: { player: Followed<Playback> & { send(type: 'toggle'): unknown } }): Node => {
  const playback = stateOf(player);
  return (
    <section>
      <button onClick={() => player.send('toggle')}>{() => (playback() === 'playing' ? 'Pause' : 'Play')}</button>
      <Keyed value={playback}>{(now) => <span className={`badge ${now}`}>{now}</span>}</Keyed>
    </section>
  );
};
```

A transition to the same state leaves the signal as it is. What the view shows of the context is best kept in signals inside the context itself: actions write them, and the view reads them as any other signal.

## Advanced topics

The questions that come up once the basics work. Each answer is checked in `src/lib/advanced.topics.spec.tsx`.

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

const onSale = signal(false);

const price = (
  <p>
    Price:{' '}
    <Show when={onSale} fallback={() => '€40'}>
      {() => <mark>€32 on sale</mark>}
    </Show>
  </p>
);
```

### Signal granularity

A binding runs again when any signal it read changes, so a signal of a whole object rewrites every binding that reads any of its fields. Prefer a signal per field that changes on its own. When the object stays one signal, read a field through a `computed`: it passes a change on only when its result differs.

```ts
import { computed, signal } from '@reely/dommy';

const profile = signal({ name: 'Maria Silva', avatarUrl: '/avatars/maria.png' });
const name = computed(() => profile.value.name); // a new avatar does not reach name bindings
```

### The scope of DOM updates

Typing into a field does not rebuild the paragraph that shows it: a function child renders text only, and `Show` keeps its branch while the truthiness of `when` stays, so typing a code rewrites only the text node bound to it:

```tsx
import { Show, signal } from '@reely/dommy';

const coupon = signal('');

const hint = (
  <Show when={() => coupon.value.trim() !== ''} fallback={() => <p>Have a coupon? Enter it above.</p>}>
    {() => (
      <p>
        <b>{coupon}</b> will be applied at checkout
      </p>
    )}
  </Show>
);
```

### Conditional bindings

A binding, `computed` or `effect` depends on the signals its last run read. `` () => (delivery.value === 'pickup' ? 'Free' : `€${shipping.value}`) `` does not run for `shipping` while the delivery is `pickup`, and runs for it again once it is not.

### Advanced state derivation

An effect can write several signals from one source, and the kit covers the timed derivations: `persisted` keeps a signal in storage, `throttled` passes at most one change per interval, and `later` delays one:

```ts
import { effect, signal } from '@reely/dommy';
import { later } from '@reely/dommy/kit';

const email = signal('maria.silva@example.com');
const user = signal('');
const domain = signal('');
const saved = signal('');

effect(() => {
  [user.value = '', domain.value = ''] = email.value.split('@');
});
effect(() => {
  const address = email.value;
  later(1000, () => (saved.value = address)); // saves a second after typing stops: the next change cancels the pending one
});
```

A stream of every value (`for await`) is not provided: an effect already sees every change, synchronously.

### Self-referencing in effects

A signal an effect reads and then writes in the same run stops being its dependency: the write does not run the effect again, so an effect can count plays while it watches playback:

```ts
import { effect, signal } from '@reely/dommy';

const playing = signal(false);
const plays = signal(0);

effect(() => {
  if (playing.value) plays.value += 1; // resetting `plays` does not re-run it
});
```

It still runs for the signals it only reads, and a read after the write depends on the signal again. The price: it does not see later writes of a signal it wrote, so an effect that clamps `volume` to 100 stops clamping; derive the clamped value with `computed` instead. To read a signal without depending on it, use `untracked` or `.peek()`. Two effects that each write what the other reads would run forever; after 100 waves of writes the flush stops and throws a cycle error instead of hanging the page.

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

- The signals and their credits: [`@reely/signals`](https://www.npmjs.com/package/@reely/signals).
