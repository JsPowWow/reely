import { computed, For, signal } from '@reely/dommy';
import { defineRoutes, followLinks, href, memoryHistory, Router } from '@reely/dommy/router';

import css from './router.module.css';

interface Issue {
  id: string;
  title: string;
  label: 'bug' | 'feature' | 'docs';
  open: boolean;
}

const paths = { issues: '/issues', issue: '/issues/:id' } as const;

const states = ['open', 'closed'] as const;
const labels = ['all', 'bug', 'feature', 'docs'] as const;

// the filters live in the address, so each one is a plain link
const issuesHref = (state: string, label: string): string =>
  `${href(paths.issues)}?${new URLSearchParams({ state, label })}`;

// "2 open bug issues", "1 closed issue"
const countOf = (count: number, state: string, label: string): string =>
  [String(count), state, label === 'all' ? '' : label, count === 1 ? 'issue' : 'issues']
    .filter((word) => word !== '')
    .join(' ');

export const IssuesBoard = (): Node => {
  const issues = signal<Issue[]>([
    { id: '12', title: 'Checkout button hides behind the keyboard', label: 'bug', open: true },
    { id: '15', title: 'Dark mode for the invoices', label: 'feature', open: true },
    { id: '17', title: 'Explain refunds in the FAQ', label: 'docs', open: true },
    { id: '19', title: 'Totals round the wrong way', label: 'bug', open: true },
    { id: '8', title: 'Search ignores accents', label: 'bug', open: false },
  ]);
  const close = (id: string): void => {
    issues.value = issues.value.map((issue) => (issue.id === id ? { ...issue, open: false } : issue));
  };

  // the list follows the issues: closing one takes it off an open list while the page is shown
  const IssueList = ({ state, label }: { state: string; label: string }): Node => {
    const shown = computed(() =>
      issues.value.filter((issue) => issue.open === (state === 'open') && (label === 'all' || issue.label === label))
    );
    return (
      <div>
        <h2>{() => countOf(shown.value.length, state, label)}</h2>
        <p className={`${css.sorts} ${css.filters}`}>
          {states.map((each) => (
            <a href={issuesHref(each, label)} aria={{ ariaCurrent: each === state ? 'page' : undefined }}>
              {each}
            </a>
          ))}
        </p>
        <p className={`${css.sorts} ${css.filters}`}>
          {labels.map((each) => (
            <a href={issuesHref(state, each)} aria={{ ariaCurrent: each === label ? 'page' : undefined }}>
              {each}
            </a>
          ))}
        </p>
        <ul className={css.rows}>
          <For each={shown} by={(issue) => issue.id}>
            {(issue) => (
              <li>
                <a href={href(paths.issue, { id: issue().id })}>
                  {() => issue().title}
                  <small>{() => `#${issue().id} ${issue().label}`}</small>
                </a>
              </li>
            )}
          </For>
        </ul>
      </div>
    );
  };

  const IssueView = ({ id }: { id: string }): Node => {
    const issue = computed(() => issues.value.find((each) => each.id === id));
    return (
      <div>
        <h2>{() => `#${id} ${issue.value?.title ?? ''}`}</h2>
        <p>{() => (issue.value?.open ? 'Open' : 'Closed')}</p>
        <p className={css.sorts}>
          <button type='button' disabled={() => !issue.value?.open} onClick={() => close(id)}>
            Close the issue
          </button>
          <a href={issuesHref('open', issue.value?.label ?? 'all')}>Back to the open ones</a>
        </p>
      </div>
    );
  };

  const board = memoryHistory(issuesHref('open', 'all'));
  const routes = defineRoutes({
    [paths.issues]: (_params, query) => (): Node =>
      <IssueList state={query.get('state') ?? 'open'} label={query.get('label') ?? 'all'} />,
    // an id no issue has passes on, and the router's catch says so
    [paths.issue]: ({ id }) =>
      issues.value.some((each) => each.id === id) ? (): Node => <IssueView id={id} /> : undefined,
  });

  const app = (
    <div className={css.app}>
      <section className={css.page}>
        <Router routes={routes} history={board} catch={(error) => <p className={css.failed}>{error.message}</p>} />
      </section>
    </div>
  );
  followLinks(app, board.navigate);
  return app;
};
