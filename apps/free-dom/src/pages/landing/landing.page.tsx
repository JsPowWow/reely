import { MutationMeter } from '../../demo/mutation.meter';
import { SourceView } from '../../demo/source.view';
import { measured } from '../../site/measurements';
import { SiteHeader } from '../../site/site.header';
import { Counter } from '../docs/demos/first.counter';
import { trackLap } from './lap.progress';
import css from './landing.module.css';
import { lapSectors } from './landing.sectors';

import type { LapSector } from './landing.sectors';

const Sector = ({ sector, number }: { sector: LapSector; number: number }): Node => (
  <section id={sector.id} className={css.sector} aria={{ ariaLabelledby: `${sector.id}-title` }}>
    <header className={css.sectorHeading}>
      <h2 id={`${sector.id}-title`} className={css.sectorTitle}>
        <span className={css.sectorNumber}>S{number}</span> {sector.name}
      </h2>
      <p className={css.claim}>{sector.claim}</p>
      <p className={css.split}>
        <span className='visually-hidden'>Split: </span>
        {sector.split}
      </p>
    </header>
    <div className={css.panels}>
      <MutationMeter>
        <sector.Demo />
      </MutationMeter>
      <SourceView source={sector.source} caption={sector.file} />
    </div>
  </section>
);

/**
 * The landing page: one lap of reely. The start straight says what it is, four sectors prove it
 * live, and the finish gives the times and the way into the docs.
 */
const finishId = 'finish';

/** The sector bar: every sector, then the finish, each with the split it posts once driven. */
const segments = [
  ...lapSectors.map((sector, index) => ({ id: sector.id, number: `S${index + 1}`, name: sector.name, mark: sector.mark })),
  { id: finishId, number: 'F', name: 'Finish', mark: measured.wholePackage },
];

export const LandingPage = (): Node => {
  document.title = 'reely: real DOM, one write per change';
  const fills = trackLap(segments.map((segment) => segment.id));

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
            <p className={css.builtWith}>This site is built with reely, the sector bar below included.</p>
          </div>
          <div className={css.startDemo}>
            <MutationMeter>
              <Counter />
            </MutationMeter>
          </div>
        </section>
        <nav className={css.sectorBar} aria={{ ariaLabel: 'The lap' }}>
          <ol className={css.segments}>
            {segments.map((segment, index) => {
              const fill = (): number => fills[index]?.() ?? 0;
              return (
                <li>
                  <a
                    className={css.segment}
                    href={`#${segment.id}`}
                    data-driven={() => String(fill() === 1)}
                    styles={{ '--fill': () => String(fill()) }}
                  >
                    <span className={css.segmentNumber}>{segment.number}</span>
                    <span className={css.segmentName}>{segment.name}</span>
                    <span className={css.segmentMark}>{segment.mark}</span>
                    <span className={css.track} aria={{ ariaHidden: 'true' }} />
                  </a>
                </li>
              );
            })}
          </ol>
        </nav>
        {lapSectors.map((sector, index) => (
          <Sector sector={sector} number={index + 1} />
        ))}
        <section id={finishId} className={css.finish} aria={{ ariaLabelledby: 'finish-title' }}>
          <div className={css.finishInner}>
            <h2 id='finish-title' className={css.finishTitle}>
              Finish
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
                  <th scope='row'>A lap of a 500-row board, median in headless Chrome</th>
                  <td>{measured.lapMedian}</td>
                </tr>
              </tbody>
            </table>
            <p className={css.finishNote}>
              Measured on the npm tarball, bundled with esbuild. Time the 500 rows in your own browser on{' '}
              <a href='/docs/performance'>Size and speed</a>.
            </p>
            <p className={css.finishBuilt}>
              Every page of this site, every demo and every write counter is built with @reely/dommy.
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
