# @reely/emitter

A typed publish-subscribe channel: events by name, listeners that unsubscribe, and a listener that throws does not stop the others.

```sh
npm i @reely/emitter
```

## Events

```ts
import { EventEmitter } from '@reely/emitter';

interface RaceEvents {
  lap: number; // carries the lap number
  finished: undefined; // carries nothing
}

const race = new EventEmitter<RaceEvents>();

const stop = race.on('lap', (lap) => console.log(`lap ${lap}`));
race.emit('lap', 3); // the data is required here…
race.emit('finished'); // …and left out where the event carries none
stop(); // removes this subscription only
```

The events are an `interface` of names with the type of their data, `undefined` for none. An event whose data may be `undefined` takes it optionally.

## Listeners

- `on` adds a listener once: the same function added twice is called once, as with `addEventListener`. It returns the function that removes that subscription; calling it again, or after the listener was removed and added anew, does nothing.
- `off(event, listener)` removes a listener; `hasListener(event)` tells whether an event has any; `clearAllListeners()` removes them all.
- `emit` calls the listeners it began with and still has: one removed during the emit is skipped, one added hears the next emit.
- A listener that throws does not stop the others. Once all have run, `emit` throws its error, or an `AggregateError` of several.
- `on`, `off` and `emit` keep working taken off the emitter: `const { on, emit } = race`.

To hand out only the three methods, type the value as `IEventEmitter<RaceEvents>`.
