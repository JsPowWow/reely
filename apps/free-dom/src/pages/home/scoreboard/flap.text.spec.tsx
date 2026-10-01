import { mount, signal } from '@reely/dommy';

import { FlapText } from './flap.text';

const tilesOf = (host: Element): string =>
  Array.from(host.querySelectorAll('[aria-hidden="true"] > span'), (tile) => tile.textContent).join('');

describe('FlapText', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('shows the text on its tiles, padded to the width, and the whole text to a screen reader', () => {
    const host = document.createElement('div');
    const dispose = mount(host, () => <FlapText text={() => 'Lynx'} width={6} />);
    vi.runAllTimers();

    expect(tilesOf(host)).toBe('Lynx  ');
    expect(host.querySelector('.visually-hidden')?.textContent).toBe('Lynx');
    dispose();
  });

  it('turns only the tiles whose letter changed, through drum letters, and settles on the new text', () => {
    const name = signal('Lynx');
    const host = document.createElement('div');
    const dispose = mount(host, () => <FlapText text={name} width={4} align='end' />);
    vi.runAllTimers();

    name.value = 'Lyra';
    vi.advanceTimersByTime(60);
    const turning = tilesOf(host);
    vi.runAllTimers();

    // 60 ms in, the third tile is on its first drum letter and the fourth has just started
    expect(turning).toBe('LyYH');
    expect(tilesOf(host)).toBe('Lyra');
    dispose();
  });

  it('turns a digit through digits and a letter through letters, as two drums would', () => {
    const time = signal('+1.333');
    const host = document.createElement('div');
    const dispose = mount(host, () => <FlapText text={time} width={6} />);
    time.value = '+2.667';
    const seen: string[] = [];

    for (let ms = 0; ms < 250; ms += 10) {
      vi.advanceTimersByTime(10);
      seen.push(tilesOf(host));
    }

    expect(seen.every((tiles) => /^\+\d\.\d{3}$/.test(tiles))).toBe(true);
    dispose();
  });

  it('changes letters in place, with no turn, under reduced motion', () => {
    vi.stubGlobal('matchMedia', () => Object.assign(new EventTarget(), { matches: true }));
    const name = signal('Lynx');
    const host = document.createElement('div');
    const dispose = mount(host, () => <FlapText text={name} width={4} />);

    name.value = 'Lyra';

    expect(tilesOf(host)).toBe('Lyra');
    expect(vi.getTimerCount()).toBe(0);
    dispose();
  });

  it('leaves no turn pending once its render is disposed', () => {
    const name = signal('Lynx');
    const dispose = mount(document.createElement('div'), () => <FlapText text={name} width={4} />);
    vi.runAllTimers();
    name.value = 'Orca';

    dispose();

    expect(vi.getTimerCount()).toBe(0);
  });
});
