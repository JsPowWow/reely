import { reportUncaught } from './reportUncaught';

describe('reportUncaught', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('hands the error to the platform `reportError` when there is one', () => {
    const reportError = vi.fn();
    vi.stubGlobal('reportError', reportError);
    const broken = new Error('broken listener');

    reportUncaught(broken);

    expect(reportError).toHaveBeenCalledWith(broken);
  });

  it('throws the error from a microtask otherwise, so it surfaces as uncaught', () => {
    const scheduled: VoidFunction[] = [];
    vi.stubGlobal('reportError', undefined);
    vi.stubGlobal('queueMicrotask', (callback: VoidFunction) => scheduled.push(callback));
    const broken = new Error('broken listener');

    reportUncaught(broken);

    expect(scheduled).toHaveLength(1);
    expect(() => scheduled[0]?.()).toThrow(broken);
  });
});
