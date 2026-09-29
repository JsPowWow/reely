# state-machine

A finite state machine for app logic: named states, and the events that move it from one to another. Knows nothing of the DOM or of signals.

## Language

**State**:
One of the named situations the machine can be in; it is in exactly one at a time.
_Avoid_: phase, mode, status

**Event**:
What a caller sends to the machine: a type (its name) and, where the type declares it, data; the current state decides what it means.
_Avoid_: transition (for what is sent), message

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
Optional data the machine carries beside its state, handed to actions and target selectors.
_Avoid_: store, extended state

**Action**:
A function the machine runs at a step of a transition: on leaving a state (exit), on the transition itself, or on entering a state (entry). It gets the change: from, to, the event, the context and the machine.
_Avoid_: hook, effect, callback

**Change**:
What an action and a listener get about one transition: its step, the state it leaves, the target, the event, the context and the machine.
_Avoid_: action (for the object), payload

**Step**:
Where in a transition an action runs: exit, the transition itself, entry; a listener hears `changed`, after them all.
_Avoid_: phase, stage

**Result**:
What `send` answers: `done` (the transition was taken), `refused` (none for this event here), `failed` (an action, a selector or a listener threw), `queued` (sent from inside a transition, it runs right after).
_Avoid_: status (for the whole object), response

**Final state**:
A state with no transitions out of it.
_Avoid_: terminal state, end state
