import { effect } from '@reely/dommy';

import { boardPackages, homeText } from './home.text';
import { Scoreboard } from './scoreboard/scoreboard';
import { MutationMeter } from '../../demo/mutation.meter';
import { kB, packages } from '../../measure/measures';
import band from '../../site/band.module.css';
import { packagesText } from '../../site/packages.text';
import { SiteHeader } from '../../site/site.header';
import { sitePackages } from '../../site/site.packages';
import { packageHref } from '../../site/site.paths';

import css from './home.module.css';

import type { Car } from './scoreboard/race';
import type { SitePackage } from '../../site/site.packages';

// made up for the board: synthetic cars in a simulated race
const cars: readonly Car[] = [
  { name: 'Comet', color: '#3b6ea5' },
  { name: 'Falcon', color: '#c2912e' },
  { name: 'Lynx', color: '#5a7d3a' },
  { name: 'Orca', color: '#7a4f9a' },
  { name: 'Vega', color: '#b0703a' },
  { name: 'Kite', color: '#3d8a80' },
  { name: 'Mako', color: '#8d9aa6' },
  { name: 'Rook', color: '#8a5a44' },
];

const plateId = (name: SitePackage): string => `package-${name}`;

const facts = sitePackages.map((name) => packages[name]);
const outsideDependencies = new Set(facts.flatMap(({ outside }) => outside)).size;
const lightest = Math.min(...facts.map(({ gzipBytes }) => gzipBytes));

const npmName = (name: string): string => `@reely/${name}`;

const PackagePlate = ({ name }: { name: SitePackage }): Node => {
  const { version, gzipBytes, uses } = packages[name];
  return (
    <a id={plateId(name)} className={css.plate} href={packageHref(name)}>
      <span className={css.plateHead}>
        <span className={css.name}>
          <span className={css.scope}>@reely/</span>
          {name}
        </span>
        <span className={css.version}>{version}</span>
      </span>
      <span className={css.why}>{() => packagesText().why[name]}</span>
      <span className={css.size}>
        <span className={css.figure}>{kB(gzipBytes)}</span>
        <span className={css.sizeLabel}>{() => packagesText().gzip}</span>
      </span>
      <span className={css.uses}>
        {() =>
          uses.length === 0 ? packagesText().standsAlone : `${packagesText().builtOn} ${uses.map(npmName).join(', ')}`
        }
      </span>
    </a>
  );
};

export const HomePage = (): Node => {
  effect(() => {
    document.title = homeText().documentTitle;
  });

  return (
    <>
      <SiteHeader current='home' />
      <main>
        <section className={`${band.start} ${band.startTop}`} aria={{ ariaLabelledby: 'start-title' }}>
          <div className={band.startCopy}>
            <h1 id='start-title' className={`${band.title} ${band.titleLong}`}>
              {() => homeText().title}
            </h1>
            <p className={band.pitch}>{() => homeText().lead}</p>
            <dl className={band.facts}>
              <div>
                <dt>{() => homeText().facts.packages}</dt>
                <dd>{String(sitePackages.length)}</dd>
              </div>
              <div>
                <dt>{() => homeText().facts.outside}</dt>
                <dd>{String(outsideDependencies)}</dd>
              </div>
              <div>
                <dt>{() => homeText().facts.lightest}</dt>
                <dd>{kB(lightest)}</dd>
              </div>
            </dl>
            <div className={band.actions}>
              <a className={band.primary} href='#packages'>
                {() => homeText().findPackage}
              </a>
              <p className={band.builtWith}>{() => homeText().builtWith}</p>
            </div>
            <div className={css.credits}>
              <p className={css.creditsTitle}>{() => homeText().board.madeWith}</p>
              <ul className={css.creditList}>
                {boardPackages.map((name) => (
                  <li>
                    <a href={`#${plateId(name)}`}>@reely/{name}</a>
                    {() => `: ${homeText().board.parts[name]}`}
                  </li>
                ))}
              </ul>
            </div>
          </div>
          <div className={css.startBoard}>
            <MutationMeter>
              <Scoreboard cars={cars} seed={2026} />
            </MutationMeter>
          </div>
        </section>
        <section id='packages' className={css.packages} aria={{ ariaLabelledby: 'packages-title' }}>
          <h2 id='packages-title' className={css.packagesTitle}>
            {() => homeText().packages.title}
          </h2>
          <p className={css.packagesLead}>{() => homeText().packages.lead}</p>
          <ul className={css.plates}>
            {sitePackages.map((name) => (
              <li>
                <PackagePlate name={name} />
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
};
