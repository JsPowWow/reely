# @reely/simple-store

Two tiny stores you subscribe to explicitly: a single value, and a plain object changed a few fields at a time. Each change reaches its `changed` listeners; nothing is tracked behind your back, nothing re-runs on its own.

Reach for it where code wants to hear about changes as events: a service, a canvas loop, a page without a UI framework. Where values derive from values and the DOM should follow them, use `@reely/signals` (or `@reely/dommy`, which binds them to the DOM) instead.

```sh
npm i @reely/simple-store
```

## ValueStore

Holds one value and notifies when a different one (by `Object.is`) is set.

```ts
import { ValueStore } from '@reely/simple-store';

const mixer = { gain: 0.4 };
const volume = new ValueStore(40);

volume.on('changed', (percent) => (mixer.gain = percent / 100));
volume.value = 65; // notifies
volume.value = 65; // the same value: nothing
```

## ObjectStore

A `ValueStore` of a plain object, plus `set`, which changes some fields and keeps the rest. `set` makes a new object and notifies when a field it is given differs (by `Object.is`); given only the same fields, it keeps the object and stays quiet.

```ts
import { ObjectStore } from '@reely/simple-store';

const badge = { text: '0' };
const cart = new ObjectStore({ items: 0, coupon: '' });

cart.on('changed', ({ items }) => (badge.text = String(items)));
cart.set({ items: 1 }); // { items: 1, coupon: '' }
cart.set(({ items }) => ({ items: items + 1 })).set({ coupon: 'SPRING10' }); // `set` returns the store
cart.set({ coupon: 'SPRING10' }); // the same field: nothing
cart.value = { items: 0, coupon: '' }; // replaces the whole object
```

It holds a plain object only; anything else throws a `TypeError`, at creation or on `value =`.

## Reads

A store's `value`, and what its listeners receive, is `Readonly<T>`: a change goes through the store, so it notifies. `Readonly` is one level deep; a nested object is replaced, not changed in place.

## Listeners

`on('changed', listener)` subscribes to the one event of a store and returns the function that unsubscribes; `off` removes a listener, as in `@reely/emitter`.

## select

`select` makes a read-only store of a part of the value. It notifies only when that part changes, by `Object.is` or the `equals` you pass, and follows its store only while it has listeners. Its `value` is always the part of the value held now: the selector runs once for each value of the store that is read, and a part equal to the last one keeps the last one's object.

```ts
import { ObjectStore } from '@reely/simple-store';

const cart = new ObjectStore({ items: 2, coupon: 'SPRING10' });
const checked: string[] = [];

const coupon = cart.select(({ coupon }) => coupon);
coupon.on('changed', (code) => checked.push(code)); // not when an item is added
coupon.value; // 'SPRING10'

const summary = cart.select(
  ({ items, coupon }) => ({ items, discounted: coupon !== '' }),
  (before, after) => before.items === after.items && before.discounted === after.discounted
);
```

A store and a selection are both a `ReadableStore<T>`: `value`, `on`, `off` and `select`. Type a parameter with it to hand code a store it may follow but not change.

## Notifications

Listeners are notified one change at a time. A change made by a listener waits until the current notification is over, and several such changes arrive once, as the latest value. Listeners that keep changing the store stop after 100 notifications for one change, with an error.

A listener that throws does not stop the others. Once all have run, the change that notified (`set`, or `value =`) throws its error, or an `AggregateError` of several; the new value is kept.
