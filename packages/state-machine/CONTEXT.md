# state-machine

A finite state machine for app logic: named states, and the events that move it from one to another. Knows nothing of the DOM or of signals.

## Language

**State**:
One of the named situations the machine can be in; it is in exactly one at a time.
_Avoid_: phase, mode, status

**Event**:
What a caller sends to the machine, by name, optionally with data; the current state decides what it means.
_Avoid_: transition (for the name sent), action, message

**Transition**:
The edge from a state to a target, taken by one event.
_Avoid_: action, route

**Target**:
The state a transition leads to.
_Avoid_: destination, next state

**Target selector**:
A transition written as a function: when the event is sent, it picks the target, or no target at all.
_Avoid_: executor, guard

**Any-state transition**:
A transition declared on the machine rather than on a state, taken by its event from whatever state the machine is in; a state's own transition for the same event wins.
_Avoid_: global transition, wildcard transition

**Context**:
Optional data the machine carries beside its state, handed to hooks and target selectors.
_Avoid_: store, extended state

**Enter/Exit hook**:
What runs when the machine enters or leaves a state.
_Avoid_: action, onEnter/onExit effect

**Final state**:
A state with no transitions out of it.
_Avoid_: terminal state, end state
