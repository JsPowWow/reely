import { scopedLogger } from './logger';

describe('scopedLogger', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('writes errors to `console.error`, with the scope first', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => undefined);
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    scopedLogger().error('boom', 42);

    expect(error).toHaveBeenCalledExactlyOnceWith('[[default]]\t', 'boom', 42);
    expect(warn).not.toHaveBeenCalled();
  });

  it('keeps a named scope silent until it is enabled', () => {
    const info = vi.spyOn(console, 'info').mockImplementation(() => undefined);
    const logger = scopedLogger('race');

    logger.info('hidden');
    logger.setEnabled(true).info('shown');
    logger.setEnabled(false);

    expect(info).toHaveBeenCalledExactlyOnceWith('[[race]]\t', 'shown');
  });

  it('logs a value in a pipeline and passes it on', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => undefined);

    const value = scopedLogger().logWith('warn', 'count:')(3);

    expect(value).toBe(3);
    expect(warn).toHaveBeenCalledExactlyOnceWith('[[default]]\t', 'count:', 3);
  });

  it('gives the same logger for the same scope, the empty scope included', () => {
    const defaultLogger = scopedLogger();

    expect(scopedLogger('race')).toBe(scopedLogger('race'));
    expect(scopedLogger('')).toBe(defaultLogger);
    expect(scopedLogger()).toBe(defaultLogger);
  });
});
