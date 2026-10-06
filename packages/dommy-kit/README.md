# @reely/dommy-kit

Browser helpers over [`@reely/signals`](https://www.npmjs.com/package/@reely/signals): a media query, an element's size, throttling, storage, typed listeners, timers and FLIP moves. Each one that listens or times registers its release with the current owner, so it stops with the [`@reely/dommy`](https://www.npmjs.com/package/@reely/dommy) render, effect run or `withOwner` that created it; call them while rendering, since outside an owner nothing releases them. Tree-shakeable: an app ships only the helpers it imports.

```sh
npm i @reely/dommy @reely/dommy-kit
```

`@reely/signals` is a peer dependency of both, installed with them: the kit and dommy share one signal graph and one owner.

```ts
import { effect, signal } from '@reely/dommy';
import { flip, later, listen, media, persisted, size, throttled } from '@reely/dommy-kit';

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
- `persisted(key, initial, { storage, is, onSaveError })` gives a signal, written to the storage only when it changes; what is read back must be of the kind of `initial`, or pass `is` to check it, which a nullable value (`persisted<string | null>('user', null, { is })`) must name; a storage that throws leaves it working in memory, and `onSaveError` hears the error. It follows writes from other tabs, and resets to `initial` when one clears the storage, only for a real storage area (`localStorage` by default, `sessionStorage`). A wrapper of your own that takes an optional `is` can pass it on as `{ is }`; it then answers for a nullable value itself.
- `listen(target, type, handler, options)` types the event by target and returns the function that removes it.
- `later(ms, fn)` runs `fn` once after `ms`, unless the view is disposed or the effect runs again first; it returns its own cancel. `later(0, fn)` runs after the render is in the document.
- `flip(container, change)` animates the children `change` moved, not those it added; nothing moves under reduced motion.

## Recipes

### Debounce

There is no `debounce`: `later` inside an effect is one. Each run of the effect cancels the timer of the previous run, so only the last write waits out the delay.

```ts
import { effect, signal } from '@reely/dommy';
import { later } from '@reely/dommy-kit';

const note = signal(''); // what the driver types about the lap
const savedNote = signal('');

effect(() => {
  const text = note.value;
  later(800, () => (savedNote.value = text)); // saved 800 ms after typing stops
});
```

### Telling the user that saving failed

`persisted` keeps working in memory when the storage throws (a full quota, storage blocked in a private window), and tries it again on the next write. `onSaveError` hears the error, so the app can say so; the storage stays `localStorage`, so other tabs are still followed:

```ts
import { signal } from '@reely/dommy';
import { persisted } from '@reely/dommy-kit';

const tabOnly = signal(false); // say "saved in this tab only" once saving fails

const garage = persisted('garage', [{ car: 'Volvo 240', laps: 0 }], {
  onSaveError: (error) => {
    tabOnly.value = true;
    console.warn('The garage is not saved:', error);
  },
});
```
