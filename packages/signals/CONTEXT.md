# signals

Values that change over time and the code that follows them, released through owners. Knows nothing of the DOM.

## Values

**Signal**:
A value that is written; whatever read it follows the change. Read and written as `.value` or as `lap()` / `set` / `update`.
_Avoid_: atom, store, observable

**Equality**:
What decides that a write changes nothing, so nothing is notified: `Object.is`, or a signal's own `equals`. A computed always uses `Object.is` on its result.
_Avoid_: comparator, dirty check

**Computed**:
A value derived from signals, recomputed when read after one of them changed.
_Avoid_: memo, derived signal, selector

**Reactive value**:
A signal, a computed or any getter of them: what an effect or computed reads and then follows.
_Avoid_: accessor, reader

## Following

**Effect**:
Code that runs now and again after every change of what it read, until disposed. A run does not hear what it writes itself; a later write from outside it does.
_Avoid_: watcher, reaction, autorun

**Subscription**:
An effect that hands a callback the value of a reactive value, now and after every change; what the callback writes is heard, unlike a run's own write.
_Avoid_: listener, observer, watch

**Batch**:
Writes grouped so that effects run once, when the outermost batch ends.
_Avoid_: transaction

## Releasing

**Owner**:
What a piece of work registers its effects, `onCleanup` callbacks and nested owners with; `dispose` releases all of them, the last registered first. A disposed owner releases at once whatever is registered with it later.
_Avoid_: scope, context
