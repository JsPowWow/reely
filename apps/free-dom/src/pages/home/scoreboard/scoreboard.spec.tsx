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
  });

  it('lists every car once, the leader with its race time and the others with their gap', () => {
    expect(cellsOf(host, 2).sort()).toEqual(['Comet', 'Falcon', 'Lynx', 'Orca']);
    expect(cellsOf(host, 3)[0]).toBe('0:00.0');
    expect(cellsOf(host, 3).slice(1).every((gap) => gap.startsWith('+'))).toBe(true);
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
