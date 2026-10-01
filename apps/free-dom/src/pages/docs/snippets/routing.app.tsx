import { mount } from '@reely/dommy';
import { currentPath, defineRoutes, href, navigate, Router } from '@reely/dommy/router';
import type { Page } from '@reely/dommy/router';

const Inbox = (): Node => <h1>Inbox</h1>;

const MessagePage = ({ id }: { id: string }): Node => <h1>Message {id}</h1>;

const NotFound = ({ path }: { path: string }): Node => <h1>No page at {path}</h1>;

// a route answers with a page; one behind `import()` loads when it is first opened
const routes = defineRoutes({
  '/': () => Inbox,
  '/messages/:id':
    ({ id }) =>
    (): Node =>
      <MessagePage id={id} />,
  '/weather': () => import('./async.forecast').then(({ Weather }): Page => Weather),
  '/*rest':
    ({ rest }) =>
    (): Node =>
      <NotFound path={`/${rest}`} />,
});

// links of this site now open their page in place; back and forward work as before
mount(document.body, () => <Router routes={routes} catch={(error) => <p role='alert'>{error.message}</p>} />);

// a link is filled in from the pattern of its route, typed the same way
export const MessageLink = ({ id }: { id: string }): Node => (
  <a
    href={href('/messages/:id', { id })}
    aria={{ ariaCurrent: () => (currentPath() === href('/messages/:id', { id }) ? 'page' : null) }}
  >
    Message {id}
  </a>
);

// and code goes somewhere the same way
export const openDraft = (): void => navigate(href('/messages/:id', { id: 'draft' }));
