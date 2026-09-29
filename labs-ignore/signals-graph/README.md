# Signals graph

A signal graph in the shape of Angular's: a `signal` holds a value and pushes "dirty" to its
consumers, a `computed` recomputes lazily when read, an `effect` runs at once on every
notification (or once at the end of a `batch`), and `watch` calls back with the new and the old
value. It adds `mutate` for in-place changes and `untracked` reads. It predates dommy's `reelx`
and stays as the comparison.

## What the specs show

- `batch`, `mutate`, `untracked`, the cleanup an effect registers, and a thrown cycle between
  computeds (`signals.spec.ts`).
- The diamond (`diamond.spec.ts`): an effect that reads `count` and `double = count * 2`. A
  write notifies consumers in the order they subscribed, and an effect runs as soon as it is
  notified, so it runs before `double` is marked dirty and sees `2/2`, a value that never
  existed. Then it keeps re-running itself until something throws (the spec stops it at ten
  runs). dommy's `reelx` runs the same effect once, with `2/4`.

## Verdict

Kept as a record, not a candidate. A push-dirty graph must mark every dirty node before it runs
any effect (two phases, or a topological order); running effects inline during the push is what
makes the glitch and the loop. `reelx` already does this and is what dommy ships.
