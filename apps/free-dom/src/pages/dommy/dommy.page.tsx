import { effect } from '@reely/dommy';

import { dommyExamples } from './dommy.examples';
import { DommyHeader } from './dommy.header';
import { dommyText } from './dommy.text';
import { MutationMeter } from '../../demo/mutation.meter';
import { SourceView } from '../../demo/source.view';
import { Localized } from '../../i18n/localized.view';
import { measured } from '../../measure/measures';
import band from '../../site/band.module.css';
import exampleCss from '../../site/example.module.css';
import { sitePaths } from '../../site/site.paths';
import { siteText } from '../../site/site.text';
import { LikeButton } from '../docs/demos/like.button';

import css from './dommy.module.css';

import type { DommyExample } from './dommy.examples';

const Example = ({ example }: { example: DommyExample }): Node => (
  <section id={example.id} className={exampleCss.example} aria={{ ariaLabelledby: `${example.id}-title` }}>
    <header className={exampleCss.exampleHeading}>
      <h2 id={`${example.id}-title`} className={exampleCss.exampleTitle}>
        {() => dommyText().examples[example.id].title}
      </h2>
      <p className={exampleCss.claim}>{() => dommyText().examples[example.id].claim}</p>
    </header>
    <div className={exampleCss.panels}>
      <MutationMeter>
        <example.Demo />
      </MutationMeter>
      <SourceView source={example.source} caption={example.file} />
    </div>
  </section>
);

export const DommyPage = (): Node => {
  effect(() => {
    document.title = dommyText().documentTitle;
  });

  return (
    <>
      <DommyHeader current='overview' />
      <main className={css.page}>
        <section className={band.start} aria={{ ariaLabelledby: 'start-title' }}>
          <div className={band.startCopy}>
            <h1 id='start-title' className={band.title}>
              {() => dommyText().title}
            </h1>
            <p className={band.pitch}>{() => dommyText().pitch}</p>
            <div className={band.actions}>
              <a className={css.primary} href={sitePaths.docs}>
                {() => siteText().openDocs}
              </a>
              <code className={band.install}>npm i @reely/dommy</code>
            </div>
            <p className={band.builtWith}>{() => dommyText().builtWith}</p>
          </div>
          <div className={css.startDemo}>
            <MutationMeter>
              <LikeButton />
            </MutationMeter>
          </div>
        </section>
        {dommyExamples.map((example) => (
          <Example example={example} />
        ))}
        <section id='numbers' className={css.numbers} aria={{ ariaLabelledby: 'numbers-title' }}>
          <div className={css.numbersInner}>
            <h2 id='numbers-title' className={css.numbersTitle}>
              {() => dommyText().numbers.title}
            </h2>
            <table className={css.times}>
              <caption className={css.timesCaption}>{() => dommyText().numbers.caption}</caption>
              <tbody>
                <tr>
                  <th scope='row'>{() => dommyText().numbers.signalsOnly}</th>
                  <td>{measured.signalsOnly}</td>
                </tr>
                <tr>
                  <th scope='row'>{() => dommyText().numbers.jsxApp}</th>
                  <td>{measured.jsxApp}</td>
                </tr>
                <tr>
                  <th scope='row'>{() => dommyText().numbers.wholePackage}</th>
                  <td>{measured.wholePackage}</td>
                </tr>
              </tbody>
            </table>
            <p className={css.numbersNote}>
              <Localized view={() => dommyText().numbers.Note} />
            </p>
            <div className={band.actions}>
              <a className={css.primary} href={sitePaths.docs}>
                {() => siteText().openDocs}
              </a>
              <a className={css.secondary} href={sitePaths.evolution}>
                {() => dommyText().numbers.stepByStep}
              </a>
              <a className={css.secondary} href='https://github.com/JsPowWow/reely'>
                {() => dommyText().numbers.github}
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};
