import { effect } from '@reely/dommy';

import { Localized } from '../../i18n/localized.view';
import { MutationMeter } from '../../demo/mutation.meter';
import { SourceView } from '../../demo/source.view';
import { measured } from '../../site/measurements';
import { SiteHeader } from '../../site/site.header';
import { LikeButton } from '../docs/demos/like.button';
import { landingExamples } from './landing.examples';
import css from './landing.module.css';
import { landingText } from './landing.text';

import type { LandingExample } from './landing.examples';

const Example = ({ example }: { example: LandingExample }): Node => (
  <section id={example.id} className={css.example} aria={{ ariaLabelledby: `${example.id}-title` }}>
    <header className={css.exampleHeading}>
      <h2 id={`${example.id}-title`} className={css.exampleTitle}>
        {() => landingText().examples[example.id].title}
      </h2>
      <p className={css.claim}>{() => landingText().examples[example.id].claim}</p>
    </header>
    <div className={css.panels}>
      <MutationMeter>
        <example.Demo />
      </MutationMeter>
      <SourceView source={example.source} caption={example.file} />
    </div>
  </section>
);

export const LandingPage = (): Node => {
  effect(() => {
    document.title = landingText().documentTitle;
  });

  return (
    <>
      <SiteHeader current='home' />
      <main className={css.landing}>
        <section className={css.start} aria={{ ariaLabelledby: 'start-title' }}>
          <div className={css.startCopy}>
            <h1 id='start-title' className={css.title}>
              {() => landingText().title}
            </h1>
            <p className={css.pitch}>{() => landingText().pitch}</p>
            <div className={css.actions}>
              <a className={css.primary} href='/docs'>
                {() => landingText().openDocs}
              </a>
              <code className={css.install}>npm i @reely/dommy</code>
            </div>
            <p className={css.builtWith}>{() => landingText().builtWith}</p>
          </div>
          <div className={css.startDemo}>
            <MutationMeter>
              <LikeButton />
            </MutationMeter>
          </div>
        </section>
        {landingExamples.map((example) => (
          <Example example={example} />
        ))}
        <section id='numbers' className={css.numbers} aria={{ ariaLabelledby: 'numbers-title' }}>
          <div className={css.numbersInner}>
            <h2 id='numbers-title' className={css.numbersTitle}>
              {() => landingText().numbers.title}
            </h2>
            <table className={css.times}>
              <caption className={css.timesCaption}>{() => landingText().numbers.caption}</caption>
              <tbody>
                <tr>
                  <th scope='row'>{() => landingText().numbers.signalsOnly}</th>
                  <td>{measured.signalsOnly}</td>
                </tr>
                <tr>
                  <th scope='row'>{() => landingText().numbers.jsxApp}</th>
                  <td>{measured.jsxApp}</td>
                </tr>
                <tr>
                  <th scope='row'>{() => landingText().numbers.wholePackage}</th>
                  <td>{measured.wholePackage}</td>
                </tr>
              </tbody>
            </table>
            <p className={css.numbersNote}>
              <Localized view={() => landingText().numbers.Note} />
            </p>
            <div className={css.actions}>
              <a className={css.primary} href='/docs'>
                {() => landingText().openDocs}
              </a>
              <a className={css.secondary} href='/evolution'>
                {() => landingText().numbers.stepByStep}
              </a>
              <a className={css.secondary} href='https://github.com/JsPowWow/reely'>
                {() => landingText().numbers.github}
              </a>
            </div>
          </div>
        </section>
      </main>
    </>
  );
};
