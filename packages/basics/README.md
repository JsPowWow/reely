# @reely/basics

Small general helpers for TypeScript: typed, tree-shakeable, no dependencies.

```sh
npm i @reely/basics
```

## Guards

```ts
import { hasSome, isBoolean, isPlainObject, isSomeFunction, isString } from '@reely/basics';

if (hasSome(user.avatarUrl)) img.src = user.avatarUrl; // neither `null` nor `undefined`: `string | null` narrows to `string`
if (isSomeFunction(options.onSave)) options.onSave(draft); // can be called: `boolean | ((draft: Draft) => void)` narrows to the function
if (isString(saved.query)) search(saved.query); // a string primitive, not a boxed `new String()`: `unknown` narrows to `string`
if (isBoolean(saved.muted)) player.muted = saved.muted; // `true` or `false`, not a boxed `new Boolean()`: `unknown` narrows to `boolean`
if (isPlainObject(saved.theme)) Object.assign(theme, saved.theme); // made by `{}`, `new Object()` or `Object.create(null)`, not an array, a class instance or a built-in: narrows to `Record<PropertyKey, unknown>`
```

An `unknown` value that passes `isSomeFunction` is a function that cannot be called until it is typed: check what it is before calling it.

## Errors

`forEachSettled(items, callback, message?)` calls `callback` for every item even when some calls throw, then throws their error: one as is, several as an `AggregateError` with `message`. An error of the iteration itself ends the calls and comes last.

```ts
import { forEachSettled, reportUncaught } from '@reely/basics';

forEachSettled(trackers, (tracker) => tracker.track('checkout', order), 'Analytics trackers threw'); // one broken tracker does not silence the others

void navigator.clipboard.writeText(inviteLink).catch(reportUncaught); // nobody awaits this promise
```

`reportUncaught(error)` reports an error nobody can catch as an uncaught one: through the platform `reportError`, or thrown from a microtask where there is none. It reaches `window.onerror` in a browser and `uncaughtException` in Node.

`messageOf(error)` is the message of whatever was thrown, and `toErrorWithMessage(error)` the thrown value as an `Error`: an `Error` as it is; an object's string `message` or a thrown string as the message of a new one; any other value as its JSON.

```ts
import { messageOf } from '@reely/basics';

try {
  await saveCar(car);
} catch (error) {
  banner.show(`Could not save the car: ${messageOf(error)}`); // an Error, a thrown string, a `{ message }` from an API
}
```

## References

`createObjectReference()` is a box for a value that arrives later: `current` is `null` until something puts a value in, such as a view library handing over an element once it is created. `ReferenceCallback<T>` is the other kind, a function that gets the value (or `null` when it goes away), and `Ref<T>` is either of them or `null`, for an API that takes a ref of any kind.

```ts
import { createObjectReference } from '@reely/basics';

const search = createObjectReference<HTMLInputElement>();
// … a view sets `search.current` when it creates the field
document.addEventListener('keydown', (event) => {
  if (event.key === '/') search.current?.focus();
});
```
