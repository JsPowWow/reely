import { MutationMeter } from '../../demo/mutation.meter';
import { SourceView } from '../../demo/source.view';
import { measured } from '../../site/measurements';
import { SiteHeader } from '../../site/site.header';
import { Counter } from '../docs/demos/first.counter';
import { landingExamples } from './landing.examples';
import css from './landing.module.css';

import type { LandingExample } from './landing.examples';

const Example = ({ example }: { example: LandingExample }): Node => (
  <section id={example.id} className={css.example} aria={{ ariaLabelledby: `${example.id}-title` }}>
    <header className={css.exampleHeading}>
      <h2 id={`${example.id}-title`} className={css.exampleTitle}>
        {example.title}
      </h2>
      <p className={css.claim}>{example.claim}</p>
    </header>
    <div className={css.panels}>
      <MutationMeter>
        <example.Demo />
      </MutationMeter>
      <SourceView source={example.source} caption={example.file} />
    </div>
  </section>
);

/**
 * The landing page: what reely is, four live examples with their DOM writes counted, then the
 * size and speed and the way into the docs.
 */
export const LandingPage = (): Node => {
  document.title = 'reely: real DOM, one write per change';

  return (
    <>
      <SiteHeader current='home' />
      <main className={css.landing}>
        <section className={css.start} aria={{ ariaLabelledby: 'start-title' }}>
          <div className={css.startCopy}>
            <h1 id='start-title' className={css.title}>
              Real DOM. One write per change.
            </h1>
            <p className={css.pitch}>
              @reely/dommy builds real DOM from tag factories and JSX, and binds each signal to the one node it changes.
              No virtual DOM, no re-render, no dependencies.
            </p>
            <div className={css.actions}>
              <a className={css.primary} href='/docs'>
                Open the docs
              </a>
              <code className={css.install}>npm i @reely/dommy@next</code>
            </div>
            <p className={css.builtWith}>This page, its examples and their write counters are built with reely.</p>
          </div>
          <div className={css.startDemo}>
            <MutationMeter>
              <Counter />
            </MutationMeter>
          </div>
        </section>
        {landingExamples.map((example) => (
          <Example example={example} />
        ))}
        <section id='numbers' className={css.numbers} aria={{ ariaLabelledby: 'numbers-title' }}>
          <div className={css.numbersInner}>
            <h2 id='numbers-title' className={css.numbersTitle}>
              Size and speed
            </h2>
            <table className={css.times}>
              <caption className='visually-hidden'>Size, minified and gzipped, and speed</caption>
              <tbody>
                <tr>
                  <th scope='row'>An app that uses only signals ships</th>
                  <td>{measured.signalsOnly}</td>
                </tr>
                <tr>
                  <th scope='row'>A JSX app with For, Show and mount ships</th>
                  <td>{measured.jsxApp}</td>
                </tr>
                <tr>
                  <th scope='row'>The whole package, gzipped</th>
                  <td>{measured.wholePackage}</td>
                </tr>
                <tr>
                  <th scope='row'>Re-sorting a 500-row list, median in headless Chrome</th>
                  <td>{measured.lapMedian}</td>
                </tr>
              </tbody>
            </table>
            <p className={css.numbersNote}>
              Measured on the npm tarball, bundled with esbuild. Time the 500 rows in your own browser on{' '}
              <a href='/docs/performance'>Size and speed</a>.
            </p>
            <div className={css.actions}>
              <a className={css.primary} href='/docs'>
                Open the docs
              </a>
              <a className={css.secondary} href='/evolution'>
                See it built step by step
              </a>
              <a className={css.secondary} href='https://github.com/JsPowWow/reely'>
                Source on GitHub
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};
