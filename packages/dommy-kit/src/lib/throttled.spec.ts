import { effect, mount, signal } from '@reely/dommy';

import { throttled } from '../index';

describe('throttled', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('passes the first change at once, then at most one change per interval, the latest one last', () => {
    const frame = signal(0);
    const seen: number[] = [];
    mount(document.createElement('div'), () => {
      const board = throttled(frame, 500);
      effect(() => {
        seen.push(board.value);
      });
      return null;
    });

    frame.value = 1;
    frame.value = 2;
    frame.value = 3;
    vi.advanceTimersByTime(500);
    frame.value = 4;
    vi.advanceTimersByTime(499);
    const beforeTheEnd = [...seen];
    vi.advanceTimersByTime(1);

    expect(beforeTheEnd).toEqual([0, 1, 3]);
    expect(seen).toEqual([0, 1, 3, 4]);
  });

  it('drops a pending change when its render is disposed', () => {
    const frame = signal(0);
    let board: { value: number } | undefined;
    const dispose = mount(document.createElement('div'), () => {
      board = throttled(frame, 500);
      return null;
    });

    frame.value = 1;
    frame.value = 2;
    dispose();
    vi.advanceTimersByTime(500);

    expect(board?.value).toBe(1);
    expect(vi.getTimerCount()).toBe(0);
  });
});
