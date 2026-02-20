import { noop } from '@reely/utils';

import { findMatchingRoute } from './match-path';

describe('findMatchingRoute', () => {
  const routes = Object.keys({
    '/': noop,
    '/main': noop,
    '/main#index': noop,
    '/details/:id': noop,
    '/about': noop,
    '/details/:detailsId/entity/:entityId': noop,
    '/lang/*': noop,
    '/a/c': noop,
  });

  it('should find and create matching route per provided url', () => {
    expect(findMatchingRoute(routes, '/lang/en')).toMatchObject({ success: true });
    expect(findMatchingRoute(routes, '/lang/ru')).toMatchObject({ success: true });
    expect(findMatchingRoute(routes, '/main')).toMatchObject({ success: true });
    expect(findMatchingRoute(routes, '/main#index')).toMatchObject({ success: true });
    expect(findMatchingRoute(routes, '/')).toMatchObject({ success: true });
    expect(findMatchingRoute(routes, '/about')).toMatchObject({ success: true });
    expect(findMatchingRoute(routes, '/details/20/entity/15')).toMatchSnapshot();

    expect(findMatchingRoute(routes, '/ma')).toMatchObject({ success: false });
    expect(findMatchingRoute(routes, '/a/c')).toMatchObject({ success: true });
  });

  it('should find and create matching route per provided url #2', () => {
    expect(findMatchingRoute(['/a', '/a/:b', '/a/c'], '/a/c')).toMatchObject({ success: true });
    expect(findMatchingRoute(['/a', '/a/:b', '/a/c', '/a/d'], '/a/c')).toMatchObject({ success: true });
    expect(findMatchingRoute(['/a', '/a/:b', '/a/c', '/a/d'], '/a/c')).toMatchObject({ success: true });
    expect(findMatchingRoute(['/*a'], '/x/y/a')).toMatchObject({ success: true });
  });
});
