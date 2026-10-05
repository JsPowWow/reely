import { CoresTable } from './labs.cores';
import { labSource } from './labs.source';
import { localized } from '../../i18n/localized';

import type { LabExamples } from './labs.examples';

/** The labs, in the order the page shows them. */
export type LabId = 'dml' | 'signals-graph' | 'signal-cores';

const en = {
  documentTitle: 'Labs | reely',
  title: 'Labs',
  lead: 'Experiments around reely that are not shipped. Each lab asks one question, answers it with specs and measurements, and ends on a verdict: what proves itself moves into a package, the rest stays as a record.',
  labs: {
    dml: {
      title: 'Statements inside markup',
      Body: ({ ordersDml, panelsDml, panelsInto }: LabExamples): Node => (
        <>
          <p>
            The idea comes from van-dml, an add-on to VanJS: <code>begin(ul())</code> opens a parent, every tag after it
            lands inside on its own, <code>end()</code> closes it. Between the two you write plain code, so{' '}
            <code>for</code>, <code>if</code> and <code>switch</code> sit right in the markup. Can dommy do that without
            a change to its core?
          </p>
          <p>
            First, the baseline nobody has to build: a component is a function, so it can loop, branch and{' '}
            <code>return</code> what it made. Any statement already works there. The question is only whether begin/end
            reads better.
          </p>
          <p>
            It does read well. Below, a <code>for</code> skips cancelled orders with <code>continue</code>, a{' '}
            <code>switch</code> picks the line, and an <code>if</code> adds a footer. Each <code>row(…)</code> appends
            itself to the current <code>ul</code>:
          </p>
          {ordersDml}
          <p>
            Now the catch. “The current parent” is one stack for the whole module, and an <code>await</code> lets
            someone else push onto it. Two panels load side by side: each opens its <code>ul</code>, shows a title,
            awaits its line, then closes. Press the button and look at the result: the Calendar opened while the Inbox
            was waiting, so it sits inside the Inbox, and the Inbox’s lines landed in whatever was current when they
            arrived.
          </p>
          {panelsDml}
          <p>
            The fix is to stop sharing. <code>into(parent, (tags) =&gt; …)</code> hands the block tags that append to{' '}
            <code>parent</code>, and the closure holds it, so there is nothing current to steal. Same button, two
            separate lists, each with its own lines:
          </p>
          {panelsInto}
          <p>
            One more shape was tried: <code>using within(parent)</code>, where the block itself closes the parent, even
            on a throw. It never forgets an <code>end</code>, but its parent is still module state, so it fails across
            an <code>await</code> exactly like begin/end.
          </p>
          <h3>Verdict</h3>
          <p>
            begin/end stays out: a shared stack breaks under the first <code>await</code>, and a missing{' '}
            <code>end()</code> fails silently. A plain <code>return</code> needs nothing and is what dommy already does.{' '}
            <code>into</code> keeps van-dml’s terseness safely, at the price of one more way to build a tree, so it
            stays a recipe, not an export. <a href={labSource('dml')}>The lab and its specs</a>.
          </p>
        </>
      ),
    },
    'signals-graph': {
      title: 'A signal graph in the shape of Angular’s',
      Body: ({ diamondSpec, diamondLog }: LabExamples): Node => (
        <>
          <p>
            A <code>signal</code> pushes “dirty” to its consumers, a <code>computed</code> recomputes when read, an{' '}
            <code>effect</code> runs as soon as it is notified. The lab predates <code>@reely/signals</code>, and half
            of it made the cut: its Angular style of reading and writing, <code>count()</code>,{' '}
            <code>count.set(2)</code> and <code>count.update(fn)</code>, is how you can use the signals today, beside{' '}
            <code>.value</code>. Its engine did not, and a diamond shows why: an effect that reads <code>count</code>{' '}
            and <code>double = count * 2</code>.
          </p>
          <p>
            In the lab, a write of 2 runs the effect before <code>double</code> is marked dirty: it logs 2 / 2, a pair
            that never existed, then keeps running itself until something stops it. The spec pins both:
          </p>
          {diamondSpec}
          <p>
            The same diamond on <code>@reely/signals</code>, written in the lab’s style, logs one current pair per
            change:
          </p>
          {diamondLog}
          <h3>Verdict</h3>
          <p>
            The style shipped, the engine stays a record. A push graph has to mark every dirty node before it runs any
            effect; running effects during the push is what makes the glitch and the loop.{' '}
            <a href={labSource('signals-graph')}>The lab and its specs</a>.
          </p>
        </>
      ),
    },
    'signal-cores': {
      title: 'Which signal core to ship',
      Body: (): Node => (
        <>
          <p>
            dommy began on a signal core ported from act by artalar. Before it moved into <code>@reely/signals</code>,
            three cores were brought to the same specs and timed on the same graphs:
          </p>
          <ul>
            <li>
              <code>act</code>, the port: states push to whatever read them, a computed checks snapshots of what it
              read. Small and fast enough, but one closure plays two kinds of node, and three type escapes hold it
              together.
            </li>
            <li>
              <code>restructured</code>: the same algorithm rewritten to be read, a state node and a computed node, no
              type escapes.
            </li>
            <li>
              A push-pull graph: a write marks what may have changed, a read brings a node up to date by comparing
              versions. The design known from Reactively, Preact signals and alien-signals.
            </li>
          </ul>
          <CoresTable
            caption='Three cores at the choice, one run on the author’s machine: size of signal, computed, effect, batch and untracked, minified and gzipped; time, the median of 7 rounds'
            labels={{
              size: 'Size',
              wide: 'Wide: 1000 signals, 10k writes',
              deep: 'Deep: 200 computeds in a chain',
              diamond: 'Diamond: 1 → 100 computeds → 1 effect',
              batch: 'Batch: 100 writes per batch',
              churn: 'Churn: 20k effects created and disposed',
            }}
          />
          <p>
            Bringing the cores to the same specs found four bugs in act, each fixed with a failing test first: an equal
            write that subscribed the writer, <code>!==</code> where the rest used <code>Object.is</code>, a subscriber
            left behind through a shared computed, and an effect that never subscribed to a computed it peeked first.
          </p>
          <h3>Verdict</h3>
          <p>
            The push-pull graph, now <code>@reely/signals</code> (it has grown about 40 B since): a model a reader can
            look up, and the fastest on what a scoreboard does (many point writes, rows that come and go, batches), for
            about 300 B more than act. The other two stay in the lab, still held to the same public specs, with the
            bench that timed them. <a href={labSource('signal-cores')}>The lab and its bench</a>.
          </p>
        </>
      ),
    },
  } satisfies Record<LabId, { title: string; Body: (examples: LabExamples) => Node }>,
};

/** The words of the labs page: its lead, and each lab's question, findings and verdict. */
export type LabsText = typeof en;

export const labsText = localized(en, () => import('./labs.text.ru').then((module) => module.ru));
