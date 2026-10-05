# DML: statements inside markup

A prototype, not shipped. It started from [van-dml](https://vanjs.org/), an add-on to VanJS:
`begin(ul())` opens a parent, every tag after it appends itself there, `end()` closes it, and
plain `for`/`if`/`switch` run in between. Can dommy do that without changing its core? Run and
type-check it with the other labs (see `../README.md`).

## The four variants

| | A. a function that `return`s | B. `begin`/`end` (`van.ts`) | C. `into(parent, (tags) => …)` (`into.ts`) | D. `using within(parent)` (`within.ts`) |
|---|---|---|---|---|
| Statements in markup | yes, it is plain code | yes | yes | yes |
| Where the block ends | its `return` | where `end()` is called, if it is | the closing brace | the closing brace (`Symbol.dispose`, even on throw) |
| The current parent lives in | nothing: children are returned | a module-level stack | the closure | a module-level stack |
| Across `await` | safe | wrong: the second panel opens inside the first, and lines land in whatever is current (spec) | safe (spec) | wrong, as B |
| Core change | none | none: `tags.ts` wraps dommy's factories | none, the same wrapper | none, over `add(...)` |

The appending tags (`tags.ts`) are a separate set: dommy's own factories never append, so a
child built as a prop, or a row `For` renders, never lands in a parent by surprise. The price:
an appending tag also given as a child moves out of the block's parent (spec), so plain
factories stay for children.

## Reactivity

A block runs once, like a component. Bindings inside it stay point updates (spec); a structure
that changes goes through `For` and `Show`.

## Verdict

B is out: a shared stack breaks under the first `await`, and a missing `end()` fails silently.
D fixes the balance, not the sharing. A needs nothing and is what dommy already does. C keeps
van-dml's terseness safely, but it is one more way to build a tree, so it stays a recipe in the
labs, not an export. The site shows B, its `await` bug, and C side by side (`/labs`).
