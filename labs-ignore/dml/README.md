# DML: statements inside markup

A prototype, not shipped: can reely markup take `for`, `if`, `let` and `switch` the way
[van_dml](https://github.com/vanjs-org/van/tree/main/addons/van_dml) does with `begin`/`end`,
without changing dommy's core? Run and type-check it with the other labs (see `../README.md`).

## The three variants

| | A. generators, `markup(function* …)` | B. `using within(parent)` | C. `begin`/`end` by hand |
|---|---|---|---|
| Where the block ends | the closing brace of the generator | the closing brace of the `using` block | where `end()` is called, if it is |
| Balance checked by | the parser | the parser (`using` calls `Symbol.dispose`, even on throw) | nothing |
| Hidden state | none: the builder returns a list | a module-level parent stack | the same stack |
| Across `await` | safe (sync generator; no shared state) | wrong: two builds interleave into the wrong parents (spec) | wrong, as B |
| A child written without its keyword | dropped silently (forgotten `yield`) | dropped silently (forgotten `add`) | dropped silently (forgotten `add`) |
| Types | TS checks the yield type, but marks the whole builder, not the line | TS checks `add`'s arguments | as B |
| Core change | none: `markup` is one line, `Array.from(build())` | none over `add`; an implicit append would need every factory to read the stack | as B |

The implicit append that makes van_dml short (a bare `h1('x')` lands in the current parent)
is exactly what dommy cannot take: every factory call, including children built as props and
rows a `For` renders synchronously, would land in whatever parent is current.

## A typed `end` in a generator

A return type `Generator<ReelyNode, typeof END>` makes TypeScript demand `return END` (spec).
It restates the closing brace: the generator body is already the block, so the balance is
never in question, and TypeScript cannot check the order or the count of `yield`s, so a
`yield begin(x)` / `yield END` pair inside one builder stays unchecked.

## Reactivity

A builder runs once, like a component. Bindings inside it stay point updates (spec); a
structure that changes goes through `For` and `Show`, and TypeScript rejects a getter of a
built list as a child (spec), so a builder cannot become a re-render region by accident.

## Verdict

Variant A is the one worth keeping: statements in markup, balanced by syntax, no shared
state, no core change. Open costs: `function*` and a `yield` per child, and a forgotten
`yield` drops the child silently (TypeScript and ESLint do not flag a bare call). If it moves
into dommy, the shape to weigh is a child that is any `Iterable<ReelyNode>`, so a generator
object, `<ul>{(function* () { … })()}</ul>`, would need no helper (a generator *function* would
not do: a function child is a reactive getter), against keeping `markup` a documented recipe.
