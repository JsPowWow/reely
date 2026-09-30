import { messageOf } from './messageOf';

describe('messageOf', () => {
  it('gives the message of whatever was thrown, for a banner or a log line', () => {
    expect(messageOf(new TypeError('No timing data'))).toBe('No timing data');
    expect(messageOf('offline')).toBe('offline');
    expect(messageOf({ message: 'quota exceeded' })).toBe('quota exceeded');
    expect(messageOf(404)).toBe('404');
    expect(messageOf(undefined)).toBe('undefined');
  });
});
