import { effect } from '@reely/dommy';
import { hasSome, isNil } from '@reely/utils';
import type { Nullable } from '@reely/utils';

import { Localized } from '../../i18n/localized.view';
import { demoText } from '../../demo/demo.text';
import { MutationMeter } from '../../demo/mutation.meter';
import { SourceView } from '../../demo/source.view';
import { Pager } from '../../site/pager';
import { SiteHeader } from '../../site/site.header';
import { siteText } from '../../site/site.text';
import css from '../../site/guide.module.css';
import { evolutionSteps } from './evolution.steps';
import { evolutionText } from './evolution.text';

import type { PagerLink } from '../../site/pager';
import type { EvolutionStep } from './evolution.steps';

const stepHref = (step: EvolutionStep): string => `/evolution/${step.slug}`;

const titleOf = (step: EvolutionStep): string => evolutionText().steps[step.slug].title;

const toPagerLink = (step: EvolutionStep | undefined): Nullable<PagerLink> =>
  hasSome(step) ? { href: stepHref(step), title: () => titleOf(step) } : null;

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

  effect(() => {
    document.title = isNil(step)
      ? siteText().notFound.documentTitle
      : `${evolutionText().step(index + 1)} ${titleOf(step)} | ${evolutionText().documentTitle}`;
  });

  return (
    <>
      <SiteHeader current='evolution' />
      <div className={css.guide}>
        <nav className={css.rail} aria={{ ariaLabel: () => evolutionText().railLabel }}>
          <a className={css.home} href='/evolution'>
            {() => evolutionText().home}
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
                  <span className={css.stepTitle}>{() => titleOf(item)}</span>
                </a>
              </li>
            ))}
          </ol>
          <p className={css.keys}>
            <Localized view={() => evolutionText().Keys} />
          </p>
        </nav>
        <main className={css.main}>
          {isNil(step) ? (
            <header className={css.missing}>
              <h1 className={css.title}>{() => evolutionText().missing.title(String(slug))}</h1>
              <p className={css.lead}>{() => evolutionText().missing.lead}</p>
              {hasSome(first) && (
                <a className={css.start} href={stepHref(first)}>
                  {() => evolutionText().missing.start}
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
                  <span className='visually-hidden'>{() => `${evolutionText().step(index + 1)} `}</span>
                  {() => titleOf(step)}
                </h1>
                <p className={css.lead}>{() => evolutionText().steps[step.slug].lead}</p>
              </header>,
              <section className={css.panels} aria={{ ariaLabel: () => demoText().panelsLabel }}>
                <MutationMeter>
                  <step.Demo />
                </MutationMeter>
                <SourceView
                  source={step.source}
                  caption={() =>
                    hasSome(trackPrevious)
                      ? evolutionText().caption.changed(trackIndex + 1)
                      : evolutionText().caption.fresh
                  }
                  previous={trackPrevious?.source}
                />
              </section>,
              <Pager previous={toPagerLink(previous)} next={toPagerLink(next)}>
                <section className={css.ending} aria={{ ariaLabelledby: 'ending-title' }}>
                  <h2 id='ending-title'>{() => evolutionText().ending.title}</h2>
                  <p>
                    <Localized view={() => evolutionText().ending.Text} />
                  </p>
                  <a href='/docs'>{() => evolutionText().ending.docs}</a>
                </section>
              </Pager>,
            ]
          )}
        </main>
      </div>
    </>
  );
};
