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
  /** A URL that has no page: the course explains it instead of showing a step. */
  missingPath?: string;
}

const stepHref = (step: TutorialStep): string => `/tutorial/${step.slug}`;

/**
 * The lesson page: step rail, the live demo with its DOM write counter, and the step source.
 */
export const TutorialPage = ({ slug, missingPath }: TutorialPageProps): JSX.Element => {
  const index = hasSome(missingPath) ? -1 : isNil(slug) ? 0 : tutorialSteps.findIndex((item) => item.slug === slug);
  const step = tutorialSteps[index];
  const previous = tutorialSteps[index - 1];
  const next = tutorialSteps[index + 1];
  const trackIndex = tutorialSteps.reduce(
    (found, item, itemIndex) => (itemIndex < index && item.track === step?.track ? itemIndex : found),
    -1
  );
  const trackPrevious = tutorialSteps[trackIndex];
  const first = tutorialSteps[0];

  document.title = isNil(step) ? 'Not found | reely' : `Step ${index + 1}. ${step.title} | reely`;

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
        <p className={css.keys}>
          Use <kbd>←</kbd> and <kbd>→</kbd> to move between steps.
        </p>
        <a className={css.back} href='https://github.com/JsPowWow/reely'>
          Source on GitHub
        </a>
      </nav>
      <main className={css.main}>
        {isNil(step) ? (
          <header className={css.missing}>
            <h1 className={css.title}>
              {hasSome(missingPath) ? `There is no page at ${missingPath}` : `There is no step “${slug}”`}
            </h1>
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
                <a
                  className={css.previous}
                  href={stepHref(previous)}
                  rel='prev'
                  aria={{ ariaKeyShortcuts: 'ArrowLeft' }}
                >
                  Previous: {previous.title}
                </a>
              )}
              {hasSome(next) ? (
                <a className={css.next} href={stepHref(next)} rel='next' aria={{ ariaKeyShortcuts: 'ArrowRight' }}>
                  Next: {next.title}
                </a>
              ) : (
                <section className={css.ending} aria={{ ariaLabelledby: 'ending-title' }}>
                  <h2 id='ending-title'>What comes next</h2>
                  <p>
                    The race scoreboard of ai-race, built on these same lists. @reely/dommy 0.1 is not on npm yet: the
                    code in this course runs from the repo.
                  </p>
                  <a href='https://github.com/JsPowWow/reely'>Follow reely on GitHub</a>
                </section>
              )}
            </footer>,
          ]
        )}
      </main>
    </div>
  );
};
