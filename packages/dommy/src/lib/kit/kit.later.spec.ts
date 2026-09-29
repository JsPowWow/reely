import { effect, mount, signal } from '../../index';
import { later } from '../../kit';

describe('later', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('runs once the time is up, after the view it was called in is in the document', () => {
    const host = document.createElement('div');
    document.body.append(host);
    let connected: boolean | undefined;
    mount(host, () => {
      const field = document.createElement('input');
      later(0, () => {
        connected = field.isConnected;
      });
      return field;
    });

    vi.advanceTimersByTime(0);

    expect(connected).toBe(true);
    host.remove();
  });

  it('never runs once its view is disposed', () => {
    const flip = vi.fn();
    const dispose = mount(document.createElement('div'), () => {
      later(300, flip);
      return null;
    });

    dispose();
    vi.advanceTimersByTime(300);

    expect(flip).not.toHaveBeenCalled();
  });

  it('is cancelled by the next run of the effect it was called in', () => {
    const letter = signal('A');
    const shown: string[] = [];
    mount(document.createElement('div'), () => {
      effect(() => {
        const next = letter.value;
        later(100, () => shown.push(next));
      });
      return null;
    });

    vi.advanceTimersByTime(50);
    letter.value = 'B';
    vi.advanceTimersByTime(100);

    expect(shown).toEqual(['B']);
  });

  it('returns a cancel of its own', () => {
    const flip = vi.fn();
    mount(document.createElement('div'), () => {
      const cancel = later(100, flip);
      cancel();
      return null;
    });

    vi.advanceTimersByTime(100);

    expect(flip).not.toHaveBeenCalled();
  });
});
