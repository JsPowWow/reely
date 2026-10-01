# router

Typed routes from path patterns, and a router that shows the page of an address and follows the moves between addresses; no framework, no DOM rendering of its own.

## Language

**Address**:
A path with its query (`/search?q=lamp`): what a route answers. A new address is a new page; a new place (`#returns`) on the address shown is not.
_Avoid_: URL, location (for what routes see)

**Route**:
A path pattern (`/messages/:id`, `/*rest`) with the function that answers it with a page, or with nothing to pass the address to the next route.
_Avoid_: handler, action

**Page**:
Whatever the app shows for an address: a render function, an element, `{ title, view }`. The router never looks inside it; `show` puts it on screen.
_Avoid_: view, screen, component

**Move**:
A change of address: a link the router took over, back or forward, `navigate`. Only the latest move counts.
_Avoid_: transition, navigation event

**Loading**:
The wait between a move and its page: the page shown stays until the next one has loaded, and the router says one is coming. A move that a later one overtakes ends its wait unseen.
_Avoid_: pending, transition, busy

**History**:
Where a router's addresses come from and how it moves between them: the browser's history, or one kept in memory for a router inside part of the page.
_Avoid_: location provider, mode
