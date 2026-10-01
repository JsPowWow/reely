import { PitCrews } from './pit.crews';
import { clickButton, mounted } from '../../../testing/dom.testing';

import type { Mounted } from '../../../testing/dom.testing';

describe('PitCrews (queue)', () => {
  let view: Mounted;
  const cars = (status: string): number => view.host.querySelectorAll(`[data-status="${status}"]`).length;

  beforeEach(() => {
    vi.useFakeTimers();
    view = mounted(() => <PitCrews />);
  });

  afterEach(() => {
    view.dispose();
    vi.useRealTimers();
  });

  it('serves two cars at a time until every car is done', async () => {
    clickButton(view.host, 'Box all cars');
    const working = cars('working');
    await vi.runAllTimersAsync();

    expect(working).toBe(2);
    expect(cars('done')).toBe(5);
    expect(view.text()).toContain('All cars served');
  });

  it('leaves no crew working once the page is left', () => {
    clickButton(view.host, 'Box all cars');

    view.dispose();

    expect(vi.getTimerCount()).toBe(0);
  });
});
