import toErrorWithMessage from './toErrorWithMessage';

describe('toErrorWithMessage', () => {
  it('returns an Error as it is', () => {
    const error = new TypeError('No timing data');

    expect(toErrorWithMessage(error)).toBe(error);
  });

  it('makes an Error of an object with a string message', () => {
    expect(toErrorWithMessage({ message: 'offline' }).message).toBe('offline');
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
