import { PhotoGallery } from './photo.gallery';
import { flushMutations, mounted } from '../../../../testing/dom.testing';

const clickLink = (root: Element, text: string): void => {
  const link = Array.from(root.querySelectorAll('a')).find((each) => each.textContent === text);
  if (!link) {
    throw new Error(`No "${text}" link`);
  }
  link.click();
};

const press = (root: Element, key: string): void => {
  root.querySelector('[tabindex]')?.dispatchEvent(new KeyboardEvent('keydown', { key, bubbles: true }));
};

const heading = (root: Element): string | null | undefined => root.querySelector('h2')?.textContent;

describe('PhotoGallery (router)', () => {
  it('opens a photo from the album, and goes round the album from the last to the first', async () => {
    const view = mounted(PhotoGallery);
    await flushMutations();

    clickLink(view.host, 'Dunes');
    await flushMutations();
    const last = heading(view.host);
    clickLink(view.host, 'Next');
    await flushMutations();

    expect(last).toBe('5 of 5: Dunes');
    expect(heading(view.host)).toBe('1 of 5: Harbour at dawn');
    view.dispose();
  });

  it('follows the arrow keys on a photo, and Escape back to the album', async () => {
    const view = mounted(PhotoGallery);
    await flushMutations();
    clickLink(view.host, 'Meadow');
    await flushMutations();

    press(view.host, 'ArrowLeft');
    await flushMutations();
    const previous = heading(view.host);
    press(view.host, 'Escape');
    await flushMutations();

    expect(previous).toBe('1 of 5: Harbour at dawn');
    expect(heading(view.host)).toBe('Summer, 5 photos');
    view.dispose();
  });
});
