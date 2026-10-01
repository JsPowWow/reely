import { effect } from '@reely/signals';
import { currentPath, defineRoutes, followLinks, href, memoryHistory, navigate, startRouter } from '@reely/router';

interface Page {
  title: string;
  view: () => Node;
}

const text = (content: string): Node => document.createTextNode(content);

const paths = { inbox: '/', message: '/messages/:id', search: '/search' } as const;

export const routes = defineRoutes({
  [paths.inbox]: (): Page => ({ title: 'Inbox', view: () => text('3 unread') }),
  [paths.message]: ({ id }): Promise<Page> => Promise.resolve({ title: `Message ${id}`, view: () => text(id) }),
  [paths.search]: (_params, query): Page | undefined => {
    const words = query.get('q');
    return words === null ? undefined : { title: `Search: ${words}`, view: () => text(words) };
  },
});

// what a consumer's function returns from the router must have a type its declarations can name
export const startMail = (main: HTMLElement, panel: HTMLElement) => {
  const show = ({ title, view }: Page): HTMLElement => {
    document.title = title;
    main.replaceChildren(view());
    return main;
  };
  const fail = (error: Error): Page => ({ title: 'Something went wrong', view: () => text(error.message) });
  const app = startRouter(routes, { show, fail });
  const inPanel = memoryHistory(href(paths.message, { id: '7' }));
  const unfollow = followLinks(panel, inPanel.navigate);
  const preview = startRouter(routes, { show, fail, history: inPanel });
  effect(() => {
    main.dataset['path'] = `${currentPath()} ${app.path()} ${inPanel.path()} ${preview.loading()}`;
  });
  navigate(`${href(paths.search)}?q=invoice`, { replace: true });
  return { app, preview, unfollow, history: memoryHistory() };
};
