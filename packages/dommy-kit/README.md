# @reely/dommy-kit

Browser helpers over [`@reely/signals`](https://www.npmjs.com/package/@reely/signals): a media query, an element's size, throttling, debouncing, storage, typed listeners, pointer holds, timers and FLIP moves. Each one that listens or times registers its release with the current owner, so it stops with the [`@reely/dommy`](https://www.npmjs.com/package/@reely/dommy) render, effect run or `withOwner` that created it; call them while rendering, since outside an owner nothing releases them. `debounced` holds nothing but its waiting call, so it works at module level too. Tree-shakeable: an app ships only the helpers it imports.

```sh
npm i @reely/dommy @reely/dommy-kit
```

`@reely/signals` is a peer dependency of both, installed with them: the kit and dommy share one signal graph and one owner.

```ts
import { effect, signal } from '@reely/dommy';
import { debounced, flip, hold, later, listen, media, persisted, size, throttled } from '@reely/dommy-kit';

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

const saveNote = debounced((note: string) => localStorage.setItem('note', note), 400); // the last of quick calls
listen(window, 'pagehide', saveNote.flush); // makes a waiting call now
const dragging = signal(false);
hold(board, () => {
  dragging.value = true; // what this press does, or return nothing to leave it alone
  return { move: (event) => console.log(event.offsetY), up: () => (dragging.value = false) }; // off the board too
});

effect(() => console.log(phone.value, theme.value, width.value));
```

- `media(query)`, `size(element)` and `throttled(source, ms)` give computeds. `size` measures the element at once, or, for one a render has yet to insert, once the render is in, so a canvas has its size in the first frame.
- `persisted(key, initial, { storage, is, onSaveError })` gives a signal, written to the storage only when it changes; what is read back must be of the kind of `initial`, or pass `is` to check it, which a nullable value (`persisted<string | null>('user', null, { is })`) must name; a storage that throws leaves it working in memory, and `onSaveError` hears the error. It follows writes from other tabs, and resets to `initial` when one clears the storage, only for a real storage area (`localStorage` by default, `sessionStorage`). A wrapper of your own that takes an optional `is` can pass it on as `{ is }`; it then answers for a nullable value itself.
- `debounced(fn, ms)` calls `fn` with the latest arguments once the calls stop for `ms`; `.flush()` makes the waiting call now, `.cancel()` drops it, and so does disposing the view that made it; to save on the way out instead, `onCleanup(save.flush)` after it.
- `listen(target, type, handler, options)` types the event by target and returns the function that removes it; `type` can be a list (`['pointerup', 'pointercancel']`).
- `hold(element, press)` holds a press: `press` gets the `pointerdown` and returns `{ move, up }` for this press, or nothing to leave it alone. The pointer is captured, so its moves and release reach `element` off it too, and `up` runs once, on `pointerup`, `pointercancel` or a lost capture. One pointer at a time. Give `element` `touch-action: none`, or a touch pans the page and cancels the press.
- `later(ms, fn)` runs `fn` once after `ms`, unless the view is disposed or the effect runs again first; it returns its own cancel. `later(0, fn)` runs after the render is in the document.
- `flip(container, change)` animates the children `change` moved, not those it added; nothing moves under reduced motion.

## Recipes

### Debouncing a signal

`debounced` waits out calls of a function. For a signal, `later` inside an effect is the debounce. Each run of the effect cancels the timer of the previous run, so only the last write waits out the delay.

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
