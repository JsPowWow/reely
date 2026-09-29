import toErrorString from './toErrorString';

describe('toErrorString', () => {
  it('names the error and gives its message', () => {
    expect(toErrorString(new TypeError('No timing data'))).toBe('TypeError: No timing data');
  });

  it('describes a thrown value that is not an Error as an Error', () => {
    expect(toErrorString('offline')).toBe('Error: offline');
    expect(toErrorString({ lap: 3 })).toBe('Error: {"lap":3}');
  });
});
