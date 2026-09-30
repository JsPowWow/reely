import { localized } from '../../i18n/localized';
import { labSource } from './labs.source';

import type { LabExamples } from './labs.examples';

/** The labs, in the order the page shows them. */
export type LabId = 'dml' | 'signals-graph';

const en = {
  documentTitle: 'Labs | reely',
  title: 'Labs',
  lead: 'Experiments around reely that are not shipped. Each lab asks one question, answers it with specs, and ends on a verdict: what proves itself moves into a package, the rest stays as a record.',
  labs: {
    dml: {
      title: 'Statements inside markup',
      Body: ({ markupList, sharedParent }: LabExamples): Node => (
        <>
          <p>
            Can markup take <code>for</code>, <code>if</code> and <code>switch</code> the way van_dml does with{' '}
            <code>begin</code>/<code>end</code>, without a change to dommy’s core? The lab tried three shapes:
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
              <code>begin</code>/<code>end</code> by hand, as in van_dml: nothing checks the balance.
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
  } satisfies Record<LabId, { title: string; Body: (examples: LabExamples) => Node }>,
};

/** The words of the labs page: its lead, and each lab's question, findings and verdict. */
export type LabsText = typeof en;

export const labsText = localized(en, () => import('./labs.text.ru').then((module) => module.ru));
