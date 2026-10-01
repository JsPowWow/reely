import { ShopSearch } from './shop.search';
import { flushMutations, mounted } from '../../../../testing/dom.testing';

const clickLink = (root: Element, text: string): void => {
  const link = Array.from(root.querySelectorAll('a')).find((each) => each.textContent?.startsWith(text));
  if (!link) {
    throw new Error(`No "${text}" link`);
  }
  link.click();
};

const found = (root: Element): string[] =>
  Array.from(root.querySelectorAll('li a'), (link) => link.firstChild?.textContent ?? '');

describe('ShopSearch (router)', () => {
  it('searches from the form, with the words and the order in the address', async () => {
    const view = mounted(ShopSearch);
    await flushMutations();
    const form = view.host.querySelector('form');
    const input = form?.querySelector('input');
    const order = form?.querySelector('select');
    if (!input || !order) {
      throw new Error('No search form');
    }

    input.value = 'lamp';
    order.value = 'price';
    form?.requestSubmit();
    await flushMutations();

    expect(view.host.querySelector('p')?.textContent).toBe('/search?q=lamp&sort=price');
    expect(view.host.querySelector('h2')?.textContent).toBe('3 found for “lamp”');
    expect(found(view.host)).toEqual(['Paper pendant lamp', 'Oak desk lamp', 'Brass floor lamp']);
    expect(view.host.querySelector('input')?.value).toBe('lamp');
    view.dispose();
  });

  it('reorders the results from a link that keeps the words, and opens a product', async () => {
    const view = mounted(ShopSearch);
    await flushMutations();

    clickLink(view.host, 'Chairs by price');
    await flushMutations();
    clickLink(view.host, 'name');
    await flushMutations();
    const byName = found(view.host);
    clickLink(view.host, 'Reading armchair');
    await flushMutations();

    expect(byName).toEqual(['Beech chair', 'Reading armchair']);
    expect(view.host.querySelector('h2')?.textContent).toBe('Reading armchair');
    expect(view.host.querySelector('p')?.textContent).toBe('/products/reading-armchair');
    view.dispose();
  });
});
