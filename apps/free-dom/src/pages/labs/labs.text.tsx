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
      Body: ({ markupList, sharedParent }: LabExamples): Node => (
        <>
          <p>
            Can markup take <code>for</code>, <code>if</code> and <code>switch</code> with <code>begin</code>/
            <code>end</code>, without a change to dommy’s core? The lab tried three shapes:
          </p>
          <ul>
            <li>
              A generator, <code>markup(function* () {'{ … }'})</code>: every <code>yield</code> adds a child, and the
              block closes with its brace.
            </li>
            <li>
              <code>using within(parent)</code>: a current parent that the block closes, even when it throws.
            </li>
            <li>
              <code>begin</code>/<code>end</code> by hand: nothing checks the balance.
            </li>
          </ul>
          <p>The generator needs one line of helper, keeps no state, and runs once, like a component:</p>
          {markupList}
          <p>
            The other two share one current parent for the whole module. Two builds that wait in the middle put their
            second items into whichever parent is current by then:
          </p>
          {sharedParent}
          <h3>Verdict</h3>
          <p>
            The generator is the one worth keeping: statements in markup, balanced by syntax, no shared state, no core
            change. Its cost is a <code>yield</code> per child, and a forgotten <code>yield</code> drops the child
            silently. <a href={labSource('dml')}>The lab and its specs</a>.
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
            <code>effect</code> runs as soon as it is notified. The lab predates dommy’s signals and stays as the
            comparison. Its telling case is a diamond: an effect that reads <code>count</code> and{' '}
            <code>double = count * 2</code>.
          </p>
          <p>
            In the lab, a write of 2 runs the effect before <code>double</code> is marked dirty: it logs 2 / 2, a pair
            that never existed, then keeps running itself until something stops it. The spec pins both:
          </p>
          {diamondSpec}
          <p>The same diamond in dommy logs one current pair per change:</p>
          {diamondLog}
          <h3>Verdict</h3>
          <p>
            Kept as a record. A push graph has to mark every dirty node before it runs any effect; running effects
            during the push is what makes the glitch and the loop.{' '}
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
