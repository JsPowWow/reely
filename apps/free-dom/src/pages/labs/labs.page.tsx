import { SourceView } from '../../demo/source.view';
import { SiteHeader } from '../../site/site.header';
import guide from '../../site/guide.module.css';
import { Live } from '../docs/docs.live';
import docs from '../docs/docs.module.css';
import diamondSpecSource from '../../../../../labs-ignore/signals-graph/diamond.spec.ts?highlight';
import { DiamondLog } from './demos/diamond.log';
import diamondLogSource from './demos/diamond.log.tsx?highlight';
import { MarkupList } from './demos/markup.list';
import markupListSource from './demos/markup.list.tsx?highlight';
import { SharedParent } from './demos/shared.parent';
import sharedParentSource from './demos/shared.parent.tsx?highlight';
import css from './labs.module.css';

const labSource = (path: string): string => `https://github.com/JsPowWow/reely/tree/main/labs-ignore/${path}`;

export const LabsPage = (): Node => {
  document.title = 'Labs | reely';

  return (
    <>
      <SiteHeader current='labs' />
      <main className={css.labs}>
        <header>
          <h1 className={guide.title}>Labs</h1>
          <p className={guide.lead}>
            Experiments around reely that are not shipped. Each lab asks one question, answers it with specs, and ends on
            a verdict: what proves itself moves into a package, the rest stays as a record.
          </p>
        </header>
        <section className={css.lab} aria={{ ariaLabelledby: 'dml' }}>
          <h2 id='dml' className={css.labTitle}>
            Statements inside markup
          </h2>
          <div className={docs.details}>
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
            <Live Demo={MarkupList} caption='markup.list.tsx' source={markupListSource} />
            <p>
              The other two share one current parent for the whole module. Two builds that wait in the middle put their
              second items into whichever parent is current by then:
            </p>
            <Live Demo={SharedParent} caption='shared.parent.tsx' source={sharedParentSource} />
            <h3>Verdict</h3>
            <p>
              The generator is the one worth keeping: statements in markup, balanced by syntax, no shared state, no core
              change. Its cost is a <code>yield</code> per child, and a forgotten <code>yield</code> drops the child
              silently. <a href={labSource('dml')}>The lab and its specs</a>.
            </p>
          </div>
        </section>
        <section className={css.lab} aria={{ ariaLabelledby: 'signals-graph' }}>
          <h2 id='signals-graph' className={css.labTitle}>
            A signal graph in the shape of Angular’s
          </h2>
          <div className={docs.details}>
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
            <SourceView source={diamondSpecSource} caption='labs-ignore/signals-graph/diamond.spec.ts' />
            <p>The same diamond in dommy logs one current pair per change:</p>
            <Live Demo={DiamondLog} caption='diamond.log.tsx' source={diamondLogSource} />
            <h3>Verdict</h3>
            <p>
              Kept as a record. A push graph has to mark every dirty node before it runs any effect; running effects
              during the push is what makes the glitch and the loop. <a href={labSource('signals-graph')}>The lab and its
              specs</a>.
            </p>
          </div>
        </section>
      </main>
    </>
  );
};
