import { href } from './router.href';

describe('href', () => {
  it('fills a pattern with its params, encoded', () => {
    expect(href('/orders/:id/items/:item', { id: '7', item: 'café au lait' })).toBe(
      '/orders/7/items/caf%C3%A9%20au%20lait'
    );
  });

  it('keeps the slashes of the rest of a path, and encodes each of its segments', () => {
    expect(href('/files/*path', { path: 'docs/read me.md' })).toBe('/files/docs/read%20me.md');
  });

  it('takes a pattern without params as it is', () => {
    expect(href('/cart')).toBe('/cart');
  });

  it('types the params from the pattern', () => {
    // @ts-expect-error the pattern needs `topic`
    href('/docs/:topic');
    // @ts-expect-error the pattern names no `slug`
    href('/docs/:topic', { slug: 'signals' });
  });
});
