# @reely/logger

Scoped console loggers for TypeScript: a scope stays silent until you enable it, and `logWith` logs a value inside a pipeline and passes it on.

```sh
npm i @reely/logger
```

## Scopes

```ts
import { scopedLogger } from '@reely/logger';

const checkout = scopedLogger('checkout'); // one logger per scope: the same name gives the same logger
checkout.info('cart restored'); // silent: a named scope logs nothing until enabled
checkout.setEnabled(true).warn('card declined', { last4: '4242' }); // console.warn('[[checkout]]\t', 'card declined', { last4: '4242' })

scopedLogger().error('payment service is down'); // the default scope is always on
```

Each line starts with the scope in `[[…]]`; `info`, `warn`, `error` and `log` write to the matching `console` method.

## In a pipeline

```ts
const prices = [12.5, 30];
const total = checkout.logWith('info', 'total')(prices.reduce((sum, price) => sum + price, 0)); // console.info('[[checkout]]\t', 'total', 42.5); total is 42.5
```

`logWith(level, prefix?, ...rest)` returns a function that logs its argument after `prefix` and returns it unchanged, so it fits between the steps of a pipeline or a `.then`.

## Types

`ScopedLogger` is what `scopedLogger` returns: an `ILogger` with its `scope` and `setEnabled`. `WithUseLogger<Options>` adds an optional logger to an options type: `{ useLogger: true, logger }` or no logger at all.
