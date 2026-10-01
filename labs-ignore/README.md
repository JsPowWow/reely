# Labs

Experiments around reely: not linted by the workspace, not built, not shipped. Each lab asks one
question, answers it with specs, and records the verdict in its README. What proves itself moves
into a package; the rest stays here as a record.

| Lab | Question | Verdict |
|---|---|---|
| [`dml`](dml/README.md) | Can markup take `for`, `if` and `switch` through `begin`/`end`, without a core change? | Generators (`markup(function* …)`) do; `begin`/`end` and `using within()` share a parent across `await` |
| [`signals-graph`](signals-graph/README.md) | An Angular-style push-dirty, pull-value graph (`signal`, `computed`, `effect`, `watch`) | A diamond shows an effect a stale computed and re-runs it without end; dommy's reelx does not |
| [`signal-cores`](signal-cores/README.md) | Which signal core should dommy ship: act's port, the same restructured, or a push-pull graph? | The push-pull graph: readable, fastest on a scoreboard's work, about 300 B more; the other two still pass the same public-API specs here |

Run from the repo root (one config for every lab; `@reely/dommy` resolves to its source):

```sh
npx vitest run --config labs-ignore/vitest.config.mts
npx tsc -p labs-ignore/tsconfig.json
```
