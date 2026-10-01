import { effect } from '@reely/dommy';

import { packageExamples } from './package.examples';
import { packageText } from './package.text';
import { MutationMeter } from '../../demo/mutation.meter';
import { SourceView } from '../../demo/source.view';
import { kB, packages } from '../../measure/measures';
import band from '../../site/band.module.css';
import exampleCss from '../../site/example.module.css';
import { packagesText } from '../../site/packages.text';
import { SiteHeader } from '../../site/site.header';
import { sitePackages } from '../../site/site.packages';
import { docHref, packageHref } from '../../site/site.paths';

import css from './package.module.css';

import type { PagedPackage } from '../../site/site.packages';

const readmeHref = (name: PagedPackage): string =>
  `https://github.com/JsPowWow/reely/tree/main/packages/${name}#readme`;

const npmHref = (name: PagedPackage): string => `https://www.npmjs.com/package/@reely/${name}`;

// a package that dommy's docs show at work in the DOM, and where
const dommyDocs: Partial<Record<PagedPackage, string>> = { signals: docHref('signals') };

/** A package's page: what it is for, how to install it, its measured facts, and one live example. */
export const PackagePage = ({ name }: { name: PagedPackage }): Node => {
  const { version, gzipBytes, uses, exports } = packages[name];
  const builtOn = sitePackages.filter((used) => uses.includes(used));
  const { Demo, file, source } = packageExamples[name];
  effect(() => {
    document.title = `@reely/${name} | reely`;
  });

  return (
    <>
      <SiteHeader current='packages' />
      <main>
        <section className={band.start} aria={{ ariaLabelledby: 'start-title' }}>
          <div className={band.startCopy}>
            <h1 id='start-title' className={css.name}>
              <span className={css.scope}>@reely/</span>
              {name}
            </h1>
            <p className={band.pitch}>{() => packagesText().why[name]}</p>
            <div className={band.actions}>
              <code className={band.install}>npm i @reely/{name}</code>
              <a className={css.link} href={readmeHref(name)}>
                {() => packageText().readme}
              </a>
              <a className={css.link} href={npmHref(name)}>
                {() => packageText().npm}
              </a>
            </div>
          </div>
          <dl className={css.facts}>
            <div>
              <dt>{() => packageText().version}</dt>
              <dd>{version}</dd>
            </div>
            <div>
              <dt>{() => packagesText().gzip}</dt>
              <dd>{kB(gzipBytes)}</dd>
            </div>
            <div>
              <dt>{() => (builtOn.length === 0 ? packagesText().standsAlone : packagesText().builtOn)}</dt>
              <dd className={css.uses}>
                {builtOn.map((used) => (
                  <a href={packageHref(used)}>@reely/{used}</a>
                ))}
              </dd>
            </div>
          </dl>
        </section>
        <section className={exampleCss.example} aria={{ ariaLabelledby: 'example-title' }}>
          <header className={exampleCss.exampleHeading}>
            <h2 id='example-title' className={exampleCss.exampleTitle}>
              {() => packageText().examples[name].title}
            </h2>
            <p className={exampleCss.claim}>{() => packageText().examples[name].claim}</p>
            {dommyDocs[name] && (
              <a className={css.inDocs} href={dommyDocs[name]}>
                {() => packageText().inDommyDocs}
              </a>
            )}
          </header>
          <div className={exampleCss.panels}>
            <MutationMeter>
              <Demo />
            </MutationMeter>
            <SourceView source={source} caption={file} />
          </div>
        </section>
        <section className={exampleCss.example} aria={{ ariaLabelledby: 'exports-title' }}>
          <header className={exampleCss.exampleHeading}>
            <h2 id='exports-title' className={exampleCss.exampleTitle}>
              {() => packageText().exports}
            </h2>
            <p className={exampleCss.claim}>{() => packageText().exportsNote}</p>
          </header>
          <ul className={css.exports}>
            {exports.map((exported) => (
              <li>
                <code>{exported}</code>
              </li>
            ))}
          </ul>
        </section>
      </main>
    </>
  );
};
