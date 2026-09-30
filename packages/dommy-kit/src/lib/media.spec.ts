import { effect, mount } from '@reely/dommy';

import { media } from '../index';

const fakeMatchMedia = (initial: boolean): { flip: (matches: boolean) => void; listeners: () => number } => {
  const target = new EventTarget();
  let count = 0;
  const list = Object.assign(target, {
    matches: initial,
    media: '(max-width: 700px)',
    addEventListener: (type: string, listener: EventListener, options?: AddEventListenerOptions) => {
      count += 1;
      options?.signal?.addEventListener('abort', () => (count -= 1));
      EventTarget.prototype.addEventListener.call(target, type, listener, options);
    },
  });
  vi.stubGlobal('matchMedia', () => list);
  return {
    flip: (matches) => {
      list.matches = matches;
      target.dispatchEvent(Object.assign(new Event('change'), { matches }));
    },
    listeners: () => count,
  };
};

describe('media', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('follows the media query, and stops listening when its render is disposed', () => {
    const screen = fakeMatchMedia(false);
    const seen: boolean[] = [];
    const dispose = mount(document.createElement('div'), () => {
      const phone = media('(max-width: 700px)');
      effect(() => {
        seen.push(phone.value);
      });
      return null;
    });

    screen.flip(true);
    const listening = screen.listeners();
    dispose();

    expect(seen).toEqual([false, true]);
    expect(listening).toBe(1);
    expect(screen.listeners()).toBe(0);
  });

  it('reads `false` where there is no `matchMedia`, as in jsdom', () => {
    vi.stubGlobal('matchMedia', undefined);

    expect(media('(max-width: 700px)').value).toBe(false);
  });
});
