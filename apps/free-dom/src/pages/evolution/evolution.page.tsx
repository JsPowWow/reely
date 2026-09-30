import { hasSome, isNil } from '@reely/utils';
import type { Nullable } from '@reely/utils';

import { MutationMeter } from '../../demo/mutation.meter';
import { SourceView } from '../../demo/source.view';
import { Pager } from '../../site/pager';
import { SiteHeader } from '../../site/site.header';
import css from '../../site/guide.module.css';
import { evolutionSteps } from './evolution.steps';

import type { PagerLink } from '../../site/pager';
import type { EvolutionStep } from './evolution.steps';

const stepHref = (step: EvolutionStep): string => `/evolution/${step.slug}`;

const toPagerLink = (step: EvolutionStep | undefined): Nullable<PagerLink> =>
  hasSome(step) ? { href: stepHref(step), title: () => step.title } : null;

export const EvolutionPage = ({ slug }: { slug?: string }): Node => {
  const index = isNil(slug) ? 0 : evolutionSteps.findIndex((item) => item.slug === slug);
  const step = evolutionSteps[index];
  const previous = evolutionSteps[index - 1];
  const next = evolutionSteps[index + 1];
  const trackIndex = evolutionSteps.reduce(
    (found, item, itemIndex) => (itemIndex < index && item.track === step?.track ? itemIndex : found),
    -1
  );
  const trackPrevious = evolutionSteps[trackIndex];
  const first = evolutionSteps[0];

  document.title = isNil(step) ? 'Not found | reely' : `Step ${index + 1}. ${step.title} | reely evolution`;

  return (
    <>
      <SiteHeader current='evolution' />
      <div className={css.guide}>
        <nav className={css.rail} aria={{ ariaLabel: 'Evolution steps' }}>
          <a className={css.home} href='/evolution'>
            reely evolution
          </a>
          <ol className={css.steps}>
            {evolutionSteps.map((item, itemIndex) => (
              <li>
                <a
                  className={css.stepLink}
                  href={stepHref(item)}
                  aria={itemIndex === index ? { ariaCurrent: 'step' } : {}}
                >
                  <span className={css.stepNumber}>{itemIndex + 1}</span>
                  <span className={css.stepTitle}>{item.title}</span>
                </a>
              </li>
            ))}
          </ol>
          <p className={css.keys}>
            Use <kbd>←</kbd> and <kbd>→</kbd> to move between steps.
          </p>
        </nav>
        <main className={css.main}>
          {isNil(step) ? (
            <header className={css.missing}>
              <h1 className={css.title}>There is no step “{slug}”</h1>
              <p className={css.lead}>Pick a step from the list, or start from the beginning.</p>
              {hasSome(first) && (
                <a className={css.start} href={stepHref(first)}>
                  Start with step 1
                </a>
              )}
            </header>
          ) : (
            [
              <header className={css.heading}>
                <span className={css.bigNumber} aria={{ ariaHidden: 'true' }}>
                  {index + 1}
                </span>
                <h1 className={css.title}>
                  <span className='visually-hidden'>Step {index + 1}. </span>
                  {step.title}
                </h1>
                <p className={css.lead}>{step.lead}</p>
              </header>,
              <section className={css.panels} aria={{ ariaLabel: 'Demo and source' }}>
                <MutationMeter>
                  <step.Demo />
                </MutationMeter>
                <SourceView
                  source={step.source}
                  caption={
                    hasSome(trackPrevious) ? `Highlighted: new since step ${trackIndex + 1}` : 'A new demo starts here'
                  }
                  previous={trackPrevious?.source}
                />
              </section>,
              <Pager previous={toPagerLink(previous)} next={toPagerLink(next)}>
                <section className={css.ending} aria={{ ariaLabelledby: 'ending-title' }}>
                  <h2 id='ending-title'>Where to go from here</h2>
                  <p>
                    Every step ran on @reely/dommy, published as a pre-release: install it with{' '}
                    <code>npm i @reely/dommy@next</code>, and look up each part in the docs.
                  </p>
                  <a href='/docs'>Read the docs</a>
                </section>
              </Pager>,
            ]
          )}
        </main>
      </div>
    </>
  );
};
