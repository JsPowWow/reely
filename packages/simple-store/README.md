# @reely/simple-store

Two tiny observable stores for code without a UI framework: a plain object changed a few fields at a time, and a single value. With `@reely/dommy`, use its signals instead.

```sh
npm i @reely/simple-store
```

## ObjectStore

Each `set` makes a new object with the fields given, and notifies, even when the fields are equal.

```ts
import { ObjectStore } from '@reely/simple-store';

const cart = new ObjectStore({ items: 0, coupon: '' });

cart.on('changed', ({ items }) => (badge.textContent = String(items)));
cart.set({ items: 1 }); // { items: 1, coupon: '' }
cart.set(({ items }) => ({ items: items + 1 })).set({ coupon: 'SPRING10' }); // `set` returns the store
cart.get(); // { items: 2, coupon: 'SPRING10' }
```

It holds a plain object only; anything else throws a `TypeError` at creation.

## PrimitiveStore

A value that notifies when a different one (by `Object.is`) is set.

```ts
import { PrimitiveStore } from '@reely/simple-store';

const volume = new PrimitiveStore(40);

volume.on('changed', (percent) => (player.volume = percent / 100));
volume.value = 65; // notifies
volume.value = 65; // the same value: nothing
```

## Listeners

`on('changed', listener)` subscribes to the one event of a store and returns the function that unsubscribes; `off` removes a listener, as in `@reely/emitter`.

## select

`select` makes a read-only store of a part of the value. It notifies only when that part changes, by `Object.is` or the `equals` you pass, and follows its store only while it has listeners.

```ts
const coupon = cart.select(({ coupon }) => coupon);
coupon.on('changed', (code) => checkCoupon(code)); // not when an item is added
coupon.value; // 'SPRING10'

const summary = cart.select(
  ({ items, coupon }) => ({ items, discounted: coupon !== '' }),
  (before, after) => before.items === after.items && before.discounted === after.discounted
);
```

## Notifications

Listeners are notified one change at a time. A change made by a listener waits until the current notification is over, and several such changes arrive once, as the latest value. Listeners that keep changing the store stop after 100 notifications for one change, with an error.

A listener that throws does not stop the others. Once all have run, the change that notified (`set`, or `value =`) throws its error, or an `AggregateError` of several; the new value is kept.
