import { mount } from '@reely/dommy';
import { noop } from '@reely/utils';

import { Scoreboard } from './scoreboard';
import { clickButton } from '../../../testing/dom.testing';

const cars = ['Comet', 'Falcon', 'Lynx', 'Orca'].map((name) => ({ name, color: '#1f2933' }));

const cellsOf = (host: Element, column: number): string[] =>
  Array.from(
    host.querySelectorAll(`[role="row"] > [role="cell"]:nth-child(${column}) .visually-hidden`),
    (cell) => cell.textContent ?? ''
  );

// jsdom has no IntersectionObserver: this one lets a test say whether the board is on screen
const observeScreen = (): ((onScreen: boolean) => void) => {
  const observers: IntersectionObserverCallback[] = [];
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      public observe = noop;
      public disconnect = noop;
      constructor(callback: IntersectionObserverCallback) {
        observers.push(callback);
      }
    }
  );
  return (onScreen) =>
    observers.forEach((callback) =>
      callback([{ isIntersecting: onScreen } as IntersectionObserverEntry], {} as IntersectionObserver)
    );
};

describe('Scoreboard', () => {
  let host: HTMLElement;
  let dispose: VoidFunction;

  beforeEach(() => {
    vi.useFakeTimers();
    host = document.createElement('div');
    dispose = mount(host, () => <Scoreboard cars={cars} seed={7} />);
  });

  afterEach(() => {
    dispose();
    vi.useRealTimers();
    vi.unstubAllGlobals();
    vi.restoreAllMocks();
    Reflect.deleteProperty(Element.prototype, 'animate');
  });

  it('lists every car once, the leader with its race time and the others with their gap', () => {
    expect(cellsOf(host, 2).sort()).toEqual(['Comet', 'Falcon', 'Lynx', 'Orca']);
    expect(cellsOf(host, 3)[0]).toBe('0:00.0');
    expect(
      cellsOf(host, 3)
        .slice(1)
        .every((gap) => gap.startsWith('+'))
    ).toBe(true);
  });

  it('runs the race on by itself', () => {
    vi.advanceTimersByTime(3000);

    expect(cellsOf(host, 3)[0]).toBe('0:03.0');
  });

  it('starts the next race once this one has run ten minutes, so its times fit their tiles', () => {
    vi.advanceTimersByTime(598_500);
    const last = cellsOf(host, 3)[0];
    vi.advanceTimersByTime(1500);

    expect(last).toBe('9:58.5');
    expect(cellsOf(host, 3)[0]).toBe('0:00.0');
  });

  it("moves a car's own row to its new place when it passes another", () => {
    const rowOf = (name: string): Element | null | undefined =>
      Array.from(host.querySelectorAll('[role="row"]')).find((row) => row.textContent?.includes(name));
    const before = new Map(cars.map(({ name }) => [name, rowOf(name)]));
    const order = cellsOf(host, 2).join();

    for (let tick = 0; tick < 40 && cellsOf(host, 2).join() === order; tick++) {
      vi.advanceTimersByTime(1500);
    }

    expect(cellsOf(host, 2).join()).not.toBe(order);
    expect(cars.every(({ name }) => rowOf(name) === before.get(name))).toBe(true);
    const places = host.querySelectorAll('[role="row"] > [role="cell"]:first-child');
    expect(Array.from(places, (place) => place.textContent)).toEqual(['1', '2', '3', '4']);
  });

  it('slides a row that changed places from where it stood', () => {
    // jsdom lays nothing out: a row stands as many rows down as it is in the board
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (this: Element) {
      const row = this.parentElement ? Array.from(this.parentElement.children).indexOf(this) : 0;
      return new DOMRect(0, row * 30, 300, 30);
    });
    const animate = vi.fn();
    Element.prototype.animate = animate;
    const order = cellsOf(host, 2).join();

    for (let tick = 0; tick < 40 && cellsOf(host, 2).join() === order; tick++) {
      vi.advanceTimersByTime(1500);
    }

    expect(animate).toHaveBeenCalledWith(
      [{ transform: expect.stringMatching(/^translate\(0px, -?\d+px\)$/) }, { transform: 'none' }],
      expect.objectContaining({ duration: 600 })
    );
  });

  it('stops while paused and runs on when resumed', () => {
    clickButton(host, 'Pause');
    vi.advanceTimersByTime(3000);
    const paused = cellsOf(host, 3)[0];
    clickButton(host, 'Resume');
    vi.advanceTimersByTime(1500);

    expect(paused).toBe('0:00.0');
    expect(cellsOf(host, 3)[0]).toBe('0:01.5');
  });

  it('stops while the page is hidden', () => {
    const visibility = vi.spyOn(document, 'visibilityState', 'get').mockReturnValue('hidden');
    document.dispatchEvent(new Event('visibilitychange'));
    vi.advanceTimersByTime(3000);
    visibility.mockRestore();

    expect(cellsOf(host, 3)[0]).toBe('0:00.0');
  });

  it('stops while the board is off screen and runs on when it is back', () => {
    dispose();
    const scroll = observeScreen();
    dispose = mount(host, () => <Scoreboard cars={cars} seed={7} />);

    scroll(false);
    vi.advanceTimersByTime(3000);
    const away = cellsOf(host, 3)[0];
    scroll(true);
    vi.advanceTimersByTime(1500);

    expect(away).toBe('0:00.0');
    expect(cellsOf(host, 3)[0]).toBe('0:01.5');
  });

  it('leaves no timer running once its render is disposed', () => {
    vi.advanceTimersByTime(1500);

    dispose();

    expect(vi.getTimerCount()).toBe(0);
  });
});
