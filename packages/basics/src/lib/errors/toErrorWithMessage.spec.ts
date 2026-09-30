import { toErrorWithMessage } from './toErrorWithMessage';

describe('toErrorWithMessage', () => {
  it('returns an Error as it is', () => {
    const error = new TypeError('No timing data');

    expect(toErrorWithMessage(error)).toBe(error);
  });

  it('makes an Error of an object with a string message, a class instance too', () => {
    class ApiFailure {
      public readonly message = 'HTTP 503';
    }

    expect(toErrorWithMessage({ message: 'offline' }).message).toBe('offline');
    expect(toErrorWithMessage(new ApiFailure()).message).toBe('HTTP 503');
  });

  it('keeps an Error from another realm, an iframe say, as it is', async () => {
    const { runInNewContext } = await import('node:vm');
    const foreign: unknown = runInNewContext('new RangeError("lap out of range")');

    expect(foreign instanceof Error).toBe(false);
    expect(toErrorWithMessage(foreign)).toBe(foreign);
  });

  it('describes an object whose message getter throws, instead of throwing', () => {
    const hostile = Object.defineProperty({}, 'message', {
      get: () => {
        throw new Error('no access');
      },
    });

    expect(toErrorWithMessage(hostile).message).toBe('{}');
  });

  it('takes a thrown string as the message', () => {
    expect(toErrorWithMessage('offline').message).toBe('offline');
  });

  it('describes any other value as JSON, or as a string when it has no JSON', () => {
    const circular: Record<string, unknown> = {};
    circular['self'] = circular;

    expect(toErrorWithMessage({ lap: 3 }).message).toBe('{"lap":3}');
    expect(toErrorWithMessage(circular).message).toBe('[object Object]');
  });
});
