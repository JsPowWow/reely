import type { JSX } from '@reely/dommy';
import { hasSome, isNil } from '@reely/utils';

import { MutationMeter } from './mutation.meter';
import { SourceView } from './source.view';
import css from './tutorial.module.css';
import { tutorialSteps } from './tutorial.steps';

import type { TutorialStep } from './tutorial.steps';

interface TutorialPageProps {
  /** The step to show; the first step when omitted. */
  slug?: string;
}

const stepHref = (step: TutorialStep): string => `/tutorial/${step.slug}`;

/**
 * The lesson page: step rail, the live demo with its DOM write counter, and the step source.
 */
export const TutorialPage = ({ slug }: TutorialPageProps): JSX.Element => {
  const index = isNil(slug) ? 0 : tutorialSteps.findIndex((item) => item.slug === slug);
  const step = tutorialSteps[index];
  const previous = tutorialSteps[index - 1];
  const next = tutorialSteps[index + 1];
  const trackIndex = tutorialSteps.reduce(
    (found, item, itemIndex) => (itemIndex < index && item.track === step?.track ? itemIndex : found),
    -1
  );
  const trackPrevious = tutorialSteps[trackIndex];

  return (
    <div className={css.tutorial}>
      <nav className={css.rail} aria={{ ariaLabel: 'Tutorial steps' }}>
        <a className={css.home} href='/tutorial'>
          reely, step by step
        </a>
        <ol className={css.steps}>
          {tutorialSteps.map((item, itemIndex) => (
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
        <a className={css.back} href='https://github.com/JsPowWow/reely'>
          Source on GitHub
        </a>
      </nav>
      <main className={css.main}>
        {isNil(step) ? (
          <header className={css.heading}>
            <h1 className={css.title}>There is no step “{slug}”</h1>
            <p className={css.lead}>Pick a step from the list, or start from the first one.</p>
          </header>
        ) : (
          [
            <header className={css.heading}>
              <span className={css.bigNumber} aria={{ ariaHidden: 'true' }}>
                {index + 1}
              </span>
              <h1 className={css.title}>
                <span className={css.visuallyHidden}>Step {index + 1}. </span>
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
                previous={hasSome(trackPrevious) ? { source: trackPrevious.source, number: trackIndex + 1 } : null}
              />
            </section>,
            <footer className={css.pager}>
              {hasSome(previous) && (
                <a className={css.previous} href={stepHref(previous)}>
                  Previous: {previous.title}
                </a>
              )}
              {hasSome(next) && (
                <a className={css.next} href={stepHref(next)}>
                  Next: {next.title}
                </a>
              )}
            </footer>,
          ]
        )}
      </main>
    </div>
  );
};
