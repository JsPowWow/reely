import { StartLights } from './start.lights';
import { clickButton, mounted } from '../../../testing/dom.testing';

import type { Mounted } from '../../../testing/dom.testing';

describe('StartLights (state-machine)', () => {
  let view: Mounted;

  beforeEach(() => {
    vi.useFakeTimers();
    view = mounted(() => <StartLights />);
  });

  afterEach(() => {
    view.dispose();
    vi.useRealTimers();
  });

  it('refuses a launch on the grid', () => {
    clickButton(view.host, 'Launch');

    expect(view.text()).toContain('Arm the lights, launch when they go out');
  });

  it('calls a launch before the lights go out a jump start', () => {
    clickButton(view.host, 'Arm the lights');
    vi.advanceTimersByTime(5000);
    const lit = view.host.querySelectorAll('[data-lit="true"]').length;
    clickButton(view.host, 'Launch');

    expect(lit).toBe(5);
    expect(view.text()).toContain('Jump start');
  });

  it('times the launch from the moment the lights go out', () => {
    clickButton(view.host, 'Arm the lights');
    vi.advanceTimersByTime(5000 + 1400);
    vi.advanceTimersByTime(250);
    clickButton(view.host, 'Launch');

    expect(view.text()).toContain('Away in 0.250 s');
  });

  it('leaves no light pending once the page is left', () => {
    clickButton(view.host, 'Arm the lights');

    view.dispose();

    expect(vi.getTimerCount()).toBe(0);
  });
});
