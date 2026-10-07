import { Show, signal } from '@reely/dommy';
import {
  defineRoutes,
  followLinks,
  href,
  memoryHistory,
  Router,
} from '@reely/dommy/router';
import type { RouterHistory } from '@reely/dommy/router';

import css from './router.module.css';

const paths = { topics: '/help', topic: '/help/:slug' } as const;

const topics = [
  {
    slug: 'returns',
    title: 'Returns',
    answer: 'Send it back within 30 days; the label is in your order.',
  },
  {
    slug: 'delivery',
    title: 'Delivery',
    answer: 'Two working days, or the next day before 14:00.',
  },
  {
    slug: 'payment',
    title: 'Payment',
    answer: 'Cards, bank transfer, or pay in 30 days.',
  },
];

type Topic = (typeof topics)[number];

// stands in for `fetch('/api/help/' + slug)`: the help desk answers after 400 ms
const askHelpDesk = (slug: string): Promise<Topic | undefined> => {
  const topic = topics.find((each) => each.slug === slug);
  return new Promise((answered) => setTimeout(answered, 400, topic));
};

const NavLink = ({
  to,
  label,
  help,
}: {
  to: string;
  label: string;
  help: RouterHistory;
}): Node => (
  <a
    href={to}
    aria={{ ariaCurrent: () => (help.path() === to ? 'page' : null) }}
  >
    {label}
  </a>
);

// a page is a component; its state lives as long as it is shown, so the vote resets on leaving
const TopicPage = ({ title, answer }: Topic): Node => {
  const voted = signal(false);
  return (
    <div>
      <h2>{title}</h2>
      <p>{answer}</p>
      <Show
        when={voted}
        fallback={() => (
          <button type='button' onClick={() => (voted.value = true)}>
            This helped
          </button>
        )}
      >
        {() => <p>Thanks for telling us.</p>}
      </Show>
    </div>
  );
};

const helpRoutes = defineRoutes({
  [paths.topics]: () => (): Node =>
    (
      <div>
        <h2>How can we help?</h2>
        <p>
          Pick a topic. Not there? Ask about{' '}
          <a href={href(paths.topic, { slug: 'gift-cards' })}>gift cards</a>.
        </p>
      </div>
    ),
  [paths.topic]: ({ slug }) =>
    askHelpDesk(slug).then(
      (topic) => topic && ((): Node => <TopicPage {...topic} />)
    ),
});

export const HelpWidget = (): Node => {
  const help = memoryHistory(paths.topics);
  const widget = (
    // the topic shown stays while the next answer is on its way: the bar under the address says one is coming
    <aside className={css.app} aria={{ ariaBusy: help.loading }}>
      <p className={css.address}>{() => help.path()}</p>
      <div className={css.body}>
        <nav className={css.menu}>
          <NavLink to={paths.topics} label='All topics' help={help} />
          {topics.map(({ slug, title }) => (
            <NavLink
              to={href(paths.topic, { slug })}
              label={title}
              help={help}
            />
          ))}
        </nav>
        <section className={css.page}>
          <Router
            routes={helpRoutes}
            history={help}
            catch={(error) => (
              <div>
                <h2>No answer yet</h2>
                <p className={css.failed}>{error.message}</p>
              </div>
            )}
          />
        </section>
      </div>
    </aside>
  );
  followLinks(widget, help.navigate);
  return widget;
};
