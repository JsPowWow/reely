import {
  defineRoutes,
  followLinks,
  href,
  memoryHistory,
  startRouter,
} from '@reely/router';

import { addressOf, frame } from './frame';
import { el } from './vanilla.dom';

import css from './router.module.css';

type Page = () => Node;

const paths = { album: '/', photo: '/photos/:id' } as const;

const photos = [
  {
    id: 'harbour',
    title: 'Harbour at dawn',
    light: '#f6b26b',
    dark: '#3d5a80',
  },
  { id: 'meadow', title: 'Meadow', light: '#b6d7a8', dark: '#38761d' },
  { id: 'old-town', title: 'Old town', light: '#ead1dc', dark: '#741b47' },
  { id: 'glacier', title: 'Glacier', light: '#cfe2f3', dark: '#0b5394' },
  { id: 'dunes', title: 'Dunes', light: '#ffe599', dark: '#b45f06' },
];

// the photo before the first is the last one, and the one after the last the first
const photoHref = (index: number): string =>
  href(paths.photo, { id: photos.at(index % photos.length)?.id ?? '' });

const tinted = <E extends HTMLElement>(
  element: E,
  { light, dark }: { light: string; dark: string }
): E => {
  element.style.setProperty('--light', light);
  element.style.setProperty('--dark', dark);
  return element;
};

export const PhotoGallery = (): Node => {
  const { app, address, page } = frame([
    el('a', { href: href(paths.album) }, 'Album'),
  ]);
  const history = memoryHistory(href(paths.album));
  followLinks(app, history.navigate);

  const routes = defineRoutes({
    [paths.album]: (): Page => () =>
      el(
        'div',
        {},
        el('h2', {}, 'Summer, 5 photos'),
        el(
          'ul',
          { className: css.tiles },
          ...photos.map((photo) =>
            el(
              'li',
              {},
              tinted(
                el(
                  'a',
                  { href: href(paths.photo, { id: photo.id }) },
                  photo.title
                ),
                photo
              )
            )
          )
        )
      ),
    // a photo that is not in the album answers nothing, so `fail` says so
    [paths.photo]: ({ id }) => {
      const index = photos.findIndex((photo) => photo.id === id);
      const photo = photos[index];
      if (!photo) {
        return undefined;
      }
      return (): Node =>
        el(
          'div',
          {},
          el('h2', {}, `${index + 1} of ${photos.length}: ${photo.title}`),
          tinted(el('div', { className: css.photo }, photo.title), photo),
          el(
            'p',
            { className: css.pager },
            el('a', { href: photoHref(index - 1) }, 'Previous'),
            el('a', { href: photoHref(index + 1) }, 'Next')
          )
        );
    },
  });

  const router = startRouter(routes, {
    history,
    show: (view) => {
      address.textContent = addressOf(history.url());
      page.replaceChildren(view());
      return page;
    },
    fail:
      (error): Page =>
      () =>
        el(
          'div',
          {},
          el('h2', {}, 'No such photo'),
          el('p', { className: css.failed }, error.message)
        ),
  });

  // on a photo, the arrow keys go to the next one and back, and Escape to the album: moves from code
  app.tabIndex = 0;
  app.addEventListener('keydown', (event) => {
    const index = photos.findIndex(
      ({ id }) => href(paths.photo, { id }) === router.path()
    );
    const moves: Partial<Record<string, string>> = {
      ArrowLeft: photoHref(index - 1),
      ArrowRight: photoHref(index + 1),
      Escape: href(paths.album),
    };
    const to = index === -1 ? undefined : moves[event.key];
    if (to !== undefined) {
      event.preventDefault();
      router.navigate(to);
    }
  });

  return app;
};
