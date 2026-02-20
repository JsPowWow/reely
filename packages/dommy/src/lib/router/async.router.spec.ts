// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck

import { describe, expect, type Mock, test, vi } from 'vitest';

import { createAsyncRouter } from './async.router';

import type { RouteNotFoundError } from './utils/match-path';

describe('UniversalRouterSync', () => {
  test('requires routes', () => {
    // @ts-expect-error missing argument
    expect(() => createAsyncRouter()).toThrow(/Invalid routes/);
    // @ts-expect-error wrong argument
    expect(() => createAsyncRouter(12)).toThrow(/Invalid routes/);
    // @ts-expect-error wrong argument
    expect(() => createAsyncRouter(null)).toThrow(/Invalid routes/);
  });

  test('supports custom route resolver', async () => {
    const resolveRoute: Mock = vi.fn((context) => {
      return context.route.component;
    });
    const action: Mock = vi.fn();
    const router = createAsyncRouter(
      {
        path: '/a',
        action,
        children: [
          { path: '/:b', component: null, action } as Route,
          { path: '/c', component: 'c', action } as Route,
          { path: '/d', component: 'd', action } as Route,
        ],
      },
      { resolveRoute }
    );
    const result = await router.resolve('/a/c');
    expect(result).toBe('c');
    expect(resolveRoute.mock.calls.length).toBe(3);
    expect(action).not.toHaveBeenCalled();
  });

  test.skip('supports custom error handler', async () => {
    const errorHandler: Mock = vi.fn(() => 'result');
    const router = createAsyncRouter([], { errorHandler });
    await expect(router.resolve('/')).resolves.toBe('result');
    expect(errorHandler.mock.calls.length).toBe(1);
    const error = errorHandler.mock.calls[0]?.[0];
    const context = errorHandler.mock.calls[0]?.[1];
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('Route not found');
    expect(error.status).toBe(404);
    expect(context.pathname).toBe('/');
    expect(context.router).toBe(router);
  });

  test.skip('handles route errors', async () => {
    const errorHandler: Mock = vi.fn(() => 'result');
    const route = {
      path: '/',
      action: (): never => {
        throw new Error('custom');
      },
    };
    const router = createAsyncRouter(route, { errorHandler });
    await expect(router.resolve('/')).resolves.toBe('result');
    expect(errorHandler.mock.calls.length).toBe(1);
    const error = errorHandler.mock.calls[0]?.[0];
    const context = errorHandler.mock.calls[0]?.[1];
    expect(error).toBeInstanceOf(Error);
    expect(error.message).toBe('custom');
    expect(context.pathname).toBe('/');
    expect(context.path).toBe('/');
    expect(context.router).toBe(router);
    expect(context.route).toBe(route);
  });

  test('throws when route not found', async () => {
    const router = createAsyncRouter([]);
    let err;
    try {
      await router.resolve('/');
    } catch (e) {
      err = e as RouteNotFoundError;
    }
    expect(err).toBeInstanceOf(Error);
    expect(err?.['message']).toBe('Route not found');
    expect(err?.['status']).toBe(404);
  });

  test("executes the matching route's action method and return its result", async () => {
    const action: Mock = vi.fn(() => 'b');
    const router = createAsyncRouter({ path: '/a', action });
    const result = await router.resolve('/a');
    expect(result).toBe('b');
    expect(action).toHaveBeenCalledOnce();
    expect(action).toHaveBeenCalledWith(
      {
        pathname: '/a',
        baseUrl: '',
        path: '/a',
        params: {},
        next: expect.any(Function),
        route: { path: '/a', action: expect.any(Function) },
      },
      {}
    );
  });

  // test.skip('finds the first route whose action method !== undefined or null', async () => {
  //   const action1: Mock = vi.fn(() => undefined);
  //   const action2: Mock = vi.fn(() => null);
  //   const action3: Mock = vi.fn(() => 'c');
  //   const action4: Mock = vi.fn(() => 'd');
  //   const router = createAsyncRouter([
  //     { path: '/a', action: action1 },
  //     { path: '/a', action: action2 },
  //     { path: '/a', action: action3 },
  //     { path: '/a', action: action4 },
  //   ]);
  //   await expect(router.resolve('/a')).resolves.toBe('c');
  //   expect(action1.mock.calls.length).toBe(1);
  //   expect(action2.mock.calls.length).toBe(1);
  //   expect(action3.mock.calls.length).toBe(1);
  //   expect(action4.mock.calls.length).toBe(0);
  // });

  test('allows to pass context variables to action methods', async () => {
    const action: Mock = vi.fn(() => true);
    const router = createAsyncRouter([{ path: '/a', action }]);
    const result = await router.resolve({ pathname: '/a', test: 'b' });
    expect(result).toBe(true);
    expect(action).toHaveBeenCalledOnce();
    expect(action.mock.calls[0]?.[0]).toHaveProperty('pathname', '/a');
    expect(action.mock.calls[0]?.[0]).toHaveProperty('test', 'b');
  });

  test('skips action methods of routes that do not match the URL path', async () => {
    const action: Mock = vi.fn();
    const router = createAsyncRouter([{ path: '/a', action }]);
    let err;
    try {
      await router.resolve('/b');
    } catch (e) {
      err = e as RouteNotFoundError;
    }
    expect(err).toBeInstanceOf(Error);
    expect(err?.message).toBe('Route not found');
    expect(err?.status).toBe(404);
    expect(action.mock.calls.length).toBe(0);
  });

  test('supports asynchronous route actions', async () => {
    const router = createAsyncRouter([{ path: '/a', action: () => 'b' }]);
    const result = await router.resolve('/a');
    expect(result).toBe('b');
  });

  test('captures URL parameters to context.params', async () => {
    const action: Mock = vi.fn(() => true);
    const router = createAsyncRouter([{ path: '/:one/:two', action }]);
    const result = await router.resolve({ pathname: '/a/b' });
    expect(result).toBe(true);
    expect(action).toHaveBeenCalledOnce();
    expect(action.mock.calls[0]?.[0]).toHaveProperty('params', {
      one: 'a',
      two: 'b',
    });
    expect(action).toHaveBeenCalledWith(
      {
        pathname: '/a/b',
        baseUrl: '',
        path: '/:one/:two',
        next: expect.any(Function),
        route: { path: '/:one/:two', action: expect.any(Function) },
        params: {
          one: 'a',
          two: 'b',
        },
      },
      { one: 'a', two: 'b' }
    );
  });

  test('provides all URL parameters to each route', async () => {
    const action1: Mock = vi.fn();
    const action2: Mock = vi.fn(() => true);
    const router = createAsyncRouter([
      {
        path: '/:one',
        action: action1,
        children: [
          {
            path: '/:two',
            action: action2,
          },
        ],
      },
    ]);
    const result = await router.resolve({ pathname: '/a/b' });
    expect(result).toBe(true);
    expect(action1.mock.calls.length).toBe(1);
    expect(action1.mock.calls[0]?.[0]).toHaveProperty('params', { one: 'a', two: 'b' });
    expect(action2.mock.calls.length).toBe(1);
    expect(action2.mock.calls[0]?.[0]).toHaveProperty('params', {
      one: 'a',
      two: 'b',
    });
  });

  test.skip('overrides URL parameters with same name in child routes', async () => {
    const action1: Mock = vi.fn();
    const action2: Mock = vi.fn(() => true);
    const router = createAsyncRouter([
      {
        path: '/:one',
        action: action1,
        children: [
          {
            path: '/:one',
            action: action1,
          },
          {
            path: '/:two',
            action: action2,
          },
        ],
      },
    ]);
    const result = await router.resolve({ pathname: '/a/b' });
    expect(result).toBe(true);
    expect(action1).toHaveBeenCalledTimes(2);
    expect(action1.mock.calls[0]?.[0]).toHaveProperty('params', { one: 'a' });
    expect(action1.mock.calls[1]?.[0]).toHaveProperty('params', { one: 'b' });
    expect(action2.mock.calls.length).toBe(1);
    expect(action2.mock.calls[0]?.[0]).toHaveProperty('params', { one: 'a', two: 'b' });
  });

  test('does not collect parameters from previous routes', async () => {
    const action1: Mock = vi.fn(() => undefined);
    const action2: Mock = vi.fn(() => undefined);
    const action3: Mock = vi.fn(() => true);
    const router = createAsyncRouter([
      {
        path: '/:one',
        action: action1,
        children: [
          {
            path: '/:two',
            action: action1,
          },
        ],
      },
      {
        path: '/:three',
        action: action2,
        children: [
          {
            path: '/:four',
            action: action2,
          },
          {
            path: '/:five',
            action: action3,
          },
        ],
      },
    ]);
    const result = await router.resolve({ pathname: '/a/b' });
    expect(result).toBe(true);
    expect(action1).toHaveBeenCalledTimes(2);
    expect(action1.mock.calls[0]?.[0]).toHaveProperty('params', { one: 'a', two: 'b' });
    expect(action1.mock.calls[1]?.[0]).toHaveProperty('params', { one: 'a', two: 'b' });
    expect(action2).toHaveBeenCalledTimes(2);
    expect(action2.mock.calls[0]?.[0]).toHaveProperty('params', { three: 'a', four: 'b' });
    expect(action2.mock.calls[1]?.[0]).toHaveProperty('params', { three: 'a', four: 'b' });
    expect(action3.mock.calls[0]?.[0]).toHaveProperty('params', { three: 'a', five: 'b' });
  });

  test.skip('supports next() across multiple routes', async () => {
    const log: number[] = [];
    const router = createAsyncRouter([
      {
        path: '/test',
        children: [
          {
            path: '',
            action(): void {
              log.push(2);
            },
            children: [
              {
                path: '',
                action({ next }): Promise<void> {
                  log.push(3);
                  return next().then(() => {
                    log.push(6);
                  });
                },
                children: [
                  {
                    path: '',
                    action({ next }): Promise<void> {
                      log.push(4);
                      return next().then(() => {
                        log.push(5);
                      });
                    },
                  },
                ],
              },
            ],
          },
          {
            path: '',
            action(): void {
              log.push(7);
            },
            children: [
              {
                path: '',
                action(): void {
                  log.push(8);
                },
              },
              {
                path: '',
                action(): void {
                  log.push(9);
                },
              },
            ],
          },
        ],
        async action({ next }) {
          log.push(1);
          const result = await next();
          log.push(10);
          return result;
        },
      },
      {
        path: '/:id',
        action(): void {
          log.push(11);
        },
      },
      {
        path: '/test',
        action(): string {
          log.push(12);
          return 'done';
        },
      },
      {
        path: '/*all',
        action(): void {
          log.push(13);
        },
      },
    ]);

    await expect(router.resolve('/test')).resolves.toBe('done');
    expect(log).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12]);
  });

  test.skip('supports next(true) across multiple routes', async () => {
    const log: number[] = [];
    const router = createAsyncRouter({
      path: '',
      action({ next }): Promise<unknown> {
        log.push(1);
        return next().then((result) => {
          log.push(9);
          return result;
        });
      },
      children: [
        {
          path: '/a/b/c',
          action({ next }): Promise<unknown> {
            log.push(2);
            return next(true).then((result) => {
              log.push(8);
              return result;
            });
          },
        },
        {
          path: '/a',
          action(): void {
            log.push(3);
          },
          children: [
            {
              path: '/b',
              action({ next }): Promise<unknown> {
                log.push(4);
                return next().then((result) => {
                  log.push(6);
                  return result;
                });
              },
              children: [
                {
                  path: '/c',
                  action(): void {
                    log.push(5);
                  },
                },
              ],
            },
            {
              path: '/b/c',
              action(): string {
                log.push(7);
                return 'done';
              },
            },
          ],
        },
      ],
    });

    await expect(router.resolve('/a/b/c')).resolves.toBe('done');
    expect(log).toEqual([1, 2, 3, 4, 5, 6, 7, 8, 9]);
  });

  test('supports parametrized routes', async () => {
    const action: Mock = vi.fn(() => true);
    const router = createAsyncRouter([{ path: '/path/:a/other/:b', action }]);
    await expect(router.resolve('/path/1/other/2')).resolves.toBe(true);
    expect(action.mock.calls.length).toBe(1);
    expect(action.mock.calls[0]?.[0]).toHaveProperty('params.a', '1');
    expect(action.mock.calls[0]?.[0]).toHaveProperty('params.b', '2');
    expect(action.mock.calls[0]?.[1]).toHaveProperty('a', '1');
    expect(action.mock.calls[0]?.[1]).toHaveProperty('b', '2');
  });

  test('supports nested routes (1)', async () => {
    const action1: Mock = vi.fn();
    const action2: Mock = vi.fn(() => true);
    const router = createAsyncRouter([
      {
        path: '',
        action: action1,
        children: [
          {
            path: '/a',
            action: action2,
          },
        ],
      },
    ]);

    const result = await router.resolve('/a');
    expect(result).toBe(true);
    expect(action1).toHaveBeenCalledOnce();
    expect(action1.mock.calls[0]?.[0]).toHaveProperty('path', '');
    expect(action2.mock.calls.length).toBe(1);
    expect(action2.mock.calls[0]?.[0]).toHaveProperty('path', '/a');
  });

  test('supports nested routes (2)', async () => {
    const action1: Mock = vi.fn();
    const action2: Mock = vi.fn(() => true);
    const router = createAsyncRouter([
      {
        path: '/a',
        action: action1,
        children: [
          {
            path: '/b',
            action: action2,
          },
        ],
      },
    ]);
    const result = await router.resolve('/a/b');
    expect(result).toBe(true);
    expect(action1.mock.calls.length).toBe(1);
    expect(action1.mock.calls[0]?.[0]).toHaveProperty('path', '/a');
    expect(action2.mock.calls.length).toBe(1);
    expect(action2.mock.calls[0]?.[0]).toHaveProperty('path', '/b');
  });

  test.skip('supports nested routes (3)', async () => {
    const action1: Mock = vi.fn(() => undefined);
    const action2: Mock = vi.fn(() => null);
    const action3: Mock = vi.fn(() => true);
    const router = createAsyncRouter([
      {
        path: '/a',
        action: action1,
        children: [
          {
            path: '/b',
            action: action2,
          },
        ],
      },
      {
        path: '/a/b',
        action: action3,
      },
    ]);

    const result = await router.resolve('/a/b');
    expect(result).toBe(true);
    expect(action1.mock.calls.length).toBe(1);
    expect(action1.mock.calls[0]?.[0]).toHaveProperty('baseUrl', '');
    expect(action1.mock.calls[0]?.[0]).toHaveProperty('path', '/a');
    expect(action2.mock.calls.length).toBe(1);
    expect(action2.mock.calls[0]?.[0]).toHaveProperty('baseUrl', '/a');
    expect(action2.mock.calls[0]?.[0]).toHaveProperty('path', '/b');
    expect(action3.mock.calls.length).toBe(1);
    expect(action3.mock.calls[0]?.[0]).toHaveProperty('baseUrl', '');
    expect(action3.mock.calls[0]?.[0]).toHaveProperty('path', '/a/b');
  });

  test('re-throws an error', async () => {
    const error = new Error('test error');
    const router = createAsyncRouter([
      {
        path: '/a',
        action(): never {
          throw error;
        },
      },
    ]);
    let err;
    try {
      await router.resolve('/a');
    } catch (e) {
      err = e;
    }
    expect(err).toBe(error);
  });

  test('respects baseUrl', async () => {
    const action: Mock = vi.fn(() => 17);
    const routes = {
      path: '/a',
      children: [
        {
          path: '/b',
          children: [
            {
              path: '/c',
              action,
            },
          ],
        },
      ],
    };
    const router = createAsyncRouter(routes, { baseUrl: '/base' });
    const res = await router.resolve('/base/a/b/c');
    expect(res).toBe(17);
    expect(action.mock.calls.length).toBe(1);
    expect(action.mock.calls[0]?.[0]).toHaveProperty('pathname', '/base/a/b/c');
    expect(action.mock.calls[0]?.[0]).toHaveProperty('path', '/c');
    expect(action.mock.calls[0]?.[0]).toHaveProperty('baseUrl', '/base/a/b');
    expect(action.mock.calls[0]?.[0]).toHaveProperty('route', routes.children[0]?.children[0]);
    // expect(action.mock.calls[0]?.[0]).toHaveProperty('router', router);

    let err;
    try {
      await router.resolve('/a/b/c');
    } catch (e) {
      err = e as RouteNotFoundError;
    }
    expect(action.mock.calls.length).toBe(1);
    expect(err).toBeInstanceOf(Error);
    expect(err?.message).toBe('Route not found');
    expect(err?.status).toBe(404);
  });

  test('matches routes with trailing slashes', async () => {
    const router = createAsyncRouter([
      { path: '/', action: (): string => 'a' },
      { path: '/page/', action: (): string => 'b' },
      {
        path: '/child',
        children: [
          { path: '/', action: (): string => 'c' },
          { path: '/page/', action: (): string => 'd' },
        ],
      },
    ]);
    await expect(router.resolve('/')).resolves.toBe('a');
    await expect(router.resolve('/page/')).resolves.toBe('b');
    await expect(router.resolve('/child/')).resolves.toBe('c');
    await expect(router.resolve('/child/page/')).resolves.toBe('d');
  });

  test.skip('skips nested routes when middleware route returns null', async () => {
    const middleware: Mock = vi.fn(() => null);
    const action: Mock = vi.fn(() => 'skipped');
    const router = createAsyncRouter([
      {
        path: '/match',
        action: middleware,
        children: [{ action }],
      },
      {
        path: '/match',
        action: (): number => 404,
      },
    ]);

    await expect(router.resolve('/match')).resolves.toBe(404);
    expect(action.mock.calls.length).toBe(0);
    expect(middleware.mock.calls.length).toBe(1);
  });

  test.skip('matches nested routes when middleware route returns undefined', async () => {
    const middleware: Mock = vi.fn(() => undefined);
    const action: Mock = vi.fn(() => null);
    const router = createAsyncRouter([
      {
        path: '/match',
        action: middleware,
        children: [{ action }],
      },
      {
        path: '/match',
        action: (): number => 404,
      },
    ]);

    await expect(router.resolve('/match')).resolves.toBe(404);
    expect(action.mock.calls.length).toBe(1);
    expect(middleware.mock.calls.length).toBe(1);
  });

  test('handles route not found error correctly', async () => {
    const router = createAsyncRouter({
      path: '/',
      action({ next }): unknown {
        return next();
      },
      children: [{ path: '/child' }],
    });

    let err;
    try {
      await router.resolve('/404');
    } catch (e) {
      err = e as RouteError;
    }
    expect(err).toBeInstanceOf(Error);
    expect(err?.message).toBe('Route not found');
    expect(err?.status).toBe(404);
  });

  test('handles malformed URI params', async () => {
    const router = createAsyncRouter({
      path: '/:a',
      action: (ctx) => ctx.params,
    });
    const result = await router.resolve('/%AF');
    expect(result).toEqual({ a: '%AF' }); // { a: '%AF' }
  });

  test('decodes params correctly', async () => {
    const router = createAsyncRouter({
      path: '/:a/:b/:c',
      action: (ctx): object => ctx.params,
    });
    const result = await router.resolve('/%2F/%3A/caf%C3%A9');
    console.log('WWWWW', result);
    expect(result).toEqual({
      a: '/',
      b: ':',
      c: 'café',
    });
  });

  test.skip('decodes repeated parameters correctly', async () => {
    const router = createAsyncRouter({
      path: '/*a',
      action: (ctx): object => ctx.params,
    });
    const result = await router.resolve('/x/y/z/%20/%AF');
    expect(result).toStrictEqual({
      a: ['x/y', 'z', ' ', '%AF'],
    });
  });

  test('matches 0 routes (1)', async () => {
    const action: Mock = vi.fn(() => true);
    const route = { path: '/', action };
    await expect(createAsyncRouter(route).resolve('/a')).rejects.toThrow(/Route not found/);
    expect(action.mock.calls.length).toBe(0);
  });

  test('matches 0 routes (2)', async () => {
    const action: Mock = vi.fn(() => true);
    const route = { path: '/a', action };
    await expect(createAsyncRouter(route).resolve('/')).rejects.toThrow(/Route not found/);
    expect(action.mock.calls.length).toBe(0);
  });

  test('matches 0 routes (3)', async () => {
    const action: Mock = vi.fn(() => true);
    const route = { path: '/a', action, children: [{ path: '/b', action }] };
    await expect(createAsyncRouter(route).resolve('/b')).rejects.toThrow(/Route not found/);
    expect(action.mock.calls.length).toBe(0);
  });

  test.skip('matches 0 routes (4)', async () => {
    const action: Mock = vi.fn(() => true);
    const route = { path: 'a', action, children: [{ path: 'b', action }] };

    const result = await createAsyncRouter(route).resolve('ab');

    expect(result).rejects.toThrow(/Route not found/);
    expect(action.mock.calls.length).toBe(0);
  });

  test('matches 0 routes (5)', async () => {
    const action: Mock = vi.fn(() => true);
    const route = { action };
    await expect(createAsyncRouter(route).resolve('/a')).rejects.toThrow(/Route not found/);
    expect(action.mock.calls.length).toBe(0);
  });

  test.skip('matches 0 routes (6)', async () => {
    const action: Mock = vi.fn(() => true);
    const route = { path: '/', action };
    const result = await createAsyncRouter(route).resolve('');
    expect(result).rejects.toThrow(/Route not found/);
    expect(action.mock.calls.length).toBe(0);
  });

  test('matches 0 routes (7)', async () => {
    const action: Mock = vi.fn(() => true);
    const route = { path: '/*a', action, children: [] };
    await expect(createAsyncRouter(route).resolve('')).rejects.toThrow(/Route not found/);
    expect(action.mock.calls.length).toBe(0);
  });

  test.skip('matches 1 route (1)', async () => {
    const action: Mock = vi.fn(() => true);
    const route = {
      path: '/',
      action,
    };
    const result = await createAsyncRouter(route).resolve('/');
    expect(result).toBe(true);
    expect(action.mock.calls.length).toBe(1);
    const context = action.mock.calls[0]?.[0];
    expect(context).toHaveProperty('baseUrl', '');
    expect(context).toHaveProperty('path', '/');
    expect(context).toHaveProperty('route.path', '/');
  });

  test.skip('matches 1 route (2)', async () => {
    const action: Mock = vi.fn(() => true);
    const route = {
      path: '/a',
      action,
    };
    expect(createAsyncRouter(route).resolve('/a')).resolves.toBe(true);
    expect(action).toHaveBeenCalledOnce();
    const context = action.mock.calls[0]?.[0];
    expect(context).toHaveProperty('baseUrl', '');
    expect(context).toHaveProperty('path', '/a');
    expect(context).toHaveProperty('route.path', '/a');
  });

  test.skip('matches 2 routes (1)', async () => {
    const action: Mock = vi.fn(() => undefined);
    const route = {
      path: '',
      action,
      children: [
        {
          path: '/a',
          action,
        },
      ],
    };
    expect(createAsyncRouter(route).resolve('/a')).rejects.toThrow(/Route not found/);
    expect(action.mock.calls.length).toBe(2);
    const context1 = action.mock.calls[0]?.[0];
    expect(context1).toHaveProperty('baseUrl', '');
    expect(context1).toHaveProperty('path', '');
    expect(context1).toHaveProperty('route.path', '');
    const context2 = action.mock.calls[1]?.[0];
    expect(context2).toHaveProperty('baseUrl', '');
    expect(context2).toHaveProperty('path', '/a');
    expect(context2).toHaveProperty('route.path', '/a');
  });

  test('matches 2 routes (2)', async () => {
    const action: Mock = vi.fn(() => undefined);
    const route = {
      path: '/a',
      action,
      children: [
        {
          path: '/b',
          action,
          children: [{ path: '/c', action }],
        },
      ],
    };

    await expect(createAsyncRouter(route).resolve('/a/b/c')).rejects.toThrow(/Route not found/);

    expect(action).toHaveBeenCalledTimes(3);
    const context1 = action.mock.calls[0]?.[0];
    expect(context1).toHaveProperty('baseUrl', '');
    expect(context1).toHaveProperty('route.path', '/a');
    const context2 = action.mock.calls[1]?.[0];

    expect(context2).toHaveProperty('baseUrl', '/a');
    expect(context2).toHaveProperty('route.path', '/b');
    const context3 = action.mock.calls[2]?.[0];
    expect(context3).toHaveProperty('baseUrl', '/a/b');
    expect(context3).toHaveProperty('route.path', '/c');
  });

  test.skip('matches 2 routes (3)', async () => {
    const action: Mock = vi.fn(() => undefined);
    const route = {
      path: '',
      action,
      children: [
        {
          path: '',
          action,
        },
      ],
    };
    expect(createAsyncRouter(route).resolve('/')).rejects.toThrow(/Route not found/);
    expect(action.mock.calls.length).toBe(2);
    const context1 = action.mock.calls[0]?.[0];
    expect(context1).toHaveProperty('baseUrl', '');
    expect(context1).toHaveProperty('route.path', '');
    const context2 = action.mock.calls[1]?.[0];
    expect(context2).toHaveProperty('baseUrl', '');
    expect(context2).toHaveProperty('route.path', '');
  });

  test.skip('matches an array of paths', async () => {
    const action: Mock = vi.fn(() => true);
    const route = { path: ['/e', '/f'], action };
    await expect(createAsyncRouter(route).resolve('/f')).resolves.toBe(true);
    expect(action.mock.calls.length).toBe(1);
    const context = action.mock.calls[0]?.[0];
    expect(context).toHaveProperty('baseUrl', '');
    expect(context).toHaveProperty('route.path', ['/e', '/f']);
  });
});
