# @reely/signals

Signals, computed values and effects: a push-pull graph with owners that release what a piece of work subscribed. Typed, tree-shakeable, no DOM. [`@reely/dommy`](https://www.npmjs.com/package/@reely/dommy) binds them to the DOM and re-exports them.

```sh
npm i @reely/signals
```

## Signals

```ts
import { batch, computed, effect, signal, untracked } from '@reely/signals';

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

Pick the style you like; the two mix freely. A `ReactiveValue<T>` is anything read that way: a signal, a computed or a getter of them.

Effects run synchronously, and a computed recomputes only when it is read after a change. A write of an equal value (`Object.is`, or the `equals` you pass) changes nothing. A signal holds any value, a function included: `set` and `.value =` store it; `update` calls only the function you pass it.

A batch that puts a signal back where it was reruns nothing that read it before the batch. A run of an effect or computed does not hear what it writes itself, untracked included, so a run that writes what it reads settles instead of looping; a write from outside the run is heard again, so an effect that clamps `laps` to 10 clamps a later 30 as well; effects that keep writing each other's signals stop with an error after 100 waves, and a computed that reads itself throws one.

```ts
import { signal } from '@reely/signals';

const garage = { cars: ['Volvo'] };
const state = signal(garage, { equals: false }); // changed in place: every write notifies
garage.cars.push('Saab');
state.value = garage;

const standings = signal({ leader: 'Ada', lap: 3 }, { equals: (previous, next) => previous.leader === next.leader });
standings.value = { leader: 'Ada', lap: 4 }; // the same leader: nothing is notified, the value stays
```

`equals` decides whether the signal notifies. What derives from it compares its own result by `Object.is`: a `computed` that returns the same object notifies nothing, so derive the part that changes (`() => state.value.cars.length`).

## Owners

An owner holds what a piece of work must release: the effects created under it, `onCleanup` callbacks and nested owners. `withOwner(fn)` runs `fn` under a new owner and passes it `dispose`.

```ts
import { effect, onCleanup, signal, withOwner } from '@reely/signals';

const lap = signal(1);

const stopRace = withOwner((dispose) => {
  effect(() => console.log(`lap ${lap.value}`));
  const timer = setInterval(() => lap.update((n) => n + 1), 60_000);
  onCleanup(() => clearInterval(timer));
  return dispose;
});

stopRace(); // the effect unsubscribes and the timer stops
```

Each run of an effect has its own owner: `onCleanup` inside it runs before the next run and when the effect is disposed, and the effects it created go with it. `getOwner()` captures the running owner, for code that runs later to pass to `withOwner(fn, owner)`; an owner is opaque, only `withOwner` takes it. A disposed owner holds nothing: what is registered with it later is released at once (an `onCleanup` runs, an effect never runs). Outside any owner, `onCleanup` is held by nothing and never runs, and an effect lives until its own `dispose`.

```ts
import { effect, onCleanup, signal } from '@reely/signals';

const draft = signal('');
const typing = signal(false); // shows "typing…" to the other side of a chat

effect(() => {
  if (draft.value === '') return;
  typing.value = true;
  const timer = setTimeout(() => (typing.value = false), 2000);
  onCleanup(() => clearTimeout(timer)); // the next keystroke, or dispose, cancels it
});
```

`subscribe(read, cb)` is an effect that hands `cb` the value: now and after every change, until its owner goes or the returned function is called. `cb` runs untracked and, unlike a run of an effect, what it writes reaches the subscription, so a view that writes the signal it shows is shown again.

```ts
import { signal, subscribe } from '@reely/signals';

const laps = signal(3);
const stop = subscribe(laps, (value) => console.log(`${value} laps to go`));
laps.value = 2; // "2 laps to go"
stop();
```

## Testing

`@reely/signals/testing` counts what still listens to a signal, so a test can check that `dispose` released everything:

```ts
import { effect, signal, withOwner } from '@reely/signals';
import { subscriberCount } from '@reely/signals/testing';

const lap = signal(1);
const stopRace = withOwner((dispose) => {
  effect(() => console.log(`lap ${lap.value}`));
  return dispose;
});

stopRace();
console.assert(subscriberCount(lap) === 0);
```

## License

MIT

## Credits

- The signal core implements the push-pull graph known from [Reactively](https://github.com/milomg/reactively), [@preact/signals-core](https://github.com/preactjs/signals) and [alien-signals](https://github.com/stackblitz/alien-signals), written from the concept.
- The signal tests are adapted from [@preact/signals-core](https://github.com/preactjs/signals), Copyright (c) 2022-present Preact Team, MIT licence.
