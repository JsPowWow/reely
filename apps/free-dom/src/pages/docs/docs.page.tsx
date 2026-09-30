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
import guide from '../../site/guide.module.css';
import css from './docs.module.css';
import { docsText } from './docs.text';
import { docGroups, docTopics } from './docs.topics';

import type { PagerLink } from '../../site/pager';
import type { DocTopic } from './docs.topics';

const topicHref = (topic: DocTopic): string => `/docs/${topic.slug}`;

const titleOf = (topic: DocTopic): string => docsText().topics[topic.slug].title;

const toPagerLink = (topic: DocTopic | undefined): Nullable<PagerLink> =>
  hasSome(topic) ? { href: topicHref(topic), title: () => titleOf(topic) } : null;

export const DocsPage = ({ slug }: { slug?: string }): Node => {
  const index = isNil(slug) ? 0 : docTopics.findIndex((item) => item.slug === slug);
  const topic = docTopics[index];
  const previous = docTopics[index - 1];
  const next = docTopics[index + 1];
  const first = docTopics[0];

  effect(() => {
    document.title = isNil(topic)
      ? siteText().notFound.documentTitle
      : `${titleOf(topic)} | ${docsText().documentTitle}`;
  });

  return (
    <>
      <SiteHeader current='docs' />
      <div className={guide.guide}>
        <nav className={guide.rail} aria={{ ariaLabel: () => docsText().railLabel }}>
          <a className={guide.home} href='/docs'>
            {() => docsText().home}
          </a>
          {docGroups.map((group) => (
            <section className={css.group} aria={{ ariaLabel: () => docsText().groups[group] }}>
              <h2 className={css.groupName}>{() => docsText().groups[group]}</h2>
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
                        {() => titleOf(item)}
                      </a>
                    </li>
                  ))}
              </ul>
            </section>
          ))}
          <p className={guide.keys}>
            <Localized view={() => docsText().Keys} />
          </p>
        </nav>
        <main className={guide.main}>
          {isNil(topic) ? (
            <header className={guide.missing}>
              <h1 className={guide.title}>{() => docsText().missing.title(String(slug))}</h1>
              <p className={guide.lead}>{() => docsText().missing.lead}</p>
              {hasSome(first) && (
                <a className={guide.start} href={topicHref(first)}>
                  {() => docsText().missing.start}
                </a>
              )}
            </header>
          ) : (
            [
              <header className={css.heading}>
                <h1 className={guide.title}>{() => titleOf(topic)}</h1>
                <p className={guide.lead}>{() => docsText().topics[topic.slug].lead}</p>
              </header>,
              <section className={guide.panels} aria={{ ariaLabel: () => demoText().panelsLabel }}>
                <MutationMeter>
                  <topic.Demo />
                </MutationMeter>
                <SourceView source={topic.source} caption={() => docsText().sourceCaption} />
              </section>,
              <article className={css.details}>
                <Localized view={() => docsText().topics[topic.slug].Details} />
              </article>,
              <Pager previous={toPagerLink(previous)} next={toPagerLink(next)}>
                <a className={guide.next} href='/evolution'>
                  {() => docsText().onward}
                </a>
              </Pager>,
            ]
          )}
        </main>
      </div>
    </>
  );
};
