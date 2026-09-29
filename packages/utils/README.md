# @reely/utils

The monorepo's own helpers: type guards, `pipe` and `flow`, `Either` and `Maybe`, nullable helpers, error helpers and shared types. Private: it is not published, so a published package never imports it; helpers ready for that move to `@reely/basics`.

One function per file, `src/lib/<group>/<fnName>.ts`, with its spec next to it, and a named export from `src/index.ts`.

```ts
import { hasProperty, isString, mapNullable, pipe, withDefault } from '@reely/utils';

// a query string gives `string | null`; the page needs a number
const perPage = pipe(
  new URLSearchParams(location.search).get('perPage'),
  mapNullable((text) => Number.parseInt(text, 10) || null), // null stays null, and so do 'abc' and '0'
  withDefault(20)
);

// a message from a WebSocket is `unknown` until guards say otherwise
if (hasProperty('text', message) && isString(message.text)) render(message.text);
```
