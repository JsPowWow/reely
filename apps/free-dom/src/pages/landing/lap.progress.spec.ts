import { mount } from '@reely/dommy';

import { sectorFill, trackLap } from './lap.progress';

describe('sectorFill', () => {
  it('is empty before the reading line reaches the sector, and full once it has passed it', () => {
    expect(sectorFill({ top: 600, height: 400 }, 450)).toBe(0);
    expect(sectorFill({ top: -500, height: 400 }, 450)).toBe(1);
  });

  it('fills with the share of the sector above the reading line', () => {
    expect(sectorFill({ top: 350, height: 400 }, 450)).toBe(0.25);
  });

  it('counts an empty sector as passed once its top is above the line', () => {
    expect(sectorFill({ top: 100, height: 0 }, 450)).toBe(1);
  });
});

describe('trackLap', () => {
  const place = (id: string, top: number, height: number): HTMLElement => {
    const sector = document.createElement('section');
    sector.id = id;
    sector.getBoundingClientRect = (): DOMRect => DOMRect.fromRect({ y: top, height, width: 100 });
    document.body.append(sector);
    return sector;
  };

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] });
    window.innerHeight = 900;
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.replaceChildren();
  });

  it('fills each sector from where it is, and again after a scroll', () => {
    const first = place('one', 250, 400);
    place('two', 1200, 400);
    let fills: readonly (() => number)[] = [];
    const dispose = mount(document.body, () => {
      fills = trackLap(['one', 'two']);
      return null;
    });
    vi.advanceTimersToNextFrame();
    const before = fills.map((fill) => fill());

    first.getBoundingClientRect = (): DOMRect => DOMRect.fromRect({ y: -150, height: 400, width: 100 });
    window.dispatchEvent(new Event('scroll'));
    vi.advanceTimersToNextFrame();

    expect(before).toEqual([0.5, 0]);
    expect(fills.map((fill) => fill())).toEqual([1, 0]);
    dispose();
  });

  it('stops following the scroll when its view is taken down', () => {
    const sector = place('one', 800, 400);
    let fills: readonly (() => number)[] = [];
    const dispose = mount(document.body, () => {
      fills = trackLap(['one']);
      return null;
    });
    vi.advanceTimersToNextFrame();
    dispose();

    sector.getBoundingClientRect = (): DOMRect => DOMRect.fromRect({ y: -800, height: 400, width: 100 });
    window.dispatchEvent(new Event('scroll'));
    vi.advanceTimersToNextFrame();

    expect(fills.map((fill) => fill())).toEqual([0]);
  });
});
