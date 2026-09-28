import { followPagerKey } from './pager.keys';

describe('followPagerKey', () => {
  const followed: string[] = [];

  beforeEach(() => {
    followed.length = 0;
    document.body.innerHTML =
      '<a rel="prev" href="/evolution/one">Previous</a><a rel="next" href="/evolution/three">Next</a><input>';
    document.querySelectorAll('a').forEach((link) =>
      link.addEventListener('click', (event) => {
        event.preventDefault();
        followed.push(link.getAttribute('href') ?? '');
      })
    );
  });

  const press = (key: string, init: KeyboardEventInit = {}, target: EventTarget = document.body): void => {
    const event = new KeyboardEvent('keydown', { key, bubbles: true, ...init });
    target.dispatchEvent(event);
    followPagerKey(event);
  };

  it('follows the next and previous links with the arrow keys', () => {
    press('ArrowRight');
    press('ArrowLeft');

    expect(followed).toEqual(['/evolution/three', '/evolution/one']);
  });

  it('leaves arrows with modifiers and arrows typed into a field alone', () => {
    press('ArrowRight', { altKey: true });
    press('ArrowLeft', { metaKey: true });
    press('ArrowRight', {}, document.querySelector('input') ?? document.body);

    expect(followed).toEqual([]);
  });
});
