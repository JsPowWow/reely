import { MutationMeter } from './mutation.meter';
import { SourceView } from './source.view';
import css from './tutorial.module.css';
import { tutorialSteps } from './tutorial.steps';

import type { TutorialStep } from './tutorial.steps';

interface TutorialPageProps {
  index: number;
}

const stepHref = (step: TutorialStep): string => `/tutorial/${step.slug}`;

/**
 * The lesson page: step rail, the live demo with its DOM write counter, and the step source.
 */
export const TutorialPage = ({ index }: TutorialPageProps): JSX.Element => {
  const step = tutorialSteps[index];
  if (!step) {
    return <h1>Step not found</h1>;
  }
  const previous = tutorialSteps[index - 1];
  const next = tutorialSteps[index + 1];
  const { Demo } = step;

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
                <span>{item.title}</span>
              </a>
            </li>
          ))}
        </ol>
      </nav>
      <main className={css.main}>
        <header className={css.heading}>
          <span className={css.bigNumber} aria={{ ariaHidden: 'true' }}>
            {index + 1}
          </span>
          <h1 className={css.title}>{step.title}</h1>
          <p className={css.lead}>{step.lead}</p>
        </header>
        <section className={css.panels} aria={{ ariaLabel: 'Demo and source' }}>
          <MutationMeter>
            <Demo />
          </MutationMeter>
          <SourceView source={step.source} previous={previous?.source} />
        </section>
        <footer className={css.pager}>
          {previous && <a href={stepHref(previous)}>Previous: {previous.title}</a>}
          {next && <a href={stepHref(next)}>Next: {next.title}</a>}
        </footer>
      </main>
    </div>
  );
};
