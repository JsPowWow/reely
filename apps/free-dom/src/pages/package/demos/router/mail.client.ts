import {
  defineRoutes,
  followLinks,
  href,
  memoryHistory,
  startRouter,
} from '@reely/router';
import { effect } from '@reely/signals';

import { addressOf, frame, markCurrent } from './frame';
import { el } from './vanilla.dom';

import css from './router.module.css';

// whatever the app shows for an address; the router never looks inside
interface Page {
  title: string;
  view: () => Node;
}

const paths = {
  folder: '/:folder',
  message: '/:folder/:id',
  unknown: '/*rest',
} as const;

const mailbox = {
  inbox: [
    {
      id: '41',
      from: 'Courier',
      subject: 'Your parcel is on its way',
      body: 'Delivery between 10:00 and 12:00.',
    },
    {
      id: '42',
      from: 'Ana',
      subject: 'Lunch on Friday?',
      body: 'The new ramen place, 13:00?',
    },
  ],
  sent: [
    {
      id: '7',
      from: 'You',
      subject: 'Re: Lunch on Friday?',
      body: 'Yes! See you there.',
    },
  ],
  spam: [
    {
      id: '9',
      from: 'Prince',
      subject: 'You have won',
      body: 'Send your bank details.',
    },
  ],
};

type Folder = keyof typeof mailbox;

const isFolder = (name: string): name is Folder => Object.hasOwn(mailbox, name);

const folderPage = (folder: Folder): Page => ({
  title: folder,
  view: () =>
    el(
      'ul',
      { className: css.rows },
      ...mailbox[folder].map(({ id, from, subject }) =>
        el(
          'li',
          {},
          el(
            'a',
            { href: href(paths.message, { folder, id }) },
            subject,
            el('small', {}, from)
          )
        )
      )
    ),
});

export const MailClient = (): Node => {
  // archive is no folder of the mailbox: its link shows the page for unknown paths
  const menu = [...Object.keys(mailbox), 'archive'].map((folder) =>
    el('a', { href: href(paths.folder, { folder }) }, folder)
  );
  const { app, address, page } = frame(menu);
  const history = memoryHistory(href(paths.folder, { folder: 'inbox' }));
  // the links of the frame go to this history, not to the site's
  followLinks(app, history.navigate);

  const routes = defineRoutes({
    // a folder that is not in the mailbox passes on to the page for unknown paths
    [paths.folder]: ({ folder }) =>
      isFolder(folder) ? folderPage(folder) : undefined,
    [paths.message]: ({ folder, id }) => {
      const message = isFolder(folder)
        ? mailbox[folder].find((each) => each.id === id)
        : undefined;
      return (
        message && {
          title: message.subject,
          view: (): Node =>
            el(
              'div',
              {},
              el('p', {}, `From ${message.from}: ${message.body}`),
              el(
                'a',
                { href: href(paths.folder, { folder }) },
                `Back to ${folder}`
              )
            ),
        }
      );
    },
    [paths.unknown]: ({ rest }) => ({
      title: 'Not found',
      view: (): Node => el('p', {}, `There is no /${rest}.`),
    }),
  });

  const router = startRouter(routes, {
    history,
    show: ({ title, view }) => {
      address.textContent = addressOf(history.url());
      page.replaceChildren(el('h2', {}, title), view());
      return page;
    },
    fail: (error) => ({
      title: 'Something went wrong',
      view: (): Node => el('p', {}, error.message),
    }),
  });

  // the menu marks the folder of the page shown: a message is in its folder too
  effect(() => {
    const [, folder = ''] = router.path().split('/');
    markCurrent(menu, href(paths.folder, { folder }));
  });

  return app;
};
