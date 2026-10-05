import type { Page } from '@reely/dommy/router';

// the home page comes with the site; every other page is its own chunk, loaded when first opened
const chunk =
  <M>(load: () => Promise<M>) =>
  (render: (module: M) => Node): Promise<Page> =>
    load().then((module) => (): Node => render(module));

export const dommyChunk = chunk(() => import('../pages/dommy/dommy.page'));
export const docsChunk = chunk(() => import('../pages/docs/docs.page'));
export const evolutionChunk = chunk(() => import('../pages/evolution/evolution.page'));
export const labsChunk = chunk(() => import('../pages/labs/labs.page'));
export const memoryChunk = chunk(() => import('../pages/games/memory.page'));
export const packageChunk = chunk(() => import('../pages/package/package.page'));
