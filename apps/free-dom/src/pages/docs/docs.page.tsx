import { hasSome, isNil } from '@reely/utils';

import { MutationMeter } from '../../demo/mutation.meter';
import { SourceView } from '../../demo/source.view';
import { SiteHeader } from '../../site/site.header';
import guide from '../../site/guide.module.css';
import css from './docs.module.css';
import { docTopics } from './docs.topics';

import type { DocGroup, DocTopic } from './docs.topics';

const topicHref = (topic: DocTopic): string => `/docs/${topic.slug}`;

const groups: readonly DocGroup[] = ['Start', 'Markup', 'Reactivity', 'Structure', 'Measure'];

/**
 * A docs page: the topic rail, the answer with its live demo and source, the details, and the
 * way to the neighbouring topics.
 */
export const DocsPage = ({ slug }: { slug?: string }): Node => {
  const index = isNil(slug) ? 0 : docTopics.findIndex((item) => item.slug === slug);
  const topic = docTopics[index];
  const previous = docTopics[index - 1];
  const next = docTopics[index + 1];
  const first = docTopics[0];

  document.title = isNil(topic) ? 'Not found | reely' : `${topic.title} | reely docs`;

  return (
    <>
      <SiteHeader current='docs' />
      <div className={guide.guide}>
        <nav className={guide.rail} aria={{ ariaLabel: 'Docs topics' }}>
          <a className={guide.home} href='/docs'>
            Docs
          </a>
          {groups.map((group) => (
            <section className={css.group} aria={{ ariaLabel: group }}>
              <h2 className={css.groupName}>{group}</h2>
              <ul className={css.topics}>
                {docTopics
                  .filter((item) => item.group === group)
                  .map((item) => (
                    <li>
                      <a
                        className={css.topicLink}
                        href={topicHref(item)}
                        aria={item === topic ? { ariaCurrent: 'page' } : {}}
                      >
                        {item.title}
                      </a>
                    </li>
                  ))}
              </ul>
            </section>
          ))}
          <p className={guide.keys}>
            Use <kbd>←</kbd> and <kbd>→</kbd> to move between topics.
          </p>
        </nav>
        <main className={guide.main}>
          {isNil(topic) ? (
            <header className={guide.missing}>
              <h1 className={guide.title}>There is no topic “{slug}”</h1>
              <p className={guide.lead}>Pick a topic from the list, or start from the beginning.</p>
              {hasSome(first) && (
                <a className={guide.start} href={topicHref(first)}>
                  Getting started
                </a>
              )}
            </header>
          ) : (
            [
              <header className={css.heading}>
                <h1 className={guide.title}>{topic.title}</h1>
                <p className={guide.lead}>{topic.lead}</p>
              </header>,
              <section className={guide.panels} aria={{ ariaLabel: 'Demo and source' }}>
                <MutationMeter>
                  <topic.Demo />
                </MutationMeter>
                <SourceView source={topic.source} caption='The module that renders this demo' />
              </section>,
              <article className={css.details}>
                <topic.Details />
              </article>,
              <footer className={guide.pager}>
                {hasSome(previous) && (
                  <a href={topicHref(previous)} rel='prev' aria={{ ariaKeyShortcuts: 'ArrowLeft' }}>
                    Previous: {previous.title}
                  </a>
                )}
                {hasSome(next) ? (
                  <a className={guide.next} href={topicHref(next)} rel='next' aria={{ ariaKeyShortcuts: 'ArrowRight' }}>
                    Next: {next.title}
                  </a>
                ) : (
                  <a className={guide.next} href='/evolution'>
                    See it built step by step: reely evolution
                  </a>
                )}
              </footer>,
            ]
          )}
        </main>
      </div>
    </>
  );
};
