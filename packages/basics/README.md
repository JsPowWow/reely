# @reely/basics

Small general helpers for TypeScript: typed, tree-shakeable, no dependencies.

```sh
npm i @reely/basics
```

## Guards

```ts
import { hasSome, isPlainObject, isSomeFunction } from '@reely/basics';

if (hasSome(user.avatarUrl)) img.src = user.avatarUrl; // neither `null` nor `undefined`: `string | null` narrows to `string`
if (isSomeFunction(options.onSave)) options.onSave(draft); // can be called: `boolean | ((draft: Draft) => void)` narrows to the function
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
