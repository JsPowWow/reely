import { mount, onCleanup } from '@reely/dommy';

import { debounced } from '../index';

describe('debounced', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('calls once with the latest arguments when the calls stop for `ms`', () => {
    const saved: string[] = [];
    const save = debounced((note: string) => saved.push(note), 300);

    save('l');
    vi.advanceTimersByTime(200);
    save('la');
    vi.advanceTimersByTime(200);
    save('lap');
    vi.advanceTimersByTime(299);
    const early = [...saved];
    vi.advanceTimersByTime(1);

    expect(early).toEqual([]);
    expect(saved).toEqual(['lap']);
  });

  it('`flush` calls the waiting call now, once, and `cancel` drops it', () => {
    const write = vi.fn();
    const save = debounced(write, 300);

    save('pit');
    save.flush();
    save.flush();
    save('box');
    save.cancel();
    vi.advanceTimersByTime(300);

    expect(write).toHaveBeenCalledExactlyOnceWith('pit');
  });

  it('waits again for a call made while it calls', () => {
    const laps: number[] = [];
    const save = debounced((lap: number) => {
      laps.push(lap);
      if (lap < 2) {
        save(lap + 1);
      }
    }, 100);

    save(1);
    vi.advanceTimersByTime(100);
    const first = [...laps];
    vi.advanceTimersByTime(100);

    expect(first).toEqual([1]);
    expect(laps).toEqual([1, 2]);
  });

  it('drops the waiting call when the render that made it is disposed', () => {
    const write = vi.fn();
    const dispose = mount(document.createElement('div'), () => {
      debounced(write, 300)('garage');
      return null;
    });

    dispose();
    vi.advanceTimersByTime(300);

    expect(write).not.toHaveBeenCalled();
  });

  it('makes the waiting call on the way out with `onCleanup(save.flush)` after it', () => {
    const write = vi.fn();
    const dispose = mount(document.createElement('div'), () => {
      const save = debounced(write, 300);
      onCleanup(save.flush);
      save('garage');
      return null;
    });

    dispose();

    expect(write).toHaveBeenCalledExactlyOnceWith('garage');
  });
});
