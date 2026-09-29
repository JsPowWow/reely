# Signal cores

Which signal core should dommy ship? Three cores were brought to the same specs and timed on the
same graphs. dommy ships the third, a push-pull graph (`packages/dommy/src/lib/reactive/reelx`);
the other two stay here.

- `act/`: the core dommy had, an adapted port of [act](https://github.com/artalar/act) by artalar
  (MIT): states push to the subscriptions that read them, a computed checks snapshots of what it
  read, and two version counters tell what is current. Small and fast enough, but hard to read:
  one closure for two kinds of node, seven module-level variables, three `@ts-expect-error`.
- `restructured/`: the same algorithm rewritten for reading: a state node and a computed node,
  one runtime object, no type escapes.
- shipped: sources with versions and observers; a write marks what may have changed and queues
  effects, a read brings a node up to date by comparing versions. The design known from
  Reactively, Preact signals and alien-signals, written from the concept.

Before the choice every core was fixed and aligned until it passed the same tests; the specs
`*.contract.spec.ts` run dommy's own signal specs against each core here, so they also show
whether a core here still keeps dommy's contract today.

## Numbers

Size: `signal`, `computed`, `effect`, `batch`, `untracked` bundled, minified and gzipped with
esbuild. Time: median of 7 interleaved rounds after warm-up (`bench.ts`), Node 24 on the author's
machine, one run; the figures move by ±10% between runs.

|                                         | act     | restructured | shipped |
| --------------------------------------- | ------- | ------------ | ------- |
| size                                    | 1509 B  | 1720 B       | 1825 B  |
| wide: 1000 signals, 10k writes          | 5.5 ms  | 4.8 ms       | 2.9 ms  |
| deep: 200 computeds in a chain          | 39.2 ms | 34.8 ms      | 39.3 ms |
| diamond: 1 → 100 computeds → 1 effect   | 49.5 ms | 43.0 ms      | 46.0 ms |
| batch: 100 writes per batch             | 13.4 ms | 18.7 ms      | 12.3 ms |
| churn: 20k effects created and disposed | 10.7 ms | 6.9 ms       | 5.3 ms  |

## Verdict

The push-pull graph: a model a reader can look up, and the fastest core on what a scoreboard
does (many point writes, rows that come and go, batches), for about 300 B more than act. The
restructured act reads better than the original but keeps its implicit invariants, and is the
slowest on batches. Aligning the cores found four bugs in act, each fixed in dommy with a failing
test before the choice: an equal write that subscribed the writer, `!==` where the rest used
`Object.is`, a subscriber left behind through a shared computed, and an effect that `peek()`ed a
computed before reading it and never subscribed. The shared specs then settled what the cores
did differently: a run's own untracked write no longer runs it again, a computed prints its
current value, and a replaced scheduler never sees a batch. The review of the merge found more,
and the specs pinned them for every core: an effect nested in another must run the outer one
again with what it writes, an effect waiting when a cycle stops must keep running, an effect
whose creation throws must never run again, and a flush must not ask the scheduler again for
the writes of its own effects. The two cores here got the same small fixes.

Run from the repo root:

```sh
npx vitest run --config labs-ignore/vitest.config.mts signal-cores
npx esbuild labs-ignore/signal-cores/bench.ts --bundle --platform=node --format=esm --outfile=/tmp/signal-cores-bench.mjs && node /tmp/signal-cores-bench.mjs
```
