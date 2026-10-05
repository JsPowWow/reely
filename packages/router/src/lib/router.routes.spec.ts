import { navigate } from './router.navigate';
import { defineRoutes } from './router.routes';

import type { Routes } from './router.types';

/** A page that names itself, so a test reads which route answered. */
const named =
  (name: string): (() => string) =>
  () =>
    name;

const answerAt = async (routes: Routes<() => string>, address: string): Promise<unknown> => (await routes(address))?.();

describe('defineRoutes', () => {
  it('answers a pathname with the page of the route that matches it', async () => {
    const routes = defineRoutes({
      '/': () => named('home'),
      '/labs': () => named('labs'),
    });

    expect(await answerAt(routes, '/')).toBe('home');
    expect(await answerAt(routes, '/labs')).toBe('labs');
    expect(await routes('/nope')).toBeUndefined();
  });

  it('hands a route the params its pattern names, decoded', async () => {
    const routes = defineRoutes({
      '/docs/:topic': ({ topic }) => named(`docs: ${topic}`),
      '/orders/:id/items/:item': ({ id, item }) => named(`order ${id}, item ${item}`),
    });

    expect(await answerAt(routes, '/docs/batch')).toBe('docs: batch');
    expect(await answerAt(routes, '/orders/7/items/caf%C3%A9')).toBe('order 7, item café');
    expect(await routes('/docs')).toBeUndefined();
    expect(await routes('/docs/batch/more')).toBeUndefined();
  });

  it('keeps a param that is not valid percent-encoding as it came', async () => {
    const routes = defineRoutes({ '/search/:query': ({ query }) => named(query) });

    expect(await answerAt(routes, '/search/100%')).toBe('100%');
  });

  it('matches the rest of a pathname with a named wildcard, nothing included', async () => {
    const routes = defineRoutes({
      '/files/*path': ({ path }) => named(`file ${path}`),
      '/*rest': ({ rest }) => named(`missing /${rest}`),
    });

    expect(await answerAt(routes, '/files/docs/read%20me.md')).toBe('file docs/read me.md');
    expect(await answerAt(routes, '/nope/deeper')).toBe('missing /nope/deeper');
    expect(await answerAt(routes, '/')).toBe('missing /');
  });

  it('matches a pattern written in any script, as the address arrives encoded', async () => {
    const routes = defineRoutes({
      '/café': () => named('café'),
      '/о-нас/:part': ({ part }) => named(`о нас: ${part}`),
    });

    expect(await answerAt(routes, '/café')).toBe('café');
    expect(await answerAt(routes, '/caf%C3%A9')).toBe('café');
    expect(await answerAt(routes, '/о-нас/команда')).toBe('о нас: команда');
  });

  it('takes a pathname with or without its trailing slash', async () => {
    const routes = defineRoutes({ '/labs': () => named('labs'), '/docs/:topic': ({ topic }) => named(topic) });

    expect(await answerAt(routes, '/labs/')).toBe('labs');
    expect(await answerAt(routes, '/docs/lists/')).toBe('lists');
  });

  it('tries the routes in order, and passes to the next one when a route answers nothing', async () => {
    const packages = new Set(['queue', 'emitter']);
    const routes = defineRoutes({
      '/labs': () => named('labs'),
      '/:name': ({ name }) => (packages.has(name) ? named(`package ${name}`) : undefined),
      '/*rest': ({ rest }) => named(`missing /${rest}`),
    });

    expect(await answerAt(routes, '/labs')).toBe('labs');
    expect(await answerAt(routes, '/queue')).toBe('package queue');
    expect(await answerAt(routes, '/nope')).toBe('missing /nope');
  });

  it('waits for a route that loads its page, and passes on when the load answers nothing', async () => {
    const routes = defineRoutes({
      '/docs/:topic': ({ topic }) => Promise.resolve(topic === 'old' ? null : named(`docs: ${topic}`)),
      '/*rest': () => named('missing'),
    });

    expect(await answerAt(routes, '/docs/signals')).toBe('docs: signals');
    expect(await answerAt(routes, '/docs/old')).toBe('missing');
  });

  it('matches the path of an address, and hands a route its query', async () => {
    const routes = defineRoutes({
      '/search': (_params, query) => named(`search: ${query.get('q') ?? ''}, page ${query.get('page') ?? '1'}`),
    });

    expect(await answerAt(routes, '/search?q=winter%20tyres&page=2')).toBe('search: winter tyres, page 2');
    expect(await answerAt(routes, '/search')).toBe('search: , page 1');
  });

  it('rejects with the error of a route that fails', async () => {
    const routes = defineRoutes({ '/broken': () => Promise.reject(new Error('The chunk did not load')) });

    await expect(routes('/broken')).rejects.toThrow('The chunk did not load');
  });

  it('types the params from the pattern', () => {
    defineRoutes({
      '/orders/:id/*rest': (params) => {
        expectTypeOf(params).toEqualTypeOf<{ id: string; rest: string }>();
        return undefined;
      },
      // @ts-expect-error the pattern names no `topic`
      '/docs/:slug': ({ topic }) => named(String(topic)),
    });
  });

  it('types the page from what the routes answer, loaded', () => {
    const routes = defineRoutes({
      '/': () => ({ title: 'Inbox', unread: 3 }),
      '/settings': () => Promise.resolve({ title: 'Settings', unread: 0 }),
      '/:folder': ({ folder }) => (folder === 'spam' ? undefined : { title: folder, unread: 0 }),
    });

    expectTypeOf(routes).returns.resolves.toEqualTypeOf<{ title: string; unread: number } | undefined>();
  });

  it('types the page apart from a guard that sends the reader elsewhere and answers nothing', () => {
    const routes = defineRoutes({
      '/': () => ({ title: 'Inbox' }),
      '/account': () => {
        navigate('/login', { replace: true });
      },
      '/old': () => Promise.resolve(),
    });

    expectTypeOf(routes).returns.resolves.toEqualTypeOf<{ title: string } | undefined>();
  });
});
