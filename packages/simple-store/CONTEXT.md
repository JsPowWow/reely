# simple-store

Stores you subscribe to explicitly: a change reaches the listeners of the store it was made on, and nothing is tracked or re-run on its own. For values derived from values, see signals.

## Language

**Store**:
A value held over time, with the listeners that hear each change of it.
_Avoid_: state, model, observable

**Value store**:
A store whose value is replaced as a whole.
_Avoid_: primitive store, atom

**Object store**:
A value store of a plain object, whose fields can also be changed a few at a time.
_Avoid_: record store, map store

**Selection**:
A read-only store of a part of another store's value; it hears that store only while it has listeners of its own.
_Avoid_: derived store, view, computed

**Readable store**:
What a store or a selection offers to code that may follow it but not change it.

**Notification**:
One delivery of a change to every listener of a store; a change made during it waits for it to end.
_Avoid_: emit, broadcast
