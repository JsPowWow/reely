# dommy

Real DOM from tag factories and JSX, bound to signals: a component runs once, and a signal updates the one node or attribute bound to it.

## Rendering

**ReelyNode**:
Anything renderable, the counterpart of React's `ReactNode`: a node, text, a number, a getter or signal, nothing (`null`, `undefined`, a boolean) or a list of these. The type of `children` and of what a component returns.
_Avoid_: ChildDOMElement, child element, renderable

**JSX expression**:
The value of `<tag …>` or `<Component …>`: always one `Node`. A tag gives its element; a component result that is not a node is put into a `DocumentFragment`.
_Avoid_: JSX element (in React it means an object, here it is a DOM node)

**Component**:
A function of props that runs once and returns a `ReelyNode`; it re-renders never, its bindings update the DOM.
_Avoid_: render function, view

**Binding**:
A signal or getter in a child or a prop (other than `on*`), tied to the one text node or attribute it writes.
_Avoid_: reactive prop, effect (an effect is the general primitive)

## Flows

**Flow**:
`Show`, `Keyed`, `Await` or `For`: content that changes shape over time, kept between two comment anchors (`<!--For-->…<!--/For-->`).
_Avoid_: control flow component, directive

**Owner**:
The signals owner (`packages/signals/CONTEXT.md`) a render registers its bindings, effects and `onCleanup` callbacks with; `dispose` releases all of them.
_Avoid_: scope, context

## Routing

Routes, addresses and moves are `@reely/router`'s terms (`packages/router/CONTEXT.md`).

**Page**:
A component without props that a route answers with; `Router` renders it under its own owner and takes it down at the next move.
_Avoid_: view, screen

