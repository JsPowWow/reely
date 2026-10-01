import { RatesRetry } from './rates.retry';
import { clickButton, mounted } from '../../../testing/dom.testing';

import type { Mounted } from '../../../testing/dom.testing';

describe('RatesRetry (async)', () => {
  let view: Mounted;

  beforeEach(() => {
    vi.useFakeTimers();
    view = mounted(() => <RatesRetry />);
  });

  afterEach(() => {
    view.dispose();
    vi.useRealTimers();
  });

  it('retries a failed and a timed-out attempt, then shows the rates', async () => {
    clickButton(view.host, 'Load the rates');
    await vi.runAllTimersAsync();

    const retries = Array.from(view.host.querySelectorAll('li'), (line) => line.textContent);
    expect(retries).toEqual([
      'Attempt 1: HTTP 503, retrying in 500 ms',
      'Attempt 2: The attempt took longer than 1500 ms, retrying in 1000 ms',
    ]);
    expect(view.text()).toContain('1 EUR = 1.08 USD = 0.85 GBP');
  });

  it('leaves no wait running once the page is left', async () => {
    clickButton(view.host, 'Load the rates');
    await vi.advanceTimersByTimeAsync(600);

    view.dispose();
    // the wait between attempts is cleared once its race settles, a microtask later
    await vi.advanceTimersByTimeAsync(0);

    expect(vi.getTimerCount()).toBe(0);
  });
});
