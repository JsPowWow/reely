# @reely/simple-store

Two tiny observable stores for code without a UI framework: a plain object changed a few fields at a time, and a single value. With `@reely/dommy`, use its signals instead.

```sh
npm i @reely/simple-store
```

## ObjectStore

Each `set` makes a new object with the fields given, and notifies, even when the fields are equal.

```ts
import { ObjectStore } from '@reely/simple-store';

const race = new ObjectStore({ lap: 0, leader: 'Ada' });

race.on('changed', ({ lap, leader }) => console.log(`lap ${lap}: ${leader}`));
race.set({ lap: 1 }); // { lap: 1, leader: 'Ada' }
race.set(({ lap }) => ({ lap: lap + 1 })).set({ leader: 'Linus' }); // `set` returns the store
race.get(); // { lap: 2, leader: 'Linus' }
```

It holds a plain object only; anything else throws a `TypeError` at creation.

## PrimitiveStore

A value that notifies when a different one (by `Object.is`) is set.

```ts
import { PrimitiveStore } from '@reely/simple-store';

const speed = new PrimitiveStore(120);

speed.on('changed', (value) => console.log(`${value} km/h`));
speed.value = 130; // notifies
speed.value = 130; // the same value: nothing
```

## Listeners

`on('changed', listener)` subscribes to the one event of a store and returns the function that unsubscribes; `off` removes a listener, as in `@reely/emitter`.

## select

`select` makes a read-only store of a part of the value. It notifies only when that part changes, by `Object.is` or the `equals` you pass, and follows its store only while it has listeners.

```ts
const leader = race.select(({ leader }) => leader);
leader.on('changed', (name) => console.log(`${name} leads`)); // not on a new lap
leader.value; // 'Linus'

const board = race.select(
  ({ lap, leader }) => ({ lap, leader }),
  (a, b) => a.lap === b.lap && a.leader === b.leader
);
```

## Notifications

Listeners are notified one change at a time. A change made by a listener waits until the current notification is over, and several such changes arrive once, as the latest value. Listeners that keep changing the store stop after 100 notifications for one change, with an error.

A listener that throws does not stop the others. Once all have run, the change that notified (`set`, or `value =`) throws its error, or an `AggregateError` of several; the new value is kept.
